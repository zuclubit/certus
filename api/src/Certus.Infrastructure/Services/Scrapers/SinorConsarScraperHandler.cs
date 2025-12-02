using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace Certus.Infrastructure.Services.Scrapers;

/// <summary>
/// Scraper handler para el Sistema de Normatividad CONSAR (SINOR)
/// Extrae normatividad oficial directamente desde la API de SINOR
/// API Base: https://www.consar.gob.mx/APIs/SINORApi/
/// </summary>
public class SinorConsarScraperHandler : IScraperSourceHandler
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SinorConsarScraperHandler> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    private const string SinorApiBaseUrl = "https://www.consar.gob.mx/APIs/SINORApi/";
    private const string NormatividadEndpoint = "api/Normatividad/GetNormatividadIdEdo";

    public ScraperSourceType SourceType => ScraperSourceType.SinorConsar;

    public SinorConsarScraperHandler(
        IHttpClientFactory httpClientFactory,
        ILogger<SinorConsarScraperHandler> logger)
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
                        "Retry {RetryAttempt} for SINOR request after {Timespan}s. Status: {Status}",
                        retryAttempt, timespan.TotalSeconds, outcome.Result?.StatusCode);
                });
    }

    public bool CanHandle(ScraperSourceType sourceType) => sourceType == ScraperSourceType.SinorConsar;

    public async Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedDocumentData>();

        try
        {
            _logger.LogInformation("Starting SINOR CONSAR API scraping");

            // Obtener todas las normatividades publicadas desde la API de SINOR
            var normatividades = await FetchNormatividadFromApiAsync(cancellationToken);

            foreach (var norma in normatividades)
            {
                try
                {
                    var scrapedDoc = MapToScrapedDocument(norma);
                    if (scrapedDoc != null)
                    {
                        results.Add(scrapedDoc);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error mapping SINOR normatividad {Id}", norma.Id);
                }
            }

            _logger.LogInformation("SINOR scraping completed. Found {Count} documents", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping SINOR API: {Message}", ex.Message);
            throw;
        }

        return results;
    }

    private async Task<List<SinorNormatividad>> FetchNormatividadFromApiAsync(CancellationToken cancellationToken)
    {
        var url = $"{SinorApiBaseUrl}{NormatividadEndpoint}";
        _logger.LogInformation("Fetching SINOR API from: {Url}", url);

        // Parámetros según el JavaScript de SINOR:
        // I_CVE_NORMATIVIDAD: -1 = Todas las normas
        // I_CVE_ESTADO_NORMA: 2 = Solo Publicación
        // I_CVE_ESTADO_ASOC: 1 = Activas
        var request = new SinorNormatividadRequest
        {
            CveNormatividad = -1,
            CveEstadoNorma = 2,
            CveEstadoAsoc = 1
        };

        var jsonContent = JsonSerializer.Serialize(request);
        var content = new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/json");

        var response = await _retryPolicy.ExecuteAsync(async () =>
            await _httpClient.PostAsync(url, content, cancellationToken));

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("SINOR API request failed with status {Status}", response.StatusCode);
            return new List<SinorNormatividad>();
        }

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        _logger.LogDebug("SINOR API response length: {Length} chars", responseJson.Length);

        var normatividades = JsonSerializer.Deserialize<List<SinorNormatividad>>(responseJson);

        if (normatividades == null)
        {
            _logger.LogWarning("Failed to deserialize SINOR API response");
            return new List<SinorNormatividad>();
        }

        _logger.LogInformation("SINOR API returned {Count} normatividades", normatividades.Count);
        return normatividades;
    }

    private ScrapedDocumentData? MapToScrapedDocument(SinorNormatividad norma)
    {
        if (string.IsNullOrWhiteSpace(norma.Descripcion))
            return null;

        // Generar external ID único basado en el ID de SINOR
        var externalId = $"SINOR-{norma.Id}";

        // Parsear fecha DOF
        DateTime? publishDate = null;
        if (!string.IsNullOrEmpty(norma.FechaDof))
        {
            if (DateTime.TryParseExact(norma.FechaDof, "dd/MM/yyyy",
                CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate))
            {
                publishDate = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);
            }
        }

        // Construir URL del documento
        var documentUrl = norma.TieneLiga && !string.IsNullOrEmpty(norma.UrlRedirige)
            ? norma.UrlRedirige
            : $"https://www.consar.gob.mx/gobmx/aplicativo/SINORconsar/?id={norma.Id}";

        // Determinar categoría basada en el tipo de norma
        var category = DetermineCategory(norma.TipoNorma, norma.Descripcion);

        return new ScrapedDocumentData
        {
            ExternalId = externalId,
            Title = CleanTitle(norma.Descripcion),
            Description = $"Tipo: {norma.TipoNorma} | Estado: {norma.EstadoNorma}",
            Code = GenerateCode(norma),
            PublishDate = publishDate ?? DateTime.UtcNow,
            Category = category,
            DocumentUrl = documentUrl,
            RawHtml = null,
            Metadata = new Dictionary<string, string>
            {
                ["source"] = "SINOR-CONSAR",
                ["sinorId"] = norma.Id.ToString(),
                ["tipoNorma"] = norma.TipoNorma ?? "",
                ["estadoNorma"] = norma.EstadoNorma ?? "",
                ["fechaRegistro"] = norma.FechaRegistro ?? "",
                ["nombreArchivo"] = norma.NombreArchivo ?? "",
                ["tieneAsociaciones"] = norma.TieneAsociaciones.ToString(),
                ["tieneLiga"] = norma.TieneLiga.ToString(),
                ["visitas"] = norma.ContadorVisitas.ToString()
            }
        };
    }

    private static string? GenerateCode(SinorNormatividad norma)
    {
        var descripcion = norma.Descripcion?.ToUpperInvariant() ?? "";

        // Intentar extraer código de circular
        if (descripcion.Contains("CIRCULAR CONSAR") || descripcion.Contains("CIRCULAR"))
        {
            var match = System.Text.RegularExpressions.Regex.Match(
                descripcion, @"CIRCULAR\s+(?:CONSAR\s+)?(\d+[-/]\d+)",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (match.Success)
            {
                return $"CONSAR {match.Groups[1].Value}";
            }
        }

        // Intentar extraer código de disposición
        if (descripcion.Contains("DISPOSICIÓN") || descripcion.Contains("DISPOSICION"))
        {
            return $"DISP-SINOR-{norma.Id}";
        }

        // Código genérico basado en tipo
        return norma.TipoNorma switch
        {
            "Leyes" => $"LEY-SINOR-{norma.Id}",
            "Reglamentos" => $"REG-SINOR-{norma.Id}",
            "Disposiciones y circulares" => $"DISP-SINOR-{norma.Id}",
            "Reglas, Acuerdos y Lineamientos." => $"RAL-SINOR-{norma.Id}",
            _ => $"SINOR-{norma.Id}"
        };
    }

    private static string DetermineCategory(string? tipoNorma, string? descripcion)
    {
        if (string.IsNullOrEmpty(tipoNorma) && string.IsNullOrEmpty(descripcion))
            return "General";

        var combined = $"{tipoNorma} {descripcion}".ToLowerInvariant();

        if (combined.Contains("siefore") || combined.Contains("inversión") || combined.Contains("inversion"))
            return "Inversiones";
        if (combined.Contains("pensión") || combined.Contains("pension") || combined.Contains("retiro"))
            return "Retiro y Pensiones";
        if (combined.Contains("afore") || combined.Contains("administradora"))
            return "Administradoras";
        if (combined.Contains("formato") || combined.Contains("anexo"))
            return "Formatos";
        if (combined.Contains("comisión") || combined.Contains("comision") || combined.Contains("cobro"))
            return "Comisiones";
        if (combined.Contains("ley"))
            return "Leyes";
        if (combined.Contains("reglamento"))
            return "Reglamentos";
        if (combined.Contains("circular") || combined.Contains("disposición") || combined.Contains("disposicion"))
            return "Disposiciones";
        if (combined.Contains("regla") || combined.Contains("lineamiento") || combined.Contains("acuerdo"))
            return "Reglas y Lineamientos";

        return "General";
    }

    private static string CleanTitle(string? title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return "Sin título";

        // Limpiar y normalizar el título
        title = System.Text.RegularExpressions.Regex.Replace(title, @"\s+", " ").Trim();

        // Limitar longitud
        if (title.Length > 500)
            title = title[..497] + "...";

        return title;
    }

    #region DTOs para la API de SINOR

    internal class SinorNormatividadRequest
    {
        [JsonPropertyName("I_CVE_NORMATIVIDAD")]
        public int CveNormatividad { get; set; }

        [JsonPropertyName("I_CVE_ESTADO_NORMA")]
        public int CveEstadoNorma { get; set; }

        [JsonPropertyName("I_CVE_ESTADO_ASOC")]
        public int CveEstadoAsoc { get; set; }
    }

    internal class SinorNormatividad
    {
        [JsonPropertyName("I_CVE_NORMATIVIDAD")]
        public int Id { get; set; }

        [JsonPropertyName("I_CVE_ESTADO_NORMA")]
        public int EstadoNormaId { get; set; }

        [JsonPropertyName("I_CVE_TIPO_NORMA")]
        public int TipoNormaId { get; set; }

        [JsonPropertyName("I_NUM_POSICION")]
        public int Posicion { get; set; }

        [JsonPropertyName("T_DSC_NORMATIVIDAD")]
        public string? Descripcion { get; set; }

        [JsonPropertyName("T_DSC_TIPO_NORMA")]
        public string? TipoNorma { get; set; }

        [JsonPropertyName("T_DSC_EDO_NORMA")]
        public string? EstadoNorma { get; set; }

        [JsonPropertyName("F_FECH_REGISTRO")]
        public string? FechaRegistro { get; set; }

        [JsonPropertyName("F_FECH_DOF_NORMA")]
        public string? FechaDof { get; set; }

        [JsonPropertyName("I_NUM_CONTADOR_VISITAS")]
        public int ContadorVisitas { get; set; }

        [JsonPropertyName("T_DSC_ARCHIVO")]
        public string? NombreArchivo { get; set; }

        [JsonPropertyName("T_DSC_URL_REDIRIGE")]
        public string? UrlRedirige { get; set; }

        [JsonPropertyName("TIENEASOC")]
        public int TieneAsociaciones { get; set; }

        [JsonPropertyName("TIENE_LIGA")]
        public bool TieneLiga { get; set; }
    }

    #endregion
}
