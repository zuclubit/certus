using System.Text.Json;
using System.Text.RegularExpressions;
using AngleSharp;
using AngleSharp.Dom;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace Certus.Infrastructure.Services.Scrapers;

/// <summary>
/// Scraper handler para el portal GOB.MX CONSAR
/// Extrae documentos normativos del sitio oficial de CONSAR
/// </summary>
public class GobMxScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GobMxScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    public ScraperSourceType SourceType => ScraperSourceType.GobMxConsar;

    public GobMxScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<GobMxScraperHandler> logger)
    {
        _httpClient = httpClientFactory.CreateClient("Scraper");
        _logger = logger;

        _retryPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
            .WaitAndRetryAsync(
                3,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (outcome, timespan, retryAttempt, context) =>
                {
                    _logger.LogWarning(
                        "Retry {RetryAttempt} for GOB.MX request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.GobMxConsar;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var url = source.GetFullUrl();
            _logger.LogInformation("Fetching GOB.MX CONSAR from: {Url}", url);

            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(url, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("GOB.MX request failed with status {Status}", response.StatusCode);
                return results;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);

            // Parsear con AngleSharp
            var config = AngleSharp.Configuration.Default.WithDefaultLoader();
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // El portal gob.mx tiene una estructura específica
            results.AddRange(ParseGobMxDocuments(document, source.BaseUrl));

            // Si hay paginación, procesar páginas adicionales
            var nextPageUrl = GetNextPageUrl(document, source.BaseUrl);
            var pageCount = 1;
            const int maxPages = 5; // Limitar páginas para evitar scraping excesivo

            while (!string.IsNullOrEmpty(nextPageUrl) && pageCount < maxPages)
            {
                cancellationToken.ThrowIfCancellationRequested();

                _logger.LogInformation("Fetching page {Page}: {Url}", pageCount + 1, nextPageUrl);

                await Task.Delay(TimeSpan.FromSeconds(2), cancellationToken); // Rate limiting

                response = await _retryPolicy.ExecuteAsync(async () =>
                    await _httpClient.GetAsync(nextPageUrl, cancellationToken));

                if (!response.IsSuccessStatusCode)
                    break;

                html = await response.Content.ReadAsStringAsync(cancellationToken);
                document = await context.OpenAsync(req => req.Content(html), cancellationToken);

                results.AddRange(ParseGobMxDocuments(document, source.BaseUrl));

                nextPageUrl = GetNextPageUrl(document, source.BaseUrl);
                pageCount++;
            }

            _logger.LogInformation("GOB.MX scraping found {Count} documents across {Pages} pages",
                results.Count, pageCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping GOB.MX CONSAR: {Message}", ex.Message);
            throw;
        }

        return results.DistinctBy(r => r.ExternalId);
    }

    private IEnumerable<ScrapedDocumentData> ParseGobMxDocuments(IDocument document, string baseUrl)
    {
        var results = new List<ScrapedDocumentData>();

        // GOB.MX CONSAR estructura 2024/2025 - artículos y noticias
        var selectors = new[]
        {
            "article.post-article",           // Artículo destacado principal
            "article.post",                   // Artículos en listado
            "article.article-item",           // Artículos alternativos
            "div.document-item",              // Documentos
            "li.list-item a[href*='articulo']", // Links a artículos
            "div.contenido-documento",        // Contenedor de documento
            "a[href*='/consar/articulos/']"   // Links directos a artículos CONSAR
        };

        foreach (var selector in selectors)
        {
            var items = document.QuerySelectorAll(selector);

            foreach (var item in items)
            {
                try
                {
                    var doc = ExtractDocumentFromElement(item, baseUrl);
                    if (doc != null)
                    {
                        results.Add(doc);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error parsing GOB.MX document element");
                }
            }
        }

        // También buscar links directos a PDFs de circulares
        var pdfLinks = document.QuerySelectorAll("a[href*='.pdf']");
        foreach (var link in pdfLinks)
        {
            try
            {
                var href = link.GetAttribute("href");
                var text = link.TextContent?.Trim();

                if (string.IsNullOrEmpty(href) || string.IsNullOrEmpty(text))
                    continue;

                if (!IsCircularRelated(text) && !IsCircularRelated(href))
                    continue;

                var pdfUrl = href.StartsWith("http") ? href : $"{baseUrl.TrimEnd('/')}/{href.TrimStart('/')}";
                var code = ExtractCircularCode(text) ?? ExtractCircularCode(href);

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = GenerateExternalId(pdfUrl),
                    Title = CleanTitle(text),
                    Code = code,
                    Category = "Circulares",
                    PdfUrl = pdfUrl,
                    DocumentUrl = pdfUrl,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "GOB.MX",
                        ["type"] = "PDF"
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error parsing PDF link");
            }
        }

        return results;
    }

    private ScrapedDocumentData? ExtractDocumentFromElement(IElement element, string baseUrl)
    {
        // Buscar título - GOB.MX CONSAR usa h3 y h4 dentro de articles
        var titleElement = element.QuerySelector("h3, h4, h2, .title, .document-title");
        var title = titleElement?.TextContent?.Trim();

        // Si no hay título en h3/h4, intentar obtenerlo del link
        if (string.IsNullOrEmpty(title))
        {
            var linkWithText = element.QuerySelector("a[href*='articulo']");
            title = linkWithText?.TextContent?.Trim();
        }

        if (string.IsNullOrEmpty(title))
            return null;

        // Buscar link
        var linkElement = element.QuerySelector("a[href]") ?? element as IElement;
        var href = linkElement?.GetAttribute("href");

        if (string.IsNullOrEmpty(href))
            return null;

        // Verificar si es relevante
        if (!IsCircularRelated(title) && !IsCircularRelated(href))
            return null;

        // Buscar fecha
        var dateElement = element.QuerySelector(".date, .fecha, time, .published");
        var dateText = dateElement?.TextContent?.Trim() ?? dateElement?.GetAttribute("datetime");
        var publishDate = ParseDate(dateText);

        // Buscar descripción
        var descElement = element.QuerySelector(".description, .summary, p");
        var description = descElement?.TextContent?.Trim();

        // Construir URL
        var documentUrl = href.StartsWith("http") ? href : $"{baseUrl.TrimEnd('/')}/{href.TrimStart('/')}";

        // Buscar PDF si hay link diferente
        var pdfElement = element.QuerySelector("a[href*='.pdf']");
        var pdfUrl = pdfElement?.GetAttribute("href");
        if (!string.IsNullOrEmpty(pdfUrl) && !pdfUrl.StartsWith("http"))
        {
            pdfUrl = $"{baseUrl.TrimEnd('/')}/{pdfUrl.TrimStart('/')}";
        }

        return new ScrapedDocumentData
        {
            ExternalId = GenerateExternalId(documentUrl),
            Title = CleanTitle(title),
            Description = description,
            Code = ExtractCircularCode(title),
            PublishDate = publishDate,
            Category = DetermineCategory(title),
            DocumentUrl = documentUrl,
            PdfUrl = pdfUrl,
            Metadata = new Dictionary<string, string>
            {
                ["source"] = "GOB.MX CONSAR"
            }
        };
    }

    private static string? GetNextPageUrl(IDocument document, string baseUrl)
    {
        // Buscar link a página siguiente
        var nextSelectors = new[]
        {
            "a.next",
            "a[rel='next']",
            ".pagination a:contains('Siguiente')",
            ".pager-next a",
            "li.next a"
        };

        foreach (var selector in nextSelectors)
        {
            var next = document.QuerySelector(selector);
            if (next != null)
            {
                var href = next.GetAttribute("href");
                if (!string.IsNullOrEmpty(href))
                {
                    return href.StartsWith("http") ? href : $"{baseUrl.TrimEnd('/')}/{href.TrimStart('/')}";
                }
            }
        }

        return null;
    }

    private static bool IsCircularRelated(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return false;

        var lowerText = text.ToLowerInvariant();
        var keywords = new[]
        {
            "circular", "consar", "disposición", "normativ", "regla",
            "siefore", "afore", "retiro", "pensión", "anexo",
            "rendimiento", "comisión", "ahorro", "trabajador", "informe",
            "indicador", "inversión", "feria", "generacional"
        };

        return keywords.Any(k => lowerText.Contains(k));
    }

    private static string? ExtractCircularCode(string text)
    {
        var patterns = new[]
        {
            @"CONSAR\s*(\d+[-/]\d+)",
            @"Circular\s*(\d+[-/]\d+)",
            @"(\d+[-/]\d+)\s*CONSAR"
        };

        foreach (var pattern in patterns)
        {
            var match = Regex.Match(text, pattern, RegexOptions.IgnoreCase);
            if (match.Success)
            {
                return $"CONSAR {match.Groups[1].Value}";
            }
        }

        return null;
    }

    private static DateTime? ParseDate(string? dateText)
    {
        if (string.IsNullOrEmpty(dateText))
            return null;

        // Intentar varios formatos
        var formats = new[]
        {
            "dd/MM/yyyy",
            "yyyy-MM-dd",
            "d 'de' MMMM 'de' yyyy",
            "dd-MM-yyyy",
            "MM/dd/yyyy"
        };

        foreach (var format in formats)
        {
            if (DateTime.TryParseExact(dateText, format,
                new System.Globalization.CultureInfo("es-MX"),
                System.Globalization.DateTimeStyles.None,
                out var date))
            {
                return date;
            }
        }

        // Intentar parse general
        if (DateTime.TryParse(dateText, out var generalDate))
        {
            return generalDate;
        }

        return null;
    }

    private static string GenerateExternalId(string url)
    {
        using var sha = System.Security.Cryptography.SHA256.Create();
        var bytes = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(url));
        return $"GOBMX-{Convert.ToHexString(bytes)[..16]}";
    }

    private static string CleanTitle(string title)
    {
        title = Regex.Replace(title, @"\s+", " ").Trim();
        if (title.Length > 500)
            title = title[..497] + "...";
        return title;
    }

    private static string DetermineCategory(string title)
    {
        var lowerTitle = title.ToLowerInvariant();

        if (lowerTitle.Contains("circular"))
            return "Circulares";
        if (lowerTitle.Contains("disposición") || lowerTitle.Contains("disposicion"))
            return "Disposiciones";
        if (lowerTitle.Contains("regla"))
            return "Reglas";
        if (lowerTitle.Contains("anexo") || lowerTitle.Contains("formato"))
            return "Formatos";

        return "General";
    }
}
