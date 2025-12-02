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
/// Scraper handler para PRODECON (Procuraduría de la Defensa del Contribuyente)
/// Extrae información sobre defensa del contribuyente relevante para AFOREs
/// URL: https://www.prodecon.gob.mx
/// </summary>
public class ProdeconScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ProdeconScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string ProdeconBaseUrl = "https://www.prodecon.gob.mx";
    private const string GobMxProdeconUrl = "https://www.gob.mx/prodecon/documentos";
    private const string ProdeconCriteriosUrl = "https://www.gob.mx/prodecon/acciones-y-programas/criterios-normativos";

    public ScraperSourceType SourceType => ScraperSourceType.PRODECON;

    public ProdeconScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<ProdeconScraperHandler> logger)
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
                        "Retry {RetryAttempt} for PRODECON request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.PRODECON;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting PRODECON scraping");

            // Scrape documentos y criterios
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add PRODECON documents relevant for AFORE tax matters
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PRODECON-CRITERIOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Criterios Normativos PRODECON",
                Description = "Criterios de interpretación fiscal relevantes para aportaciones y retiros SAR",
                Code = $"PRODECON-CRIT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Criterios PRODECON",
                DocumentUrl = ProdeconCriteriosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PRODECON",
                    ["type"] = "Criterios",
                    ["relevancia"] = "Interpretación fiscal SAR",
                    ["aplicacion"] = "Retenciones,Aportaciones"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PRODECON-RECOMENDACIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Recomendaciones PRODECON",
                Description = "Recomendaciones sobre tratamiento fiscal de pensiones y retiros",
                Code = $"PRODECON-REC-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Recomendaciones PRODECON",
                DocumentUrl = GobMxProdeconUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PRODECON",
                    ["type"] = "Recomendaciones",
                    ["tema"] = "Pensiones,Retiros,ISR"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PRODECON-ACUERDOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Acuerdos Conclusivos",
                Description = "Acuerdos conclusivos en materia de aportaciones de seguridad social",
                Code = $"PRODECON-ACUE-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Acuerdos PRODECON",
                DocumentUrl = GobMxProdeconUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PRODECON",
                    ["type"] = "AcuerdosConclusivos",
                    ["aplicacion"] = "Resolución de controversias fiscales"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PRODECON-CONSULTAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Consultas Especializadas SAR",
                Description = "Consultas sobre tratamiento fiscal de planes de pensiones y AFOREs",
                Code = $"PRODECON-CONS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Consultas PRODECON",
                DocumentUrl = GobMxProdeconUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PRODECON",
                    ["type"] = "Consultas",
                    ["tema"] = "Deducibilidad,Exenciones,Retenciones"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PRODECON-ISR-PENSIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "ISR en Pensiones y Retiros",
                Description = "Criterios sobre ISR aplicable a pensiones, jubilaciones y retiros de AFOREs",
                Code = $"PRODECON-ISR-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Fiscal PRODECON",
                DocumentUrl = ProdeconCriteriosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PRODECON",
                    ["type"] = "ISR",
                    ["conceptos"] = "Art93 LISR,Exenciones,Retenciones"
                }
            });

            _logger.LogInformation("PRODECON scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping PRODECON: {Message}", ex.Message);
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
                await _httpClient.GetAsync(GobMxProdeconUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='criterio'], a[href*='recomendacion'], a[href*='fiscal']");

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

                var externalId = GenerateExternalId("PRODECON", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento PRODECON defensa del contribuyente",
                    Code = $"PRODECON-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos PRODECON",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "PRODECON",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping PRODECON documentos");
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
