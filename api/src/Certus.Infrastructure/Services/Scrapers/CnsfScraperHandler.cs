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
/// Scraper handler para CNSF (Comisión Nacional de Seguros y Fianzas)
/// Extrae normatividad de seguros, rentas vitalicias, pensiones derivadas de seguros
/// URL: https://www.gob.mx/cnsf
/// </summary>
public class CnsfScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CnsfScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string CnsfBaseUrl = "https://www.cnsf.gob.mx";
    private const string CnsfDocumentosUrl = "https://www.gob.mx/cnsf/documentos/documento-de-oferta-de-renta-vitalicia-formatos";
    private const string CnsfNormatividadUrl = "https://www.gob.mx/cnsf/acciones-y-programas/normativa-25263";
    private const string CnsfCircularesUrl = "https://www.gob.mx/cnsf/documentos/circulares-modificatorias-a-la-cusf";
    private const string CnsfRentasVitUrl = "https://www.gob.mx/consar/articulos/valores-de-la-unidad-de-renta-vitalicia-60403";

    public ScraperSourceType SourceType => ScraperSourceType.CNSF;

    public CnsfScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<CnsfScraperHandler> logger)
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
                        "Retry {RetryAttempt} for CNSF request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.CNSF;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting CNSF scraping");

            // Scrape documentos y normatividad
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add Rentas Vitalicias (crucial for SAR pensioners)
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CNSF-RENTASVIT-{DateTime.UtcNow:yyyyMM}",
                Title = "Rentas Vitalicias CNSF",
                Description = "Normatividad y comparativos de rentas vitalicias para pensionados del SAR",
                Code = $"CNSF-RV-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Rentas Vitalicias CNSF",
                DocumentUrl = CnsfRentasVitUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNSF",
                    ["type"] = "RentasVitalicias",
                    ["relacion_sar"] = "Pensiones definitivas",
                    ["periodicidad"] = "Mensual"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CNSF-COMPARATIVO-{DateTime.UtcNow:yyyyMM}",
                Title = "Comparativo de Aseguradoras - Rentas Vitalicias",
                Description = "Tabla comparativa de montos de renta vitalicia por aseguradora",
                Code = $"CNSF-COMP-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Comparativos CNSF",
                DocumentUrl = CnsfRentasVitUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNSF",
                    ["type"] = "Comparativo",
                    ["producto"] = "Renta Vitalicia",
                    ["periodicidad"] = "Mensual"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CNSF-CIRCULARES-{DateTime.UtcNow:yyyyMM}",
                Title = "Circulares CNSF",
                Description = "Circulares emitidas por la Comisión Nacional de Seguros y Fianzas",
                Code = $"CNSF-CIRC-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Circulares CNSF",
                DocumentUrl = CnsfCircularesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNSF",
                    ["type"] = "Circular",
                    ["alcance"] = "Aseguradoras y afianzadoras"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CNSF-NORMATIVIDAD-{DateTime.UtcNow:yyyyMM}",
                Title = "Normatividad CNSF",
                Description = "Marco normativo de la Comisión Nacional de Seguros y Fianzas",
                Code = $"CNSF-NORM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Normatividad CNSF",
                DocumentUrl = CnsfNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNSF",
                    ["type"] = "Normatividad",
                    ["alcance"] = "Sector asegurador"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CNSF-PENSIONES-SEG-{DateTime.UtcNow:yyyyMM}",
                Title = "Pensiones Derivadas de Seguros",
                Description = "Normatividad para pensiones derivadas de seguros de riesgos de trabajo e invalidez",
                Code = $"CNSF-PENS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Pensiones Seguros",
                DocumentUrl = CnsfNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNSF",
                    ["type"] = "Pensiones",
                    ["tipos"] = "Invalidez,Riesgo de Trabajo,Cesantía"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CNSF-TARIFAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Tarifas de Rentas Vitalicias",
                Description = "Tarifas y factores actuariales para cálculo de rentas vitalicias",
                Code = $"CNSF-TAR-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Tarifas CNSF",
                DocumentUrl = CnsfRentasVitUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNSF",
                    ["type"] = "Tarifas",
                    ["uso"] = "Calculo actuarial"
                }
            });

            _logger.LogInformation("CNSF scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping CNSF: {Message}", ex.Message);
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
                await _httpClient.GetAsync(CnsfDocumentosUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='renta'], a[href*='seguro'], a[href*='pension'], a[href*='circular']");

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

                var externalId = GenerateExternalId("CNSF", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento CNSF sector asegurador",
                    Code = $"CNSF-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos CNSF",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CNSF",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping CNSF documentos");
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
