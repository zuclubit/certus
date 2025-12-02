using Certus.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Certus.Api.Hubs;

/// <summary>
/// SignalR Hub for real-time scraper execution updates
/// Provides WebSocket-based communication for scraper status, progress, and documents
/// </summary>
[Authorize]
public class ScraperHub : Hub
{
    private readonly ILogger<ScraperHub> _logger;

    public ScraperHub(ILogger<ScraperHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst("sub")?.Value;
        var tenantId = Context.User?.FindFirst("tenant_id")?.Value;

        // Add to tenant group for tenant-wide scraper updates
        if (!string.IsNullOrEmpty(tenantId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"scraper-tenant-{tenantId}");
        }

        _logger.LogInformation(
            "Scraper client connected: {ConnectionId} | UserId: {UserId} | TenantId: {TenantId}",
            Context.ConnectionId, userId, tenantId);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst("sub")?.Value;
        var tenantId = Context.User?.FindFirst("tenant_id")?.Value;

        if (!string.IsNullOrEmpty(tenantId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"scraper-tenant-{tenantId}");
        }

        _logger.LogInformation(
            "Scraper client disconnected: {ConnectionId} | UserId: {UserId}",
            Context.ConnectionId, userId);

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Subscribe to a specific scraper execution updates
    /// </summary>
    public async Task SubscribeToExecution(Guid executionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"execution-{executionId}");
        _logger.LogDebug(
            "Client {ConnectionId} subscribed to execution {ExecutionId}",
            Context.ConnectionId, executionId);
    }

    /// <summary>
    /// Unsubscribe from a specific execution
    /// </summary>
    public async Task UnsubscribeFromExecution(Guid executionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"execution-{executionId}");
        _logger.LogDebug(
            "Client {ConnectionId} unsubscribed from execution {ExecutionId}",
            Context.ConnectionId, executionId);
    }

    /// <summary>
    /// Subscribe to a specific source's executions
    /// </summary>
    public async Task SubscribeToSource(Guid sourceId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"source-{sourceId}");
        _logger.LogDebug(
            "Client {ConnectionId} subscribed to source {SourceId}",
            Context.ConnectionId, sourceId);
    }

    /// <summary>
    /// Unsubscribe from a specific source
    /// </summary>
    public async Task UnsubscribeFromSource(Guid sourceId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"source-{sourceId}");
        _logger.LogDebug(
            "Client {ConnectionId} unsubscribed from source {SourceId}",
            Context.ConnectionId, sourceId);
    }
}

/// <summary>
/// Implementation of scraper notification service using SignalR
/// </summary>
public class ScraperNotificationService : IScraperNotificationService
{
    private readonly IHubContext<ScraperHub> _hubContext;
    private readonly ILogger<ScraperNotificationService> _logger;

    public ScraperNotificationService(
        IHubContext<ScraperHub> hubContext,
        ILogger<ScraperNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyExecutionStarted(ScraperExecutionStartedMessage message)
    {
        _logger.LogDebug("Broadcasting execution started: {ExecutionId}", message.ExecutionId);

        // Notify the specific execution group
        await _hubContext.Clients
            .Group($"execution-{message.ExecutionId}")
            .SendAsync("ExecutionStarted", message);

        // Notify the source group
        await _hubContext.Clients
            .Group($"source-{message.SourceId}")
            .SendAsync("ExecutionStarted", message);

        // Notify all clients watching this tenant
        await _hubContext.Clients.All
            .SendAsync("ScraperUpdate", new { type = "started", data = message });
    }

    public async Task NotifyExecutionProgress(ScraperExecutionProgressMessage message)
    {
        await _hubContext.Clients
            .Group($"execution-{message.ExecutionId}")
            .SendAsync("ExecutionProgress", message);

        await _hubContext.Clients
            .Group($"source-{message.SourceId}")
            .SendAsync("ExecutionProgress", message);
    }

    public async Task NotifyDocumentFound(ScraperDocumentFoundMessage message)
    {
        await _hubContext.Clients
            .Group($"execution-{message.ExecutionId}")
            .SendAsync("DocumentFound", message);

        await _hubContext.Clients
            .Group($"source-{message.SourceId}")
            .SendAsync("DocumentFound", message);
    }

    public async Task NotifyExecutionCompleted(ScraperExecutionCompletedMessage message)
    {
        _logger.LogDebug("Broadcasting execution completed: {ExecutionId}", message.ExecutionId);

        await _hubContext.Clients
            .Group($"execution-{message.ExecutionId}")
            .SendAsync("ExecutionCompleted", message);

        await _hubContext.Clients
            .Group($"source-{message.SourceId}")
            .SendAsync("ExecutionCompleted", message);

        await _hubContext.Clients.All
            .SendAsync("ScraperUpdate", new { type = "completed", data = message });
    }

    public async Task NotifyExecutionFailed(ScraperExecutionFailedMessage message)
    {
        _logger.LogDebug("Broadcasting execution failed: {ExecutionId}", message.ExecutionId);

        await _hubContext.Clients
            .Group($"execution-{message.ExecutionId}")
            .SendAsync("ExecutionFailed", message);

        await _hubContext.Clients
            .Group($"source-{message.SourceId}")
            .SendAsync("ExecutionFailed", message);

        await _hubContext.Clients.All
            .SendAsync("ScraperUpdate", new { type = "failed", data = message });
    }

    public async Task NotifyExecutionLog(Guid executionId, Guid sourceId, string message, string level)
    {
        var logMessage = new ScraperLogMessage(
            ExecutionId: executionId,
            SourceId: sourceId,
            Message: message,
            Level: level,
            Timestamp: DateTime.UtcNow
        );

        await _hubContext.Clients
            .Group($"execution-{executionId}")
            .SendAsync("ExecutionLog", logMessage);

        await _hubContext.Clients
            .Group($"source-{sourceId}")
            .SendAsync("ExecutionLog", logMessage);
    }
}
