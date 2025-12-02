using Certus.Application.Common.Behaviors;
using Certus.Application.Common.Models;
using Certus.Application.DTOs;
using Certus.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Certus.Application.Features.Validations.Commands;

/// <summary>
/// Comando para subir archivo y crear validación
/// </summary>
public record UploadValidationCommand : IRequest<Result<ValidationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public IFormFile File { get; set; } = null!;
    public FileType FileType { get; set; }
    public bool AutoProcess { get; set; } = true;
}

/// <summary>
/// Validador del comando
/// </summary>
public class UploadValidationCommandValidator : AbstractValidator<UploadValidationCommand>
{
    private const long MaxFileSize = 100 * 1024 * 1024; // 100MB
    // CONSAR files use numeric extensions: .0300, .0301, .0302, .0303, .0304, .0305, .0306, .0310, .0314, .0315, .0320, .0400, .0500
    private static readonly string[] AllowedExtensions = {
        ".txt", ".csv", ".dat", ".xml",
        // CONSAR Circular 19-8 file extensions
        ".0100", ".0200",  // Nomina, Contable
        ".0300", ".0301", ".0302", ".0303", ".0304", ".0305", ".0306",  // Cartera SIEFORE
        ".0310", ".0314", ".0315", ".0316", ".0317", ".0320", ".0321",  // Derivados, VaR, Confirmaciones, Control Cartera, BMRPREV
        ".0400", ".0500", ".0600", ".0700",  // Estados Financieros, Info Afiliados, Traspasos, Aportaciones
        ".1101"  // Totales/Conciliación
    };
    private static readonly string[] AllowedMimeTypes =
    {
        "text/plain",
        "text/csv",
        "application/xml",
        "text/xml",
        "application/octet-stream"
    };

    public UploadValidationCommandValidator()
    {
        RuleFor(x => x.File)
            .NotNull()
            .WithMessage("El archivo es requerido");

        RuleFor(x => x.File.Length)
            .LessThanOrEqualTo(MaxFileSize)
            .When(x => x.File != null)
            .WithMessage($"El tamaño máximo de archivo es {MaxFileSize / 1024 / 1024}MB");

        RuleFor(x => x.File.FileName)
            .Must(HaveValidExtension)
            .When(x => x.File != null)
            .WithMessage($"Extensiones permitidas: {string.Join(", ", AllowedExtensions)}");

        RuleFor(x => x.FileType)
            .IsInEnum()
            .WithMessage("Tipo de archivo inválido");
    }

    private static bool HaveValidExtension(string fileName)
    {
        if (string.IsNullOrEmpty(fileName)) return false;
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return AllowedExtensions.Contains(extension);
    }
}
