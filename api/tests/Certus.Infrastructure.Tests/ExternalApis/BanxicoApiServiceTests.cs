using System.Net;
using System.Text.Json;
using Certus.Application.Common.Interfaces;
using Certus.Infrastructure.Services.ExternalApis;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Moq.Protected;
using Xunit;

namespace Certus.Infrastructure.Tests.ExternalApis;

/// <summary>
/// Unit tests for BanxicoApiService
/// Tests BANXICO SIE API integration with mocked HTTP responses
/// </summary>
public class BanxicoApiServiceTests
{
    private readonly Mock<IHttpClientFactory> _httpClientFactoryMock;
    private readonly Mock<IMemoryCache> _cacheMock;
    private readonly Mock<ILogger<BanxicoApiService>> _loggerMock;
    private readonly IOptions<BanxicoApiOptions> _options;
    private readonly Mock<HttpMessageHandler> _httpMessageHandlerMock;

    public BanxicoApiServiceTests()
    {
        _httpClientFactoryMock = new Mock<IHttpClientFactory>();
        _cacheMock = new Mock<IMemoryCache>();
        _loggerMock = new Mock<ILogger<BanxicoApiService>>();
        _httpMessageHandlerMock = new Mock<HttpMessageHandler>();

        _options = Options.Create(new BanxicoApiOptions
        {
            Token = "test-token-12345",
            MaxRetries = 3,
            TimeoutSeconds = 30
        });

        // Setup cache to always return false for TryGetValue (no cache hits)
        object? cacheValue;
        _cacheMock.Setup(x => x.TryGetValue(It.IsAny<object>(), out cacheValue))
            .Returns(false);

        var cacheEntryMock = new Mock<ICacheEntry>();
        _cacheMock.Setup(x => x.CreateEntry(It.IsAny<object>()))
            .Returns(cacheEntryMock.Object);
    }

    private BanxicoApiService CreateService(HttpResponseMessage? responseMessage = null)
    {
        responseMessage ??= new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("{}")
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
            BaseAddress = new Uri("https://www.banxico.org.mx/SieAPIRest/service/v1/")
        };

        _httpClientFactoryMock
            .Setup(x => x.CreateClient("BanxicoApi"))
            .Returns(httpClient);

