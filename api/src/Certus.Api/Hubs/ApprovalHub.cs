using Certus.Domain.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Certus.Api.Hubs;

/// <summary>
/// Hub SignalR para actualizaciones en tiempo real de aprobaciones
/// CONSAR Compliance: Provides real-time approval status updates to approvers and requesters
/// </summary>
[Authorize]
public class ApprovalHub : Hub
{
    private readonly ILogger<ApprovalHub> _logger;

    public ApprovalHub(ILogger<ApprovalHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst("sub")?.Value;
        var tenantId = Context.User?.FindFirst("tenant_id")?.Value;
        var role = Context.User?.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

        if (!string.IsNullOrEmpty(tenantId))
        {
            // Add to tenant group for tenant-wide approval notifications
            await Groups.AddToGroupAsync(Context.ConnectionId, $"approvals-tenant-{tenantId}");
        }

        if (!string.IsNullOrEmpty(userId))
        {
            // Add to user group for personal approval notifications
            await Groups.AddToGroupAsync(Context.ConnectionId, $"approvals-user-{userId}");
        }

        // Add approvers to special approver group for their level
        if (IsApprover(role))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"approvers-{tenantId}");
        }

        _logger.LogInformation(
            "ApprovalHub: Client connected: {ConnectionId} | UserId: {UserId} | TenantId: {TenantId} | Role: {Role}",
            Context.ConnectionId, userId, tenantId, role);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst("sub")?.Value;
        var tenantId = Context.User?.FindFirst("tenant_id")?.Value;
        var role = Context.User?.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

        if (!string.IsNullOrEmpty(tenantId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"approvals-tenant-{tenantId}");
        }

        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"approvals-user-{userId}");
        }

        if (IsApprover(role))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"approvers-{tenantId}");
        }

        _logger.LogInformation(
            "ApprovalHub: Client disconnected: {ConnectionId} | UserId: {UserId}",
            Context.ConnectionId, userId);

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Subscribe to updates for a specific approval
    /// </summary>
    public async Task SubscribeToApproval(Guid approvalId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"approval-{approvalId}");
        _logger.LogDebug(
            "Client {ConnectionId} subscribed to approval {ApprovalId}",
            Context.ConnectionId, approvalId);
    }

    /// <summary>
    /// Unsubscribe from a specific approval
    /// </summary>
    public async Task UnsubscribeFromApproval(Guid approvalId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"approval-{approvalId}");
        _logger.LogDebug(
            "Client {ConnectionId} unsubscribed from approval {ApprovalId}",
            Context.ConnectionId, approvalId);
    }

    private static bool IsApprover(string? role) =>
        role is "SystemAdmin" or "TenantAdmin" or "Supervisor" or "Manager" or "Director";
}

/// <summary>
/// Implementation of IApprovalNotificationService using SignalR
/// Sends real-time notifications to connected clients for approval workflow events
/// CONSAR Compliance: Ensures timely notifications for approval workflow
/// </summary>
public class ApprovalNotificationService : IApprovalNotificationService
{
    private readonly IHubContext<ApprovalHub> _hubContext;
    private readonly ILogger<ApprovalNotificationService> _logger;

