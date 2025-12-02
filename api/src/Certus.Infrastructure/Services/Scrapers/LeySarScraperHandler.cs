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
/// Scraper handler para Ley SAR y Marco Legal del Sistema de Ahorro para el Retiro
/// Extrae información sobre la legislación primaria y secundaria del SAR
/// Fuentes: Diputados, CONSAR, DOF
/// </summary>
public class LeySarScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<LeySarScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string DiputadosLeyesUrl = "https://www.diputados.gob.mx/LeyesBiblio/index.htm";
    private const string ConsarMarcoUrl = "https://www.gob.mx/consar/acciones-y-programas/marco-juridico";
    private const string DofLeySarUrl = "https://www.dof.gob.mx";

    public ScraperSourceType SourceType => ScraperSourceType.LeySAR;

    public LeySarScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<LeySarScraperHandler> logger)
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
                        "Retry {RetryAttempt} for LeySAR request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.LeySAR;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting Ley SAR scraping");

            // Scrape marco jurídico CONSAR
            var docs = await ScrapeMarcoJuridicoAsync(cancellationToken);
            results.AddRange(docs);

            // Add primary SAR legislation
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LEYSAR-LSAR-{DateTime.UtcNow:yyyyMM}",
                Title = "Ley de los Sistemas de Ahorro para el Retiro",
                Description = "Ley marco del SAR que regula AFOREs, SIEFOREs y el sistema de pensiones",
                Code = $"LEYSAR-LSAR-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Ley SAR",
                DocumentUrl = ConsarMarcoUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "Congreso/CONSAR",
                    ["type"] = "LeyPrimaria",
                    ["ley"] = "Ley SAR",
                    ["ultima_reforma"] = "Verificar en DOF"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LEYSAR-LSS-{DateTime.UtcNow:yyyyMM}",
                Title = "Ley del Seguro Social (Capítulo SAR)",
                Description = "Disposiciones de la LSS relacionadas con el Sistema de Ahorro para el Retiro",
                Code = $"LEYSAR-LSS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Ley Seguro Social",
                DocumentUrl = DiputadosLeyesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "Congreso",
                    ["type"] = "LeyPrimaria",
                    ["ley"] = "LSS",
                    ["capitulos"] = "V,VI - Seguro de Retiro"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LEYSAR-LISSSTE-{DateTime.UtcNow:yyyyMM}",
                Title = "Ley del ISSSTE (Disposiciones SAR)",
                Description = "Ley del ISSSTE con disposiciones sobre ahorro para el retiro sector público",
                Code = $"LEYSAR-LISSSTE-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Ley ISSSTE",
                DocumentUrl = DiputadosLeyesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "Congreso",
                    ["type"] = "LeyPrimaria",
                    ["ley"] = "LISSSTE",
                    ["aplicacion"] = "Trabajadores del Estado"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LEYSAR-REGLAMENTO-{DateTime.UtcNow:yyyyMM}",
                Title = "Reglamento de la Ley SAR",
                Description = "Reglamento que desarrolla la Ley de los Sistemas de Ahorro para el Retiro",
                Code = $"LEYSAR-REG-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Reglamento SAR",
                DocumentUrl = ConsarMarcoUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "Ejecutivo",
                    ["type"] = "Reglamento",
                    ["nivel"] = "Secundario"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LEYSAR-CIRCULARES-{DateTime.UtcNow:yyyyMM}",
                Title = "Disposiciones de Carácter General (Circulares CONSAR)",
                Description = "Circulares y disposiciones generales emitidas por CONSAR",
                Code = $"LEYSAR-CIRC-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Circulares CONSAR",
                DocumentUrl = ConsarMarcoUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "Circulares",
                    ["alcance"] = "AFOREs,SIEFOREs,Operadores"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LEYSAR-REFORMAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Reformas al Sistema de Pensiones 2020-2024",
                Description = "Reformas recientes a la Ley SAR incluyendo la reforma de pensiones 2020",
                Code = $"LEYSAR-REF-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Reformas SAR",
                DocumentUrl = DofLeySarUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "DOF",
                    ["type"] = "Reformas",
                    ["periodos"] = "2020,2021,2022,2023,2024",
                    ["principales"] = "Comisiones,Aportaciones,Semanas"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LEYSAR-TRANSITORIOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Artículos Transitorios Reforma Pensiones",
                Description = "Disposiciones transitorias de las reformas al sistema de pensiones",
                Code = $"LEYSAR-TRANS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Transitorios SAR",
                DocumentUrl = ConsarMarcoUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "Congreso/DOF",
                    ["type"] = "Transitorios",
                    ["vigencia"] = "Gradual hasta 2030"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LEYSAR-INFONAVIT-{DateTime.UtcNow:yyyyMM}",
                Title = "Ley del INFONAVIT (Subcuenta Vivienda)",
                Description = "Disposiciones de la Ley del INFONAVIT sobre subcuenta de vivienda",
                Code = $"LEYSAR-INFO-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Ley INFONAVIT",
                DocumentUrl = DiputadosLeyesUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "Congreso",
                    ["type"] = "LeyPrimaria",
                    ["subcuenta"] = "Vivienda 5% SBC"
                }
            });

            _logger.LogInformation("Ley SAR scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping Ley SAR: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeMarcoJuridicoAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(ConsarMarcoUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='ley'], a[href*='reglamento'], a[href*='circular'], a[href*='disposicion']");

            foreach (var link in links.Take(25))
            {
                var anchor = link as IHtmlAnchorElement;
                if (anchor == null) continue;

                var title = anchor.TextContent?.Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                    continue;

                var documentUrl = anchor.Href;
                if (!documentUrl.StartsWith("http"))
                    documentUrl = "https://www.gob.mx" + documentUrl;

                var externalId = GenerateExternalId("LEYSAR", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Documento del marco jurídico SAR",
                    Code = $"LEYSAR-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Marco Jurídico SAR",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CONSAR",
                        ["type"] = "MarcoJuridico",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping marco jurídico SAR");
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
