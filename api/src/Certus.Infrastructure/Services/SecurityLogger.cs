using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Certus.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.Services;

/// <summary>
/// Security-focused logging implementation with PII protection
/// Best Practice 2025: Structured security logging for compliance and threat detection
/// </summary>
public sealed partial class SecurityLogger : ISecurityLogger
{
    private readonly ILogger<SecurityLogger> _logger;
    private readonly ICurrentUserService _currentUserService;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    // PII masking patterns
    [GeneratedRegex(@"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", RegexOptions.Compiled)]
    private static partial Regex EmailPattern();

    [GeneratedRegex(@"\b\d{3}\.\d{3}\.\d{3}\.\d{3}\b", RegexOptions.Compiled)]
    private static partial Regex IpPattern();

    public SecurityLogger(
        ILogger<SecurityLogger> logger,
        ICurrentUserService currentUserService)
    {
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public Task LogAuthenticationEventAsync(SecurityAuthEvent authEvent, CancellationToken cancellationToken = default)
    {
        var logLevel = authEvent.Severity switch
        {
            SecurityEventSeverity.Critical => LogLevel.Critical,
            SecurityEventSeverity.Error => LogLevel.Error,
            SecurityEventSeverity.Warning => LogLevel.Warning,
            SecurityEventSeverity.Debug => LogLevel.Debug,
            _ => LogLevel.Information
        };

        // Structured log with masked PII
        _logger.Log(
            logLevel,
            "[SECURITY:AUTH] {EventType} | CorrelationId={CorrelationId} | Email={Email} | UserId={UserId} | " +
            "Success={Success} | FailureReason={FailureReason} | FailedAttempts={FailedAttempts} | " +
            "MfaUsed={MfaUsed} | IP={IpAddress} | TenantId={TenantId} | Timestamp={Timestamp}",
            authEvent.EventType,
            authEvent.CorrelationId,
            MaskEmail(authEvent.Email),
            authEvent.UserId,
            authEvent.Success,
            authEvent.FailureReason ?? "N/A",
            authEvent.FailedAttempts ?? 0,
            authEvent.MfaUsed,
            MaskIpAddress(authEvent.IpAddress),
            authEvent.TenantId,
            authEvent.Timestamp.ToString("O"));

        // Log threat indicators
        if (authEvent.FailedAttempts >= 3)
        {
            _logger.LogWarning(
                "[SECURITY:THREAT] Multiple failed auth attempts detected | Email={Email} | Attempts={Attempts} | IP={IP}",
                MaskEmail(authEvent.Email),
                authEvent.FailedAttempts,
                MaskIpAddress(authEvent.IpAddress));
        }

        return Task.CompletedTask;
    }

    public Task LogRegistrationEventAsync(SecurityRegistrationEvent registrationEvent, CancellationToken cancellationToken = default)
    {
        var logLevel = registrationEvent.Success ? LogLevel.Information : LogLevel.Warning;

        if (registrationEvent.Severity >= SecurityEventSeverity.Error)
            logLevel = LogLevel.Error;

        _logger.Log(
            logLevel,
            "[SECURITY:REGISTRATION] {EventType} | CorrelationId={CorrelationId} | Email={Email} | " +
            "Organization={OrganizationName} | AforeCode={AforeCode} | Success={Success} | " +
            "FailureReason={FailureReason} | ValidationErrors={ValidationErrors} | " +
            "CreatedTenantId={TenantId} | CreatedUserId={UserId} | IP={IpAddress} | Timestamp={Timestamp}",
            registrationEvent.EventType,
            registrationEvent.CorrelationId,
            MaskEmail(registrationEvent.Email),
            registrationEvent.OrganizationName,
            registrationEvent.AforeCode,
            registrationEvent.Success,
            registrationEvent.FailureReason ?? "N/A",
            registrationEvent.ValidationErrorsCount,
            registrationEvent.CreatedTenantId,
            registrationEvent.CreatedUserId,
            MaskIpAddress(registrationEvent.IpAddress),
            registrationEvent.Timestamp.ToString("O"));

        // Track suspicious registration patterns
        if (!registrationEvent.Success && registrationEvent.ValidationErrorsCount > 5)
        {
            _logger.LogWarning(
                "[SECURITY:THREAT] Suspicious registration attempt - many validation errors | " +
                "Email={Email} | ErrorCount={ErrorCount} | IP={IP}",
                MaskEmail(registrationEvent.Email),
                registrationEvent.ValidationErrorsCount,
                MaskIpAddress(registrationEvent.IpAddress));
        }

        return Task.CompletedTask;
    }

    public Task LogAuthorizationEventAsync(SecurityAuthorizationEvent authzEvent, CancellationToken cancellationToken = default)
    {
        var logLevel = authzEvent.AccessGranted ? LogLevel.Information : LogLevel.Warning;

        if (authzEvent.EventType == AuthzEventType.CrossTenantAccessAttempt)
            logLevel = LogLevel.Warning;

        _logger.Log(
            logLevel,
            "[SECURITY:AUTHZ] {EventType} | CorrelationId={CorrelationId} | UserId={UserId} | " +
            "Resource={Resource} | Action={Action} | AccessGranted={AccessGranted} | " +
            "RequiredPermission={RequiredPermission} | UserRole={UserRole} | TenantId={TenantId} | " +
            "IP={IpAddress} | Timestamp={Timestamp}",
            authzEvent.EventType,
            authzEvent.CorrelationId,
            authzEvent.UserId,
            authzEvent.Resource,
            authzEvent.Action,
            authzEvent.AccessGranted,
            authzEvent.RequiredPermission,
            authzEvent.UserRole,
            authzEvent.TenantId,
            MaskIpAddress(authzEvent.IpAddress),
            authzEvent.Timestamp.ToString("O"));

        return Task.CompletedTask;
    }

    public Task LogSuspiciousActivityAsync(SecurityThreatEvent threatEvent, CancellationToken cancellationToken = default)
    {
        var logLevel = threatEvent.Severity switch
        {
            SecurityEventSeverity.Critical => LogLevel.Critical,
            SecurityEventSeverity.Error => LogLevel.Error,
            _ => LogLevel.Warning
        };

        _logger.Log(
            logLevel,
            "[SECURITY:THREAT] {EventType} | CorrelationId={CorrelationId} | Description={Description} | " +
            "ThreatScore={ThreatScore} | UserId={UserId} | Email={Email} | " +
            "AutomaticActionTaken={AutoAction} | ActionTaken={ActionTaken} | " +
            "IP={IpAddress} | TenantId={TenantId} | RelatedEvents={RelatedEvents} | Timestamp={Timestamp}",
            threatEvent.EventType,
            threatEvent.CorrelationId,
            threatEvent.Description,
            threatEvent.ThreatScore,
            threatEvent.UserId,
            MaskEmail(threatEvent.Email),
            threatEvent.AutomaticActionTaken,
            threatEvent.ActionTaken ?? "None",
            MaskIpAddress(threatEvent.IpAddress),
            threatEvent.TenantId,
            threatEvent.RelatedEventIds != null ? string.Join(",", threatEvent.RelatedEventIds) : "None",
            threatEvent.Timestamp.ToString("O"));

        // Critical threats should be escalated
        if (threatEvent.ThreatScore >= 80)
        {
            _logger.LogCritical(
                "[SECURITY:ESCALATE] High threat score detected | Type={Type} | Score={Score} | IP={IP}",
                threatEvent.EventType,
                threatEvent.ThreatScore,
                MaskIpAddress(threatEvent.IpAddress));
        }

        return Task.CompletedTask;
    }

    public Task LogDataAccessEventAsync(SecurityDataAccessEvent dataEvent, CancellationToken cancellationToken = default)
    {
        var logLevel = dataEvent.EventType switch
        {
            DataAccessEventType.SensitiveDataAccess => LogLevel.Warning,
            DataAccessEventType.PiiAccess => LogLevel.Warning,
            DataAccessEventType.BulkAccess => LogLevel.Warning,
            DataAccessEventType.Export => LogLevel.Information,
            _ => LogLevel.Debug
        };

        _logger.Log(
            logLevel,
            "[SECURITY:DATA] {EventType} | CorrelationId={CorrelationId} | UserId={UserId} | " +
            "DataType={DataType} | EntityId={EntityId} | RecordCount={RecordCount} | " +
            "DataExported={DataExported} | ExportFormat={ExportFormat} | " +
            "ComplianceClass={ComplianceClass} | TenantId={TenantId} | IP={IpAddress} | Timestamp={Timestamp}",
            dataEvent.EventType,
            dataEvent.CorrelationId,
            dataEvent.UserId,
            dataEvent.DataType,
            dataEvent.EntityId,
            dataEvent.RecordCount,
            dataEvent.DataExported,
            dataEvent.ExportFormat ?? "N/A",
            dataEvent.ComplianceClassification ?? "Standard",
            dataEvent.TenantId,
            MaskIpAddress(dataEvent.IpAddress),
            dataEvent.Timestamp.ToString("O"));

        // Log bulk data access for compliance
        if (dataEvent.RecordCount > 100)
        {
            _logger.LogInformation(
                "[SECURITY:COMPLIANCE] Bulk data access | UserId={UserId} | DataType={DataType} | Count={Count}",
                dataEvent.UserId,
                dataEvent.DataType,
                dataEvent.RecordCount);
        }

        return Task.CompletedTask;
    }

    public Task LogRateLimitViolationAsync(SecurityRateLimitEvent rateLimitEvent, CancellationToken cancellationToken = default)
    {
        var logLevel = rateLimitEvent.IsRepeatedViolation ? LogLevel.Warning : LogLevel.Information;

        _logger.Log(
            logLevel,
            "[SECURITY:RATELIMIT] Policy={PolicyName} | CorrelationId={CorrelationId} | " +
            "Email={Email} | Endpoint={Endpoint} | RequestCount={RequestCount} | " +
            "Limit={Limit} | WindowSeconds={Window} | IsRepeated={IsRepeated} | " +
            "IP={IpAddress} | TenantId={TenantId} | Timestamp={Timestamp}",
            rateLimitEvent.PolicyName,
            rateLimitEvent.CorrelationId,
            MaskEmail(rateLimitEvent.Email),
            rateLimitEvent.Endpoint,
            rateLimitEvent.RequestCount,
            rateLimitEvent.Limit,
            rateLimitEvent.WindowSeconds,
            rateLimitEvent.IsRepeatedViolation,
            MaskIpAddress(rateLimitEvent.IpAddress),
            rateLimitEvent.TenantId,
            rateLimitEvent.Timestamp.ToString("O"));

        // Escalate repeated violations
        if (rateLimitEvent.IsRepeatedViolation)
        {
            _logger.LogWarning(
                "[SECURITY:THREAT] Repeated rate limit violation | IP={IP} | Endpoint={Endpoint} | Policy={Policy}",
                MaskIpAddress(rateLimitEvent.IpAddress),
                rateLimitEvent.Endpoint,
                rateLimitEvent.PolicyName);
        }

        return Task.CompletedTask;
    }

    // ============================================================================
    // PII MASKING UTILITIES
    // ============================================================================

    /// <summary>
    /// Masks email address: john.doe@example.com -> j***e@e***.com
    /// </summary>
    private static string? MaskEmail(string? email)
    {
        if (string.IsNullOrEmpty(email))
            return null;

        var atIndex = email.IndexOf('@');
        if (atIndex <= 0)
            return "***@***";

        var localPart = email[..atIndex];
        var domainPart = email[(atIndex + 1)..];

        var maskedLocal = localPart.Length <= 2
            ? "***"
            : $"{localPart[0]}***{localPart[^1]}";

        var dotIndex = domainPart.LastIndexOf('.');
        var maskedDomain = dotIndex > 0
            ? $"{domainPart[0]}***{domainPart[dotIndex..]}"
            : "***";

        return $"{maskedLocal}@{maskedDomain}";
    }

    /// <summary>
    /// Masks IP address: 192.168.1.100 -> 192.168.xxx.xxx
    /// </summary>
    private static string? MaskIpAddress(string? ip)
    {
        if (string.IsNullOrEmpty(ip))
            return null;

        // Handle IPv6 localhost
        if (ip == "::1")
            return "::1";

        // Handle IPv4
        var parts = ip.Split('.');
        if (parts.Length == 4)
        {
            return $"{parts[0]}.{parts[1]}.xxx.xxx";
        }

        // Handle IPv6 - mask last 4 segments
        var ipv6Parts = ip.Split(':');
        if (ipv6Parts.Length >= 4)
        {
            var masked = string.Join(":", ipv6Parts.Take(4).Concat(new[] { "xxxx", "xxxx", "xxxx", "xxxx" }));
            return masked;
        }

        return "xxx.xxx.xxx.xxx";
    }

    /// <summary>
    /// Generates a hash for PII data that needs to be correlated but not exposed
    /// </summary>
    public static string HashPii(string value)
    {
        if (string.IsNullOrEmpty(value))
            return string.Empty;

        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value.ToLowerInvariant()));
        return Convert.ToHexString(bytes)[..16]; // First 16 chars of hash
    }
}
