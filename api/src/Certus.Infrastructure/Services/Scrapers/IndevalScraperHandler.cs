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
/// Scraper handler para INDEVAL (S.D. Indeval)
/// Extrae información del depósito central de valores donde SIEFOREs custodian sus títulos
/// URL: https://www.indeval.com.mx
/// </summary>
public class IndevalScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<IndevalScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string IndevalBaseUrl = "https://www.indeval.com.mx";
    private const string IndevalNormatividadUrl = "https://www.indeval.com.mx/normatividad";
    private const string IndevalServiciosUrl = "https://www.indeval.com.mx/servicios";
    private const string IndevalComunicadosUrl = "https://www.indeval.com.mx/comunicados";

    public ScraperSourceType SourceType => ScraperSourceType.INDEVAL;

    public IndevalScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<IndevalScraperHandler> logger)
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
                        "Retry {RetryAttempt} for INDEVAL request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.INDEVAL;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting INDEVAL scraping");

            // Scrape normatividad y comunicados
            var docs = await ScrapeNormatividadAsync(cancellationToken);
            results.AddRange(docs);

            // Add INDEVAL specific documents for SIEFORE custody
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INDEVAL-CUSTODIA-{DateTime.UtcNow:yyyyMM}",
                Title = "Servicio de Custodia INDEVAL",
                Description = "Normatividad de custodia de valores para SIEFOREs y fondos de inversión",
                Code = $"INDEVAL-CUST-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Custodia INDEVAL",
                DocumentUrl = IndevalServiciosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INDEVAL",
                    ["type"] = "Custodia",
                    ["usuarios"] = "SIEFOREs,Fondos de Inversión,Bancos",
                    ["relacion_sar"] = "Portafolios de inversión"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INDEVAL-LIQUIDACION-{DateTime.UtcNow:yyyyMM}",
                Title = "Sistema de Liquidación DVP",
                Description = "Reglas del sistema de entrega contra pago para transacciones de valores",
                Code = $"INDEVAL-DVP-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Liquidación INDEVAL",
                DocumentUrl = IndevalServiciosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INDEVAL",
                    ["type"] = "Liquidacion",
                    ["metodo"] = "DVP (Delivery vs Payment)"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INDEVAL-NORMATIVIDAD-{DateTime.UtcNow:yyyyMM}",
                Title = "Marco Normativo INDEVAL",
                Description = "Reglamento interno y disposiciones del depósito central de valores",
                Code = $"INDEVAL-NORM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Normatividad INDEVAL",
                DocumentUrl = IndevalNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INDEVAL",
                    ["type"] = "Normatividad",
                    ["regulador"] = "CNBV"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INDEVAL-EVENTOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Eventos Corporativos INDEVAL",
                Description = "Procesamiento de dividendos, splits, derechos en valores custodiados",
                Code = $"INDEVAL-EVENTOS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Eventos INDEVAL",
                DocumentUrl = IndevalServiciosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INDEVAL",
                    ["type"] = "EventosCorporativos",
                    ["impacto_siefore"] = "Valuación de portafolios"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INDEVAL-CATALOGO-{DateTime.UtcNow:yyyyMM}",
                Title = "Catálogo de Emisiones INDEVAL",
                Description = "Registro de emisiones depositadas disponibles para inversión",
                Code = $"INDEVAL-CAT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Catálogo INDEVAL",
                DocumentUrl = IndevalBaseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INDEVAL",
                    ["type"] = "Catalogo",
                    ["contenido"] = "Acciones,Bonos,CETES,Udibonos"
                }
            });

            _logger.LogInformation("INDEVAL scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping INDEVAL: {Message}", ex.Message);
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
                await _httpClient.GetAsync(IndevalNormatividadUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='reglamento'], a[href*='custodia'], a[href*='valor']");

            foreach (var link in links.Take(20))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 3)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = IndevalBaseUrl + documentUrl;

                var externalId = GenerateExternalId("INDEVAL", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento INDEVAL depósito de valores",
                    Code = $"INDEVAL-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos INDEVAL",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "INDEVAL",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping INDEVAL normatividad");
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