    public ApprovalNotificationService(
        IHubContext<ApprovalHub> hubContext,
        ILogger<ApprovalNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyApprovalCreatedAsync(ApprovalCreatedNotification notification)
    {
        try
        {
            // Notify tenant approvers
            await _hubContext.Clients
                .Group($"approvers-{notification.TenantId}")
                .SendAsync("ApprovalCreated", notification);

            // Notify the requester
            await _hubContext.Clients
                .Group($"approvals-user-{notification.RequestedById}")
                .SendAsync("ApprovalCreated", notification);

            // Notify all tenant members
            await _hubContext.Clients
                .Group($"approvals-tenant-{notification.TenantId}")
                .SendAsync("ApprovalCreated", notification);

            _logger.LogInformation(
                "Sent ApprovalCreated notification for approval {ApprovalId} | File: {FileName}",
                notification.ApprovalId, notification.FileName);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send ApprovalCreated notification for {ApprovalId}", notification.ApprovalId);
        }
    }

    public async Task NotifyApprovalAssignedAsync(ApprovalAssignedNotification notification)
    {
        try
        {
            // Notify the assigned approver
            await _hubContext.Clients
                .Group($"approvals-user-{notification.AssignedToId}")
                .SendAsync("ApprovalAssigned", notification);

            // Notify approval watchers
            await _hubContext.Clients
                .Group($"approval-{notification.ApprovalId}")
                .SendAsync("ApprovalAssigned", notification);

            _logger.LogInformation(
                "Sent ApprovalAssigned notification for approval {ApprovalId} to user {AssignedToId}",
                notification.ApprovalId, notification.AssignedToId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send ApprovalAssigned notification for {ApprovalId}", notification.ApprovalId);
        }
    }

    public async Task NotifyApprovalApprovedAsync(ApprovalApprovedNotification notification)
    {
        try
        {
            // Notify approval watchers
            await _hubContext.Clients
                .Group($"approval-{notification.ApprovalId}")
                .SendAsync("ApprovalApproved", notification);

            // Notify tenant members
            await _hubContext.Clients
                .Group($"approvals-tenant-{notification.TenantId}")
                .SendAsync("ApprovalApproved", notification);

            _logger.LogInformation(
                "Sent ApprovalApproved notification for approval {ApprovalId} | ApprovedBy: {ApprovedBy}",
                notification.ApprovalId, notification.ApprovedByName);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send ApprovalApproved notification for {ApprovalId}", notification.ApprovalId);
        }
    }

    public async Task NotifyApprovalRejectedAsync(ApprovalRejectedNotification notification)
    {
        try
        {
            // Notify approval watchers
            await _hubContext.Clients
                .Group($"approval-{notification.ApprovalId}")
                .SendAsync("ApprovalRejected", notification);

            // Notify tenant members
            await _hubContext.Clients
                .Group($"approvals-tenant-{notification.TenantId}")
                .SendAsync("ApprovalRejected", notification);

            _logger.LogInformation(
                "Sent ApprovalRejected notification for approval {ApprovalId} | Reason: {Reason}",
                notification.ApprovalId, notification.Reason);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send ApprovalRejected notification for {ApprovalId}", notification.ApprovalId);
        }
    }

    public async Task NotifyApprovalEscalatedAsync(ApprovalEscalatedNotification notification)
    {
        try
        {
            // Notify approvers about escalation
            await _hubContext.Clients
                .Group($"approvers-{notification.TenantId}")
                .SendAsync("ApprovalEscalated", notification);

            // Notify approval watchers
            await _hubContext.Clients
                .Group($"approval-{notification.ApprovalId}")
                .SendAsync("ApprovalEscalated", notification);

            _logger.LogInformation(
                "Sent ApprovalEscalated notification for approval {ApprovalId} | From: {FromLevel} To: {ToLevel}",
                notification.ApprovalId, notification.FromLevel, notification.ToLevel);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send ApprovalEscalated notification for {ApprovalId}", notification.ApprovalId);
        }
    }

    public async Task NotifySlaAtRiskAsync(ApprovalSlaNotification notification)
    {
        try
        {
            // Notify the assigned approver if any
            if (notification.AssignedToId.HasValue)
            {
                await _hubContext.Clients
                    .Group($"approvals-user-{notification.AssignedToId}")
                    .SendAsync("ApprovalSlaAtRisk", notification);
            }

            // Notify all approvers in tenant
            await _hubContext.Clients
                .Group($"approvers-{notification.TenantId}")
                .SendAsync("ApprovalSlaAtRisk", notification);

            _logger.LogInformation(
                "Sent SlaAtRisk notification for approval {ApprovalId} | Remaining: {RemainingMinutes} min",
                notification.ApprovalId, notification.RemainingMinutes);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send SlaAtRisk notification for {ApprovalId}", notification.ApprovalId);
        }
    }

    public async Task NotifySlaBreachedAsync(ApprovalSlaNotification notification)
    {
        try
        {
            // Notify assigned approver
            if (notification.AssignedToId.HasValue)
            {
                await _hubContext.Clients
                    .Group($"approvals-user-{notification.AssignedToId}")
                    .SendAsync("ApprovalSlaBreached", notification);
            }

            // Notify all approvers - this is critical
            await _hubContext.Clients
                .Group($"approvers-{notification.TenantId}")
                .SendAsync("ApprovalSlaBreached", notification);

            // Notify tenant admins
            await _hubContext.Clients
                .Group($"approvals-tenant-{notification.TenantId}")
                .SendAsync("ApprovalSlaBreached", notification);

            _logger.LogWarning(
                "Sent SlaBreached notification for approval {ApprovalId} | Overdue: {OverdueMinutes} min",
                notification.ApprovalId, notification.OverdueMinutes);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send SlaBreached notification for {ApprovalId}", notification.ApprovalId);
        }
    }

    public async Task NotifyTenantUpdateAsync(Guid tenantId, object message)
    {
        try
        {
            await _hubContext.Clients
                .Group($"approvals-tenant-{tenantId}")
                .SendAsync("TenantApprovalUpdate", message);

            _logger.LogDebug("Sent TenantApprovalUpdate for tenant {TenantId}", tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Failed to send TenantApprovalUpdate for {TenantId}", tenantId);
        }
    }

    public async Task NotifyUserAsync(Guid userId, object message)
    {
        try
        {
            await _hubContext.Clients
                .Group($"approvals-user-{userId}")
                .SendAsync("UserApprovalNotification", message);

            _logger.LogDebug("Sent UserApprovalNotification for user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Failed to send UserApprovalNotification for {UserId}", userId);
        }
    }
}
