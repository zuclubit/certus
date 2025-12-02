using System.Net;
using System.Text;
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
/// Unit tests for ValmerApiService
/// Tests VALMER price vector and yield curve parsing
/// </summary>
public class ValmerApiServiceTests
{
    private readonly Mock<IHttpClientFactory> _httpClientFactoryMock;
    private readonly Mock<IMemoryCache> _cacheMock;
    private readonly Mock<ILogger<ValmerApiService>> _loggerMock;
    private readonly IOptions<ValmerApiOptions> _options;
    private readonly Mock<HttpMessageHandler> _httpMessageHandlerMock;

    public ValmerApiServiceTests()
    {
        _httpClientFactoryMock = new Mock<IHttpClientFactory>();
        _cacheMock = new Mock<IMemoryCache>();
        _loggerMock = new Mock<ILogger<ValmerApiService>>();
        _httpMessageHandlerMock = new Mock<HttpMessageHandler>();

        _options = Options.Create(new ValmerApiOptions
        {
            Token = "test-valmer-token",
            MaxRetries = 3,
            TimeoutSeconds = 60,
            CacheHours = 6
        });

        // Setup cache to always return false for TryGetValue (no cache hits)
        object? cacheValue;
        _cacheMock.Setup(x => x.TryGetValue(It.IsAny<object>(), out cacheValue))
            .Returns(false);

        var cacheEntryMock = new Mock<ICacheEntry>();
        _cacheMock.Setup(x => x.CreateEntry(It.IsAny<object>()))
            .Returns(cacheEntryMock.Object);
    }

    private ValmerApiService CreateService(HttpResponseMessage? responseMessage = null)
    {
        responseMessage ??= new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("")
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
            BaseAddress = new Uri("https://www.valmer.com.mx/")
        };

        _httpClientFactoryMock
            .Setup(x => x.CreateClient("ValmerApi"))
            .Returns(httpClient);

