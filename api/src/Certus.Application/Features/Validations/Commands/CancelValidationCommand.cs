using Certus.Application.Common.Behaviors;
using Certus.Application.Common.Models;
using FluentValidation;
using MediatR;

namespace Certus.Application.Features.Validations.Commands;

/// <summary>
/// Comando para cancelar una validación en progreso
/// </summary>
public record CancelValidationCommand : IRequest<Result>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid ValidationId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Validador del comando
/// </summary>
public class CancelValidationCommandValidator : AbstractValidator<CancelValidationCommand>
{
    public CancelValidationCommandValidator()
    {
        RuleFor(x => x.ValidationId)
            .NotEmpty()
            .WithMessage("El ID de validación es requerido");

        RuleFor(x => x.Reason)
            .NotEmpty()
            .WithMessage("La razón de cancelación es requerida")
            .MaximumLength(500)
            .WithMessage("La razón no puede exceder 500 caracteres");
    }
}
