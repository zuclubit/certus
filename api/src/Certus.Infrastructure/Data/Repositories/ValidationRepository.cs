using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Certus.Infrastructure.Data.Repositories;

/// <summary>
/// Implementación del repositorio de Validaciones
/// </summary>
public class ValidationRepository : TenantRepository<Validation>, IValidationRepository
{
    public ValidationRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Validation?> GetByIdWithDetailsAsync(
        Guid id,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(v => v.UploadedBy)
            .Include(v => v.Errors)
            .Include(v => v.Warnings)
            .Include(v => v.ValidatorResults)
            .Include(v => v.Timeline)
            .FirstOrDefaultAsync(v => v.Id == id && v.TenantId == tenantId, cancellationToken);
    }

    public async Task<IReadOnlyList<Validation>> GetByStatusAsync(
        Guid tenantId,
        ValidationStatus status,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(v => v.TenantId == tenantId && v.Status == status)
            .OrderByDescending(v => v.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Validation>> GetByFileTypeAsync(
        Guid tenantId,
        FileType fileType,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(v => v.TenantId == tenantId && v.FileType == fileType)
            .OrderByDescending(v => v.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Validation>> GetByUserAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(v => v.TenantId == tenantId && v.UploadedById == userId)
            .OrderByDescending(v => v.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Validation>> GetByDateRangeAsync(
        Guid tenantId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(v => v.TenantId == tenantId &&
                        v.UploadedAt >= startDate &&
                        v.UploadedAt <= endDate)
            .OrderByDescending(v => v.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Validation>> GetRecentAsync(
        Guid tenantId,
        int count = 10,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(v => v.UploadedBy)
            .Where(v => v.TenantId == tenantId)
            .OrderByDescending(v => v.UploadedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Validation>> GetVersionHistoryAsync(
        Guid originalValidationId,
        CancellationToken cancellationToken = default)
    {
        var versions = new List<Validation>();

        // Buscar hacia atrás hasta encontrar el original
        var current = await GetByIdAsync(originalValidationId, cancellationToken);
        if (current == null) return versions;

        while (current?.ReplacesId != null)
        {
            current = await GetByIdAsync(current.ReplacesId.Value, cancellationToken);
        }

        // Ahora seguir hacia adelante
        while (current != null)
        {
            versions.Add(current);
            if (current.ReplacedById == null) break;
            current = await GetByIdAsync(current.ReplacedById.Value, cancellationToken);
        }

        return versions;
    }

    public async Task<Validation?> GetLatestVersionAsync(
        Guid originalValidationId,
        CancellationToken cancellationToken = default)
    {
        var versions = await GetVersionHistoryAsync(originalValidationId, cancellationToken);
        return versions.LastOrDefault();
    }

    public async Task<IReadOnlyList<Validation>> GetPendingAuthorizationAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(v => v.UploadedBy)
            .Where(v => v.TenantId == tenantId &&
                        v.RequiresAuthorization &&
                        v.AuthorizationStatus == "pending")
            .OrderBy(v => v.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<ValidationStatistics> GetStatisticsAsync(
        Guid tenantId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(v => v.TenantId == tenantId);

        if (startDate.HasValue)
            query = query.Where(v => v.UploadedAt >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(v => v.UploadedAt <= endDate.Value);

        var validations = await query.ToListAsync(cancellationToken);

        var stats = new ValidationStatistics
        {
            Total = validations.Count,
            Pending = validations.Count(v => v.Status == ValidationStatus.Pending),
            Processing = validations.Count(v => v.Status == ValidationStatus.Processing),
            Success = validations.Count(v => v.Status == ValidationStatus.Success),
            Warning = validations.Count(v => v.Status == ValidationStatus.Warning),
            Error = validations.Count(v => v.Status == ValidationStatus.Error),
            Cancelled = validations.Count(v => v.Status == ValidationStatus.Cancelled),
            TotalErrors = validations.Sum(v => v.ErrorCount),
            TotalWarnings = validations.Sum(v => v.WarningCount),
            TotalRecords = validations.Sum(v => v.RecordCount),
            ValidRecords = validations.Sum(v => v.ValidRecordCount)
        };

        stats.ByFileType = validations
            .GroupBy(v => v.FileType)
            .ToDictionary(g => g.Key, g => g.Count());

        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        stats.ByDay = validations
            .Where(v => v.UploadedAt >= thirtyDaysAgo)
            .GroupBy(v => v.UploadedAt.Date.ToString("yyyy-MM-dd"))
            .ToDictionary(g => g.Key, g => g.Count());

        return stats;
    }

    public async Task<PagedResult<Validation>> GetPagedAsync(
        Guid tenantId,
        int page,
        int pageSize,
        ValidationStatus? status = null,
        FileType? fileType = null,
        string? searchTerm = null,
        string? sortBy = null,
        bool sortDescending = true,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Include(v => v.UploadedBy)
            .Where(v => v.TenantId == tenantId);

        if (status.HasValue)
            query = query.Where(v => v.Status == status.Value);

        if (fileType.HasValue)
            query = query.Where(v => v.FileType == fileType.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(v =>
                v.FileName.ToLower().Contains(term) ||
                (v.UploadedBy != null && v.UploadedBy.FullName.ToLower().Contains(term)));
        }

        // Ordenamiento
        query = sortBy?.ToLower() switch
        {
            "filename" => sortDescending ? query.OrderByDescending(v => v.FileName) : query.OrderBy(v => v.FileName),
            "status" => sortDescending ? query.OrderByDescending(v => v.Status) : query.OrderBy(v => v.Status),
            "errorcount" => sortDescending ? query.OrderByDescending(v => v.ErrorCount) : query.OrderBy(v => v.ErrorCount),
            _ => sortDescending ? query.OrderByDescending(v => v.UploadedAt) : query.OrderBy(v => v.UploadedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Validation>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }
}
