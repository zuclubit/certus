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
/// Scraper handler para CONASAMI (Comisión Nacional de los Salarios Mínimos)
/// Extrae información sobre salarios mínimos que afectan cálculos de SBC y aportaciones SAR
/// URL: https://www.gob.mx/conasami
/// </summary>
public class ConasamiScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ConasamiScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string ConasamiBaseUrl = "https://www.gob.mx/conasami";
    private const string GobMxConasamiUrl = "https://www.gob.mx/conasami/documentos";
    private const string ConasamiTablasUrl = "https://www.gob.mx/conasami/acciones-y-programas/tabla-de-salarios-minimos-generales-y-profesionales-por-areas-geograficas";

    public ScraperSourceType SourceType => ScraperSourceType.CONASAMI;

    public ConasamiScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<ConasamiScraperHandler> logger)
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
                        "Retry {RetryAttempt} for CONASAMI request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.CONASAMI;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting CONASAMI scraping");

            // Scrape documentos de salarios mínimos
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add CONASAMI documents relevant for SAR calculations
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CONASAMI-SMGV-{DateTime.UtcNow:yyyyMM}",
                Title = "Salario Mínimo General Vigente",
                Description = "Salario mínimo general vigente que afecta topes de SBC y cálculos de aportaciones",
                Code = $"CONASAMI-SMG-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Salario Mínimo",
                DocumentUrl = ConasamiTablasUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONASAMI",
                    ["type"] = "SalarioMinimo",
                    ["aplicacion"] = "Tope SBC 25 SMGV,Pensiones garantizadas",
                    ["vigencia"] = "Anual con revisión"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CONASAMI-SMP-{DateTime.UtcNow:yyyyMM}",
                Title = "Salarios Mínimos Profesionales",
                Description = "Tabla de salarios mínimos profesionales por categoría",
                Code = $"CONASAMI-SMP-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Salarios Profesionales",
                DocumentUrl = ConasamiTablasUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONASAMI",
                    ["type"] = "SalariosProfesionales",
                    ["categorias"] = "Más de 60 profesiones"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CONASAMI-HISTORICO-{DateTime.UtcNow:yyyyMM}",
                Title = "Histórico de Salarios Mínimos",
                Description = "Serie histórica de salarios mínimos para cálculos retroactivos",
                Code = $"CONASAMI-HIST-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Histórico SM",
                DocumentUrl = GobMxConasamiUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONASAMI",
                    ["type"] = "Historico",
                    ["uso"] = "Cálculos retroactivos,Pensiones Ley 73"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CONASAMI-UMA-{DateTime.UtcNow:yyyyMM}",
                Title = "UMA - Unidad de Medida y Actualización",
                Description = "UMA vigente para multas, créditos y cálculos que sustituyen al SM",
                Code = $"CONASAMI-UMA-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "UMA",
                DocumentUrl = GobMxConasamiUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONASAMI/INEGI",
                    ["type"] = "UMA",
                    ["aplicacion"] = "Multas,Créditos INFONAVIT,Pensiones desvinculadas SM"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"CONASAMI-MZLF-{DateTime.UtcNow:yyyyMM}",
                Title = "Salario Mínimo Zona Libre Frontera Norte",
                Description = "Salario mínimo diferenciado para zona libre de la frontera norte",
                Code = $"CONASAMI-MZLF-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "SM Frontera",
                DocumentUrl = ConasamiTablasUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONASAMI",
                    ["type"] = "SalarioZonaLibre",
                    ["zona"] = "Frontera Norte",
                    ["aplicacion"] = "Trabajadores zona fronteriza"
                }
            });

            _logger.LogInformation("CONASAMI scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping CONASAMI: {Message}", ex.Message);
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
                await _httpClient.GetAsync(GobMxConasamiUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='salario'], a[href*='minimo'], a[href*='tabla']");

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

                var externalId = GenerateExternalId("CONASAMI", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento CONASAMI salarios mínimos",
                    Code = $"CONASAMI-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos CONASAMI",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CONASAMI",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping CONASAMI documentos");
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
