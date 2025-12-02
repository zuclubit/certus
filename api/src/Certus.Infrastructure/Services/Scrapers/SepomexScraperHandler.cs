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
/// Scraper handler para SEPOMEX (Servicio Postal Mexicano)
/// Extrae catálogo de códigos postales de México
/// URL: https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Exportar.aspx
/// </summary>
public class SepomexScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SepomexScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string SepomexUrl = "https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Exportar.aspx";
    private const string SepomexInfoUrl = "https://www.gob.mx/correosdemexico";

    public ScraperSourceType SourceType => ScraperSourceType.SEPOMEX;

    public SepomexScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<SepomexScraperHandler> logger)
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
                        "Retry {RetryAttempt} for SEPOMEX request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.SEPOMEX;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting SEPOMEX scraping");

            // Scrape the export page to find download links
            var docs = await ScrapeCodigosPostalesAsync(cancellationToken);
            results.AddRange(docs);

            _logger.LogInformation("SEPOMEX scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping SEPOMEX: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<ScrapedDocumentData>> ScrapeCodigosPostalesAsync(CancellationToken cancellationToken)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.GetAsync(SepomexUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("SEPOMEX request failed with status {Status}", response.StatusCode);
                // Add a reference document anyway
                results.Add(CreateCatalogDocument());
                return results;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);

            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            // Find download links for estados (state-level CP catalogs)
            var stateLinks = document.QuerySelectorAll("select#cboEntidad option, a[href*='.txt'], a[href*='descarga']");

            // Add the main catalog document
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"SEPOMEX-CAT-{DateTime.UtcNow:yyyyMM}",
                Title = "Catálogo Nacional de Códigos Postales de México",
                Description = "Catálogo oficial de códigos postales de SEPOMEX, incluye todas las entidades federativas",
                Code = $"SEPOMEX-CP-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Catálogo Códigos Postales",
                DocumentUrl = SepomexUrl,
                RawHtml = html.Length > 50000 ? html[..50000] : html,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "SEPOMEX",
                    ["type"] = "CatalogoCP",
                    ["format"] = "TXT/CSV",
                    ["coverage"] = "Nacional",
                    ["contentHash"] = ComputeHash(html)
                }
            });

            // Parse state options if available
            var estados = document.QuerySelectorAll("select#cboEntidad option");
            foreach (var estado in estados)
            {
                var value = estado.GetAttribute("value");
                var name = estado.TextContent?.Trim();

                if (string.IsNullOrWhiteSpace(value) || value == "0" || string.IsNullOrWhiteSpace(name))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = $"SEPOMEX-{value}-{DateTime.UtcNow:yyyyMM}",
                    Title = $"Códigos Postales - {name}",
                    Description = $"Catálogo de códigos postales para {name}",
                    Code = $"SEPOMEX-{value}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Catálogo Códigos Postales",
                    DocumentUrl = SepomexUrl,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "SEPOMEX",
                        ["type"] = "CatalogoCP",
                        ["estado"] = name,
                        ["estadoId"] = value
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping SEPOMEX códigos postales");
            results.Add(CreateCatalogDocument());
        }

        return results;
    }

    private static ScrapedDocumentData CreateCatalogDocument()
    {
        return new ScrapedDocumentData
        {
            ExternalId = $"SEPOMEX-REF-{DateTime.UtcNow:yyyyMM}",
            Title = "Catálogo de Códigos Postales SEPOMEX",
            Description = "Referencia al catálogo oficial de códigos postales de México (SEPOMEX)",
            Code = $"SEPOMEX-{DateTime.UtcNow:yyyyMM}",
            PublishDate = DateTime.UtcNow,
            Category = "Catálogo Códigos Postales",
            DocumentUrl = SepomexUrl,
            Metadata = new Dictionary<string, string>
            {
                ["source"] = "SEPOMEX",
                ["type"] = "CatalogoCP",
                ["format"] = "TXT/CSV"
            }
        };
    }

    private static string ComputeHash(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
