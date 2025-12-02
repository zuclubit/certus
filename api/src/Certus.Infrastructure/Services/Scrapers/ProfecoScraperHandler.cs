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
/// Scraper handler para PROFECO (Procuraduría Federal del Consumidor)
/// Extrae información sobre protección al consumidor en servicios financieros
/// URL: https://www.gob.mx/profeco
/// </summary>
public class ProfecoScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ProfecoScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string ProfecoBaseUrl = "https://www.profeco.gob.mx";
    private const string GobMxProfecoUrl = "https://www.gob.mx/profeco/documentos";
    private const string ProfecoNormatividadUrl = "https://www.gob.mx/profeco/acciones-y-programas/normatividad";

    public ScraperSourceType SourceType => ScraperSourceType.PROFECO;

    public ProfecoScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<ProfecoScraperHandler> logger)
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
                        "Retry {RetryAttempt} for PROFECO request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.PROFECO;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting PROFECO scraping");

            // Scrape documentos de protección al consumidor
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add PROFECO documents relevant for consumer protection in financial services
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PROFECO-LFPC-{DateTime.UtcNow:yyyyMM}",
                Title = "Ley Federal de Protección al Consumidor",
                Description = "Marco legal de protección al consumidor aplicable a servicios financieros",
                Code = $"PROFECO-LFPC-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Normatividad PROFECO",
                DocumentUrl = ProfecoNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PROFECO",
                    ["type"] = "Ley",
                    ["ley"] = "LFPC",
                    ["aplicacion"] = "Servicios financieros,Publicidad"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PROFECO-CONTRATOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Contratos de Adhesión",
                Description = "Requisitos para contratos de adhesión en servicios financieros",
                Code = $"PROFECO-CONT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Contratos PROFECO",
                DocumentUrl = GobMxProfecoUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PROFECO",
                    ["type"] = "ContratosAdhesion",
                    ["aplicacion"] = "Registro y validación de contratos"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PROFECO-PUBLICIDAD-{DateTime.UtcNow:yyyyMM}",
                Title = "Normatividad de Publicidad",
                Description = "Reglas de publicidad y promociones para servicios financieros",
                Code = $"PROFECO-PUB-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Publicidad PROFECO",
                DocumentUrl = ProfecoNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PROFECO",
                    ["type"] = "Publicidad",
                    ["requisitos"] = "Veracidad,Claridad,Comprobabilidad"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PROFECO-QUEJAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Sistema de Quejas y Conciliación",
                Description = "Procedimientos de queja y conciliación para consumidores financieros",
                Code = $"PROFECO-QUEJ-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Quejas PROFECO",
                DocumentUrl = GobMxProfecoUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PROFECO",
                    ["type"] = "Quejas",
                    ["proceso"] = "Conciliación,Arbitraje"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"PROFECO-SERVICIOS-FIN-{DateTime.UtcNow:yyyyMM}",
                Title = "Protección en Servicios Financieros",
                Description = "Coordinación PROFECO-CONDUSEF para protección del usuario financiero",
                Code = $"PROFECO-SFIN-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Servicios Financieros",
                DocumentUrl = GobMxProfecoUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "PROFECO",
                    ["type"] = "ServiciosFinancieros",
                    ["coordinacion"] = "CONDUSEF,CNBV,CONSAR"
                }
            });

            _logger.LogInformation("PROFECO scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping PROFECO: {Message}", ex.Message);
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
                await _httpClient.GetAsync(GobMxProfecoUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='consumidor'], a[href*='proteccion'], a[href*='contrato']");

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

                var externalId = GenerateExternalId("PROFECO", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento PROFECO protección al consumidor",
                    Code = $"PROFECO-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos PROFECO",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "PROFECO",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping PROFECO documentos");
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
