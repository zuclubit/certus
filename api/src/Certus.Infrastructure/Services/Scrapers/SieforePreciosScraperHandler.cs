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
/// Scraper handler para Precios de SIEFOREs
/// Extrae precios diarios de acciones, rendimientos históricos y datos de valuación
/// URL: https://www.consar.gob.mx / https://www.gob.mx/consar
/// </summary>
public class SieforePreciosScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SieforePreciosScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string ConsarPreciosUrl = "https://www.gob.mx/consar/acciones-y-programas/precios-de-las-siefores";
    private const string ConsarRendimientosUrl = "https://www.gob.mx/consar/acciones-y-programas/rendimiento-neto";
    private const string ConsarIndicadoresUrl = "https://www.gob.mx/consar/acciones-y-programas/indicadores-del-sar";
    private const string ConsarComisionesUrl = "https://www.gob.mx/consar/acciones-y-programas/comisiones-de-las-afores";

    public ScraperSourceType SourceType => ScraperSourceType.SIEFOREPrecios;

    public SieforePreciosScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<SieforePreciosScraperHandler> logger)
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
                        "Retry {RetryAttempt} for SIEFORE Precios request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.SIEFOREPrecios;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting SIEFORE Precios scraping");

            // Scrape precios y rendimientos
            var docs = await ScrapePreciosAsync(cancellationToken);
            results.AddRange(docs);

            // Add daily prices
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SIEFORE-PRECIOS-{DateTime.UtcNow:yyyyMMdd}",
                Title = "Precios Diarios de SIEFOREs",
                Description = "Precios de valuación diarios de todas las SIEFOREs por AFORE",
                Code = $"SIEFORE-PREC-{DateTime.UtcNow:yyyyMMdd}",
                PublishDate = DateTime.UtcNow,
                Category = "Precios SIEFORE",
                DocumentUrl = ConsarPreciosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Precios",
                    ["periodicidad"] = "Diario",
                    ["formato"] = "CSV/XLS",
                    ["fecha"] = DateTime.UtcNow.ToString("yyyy-MM-dd")
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SIEFORE-RENDIMIENTO-{DateTime.UtcNow:yyyyMM}",
                Title = "Rendimiento Neto de SIEFOREs",
                Description = "Rendimiento neto histórico (IRN) de SIEFOREs a diferentes plazos",
                Code = $"SIEFORE-REND-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Rendimientos SIEFORE",
                DocumentUrl = ConsarRendimientosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Rendimiento",
                    ["indicador"] = "IRN",
                    ["plazos"] = "12m,36m,60m",
                    ["periodicidad"] = "Mensual"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SIEFORE-COMISIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Comisiones de AFOREs",
                Description = "Estructura de comisiones vigentes por AFORE",
                Code = $"SIEFORE-COM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Comisiones AFORE",
                DocumentUrl = ConsarComisionesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Comisiones",
                    ["periodicidad"] = "Anual",
                    ["base"] = "Sobre saldo"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SIEFORE-INDICADORES-{DateTime.UtcNow:yyyyMM}",
                Title = "Indicadores del SAR",
                Description = "Indicadores estadísticos del Sistema de Ahorro para el Retiro",
                Code = $"SIEFORE-IND-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Indicadores SAR",
                DocumentUrl = ConsarIndicadoresUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Indicadores",
                    ["metricas"] = "Activos,Cuentas,Traspasos",
                    ["periodicidad"] = "Mensual"
                }
            });

            // SIEFORE types by generation
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SIEFORE-GENERACIONAL-{DateTime.UtcNow:yyyyMM}",
                Title = "SIEFOREs Generacionales",
                Description = "Precios y rendimientos de SIEFOREs por generación (Básica Inicial, Básica 90-94, etc.)",
                Code = $"SIEFORE-GEN-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "SIEFOREs Generacionales",
                DocumentUrl = ConsarPreciosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Generacional",
                    ["fondos"] = "Básica Inicial,Básica 90-94,Básica 85-89,Básica 80-84,Básica 75-79,Básica 70-74,Básica 65-69,Básica 60-64,Básica Pensiones"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SIEFORE-HISTORICO-{DateTime.UtcNow:yyyyMM}",
                Title = "Histórico de Precios SIEFORE",
                Description = "Serie histórica de precios de SIEFOREs para análisis de rendimientos",
                Code = $"SIEFORE-HIST-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Histórico Precios",
                DocumentUrl = ConsarPreciosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Historico",
                    ["formato"] = "CSV/XLS",
                    ["periodicidad"] = "Diario"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SIEFORE-PLUSVALIA-{DateTime.UtcNow:yyyyMM}",
                Title = "Plusvalía/Minusvalía SIEFOREs",
                Description = "Variación de precios y plusvalía/minusvalía por SIEFORE",
                Code = $"SIEFORE-PLUS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Plusvalía SIEFORE",
                DocumentUrl = ConsarPreciosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Plusvalia",
                    ["periodicidad"] = "Diario"
                }
            });

            _logger.LogInformation("SIEFORE Precios scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping SIEFORE Precios: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapePreciosAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(ConsarPreciosUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.csv'], a[href*='.xls'], a[href*='.xlsx'], a[href*='precio'], a[href*='siefore']");

            foreach (var link in links.Take(25))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 3)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.gob.mx" + documentUrl;

                var externalId = GenerateExternalId("SIEFORE", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                var format = GetFileFormat(documentUrl);

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Datos de precios SIEFORE CONSAR",
                    Code = $"SIEFORE-DATA-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Datos SIEFORE",
                    DocumentUrl = documentUrl,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CONSAR",
                        ["type"] = "Datos",
                        ["formato"] = format,
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping SIEFORE precios");
        }

        return results;
    }

    private static string GetFileFormat(string url)
    {
        if (url.Contains(".csv", StringComparison.OrdinalIgnoreCase)) return "CSV";
        if (url.Contains(".xlsx", StringComparison.OrdinalIgnoreCase)) return "XLSX";
        if (url.Contains(".xls", StringComparison.OrdinalIgnoreCase)) return "XLS";
        if (url.Contains(".pdf", StringComparison.OrdinalIgnoreCase)) return "PDF";
        if (url.Contains(".zip", StringComparison.OrdinalIgnoreCase)) return "ZIP";
        return "HTML";
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
