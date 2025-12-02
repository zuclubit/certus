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
/// Scraper handler para RENAPO (Registro Nacional de Población)
/// Extrae reglas y especificaciones de validación de CURP
/// URL: https://www.gob.mx/segob/renapo
/// </summary>
public class RenapoScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<RenapoScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string RenapoBaseUrl = "https://www.gob.mx/segob/acciones-y-programas/consultas-curp";
    private const string RenapoDocUrl = "https://www.gob.mx/segob/documentos/documentos-renapo";
    private const string CurpValidationUrl = "https://www.gob.mx/curp/";

    public ScraperSourceType SourceType => ScraperSourceType.RENAPO;

    public RenapoScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<RenapoScraperHandler> logger)
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
                        "Retry {RetryAttempt} for RENAPO request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.RENAPO;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting RENAPO scraping");

            // Scrape CURP validation rules
            var curpDocs = await ScrapeCurpDocumentsAsync(cancellationToken);
            results.AddRange(curpDocs);

            // Add reference documents
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"RENAPO-CURP-SPEC-{DateTime.UtcNow:yyyyMM}",
                Title = "Especificación Técnica CURP",
                Description = "Estructura y reglas de validación de la Clave Única de Registro de Población (18 caracteres alfanuméricos)",
                Code = $"RENAPO-CURP-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Especificaciones CURP",
                DocumentUrl = CurpValidationUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "RENAPO",
                    ["type"] = "Especificacion",
                    ["validationFormat"] = "18 caracteres: AAAA-AANNNN-AA-AAA-AA",
                    ["components"] = "Apellidos(4)+Nombre(1)+FechaNac(6)+Sexo(1)+Entidad(2)+Consonantes(3)+Verificador(1)"
                }
            });

            // CURP structure documentation
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"RENAPO-CURP-STRUCT-{DateTime.UtcNow:yyyyMM}",
                Title = "Estructura de la CURP - Manual de Validación",
                Description = "Manual técnico con reglas de validación de CURP incluyendo dígito verificador",
                Code = $"RENAPO-STRUCT-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Manuales RENAPO",
                DocumentUrl = RenapoBaseUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "RENAPO",
                    ["type"] = "Manual",
                    ["algorithm"] = "Dígito verificador módulo 10",
                    ["charset"] = "0-9, A-Z (excepto Ñ)"
                }
            });

            _logger.LogInformation("RENAPO scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping RENAPO: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeCurpDocumentsAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(RenapoDocUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='curp'], a[href*='renapo']");

            foreach (var link in links)
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                // Filter for CURP-related documents
                if (!title.Contains("CURP", StringComparison.OrdinalIgnoreCase) &&
                    !title.Contains("población", StringComparison.OrdinalIgnoreCase) &&
                    !anchor.Href.Contains("curp", StringComparison.OrdinalIgnoreCase))
                    continue;

                var documentUrl = anchor.Href;
                var externalId = GenerateExternalId("RENAPO", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documentación RENAPO para validación de CURP",
                    Code = $"RENAPO-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos RENAPO",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "RENAPO",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping RENAPO documents");
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
