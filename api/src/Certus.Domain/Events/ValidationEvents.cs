using Certus.Domain.Enums;

namespace Certus.Domain.Events;

/// <summary>
/// Raised when a new file validation is created
/// </summary>
public sealed record ValidationCreatedEvent(
    Guid ValidationId,
    string FileName,
    FileType FileType,
    Guid UploadedById,
    Guid TenantId
) : DomainEvent;

/// <summary>
/// Raised when file validation processing starts
/// </summary>
public sealed record ValidationProcessingStartedEvent(
    Guid ValidationId,
    string FileName,
    int ExpectedRecords
) : DomainEvent;

/// <summary>
/// Raised when validation progress updates
/// </summary>
public sealed record ValidationProgressUpdatedEvent(
    Guid ValidationId,
    int Progress,
    int ProcessedRecords,
    int TotalRecords
) : DomainEvent;

/// <summary>
/// Raised when validation completes successfully
/// </summary>
public sealed record ValidationCompletedEvent(
    Guid ValidationId,
    string FileName,
    ValidationStatus Status,
    int TotalRecords,
    int ValidRecords,
    int ErrorCount,
    int WarningCount,
    bool RequiresAuthorization
) : DomainEvent;

/// <summary>
/// Raised when validation fails
/// </summary>
public sealed record ValidationFailedEvent(
    Guid ValidationId,
    string FileName,
    string ErrorMessage,
    int ErrorCount
) : DomainEvent;

/// <summary>
/// Raised when a validation is cancelled
/// </summary>
public sealed record ValidationCancelledEvent(
    Guid ValidationId,
    string Reason,
    string CancelledBy
) : DomainEvent;

/// <summary>
/// Raised when a substitute (retransmisión) is created
/// </summary>
public sealed record ValidationSubstituteCreatedEvent(
    Guid OriginalValidationId,
    Guid SubstituteValidationId,
    string SubstitutionReason,
    int NewVersion
) : DomainEvent;

/// <summary>
/// Raised when a validation is authorized
/// </summary>
public sealed record ValidationAuthorizedEvent(
    Guid ValidationId,
    string AuthorizationOffice,
    string AuthorizedBy
) : DomainEvent;

/// <summary>
/// Raised when authorization is rejected
/// </summary>
public sealed record ValidationAuthorizationRejectedEvent(
    Guid ValidationId,
    string Reason,
    string RejectedBy
) : DomainEvent;
