using Certus.Application.Common.Behaviors;
using Certus.Application.Common.Interfaces;
using Certus.Application.DTOs;
using Certus.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Certus.Application.Features.Validations.Queries;

/// <summary>
/// Query para obtener estadísticas de validaciones
/// </summary>
public record GetValidationStatisticsQuery : IRequest<ValidationStatisticsDto>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

/// <summary>
/// Handler para obtener estadísticas
/// </summary>
public class GetValidationStatisticsQueryHandler
    : IRequestHandler<GetValidationStatisticsQuery, ValidationStatisticsDto>
{
    private readonly IApplicationDbContext _context;

    public GetValidationStatisticsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ValidationStatisticsDto> Handle(
        GetValidationStatisticsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Validations
            .Where(v => v.TenantId == request.TenantId && !v.IsDeleted);

        if (request.StartDate.HasValue)
            query = query.Where(v => v.UploadedAt >= request.StartDate.Value);

        if (request.EndDate.HasValue)
            query = query.Where(v => v.UploadedAt <= request.EndDate.Value);

        var validations = await query
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var stats = new ValidationStatisticsDto
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

        // Calcular tasas
        stats.SuccessRate = stats.Total > 0 ? (double)stats.Success / stats.Total * 100 : 0;
        stats.ErrorRate = stats.Total > 0 ? (double)stats.Error / stats.Total * 100 : 0;
        stats.ValidationRate = stats.TotalRecords > 0 ? (double)stats.ValidRecords / stats.TotalRecords * 100 : 0;

        // Agrupar por tipo de archivo
        stats.ByFileType = validations
            .GroupBy(v => v.FileType.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        // Agrupar por día (últimos 30 días)
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        stats.ByDay = validations
            .Where(v => v.UploadedAt >= thirtyDaysAgo)
            .GroupBy(v => v.UploadedAt.Date.ToString("yyyy-MM-dd"))
            .ToDictionary(g => g.Key, g => g.Count());

        return stats;
    }
}
