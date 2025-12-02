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
/// Scraper handler para IMSS (Instituto Mexicano del Seguro Social)
/// Extrae reglas y especificaciones de validación de NSS
/// URL: https://www.imss.gob.mx
/// </summary>
public class ImssScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ImssScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string ImssBaseUrl = "https://www.imss.gob.mx";
    private const string ImssNormatividadUrl = "https://www.imss.gob.mx/tramites";
    private const string ImssPatronesUrl = "https://www.imss.gob.mx/patrones";
    private const string ImssDigitalUrl = "https://serviciosdigitales.imss.gob.mx";

    public ScraperSourceType SourceType => ScraperSourceType.IMSS;

    public ImssScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<ImssScraperHandler> logger)
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
                        "Retry {RetryAttempt} for IMSS request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.IMSS;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting IMSS scraping");

            // Scrape NSS documentation
            var nssDocs = await ScrapeNssDocumentsAsync(cancellationToken);
            results.AddRange(nssDocs);

            // Add NSS specification document
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IMSS-NSS-SPEC-{DateTime.UtcNow:yyyyMM}",
                Title = "Especificación Técnica NSS",
                Description = "Estructura y reglas de validación del Número de Seguridad Social (11 dígitos)",
                Code = $"IMSS-NSS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Especificaciones NSS",
                DocumentUrl = ImssBaseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IMSS",
                    ["type"] = "Especificacion",
                    ["validationFormat"] = "11 dígitos numéricos",
                    ["components"] = "Subdelegación(2)+AñoAlta(2)+AñoNac(2)+Consecutivo(4)+Verificador(1)"
                }
            });

            // Add NSS validation rules
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IMSS-NSS-VAL-{DateTime.UtcNow:yyyyMM}",
                Title = "Reglas de Validación NSS - IMSS",
                Description = "Manual de validación del Número de Seguridad Social incluyendo dígito verificador",
                Code = $"IMSS-VAL-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Manuales IMSS",
                DocumentUrl = ImssPatronesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IMSS",
                    ["type"] = "Manual",
                    ["algorithm"] = "Algoritmo Luhn modificado",
                    ["length"] = "11 dígitos"
                }
            });

            // Add patron registration rules
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"IMSS-PATRON-{DateTime.UtcNow:yyyyMM}",
                Title = "Registro Patronal IMSS",
                Description = "Especificaciones del registro patronal y movimientos afiliatorios",
                Code = $"IMSS-PAT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Registro Patronal",
                DocumentUrl = ImssPatronesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "IMSS",
                    ["type"] = "RegistroPatronal",
                    ["format"] = "11 caracteres alfanuméricos"
                }
            });

            _logger.LogInformation("IMSS scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping IMSS: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeNssDocumentsAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(ImssNormatividadUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='nss'], a[href*='seguro-social']");

            foreach (var link in links.Take(20))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.gob.mx" + documentUrl;

                var externalId = GenerateExternalId("IMSS", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documentación IMSS para validación de NSS y afiliación",
                    Code = $"IMSS-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos IMSS",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "IMSS",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping IMSS documents");
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
