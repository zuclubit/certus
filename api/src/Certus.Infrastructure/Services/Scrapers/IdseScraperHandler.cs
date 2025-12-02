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
/// Scraper handler para IDSE (IMSS Desde Su Empresa)
/// Extrae información sobre trámites patronales digitales y movimientos afiliatorios
/// URL: https://idse.imss.gob.mx
/// </summary>
public class IdseScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<IdseScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string IdseBaseUrl = "https://idse.imss.gob.mx";
    private const string GobMxIdseUrl = "https://www.gob.mx/imss/acciones-y-programas/imss-desde-su-empresa-idse";
    private const string ImssPatronesUrl = "https://www.imss.gob.mx/patrones";

    public ScraperSourceType SourceType => ScraperSourceType.IDSE;

    public IdseScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<IdseScraperHandler> logger)
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
                        "Retry {RetryAttempt} for IDSE request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.IDSE;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting IDSE scraping");

            // Scrape documentos IDSE
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add IDSE documents for employer digital services
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IDSE-MOVIMIENTOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Movimientos Afiliatorios IDSE",
                Description = "Especificaciones para altas, bajas y modificaciones de salario vía IDSE",
                Code = $"IDSE-MOV-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Movimientos IDSE",
                DocumentUrl = GobMxIdseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IMSS",
                    ["type"] = "Movimientos",
                    ["tramites"] = "Alta,Baja,ModSalario,Reingreso",
                    ["plazo"] = "5 días hábiles"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IDSE-LAYOUTS-{DateTime.UtcNow:yyyyMM}",
                Title = "Layouts IDSE para Carga Masiva",
                Description = "Especificaciones de archivos para movimientos masivos en IDSE",
                Code = $"IDSE-LAY-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts IDSE",
                DocumentUrl = ImssPatronesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IMSS",
                    ["type"] = "Layouts",
                    ["formato"] = "TXT delimitado"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IDSE-CERTIFICADO-{DateTime.UtcNow:yyyyMM}",
                Title = "Certificado Digital IDSE",
                Description = "Requisitos y renovación del certificado digital para IDSE",
                Code = $"IDSE-CERT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Certificado IDSE",
                DocumentUrl = GobMxIdseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IMSS",
                    ["type"] = "Certificado",
                    ["vigencia"] = "2 años"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IDSE-SIPARE-{DateTime.UtcNow:yyyyMM}",
                Title = "Integración IDSE-SIPARE",
                Description = "Vinculación de movimientos IDSE con Sistema de Pago Referenciado",
                Code = $"IDSE-SIPARE-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "IDSE-SIPARE",
                DocumentUrl = ImssPatronesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IMSS",
                    ["type"] = "Integracion",
                    ["sistema"] = "SIPARE"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IDSE-EMA-{DateTime.UtcNow:yyyyMM}",
                Title = "Emisión Mensual Anticipada (EMA)",
                Description = "Proceso de EMA para confirmación de movimientos afiliatorios",
                Code = $"IDSE-EMA-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "EMA IDSE",
                DocumentUrl = GobMxIdseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IMSS",
                    ["type"] = "EMA",
                    ["frecuencia"] = "Mensual"
                }
            });

            _logger.LogInformation("IDSE scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping IDSE: {Message}", ex.Message);
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
                await _httpClient.GetAsync(GobMxIdseUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='idse'], a[href*='movimiento'], a[href*='afiliatorio']");

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

                var externalId = GenerateExternalId("IDSE", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento IDSE servicios patronales",
                    Code = $"IDSE-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos IDSE",
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
            _logger.LogWarning(ex, "Error scraping IDSE documentos");
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
