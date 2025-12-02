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
/// Scraper handler para INAI (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales)
/// Extrae información sobre protección de datos personales relevante para AFOREs
/// URL: https://home.inai.org.mx
/// </summary>
public class InaiScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<InaiScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string InaiBaseUrl = "https://home.inai.org.mx";
    private const string GobMxInaiUrl = "https://www.gob.mx/inai/documentos";
    private const string InaiNormatividadUrl = "https://home.inai.org.mx/?page_id=1667";

    public ScraperSourceType SourceType => ScraperSourceType.INAI;

    public InaiScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<InaiScraperHandler> logger)
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
                        "Retry {RetryAttempt} for INAI request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.INAI;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting INAI scraping");

            // Scrape documentos de protección de datos
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add INAI documents relevant for AFORE data protection
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INAI-LFPDPPP-{DateTime.UtcNow:yyyyMM}",
                Title = "Ley Federal de Protección de Datos Personales",
                Description = "Marco legal de protección de datos personales aplicable a AFOREs como responsables",
                Code = $"INAI-LFPDP-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Normatividad INAI",
                DocumentUrl = InaiNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INAI",
                    ["type"] = "Ley",
                    ["ley"] = "LFPDPPP",
                    ["aplicacion"] = "AFOREs como responsables de datos"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INAI-LINEAMIENTOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Lineamientos de Protección de Datos",
                Description = "Lineamientos sobre aviso de privacidad, consentimiento y derechos ARCO",
                Code = $"INAI-LINE-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Lineamientos INAI",
                DocumentUrl = InaiNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INAI",
                    ["type"] = "Lineamientos",
                    ["temas"] = "AvisoPrivacidad,ARCO,Consentimiento"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INAI-ARCO-{DateTime.UtcNow:yyyyMM}",
                Title = "Derechos ARCO para Trabajadores SAR",
                Description = "Procedimientos para ejercer derechos de Acceso, Rectificación, Cancelación y Oposición",
                Code = $"INAI-ARCO-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Derechos ARCO",
                DocumentUrl = GobMxInaiUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INAI",
                    ["type"] = "ARCO",
                    ["derechos"] = "Acceso,Rectificación,Cancelación,Oposición"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INAI-SEGURIDAD-{DateTime.UtcNow:yyyyMM}",
                Title = "Medidas de Seguridad de Datos",
                Description = "Estándares de seguridad para protección de datos personales en sistemas AFORE",
                Code = $"INAI-SEG-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Seguridad INAI",
                DocumentUrl = InaiNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INAI",
                    ["type"] = "Seguridad",
                    ["controles"] = "Administrativos,Físicos,Técnicos"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INAI-TRANSFERENCIAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Transferencia de Datos Personales",
                Description = "Reglas para transferencia de datos entre AFOREs, PROCESAR y autoridades",
                Code = $"INAI-TRANS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Transferencias INAI",
                DocumentUrl = InaiNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INAI",
                    ["type"] = "Transferencias",
                    ["destinatarios"] = "AFOREs,PROCESAR,CONSAR,IMSS"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INAI-SANCIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Régimen de Sanciones LFPDPPP",
                Description = "Sanciones por incumplimiento de protección de datos personales",
                Code = $"INAI-SANC-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Sanciones INAI",
                DocumentUrl = GobMxInaiUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INAI",
                    ["type"] = "Sanciones",
                    ["rango"] = "100 a 320,000 días de salario mínimo"
                }
            });

            _logger.LogInformation("INAI scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping INAI: {Message}", ex.Message);
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
                await _httpClient.GetAsync(GobMxInaiUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='proteccion'], a[href*='datos'], a[href*='privacidad']");

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

                var externalId = GenerateExternalId("INAI", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento INAI protección de datos personales",
                    Code = $"INAI-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos INAI",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "INAI",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping INAI documentos");
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
