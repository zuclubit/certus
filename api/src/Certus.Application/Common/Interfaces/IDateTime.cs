namespace Certus.Application.Common.Interfaces;

/// <summary>
/// Abstracción del tiempo para testing
/// </summary>
public interface IDateTime
{
    DateTime Now { get; }
    DateTime UtcNow { get; }
    DateOnly Today { get; }
}
