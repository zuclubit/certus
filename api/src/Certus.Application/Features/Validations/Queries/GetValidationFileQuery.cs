using Certus.Application.Common.Behaviors;
using Certus.Application.Common.Interfaces;
using Certus.Application.Common.Models;
using Certus.Domain.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Certus.Application.Features.Validations.Queries;

/// <summary>
/// Query para descargar archivo de validación desde Azure Blob Storage
/// </summary>
public record GetValidationFileQuery : IRequest<Result<ValidationFileResult>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid ValidationId { get; set; }
}

/// <summary>
/// Resultado de descarga de archivo de validación
/// </summary>
public class ValidationFileResult
{
    public Stream Stream { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
    public long FileSize { get; set; }
}

/// <summary>
/// Handler para descargar archivo de validación
/// </summary>
public class GetValidationFileQueryHandler : IRequestHandler<GetValidationFileQuery, Result<ValidationFileResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _storageService;

    public GetValidationFileQueryHandler(
        IApplicationDbContext context,
        IFileStorageService storageService)
    {
        _context = context;
        _storageService = storageService;
    }

    public async Task<Result<ValidationFileResult>> Handle(
        GetValidationFileQuery request,
        CancellationToken cancellationToken)
    {
        // Get validation to retrieve file path
        var validation = await _context.Validations
            .AsNoTracking()
            .Where(v => v.Id == request.ValidationId && v.TenantId == request.TenantId)
            .Select(v => new { v.FilePath, v.FileName, v.MimeType, v.FileSize })
            .FirstOrDefaultAsync(cancellationToken);

        if (validation == null)
        {
            return Result.Failure<ValidationFileResult>("Validación no encontrada", "NOT_FOUND");
        }

        if (string.IsNullOrEmpty(validation.FilePath))
        {
            return Result.Failure<ValidationFileResult>("Archivo no disponible", "FILE_NOT_FOUND");
        }

        // Download file from storage
        var downloadResult = await _storageService.DownloadAsync(validation.FilePath, cancellationToken);

        if (!downloadResult.Success || downloadResult.Stream == null)
        {
            return Result.Failure<ValidationFileResult>(
                downloadResult.Error ?? "Error al descargar archivo",
                "STORAGE_ERROR");
        }

        return Result.Success(new ValidationFileResult
        {
            Stream = downloadResult.Stream,
            FileName = validation.FileName,
            ContentType = validation.MimeType ?? "application/octet-stream",
            FileSize = validation.FileSize
        });
    }
}
