using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Certus.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Polly;
using Polly.Retry;

namespace Certus.Infrastructure.Services.ExternalApis;

/// <summary>
/// Service for Mexican Government Open Data (datos.gob.mx)
/// Uses CKAN API to access public datasets from CONSAR, IMSS, INFONAVIT, etc.
///
/// API Documentation:
/// - datos.gob.mx: https://datos.gob.mx/
/// - datos.imss.gob.mx: http://datos.imss.gob.mx/
/// - CKAN API: https://docs.ckan.org/en/2.9/api/
/// </summary>
public class MexicanOpenDataService : IMexicanOpenDataService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<MexicanOpenDataService> _logger;
    private readonly MexicanOpenDataOptions _options;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public MexicanOpenDataService(
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache,
        ILogger<MexicanOpenDataService> logger,
        IOptions<MexicanOpenDataOptions> options)
    {
        _httpClient = httpClientFactory.CreateClient("MexicanOpenData");
        _cache = cache;
        _logger = logger;
        _options = options.Value;

        _retryPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
            .Or<HttpRequestException>()
            .WaitAndRetryAsync(
                retryCount: 3,
                sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)));
    }

    #region Dataset Discovery

    /// <summary>
    /// Searches for datasets across Mexican government open data portals
    /// </summary>
    public async Task<OpenDataSearchResult> SearchDatasetsAsync(
        string query,
        OpenDataOrganization? organization = null,
        int limit = 20,
        int offset = 0,
        CancellationToken cancellationToken = default)
    {
        var portal = GetPortalUrl(organization);
        var url = $"{portal}/api/3/action/package_search?q={Uri.EscapeDataString(query)}&rows={limit}&start={offset}";

        if (organization.HasValue)
        {
            url += $"&fq=organization:{GetOrganizationCode(organization.Value)}";
        }

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(url, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                return new OpenDataSearchResult
                {
                    Success = false,
                    ErrorMessage = $"API returned {response.StatusCode}"
                };
            }

            var apiResponse = await response.Content.ReadFromJsonAsync<CkanSearchResponse>(
                JsonOptions, cancellationToken);

            if (apiResponse?.Result == null)
            {
                return new OpenDataSearchResult
                {
                    Success = false,
                    ErrorMessage = "Empty response from API"
                };
            }

            return new OpenDataSearchResult
            {
                Success = true,
                TotalCount = apiResponse.Result.Count,
                Datasets = apiResponse.Result.Results?.Select(MapToDatasetInfo).ToList() ?? new List<OpenDataDatasetInfo>()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching datasets for query: {Query}", query);
            return new OpenDataSearchResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    /// <summary>
    /// Gets datasets from a specific organization
    /// </summary>
    public async Task<IEnumerable<OpenDataDatasetInfo>> GetOrganizationDatasetsAsync(
        OpenDataOrganization organization,
        int limit = 100,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"opendata_org_{organization}";

        if (_cache.TryGetValue(cacheKey, out List<OpenDataDatasetInfo>? cached) && cached != null)
        {
            return cached;
        }

        var portal = GetPortalUrl(organization);
        var orgCode = GetOrganizationCode(organization);
        var url = $"{portal}/api/3/action/package_search?fq=organization:{orgCode}&rows={limit}";

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(url, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                return Array.Empty<OpenDataDatasetInfo>();
            }

            var apiResponse = await response.Content.ReadFromJsonAsync<CkanSearchResponse>(
                JsonOptions, cancellationToken);

            var datasets = apiResponse?.Result?.Results?.Select(MapToDatasetInfo).ToList()
                ?? new List<OpenDataDatasetInfo>();

            _cache.Set(cacheKey, datasets, TimeSpan.FromHours(_options.CacheHours));
            return datasets;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching datasets for organization: {Organization}", organization);
            return Array.Empty<OpenDataDatasetInfo>();
        }
    }

    /// <summary>
    /// Gets detailed information about a specific dataset
    /// </summary>
    public async Task<OpenDataDatasetInfo?> GetDatasetInfoAsync(
        string datasetId,
        OpenDataOrganization? organization = null,
        CancellationToken cancellationToken = default)
    {
        var portal = GetPortalUrl(organization);
        var url = $"{portal}/api/3/action/package_show?id={Uri.EscapeDataString(datasetId)}";

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(url, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var apiResponse = await response.Content.ReadFromJsonAsync<CkanPackageResponse>(
                JsonOptions, cancellationToken);

            return apiResponse?.Result != null ? MapToDatasetInfo(apiResponse.Result) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching dataset info: {DatasetId}", datasetId);
            return null;
        }
    }

    #endregion

    #region Data Access

    /// <summary>
    /// Gets data from a dataset resource (CSV, JSON, etc.)
    /// </summary>
    public async Task<OpenDataResourceResult> GetResourceDataAsync(
        string resourceId,
        OpenDataOrganization? organization = null,
        int limit = 1000,
        int offset = 0,
        string? filters = null,
        CancellationToken cancellationToken = default)
    {
        var portal = GetPortalUrl(organization);
        var url = $"{portal}/api/action/datastore/search.json?resource_id={resourceId}&limit={limit}&offset={offset}";

        if (!string.IsNullOrEmpty(filters))
        {
            url += $"&filters={Uri.EscapeDataString(filters)}";
        }

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(url, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                return new OpenDataResourceResult
                {
                    Success = false,
                    ErrorMessage = $"API returned {response.StatusCode}"
                };
            }

            var apiResponse = await response.Content.ReadFromJsonAsync<CkanDatastoreResponse>(
                JsonOptions, cancellationToken);

            return new OpenDataResourceResult
            {
                Success = apiResponse?.Success ?? false,
                ResourceId = resourceId,
                TotalRecords = apiResponse?.Result?.Total ?? 0,
                Fields = apiResponse?.Result?.Fields?.Select(f => new OpenDataField
                {
                    Id = f.Id ?? string.Empty,
                    Type = f.Type ?? "text"
                }).ToList() ?? new List<OpenDataField>(),
                Records = apiResponse?.Result?.Records ?? new List<Dictionary<string, object>>()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching resource data: {ResourceId}", resourceId);
            return new OpenDataResourceResult
            {
                Success = false,
                ResourceId = resourceId,
                ErrorMessage = ex.Message
            };
        }
    }

    /// <summary>
    /// Downloads a resource file (CSV, XLSX, etc.)
    /// </summary>
    public async Task<Stream?> DownloadResourceAsync(
        string resourceUrl,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync(resourceUrl, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            return await response.Content.ReadAsStreamAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading resource: {Url}", resourceUrl);
            return null;
        }
    }

    #endregion

    #region IMSS Specific

    /// <summary>
    /// Gets IMSS employment data (asegurados)
    /// </summary>
    public async Task<ImssEmploymentDataResult> GetImssEmploymentDataAsync(
        int? year = null,
        int? month = null,
        string? state = null,
        CancellationToken cancellationToken = default)
    {
        // IMSS asegurados dataset resource ID
        const string resourceId = "f495eb1c-90d6-47cc-915d-71a9336c5fc6";

        var filters = new Dictionary<string, object>();
        if (year.HasValue) filters["anio"] = year.Value;
        if (month.HasValue) filters["mes"] = month.Value;
        if (!string.IsNullOrEmpty(state)) filters["entidad"] = state;

        var filtersJson = filters.Any() ? JsonSerializer.Serialize(filters) : null;

        var result = await GetResourceDataAsync(
            resourceId,
            OpenDataOrganization.IMSS,
            limit: 1000,
            filters: filtersJson,
            cancellationToken: cancellationToken);

        if (!result.Success)
        {
            return new ImssEmploymentDataResult
            {
                Success = false,
                ErrorMessage = result.ErrorMessage
            };
        }

        var records = result.Records.Select(r => new ImssEmploymentRecord
        {
            Year = GetIntValue(r, "anio") ?? 0,
            Month = GetIntValue(r, "mes") ?? 0,
            State = GetStringValue(r, "entidad"),
            Municipality = GetStringValue(r, "municipio"),
            Sector = GetStringValue(r, "sector_economico"),
            TotalWorkers = GetIntValue(r, "trabajadores"),
            TotalEmployers = GetIntValue(r, "patronos"),
            AverageSalary = GetDecimalValue(r, "salario_promedio")
        }).ToList();

        return new ImssEmploymentDataResult
        {
            Success = true,
            TotalRecords = result.TotalRecords,
            Records = records
        };
    }

    #endregion

    #region CONSAR Specific

    /// <summary>
    /// Searches for CONSAR-related datasets
    /// </summary>
    public async Task<IEnumerable<OpenDataDatasetInfo>> GetConsarDatasetsAsync(
        CancellationToken cancellationToken = default)
    {
        // Search for CONSAR datasets across datos.gob.mx
        var result = await SearchDatasetsAsync(
            "CONSAR OR AFORE OR SIEFORE OR SAR",
            null,
            50,
            0,
            cancellationToken);

        return result.Success ? result.Datasets : Array.Empty<OpenDataDatasetInfo>();
    }

    #endregion

    #region Private Helpers

    private static string GetPortalUrl(OpenDataOrganization? organization) => organization switch
    {
        OpenDataOrganization.IMSS => "http://datos.imss.gob.mx",
        _ => "https://datos.gob.mx"
    };

    private static string GetOrganizationCode(OpenDataOrganization organization) => organization switch
    {
        OpenDataOrganization.CONSAR => "consar",
        OpenDataOrganization.IMSS => "imss",
        OpenDataOrganization.INFONAVIT => "infonavit",
        OpenDataOrganization.SAT => "sat",
        OpenDataOrganization.BANXICO => "banxico",
        OpenDataOrganization.SHCP => "shcp",
        OpenDataOrganization.STPS => "stps",
        _ => "consar"
    };

    private static OpenDataDatasetInfo MapToDatasetInfo(CkanPackage package)
    {
        return new OpenDataDatasetInfo
        {
            Id = package.Id ?? string.Empty,
            Name = package.Name ?? string.Empty,
            Title = package.Title ?? string.Empty,
            Description = package.Notes,
            Organization = package.Organization?.Title,
            OrganizationId = package.Organization?.Name,
            CreatedAt = package.MetadataCreated,
            UpdatedAt = package.MetadataModified,
            Tags = package.Tags?.Select(t => t.Name ?? string.Empty).ToList() ?? new List<string>(),
            Resources = package.Resources?.Select(r => new OpenDataResourceInfo
            {
                Id = r.Id ?? string.Empty,
                Name = r.Name ?? string.Empty,
                Description = r.Description,
                Format = r.Format,
                Url = r.Url,
                Size = r.Size,
                LastModified = r.LastModified
            }).ToList() ?? new List<OpenDataResourceInfo>()
        };
    }

    private static int? GetIntValue(Dictionary<string, object> record, string key)
    {
        if (!record.TryGetValue(key, out var value)) return null;
        return value switch
        {
            int i => i,
            long l => (int)l,
            string s when int.TryParse(s, out var parsed) => parsed,
            JsonElement je when je.ValueKind == JsonValueKind.Number => je.GetInt32(),
            _ => null
        };
    }

    private static decimal? GetDecimalValue(Dictionary<string, object> record, string key)
    {
        if (!record.TryGetValue(key, out var value)) return null;
        return value switch
        {
            decimal d => d,
            double dbl => (decimal)dbl,
            string s when decimal.TryParse(s, out var parsed) => parsed,
            JsonElement je when je.ValueKind == JsonValueKind.Number => je.GetDecimal(),
            _ => null
        };
    }

    private static string? GetStringValue(Dictionary<string, object> record, string key)
    {
        if (!record.TryGetValue(key, out var value)) return null;
        return value switch
        {
            string s => s,
            JsonElement je when je.ValueKind == JsonValueKind.String => je.GetString(),
            _ => value.ToString()
        };
    }

    #endregion
}

