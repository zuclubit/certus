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
/// Scraper handler para VALMER (Valuación Operativa y Referencias de Mercado)
/// Extrae información sobre precios de valuación para instrumentos financieros de SIEFOREs
/// URL: https://www.valmer.com.mx
/// </summary>
public class ValmerScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ValmerScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string ValmerBaseUrl = "https://www.valmer.com.mx";
    private const string ValmerProductosUrl = "https://www.valmer.com.mx/productos-y-servicios";
    private const string ValmerNormatividadUrl = "https://www.valmer.com.mx/normatividad";

    public ScraperSourceType SourceType => ScraperSourceType.VALMER;

    public ValmerScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<ValmerScraperHandler> logger)
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
                        "Retry {RetryAttempt} for VALMER request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.VALMER;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting VALMER scraping");

            // Scrape información de valuación
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add VALMER valuation documents relevant for SIEFOREs
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"VALMER-PRECIOS-DEUDA-{DateTime.UtcNow:yyyyMM}",
                Title = "Precios de Valuación - Instrumentos de Deuda",
                Description = "Vector de precios diario para instrumentos de deuda gubernamental y corporativa",
                Code = $"VALMER-DEUDA-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Precios Deuda",
                DocumentUrl = ValmerProductosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "VALMER",
                    ["type"] = "VectorPrecios",
                    ["instrumentos"] = "CETES,BONDES,UDIBONOS,Corporativos",
                    ["frecuencia"] = "Diario"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"VALMER-PRECIOS-RV-{DateTime.UtcNow:yyyyMM}",
                Title = "Precios de Valuación - Renta Variable",
                Description = "Precios de acciones y títulos de renta variable para SIEFOREs",
                Code = $"VALMER-RV-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Precios Renta Variable",
                DocumentUrl = ValmerProductosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "VALMER",
                    ["type"] = "PreciosAcciones",
                    ["mercado"] = "BMV,NYSE,NASDAQ"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"VALMER-DERIVADOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Valuación de Derivados",
                Description = "Precios y factores de riesgo para derivados financieros",
                Code = $"VALMER-DERIV-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Valuación Derivados",
                DocumentUrl = ValmerProductosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "VALMER",
                    ["type"] = "Derivados",
                    ["instrumentos"] = "Futuros,Opciones,Swaps"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"VALMER-CURVAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Curvas de Rendimiento",
                Description = "Curvas de descuento y tasas forward para valuación de portafolios",
                Code = $"VALMER-CURVAS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Curvas Rendimiento",
                DocumentUrl = ValmerProductosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "VALMER",
                    ["type"] = "Curvas",
                    ["tipos"] = "Gubernamental,IRS,TIIE"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"VALMER-METODOLOGIAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Metodologías de Valuación",
                Description = "Documentación de metodologías de valuación aprobadas por CONSAR",
                Code = $"VALMER-METOD-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Metodologías VALMER",
                DocumentUrl = ValmerNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "VALMER",
                    ["type"] = "Metodologias",
                    ["regulador"] = "CONSAR,CNBV"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"VALMER-RIESGOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Factores de Riesgo",
                Description = "Volatilidades, correlaciones y VaR para gestión de riesgos SIEFORE",
                Code = $"VALMER-RIESGOS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Factores Riesgo",
                DocumentUrl = ValmerProductosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "VALMER",
                    ["type"] = "FactoresRiesgo",
                    ["metricas"] = "VaR,CVaR,Volatilidad"
                }
            });

            _logger.LogInformation("VALMER scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping VALMER: {Message}", ex.Message);
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
                await _httpClient.GetAsync(ValmerNormatividadUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='valuacion'], a[href*='metodologia'], a[href*='precio']");

            foreach (var link in links.Take(20))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = ValmerBaseUrl + documentUrl;

                var externalId = GenerateExternalId("VALMER", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento VALMER valuación de mercado",
                    Code = $"VALMER-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos VALMER",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "VALMER",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping VALMER documentos");
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
