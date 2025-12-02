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
/// Scraper handler para CETES y Valores Gubernamentales
/// Extrae información sobre instrumentos de deuda gubernamental donde invierten las SIEFOREs
/// URL: https://www.cetesdirecto.com, https://www.banxico.org.mx
/// </summary>
public class CetesScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CetesScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string CetesDirectoUrl = "https://www.cetesdirecto.com/sites/portal/inicio";
    private const string BanxicoValoresUrl = "https://www.banxico.org.mx/mercados/d/%7B8E0F9818-96A4-BD37-9F2D-E2DB82F2BB1B%7D.pdf";
    private const string ShcpDeudaUrl = "https://www.gob.mx/shcp/documentos/informes-sobre-la-situacion-economica-las-finanzas-publicas-y-la-deuda-publica";

    public ScraperSourceType SourceType => ScraperSourceType.CETES;

    public CetesScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<CetesScraperHandler> logger)
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
                        "Retry {RetryAttempt} for CETES request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.CETES;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting CETES/Valores Gubernamentales scraping");

            // Scrape información de valores
            var docs = await ScrapeValoresAsync(cancellationToken);
            results.AddRange(docs);

            // Add government securities documents relevant for SIEFOREs
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CETES-TASAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Tasas de CETES y Valores Gubernamentales",
                Description = "Tasas de rendimiento de CETES para valuación de portafolios SIEFORE",
                Code = $"CETES-TASAS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Tasas CETES",
                DocumentUrl = BanxicoValoresUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BANXICO",
                    ["type"] = "Tasas",
                    ["instrumentos"] = "CETES 28,91,182,364 días",
                    ["uso"] = "Valuación portafolios SIEFORE"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CETES-BONDES-{DateTime.UtcNow:yyyyMM}",
                Title = "BONDES D y Bonos de Desarrollo",
                Description = "Información de Bonos de Desarrollo del Gobierno Federal",
                Code = $"CETES-BONDES-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Bonos Gobierno",
                DocumentUrl = BanxicoValoresUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BANXICO/SHCP",
                    ["type"] = "BondesD",
                    ["plazo"] = "3,5,7,10,20,30 años"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CETES-UDIBONOS-{DateTime.UtcNow:yyyyMM}",
                Title = "UDIBONOS - Bonos Indizados a Inflación",
                Description = "Bonos gubernamentales protegidos contra inflación para SIEFOREs",
                Code = $"CETES-UDIBONOS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "UDIBONOS",
                DocumentUrl = BanxicoValoresUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BANXICO/SHCP",
                    ["type"] = "UDIBONOS",
                    ["indexacion"] = "UDI/INPC"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CETES-CALENDARIO-{DateTime.UtcNow:yyyyMM}",
                Title = "Calendario de Subastas de Valores",
                Description = "Calendario trimestral de subastas de valores gubernamentales",
                Code = $"CETES-CAL-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Calendario Subastas",
                DocumentUrl = ShcpDeudaUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SHCP",
                    ["type"] = "CalendarioSubastas",
                    ["frecuencia"] = "Trimestral"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CETES-PRECIOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Precios de Valuación Valores Gubernamentales",
                Description = "Precios oficiales de valuación para portafolios SIEFORE",
                Code = $"CETES-PRECIOS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Precios Valuación",
                DocumentUrl = BanxicoValoresUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BANXICO/VALMER",
                    ["type"] = "PreciosValuacion",
                    ["frecuencia"] = "Diario"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CETES-CARACTERISTICAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Características de Emisiones Vigentes",
                Description = "Catálogo de características de emisiones vigentes de deuda gubernamental",
                Code = $"CETES-CARACT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Catálogo Emisiones",
                DocumentUrl = ShcpDeudaUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SHCP",
                    ["type"] = "CatalogoEmisiones",
                    ["datos"] = "Cupón,Vencimiento,Monto"
                }
            });

            _logger.LogInformation("CETES scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping CETES: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeValoresAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(ShcpDeudaUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='cetes'], a[href*='bonos'], a[href*='valores'], a[href*='deuda']");

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

                var externalId = GenerateExternalId("CETES", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento valores gubernamentales",
                    Code = $"CETES-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos CETES",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "SHCP",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping valores gubernamentales");
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
