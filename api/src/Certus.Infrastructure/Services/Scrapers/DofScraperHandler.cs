using System.Globalization;
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
/// Scraper handler para el Diario Oficial de la Federación (DOF)
/// Extrae circulares CONSAR publicadas oficialmente
/// </summary>
public class DofScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<DofScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private static readonly string[] ConsarKeywords = new[]
    {
        "CONSAR", "Sistema de Ahorro para el Retiro", "AFORE", "SIEFORE",
        "pensiones", "retiro", "circular consar"
    };

    public ScraperSourceType SourceType => ScraperSourceType.DOF;

    public DofScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<DofScraperHandler> logger)
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
                        "Retry {RetryAttempt} for DOF request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.DOF;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            // Primera estrategia: Buscar en la página de búsqueda del DOF por "CONSAR"
            var searchResults = await SearchDofForConsarAsync(source.BaseUrl, cancellationToken);
            results.AddRange(searchResults);
            _logger.LogInformation("DOF CONSAR search found {Count} documents", searchResults.Count());

            // Segunda estrategia: Revisar el índice del mes actual por si hay publicaciones nuevas
            var indexUrl = BuildSearchUrl(source);
            _logger.LogInformation("Fetching DOF index from: {Url}", indexUrl);

            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(indexUrl, cancellationToken));

            if (response.IsSuccessStatusCode)
            {
                var html = await response.Content.ReadAsStringAsync(cancellationToken);
                var config = AngleSharp.Configuration.Default.WithDefaultLoader();
                var context = BrowsingContext.New(config);
                var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

                var indexResults = ParseDofListings(document, source.BaseUrl);
                results.AddRange(indexResults);
                _logger.LogInformation("DOF index found {Count} CONSAR-related documents", indexResults.Count());
            }

            // Eliminar duplicados por ExternalId
            results = results.DistinctBy(r => r.ExternalId).ToList();
            _logger.LogInformation("DOF scraping total: {Count} unique documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping DOF: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<IEnumerable<ScrapedDocumentData>> SearchDofForConsarAsync(
        string baseUrl,
        CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            // URL de búsqueda del DOF usando GET con parámetros correctos
            // El DOF usa textobusqueda (no busqueda) y vienede=header
            var searchUrl = $"{baseUrl}/busqueda_detalle.php?textobusqueda=CONSAR&vienede=header";

            _logger.LogInformation("Searching DOF for CONSAR: {Url}", searchUrl);

            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(searchUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("DOF search request failed with status {Status}", response.StatusCode);
                return results;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogDebug("DOF search response length: {Length} chars", html.Length);

            var config = AngleSharp.Configuration.Default.WithDefaultLoader();
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Parsear resultados de búsqueda (no filtramos por CONSAR porque ya buscamos por CONSAR)
            results.AddRange(ParseSearchResults(document, baseUrl));
            _logger.LogInformation("DOF search parsed {Count} results", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error searching DOF: {Message}", ex.Message);
        }

        return results;
    }

    private IEnumerable<ScrapedDocumentData> ParseSearchResults(IDocument document, string baseUrl)
    {
        var results = new List<ScrapedDocumentData>();

        // Los resultados de búsqueda del DOF usan clase "txt_azul" para los enlaces
        // Estructura real del DOF (verificada Nov 2025):
        // <a href="/nota_detalle.php?codigo=5754740&fecha=11/04/2025" class="txt_azul">
        //   <b><U>Circular CONSAR 19-33...</U></b>
        // </a>
        var selectors = new[]
        {
            "a.txt_azul[href*='nota_detalle']",  // Clase principal en resultados de búsqueda DOF
            "a.txt_azul[href*='codigo']",        // Variante con codigo en href
            "td.txt_azul a[href*='nota_detalle']", // Dentro de celda txt_azul
            "a[href*='nota_detalle']",           // Fallback genérico
        };

        _logger.LogDebug("Parsing DOF search results with {Count} selectors", selectors.Length);

        foreach (var selector in selectors)
        {
            var links = document.QuerySelectorAll(selector);

            foreach (var link in links)
            {
                try
                {
                    var title = link.TextContent?.Trim() ?? "";
                    var href = link.GetAttribute("href") ?? "";

                    if (string.IsNullOrEmpty(title) || title.Length < 10)
                        continue;

                    var documentUrl = href.StartsWith("http")
                        ? href
                        : $"{baseUrl.TrimEnd('/')}/{href.TrimStart('/')}";

                    var code = ExtractCircularCode(title);
                    var publishDate = ExtractDateFromUrl(href) ?? DateTime.UtcNow;
                    var externalId = GenerateExternalId(href);

                    results.Add(new ScrapedDocumentData
                    {
                        ExternalId = externalId,
                        Title = CleanTitle(title),
                        Code = code,
                        PublishDate = publishDate,
                        Category = DetermineCategory(title),
                        DocumentUrl = documentUrl,
                        Metadata = new Dictionary<string, string>
                        {
                            ["source"] = "DOF",
                            ["searchResult"] = "true",
                            ["originalUrl"] = href
                        }
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error parsing DOF search result");
                }
            }
        }

        return results.DistinctBy(r => r.ExternalId);
    }

    private static string BuildSearchUrl(ScraperSource source)
    {
        // DOF URL para buscar circulares de CONSAR
        // Formato: https://www.dof.gob.mx/index.php?year=2024&month=11&day=01
        // O búsqueda: https://www.dof.gob.mx/busqueda_detalle.php
        var baseUrl = source.BaseUrl;

        // Only use EndpointPath if it's a valid index URL, not nota_detalle.php
        // (nota_detalle.php is for viewing individual articles, not for index/search)
        if (!string.IsNullOrEmpty(source.EndpointPath) &&
            !source.EndpointPath.Contains("nota_detalle") &&
            source.EndpointPath.Contains("index"))
        {
            return $"{baseUrl}/{source.EndpointPath.TrimStart('/')}";
        }

        // Por defecto, buscar en el índice del mes actual
        var now = DateTime.UtcNow;
        return $"{baseUrl}/index.php?year={now.Year}&month={now.Month:00}&day=01";
    }

    private IEnumerable<ScrapedDocumentData> ParseDofListings(IDocument document, string baseUrl)
    {
        var results = new List<ScrapedDocumentData>();

        // Selector para los artículos del DOF - estructura verificada Nov 2025
        // El índice diario usa class="enlaces", los resultados de búsqueda usan txt_azul
        // Estructura índice: <a href="/nota_detalle.php?codigo=5774017&amp;fecha=26/11/2025" class="enlaces">
        var selectors = new[]
        {
            "a.enlaces[href*='nota_detalle']",  // Links en índice diario - PRINCIPAL
            "a.enlaces[href*='codigo']",        // Variante con codigo
            "td a.enlaces[href*='nota']",       // Dentro de celdas
            "a[href*='nota_detalle']",          // Fallback genérico
        };

        _logger.LogDebug("Parsing DOF listings with {Count} selectors", selectors.Length);

        foreach (var selector in selectors)
        {
            var links = document.QuerySelectorAll(selector);

            foreach (var link in links)
            {
                try
                {
                    var title = link.TextContent?.Trim() ?? "";
                    var href = link.GetAttribute("href") ?? "";

                    // Filtrar solo documentos relacionados con CONSAR
                    if (!IsConsarRelated(title))
                        continue;

                    // Construir URL completa
                    var documentUrl = href.StartsWith("http")
                        ? href
                        : $"{baseUrl.TrimEnd('/')}/{href.TrimStart('/')}";

                    // Extraer código de circular si está presente
                    var code = ExtractCircularCode(title);

                    // Extraer fecha del documento
                    var publishDate = ExtractDateFromUrl(href) ?? DateTime.UtcNow;

                    // Generar ID único basado en URL
                    var externalId = GenerateExternalId(href);

                    results.Add(new ScrapedDocumentData
                    {
                        ExternalId = externalId,
                        Title = CleanTitle(title),
                        Code = code,
                        PublishDate = publishDate,
                        Category = DetermineCategory(title),
                        DocumentUrl = documentUrl,
                        Metadata = new Dictionary<string, string>
                        {
                            ["source"] = "DOF",
                            ["originalUrl"] = href
                        }
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error parsing DOF link");
                }
            }
        }

        return results.DistinctBy(r => r.ExternalId);
    }

    private static bool IsConsarRelated(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return false;

        var lowerText = text.ToLowerInvariant();
        return ConsarKeywords.Any(k => lowerText.Contains(k.ToLowerInvariant()));
    }

    private static string? ExtractCircularCode(string title)
    {
        // Patrones para códigos de circular CONSAR
        // Ejemplos: "CIRCULAR CONSAR 19-21", "CONSAR 19-8", etc.
        var patterns = new[]
        {
            @"CIRCULAR\s+CONSAR\s+(\d+[-/]\d+)",
            @"CONSAR\s+(\d+[-/]\d+)",
            @"CIRCULAR\s+(\d+[-/]\d+)",
            @"(\d+[-/]\d+)\s+CONSAR"
        };

        foreach (var pattern in patterns)
        {
            var match = Regex.Match(title, pattern, RegexOptions.IgnoreCase);
            if (match.Success)
            {
                return $"CONSAR {match.Groups[1].Value}";
            }
        }

        return null;
    }

    private static DateTime? ExtractDateFromUrl(string url)
    {
        // Intentar extraer fecha del URL del DOF
        // Formato típico: nota_detalle.php?codigo=5716387&fecha=08/02/2024
        var dateMatch = Regex.Match(url, @"fecha=(\d{2})/(\d{2})/(\d{4})");
        if (dateMatch.Success)
        {
            if (int.TryParse(dateMatch.Groups[1].Value, out int day) &&
                int.TryParse(dateMatch.Groups[2].Value, out int month) &&
                int.TryParse(dateMatch.Groups[3].Value, out int year))
            {
                // PostgreSQL requiere UTC para timestamp with time zone
                return new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);
            }
        }

        return null;
    }

    private static string GenerateExternalId(string url)
    {
        // Extraer código único del URL o generar hash
        var codeMatch = Regex.Match(url, @"codigo=(\d+)");
        if (codeMatch.Success)
        {
            return $"DOF-{codeMatch.Groups[1].Value}";
        }

        // Si no hay código, usar hash del URL
        using var sha = System.Security.Cryptography.SHA256.Create();
        var bytes = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(url));
        return $"DOF-{Convert.ToHexString(bytes)[..16]}";
    }

    private static string CleanTitle(string title)
    {
        // Limpiar y normalizar el título
        title = Regex.Replace(title, @"\s+", " ").Trim();
        title = title.Replace("\n", " ").Replace("\r", "");

        // Limitar longitud
        if (title.Length > 500)
            title = title[..497] + "...";

        return title;
    }

    private static string DetermineCategory(string title)
    {
        var lowerTitle = title.ToLowerInvariant();

        if (lowerTitle.Contains("siefore") || lowerTitle.Contains("inversión"))
            return "Inversiones";
        if (lowerTitle.Contains("retiro") || lowerTitle.Contains("pensión"))
            return "Retiro";
        if (lowerTitle.Contains("afore") || lowerTitle.Contains("administradora"))
            return "Administradoras";
        if (lowerTitle.Contains("formato") || lowerTitle.Contains("anexo"))
            return "Formatos";
        if (lowerTitle.Contains("comisión") || lowerTitle.Contains("cobro"))
            return "Comisiones";

        return "General";
    }
}
