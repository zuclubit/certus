using Certus.Domain.Common;

namespace Certus.Domain.Entities;

/// <summary>
/// Resultado de un validador específico
/// </summary>
public class ValidatorResult : BaseEntity
{
    public Guid ValidationId { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Group { get; private set; } = string.Empty;
    public string Status { get; private set; } = "pending"; // pending, running, passed, failed, warning
    public int Duration { get; private set; } = 0; // milliseconds
    public int ErrorCount { get; private set; } = 0;
    public int WarningCount { get; private set; } = 0;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    // Navigation
    public virtual Validation Validation { get; private set; } = null!;

    private ValidatorResult() { } // EF Core

    public static ValidatorResult Create(
        Guid validationId,
        string code,
        string name,
        string group)
    {
        return new ValidatorResult
        {
            ValidationId = validationId,
            Code = code,
            Name = name,
            Group = group,
            Status = "pending"
        };
    }

    public void Start()
    {
        Status = "running";
    }

    public void Complete(int errorCount, int warningCount, int durationMs)
    {
        ErrorCount = errorCount;
        WarningCount = warningCount;
        Duration = durationMs;

        if (errorCount > 0)
            Status = "failed";
        else if (warningCount > 0)
            Status = "warning";
        else
            Status = "passed";
    }
}
