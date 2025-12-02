using Certus.Domain.Common;

namespace Certus.Domain.Entities;

/// <summary>
/// Registro de auditoría para cumplimiento CONSAR
/// </summary>
public class AuditLog : BaseEntity
{
    public Guid? TenantId { get; private set; }
    public Guid? UserId { get; private set; }
    public string Action { get; private set; } = string.Empty;
    public string EntityType { get; private set; } = string.Empty;
    public Guid? EntityId { get; private set; }
    public string? OldValues { get; private set; } // JSON
    public string? NewValues { get; private set; } // JSON
    public string? Changes { get; private set; } // JSON - campos modificados
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public string? RequestPath { get; private set; }
    public string? RequestMethod { get; private set; }
    public int? StatusCode { get; private set; }
    public long? DurationMs { get; private set; }
    public string? ErrorMessage { get; private set; }
    public string? CorrelationId { get; private set; }
    public DateTime Timestamp { get; private set; } = DateTime.UtcNow;

    // Información adicional para cumplimiento
    public string? SessionId { get; private set; }
    public string? Module { get; private set; }
    public string? SubModule { get; private set; }
    public string? Details { get; private set; }

    private AuditLog() { } // EF Core

    public static AuditLog Create(
        string action,
        string entityType,
        Guid? entityId = null,
        Guid? tenantId = null,
        Guid? userId = null,
        string? oldValues = null,
        string? newValues = null,
        string? changes = null,
        string? ipAddress = null,
        string? userAgent = null,
        string? requestPath = null,
        string? requestMethod = null,
        string? correlationId = null,
        string? module = null,
        string? subModule = null,
        string? details = null)
    {
        return new AuditLog
        {
            TenantId = tenantId,
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValues = oldValues,
            NewValues = newValues,
            Changes = changes,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            RequestPath = requestPath,
            RequestMethod = requestMethod,
            CorrelationId = correlationId,
            Module = module,
            SubModule = subModule,
            Details = details
        };
    }

    public void SetResponse(int statusCode, long durationMs, string? errorMessage = null)
    {
        StatusCode = statusCode;
        DurationMs = durationMs;
        ErrorMessage = errorMessage;
    }

    public void SetSession(string sessionId)
    {
        SessionId = sessionId;
    }
}

/// <summary>
/// Tipos de acciones de auditoría
/// </summary>
public static class AuditActions
{
    // Autenticación
    public const string Login = "LOGIN";
    public const string Logout = "LOGOUT";
    public const string LoginFailed = "LOGIN_FAILED";
    public const string PasswordChanged = "PASSWORD_CHANGED";
    public const string TokenRefreshed = "TOKEN_REFRESHED";

    // CRUD
    public const string Create = "CREATE";
    public const string Read = "READ";
    public const string Update = "UPDATE";
    public const string Delete = "DELETE";
    public const string SoftDelete = "SOFT_DELETE";
    public const string Restore = "RESTORE";

    // Validaciones
    public const string ValidationStarted = "VALIDATION_STARTED";
    public const string ValidationCompleted = "VALIDATION_COMPLETED";
    public const string ValidationFailed = "VALIDATION_FAILED";
    public const string ValidationCancelled = "VALIDATION_CANCELLED";

    // Archivos
    public const string FileUploaded = "FILE_UPLOADED";
    public const string FileDownloaded = "FILE_DOWNLOADED";
    public const string FileDeleted = "FILE_DELETED";
    public const string FileSubstituted = "FILE_SUBSTITUTED";

    // Aprobaciones
    public const string ApprovalRequested = "APPROVAL_REQUESTED";
    public const string ApprovalGranted = "APPROVAL_GRANTED";
    public const string ApprovalRejected = "APPROVAL_REJECTED";
    public const string ApprovalEscalated = "APPROVAL_ESCALATED";

    // Exportaciones
    public const string ExportGenerated = "EXPORT_GENERATED";
    public const string ReportGenerated = "REPORT_GENERATED";

    // Administración
    public const string UserCreated = "USER_CREATED";
    public const string UserUpdated = "USER_UPDATED";
    public const string UserDeactivated = "USER_DEACTIVATED";
    public const string RoleAssigned = "ROLE_ASSIGNED";
    public const string PermissionChanged = "PERMISSION_CHANGED";
}
