using Certus.Domain.Entities;
using Certus.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Certus.Infrastructure.Data.Repositories;

/// <summary>
/// Implementación del repositorio de Logs de Auditoría
/// Optimized for .NET 8 with Clean Architecture (2025)
/// Compliance: CONSAR Circular 19-8 audit requirements
/// </summary>
public class AuditLogRepository : BaseRepository<AuditLog>, IAuditLogRepository
{
    public AuditLogRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<AuditLog>> GetByTenantAsync(
        Guid tenantId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(a => a.TenantId == tenantId);

        if (startDate.HasValue)
            query = query.Where(a => a.Timestamp >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(a => a.Timestamp <= endDate.Value);

        return await query
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuditLog>> GetByUserAsync(
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(a => a.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(a => a.Timestamp >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(a => a.Timestamp <= endDate.Value);

        return await query
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuditLog>> GetByEntityAsync(
        string entityType,
        Guid entityId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => a.EntityType == entityType && a.EntityId == entityId)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuditLog>> GetByActionAsync(
        string action,
        Guid? tenantId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(a => a.Action == action);

        if (tenantId.HasValue)
            query = query.Where(a => a.TenantId == tenantId.Value);
        if (startDate.HasValue)
            query = query.Where(a => a.Timestamp >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(a => a.Timestamp <= endDate.Value);

        return await query
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuditLog>> GetByCorrelationIdAsync(
        string correlationId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => a.CorrelationId == correlationId)
            .OrderBy(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuditLog>> GetByModuleAsync(
        string module,
        Guid? tenantId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(a => a.Module == module);

        if (tenantId.HasValue)
            query = query.Where(a => a.TenantId == tenantId.Value);
        if (startDate.HasValue)
            query = query.Where(a => a.Timestamp >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(a => a.Timestamp <= endDate.Value);

        return await query
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<PagedResult<AuditLog>> GetPagedAsync(
        Guid? tenantId,
        int page,
        int pageSize,
        string? action = null,
        string? entityType = null,
        Guid? userId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (tenantId.HasValue)
            query = query.Where(a => a.TenantId == tenantId.Value);
        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);
        if (!string.IsNullOrWhiteSpace(entityType))
            query = query.Where(a => a.EntityType == entityType);
        if (userId.HasValue)
            query = query.Where(a => a.UserId == userId.Value);
        if (startDate.HasValue)
            query = query.Where(a => a.Timestamp >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(a => a.Timestamp <= endDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<AuditLog>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<AuditStatistics> GetStatisticsAsync(
        Guid? tenantId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (tenantId.HasValue)
            query = query.Where(a => a.TenantId == tenantId.Value);
        if (startDate.HasValue)
            query = query.Where(a => a.Timestamp >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(a => a.Timestamp <= endDate.Value);

        var logs = await query.ToListAsync(cancellationToken);

        var stats = new AuditStatistics
        {
            TotalLogs = logs.Count,
            UniqueUsers = logs.Where(l => l.UserId.HasValue).Select(l => l.UserId!.Value).Distinct().Count(),
            UniqueSessions = logs.Where(l => !string.IsNullOrEmpty(l.SessionId)).Select(l => l.SessionId!).Distinct().Count(),

            ByAction = logs
                .GroupBy(l => l.Action)
                .ToDictionary(g => g.Key, g => g.Count()),

            ByEntityType = logs
                .Where(l => !string.IsNullOrEmpty(l.EntityType))
                .GroupBy(l => l.EntityType)
                .ToDictionary(g => g.Key, g => g.Count()),

            ByModule = logs
                .Where(l => !string.IsNullOrEmpty(l.Module))
                .GroupBy(l => l.Module!)
                .ToDictionary(g => g.Key, g => g.Count()),

            ByDay = logs
                .GroupBy(l => l.Timestamp.ToString("yyyy-MM-dd"))
                .ToDictionary(g => g.Key, g => g.Count()),

            ByHour = logs
                .GroupBy(l => l.Timestamp.ToString("HH"))
                .ToDictionary(g => g.Key, g => g.Count()),

            SuccessfulRequests = logs.Count(l => l.StatusCode.HasValue && l.StatusCode < 400),
            FailedRequests = logs.Count(l => l.StatusCode.HasValue && l.StatusCode >= 400),
            AverageResponseTimeMs = logs
                .Where(l => l.DurationMs.HasValue)
                .Select(l => (double)l.DurationMs!.Value)
                .DefaultIfEmpty(0)
                .Average()
        };

        return stats;
    }

    public async Task CleanupOldLogsAsync(
        int retentionDays,
        CancellationToken cancellationToken = default)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);

        // Use bulk delete for efficiency
        await DbSet
            .Where(a => a.Timestamp < cutoffDate)
            .ExecuteDeleteAsync(cancellationToken);
    }
}
