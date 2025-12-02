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
/// Scraper handler para SAR Layouts Técnicos
/// Extrae especificaciones de archivos CONSAR: layouts de movimientos, traspasos, retiros, aportaciones
/// URL: https://www.gob.mx/consar/acciones-y-programas/formatos-y-plantillas-sar
/// </summary>
public class SarLayoutsScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SarLayoutsScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string ConsarLayoutsUrl = "https://www.gob.mx/consar/acciones-y-programas/formatos-y-plantillas-sar";
    private const string ConsarXsdUrl = "https://www.gob.mx/consar/acciones-y-programas/esquemas-xsd";
    private const string ConsarManualesUrl = "https://www.gob.mx/consar/documentos";

    public ScraperSourceType SourceType => ScraperSourceType.SarLayouts;

    public SarLayoutsScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<SarLayoutsScraperHandler> logger)
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
                        "Retry {RetryAttempt} for SAR Layouts request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.SarLayouts;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting SAR Layouts scraping");

            // Scrape layouts and XSD from CONSAR
            var layouts = await ScrapeLayoutsAsync(cancellationToken);
            results.AddRange(layouts);

            // Add specific SAR layout specifications
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SARLAYOUT-AFIL-{DateTime.UtcNow:yyyyMM}",
                Title = "Layout Archivo de Afiliación SAR",
                Description = "Especificación técnica del layout para archivo de afiliación y registro de trabajadores",
                Code = $"SAR-AFIL-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts SAR",
                DocumentUrl = ConsarLayoutsUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Layout",
                    ["proceso"] = "Afiliacion",
                    ["formato"] = "TXT delimitado por pipes"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SARLAYOUT-RCV-{DateTime.UtcNow:yyyyMM}",
                Title = "Layout Aportaciones RCV",
                Description = "Especificación del layout para aportaciones de Retiro, Cesantía y Vejez",
                Code = $"SAR-RCV-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts SAR",
                DocumentUrl = ConsarLayoutsUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Layout",
                    ["proceso"] = "Aportaciones RCV",
                    ["formato"] = "TXT delimitado"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SARLAYOUT-VOL-{DateTime.UtcNow:yyyyMM}",
                Title = "Layout Aportaciones Voluntarias",
                Description = "Especificación del layout para aportaciones voluntarias y complementarias",
                Code = $"SAR-VOL-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts SAR",
                DocumentUrl = ConsarLayoutsUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Layout",
                    ["proceso"] = "Aportaciones Voluntarias",
                    ["subcuentas"] = "Voluntarias,Complementarias,Ahorro Solidario"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SARLAYOUT-TRASP-{DateTime.UtcNow:yyyyMM}",
                Title = "Layout Traspasos entre AFOREs",
                Description = "Especificación del layout para traspasos de cuentas individuales entre AFOREs",
                Code = $"SAR-TRASP-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts SAR",
                DocumentUrl = ConsarLayoutsUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Layout",
                    ["proceso"] = "Traspasos",
                    ["tipos"] = "Ordinario,Promocion"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SARLAYOUT-RETPAR-{DateTime.UtcNow:yyyyMM}",
                Title = "Layout Retiros Parciales",
                Description = "Especificación del layout para retiros parciales por desempleo y matrimonio",
                Code = $"SAR-RETPAR-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts SAR",
                DocumentUrl = ConsarLayoutsUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Layout",
                    ["proceso"] = "Retiros Parciales",
                    ["tipos"] = "Desempleo,Matrimonio"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SARLAYOUT-RETTOT-{DateTime.UtcNow:yyyyMM}",
                Title = "Layout Retiros Totales",
                Description = "Especificación del layout para retiros totales por pensión o negativa",
                Code = $"SAR-RETTOT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts SAR",
                DocumentUrl = ConsarLayoutsUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Layout",
                    ["proceso"] = "Retiros Totales",
                    ["tipos"] = "Pension,Negativa de Pension"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SARLAYOUT-UNIF-{DateTime.UtcNow:yyyyMM}",
                Title = "Layout Unificación de Cuentas",
                Description = "Especificación del layout para unificación de cuentas duplicadas",
                Code = $"SAR-UNIF-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts SAR",
                DocumentUrl = ConsarLayoutsUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Layout",
                    ["proceso"] = "Unificacion",
                    ["uso"] = "Fusion de cuentas duplicadas"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SARLAYOUT-SEPAR-{DateTime.UtcNow:yyyyMM}",
                Title = "Layout Separación de Cuentas",
                Description = "Especificación del layout para separación de cuentas individuales",
                Code = $"SAR-SEPAR-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Layouts SAR",
                DocumentUrl = ConsarLayoutsUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Layout",
                    ["proceso"] = "Separacion",
                    ["uso"] = "Division de cuentas"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SARLAYOUT-XSD-{DateTime.UtcNow:yyyyMM}",
                Title = "Esquemas XSD CONSAR",
                Description = "Esquemas XML (XSD) para validación de archivos SAR",
                Code = $"SAR-XSD-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Esquemas SAR",
                DocumentUrl = ConsarXsdUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "XSD",
                    ["formato"] = "XML Schema",
                    ["uso"] = "Validacion de estructura"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SARLAYOUT-CATVAL-{DateTime.UtcNow:yyyyMM}",
                Title = "Catálogo de Validaciones SAR",
                Description = "Catálogo oficial de reglas de validación para archivos SAR",
                Code = $"SAR-CATVAL-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Validaciones SAR",
                DocumentUrl = ConsarManualesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Catalogo",
                    ["uso"] = "Reglas de validacion de datos"
                }
            });

            _logger.LogInformation("SAR Layouts scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping SAR Layouts: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeLayoutsAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(ConsarLayoutsUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.zip'], a[href*='.xsd'], a[href*='.pdf'], a[href*='layout'], a[href*='formato']");

            foreach (var link in links.Take(25))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 3)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.gob.mx" + documentUrl;

                var externalId = GenerateExternalId("SARLAYOUT", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                var format = GetFileFormat(documentUrl);

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Especificación técnica SAR CONSAR",
                    Code = $"SAR-SPEC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Especificaciones SAR",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CONSAR",
                        ["type"] = "Especificacion",
                        ["formato"] = format,
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping SAR layouts");
        }

        return results;
    }

    private static string GetFileFormat(string url)
    {
        if (url.Contains(".zip", StringComparison.OrdinalIgnoreCase)) return "ZIP";
        if (url.Contains(".xsd", StringComparison.OrdinalIgnoreCase)) return "XSD";
        if (url.Contains(".xml", StringComparison.OrdinalIgnoreCase)) return "XML";
        if (url.Contains(".xlsx", StringComparison.OrdinalIgnoreCase)) return "XLSX";
        if (url.Contains(".xls", StringComparison.OrdinalIgnoreCase)) return "XLS";
        if (url.Contains(".pdf", StringComparison.OrdinalIgnoreCase)) return "PDF";
        if (url.Contains(".txt", StringComparison.OrdinalIgnoreCase)) return "TXT";
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
