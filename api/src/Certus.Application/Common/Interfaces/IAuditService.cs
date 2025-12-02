namespace Certus.Application.Common.Interfaces;

/// <summary>
/// Interface para el servicio de auditoría
/// Proporciona logging de eventos de negocio para compliance y trazabilidad
/// </summary>
public interface IAuditService
{
    /// <summary>
    /// Registra un evento de auditoría
    /// </summary>
    /// <param name="action">Acción realizada (ej: "User.Created", "Validation.Approved")</param>
    /// <param name="entityId">ID de la entidad afectada</param>
    /// <param name="entityType">Tipo de entidad (ej: "User", "Validation")</param>
    /// <param name="data">Datos adicionales del evento</param>
    /// <param name="userId">ID del usuario que realizó la acción</param>
    /// <param name="cancellationToken">Token de cancelación</param>
    /// <returns>ID del registro de auditoría creado</returns>
    Task<Guid> LogAsync(
        string action,
        string entityId,
        string entityType,
        Dictionary<string, object>? data = null,
        string? userId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Registra un evento de auditoría con información de tenant
    /// </summary>
    /// <param name="action">Acción realizada</param>
    /// <param name="entityId">ID de la entidad</param>
    /// <param name="entityType">Tipo de entidad</param>
    /// <param name="tenantId">ID del tenant</param>
    /// <param name="data">Datos adicionales</param>
    /// <param name="userId">ID del usuario</param>
    /// <param name="cancellationToken">Token de cancelación</param>
    /// <returns>ID del registro de auditoría</returns>
    Task<Guid> LogForTenantAsync(
        string action,
        string entityId,
        string entityType,
        Guid tenantId,
        Dictionary<string, object>? data = null,
        string? userId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Registra un evento de error
    /// </summary>
    /// <param name="action">Acción que falló</param>
    /// <param name="entityId">ID de la entidad relacionada</param>
    /// <param name="entityType">Tipo de entidad</param>
    /// <param name="errorMessage">Mensaje de error</param>
    /// <param name="exception">Excepción (opcional)</param>
    /// <param name="cancellationToken">Token de cancelación</param>
    /// <returns>ID del registro de auditoría</returns>
    Task<Guid> LogErrorAsync(
        string action,
        string entityId,
        string entityType,
        string errorMessage,
        Exception? exception = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Registra un evento de acceso a datos sensibles
    /// </summary>
    /// <param name="resourceType">Tipo de recurso accedido</param>
    /// <param name="resourceId">ID del recurso</param>
    /// <param name="accessType">Tipo de acceso (Read, Write, Delete)</param>
    /// <param name="userId">ID del usuario</param>
    /// <param name="ipAddress">Dirección IP del cliente</param>
    /// <param name="cancellationToken">Token de cancelación</param>
    /// <returns>ID del registro de auditoría</returns>
    Task<Guid> LogDataAccessAsync(
        string resourceType,
        string resourceId,
        string accessType,
        string? userId = null,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtiene los eventos de auditoría para una entidad específica
    /// </summary>
    /// <param name="entityId">ID de la entidad</param>
    /// <param name="entityType">Tipo de entidad</param>
    /// <param name="take">Número máximo de registros</param>
    /// <param name="cancellationToken">Token de cancelación</param>
    /// <returns>Lista de eventos de auditoría</returns>
    Task<IReadOnlyList<AuditEvent>> GetAuditTrailAsync(
        string entityId,
        string entityType,
        int take = 50,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Evento de auditoría
/// </summary>
public sealed record AuditEvent
{
    public Guid Id { get; init; }
    public string Action { get; init; } = string.Empty;
    public string EntityId { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
    public Guid? TenantId { get; init; }
    public string? UserId { get; init; }
    public string? UserEmail { get; init; }
    public string? UserName { get; init; }
    public DateTime Timestamp { get; init; }
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
    public Dictionary<string, object>? Data { get; init; }
    public string? ErrorMessage { get; init; }
    public bool IsError { get; init; }
}
