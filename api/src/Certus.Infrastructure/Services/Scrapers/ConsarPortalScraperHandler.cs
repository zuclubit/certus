using System.IO.Compression;
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
/// Scraper handler para Portal CONSAR
/// Extrae comunicados, plantillas SAR, esquemas XSD y documentación técnica
/// URL: https://www.consar.gob.mx
/// </summary>
public class ConsarPortalScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ConsarPortalScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string ConsarBaseUrl = "https://www.consar.gob.mx";
    private const string ComunicadosUrl = "https://www.consar.gob.mx/gobmx/aplicativo/catsar/Principal/CUP.aspx";
    private const string PlantillasUrl = "https://www.consar.gob.mx/gobmx/aplicativo/catsar/Principal/FormatosYPlantillas.aspx";
    private const string XsdUrl = "https://www.consar.gob.mx/gobmx/aplicativo/catsar/Principal/EsquemasXSD.aspx";
    private const string DocumentacionUrl = "https://www.consar.gob.mx/gobmx/aplicativo/siconsar/";

    public ScraperSourceType SourceType => ScraperSourceType.ConsarPortal;

    public ConsarPortalScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<ConsarPortalScraperHandler> logger)
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
                        "Retry {RetryAttempt} for CONSAR Portal request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.ConsarPortal;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting CONSAR Portal scraping");

            // Scrape comunicados (press releases)
            var comunicados = await ScrapeComunicadosAsync(cancellationToken);
            results.AddRange(comunicados);

            // Scrape plantillas SAR
            var plantillas = await ScrapePlantillasAsync(cancellationToken);
            results.AddRange(plantillas);

            // Scrape esquemas XSD
            var xsd = await ScrapeXsdAsync(cancellationToken);
            results.AddRange(xsd);

            // Scrape documentación técnica
            var docs = await ScrapeDocumentacionAsync(cancellationToken);
            results.AddRange(docs);

            _logger.LogInformation("CONSAR Portal scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping CONSAR Portal: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeComunicadosAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(ComunicadosUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                results.Add(CreateReferenceDocument("Comunicados CONSAR", ComunicadosUrl, "Comunicados"));
                return results;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var articles = document.QuerySelectorAll("article, .article-item, a[href*='prensa']");

            foreach (var article in articles.Take(20))
            {
                var anchor = article as IHtmlAnchorElement ?? article.QuerySelector("a") as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim() ?? article.QuerySelector("h2, h3, .title")?.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 10)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.gob.mx" + documentUrl;

                var externalId = GenerateExternalId("CONSAR-COM", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Comunicado oficial CONSAR - Sistema de Ahorro para el Retiro",
                    Code = $"CONSAR-COM-{DateTime.UtcNow:yyyyMMdd}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Comunicados CONSAR",
                    DocumentUrl = documentUrl,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CONSAR",
                        ["type"] = "Comunicado",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }

            if (results.Count == 0)
            {
                results.Add(CreateReferenceDocument("Comunicados CONSAR", ComunicadosUrl, "Comunicados"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping CONSAR comunicados");
            results.Add(CreateReferenceDocument("Comunicados CONSAR", ComunicadosUrl, "Comunicados"));
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapePlantillasAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(PlantillasUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                results.Add(CreateReferenceDocument("Plantillas SAR", PlantillasUrl, "Plantillas"));
                return results;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Find ZIP, XLS, PDF files
            var links = document.QuerySelectorAll("a[href*='.zip'], a[href*='.xls'], a[href*='.xlsx'], a[href*='.pdf'], a[href*='plantilla']");

            foreach (var link in links)
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title))
                    continue;

                var documentUrl = anchor.Href;
                var externalId = GenerateExternalId("CONSAR-PLT", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                var format = GetFileFormat(documentUrl);

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = $"Plantilla SAR CONSAR - Formato técnico para reportes ({format})",
                    Code = $"CONSAR-PLT-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Plantillas SAR",
                    DocumentUrl = documentUrl,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CONSAR",
                        ["type"] = "Plantilla",
                        ["format"] = format,
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }

            if (results.Count == 0)
            {
                results.Add(CreateReferenceDocument("Plantillas SAR", PlantillasUrl, "Plantillas"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping CONSAR plantillas");
            results.Add(CreateReferenceDocument("Plantillas SAR", PlantillasUrl, "Plantillas"));
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeXsdAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(XsdUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                results.Add(CreateReferenceDocument("Esquemas XSD", XsdUrl, "XSD"));
                return results;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Find XSD, XML, ZIP files
            var links = document.QuerySelectorAll("a[href*='.xsd'], a[href*='.xml'], a[href*='.zip'], a[href*='esquema']");

            foreach (var link in links)
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title))
                    continue;

                var documentUrl = anchor.Href;
                var externalId = GenerateExternalId("CONSAR-XSD", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Esquema XSD CONSAR - Estructura de archivos para intercambio de información",
                    Code = $"CONSAR-XSD-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Esquemas XSD",
                    DocumentUrl = documentUrl,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CONSAR",
                        ["type"] = "XSD",
                        ["format"] = "XML",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }

            if (results.Count == 0)
            {
                results.Add(CreateReferenceDocument("Esquemas XSD", XsdUrl, "XSD"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping CONSAR XSD");
            results.Add(CreateReferenceDocument("Esquemas XSD", XsdUrl, "XSD"));
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeDocumentacionAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(DocumentacionUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='documento'], a[href*='manual']");

            foreach (var link in links.Take(30))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.gob.mx" + documentUrl;

                var externalId = GenerateExternalId("CONSAR-DOC", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documentación técnica CONSAR",
                    Code = $"CONSAR-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentación CONSAR",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CONSAR",
                        ["type"] = "Documentacion",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping CONSAR documentación");
        }

        return results;
    }

    private static ScrapedDocumentData CreateReferenceDocument(string title, string url, string type)
    {
        return new ScrapedDocumentData
        {
            ExternalId = $"CONSAR-{type.ToUpperInvariant()}-REF-{DateTime.UtcNow:yyyyMM}",
            Title = title,
            Description = $"Referencia al portal de {title} de CONSAR",
            Code = $"CONSAR-{type.ToUpperInvariant()}-{DateTime.UtcNow:yyyyMM}",
            PublishDate = DateTime.UtcNow,
            Category = type,
            DocumentUrl = url,
            Metadata = new Dictionary<string, string>
            {
                ["source"] = "CONSAR",
                ["type"] = type
            }
        };
    }

    private static string GetFileFormat(string url)
    {
        if (url.Contains(".zip", StringComparison.OrdinalIgnoreCase)) return "ZIP";
        if (url.Contains(".xsd", StringComparison.OrdinalIgnoreCase)) return "XSD";
        if (url.Contains(".xml", StringComparison.OrdinalIgnoreCase)) return "XML";
        if (url.Contains(".xlsx", StringComparison.OrdinalIgnoreCase)) return "XLSX";
        if (url.Contains(".xls", StringComparison.OrdinalIgnoreCase)) return "XLS";
        if (url.Contains(".pdf", StringComparison.OrdinalIgnoreCase)) return "PDF";
        return "HTML";
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
