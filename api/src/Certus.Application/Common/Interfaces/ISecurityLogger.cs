namespace Certus.Application.Common.Interfaces;

/// <summary>
/// Security-focused logging service for compliance and threat detection
/// Best Practice 2025: Structured security logging with PII protection
/// </summary>
public interface ISecurityLogger
{
    /// <summary>
    /// Log authentication events (login, logout, token refresh)
    /// </summary>
    Task LogAuthenticationEventAsync(SecurityAuthEvent authEvent, CancellationToken cancellationToken = default);

    /// <summary>
    /// Log registration and onboarding events
    /// </summary>
    Task LogRegistrationEventAsync(SecurityRegistrationEvent registrationEvent, CancellationToken cancellationToken = default);

    /// <summary>
    /// Log authorization/access events
    /// </summary>
    Task LogAuthorizationEventAsync(SecurityAuthorizationEvent authzEvent, CancellationToken cancellationToken = default);

    /// <summary>
    /// Log suspicious activity for threat detection
    /// </summary>
    Task LogSuspiciousActivityAsync(SecurityThreatEvent threatEvent, CancellationToken cancellationToken = default);

    /// <summary>
    /// Log data access events for compliance (GDPR, CONSAR)
    /// </summary>
    Task LogDataAccessEventAsync(SecurityDataAccessEvent dataEvent, CancellationToken cancellationToken = default);

    /// <summary>
    /// Log rate limit violations
    /// </summary>
    Task LogRateLimitViolationAsync(SecurityRateLimitEvent rateLimitEvent, CancellationToken cancellationToken = default);
}

/// <summary>
/// Base class for all security events
/// </summary>
public abstract record SecurityEventBase
{
    /// <summary>
    /// Unique correlation ID for request tracing
    /// </summary>
    public string CorrelationId { get; init; } = Guid.NewGuid().ToString("N");

    /// <summary>
    /// Timestamp of the event (UTC)
    /// </summary>
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;

    /// <summary>
    /// Client IP address (masked for privacy if needed)
    /// </summary>
    public string? IpAddress { get; init; }

    /// <summary>
    /// User agent string
    /// </summary>
    public string? UserAgent { get; init; }

    /// <summary>
    /// Request path
    /// </summary>
    public string? RequestPath { get; init; }

    /// <summary>
    /// Tenant ID if applicable
    /// </summary>
    public Guid? TenantId { get; init; }

    /// <summary>
    /// Event severity level
    /// </summary>
    public SecurityEventSeverity Severity { get; init; } = SecurityEventSeverity.Info;

    /// <summary>
    /// Additional metadata
    /// </summary>
    public Dictionary<string, object>? Metadata { get; init; }
}

/// <summary>
/// Authentication event (login, logout, token operations)
/// </summary>
public sealed record SecurityAuthEvent : SecurityEventBase
{
    public AuthEventType EventType { get; init; }

    /// <summary>
    /// Email address (will be masked in logs)
    /// </summary>
    public string? Email { get; init; }

    /// <summary>
    /// User ID (after successful auth)
    /// </summary>
    public Guid? UserId { get; init; }

    /// <summary>
    /// Whether the operation was successful
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Failure reason if applicable
    /// </summary>
    public string? FailureReason { get; init; }

    /// <summary>
    /// Number of failed attempts (for brute force detection)
    /// </summary>
    public int? FailedAttempts { get; init; }

    /// <summary>
    /// Whether MFA was used
    /// </summary>
    public bool MfaUsed { get; init; }
}

/// <summary>
/// Registration/onboarding event
/// </summary>
public sealed record SecurityRegistrationEvent : SecurityEventBase
{
    public RegistrationEventType EventType { get; init; }

    /// <summary>
    /// Email address (will be masked in logs)
    /// </summary>
    public string? Email { get; init; }

    /// <summary>
    /// Organization name
    /// </summary>
    public string? OrganizationName { get; init; }

    /// <summary>
    /// AFORE code
    /// </summary>
    public string? AforeCode { get; init; }

    /// <summary>
    /// Whether the operation was successful
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Failure reason if applicable
    /// </summary>
    public string? FailureReason { get; init; }

    /// <summary>
    /// Validation errors count
    /// </summary>
    public int ValidationErrorsCount { get; init; }

    /// <summary>
    /// Created tenant ID (on success)
    /// </summary>
    public Guid? CreatedTenantId { get; init; }

    /// <summary>
    /// Created user ID (on success)
    /// </summary>
    public Guid? CreatedUserId { get; init; }
}

/// <summary>
/// Authorization event (access control)
/// </summary>
public sealed record SecurityAuthorizationEvent : SecurityEventBase
{
    public AuthzEventType EventType { get; init; }

    /// <summary>
    /// User ID attempting access
    /// </summary>
    public Guid? UserId { get; init; }

    /// <summary>
    /// Resource being accessed
    /// </summary>
    public string? Resource { get; init; }

    /// <summary>
    /// Action being attempted
    /// </summary>
    public string? Action { get; init; }

