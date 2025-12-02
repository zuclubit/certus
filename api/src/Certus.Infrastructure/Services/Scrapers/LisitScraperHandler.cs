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
/// Scraper handler para LISIT (Lista de Instituciones del Sistema Financiero)
/// Extrae catálogos de instituciones financieras autorizadas
/// URL: https://www.banxico.org.mx, https://www.cnbv.gob.mx
/// </summary>
public class LisitScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<LisitScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string CnbvPadronUrl = "https://www.gob.mx/cnbv/acciones-y-programas/padron-de-entidades-supervisadas";
    private const string BanxicoCatalogoUrl = "https://www.banxico.org.mx/cep/";
    private const string CnbvDocumentosUrl = "https://www.gob.mx/cnbv/documentos";

    public ScraperSourceType SourceType => ScraperSourceType.LISIT;

    public LisitScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<LisitScraperHandler> logger)
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
                        "Retry {RetryAttempt} for LISIT request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.LISIT;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting LISIT scraping");

            // Scrape catálogos de instituciones
            var docs = await ScrapeDocumentosAsync(cancellationToken);
            results.AddRange(docs);

            // Add institutional catalogs
            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LISIT-AFORES-{DateTime.UtcNow:yyyyMM}",
                Title = "Catálogo de AFOREs Autorizadas",
                Description = "Lista oficial de Administradoras de Fondos para el Retiro autorizadas por CONSAR",
                Code = $"LISIT-AFORE-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "AFOREs",
                DocumentUrl = CnbvPadronUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR/CNBV",
                    ["type"] = "CatalogoAFOREs",
                    ["datos"] = "Razón social,RFC,Número autorización"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LISIT-BANCOS-{DateTime.UtcNow:yyyyMM}",
                Title = "Catálogo de Instituciones de Crédito",
                Description = "Lista de bancos y entidades de crédito autorizadas",
                Code = $"LISIT-BANCOS-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Bancos",
                DocumentUrl = CnbvPadronUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNBV",
                    ["type"] = "CatalogoBancos",
                    ["uso"] = "Validación CLABE"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LISIT-ASEGURADORAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Catálogo de Aseguradoras",
                Description = "Lista de aseguradoras autorizadas para rentas vitalicias",
                Code = $"LISIT-ASEG-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Aseguradoras",
                DocumentUrl = CnbvPadronUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNSF",
                    ["type"] = "CatalogoAseguradoras",
                    ["operacion"] = "Rentas vitalicias pensiones"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LISIT-SOFOMES-{DateTime.UtcNow:yyyyMM}",
                Title = "Catálogo de SOFOMEs",
                Description = "Sociedades Financieras de Objeto Múltiple reguladas y no reguladas",
                Code = $"LISIT-SOFOM-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "SOFOMEs",
                DocumentUrl = CnbvDocumentosUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CNBV",
                    ["type"] = "CatalogoSOFOMEs",
                    ["tipos"] = "ENR,ER"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LISIT-OPERADORAS-{DateTime.UtcNow:yyyyMM}",
                Title = "Empresas Operadoras SAR",
                Description = "Lista de empresas operadoras del Sistema de Ahorro para el Retiro",
                Code = $"LISIT-OPER-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "Operadoras",
                DocumentUrl = CnbvPadronUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "CatalogoOperadoras",
                    ["principal"] = "PROCESAR"
                }
            });

            results.Add(new ScrapedDocumentData
            {
                ExternalId = $"LISIT-SIEFORES-{DateTime.UtcNow:yyyyMM}",
                Title = "Catálogo de SIEFOREs",
                Description = "Sociedades de Inversión Especializadas de Fondos para el Retiro",
                Code = $"LISIT-SIEF-{DateTime.UtcNow:yyyyMM}",
                PublishDate = DateTime.UtcNow,
                Category = "SIEFOREs",
                DocumentUrl = CnbvPadronUrl,
                Metadata = new Dictionary<string, string>
                {
                    ["source"] = "CONSAR",
                    ["type"] = "CatalogoSIEFOREs",
                    ["tipos"] = "Básica,Adicional"
                }
            });

            _logger.LogInformation("LISIT scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping LISIT: {Message}", ex.Message);
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
                await _httpClient.GetAsync(CnbvDocumentosUrl, cancellationToken));

            if (!response.IsSuccessStatusCode)
                return results;

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var config = AngleSharp.Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

            var links = document.QuerySelectorAll("a[href*='.pdf'], a[href*='padron'], a[href*='catalogo'], a[href*='instituciones']");

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

                var externalId = GenerateExternalId("LISIT", title, documentUrl);

                if (results.Any(r => r.ExternalId == externalId))
                    continue;

                results.Add(new ScrapedDocumentData
                {
                    ExternalId = externalId,
                    Title = CleanTitle(title),
                    Description = "Catálogo instituciones financieras",
                    Code = $"LISIT-DOC-{DateTime.UtcNow:yyyyMM}",
                    PublishDate = DateTime.UtcNow,
                    Category = "Documentos LISIT",
                    DocumentUrl = documentUrl,
                    PdfUrl = documentUrl.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? documentUrl : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["source"] = "CNBV",
                        ["type"] = "Documento",
                        ["contentHash"] = ComputeHash(title + documentUrl)
                    }
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping LISIT documentos");
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
