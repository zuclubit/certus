using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using AngleSharp;
using AngleSharp.Html.Dom;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace Certus.Infrastructure.Services.Scrapers;

/// <summary>
/// Scraper handler para SHCP (Secretaría de Hacienda y Crédito Público)
/// Extrae normatividad fiscal, leyes financieras, disposiciones
/// URL: https://www.gob.mx/shcp
/// </summary>
public class ShcpScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ShcpScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string ShcpBaseUrl = "https://www.gob.mx/shcp";
    private const string ShcpDocumentosUrl = "https://www.gob.mx/shcp/documentos/marco-juridico-secretaria-de-hacienda-y-credito-publico";
    private const string ShcpNormatividadUrl = "https://www.gob.mx/shcp/documentos/normatividad-del-spc-en-la-shcp";
    private const string ShcpLeyesUrl = "http://www.hacienda.gob.mx/lashcp/MarcoJuridico/documentosDOF/archivos_shcp_dof/leyes/index.html";

    public ScraperSourceType SourceType => ScraperSourceType.SHCP;

    public ShcpScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<ShcpScraperHandler> logger)
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
                        "Retry {RetryAttempt} for SHCP request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.SHCP;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting SHCP scraping");

            // Scrape documentos principales
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Scrape normatividad
            var normDocs = await ScrapeNormatividadAsync(cancellationToken);
            results.AddRange(normDocs);

            _logger.LogInformation("SHCP scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping SHCP: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeDocumentosAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(ShcpDocumentosUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("SHCP documentos request failed with status {Status}", response.StatusCode);
                return results;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);

            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Find document links
            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='documento'], a[href*='circular']");

            foreach (var link in links)
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 10)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.gob.mx" + documentUrl;

                var externalId = GenerateExternalId("SHCP-DOC", title, documentUrl);

                // Skip duplicates
                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                var category = DetermineCategory(title, documentUrl);

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = $"Documento SHCP - {category}",
                    Code = $"SHCP-{DateTime.UtcNow:yyyyMMdd}",
                    PublishDate = DateTime.UtcNow,
                    Category = category,
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "SHCP",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }

            // Add main documents page reference if no docs found
            if (results.Count == 0)
            {
                results.Add(new ScrapedDocumentData
                {
                    ExternalId = $"SHCP-DOCS-{DateTime.UtcNow:yyyyMMdd}",
                    Title = "Documentos SHCP",
                    Description = "Portal de documentos de la Secretaría de Hacienda y Crédito Público",
                    Code = $"SHCP-DOCS-{DateTime.UtcNow:yyyyMMdd}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos SHCP",
                    DocumentUrl = ShcpDocumentosUrl,
                    RawHtml = html.Length > 50000 ? html[..50000] : html,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "SHCP",
                        ["type"] = "Portal"
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping SHCP documentos");
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeNormatividadAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(ShcpNormatividadUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);

            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Find normatividad links
            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='ley'], a[href*='reglamento'], a[href*='circular']");

            foreach (var link in links)
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.gob.mx" + documentUrl;

                var externalId = GenerateExternalId("SHCP-NORM", title, documentUrl);

                // Skip duplicates
                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Normatividad de la Secretaría de Hacienda y Crédito Público",
                    Code = $"SHCP-NORM-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Normatividad SHCP",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "SHCP",
                        ["type"] = "Normatividad",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }

            // Add normatividad reference
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SHCP-NORMATIVIDAD-{DateTime.UtcNow:yyyyMM}",
                Title = "Normatividad SHCP",
                Description = "Marco normativo de la Secretaría de Hacienda y Crédito Público",
                Code = $"SHCP-NORM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Normatividad SHCP",
                DocumentUrl = ShcpNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SHCP",
                    ["type"] = "Portal"
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping SHCP normatividad");
        }

        return results;
    }

    private static string DetermineCategory(string title, string url)
    {
        var titleLower = title.ToLowerInvariant();
        var urlLower = url.ToLowerInvariant();

        if (titleLower.Contains("ley") || urlLower.Contains("ley"))
            return "Leyes SHCP";
        if (titleLower.Contains("reglamento") || urlLower.Contains("reglamento"))
            return "Reglamentos SHCP";
        if (titleLower.Contains("circular") || urlLower.Contains("circular"))
            return "Circulares SHCP";
        if (titleLower.Contains("manual") || urlLower.Contains("manual"))
            return "Manuales SHCP";
        if (titleLower.Contains("acuerdo") || urlLower.Contains("acuerdo"))
            return "Acuerdos SHCP";

        return "Documentos SHCP";
    }

    private static string GenerateExternalId(string prefix, string title, string? url)
    {
        var input = $"{prefix}-{title}-{url}";
        return $"{prefix}-{ComputeHash(input)[..16]}";
    }

    private static string ComputeHash(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static string CleanTitle(string? title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return "Sin título";

        title = Regex.Replace(title, @"\s+", " ").Trim();

        if (title.Length > 500)
            title = title[..497] + "...";

        return title;
    }
}
