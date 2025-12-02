using System.Globalization;
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
/// Scraper handler para la Comisión Nacional Bancaria y de Valores (CNBV)
/// Extrae criterios contables, reportes regulatorios y normatividad
/// URL: https://www.gob.mx/cnbv
/// </summary>
public class CnbvScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CnbvScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string CnbvBaseUrl = "https://www.cnbv.gob.mx";
    private const string NormatividadUrl = "https://www.cnbv.gob.mx/SECTORES-SUPERVISADOS/Paginas/default.aspx";
    private const string CnbvDocumentosUrl = "https://www.gob.mx/cnbv/documentos/documentos-banca-multiple";
    private const string CnbvGobMxUrl = "https://www.gob.mx/cnbv";

    public ScraperSourceType SourceType => ScraperSourceType.CNBV;

    public CnbvScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<CnbvScraperHandler> logger)
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
                        "Retry {RetryAttempt} for CNBV request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.CNBV;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting CNBV scraping from {Url}", source.GetFullUrl() ?? NormatividadUrl);

            var url = source.GetFullUrl() ?? NormatividadUrl;
            var html = await FetchHtmlAsync(url, cancellationToken);

            if (string.IsNullOrEmpty(html))
            {
                _logger.LogWarning("Empty HTML response from CNBV");
                return results;
            }

            var documents = await ParseCnbvDocumentsAsync(html, cancellationToken);
            results.AddRange(documents);

            _logger.LogInformation("CNBV scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping CNBV: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<string> FetchHtmlAsync(string url, CancellationToken cancellationToken)
    {
        var response = await _retryPolicy.ExecuteAsync(async () =>
            await _httpClient.GetAsync(url, cancellationToken));

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("CNBV request failed with status {Status}", response.StatusCode);
            return string.Empty;
        }

        return await response.Content.ReadAsStringAsync(cancellationToken);
    }

    private async Task<List<ScrapedDocumentData>> ParseCnbvDocumentsAsync(string html, CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        var config = AngleSharp.Configuration.Default;
        var context = BrowsingContext.New(config);
        var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

        // Parse document links and articles from CNBV page
        var articles = document.QuerySelectorAll("article, .article-item, .document-item, .list-item");

        foreach (var article in articles)
        {
            try
            {
                var titleElement = article.QuerySelector("h2, h3, h4, .title, a");
                var title = titleElement?.TextContent?.Trim();

                if (string.IsNullOrWhiteSpace(title))
                    continue;

                var linkElement = article.QuerySelector("a[href]") as IHtmlAnchorElement;
                var documentUrl = linkElement?.Href;

                var dateElement = article.QuerySelector(".date, time, .fecha");
                var dateText = dateElement?.TextContent?.Trim();
                var publishDate = ParseDate(dateText);

                var descriptionElement = article.QuerySelector("p, .description, .summary");
                var description = descriptionElement?.TextContent?.Trim();

                var externalId = GenerateExternalId("CNBV", title, documentUrl);

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = description,
                    Code = ExtractCode(title),
                    PublishDate = publishDate,
                    Category = DetermineCategory(title, description),
                    DocumentUrl = documentUrl,
                    PdfUrl = ExtractPdfUrl(article),
                    RawHtml = article.OuterHtml,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CNBV",
                        ["sourceUrl"] = CnbvBaseUrl,
                        ["contentHash"] = ComputeHash(title + description)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error parsing CNBV article");
            }
        }

        // Also parse links in content sections
        var contentLinks = document.QuerySelectorAll(".content a[href*='.pdf'], .content a[href*='criterios'], .content a[href*='circular']");
        foreach (var link in contentLinks)
        {
            try
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 10)
                    continue;

                var documentUrl = anchor.Href;
                var externalId = GenerateExternalId("CNBV", title, documentUrl);

                // Skip if already added
                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Code = ExtractCode(title),
                    PublishDate = DateTime.UtcNow,
                    Category = DetermineCategory(title, null),
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CNBV",
                        ["sourceUrl"] = CnbvBaseUrl,
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error parsing CNBV content link");
            }
        }

        return results;
    }

    private static string GenerateExternalId(string source, string title, string? url)
    {
        var input = $"{source}-{title}-{url}";
        return $"CNBV-{ComputeHash(input)[..16]}";
    }

    private static string ComputeHash(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static string? ExtractCode(string? title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return null;

        // Extract circular or criteria codes
        var patterns = new[]
        {
            @"Circular\s+(\d+[-/]\d+)",
            @"CUB\s+(\d+[-/]\d+)",
            @"R-?(\d{2})",
            @"Criterio[s]?\s+[A-Z]-?(\d+)",
            @"Anexo\s+(\d+)",
        };

        foreach (var pattern in patterns)
        {
            var match = Regex.Match(title, pattern, RegexOptions.IgnoreCase);
            if (match.Success)
            {
                return $"CNBV-{match.Groups[1].Value}";
            }
        }

        return null;
    }

    private static DateTime? ParseDate(string? dateText)
    {
        if (string.IsNullOrWhiteSpace(dateText))
            return null;

        var formats = new[]
        {
            "dd/MM/yyyy",
            "yyyy-MM-dd",
            "d 'de' MMMM 'de' yyyy",
            "dd-MM-yyyy"
        };

        foreach (var format in formats)
        {
            if (DateTime.TryParseExact(dateText, format,
                new CultureInfo("es-MX"),
                DateTimeStyles.None,
                out var date))
            {
                return DateTime.SpecifyKind(date, DateTimeKind.Utc);
            }
        }

        if (DateTime.TryParse(dateText, out var generalDate))
        {
            return DateTime.SpecifyKind(generalDate, DateTimeKind.Utc);
        }

        return null;
    }

    private static string DetermineCategory(string? title, string? description)
    {
        var combined = $"{title} {description}".ToLowerInvariant();

        if (combined.Contains("criterio") && combined.Contains("contab"))
            return "Criterios Contables";
        if (combined.Contains("r04") || combined.Contains("r-04"))
            return "Reportes R04";
        if (combined.Contains("r08") || combined.Contains("r-08"))
            return "Reportes R08";
        if (combined.Contains("r13") || combined.Contains("r-13"))
            return "Reportes R13";
        if (combined.Contains("circular"))
            return "Circulares";
        if (combined.Contains("anexo"))
            return "Anexos";
        if (combined.Contains("disposición") || combined.Contains("disposicion"))
            return "Disposiciones";

        return "General";
    }

    private static string? ExtractPdfUrl(AngleSharp.Dom.IElement article)
    {
        var pdfLink = article.QuerySelector("a[href$='.pdf']") as IHtmlAnchorElement;
        return pdfLink?.Href;
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
