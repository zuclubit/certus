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
/// Scraper handler para SHF (Sociedad Hipotecaria Federal)
/// Extrae información sobre créditos hipotecarios y esquemas de cofinanciamiento con subcuenta de vivienda
/// URL: https://www.gob.mx/shf
/// </summary>
public class ShfScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ShfScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string ShfBaseUrl = "https://www.gob.mx/shf";
    private const string GobMxShfUrl = "https://www.gob.mx/shf/documentos";
    private const string ShfNormatividadUrl = "https://www.gob.mx/shf/acciones-y-programas/normatividad";

    public ScraperSourceType SourceType => ScraperSourceType.SHF;

    public ShfScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<ShfScraperHandler> logger)
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
                        "Retry {RetryAttempt} for SHF request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.SHF;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting SHF scraping");

            // Scrape documentos de SHF
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add SHF documents relevant for housing and SAR accounts
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SHF-COFINANCIAMIENTO-{DateTime.UtcNow:yyyyMM}",
                Title = "Esquemas de Cofinanciamiento",
                Description = "Reglas de cofinanciamiento INFONAVIT-SHF-Banca para uso de subcuenta vivienda",
                Code = $"SHF-COFIN-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Cofinanciamiento SHF",
                DocumentUrl = GobMxShfUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SHF",
                    ["type"] = "Cofinanciamiento",
                    ["esquemas"] = "INFONAVIT-SHF,FOVISSSTE-SHF",
                    ["aplicacion"] = "Subcuenta vivienda"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SHF-GARANTIAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Programa de Garantías Hipotecarias",
                Description = "Garantías SHF para créditos hipotecarios con recursos de subcuenta",
                Code = $"SHF-GARANT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Garantías SHF",
                DocumentUrl = GobMxShfUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SHF",
                    ["type"] = "Garantias",
                    ["cobertura"] = "Hipotecarios con subcuenta"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SHF-TASAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Tasas de Referencia SHF",
                Description = "Tasas de interés de referencia para créditos hipotecarios",
                Code = $"SHF-TASAS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Tasas SHF",
                DocumentUrl = GobMxShfUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SHF",
                    ["type"] = "Tasas",
                    ["frecuencia"] = "Mensual"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SHF-NORMATIVIDAD-{DateTime.UtcNow:yyyyMM}",
                Title = "Marco Normativo SHF",
                Description = "Normatividad para operaciones hipotecarias relacionadas con SAR",
                Code = $"SHF-NORM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Normatividad SHF",
                DocumentUrl = ShfNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SHF",
                    ["type"] = "Normatividad",
                    ["alcance"] = "Operaciones hipotecarias"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SHF-SEGUROS-{DateTime.UtcNow:yyyyMM}",
                Title = "Seguros Hipotecarios",
                Description = "Esquemas de seguros para créditos hipotecarios con subcuenta vivienda",
                Code = $"SHF-SEGUROS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Seguros SHF",
                DocumentUrl = GobMxShfUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SHF",
                    ["type"] = "Seguros",
                    ["cobertura"] = "Daños,Vida,Desempleo"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SHF-ESTADISTICAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Estadísticas del Mercado Hipotecario",
                Description = "Indicadores del mercado hipotecario relacionados con subcuenta vivienda",
                Code = $"SHF-ESTAD-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Estadísticas SHF",
                DocumentUrl = GobMxShfUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SHF",
                    ["type"] = "Estadisticas",
                    ["indicadores"] = "Originación,Colocación,Cartera"
                }
            });

            _logger.LogInformation("SHF scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping SHF: {Message}", ex.Message);
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
                await _httpClient.GetAsync(GobMxShfUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='hipoteca'], a[href*='vivienda'], a[href*='credito']");

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

                var externalId = GenerateExternalId("SHF", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento SHF hipotecario federal",
                    Code = $"SHF-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos SHF",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "SHF",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping SHF documentos");
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
