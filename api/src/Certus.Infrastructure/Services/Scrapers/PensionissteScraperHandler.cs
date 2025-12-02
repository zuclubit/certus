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
/// Scraper handler para PENSIONISSSTE
/// Extrae normatividad del sistema de pensiones del sector público federal
/// URL: https://www.pensionissste.gob.mx
/// </summary>
public class PensionissteScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<PensionissteScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string PensionissteBaseUrl = "https://www.pensionissste.gob.mx";
    private const string PensionissteGobMxUrl = "https://www.gob.mx/pensionissste/documentos";
    private const string PensionissteNormatividadUrl = "https://www.gob.mx/pensionissste/acciones-y-programas/normatividad";
    private const string PensionissteEstadisticasUrl = "https://www.gob.mx/pensionissste/acciones-y-programas/estadisticas";

    public ScraperSourceType SourceType => ScraperSourceType.PENSIONISSSTE;

    public PensionissteScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<PensionissteScraperHandler> logger)
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
                        "Retry {RetryAttempt} for PENSIONISSSTE request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.PENSIONISSSTE;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting PENSIONISSSTE scraping");

            // Scrape documentos y normatividad
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add specific PENSIONISSSTE documents
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PENSIONISSSTE-NORM-{DateTime.UtcNow:yyyyMM}",
                Title = "Normatividad PENSIONISSSTE",
                Description = "Marco normativo del Fondo Nacional de Pensiones de los Trabajadores al Servicio del Estado",
                Code = $"PENSIONISSSTE-NORM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Normatividad PENSIONISSSTE",
                DocumentUrl = PensionissteNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PENSIONISSSTE",
                    ["type"] = "Normatividad",
                    ["sector"] = "Público Federal",
                    ["alcance"] = "Trabajadores al servicio del Estado"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PENSIONISSSTE-LEYISSSTE-{DateTime.UtcNow:yyyyMM}",
                Title = "Ley del ISSSTE - Capítulo de Pensiones",
                Description = "Disposiciones de la Ley del ISSSTE relativas al sistema de pensiones",
                Code = $"PENSIONISSSTE-LEY-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Marco Legal PENSIONISSSTE",
                DocumentUrl = PensionissteNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PENSIONISSSTE",
                    ["type"] = "Ley",
                    ["ordenamiento"] = "Ley del ISSSTE"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PENSIONISSSTE-ESTADISTICAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Estadísticas PENSIONISSSTE",
                Description = "Estadísticas de afiliados, cuentas individuales y recursos administrados",
                Code = $"PENSIONISSSTE-EST-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Estadísticas PENSIONISSSTE",
                DocumentUrl = PensionissteEstadisticasUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PENSIONISSSTE",
                    ["type"] = "Estadísticas",
                    ["periodicidad"] = "Mensual"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PENSIONISSSTE-APORTACIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Esquema de Aportaciones PENSIONISSSTE",
                Description = "Estructura de aportaciones obligatorias y voluntarias para trabajadores del Estado",
                Code = $"PENSIONISSSTE-APORT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Aportaciones PENSIONISSSTE",
                DocumentUrl = PensionissteNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PENSIONISSSTE",
                    ["type"] = "Aportaciones",
                    ["subcuentas"] = "RCV,SAV,Vivienda,Ahorro Solidario"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PENSIONISSSTE-RETIROS-{DateTime.UtcNow:yyyyMM}",
                Title = "Reglas de Retiros PENSIONISSSTE",
                Description = "Procedimientos y requisitos para retiros parciales y totales",
                Code = $"PENSIONISSSTE-RET-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Retiros PENSIONISSSTE",
                DocumentUrl = PensionissteNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PENSIONISSSTE",
                    ["type"] = "Retiros",
                    ["tipos"] = "Parcial,Total,Matrimonio,Desempleo"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PENSIONISSSTE-SIEFORES-{DateTime.UtcNow:yyyyMM}",
                Title = "SIEFOREs PENSIONISSSTE",
                Description = "Información de fondos de inversión administrados por PENSIONISSSTE",
                Code = $"PENSIONISSSTE-SIEF-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "SIEFOREs PENSIONISSSTE",
                DocumentUrl = PensionissteBaseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PENSIONISSSTE",
                    ["type"] = "SIEFORE",
                    ["fondos"] = "Básica Inicial,Básica de Pensiones"
                }
            });

            _logger.LogInformation("PENSIONISSSTE scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping PENSIONISSSTE: {Message}", ex.Message);
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
                await _httpClient.GetAsync(PensionissteGobMxUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='pension'], a[href*='issste'], a[href*='retiro']");

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

                var externalId = GenerateExternalId("PENSIONISSSTE", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento PENSIONISSSTE sector público",
                    Code = $"PENSIONISSSTE-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos PENSIONISSSTE",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "PENSIONISSSTE",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping PENSIONISSSTE documentos");
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
