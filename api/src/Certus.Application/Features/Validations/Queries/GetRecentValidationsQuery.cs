using AutoMapper;
using Certus.Application.Common.Behaviors;
using Certus.Application.Common.Interfaces;
using Certus.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Certus.Application.Features.Validations.Queries;

/// <summary>
/// Query para obtener validaciones recientes
/// </summary>
public record GetRecentValidationsQuery : IRequest<IReadOnlyList<ValidationSummaryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Count { get; set; } = 10;
}

/// <summary>
/// Handler para obtener validaciones recientes
/// </summary>
public class GetRecentValidationsQueryHandler
    : IRequestHandler<GetRecentValidationsQuery, IReadOnlyList<ValidationSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetRecentValidationsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ValidationSummaryDto>> Handle(
        GetRecentValidationsQuery request,
        CancellationToken cancellationToken)
    {
        var validations = await _context.Validations
            .Include(v => v.UploadedBy)
            .Where(v => v.TenantId == request.TenantId && !v.IsDeleted)
            .OrderByDescending(v => v.UploadedAt)
            .Take(request.Count)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<ValidationSummaryDto>>(validations);
    }
}
