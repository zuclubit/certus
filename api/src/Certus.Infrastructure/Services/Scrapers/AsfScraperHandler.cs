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
/// Scraper handler para ASF (Auditoría Superior de la Federación)
/// Extrae información sobre auditorías a AFOREs, CONSAR y entidades del SAR
/// URL: https://www.asf.gob.mx
/// </summary>
public class AsfScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AsfScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string AsfBaseUrl = "https://www.asf.gob.mx";
    private const string AsfInformesUrl = "https://www.asf.gob.mx/Section/58_Informes_de_auditoria";
    private const string GobMxAsfUrl = "https://www.gob.mx/asf/documentos";

    public ScraperSourceType SourceType => ScraperSourceType.ASF;

    public AsfScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<AsfScraperHandler> logger)
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
                        "Retry {RetryAttempt} for ASF request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.ASF;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting ASF scraping");

            // Scrape informes de auditoría
            var docs = await ScrapeInformesAsync(cancellationToken);
            results.AddRange(docs);

            // Add ASF audit documents relevant for AFOREs
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"ASF-AUDITORIAS-CONSAR-{DateTime.UtcNow:yyyyMM}",
                Title = "Auditorías a CONSAR",
                Description = "Informes de auditoría de la ASF a la Comisión Nacional del SAR",
                Code = $"ASF-AUD-CONSAR-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Auditorías CONSAR",
                DocumentUrl = AsfInformesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "ASF",
                    ["type"] = "Auditoria",
                    ["entidad"] = "CONSAR",
                    ["alcance"] = "Cuenta Pública Federal"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"ASF-AUDITORIAS-IMSS-SAR-{DateTime.UtcNow:yyyyMM}",
                Title = "Auditorías IMSS - Componente SAR",
                Description = "Auditorías al IMSS en materia de recaudación y aportaciones SAR",
                Code = $"ASF-AUD-IMSS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Auditorías IMSS",
                DocumentUrl = AsfInformesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "ASF",
                    ["type"] = "Auditoria",
                    ["entidad"] = "IMSS",
                    ["componente"] = "Recaudación SAR"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"ASF-AUDITORIAS-PENSIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Auditorías Sistema de Pensiones",
                Description = "Informes sobre gestión del sistema de pensiones federal",
                Code = $"ASF-AUD-PENS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Auditorías Pensiones",
                DocumentUrl = AsfInformesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "ASF",
                    ["type"] = "Auditoria",
                    ["tema"] = "Sistema Nacional de Pensiones"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"ASF-OBSERVACIONES-{DateTime.UtcNow:yyyyMM}",
                Title = "Observaciones y Recomendaciones ASF",
                Description = "Observaciones de auditoría y recomendaciones para entidades SAR",
                Code = $"ASF-OBS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Observaciones ASF",
                DocumentUrl = GobMxAsfUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "ASF",
                    ["type"] = "Observaciones",
                    ["seguimiento"] = "Acciones correctivas"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"ASF-DICTAMENES-{DateTime.UtcNow:yyyyMM}",
                Title = "Dictámenes de Cuenta Pública",
                Description = "Dictámenes de la ASF sobre cuenta pública en materia de pensiones",
                Code = $"ASF-DICT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Dictámenes ASF",
                DocumentUrl = AsfInformesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "ASF",
                    ["type"] = "Dictamen",
                    ["alcance"] = "Ejercicio fiscal federal"
                }
            });

            _logger.LogInformation("ASF scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping ASF: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeInformesAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(GobMxAsfUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='auditoria'], a[href*='informe'], a[href*='dictamen']");

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

                var externalId = GenerateExternalId("ASF", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento ASF auditoría federal",
                    Code = $"ASF-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos ASF",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "ASF",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping ASF informes");
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
