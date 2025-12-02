using System.Globalization;
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
/// Scraper handler para el Servicio de Administración Tributaria (SAT)
/// Extrae Lista 69B, catálogo RFC, contribuyentes no válidos
/// URL: https://www.sat.gob.mx
/// </summary>
public class SatScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SatScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string SatBaseUrl = "https://www.sat.gob.mx";
    private const string Lista69BUrl = "https://www.sat.gob.mx/consultas/76674/consulta-la-relacion-de-contribuyentes-con-operaciones-presuntamente-inexistentes";
    private const string ListaNegraUrl = "https://www.sat.gob.mx/consultas/25782/consulta-la-lista-negra-del-sat";

    public ScraperSourceType SourceType => ScraperSourceType.SAT;

    public SatScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<SatScraperHandler> logger)
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
                        "Retry {RetryAttempt} for SAT request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.SAT;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting SAT scraping");

            // Scrape Lista 69B
            var lista69BDocs = await ScrapeLista69BAsync(cancellationToken);
            results.AddRange(lista69BDocs);

            // Scrape Lista Negra
            var listaNegraDocs = await ScrapeListaNegraAsync(cancellationToken);
            results.AddRange(listaNegraDocs);

            _logger.LogInformation("SAT scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping SAT: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeLista69BAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(Lista69BUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);

            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Find download links for Lista 69B
            var links = document.QuerySelectorAll("a[href*='.csv'], a[href*='.xlsx'], a[href*='.pdf'], a[href*='69B'], a[href*='69-B']");

            foreach (var link in links)
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title))
                    title = "Lista 69B SAT";

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = SatBaseUrl + documentUrl;

                var externalId = GenerateExternalId("SAT-69B", title, documentUrl);

                // Skip if already added
                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Lista de contribuyentes con operaciones presuntamente inexistentes (Art. 69-B CFF)",
                    Code = $"SAT-69B-{DateTime.UtcNow:yyyyMMdd}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Lista 69B",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "SAT",
                        ["type"] = "Lista69B",
                        ["articulo"] = "69-B CFF",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }

            // Add the main page as a document if no files found
            if (results.Count == 0)
            {
                results.Add(new ScrapedDocumentData
                {
                    ExternalId = $"SAT-69B-PAGE-{DateTime.UtcNow:yyyyMMdd}",
                    Title = "Lista 69B - Contribuyentes con Operaciones Inexistentes",
                    Description = "Consulta de relación de contribuyentes con operaciones presuntamente inexistentes según Art. 69-B del CFF",
                    Code = $"SAT-69B-{DateTime.UtcNow:yyyyMMdd}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Lista 69B",
                    DocumentUrl = Lista69BUrl,
                    RawHtml = html.Length > 50000 ? html[..50000] : html,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "SAT",
                        ["type"] = "Lista69B",
                        ["articulo"] = "69-B CFF"
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping SAT Lista 69B");
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeListaNegraAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(ListaNegraUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);

            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Find download links
            var links = document.QuerySelectorAll("a[href*='.csv'], a[href*='.xlsx'], a[href*='.pdf']");

            foreach (var link in links)
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title))
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = SatBaseUrl + documentUrl;

                var externalId = GenerateExternalId("SAT-LN", title, documentUrl);

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Lista negra del SAT - Contribuyentes incumplidos",
                    Code = $"SAT-LN-{DateTime.UtcNow:yyyyMMdd}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Lista Negra",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "SAT",
                        ["type"] = "ListaNegra",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping SAT Lista Negra");
        }

        return results;
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
