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
/// Scraper handler para Tablas Actuariales
/// Extrae tablas de mortalidad, invalidez y factores actuariales de CNSF y fuentes oficiales
/// Utilizadas para cálculo de pensiones y rentas vitalicias
/// </summary>
public class TablasActuarialesScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TablasActuarialesScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string CnsfTablasUrl = "https://www.gob.mx/cnsf/acciones-y-programas/tablas-de-mortalidad";
    private const string CnsfFactoresUrl = "https://www.gob.mx/cnsf/documentos";
    private const string ConsarPensionesUrl = "https://www.gob.mx/consar/acciones-y-programas/pensiones";

    public ScraperSourceType SourceType => ScraperSourceType.TablasActuariales;

    public TablasActuarialesScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<TablasActuarialesScraperHandler> logger)
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
                        "Retry {RetryAttempt} for Tablas Actuariales request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.TablasActuariales;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting Tablas Actuariales scraping");

            // Scrape tablas de mortalidad
            var docs = await ScrapeTablasAsync(cancellationToken);
            results.AddRange(docs);

            // Add standard actuarial tables
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"TABLAS-MORTALIDAD-{DateTime.UtcNow:yyyyMM}",
                Title = "Tablas de Mortalidad CNSF",
                Description = "Tablas de mortalidad oficiales para cálculo de reservas y pensiones (EMSS, IMSS)",
                Code = $"TABLAS-MORT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Mortalidad Actuarial",
                DocumentUrl = CnsfTablasUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNSF",
                    ["type"] = "Mortalidad",
                    ["tablas"] = "EMSS-2009,EMSS-97,Experiencia Mexicana",
                    ["uso"] = "Rentas vitalicias,Pensiones"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"TABLAS-INVALIDEZ-{DateTime.UtcNow:yyyyMM}",
                Title = "Tablas de Invalidez",
                Description = "Tablas de probabilidades de invalidez para cálculos actuariales",
                Code = $"TABLAS-INV-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Invalidez Actuarial",
                DocumentUrl = CnsfTablasUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNSF",
                    ["type"] = "Invalidez",
                    ["aplicacion"] = "Pensiones por invalidez"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"TABLAS-FACTORES-{DateTime.UtcNow:yyyyMM}",
                Title = "Factores de Conversión Actuarial",
                Description = "Factores para conversión de capital a rentas vitalicias",
                Code = $"TABLAS-FACT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Factores Actuariales",
                DocumentUrl = CnsfFactoresUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNSF",
                    ["type"] = "Factores",
                    ["uso"] = "Cotización de rentas vitalicias"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"TABLAS-INTERES-{DateTime.UtcNow:yyyyMM}",
                Title = "Tasas de Interés Técnico",
                Description = "Tasas de interés técnico para valuación actuarial de reservas",
                Code = $"TABLAS-TIT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Interés Técnico",
                DocumentUrl = CnsfFactoresUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNSF",
                    ["type"] = "TasaInteresTecnico",
                    ["uso"] = "Descuento de flujos futuros"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"TABLAS-EDAD-PENSION-{DateTime.UtcNow:yyyyMM}",
                Title = "Edades y Requisitos de Pensión",
                Description = "Tablas de edades mínimas y semanas cotizadas para acceder a pensión",
                Code = $"TABLAS-EDAD-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Requisitos Pensión",
                DocumentUrl = ConsarPensionesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "EdadPension",
                    ["regimenes"] = "LSS73,LSS97,LISSSTE"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"TABLAS-SOBREVIVENCIA-{DateTime.UtcNow:yyyyMM}",
                Title = "Tablas de Sobrevivencia",
                Description = "Probabilidades de sobrevivencia para cálculo de beneficios a beneficiarios",
                Code = $"TABLAS-SOBR-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Sobrevivencia Actuarial",
                DocumentUrl = CnsfTablasUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNSF",
                    ["type"] = "Sobrevivencia",
                    ["uso"] = "Pensiones de viudez y orfandad"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"TABLAS-CONMUTACION-{DateTime.UtcNow:yyyyMM}",
                Title = "Factores de Conmutación",
                Description = "Factores Dx, Nx, Cx para cálculos actuariales de anualidades",
                Code = $"TABLAS-CONM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Conmutación Actuarial",
                DocumentUrl = CnsfFactoresUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNSF",
                    ["type"] = "Conmutacion",
                    ["factores"] = "Dx,Nx,Cx,Mx",
                    ["uso"] = "Cálculo de anualidades"
                }
            });

            _logger.LogInformation("Tablas Actuariales scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping Tablas Actuariales: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeTablasAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(CnsfFactoresUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='mortalidad'], a[href*='actuarial'], a[href*='pension']");

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

                var externalId = GenerateExternalId("TABLAS", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento actuarial oficial",
                    Code = $"TABLAS-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos Actuariales",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CNSF",
                        ["type"] = "Actuarial",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping tablas actuariales");
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
