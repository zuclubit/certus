using Certus.Domain.Enums;

namespace Certus.Application.DTOs;

/// <summary>
/// DTO de validación completo
/// </summary>
public class ValidationDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? MimeType { get; set; }
    public string Status { get; set; } = string.Empty;

    // Métricas
    public int RecordCount { get; set; }
    public int ValidRecordCount { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
    public int Progress { get; set; }

    /// <summary>
    /// Total number of unique validators executed for this validation
    /// </summary>
    public int TotalValidatorsExecuted { get; set; }

    // Timestamps
    public DateTime UploadedAt { get; set; }
    public DateTime? ProcessingStartedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public DateTime? ValidatedAt { get; set; }

    // Versionado
    public int Version { get; set; }
    public bool IsOriginal { get; set; }
    public bool IsSubstitute { get; set; }
    public Guid? ReplacesId { get; set; }
    public Guid? ReplacedById { get; set; }
    public string? SubstitutionReason { get; set; }

    // CONSAR
    public string? ConsarDirectory { get; set; }
    public bool RequiresAuthorization { get; set; }
    public string? AuthorizationStatus { get; set; }

    // Usuario
    public Guid UploadedById { get; set; }
    public string? UploadedByName { get; set; }

    // Relaciones (opcionales según vista)
    public List<ValidationErrorDto>? Errors { get; set; }
    public List<ValidationWarningDto>? Warnings { get; set; }
    public List<ValidatorResultDto>? ValidatorResults { get; set; }
    public List<TimelineEventDto>? Timeline { get; set; }
}

/// <summary>
/// DTO de validación resumido para listas
/// Incluye todos los campos necesarios para mostrar información completa en la tabla
/// </summary>
public class ValidationSummaryDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string Status { get; set; } = string.Empty;

    // Métricas de registros (importante para operaciones)
    public int RecordCount { get; set; }
    public int ValidRecordCount { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
    public int Progress { get; set; }

    // Timestamps
    public DateTime UploadedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }

    // Versionado CONSAR
    public int Version { get; set; }
    public bool IsSubstitute { get; set; }
    public bool IsOriginal { get; set; }

    // Usuario (compatible con frontend - usa 'uploadedBy')
    public Guid UploadedById { get; set; }
    public string? UploadedBy { get; set; }
}

/// <summary>
/// DTO de error de validación
/// </summary>
public class ValidationErrorDto
{
    public Guid Id { get; set; }
    public string ValidatorCode { get; set; } = string.Empty;
    public string ValidatorName { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Suggestion { get; set; }
    public int Line { get; set; }
    public int? Column { get; set; }
    public string? Field { get; set; }
    public string? Value { get; set; }
    public string? ExpectedValue { get; set; }
    public string? Reference { get; set; }
}

/// <summary>
/// DTO de advertencia de validación
/// </summary>
public class ValidationWarningDto
{
    public Guid Id { get; set; }
    public string ValidatorCode { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int Line { get; set; }
    public int? Column { get; set; }
}

/// <summary>
/// DTO de resultado de validador
/// </summary>
public class ValidatorResultDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Duration { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
}

/// <summary>
/// DTO de evento de línea de tiempo
/// </summary>
public class TimelineEventDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? User { get; set; }
    public DateTime Timestamp { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// DTO de estadísticas de validaciones
/// </summary>
public class ValidationStatisticsDto
{
    public int Total { get; set; }
    public int Pending { get; set; }
    public int Processing { get; set; }
    public int Success { get; set; }
    public int Warning { get; set; }
    public int Error { get; set; }
    public int Cancelled { get; set; }

    public int TotalErrors { get; set; }
    public int TotalWarnings { get; set; }
    public long TotalRecords { get; set; }
    public long ValidRecords { get; set; }

    public double SuccessRate { get; set; }
    public double ErrorRate { get; set; }
    public double ValidationRate { get; set; }

    public Dictionary<string, int> ByFileType { get; set; } = new();
    public Dictionary<string, int> ByDay { get; set; } = new();
}
