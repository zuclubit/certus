using Certus.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Certus.Api.Hubs;

/// <summary>
/// Hub SignalR para actualizaciones en tiempo real de validaciones
/// </summary>
[Authorize]
public class ValidationHub : Hub
{
    private readonly ILogger<ValidationHub> _logger;

    public ValidationHub(ILogger<ValidationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst("sub")?.Value;
        var tenantId = Context.User?.FindFirst("tenant_id")?.Value;

        if (!string.IsNullOrEmpty(tenantId))
        {
            // Agregar al grupo del tenant para recibir actualizaciones
            await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant-{tenantId}");
        }

        if (!string.IsNullOrEmpty(userId))
        {
            // Agregar al grupo del usuario para notificaciones personales
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
        }

        _logger.LogInformation(
            "Client connected: {ConnectionId} | UserId: {UserId} | TenantId: {TenantId}",
            Context.ConnectionId, userId, tenantId);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst("sub")?.Value;
        var tenantId = Context.User?.FindFirst("tenant_id")?.Value;

        if (!string.IsNullOrEmpty(tenantId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"tenant-{tenantId}");
        }

        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
        }

        _logger.LogInformation(
            "Client disconnected: {ConnectionId} | UserId: {UserId}",
            Context.ConnectionId, userId);

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Suscribirse a actualizaciones de una validación específica
    /// </summary>
    public async Task SubscribeToValidation(Guid validationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"validation-{validationId}");
        _logger.LogDebug(
            "Client {ConnectionId} subscribed to validation {ValidationId}",
            Context.ConnectionId, validationId);
    }

    /// <summary>
    /// Cancelar suscripción a una validación
    /// </summary>
    public async Task UnsubscribeFromValidation(Guid validationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"validation-{validationId}");
        _logger.LogDebug(
            "Client {ConnectionId} unsubscribed from validation {ValidationId}",
            Context.ConnectionId, validationId);
    }
}

/// <summary>
/// Implementation of IValidationNotificationService using SignalR
/// Broadcasts to both validation-specific and tenant groups for real-time updates
/// </summary>
public class ValidationNotificationService : IValidationNotificationService
{
    private readonly IHubContext<ValidationHub> _hubContext;
    private readonly ILogger<ValidationNotificationService> _logger;

    public ValidationNotificationService(
        IHubContext<ValidationHub> hubContext,
        ILogger<ValidationNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyValidationProgress(Guid validationId, Guid tenantId, ValidationProgressMessage message)
    {
        _logger.LogDebug("Sending progress notification for validation {ValidationId} to tenant {TenantId}: {Progress}%",
            validationId, tenantId, message.Progress);

        // Send to specific validation subscribers (detail view)
        await _hubContext.Clients
            .Group($"validation-{validationId}")
            .SendAsync("ValidationProgress", message);

        // Also send to tenant group so list view gets updates
        await _hubContext.Clients
            .Group($"tenant-{tenantId}")
            .SendAsync("ValidationProgress", message);
    }

    public async Task NotifyValidationCompleted(Guid validationId, Guid tenantId, ValidationCompletedMessage message)
    {
        _logger.LogInformation("Sending completed notification for validation {ValidationId} to tenant {TenantId}: Status={Status}",
            validationId, tenantId, message.Status);

        // Send to specific validation subscribers (detail view)
        await _hubContext.Clients
            .Group($"validation-{validationId}")
            .SendAsync("ValidationCompleted", message);

        // Also send to tenant group so list view gets updates
        await _hubContext.Clients
            .Group($"tenant-{tenantId}")
            .SendAsync("ValidationCompleted", message);

        // Send tenant update for list refresh with summary info
        await _hubContext.Clients
            .Group($"tenant-{tenantId}")
            .SendAsync("TenantUpdate", new
            {
                TenantId = tenantId,
                Type = "validation_completed",
                ValidationId = validationId,
                FileName = message.FileName,
                Status = message.Status,
                ErrorCount = message.ErrorCount,
                WarningCount = message.WarningCount
            });
    }

    public async Task NotifyValidationError(Guid validationId, Guid tenantId, ValidationErrorMessage message)
    {
        _logger.LogWarning("Sending error notification for validation {ValidationId}: {Error}",
            validationId, message.Error);

        // Send to specific validation subscribers (detail view)
        await _hubContext.Clients
            .Group($"validation-{validationId}")
            .SendAsync("ValidationError", message);

        // Also send to tenant group so list view gets updates
        await _hubContext.Clients
            .Group($"tenant-{tenantId}")
            .SendAsync("ValidationError", message);

        // Send tenant update for list refresh
        await _hubContext.Clients
            .Group($"tenant-{tenantId}")
            .SendAsync("TenantUpdate", new
            {
                TenantId = tenantId,
                Type = "validation_error",
                ValidationId = validationId,
                Error = message.Error
            });
    }

    public async Task NotifyTenantUpdate(Guid tenantId, object message)
    {
        _logger.LogDebug("Sending tenant update to {TenantId}", tenantId);
        await _hubContext.Clients
            .Group($"tenant-{tenantId}")
            .SendAsync("TenantUpdate", message);
    }

    public async Task NotifyUserUpdate(Guid userId, object message)
    {
        _logger.LogDebug("Sending user notification to {UserId}", userId);
        await _hubContext.Clients
            .Group($"user-{userId}")
            .SendAsync("UserNotification", message);
    }
}
