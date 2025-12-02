using Certus.Domain.Common;
using Certus.Domain.Entities;
using Certus.Domain.Enums;

namespace Certus.Domain.Services;

/// <summary>
/// Servicio de validación de archivos CONSAR
/// </summary>
public interface IFileValidationService
{
    /// <summary>
    /// Parse file and extract records for validation
    /// </summary>
    Task<Result<FileParseResult>> ParseFileAsync(
        Stream fileStream,
        FileType fileType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validar estructura del archivo
    /// </summary>
    Task<FileValidationResult> ValidateStructureAsync(
        Stream fileStream,
        FileType fileType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validar contenido del archivo según reglas CONSAR
    /// </summary>
    Task<FileValidationResult> ValidateContentAsync(
        Stream fileStream,
        FileType fileType,
        IReadOnlyDictionary<string, object>? options = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validación completa del archivo
    /// </summary>
    Task<FileValidationResult> ValidateAsync(
        Stream fileStream,
        FileType fileType,
        IReadOnlyDictionary<string, object>? options = null,
        IProgress<ValidationProgress>? progress = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtener validadores disponibles para un tipo de archivo
    /// </summary>
    IReadOnlyList<ValidatorInfo> GetValidators(FileType fileType);
}

/// <summary>
/// Result of parsing a file
/// </summary>
public class FileParseResult
{
    public FileType FileType { get; set; }
    public int TotalRecords { get; set; }
    public int TotalLines { get; set; }
    public bool IsValid { get; set; }
    public List<ValidationRecord> Records { get; set; } = new();
    public List<FileParseError> ParseErrors { get; set; } = new();
    public ValidationRecord? HeaderRecord { get; set; }
    public ValidationRecord? FooterRecord { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Parse error for a specific line
/// </summary>
public class FileParseError
{
    public int LineNumber { get; set; }
    public string ErrorCode { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? RawLine { get; set; }
}

/// <summary>
/// Resultado de validación de archivo
/// </summary>
public class FileValidationResult
{
    public bool IsValid => Errors.Count == 0;
    public bool HasWarnings => Warnings.Count > 0;
    public int RecordCount { get; set; }
    public int ValidRecordCount { get; set; }
    public List<FileValidationError> Errors { get; set; } = new();
    public List<FileValidationWarning> Warnings { get; set; } = new();
    public List<ValidatorExecutionResult> ValidatorResults { get; set; } = new();
    public TimeSpan Duration { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Error de validación de archivo
/// </summary>
public class FileValidationError
{
    public string ValidatorCode { get; set; } = string.Empty;
    public string ValidatorName { get; set; } = string.Empty;
    public ErrorSeverity Severity { get; set; }
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
/// Advertencia de validación de archivo
/// </summary>
public class FileValidationWarning
{
    public string ValidatorCode { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int Line { get; set; }
    public int? Column { get; set; }
}

/// <summary>
/// Resultado de ejecución de validador
/// </summary>
public class ValidatorExecutionResult
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public int Duration { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
}

/// <summary>
/// Información de validador
/// </summary>
public class ValidatorInfo
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsRequired { get; set; } = true;
    public IReadOnlyList<FileType> SupportedFileTypes { get; set; } = Array.Empty<FileType>();
}

/// <summary>
/// Progreso de validación
/// </summary>
public class ValidationProgress
{
    public int PercentComplete { get; set; }
    public int RecordsProcessed { get; set; }
    public int TotalRecords { get; set; }
    public string CurrentValidator { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
