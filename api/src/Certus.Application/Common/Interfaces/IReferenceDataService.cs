namespace Certus.Application.Common.Interfaces;

/// <summary>
/// Servicio de datos de referencia para validacion de archivos CONSAR
/// Proporciona acceso a APIs externas para validar identificadores y obtener precios
/// </summary>
public interface IReferenceDataService
{
    // ========================================
    // LEI - Legal Entity Identifier (GLEIF)
    // ========================================

    /// <summary>
    /// Valida y obtiene informacion de una entidad legal por su LEI
    /// Fuente: GLEIF API (https://api.gleif.org)
    /// </summary>
    Task<LeiValidationResult> ValidateLeiAsync(string lei, CancellationToken cancellationToken = default);

    /// <summary>
    /// Busca LEIs por nombre de entidad
    /// </summary>
    Task<IEnumerable<LeiRecord>> SearchLeiByNameAsync(string entityName, int maxResults = 10, CancellationToken cancellationToken = default);

    // ========================================
    // ISIN/CUSIP - Security Identifiers (OpenFIGI)
    // ========================================

    /// <summary>
    /// Valida un ISIN y obtiene informacion del instrumento
    /// Fuente: OpenFIGI API (https://api.openfigi.com)
    /// </summary>
    Task<IsinValidationResult> ValidateIsinAsync(string isin, CancellationToken cancellationToken = default);

    /// <summary>
    /// Valida un CUSIP y obtiene informacion del instrumento
    /// </summary>
    Task<CusipValidationResult> ValidateCusipAsync(string cusip, CancellationToken cancellationToken = default);

    /// <summary>
    /// Mapea multiples identificadores de valores a FIGIs
    /// </summary>
    Task<IEnumerable<FigiMappingResult>> MapIdentifiersAsync(IEnumerable<SecurityIdentifier> identifiers, CancellationToken cancellationToken = default);

    // ========================================
    // Tipos de Cambio (BANXICO SIE)
    // ========================================

