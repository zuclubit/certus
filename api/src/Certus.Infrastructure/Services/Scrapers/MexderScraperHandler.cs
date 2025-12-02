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
/// Scraper handler para MexDer (Mercado Mexicano de Derivados)
/// Extrae información de derivados financieros que SIEFOREs pueden usar para cobertura
/// URL: https://www.mexder.com.mx
/// </summary>
public class MexderScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MexderScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string MexderBaseUrl = "https://www.mexder.com.mx";
    private const string MexderNormatividadUrl = "https://www.mexder.com.mx/wb3/wb/MEX/normatividad";
    private const string MexderProductosUrl = "https://www.mexder.com.mx/wb3/wb/MEX/productos";
    private const string MexderEstadisticasUrl = "https://www.mexder.com.mx/wb3/wb/MEX/estadisticas";

    public ScraperSourceType SourceType => ScraperSourceType.MEXDER;

    public MexderScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<MexderScraperHandler> logger)
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
                        "Retry {RetryAttempt} for MEXDER request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.MEXDER;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting MEXDER scraping");

            // Scrape normatividad y productos
            var docs = await ScrapeNormatividadAsync(cancellationToken);
            results.AddRange(docs);

            // Add MEXDER derivative products relevant for SIEFOREs
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"MEXDER-FUTUROS-{DateTime.UtcNow:yyyyMM}",
                Title = "Futuros sobre Índices y Tasas",
                Description = "Especificaciones de contratos de futuros para cobertura de portafolios SIEFORE",
                Code = $"MEXDER-FUT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Futuros MEXDER",
                DocumentUrl = MexderProductosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "MEXDER",
                    ["type"] = "Futuros",
                    ["subyacentes"] = "IPC,TIIE,Dólar,Bonos",
                    ["uso_siefore"] = "Cobertura de riesgos"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"MEXDER-OPCIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Opciones Financieras MexDer",
                Description = "Contratos de opciones disponibles para estrategias de inversión",
                Code = $"MEXDER-OPT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Opciones MEXDER",
                DocumentUrl = MexderProductosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "MEXDER",
                    ["type"] = "Opciones",
                    ["tipos"] = "Call,Put",
                    ["subyacentes"] = "IPC,Acciones,Dólar"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"MEXDER-NORMATIVIDAD-{DateTime.UtcNow:yyyyMM}",
                Title = "Reglamento Interior MexDer",
                Description = "Marco normativo del mercado mexicano de derivados",
                Code = $"MEXDER-NORM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Normatividad MEXDER",
                DocumentUrl = MexderNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "MEXDER",
                    ["type"] = "Normatividad",
                    ["regulador"] = "CNBV"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"MEXDER-ASIGNA-{DateTime.UtcNow:yyyyMM}",
                Title = "Cámara de Compensación Asigna",
                Description = "Reglas de compensación y liquidación de derivados",
                Code = $"MEXDER-ASIG-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Asigna MEXDER",
                DocumentUrl = MexderNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "MEXDER",
                    ["type"] = "Compensacion",
                    ["funcion"] = "Contraparte central"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"MEXDER-LIMITES-{DateTime.UtcNow:yyyyMM}",
                Title = "Límites de Posición Derivados",
                Description = "Límites de posición para derivados aplicables a inversionistas institucionales",
                Code = $"MEXDER-LIM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Límites MEXDER",
                DocumentUrl = MexderNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "MEXDER",
                    ["type"] = "Limites",
                    ["aplicabilidad"] = "SIEFOREs,Fondos"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"MEXDER-SWAPS-{DateTime.UtcNow:yyyyMM}",
                Title = "Swaps y Derivados OTC",
                Description = "Normatividad para derivados over-the-counter y swaps de tasas",
                Code = $"MEXDER-SWAP-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Swaps MEXDER",
                DocumentUrl = MexderProductosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "MEXDER",
                    ["type"] = "Swaps",
                    ["tipos"] = "IRS,CCS,FX Forwards"
                }
            });

            _logger.LogInformation("MEXDER scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping MEXDER: {Message}", ex.Message);
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
                await _httpClient.GetAsync(MexderNormatividadUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='derivado'], a[href*='futuro'], a[href*='opcion']");

            foreach (var link in links.Take(20))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 3)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = MexderBaseUrl + documentUrl;

                var externalId = GenerateExternalId("MEXDER", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento MEXDER mercado de derivados",
                    Code = $"MEXDER-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos MEXDER",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "MEXDER",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping MEXDER normatividad");
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
