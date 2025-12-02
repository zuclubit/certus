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
/// Scraper handler para INEGI (Instituto Nacional de Estadística y Geografía)
/// Extrae catálogos geográficos: entidades federativas, municipios, localidades
/// URL: https://www.inegi.org.mx
/// </summary>
public class InegiScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<InegiScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string InegiBaseUrl = "https://www.inegi.org.mx";
    private const string MarcoGeoestadisticoUrl = "https://www.inegi.org.mx/app/ageeml/";
    private const string CatalogosUrl = "https://www.inegi.org.mx/app/descarga/";
    private const string GobMxInegiUrl = "https://www.gob.mx/inegi/documentos";

    public ScraperSourceType SourceType => ScraperSourceType.INEGI;

    public InegiScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<InegiScraperHandler> logger)
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
                        "Retry {RetryAttempt} for INEGI request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.INEGI;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting INEGI scraping");

            // Scrape geographic catalogs from Marco Geoestadístico
            var geoCatalogs = await ScrapeGeographicCatalogsAsync(cancellationToken);
            results.AddRange(geoCatalogs);

            // Add entidades federativas catalog
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INEGI-ENT-{DateTime.UtcNow:yyyyMM}",
                Title = "Catálogo de Entidades Federativas",
                Description = "Catálogo oficial de las 32 entidades federativas de México con claves INEGI",
                Code = $"INEGI-ENT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Catálogos Geográficos",
                DocumentUrl = MarcoGeoestadisticoUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INEGI",
                    ["type"] = "CatalogoEntidades",
                    ["totalEntidades"] = "32",
                    ["format"] = "CSV/XLS"
                }
            });

            // Add municipios catalog
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INEGI-MUN-{DateTime.UtcNow:yyyyMM}",
                Title = "Catálogo de Municipios y Alcaldías",
                Description = "Catálogo oficial de municipios y alcaldías de México con claves INEGI",
                Code = $"INEGI-MUN-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Catálogos Geográficos",
                DocumentUrl = MarcoGeoestadisticoUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INEGI",
                    ["type"] = "CatalogoMunicipios",
                    ["totalMunicipios"] = "2469",
                    ["format"] = "CSV/XLS"
                }
            });

            // Add localidades catalog
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INEGI-LOC-{DateTime.UtcNow:yyyyMM}",
                Title = "Catálogo de Localidades",
                Description = "Catálogo oficial de localidades urbanas y rurales de México",
                Code = $"INEGI-LOC-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Catálogos Geográficos",
                DocumentUrl = MarcoGeoestadisticoUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INEGI",
                    ["type"] = "CatalogoLocalidades",
                    ["format"] = "CSV/XLS"
                }
            });

            // Add AGEE (Áreas Geoestadísticas Estatales)
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INEGI-AGEE-{DateTime.UtcNow:yyyyMM}",
                Title = "Marco Geoestadístico - AGEE",
                Description = "Áreas Geoestadísticas Estatales - División territorial oficial",
                Code = $"INEGI-AGEE-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Marco Geoestadístico",
                DocumentUrl = MarcoGeoestadisticoUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INEGI",
                    ["type"] = "AGEE",
                    ["version"] = DateTime.UtcNow.Year.ToString()
                }
            });

            // Add AGEM (Áreas Geoestadísticas Municipales)
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INEGI-AGEM-{DateTime.UtcNow:yyyyMM}",
                Title = "Marco Geoestadístico - AGEM",
                Description = "Áreas Geoestadísticas Municipales - División municipal oficial",
                Code = $"INEGI-AGEM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Marco Geoestadístico",
                DocumentUrl = MarcoGeoestadisticoUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INEGI",
                    ["type"] = "AGEM",
                    ["version"] = DateTime.UtcNow.Year.ToString()
                }
            });

            _logger.LogInformation("INEGI scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping INEGI: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeGeographicCatalogsAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(GobMxInegiUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='catalogo'], a[href*='geografico'], a[href*='entidad'], a[href*='municipio']");

            foreach (var link in links.Take(20))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                // Filter for geographic-related documents
                if (!title.Contains("geográf", StringComparison.OrdinalIgnoreCase) &&
                    !title.Contains("entidad", StringComparison.OrdinalIgnoreCase) &&
                    !title.Contains("municipio", StringComparison.OrdinalIgnoreCase) &&
                    !title.Contains("localidad", StringComparison.OrdinalIgnoreCase) &&
                    !title.Contains("catalogo", StringComparison.OrdinalIgnoreCase) &&
                    !anchor.Href.Contains("catalogo", StringComparison.OrdinalIgnoreCase))
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.gob.mx" + documentUrl;

                var externalId = GenerateExternalId("INEGI", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Catálogo geográfico INEGI - División territorial de México",
                    Code = $"INEGI-GEO-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Catálogos INEGI",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "INEGI",
                        ["type"] = "CatalogoGeografico",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping INEGI geographic catalogs");
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
