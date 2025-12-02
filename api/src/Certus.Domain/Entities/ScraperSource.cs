using Certus.Domain.Common;
using Certus.Domain.Enums;

namespace Certus.Domain.Entities;

/// <summary>
/// Fuente de scraping para cambios normativos CONSAR
/// Configura las fuentes de datos desde donde se extraen circulares y disposiciones
/// </summary>
public class ScraperSource : SoftDeletableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public ScraperSourceType SourceType { get; private set; }
    public string BaseUrl { get; private set; } = string.Empty;
    public string? EndpointPath { get; private set; }
    public ScraperFrequency Frequency { get; private set; } = ScraperFrequency.Daily;
    public bool IsEnabled { get; private set; } = true;
    public string? Configuration { get; private set; } // JSON config para selectores CSS, XPath, etc.
    public DateTime? LastExecutionAt { get; private set; }
    public DateTime? NextScheduledAt { get; private set; }
    public int ConsecutiveFailures { get; private set; }
    public int TotalExecutions { get; private set; }
    public int TotalDocumentsFound { get; private set; }
    public string? LastError { get; private set; }

    // Navigation properties
    public virtual ICollection<ScraperExecution> Executions { get; private set; } = new List<ScraperExecution>();

    private ScraperSource() { } // EF Core

    public static ScraperSource Create(
        string name,
        string description,
        ScraperSourceType sourceType,
        string baseUrl,
        ScraperFrequency frequency)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required", nameof(name));

        if (string.IsNullOrWhiteSpace(baseUrl))
            throw new ArgumentException("Base URL is required", nameof(baseUrl));

        var source = new ScraperSource
        {
            Name = name,
            Description = description,
            SourceType = sourceType,
            BaseUrl = baseUrl.TrimEnd('/'),
            Frequency = frequency,
            IsEnabled = true,
            NextScheduledAt = CalculateNextExecution(frequency)
        };

        return source;
    }

    public void SetEndpoint(string endpointPath)
    {
        EndpointPath = endpointPath?.TrimStart('/');
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetConfiguration(string jsonConfig)
    {
        Configuration = jsonConfig;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Enable()
    {
        IsEnabled = true;
        NextScheduledAt = CalculateNextExecution(Frequency);
        UpdatedAt = DateTime.UtcNow;
    }

    public void Disable()
    {
        IsEnabled = false;
        NextScheduledAt = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateFrequency(ScraperFrequency frequency)
    {
        Frequency = frequency;
        if (IsEnabled)
        {
            NextScheduledAt = CalculateNextExecution(frequency);
        }
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordExecutionStart()
    {
        LastExecutionAt = DateTime.UtcNow;
        TotalExecutions++;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordExecutionSuccess(int documentsFound)
    {
        ConsecutiveFailures = 0;
        TotalDocumentsFound += documentsFound;
        LastError = null;
        NextScheduledAt = CalculateNextExecution(Frequency);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordExecutionFailure(string error)
    {
        ConsecutiveFailures++;
        LastError = error;

        // Backoff exponencial después de múltiples fallos
        if (ConsecutiveFailures >= 5)
        {
            // Deshabilitar temporalmente después de 5 fallos consecutivos
            IsEnabled = false;
            NextScheduledAt = null;
        }
        else
        {
            // Incrementar tiempo de espera exponencialmente
            var backoffMinutes = Math.Pow(2, ConsecutiveFailures) * 15; // 15, 30, 60, 120, 240 mins
            NextScheduledAt = DateTime.UtcNow.AddMinutes(backoffMinutes);
        }

        UpdatedAt = DateTime.UtcNow;
    }

    public void ResetFailures()
    {
        ConsecutiveFailures = 0;
        LastError = null;
        IsEnabled = true;
        NextScheduledAt = CalculateNextExecution(Frequency);
        UpdatedAt = DateTime.UtcNow;
    }

    public string GetFullUrl()
    {
        if (string.IsNullOrEmpty(EndpointPath))
            return BaseUrl;

        return $"{BaseUrl}/{EndpointPath}";
    }

    private static DateTime CalculateNextExecution(ScraperFrequency frequency)
    {
        var now = DateTime.UtcNow;

        return frequency switch
        {
            ScraperFrequency.Hourly => now.AddHours(1),
            ScraperFrequency.Every6Hours => now.AddHours(6),
            ScraperFrequency.Every12Hours => now.AddHours(12),
            ScraperFrequency.Daily => now.Date.AddDays(1).AddHours(8), // 8am UTC siguiente día
            ScraperFrequency.Weekly => now.Date.AddDays(7 - (int)now.DayOfWeek + 1).AddHours(8), // Lunes 8am
            ScraperFrequency.Manual => now.AddYears(100), // Nunca automático
            _ => now.AddDays(1)
        };
    }
}
