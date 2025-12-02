using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Domain.ValueObjects;

namespace Certus.Domain.Services;

/// <summary>
/// Motor de ejecución de validaciones CONSAR
/// </summary>
public interface IValidationEngineService
{
    /// <summary>
    /// Ejecutar todas las validaciones para un archivo
    /// </summary>
    Task<ValidationExecutionResult> ExecuteAsync(
        ValidationExecutionRequest request,
        IProgress<ValidationExecutionProgress>? progress = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Ejecutar un validador específico
    /// </summary>
    Task<ValidatorExecutionOutput> ExecuteValidatorAsync(
        ValidatorRule validator,
        ValidationRecord record,
        ValidationExecutionContext context,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Evaluar una condición de validación
    /// </summary>
    bool EvaluateCondition(
        ValidatorConditionGroup conditionGroup,
        ValidationRecord record,
        ValidationExecutionContext context);
}

/// <summary>
/// Request para ejecución de validación
/// </summary>
public class ValidationExecutionRequest
{
    public Guid FileId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public FileType FileType { get; set; }
    public string Afore { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public List<ValidationRecord> Records { get; set; } = new();
    public Guid? PresetId { get; set; }
    public List<Guid>? ValidatorIds { get; set; } // Si es null, usa todos los aplicables
}

/// <summary>
/// Registro a validar
/// </summary>
public class ValidationRecord
{
    public int RecordIndex { get; set; }
    public int LineNumber { get; set; }
    public string RecordType { get; set; } = string.Empty;
    public ConsarRecordType RecordTypeEnum { get; set; } = ConsarRecordType.Detail;
    public Dictionary<string, object?> Fields { get; set; } = new();
    public string? RawData { get; set; }
    public string? RawLine { get; set; }

    public object? GetFieldValue(string fieldName)
    {
        return Fields.TryGetValue(fieldName, out var value) ? value : null;
    }

    public T? GetFieldValue<T>(string fieldName)
    {
        var value = GetFieldValue(fieldName);
        if (value == null) return default;

        try
        {
            if (value is T typedValue) return typedValue;
            return (T)Convert.ChangeType(value, typeof(T));
        }
        catch
        {
            return default;
        }
    }

    public void SetField(string fieldName, object? value)
    {
        Fields[fieldName] = value;
    }

    public bool HasField(string fieldName)
    {
        return Fields.ContainsKey(fieldName) && Fields[fieldName] != null;
    }

    public string GetFieldAsString(string fieldName)
    {
        return GetFieldValue(fieldName)?.ToString() ?? string.Empty;
    }

    public decimal GetFieldAsDecimal(string fieldName)
    {
        var value = GetFieldValue(fieldName);
        if (value == null) return 0;
        if (value is decimal d) return d;
        if (decimal.TryParse(value.ToString(), out var result)) return result;
        return 0;
    }

    public DateTime? GetFieldAsDate(string fieldName)
    {
        var value = GetFieldValue(fieldName);
        if (value == null) return null;
        if (value is DateTime dt) return dt;
        if (DateTime.TryParse(value.ToString(), out var result)) return result;
        return null;
    }
}

/// <summary>
/// CONSAR record types
/// </summary>
public enum ConsarRecordType
{
    Unknown = 0,
    Header = 1,    // Tipo 01 - Encabezado
    Detail = 2,    // Tipo 02 - Detalle
    Footer = 3,    // Tipo 03 - Sumario
    Control = 4    // Tipo 04 - Control
}

/// <summary>
/// Contexto de ejecución de validación
/// </summary>
public class ValidationExecutionContext
{
    public Guid FileId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public FileType FileType { get; set; }
    public string Afore { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public int TotalRecords { get; set; }
    public Dictionary<string, object> Variables { get; set; } = new();
    public Dictionary<string, List<object>> CatalogCache { get; set; } = new();
}

/// <summary>
/// Resultado de ejecución de validaciones
/// </summary>
public class ValidationExecutionResult
{
    public Guid FileId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public FileType FileType { get; set; }
    public int TotalRecords { get; set; }
    public int ValidatedRecords { get; set; }
    public int PassedRecords { get; set; }
    public int FailedRecords { get; set; }

    public ValidationResultsByLevel Results { get; set; } = new();

    public int TotalValidators { get; set; }
    public int ExecutedValidators { get; set; }
    public int FailedValidators { get; set; }
    public long TotalExecutionTimeMs { get; set; }

    public ValidationOverallStatus OverallStatus { get; set; } = ValidationOverallStatus.Passed;
    public bool IsCompliant { get; set; } = true;

    public DateTime ValidatedAt { get; set; } = DateTime.UtcNow;
    public Guid ValidatedBy { get; set; }
    public Guid? PresetId { get; set; }
}

/// <summary>
/// Resultados agrupados por nivel de criticidad
/// </summary>
public class ValidationResultsByLevel
{
    public List<ValidatorExecutionOutput> Critical { get; set; } = new();
    public List<ValidatorExecutionOutput> Errors { get; set; } = new();
    public List<ValidatorExecutionOutput> Warnings { get; set; } = new();
    public List<ValidatorExecutionOutput> Informational { get; set; } = new();
}

/// <summary>
/// Resultado de ejecución de un validador
/// </summary>
public class ValidatorExecutionOutput
{
    public Guid ValidatorId { get; set; }
    public string ValidatorCode { get; set; } = string.Empty;
    public string ValidatorName { get; set; } = string.Empty;
    public ValidatorExecutionStatus Status { get; set; }
    public ValidatorCriticality Criticality { get; set; }
    public string? Category { get; set; } // Grupo/categoría del validador (ej: "Grupo 1", "Estructura")
    public string Message { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Suggestion { get; set; }
    public long ExecutionTimeMs { get; set; }
    public ValidatorExecutionContextInfo Context { get; set; } = new();
}

/// <summary>
/// Información de contexto en resultado de validador
/// </summary>
public class ValidatorExecutionContextInfo
{
    public Guid FileId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public string Afore { get; set; } = string.Empty;
    public int? RecordIndex { get; set; }
    public int? LineNumber { get; set; }
    public string? Field { get; set; }
    public object? Value { get; set; }
    public object? ExpectedValue { get; set; }
}

/// <summary>
/// Estado de ejecución de validador
/// </summary>
public enum ValidatorExecutionStatus
{
    Passed,
    Failed,
    Skipped,
    Error
}

/// <summary>
/// Estado general de validación
/// </summary>
public enum ValidationOverallStatus
{
    Passed,
    Warning,
    Failed
}

/// <summary>
/// Progreso de ejecución de validación
/// </summary>
public class ValidationExecutionProgress
{
    public int PercentComplete { get; set; }
    public int RecordsProcessed { get; set; }
    public int TotalRecords { get; set; }
    public int ValidatorsExecuted { get; set; }
    public int TotalValidators { get; set; }
    public string CurrentValidator { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
