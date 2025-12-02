using Certus.Application.Common.Interfaces;
using Certus.Domain.Enums;
using Certus.Domain.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using InfraEmailService = Certus.Infrastructure.Services.Email.IEmailService;
using InfraEmailResult = Certus.Infrastructure.Services.Email.EmailResult;
using DomainEmailAttachment = Certus.Domain.Services.EmailAttachment;

namespace Certus.Infrastructure.Services;

/// <summary>
/// Implementación del servicio de notificaciones
/// Envía notificaciones via SignalR a usuarios/roles/tenants
/// Soporta envío de emails via Resend
/// </summary>
public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IApplicationDbContext _context;
    private readonly InfraEmailService _emailService;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IHubContext<NotificationHub> hubContext,
        IApplicationDbContext context,
        InfraEmailService emailService,
        ILogger<NotificationService> logger)
    {
        _hubContext = hubContext;
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task SendToUserAsync(
        Guid userId,
        Notification notification,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var message = MapToMessage(notification);
            await _hubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveNotification", message, cancellationToken);

            _logger.LogInformation(
                "Notification sent to user {UserId}: {Type} - {Title}",
                userId, notification.Type, notification.Title);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to user {UserId}", userId);
        }
    }

    public async Task SendToUsersAsync(
        IEnumerable<Guid> userIds,
        Notification notification,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var message = MapToMessage(notification);
            var userIdStrings = userIds.Select(id => id.ToString()).ToList();

            await _hubContext.Clients.Users(userIdStrings)
                .SendAsync("ReceiveNotification", message, cancellationToken);

            _logger.LogInformation(
                "Notification sent to {UserCount} users: {Type} - {Title}",
                userIdStrings.Count, notification.Type, notification.Title);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to multiple users");
        }
    }

    public async Task SendToRoleAsync(
        Guid tenantId,
        string role,
        Notification notification,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Parse role string to enum
            if (!Enum.TryParse<UserRole>(role, true, out var userRole))
            {
                _logger.LogWarning("Invalid role specified: {Role}", role);
                return;
            }

            // Get users with the specified role in the tenant
            var users = await _context.Users
                .Where(u => u.TenantId == tenantId && u.Role == userRole && u.Status == UserStatus.Active)
                .Select(u => u.Id)
                .ToListAsync(cancellationToken);

            if (users.Any())
            {
                await SendToUsersAsync(users, notification, cancellationToken);
            }

            _logger.LogInformation(
                "Notification sent to role {Role} in tenant {TenantId}: {Type} - {Title}",
                role, tenantId, notification.Type, notification.Title);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to role {Role} in tenant {TenantId}", role, tenantId);
        }
    }

    public async Task SendToTenantAsync(
        Guid tenantId,
        Notification notification,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var message = MapToMessage(notification);
            await _hubContext.Clients.Group($"tenant_{tenantId}")
                .SendAsync("ReceiveNotification", message, cancellationToken);

            _logger.LogInformation(
                "Notification sent to tenant {TenantId}: {Type} - {Title}",
                tenantId, notification.Type, notification.Title);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to tenant {TenantId}", tenantId);
        }
    }

    public async Task SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        IEnumerable<DomainEmailAttachment>? attachments = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            InfraEmailResult result;

            if (attachments?.Any() == true)
            {
                result = await _emailService.SendWithAttachmentsAsync(
                    to, subject, body, attachments,
                    isHtml ? null : body,
                    cancellationToken);
            }
            else
            {
                result = await _emailService.SendAsync(
                    to, subject,
                    isHtml ? body : $"<pre>{body}</pre>",
                    isHtml ? null : body,
                    cancellationToken);
            }

            if (result.Success)
            {
                _logger.LogInformation(
                    "Email sent successfully: To={To}, Subject={Subject}, MessageId={MessageId}",
                    to, subject, result.MessageId);
            }
            else
            {
                _logger.LogWarning(
                    "Email sending failed: To={To}, Subject={Subject}, Error={Error}",
                    to, subject, result.Error);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", to);
        }
    }

    public async Task SendEmailAsync(
        IEnumerable<string> to,
        string subject,
        string body,
        bool isHtml = true,
        IEnumerable<string>? cc = null,
        IEnumerable<string>? bcc = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _emailService.SendAsync(
                to, subject,
                isHtml ? body : $"<pre>{body}</pre>",
                isHtml ? null : body,
                cc, bcc,
                cancellationToken);

            if (result.Success)
            {
                _logger.LogInformation(
                    "Bulk email sent successfully: ToCount={ToCount}, Subject={Subject}, MessageId={MessageId}",
                    to.Count(), subject, result.MessageId);
            }
            else
            {
                _logger.LogWarning(
                    "Bulk email sending failed: ToCount={ToCount}, Subject={Subject}, Error={Error}",
                    to.Count(), subject, result.Error);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send bulk email to {Count} recipients", to.Count());
        }
    }

    private static object MapToMessage(Notification notification)
    {
        return new
        {
            type = notification.Type,
            title = notification.Title,
            message = notification.Message,
            priority = notification.Priority.ToString().ToLower(),
            actionUrl = notification.ActionUrl,
            actionLabel = notification.ActionLabel,
            data = notification.Data,
            expiresAt = notification.ExpiresAt,
            timestamp = DateTime.UtcNow
        };
    }
}

/// <summary>
/// SignalR Hub para notificaciones en tiempo real
/// </summary>
public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        var tenantId = Context.User?.FindFirst("tenant_id")?.Value;

        if (!string.IsNullOrEmpty(tenantId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
        }

        _logger.LogInformation(
            "User {UserId} connected to notifications hub. TenantId: {TenantId}",
            userId, tenantId);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        _logger.LogInformation("User {UserId} disconnected from notifications hub", userId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Join a specific notification group
    /// </summary>
    public async Task JoinGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _logger.LogDebug("Connection {ConnectionId} joined group {GroupName}", Context.ConnectionId, groupName);
    }

    /// <summary>
    /// Leave a notification group
    /// </summary>
    public async Task LeaveGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        _logger.LogDebug("Connection {ConnectionId} left group {GroupName}", Context.ConnectionId, groupName);
    }
}
