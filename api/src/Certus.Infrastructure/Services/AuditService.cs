using System.Text.Json;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.Services;

/// <summary>
/// Implementation of IAuditService for audit logging
/// </summary>
public class AuditService : IAuditService
{
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IApplicationDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AuditService> _logger;

    public AuditService(
        IAuditLogRepository auditLogRepository,
        IApplicationDbContext dbContext,
        ICurrentUserService currentUserService,
        ILogger<AuditService> logger)
    {
        _auditLogRepository = auditLogRepository;
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Guid> LogAsync(
        string action,
        string entityId,
        string entityType,
        Dictionary<string, object>? data = null,
        string? userId = null,
        CancellationToken cancellationToken = default)
    {
        var currentUser = _currentUserService.User;

        // Parse entityId to Guid if possible
        Guid? entityIdGuid = Guid.TryParse(entityId, out var eid) ? eid : null;

        // Determine userId - prefer provided, fall back to current user
        Guid? userIdGuid = null;
        if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var uid))
        {
            userIdGuid = uid;
        }
        else
        {
            userIdGuid = currentUser.UserId;
        }

        var auditLog = AuditLog.Create(
            action: action,
            entityType: entityType,
            entityId: entityIdGuid,
            tenantId: currentUser.TenantId,
            userId: userIdGuid,
            newValues: data != null ? JsonSerializer.Serialize(data) : null,
            details: BuildUserDetails(currentUser)
        );

        await _auditLogRepository.AddAsync(auditLog, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Audit: {Action} on {EntityType}:{EntityId} by {UserId}",
            action, entityType, entityId, userIdGuid);

        return auditLog.Id;
    }

    public async Task<Guid> LogForTenantAsync(
        string action,
        string entityId,
        string entityType,
        Guid tenantId,
        Dictionary<string, object>? data = null,
        string? userId = null,
        CancellationToken cancellationToken = default)
    {
        var currentUser = _currentUserService.User;

        Guid? entityIdGuid = Guid.TryParse(entityId, out var eid) ? eid : null;
        Guid? userIdGuid = null;
        if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var uid))
        {
            userIdGuid = uid;
        }
        else
        {
            userIdGuid = currentUser.UserId;
        }

        var auditLog = AuditLog.Create(
            action: action,
            entityType: entityType,
            entityId: entityIdGuid,
            tenantId: tenantId,
            userId: userIdGuid,
            newValues: data != null ? JsonSerializer.Serialize(data) : null,
            details: BuildUserDetails(currentUser)
        );

        await _auditLogRepository.AddAsync(auditLog, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return auditLog.Id;
    }

    public async Task<Guid> LogErrorAsync(
        string action,
        string entityId,
        string entityType,
        string errorMessage,
        Exception? exception = null,
        CancellationToken cancellationToken = default)
    {
        var currentUser = _currentUserService.User;
        Guid? entityIdGuid = Guid.TryParse(entityId, out var eid) ? eid : null;

        var errorData = new Dictionary<string, object>
        {
            ["errorMessage"] = errorMessage,
            ["isError"] = true
        };

        if (exception != null)
        {
            errorData["exceptionType"] = exception.GetType().Name;
            errorData["stackTrace"] = exception.StackTrace ?? "";
        }

        var auditLog = AuditLog.Create(
            action: action,
            entityType: entityType,
            entityId: entityIdGuid,
            tenantId: currentUser.TenantId,
            userId: currentUser.UserId,
            newValues: JsonSerializer.Serialize(errorData),
            details: BuildUserDetails(currentUser)
        );

        auditLog.SetResponse(500, 0, errorMessage);

        await _auditLogRepository.AddAsync(auditLog, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogError(
            exception,
            "Audit Error: {Action} on {EntityType}:{EntityId} - {ErrorMessage}",
            action, entityType, entityId, errorMessage);

        return auditLog.Id;
    }

    public async Task<Guid> LogDataAccessAsync(
        string resourceType,
        string resourceId,
        string accessType,
        string? userId = null,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        var currentUser = _currentUserService.User;
        Guid? resourceIdGuid = Guid.TryParse(resourceId, out var rid) ? rid : null;
        Guid? userIdGuid = null;
        if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var uid))
        {
            userIdGuid = uid;
        }
        else
        {
            userIdGuid = currentUser.UserId;
        }

        var data = new Dictionary<string, object>
        {
            ["accessType"] = accessType,
            ["ipAddress"] = ipAddress ?? "unknown"
        };

        var auditLog = AuditLog.Create(
            action: $"DataAccess.{accessType}",
            entityType: resourceType,
            entityId: resourceIdGuid,
            tenantId: currentUser.TenantId,
            userId: userIdGuid,
            ipAddress: ipAddress,
            newValues: JsonSerializer.Serialize(data),
            details: BuildUserDetails(currentUser)
        );

        await _auditLogRepository.AddAsync(auditLog, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return auditLog.Id;
    }

    public async Task<IReadOnlyList<AuditEvent>> GetAuditTrailAsync(
        string entityId,
        string entityType,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        // Parse entityId to Guid - required by repository interface
        if (!Guid.TryParse(entityId, out var entityIdGuid))
        {
            return Array.Empty<AuditEvent>();
        }

        var logs = await _auditLogRepository.GetByEntityAsync(entityType, entityIdGuid, cancellationToken);

        // Take only requested amount
        var limitedLogs = logs.Take(take);

        return limitedLogs.Select(log => new AuditEvent
        {
            Id = log.Id,
            Action = log.Action,
            EntityId = log.EntityId?.ToString() ?? "",
            EntityType = log.EntityType,
            TenantId = log.TenantId,
            UserId = log.UserId?.ToString(),
            UserEmail = ExtractFromDetails(log.Details, "email"),
            UserName = ExtractFromDetails(log.Details, "name"),
            Timestamp = log.Timestamp,
            IpAddress = log.IpAddress,
            UserAgent = log.UserAgent,
            Data = !string.IsNullOrEmpty(log.NewValues)
                ? JsonSerializer.Deserialize<Dictionary<string, object>>(log.NewValues)
                : null,
            ErrorMessage = log.ErrorMessage,
            IsError = log.StatusCode.HasValue && log.StatusCode >= 400
        }).ToList().AsReadOnly();
    }

    private static string? BuildUserDetails(ICurrentUser user)
    {
        if (user == null) return null;

        var details = new Dictionary<string, string?>
        {
            ["email"] = user.Email,
            ["name"] = user.Name
        };

        return JsonSerializer.Serialize(details);
    }

    private static string? ExtractFromDetails(string? details, string key)
    {
        if (string.IsNullOrEmpty(details)) return null;

        try
        {
            var dict = JsonSerializer.Deserialize<Dictionary<string, string>>(details);
            return dict?.GetValueOrDefault(key);
        }
        catch
        {
            return null;
        }
    }
}
