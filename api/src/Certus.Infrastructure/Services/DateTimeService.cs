using Certus.Application.Common.Interfaces;

namespace Certus.Infrastructure.Services;

/// <summary>
/// Implementación del servicio de fecha/hora
/// </summary>
public class DateTimeService : IDateTime
{
    public DateTime Now => DateTime.Now;
    public DateTime UtcNow => DateTime.UtcNow;
    public DateOnly Today => DateOnly.FromDateTime(DateTime.Now);
}
