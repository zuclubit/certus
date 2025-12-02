using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
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
/// Scraper handler para SIDOF (Sistema de Información del DOF) - SEGOB
/// Extrae documentos normativos del sistema de información del DOF via API AJAX
/// </summary>
public class SidofScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SidofScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;
    private const string SearchApiEndpoint = "/busqueda/CargaNotasAvanzadas/";
    private const string HomePageEndpoint = "/";  // Para scraping HTML directo

    public ScraperSourceType SourceType => ScraperSourceType.SIDOF;

    public SidofScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<SidofScraperHandler> logger)
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
                        "Retry {RetryAttempt} for SIDOF request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.SIDOF;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            // SIDOF usa una API AJAX para búsquedas - enviar requests para diferentes términos CONSAR
            var searchTerms = new[] { "circular CONSAR", "CONSAR", "disposición CONSAR", "reglas CONSAR" };

            foreach (var term in searchTerms)
            {
                _logger.LogInformation("Searching SIDOF for: {Term}", term);

                var searchResults = await SearchSidofApiAsync(source.BaseUrl, term, cancellationToken);
                results.AddRange(searchResults);

                // Pequeña pausa entre búsquedas
                await Task.Delay(500, cancellationToken);
            }

            // Si no encontramos resultados via API, intentar HTML scraping directo
            if (results.Count == 0)
            {
                _logger.LogInformation("SIDOF API returned no results, attempting HTML scraping fallback");
                var htmlResults = await ScrapeHtmlFallbackAsync(source.BaseUrl, cancellationToken);
                results.AddRange(htmlResults);
            }

            _logger.LogInformation("SIDOF scraping found {Count} total documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping SIDOF: {Message}", ex.Message);
            throw;
        }

        return results.DistinctBy(r => r.ExternalId);
    }

    /// <summary>
    /// Fallback: Scrape documentos directamente desde la página de notas del DOF
    /// Busca en páginas de notas individuales usando códigos conocidos
    /// </summary>
    private async Task<List<ScrapedDocumentData>> ScrapeHtmlFallbackAsync(
        string baseUrl,
        CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            // Scrapar la página de búsqueda avanzada con resultados de CONSAR
            var searchPageUrl = $"{baseUrl.TrimEnd('/')}/busquedaAvanzada/busqueda";
            var response = await _httpClient.GetAsync(searchPageUrl, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var html = await response.Content.ReadAsStringAsync(cancellationToken);

                // Parsear HTML con AngleSharp
                var config = AngleSharp.Configuration.Default.WithDefaultLoader();
                var context = BrowsingContext.New(config);
                var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

                // Buscar links a notas del DOF
                var noteLinks = document.QuerySelectorAll("a[href*='/notas/'], a[href*='docFuente/']");

                foreach (var link in noteLinks)
                {
                    var href = link.GetAttribute("href");
                    var title = link.TextContent?.Trim();

                    if (!string.IsNullOrEmpty(href) && !string.IsNullOrEmpty(title) && IsCircularRelated(title))
                    {
                        var documentUrl = href.StartsWith("http") ? href : $"{baseUrl.TrimEnd('/')}{href}";

                        results.Add(new ScrapedDocumentData
                        {
                            ExternalId = GenerateExternalId(documentUrl, null),
                            Title = CleanTitle(title),
                            Code = ExtractCircularCode(title),
                            Category = DetermineCategory(title),
                            DocumentUrl = documentUrl,
                            Metadata = new Dictionary<string, string>
                            {
                                ["source"] = "SIDOF-HTML",
                                ["scrapeDate"] = DateTime.UtcNow.ToString("O")
                            }
                        });
                    }
                }

                _logger.LogInformation("HTML fallback found {Count} documents from search page", results.Count);
            }

            // También scrapear notas conocidas de CONSAR por código
            var knownNoteCodes = await GetKnownConsarNoteCodesAsync(baseUrl, cancellationToken);
            foreach (var noteCode in knownNoteCodes.Take(50))  // Limitar a 50 notas
            {
                var noteUrl = $"{baseUrl.TrimEnd('/')}/notas/{noteCode}";
                var noteDoc = await ScrapeIndividualNoteAsync(noteUrl, baseUrl, cancellationToken);
                if (noteDoc != null && !results.Any(r => r.ExternalId == noteDoc.ExternalId))
                {
                    results.Add(noteDoc);
                }

                await Task.Delay(200, cancellationToken);  // Rate limiting
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error in HTML fallback scraping: {Message}", ex.Message);
        }

        return results;
    }

    /// <summary>
    /// Obtiene códigos de notas conocidos buscando en el sitio
    /// </summary>
    private async Task<List<string>> GetKnownConsarNoteCodesAsync(
        string baseUrl,
        CancellationToken cancellationToken)
    {
        var codes = new List<string>();

        try
        {
            // Intentar obtener notas recientes de la página principal
            var response = await _httpClient.GetAsync(baseUrl, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var html = await response.Content.ReadAsStringAsync(cancellationToken);

                // Buscar códigos de nota en links
                var matches = Regex.Matches(html, @"/notas/(\d+)");
                foreach (Match match in matches)
                {
                    if (match.Groups.Count > 1)
                    {
                        codes.Add(match.Groups[1].Value);
                    }
                }

                // También buscar en docFuente links
                matches = Regex.Matches(html, @"docFuente/(\d+)");
                foreach (Match match in matches)
                {
                    if (match.Groups.Count > 1)
                    {
                        codes.Add(match.Groups[1].Value);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error getting known note codes");
        }

        return codes.Distinct().ToList();
    }

    /// <summary>
    /// Scrape una nota individual
    /// </summary>
    private async Task<ScrapedDocumentData?> ScrapeIndividualNoteAsync(
        string noteUrl,
        string baseUrl,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _httpClient.GetAsync(noteUrl, cancellationToken);
            if (!response.IsSuccessStatusCode)
                return null;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);

            var config = AngleSharp.Configuration.Default.WithDefaultLoader();
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Extraer título
            var title = document.QuerySelector("h1, .titulo, .title")?.TextContent?.Trim();
            if (string.IsNullOrEmpty(title) || !IsCircularRelated(title))
                return null;

            return new ScrapedDocumentData
            {
                ExternalId = GenerateExternalId(noteUrl, null),
                Title = CleanTitle(title),
                Code = ExtractCircularCode(title) ?? ExtractCircularCode(html),
                PublishDate = ExtractDateFromContent(html),
                Category = DetermineCategory(title),
                DocumentUrl = noteUrl,
                RawHtml = html.Length > 50000 ? html[..50000] : html,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SIDOF-Direct",
                    ["scrapeDate"] = DateTime.UtcNow.ToString("O")
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping individual note: {Url}", noteUrl);
            return null;
        }
    }

    /// <summary>
    /// Realiza búsqueda usando la API AJAX de SIDOF con los parámetros correctos 2025
    /// Parámetros descubiertos: tipoBus, textoBus, fechaIni, fechaFin, idOrg
    /// </summary>
    private async Task<List<ScrapedDocumentData>> SearchSidofApiAsync(
        string baseUrl,
        string searchText,
        CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();
        var apiUrl = $"{baseUrl.TrimEnd('/')}{SearchApiEndpoint}";

        try
        {
            // Calcular rango de fechas (últimos 5 años hasta hoy)
            var fechaFin = DateTime.Now.ToString("dd-MM-yyyy");
            var fechaIni = DateTime.Now.AddYears(-5).ToString("dd-MM-yyyy");

            // Parámetros correctos según JS de SIDOF 2025
            var formData = new Dictionary<string, string>
            {
                ["tipoBus"] = "1",           // 1 = búsqueda por índice
                ["textoBus"] = searchText,   // Texto de búsqueda
                ["fechaIni"] = fechaIni,     // Fecha inicio DD-MM-YYYY
                ["fechaFin"] = fechaFin,     // Fecha fin DD-MM-YYYY
                ["idOrg"] = "todos"          // Todos los organismos
            };

            var content = new FormUrlEncodedContent(formData);

            using var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            request.Content = content;
            request.Headers.Add("X-Requested-With", "XMLHttpRequest");
            request.Headers.Add("Accept", "*/*");

            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.SendAsync(request, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("SIDOF API search failed with status {Status} for term: {Term}",
                    response.StatusCode, searchText);
                return results;
            }

            var jsonResponse = await response.Content.ReadAsStringAsync(cancellationToken);

            // Extraer solo el JSON (puede venir concatenado con HTML)
            var jsonEnd = jsonResponse.IndexOf("}{");
            if (jsonEnd > 0)
            {
                jsonResponse = jsonResponse[..(jsonEnd + 1)];
            }
            else
            {
                // Buscar final del JSON
                var htmlStart = jsonResponse.IndexOf("<!DOCTYPE", StringComparison.OrdinalIgnoreCase);
                if (htmlStart > 0)
                {
                    jsonResponse = jsonResponse[..htmlStart];
                }
            }

            _logger.LogDebug("SIDOF API response (cleaned): {Response}",
                jsonResponse.Length > 500 ? jsonResponse[..500] : jsonResponse);

            var searchResult = JsonSerializer.Deserialize<SidofSearchResponse>(jsonResponse,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (searchResult?.Notas != null && searchResult.Notas.Count > 0)
            {
                _logger.LogInformation("SIDOF API returned {Count} results for '{Term}'",
                    searchResult.Notas.Count, searchText);

                foreach (var nota in searchResult.Notas)
                {
                    var doc = ConvertNotaToDocument(nota, baseUrl);
                    if (doc != null)
                    {
                        results.Add(doc);
                    }
                }
            }
            else
            {
                // Si el API no retorna datos, intentar parsear la respuesta BODY
                if (!string.IsNullOrEmpty(searchResult?.Body))
                {
                    _logger.LogInformation("SIDOF API returned BODY payload, checking internal response");

                    // El BODY contiene el payload enviado al backend interno
                    // Esto indica que la API funciona pero el backend no responde
                    _logger.LogWarning("SIDOF backend connectivity issue detected. URL: {Url}", searchResult.Url);
                }

                if (searchResult?.TotalRegistros > 0)
                {
                    _logger.LogWarning("SIDOF reports {Total} records but Notas is empty", searchResult.TotalRegistros);
                }
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse SIDOF API response for term: {Term}", searchText);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling SIDOF API for term: {Term}", searchText);
        }

        return results;
    }

    /// <summary>
    /// Convierte una nota del API a ScrapedDocumentData
    /// </summary>
    private ScrapedDocumentData? ConvertNotaToDocument(SidofNota nota, string baseUrl)
    {
        if (string.IsNullOrWhiteSpace(nota.Titulo))
            return null;

        // Verificar si es relevante a CONSAR
        if (!IsCircularRelated(nota.Titulo) && !IsCircularRelated(nota.Dependencia ?? ""))
            return null;

        var documentUrl = !string.IsNullOrEmpty(nota.CodNota)
            ? $"{baseUrl.TrimEnd('/')}/notas/{nota.CodNota}"
            : "";

        // Limpiar el título (puede tener HTML de links)
        var cleanTitle = Regex.Replace(nota.Titulo, @"<[^>]+>", "").Trim();
        var code = ExtractCircularCode(cleanTitle);

        return new ScrapedDocumentData
        {
            ExternalId = GenerateExternalId(documentUrl, nota.CodNota),
            Title = CleanTitle(cleanTitle),
            Description = $"Publicado en DOF - {nota.Dependencia ?? "Sin dependencia"}",
            Code = code,
            PublishDate = ParseDate(nota.FechaPublicacion),
            Category = DetermineCategory(cleanTitle),
            DocumentUrl = documentUrl,
            Metadata = new Dictionary<string, string>
            {
                ["source"] = "SIDOF",
                ["codNota"] = nota.CodNota ?? "",
                ["dependencia"] = nota.Dependencia ?? "",
                ["poder"] = nota.Poder ?? "",
                ["scrapeDate"] = DateTime.UtcNow.ToString("O")
            }
        };
    }

    // Fallback: Parsear documentos desde HTML (para páginas de detalle)
    private IEnumerable<ScrapedDocumentData> ParseSidofDocuments(IDocument document, string baseUrl, string rawHtml)
    {
        var results = new List<ScrapedDocumentData>();

        // Intentar extraer el documento principal si es una página de detalle
        var mainDocument = ExtractMainDocument(document, baseUrl, rawHtml);
        if (mainDocument != null)
        {
            results.Add(mainDocument);
            return results;
        }

        // Si es una página de listado HTML, extraer documentos
        var selectors = new[]
        {
            "#notasBusqueda tbody tr",  // DataTables results
            "div.documento",
            "article.nota",
            "tr.documento-row",
            "li.documento-item",
            "a[href*='/notas/']"
        };

        foreach (var selector in selectors)
        {
            var items = document.QuerySelectorAll(selector);

            foreach (var item in items)
            {
                try
                {
                    var doc = ExtractDocumentFromListItem(item, baseUrl);
                    if (doc != null)
                    {
                        results.Add(doc);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error parsing SIDOF list item");
                }
            }
        }

        return results;
    }

    private ScrapedDocumentData? ExtractMainDocument(IDocument document, string baseUrl, string rawHtml)
    {
        // Buscar título del documento
        var titleSelectors = new[]
        {
            "h1.titulo-documento",
            "h1.title",
            ".encabezado-documento h1",
            "title"
        };

        string? title = null;
        foreach (var selector in titleSelectors)
        {
            var element = document.QuerySelector(selector);
            if (element != null)
            {
                title = element.TextContent?.Trim();
                if (!string.IsNullOrEmpty(title))
                    break;
            }
        }

        if (string.IsNullOrEmpty(title) || !IsCircularRelated(title))
            return null;

        // Extraer código de circular
        var code = ExtractCircularCode(title) ?? ExtractCircularCode(rawHtml);

        // Buscar fecha de publicación
        var dateSelectors = new[]
        {
            ".fecha-publicacion",
            ".fecha",
            "time",
            "[itemprop='datePublished']"
        };

        DateTime? publishDate = null;
        foreach (var selector in dateSelectors)
        {
            var element = document.QuerySelector(selector);
            if (element != null)
            {
                var dateText = element.TextContent?.Trim() ?? element.GetAttribute("datetime");
                publishDate = ParseDate(dateText);
                if (publishDate.HasValue)
                    break;
            }
        }

        // Si no encontramos fecha, intentar extraer del contenido
        if (!publishDate.HasValue)
        {
            publishDate = ExtractDateFromContent(rawHtml);
        }

        // Extraer descripción/resumen
        var descSelectors = new[]
        {
            ".resumen",
            ".descripcion",
            ".summary",
            "meta[name='description']"
        };

        string? description = null;
        foreach (var selector in descSelectors)
        {
            var element = document.QuerySelector(selector);
            if (element != null)
            {
                description = element.TextContent?.Trim() ?? element.GetAttribute("content");
                if (!string.IsNullOrEmpty(description))
                    break;
            }
        }

        // Buscar URL del PDF
        var pdfLink = document.QuerySelector("a[href*='.pdf']");
        var pdfUrl = pdfLink?.GetAttribute("href");
        if (!string.IsNullOrEmpty(pdfUrl) && !pdfUrl.StartsWith("http"))
        {
            pdfUrl = $"{baseUrl.TrimEnd('/')}/{pdfUrl.TrimStart('/')}";
        }

        // Extraer ID del URL actual
        var currentUrl = document.Url ?? "";
        var externalId = GenerateExternalId(currentUrl, code);

        return new ScrapedDocumentData
        {
            ExternalId = externalId,
            Title = CleanTitle(title),
            Description = description,
            Code = code,
            PublishDate = publishDate,
            EffectiveDate = ExtractEffectiveDate(rawHtml),
            Category = DetermineCategory(title),
            DocumentUrl = currentUrl,
            PdfUrl = pdfUrl,
            RawHtml = rawHtml.Length > 100000 ? rawHtml[..100000] : rawHtml,
            Metadata = new Dictionary<string, string>
            {
                ["source"] = "SIDOF",
                ["scrapeDate"] = DateTime.UtcNow.ToString("O")
            }
        };
    }

    private ScrapedDocumentData? ExtractDocumentFromListItem(IElement element, string baseUrl)
    {
        // Para items de lista
        var linkElement = element.QuerySelector("a[href]") ?? element as IElement;
        var href = linkElement?.GetAttribute("href");

        if (string.IsNullOrEmpty(href))
            return null;

        var title = linkElement?.TextContent?.Trim();
        if (string.IsNullOrEmpty(title) || !IsCircularRelated(title))
            return null;

        var documentUrl = href.StartsWith("http") ? href : $"{baseUrl.TrimEnd('/')}/{href.TrimStart('/')}";
        var code = ExtractCircularCode(title);

        return new ScrapedDocumentData
        {
            ExternalId = GenerateExternalId(documentUrl, code),
            Title = CleanTitle(title),
            Code = code,
            Category = DetermineCategory(title),
            DocumentUrl = documentUrl,
            Metadata = new Dictionary<string, string>
            {
                ["source"] = "SIDOF"
            }
        };
    }

    private static bool IsCircularRelated(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return false;

        var lowerText = text.ToLowerInvariant();
        var keywords = new[]
        {
            "circular", "consar", "disposición", "sar", "siefore",
            "afore", "retiro", "pensión", "ahorro"
        };

        return keywords.Any(k => lowerText.Contains(k));
    }

    private static string? ExtractCircularCode(string text)
    {
        var patterns = new[]
        {
            @"CIRCULAR\s+CONSAR\s+(\d+[-/]\d+)",
            @"CONSAR\s+(\d+[-/]\d+)",
            @"Circular\s+(\d+[-/]\d+)"
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
                new System.Globalization.CultureInfo("es-MX"),
                System.Globalization.DateTimeStyles.None,
                out var date))
            {
                // Ensure UTC for PostgreSQL compatibility
                return DateTime.SpecifyKind(date, DateTimeKind.Utc);
            }
        }

        if (DateTime.TryParse(dateText, out var generalDate))
        {
            // Ensure UTC for PostgreSQL compatibility
            return DateTime.SpecifyKind(generalDate, DateTimeKind.Utc);
        }

        return null;
    }

    private static DateTime? ExtractDateFromContent(string content)
    {
        // Buscar patrones de fecha en el contenido
        var patterns = new[]
        {
            @"(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(?:de|del?)\s+(\d{4})",
            @"fecha[:\s]+(\d{2})/(\d{2})/(\d{4})",
            @"publicado[:\s]+(\d{2})/(\d{2})/(\d{4})"
        };

        var months = new Dictionary<string, int>
        {
            ["enero"] = 1, ["febrero"] = 2, ["marzo"] = 3, ["abril"] = 4,
            ["mayo"] = 5, ["junio"] = 6, ["julio"] = 7, ["agosto"] = 8,
            ["septiembre"] = 9, ["octubre"] = 10, ["noviembre"] = 11, ["diciembre"] = 12
        };

        // Primer patrón con nombre de mes
        var match = Regex.Match(content, patterns[0], RegexOptions.IgnoreCase);
        if (match.Success)
        {
            if (int.TryParse(match.Groups[1].Value, out int day) &&
                months.TryGetValue(match.Groups[2].Value.ToLowerInvariant(), out int month) &&
                int.TryParse(match.Groups[3].Value, out int year))
            {
                // Ensure UTC for PostgreSQL compatibility
                return new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);
            }
        }

        // Otros patrones
        foreach (var pattern in patterns.Skip(1))
        {
            match = Regex.Match(content, pattern, RegexOptions.IgnoreCase);
            if (match.Success)
            {
                if (int.TryParse(match.Groups[1].Value, out int day) &&
                    int.TryParse(match.Groups[2].Value, out int month) &&
                    int.TryParse(match.Groups[3].Value, out int year))
                {
                    // Ensure UTC for PostgreSQL compatibility
                    return new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);
                }
            }
        }

        return null;
    }

    private static DateTime? ExtractEffectiveDate(string content)
    {
        // Buscar fecha de vigencia
        var patterns = new[]
        {
            @"entrar[áa]\s+en\s+vigor[:\s]+(\d{1,2})\s+de\s+(\w+)\s+(?:de|del?)\s+(\d{4})",
            @"vigencia[:\s]+(\d{2})/(\d{2})/(\d{4})",
            @"vigente\s+a\s+partir\s+del?\s+(\d{1,2})\s+de\s+(\w+)"
        };

        foreach (var pattern in patterns)
        {
            var match = Regex.Match(content, pattern, RegexOptions.IgnoreCase);
            if (match.Success)
            {
                return ExtractDateFromContent(match.Value);
            }
        }

        return null;
    }

    private static string GenerateExternalId(string url, string? codNota)
    {
        // Si tenemos codNota, usarlo directamente
        if (!string.IsNullOrEmpty(codNota))
        {
            return $"SIDOF-{codNota}";
        }

        // Extraer ID del URL si está disponible
        var idMatch = Regex.Match(url, @"/notas/(\d+)");
        if (idMatch.Success)
        {
            return $"SIDOF-{idMatch.Groups[1].Value}";
        }

        // Fallback: Extraer de docFuente
        idMatch = Regex.Match(url, @"docFuente/(\d+)");
        if (idMatch.Success)
        {
            return $"SIDOF-{idMatch.Groups[1].Value}";
        }

        // Generar hash si no hay ID
        using var sha = System.Security.Cryptography.SHA256.Create();
        var bytes = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(url));
        return $"SIDOF-{Convert.ToHexString(bytes)[..16]}";
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
        if (lowerTitle.Contains("acuerdo"))
            return "Acuerdos";

        return "General";
    }
}

#region SIDOF API DTOs

/// <summary>
/// Respuesta del API de búsqueda de SIDOF
/// </summary>
internal class SidofSearchResponse
{
    [JsonPropertyName("Notas")]
    public List<SidofNota>? Notas { get; set; }

    [JsonPropertyName("totalRegistros")]
    public int TotalRegistros { get; set; }

    [JsonPropertyName("URL")]
    public string? Url { get; set; }

    [JsonPropertyName("BODY")]
    public string? Body { get; set; }
}

/// <summary>
/// Representa una nota/documento del SIDOF
/// </summary>
internal class SidofNota
{
    [JsonPropertyName("codNota")]
    public string? CodNota { get; set; }

    [JsonPropertyName("titulo")]
    public string? Titulo { get; set; }

    [JsonPropertyName("fechaPublicacion")]
    public string? FechaPublicacion { get; set; }

    [JsonPropertyName("poder")]
    public string? Poder { get; set; }

    [JsonPropertyName("dependencia")]
    public string? Dependencia { get; set; }

    [JsonPropertyName("seccion")]
    public string? Seccion { get; set; }
}

#endregion
