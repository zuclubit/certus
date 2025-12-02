using Certus.Domain.Entities;

namespace Certus.Domain.Interfaces;

/// <summary>
/// Repositorio específico para Logs de Auditoría
/// </summary>
public interface IAuditLogRepository : IRepository<AuditLog>
{
    Task<IReadOnlyList<AuditLog>> GetByTenantAsync(
        Guid tenantId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuditLog>> GetByUserAsync(
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuditLog>> GetByEntityAsync(
        string entityType,
        Guid entityId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuditLog>> GetByActionAsync(
        string action,
        Guid? tenantId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuditLog>> GetByCorrelationIdAsync(
        string correlationId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuditLog>> GetByModuleAsync(
        string module,
        Guid? tenantId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    Task<PagedResult<AuditLog>> GetPagedAsync(
        Guid? tenantId,
        int page,
        int pageSize,
        string? action = null,
        string? entityType = null,
        Guid? userId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    Task<AuditStatistics> GetStatisticsAsync(
        Guid? tenantId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    Task CleanupOldLogsAsync(
        int retentionDays,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Estadísticas de auditoría
/// </summary>
public class AuditStatistics
{
    public int TotalLogs { get; set; }
    public int UniqueUsers { get; set; }
    public int UniqueSessions { get; set; }

    public Dictionary<string, int> ByAction { get; set; } = new();
    public Dictionary<string, int> ByEntityType { get; set; } = new();
    public Dictionary<string, int> ByModule { get; set; } = new();
    public Dictionary<string, int> ByDay { get; set; } = new();
    public Dictionary<string, int> ByHour { get; set; } = new();

    public int SuccessfulRequests { get; set; }
    public int FailedRequests { get; set; }
    public double AverageResponseTimeMs { get; set; }
}
