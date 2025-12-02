using Certus.Application.Common.Interfaces;
using Certus.Application.Common.Models;
using Certus.Domain.Enums;
using Certus.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Certus.Application.Features.Validations.Commands;

/// <summary>
/// Handler para cancelar validación
/// </summary>
public class CancelValidationCommandHandler : IRequestHandler<CancelValidationCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CancelValidationCommandHandler> _logger;

    public CancelValidationCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<CancelValidationCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(
        CancelValidationCommand request,
        CancellationToken cancellationToken)
    {
        var validation = await _context.Validations
            .FirstOrDefaultAsync(v =>
                v.Id == request.ValidationId &&
                v.TenantId == request.TenantId,
                cancellationToken);

        if (validation == null)
        {
            return Result.Failure("Validación no encontrada", "NOT_FOUND");
        }

        // Verificar que se puede cancelar (solo pending o processing)
        if (validation.Status != ValidationStatus.Pending &&
            validation.Status != ValidationStatus.Processing)
        {
            return Result.Failure(
                $"No se puede cancelar una validación en estado '{validation.Status}'",
                "INVALID_STATE");
        }

        validation.Cancel(request.Reason);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Validation cancelled: {ValidationId} | Reason: {Reason} | User: {UserId}",
            validation.Id, request.Reason, _currentUserService.User.UserId);

        return Result.Success();
    }
}