#region Interfaces and Models

/// <summary>
/// Interface for Mexican Government Open Data Service
/// </summary>
public interface IMexicanOpenDataService
{
    Task<OpenDataSearchResult> SearchDatasetsAsync(string query, OpenDataOrganization? organization = null, int limit = 20, int offset = 0, CancellationToken cancellationToken = default);
    Task<IEnumerable<OpenDataDatasetInfo>> GetOrganizationDatasetsAsync(OpenDataOrganization organization, int limit = 100, CancellationToken cancellationToken = default);
    Task<OpenDataDatasetInfo?> GetDatasetInfoAsync(string datasetId, OpenDataOrganization? organization = null, CancellationToken cancellationToken = default);
    Task<OpenDataResourceResult> GetResourceDataAsync(string resourceId, OpenDataOrganization? organization = null, int limit = 1000, int offset = 0, string? filters = null, CancellationToken cancellationToken = default);
    Task<Stream?> DownloadResourceAsync(string resourceUrl, CancellationToken cancellationToken = default);
    Task<ImssEmploymentDataResult> GetImssEmploymentDataAsync(int? year = null, int? month = null, string? state = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<OpenDataDatasetInfo>> GetConsarDatasetsAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Mexican government organizations with open data
/// </summary>
public enum OpenDataOrganization
{
    CONSAR,
    IMSS,
    INFONAVIT,
    SAT,
    BANXICO,
    SHCP,
    STPS
}

/// <summary>
/// Search result
/// </summary>
public record OpenDataSearchResult
{
    public bool Success { get; init; }
    public int TotalCount { get; init; }
    public IReadOnlyList<OpenDataDatasetInfo> Datasets { get; init; } = Array.Empty<OpenDataDatasetInfo>();
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// Dataset information
/// </summary>
public record OpenDataDatasetInfo
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Organization { get; init; }
    public string? OrganizationId { get; init; }
    public DateTime? CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public IReadOnlyList<string> Tags { get; init; } = Array.Empty<string>();
    public IReadOnlyList<OpenDataResourceInfo> Resources { get; init; } = Array.Empty<OpenDataResourceInfo>();
}

/// <summary>
/// Resource information
/// </summary>
public record OpenDataResourceInfo
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Format { get; init; }
    public string? Url { get; init; }
    public long? Size { get; init; }
    public DateTime? LastModified { get; init; }
}

/// <summary>
/// Resource data result
/// </summary>
public record OpenDataResourceResult
{
    public bool Success { get; init; }
    public string ResourceId { get; init; } = string.Empty;
    public int TotalRecords { get; init; }
    public IReadOnlyList<OpenDataField> Fields { get; init; } = Array.Empty<OpenDataField>();
    public IReadOnlyList<Dictionary<string, object>> Records { get; init; } = Array.Empty<Dictionary<string, object>>();
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// Field definition
/// </summary>
public record OpenDataField
{
    public string Id { get; init; } = string.Empty;
    public string Type { get; init; } = "text";
}

/// <summary>
/// IMSS employment data result
/// </summary>
public record ImssEmploymentDataResult
{
    public bool Success { get; init; }
    public int TotalRecords { get; init; }
    public IReadOnlyList<ImssEmploymentRecord> Records { get; init; } = Array.Empty<ImssEmploymentRecord>();
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// IMSS employment record
/// </summary>
public record ImssEmploymentRecord
{
    public int Year { get; init; }
    public int Month { get; init; }
    public string? State { get; init; }
    public string? Municipality { get; init; }
    public string? Sector { get; init; }
    public int? TotalWorkers { get; init; }
    public int? TotalEmployers { get; init; }
    public decimal? AverageSalary { get; init; }
}

#endregion

#region Configuration

/// <summary>
/// Configuration options for Mexican Open Data
/// </summary>
public class MexicanOpenDataOptions
{
    public const string SectionName = "MexicanOpenData";

