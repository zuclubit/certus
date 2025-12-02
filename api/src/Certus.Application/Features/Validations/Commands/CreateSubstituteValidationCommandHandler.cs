using System.Security.Cryptography;
using AutoMapper;
using Certus.Application.Common.Interfaces;
using Certus.Application.Common.Models;
using Certus.Application.DTOs;
using Certus.Domain.Entities;
using Certus.Domain.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Certus.Application.Features.Validations.Commands;

/// <summary>
/// Handler para crear validación sustituta (Retransmisión CONSAR)
/// </summary>
public class CreateSubstituteValidationCommandHandler
    : IRequestHandler<CreateSubstituteValidationCommand, Result<ValidationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateSubstituteValidationCommandHandler> _logger;

    public CreateSubstituteValidationCommandHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorage,
        ICurrentUserService currentUserService,
        IMapper mapper,
        ILogger<CreateSubstituteValidationCommandHandler> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _currentUserService = currentUserService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<ValidationDto>> Handle(
        CreateSubstituteValidationCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.User.UserId;
        if (!userId.HasValue)
        {
            return Result.Failure<ValidationDto>("Usuario no autenticado", "UNAUTHORIZED");
        }

        // Obtener validación original
        var original = await _context.Validations
            .FirstOrDefaultAsync(v =>
                v.Id == request.OriginalValidationId &&
                v.TenantId == request.TenantId,
                cancellationToken);

        if (original == null)
        {
            return Result.Failure<ValidationDto>("Validación original no encontrada", "NOT_FOUND");
        }

        // Verificar que la validación original puede ser sustituida
        if (original.ReplacedById.HasValue)
        {
            return Result.Failure<ValidationDto>(
                "Esta validación ya ha sido sustituida por otra versión",
                "ALREADY_SUPERSEDED");
        }

        try
        {
            // Calcular checksum
            string checksum;
            await using (var stream = request.File.OpenReadStream())
            {
                using var sha256 = SHA256.Create();
                var hash = await sha256.ComputeHashAsync(stream, cancellationToken);
                checksum = Convert.ToHexString(hash);
            }

            // Subir archivo
            await using var uploadStream = request.File.OpenReadStream();
            var uploadResult = await _fileStorage.UploadAsync(
                uploadStream,
                request.File.FileName,
                request.File.ContentType ?? "application/octet-stream",
                request.TenantId,
                "validations/retransmision",
                cancellationToken);

            if (!uploadResult.Success)
            {
                return Result.Failure<ValidationDto>(
                    uploadResult.Error ?? "Error al subir archivo",
                    "UPLOAD_FAILED");
            }

            // Crear validación sustituta
            var substitute = Validation.CreateSubstitute(
                original,
                request.File.FileName,
                request.File.Length,
                uploadResult.FilePath,
                request.SubstitutionReason,
                userId.Value,
                checksum);

            // Marcar original como sustituida
            original.MarkAsSuperseded(substitute.Id, _currentUserService.User.Name ?? "Sistema");

            _context.Validations.Add(substitute);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Substitute validation created: {SubstituteId} | Original: {OriginalId} | Version: {Version}",
                substitute.Id, original.Id, substitute.Version);

            var dto = _mapper.Map<ValidationDto>(substitute);
            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating substitute validation for: {OriginalId}", request.OriginalValidationId);
            return Result.Failure<ValidationDto>("Error interno al crear sustitución", "INTERNAL_ERROR");
        }
    }
}
