using Microsoft.Extensions.Logging;
using DomainEmailAttachment = Certus.Domain.Services.EmailAttachment;

namespace Certus.Infrastructure.Services.Email;

/// <summary>
/// No-operation email service for development when Resend is not configured
/// Logs all email operations but doesn't actually send
/// </summary>
public class NoOpEmailService : IEmailService
{
    private readonly ILogger<NoOpEmailService> _logger;

    public NoOpEmailService(ILogger<NoOpEmailService> logger)
    {
        _logger = logger;
    }

    public Task<EmailResult> SendAsync(
        string to,
        string subject,
        string htmlBody,
        string? textBody = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[NoOpEmail] Would send email: To={To}, Subject={Subject}",
            to, subject);

        return Task.FromResult(EmailResult.Succeeded("noop-" + Guid.NewGuid().ToString("N")[..8]));
    }

    public Task<EmailResult> SendAsync(
        IEnumerable<string> to,
        string subject,
        string htmlBody,
        string? textBody = null,
        IEnumerable<string>? cc = null,
        IEnumerable<string>? bcc = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[NoOpEmail] Would send bulk email: To={ToCount}, Subject={Subject}",
            to.Count(), subject);

        return Task.FromResult(EmailResult.Succeeded("noop-" + Guid.NewGuid().ToString("N")[..8]));
    }

    public Task<EmailResult> SendWithAttachmentsAsync(
        string to,
        string subject,
        string htmlBody,
        IEnumerable<DomainEmailAttachment> attachments,
        string? textBody = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[NoOpEmail] Would send email with attachments: To={To}, Subject={Subject}, Attachments={Count}",
            to, subject, attachments.Count());

        return Task.FromResult(EmailResult.Succeeded("noop-" + Guid.NewGuid().ToString("N")[..8]));
    }

    public Task<EmailResult> SendTemplatedAsync(
        string to,
        string templateName,
        Dictionary<string, object> templateData,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[NoOpEmail] Would send templated email: To={To}, Template={Template}",
            to, templateName);

        return Task.FromResult(EmailResult.Succeeded("noop-" + Guid.NewGuid().ToString("N")[..8]));
    }

    public Task<bool> IsConfiguredAsync()
    {
        _logger.LogWarning("[NoOpEmail] Email service is not configured - using NoOp implementation");
        return Task.FromResult(false);
    }
}
