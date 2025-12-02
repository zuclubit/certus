using AutoMapper;
using Certus.Application.Common.Behaviors;
using Certus.Application.Common.Interfaces;
using Certus.Application.Common.Models;
using Certus.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Certus.Application.Features.Validations.Queries;

/// <summary>
/// Query para obtener validación por ID
/// </summary>
public record GetValidationByIdQuery : IRequest<Result<ValidationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid ValidationId { get; set; }
    public bool IncludeErrors { get; set; } = true;
    public bool IncludeWarnings { get; set; } = true;
    public bool IncludeValidatorResults { get; set; } = true;
    public bool IncludeTimeline { get; set; } = true;
}

/// <summary>
/// Handler para obtener validación por ID
/// </summary>
public class GetValidationByIdQueryHandler : IRequestHandler<GetValidationByIdQuery, Result<ValidationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetValidationByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<ValidationDto>> Handle(
        GetValidationByIdQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Validations
            .Include(v => v.UploadedBy)
            .Where(v => v.Id == request.ValidationId && v.TenantId == request.TenantId);

        if (request.IncludeErrors)
            query = query.Include(v => v.Errors);

        if (request.IncludeWarnings)
            query = query.Include(v => v.Warnings);

        if (request.IncludeValidatorResults)
            query = query.Include(v => v.ValidatorResults);

        if (request.IncludeTimeline)
            query = query.Include(v => v.Timeline);

        var validation = await query
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        if (validation == null)
        {
            return Result.Failure<ValidationDto>("Validación no encontrada", "NOT_FOUND");
        }

        var dto = _mapper.Map<ValidationDto>(validation);
        return Result.Success(dto);
    }
}
