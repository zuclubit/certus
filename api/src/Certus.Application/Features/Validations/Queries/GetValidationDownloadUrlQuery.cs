using Certus.Application.Common.Behaviors;
using Certus.Application.Common.Interfaces;
using Certus.Application.Common.Models;
using Certus.Domain.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Certus.Application.Features.Validations.Queries;

/// <summary>
/// Query para generar URL de descarga temporal del archivo de validación
/// </summary>
public record GetValidationDownloadUrlQuery : IRequest<Result<string>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid ValidationId { get; set; }
    public int ExpirationMinutes { get; set; } = 60;
}

/// <summary>
/// Handler para generar URL de descarga temporal
/// </summary>
public class GetValidationDownloadUrlQueryHandler : IRequestHandler<GetValidationDownloadUrlQuery, Result<string>>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _storageService;

    public GetValidationDownloadUrlQueryHandler(
        IApplicationDbContext context,
        IFileStorageService storageService)
    {
        _context = context;
        _storageService = storageService;
    }

    public async Task<Result<string>> Handle(
        GetValidationDownloadUrlQuery request,
        CancellationToken cancellationToken)
    {
        // Get validation to retrieve file path
        var validation = await _context.Validations
            .AsNoTracking()
            .Where(v => v.Id == request.ValidationId && v.TenantId == request.TenantId)
            .Select(v => new { v.FilePath })
            .FirstOrDefaultAsync(cancellationToken);

        if (validation == null)
        {
            return Result.Failure<string>("Validación no encontrada", "NOT_FOUND");
        }

        if (string.IsNullOrEmpty(validation.FilePath))
        {
            return Result.Failure<string>("Archivo no disponible", "FILE_NOT_FOUND");
        }

        try
        {
            // Generate temporary download URL
            var expiration = TimeSpan.FromMinutes(request.ExpirationMinutes);
            var url = await _storageService.GenerateDownloadUrlAsync(
                validation.FilePath,
                expiration,
                cancellationToken);

            return Result.Success(url);
        }
        catch (Exception ex)
        {
            return Result.Failure<string>($"Error al generar URL: {ex.Message}", "URL_GENERATION_ERROR");
        }
    }
}
