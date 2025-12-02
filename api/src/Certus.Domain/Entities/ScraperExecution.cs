using Certus.Domain.Common;
using Certus.Domain.Enums;

namespace Certus.Domain.Entities;

/// <summary>
/// Registro de ejecución del scraper
/// Mantiene historial de cada ejecución con métricas y resultados
/// </summary>
public class ScraperExecution : BaseEntity
{
    public Guid SourceId { get; private set; }
    public DateTime StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public ScraperExecutionStatus Status { get; private set; } = ScraperExecutionStatus.Running;
    public int DocumentsFound { get; private set; }
    public int DocumentsNew { get; private set; }
    public int DocumentsDuplicate { get; private set; }
    public int DocumentsError { get; private set; }
    public long DurationMs { get; private set; }
    public string? ErrorMessage { get; private set; }
    public string? ErrorStackTrace { get; private set; }
    public string? ExecutionLog { get; private set; }
    public string? TriggeredBy { get; private set; } // "system" | "manual" | userId

    // Navigation properties
    public virtual ScraperSource Source { get; private set; } = null!;
    public virtual ICollection<ScrapedDocument> Documents { get; private set; } = new List<ScrapedDocument>();

    private ScraperExecution() { } // EF Core

    public static ScraperExecution Start(Guid sourceId, string triggeredBy = "system")
    {
        return new ScraperExecution
        {
            SourceId = sourceId,
            StartedAt = DateTime.UtcNow,
            Status = ScraperExecutionStatus.Running,
            TriggeredBy = triggeredBy
        };
    }

    public void Complete(int found, int newDocs, int duplicates)
    {
        CompletedAt = DateTime.UtcNow;
        DurationMs = (long)(CompletedAt.Value - StartedAt).TotalMilliseconds;
        DocumentsFound = found;
        DocumentsNew = newDocs;
        DocumentsDuplicate = duplicates;
        Status = ScraperExecutionStatus.Completed;
    }

    public void CompleteWithWarnings(int found, int newDocs, int duplicates, int errors, string warnings)
    {
        CompletedAt = DateTime.UtcNow;
        DurationMs = (long)(CompletedAt.Value - StartedAt).TotalMilliseconds;
        DocumentsFound = found;
        DocumentsNew = newDocs;
        DocumentsDuplicate = duplicates;
        DocumentsError = errors;
        ErrorMessage = warnings;
        Status = ScraperExecutionStatus.CompletedWithWarnings;
    }

    public void Fail(string error, string? stackTrace = null)
    {
        CompletedAt = DateTime.UtcNow;
        DurationMs = (long)(CompletedAt.Value - StartedAt).TotalMilliseconds;
        ErrorMessage = error;
        ErrorStackTrace = stackTrace;
        Status = ScraperExecutionStatus.Failed;
    }

    public void Cancel()
    {
        CompletedAt = DateTime.UtcNow;
        DurationMs = (long)(CompletedAt.Value - StartedAt).TotalMilliseconds;
        Status = ScraperExecutionStatus.Cancelled;
    }

    public void TimedOut()
    {
        CompletedAt = DateTime.UtcNow;
        DurationMs = (long)(CompletedAt.Value - StartedAt).TotalMilliseconds;
        Status = ScraperExecutionStatus.TimedOut;
        ErrorMessage = "Execution timed out after maximum allowed duration";
    }

    public void AppendLog(string message)
    {
        var timestamp = DateTime.UtcNow.ToString("HH:mm:ss.fff");
        var logEntry = $"[{timestamp}] {message}\n";
        ExecutionLog = (ExecutionLog ?? "") + logEntry;
    }

    public void SetDocumentCounts(int found, int newDocs, int duplicates, int errors)
    {
        DocumentsFound = found;
        DocumentsNew = newDocs;
        DocumentsDuplicate = duplicates;
        DocumentsError = errors;
    }
}
