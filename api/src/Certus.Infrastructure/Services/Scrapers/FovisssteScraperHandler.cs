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
/// Scraper handler para FOVISSSTE (Fondo de la Vivienda del ISSSTE)
/// Extrae normatividad de vivienda para trabajadores del Estado (subcuenta vivienda ISSSTE)
/// URL: https://www.gob.mx/fovissste
/// </summary>
public class FovisssteScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<FovisssteScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string FovisssteBaseUrl = "https://www.gob.mx/fovissste";
    private const string FovisssteDocumentosUrl = "https://www.gob.mx/fovissste/documentos";
    private const string FovisssteNormatividadUrl = "https://www.gob.mx/fovissste/acciones-y-programas/normatividad";
    private const string FovisssteCreditosUrl = "https://www.gob.mx/fovissste/acciones-y-programas/creditos";

    public ScraperSourceType SourceType => ScraperSourceType.FOVISSSTE;

    public FovisssteScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<FovisssteScraperHandler> logger)
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
                        "Retry {RetryAttempt} for FOVISSSTE request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.FOVISSSTE;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting FOVISSSTE scraping");

            // Scrape documentos y normatividad
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add FOVISSSTE specific documents
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"FOVISSSTE-APORTACIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Esquema de Aportaciones FOVISSSTE",
                Description = "Estructura de aportaciones patronales (5% del SBC) para vivienda de trabajadores del Estado",
                Code = $"FOVISSSTE-APORT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Aportaciones FOVISSSTE",
                DocumentUrl = FovisssteNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "FOVISSSTE",
                    ["type"] = "Aportaciones",
                    ["porcentaje"] = "5% SBC",
                    ["relacion_pensionissste"] = "Subcuenta vivienda"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"FOVISSSTE-CREDITOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Reglas de Créditos FOVISSSTE",
                Description = "Normatividad para otorgamiento de créditos de vivienda a trabajadores del Estado",
                Code = $"FOVISSSTE-CRED-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Créditos FOVISSSTE",
                DocumentUrl = FovisssteCreditosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "FOVISSSTE",
                    ["type"] = "Creditos",
                    ["tipos"] = "Tradicional,CreditoConyugal,Respalda2M"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"FOVISSSTE-NORMATIVIDAD-{DateTime.UtcNow:yyyyMM}",
                Title = "Marco Normativo FOVISSSTE",
                Description = "Leyes, reglamentos y disposiciones que rigen el FOVISSSTE",
                Code = $"FOVISSSTE-NORM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Normatividad FOVISSSTE",
                DocumentUrl = FovisssteNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "FOVISSSTE",
                    ["type"] = "Normatividad",
                    ["marco_legal"] = "Ley del ISSSTE"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"FOVISSSTE-SUBCUENTA-{DateTime.UtcNow:yyyyMM}",
                Title = "Subcuenta de Vivienda FOVISSSTE",
                Description = "Reglas de manejo de la subcuenta de vivienda para trabajadores del Estado",
                Code = $"FOVISSSTE-SUBCTA-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Subcuenta FOVISSSTE",
                DocumentUrl = FovisssteNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "FOVISSSTE",
                    ["type"] = "Subcuenta",
                    ["relacion"] = "PENSIONISSSTE cuenta individual"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"FOVISSSTE-DEVOLUCION-{DateTime.UtcNow:yyyyMM}",
                Title = "Devolución de Aportaciones FOVISSSTE",
                Description = "Procedimiento para devolución de saldo de subcuenta de vivienda",
                Code = $"FOVISSSTE-DEV-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Devoluciones FOVISSSTE",
                DocumentUrl = FovisssteNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "FOVISSSTE",
                    ["type"] = "Devolucion",
                    ["casos"] = "Jubilacion,Incapacidad,Defuncion"
                }
            });

            _logger.LogInformation("FOVISSSTE scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping FOVISSSTE: {Message}", ex.Message);
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
                await _httpClient.GetAsync(FovisssteDocumentosUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='vivienda'], a[href*='credito'], a[href*='fovissste']");

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

                var externalId = GenerateExternalId("FOVISSSTE", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento FOVISSSTE vivienda sector público",
                    Code = $"FOVISSSTE-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos FOVISSSTE",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "FOVISSSTE",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping FOVISSSTE documentos");
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
