using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Certus.Infrastructure.Data.Repositories;

/// <summary>
/// Implementación del repositorio de Aprobaciones
/// Optimized for .NET 8 with Clean Architecture (2025)
/// </summary>
public class ApprovalRepository : TenantRepository<Approval>, IApprovalRepository
{
    public ApprovalRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Approval?> GetByIdWithDetailsAsync(
        Guid id,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Validation)
            .Include(a => a.RequestedBy)
            .Include(a => a.Comments)
            .Include(a => a.History)
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId, cancellationToken);
    }

    public async Task<Approval?> GetByValidationIdAsync(
        Guid validationId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Validation)
            .Include(a => a.RequestedBy)
            .FirstOrDefaultAsync(a => a.ValidationId == validationId, cancellationToken);
    }

    public async Task<IReadOnlyList<Approval>> GetPendingByApproverAsync(
        Guid approverId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Validation)
            .Include(a => a.RequestedBy)
            .Where(a => a.AssignedToId == approverId &&
                       (a.Status == ApprovalStatus.Pending || a.Status == ApprovalStatus.InReview))
            .OrderByDescending(a => a.Priority)
            .ThenBy(a => a.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Approval>> GetByStatusAsync(
        Guid tenantId,
        ApprovalStatus status,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Validation)
            .Include(a => a.RequestedBy)
            .Where(a => a.TenantId == tenantId && a.Status == status)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Approval>> GetByLevelAsync(
        Guid tenantId,
        ApprovalLevel level,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Validation)
            .Where(a => a.TenantId == tenantId && a.Level == level)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Approval>> GetOverdueAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Include(a => a.Validation)
            .Include(a => a.RequestedBy)
            .Where(a => a.TenantId == tenantId &&
                       a.DueDate < now &&
                       (a.Status == ApprovalStatus.Pending || a.Status == ApprovalStatus.InReview))
            .OrderBy(a => a.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Approval>> GetAtRiskAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var warningThreshold = now.AddHours(24); // 24 hours before due

        return await DbSet
            .Include(a => a.Validation)
            .Include(a => a.RequestedBy)
            .Where(a => a.TenantId == tenantId &&
                       a.DueDate > now &&
                       a.DueDate <= warningThreshold &&
                       (a.Status == ApprovalStatus.Pending || a.Status == ApprovalStatus.InReview))
            .OrderBy(a => a.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Approval>> GetByRequesterAsync(
        Guid requesterId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Validation)
            .Where(a => a.RequestedById == requesterId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Approval>> GetEscalatedAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Validation)
            .Include(a => a.RequestedBy)
            .Where(a => a.TenantId == tenantId && a.Status == ApprovalStatus.Escalated)
            .OrderByDescending(a => a.EscalatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<ApprovalStatistics> GetStatisticsAsync(
        Guid tenantId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(a => a.TenantId == tenantId);

        if (startDate.HasValue)
            query = query.Where(a => a.CreatedAt >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(a => a.CreatedAt <= endDate.Value);

        var approvals = await query.ToListAsync(cancellationToken);
        var now = DateTime.UtcNow;

        var stats = new ApprovalStatistics
        {
            Total = approvals.Count,
            Pending = approvals.Count(a => a.Status == ApprovalStatus.Pending),
            InReview = approvals.Count(a => a.Status == ApprovalStatus.InReview),
            Approved = approvals.Count(a => a.Status == ApprovalStatus.Approved),
            Rejected = approvals.Count(a => a.Status == ApprovalStatus.Rejected),
            Escalated = approvals.Count(a => a.Status == ApprovalStatus.Escalated),
            Cancelled = approvals.Count(a => a.Status == ApprovalStatus.Cancelled),
            OnTime = approvals.Count(a => a.SlaStatus == SlaStatus.OnTime),
            AtRisk = approvals.Count(a => a.SlaStatus == SlaStatus.AtRisk),
            Breached = approvals.Count(a => a.SlaStatus == SlaStatus.Breached),
            AverageResponseTimeMinutes = approvals
                .Where(a => a.ResponseTimeMinutes.HasValue)
                .Select(a => (double)a.ResponseTimeMinutes!.Value)
                .DefaultIfEmpty(0)
                .Average(),
            ByLevel = approvals
                .GroupBy(a => a.Level)
                .ToDictionary(g => g.Key, g => g.Count()),
            ByDay = approvals
                .GroupBy(a => a.CreatedAt.ToString("yyyy-MM-dd"))
                .ToDictionary(g => g.Key, g => g.Count())
        };

        return stats;
    }

    public async Task<PagedResult<Approval>> GetPagedAsync(
        Guid tenantId,
        int page,
        int pageSize,
        ApprovalStatus? status = null,
        ApprovalLevel? level = null,
        Guid? approverId = null,
        string? searchTerm = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Include(a => a.Validation)
            .Include(a => a.RequestedBy)
            .Where(a => a.TenantId == tenantId);

        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

        if (level.HasValue)
            query = query.Where(a => a.Level == level.Value);

        if (approverId.HasValue)
            query = query.Where(a => a.AssignedToId == approverId.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(a =>
                a.Validation.FileName.ToLower().Contains(term) ||
                a.RequestedByName.ToLower().Contains(term) ||
                (a.RequestReason != null && a.RequestReason.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Approval>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }
}
