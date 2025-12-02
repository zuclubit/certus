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
/// Scraper handler para SPEI (Sistema de Pagos Electrónicos Interbancarios)
/// Extrae catálogo de instituciones financieras, validación CLABE, bancos participantes
/// URL: https://www.banxico.org.mx/SiesInternet/consultarDirectorioInternetAction.do?sector=1&accion=consultarCuadro&idCuadro=CF201
/// </summary>
public class SpeiScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SpeiScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string BanxicoSpeiUrl = "https://www.banxico.org.mx/servicios/sistema-de-pagos-electronicos-.html";
    private const string CatalogoBancosUrl = "https://www.banxico.org.mx/SieInternet/consultarDirectorioInternetAction.do?sector=1&accion=consultarCuadro&idCuadro=CF201";
    private const string ClabeValidationUrl = "https://www.banxico.org.mx/cep/";

    public ScraperSourceType SourceType => ScraperSourceType.SPEI;

    public SpeiScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<SpeiScraperHandler> logger)
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
                        "Retry {RetryAttempt} for SPEI request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.SPEI;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting SPEI scraping");

            // Scrape SPEI documentation
            var speiDocs = await ScrapeSpeiDocumentsAsync(cancellationToken);
            results.AddRange(speiDocs);

            // Add CLABE specification document
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SPEI-CLABE-SPEC-{DateTime.UtcNow:yyyyMM}",
                Title = "Especificación Técnica CLABE",
                Description = "Estructura y reglas de validación de la Clave Bancaria Estandarizada (18 dígitos)",
                Code = $"SPEI-CLABE-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Especificaciones SPEI",
                DocumentUrl = ClabeValidationUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SPEI",
                    ["type"] = "Especificacion",
                    ["validationFormat"] = "18 dígitos numéricos",
                    ["components"] = "Banco(3)+Plaza(3)+Cuenta(11)+Verificador(1)",
                    ["algorithm"] = "Módulo 10 ponderado"
                }
            });

            // Add catálogo de bancos SPEI
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SPEI-BANCOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Catálogo de Instituciones Financieras SPEI",
                Description = "Listado oficial de bancos e instituciones participantes en SPEI con claves",
                Code = $"SPEI-CAT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Catálogos SPEI",
                DocumentUrl = CatalogoBancosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SPEI",
                    ["type"] = "CatalogoBancos",
                    ["format"] = "XLS/CSV"
                }
            });

            // Add CLABE validation rules
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SPEI-CLABE-VAL-{DateTime.UtcNow:yyyyMM}",
                Title = "Reglas de Validación CLABE - SPEI",
                Description = "Manual de validación de CLABE incluyendo dígito verificador módulo 10",
                Code = $"SPEI-VAL-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Manuales SPEI",
                DocumentUrl = ClabeValidationUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SPEI",
                    ["type"] = "Manual",
                    ["algorithm"] = "Ponderación 3-7-1 módulo 10",
                    ["length"] = "18 dígitos"
                }
            });

            // Add CEP (Comprobante Electrónico de Pago)
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SPEI-CEP-{DateTime.UtcNow:yyyyMM}",
                Title = "Comprobante Electrónico de Pago (CEP)",
                Description = "Especificaciones del CEP para validación de transferencias SPEI",
                Code = $"SPEI-CEP-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Documentación SPEI",
                DocumentUrl = ClabeValidationUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SPEI",
                    ["type"] = "CEP",
                    ["validacion"] = "Folio, fecha, monto, cuentas"
                }
            });

            // Add horarios SPEI
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SPEI-HORARIOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Horarios de Operación SPEI",
                Description = "Horarios de operación del sistema SPEI y ventanas de liquidación",
                Code = $"SPEI-HOR-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Operación SPEI",
                DocumentUrl = BanxicoSpeiUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SPEI",
                    ["type"] = "Horarios",
                    ["disponibilidad"] = "24/7 para operaciones interbancarias"
                }
            });

            _logger.LogInformation("SPEI scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping SPEI: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeSpeiDocumentsAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(BanxicoSpeiUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='spei'], a[href*='clabe'], a[href*='banco']");

            foreach (var link in links.Take(20))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.banxico.org.mx" + documentUrl;

                var externalId = GenerateExternalId("SPEI", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documentación SPEI para transferencias interbancarias",
                    Code = $"SPEI-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos SPEI",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "SPEI",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping SPEI documents");
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
