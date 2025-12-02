using Certus.Domain.Enums;

namespace Certus.Domain.Events;

/// <summary>
/// Raised when a new approval workflow is created
/// </summary>
public sealed record ApprovalCreatedEvent(
    Guid ApprovalId,
    Guid ValidationId,
    string FileName,
    ApprovalLevel CurrentLevel,
    Guid RequestedById
) : DomainEvent;

/// <summary>
/// Raised when an approval is submitted for review
/// </summary>
public sealed record ApprovalSubmittedEvent(
    Guid ApprovalId,
    Guid ValidationId,
    ApprovalLevel Level,
    Guid? AssignedToId
) : DomainEvent;

/// <summary>
/// Raised when an approval is approved at a level
/// </summary>
public sealed record ApprovalApprovedEvent(
    Guid ApprovalId,
    Guid ValidationId,
    ApprovalLevel Level,
    Guid ApprovedById,
    string? Comment
) : DomainEvent;

/// <summary>
/// Raised when an approval is rejected
/// </summary>
public sealed record ApprovalRejectedEvent(
    Guid ApprovalId,
    Guid ValidationId,
    ApprovalLevel Level,
    Guid RejectedById,
    string Reason
) : DomainEvent;

/// <summary>
/// Raised when an approval is escalated
/// </summary>
public sealed record ApprovalEscalatedEvent(
    Guid ApprovalId,
    Guid ValidationId,
    ApprovalLevel FromLevel,
    ApprovalLevel ToLevel,
    string Reason,
    Guid? EscalatedById
) : DomainEvent;

/// <summary>
/// Raised when an approval is reassigned
/// </summary>
public sealed record ApprovalReassignedEvent(
    Guid ApprovalId,
    Guid? FromUserId,
    Guid ToUserId,
    string Reason
) : DomainEvent;

/// <summary>
/// Raised when SLA is at risk
/// </summary>
public sealed record ApprovalSlaAtRiskEvent(
    Guid ApprovalId,
    Guid ValidationId,
    ApprovalLevel Level,
    int RemainingMinutes,
    SlaStatus SlaStatus
) : DomainEvent;

/// <summary>
/// Raised when SLA is breached
/// </summary>
public sealed record ApprovalSlaBreachedEvent(
    Guid ApprovalId,
    Guid ValidationId,
    ApprovalLevel Level,
    int OverdueMinutes
) : DomainEvent;
