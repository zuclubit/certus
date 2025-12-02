using AutoMapper;
using Certus.Application.Common.Behaviors;
using Certus.Application.Common.Interfaces;
using Certus.Application.Common.Models;
using Certus.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Certus.Application.Features.Validations.Queries;

/// <summary>
/// Query para obtener historial de versiones de una validación
/// </summary>
public record GetVersionHistoryQuery : IRequest<Result<IReadOnlyList<ValidationSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid ValidationId { get; set; }
}

/// <summary>
/// Handler para obtener historial de versiones
/// </summary>
public class GetVersionHistoryQueryHandler
    : IRequestHandler<GetVersionHistoryQuery, Result<IReadOnlyList<ValidationSummaryDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetVersionHistoryQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<IReadOnlyList<ValidationSummaryDto>>> Handle(
        GetVersionHistoryQuery request,
        CancellationToken cancellationToken)
    {
        // Primero obtener la validación solicitada
        var validation = await _context.Validations
            .FirstOrDefaultAsync(v =>
                v.Id == request.ValidationId &&
                v.TenantId == request.TenantId,
                cancellationToken);

        if (validation == null)
        {
            return Result.Failure<IReadOnlyList<ValidationSummaryDto>>(
                "Validación no encontrada",
                "NOT_FOUND");
        }

        // Encontrar el ID original (raíz de la cadena de versiones)
        var originalId = validation.ReplacesId ?? validation.Id;

        // Buscar hasta llegar al original
        while (true)
        {
            var parent = await _context.Validations
                .FirstOrDefaultAsync(v => v.Id == originalId, cancellationToken);

            if (parent?.ReplacesId == null)
                break;

            originalId = parent.ReplacesId.Value;
        }

        // Obtener toda la cadena de versiones
        var versions = new List<Domain.Entities.Validation>();
        var currentId = (Guid?)originalId;

        while (currentId.HasValue)
        {
            var current = await _context.Validations
                .Include(v => v.UploadedBy)
                .FirstOrDefaultAsync(v => v.Id == currentId.Value, cancellationToken);

            if (current == null)
                break;

            versions.Add(current);
            currentId = current.ReplacedById;
        }

        var dtos = _mapper.Map<List<ValidationSummaryDto>>(versions);
        return Result.Success<IReadOnlyList<ValidationSummaryDto>>(dtos);
    }
}
