namespace Certus.Application.Common.Interfaces;

/// <summary>
/// Interface for validation notification service (SignalR real-time updates)
/// Used by background jobs and API to send real-time notifications to clients
/// </summary>
public interface IValidationNotificationService
{
    /// <summary>
    /// Notify progress of a validation to both validation and tenant groups
    /// </summary>
    Task NotifyValidationProgress(Guid validationId, Guid tenantId, ValidationProgressMessage message);

    /// <summary>
    /// Notify completion of a validation to both validation and tenant groups
    /// </summary>
    Task NotifyValidationCompleted(Guid validationId, Guid tenantId, ValidationCompletedMessage message);

    /// <summary>
    /// Notify error of a validation to both validation and tenant groups
    /// </summary>
    Task NotifyValidationError(Guid validationId, Guid tenantId, ValidationErrorMessage message);

    /// <summary>
    /// Send a generic update to a tenant group
    /// </summary>
    Task NotifyTenantUpdate(Guid tenantId, object message);

    /// <summary>
    /// Send a personal notification to a specific user
    /// </summary>
    Task NotifyUserUpdate(Guid userId, object message);
}

/// <summary>
/// Message for validation progress updates
/// </summary>
public record ValidationProgressMessage(
    Guid ValidationId,
    Guid TenantId,
    Guid UploadedById,
    int Progress,
    int RecordsProcessed,
    int TotalRecords,
    string CurrentValidator,
    string Status);

/// <summary>
/// Message for validation completion
/// </summary>
public record ValidationCompletedMessage(
    Guid ValidationId,
    Guid TenantId,
    Guid UploadedById,
    string FileName,
    string Status,
    int ErrorCount,
    int WarningCount,
    int RecordCount,
    int ValidRecordCount);

/// <summary>
/// Message for validation errors
/// </summary>
public record ValidationErrorMessage(
    Guid ValidationId,
    Guid TenantId,
    Guid UploadedById,
    string Error,
    string? Details);
