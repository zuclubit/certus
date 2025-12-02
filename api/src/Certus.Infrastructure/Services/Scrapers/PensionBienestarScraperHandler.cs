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
/// Scraper handler para Pensión del Bienestar (antes 65 y Más)
/// Extrae información sobre el programa de pensión universal para adultos mayores
/// URL: https://www.gob.mx/bienestar
/// </summary>
public class PensionBienestarScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<PensionBienestarScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string BienestarBaseUrl = "https://www.gob.mx/bienestar";
    private const string PensionBienestarUrl = "https://www.gob.mx/bienestar/acciones-y-programas/pension-para-el-bienestar-de-las-personas-adultas-mayores";
    private const string BienestarDocumentosUrl = "https://www.gob.mx/bienestar/documentos";

    public ScraperSourceType SourceType => ScraperSourceType.PensionBienestar;

    public PensionBienestarScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<PensionBienestarScraperHandler> logger)
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
                        "Retry {RetryAttempt} for Pension Bienestar request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.PensionBienestar;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting Pension Bienestar scraping");

            // Scrape documentos del programa
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add Pension Bienestar program documents
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"BIENESTAR-REGLAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Reglas de Operación Pensión Bienestar",
                Description = "Reglas de operación del programa de Pensión para el Bienestar de Adultos Mayores",
                Code = $"BIEN-REG-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Reglas Operación",
                DocumentUrl = PensionBienestarUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "Bienestar",
                    ["type"] = "ReglasOperacion",
                    ["edad"] = "65 años o más",
                    ["monto"] = "Bimestral actualizable"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"BIENESTAR-PADRON-{DateTime.UtcNow:yyyyMM}",
                Title = "Padrón de Beneficiarios",
                Description = "Información sobre el padrón de beneficiarios de Pensión Bienestar",
                Code = $"BIEN-PAD-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Padrón",
                DocumentUrl = BienestarDocumentosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "Bienestar",
                    ["type"] = "Padron",
                    ["cobertura"] = "Nacional"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"BIENESTAR-CALENDARIO-{DateTime.UtcNow:yyyyMM}",
                Title = "Calendario de Pagos Pensión Bienestar",
                Description = "Fechas de dispersión de pagos del programa",
                Code = $"BIEN-CAL-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Calendario Pagos",
                DocumentUrl = PensionBienestarUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "Bienestar",
                    ["type"] = "CalendarioPagos",
                    ["periodicidad"] = "Bimestral"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"BIENESTAR-COMPATIBILIDAD-{DateTime.UtcNow:yyyyMM}",
                Title = "Compatibilidad con Pensiones SAR",
                Description = "Reglas de compatibilidad de Pensión Bienestar con pensiones del SAR",
                Code = $"BIEN-COMP-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Compatibilidad",
                DocumentUrl = BienestarDocumentosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "Bienestar/CONSAR",
                    ["type"] = "Compatibilidad",
                    ["sistemas"] = "IMSS,ISSSTE,SAR"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"BIENESTAR-REFORMA-{DateTime.UtcNow:yyyyMM}",
                Title = "Reforma Constitucional Pensión Universal",
                Description = "Modificaciones constitucionales que elevan a rango constitucional la pensión",
                Code = $"BIEN-REF-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Reforma Constitucional",
                DocumentUrl = BienestarDocumentosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "DOF/Bienestar",
                    ["type"] = "Reforma",
                    ["articulo"] = "Art. 4 Constitucional"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"BIENESTAR-REQUISITOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Requisitos de Inscripción",
                Description = "Documentación y requisitos para registro en Pensión Bienestar",
                Code = $"BIEN-REQ-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Requisitos",
                DocumentUrl = PensionBienestarUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "Bienestar",
                    ["type"] = "Requisitos",
                    ["documentos"] = "INE,CURP,Comprobante domicilio"
                }
            });

            _logger.LogInformation("Pension Bienestar scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping Pension Bienestar: {Message}", ex.Message);
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
                await _httpClient.GetAsync(BienestarDocumentosUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='pension'], a[href*='bienestar'], a[href*='adultos']");

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

                var externalId = GenerateExternalId("BIENESTAR", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento Pensión Bienestar",
                    Code = $"BIENESTAR-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos Bienestar",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "Bienestar",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping Pension Bienestar documentos");
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
