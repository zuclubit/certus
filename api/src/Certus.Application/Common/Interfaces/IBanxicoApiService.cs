namespace Certus.Application.Common.Interfaces;

/// <summary>
/// Interface for BANXICO SIE API Service
/// Provides access to Mexican Central Bank economic indicators
/// API Documentation: https://www.banxico.org.mx/SieAPIRest/
/// </summary>
public interface IBanxicoApiService
{
    #region Exchange Rates

    /// <summary>
    /// Gets the FIX exchange rate (USD/MXN) for a specific date
    /// Series: SF43718
    /// </summary>
    Task<BanxicoExchangeRateResult> GetExchangeRateFixAsync(
        DateTime date,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets exchange rates for multiple currencies
    /// </summary>
    Task<IEnumerable<BanxicoExchangeRateResult>> GetExchangeRatesAsync(
        DateTime date,
        IEnumerable<string> currencies,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets exchange rate time series for a date range
    /// </summary>
    Task<IEnumerable<BanxicoExchangeRateResult>> GetExchangeRateRangeAsync(
        string currency,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    #endregion

    #region Interest Rates (TIIE)

    /// <summary>
    /// Gets TIIE de Fondeo 1D rate (mandatory since 2025)
    /// Series: SF61745
    /// </summary>
    Task<BanxicoInterestRateResult> GetTiieFondeo1DAsync(
        DateTime date,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets TIIE rate for specified term (28, 91, 182 days)
    /// </summary>
    Task<BanxicoInterestRateResult> GetTiieAsync(
        int termDays,
        DateTime date,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all TIIE rates (28, 91, 182 days + Fondeo 1D)
    /// </summary>
    Task<BanxicoTiieRatesResult> GetAllTiieRatesAsync(
        DateTime date,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets TIIE time series for a date range
    /// </summary>
    Task<IEnumerable<BanxicoInterestRateResult>> GetTiieRangeAsync(
        int termDays,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    #endregion

    #region Government Securities (CETES, BONDES, UDIBONOS)

    /// <summary>
    /// Gets CETES rate for specified term
    /// </summary>
    Task<BanxicoSecurityRateResult> GetCetesRateAsync(
        int termDays,
        DateTime date,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all government securities rates
    /// </summary>
    Task<BanxicoGovernmentSecuritiesResult> GetGovernmentSecuritiesAsync(
        DateTime date,
        CancellationToken cancellationToken = default);

    #endregion

    #region UDI and Inflation

    /// <summary>
    /// Gets UDI value for a specific date
    /// Series: SP68257
    /// </summary>
    Task<decimal?> GetUdiValueAsync(
        DateTime date,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets UDI values for a date range
    /// </summary>
    Task<IEnumerable<BanxicoUdiResult>> GetUdiRangeAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets INPC (inflation index) for a specific period
    /// </summary>
    Task<BanxicoInflationResult?> GetInpcAsync(
        int year,
        int month,
        CancellationToken cancellationToken = default);

    #endregion

    #region Generic Series Access

    /// <summary>
    /// Gets data for any series by ID
    /// </summary>
    Task<BanxicoSeriesResult> GetSeriesDataAsync(
        string seriesId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets latest data for any series
    /// </summary>
    Task<BanxicoSeriesResult> GetSeriesLatestAsync(
        string seriesId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets data for multiple series
    /// </summary>
    Task<IEnumerable<BanxicoSeriesResult>> GetMultipleSeriesAsync(
        IEnumerable<string> seriesIds,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    #endregion

    #region Health and Metadata

    /// <summary>
    /// Validates the API token is working
    /// </summary>
    Task<bool> ValidateTokenAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets API rate limit status
    /// </summary>
    Task<BanxicoRateLimitStatus> GetRateLimitStatusAsync(CancellationToken cancellationToken = default);

    #endregion
}

#region Result Models

/// <summary>
/// Exchange rate result from BANXICO
/// </summary>
public record BanxicoExchangeRateResult
{
    public DateTime Date { get; init; }
    public string Currency { get; init; } = "USD";
    public decimal Rate { get; init; }
    public string SeriesId { get; init; } = string.Empty;
    public string? SeriesTitle { get; init; }
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// Interest rate result (TIIE)
/// </summary>
public record BanxicoInterestRateResult
{
    public DateTime Date { get; init; }
    public string RateType { get; init; } = string.Empty;
    public int TermDays { get; init; }
    public decimal Rate { get; init; }
    public string SeriesId { get; init; } = string.Empty;
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// All TIIE rates result
/// </summary>
public record BanxicoTiieRatesResult
{
    public DateTime Date { get; init; }
    public decimal? TiieFondeo1D { get; init; }
    public decimal? Tiie28Days { get; init; }
    public decimal? Tiie91Days { get; init; }
    public decimal? Tiie182Days { get; init; }
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// Government security rate result
/// </summary>
public record BanxicoSecurityRateResult
{
    public DateTime Date { get; init; }
    public string SecurityType { get; init; } = string.Empty;
    public int TermDays { get; init; }
    public decimal Rate { get; init; }
    public string SeriesId { get; init; } = string.Empty;
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// All government securities rates
/// </summary>
public record BanxicoGovernmentSecuritiesResult
{
    public DateTime Date { get; init; }
    public decimal? Cetes28 { get; init; }
    public decimal? Cetes91 { get; init; }
    public decimal? Cetes182 { get; init; }
    public decimal? Cetes364 { get; init; }
    public decimal? BondesD3Y { get; init; }
    public decimal? BondesD5Y { get; init; }
    public decimal? BondM10Y { get; init; }
    public decimal? BondM20Y { get; init; }
    public decimal? BondM30Y { get; init; }
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// UDI value result
/// </summary>
public record BanxicoUdiResult
{
    public DateTime Date { get; init; }
    public decimal Value { get; init; }
    public string SeriesId { get; init; } = "SP68257";
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// Inflation index result
/// </summary>
public record BanxicoInflationResult
{
    public int Year { get; init; }
    public int Month { get; init; }
    public decimal Value { get; init; }
    public decimal? YearOverYearChange { get; init; }
    public string SeriesId { get; init; } = string.Empty;
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// Generic series data result
/// </summary>
public record BanxicoSeriesResult
{
    public string SeriesId { get; init; } = string.Empty;
    public string? Title { get; init; }
    public IReadOnlyList<BanxicoDataPoint> DataPoints { get; init; } = Array.Empty<BanxicoDataPoint>();
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// Single data point in a series
/// </summary>
public record BanxicoDataPoint
{
    public DateTime Date { get; init; }
    public decimal Value { get; init; }
}

/// <summary>
/// Rate limit status
/// </summary>
public record BanxicoRateLimitStatus
{
    public int DailyLimit { get; init; } = 10000;
    public int DailyUsed { get; init; }
    public int DailyRemaining { get; init; }
    public int FiveMinuteLimit { get; init; } = 200;
    public int FiveMinuteUsed { get; init; }
    public int FiveMinuteRemaining { get; init; }
    public DateTime? ResetTime { get; init; }
}

#endregion
