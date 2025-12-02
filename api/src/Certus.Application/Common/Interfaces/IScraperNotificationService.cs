namespace Certus.Application.Common.Interfaces;

/// <summary>
/// Service interface for sending scraper notifications via SignalR
/// </summary>
public interface IScraperNotificationService
{
    Task NotifyExecutionStarted(ScraperExecutionStartedMessage message);
    Task NotifyExecutionProgress(ScraperExecutionProgressMessage message);
    Task NotifyDocumentFound(ScraperDocumentFoundMessage message);
    Task NotifyExecutionCompleted(ScraperExecutionCompletedMessage message);
    Task NotifyExecutionFailed(ScraperExecutionFailedMessage message);
    Task NotifyExecutionLog(Guid executionId, Guid sourceId, string message, string level);
}

// ============================================
// Message Records
// ============================================

/// <summary>
/// Message sent when a scraper execution starts
/// </summary>
public record ScraperExecutionStartedMessage(
    Guid ExecutionId,
    Guid SourceId,
    string SourceName,
    string Status,
    DateTime StartedAt,
    string TriggeredBy);

/// <summary>
/// Message for execution progress updates
/// </summary>
public record ScraperExecutionProgressMessage(
    Guid ExecutionId,
    Guid SourceId,
    string Status,
    int DocumentsFound,
    int DocumentsNew,
    int DocumentsDuplicate,
    int DocumentsError,
    string? CurrentActivity);

/// <summary>
/// Message when a new document is found
/// </summary>
public record ScraperDocumentFoundMessage(
    Guid ExecutionId,
    Guid SourceId,
    Guid DocumentId,
    string Title,
    string? Code,
    string? Category,
    bool IsNew,
    DateTime FoundAt);

/// <summary>
/// Message when execution completes successfully
/// </summary>
public record ScraperExecutionCompletedMessage(
    Guid ExecutionId,
    Guid SourceId,
    string SourceName,
    string Status,
    DateTime CompletedAt,
    int DocumentsFound,
    int DocumentsNew,
    int DocumentsDuplicate,
    int DocumentsError,
    TimeSpan Duration);

/// <summary>
/// Message when execution fails
/// </summary>
public record ScraperExecutionFailedMessage(
    Guid ExecutionId,
    Guid SourceId,
    string SourceName,
    string Status,
    DateTime FailedAt,
    string ErrorMessage,
    string? ErrorDetails);

/// <summary>
/// Log message from scraper execution
/// </summary>
public record ScraperLogMessage(
    Guid ExecutionId,
    Guid SourceId,
    string Message,
    string Level,
    DateTime Timestamp);
