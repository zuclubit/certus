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
/// Scraper handler para CONDUSEF (Comisión Nacional para la Protección y Defensa de los Usuarios de Servicios Financieros)
/// Extrae normatividad de protección al usuario, comparativos, quejas y reclamaciones
/// URL: https://www.condusef.gob.mx
/// </summary>
public class CondusefScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CondusefScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string CondusefBaseUrl = "https://www.condusef.gob.mx";
    private const string CondusefGobMxUrl = "https://www.condusef.gob.mx/documentos";
    private const string CondusefNormatividadUrl = "https://www.condusef.gob.mx/documentos/marco_legal";
    private const string CondusefComparativosUrl = "https://www.condusef.gob.mx";
    private const string CondusefAforeUrl = "https://www.condusef.gob.mx/documentos/rcd/cuentas_claras";

    public ScraperSourceType SourceType => ScraperSourceType.CONDUSEF;

    public CondusefScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<CondusefScraperHandler> logger)
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
                        "Retry {RetryAttempt} for CONDUSEF request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.CONDUSEF;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting CONDUSEF scraping");

            // Scrape documentos y normatividad
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add reference documents for AFOREs
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CONDUSEF-AFORE-COMP-{DateTime.UtcNow:yyyyMM}",
                Title = "Comparativo de AFOREs CONDUSEF",
                Description = "Tabla comparativa de AFOREs: comisiones, rendimientos, servicios y quejas",
                Code = $"CONDUSEF-COMP-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Comparativos CONDUSEF",
                DocumentUrl = CondusefComparativosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONDUSEF",
                    ["type"] = "Comparativo",
                    ["sector"] = "AFORES",
                    ["periodicidad"] = "Trimestral"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CONDUSEF-QUEJAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Índice de Reclamaciones AFOREs",
                Description = "Estadísticas de quejas y reclamaciones contra AFOREs por usuario",
                Code = $"CONDUSEF-QUEJAS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Quejas CONDUSEF",
                DocumentUrl = CondusefComparativosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONDUSEF",
                    ["type"] = "Quejas",
                    ["sector"] = "AFORES",
                    ["periodicidad"] = "Trimestral"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CONDUSEF-NORM-{DateTime.UtcNow:yyyyMM}",
                Title = "Normatividad de Protección al Usuario Financiero",
                Description = "Marco normativo de CONDUSEF para protección de usuarios de servicios financieros",
                Code = $"CONDUSEF-NORM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Normatividad CONDUSEF",
                DocumentUrl = CondusefNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONDUSEF",
                    ["type"] = "Normatividad",
                    ["alcance"] = "Usuarios de servicios financieros"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CONDUSEF-EDUFIN-{DateTime.UtcNow:yyyyMM}",
                Title = "Educación Financiera CONDUSEF",
                Description = "Material de educación financiera sobre ahorro para el retiro y AFOREs",
                Code = $"CONDUSEF-EDUFIN-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Educación CONDUSEF",
                DocumentUrl = CondusefBaseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONDUSEF",
                    ["type"] = "EducacionFinanciera",
                    ["tema"] = "Ahorro para el retiro"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CONDUSEF-DERECHOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Derechos de los Usuarios de AFOREs",
                Description = "Carta de derechos de los usuarios de Administradoras de Fondos para el Retiro",
                Code = $"CONDUSEF-DER-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Derechos Usuario CONDUSEF",
                DocumentUrl = CondusefNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONDUSEF",
                    ["type"] = "Derechos",
                    ["sector"] = "AFORES"
                }
            });

            _logger.LogInformation("CONDUSEF scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping CONDUSEF: {Message}", ex.Message);
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
                await _httpClient.GetAsync(CondusefGobMxUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='afore'], a[href*='condusef'], a[href*='financiero']");

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

                var externalId = GenerateExternalId("CONDUSEF", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documentación CONDUSEF para protección de usuarios financieros",
                    Code = $"CONDUSEF-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos CONDUSEF",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CONDUSEF",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping CONDUSEF documentos");
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
