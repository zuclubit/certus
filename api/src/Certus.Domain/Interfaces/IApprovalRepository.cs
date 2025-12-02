using Certus.Domain.Entities;
using Certus.Domain.Enums;

namespace Certus.Domain.Interfaces;

/// <summary>
/// Repositorio específico para Aprobaciones
/// </summary>
public interface IApprovalRepository : ITenantRepository<Approval>
{
    Task<Approval?> GetByIdWithDetailsAsync(
        Guid id,
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<Approval?> GetByValidationIdAsync(
        Guid validationId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Approval>> GetPendingByApproverAsync(
        Guid approverId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Approval>> GetByStatusAsync(
        Guid tenantId,
        ApprovalStatus status,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Approval>> GetByLevelAsync(
        Guid tenantId,
        ApprovalLevel level,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Approval>> GetOverdueAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Approval>> GetAtRiskAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Approval>> GetByRequesterAsync(
        Guid requesterId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Approval>> GetEscalatedAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<ApprovalStatistics> GetStatisticsAsync(
        Guid tenantId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    Task<PagedResult<Approval>> GetPagedAsync(
        Guid tenantId,
        int page,
        int pageSize,
        ApprovalStatus? status = null,
        ApprovalLevel? level = null,
        Guid? approverId = null,
        string? searchTerm = null,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Estadísticas de aprobaciones
/// </summary>
public class ApprovalStatistics
{
    public int Total { get; set; }
    public int Pending { get; set; }
    public int InReview { get; set; }
    public int Approved { get; set; }
    public int Rejected { get; set; }
    public int Escalated { get; set; }
    public int Cancelled { get; set; }

    public int OnTime { get; set; }
    public int AtRisk { get; set; }
    public int Breached { get; set; }

    public double AverageResponseTimeMinutes { get; set; }
    public double ApprovalRate => Total > 0 ? (double)Approved / Total * 100 : 0;
    public double SlaComplianceRate => Total > 0 ? (double)OnTime / Total * 100 : 0;

    public Dictionary<ApprovalLevel, int> ByLevel { get; set; } = new();
    public Dictionary<string, int> ByDay { get; set; } = new();
}
