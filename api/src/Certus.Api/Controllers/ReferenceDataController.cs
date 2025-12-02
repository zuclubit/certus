using Certus.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller para Datos de Referencia externos (GLEIF, OpenFIGI, BANXICO, VALMER)
/// Proporciona validación de identificadores y acceso a datos de mercado
/// </summary>
[Authorize]
[Route("api/v{version:apiVersion}/reference-data")]
public class ReferenceDataController : BaseController
{
    private readonly IReferenceDataService _referenceDataService;
    private readonly ILogger<ReferenceDataController> _logger;

    public ReferenceDataController(
        IReferenceDataService referenceDataService,
        ILogger<ReferenceDataController> logger)
    {
        _referenceDataService = referenceDataService;
        _logger = logger;
    }

    // ========================================
    // LEI - Legal Entity Identifier (GLEIF)
    // ========================================

    /// <summary>
    /// Validar LEI de contraparte
    /// </summary>
    [HttpGet("lei/{lei}")]
    [SwaggerOperation(
        Summary = "Validar LEI",
        Description = "Valida un Legal Entity Identifier (LEI) usando la API de GLEIF")]
    [ProducesResponseType(typeof(LeiValidationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LeiValidationResult>> ValidateLei(
        string lei,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(lei) || lei.Length != 20)
            return BadRequest(new { error = "LEI debe tener exactamente 20 caracteres" });

        var result = await _referenceDataService.ValidateLeiAsync(lei, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Buscar entidades por nombre
    /// </summary>
    [HttpGet("lei/search")]
    [SwaggerOperation(
        Summary = "Buscar LEI por nombre",
        Description = "Busca entidades legales por nombre en la base de datos GLEIF")]
    [ProducesResponseType(typeof(IEnumerable<LeiRecord>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<LeiRecord>>> SearchLeiByName(
        [FromQuery] string name,
        [FromQuery] int maxResults = 10,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest(new { error = "El nombre de búsqueda es requerido" });

        var results = await _referenceDataService.SearchLeiByNameAsync(name, maxResults, cancellationToken);
        return Ok(results);
    }

    // ========================================
    // ISIN/CUSIP - Security Identifiers (OpenFIGI)
    // ========================================

    /// <summary>
    /// Validar ISIN de instrumento
    /// </summary>
    [HttpGet("isin/{isin}")]
    [SwaggerOperation(
        Summary = "Validar ISIN",
        Description = "Valida un ISIN usando la API de OpenFIGI")]
    [ProducesResponseType(typeof(IsinValidationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IsinValidationResult>> ValidateIsin(
        string isin,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(isin) || isin.Length != 12)
            return BadRequest(new { error = "ISIN debe tener exactamente 12 caracteres" });

        var result = await _referenceDataService.ValidateIsinAsync(isin, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Validar CUSIP de instrumento
    /// </summary>
    [HttpGet("cusip/{cusip}")]
    [SwaggerOperation(
        Summary = "Validar CUSIP",
        Description = "Valida un CUSIP usando la API de OpenFIGI")]
    [ProducesResponseType(typeof(CusipValidationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CusipValidationResult>> ValidateCusip(
        string cusip,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(cusip) || cusip.Length != 9)
            return BadRequest(new { error = "CUSIP debe tener exactamente 9 caracteres" });

        var result = await _referenceDataService.ValidateCusipAsync(cusip, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Mapear múltiples identificadores a FIGIs
    /// </summary>
    [HttpPost("figi/map")]
    [SwaggerOperation(
        Summary = "Mapear identificadores a FIGI",
        Description = "Mapea múltiples ISIN/CUSIP/SEDOL a sus FIGIs correspondientes")]
    [ProducesResponseType(typeof(IEnumerable<FigiMappingResult>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<FigiMappingResult>>> MapIdentifiers(
        [FromBody] MapIdentifiersRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Identifiers == null || !request.Identifiers.Any())
            return BadRequest(new { error = "Debe proporcionar al menos un identificador" });

        var identifiers = request.Identifiers.Select(i => new SecurityIdentifier
        {
            IdType = i.IdType,
            IdValue = i.IdValue,
            ExchangeCode = i.ExchangeCode,
            MarketSector = i.MarketSector
        });

        var results = await _referenceDataService.MapIdentifiersAsync(identifiers, cancellationToken);
        return Ok(results);
    }

    // ========================================
    // Tipos de Cambio (BANXICO SIE)
    // ========================================

    /// <summary>
    /// Obtener tipo de cambio FIX para una fecha
    /// </summary>
    [HttpGet("exchange-rate/fix")]
    [SwaggerOperation(
        Summary = "Obtener tipo de cambio FIX",
        Description = "Obtiene el tipo de cambio FIX USD/MXN de BANXICO para una fecha")]
    [ProducesResponseType(typeof(ExchangeRateResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<ExchangeRateResult>> GetExchangeRateFix(
        [FromQuery] DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        var targetDate = date ?? DateTime.UtcNow.Date;
        var result = await _referenceDataService.GetExchangeRateFixAsync(targetDate, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Obtener tipos de cambio para un rango de fechas
    /// </summary>
    [HttpGet("exchange-rate/range")]
    [SwaggerOperation(
        Summary = "Obtener tipos de cambio por rango",
        Description = "Obtiene tipos de cambio para un período de tiempo")]
    [ProducesResponseType(typeof(IEnumerable<ExchangeRateResult>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ExchangeRateResult>>> GetExchangeRateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] string currency = "USD",
        CancellationToken cancellationToken = default)
    {
        if (startDate > endDate)
            return BadRequest(new { error = "La fecha inicial debe ser menor o igual a la fecha final" });

        if ((endDate - startDate).TotalDays > 365)
            return BadRequest(new { error = "El rango máximo es de 365 días" });

        var results = await _referenceDataService.GetExchangeRateRangeAsync(
            startDate, endDate, currency, cancellationToken);
        return Ok(results);
    }

    /// <summary>
    /// Obtener valor de UDI para una fecha
    /// </summary>
    [HttpGet("udi")]
    [SwaggerOperation(
        Summary = "Obtener valor UDI",
        Description = "Obtiene el valor de la Unidad de Inversión para una fecha")]
    [ProducesResponseType(typeof(UdiValueResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<UdiValueResponse>> GetUdiValue(
        [FromQuery] DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        var targetDate = date ?? DateTime.UtcNow.Date;
        var value = await _referenceDataService.GetUdiValueAsync(targetDate, cancellationToken);

        return Ok(new UdiValueResponse
        {
            Date = targetDate,
            Value = value,
            Currency = "MXN"
        });
    }

    // ========================================
    // Vector de Precios (VALMER)
    // ========================================

    /// <summary>
    /// Obtener precio de instrumento del vector VALMER
    /// </summary>
    [HttpGet("valmer/price")]
    [SwaggerOperation(
        Summary = "Obtener precio VALMER",
        Description = "Obtiene el precio de un instrumento del vector de precios VALMER")]
    [ProducesResponseType(typeof(ValmerPriceResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ValmerPriceResult>> GetInstrumentPrice(
        [FromQuery] string ticker,
        [FromQuery] string series,
        [FromQuery] DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(ticker))
            return BadRequest(new { error = "El ticker es requerido" });

        var result = await _referenceDataService.GetInstrumentPriceAsync(
            ticker, series ?? "", date, cancellationToken);

        if (result == null)
            return NotFound(new { error = $"No se encontró precio para {ticker}/{series}" });

        return Ok(result);
    }

    /// <summary>
    /// Obtener vector de precios completo
    /// </summary>
    [HttpGet("valmer/vector")]
    [SwaggerOperation(
        Summary = "Obtener vector de precios VALMER",
        Description = "Obtiene el vector de precios completo para una fecha")]
    [ProducesResponseType(typeof(IEnumerable<ValmerPriceResult>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ValmerPriceResult>>> GetPriceVector(
        [FromQuery] DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        var results = await _referenceDataService.GetPriceVectorAsync(date, cancellationToken);
        return Ok(results);
    }

    /// <summary>
    /// Obtener curva de rendimientos
    /// </summary>
    [HttpGet("valmer/yield-curve")]
    [SwaggerOperation(
        Summary = "Obtener curva de rendimientos",
        Description = "Obtiene la curva de rendimientos para un tipo específico")]
    [ProducesResponseType(typeof(IEnumerable<YieldCurvePoint>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<YieldCurvePoint>>> GetYieldCurve(
        [FromQuery] string curveType = "TIIE",
        [FromQuery] DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        var results = await _referenceDataService.GetYieldCurveAsync(curveType, date, cancellationToken);
        return Ok(results);
    }

    // ========================================
    // Catálogos SIEFORES/AFOREs
    // ========================================

    /// <summary>
    /// Obtener catálogo de SIEFOREs
    /// </summary>
    [HttpGet("siefores")]
    [SwaggerOperation(
        Summary = "Obtener catálogo de SIEFOREs",
        Description = "Obtiene el catálogo completo de SIEFOREs generacionales")]
    [ProducesResponseType(typeof(IEnumerable<SieforesInfo>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<SieforesInfo>>> GetSieforessCatalog(
        CancellationToken cancellationToken)
    {
        var results = await _referenceDataService.GetSieforessCatalogAsync(cancellationToken);
        return Ok(results);
    }

    /// <summary>
    /// Validar clave de SIEFORE
    /// </summary>
    [HttpGet("siefores/validate/{key}")]
    [SwaggerOperation(
        Summary = "Validar SIEFORE",
        Description = "Valida una clave de SIEFORE")]
    [ProducesResponseType(typeof(SieforeValidationResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<SieforeValidationResult>> ValidateSiefore(
        string key,
        CancellationToken cancellationToken)
    {
        var result = await _referenceDataService.ValidateSieforesAsync(key, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Obtener catálogo de AFOREs
    /// </summary>
    [HttpGet("afores")]
    [SwaggerOperation(
        Summary = "Obtener catálogo de AFOREs",
        Description = "Obtiene el catálogo completo de AFOREs activas")]
    [ProducesResponseType(typeof(IEnumerable<AforeInfo>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AforeInfo>>> GetAforessCatalog(
        CancellationToken cancellationToken)
    {
        var results = await _referenceDataService.GetAforessCatalogAsync(cancellationToken);
        return Ok(results);
    }

    /// <summary>
    /// Validar clave de AFORE
    /// </summary>
    [HttpGet("afores/validate/{key}")]
    [SwaggerOperation(
        Summary = "Validar AFORE",
        Description = "Valida una clave de AFORE")]
    [ProducesResponseType(typeof(AforeValidationResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<AforeValidationResult>> ValidateAfore(
        string key,
        CancellationToken cancellationToken)
    {
        var result = await _referenceDataService.ValidateAforeAsync(key, cancellationToken);
        return Ok(result);
    }

    // ========================================
    // Tablas Actuariales
    // ========================================

    /// <summary>
    /// Obtener tasa de mortalidad
    /// </summary>
    [HttpGet("actuarial/mortality")]
    [SwaggerOperation(
        Summary = "Obtener tasa de mortalidad",
        Description = "Obtiene la probabilidad de mortalidad (qx) para una edad y género")]
    [ProducesResponseType(typeof(MortalityRateResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<MortalityRateResponse>> GetMortalityRate(
        [FromQuery] int age,
        [FromQuery] string gender,
        [FromQuery] string tableType = "CNSF2000-I",
        CancellationToken cancellationToken = default)
    {
        if (age < 0 || age > 120)
            return BadRequest(new { error = "La edad debe estar entre 0 y 120 años" });

        if (gender != "M" && gender != "F")
            return BadRequest(new { error = "El género debe ser 'M' o 'F'" });

        var rate = await _referenceDataService.GetMortalityRateAsync(
            age, gender, tableType, cancellationToken);

        return Ok(new MortalityRateResponse
        {
            Age = age,
            Gender = gender,
            TableType = tableType,
            MortalityRate = rate,
            SurvivalRate = rate.HasValue ? 1 - rate.Value : null
        });
    }

    /// <summary>
    /// Obtener factores actuariales
    /// </summary>
    [HttpGet("actuarial/factors")]
    [SwaggerOperation(
        Summary = "Obtener factores actuariales",
        Description = "Obtiene factores actuariales para cálculo de pensiones")]
    [ProducesResponseType(typeof(ActuarialFactors), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ActuarialFactors>> GetActuarialFactors(
        [FromQuery] int age,
        [FromQuery] string gender,
        [FromQuery] string pensionType = "Vejez",
        CancellationToken cancellationToken = default)
    {
        if (age < 0 || age > 120)
            return BadRequest(new { error = "La edad debe estar entre 0 y 120 años" });

        if (gender != "M" && gender != "F")
            return BadRequest(new { error = "El género debe ser 'M' o 'F'" });

        var factors = await _referenceDataService.GetActuarialFactorsAsync(
            age, gender, pensionType, cancellationToken);

        if (factors == null)
            return NotFound(new { error = "No se encontraron factores actuariales para los parámetros especificados" });

        return Ok(factors);
    }

    // ========================================
    // Health Check
    // ========================================

    /// <summary>
    /// Verificar estado de los servicios de datos de referencia
    /// </summary>
    [HttpGet("health")]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "Health check",
        Description = "Verifica la conectividad con las APIs externas")]
    [ProducesResponseType(typeof(ReferenceDataHealthResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ReferenceDataHealthResponse>> HealthCheck(
        CancellationToken cancellationToken)
    {
        var response = new ReferenceDataHealthResponse
        {
            Timestamp = DateTime.UtcNow,
            Services = new Dictionary<string, ServiceHealthStatus>()
        };

        // Check GLEIF
        try
        {
            var gleifResult = await _referenceDataService.ValidateLeiAsync(
                "529900W18LQJJN6SJ336", cancellationToken);
            response.Services["GLEIF"] = new ServiceHealthStatus
            {
                Status = gleifResult.IsValid ? "Healthy" : "Degraded",
                LastCheck = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            response.Services["GLEIF"] = new ServiceHealthStatus
            {
                Status = "Unhealthy",
                LastCheck = DateTime.UtcNow,
                Error = ex.Message
            };
        }

        // Check OpenFIGI
        try
        {
            var figiResult = await _referenceDataService.ValidateIsinAsync(
                "US0378331005", cancellationToken);
            response.Services["OpenFIGI"] = new ServiceHealthStatus
            {
                Status = figiResult.IsValid ? "Healthy" : "Degraded",
                LastCheck = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            response.Services["OpenFIGI"] = new ServiceHealthStatus
            {
                Status = "Unhealthy",
                LastCheck = DateTime.UtcNow,
                Error = ex.Message
            };
        }

        // Check static catalogs (always healthy)
        response.Services["SIEFOREs"] = new ServiceHealthStatus
        {
            Status = "Healthy",
            LastCheck = DateTime.UtcNow
        };

        response.Services["AFOREs"] = new ServiceHealthStatus
        {
            Status = "Healthy",
            LastCheck = DateTime.UtcNow
        };

        response.Services["ActuarialTables"] = new ServiceHealthStatus
        {
            Status = "Healthy",
            LastCheck = DateTime.UtcNow
        };

        response.OverallStatus = response.Services.Values.All(s => s.Status == "Healthy")
            ? "Healthy"
            : response.Services.Values.Any(s => s.Status == "Unhealthy")
                ? "Unhealthy"
                : "Degraded";

        return Ok(response);
    }
}

// ========================================
// Request/Response DTOs
// ========================================

public record MapIdentifiersRequest
{
    public IEnumerable<SecurityIdentifierRequest> Identifiers { get; init; } = Array.Empty<SecurityIdentifierRequest>();
}

public record SecurityIdentifierRequest
{
    public string IdType { get; init; } = string.Empty;
    public string IdValue { get; init; } = string.Empty;
    public string? ExchangeCode { get; init; }
    public string? MarketSector { get; init; }
}

public record UdiValueResponse
{
    public DateTime Date { get; init; }
    public decimal? Value { get; init; }
    public string Currency { get; init; } = "MXN";
}

public record MortalityRateResponse
{
    public int Age { get; init; }
    public string Gender { get; init; } = string.Empty;
    public string TableType { get; init; } = string.Empty;
    public decimal? MortalityRate { get; init; }
    public decimal? SurvivalRate { get; init; }
}

public record ReferenceDataHealthResponse
{
    public DateTime Timestamp { get; init; }
    public string OverallStatus { get; set; } = "Unknown";
    public Dictionary<string, ServiceHealthStatus> Services { get; init; } = new();
}

public record ServiceHealthStatus
{
    public string Status { get; init; } = "Unknown";
    public DateTime LastCheck { get; init; }
    public string? Error { get; init; }
}
