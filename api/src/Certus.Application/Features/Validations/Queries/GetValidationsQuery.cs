using AutoMapper;
using Certus.Application.Common.Behaviors;
using Certus.Application.Common.Interfaces;
using Certus.Application.Common.Models;
using Certus.Application.DTOs;
using Certus.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Certus.Application.Features.Validations.Queries;

/// <summary>
/// Query para obtener lista paginada de validaciones
/// </summary>
public record GetValidationsQuery : IRequest<PaginatedResult<ValidationSummaryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public ValidationStatus? Status { get; set; }
    public FileType? FileType { get; set; }
    public string? SearchTerm { get; set; }
    public string? SortBy { get; set; } = "UploadedAt";
    public bool SortDescending { get; set; } = true;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid? UploadedById { get; set; }
}

/// <summary>
/// Handler para obtener lista de validaciones
/// </summary>
public class GetValidationsQueryHandler
    : IRequestHandler<GetValidationsQuery, PaginatedResult<ValidationSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetValidationsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<ValidationSummaryDto>> Handle(
        GetValidationsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Validations
            .Include(v => v.UploadedBy)
            .Where(v => v.TenantId == request.TenantId && !v.IsDeleted);

        // Filtros
        if (request.Status.HasValue)
            query = query.Where(v => v.Status == request.Status.Value);

        if (request.FileType.HasValue)
            query = query.Where(v => v.FileType == request.FileType.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(v =>
                v.FileName.ToLower().Contains(term) ||
                (v.UploadedBy != null && v.UploadedBy.FullName.ToLower().Contains(term)));
        }

        if (request.StartDate.HasValue)
            query = query.Where(v => v.UploadedAt >= request.StartDate.Value);

        if (request.EndDate.HasValue)
            query = query.Where(v => v.UploadedAt <= request.EndDate.Value);

        if (request.UploadedById.HasValue)
            query = query.Where(v => v.UploadedById == request.UploadedById.Value);

        // Ordenamiento
        query = request.SortBy?.ToLower() switch
        {
            "filename" => request.SortDescending
                ? query.OrderByDescending(v => v.FileName)
                : query.OrderBy(v => v.FileName),
            "status" => request.SortDescending
                ? query.OrderByDescending(v => v.Status)
                : query.OrderBy(v => v.Status),
            "errorcount" => request.SortDescending
                ? query.OrderByDescending(v => v.ErrorCount)
                : query.OrderBy(v => v.ErrorCount),
            "filesize" => request.SortDescending
                ? query.OrderByDescending(v => v.FileSize)
                : query.OrderBy(v => v.FileSize),
            _ => request.SortDescending
                ? query.OrderByDescending(v => v.UploadedAt)
                : query.OrderBy(v => v.UploadedAt)
        };

        // Conteo total
        var totalCount = await query.CountAsync(cancellationToken);

        // Paginación
        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<ValidationSummaryDto>>(items);

        return PaginatedResult<ValidationSummaryDto>.Create(
            dtos,
            request.Page,
            request.PageSize,
            totalCount);
    }
}
