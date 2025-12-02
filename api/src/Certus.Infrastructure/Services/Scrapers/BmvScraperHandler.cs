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
/// Scraper handler para BMV (Bolsa Mexicana de Valores)
/// Extrae información de SIEFOREs, precios, rendimientos y datos de fondos de inversión
/// URL: https://www.bmv.com.mx
/// </summary>
public class BmvScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<BmvScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string BmvBaseUrl = "https://www.bmv.com.mx";
    private const string BmvFondosUrl = "https://www.bmv.com.mx/es/mercados/instrumentos";
    private const string BmvSieforeUrl = "https://www.bmv.com.mx/es/mercados/instrumentos";
    private const string BmvNormatividadUrl = "https://www.bmv.com.mx/es/marco-normativo";
    private const string BmvBoletinesUrl = "https://www.bmv.com.mx/es/mercados/capitales";

    public ScraperSourceType SourceType => ScraperSourceType.BMV;

    public BmvScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<BmvScraperHandler> logger)
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
                        "Retry {RetryAttempt} for BMV request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.BMV;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting BMV scraping");

            // Scrape normatividad y documentos
            var docs = await ScrapeNormatividadAsync(cancellationToken);
            results.AddRange(docs);

            // Add SIEFORE information
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"BMV-SIEFORE-INFO-{DateTime.UtcNow:yyyyMM}",
                Title = "Información de SIEFOREs BMV",
                Description = "Listado de Sociedades de Inversión Especializadas en Fondos para el Retiro cotizadas en BMV",
                Code = $"BMV-SIEFORE-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "SIEFOREs BMV",
                DocumentUrl = BmvSieforeUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BMV",
                    ["type"] = "SIEFORE",
                    ["mercado"] = "Fondos de Inversión",
                    ["periodicidad"] = "Diario"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"BMV-SIEFORE-PRECIOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Precios de SIEFOREs",
                Description = "Precios diarios de sociedades de inversión especializadas en fondos para el retiro",
                Code = $"BMV-PRECIOS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Precios SIEFOREs",
                DocumentUrl = BmvSieforeUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BMV",
                    ["type"] = "Precios",
                    ["mercado"] = "SIEFORE",
                    ["periodicidad"] = "Diario",
                    ["formato"] = "CSV/XLS"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"BMV-FONDOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Fondos de Inversión BMV",
                Description = "Catálogo de fondos de inversión listados en la Bolsa Mexicana de Valores",
                Code = $"BMV-FONDOS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Fondos BMV",
                DocumentUrl = BmvFondosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BMV",
                    ["type"] = "Fondos",
                    ["mercado"] = "Fondos de Inversión",
                    ["periodicidad"] = "Diario"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"BMV-NORMATIVIDAD-{DateTime.UtcNow:yyyyMM}",
                Title = "Normatividad BMV",
                Description = "Marco regulatorio y normativo de la Bolsa Mexicana de Valores",
                Code = $"BMV-NORM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Normatividad BMV",
                DocumentUrl = BmvNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BMV",
                    ["type"] = "Normatividad",
                    ["alcance"] = "Mercado de valores"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"BMV-RENDIMIENTOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Rendimientos SIEFOREs",
                Description = "Histórico de rendimientos de SIEFOREs por AFORE y tipo de fondo",
                Code = $"BMV-REND-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Rendimientos SIEFOREs",
                DocumentUrl = BmvSieforeUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BMV",
                    ["type"] = "Rendimientos",
                    ["periodicidad"] = "Mensual",
                    ["tipos_siefore"] = "Básica,Adicional,Generacional"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"BMV-ACTIVOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Activos Netos SIEFOREs",
                Description = "Activos netos administrados por cada SIEFORE",
                Code = $"BMV-ACTIVOS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Activos SIEFOREs",
                DocumentUrl = BmvSieforeUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BMV",
                    ["type"] = "Activos",
                    ["periodicidad"] = "Diario",
                    ["moneda"] = "MXN"
                }
            });

            _logger.LogInformation("BMV scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping BMV: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeNormatividadAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(BmvNormatividadUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='siefore'], a[href*='fondo'], a[href*='circular']");

            foreach (var link in links.Take(20))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 3)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = BmvBaseUrl + documentUrl;

                var externalId = GenerateExternalId("BMV", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento normativo BMV",
                    Code = $"BMV-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos BMV",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "BMV",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping BMV normatividad");
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
