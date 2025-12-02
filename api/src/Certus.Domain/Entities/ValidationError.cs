using Certus.Domain.Common;
using Certus.Domain.Enums;

namespace Certus.Domain.Entities;

/// <summary>
/// Error encontrado durante la validación CONSAR
/// </summary>
public class ValidationError : BaseEntity
{
    public Guid ValidationId { get; private set; }
    public string ValidatorCode { get; private set; } = string.Empty;
    public string ValidatorName { get; private set; } = string.Empty;
    public ErrorSeverity Severity { get; private set; }
    public string Message { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? Suggestion { get; private set; }
    public int Line { get; private set; }
    public int LineNumber => Line; // Compatibility alias
    public int? Column { get; private set; }
    public string? Field { get; private set; }
    public string? Value { get; private set; }
    public string? ExpectedValue { get; private set; }
    public string? Reference { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public bool IsVisible { get; private set; } = true;

    // Navigation
    public virtual Validation Validation { get; private set; } = null!;

    private ValidationError() { } // EF Core

    public static ValidationError Create(
        Guid validationId,
        string validatorCode,
        string validatorName,
        ErrorSeverity severity,
        string message,
        int line,
        string? description = null,
        string? suggestion = null,
        int? column = null,
        string? field = null,
        string? value = null,
        string? expectedValue = null,
        string? reference = null)
    {
        return new ValidationError
        {
            ValidationId = validationId,
            ValidatorCode = validatorCode,
            ValidatorName = validatorName,
            Severity = severity,
            Message = message,
            Line = line,
            Description = description,
            Suggestion = suggestion,
            Column = column,
            Field = field,
            Value = value,
            ExpectedValue = expectedValue,
            Reference = reference
        };
    }
}
