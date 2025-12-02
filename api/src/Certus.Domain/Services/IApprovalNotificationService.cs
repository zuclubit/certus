namespace Certus.Domain.Services;

/// <summary>
/// Service interface for sending real-time approval notifications
/// CONSAR Compliance: Ensures approvers are notified of pending approvals, SLA risks, and status changes
/// </summary>
public interface IApprovalNotificationService
{
    /// <summary>
    /// Notify when a new approval is created
    /// </summary>
    Task NotifyApprovalCreatedAsync(ApprovalCreatedNotification notification);

    /// <summary>
    /// Notify when an approval is assigned to a user
    /// </summary>
    Task NotifyApprovalAssignedAsync(ApprovalAssignedNotification notification);

    /// <summary>
    /// Notify when an approval is approved
    /// </summary>
    Task NotifyApprovalApprovedAsync(ApprovalApprovedNotification notification);

    /// <summary>
    /// Notify when an approval is rejected
    /// </summary>
    Task NotifyApprovalRejectedAsync(ApprovalRejectedNotification notification);

    /// <summary>
    /// Notify when an approval is escalated
    /// </summary>
    Task NotifyApprovalEscalatedAsync(ApprovalEscalatedNotification notification);

    /// <summary>
    /// Notify when SLA is at risk
    /// </summary>
    Task NotifySlaAtRiskAsync(ApprovalSlaNotification notification);

    /// <summary>
    /// Notify when SLA is breached
    /// </summary>
    Task NotifySlaBreachedAsync(ApprovalSlaNotification notification);

    /// <summary>
    /// Notify tenant of approval updates
    /// </summary>
    Task NotifyTenantUpdateAsync(Guid tenantId, object message);

    /// <summary>
    /// Notify specific user
    /// </summary>
    Task NotifyUserAsync(Guid userId, object message);
}

// Notification DTOs for type safety and SignalR serialization
public record ApprovalCreatedNotification(
    Guid ApprovalId,
    Guid ValidationId,
    Guid TenantId,
    string FileName,
    string FileType,
    string Level,
    string Status,
    int Priority,
    int ErrorCount,
    int WarningCount,
    Guid RequestedById,
    string RequestedByName,
    DateTime DueDate,
    DateTime RequestedAt
);

public record ApprovalAssignedNotification(
    Guid ApprovalId,
    Guid ValidationId,
    Guid TenantId,
    string FileName,
    Guid AssignedToId,
    string AssignedToName,
    string Level,
    int Priority,
    DateTime DueDate
);

public record ApprovalApprovedNotification(
    Guid ApprovalId,
    Guid ValidationId,
    Guid TenantId,
    string FileName,
    Guid ApprovedById,
    string ApprovedByName,
    string Level,
    int? ResponseTimeMinutes,
    DateTime ApprovedAt
);

public record ApprovalRejectedNotification(
    Guid ApprovalId,
    Guid ValidationId,
    Guid TenantId,
    string FileName,
    Guid RejectedById,
    string RejectedByName,
    string Level,
    string Reason,
    DateTime RejectedAt
);

public record ApprovalEscalatedNotification(
    Guid ApprovalId,
    Guid NewApprovalId,
    Guid ValidationId,
    Guid TenantId,
    string FileName,
    string FromLevel,
    string ToLevel,
    string Reason,
    Guid? EscalatedById,
    DateTime EscalatedAt
);

public record ApprovalSlaNotification(
    Guid ApprovalId,
    Guid ValidationId,
    Guid TenantId,
    string FileName,
    string Level,
    string SlaStatus,
    int? RemainingMinutes,
    int? OverdueMinutes,
    DateTime DueDate,
    Guid? AssignedToId
);
