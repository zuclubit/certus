namespace Certus.Application.Common.Interfaces;

/// <summary>
/// Interface para el servicio de envío de emails
/// Abstrae la implementación concreta (Resend, SendGrid, SMTP, etc.)
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Envía un email simple
    /// </summary>
    /// <param name="to">Dirección de destino</param>
    /// <param name="subject">Asunto del email</param>
    /// <param name="body">Cuerpo del email (HTML)</param>
    /// <param name="cancellationToken">Token de cancelación</param>
    /// <returns>Resultado del envío</returns>
    Task<EmailResult> SendAsync(
        string to,
        string subject,
        string body,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Envía un email usando una plantilla predefinida
    /// </summary>
    /// <param name="to">Dirección de destino</param>
    /// <param name="templateName">Nombre de la plantilla (welcome, invitation, etc.)</param>
    /// <param name="templateData">Datos para la plantilla</param>
    /// <param name="cancellationToken">Token de cancelación</param>
    /// <returns>Resultado del envío</returns>
    Task<EmailResult> SendTemplatedAsync(
        string to,
        string templateName,
        Dictionary<string, object> templateData,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Envía un email con archivos adjuntos
    /// </summary>
    /// <param name="to">Dirección de destino</param>
    /// <param name="subject">Asunto del email</param>
    /// <param name="body">Cuerpo del email (HTML)</param>
    /// <param name="attachments">Lista de archivos adjuntos</param>
    /// <param name="cancellationToken">Token de cancelación</param>
    /// <returns>Resultado del envío</returns>
    Task<EmailResult> SendWithAttachmentsAsync(
        string to,
        string subject,
        string body,
        IEnumerable<EmailAttachment> attachments,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Envía un email a múltiples destinatarios
    /// </summary>
    /// <param name="recipients">Lista de direcciones de destino</param>
    /// <param name="subject">Asunto del email</param>
    /// <param name="body">Cuerpo del email (HTML)</param>
    /// <param name="cancellationToken">Token de cancelación</param>
    /// <returns>Resultado del envío</returns>
    Task<EmailResult> SendBulkAsync(
        IEnumerable<string> recipients,
        string subject,
        string body,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Resultado de envío de email
/// </summary>
public sealed record EmailResult
{
    /// <summary>
    /// Indica si el envío fue exitoso
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// ID del mensaje asignado por el proveedor
    /// </summary>
    public string? MessageId { get; init; }

    /// <summary>
    /// Mensaje de error en caso de falla
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Código de error específico del proveedor
    /// </summary>
    public string? ErrorCode { get; init; }

    /// <summary>
    /// Crea un resultado exitoso
    /// </summary>
    public static EmailResult Succeeded(string? messageId = null)
        => new() { Success = true, MessageId = messageId };

    /// <summary>
    /// Crea un resultado de error
    /// </summary>
    public static EmailResult Failed(string errorMessage, string? errorCode = null)
        => new() { Success = false, ErrorMessage = errorMessage, ErrorCode = errorCode };
}

/// <summary>
/// Archivo adjunto de email
/// </summary>
public sealed record EmailAttachment
{
    /// <summary>
    /// Nombre del archivo
    /// </summary>
    public string FileName { get; init; } = string.Empty;

    /// <summary>
    /// Contenido del archivo como base64
    /// </summary>
    public string Content { get; init; } = string.Empty;

    /// <summary>
    /// Tipo MIME del archivo
    /// </summary>
    public string ContentType { get; init; } = "application/octet-stream";
}
