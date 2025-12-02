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
/// Scraper handler para UIF (Unidad de Inteligencia Financiera)
/// Extrae lista de personas bloqueadas PLD nacional de México
/// URL: https://www.gob.mx/uif
/// </summary>
public class UifScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<UifScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string UifBaseUrl = "https://www.uif.gob.mx";
    private const string UifListaUrl = "https://www.gob.mx/cms/uploads/attachment/file/981502/LPB.pdf";
    private const string UifListaPageUrl = "https://www.gob.mx/uif/prensa";
    private const string UifSancionesUrl = "https://www.uif.gob.mx/work/models/uif/librerias/documentos/estadisticas/";

    public ScraperSourceType SourceType => ScraperSourceType.UIF;

    public UifScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<UifScraperHandler> logger)
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
                        "Retry {RetryAttempt} for UIF request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.UIF;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting UIF scraping");

            // Scrape lista de personas bloqueadas
            var listaDocs = await ScrapeListaPersonasBloqueadasAsync(cancellationToken);
            results.AddRange(listaDocs);

            // Scrape documentos PLD
            var pldDocs = await ScrapePldDocumentsAsync(cancellationToken);
            results.AddRange(pldDocs);

            _logger.LogInformation("UIF scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping UIF: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeListaPersonasBloqueadasAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(UifListaUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                // Add reference document
                results.Add(CreateListaReferenceDocument());
                return results;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);

            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Find download links for the blocked persons list
            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='.xlsx'], a[href*='.csv'], a[href*='bloqueadas'], a[href*='lista']");

            foreach (var link in links)
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title))
                    continue;

                var documentUrl = anchor.Href;
                var externalId = GenerateExternalId("UIF-LPB", title, documentUrl);

                // Skip if already added
                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Lista de personas bloqueadas UIF - PLD Nacional México",
                    Code = $"UIF-LPB-{DateTime.UtcNow:yyyyMMdd}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Lista PLD UIF",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "UIF",
                        ["type"] = "ListaPersonasBloqueadas",
                        ["country"] = "MEX",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }

            // If no specific files found, add the page reference
            if (results.Count == 0)
            {
                results.Add(new ScrapedDocumentData
                {
                    ExternalId = $"UIF-LPB-PAGE-{DateTime.UtcNow:yyyyMMdd}",
                    Title = "Lista de Personas Bloqueadas UIF",
                    Description = "Consulta de lista de personas bloqueadas de la UIF para prevención de lavado de dinero",
                    Code = $"UIF-LPB-{DateTime.UtcNow:yyyyMMdd}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Lista PLD UIF",
                    DocumentUrl = UifListaUrl,
                    RawHtml = html.Length > 50000 ? html[..50000] : html,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "UIF",
                        ["type"] = "ListaPersonasBloqueadas",
                        ["country"] = "MEX"
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping UIF lista personas bloqueadas");
            results.Add(CreateListaReferenceDocument());
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapePldDocumentsAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(UifSancionesUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);

            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Find PLD related documents
            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='circular'], a[href*='disposicion']");

            foreach (var link in links)
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 10)
                    continue;

                var documentUrl = anchor.Href;
                var externalId = GenerateExternalId("UIF-PLD", title, documentUrl);

                // Skip if already added
                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento PLD de la Unidad de Inteligencia Financiera",
                    Code = $"UIF-PLD-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos PLD",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "UIF",
                        ["type"] = "DocumentoPLD",
                        ["country"] = "MEX"
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping UIF PLD documents");
        }

        return results;
    }

    private static ScrapedDocumentData CreateListaReferenceDocument()
    {
        return new ScrapedDocumentData
        {
            ExternalId = $"UIF-REF-{DateTime.UtcNow:yyyyMMdd}",
            Title = "Lista de Personas Bloqueadas UIF",
            Description = "Referencia a la lista oficial de personas bloqueadas de la UIF para PLD",
            Code = $"UIF-LPB-{DateTime.UtcNow:yyyyMMdd}",
            PublishDate = DateTime.UtcNow,
            Category = "Lista PLD UIF",
            DocumentUrl = UifListaUrl,
            Metadata = new Dictionary<string, string>
            {
                ["source"] = "UIF",
                ["type"] = "ListaPersonasBloqueadas",
                ["country"] = "MEX"
            }
        };
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