        return new BanxicoApiService(
            _httpClientFactoryMock.Object,
            _cacheMock.Object,
            _loggerMock.Object,
            _options);
    }

    #region Exchange Rate Tests

    [Fact]
    public async Task GetExchangeRateFixAsync_WithValidResponse_ReturnsExchangeRate()
    {
        // Arrange
        var banxicoResponse = new
        {
            bmx = new
            {
                series = new[]
                {
                    new
                    {
                        idSerie = "SF43718",
                        titulo = "Tipo de cambio pesos por dólar E.U.A. Tipo de cambio FIX",
                        datos = new[]
                        {
                            new { fecha = "27/11/2025", dato = "20.4567" }
                        }
                    }
                }
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(banxicoResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetExchangeRateFixAsync(new DateTime(2025, 11, 27));

        // Assert
        Assert.True(result.IsValid);
        Assert.Equal("USD", result.Currency);
        Assert.Equal("SF43718", result.SeriesId);
        Assert.Equal(20.4567m, result.Rate);
    }

    [Fact]
    public async Task GetExchangeRateFixAsync_WithInvalidDate_ReturnsError()
    {
        // Arrange
        var banxicoResponse = new
        {
            bmx = new
            {
                series = new[]
                {
                    new
                    {
                        idSerie = "SF43718",
                        titulo = "Tipo de cambio FIX",
                        datos = Array.Empty<object>()
                    }
                }
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(banxicoResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetExchangeRateFixAsync(new DateTime(2025, 12, 25)); // Holiday

        // Assert
        Assert.False(result.IsValid);
        Assert.NotNull(result.ErrorMessage);
    }

    [Fact]
    public async Task GetExchangeRateFixAsync_WithHttpError_ReturnsError()
    {
        // Arrange
        var response = new HttpResponseMessage(HttpStatusCode.InternalServerError)
        {
            Content = new StringContent("Internal Server Error")
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetExchangeRateFixAsync(DateTime.Today);

        // Assert
        Assert.False(result.IsValid);
        Assert.Contains("500", result.ErrorMessage);
    }

    #endregion

    #region TIIE Tests

    [Fact]
    public async Task GetTiieFondeo1DAsync_WithValidResponse_ReturnsRate()
    {
        // Arrange
        var banxicoResponse = new
        {
            bmx = new
            {
                series = new[]
                {
                    new
                    {
                        idSerie = "SF61745",
                        titulo = "TIIE de Fondeo a 1 día",
                        datos = new[]
                        {
                            new { fecha = "27/11/2025", dato = "10.2500" }
                        }
                    }
                }
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(banxicoResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetTiieFondeo1DAsync(new DateTime(2025, 11, 27));

        // Assert
        Assert.True(result.IsValid);
        Assert.Equal("TIIE Fondeo", result.RateType);
        Assert.Equal(1, result.TermDays);
        Assert.Equal("SF61745", result.SeriesId);
        Assert.Equal(10.25m, result.Rate);
    }

    [Fact]
    public async Task GetTiieAsync_With28Days_ReturnsCorrectRate()
    {
        // Arrange
        var banxicoResponse = new
        {
            bmx = new
            {
                series = new[]
                {
                    new
                    {
                        idSerie = "SF60648",
                        titulo = "TIIE a 28 días",
                        datos = new[]
                        {
                            new { fecha = "27/11/2025", dato = "10.5000" }
                        }
                    }
                }
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(banxicoResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetTiieAsync(28, new DateTime(2025, 11, 27));

        // Assert
        Assert.True(result.IsValid);
        Assert.Equal(28, result.TermDays);
        Assert.Equal(10.50m, result.Rate);
    }

    [Fact]
    public async Task GetTiieAsync_WithInvalidTerm_ReturnsError()
    {
        // Arrange
        var service = CreateService();

        // Act
        var result = await service.GetTiieAsync(15, DateTime.Today); // Invalid term

        // Assert
        Assert.False(result.IsValid);
        Assert.Contains("Invalid", result.ErrorMessage);
    }

    #endregion

    #region UDI Tests

    [Fact]
    public async Task GetUdiValueAsync_WithValidResponse_ReturnsUdiValue()
    {
        // Arrange
        var banxicoResponse = new
        {
            bmx = new
            {
                series = new[]
                {
                    new
                    {
                        idSerie = "SP68257",
                        titulo = "Unidad de Inversión (UDI)",
                        datos = new[]
                        {
                            new { fecha = "27/11/2025", dato = "8.234567" }
                        }
                    }
                }
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(banxicoResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetUdiValueAsync(new DateTime(2025, 11, 27));

        // Assert
        Assert.NotNull(result);
        Assert.Equal(8.234567m, result.Value);
    }

    #endregion

    #region Rate Limiting Tests

    [Fact]
    public async Task GetRateLimitStatusAsync_ReturnsCorrectStatus()
    {
        // Arrange
        var service = CreateService();

        // Act
        var result = await service.GetRateLimitStatusAsync();

        // Assert
        Assert.Equal(10000, result.DailyLimit);
        Assert.Equal(200, result.FiveMinuteLimit);
        Assert.True(result.DailyRemaining >= 0);
        Assert.True(result.FiveMinuteRemaining >= 0);
    }

    #endregion

    #region Token Validation Tests

    [Fact]
    public async Task ValidateTokenAsync_WithValidToken_ReturnsTrue()
    {
        // Arrange
        var banxicoResponse = new
        {
            bmx = new
            {
                series = new[]
                {
                    new
                    {
                        idSerie = "SF43718",
                        datos = new[]
                        {
                            new { fecha = "27/11/2025", dato = "20.45" }
                        }
                    }
                }
            }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(banxicoResponse))
        };

        var service = CreateService(response);

        // Act
        var result = await service.ValidateTokenAsync();

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task ValidateTokenAsync_WithUnauthorized_ReturnsFalse()
    {
        // Arrange
        var response = new HttpResponseMessage(HttpStatusCode.Unauthorized)
        {
            Content = new StringContent("Invalid token")
        };

        var service = CreateService(response);

        // Act
        var result = await service.ValidateTokenAsync();

        // Assert
        Assert.False(result);
    }

    #endregion

    #region Series Catalog Tests

    [Fact]
    public void SeriesCatalog_ContainsMandatory2025Series()
    {
        // Verify TIIE de Fondeo is in catalog (mandatory for new contracts since Jan 2025)
        Assert.Equal("SF61745", Certus.Infrastructure.Services.ReferenceData.BanxicoSeriesCatalog.TIIEFondeo1D);
        Assert.Equal("SF43718", Certus.Infrastructure.Services.ReferenceData.BanxicoSeriesCatalog.TipoCambioFix);
        Assert.Equal("SP68257", Certus.Infrastructure.Services.ReferenceData.BanxicoSeriesCatalog.UDI);
    }

    #endregion
}
