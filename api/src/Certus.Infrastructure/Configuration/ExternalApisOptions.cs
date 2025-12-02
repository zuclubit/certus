namespace Certus.Infrastructure.Configuration;

/// <summary>
/// Configuration options for Mexican Financial External APIs
/// This is a container/parent configuration that references the individual API options
/// Updated for 2025 compliance requirements
/// </summary>
public class ExternalApisOptions
{
    public const string SectionName = "ExternalApis";

    /// <summary>
    /// Global resilience settings for all external API calls
    /// </summary>
    public ResilienceOptions Resilience { get; set; } = new();
}

/// <summary>
/// Global resilience options for external API calls
/// Uses Polly for retry, circuit breaker, and timeout policies
/// </summary>
public class ResilienceOptions
{
    /// <summary>
    /// Enable retry policy with exponential backoff
    /// </summary>
    public bool EnableRetry { get; set; } = true;

    /// <summary>
    /// Enable circuit breaker pattern
    /// </summary>
    public bool EnableCircuitBreaker { get; set; } = true;

    /// <summary>
    /// Number of failures before circuit opens
    /// </summary>
    public int CircuitBreakerFailureThreshold { get; set; } = 5;

    /// <summary>
    /// Duration circuit stays open (seconds)
    /// </summary>
    public int CircuitBreakerDurationSeconds { get; set; } = 60;

    /// <summary>
    /// Enable request hedging for critical calls
    /// </summary>
    public bool EnableHedging { get; set; } = false;

    /// <summary>
    /// Hedging delay before parallel request (milliseconds)
    /// </summary>
    public int HedgingDelayMs { get; set; } = 2000;
}
