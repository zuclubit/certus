namespace Certus.Infrastructure.Configuration;

/// <summary>
/// Configuration options for Email Service
/// Supports Resend as the primary provider
/// </summary>
public class EmailOptions
{
    public const string SectionName = "Email";

    /// <summary>
    /// Resend API Key
    /// Get it from https://resend.com/api-keys
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Default sender email address
    /// Must be verified in Resend dashboard
    /// </summary>
    public string DefaultFrom { get; set; } = "hello@zuclubit.com";

    /// <summary>
    /// Default sender name
    /// </summary>
    public string DefaultFromName { get; set; } = "Certus";

    /// <summary>
    /// Reply-to email address
    /// </summary>
    public string? ReplyTo { get; set; }

    /// <summary>
    /// Enable email sending (set to false for development)
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// Log emails instead of sending (for testing)
    /// </summary>
    public bool LogOnly { get; set; } = false;

    /// <summary>
    /// Base URL for links in emails
    /// </summary>
    public string BaseUrl { get; set; } = "https://certus.hergon.digital";

    /// <summary>
    /// Company name for email templates
    /// </summary>
    public string CompanyName { get; set; } = "Certus";

    /// <summary>
    /// Support email address
    /// </summary>
    public string SupportEmail { get; set; } = "soporte@zuclubit.com";

    /// <summary>
    /// Retry configuration for failed emails
    /// </summary>
    public EmailRetryOptions Retry { get; set; } = new();
}

/// <summary>
/// Retry options for email sending
/// </summary>
public class EmailRetryOptions
{
    /// <summary>
    /// Maximum number of retry attempts
    /// </summary>
    public int MaxRetries { get; set; } = 3;

    /// <summary>
    /// Initial delay between retries (milliseconds)
    /// </summary>
    public int InitialDelayMs { get; set; } = 1000;

    /// <summary>
    /// Maximum delay between retries (milliseconds)
    /// </summary>
    public int MaxDelayMs { get; set; } = 30000;
}
