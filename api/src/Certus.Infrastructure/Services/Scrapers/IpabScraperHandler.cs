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
/// Scraper handler para IPAB (Instituto para la Protección al Ahorro Bancario)
/// Extrae normatividad de protección al ahorro, límites de cobertura, instituciones cubiertas
/// URL: https://www.gob.mx/ipab
/// </summary>
public class IpabScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<IpabScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string IpabBaseUrl = "https://www.gob.mx/ipab";
    private const string IpabDocumentosUrl = "https://www.gob.mx/ipab/documentos";
    private const string IpabNormatividadUrl = "https://www.gob.mx/ipab/acciones-y-programas/normatividad-ipab";
    private const string IpabInstitucionesUrl = "https://www.gob.mx/ipab/acciones-y-programas/instituciones-cubiertas";

    public ScraperSourceType SourceType => ScraperSourceType.IPAB;

    public IpabScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<IpabScraperHandler> logger)
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
                        "Retry {RetryAttempt} for IPAB request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.IPAB;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting IPAB scraping");

            // Scrape documentos y normatividad
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add IPAB coverage limits (important for SAR)
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IPAB-COBERTURA-{DateTime.UtcNow:yyyyMM}",
                Title = "Límites de Cobertura IPAB",
                Description = "Montos máximos de protección al ahorro bancario (400,000 UDIs)",
                Code = $"IPAB-COB-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Cobertura IPAB",
                DocumentUrl = IpabBaseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IPAB",
                    ["type"] = "Cobertura",
                    ["limite_udis"] = "400000",
                    ["periodicidad"] = "Anual"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IPAB-INSTITUCIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Instituciones Cubiertas por IPAB",
                Description = "Catálogo de instituciones bancarias con protección IPAB",
                Code = $"IPAB-INST-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Instituciones IPAB",
                DocumentUrl = IpabInstitucionesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IPAB",
                    ["type"] = "Catalogo",
                    ["alcance"] = "Banca múltiple"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IPAB-NORMATIVIDAD-{DateTime.UtcNow:yyyyMM}",
                Title = "Normatividad IPAB",
                Description = "Marco normativo del Instituto para la Protección al Ahorro Bancario",
                Code = $"IPAB-NORM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Normatividad IPAB",
                DocumentUrl = IpabNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IPAB",
                    ["type"] = "Normatividad",
                    ["alcance"] = "Sistema bancario mexicano"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IPAB-LEY-{DateTime.UtcNow:yyyyMM}",
                Title = "Ley de Protección al Ahorro Bancario",
                Description = "Ley que rige la protección de depósitos bancarios en México",
                Code = $"IPAB-LEY-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Marco Legal IPAB",
                DocumentUrl = IpabNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IPAB",
                    ["type"] = "Ley",
                    ["ordenamiento"] = "LPAB"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IPAB-OBLIGACIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Obligaciones Garantizadas IPAB",
                Description = "Tipos de obligaciones y operaciones protegidas por el seguro de depósitos",
                Code = $"IPAB-OBLIG-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Obligaciones IPAB",
                DocumentUrl = IpabBaseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IPAB",
                    ["type"] = "ObligacionesGarantizadas",
                    ["productos"] = "Depósitos,Pagarés,Cuentas de ahorro"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IPAB-CUOTAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Cuotas IPAB",
                Description = "Estructura de cuotas que pagan las instituciones bancarias al IPAB",
                Code = $"IPAB-CUOTAS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Cuotas IPAB",
                DocumentUrl = IpabNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IPAB",
                    ["type"] = "Cuotas",
                    ["periodicidad"] = "Mensual"
                }
            });

            _logger.LogInformation("IPAB scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping IPAB: {Message}", ex.Message);
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
                await _httpClient.GetAsync(IpabDocumentosUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='ipab'], a[href*='ahorro'], a[href*='banco']");

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

                var externalId = GenerateExternalId("IPAB", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento IPAB protección al ahorro",
                    Code = $"IPAB-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos IPAB",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "IPAB",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping IPAB documentos");
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
