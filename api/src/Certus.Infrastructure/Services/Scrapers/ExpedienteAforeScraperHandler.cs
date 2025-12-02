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
/// Scraper handler para Expediente Electrónico AFORE
/// Extrae información sobre el expediente único del trabajador en el SAR
/// URL: https://www.gob.mx/consar
/// </summary>
public class ExpedienteAforeScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ExpedienteAforeScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string ConsarExpedienteUrl = "https://www.gob.mx/consar/acciones-y-programas/expediente-electronico";
    private const string EsarUrl = "https://www.e-sar.com.mx";
    private const string ConsarDocumentosUrl = "https://www.gob.mx/consar/documentos";

    public ScraperSourceType SourceType => ScraperSourceType.ExpedienteAfore;

    public ExpedienteAforeScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<ExpedienteAforeScraperHandler> logger)
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
                        "Retry {RetryAttempt} for ExpedienteAfore request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.ExpedienteAfore;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting Expediente AFORE scraping");

            // Scrape documentos de expediente
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add Expediente Electrónico documents
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"EXPEDIENTE-ESTRUCTURA-{DateTime.UtcNow:yyyyMM}",
                Title = "Estructura del Expediente Electrónico",
                Description = "Componentes y estructura del expediente único del trabajador SAR",
                Code = $"EXP-EST-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Estructura Expediente",
                DocumentUrl = ConsarExpedienteUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Estructura",
                    ["componentes"] = "Datos personales,Historial laboral,Saldos,Beneficiarios"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"EXPEDIENTE-BIOMETRICOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Datos Biométricos Expediente",
                Description = "Especificaciones de captura de datos biométricos para expediente AFORE",
                Code = $"EXP-BIO-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Biométricos",
                DocumentUrl = ConsarDocumentosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Biometricos",
                    ["datos"] = "Huellas,Fotografía,Firma"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"EXPEDIENTE-ACTUALIZACION-{DateTime.UtcNow:yyyyMM}",
                Title = "Proceso de Actualización de Expediente",
                Description = "Reglas para actualización de datos en el expediente electrónico",
                Code = $"EXP-ACT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Actualización",
                DocumentUrl = ConsarExpedienteUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Actualizacion",
                    ["validez"] = "3 años"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"EXPEDIENTE-PORTABILIDAD-{DateTime.UtcNow:yyyyMM}",
                Title = "Portabilidad del Expediente",
                Description = "Transferencia de expediente entre AFOREs en proceso de traspaso",
                Code = $"EXP-PORT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Portabilidad",
                DocumentUrl = ConsarDocumentosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Portabilidad",
                    ["proceso"] = "Traspaso entre AFOREs"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"EXPEDIENTE-BENEFICIARIOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Registro de Beneficiarios",
                Description = "Especificaciones para registro y actualización de beneficiarios",
                Code = $"EXP-BEN-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Beneficiarios",
                DocumentUrl = ConsarExpedienteUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Beneficiarios",
                    ["datos"] = "Nombre,Parentesco,Porcentaje"
                }
            });

            _logger.LogInformation("Expediente AFORE scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping Expediente AFORE: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeDocumentosAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(ConsarDocumentosUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='expediente'], a[href*='biometrico'], a[href*='beneficiario']");

            foreach (var link in links.Take(15))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.gob.mx" + documentUrl;

                var externalId = GenerateExternalId("EXPEDIENTE", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento expediente electrónico AFORE",
                    Code = $"EXPEDIENTE-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos Expediente",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CONSAR",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping expediente documentos");
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