    /// <summary>
    /// Cache duration in hours (default: 24)
    /// </summary>
    public int CacheHours { get; set; } = 24;
}

#endregion

#region CKAN API Response Models

internal class CkanSearchResponse
{
    public bool Success { get; set; }
    public CkanSearchResult? Result { get; set; }
}

internal class CkanSearchResult
{
    public int Count { get; set; }
    public List<CkanPackage>? Results { get; set; }
}

internal class CkanPackageResponse
{
    public bool Success { get; set; }
    public CkanPackage? Result { get; set; }
}

internal class CkanPackage
{
    public string? Id { get; set; }
    public string? Name { get; set; }
    public string? Title { get; set; }
    public string? Notes { get; set; }
    public CkanOrganization? Organization { get; set; }
    public DateTime? MetadataCreated { get; set; }
    public DateTime? MetadataModified { get; set; }
    public List<CkanTag>? Tags { get; set; }
    public List<CkanResource>? Resources { get; set; }
}

internal class CkanOrganization
{
    public string? Name { get; set; }
    public string? Title { get; set; }
}

internal class CkanTag
{
    public string? Name { get; set; }
}

internal class CkanResource
{
    public string? Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Format { get; set; }
    public string? Url { get; set; }
    public long? Size { get; set; }
    public DateTime? LastModified { get; set; }
}

internal class CkanDatastoreResponse
{
    public bool Success { get; set; }
    public CkanDatastoreResult? Result { get; set; }
}

internal class CkanDatastoreResult
{
    public int Total { get; set; }
    public List<CkanField>? Fields { get; set; }
    public List<Dictionary<string, object>>? Records { get; set; }
}

internal class CkanField
{
    public string? Id { get; set; }
    public string? Type { get; set; }
}

#endregion
