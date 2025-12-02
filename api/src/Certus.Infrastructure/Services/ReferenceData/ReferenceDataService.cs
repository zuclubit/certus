using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Certus.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Polly;
using Polly.Retry;

namespace Certus.Infrastructure.Services.ReferenceData;

/// <summary>
/// Implementacion del servicio de datos de referencia
/// Integra GLEIF, OpenFIGI, BANXICO, VALMER y catalogos CONSAR
/// </summary>
public class ReferenceDataService : IReferenceDataService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ReferenceDataService> _logger;
    private readonly ReferenceDataOptions _options;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string GleifApiUrl = "https://api.gleif.org/api/v1";
    private const string OpenFigiApiUrl = "https://api.openfigi.com/v3/mapping";
    private const string BanxicoApiUrl = "https://www.banxico.org.mx/SieAPIRest/service/v1";
    private const string ValmerVectorUrl = "https://www.valmer.com.mx/VAL/vector_precios_preliminar.csv";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public ReferenceDataService(
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache,
        ILogger<ReferenceDataService> logger,
        IOptions<ReferenceDataOptions> options)
    {
        _httpClient = httpClientFactory.CreateClient("ReferenceData");
        _cache = cache;
        _logger = logger;
        _options = options.Value;

        _retryPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode && (int)r.StatusCode >= 500)
            .Or<HttpRequestException>()
            .WaitAndRetryAsync(
                3,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (outcome, timespan, retryAttempt, context) =>
                {
                    _logger.LogWarning(
                        "Retry {RetryAttempt} for ReferenceData request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    // ========================================
    // LEI - Legal Entity Identifier (GLEIF)
    // ========================================

    public async Task<LeiValidationResult> ValidateLeiAsync(string lei, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(lei) || lei.Length != 20)
        {
            return new LeiValidationResult
            {
                IsValid = false,
                Lei = lei,
                ErrorMessage = "LEI debe tener exactamente 20 caracteres"
            };
        }

        var cacheKey = $"lei_{lei}";
        if (_cache.TryGetValue(cacheKey, out LeiValidationResult? cachedResult) && cachedResult != null)
        {
            return cachedResult;
        }

        try
        {
            var url = $"{GleifApiUrl}/lei-records/{lei}";
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(url, cancellationToken));

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new LeiValidationResult
                {
                    IsValid = false,
                    Lei = lei,
                    ErrorMessage = "LEI no encontrado en GLEIF"
                };
            }

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadFromJsonAsync<GleifLeiResponse>(JsonOptions, cancellationToken);
            if (json?.Data == null)
            {
                return new LeiValidationResult
                {
                    IsValid = false,
                    Lei = lei,
                    ErrorMessage = "Respuesta invalida de GLEIF"
                };
            }

            var entity = json.Data.Attributes?.Entity;
            var result = new LeiValidationResult
            {
                IsValid = true,
                Lei = json.Data.Attributes?.Lei ?? lei,
                LegalName = entity?.LegalName?.Name,
                Country = entity?.LegalAddress?.Country,
                Jurisdiction = entity?.Jurisdiction,
                EntityStatus = entity?.Status,
                LegalForm = entity?.LegalForm?.Id,
                RegistrationDate = ParseDateTime(entity?.CreationDate),
                LastUpdateDate = ParseDateTime(json.Meta?.GoldenCopy?.PublishDate),
                LegalAddress = entity?.LegalAddress != null ? new LeiAddress
                {
                    AddressLines = string.Join(", ", entity.LegalAddress.AddressLines ?? Array.Empty<string>()),
                    City = entity.LegalAddress.City,
                    Region = entity.LegalAddress.Region,
                    Country = entity.LegalAddress.Country,
                    PostalCode = entity.LegalAddress.PostalCode
                } : null,
                HeadquartersAddress = entity?.HeadquartersAddress != null ? new LeiAddress
                {
                    AddressLines = string.Join(", ", entity.HeadquartersAddress.AddressLines ?? Array.Empty<string>()),
                    City = entity.HeadquartersAddress.City,
                    Region = entity.HeadquartersAddress.Region,
                    Country = entity.HeadquartersAddress.Country,
                    PostalCode = entity.HeadquartersAddress.PostalCode
                } : null
            };

            _cache.Set(cacheKey, result, TimeSpan.FromHours(24));
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating LEI {Lei}", lei);
            return new LeiValidationResult
            {
                IsValid = false,
                Lei = lei,
                ErrorMessage = $"Error al validar LEI: {ex.Message}"
            };
        }
    }

    public async Task<IEnumerable<LeiRecord>> SearchLeiByNameAsync(string entityName, int maxResults = 10, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(entityName))
            return Enumerable.Empty<LeiRecord>();

        try
        {
            var url = $"{GleifApiUrl}/lei-records?filter[entity.legalName]={Uri.EscapeDataString(entityName)}&page[size]={maxResults}";
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(url, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return Enumerable.Empty<LeiRecord>();

            var json = await response.Content.ReadFromJsonAsync<GleifSearchResponse>(JsonOptions, cancellationToken);
            if (json?.Data == null)
                return Enumerable.Empty<LeiRecord>();

            return json.Data.Select(d => new LeiRecord
            {
                Lei = d.Attributes?.Lei ?? string.Empty,
                LegalName = d.Attributes?.Entity?.LegalName?.Name ?? string.Empty,
                Country = d.Attributes?.Entity?.LegalAddress?.Country,
                Status = d.Attributes?.Entity?.Status
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching LEI by name {EntityName}", entityName);
            return Enumerable.Empty<LeiRecord>();
        }
    }

    // ========================================
    // ISIN/CUSIP - Security Identifiers (OpenFIGI)
    // ========================================

    public async Task<IsinValidationResult> ValidateIsinAsync(string isin, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(isin) || isin.Length != 12)
        {
            return new IsinValidationResult
            {
                IsValid = false,
                Isin = isin,
                ErrorMessage = "ISIN debe tener exactamente 12 caracteres"
            };
        }

        var cacheKey = $"isin_{isin}";
        if (_cache.TryGetValue(cacheKey, out IsinValidationResult? cachedResult) && cachedResult != null)
        {
            return cachedResult;
        }

        try
        {
            var request = new[] { new { idType = "ID_ISIN", idValue = isin } };
            var content = JsonContent.Create(request);

            // Add API key header if configured
            var requestMessage = new HttpRequestMessage(HttpMethod.Post, OpenFigiApiUrl)
            {
                Content = content
            };
            if (!string.IsNullOrEmpty(_options.OpenFigiApiKey))
            {
                requestMessage.Headers.Add("X-OPENFIGI-APIKEY", _options.OpenFigiApiKey);
            }

            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.SendAsync(requestMessage, cancellationToken));

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadFromJsonAsync<List<OpenFigiResponse>>(JsonOptions, cancellationToken);
            if (json == null || json.Count == 0)
            {
                return new IsinValidationResult
                {
                    IsValid = false,
                    Isin = isin,
                    ErrorMessage = "No se encontraron datos para el ISIN"
                };
            }

            var firstResponse = json[0];
            if (!string.IsNullOrEmpty(firstResponse.Error))
            {
                return new IsinValidationResult
                {
                    IsValid = false,
                    Isin = isin,
                    ErrorMessage = firstResponse.Error
                };
            }

            var firstData = firstResponse.Data?.FirstOrDefault();
            if (firstData == null)
            {
                return new IsinValidationResult
                {
                    IsValid = false,
                    Isin = isin,
                    ErrorMessage = "ISIN no encontrado en OpenFIGI"
                };
            }

            var result = new IsinValidationResult
            {
                IsValid = true,
                Isin = isin,
                Figi = firstData.Figi,
                CompositeFigi = firstData.CompositeFigi,
                Name = firstData.Name,
                Ticker = firstData.Ticker,
                ExchangeCode = firstData.ExchCode,
                SecurityType = firstData.SecurityType,
                MarketSector = firstData.MarketSector
            };

            _cache.Set(cacheKey, result, TimeSpan.FromHours(24));
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating ISIN {Isin}", isin);
            return new IsinValidationResult
            {
                IsValid = false,
                Isin = isin,
                ErrorMessage = $"Error al validar ISIN: {ex.Message}"
            };
        }
    }

    public async Task<CusipValidationResult> ValidateCusipAsync(string cusip, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(cusip) || cusip.Length != 9)
        {
            return new CusipValidationResult
            {
                IsValid = false,
                Cusip = cusip,
                ErrorMessage = "CUSIP debe tener exactamente 9 caracteres"
            };
        }

        var cacheKey = $"cusip_{cusip}";
        if (_cache.TryGetValue(cacheKey, out CusipValidationResult? cachedResult) && cachedResult != null)
        {
            return cachedResult;
        }

        try
        {
            var request = new[] { new { idType = "ID_CUSIP", idValue = cusip } };
            var content = JsonContent.Create(request);

            var requestMessage = new HttpRequestMessage(HttpMethod.Post, OpenFigiApiUrl)
            {
                Content = content
            };
            if (!string.IsNullOrEmpty(_options.OpenFigiApiKey))
            {
                requestMessage.Headers.Add("X-OPENFIGI-APIKEY", _options.OpenFigiApiKey);
            }

            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.SendAsync(requestMessage, cancellationToken));

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadFromJsonAsync<List<OpenFigiResponse>>(JsonOptions, cancellationToken);
            var firstData = json?.FirstOrDefault()?.Data?.FirstOrDefault();

            if (firstData == null)
            {
                return new CusipValidationResult
                {
                    IsValid = false,
                    Cusip = cusip,
                    ErrorMessage = "CUSIP no encontrado en OpenFIGI"
                };
            }

            var result = new CusipValidationResult
            {
                IsValid = true,
                Cusip = cusip,
                Figi = firstData.Figi,
                Name = firstData.Name,
                Ticker = firstData.Ticker,
                SecurityType = firstData.SecurityType
            };

            _cache.Set(cacheKey, result, TimeSpan.FromHours(24));
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating CUSIP {Cusip}", cusip);
            return new CusipValidationResult
            {
                IsValid = false,
                Cusip = cusip,
                ErrorMessage = $"Error al validar CUSIP: {ex.Message}"
            };
        }
    }

    public async Task<IEnumerable<FigiMappingResult>> MapIdentifiersAsync(IEnumerable<SecurityIdentifier> identifiers, CancellationToken cancellationToken = default)
    {
        var identifierList = identifiers.ToList();
        if (!identifierList.Any())
            return Enumerable.Empty<FigiMappingResult>();

        try
        {
            var request = identifierList.Select(i => new
            {
                idType = i.IdType,
                idValue = i.IdValue,
                exchCode = i.ExchangeCode,
                marketSecDes = i.MarketSector
            }).ToList();

            var content = JsonContent.Create(request);
            var requestMessage = new HttpRequestMessage(HttpMethod.Post, OpenFigiApiUrl)
            {
                Content = content
            };
            if (!string.IsNullOrEmpty(_options.OpenFigiApiKey))
            {
                requestMessage.Headers.Add("X-OPENFIGI-APIKEY", _options.OpenFigiApiKey);
            }

            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.SendAsync(requestMessage, cancellationToken));

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadFromJsonAsync<List<OpenFigiResponse>>(JsonOptions, cancellationToken);
            if (json == null)
                return Enumerable.Empty<FigiMappingResult>();

            return json.SelectMany(r =>
            {
                if (!string.IsNullOrEmpty(r.Error))
                {
                    return new[] { new FigiMappingResult { Error = r.Error } };
                }

                return r.Data?.Select(d => new FigiMappingResult
                {
                    Figi = d.Figi,
                    CompositeFigi = d.CompositeFigi,
                    ShareClassFigi = d.ShareClassFigi,
                    Name = d.Name,
                    Ticker = d.Ticker,
                    ExchangeCode = d.ExchCode,
                    SecurityType = d.SecurityType,
                    MarketSector = d.MarketSector
                }) ?? Enumerable.Empty<FigiMappingResult>();
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error mapping identifiers to FIGI");
            return Enumerable.Empty<FigiMappingResult>();
        }
    }

    // ========================================
    // Tipos de Cambio (BANXICO SIE)
    // ========================================

    public async Task<ExchangeRateResult> GetExchangeRateFixAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"fx_usd_{date:yyyyMMdd}";
        if (_cache.TryGetValue(cacheKey, out ExchangeRateResult? cachedResult) && cachedResult != null)
        {
            return cachedResult;
        }

        try
        {
            // SF43718 = Tipo de cambio Pesos por dolar E.U.A. (Fix)
            var dateStr = date.ToString("yyyy-MM-dd");
            var url = $"{BanxicoApiUrl}/series/SF43718/datos/{dateStr}/{dateStr}";

            var request = new HttpRequestMessage(HttpMethod.Get, url);
            if (!string.IsNullOrEmpty(_options.BanxicoToken))
            {
                request.Headers.Add("Bmx-Token", _options.BanxicoToken);
            }

            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.SendAsync(request, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                return new ExchangeRateResult
                {
                    Date = date,
                    Currency = "USD",
                    Rate = 0,
                    Source = "BANXICO",
                    SeriesId = "SF43718"
                };
            }

            var json = await response.Content.ReadFromJsonAsync<BanxicoResponse>(JsonOptions, cancellationToken);
            var seriesData = json?.Bmx?.Series?.FirstOrDefault()?.Datos?.FirstOrDefault();

            if (seriesData == null || !decimal.TryParse(seriesData.Dato, NumberStyles.Any, CultureInfo.InvariantCulture, out var rate))
            {
                return new ExchangeRateResult
                {
                    Date = date,
                    Currency = "USD",
                    Rate = 0,
                    Source = "BANXICO"
                };
            }

            var result = new ExchangeRateResult
            {
                Date = date,
                Currency = "USD",
                Rate = rate,
                Source = "BANXICO",
                SeriesId = "SF43718"
            };

            _cache.Set(cacheKey, result, TimeSpan.FromHours(24));
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting exchange rate for date {Date}", date);
            return new ExchangeRateResult
            {
                Date = date,
                Currency = "USD",
                Rate = 0,
                Source = "BANXICO"
            };
        }
    }

    public async Task<IEnumerable<ExchangeRateResult>> GetExchangeRateRangeAsync(DateTime startDate, DateTime endDate, string currency = "USD", CancellationToken cancellationToken = default)
    {
        var results = new List<ExchangeRateResult>();

        try
        {
            var seriesId = currency.ToUpperInvariant() switch
            {
                "USD" => "SF43718",
                "EUR" => "SF46410",
                "JPY" => "SF46406",
                "GBP" => "SF46407",
                "CAD" => "SF60632",
                _ => "SF43718"
            };

            var url = $"{BanxicoApiUrl}/series/{seriesId}/datos/{startDate:yyyy-MM-dd}/{endDate:yyyy-MM-dd}";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            if (!string.IsNullOrEmpty(_options.BanxicoToken))
            {
                request.Headers.Add("Bmx-Token", _options.BanxicoToken);
            }

            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.SendAsync(request, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var json = await response.Content.ReadFromJsonAsync<BanxicoResponse>(JsonOptions, cancellationToken);
            var seriesData = json?.Bmx?.Series?.FirstOrDefault()?.Datos;

            if (seriesData == null)
                return results;

            foreach (var data in seriesData)
            {
                if (DateTime.TryParseExact(data.Fecha, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date) &&
                    decimal.TryParse(data.Dato, NumberStyles.Any, CultureInfo.InvariantCulture, out var rate))
                {
                    results.Add(new ExchangeRateResult
                    {
                        Date = date,
                        Currency = currency,
                        Rate = rate,
                        Source = "BANXICO",
                        SeriesId = seriesId
                    });
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting exchange rate range from {StartDate} to {EndDate}", startDate, endDate);
        }

        return results;
    }

    public async Task<decimal?> GetUdiValueAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"udi_{date:yyyyMMdd}";
        if (_cache.TryGetValue(cacheKey, out decimal cachedResult))
        {
            return cachedResult;
        }

        try
        {
            // SP68257 = Valor de la UDI
            var url = $"{BanxicoApiUrl}/series/SP68257/datos/{date:yyyy-MM-dd}/{date:yyyy-MM-dd}";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            if (!string.IsNullOrEmpty(_options.BanxicoToken))
            {
                request.Headers.Add("Bmx-Token", _options.BanxicoToken);
            }

            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.SendAsync(request, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadFromJsonAsync<BanxicoResponse>(JsonOptions, cancellationToken);
            var seriesData = json?.Bmx?.Series?.FirstOrDefault()?.Datos?.FirstOrDefault();

            if (seriesData == null || !decimal.TryParse(seriesData.Dato, NumberStyles.Any, CultureInfo.InvariantCulture, out var value))
                return null;

            _cache.Set(cacheKey, value, TimeSpan.FromHours(24));
            return value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting UDI value for date {Date}", date);
            return null;
        }
    }

    // ========================================
    // Vector de Precios (VALMER)
    // ========================================

    public async Task<ValmerPriceResult?> GetInstrumentPriceAsync(string ticker, string series, DateTime? date = null, CancellationToken cancellationToken = default)
    {
        var priceDate = date ?? DateTime.Today;
        var cacheKey = $"valmer_{ticker}_{series}_{priceDate:yyyyMMdd}";

        if (_cache.TryGetValue(cacheKey, out ValmerPriceResult? cachedResult))
        {
            return cachedResult;
        }

        var prices = await GetPriceVectorAsync(date, cancellationToken);
        var result = prices.FirstOrDefault(p =>
            p.Issuer.Equals(ticker, StringComparison.OrdinalIgnoreCase) &&
            p.Series.Equals(series, StringComparison.OrdinalIgnoreCase));

        if (result != null)
        {
            _cache.Set(cacheKey, result, TimeSpan.FromHours(6));
        }

        return result;
    }

    public async Task<IEnumerable<ValmerPriceResult>> GetPriceVectorAsync(DateTime? date = null, CancellationToken cancellationToken = default)
    {
        var priceDate = date ?? DateTime.Today;
        var cacheKey = $"valmer_vector_{priceDate:yyyyMMdd}";

        if (_cache.TryGetValue(cacheKey, out List<ValmerPriceResult>? cachedVector) && cachedVector != null)
        {
            return cachedVector;
        }

        var results = new List<ValmerPriceResult>();

        try
        {
            // VALMER provides a preliminary vector CSV
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(ValmerVectorUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var csv = await response.Content.ReadAsStringAsync(cancellationToken);
            var lines = csv.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            // Skip header row
            foreach (var line in lines.Skip(1))
            {
                var fields = line.Split(',');
                if (fields.Length < 10)
                    continue;

                try
                {
                    var result = new ValmerPriceResult
                    {
                        Date = DateTime.TryParseExact(fields[1], "yyyy/MM/dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d) ? d : priceDate,
                        MarketType = fields[0],
                        Ticker = fields[2],
                        Issuer = fields[3],
                        Series = fields[4],
                        DirtyPrice = decimal.TryParse(fields[5], NumberStyles.Any, CultureInfo.InvariantCulture, out var dp) ? dp : 0,
                        CleanPrice = decimal.TryParse(fields[6], NumberStyles.Any, CultureInfo.InvariantCulture, out var cp) ? cp : 0,
                        AccruedInterest = decimal.TryParse(fields[7], NumberStyles.Any, CultureInfo.InvariantCulture, out var ai) ? ai : 0,
                        DaysToMaturity = int.TryParse(fields[8], out var dtm) ? dtm : 0,
                        DiscountRate = decimal.TryParse(fields[9], NumberStyles.Any, CultureInfo.InvariantCulture, out var dr) ? dr : 0,
                        Duration = fields.Length > 19 && decimal.TryParse(fields[19], NumberStyles.Any, CultureInfo.InvariantCulture, out var dur) ? dur : null,
                        Convexity = fields.Length > 20 && decimal.TryParse(fields[20], NumberStyles.Any, CultureInfo.InvariantCulture, out var conv) ? conv : null,
                        Yield = fields.Length > 21 && decimal.TryParse(fields[21], NumberStyles.Any, CultureInfo.InvariantCulture, out var yld) ? yld : null,
                        Instrument = fields.Length > 22 ? fields[22] : null
                    };

                    results.Add(result);
                }
                catch
                {
                    // Skip malformed lines
                }
            }

            if (results.Any())
            {
                _cache.Set(cacheKey, results, TimeSpan.FromHours(6));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting VALMER price vector");
        }

        return results;
    }

    public async Task<IEnumerable<YieldCurvePoint>> GetYieldCurveAsync(string curveType, DateTime? date = null, CancellationToken cancellationToken = default)
    {
        // This would require VALMER API access with authentication
        // For now, return empty - can be implemented with VALMER token
        _logger.LogWarning("GetYieldCurveAsync requires VALMER API token - returning empty");
        return await Task.FromResult(Enumerable.Empty<YieldCurvePoint>());
    }

    // ========================================
    // Catalogos SIEFORES/AFOREs
    // ========================================

    public Task<IEnumerable<SieforesInfo>> GetSieforessCatalogAsync(CancellationToken cancellationToken = default)
    {
        // Static catalog of SIEFORES Generacionales (2024-2025)
        var siefores = new List<SieforesInfo>
        {
            // SIEFORES Generacionales activas
            new() { Key = "SB0004", Name = "SIEFORE Basica 00-04", GenerationType = "Generacional", BirthYearStart = 2000, BirthYearEnd = 2004, IsActive = true },
            new() { Key = "SB9599", Name = "SIEFORE Basica 95-99", GenerationType = "Generacional", BirthYearStart = 1995, BirthYearEnd = 1999, IsActive = true, EffectiveFrom = new DateTime(2024, 8, 26) },
            new() { Key = "SB9094", Name = "SIEFORE Basica 90-94", GenerationType = "Generacional", BirthYearStart = 1990, BirthYearEnd = 1994, IsActive = true },
            new() { Key = "SB8589", Name = "SIEFORE Basica 85-89", GenerationType = "Generacional", BirthYearStart = 1985, BirthYearEnd = 1989, IsActive = true },
            new() { Key = "SB8084", Name = "SIEFORE Basica 80-84", GenerationType = "Generacional", BirthYearStart = 1980, BirthYearEnd = 1984, IsActive = true },
            new() { Key = "SB7579", Name = "SIEFORE Basica 75-79", GenerationType = "Generacional", BirthYearStart = 1975, BirthYearEnd = 1979, IsActive = true },
            new() { Key = "SB7074", Name = "SIEFORE Basica 70-74", GenerationType = "Generacional", BirthYearStart = 1970, BirthYearEnd = 1974, IsActive = true },
            new() { Key = "SB6569", Name = "SIEFORE Basica 65-69", GenerationType = "Generacional", BirthYearStart = 1965, BirthYearEnd = 1969, IsActive = true },
            new() { Key = "SB6064", Name = "SIEFORE Basica 60-64", GenerationType = "Generacional", BirthYearStart = 1960, BirthYearEnd = 1964, IsActive = true },
            new() { Key = "SBPENSIONES", Name = "SIEFORE Basica de Pensiones", GenerationType = "Pensiones", IsActive = true },
            new() { Key = "SBINICIAL", Name = "SIEFORE Basica Inicial", GenerationType = "Inicial", IsActive = true },
            // SIEFOREs que dejaron de operar
            new() { Key = "SB5559", Name = "SIEFORE Basica 55-59", GenerationType = "Generacional", BirthYearStart = 1955, BirthYearEnd = 1959, IsActive = false, EffectiveTo = new DateTime(2024, 8, 26) }
        };

        return Task.FromResult(siefores.AsEnumerable());
    }

    public async Task<SieforeValidationResult> ValidateSieforesAsync(string sieforesKey, CancellationToken cancellationToken = default)
    {
        var catalog = await GetSieforessCatalogAsync(cancellationToken);
        var siefore = catalog.FirstOrDefault(s =>
            s.Key.Equals(sieforesKey, StringComparison.OrdinalIgnoreCase));

        if (siefore == null)
        {
            return new SieforeValidationResult
            {
                IsValid = false,
                Key = sieforesKey,
                ErrorMessage = $"SIEFORE '{sieforesKey}' no encontrada en catalogo"
            };
        }

        if (!siefore.IsActive)
        {
            return new SieforeValidationResult
            {
                IsValid = false,
                Key = sieforesKey,
                Name = siefore.Name,
                GenerationType = siefore.GenerationType,
                ErrorMessage = $"SIEFORE '{sieforesKey}' ya no esta activa (vigente hasta {siefore.EffectiveTo:yyyy-MM-dd})"
            };
        }

        return new SieforeValidationResult
        {
            IsValid = true,
            Key = siefore.Key,
            Name = siefore.Name,
            GenerationType = siefore.GenerationType
        };
    }

    public Task<IEnumerable<AforeInfo>> GetAforessCatalogAsync(CancellationToken cancellationToken = default)
    {
        // Static catalog of AFOREs (2024-2025)
        var afores = new List<AforeInfo>
        {
            new() { Key = "501", Name = "AFORE XXI BANORTE", ShortName = "XXI Banorte", Commission2025 = 0.55m, IsActive = true, WebsiteUrl = "https://www.xxi-banorte.com" },
            new() { Key = "502", Name = "AFORE BANAMEX", ShortName = "Citibanamex", Commission2025 = 0.55m, IsActive = true, WebsiteUrl = "https://www.banamex.com/afore" },
            new() { Key = "503", Name = "PROFUTURO GNP AFORE", ShortName = "Profuturo", Commission2025 = 0.55m, IsActive = true, WebsiteUrl = "https://www.profuturo.mx" },
            new() { Key = "504", Name = "AFORE SURA", ShortName = "Sura", Commission2025 = 0.55m, IsActive = true, WebsiteUrl = "https://www.aforesura.com.mx" },
            new() { Key = "505", Name = "AFORE INBURSA", ShortName = "Inbursa", Commission2025 = 0.55m, IsActive = true, WebsiteUrl = "https://www.inbursa.com/afore" },
            new() { Key = "506", Name = "AFORE PRINCIPAL", ShortName = "Principal", Commission2025 = 0.55m, IsActive = true, WebsiteUrl = "https://www.principal.com.mx" },
            new() { Key = "507", Name = "AFORE INVERCAP", ShortName = "Invercap", Commission2025 = 0.55m, IsActive = true, WebsiteUrl = "https://www.invercap.com.mx" },
            new() { Key = "508", Name = "AFORE COPPEL", ShortName = "Coppel", Commission2025 = 0.55m, IsActive = true, WebsiteUrl = "https://www.aforecoppel.com" },
            new() { Key = "509", Name = "AFORE AZTECA", ShortName = "Azteca", Commission2025 = 0.55m, IsActive = true, WebsiteUrl = "https://www.aforeazteca.com.mx" },
            new() { Key = "590", Name = "PENSIONISSSTE", ShortName = "Pensionissste", Commission2025 = 0.52m, IsActive = true, WebsiteUrl = "https://www.pensionissste.gob.mx" }
        };

        return Task.FromResult(afores.AsEnumerable());
    }

    public async Task<AforeValidationResult> ValidateAforeAsync(string aforeKey, CancellationToken cancellationToken = default)
    {
        var catalog = await GetAforessCatalogAsync(cancellationToken);
        var afore = catalog.FirstOrDefault(a =>
            a.Key.Equals(aforeKey, StringComparison.OrdinalIgnoreCase) ||
            a.ShortName?.Equals(aforeKey, StringComparison.OrdinalIgnoreCase) == true);

        if (afore == null)
        {
            return new AforeValidationResult
            {
                IsValid = false,
                Key = aforeKey,
                ErrorMessage = $"AFORE '{aforeKey}' no encontrada en catalogo"
            };
        }

        if (!afore.IsActive)
        {
            return new AforeValidationResult
            {
                IsValid = false,
                Key = aforeKey,
                Name = afore.Name,
                ErrorMessage = $"AFORE '{aforeKey}' no esta activa"
            };
        }

        return new AforeValidationResult
        {
            IsValid = true,
            Key = afore.Key,
            Name = afore.Name
        };
    }

    // ========================================
    // Tablas Actuariales
    // ========================================

    public Task<decimal?> GetMortalityRateAsync(int age, string gender, string tableType = "CNSF2000-I", CancellationToken cancellationToken = default)
    {
        // CNSF 2000-I (Individual) mortality rates
        // Source: CNSF Circular S-20.1
        var mortalityRates = GetMortalityTable(tableType, gender);

        if (age < 0 || age > 110 || !mortalityRates.TryGetValue(age, out var rate))
            return Task.FromResult<decimal?>(null);

        return Task.FromResult<decimal?>(rate);
    }

    public async Task<ActuarialFactors?> GetActuarialFactorsAsync(int age, string gender, string pensionType, CancellationToken cancellationToken = default)
    {
        var mortalityRate = await GetMortalityRateAsync(age, gender, "CNSF2000-I", cancellationToken);
        if (!mortalityRate.HasValue)
            return null;

        var qx = mortalityRate.Value;
        var px = 1 - qx;

        return new ActuarialFactors
        {
            Age = age,
            Gender = gender,
            TableType = "CNSF2000-I",
            MortalityRate = qx,
            SurvivalRate = px,
            LifeExpectancy = CalculateLifeExpectancy(age, gender),
            AnnuityFactor = CalculateAnnuityFactor(age, gender, 0.035m), // 3.5% discount rate
            PensionFactor = CalculatePensionFactor(age, gender, pensionType)
        };
    }

    // ========================================
    // Helper Methods
    // ========================================

    private static DateTime? ParseDateTime(string? dateStr)
    {
        if (string.IsNullOrWhiteSpace(dateStr))
            return null;

        if (DateTime.TryParse(dateStr, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var result))
            return result;

        return null;
    }

    private static Dictionary<int, decimal> GetMortalityTable(string tableType, string gender)
    {
        // Simplified CNSF 2000-I mortality rates (qx per 1000)
        // Real implementation would load from database or external source
        var isMale = gender.Equals("M", StringComparison.OrdinalIgnoreCase) ||
                     gender.Equals("MASCULINO", StringComparison.OrdinalIgnoreCase);

        // Sample rates for key ages (actual table has values for all ages 0-110)
        var rates = new Dictionary<int, decimal>();

        if (isMale)
        {
            rates[20] = 0.00125m; rates[25] = 0.00135m; rates[30] = 0.00155m;
            rates[35] = 0.00195m; rates[40] = 0.00275m; rates[45] = 0.00415m;
            rates[50] = 0.00635m; rates[55] = 0.00985m; rates[60] = 0.01535m;
            rates[65] = 0.02395m; rates[70] = 0.03755m; rates[75] = 0.05875m;
            rates[80] = 0.09185m; rates[85] = 0.14295m; rates[90] = 0.21995m;
        }
        else
        {
            rates[20] = 0.00055m; rates[25] = 0.00065m; rates[30] = 0.00085m;
            rates[35] = 0.00115m; rates[40] = 0.00175m; rates[45] = 0.00275m;
            rates[50] = 0.00435m; rates[55] = 0.00695m; rates[60] = 0.01105m;
            rates[65] = 0.01755m; rates[70] = 0.02795m; rates[75] = 0.04465m;
            rates[80] = 0.07135m; rates[85] = 0.11395m; rates[90] = 0.18155m;
        }

        // Interpolate for ages not in the table
        for (int age = 0; age <= 110; age++)
        {
            if (!rates.ContainsKey(age))
            {
                var lowerAge = rates.Keys.Where(k => k < age).DefaultIfEmpty(20).Max();
                var upperAge = rates.Keys.Where(k => k > age).DefaultIfEmpty(90).Min();

                if (lowerAge == upperAge)
                {
                    rates[age] = rates[lowerAge];
                }
                else
                {
                    var ratio = (decimal)(age - lowerAge) / (upperAge - lowerAge);
                    rates[age] = rates[lowerAge] + (rates[upperAge] - rates[lowerAge]) * ratio;
                }
            }
        }

        return rates;
    }

    private static decimal? CalculateLifeExpectancy(int age, string gender)
    {
        // Simplified life expectancy calculation
        var isMale = gender.Equals("M", StringComparison.OrdinalIgnoreCase);
        var baseExpectancy = isMale ? 76.5m : 81.5m;

        if (age >= baseExpectancy)
            return Math.Max(1, 110 - age);

        return baseExpectancy - age;
    }

    private static decimal? CalculateAnnuityFactor(int age, string gender, decimal discountRate)
    {
        // Simplified annuity factor (ax) calculation
        var lifeExpectancy = CalculateLifeExpectancy(age, gender) ?? 20;
        var factor = 0m;

        for (int t = 1; t <= (int)lifeExpectancy; t++)
        {
            factor += (decimal)Math.Pow((double)(1 / (1 + discountRate)), t);
        }

        return Math.Round(factor, 4);
    }

    private static decimal? CalculatePensionFactor(int age, string gender, string pensionType)
    {
        // Simplified pension factor based on type
        var annuityFactor = CalculateAnnuityFactor(age, gender, 0.035m) ?? 15m;

        return pensionType.ToUpperInvariant() switch
        {
            "RETIRO" => annuityFactor,
            "INVALIDEZ" => annuityFactor * 1.15m, // 15% extra for disability
            "CESANTIA" => annuityFactor * 0.95m,  // 5% less for early retirement
            "VIUDEZ" => annuityFactor * 0.60m,    // 60% for widow/widower
            "ORFANDAD" => annuityFactor * 0.20m,  // 20% for orphans
            _ => annuityFactor
        };
    }
}

// ========================================
// Configuration Options
// ========================================

public class ReferenceDataOptions
{
    public const string SectionName = "ReferenceData";

    public string? OpenFigiApiKey { get; set; }
    public string? BanxicoToken { get; set; }
    public string? ValmerToken { get; set; }
    public int CacheExpirationHours { get; set; } = 24;
}

// ========================================
// API Response Models
// ========================================

internal class GleifLeiResponse
{
    public GleifMeta? Meta { get; set; }
    public GleifLeiData? Data { get; set; }
}

internal class GleifMeta
{
    public GleifGoldenCopy? GoldenCopy { get; set; }
}

internal class GleifGoldenCopy
{
    public string? PublishDate { get; set; }
}

internal class GleifSearchResponse
{
    public List<GleifLeiData>? Data { get; set; }
}

internal class GleifLeiData
{
    public string? Type { get; set; }
    public string? Id { get; set; }
    public GleifAttributes? Attributes { get; set; }
}

internal class GleifAttributes
{
    public string? Lei { get; set; }
    public GleifEntity? Entity { get; set; }
}

internal class GleifEntity
{
    public GleifLegalName? LegalName { get; set; }
    public GleifAddress? LegalAddress { get; set; }
    public GleifAddress? HeadquartersAddress { get; set; }
    public string? Jurisdiction { get; set; }
    public string? Status { get; set; }
    public GleifLegalForm? LegalForm { get; set; }
    public string? CreationDate { get; set; }
}

internal class GleifLegalName
{
    public string? Name { get; set; }
    public string? Language { get; set; }
}

internal class GleifAddress
{
    public string[]? AddressLines { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
}

internal class GleifLegalForm
{
    public string? Id { get; set; }
}

internal class OpenFigiResponse
{
    public List<OpenFigiData>? Data { get; set; }
    public string? Error { get; set; }
}

internal class OpenFigiData
{
    public string? Figi { get; set; }
    public string? CompositeFigi { get; set; }
    public string? ShareClassFigi { get; set; }
    public string? Name { get; set; }
    public string? Ticker { get; set; }
    public string? ExchCode { get; set; }
    public string? SecurityType { get; set; }
    public string? MarketSector { get; set; }
}

internal class BanxicoResponse
{
    public BanxicoBmx? Bmx { get; set; }
}

internal class BanxicoBmx
{
    public List<BanxicoSeries>? Series { get; set; }
}

internal class BanxicoSeries
{
    public string? IdSerie { get; set; }
    public string? Titulo { get; set; }
    public List<BanxicoDato>? Datos { get; set; }
}

internal class BanxicoDato
{
    public string? Fecha { get; set; }
    public string? Dato { get; set; }
}
