using Certus.Application.Common.Behaviors;
using Certus.Application.Common.Models;
using Certus.Application.DTOs;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Certus.Application.Features.Validations.Commands;

/// <summary>
/// Comando para crear validación sustituta (Retransmisión CONSAR)
/// </summary>
public record CreateSubstituteValidationCommand : IRequest<Result<ValidationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid OriginalValidationId { get; set; }
    public IFormFile File { get; set; } = null!;
    public string SubstitutionReason { get; set; } = string.Empty;
    public bool AutoProcess { get; set; } = true;
}

/// <summary>
/// Validador del comando
/// </summary>
public class CreateSubstituteValidationCommandValidator : AbstractValidator<CreateSubstituteValidationCommand>
{
    private const long MaxFileSize = 100 * 1024 * 1024; // 100MB

    public CreateSubstituteValidationCommandValidator()
    {
        RuleFor(x => x.OriginalValidationId)
            .NotEmpty()
            .WithMessage("El ID de validación original es requerido");

        RuleFor(x => x.File)
            .NotNull()
            .WithMessage("El archivo es requerido");

        RuleFor(x => x.File.Length)
            .LessThanOrEqualTo(MaxFileSize)
            .When(x => x.File != null)
            .WithMessage($"El tamaño máximo de archivo es {MaxFileSize / 1024 / 1024}MB");

        RuleFor(x => x.SubstitutionReason)
            .NotEmpty()
            .WithMessage("La razón de sustitución es requerida")
            .MaximumLength(1000)
            .WithMessage("La razón no puede exceder 1000 caracteres");
    }
}
