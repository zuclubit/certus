using System.Security.Cryptography;
using AutoMapper;
using Certus.Application.Common.Interfaces;
using Certus.Application.Common.Models;
using Certus.Application.DTOs;
using Certus.Domain.Entities;
using Certus.Domain.Interfaces;
using Certus.Domain.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Certus.Application.Features.Validations.Commands;

/// <summary>
/// Handler para subir archivo y crear validación
/// </summary>
public class UploadValidationCommandHandler : IRequestHandler<UploadValidationCommand, Result<ValidationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;
    private readonly ILogger<UploadValidationCommandHandler> _logger;

    public UploadValidationCommandHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorage,
        ICurrentUserService currentUserService,
        IMapper mapper,
        ILogger<UploadValidationCommandHandler> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _currentUserService = currentUserService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<ValidationDto>> Handle(
        UploadValidationCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.User.UserId;
        if (!userId.HasValue)
        {
            return Result.Failure<ValidationDto>("Usuario no autenticado", "UNAUTHORIZED");
        }

        try
        {
            // Calcular checksum del archivo
            string checksum;
            await using (var stream = request.File.OpenReadStream())
            {
                using var sha256 = SHA256.Create();
                var hash = await sha256.ComputeHashAsync(stream, cancellationToken);
                checksum = Convert.ToHexString(hash);
            }

            // Subir archivo al storage
            await using var uploadStream = request.File.OpenReadStream();
            var uploadResult = await _fileStorage.UploadAsync(
                uploadStream,
                request.File.FileName,
                request.File.ContentType ?? "application/octet-stream",
                request.TenantId,
                "validations",
                cancellationToken);

            if (!uploadResult.Success)
            {
                return Result.Failure<ValidationDto>(
                    uploadResult.Error ?? "Error al subir archivo",
                    "UPLOAD_FAILED");
            }

            // Crear entidad de validación
            var validation = Validation.Create(
                request.File.FileName,
                request.FileType,
                request.File.Length,
                uploadResult.FilePath,
                userId.Value,
                request.TenantId,
                request.File.ContentType,
                checksum);

            _context.Validations.Add(validation);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Validation created: {ValidationId} | File: {FileName} | User: {UserId}",
                validation.Id, request.File.FileName, userId);

            // Si AutoProcess está activo, iniciar procesamiento en background
            if (request.AutoProcess)
            {
                // TODO: Encolar job de procesamiento con Hangfire
                // BackgroundJob.Enqueue<IValidationProcessorJob>(j => j.ProcessAsync(validation.Id));
            }

            var dto = _mapper.Map<ValidationDto>(validation);
            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading validation file: {FileName}", request.File.FileName);
            return Result.Failure<ValidationDto>("Error interno al procesar el archivo", "INTERNAL_ERROR");
        }
    }
}
