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
/// Scraper handler para STPS (Secretaría del Trabajo y Previsión Social)
/// Extrae normatividad laboral que afecta aportaciones SAR, salarios, cotizaciones
/// URL: https://www.gob.mx/stps
/// </summary>
public class StpsScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<StpsScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string StpsBaseUrl = "https://www.gob.mx/stps";
    private const string StpsDocumentosUrl = "https://www.gob.mx/stps/documentos";
    private const string StpsNormatividadUrl = "https://www.gob.mx/stps/acciones-y-programas/normatividad-laboral";
    private const string StpsSalariosUrl = "https://www.gob.mx/stps/acciones-y-programas/salarios-minimos";

    public ScraperSourceType SourceType => ScraperSourceType.STPS;

    public StpsScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<StpsScraperHandler> logger)
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
                        "Retry {RetryAttempt} for STPS request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.STPS;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting STPS scraping");

            // Scrape documentos y normatividad laboral
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add labor regulations affecting SAR
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"STPS-LFT-{DateTime.UtcNow:yyyyMM}",
                Title = "Ley Federal del Trabajo",
                Description = "Disposiciones de la LFT relativas a prestaciones, salarios y seguridad social",
                Code = $"STPS-LFT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Legislación Laboral",
                DocumentUrl = StpsNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "STPS",
                    ["type"] = "Ley",
                    ["impacto_sar"] = "Salarios,Aportaciones,Prestaciones",
                    ["periodicidad"] = "Eventual"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"STPS-SALARIOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Tabla de Salarios Mínimos",
                Description = "Salarios mínimos generales y profesionales vigentes por zona geográfica",
                Code = $"STPS-SAL-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Salarios STPS",
                DocumentUrl = StpsSalariosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "STPS",
                    ["type"] = "SalariosMinimos",
                    ["uso_sar"] = "Base para topes de cotización",
                    ["periodicidad"] = "Anual"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"STPS-REPARTO-{DateTime.UtcNow:yyyyMM}",
                Title = "Reglas de Reparto de Utilidades (PTU)",
                Description = "Normatividad de participación de trabajadores en utilidades",
                Code = $"STPS-PTU-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "PTU STPS",
                DocumentUrl = StpsNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "STPS",
                    ["type"] = "PTU",
                    ["impacto"] = "Ingresos gravables para cotización"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"STPS-OUTSOURCING-{DateTime.UtcNow:yyyyMM}",
                Title = "Reforma Outsourcing/Subcontratación",
                Description = "Regulación de subcontratación laboral y sus efectos en aportaciones patronales",
                Code = $"STPS-OUTS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Subcontratación STPS",
                DocumentUrl = StpsNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "STPS",
                    ["type"] = "Outsourcing",
                    ["impacto_sar"] = "Responsabilidad solidaria en aportaciones"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"STPS-TELETRABAJO-{DateTime.UtcNow:yyyyMM}",
                Title = "Normatividad de Teletrabajo",
                Description = "Reglas de teletrabajo y sus implicaciones en prestaciones laborales",
                Code = $"STPS-TELE-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Teletrabajo STPS",
                DocumentUrl = StpsNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "STPS",
                    ["type"] = "Teletrabajo",
                    ["impacto"] = "Prestaciones y seguridad social"
                }
            });

            _logger.LogInformation("STPS scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping STPS: {Message}", ex.Message);
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
                await _httpClient.GetAsync(StpsDocumentosUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='laboral'], a[href*='salario'], a[href*='trabajo']");

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

                var externalId = GenerateExternalId("STPS", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento STPS normatividad laboral",
                    Code = $"STPS-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos STPS",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "STPS",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping STPS documentos");
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
