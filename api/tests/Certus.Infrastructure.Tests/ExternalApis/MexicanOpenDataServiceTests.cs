using System.Net;
using System.Text.Json;
using Certus.Infrastructure.Services.ExternalApis;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Moq.Protected;
using Xunit;

namespace Certus.Infrastructure.Tests.ExternalApis;

/// <summary>
/// Unit tests for MexicanOpenDataService
/// Tests CKAN API integration for datos.gob.mx
/// </summary>
public class MexicanOpenDataServiceTests
{
    private readonly Mock<IHttpClientFactory> _httpClientFactoryMock;
    private readonly Mock<IMemoryCache> _cacheMock;
    private readonly Mock<ILogger<MexicanOpenDataService>> _loggerMock;
    private readonly IOptions<MexicanOpenDataOptions> _options;
    private readonly Mock<HttpMessageHandler> _httpMessageHandlerMock;

    public MexicanOpenDataServiceTests()
    {
        _httpClientFactoryMock = new Mock<IHttpClientFactory>();
        _cacheMock = new Mock<IMemoryCache>();
        _loggerMock = new Mock<ILogger<MexicanOpenDataService>>();
        _httpMessageHandlerMock = new Mock<HttpMessageHandler>();

        _options = Options.Create(new MexicanOpenDataOptions
        {
            CacheHours = 24
        });

        // Setup cache to always return false for TryGetValue (no cache hits)
        object? cacheValue;
        _cacheMock.Setup(x => x.TryGetValue(It.IsAny<object>(), out cacheValue))
            .Returns(false);

        var cacheEntryMock = new Mock<ICacheEntry>();
        _cacheMock.Setup(x => x.CreateEntry(It.IsAny<object>()))
            .Returns(cacheEntryMock.Object);
    }

    private MexicanOpenDataService CreateService(HttpResponseMessage? responseMessage = null)
    {
        responseMessage ??= new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("{\"success\": true, \"result\": {}}")
        };

        _httpMessageHandlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(responseMessage);

        var httpClient = new HttpClient(_httpMessageHandlerMock.Object)
        {
            BaseAddress = new Uri("https://datos.gob.mx/")
        };

        _httpClientFactoryMock
            .Setup(x => x.CreateClient("MexicanOpenData"))
            .Returns(httpClient);