    /// <summary>
    /// Obtiene el tipo de cambio FIX USD/MXN para una fecha
    /// Serie: SF43718 (Tipo de cambio Pesos por dolar E.U.A.)
    /// </summary>
    Task<ExchangeRateResult> GetExchangeRateFixAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtiene tipos de cambio para un rango de fechas
    /// </summary>
    Task<IEnumerable<ExchangeRateResult>> GetExchangeRateRangeAsync(DateTime startDate, DateTime endDate, string currency = "USD", CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtiene UDI para una fecha especifica
    /// </summary>
    Task<decimal?> GetUdiValueAsync(DateTime date, CancellationToken cancellationToken = default);

    // ========================================
    // Vector de Precios (VALMER)
    // ========================================

    /// <summary>
    /// Obtiene el precio de un instrumento del vector VALMER
    /// </summary>
    Task<ValmerPriceResult?> GetInstrumentPriceAsync(string ticker, string series, DateTime? date = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtiene el vector de precios completo para una fecha
    /// </summary>
    Task<IEnumerable<ValmerPriceResult>> GetPriceVectorAsync(DateTime? date = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtiene curvas de rendimiento
    /// </summary>
    Task<IEnumerable<YieldCurvePoint>> GetYieldCurveAsync(string curveType, DateTime? date = null, CancellationToken cancellationToken = default);

    // ========================================
    // Catalogos SIEFORES/AFOREs
    // ========================================

    /// <summary>
    /// Obtiene el catalogo completo de SIEFOREs generacionales
    /// </summary>
    Task<IEnumerable<SieforesInfo>> GetSieforessCatalogAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Valida una clave de SIEFORE
    /// </summary>
    Task<SieforeValidationResult> ValidateSieforesAsync(string sieforesKey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtiene el catalogo de AFOREs activas
    /// </summary>
    Task<IEnumerable<AforeInfo>> GetAforessCatalogAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Valida una clave de AFORE
    /// </summary>
    Task<AforeValidationResult> ValidateAforeAsync(string aforeKey, CancellationToken cancellationToken = default);

    // ========================================
    // Tablas Actuariales
    // ========================================

    /// <summary>
    /// Obtiene la probabilidad de mortalidad para una edad y genero
    /// Tabla: CNSF 2000-I (Individual) o CNSF 2000-G (Grupo)
    /// </summary>
    Task<decimal?> GetMortalityRateAsync(int age, string gender, string tableType = "CNSF2000-I", CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtiene factores actuariales para calculo de pensiones
    /// </summary>
    Task<ActuarialFactors?> GetActuarialFactorsAsync(int age, string gender, string pensionType, CancellationToken cancellationToken = default);
}

// ========================================
// DTOs para LEI (GLEIF)
// ========================================

public record LeiValidationResult
{
    public bool IsValid { get; init; }
    public string? Lei { get; init; }
    public string? LegalName { get; init; }
    public string? Country { get; init; }
    public string? Jurisdiction { get; init; }
    public string? EntityStatus { get; init; }
    public string? LegalForm { get; init; }
    public DateTime? RegistrationDate { get; init; }
    public DateTime? LastUpdateDate { get; init; }
    public string? ErrorMessage { get; init; }
    public LeiAddress? LegalAddress { get; init; }
    public LeiAddress? HeadquartersAddress { get; init; }
}

public record LeiAddress
{
    public string? AddressLines { get; init; }
    public string? City { get; init; }
    public string? Region { get; init; }
    public string? Country { get; init; }
    public string? PostalCode { get; init; }
}

public record LeiRecord
{
    public string Lei { get; init; } = string.Empty;
    public string LegalName { get; init; } = string.Empty;
    public string? Country { get; init; }
    public string? Status { get; init; }
}

// ========================================
// DTOs para ISIN/CUSIP (OpenFIGI)
// ========================================

public record IsinValidationResult
{
    public bool IsValid { get; init; }
    public string? Isin { get; init; }
    public string? Figi { get; init; }
    public string? CompositeFigi { get; init; }
    public string? Name { get; init; }
    public string? Ticker { get; init; }
    public string? ExchangeCode { get; init; }
    public string? SecurityType { get; init; }
    public string? MarketSector { get; init; }
    public string? ErrorMessage { get; init; }
}

public record CusipValidationResult
{
    public bool IsValid { get; init; }
    public string? Cusip { get; init; }
    public string? Figi { get; init; }
    public string? Name { get; init; }
    public string? Ticker { get; init; }
    public string? SecurityType { get; init; }
    public string? ErrorMessage { get; init; }
}

public record SecurityIdentifier
{
    public string IdType { get; init; } = string.Empty; // ID_ISIN, ID_CUSIP, ID_SEDOL, etc.
    public string IdValue { get; init; } = string.Empty;
    public string? ExchangeCode { get; init; }
    public string? MarketSector { get; init; }
}

public record FigiMappingResult
{
    public string? Figi { get; init; }
    public string? CompositeFigi { get; init; }
    public string? ShareClassFigi { get; init; }
    public string? Name { get; init; }
    public string? Ticker { get; init; }
    public string? ExchangeCode { get; init; }
    public string? SecurityType { get; init; }
    public string? MarketSector { get; init; }
    public string? Error { get; init; }
}

// ========================================
// DTOs para Tipos de Cambio (BANXICO)
// ========================================

public record ExchangeRateResult
{
    public DateTime Date { get; init; }
    public string Currency { get; init; } = "USD";
    public decimal Rate { get; init; }
    public string? Source { get; init; }
    public string? SeriesId { get; init; }
}

// ========================================
// DTOs para Precios (VALMER)
// ========================================

public record ValmerPriceResult
{
    public DateTime Date { get; init; }
    public string MarketType { get; init; } = string.Empty;
    public string Ticker { get; init; } = string.Empty;
    public string Issuer { get; init; } = string.Empty;
    public string Series { get; init; } = string.Empty;
    public decimal DirtyPrice { get; init; }
    public decimal CleanPrice { get; init; }
    public decimal AccruedInterest { get; init; }
    public int DaysToMaturity { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal? Duration { get; init; }
    public decimal? Convexity { get; init; }
    public decimal? Yield { get; init; }
    public string? Instrument { get; init; }
}

public record YieldCurvePoint
{
    public DateTime Date { get; init; }
    public string CurveType { get; init; } = string.Empty;
    public int Term { get; init; } // Days
    public decimal Rate { get; init; }
}

// ========================================
// DTOs para Catalogos SIEFORES/AFOREs
// ========================================

public record SieforesInfo
{
    public string Key { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? AforeKey { get; init; }
    public string? AforeName { get; init; }
    public string? GenerationType { get; init; } // Generacional, Basica, Adicional
    public int? BirthYearStart { get; init; }
    public int? BirthYearEnd { get; init; }
    public decimal? Commission { get; init; }
    public bool IsActive { get; init; }
    public DateTime? EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
}

public record SieforeValidationResult
{
    public bool IsValid { get; init; }
    public string? Key { get; init; }
    public string? Name { get; init; }
    public string? AforeKey { get; init; }
    public string? GenerationType { get; init; }
    public string? ErrorMessage { get; init; }
}

public record AforeInfo
{
    public string Key { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? ShortName { get; init; }
    public string? Rfc { get; init; }
    public decimal? Commission2025 { get; init; }
    public bool IsActive { get; init; }
    public DateTime? AuthorizationDate { get; init; }
    public string? WebsiteUrl { get; init; }
}

public record AforeValidationResult
{
    public bool IsValid { get; init; }
    public string? Key { get; init; }
    public string? Name { get; init; }
    public string? ErrorMessage { get; init; }
}

// ========================================
// DTOs para Tablas Actuariales
// ========================================

public record ActuarialFactors
{
    public int Age { get; init; }
    public string Gender { get; init; } = string.Empty;
    public string TableType { get; init; } = string.Empty;
    public decimal MortalityRate { get; init; } // qx
    public decimal SurvivalRate { get; init; }  // px = 1 - qx
    public decimal? LifeExpectancy { get; init; }
    public decimal? AnnuityFactor { get; init; }
    public decimal? PensionFactor { get; init; }
}
