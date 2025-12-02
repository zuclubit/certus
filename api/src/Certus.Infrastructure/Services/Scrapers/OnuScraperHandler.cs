using System.Security.Cryptography;
using System.Text;
using System.Xml.Linq;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace Certus.Infrastructure.Services.Scrapers;

/// <summary>
/// Scraper handler para listas de sanciones de la ONU
/// Extrae lista consolidada del Consejo de Seguridad de las Naciones Unidas
/// URL: https://scsanctions.un.org/
/// </summary>
public class OnuScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OnuScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    // UN Security Council Consolidated List URLs
    private const string UnConsolidatedXmlUrl = "https://scsanctions.un.org/resources/xml/en/consolidated.xml";
    private const string UnPortalUrl = "https://scsanctions.un.org/search/";
    private const string Un1267Url = "https://scsanctions.un.org/1267/aq_sanctions_list.shtml";

    public ScraperSourceType SourceType => ScraperSourceType.ONU;

    public OnuScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<OnuScraperHandler> logger)
    {
        _httpClient = httpClientFactory.CreateClient("Scraper");
        _logger = logger;

        _retryPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
            .Or<HttpRequestException>()
            .WaitAndRetryAsync(
                3,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (outcome, timespan, retryAttempt, context) =>
                {
                    _logger.LogWarning(
                        "Retry {RetryAttempt} for UN request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.ONU;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting UN sanctions list scraping");

            // Get consolidated sanctions list info
            var consolidatedInfo = await GetConsolidatedListInfoAsync(cancellationToken);
            if (consolidatedInfo != null)
            {
                results.Add(consolidatedInfo);
            }

            // Add 1267 (Al-Qaeda/Taliban) list reference
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"UN-1267-{DateTime.UtcNow:yyyyMMdd}",
                Title = "Lista de Sanciones ONU 1267 - Al-Qaeda/Taliban",
                Description = "Lista de sanciones del Comité 1267 del Consejo de Seguridad de la ONU (Al-Qaeda/ISIL/Taliban)",
                Code = $"UN-1267-{DateTime.UtcNow:yyyyMMdd}",
                PublishDate = DateTime.UtcNow,
                Category = "Lista PLD ONU",
                DocumentUrl = Un1267Url,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "ONU",
                    ["type"] = "1267Committee",
                    ["resolution"] = "1267",
                    ["international"] = "true"
                }
            });

            // Add portal reference
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"UN-PORTAL-{DateTime.UtcNow:yyyyMM}",
                Title = "Portal de Sanciones del Consejo de Seguridad de la ONU",
                Description = "Portal oficial de búsqueda de listas de sanciones del Consejo de Seguridad de las Naciones Unidas",
                Code = $"UN-PORTAL-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Lista PLD ONU",
                DocumentUrl = UnPortalUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "ONU",
                    ["type"] = "Portal",
                    ["international"] = "true"
                }
            });

            _logger.LogInformation("UN sanctions scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping UN sanctions: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<ScrapedDocumentData?> GetConsolidatedListInfoAsync(CancellationToken cancellationToken)
    {
        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(UnConsolidatedXmlUrl, HttpCompletionOption.ResponseHeadersRead, cancellationToken));

            DateTime? publishDate = null;
            string? contentHash = null;
            int? entityCount = null;

            if (response.IsSuccessStatusCode)
            {
                // Get last modified from headers
                if (response.Content.Headers.LastModified.HasValue)
                {
                    publishDate = response.Content.Headers.LastModified.Value.UtcDateTime;
                }

                // Try to parse XML for metadata
                try
                {
                    var xmlContent = await response.Content.ReadAsStringAsync(cancellationToken);
                    var doc = XDocument.Parse(xmlContent);

                    // Try to get date generated
                    var dateGenerated = doc.Root?.Attribute("dateGenerated")?.Value;
                    if (!string.IsNullOrEmpty(dateGenerated) && DateTime.TryParse(dateGenerated, out var parsed))
                    {
                        publishDate = DateTime.SpecifyKind(parsed, DateTimeKind.Utc);
                    }

                    // Count entities
                    entityCount = doc.Descendants("INDIVIDUAL").Count() + doc.Descendants("ENTITY").Count();

                    // Compute hash
                    contentHash = ComputeHash(xmlContent);
                }
                catch
                {
                    // Ignore XML parsing errors
                }
            }

            return new ScrapedDocumentData
            {
                ExternalId = $"UN-CONSOLIDATED-{publishDate?.ToString("yyyyMMdd") ?? DateTime.UtcNow.ToString("yyyyMMdd")}",
                Title = "Lista Consolidada de Sanciones del Consejo de Seguridad de la ONU",
                Description = $"Lista consolidada de sanciones de la ONU que incluye individuos y entidades sancionadas. {(entityCount.HasValue ? $"Contiene {entityCount} registros." : "")}",
                Code = $"UN-CONS-{DateTime.UtcNow:yyyyMMdd}",
                PublishDate = publishDate ?? DateTime.UtcNow,
                Category = "Lista PLD ONU",
                DocumentUrl = UnConsolidatedXmlUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "ONU",
                    ["type"] = "ConsolidatedList",
                    ["format"] = "XML",
                    ["international"] = "true",
                    ["entityCount"] = entityCount?.ToString() ?? "",
                    ["contentHash"] = contentHash ?? ""
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error getting UN consolidated list info");
            return null;
        }
    }

    private static string ComputeHash(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
