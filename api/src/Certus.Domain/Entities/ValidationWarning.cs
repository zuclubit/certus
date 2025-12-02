using Certus.Domain.Common;

namespace Certus.Domain.Entities;

/// <summary>
/// Advertencia encontrada durante la validación CONSAR
/// </summary>
public class ValidationWarning : BaseEntity
{
    public Guid ValidationId { get; private set; }
    public string ValidatorCode { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public int Line { get; private set; }
    public int? Column { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    // Navigation
    public virtual Validation Validation { get; private set; } = null!;

    private ValidationWarning() { } // EF Core

    public static ValidationWarning Create(
        Guid validationId,
        string validatorCode,
        string message,
        int line,
        int? column = null)
    {
        return new ValidationWarning
        {
            ValidationId = validationId,
            ValidatorCode = validatorCode,
            Message = message,
            Line = line,
            Column = column
        };
    }
}
