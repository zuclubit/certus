using System.Globalization;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
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
/// Scraper handler para Banco de México (BANXICO)
/// Extrae catálogos de instituciones financieras, calendarios y CLABEs
/// API: https://www.banxico.org.mx/SieAPIRest/service/v1/
/// Portal: https://www.banxico.org.mx
/// </summary>
public class BanxicoScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<BanxicoScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string BanxicoApiUrl = "https://www.banxico.org.mx/SieAPIRest/service/v1/";
    private const string CatalogosUrl = "https://www.banxico.org.mx/cep/catalogos.html";
    private const string CalendariosUrl = "https://www.banxico.org.mx/tipcamb/main.do?page=tip&idioma=sp";

    public ScraperSourceType SourceType => ScraperSourceType.BANXICO;

    public BanxicoScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<BanxicoScraperHandler> logger)
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
                        "Retry {RetryAttempt} for BANXICO request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.BANXICO;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting BANXICO scraping");

            // Scrape catalogs page
            var catalogDocs = await ScrapeCatalogosAsync(cancellationToken);
            results.AddRange(catalogDocs);

            // Scrape calendars
            var calendarDocs = await ScrapeCalendariosAsync(cancellationToken);
            results.AddRange(calendarDocs);

            _logger.LogInformation("BANXICO scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping BANXICO: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeCatalogosAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(CatalogosUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);

            var config = AngleSharp.Configuration.Default;
            var context = AngleSharp.BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Find catalog links (CSV, XLS files)
            var links = document.QuerySelectorAll("a[href*='.csv'], a[href*='.xls'], a[href*='.xlsx'], a[href*='catalogo']");

            foreach (var link in links)
            {
                var anchor = link as AngleSharp.Html.Dom.IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title))
                    continue;

                var documentUrl = anchor.Href;
                var externalId = GenerateExternalId("BANXICO-CAT", title, documentUrl);

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Catálogo BANXICO - " + title,
                    Code = $"BANXICO-CAT-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = DetermineCatalogCategory(title),
                    DocumentUrl = documentUrl,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "BANXICO",
                        ["type"] = "Catálogo",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping BANXICO catalogos");
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeCalendariosAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(CalendariosUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);

            var config = AngleSharp.Configuration.Default;
            var context = AngleSharp.BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Find calendar information
            var calendarSections = document.QuerySelectorAll(".calendario, table, .fechas");

            foreach (var section in calendarSections)
            {
                var title = section.QuerySelector("caption, h2, h3, .titulo")?.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title))
                    title = "Calendario BANXICO";

                var externalId = GenerateExternalId("BANXICO-CAL", title, CalendariosUrl);

                // Skip if already processed
                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = $"Calendario Financiero BANXICO - {DateTime.UtcNow.Year}",
                    Description = "Calendario de días inhábiles y fechas financieras de BANXICO",
                    Code = $"BANXICO-CAL-{DateTime.UtcNow.Year}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Calendarios",
                    DocumentUrl = CalendariosUrl,
                    RawHtml = section.OuterHtml,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "BANXICO",
                        ["type"] = "Calendario",
                        ["year"] = DateTime.UtcNow.Year.ToString()
                    }
                });

                break; // Only add one calendar entry
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping BANXICO calendarios");
        }

        return results;
    }

    private static string DetermineCatalogCategory(string? title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return "Catálogos";

        var lower = title.ToLowerInvariant();

        if (lower.Contains("clabe") || lower.Contains("institucion"))
            return "Catálogo CLABE";
        if (lower.Contains("banco"))
            return "Catálogo Bancos";
        if (lower.Contains("spei"))
            return "Catálogo SPEI";
        if (lower.Contains("tipo cambio") || lower.Contains("divisa"))
            return "Tipos de Cambio";

        return "Catálogos";
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
