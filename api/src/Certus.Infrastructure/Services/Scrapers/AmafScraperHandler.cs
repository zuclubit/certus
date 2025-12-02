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
/// Scraper handler para AMAFORE (Asociación Mexicana de Administradoras de Fondos para el Retiro)
/// Extrae estadísticas del mercado, informes, documentación sectorial
/// URL: https://www.amafore.org
/// </summary>
public class AmafScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AmafScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string AmaforeBaseUrl = "https://www.amafore.org";
    private const string AmaforeEstadisticasUrl = "https://www.amafore.org/estadisticas";
    private const string AmaforePublicacionesUrl = "https://www.amafore.org/publicaciones";
    private const string AmaforeInformesUrl = "https://www.amafore.org/informes";

    public ScraperSourceType SourceType => ScraperSourceType.AMAFORE;

    public AmafScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<AmafScraperHandler> logger)
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
                        "Retry {RetryAttempt} for AMAFORE request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.AMAFORE;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting AMAFORE scraping");

            // Scrape estadísticas y publicaciones
            var docs = await ScrapePublicacionesAsync(cancellationToken);
            results.AddRange(docs);

            // Add market statistics documents
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"AMAFORE-STATS-{DateTime.UtcNow:yyyyMM}",
                Title = "Estadísticas del Sistema de Ahorro para el Retiro",
                Description = "Estadísticas mensuales de activos, cuentas, rendimientos y comisiones del SAR",
                Code = $"AMAFORE-STATS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Estadísticas AMAFORE",
                DocumentUrl = AmaforeEstadisticasUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "AMAFORE",
                    ["type"] = "Estadisticas",
                    ["periodicidad"] = "Mensual",
                    ["indicadores"] = "Activos,Cuentas,Rendimientos,Comisiones"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"AMAFORE-REND-{DateTime.UtcNow:yyyyMM}",
                Title = "Rendimientos SIEFORES",
                Description = "Comparativo de rendimientos netos de las SIEFORES por generación",
                Code = $"AMAFORE-REND-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Rendimientos AMAFORE",
                DocumentUrl = AmaforeEstadisticasUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "AMAFORE",
                    ["type"] = "Rendimientos",
                    ["periodicidad"] = "Mensual",
                    ["indicadores"] = "IRN,Rendimiento Neto"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"AMAFORE-COMIS-{DateTime.UtcNow:yyyyMM}",
                Title = "Comisiones AFOREs",
                Description = "Histórico y comparativo de comisiones cobradas por las AFOREs",
                Code = $"AMAFORE-COMIS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Comisiones AMAFORE",
                DocumentUrl = AmaforeEstadisticasUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "AMAFORE",
                    ["type"] = "Comisiones",
                    ["periodicidad"] = "Anual",
                    ["indicadores"] = "Comision sobre saldo"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"AMAFORE-CUENTAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Cuentas Administradas por AFORE",
                Description = "Número de cuentas administradas por cada AFORE y participación de mercado",
                Code = $"AMAFORE-CTAS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Cuentas AMAFORE",
                DocumentUrl = AmaforeEstadisticasUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "AMAFORE",
                    ["type"] = "Cuentas",
                    ["periodicidad"] = "Mensual",
                    ["indicadores"] = "Cuentas registradas,Participacion mercado"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"AMAFORE-ACTIVOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Activos Netos del Sistema SAR",
                Description = "Evolución de activos netos administrados por el Sistema de Ahorro para el Retiro",
                Code = $"AMAFORE-ACT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Activos AMAFORE",
                DocumentUrl = AmaforeEstadisticasUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "AMAFORE",
                    ["type"] = "Activos",
                    ["periodicidad"] = "Mensual",
                    ["indicadores"] = "Activos netos,Activos por SIEFORE"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"AMAFORE-INFORME-{DateTime.UtcNow:yyyyMM}",
                Title = "Informe Anual AMAFORE",
                Description = "Informe anual de la asociación sobre el estado del Sistema de Ahorro para el Retiro",
                Code = $"AMAFORE-INF-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Informes AMAFORE",
                DocumentUrl = AmaforeInformesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "AMAFORE",
                    ["type"] = "Informe",
                    ["periodicidad"] = "Anual"
                }
            });

            _logger.LogInformation("AMAFORE scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping AMAFORE: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapePublicacionesAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(AmaforeBaseUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='estadistica'], a[href*='informe'], a[href*='publicacion']");

            foreach (var link in links.Take(20))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = AmaforeBaseUrl + documentUrl;

                var externalId = GenerateExternalId("AMAFORE", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Publicación AMAFORE - Estadísticas y análisis del SAR",
                    Code = $"AMAFORE-PUB-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Publicaciones AMAFORE",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "AMAFORE",
                        ["type"] = "Publicacion",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping AMAFORE publicaciones");
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
