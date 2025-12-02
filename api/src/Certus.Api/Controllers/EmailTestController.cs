using Certus.Infrastructure.Services.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller para probar el servicio de email
/// Solo disponible en desarrollo
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class EmailTestController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailTestController> _logger;
    private readonly IWebHostEnvironment _env;

    public EmailTestController(
        IEmailService emailService,
        ILogger<EmailTestController> logger,
        IWebHostEnvironment env)
    {
        _emailService = emailService;
        _logger = logger;
        _env = env;
    }

    /// <summary>
    /// Verificar si el servicio de email está configurado
    /// </summary>
    [HttpGet("status")]
    [AllowAnonymous]
    public async Task<IActionResult> GetStatus()
    {
        var isConfigured = await _emailService.IsConfiguredAsync();
        return Ok(new
        {
            configured = isConfigured,
            environment = _env.EnvironmentName
        });
    }

    /// <summary>
    /// Enviar email de prueba
    /// </summary>
    [HttpPost("send")]
    [AllowAnonymous]
    public async Task<IActionResult> SendTestEmail([FromBody] TestEmailRequest request)
    {
        _logger.LogInformation("Sending test email to {To}", request.To);

        var result = await _emailService.SendAsync(
            request.To,
            request.Subject ?? "Test Email from Certus",
            $@"<h1>Test Email</h1>
               <p>This is a test email sent from Certus API.</p>
               <p>Timestamp: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
               <p>Environment: {_env.EnvironmentName}</p>",
            $"Test Email\n\nThis is a test email sent from Certus API.\nTimestamp: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");

        if (result.Success)
        {
            _logger.LogInformation("Test email sent successfully: {MessageId}", result.MessageId);
            return Ok(new
            {
                success = true,
                messageId = result.MessageId,
                sentAt = result.SentAt
            });
        }

        _logger.LogWarning("Test email failed: {Error}", result.Error);
        return BadRequest(new
        {
            success = false,
            error = result.Error
        });
    }

    /// <summary>
    /// Enviar email usando una plantilla
    /// </summary>
    [HttpPost("send-template")]
    [AllowAnonymous]
    public async Task<IActionResult> SendTemplatedEmail([FromBody] TemplatedEmailRequest request)
    {
        _logger.LogInformation("Sending templated email to {To} using template {Template}",
            request.To, request.TemplateName);

        var templateData = request.Data ?? new Dictionary<string, object>();

        // Add default test data if not provided
        if (!templateData.ContainsKey("Name"))
            templateData["Name"] = "Usuario de Prueba";

        var result = await _emailService.SendTemplatedAsync(
            request.To,
            request.TemplateName,
            templateData);

        if (result.Success)
        {
            return Ok(new
            {
                success = true,
                messageId = result.MessageId,
                template = request.TemplateName,
                sentAt = result.SentAt
            });
        }

        return BadRequest(new
        {
            success = false,
            error = result.Error
        });
    }

    /// <summary>
    /// Listar plantillas disponibles
    /// </summary>
    [HttpGet("templates")]
    [AllowAnonymous]
    public IActionResult GetTemplates()
    {
        var templates = new[]
        {
            new { name = "welcome", description = "Email de bienvenida para nuevos usuarios" },
            new { name = "password_reset", description = "Restablecer contraseña" },
            new { name = "validation_completed", description = "Validación de archivo completada" },
            new { name = "approval_required", description = "Solicitud de aprobación pendiente" },
            new { name = "approval_granted", description = "Aprobación concedida" },
            new { name = "approval_rejected", description = "Aprobación rechazada" },
            new { name = "normative_change_alert", description = "Alerta de cambio normativo" },
            new { name = "sla_warning", description = "Advertencia de SLA próximo a vencer" },
            new { name = "invitation", description = "Invitación de usuario a organización" },
            new { name = "invitation_accepted", description = "Notificación de invitación aceptada" },
            new { name = "daily_digest", description = "Resumen diario de actividad" }
        };

        return Ok(templates);
    }
}

public record TestEmailRequest
{
    public string To { get; init; } = string.Empty;
    public string? Subject { get; init; }
}

public record TemplatedEmailRequest
{
    public string To { get; init; } = string.Empty;
    public string TemplateName { get; init; } = string.Empty;
    public Dictionary<string, object>? Data { get; init; }
}