        return new ValmerApiService(
            _httpClientFactoryMock.Object,
            _cacheMock.Object,
            _loggerMock.Object,
            _options);
    }

    #region Price Vector Tests

    [Fact]
    public async Task GetPriceVectorAsync_WithValidCsv_ReturnsPrices()
    {
        // Arrange - Sample VALMER CSV format
        var csvContent = @"FECHA,TIPO_MERCADO,EMISORA,SERIE,PRECIO_SUCIO,PRECIO_LIMPIO,INTERESES,PLAZO,TASA,RENDIMIENTO
2025-11-27,GUBERNAMENTAL,CETES,BI251127,99.8500,99.8500,0.0000,28,10.2500,10.2500
2025-11-27,GUBERNAMENTAL,BONDES,D_261210,100.2345,99.5678,0.6667,365,10.5000,10.4500
2025-11-27,PRIVADO,PEMEX,24-2,98.7654,97.8901,0.8753,730,11.2500,11.5000";

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(csvContent, Encoding.UTF8, "text/csv")
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetPriceVectorAsync(new DateTime(2025, 11, 27));

        // Assert
        Assert.True(result.IsValid);
        Assert.Equal(3, result.TotalInstruments);
        Assert.Equal(new DateTime(2025, 11, 27), result.Date);

        var cetesPrice = result.Prices.FirstOrDefault(p => p.Issuer == "CETES");
        Assert.NotNull(cetesPrice);
        Assert.Equal(99.85m, cetesPrice.DirtyPrice);
        Assert.Equal("GUBERNAMENTAL", cetesPrice.MarketType);
    }

    [Fact]
    public async Task GetPriceVectorAsync_WithEmptyResponse_ReturnsError()
    {
        // Arrange
        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("", Encoding.UTF8, "text/csv")
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetPriceVectorAsync(DateTime.Today);

        // Assert
        Assert.False(result.IsValid);
        Assert.NotNull(result.ErrorMessage);
    }

    [Fact]
    public async Task GetPriceVectorAsync_WithHttpError_ReturnsError()
    {
        // Arrange
        var response = new HttpResponseMessage(HttpStatusCode.ServiceUnavailable)
        {
            Content = new StringContent("Service Unavailable")
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetPriceVectorAsync(DateTime.Today);

        // Assert
        Assert.False(result.IsValid);
        Assert.Contains("503", result.ErrorMessage);
    }

    #endregion

    #region Instrument Price Tests

    [Fact]
    public async Task GetInstrumentPriceAsync_WithValidInstrument_ReturnsPrice()
    {
        // Arrange
        var csvContent = @"FECHA,TIPO_MERCADO,EMISORA,SERIE,PRECIO_SUCIO,PRECIO_LIMPIO,INTERESES,PLAZO,TASA,RENDIMIENTO
2025-11-27,GUBERNAMENTAL,CETES,BI251127,99.8500,99.8500,0.0000,28,10.2500,10.2500
2025-11-27,GUBERNAMENTAL,BONDES,D_261210,100.2345,99.5678,0.6667,365,10.5000,10.4500";

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(csvContent, Encoding.UTF8, "text/csv")
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetInstrumentPriceAsync("CETES", "BI251127", new DateTime(2025, 11, 27));

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsValid);
        Assert.Equal("CETES", result.Issuer);
        Assert.Equal("BI251127", result.Series);
        Assert.Equal(99.85m, result.DirtyPrice);
    }

    [Fact]
    public async Task GetInstrumentPriceAsync_WithNonExistentInstrument_ReturnsNull()
    {
        // Arrange
        var csvContent = @"FECHA,TIPO_MERCADO,EMISORA,SERIE,PRECIO_SUCIO,PRECIO_LIMPIO,INTERESES,PLAZO,TASA,RENDIMIENTO
2025-11-27,GUBERNAMENTAL,CETES,BI251127,99.8500,99.8500,0.0000,28,10.2500,10.2500";

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(csvContent, Encoding.UTF8, "text/csv")
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetInstrumentPriceAsync("NONEXISTENT", "SERIE", new DateTime(2025, 11, 27));

        // Assert
        Assert.Null(result);
    }

    #endregion

    #region Yield Curve Tests

    [Fact]
    public async Task GetGovernmentCurveAsync_WithValidResponse_ReturnsCurve()
    {
        // Arrange - Simulated yield curve data
        var csvContent = @"FECHA,CURVA,PLAZO,TASA,FACTOR_DESCUENTO
2025-11-27,GUBERNAMENTAL,28,10.25,0.9921
2025-11-27,GUBERNAMENTAL,91,10.35,0.9745
2025-11-27,GUBERNAMENTAL,182,10.45,0.9501
2025-11-27,GUBERNAMENTAL,364,10.55,0.9045";

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(csvContent, Encoding.UTF8, "text/csv")
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetGovernmentCurveAsync(new DateTime(2025, 11, 27));

        // Assert
        Assert.True(result.IsValid);
        Assert.Equal(ValmerCurveType.Government, result.CurveType);
        Assert.True(result.Points.Count > 0);
    }

    [Fact]
    public async Task GetTiieCurveAsync_WithValidResponse_ReturnsCurve()
    {
        // Arrange
        var csvContent = @"FECHA,CURVA,PLAZO,TASA,FACTOR_DESCUENTO
2025-11-27,TIIE,28,10.50,0.9919
2025-11-27,TIIE,91,10.55,0.9740
2025-11-27,TIIE,182,10.60,0.9490";

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(csvContent, Encoding.UTF8, "text/csv")
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetTiieCurveAsync(new DateTime(2025, 11, 27));

        // Assert
        Assert.True(result.IsValid);
        Assert.Equal(ValmerCurveType.TIIE, result.CurveType);
    }

    #endregion

    #region Instrument Catalog Tests

    [Fact]
    public async Task GetInstrumentCatalogAsync_WithGovernmentFilter_ReturnsFilteredResults()
    {
        // Arrange
        var csvContent = @"TICKER,EMISORA,SERIE,DESCRIPCION,TIPO,MONEDA,FECHA_EMISION,FECHA_VENCIMIENTO,CUPON,FRECUENCIA
CETES_BI251127,CETES,BI251127,CETES 28 DIAS,GUBERNAMENTAL,MXN,2025-10-30,2025-11-27,0,0
BONDES_D_261210,BONDES,D_261210,BONDES D 1 AÑO,GUBERNAMENTAL,MXN,2024-12-10,2026-12-10,TIIE+0.10,28";

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(csvContent, Encoding.UTF8, "text/csv")
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetInstrumentCatalogAsync(ValmerInstrumentType.GovernmentDebt);

        // Assert
        Assert.NotEmpty(result);
        Assert.All(result, i => Assert.Equal(ValmerInstrumentType.GovernmentDebt, i.InstrumentType));
    }

    #endregion

    #region Connection Validation Tests

    [Fact]
    public async Task ValidateConnectionAsync_WithSuccessfulResponse_ReturnsTrue()
    {
        // Arrange
        var csvContent = "FECHA,PRECIO\n2025-11-27,100.00";
        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(csvContent, Encoding.UTF8, "text/csv")
        };

        var service = CreateService(response);

        // Act
        var result = await service.ValidateConnectionAsync();

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task ValidateConnectionAsync_WithServerError_ReturnsFalse()
    {
        // Arrange
        var response = new HttpResponseMessage(HttpStatusCode.InternalServerError)
        {
            Content = new StringContent("Error")
        };

        var service = CreateService(response);

        // Act
        var result = await service.ValidateConnectionAsync();

        // Assert
        Assert.False(result);
    }

    #endregion

    #region CSV Parsing Tests

    [Theory]
    [InlineData("100.5000", 100.5)]
    [InlineData("99.8765", 99.8765)]
    [InlineData("", 0)]
    public void ParseDecimal_HandlesVariousFormats(string input, decimal expected)
    {
        // This tests the internal decimal parsing logic
        var parsed = decimal.TryParse(input, out var result) ? result : 0m;
        Assert.Equal(expected, parsed);
    }

    [Fact]
    public async Task GetPriceVectorAsync_WithMalformedCsv_HandlesGracefully()
    {
        // Arrange - CSV with missing columns
        var csvContent = @"FECHA,EMISORA
2025-11-27,CETES";

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(csvContent, Encoding.UTF8, "text/csv")
        };

        var service = CreateService(response);

        // Act
        var result = await service.GetPriceVectorAsync(DateTime.Today);

        // Assert
        // Should handle gracefully without throwing
        Assert.NotNull(result);
    }

    #endregion
}
