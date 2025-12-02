using Certus.Domain.Entities;
using Certus.Domain.Enums;

namespace Certus.Domain.Interfaces;

/// <summary>
/// Repositorio específico para Validaciones
/// </summary>
public interface IValidationRepository : ITenantRepository<Validation>
{
    Task<Validation?> GetByIdWithDetailsAsync(Guid id, Guid tenantId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Validation>> GetByStatusAsync(
        Guid tenantId,
        ValidationStatus status,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Validation>> GetByFileTypeAsync(
        Guid tenantId,
        FileType fileType,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Validation>> GetByUserAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Validation>> GetByDateRangeAsync(
        Guid tenantId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Validation>> GetRecentAsync(
        Guid tenantId,
        int count = 10,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Validation>> GetVersionHistoryAsync(
        Guid originalValidationId,
        CancellationToken cancellationToken = default);

    Task<Validation?> GetLatestVersionAsync(
        Guid originalValidationId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Validation>> GetPendingAuthorizationAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<ValidationStatistics> GetStatisticsAsync(
        Guid tenantId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    Task<PagedResult<Validation>> GetPagedAsync(
        Guid tenantId,
        int page,
        int pageSize,
        ValidationStatus? status = null,
        FileType? fileType = null,
        string? searchTerm = null,
        string? sortBy = null,
        bool sortDescending = true,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Estadísticas de validaciones
/// </summary>
public class ValidationStatistics
{
    public int Total { get; set; }
    public int Pending { get; set; }
    public int Processing { get; set; }
    public int Success { get; set; }
    public int Warning { get; set; }
    public int Error { get; set; }
    public int Cancelled { get; set; }

    public int TotalErrors { get; set; }
    public int TotalWarnings { get; set; }
    public long TotalRecords { get; set; }
    public long ValidRecords { get; set; }

    public double SuccessRate => Total > 0 ? (double)Success / Total * 100 : 0;
    public double ErrorRate => Total > 0 ? (double)Error / Total * 100 : 0;
    public double ValidationRate => TotalRecords > 0 ? (double)ValidRecords / TotalRecords * 100 : 0;

    public Dictionary<FileType, int> ByFileType { get; set; } = new();
    public Dictionary<string, int> ByDay { get; set; } = new();
}

/// <summary>
/// Resultado paginado genérico
/// </summary>
public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; set; } = Array.Empty<T>();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;
}
