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
/// Scraper handler para CONSAR SISET (Sistema de Estadísticas)
/// Extrae IRN, comisiones, recursos administrados y estadísticas del SAR
/// URL: https://www.consar.gob.mx/gobmx/aplicativo/siset/
/// </summary>
public class ConsarSisetScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ConsarSisetScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string SisetBaseUrl = "https://www.consar.gob.mx/gobmx/aplicativo/siset";
    private const string SisetEnlaceUrl = "https://www.consar.gob.mx/gobmx/aplicativo/siset/Enlace.aspx";
    private const string IrnUrl = "https://www.gob.mx/consar/articulos/indicador-de-rendimiento-neto";
    private const string ComisionesUrl = "https://www.gob.mx/consar/articulos/comisiones-de-las-afore";
    private const string RecursosUrl = "https://www.gob.mx/consar/articulos/recursos-administrados-siefores";

    public ScraperSourceType SourceType => ScraperSourceType.ConsarSISET;

    public ConsarSisetScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<ConsarSisetScraperHandler> logger)
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
                        "Retry {RetryAttempt} for CONSAR SISET request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.ConsarSISET;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting CONSAR SISET scraping");

            // Scrape IRN (Indicador de Rendimiento Neto)
            var irnDocs = await ScrapeIrnAsync(cancellationToken);
            results.AddRange(irnDocs);

            // Scrape Comisiones
            var comisionDocs = await ScrapeComisionesAsync(cancellationToken);
            results.AddRange(comisionDocs);

            // Scrape Recursos Administrados
            var recursosDocs = await ScrapeRecursosAsync(cancellationToken);
            results.AddRange(recursosDocs);

            // Scrape portal principal SISET
            var sisetDocs = await ScrapeSisetPortalAsync(cancellationToken);
            results.AddRange(sisetDocs);

            _logger.LogInformation("CONSAR SISET scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping CONSAR SISET: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeIrnAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(IrnUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                results.Add(CreateIrnReferenceDocument());
                return results;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Extraer tablas de IRN
            var tables = document.QuerySelectorAll("table");

            foreach (var table in tables)
            {
                var rows = table.QuerySelectorAll("tr");

                foreach (var row in rows.Skip(1)) // Skip header
                {
                    var cells = row.QuerySelectorAll("td");
                    if (cells.Length < 3) continue;

                    var aforeName = cells[0].TextContent?.Trim();
                    var irnValue = ExtractDecimalValue(cells[1].TextContent);

                    if (string.IsNullOrWhiteSpace(aforeName) || !irnValue.HasValue)
                        continue;

                    var siefore = cells.Length > 2 ? cells[2].TextContent?.Trim() : null;

                    var externalId = GenerateExternalId("CONSAR-IRN", $"{aforeName}-{siefore}", DateTime.UtcNow.ToString("yyyyMM"));

                    if (results.Any(r => r.ExternalId == externalId))
                        continue;

                    results.Add(new ScrapedDocumentData
                    {
                        ExternalId = externalId,
                        Title = $"IRN {aforeName} - {siefore ?? "General"} - {DateTime.UtcNow:MMMM yyyy}",
                        Description = $"Indicador de Rendimiento Neto de {aforeName} para SIEFORE {siefore}. Valor: {irnValue:F2}%",
                        Code = $"CONSAR-IRN-{DateTime.UtcNow:yyyyMM}",
                        PublishDate = DateTime.UtcNow,
                        Category = "IRN SIEFORE",
                        DocumentUrl = IrnUrl,
                        Metadata = new Dictionary<string, string>
                        {
                            ["source"] = "CONSAR SISET",
                            ["type"] = "IRN",
                            ["afore"] = aforeName ?? "",
                            ["siefore"] = siefore ?? "",
                            ["irn_value"] = irnValue?.ToString("F4") ?? "",
                            ["period"] = DateTime.UtcNow.ToString("yyyy-MM"),
                            ["contentHash"] = ComputeHash($"{aforeName}{siefore}{irnValue}{DateTime.UtcNow:yyyyMM}")
                        }
                    });
                }
            }

            // Si no se encontraron datos estructurados, agregar documento de referencia
            if (results.Count == 0)
            {
                results.Add(CreateIrnReferenceDocument());
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping CONSAR IRN");
            results.Add(CreateIrnReferenceDocument());
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeComisionesAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(ComisionesUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                results.Add(CreateComisionesReferenceDocument());
                return results;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Buscar tabla de comisiones
            var tables = document.QuerySelectorAll("table");

            foreach (var table in tables)
            {
                var rows = table.QuerySelectorAll("tr");

                foreach (var row in rows.Skip(1))
                {
                    var cells = row.QuerySelectorAll("td");
                    if (cells.Length < 2) continue;

                    var aforeName = cells[0].TextContent?.Trim();
                    var comisionValue = ExtractDecimalValue(cells[1].TextContent);

                    if (string.IsNullOrWhiteSpace(aforeName) || !comisionValue.HasValue)
                        continue;

                    var externalId = GenerateExternalId("CONSAR-COM", aforeName, DateTime.UtcNow.ToString("yyyy"));

                    if (results.Any(r => r.ExternalId == externalId))
                        continue;

                    results.Add(new ScrapedDocumentData
                    {
                        ExternalId = externalId,
                        Title = $"Comisión {aforeName} - {DateTime.UtcNow.Year}",
                        Description = $"Comisión autorizada de {aforeName} para {DateTime.UtcNow.Year}. Valor: {comisionValue:F2}%",
                        Code = $"CONSAR-COMISION-{DateTime.UtcNow.Year}",
                        PublishDate = DateTime.UtcNow,
                        Category = "Comisiones AFORE",
                        DocumentUrl = ComisionesUrl,
                        Metadata = new Dictionary<string, string>
                        {
                            ["source"] = "CONSAR SISET",
                            ["type"] = "Comision",
                            ["afore"] = aforeName ?? "",
                            ["comision_value"] = comisionValue?.ToString("F4") ?? "",
                            ["year"] = DateTime.UtcNow.Year.ToString(),
                            ["contentHash"] = ComputeHash($"{aforeName}{comisionValue}{DateTime.UtcNow.Year}")
                        }
                    });
                }
            }

            // Agregar comisiones 2025 conocidas si no se extrajeron
            if (results.Count == 0)
            {
                results.AddRange(GetKnownComisiones2025());
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping CONSAR comisiones");
            results.AddRange(GetKnownComisiones2025());
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeRecursosAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(RecursosUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                results.Add(CreateRecursosReferenceDocument());
                return results;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Buscar cifras de recursos administrados
            var contentBlocks = document.QuerySelectorAll(".article-body, .content, p");

            foreach (var block in contentBlocks)
            {
                var text = block.TextContent;

                // Buscar patrones como "6.8 billones de pesos"
                var billionesMatch = Regex.Match(text ?? "", @"(\d+\.?\d*)\s*(billones?|trillones?)", RegexOptions.IgnoreCase);
                if (billionesMatch.Success)
                {
                    var value = decimal.Parse(billionesMatch.Groups[1].Value, CultureInfo.InvariantCulture);

                    results.Add(new ScrapedDocumentData
                    {
                        ExternalId = $"CONSAR-RECURSOS-{DateTime.UtcNow:yyyyMM}",
                        Title = $"Recursos Administrados SAR - {DateTime.UtcNow:MMMM yyyy}",
                        Description = $"Los recursos del Sistema de Ahorro para el Retiro ascienden a {value} billones de pesos",
                        Code = $"CONSAR-RECURSOS-{DateTime.UtcNow:yyyyMM}",
                        PublishDate = DateTime.UtcNow,
                        Category = "Recursos SAR",
                        DocumentUrl = RecursosUrl,
                        Metadata = new Dictionary<string, string>
                        {
                            ["source"] = "CONSAR SISET",
                            ["type"] = "RecursosAdministrados",
                            ["value_billones"] = value.ToString("F2"),
                            ["period"] = DateTime.UtcNow.ToString("yyyy-MM"),
                            ["contentHash"] = ComputeHash($"recursos{value}{DateTime.UtcNow:yyyyMM}")
                        }
                    });

                    break;
                }
            }

            if (results.Count == 0)
            {
                results.Add(CreateRecursosReferenceDocument());
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping CONSAR recursos");
            results.Add(CreateRecursosReferenceDocument());
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeSisetPortalAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(SisetEnlaceUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Buscar enlaces a reportes
            var links = document.QuerySelectorAll("a[href*='.xls'], a[href*='.xlsx'], a[href*='.pdf'], a[href*='reporte']");

            foreach (var link in links.Take(20))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = SisetBaseUrl + "/" + documentUrl.TrimStart('/');

                var externalId = GenerateExternalId("SISET", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                var category = DetermineCategory(title);

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = $"Reporte estadístico CONSAR SISET - {category}",
                    Code = $"SISET-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = category,
                    DocumentUrl = documentUrl,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CONSAR SISET",
                        ["type"] = "Estadistica",
                        ["format"] = GetFileFormat(documentUrl),
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping SISET portal");
        }

        return results;
    }

    private static ScrapedDocumentData CreateIrnReferenceDocument()
    {
        return new ScrapedDocumentData
        {
            ExternalId = $"CONSAR-IRN-REF-{DateTime.UtcNow:yyyyMM}",
            Title = $"Indicador de Rendimiento Neto - {DateTime.UtcNow:MMMM yyyy}",
            Description = "Referencia al portal de Indicador de Rendimiento Neto de CONSAR para SIEFOREs Generacionales",
            Code = $"CONSAR-IRN-{DateTime.UtcNow:yyyyMM}",
            PublishDate = DateTime.UtcNow,
            Category = "IRN SIEFORE",
            DocumentUrl = IrnUrl,
            Metadata = new Dictionary<string, string>
            {
                ["source"] = "CONSAR SISET",
                ["type"] = "IRN"
            }
        };
    }

    private static ScrapedDocumentData CreateComisionesReferenceDocument()
    {
        return new ScrapedDocumentData
        {
            ExternalId = $"CONSAR-COMISIONES-REF-{DateTime.UtcNow.Year}",
            Title = $"Comisiones AFORE - {DateTime.UtcNow.Year}",
            Description = $"Referencia a las comisiones autorizadas de AFOREs para {DateTime.UtcNow.Year}",
            Code = $"CONSAR-COMISION-{DateTime.UtcNow.Year}",
            PublishDate = DateTime.UtcNow,
            Category = "Comisiones AFORE",
            DocumentUrl = ComisionesUrl,
            Metadata = new Dictionary<string, string>
            {
                ["source"] = "CONSAR SISET",
                ["type"] = "Comision"
            }
        };
    }

    private static ScrapedDocumentData CreateRecursosReferenceDocument()
    {
        return new ScrapedDocumentData
        {
            ExternalId = $"CONSAR-RECURSOS-REF-{DateTime.UtcNow:yyyyMM}",
            Title = $"Recursos Administrados SAR - {DateTime.UtcNow:MMMM yyyy}",
            Description = "Referencia a la información de recursos administrados por el Sistema de Ahorro para el Retiro",
            Code = $"CONSAR-RECURSOS-{DateTime.UtcNow:yyyyMM}",
            PublishDate = DateTime.UtcNow,
            Category = "Recursos SAR",
            DocumentUrl = RecursosUrl,
            Metadata = new Dictionary<string, string>
            {
                ["source"] = "CONSAR SISET",
                ["type"] = "RecursosAdministrados"
            }
        };
    }

    /// <summary>
    /// Comisiones conocidas 2025 basadas en datos públicos de CONSAR
    /// Promedio del sistema: 0.547%
    /// </summary>
    private static List<ScrapedDocumentData> GetKnownComisiones2025()
    {
        var comisiones2025 = new Dictionary<string, decimal>
        {
            ["XXI Banorte"] = 0.55m,
            ["Citibanamex"] = 0.55m,
            ["Profuturo"] = 0.55m,
            ["SURA"] = 0.55m,
            ["Inbursa"] = 0.55m,
            ["Principal"] = 0.55m,
            ["Invercap"] = 0.55m,
            ["Coppel"] = 0.55m,
            ["Azteca"] = 0.55m,
            ["PensionISSSTE"] = 0.52m
        };

        return comisiones2025.Select(kvp => new ScrapedDocumentData
        {
            ExternalId = $"CONSAR-COM-{kvp.Key.Replace(" ", "")}-2025",
            Title = $"Comisión {kvp.Key} - 2025",
            Description = $"Comisión autorizada de AFORE {kvp.Key} para 2025. Valor: {kvp.Value:F2}%",
            Code = "CONSAR-COMISION-2025",
            PublishDate = new DateTime(2025, 1, 1),
            Category = "Comisiones AFORE",
            DocumentUrl = ComisionesUrl,
            Metadata = new Dictionary<string, string>
            {
                ["source"] = "CONSAR SISET",
                ["type"] = "Comision",
                ["afore"] = kvp.Key,
                ["comision_value"] = kvp.Value.ToString("F4"),
                ["year"] = "2025"
            }
        }).ToList();
    }

    private static decimal? ExtractDecimalValue(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return null;

        // Limpiar el texto y extraer número
        var cleanText = Regex.Replace(text, @"[^\d.,\-]", "");
        cleanText = cleanText.Replace(",", ".");

        if (decimal.TryParse(cleanText, NumberStyles.Any, CultureInfo.InvariantCulture, out var value))
            return value;

        return null;
    }

    private static string DetermineCategory(string? title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return "Estadísticas SISET";

        var lower = title.ToLowerInvariant();

        if (lower.Contains("irn") || lower.Contains("rendimiento"))
            return "IRN SIEFORE";
        if (lower.Contains("comisi"))
            return "Comisiones AFORE";
        if (lower.Contains("recurso") || lower.Contains("activo"))
            return "Recursos SAR";
        if (lower.Contains("cuenta") || lower.Contains("trabajador"))
            return "Cuentas Individuales";
        if (lower.Contains("traspaso"))
            return "Traspasos";
        if (lower.Contains("retiro"))
            return "Retiros";

        return "Estadísticas SISET";
    }

    private static string GetFileFormat(string url)
    {
        if (url.Contains(".xlsx", StringComparison.OrdinalIgnoreCase)) return "XLSX";
        if (url.Contains(".xls", StringComparison.OrdinalIgnoreCase)) return "XLS";
        if (url.Contains(".pdf", StringComparison.OrdinalIgnoreCase)) return "PDF";
        if (url.Contains(".csv", StringComparison.OrdinalIgnoreCase)) return "CSV";
        return "HTML";
    }

    private static string GenerateExternalId(string prefix, string title, string? suffix)
    {
        var input = $"{prefix}-{title}-{suffix}";
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
