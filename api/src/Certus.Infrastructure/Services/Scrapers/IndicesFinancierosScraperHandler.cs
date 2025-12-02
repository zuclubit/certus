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
/// Scraper handler para Índices Financieros (BANXICO/INEGI)
/// Extrae UDI, INPC, TIIE, tipos de cambio, indicadores económicos
/// URLs: BANXICO SIE, INEGI BIE
/// </summary>
public class IndicesFinancierosScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<IndicesFinancierosScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string BanxicoSieUrl = "https://www.banxico.org.mx/SieInternet/";
    private const string BanxicoUdiUrl = "https://www.banxico.org.mx/SieInternet/consultarDirectorioInternetAction.do?accion=consultarCuadro&idCuadro=CP150";
    private const string BanxicoTiieUrl = "https://www.banxico.org.mx/SieInternet/consultarDirectorioInternetAction.do?accion=consultarCuadro&idCuadro=CF111";
    private const string InegiBieUrl = "https://www.inegi.org.mx/app/indicadores/";
    private const string InpcUrl = "https://www.inegi.org.mx/temas/inpc/";

    public ScraperSourceType SourceType => ScraperSourceType.IndicesFinancieros;

    public IndicesFinancierosScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<IndicesFinancierosScraperHandler> logger)
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
                        "Retry {RetryAttempt} for Indices Financieros request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.IndicesFinancieros;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting Indices Financieros scraping");

            // Scrape from BANXICO SIE
            var banxicoDocs = await ScrapeBanxicoIndicesAsync(cancellationToken);
            results.AddRange(banxicoDocs);

            // Add UDI (Unidad de Inversión) reference
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INDICES-UDI-{DateTime.UtcNow:yyyyMM}",
                Title = "Valor de la UDI (Unidad de Inversión)",
                Description = "Serie histórica del valor de la UDI publicada por BANXICO",
                Code = $"INDICES-UDI-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Índices BANXICO",
                DocumentUrl = BanxicoUdiUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BANXICO",
                    ["type"] = "UDI",
                    ["periodicidad"] = "Diario",
                    ["formato"] = "Serie temporal",
                    ["uso"] = "Actualización de saldos SAR"
                }
            });

            // Add TIIE (Tasa de Interés Interbancaria de Equilibrio)
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INDICES-TIIE-{DateTime.UtcNow:yyyyMM}",
                Title = "TIIE - Tasa de Interés Interbancaria de Equilibrio",
                Description = "Series de TIIE a diferentes plazos publicadas por BANXICO",
                Code = $"INDICES-TIIE-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Índices BANXICO",
                DocumentUrl = BanxicoTiieUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BANXICO",
                    ["type"] = "TIIE",
                    ["periodicidad"] = "Diario",
                    ["plazos"] = "28,91,182 días"
                }
            });

            // Add INPC (Índice Nacional de Precios al Consumidor)
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INDICES-INPC-{DateTime.UtcNow:yyyyMM}",
                Title = "INPC - Índice Nacional de Precios al Consumidor",
                Description = "Índice de inflación publicado por INEGI para actualización de valores",
                Code = $"INDICES-INPC-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Índices INEGI",
                DocumentUrl = InpcUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INEGI",
                    ["type"] = "INPC",
                    ["periodicidad"] = "Quincenal/Mensual",
                    ["uso"] = "Actualización de valores SAR"
                }
            });

            // Add Tipo de Cambio Fix
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INDICES-TCFIX-{DateTime.UtcNow:yyyyMM}",
                Title = "Tipo de Cambio FIX",
                Description = "Tipo de cambio del peso frente al dólar (FIX) determinado por BANXICO",
                Code = $"INDICES-TCFIX-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Índices BANXICO",
                DocumentUrl = BanxicoSieUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BANXICO",
                    ["type"] = "TipoCambio",
                    ["periodicidad"] = "Diario",
                    ["divisa"] = "USD/MXN"
                }
            });

            // Add Cetes
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INDICES-CETES-{DateTime.UtcNow:yyyyMM}",
                Title = "Tasas de Rendimiento CETES",
                Description = "Tasas de rendimiento de CETES para referencia de inversiones gubernamentales",
                Code = $"INDICES-CETES-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Índices BANXICO",
                DocumentUrl = BanxicoSieUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "BANXICO",
                    ["type"] = "CETES",
                    ["periodicidad"] = "Semanal",
                    ["plazos"] = "28,91,182,364 días"
                }
            });

            // Add Salario Mínimo
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INDICES-SMGV-{DateTime.UtcNow:yyyyMM}",
                Title = "Salario Mínimo General Vigente",
                Description = "Valor del salario mínimo para cálculos de aportaciones SAR",
                Code = $"INDICES-SMGV-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Índices CONASAMI",
                DocumentUrl = "https://www.gob.mx/conasami/documentos/tabla-de-salarios-minimos-generales-y-profesionales-por-areas-geograficas",
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONASAMI",
                    ["type"] = "SalarioMinimo",
                    ["periodicidad"] = "Anual",
                    ["uso"] = "Base para topes de cotización"
                }
            });

            // Add UMA (Unidad de Medida y Actualización)
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INDICES-UMA-{DateTime.UtcNow:yyyyMM}",
                Title = "UMA - Unidad de Medida y Actualización",
                Description = "Valor de la UMA para cálculos de prestaciones y límites SAR",
                Code = $"INDICES-UMA-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Índices INEGI",
                DocumentUrl = "https://www.inegi.org.mx/temas/uma/",
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INEGI",
                    ["type"] = "UMA",
                    ["periodicidad"] = "Anual",
                    ["uso"] = "Límite superior de cotización IMSS"
                }
            });

            _logger.LogInformation("Indices Financieros scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping Indices Financieros: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeBanxicoIndicesAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(BanxicoSieUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='consultarCuadro'], a[href*='serie'], a[href*='indice']");

            foreach (var link in links.Take(15))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 3)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.banxico.org.mx" + documentUrl;

                var externalId = GenerateExternalId("INDICES", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Serie de datos económicos BANXICO",
                    Code = $"INDICES-BXM-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Series BANXICO",
                    DocumentUrl = documentUrl,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "BANXICO",
                        ["type"] = "Serie",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping BANXICO indices");
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
