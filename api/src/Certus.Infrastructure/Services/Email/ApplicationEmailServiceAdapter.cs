using AppInterfaces = Certus.Application.Common.Interfaces;
using InfraInterfaces = Certus.Infrastructure.Services.Email;
using DomainTypes = Certus.Domain.Services;

namespace Certus.Infrastructure.Services.Email;

/// <summary>
/// Adapter that implements Application.IEmailService by wrapping Infrastructure.IEmailService
/// </summary>
public class ApplicationEmailServiceAdapter : AppInterfaces.IEmailService
{
    private readonly InfraInterfaces.IEmailService _emailService;

    public ApplicationEmailServiceAdapter(InfraInterfaces.IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task<AppInterfaces.EmailResult> SendAsync(
        string to,
        string subject,
        string body,
        CancellationToken cancellationToken = default)
    {
        var result = await _emailService.SendAsync(to, subject, body, null, cancellationToken);
        return MapResult(result);
    }

    public async Task<AppInterfaces.EmailResult> SendTemplatedAsync(
        string to,
        string templateName,
        Dictionary<string, object> templateData,
        CancellationToken cancellationToken = default)
    {
        var result = await _emailService.SendTemplatedAsync(to, templateName, templateData, cancellationToken);
        return MapResult(result);
    }

    public async Task<AppInterfaces.EmailResult> SendWithAttachmentsAsync(
        string to,
        string subject,
        string body,
        IEnumerable<AppInterfaces.EmailAttachment> attachments,
        CancellationToken cancellationToken = default)
    {
        // Convert Application EmailAttachment (base64 string) to Domain EmailAttachment (byte[])
        var domainAttachments = attachments.Select(a => new DomainTypes.EmailAttachment
        {
            FileName = a.FileName,
            Content = Convert.FromBase64String(a.Content),
            ContentType = a.ContentType
        });

        var result = await _emailService.SendWithAttachmentsAsync(
            to, subject, body, domainAttachments, null, cancellationToken);
        return MapResult(result);
    }

    public async Task<AppInterfaces.EmailResult> SendBulkAsync(
        IEnumerable<string> recipients,
        string subject,
        string body,
        CancellationToken cancellationToken = default)
    {
        var result = await _emailService.SendAsync(recipients, subject, body, null, null, null, cancellationToken);
        return MapResult(result);
    }

    private static AppInterfaces.EmailResult MapResult(InfraInterfaces.EmailResult result)
    {
        return result.Success
            ? AppInterfaces.EmailResult.Succeeded(result.MessageId)
            : AppInterfaces.EmailResult.Failed(result.Error ?? "Unknown error");
    }
}
