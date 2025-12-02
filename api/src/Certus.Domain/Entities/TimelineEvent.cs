using Certus.Domain.Common;

namespace Certus.Domain.Entities;

/// <summary>
/// Evento en la línea de tiempo de una validación
/// </summary>
public class TimelineEvent : BaseEntity
{
    public Guid ValidationId { get; private set; }
    public string Type { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public string? User { get; private set; }
    public string? Metadata { get; private set; } // JSON
    public DateTime Timestamp { get; private set; } = DateTime.UtcNow;

    // Navigation
    public virtual Validation Validation { get; private set; } = null!;

    private TimelineEvent() { } // EF Core

    public static TimelineEvent Create(
        Guid validationId,
        string type,
        string message,
        string? user = null,
        string? metadata = null)
    {
        return new TimelineEvent
        {
            ValidationId = validationId,
            Type = type,
            Message = message,
            User = user,
            Metadata = metadata
        };
    }
}
