namespace Certus.Application.Common.Interfaces;

/// <summary>
/// Interface for VALMER API Service
/// Provides access to Mexican financial market valuations
/// API Documentation: https://www.valmer.com.mx/api/
///
/// VALMER (Valuación Operativa y Referencias de Mercado) is the official
/// price provider for Mexican financial markets, regulated by CNBV.
/// </summary>
public interface IValmerApiService
{
    #region Price Vector

    /// <summary>
    /// Gets the daily price vector for all instruments
    /// </summary>
    Task<ValmerPriceVectorResult> GetPriceVectorAsync(
        DateTime? date = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets price for a specific instrument
    /// </summary>
    Task<ValmerInstrumentPriceResult?> GetInstrumentPriceAsync(
        string issuer,
        string series,
        DateTime? date = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets prices for multiple instruments
    /// </summary>
    Task<IEnumerable<ValmerInstrumentPriceResult>> GetInstrumentPricesAsync(
        IEnumerable<(string Issuer, string Series)> instruments,
        DateTime? date = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets price history for an instrument
    /// </summary>
    Task<IEnumerable<ValmerInstrumentPriceResult>> GetPriceHistoryAsync(
        string issuer,
        string series,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    #endregion

    #region Yield Curves

    /// <summary>
    /// Gets government yield curve
    /// </summary>
    Task<ValmerYieldCurveResult> GetGovernmentCurveAsync(
        DateTime? date = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets IRS (Interest Rate Swap) curve
    /// </summary>
    Task<ValmerYieldCurveResult> GetIrsCurveAsync(
        DateTime? date = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets TIIE curve
    /// </summary>
    Task<ValmerYieldCurveResult> GetTiieCurveAsync(
        DateTime? date = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets discount factors for a curve
    /// </summary>
    Task<ValmerDiscountFactorsResult> GetDiscountFactorsAsync(
        ValmerCurveType curveType,
        DateTime? date = null,
        CancellationToken cancellationToken = default);

    #endregion

    #region Risk Factors

    /// <summary>
    /// Gets volatility surface for an instrument type
    /// </summary>
    Task<ValmerVolatilitySurfaceResult> GetVolatilitySurfaceAsync(
        ValmerInstrumentType instrumentType,
        DateTime? date = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets correlation matrix
    /// </summary>
    Task<ValmerCorrelationMatrixResult> GetCorrelationMatrixAsync(
        IEnumerable<string> instruments,
        int lookbackDays = 252,
        DateTime? date = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets VaR (Value at Risk) parameters
    /// </summary>
    Task<ValmerVarParametersResult> GetVarParametersAsync(
        DateTime? date = null,
        CancellationToken cancellationToken = default);

    #endregion

    #region Reference Data

    /// <summary>
    /// Gets instrument catalog
    /// </summary>
    Task<IEnumerable<ValmerInstrumentInfo>> GetInstrumentCatalogAsync(
        ValmerInstrumentType? type = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets issuer information
    /// </summary>
    Task<ValmerIssuerInfo?> GetIssuerInfoAsync(
        string issuer,
        CancellationToken cancellationToken = default);

    #endregion

    #region Health

    /// <summary>
    /// Validates API connection and credentials
    /// </summary>
    Task<bool> ValidateConnectionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets latest available date for price vector
    /// </summary>
    Task<DateTime?> GetLatestAvailableDateAsync(CancellationToken cancellationToken = default);

    #endregion
}

#region Enums

/// <summary>
/// VALMER curve types
/// </summary>
public enum ValmerCurveType
{
    /// <summary>Government bonds curve</summary>
    Government,
    /// <summary>Interest Rate Swap curve</summary>
    IRS,
    /// <summary>TIIE curve</summary>
    TIIE,
    /// <summary>TIIE de Fondeo curve</summary>
    TIIEFondeo,
    /// <summary>Corporate curve</summary>
    Corporate,
    /// <summary>UDI (inflation-linked) curve</summary>
    UDI
}

/// <summary>
/// VALMER instrument types
/// </summary>
public enum ValmerInstrumentType
{
    /// <summary>Government debt (CETES, BONDES, etc.)</summary>
    GovernmentDebt,
    /// <summary>Corporate debt</summary>
    CorporateDebt,
    /// <summary>Equity</summary>
    Equity,
    /// <summary>ETF</summary>
    ETF,
    /// <summary>Mutual fund (Fondo de inversión)</summary>
    MutualFund,
    /// <summary>SIEFORE</summary>
    SIEFORE,
    /// <summary>Derivative</summary>
    Derivative,
    /// <summary>Structured product</summary>
    Structured
}

#endregion

#region Result Models

/// <summary>
/// Price vector result containing all daily prices
/// </summary>
public record ValmerPriceVectorResult
{
    public DateTime Date { get; init; }
    public int TotalInstruments { get; init; }
    public IReadOnlyList<ValmerInstrumentPriceResult> Prices { get; init; } = Array.Empty<ValmerInstrumentPriceResult>();
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
    public DateTime? GeneratedAt { get; init; }
}

/// <summary>
/// Individual instrument price
/// </summary>
public record ValmerInstrumentPriceResult
{
    public DateTime Date { get; init; }
    public string MarketType { get; init; } = string.Empty;
    public string Ticker { get; init; } = string.Empty;
    public string Issuer { get; init; } = string.Empty;
    public string Series { get; init; } = string.Empty;
    public decimal DirtyPrice { get; init; }
    public decimal CleanPrice { get; init; }
    public decimal AccruedInterest { get; init; }
    public int? DaysToMaturity { get; init; }
    public decimal? DiscountRate { get; init; }
    public decimal? Yield { get; init; }
    public decimal? Duration { get; init; }
    public decimal? ModifiedDuration { get; init; }
    public decimal? Convexity { get; init; }
    public decimal? Spread { get; init; }
    public string? Currency { get; init; }
    public string? RatingMoodys { get; init; }
    public string? RatingFitch { get; init; }
    public string? RatingSP { get; init; }
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// Yield curve result
/// </summary>
public record ValmerYieldCurveResult
{
    public DateTime Date { get; init; }
    public ValmerCurveType CurveType { get; init; }
    public string CurveName { get; init; } = string.Empty;
    public IReadOnlyList<ValmerCurvePoint> Points { get; init; } = Array.Empty<ValmerCurvePoint>();
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// Single point on a yield curve
/// </summary>
public record ValmerCurvePoint
{
    public int Tenor { get; init; }
    public string TenorUnit { get; init; } = "Days";
    public decimal Rate { get; init; }
    public decimal? DiscountFactor { get; init; }
    public decimal? ForwardRate { get; init; }
}

/// <summary>
/// Discount factors result
/// </summary>
public record ValmerDiscountFactorsResult
{
    public DateTime Date { get; init; }
    public ValmerCurveType CurveType { get; init; }
    public IReadOnlyList<ValmerDiscountFactor> Factors { get; init; } = Array.Empty<ValmerDiscountFactor>();
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// Single discount factor
/// </summary>
public record ValmerDiscountFactor
{
    public DateTime MaturityDate { get; init; }
    public int DaysToMaturity { get; init; }
    public decimal Factor { get; init; }
    public decimal ZeroRate { get; init; }
}

/// <summary>
/// Volatility surface result
/// </summary>
public record ValmerVolatilitySurfaceResult
{
    public DateTime Date { get; init; }
    public ValmerInstrumentType InstrumentType { get; init; }
    public IReadOnlyList<ValmerVolatilityPoint> Surface { get; init; } = Array.Empty<ValmerVolatilityPoint>();
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// Single volatility point
/// </summary>
public record ValmerVolatilityPoint
{
    public int Tenor { get; init; }
    public decimal Strike { get; init; }
    public decimal ImpliedVolatility { get; init; }
}

/// <summary>
/// Correlation matrix result
/// </summary>
public record ValmerCorrelationMatrixResult
{
    public DateTime Date { get; init; }
    public int LookbackDays { get; init; }
    public IReadOnlyList<string> Instruments { get; init; } = Array.Empty<string>();
    public decimal[,]? Matrix { get; init; }
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// VaR parameters result
/// </summary>
public record ValmerVarParametersResult
{
    public DateTime Date { get; init; }
    public int LookbackDays { get; init; }
    public decimal ConfidenceLevel { get; init; }
    public IReadOnlyList<ValmerVarFactor> Factors { get; init; } = Array.Empty<ValmerVarFactor>();
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// VaR factor
/// </summary>
public record ValmerVarFactor
{
    public string FactorName { get; init; } = string.Empty;
    public decimal Volatility { get; init; }
    public decimal VaR95 { get; init; }
    public decimal VaR99 { get; init; }
    public decimal CVaR95 { get; init; }
    public decimal CVaR99 { get; init; }
}

/// <summary>
/// Instrument catalog entry
/// </summary>
public record ValmerInstrumentInfo
{
    public string Ticker { get; init; } = string.Empty;
    public string Issuer { get; init; } = string.Empty;
    public string Series { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public ValmerInstrumentType InstrumentType { get; init; }
    public string Currency { get; init; } = "MXN";
    public DateTime? IssueDate { get; init; }
    public DateTime? MaturityDate { get; init; }
    public decimal? CouponRate { get; init; }
    public string? CouponFrequency { get; init; }
    public bool IsActive { get; init; }
}

/// <summary>
/// Issuer information
/// </summary>
public record ValmerIssuerInfo
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Sector { get; init; }
    public string? Country { get; init; }
    public string? RatingMoodys { get; init; }
    public string? RatingFitch { get; init; }
    public string? RatingSP { get; init; }
    public bool IsActive { get; init; }
}

#endregion
