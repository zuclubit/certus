using Certus.Application.Common.Behaviors;
using Certus.Application.Common.Interfaces;
using Certus.Application.Common.Models;
using Certus.Domain.Enums;
using Certus.Domain.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;
using DomainValidationRecord = Certus.Domain.Services.ValidationRecord;

namespace Certus.Application.Features.Validations.Queries;

/// <summary>
/// Query para obtener registros parseados del archivo de validación
/// </summary>
public record GetValidationRecordsQuery : IRequest<Result<ValidationRecordsResult>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid ValidationId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 100;
    public bool IncludeRawLines { get; set; } = false;
}

/// <summary>
/// Resultado con registros parseados de la validación
/// </summary>
public class ValidationRecordsResult
{
    public Guid ValidationId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public int TotalRecords { get; set; }
    public int TotalLines { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
    public List<ValidationRecordDto> Records { get; set; } = new();
    public ValidationRecordDto? Header { get; set; }
    public ValidationRecordDto? Footer { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// DTO de registro individual parseado
/// </summary>
public class ValidationRecordDto
{
    public int LineNumber { get; set; }
    public string RecordType { get; set; } = string.Empty;
    public Dictionary<string, object?> Fields { get; set; } = new();
    public string? RawLine { get; set; }
    public bool IsValid { get; set; } = true;
    public List<string> Errors { get; set; } = new();
}

/// <summary>
/// Handler para obtener registros parseados
/// </summary>
public class GetValidationRecordsQueryHandler : IRequestHandler<GetValidationRecordsQuery, Result<ValidationRecordsResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _storageService;
    private readonly IFileValidationService _validationService;

    public GetValidationRecordsQueryHandler(
        IApplicationDbContext context,
        IFileStorageService storageService,
        IFileValidationService validationService)
    {
        _context = context;
        _storageService = storageService;
        _validationService = validationService;
    }

    public async Task<Result<ValidationRecordsResult>> Handle(
        GetValidationRecordsQuery request,
        CancellationToken cancellationToken)
    {
        // Get validation metadata
        var validation = await _context.Validations
            .AsNoTracking()
            .Where(v => v.Id == request.ValidationId && v.TenantId == request.TenantId)
            .Select(v => new { v.Id, v.FilePath, v.FileName, v.FileType, v.RecordCount })
            .FirstOrDefaultAsync(cancellationToken);

        if (validation == null)
        {
            return Result.Failure<ValidationRecordsResult>("Validación no encontrada", "NOT_FOUND");
        }

        if (string.IsNullOrEmpty(validation.FilePath))
        {
            return Result.Failure<ValidationRecordsResult>("Archivo no disponible", "FILE_NOT_FOUND");
        }

        // Download file from storage
        var downloadResult = await _storageService.DownloadAsync(validation.FilePath, cancellationToken);

        if (!downloadResult.Success || downloadResult.Stream == null)
        {
            return Result.Failure<ValidationRecordsResult>(
                downloadResult.Error ?? "Error al descargar archivo",
                "STORAGE_ERROR");
        }

        try
        {
            // Parse file to extract records
            var parseResult = await _validationService.ParseFileAsync(
                downloadResult.Stream,
                validation.FileType,
                cancellationToken);

            if (parseResult.IsFailure)
            {
                return Result.Failure<ValidationRecordsResult>(
                    parseResult.Error?.Message ?? "Error al parsear archivo",
                    "PARSE_ERROR");
            }

            var parsed = parseResult.Value!;

            // Calculate pagination
            var totalRecords = parsed.Records.Count;
            var totalPages = (int)Math.Ceiling(totalRecords / (double)request.PageSize);
            var skip = (request.Page - 1) * request.PageSize;

            // Get page of records
            var pageRecords = parsed.Records
                .Skip(skip)
                .Take(request.PageSize)
                .Select(r => MapToDto(r, request.IncludeRawLines))
                .ToList();

            var result = new ValidationRecordsResult
            {
                ValidationId = validation.Id,
                FileName = validation.FileName,
                FileType = validation.FileType.ToString(),
                TotalRecords = totalRecords,
                TotalLines = parsed.TotalLines,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = totalPages,
                HasNextPage = request.Page < totalPages,
                HasPreviousPage = request.Page > 1,
                Records = pageRecords,
                Header = parsed.HeaderRecord != null ? MapToDto(parsed.HeaderRecord, request.IncludeRawLines) : null,
                Footer = parsed.FooterRecord != null ? MapToDto(parsed.FooterRecord, request.IncludeRawLines) : null,
                Metadata = parsed.Metadata
            };

            return Result.Success(result);
        }
        finally
        {
            // Ensure stream is disposed
            if (downloadResult.Stream != null)
            {
                await downloadResult.Stream.DisposeAsync();
            }
        }
    }

    private static ValidationRecordDto MapToDto(DomainValidationRecord record, bool includeRawLine)
    {
        return new ValidationRecordDto
        {
            LineNumber = record.LineNumber,
            RecordType = record.RecordType,
            Fields = record.Fields.ToDictionary(f => f.Key, f => f.Value),
            RawLine = includeRawLine ? record.RawLine : null,
            IsValid = true, // Validation happens separately
            Errors = new()
        };
    }
}
