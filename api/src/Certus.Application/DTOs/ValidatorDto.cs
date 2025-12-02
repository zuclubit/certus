using Certus.Domain.ValueObjects;

namespace Certus.Application.DTOs;

/// <summary>
/// DTO de regla de validación
/// </summary>
public class ValidatorRuleDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Criticality { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    public List<string> FileTypes { get; set; } = new();
    public List<string>? RecordTypes { get; set; }
    public List<string>? Afores { get; set; }

    public ValidatorConditionGroupDto ConditionGroup { get; set; } = new();
    public ValidatorActionDto Action { get; set; } = new();

    public string? Category { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? RegulatoryReference { get; set; }
    public List<ValidatorExampleDto>? Examples { get; set; }

    public bool IsEnabled { get; set; }
    public int RunOrder { get; set; }
    public bool StopOnFailure { get; set; }
    public int Version { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    // Estadísticas
    public long ExecutionCount { get; set; }
    public long PassCount { get; set; }
    public long FailCount { get; set; }
    public double AverageExecutionMs { get; set; }
}

/// <summary>
/// DTO resumido de validador para listas
/// </summary>
public class ValidatorRuleSummaryDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Criticality { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Category { get; set; }
    public List<string> FileTypes { get; set; } = new();
    public bool IsEnabled { get; set; }
    public long ExecutionCount { get; set; }
    public double SuccessRate { get; set; }
}

/// <summary>
/// DTO de grupo de condiciones
/// </summary>
public class ValidatorConditionGroupDto
{
    public string Id { get; set; } = string.Empty;
    public string Operator { get; set; } = "and";
    public List<ValidatorConditionItemDto> Conditions { get; set; } = new();
}

/// <summary>
/// DTO de item de condición
/// </summary>
public class ValidatorConditionItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = "condition";

    // Para condiciones simples
    public string? Field { get; set; }
    public string DataType { get; set; } = "string";
    public string Operator { get; set; } = "equals";
    public object? Value { get; set; }
    public object? ValueTo { get; set; }
    public string? ValueFrom { get; set; }
    public string? Message { get; set; }

    // Para grupos anidados
    public ValidatorConditionGroupDto? Group { get; set; }
}

/// <summary>
/// DTO de acción de validador
/// </summary>
public class ValidatorActionDto
{
    public string Type { get; set; } = "reject";
    public string Message { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// DTO de ejemplo de validador
/// </summary>
public class ValidatorExampleDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Dictionary<string, object> Input { get; set; } = new();
    public string ExpectedResult { get; set; } = "pass";
    public string? ExpectedMessage { get; set; }
}

/// <summary>
/// DTO de grupo de validadores
/// </summary>
public class ValidatorGroupDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int ValidatorCount { get; set; }
    public bool IsEnabled { get; set; }
}

/// <summary>
/// DTO de preset de validadores
/// </summary>
public class ValidatorPresetDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string FileType { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public bool IsEnabled { get; set; }
    public List<Guid> ValidatorIds { get; set; } = new();
    public int ValidatorCount { get; set; }
}

/// <summary>
/// DTO de reporte de validación
/// </summary>
public class ValidationReportDto
{
    public Guid FileId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public int TotalRecords { get; set; }
    public int ValidatedRecords { get; set; }
    public int PassedRecords { get; set; }
    public int FailedRecords { get; set; }

    public ValidationResultsDto Results { get; set; } = new();

    public int TotalValidators { get; set; }
    public int ExecutedValidators { get; set; }
    public int FailedValidators { get; set; }
    public long TotalExecutionTimeMs { get; set; }

    public string OverallStatus { get; set; } = string.Empty;
    public bool IsCompliant { get; set; }

    public DateTime ValidatedAt { get; set; }
    public string? ValidatedBy { get; set; }
    public Guid? PresetId { get; set; }
}

/// <summary>
/// DTO de resultados de validación agrupados
/// </summary>
public class ValidationResultsDto
{
    public List<ValidatorResultItemDto> Critical { get; set; } = new();
    public List<ValidatorResultItemDto> Errors { get; set; } = new();
    public List<ValidatorResultItemDto> Warnings { get; set; } = new();
    public List<ValidatorResultItemDto> Informational { get; set; } = new();
}

/// <summary>
/// DTO de resultado de validador individual
/// </summary>
public class ValidatorResultItemDto
{
    public Guid ValidatorId { get; set; }
    public string ValidatorCode { get; set; } = string.Empty;
    public string ValidatorName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Criticality { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public long ExecutionTimeMs { get; set; }
    public ValidatorResultContextDto Context { get; set; } = new();
}

/// <summary>
/// DTO de contexto de resultado
/// </summary>
public class ValidatorResultContextDto
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
/// DTO de métricas de validadores
/// </summary>
public class ValidatorMetricsDto
{
    public int TotalValidators { get; set; }
    public int ActiveValidators { get; set; }
    public long TotalExecutions { get; set; }
    public double OverallSuccessRate { get; set; }
    public double AverageExecutionMs { get; set; }

    public Dictionary<string, int> ByType { get; set; } = new();
    public Dictionary<string, int> ByCriticality { get; set; } = new();
    public Dictionary<string, int> ByStatus { get; set; } = new();

    public List<ValidatorPerformanceDto> TopPerformers { get; set; } = new();
    public List<ValidatorPerformanceDto> MostFailed { get; set; } = new();
}

/// <summary>
/// DTO de rendimiento de validador
/// </summary>
public class ValidatorPerformanceDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public long ExecutionCount { get; set; }
    public double SuccessRate { get; set; }
    public double AverageExecutionMs { get; set; }
}
