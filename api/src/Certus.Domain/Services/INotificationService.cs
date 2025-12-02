namespace Certus.Domain.Services;

/// <summary>
/// Servicio de notificaciones
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Enviar notificación a usuario
    /// </summary>
    Task SendToUserAsync(
        Guid userId,
        Notification notification,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Enviar notificación a múltiples usuarios
    /// </summary>
    Task SendToUsersAsync(
        IEnumerable<Guid> userIds,
        Notification notification,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Enviar notificación a rol
    /// </summary>
    Task SendToRoleAsync(
        Guid tenantId,
        string role,
        Notification notification,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Enviar notificación a tenant
    /// </summary>
    Task SendToTenantAsync(
        Guid tenantId,
        Notification notification,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Enviar email
    /// </summary>
    Task SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        IEnumerable<EmailAttachment>? attachments = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Enviar email a múltiples destinatarios
    /// </summary>
    Task SendEmailAsync(
        IEnumerable<string> to,
        string subject,
        string body,
        bool isHtml = true,
        IEnumerable<string>? cc = null,
        IEnumerable<string>? bcc = null,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Notificación
/// </summary>
public class Notification
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public string? ActionUrl { get; set; }
    public string? ActionLabel { get; set; }
    public Dictionary<string, object> Data { get; set; } = new();
    public DateTime? ExpiresAt { get; set; }

    public static Notification Create(string type, string title, string message)
    {
        return new Notification
        {
            Type = type,
            Title = title,
            Message = message
        };
    }

    public Notification WithPriority(NotificationPriority priority)
    {
        Priority = priority;
        return this;
    }

    public Notification WithAction(string url, string label)
    {
        ActionUrl = url;
        ActionLabel = label;
        return this;
    }

    public Notification WithData(string key, object value)
    {
        Data[key] = value;
        return this;
    }
}

/// <summary>
/// Prioridad de notificación
/// </summary>
public enum NotificationPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}

/// <summary>
/// Adjunto de email
/// </summary>
public class EmailAttachment
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public byte[] Content { get; set; } = Array.Empty<byte>();
}

/// <summary>
/// Tipos de notificación predefinidos
/// </summary>
public static class NotificationTypes
{
    // Validaciones
    public const string ValidationStarted = "validation.started";
    public const string ValidationCompleted = "validation.completed";
    public const string ValidationFailed = "validation.failed";
    public const string ValidationCancelled = "validation.cancelled";

    // Aprobaciones
    public const string ApprovalRequired = "approval.required";
    public const string ApprovalGranted = "approval.granted";
    public const string ApprovalRejected = "approval.rejected";
    public const string ApprovalEscalated = "approval.escalated";
    public const string ApprovalOverdue = "approval.overdue";
    public const string ApprovalAtRisk = "approval.at_risk";

    // Sistema
    public const string SystemAlert = "system.alert";
    public const string SystemMaintenance = "system.maintenance";

    // Usuario
    public const string UserWelcome = "user.welcome";
    public const string UserPasswordReset = "user.password_reset";
    public const string UserAccountLocked = "user.account_locked";
}
