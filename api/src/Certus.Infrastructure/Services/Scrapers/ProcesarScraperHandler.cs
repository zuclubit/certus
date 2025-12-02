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
/// Scraper handler para PROCESAR (Empresa Operadora de la Base de Datos Nacional SAR)
/// Extrae layouts técnicos, especificaciones de archivos, documentación operativa
/// URL: https://www.procesar.com.mx
/// </summary>
public class ProcesarScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ProcesarScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string ProcesarBaseUrl = "https://www.procesar.com.mx";
    private const string ProcesarDocumentacionUrl = "https://www.procesar.com.mx/documentacion";
    private const string ProcesarLayoutsUrl = "https://www.procesar.com.mx/layouts";

    public ScraperSourceType SourceType => ScraperSourceType.PROCESAR;

    public ProcesarScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<ProcesarScraperHandler> logger)
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
                        "Retry {RetryAttempt} for PROCESAR request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.PROCESAR;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting PROCESAR scraping");

            // Scrape documentación técnica
            var docs = await ScrapeDocumentacionAsync(cancellationToken);
            results.AddRange(docs);

            // Add layout specifications reference documents
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PROCESAR-LAYOUT-MOV-{DateTime.UtcNow:yyyyMM}",
                Title = "Layout de Movimientos SAR",
                Description = "Especificación técnica del layout de movimientos afiliatorios y de cuenta individual",
                Code = $"PROCESAR-MOV-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts PROCESAR",
                DocumentUrl = ProcesarLayoutsUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PROCESAR",
                    ["type"] = "Layout",
                    ["formato"] = "TXT delimitado",
                    ["version"] = DateTime.UtcNow.Year.ToString()
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PROCESAR-LAYOUT-TRASP-{DateTime.UtcNow:yyyyMM}",
                Title = "Layout de Traspasos SAR",
                Description = "Especificación técnica del layout de traspasos entre AFOREs",
                Code = $"PROCESAR-TRASP-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts PROCESAR",
                DocumentUrl = ProcesarLayoutsUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PROCESAR",
                    ["type"] = "Layout",
                    ["formato"] = "TXT delimitado",
                    ["proceso"] = "Traspasos"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PROCESAR-LAYOUT-RET-{DateTime.UtcNow:yyyyMM}",
                Title = "Layout de Retiros SAR",
                Description = "Especificación técnica del layout de retiros parciales y totales",
                Code = $"PROCESAR-RET-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts PROCESAR",
                DocumentUrl = ProcesarLayoutsUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PROCESAR",
                    ["type"] = "Layout",
                    ["formato"] = "TXT delimitado",
                    ["proceso"] = "Retiros"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PROCESAR-LAYOUT-APOR-{DateTime.UtcNow:yyyyMM}",
                Title = "Layout de Aportaciones SAR",
                Description = "Especificación técnica del layout de aportaciones RCV, voluntarias y complementarias",
                Code = $"PROCESAR-APOR-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts PROCESAR",
                DocumentUrl = ProcesarLayoutsUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PROCESAR",
                    ["type"] = "Layout",
                    ["formato"] = "TXT delimitado",
                    ["proceso"] = "Aportaciones"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PROCESAR-BDNSAR-{DateTime.UtcNow:yyyyMM}",
                Title = "Manual Operativo BDNSAR",
                Description = "Manual operativo de la Base de Datos Nacional SAR",
                Code = $"PROCESAR-BDNSAR-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Manuales PROCESAR",
                DocumentUrl = ProcesarDocumentacionUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PROCESAR",
                    ["type"] = "Manual",
                    ["sistema"] = "BDNSAR"
                }
            });

            _logger.LogInformation("PROCESAR scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping PROCESAR: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeDocumentacionAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(ProcesarBaseUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='layout'], a[href*='manual'], a[href*='documento']");

            foreach (var link in links.Take(20))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = ProcesarBaseUrl + documentUrl;

                var externalId = GenerateExternalId("PROCESAR", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documentación técnica PROCESAR - Base de Datos Nacional SAR",
                    Code = $"PROCESAR-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos PROCESAR",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "PROCESAR",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping PROCESAR documentación");
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
