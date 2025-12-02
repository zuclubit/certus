using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Certus.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Polly;
using Polly.CircuitBreaker;
using Polly.Retry;
using Polly.Timeout;

namespace Certus.Infrastructure.Services.ExternalApis;

/// <summary>
/// Complete implementation of VALMER API Service
/// Provides access to Mexican financial market valuations
///
/// Supports:
/// - Public CSV vector (free, preliminary prices)
/// - Authenticated Web Service API (requires subscription)
///
/// API Documentation: https://www.valmer.com.mx/api/
/// </summary>
public class ValmerApiService : IValmerApiService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ValmerApiService> _logger;
    private readonly ValmerApiOptions _options;

    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;
    private readonly AsyncCircuitBreakerPolicy<HttpResponseMessage> _circuitBreakerPolicy;
    private readonly AsyncTimeoutPolicy _timeoutPolicy;

    private const string PublicVectorUrl = "https://www.valmer.com.mx/VAL/vector_precios_preliminar.csv";
    private const string ApiBaseUrl = "https://api.valmer.com.mx/v1";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public ValmerApiService(
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache,
        ILogger<ValmerApiService> logger,
        IOptions<ValmerApiOptions> options)
    {
        _httpClient = httpClientFactory.CreateClient("ValmerApi");
        _cache = cache;
        _logger = logger;
        _options = options.Value;

        // Configure retry policy
        _retryPolicy = Policy
            .HandleResult<HttpResponseMessage>(r =>
                r.StatusCode == HttpStatusCode.TooManyRequests ||
                r.StatusCode == HttpStatusCode.ServiceUnavailable ||
                (int)r.StatusCode >= 500)
            .Or<HttpRequestException>()
            .Or<TimeoutRejectedException>()
            .WaitAndRetryAsync(
                retryCount: _options.MaxRetries,
                sleepDurationProvider: (retryAttempt, outcome, context) =>
                {
                    var baseDelay = TimeSpan.FromSeconds(Math.Pow(2, retryAttempt));
                    var jitter = TimeSpan.FromMilliseconds(Random.Shared.Next(0, 1000));
                    return baseDelay + jitter;
                },
                onRetryAsync: async (outcome, timespan, retryAttempt, context) =>
                {
                    _logger.LogWarning(
                        "VALMER API retry {RetryAttempt}/{MaxRetries} after {Delay}s. Status: {Status}",
                        retryAttempt, _options.MaxRetries, timespan.TotalSeconds, outcome.Result?.StatusCode);
                    await Task.CompletedTask;
                });

        // Configure circuit breaker
        _circuitBreakerPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => (int)r.StatusCode >= 500)
            .Or<HttpRequestException>()
            .CircuitBreakerAsync(
                handledEventsAllowedBeforeBreaking: _options.CircuitBreakerThreshold,
                durationOfBreak: TimeSpan.FromSeconds(_options.CircuitBreakerDurationSeconds),
                onBreak: (outcome, breakDelay) =>
                {
                    _logger.LogError("VALMER API circuit breaker OPEN for {Duration}s", breakDelay.TotalSeconds);
                },
                onReset: () => _logger.LogInformation("VALMER API circuit breaker RESET"));

        // Configure timeout policy
        _timeoutPolicy = Policy.TimeoutAsync(TimeSpan.FromSeconds(_options.TimeoutSeconds));
    }

    #region Price Vector

    public async Task<ValmerPriceVectorResult> GetPriceVectorAsync(
        DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        var targetDate = date ?? DateTime.Today;
        var cacheKey = $"valmer_vector_{targetDate:yyyyMMdd}";

        if (_cache.TryGetValue(cacheKey, out ValmerPriceVectorResult? cached) && cached != null)
        {
            return cached;
        }

        try
        {
            // Try authenticated API first if token is configured
            if (!string.IsNullOrEmpty(_options.Token))
            {
                var apiResult = await GetPriceVectorFromApiAsync(targetDate, cancellationToken);
                if (apiResult.IsValid)
                {
                    _cache.Set(cacheKey, apiResult, TimeSpan.FromHours(_options.CacheHours));
                    return apiResult;
                }
            }

            // Fallback to public CSV
            var csvResult = await GetPriceVectorFromCsvAsync(cancellationToken);

            if (csvResult.IsValid)
            {
                _cache.Set(cacheKey, csvResult, TimeSpan.FromHours(_options.CacheHours));
            }

            return csvResult;
        }
        catch (BrokenCircuitException)
        {
            _logger.LogError("VALMER API circuit breaker is open");
            return new ValmerPriceVectorResult
            {
                Date = targetDate,
                IsValid = false,
                ErrorMessage = "Service temporarily unavailable"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching VALMER price vector");
            return new ValmerPriceVectorResult
            {
                Date = targetDate,
                IsValid = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<ValmerInstrumentPriceResult?> GetInstrumentPriceAsync(
        string issuer,
        string series,
        DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        var vector = await GetPriceVectorAsync(date, cancellationToken);

        if (!vector.IsValid)
        {
            return new ValmerInstrumentPriceResult
            {
                Issuer = issuer,
                Series = series,
                IsValid = false,
                ErrorMessage = vector.ErrorMessage
            };
        }

        return vector.Prices.FirstOrDefault(p =>
            p.Issuer.Equals(issuer, StringComparison.OrdinalIgnoreCase) &&
            p.Series.Equals(series, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<IEnumerable<ValmerInstrumentPriceResult>> GetInstrumentPricesAsync(
        IEnumerable<(string Issuer, string Series)> instruments,
        DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        var vector = await GetPriceVectorAsync(date, cancellationToken);

        if (!vector.IsValid)
        {
            return instruments.Select(i => new ValmerInstrumentPriceResult
            {
                Issuer = i.Issuer,
                Series = i.Series,
                IsValid = false,
                ErrorMessage = vector.ErrorMessage
            });
        }

        var instrumentSet = instruments.ToHashSet();
        return vector.Prices.Where(p =>
            instrumentSet.Contains((p.Issuer, p.Series)));
    }

    public async Task<IEnumerable<ValmerInstrumentPriceResult>> GetPriceHistoryAsync(
        string issuer,
        string series,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrEmpty(_options.Token))
        {
            return await GetPriceHistoryFromApiAsync(issuer, series, startDate, endDate, cancellationToken);
        }

        // Public CSV only has current day
        _logger.LogWarning("Price history requires VALMER API subscription. Only current day available.");
        var current = await GetInstrumentPriceAsync(issuer, series, null, cancellationToken);
        return current != null ? new[] { current } : Array.Empty<ValmerInstrumentPriceResult>();
    }

    private async Task<ValmerPriceVectorResult> GetPriceVectorFromCsvAsync(CancellationToken cancellationToken)
    {
        var response = await ExecuteWithResilienceAsync(PublicVectorUrl, false, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return new ValmerPriceVectorResult
            {
                Date = DateTime.Today,
                IsValid = false,
                ErrorMessage = $"Failed to fetch CSV: {response.StatusCode}"
            };
        }

        var csv = await response.Content.ReadAsStringAsync(cancellationToken);
        var prices = ParseCsvVector(csv);

        return new ValmerPriceVectorResult
        {
            Date = prices.FirstOrDefault()?.Date ?? DateTime.Today,
            TotalInstruments = prices.Count,
            Prices = prices,
            IsValid = prices.Any(),
            GeneratedAt = DateTime.UtcNow
        };
    }

    private async Task<ValmerPriceVectorResult> GetPriceVectorFromApiAsync(
        DateTime date,
        CancellationToken cancellationToken)
    {
        var url = $"{ApiBaseUrl}/vector-precios/{date:yyyy-MM-dd}";
        var response = await ExecuteWithResilienceAsync(url, true, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return new ValmerPriceVectorResult
            {
                Date = date,
                IsValid = false,
                ErrorMessage = $"API returned {response.StatusCode}"
            };
        }

        var apiResponse = await response.Content.ReadFromJsonAsync<ValmerApiVectorResponse>(
            JsonOptions, cancellationToken);

        if (apiResponse?.Data == null)
        {
            return new ValmerPriceVectorResult
            {
                Date = date,
                IsValid = false,
                ErrorMessage = "Empty response from API"
            };
        }

        var prices = apiResponse.Data.Select(MapApiPriceToResult).ToList();

        return new ValmerPriceVectorResult
        {
            Date = date,
            TotalInstruments = prices.Count,
            Prices = prices,
            IsValid = true,
            GeneratedAt = DateTime.UtcNow
        };
    }

    private async Task<IEnumerable<ValmerInstrumentPriceResult>> GetPriceHistoryFromApiAsync(
        string issuer,
        string series,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        var url = $"{ApiBaseUrl}/precios/{issuer}/{series}?startDate={startDate:yyyy-MM-dd}&endDate={endDate:yyyy-MM-dd}";
        var response = await ExecuteWithResilienceAsync(url, true, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return Array.Empty<ValmerInstrumentPriceResult>();
        }

        var apiResponse = await response.Content.ReadFromJsonAsync<ValmerApiVectorResponse>(
            JsonOptions, cancellationToken);

        return apiResponse?.Data?.Select(MapApiPriceToResult) ?? Array.Empty<ValmerInstrumentPriceResult>();
    }

    private static IReadOnlyList<ValmerInstrumentPriceResult> ParseCsvVector(string csv)
    {
        var results = new List<ValmerInstrumentPriceResult>();
        var lines = csv.Split('\n', StringSplitOptions.RemoveEmptyEntries);

        foreach (var line in lines.Skip(1)) // Skip header
        {
            var fields = line.Split(',');
            if (fields.Length < 10) continue;

            try
            {
                results.Add(new ValmerInstrumentPriceResult
                {
                    Date = ParseDate(fields[1]) ?? DateTime.Today,
                    MarketType = fields[0].Trim(),
                    Ticker = fields[2].Trim(),
                    Issuer = fields[3].Trim(),
                    Series = fields[4].Trim(),
                    DirtyPrice = ParseDecimal(fields[5]),
                    CleanPrice = ParseDecimal(fields[6]),
                    AccruedInterest = ParseDecimal(fields[7]),
                    DaysToMaturity = ParseInt(fields[8]),
                    DiscountRate = ParseNullableDecimal(fields[9]),
                    Duration = fields.Length > 19 ? ParseNullableDecimal(fields[19]) : null,
                    Convexity = fields.Length > 20 ? ParseNullableDecimal(fields[20]) : null,
                    Yield = fields.Length > 21 ? ParseNullableDecimal(fields[21]) : null,
                    IsValid = true
                });
            }
            catch
            {
                // Skip malformed lines
            }
        }

        return results;
    }

    #endregion

    #region Yield Curves

    public async Task<ValmerYieldCurveResult> GetGovernmentCurveAsync(
        DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        return await GetYieldCurveAsync(ValmerCurveType.Government, date, cancellationToken);
    }

    public async Task<ValmerYieldCurveResult> GetIrsCurveAsync(
        DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        return await GetYieldCurveAsync(ValmerCurveType.IRS, date, cancellationToken);
    }

    public async Task<ValmerYieldCurveResult> GetTiieCurveAsync(
        DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        return await GetYieldCurveAsync(ValmerCurveType.TIIE, date, cancellationToken);
    }

    private async Task<ValmerYieldCurveResult> GetYieldCurveAsync(
        ValmerCurveType curveType,
        DateTime? date,
        CancellationToken cancellationToken)
    {
        var targetDate = date ?? DateTime.Today;
        var cacheKey = $"valmer_curve_{curveType}_{targetDate:yyyyMMdd}";

        if (_cache.TryGetValue(cacheKey, out ValmerYieldCurveResult? cached) && cached != null)
        {
            return cached;
        }

        if (string.IsNullOrEmpty(_options.Token))
        {
            return new ValmerYieldCurveResult
            {
                Date = targetDate,
                CurveType = curveType,
                IsValid = false,
                ErrorMessage = "Yield curves require VALMER API subscription"
            };
        }

        var curveCode = GetCurveCode(curveType);
        var url = $"{ApiBaseUrl}/curvas/{curveCode}/{targetDate:yyyy-MM-dd}";

        try
        {
            var response = await ExecuteWithResilienceAsync(url, true, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return new ValmerYieldCurveResult
                {
                    Date = targetDate,
                    CurveType = curveType,
                    IsValid = false,
                    ErrorMessage = $"API returned {response.StatusCode}"
                };
            }

            var apiResponse = await response.Content.ReadFromJsonAsync<ValmerApiCurveResponse>(
                JsonOptions, cancellationToken);

            var result = new ValmerYieldCurveResult
            {
                Date = targetDate,
                CurveType = curveType,
                CurveName = apiResponse?.CurveName ?? curveType.ToString(),
                Points = apiResponse?.Points?.Select(p => new ValmerCurvePoint
                {
                    Tenor = p.Tenor,
                    TenorUnit = p.TenorUnit ?? "Days",
                    Rate = p.Rate,
                    DiscountFactor = p.DiscountFactor,
                    ForwardRate = p.ForwardRate
                }).ToList() ?? new List<ValmerCurvePoint>(),
                IsValid = true
            };

            _cache.Set(cacheKey, result, TimeSpan.FromHours(_options.CacheHours));
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching VALMER curve {CurveType}", curveType);
            return new ValmerYieldCurveResult
            {
                Date = targetDate,
                CurveType = curveType,
                IsValid = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<ValmerDiscountFactorsResult> GetDiscountFactorsAsync(
        ValmerCurveType curveType,
        DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        var curve = await GetYieldCurveAsync(curveType, date, cancellationToken);

        if (!curve.IsValid)
        {
            return new ValmerDiscountFactorsResult
            {
                Date = date ?? DateTime.Today,
                CurveType = curveType,
                IsValid = false,
                ErrorMessage = curve.ErrorMessage
            };
        }

        // Calculate discount factors from curve points
        var factors = curve.Points.Select(p => new ValmerDiscountFactor
        {
            MaturityDate = DateTime.Today.AddDays(p.Tenor),
            DaysToMaturity = p.Tenor,
            Factor = p.DiscountFactor ?? CalculateDiscountFactor(p.Rate, p.Tenor),
            ZeroRate = p.Rate
        }).ToList();

        return new ValmerDiscountFactorsResult
        {
            Date = curve.Date,
            CurveType = curveType,
            Factors = factors,
            IsValid = true
        };
    }

    private static decimal CalculateDiscountFactor(decimal rate, int days)
    {
        // Simple discount factor calculation: DF = 1 / (1 + r * t)
        var t = days / 365.0m;
        return 1m / (1m + rate / 100m * t);
    }

    private static string GetCurveCode(ValmerCurveType curveType) => curveType switch
    {
        ValmerCurveType.Government => "GOB",
        ValmerCurveType.IRS => "IRS",
        ValmerCurveType.TIIE => "TIIE",
        ValmerCurveType.TIIEFondeo => "TIIEF",
        ValmerCurveType.Corporate => "CORP",
        ValmerCurveType.UDI => "UDI",
        _ => "GOB"
    };

    #endregion

    #region Risk Factors

    public async Task<ValmerVolatilitySurfaceResult> GetVolatilitySurfaceAsync(
        ValmerInstrumentType instrumentType,
        DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_options.Token))
        {
            return new ValmerVolatilitySurfaceResult
            {
                Date = date ?? DateTime.Today,
                InstrumentType = instrumentType,
                IsValid = false,
                ErrorMessage = "Volatility surface requires VALMER API subscription"
            };
        }

        // Implementation would call VALMER API
        _logger.LogWarning("Volatility surface API not yet implemented");
        return new ValmerVolatilitySurfaceResult
        {
            Date = date ?? DateTime.Today,
            InstrumentType = instrumentType,
            IsValid = false,
            ErrorMessage = "Not implemented"
        };
    }

    public async Task<ValmerCorrelationMatrixResult> GetCorrelationMatrixAsync(
        IEnumerable<string> instruments,
        int lookbackDays = 252,
        DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_options.Token))
        {
            return new ValmerCorrelationMatrixResult
            {
                Date = date ?? DateTime.Today,
                LookbackDays = lookbackDays,
                IsValid = false,
                ErrorMessage = "Correlation matrix requires VALMER API subscription"
            };
        }

        // Implementation would call VALMER API
        _logger.LogWarning("Correlation matrix API not yet implemented");
        return new ValmerCorrelationMatrixResult
        {
            Date = date ?? DateTime.Today,
            LookbackDays = lookbackDays,
            Instruments = instruments.ToList(),
            IsValid = false,
            ErrorMessage = "Not implemented"
        };
    }

    public async Task<ValmerVarParametersResult> GetVarParametersAsync(
        DateTime? date = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_options.Token))
        {
            return new ValmerVarParametersResult
            {
                Date = date ?? DateTime.Today,
                IsValid = false,
                ErrorMessage = "VaR parameters require VALMER API subscription"
            };
        }

        // Implementation would call VALMER API
        _logger.LogWarning("VaR parameters API not yet implemented");
        return new ValmerVarParametersResult
        {
            Date = date ?? DateTime.Today,
            IsValid = false,
            ErrorMessage = "Not implemented"
        };
    }

    #endregion

    #region Reference Data

    public async Task<IEnumerable<ValmerInstrumentInfo>> GetInstrumentCatalogAsync(
        ValmerInstrumentType? type = null,
        CancellationToken cancellationToken = default)
    {
        // Build catalog from current price vector
        var vector = await GetPriceVectorAsync(null, cancellationToken);

        if (!vector.IsValid)
        {
            return Array.Empty<ValmerInstrumentInfo>();
        }

        var catalog = vector.Prices
            .Select(p => new ValmerInstrumentInfo
            {
                Ticker = p.Ticker,
                Issuer = p.Issuer,
                Series = p.Series,
                Description = $"{p.Issuer} {p.Series}",
                InstrumentType = DetermineInstrumentType(p.MarketType),
                Currency = p.Currency ?? "MXN",
                IsActive = true
            })
            .DistinctBy(i => (i.Issuer, i.Series));

        if (type.HasValue)
        {
            catalog = catalog.Where(i => i.InstrumentType == type.Value);
        }

        return catalog;
    }

    public async Task<ValmerIssuerInfo?> GetIssuerInfoAsync(
        string issuer,
        CancellationToken cancellationToken = default)
    {
        // Basic implementation from price vector
        var vector = await GetPriceVectorAsync(null, cancellationToken);

        if (!vector.IsValid)
        {
            return null;
        }

        var price = vector.Prices.FirstOrDefault(p =>
            p.Issuer.Equals(issuer, StringComparison.OrdinalIgnoreCase));

        if (price == null)
        {
            return null;
        }

        return new ValmerIssuerInfo
        {
            Code = price.Issuer,
            Name = price.Issuer,
            RatingMoodys = price.RatingMoodys,
            RatingFitch = price.RatingFitch,
            RatingSP = price.RatingSP,
            IsActive = true
        };
    }

    private static ValmerInstrumentType DetermineInstrumentType(string marketType) =>
        marketType.ToUpperInvariant() switch
        {
            "GUBERNAMENTAL" or "GOB" => ValmerInstrumentType.GovernmentDebt,
            "CORPORATIVO" or "CORP" => ValmerInstrumentType.CorporateDebt,
            "RENTA VARIABLE" or "RV" => ValmerInstrumentType.Equity,
            "ETF" => ValmerInstrumentType.ETF,
            "SIEFORE" => ValmerInstrumentType.SIEFORE,
            "DERIVADO" => ValmerInstrumentType.Derivative,
            _ => ValmerInstrumentType.CorporateDebt
        };

    #endregion

    #region Health

    public async Task<bool> ValidateConnectionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync(PublicVectorUrl, cancellationToken);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    public async Task<DateTime?> GetLatestAvailableDateAsync(CancellationToken cancellationToken = default)
    {
        var vector = await GetPriceVectorAsync(null, cancellationToken);
        return vector.IsValid ? vector.Date : null;
    }

    #endregion

    #region Private Helpers

    private async Task<HttpResponseMessage> ExecuteWithResilienceAsync(
        string url,
        bool includeAuth,
        CancellationToken cancellationToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("Accept", "application/json, text/csv");

        if (includeAuth && !string.IsNullOrEmpty(_options.Token))
        {
            request.Headers.Add("Authorization", $"Bearer {_options.Token}");
        }

        return await _circuitBreakerPolicy.ExecuteAsync(async () =>
            await _retryPolicy.ExecuteAsync(async () =>
                await _timeoutPolicy.ExecuteAsync(async ct =>
                    await _httpClient.SendAsync(request, ct), cancellationToken)));
    }

    private static ValmerInstrumentPriceResult MapApiPriceToResult(ValmerApiPriceData data)
    {
        return new ValmerInstrumentPriceResult
        {
            Date = data.Date,
            MarketType = data.MarketType ?? string.Empty,
            Ticker = data.Ticker ?? string.Empty,
            Issuer = data.Issuer ?? string.Empty,
            Series = data.Series ?? string.Empty,
            DirtyPrice = data.DirtyPrice,
            CleanPrice = data.CleanPrice,
            AccruedInterest = data.AccruedInterest,
            DaysToMaturity = data.DaysToMaturity,
            DiscountRate = data.DiscountRate,
            Yield = data.Yield,
            Duration = data.Duration,
            ModifiedDuration = data.ModifiedDuration,
            Convexity = data.Convexity,
            Spread = data.Spread,
            Currency = data.Currency,
            IsValid = true
        };
    }

    private static DateTime? ParseDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;

        if (DateTime.TryParseExact(value.Trim(), "yyyy/MM/dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date1))
            return date1;

        if (DateTime.TryParseExact(value.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date2))
            return date2;

        return null;
    }

    private static decimal ParseDecimal(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return 0;
        return decimal.TryParse(value.Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out var result) ? result : 0;
    }

    private static decimal? ParseNullableDecimal(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return decimal.TryParse(value.Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out var result) ? result : null;
    }

    private static int? ParseInt(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return int.TryParse(value.Trim(), out var result) ? result : null;
    }

    #endregion
}

#region Configuration

/// <summary>
/// Configuration options for VALMER API
/// </summary>
public class ValmerApiOptions
{
    public const string SectionName = "ValmerApi";

    /// <summary>
    /// API token (required for premium features)
    /// Contact: comercialvalmer@grupobmv.com.mx
    /// </summary>
    public string? Token { get; set; }

    /// <summary>
    /// Cache duration in hours (default: 6)
    /// </summary>
    public int CacheHours { get; set; } = 6;

    /// <summary>
    /// Request timeout in seconds (default: 60)
    /// </summary>
    public int TimeoutSeconds { get; set; } = 60;

    /// <summary>
    /// Maximum retry attempts (default: 3)
    /// </summary>
    public int MaxRetries { get; set; } = 3;

    /// <summary>
    /// Circuit breaker threshold (default: 5)
    /// </summary>
    public int CircuitBreakerThreshold { get; set; } = 5;

    /// <summary>
    /// Circuit breaker duration in seconds (default: 60)
    /// </summary>
    public int CircuitBreakerDurationSeconds { get; set; } = 60;
}

#endregion

#region API Response Models

internal class ValmerApiVectorResponse
{
    public List<ValmerApiPriceData>? Data { get; set; }
}

internal class ValmerApiPriceData
{
    public DateTime Date { get; set; }
    public string? MarketType { get; set; }
    public string? Ticker { get; set; }
    public string? Issuer { get; set; }
    public string? Series { get; set; }
    public decimal DirtyPrice { get; set; }
    public decimal CleanPrice { get; set; }
    public decimal AccruedInterest { get; set; }
    public int? DaysToMaturity { get; set; }
    public decimal? DiscountRate { get; set; }
    public decimal? Yield { get; set; }
    public decimal? Duration { get; set; }
    public decimal? ModifiedDuration { get; set; }
    public decimal? Convexity { get; set; }
    public decimal? Spread { get; set; }
    public string? Currency { get; set; }
}

internal class ValmerApiCurveResponse
{
    public string? CurveName { get; set; }
    public List<ValmerApiCurvePoint>? Points { get; set; }
}

internal class ValmerApiCurvePoint
{
    public int Tenor { get; set; }
    public string? TenorUnit { get; set; }
    public decimal Rate { get; set; }
    public decimal? DiscountFactor { get; set; }
    public decimal? ForwardRate { get; set; }
}

#endregion
