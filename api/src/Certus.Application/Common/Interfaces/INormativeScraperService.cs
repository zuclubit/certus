using Certus.Domain.Entities;
using Certus.Domain.Enums;

namespace Certus.Application.Common.Interfaces;

/// <summary>
/// Servicio de scraping para cambios normativos CONSAR
/// Extrae circulares y disposiciones de fuentes oficiales
/// </summary>
public interface INormativeScraperService
{
    /// <summary>
    /// Ejecuta el scraping para una fuente específica
    /// </summary>
    Task<ScraperExecutionResult> ExecuteScrapingAsync(
        Guid sourceId,
        string triggeredBy = "system",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Ejecuta el scraping para todas las fuentes activas programadas
    /// </summary>
    Task<IEnumerable<ScraperExecutionResult>> ExecuteAllScheduledAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Procesa un documento scrapeado y lo convierte en NormativeChange
    /// </summary>
    Task<ProcessDocumentResult> ProcessDocumentAsync(
        Guid documentId,
        string processedBy,
        NormativePriority priority = NormativePriority.Medium,
        string[]? affectedValidators = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Procesa todos los documentos pendientes de una ejecución
    /// </summary>
    Task<ProcessBatchResult> ProcessPendingDocumentsAsync(
        Guid? executionId = null,
        bool autoAssignPriority = true,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Verifica si un documento ya existe (duplicado)
    /// </summary>
    Task<bool> IsDuplicateAsync(
        string externalId,
        Guid sourceId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancela una ejecución en progreso
    /// </summary>
    Task CancelExecutionAsync(
        Guid executionId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Resultado de la ejecución del scraper
/// </summary>
public record ScraperExecutionResult
{
    public Guid ExecutionId { get; init; }
    public Guid SourceId { get; init; }
    public string SourceName { get; init; } = string.Empty;
    public bool Success { get; init; }
    public ScraperExecutionStatus Status { get; init; }
    public int DocumentsFound { get; init; }
    public int DocumentsNew { get; init; }
    public int DocumentsDuplicate { get; init; }
    public int DocumentsError { get; init; }
    public long DurationMs { get; init; }
    public string? ErrorMessage { get; init; }
    public DateTime StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
}

/// <summary>
/// Resultado del procesamiento de un documento
/// </summary>
public record ProcessDocumentResult
{
    public Guid DocumentId { get; init; }
    public bool Success { get; init; }
    public Guid? NormativeChangeId { get; init; }
    public string? ErrorMessage { get; init; }
    public ScrapedDocumentStatus Status { get; init; }
}

/// <summary>
/// Resultado del procesamiento de múltiples documentos
/// </summary>
public class ProcessBatchResult
{
    public int TotalProcessed { get; set; }
    public int SuccessCount { get; set; }
    public int ErrorCount { get; set; }
    public int IgnoredCount { get; set; }
    public List<ProcessDocumentResult> Results { get; set; } = new();
}

/// <summary>
/// Resultado de scraping de un documento individual
/// </summary>
public record ScrapedDocumentData
{
    public string ExternalId { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Code { get; init; }
    public DateTime? PublishDate { get; init; }
    public DateTime? EffectiveDate { get; init; }
    public string? Category { get; init; }
    public string? DocumentUrl { get; init; }
    public string? PdfUrl { get; init; }
    public string? RawHtml { get; init; }
    public Dictionary<string, string>? Metadata { get; init; }
}

/// <summary>
/// Interface para implementaciones específicas de cada fuente
/// </summary>
public interface IScraperSourceHandler
{
    ScraperSourceType SourceType { get; }

    Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default);

    bool CanHandle(ScraperSourceType sourceType);
}