        return new MexicanOpenDataService(
            _httpClientFactoryMock.Object,
            _cacheMock.Object,
            _loggerMock.Object,
            _options);
    }

    #region Dataset Search Tests

    [Fact]
    public async Task SearchDatasetsAsync_WithValidQuery_ReturnsResults()
    {
        // Arrange - CKAN API response format
        var ckanResponse = new
        {
            success = true,
            result = new
            {
                count = 2,
                results = new[]
                {
                    new
                    {
                        id = "consar-rendimientos-siefore",
                        name = "rendimientos-siefore",
                        title = "Rendimientos SIEFORE 2025",
                        notes = "Rendimientos netos de las SIEFORE",
                        organization = new { name = "consar", title = "CONSAR" },
                        resources = new[]
                        {
                            new
                            {
                                id = "resource-1",
                                name = "rendimientos_2025.csv",
                                format = "CSV",
                                url = "https://datos.gob.mx/resource/rendimientos_2025.csv"
                            }
                        }
                    },
                    new
                    {
                        id = "consar-comisiones",
                        name = "comisiones-afore",
                        title = "Comisiones AFORE 2025",
                        notes = "Comisiones cobradas por las AFORE",
                        organization = new { name = "consar", title = "CONSAR" },
                        resources = new[]
                        {
                            new
                            {
                                id = "resource-2",
                                name = "comisiones_2025.csv",
                                format = "CSV",
                                url = "https://datos.gob.mx/resource/comisiones_2025.csv"
                            }
                        }
                    }
                }
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(ckanResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.SearchDatasetsAsync("SIEFORE rendimientos");

        // Assert
        Assert.True(result.Success);
        Assert.Equal(2, result.TotalCount);
        Assert.Equal(2, result.Datasets.Count);
        Assert.Contains(result.Datasets, d => d.Title.Contains("Rendimientos"));
    }

    [Fact]
    public async Task SearchDatasetsAsync_WithOrganizationFilter_FiltersResults()
    {
        // Arrange
        var ckanResponse = new
        {
            success = true,
            result = new
            {
                count = 1,
                results = new[]
                {
                    new
                    {
                        id = "consar-data",
                        name = "consar-dataset",
                        title = "CONSAR Dataset",
                        notes = "Data from CONSAR",
                        organization = new { name = "consar", title = "CONSAR" },
                        resources = Array.Empty<object>()
                    }
                }
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(ckanResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.SearchDatasetsAsync("SIEFORE", OpenDataOrganization.CONSAR);

        // Assert
        Assert.True(result.Success);
        Assert.All(result.Datasets, d =>
            Assert.Contains("CONSAR", d.Organization ?? "", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task SearchDatasetsAsync_WithEmptyResults_ReturnsEmptyList()
    {
        // Arrange
        var ckanResponse = new
        {
            success = true,
            result = new
            {
                count = 0,
                results = Array.Empty<object>()
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(ckanResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.SearchDatasetsAsync("nonexistent query xyz123");

        // Assert
        Assert.True(result.Success);
        Assert.Empty(result.Datasets);
        Assert.Equal(0, result.TotalCount);
    }

    [Fact]
    public async Task SearchDatasetsAsync_WithApiError_ReturnsError()
    {
        // Arrange
        var response = new HttpResponseMessage(HttpStatusCode.InternalServerError)
        {
            Content = new StringContent("Internal Server Error")
        };

        var service = CreateService(response);

        // Act
        var result = await service.SearchDatasetsAsync("test");

        // Assert
        Assert.False(result.Success);
        Assert.NotNull(result.ErrorMessage);
    }

    #endregion

    #region Dataset Details Tests

    [Fact]
    public async Task GetDatasetInfoAsync_WithValidId_ReturnsDataset()
    {
        // Arrange
        var ckanResponse = new
        {
            success = true,
            result = new
            {
                id = "consar-rendimientos",
                name = "rendimientos-siefore",
                title = "Rendimientos SIEFORE",
                notes = "Rendimientos netos históricos",
                organization = new { name = "consar", title = "CONSAR" },
                resources = new[]
                {
                    new
                    {
                        id = "res-1",
                        name = "data.csv",
                        format = "CSV",
                        url = "https://datos.gob.mx/data.csv",
                        last_modified = "2025-11-27T10:00:00"
                    }
                },
                metadata_created = "2020-01-01T00:00:00",
                metadata_modified = "2025-11-27T10:00:00"
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(ckanResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetDatasetInfoAsync("consar-rendimientos");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("consar-rendimientos", result.Id);
        Assert.Equal("Rendimientos SIEFORE", result.Title);
        Assert.NotEmpty(result.Resources);
    }

    [Fact]
    public async Task GetDatasetInfoAsync_WithInvalidId_ReturnsNull()
    {
        // Arrange
        var ckanResponse = new
        {
            success = false,
            error = new { message = "Not found" }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(ckanResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetDatasetInfoAsync("nonexistent-id");

        // Assert
        Assert.Null(result);
    }

    #endregion

    #region Datastore Query Tests

    [Fact]
    public async Task GetResourceDataAsync_WithValidResource_ReturnsRecords()
    {
        // Arrange - CKAN Datastore API response
        var datastoreResponse = new
        {
            success = true,
            result = new
            {
                fields = new[]
                {
                    new { id = "afore", type = "text" },
                    new { id = "rendimiento", type = "numeric" },
                    new { id = "fecha", type = "date" }
                },
                records = new[]
                {
                    new Dictionary<string, object>
                    {
                        { "afore", "PROFUTURO" },
                        { "rendimiento", 8.5 },
                        { "fecha", "2025-11-27" }
                    },
                    new Dictionary<string, object>
                    {
                        { "afore", "XXI BANORTE" },
                        { "rendimiento", 8.2 },
                        { "fecha", "2025-11-27" }
                    }
                },
                total = 2
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(datastoreResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetResourceDataAsync("resource-id");

        // Assert
        Assert.True(result.Success);
        Assert.Equal(2, result.TotalRecords);
        Assert.Equal(2, result.Records.Count);
        Assert.Contains(result.Records, r => r.ContainsKey("afore"));
    }

    [Fact]
    public async Task GetResourceDataAsync_WithFilters_AppliesFilters()
    {
        // Arrange
        var datastoreResponse = new
        {
            success = true,
            result = new
            {
                fields = new[] { new { id = "afore", type = "text" } },
                records = new[]
                {
                    new Dictionary<string, object> { { "afore", "PROFUTURO" } }
                },
                total = 1
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(datastoreResponse))
        };

        var service = CreateService(response);

        var filtersJson = JsonSerializer.Serialize(new { afore = "PROFUTURO" });

        // Act
        var result = await service.GetResourceDataAsync("resource-id", filters: filtersJson);

        // Assert
        Assert.True(result.Success);
        Assert.Single(result.Records);
    }

    #endregion

    #region Organization Tests

    [Fact]
    public async Task GetOrganizationDatasetsAsync_WithValidOrg_ReturnsDatasets()
    {
        // Arrange
        var ckanResponse = new
        {
            success = true,
            result = new
            {
                count = 1,
                results = new[]
                {
                    new
                    {
                        id = "dataset-1",
                        name = "test-dataset",
                        title = "Test Dataset",
                        notes = "Test",
                        organization = new { name = "consar", title = "CONSAR" },
                        resources = Array.Empty<object>()
                    }
                }
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(ckanResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetOrganizationDatasetsAsync(OpenDataOrganization.CONSAR);

        // Assert
        Assert.NotEmpty(result);
    }

    #endregion

    #region IMSS Employment Data Tests

    [Fact]
    public async Task GetImssEmploymentDataAsync_WithValidPeriod_ReturnsData()
    {
        // Arrange
        var datastoreResponse = new
        {
            success = true,
            result = new
            {
                fields = new[]
                {
                    new { id = "periodo", type = "text" },
                    new { id = "trabajadores_asegurados", type = "numeric" },
                    new { id = "patrones_registrados", type = "numeric" }
                },
                records = new[]
                {
                    new Dictionary<string, object>
                    {
                        { "periodo", "2025-11" },
                        { "trabajadores_asegurados", 22000000 },
                        { "patrones_registrados", 1100000 }
                    }
                },
                total = 1
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(datastoreResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetImssEmploymentDataAsync(2025, 11);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    #endregion

    #region Error Handling Tests

    [Fact]
    public async Task SearchDatasetsAsync_WithNetworkError_ReturnsError()
    {
        // Arrange
        _httpMessageHandlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ThrowsAsync(new HttpRequestException("Network error"));

        var httpClient = new HttpClient(_httpMessageHandlerMock.Object)
        {
            BaseAddress = new Uri("https://datos.gob.mx/")
        };

        _httpClientFactoryMock
            .Setup(x => x.CreateClient("MexicanOpenData"))
            .Returns(httpClient);

        var service = new MexicanOpenDataService(
            _httpClientFactoryMock.Object,
            _cacheMock.Object,
            _loggerMock.Object,
            _options);

        // Act
        var result = await service.SearchDatasetsAsync("test");

        // Assert
        Assert.False(result.Success);
        Assert.Contains("error", result.ErrorMessage?.ToLower() ?? "");
    }

    [Fact]
    public async Task SearchDatasetsAsync_WithMalformedJson_HandlesGracefully()
    {
        // Arrange
        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("not valid json {{{")
        };

        var service = CreateService(response);

        // Act
        var result = await service.SearchDatasetsAsync("test");

        // Assert
        Assert.False(result.Success);
    }

    #endregion
}
