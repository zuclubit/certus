using Certus.Domain.Services;

namespace Certus.Infrastructure.Services.Email;

/// <summary>
/// Email service interface for sending transactional emails
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Send a simple email
    /// </summary>
    Task<EmailResult> SendAsync(
        string to,
        string subject,
        string htmlBody,
        string? textBody = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send email to multiple recipients
    /// </summary>
    Task<EmailResult> SendAsync(
        IEnumerable<string> to,
        string subject,
        string htmlBody,
        string? textBody = null,
        IEnumerable<string>? cc = null,
        IEnumerable<string>? bcc = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send email with attachments
    /// </summary>
    Task<EmailResult> SendWithAttachmentsAsync(
        string to,
        string subject,
        string htmlBody,
        IEnumerable<EmailAttachment> attachments,
        string? textBody = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send templated email
    /// </summary>
    Task<EmailResult> SendTemplatedAsync(
        string to,
        string templateName,
        Dictionary<string, object> templateData,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if email service is properly configured
    /// </summary>
    Task<bool> IsConfiguredAsync();
}

/// <summary>
/// Result of email sending operation
/// </summary>
public class EmailResult
{
    public bool Success { get; set; }
    public string? MessageId { get; set; }
    public string? Error { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public static EmailResult Succeeded(string messageId) => new()
    {
        Success = true,
        MessageId = messageId
    };

    public static EmailResult Failed(string error) => new()
    {
        Success = false,
        Error = error
    };
}