    /// <summary>
    /// Whether access was granted
    /// </summary>
    public bool AccessGranted { get; init; }

    /// <summary>
    /// Required role/permission
    /// </summary>
    public string? RequiredPermission { get; init; }

    /// <summary>
    /// User's actual role
    /// </summary>
    public string? UserRole { get; init; }
}

/// <summary>
/// Suspicious activity/threat event
/// </summary>
public sealed record SecurityThreatEvent : SecurityEventBase
{
    public ThreatEventType EventType { get; init; }

    /// <summary>
    /// Description of the threat
    /// </summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// User ID if known
    /// </summary>
    public Guid? UserId { get; init; }

    /// <summary>
    /// Email if relevant (will be masked)
    /// </summary>
    public string? Email { get; init; }

    /// <summary>
    /// Threat score (0-100)
    /// </summary>
    public int ThreatScore { get; init; }

    /// <summary>
    /// Whether automatic action was taken
    /// </summary>
    public bool AutomaticActionTaken { get; init; }

    /// <summary>
    /// Action taken (block, alert, etc.)
    /// </summary>
    public string? ActionTaken { get; init; }

    /// <summary>
    /// Related event IDs for correlation
    /// </summary>
    public List<string>? RelatedEventIds { get; init; }
}

/// <summary>
/// Data access event for compliance
/// </summary>
public sealed record SecurityDataAccessEvent : SecurityEventBase
{
    public DataAccessEventType EventType { get; init; }

    /// <summary>
    /// User ID accessing the data
    /// </summary>
    public Guid? UserId { get; init; }

    /// <summary>
    /// Type of data accessed
    /// </summary>
    public string DataType { get; init; } = string.Empty;

    /// <summary>
    /// Entity ID being accessed
    /// </summary>
    public string? EntityId { get; init; }

    /// <summary>
    /// Number of records accessed
    /// </summary>
    public int RecordCount { get; init; }

    /// <summary>
    /// Whether data was exported
    /// </summary>
    public bool DataExported { get; init; }

    /// <summary>
    /// Export format if applicable
    /// </summary>
    public string? ExportFormat { get; init; }

    /// <summary>
    /// Compliance classification
    /// </summary>
    public string? ComplianceClassification { get; init; }
}

/// <summary>
/// Rate limit violation event
/// </summary>
public sealed record SecurityRateLimitEvent : SecurityEventBase
{
    public string PolicyName { get; init; } = string.Empty;

    /// <summary>
    /// Email if known (will be masked)
    /// </summary>
    public string? Email { get; init; }

    /// <summary>
    /// Endpoint being rate limited
    /// </summary>
    public string Endpoint { get; init; } = string.Empty;

    /// <summary>
    /// Number of requests in window
    /// </summary>
    public int RequestCount { get; init; }

    /// <summary>
    /// Limit that was exceeded
    /// </summary>
    public int Limit { get; init; }

    /// <summary>
    /// Time window in seconds
    /// </summary>
    public int WindowSeconds { get; init; }

    /// <summary>
    /// Whether this is a repeated violation
    /// </summary>
    public bool IsRepeatedViolation { get; init; }
}

// ============================================================================
// ENUMS
// ============================================================================

public enum SecurityEventSeverity
{
    Debug = 0,
    Info = 1,
    Warning = 2,
    Error = 3,
    Critical = 4
}

public enum AuthEventType
{
    LoginAttempt,
    LoginSuccess,
    LoginFailure,
    Logout,
    TokenRefresh,
    TokenRevoked,
    PasswordReset,
    PasswordChanged,
    MfaEnabled,
    MfaDisabled,
    MfaChallenge,
    MfaSuccess,
    MfaFailure,
    AccountLocked,
    AccountUnlocked,
    SessionExpired
}

public enum RegistrationEventType
{
    RegistrationStarted,
    RegistrationCompleted,
    RegistrationFailed,
    EmailVerificationSent,
    EmailVerified,
    EmailVerificationFailed,
    InvitationSent,
    InvitationAccepted,
    InvitationExpired,
    InvitationCancelled,
    AvailabilityCheck
}

public enum AuthzEventType
{
    AccessGranted,
    AccessDenied,
    PermissionChanged,
    RoleChanged,
    TenantAccess,
    CrossTenantAccessAttempt,
    AdminAction,
    ImpersonationStarted,
    ImpersonationEnded
}

public enum ThreatEventType
{
    BruteForceDetected,
    SuspiciousIpAddress,
    UnusualAccessPattern,
    CredentialStuffing,
    SessionHijackingAttempt,
    SqlInjectionAttempt,
    XssAttempt,
    CsrfAttempt,
    MaliciousPayload,
    GeoAnomalyDetected,
    MultipleFailedVerifications,
    SuspiciousRegistrationPattern,
    ApiAbuseDetected
}

public enum DataAccessEventType
{
    Read,
    Create,
    Update,
    Delete,
    Export,
    BulkAccess,
    SensitiveDataAccess,
    PiiAccess,
    ReportGenerated,
    AuditLogAccess
}
