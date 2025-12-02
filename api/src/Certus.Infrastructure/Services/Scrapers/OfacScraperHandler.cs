using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace Certus.Infrastructure.Services.Scrapers;

/// <summary>
/// Scraper handler para OFAC (Office of Foreign Assets Control)
/// Extrae lista SDN (Specially Designated Nationals) de sanciones internacionales
/// URL: https://sanctionslist.ofac.treas.gov/
/// </summary>
public class OfacScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OfacScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    // OFAC SDN List URLs
    private const string OfacSdnXmlUrl = "https://www.treasury.gov/ofac/downloads/sdn.xml";
    private const string OfacSdnCsvUrl = "https://www.treasury.gov/ofac/downloads/sdn.csv";
    private const string OfacConsolidatedUrl = "https://www.treasury.gov/ofac/downloads/consolidated/consolidated.xml";
    private const string OfacPortalUrl = "https://sanctionslist.ofac.treas.gov/";

    public ScraperSourceType SourceType => ScraperSourceType.OFAC;

    public OfacScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<OfacScraperHandler> logger)
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
                        "Retry {RetryAttempt} for OFAC request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.OFAC;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting OFAC SDN scraping");

            // Get SDN XML metadata
            var sdnInfo = await GetSdnListInfoAsync(cancellationToken);
            if (sdnInfo != null)
            {
                results.Add(sdnInfo);
            }

            // Add consolidated list reference
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"OFAC-CONSOLIDATED-{DateTime.UtcNow:yyyyMMdd}",
                Title = "OFAC Consolidated Sanctions List",
                Description = "Lista consolidada de sanciones OFAC incluyendo SDN, SSI, y otras listas",
                Code = $"OFAC-CONS-{DateTime.UtcNow:yyyyMMdd}",
                PublishDate = DateTime.UtcNow,
                Category = "Lista PLD OFAC",
                DocumentUrl = OfacConsolidatedUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "OFAC",
                    ["type"] = "ConsolidatedList",
                    ["format"] = "XML",
                    ["country"] = "USA"
                }
            });

            // Add CSV version reference
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"OFAC-SDN-CSV-{DateTime.UtcNow:yyyyMMdd}",
                Title = "OFAC SDN List (CSV Format)",
                Description = "Lista SDN de OFAC en formato CSV para procesamiento",
                Code = $"OFAC-SDN-CSV-{DateTime.UtcNow:yyyyMMdd}",
                PublishDate = DateTime.UtcNow,
                Category = "Lista PLD OFAC",
                DocumentUrl = OfacSdnCsvUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "OFAC",
                    ["type"] = "SDN",
                    ["format"] = "CSV",
                    ["country"] = "USA"
                }
            });

            _logger.LogInformation("OFAC scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping OFAC: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<ScrapedDocumentData?> GetSdnListInfoAsync(CancellationToken cancellationToken)
    {
        try
        {
            // Try to get the XML to extract publish date
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(OfacSdnXmlUrl, HttpCompletionOption.ResponseHeadersRead, cancellationToken));

            DateTime? publishDate = null;
            string? contentHash = null;

            if (response.IsSuccessStatusCode)
            {
                // Get last modified from headers
                if (response.Content.Headers.LastModified.HasValue)
                {
                    publishDate = response.Content.Headers.LastModified.Value.UtcDateTime;
                }

                // Try to parse XML for publish date
                try
                {
                    var xmlContent = await response.Content.ReadAsStringAsync(cancellationToken);
                    var doc = XDocument.Parse(xmlContent);
                    var publishDateElement = doc.Descendants("Publish_Date").FirstOrDefault();
                    if (publishDateElement != null && DateTime.TryParse(publishDateElement.Value, out var parsed))
                    {
                        publishDate = DateTime.SpecifyKind(parsed, DateTimeKind.Utc);
                    }

                    // Compute hash of the content
                    contentHash = ComputeHash(xmlContent);
                }
                catch
                {
                    // Ignore XML parsing errors
                }
            }

            return new ScrapedDocumentData
            {
                ExternalId = $"OFAC-SDN-{publishDate?.ToString("yyyyMMdd") ?? DateTime.UtcNow.ToString("yyyyMMdd")}",
                Title = "OFAC SDN List - Specially Designated Nationals",
                Description = "Lista oficial de Nacionales Especialmente Designados (SDN) del Departamento del Tesoro de EE.UU. para PLD",
                Code = $"OFAC-SDN-{DateTime.UtcNow:yyyyMMdd}",
                PublishDate = publishDate ?? DateTime.UtcNow,
                Category = "Lista PLD OFAC",
                DocumentUrl = OfacSdnXmlUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "OFAC",
                    ["type"] = "SDN",
                    ["format"] = "XML",
                    ["country"] = "USA",
                    ["contentHash"] = contentHash ?? ""
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error getting OFAC SDN info");
            return null;
        }
    }

    private static string ComputeHash(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
