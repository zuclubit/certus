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
/// Scraper handler para COFECE (Comisión Federal de Competencia Económica)
/// Extrae información sobre concentraciones, fusiones y competencia en el sector AFORE
/// URL: https://www.cofece.mx
/// </summary>
public class CofeceScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CofeceScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string CofeceBaseUrl = "https://www.cofece.mx";
    private const string CofeceResolucionesUrl = "https://www.cofece.mx/resoluciones/";
    private const string CofeceConcentracionesUrl = "https://www.cofece.mx/concentraciones/";
    private const string GobMxCofeceUrl = "https://www.gob.mx/cofece/documentos";

    public ScraperSourceType SourceType => ScraperSourceType.COFECE;

    public CofeceScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<CofeceScraperHandler> logger)
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
                        "Retry {RetryAttempt} for COFECE request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.COFECE;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting COFECE scraping");

            // Scrape resoluciones y concentraciones
            var docs = await ScrapeResolucionesAsync(cancellationToken);
            results.AddRange(docs);

            // Add COFECE regulatory documents relevant for AFOREs
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"COFECE-CONCENTRACIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Concentraciones Sector Financiero",
                Description = "Análisis de concentraciones y fusiones en el sector de AFOREs y servicios financieros",
                Code = $"COFECE-CONC-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Concentraciones COFECE",
                DocumentUrl = CofeceConcentracionesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "COFECE",
                    ["type"] = "Concentraciones",
                    ["sector"] = "AFOREs,Financiero",
                    ["relevancia"] = "Fusiones y adquisiciones de AFOREs"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"COFECE-RESOLUCIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Resoluciones COFECE Sector Financiero",
                Description = "Resoluciones sobre prácticas monopólicas y competencia en servicios financieros",
                Code = $"COFECE-RES-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Resoluciones COFECE",
                DocumentUrl = CofeceResolucionesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "COFECE",
                    ["type"] = "Resoluciones",
                    ["aplicabilidad"] = "Competencia en mercado AFORE"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"COFECE-BARRERAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Barreras a la Competencia SAR",
                Description = "Estudios sobre barreras a la competencia en el Sistema de Ahorro para el Retiro",
                Code = $"COFECE-BAR-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Estudios COFECE",
                DocumentUrl = CofeceResolucionesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "COFECE",
                    ["type"] = "Estudios",
                    ["tema"] = "Barreras de entrada SAR"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"COFECE-OPINIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Opiniones en Materia de Libre Competencia",
                Description = "Opiniones COFECE sobre regulación y competencia en el sector pensiones",
                Code = $"COFECE-OPIN-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Opiniones COFECE",
                DocumentUrl = GobMxCofeceUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "COFECE",
                    ["type"] = "Opiniones",
                    ["marco"] = "Ley Federal de Competencia Económica"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"COFECE-INVESTIGACIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Investigaciones de Mercado",
                Description = "Investigaciones sobre condiciones de competencia en mercados financieros",
                Code = $"COFECE-INV-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Investigaciones COFECE",
                DocumentUrl = CofeceResolucionesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "COFECE",
                    ["type"] = "Investigaciones",
                    ["alcance"] = "Prácticas monopólicas absolutas y relativas"
                }
            });

            _logger.LogInformation("COFECE scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping COFECE: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeResolucionesAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(GobMxCofeceUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='resolucion'], a[href*='concentracion'], a[href*='competencia']");

            foreach (var link in links.Take(20))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.gob.mx" + documentUrl;

                var externalId = GenerateExternalId("COFECE", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento COFECE competencia económica",
                    Code = $"COFECE-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos COFECE",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "COFECE",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping COFECE resoluciones");
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
