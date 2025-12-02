using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Certus.Application.Common.Interfaces;
using Certus.Infrastructure.Services.ReferenceData;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Polly;
using Polly.CircuitBreaker;
using Polly.Retry;
using Polly.Timeout;

namespace Certus.Infrastructure.Services.ExternalApis;

/// <summary>
/// Complete implementation of BANXICO SIE API Service
/// Follows Microsoft best practices for resilient HTTP clients
/// API Documentation: https://www.banxico.org.mx/SieAPIRest/
///
/// Features:
/// - Polly retry with exponential backoff and jitter
/// - Circuit breaker for fault tolerance
/// - Memory caching with configurable TTL
/// - Rate limiting awareness
/// - Comprehensive error handling
/// </summary>
public class BanxicoApiService : IBanxicoApiService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<BanxicoApiService> _logger;
    private readonly BanxicoApiOptions _options;

    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;
    private readonly AsyncCircuitBreakerPolicy<HttpResponseMessage> _circuitBreakerPolicy;
    private readonly AsyncTimeoutPolicy _timeoutPolicy;

    private const string BaseUrl = "https://www.banxico.org.mx/SieAPIRest/service/v1";
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    // Rate limiting tracking
    private int _dailyRequestCount;
    private int _fiveMinuteRequestCount;
    private DateTime _dailyResetTime = DateTime.UtcNow.Date.AddDays(1);
    private DateTime _fiveMinuteResetTime = DateTime.UtcNow.AddMinutes(5);
    private readonly SemaphoreSlim _rateLimitSemaphore = new(1, 1);

    public BanxicoApiService(
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache,
        ILogger<BanxicoApiService> logger,
        IOptions<BanxicoApiOptions> options)
    {
        _httpClient = httpClientFactory.CreateClient("BanxicoApi");
        _cache = cache;
        _logger = logger;
        _options = options.Value;

        // Configure retry policy with exponential backoff and jitter
        _retryPolicy = Policy
            .HandleResult<HttpResponseMessage>(r =>
                r.StatusCode == HttpStatusCode.TooManyRequests ||
                r.StatusCode == HttpStatusCode.ServiceUnavailable ||
                r.StatusCode == HttpStatusCode.GatewayTimeout ||
                r.StatusCode == HttpStatusCode.RequestTimeout ||
                (int)r.StatusCode >= 500)
            .Or<HttpRequestException>()
            .Or<TimeoutRejectedException>()
            .WaitAndRetryAsync(
                retryCount: _options.MaxRetries,
                sleepDurationProvider: (retryAttempt, outcome, context) =>
                {
                    // Exponential backoff with jitter
                    var baseDelay = TimeSpan.FromSeconds(Math.Pow(2, retryAttempt));
                    var jitter = TimeSpan.FromMilliseconds(Random.Shared.Next(0, 1000));

                    // If rate limited, use Retry-After header if available
                    if (outcome.Result?.StatusCode == HttpStatusCode.TooManyRequests &&
                        outcome.Result.Headers.RetryAfter?.Delta != null)
                    {
                        return outcome.Result.Headers.RetryAfter.Delta.Value + jitter;
                    }

                    return baseDelay + jitter;
                },
                onRetryAsync: async (outcome, timespan, retryAttempt, context) =>
                {
                    _logger.LogWarning(
                        "BANXICO API retry {RetryAttempt}/{MaxRetries} after {Delay}s. Status: {Status}, Error: {Error}",
                        retryAttempt,
                        _options.MaxRetries,
                        timespan.TotalSeconds,
                        outcome.Result?.StatusCode,
                        outcome.Exception?.Message);

                    await Task.CompletedTask;
                });

        // Configure circuit breaker
        _circuitBreakerPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => (int)r.StatusCode >= 500)
            .Or<HttpRequestException>()
            .Or<TimeoutRejectedException>()
            .CircuitBreakerAsync(
                handledEventsAllowedBeforeBreaking: _options.CircuitBreakerThreshold,
                durationOfBreak: TimeSpan.FromSeconds(_options.CircuitBreakerDurationSeconds),
                onBreak: (outcome, breakDelay) =>
                {
                    _logger.LogError(
                        "BANXICO API circuit breaker OPEN for {Duration}s. Last error: {Error}",
                        breakDelay.TotalSeconds,
                        outcome.Exception?.Message ?? outcome.Result?.StatusCode.ToString());
                },
                onReset: () =>
                {
                    _logger.LogInformation("BANXICO API circuit breaker RESET - normal operation resumed");
                },
                onHalfOpen: () =>
                {
                    _logger.LogInformation("BANXICO API circuit breaker HALF-OPEN - testing connection");
                });

        // Configure timeout policy
        _timeoutPolicy = Policy.TimeoutAsync(
            TimeSpan.FromSeconds(_options.TimeoutSeconds),
            TimeoutStrategy.Optimistic);
    }

    #region Exchange Rates

    public async Task<BanxicoExchangeRateResult> GetExchangeRateFixAsync(
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        return await GetExchangeRateAsync(BanxicoSeriesCatalog.TipoCambioFix, "USD", date, cancellationToken);
    }

    public async Task<IEnumerable<BanxicoExchangeRateResult>> GetExchangeRatesAsync(
        DateTime date,
        IEnumerable<string> currencies,
        CancellationToken cancellationToken = default)
    {
        var results = new List<BanxicoExchangeRateResult>();

        foreach (var currency in currencies)
        {
            if (BanxicoSeriesCatalog.CurrencySeriesMap.TryGetValue(currency.ToUpperInvariant(), out var seriesId))
            {
                var result = await GetExchangeRateAsync(seriesId, currency, date, cancellationToken);
                results.Add(result);
            }
            else
            {
                results.Add(new BanxicoExchangeRateResult
                {
                    Date = date,
                    Currency = currency,
                    IsValid = false,
                    ErrorMessage = $"Currency {currency} not supported"
                });
            }
        }

        return results;
    }

    public async Task<IEnumerable<BanxicoExchangeRateResult>> GetExchangeRateRangeAsync(
        string currency,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        if (!BanxicoSeriesCatalog.CurrencySeriesMap.TryGetValue(currency.ToUpperInvariant(), out var seriesId))
        {
            return new[] { new BanxicoExchangeRateResult
            {
                Currency = currency,
                IsValid = false,
                ErrorMessage = $"Currency {currency} not supported"
            }};
        }

        var seriesResult = await GetSeriesDataAsync(seriesId, startDate, endDate, cancellationToken);

        if (!seriesResult.IsValid)
        {
            return new[] { new BanxicoExchangeRateResult
            {
                Currency = currency,
                SeriesId = seriesId,
                IsValid = false,
                ErrorMessage = seriesResult.ErrorMessage
            }};
        }

        return seriesResult.DataPoints.Select(dp => new BanxicoExchangeRateResult
        {
            Date = dp.Date,
            Currency = currency,
            Rate = dp.Value,
            SeriesId = seriesId,
            SeriesTitle = seriesResult.Title,
            IsValid = true
        });
    }

    private async Task<BanxicoExchangeRateResult> GetExchangeRateAsync(
        string seriesId,
        string currency,
        DateTime date,
        CancellationToken cancellationToken)
    {
        var cacheKey = $"banxico_fx_{currency}_{date:yyyyMMdd}";

        if (_cache.TryGetValue(cacheKey, out BanxicoExchangeRateResult? cached) && cached != null)
        {
            return cached;
        }

        var seriesResult = await GetSeriesDataAsync(seriesId, date, date, cancellationToken);

        var result = new BanxicoExchangeRateResult
        {
            Date = date,
            Currency = currency,
            SeriesId = seriesId,
            SeriesTitle = seriesResult.Title,
            IsValid = seriesResult.IsValid && seriesResult.DataPoints.Any(),
            Rate = seriesResult.DataPoints.FirstOrDefault()?.Value ?? 0,
            ErrorMessage = seriesResult.ErrorMessage
        };

        if (result.IsValid)
        {
            _cache.Set(cacheKey, result, TimeSpan.FromHours(_options.CacheHours));
        }

        return result;
    }

    #endregion

    #region Interest Rates (TIIE)

    public async Task<BanxicoInterestRateResult> GetTiieFondeo1DAsync(
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"banxico_tiie_fondeo_{date:yyyyMMdd}";

        if (_cache.TryGetValue(cacheKey, out BanxicoInterestRateResult? cached) && cached != null)
        {
            return cached;
        }

        var seriesResult = await GetSeriesDataAsync(
            BanxicoSeriesCatalog.TIIEFondeo1D,
            date,
            date,
            cancellationToken);

        var result = new BanxicoInterestRateResult
        {
            Date = date,
            RateType = "TIIE Fondeo 1D",
            TermDays = 1,
            SeriesId = BanxicoSeriesCatalog.TIIEFondeo1D,
            IsValid = seriesResult.IsValid && seriesResult.DataPoints.Any(),
            Rate = seriesResult.DataPoints.FirstOrDefault()?.Value ?? 0,
            ErrorMessage = seriesResult.ErrorMessage
        };

        if (result.IsValid)
        {
            _cache.Set(cacheKey, result, TimeSpan.FromHours(_options.CacheHours));
        }

        return result;
    }

    public async Task<BanxicoInterestRateResult> GetTiieAsync(
        int termDays,
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        var seriesId = termDays switch
        {
            1 => BanxicoSeriesCatalog.TIIEFondeo1D,
            28 => BanxicoSeriesCatalog.TIIE28Dias,
            91 => BanxicoSeriesCatalog.TIIE91Dias,
            182 => BanxicoSeriesCatalog.TIIE182Dias,
            _ => throw new ArgumentException($"Invalid TIIE term: {termDays}. Valid terms: 1, 28, 91, 182", nameof(termDays))
        };

        var cacheKey = $"banxico_tiie_{termDays}_{date:yyyyMMdd}";

        if (_cache.TryGetValue(cacheKey, out BanxicoInterestRateResult? cached) && cached != null)
        {
            return cached;
        }

        var seriesResult = await GetSeriesDataAsync(seriesId, date, date, cancellationToken);

        var result = new BanxicoInterestRateResult
        {
            Date = date,
            RateType = termDays == 1 ? "TIIE Fondeo 1D" : $"TIIE {termDays} días",
            TermDays = termDays,
            SeriesId = seriesId,
            IsValid = seriesResult.IsValid && seriesResult.DataPoints.Any(),
            Rate = seriesResult.DataPoints.FirstOrDefault()?.Value ?? 0,
            ErrorMessage = seriesResult.ErrorMessage
        };

        if (result.IsValid)
        {
            _cache.Set(cacheKey, result, TimeSpan.FromHours(_options.CacheHours));
        }

        return result;
    }

    public async Task<BanxicoTiieRatesResult> GetAllTiieRatesAsync(
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"banxico_tiie_all_{date:yyyyMMdd}";

        if (_cache.TryGetValue(cacheKey, out BanxicoTiieRatesResult? cached) && cached != null)
        {
            return cached;
        }

        // Fetch all TIIE series in a single request
        var seriesIds = new[]
        {
            BanxicoSeriesCatalog.TIIEFondeo1D,
            BanxicoSeriesCatalog.TIIE28Dias,
            BanxicoSeriesCatalog.TIIE91Dias,
            BanxicoSeriesCatalog.TIIE182Dias
        };

        var multiResult = await GetMultipleSeriesAsync(seriesIds, date, date, cancellationToken);
        var resultDict = multiResult.ToDictionary(r => r.SeriesId);

        var result = new BanxicoTiieRatesResult
        {
            Date = date,
            TiieFondeo1D = GetRateFromResult(resultDict, BanxicoSeriesCatalog.TIIEFondeo1D),
            Tiie28Days = GetRateFromResult(resultDict, BanxicoSeriesCatalog.TIIE28Dias),
            Tiie91Days = GetRateFromResult(resultDict, BanxicoSeriesCatalog.TIIE91Dias),
            Tiie182Days = GetRateFromResult(resultDict, BanxicoSeriesCatalog.TIIE182Dias),
            IsValid = resultDict.Values.Any(r => r.IsValid)
        };

        if (result.IsValid)
        {
            _cache.Set(cacheKey, result, TimeSpan.FromHours(_options.CacheHours));
        }

        return result;
    }

    public async Task<IEnumerable<BanxicoInterestRateResult>> GetTiieRangeAsync(
        int termDays,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var seriesId = termDays switch
        {
            1 => BanxicoSeriesCatalog.TIIEFondeo1D,
            28 => BanxicoSeriesCatalog.TIIE28Dias,
            91 => BanxicoSeriesCatalog.TIIE91Dias,
            182 => BanxicoSeriesCatalog.TIIE182Dias,
            _ => throw new ArgumentException($"Invalid TIIE term: {termDays}", nameof(termDays))
        };

        var seriesResult = await GetSeriesDataAsync(seriesId, startDate, endDate, cancellationToken);

        return seriesResult.DataPoints.Select(dp => new BanxicoInterestRateResult
        {
            Date = dp.Date,
            RateType = termDays == 1 ? "TIIE Fondeo 1D" : $"TIIE {termDays} días",
            TermDays = termDays,
            SeriesId = seriesId,
            Rate = dp.Value,
            IsValid = true
        });
    }

    #endregion

    #region Government Securities

    public async Task<BanxicoSecurityRateResult> GetCetesRateAsync(
        int termDays,
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        var seriesId = termDays switch
        {
            28 => BanxicoSeriesCatalog.Cetes28Dias,
            91 => BanxicoSeriesCatalog.Cetes91Dias,
            182 => BanxicoSeriesCatalog.Cetes182Dias,
            364 => BanxicoSeriesCatalog.Cetes364Dias,
            _ => throw new ArgumentException($"Invalid CETES term: {termDays}. Valid terms: 28, 91, 182, 364", nameof(termDays))
        };

        var cacheKey = $"banxico_cetes_{termDays}_{date:yyyyMMdd}";

        if (_cache.TryGetValue(cacheKey, out BanxicoSecurityRateResult? cached) && cached != null)
        {
            return cached;
        }

        var seriesResult = await GetSeriesDataAsync(seriesId, date, date, cancellationToken);

        var result = new BanxicoSecurityRateResult
        {
            Date = date,
            SecurityType = "CETES",
            TermDays = termDays,
            SeriesId = seriesId,
            IsValid = seriesResult.IsValid && seriesResult.DataPoints.Any(),
            Rate = seriesResult.DataPoints.FirstOrDefault()?.Value ?? 0,
            ErrorMessage = seriesResult.ErrorMessage
        };

        if (result.IsValid)
        {
            _cache.Set(cacheKey, result, TimeSpan.FromHours(_options.CacheHours));
        }

        return result;
    }

    public async Task<BanxicoGovernmentSecuritiesResult> GetGovernmentSecuritiesAsync(
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"banxico_gov_sec_{date:yyyyMMdd}";

        if (_cache.TryGetValue(cacheKey, out BanxicoGovernmentSecuritiesResult? cached) && cached != null)
        {
            return cached;
        }

        var seriesIds = new[]
        {
            BanxicoSeriesCatalog.Cetes28Dias,
            BanxicoSeriesCatalog.Cetes91Dias,
            BanxicoSeriesCatalog.Cetes182Dias,
            BanxicoSeriesCatalog.Cetes364Dias
        };

        var multiResult = await GetMultipleSeriesAsync(seriesIds, date, date, cancellationToken);
        var resultDict = multiResult.ToDictionary(r => r.SeriesId);

        var result = new BanxicoGovernmentSecuritiesResult
        {
            Date = date,
            Cetes28 = GetRateFromResult(resultDict, BanxicoSeriesCatalog.Cetes28Dias),
            Cetes91 = GetRateFromResult(resultDict, BanxicoSeriesCatalog.Cetes91Dias),
            Cetes182 = GetRateFromResult(resultDict, BanxicoSeriesCatalog.Cetes182Dias),
            Cetes364 = GetRateFromResult(resultDict, BanxicoSeriesCatalog.Cetes364Dias),
            IsValid = resultDict.Values.Any(r => r.IsValid)
        };

        if (result.IsValid)
        {
            _cache.Set(cacheKey, result, TimeSpan.FromHours(_options.CacheHours));
        }

        return result;
    }

    #endregion

    #region UDI and Inflation

    public async Task<decimal?> GetUdiValueAsync(
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"banxico_udi_{date:yyyyMMdd}";

        if (_cache.TryGetValue(cacheKey, out decimal cachedValue))
        {
            return cachedValue;
        }

        var seriesResult = await GetSeriesDataAsync(
            BanxicoSeriesCatalog.UDI,
            date,
            date,
            cancellationToken);

        if (!seriesResult.IsValid || !seriesResult.DataPoints.Any())
        {
            return null;
        }

        var value = seriesResult.DataPoints.First().Value;
        _cache.Set(cacheKey, value, TimeSpan.FromHours(_options.CacheHours));

        return value;
    }

    public async Task<IEnumerable<BanxicoUdiResult>> GetUdiRangeAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var seriesResult = await GetSeriesDataAsync(
            BanxicoSeriesCatalog.UDI,
            startDate,
            endDate,
            cancellationToken);

        return seriesResult.DataPoints.Select(dp => new BanxicoUdiResult
        {
            Date = dp.Date,
            Value = dp.Value,
            SeriesId = BanxicoSeriesCatalog.UDI,
            IsValid = true
        });
    }

    public async Task<BanxicoInflationResult?> GetInpcAsync(
        int year,
        int month,
        CancellationToken cancellationToken = default)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var seriesResult = await GetSeriesDataAsync(
            BanxicoSeriesCatalog.INPCGeneral,
            startDate,
            endDate,
            cancellationToken);

        if (!seriesResult.IsValid || !seriesResult.DataPoints.Any())
        {
            return null;
        }

        var dataPoint = seriesResult.DataPoints.First();

        return new BanxicoInflationResult
        {
            Year = year,
            Month = month,
            Value = dataPoint.Value,
            SeriesId = BanxicoSeriesCatalog.INPCGeneral,
            IsValid = true
        };
    }

    #endregion

    #region Generic Series Access

    public async Task<BanxicoSeriesResult> GetSeriesDataAsync(
        string seriesId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        await EnforceRateLimitAsync(cancellationToken);

        var url = BuildSeriesUrl(seriesId, startDate, endDate);

        try
        {
            var response = await ExecuteWithResilienceAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return new BanxicoSeriesResult
                {
                    SeriesId = seriesId,
                    IsValid = false,
                    ErrorMessage = $"API returned {response.StatusCode}"
                };
            }

            var apiResponse = await response.Content.ReadFromJsonAsync<BanxicoApiResponse>(
                JsonOptions,
                cancellationToken);

            if (apiResponse?.Bmx?.Series == null || !apiResponse.Bmx.Series.Any())
            {
                return new BanxicoSeriesResult
                {
                    SeriesId = seriesId,
                    IsValid = false,
                    ErrorMessage = "No data returned from API"
                };
            }

            var series = apiResponse.Bmx.Series.First();
            var dataPoints = ParseDataPoints(series.Datos);

            return new BanxicoSeriesResult
            {
                SeriesId = series.IdSerie ?? seriesId,
                Title = series.Titulo,
                DataPoints = dataPoints,
                IsValid = true
            };
        }
        catch (BrokenCircuitException)
        {
            _logger.LogError("BANXICO API circuit breaker is open - service unavailable");
            return new BanxicoSeriesResult
            {
                SeriesId = seriesId,
                IsValid = false,
                ErrorMessage = "Service temporarily unavailable (circuit breaker open)"
            };
        }
        catch (TimeoutRejectedException)
        {
            _logger.LogError("BANXICO API request timed out for series {SeriesId}", seriesId);
            return new BanxicoSeriesResult
            {
                SeriesId = seriesId,
                IsValid = false,
                ErrorMessage = "Request timed out"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching BANXICO series {SeriesId}", seriesId);
            return new BanxicoSeriesResult
            {
                SeriesId = seriesId,
                IsValid = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<BanxicoSeriesResult> GetSeriesLatestAsync(
        string seriesId,
        CancellationToken cancellationToken = default)
    {
        await EnforceRateLimitAsync(cancellationToken);

        var url = $"{BaseUrl}/series/{seriesId}/datos/oportuno";

        try
        {
            var response = await ExecuteWithResilienceAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return new BanxicoSeriesResult
                {
                    SeriesId = seriesId,
                    IsValid = false,
                    ErrorMessage = $"API returned {response.StatusCode}"
                };
            }

            var apiResponse = await response.Content.ReadFromJsonAsync<BanxicoApiResponse>(
                JsonOptions,
                cancellationToken);

            if (apiResponse?.Bmx?.Series == null || !apiResponse.Bmx.Series.Any())
            {
                return new BanxicoSeriesResult
                {
                    SeriesId = seriesId,
                    IsValid = false,
                    ErrorMessage = "No data returned from API"
                };
            }

            var series = apiResponse.Bmx.Series.First();
            var dataPoints = ParseDataPoints(series.Datos);

            return new BanxicoSeriesResult
            {
                SeriesId = series.IdSerie ?? seriesId,
                Title = series.Titulo,
                DataPoints = dataPoints,
                IsValid = true
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching latest BANXICO series {SeriesId}", seriesId);
            return new BanxicoSeriesResult
            {
                SeriesId = seriesId,
                IsValid = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<IEnumerable<BanxicoSeriesResult>> GetMultipleSeriesAsync(
        IEnumerable<string> seriesIds,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var seriesList = seriesIds.ToList();

        // BANXICO API supports up to 20 series per request
        if (seriesList.Count > 20)
        {
            var results = new List<BanxicoSeriesResult>();
            foreach (var batch in seriesList.Chunk(20))
            {
                var batchResults = await GetMultipleSeriesBatchAsync(batch, startDate, endDate, cancellationToken);
                results.AddRange(batchResults);
            }
            return results;
        }

        return await GetMultipleSeriesBatchAsync(seriesList, startDate, endDate, cancellationToken);
    }

    private async Task<IEnumerable<BanxicoSeriesResult>> GetMultipleSeriesBatchAsync(
        IEnumerable<string> seriesIds,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken cancellationToken)
    {
        await EnforceRateLimitAsync(cancellationToken);

        var seriesParam = string.Join(",", seriesIds);
        var url = BuildSeriesUrl(seriesParam, startDate, endDate);

        try
        {
            var response = await ExecuteWithResilienceAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return seriesIds.Select(id => new BanxicoSeriesResult
                {
                    SeriesId = id,
                    IsValid = false,
                    ErrorMessage = $"API returned {response.StatusCode}"
                });
            }

            var apiResponse = await response.Content.ReadFromJsonAsync<BanxicoApiResponse>(
                JsonOptions,
                cancellationToken);

            if (apiResponse?.Bmx?.Series == null)
            {
                return seriesIds.Select(id => new BanxicoSeriesResult
                {
                    SeriesId = id,
                    IsValid = false,
                    ErrorMessage = "No data returned from API"
                });
            }

            return apiResponse.Bmx.Series.Select(series => new BanxicoSeriesResult
            {
                SeriesId = series.IdSerie ?? string.Empty,
                Title = series.Titulo,
                DataPoints = ParseDataPoints(series.Datos),
                IsValid = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching multiple BANXICO series");
            return seriesIds.Select(id => new BanxicoSeriesResult
            {
                SeriesId = id,
                IsValid = false,
                ErrorMessage = ex.Message
            });
        }
    }

    #endregion

    #region Health and Metadata

    public async Task<bool> ValidateTokenAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            // Try to fetch a known series to validate token
            var result = await GetSeriesLatestAsync(BanxicoSeriesCatalog.TipoCambioFix, cancellationToken);
            return result.IsValid;
        }
        catch
        {
            return false;
        }
    }

    public Task<BanxicoRateLimitStatus> GetRateLimitStatusAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new BanxicoRateLimitStatus
        {
            DailyLimit = 10000,
            DailyUsed = _dailyRequestCount,
            DailyRemaining = Math.Max(0, 10000 - _dailyRequestCount),
            FiveMinuteLimit = 200,
            FiveMinuteUsed = _fiveMinuteRequestCount,
            FiveMinuteRemaining = Math.Max(0, 200 - _fiveMinuteRequestCount),
            ResetTime = _fiveMinuteResetTime
        });
    }

    #endregion

    #region Private Helper Methods

    private async Task<HttpResponseMessage> ExecuteWithResilienceAsync(
        string url,
        CancellationToken cancellationToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("Bmx-Token", _options.Token);
        request.Headers.Add("Accept", "application/json");

        return await _circuitBreakerPolicy.ExecuteAsync(async () =>
            await _retryPolicy.ExecuteAsync(async () =>
                await _timeoutPolicy.ExecuteAsync(async ct =>
                    await _httpClient.SendAsync(request, ct), cancellationToken)));
    }

    private string BuildSeriesUrl(string seriesId, DateTime? startDate, DateTime? endDate)
    {
        if (startDate.HasValue && endDate.HasValue)
        {
            return $"{BaseUrl}/series/{seriesId}/datos/{startDate:yyyy-MM-dd}/{endDate:yyyy-MM-dd}";
        }

        return $"{BaseUrl}/series/{seriesId}/datos";
    }

    private static IReadOnlyList<BanxicoDataPoint> ParseDataPoints(List<BanxicoDatoResponse>? datos)
    {
        if (datos == null || !datos.Any())
        {
            return Array.Empty<BanxicoDataPoint>();
        }

        var dataPoints = new List<BanxicoDataPoint>();

        foreach (var dato in datos)
        {
            if (DateTime.TryParseExact(
                    dato.Fecha,
                    "dd/MM/yyyy",
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out var date) &&
                decimal.TryParse(
                    dato.Dato,
                    NumberStyles.Any,
                    CultureInfo.InvariantCulture,
                    out var value))
            {
                dataPoints.Add(new BanxicoDataPoint
                {
                    Date = date,
                    Value = value
                });
            }
        }

        return dataPoints;
    }

    private static decimal? GetRateFromResult(
        Dictionary<string, BanxicoSeriesResult> results,
        string seriesId)
    {
        if (results.TryGetValue(seriesId, out var result) &&
            result.IsValid &&
            result.DataPoints.Any())
        {
            return result.DataPoints.First().Value;
        }

        return null;
    }

    private async Task EnforceRateLimitAsync(CancellationToken cancellationToken)
    {
        await _rateLimitSemaphore.WaitAsync(cancellationToken);

        try
        {
            var now = DateTime.UtcNow;

            // Reset daily counter
            if (now >= _dailyResetTime)
            {
                _dailyRequestCount = 0;
                _dailyResetTime = now.Date.AddDays(1);
            }

            // Reset 5-minute counter
            if (now >= _fiveMinuteResetTime)
            {
                _fiveMinuteRequestCount = 0;
                _fiveMinuteResetTime = now.AddMinutes(5);
            }

            // Check limits
            if (_dailyRequestCount >= 10000)
            {
                throw new InvalidOperationException("BANXICO API daily limit (10,000) exceeded");
            }

            if (_fiveMinuteRequestCount >= 200)
            {
                var waitTime = _fiveMinuteResetTime - now;
                _logger.LogWarning("BANXICO API 5-minute limit reached. Waiting {WaitTime}s", waitTime.TotalSeconds);
                await Task.Delay(waitTime, cancellationToken);
                _fiveMinuteRequestCount = 0;
                _fiveMinuteResetTime = DateTime.UtcNow.AddMinutes(5);
            }

            _dailyRequestCount++;
            _fiveMinuteRequestCount++;
        }
        finally
        {
            _rateLimitSemaphore.Release();
        }
    }

    #endregion
}

#region Configuration

/// <summary>
/// Configuration options for BANXICO API
/// </summary>
public class BanxicoApiOptions
{
    public const string SectionName = "BanxicoApi";

    /// <summary>
    /// API token obtained from BANXICO
    /// Get yours at: https://www.banxico.org.mx/SieAPIRest/service/v1/token
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Cache duration in hours (default: 24)
    /// </summary>
    public int CacheHours { get; set; } = 24;

    /// <summary>
    /// Request timeout in seconds (default: 30)
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Maximum retry attempts (default: 3)
    /// </summary>
    public int MaxRetries { get; set; } = 3;

    /// <summary>
    /// Circuit breaker threshold (default: 5 failures)
    /// </summary>
    public int CircuitBreakerThreshold { get; set; } = 5;

    /// <summary>
    /// Circuit breaker duration in seconds (default: 60)
    /// </summary>
    public int CircuitBreakerDurationSeconds { get; set; } = 60;
}

#endregion

#region API Response Models

internal class BanxicoApiResponse
{
    public BanxicoBmxResponse? Bmx { get; set; }
}

internal class BanxicoBmxResponse
{
    public List<BanxicoSeriesResponse>? Series { get; set; }
}

internal class BanxicoSeriesResponse
{
    public string? IdSerie { get; set; }
    public string? Titulo { get; set; }
    public List<BanxicoDatoResponse>? Datos { get; set; }
}

internal class BanxicoDatoResponse
{
    public string? Fecha { get; set; }
    public string? Dato { get; set; }
}

#endregion
