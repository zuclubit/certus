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
/// Scraper handler para SUA (Sistema Único de Autodeterminación)
/// Extrae información sobre cálculo de aportaciones patronales IMSS/INFONAVIT/SAR
/// URL: https://www.imss.gob.mx/patrones/sua
/// </summary>
public class SuaScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SuaScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string SuaBaseUrl = "https://www.imss.gob.mx/patrones/sua";
    private const string GobMxImssUrl = "https://www.gob.mx/imss/documentos";
    private const string SuaDescargaUrl = "https://www.imss.gob.mx/patrones/sua/descarga";

    public ScraperSourceType SourceType => ScraperSourceType.SUA;

    public SuaScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<SuaScraperHandler> logger)
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
                        "Retry {RetryAttempt} for SUA request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.SUA;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting SUA scraping");

            // Scrape documentos SUA
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add SUA documents for employer contribution calculations
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SUA-VERSION-{DateTime.UtcNow:yyyyMM}",
                Title = "Versión Vigente SUA",
                Description = "Última versión del Sistema Único de Autodeterminación para cálculo de aportaciones",
                Code = $"SUA-VER-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Software SUA",
                DocumentUrl = SuaDescargaUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IMSS",
                    ["type"] = "Software",
                    ["uso"] = "Cálculo cuotas IMSS,RCV,INFONAVIT",
                    ["obligatoriedad"] = "Patrones con 5+ trabajadores"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SUA-TABLAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Tablas de Cuotas SUA",
                Description = "Tablas de porcentajes de cuotas patronales y obreras vigentes",
                Code = $"SUA-TAB-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Tablas SUA",
                DocumentUrl = SuaBaseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IMSS",
                    ["type"] = "TablaCuotas",
                    ["conceptos"] = "IMSS,RCV,INFONAVIT,Cesantía,Vejez"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SUA-LAYOUTS-{DateTime.UtcNow:yyyyMM}",
                Title = "Layouts de Importación SUA",
                Description = "Especificaciones de archivos de importación para el SUA",
                Code = $"SUA-LAY-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts SUA",
                DocumentUrl = SuaBaseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IMSS",
                    ["type"] = "Layouts",
                    ["formatos"] = "TXT,DBF"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SUA-MANUAL-{DateTime.UtcNow:yyyyMM}",
                Title = "Manual de Usuario SUA",
                Description = "Guía de operación del Sistema Único de Autodeterminación",
                Code = $"SUA-MAN-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Manual SUA",
                DocumentUrl = GobMxImssUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IMSS",
                    ["type"] = "Manual",
                    ["contenido"] = "Operación,Cálculos,Reportes"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SUA-ERRORES-{DateTime.UtcNow:yyyyMM}",
                Title = "Catálogo de Errores SUA",
                Description = "Códigos de error y soluciones para el SUA",
                Code = $"SUA-ERR-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Errores SUA",
                DocumentUrl = SuaBaseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IMSS",
                    ["type"] = "CatalogoErrores",
                    ["uso"] = "Troubleshooting"
                }
            });

            _logger.LogInformation("SUA scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping SUA: {Message}", ex.Message);
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
                await _httpClient.GetAsync(GobMxImssUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='sua'], a[href*='autodeterminacion'], a[href*='cuotas']");

            foreach (var link in links.Take(15))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.gob.mx" + documentUrl;

                var externalId = GenerateExternalId("SUA", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento SUA autodeterminación",
                    Code = $"SUA-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos SUA",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "IMSS",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping SUA documentos");
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
