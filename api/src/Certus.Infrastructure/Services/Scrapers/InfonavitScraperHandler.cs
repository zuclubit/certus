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
/// Scraper handler para INFONAVIT (Instituto del Fondo Nacional de la Vivienda para los Trabajadores)
/// Extrae reglas de aportaciones, subcuentas de vivienda y normatividad
/// URL: https://portalmx.infonavit.org.mx
/// </summary>
public class InfonavitScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<InfonavitScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string InfonavitBaseUrl = "https://portalmx.infonavit.org.mx";
    private const string InfonavitGobUrl = "https://www.infonavit.org.mx";
    private const string InfonavitNormatividadUrl = "https://www.infonavit.org.mx/wps/portal/Infonavit/NormativaYMarcoJuridico";
    private const string InfonavitPortalUrl = "https://portalmx.infonavit.org.mx";

    public ScraperSourceType SourceType => ScraperSourceType.INFONAVIT;

    public InfonavitScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<InfonavitScraperHandler> logger)
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
                        "Retry {RetryAttempt} for INFONAVIT request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.INFONAVIT;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting INFONAVIT scraping");

            // Scrape documents from GOB.MX
            var docs = await ScrapeDocumentsAsync(cancellationToken);
            results.AddRange(docs);

            // Add aportaciones rules
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INFONAVIT-APORT-{DateTime.UtcNow:yyyyMM}",
                Title = "Reglas de Aportaciones INFONAVIT",
                Description = "Especificaciones de aportaciones patronales al INFONAVIT (5% del salario base de cotización)",
                Code = $"INFONAVIT-APORT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Aportaciones INFONAVIT",
                DocumentUrl = InfonavitBaseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INFONAVIT",
                    ["type"] = "Aportaciones",
                    ["porcentaje"] = "5%",
                    ["base"] = "SBC"
                }
            });

            // Add subcuenta vivienda
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INFONAVIT-SCV-{DateTime.UtcNow:yyyyMM}",
                Title = "Subcuenta de Vivienda - Especificaciones",
                Description = "Reglas operativas de la subcuenta de vivienda en cuentas individuales SAR",
                Code = $"INFONAVIT-SCV-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Subcuenta Vivienda",
                DocumentUrl = InfonavitBaseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INFONAVIT",
                    ["type"] = "SubcuentaVivienda",
                    ["integracion"] = "SAR"
                }
            });

            // Add crédito INFONAVIT rules
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"INFONAVIT-CRED-{DateTime.UtcNow:yyyyMM}",
                Title = "Reglas de Crédito INFONAVIT",
                Description = "Normatividad para otorgamiento y amortización de créditos INFONAVIT",
                Code = $"INFONAVIT-CRED-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Créditos INFONAVIT",
                DocumentUrl = InfonavitNormatividadUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "INFONAVIT",
                    ["type"] = "Creditos"
                }
            });

            _logger.LogInformation("INFONAVIT scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping INFONAVIT: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeDocumentsAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(InfonavitGobUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='infonavit'], a[href*='vivienda']");

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

                var externalId = GenerateExternalId("INFONAVIT", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documentación INFONAVIT - Fondo de vivienda para trabajadores",
                    Code = $"INFONAVIT-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos INFONAVIT",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "INFONAVIT",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping INFONAVIT documents");
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
