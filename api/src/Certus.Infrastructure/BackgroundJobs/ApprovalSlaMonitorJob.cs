using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Domain.Events;
using Certus.Domain.Services;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire job for monitoring approval SLA status
/// CONSAR Compliance: Ensures approvals are processed within required timeframes
/// Automatically escalates when SLA is breached
/// </summary>
public class ApprovalSlaMonitorJob
{
    private readonly IApplicationDbContext _context;
    private readonly IApprovalNotificationService _notificationService;
    private readonly ILogger<ApprovalSlaMonitorJob> _logger;

    public ApprovalSlaMonitorJob(
        IApplicationDbContext context,
        IApprovalNotificationService notificationService,
        ILogger<ApprovalSlaMonitorJob> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Main monitoring job - runs every 5 minutes
    /// Checks all pending/in-review approvals for SLA status changes
    /// </summary>
    [AutomaticRetry(Attempts = 2)]
    [Queue("background")]
    public async Task MonitorApprovalSlasAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Starting approval SLA monitoring job");

        try
        {
            // Get all active approvals that need SLA monitoring
            var activeApprovals = await _context.Approvals
                .Include(a => a.Validation)
                .Where(a => a.Status == ApprovalStatus.Pending || a.Status == ApprovalStatus.InReview)
                .ToListAsync(cancellationToken);

            if (!activeApprovals.Any())
            {
                _logger.LogDebug("No active approvals to monitor");
                return;
            }

            var atRiskCount = 0;
            var breachedCount = 0;
            var autoEscalatedCount = 0;

            foreach (var approval in activeApprovals)
            {
                var previousSlaStatus = approval.SlaStatus;
                approval.CheckSlaStatus();

                // Status changed - handle accordingly
                if (previousSlaStatus != approval.SlaStatus)
                {
                    switch (approval.SlaStatus)
                    {
                        case SlaStatus.AtRisk:
                            atRiskCount++;
                            await HandleSlaAtRiskAsync(approval, cancellationToken);
                            break;

                        case SlaStatus.Critical:
                            atRiskCount++;
                            await HandleSlaCriticalAsync(approval, cancellationToken);
                            break;

                        case SlaStatus.Breached:
                            breachedCount++;
                            var wasEscalated = await HandleSlaBreachedAsync(approval, cancellationToken);
                            if (wasEscalated) autoEscalatedCount++;
                            break;
                    }
                }
            }

            // Save all status changes
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Approval SLA monitoring completed: {Total} approvals checked | AtRisk: {AtRisk} | Breached: {Breached} | AutoEscalated: {Escalated}",
                activeApprovals.Count, atRiskCount, breachedCount, autoEscalatedCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in approval SLA monitoring job");
            throw;
        }
    }

    /// <summary>
    /// Handle approval at risk - 75% of SLA time consumed
    /// Send warning notification to approver
    /// </summary>
    private async Task HandleSlaAtRiskAsync(Approval approval, CancellationToken cancellationToken)
    {
        var remainingMinutes = (int)(approval.DueDate - DateTime.UtcNow).TotalMinutes;

        _logger.LogWarning(
            "Approval {ApprovalId} SLA at risk | Remaining: {RemainingMinutes} min | DueDate: {DueDate}",
            approval.Id, remainingMinutes, approval.DueDate);

        await _notificationService.NotifySlaAtRiskAsync(new ApprovalSlaNotification(
            ApprovalId: approval.Id,
            ValidationId: approval.ValidationId,
            TenantId: approval.TenantId,
            FileName: approval.Validation?.FileName ?? "Unknown",
            Level: approval.Level.ToString(),
            SlaStatus: SlaStatus.AtRisk.ToString(),
            RemainingMinutes: remainingMinutes,
            OverdueMinutes: null,
            DueDate: approval.DueDate,
            AssignedToId: approval.AssignedToId
        ));
    }

    /// <summary>
    /// Handle approval critical - 90% of SLA time consumed
    /// Send urgent notification to approver and supervisors
    /// </summary>
    private async Task HandleSlaCriticalAsync(Approval approval, CancellationToken cancellationToken)
    {
        var remainingMinutes = (int)(approval.DueDate - DateTime.UtcNow).TotalMinutes;

        _logger.LogWarning(
            "Approval {ApprovalId} SLA CRITICAL | Remaining: {RemainingMinutes} min | Assigned: {AssignedTo}",
            approval.Id, remainingMinutes, approval.AssignedToName ?? "Unassigned");

        await _notificationService.NotifySlaAtRiskAsync(new ApprovalSlaNotification(
            ApprovalId: approval.Id,
            ValidationId: approval.ValidationId,
            TenantId: approval.TenantId,
            FileName: approval.Validation?.FileName ?? "Unknown",
            Level: approval.Level.ToString(),
            SlaStatus: SlaStatus.Critical.ToString(),
            RemainingMinutes: remainingMinutes,
            OverdueMinutes: null,
            DueDate: approval.DueDate,
            AssignedToId: approval.AssignedToId
        ));
    }

    /// <summary>
    /// Handle SLA breached - 100% of SLA time consumed
    /// Auto-escalate to next level if configured
    /// </summary>
    private async Task<bool> HandleSlaBreachedAsync(Approval approval, CancellationToken cancellationToken)
    {
        var overdueMinutes = (int)(DateTime.UtcNow - approval.DueDate).TotalMinutes;

        _logger.LogError(
            "Approval {ApprovalId} SLA BREACHED | Overdue: {OverdueMinutes} min | Level: {Level}",
            approval.Id, overdueMinutes, approval.Level);

        // Send breach notification
        await _notificationService.NotifySlaBreachedAsync(new ApprovalSlaNotification(
            ApprovalId: approval.Id,
            ValidationId: approval.ValidationId,
            TenantId: approval.TenantId,
            FileName: approval.Validation?.FileName ?? "Unknown",
            Level: approval.Level.ToString(),
            SlaStatus: SlaStatus.Breached.ToString(),
            RemainingMinutes: null,
            OverdueMinutes: overdueMinutes,
            DueDate: approval.DueDate,
            AssignedToId: approval.AssignedToId
        ));

        // Auto-escalate if not already at highest level
        if (ShouldAutoEscalate(approval))
        {
            var nextLevel = GetNextApprovalLevel(approval.Level);
            if (nextLevel.HasValue)
            {
                var escalated = approval.Escalate(
                    $"Auto-escalación por SLA vencido ({overdueMinutes} minutos de retraso)",
                    Guid.Empty, // System escalation
                    nextLevel.Value);

                _context.Approvals.Add(escalated);

                _logger.LogWarning(
                    "Auto-escalated approval {ApprovalId} from {FromLevel} to {ToLevel} due to SLA breach",
                    approval.Id, approval.Level, nextLevel.Value);

                // Notify about escalation
                await _notificationService.NotifyApprovalEscalatedAsync(new ApprovalEscalatedNotification(
                    ApprovalId: approval.Id,
                    NewApprovalId: escalated.Id,
                    ValidationId: approval.ValidationId,
                    TenantId: approval.TenantId,
                    FileName: approval.Validation?.FileName ?? "Unknown",
                    FromLevel: approval.Level.ToString(),
                    ToLevel: nextLevel.Value.ToString(),
                    Reason: "Auto-escalación por SLA vencido",
                    EscalatedById: null,
                    EscalatedAt: DateTime.UtcNow
                ));

                return true;
            }
        }

        return false;
    }

    /// <summary>
    /// Determine if approval should be auto-escalated
    /// </summary>
    private static bool ShouldAutoEscalate(Approval approval)
    {
        // Don't escalate if already escalated or at Director level
        return !approval.IsEscalated && approval.Level != ApprovalLevel.Director;
    }

    /// <summary>
    /// Get next approval level for escalation
    /// </summary>
    private static ApprovalLevel? GetNextApprovalLevel(ApprovalLevel currentLevel)
    {
        return currentLevel switch
        {
            ApprovalLevel.Auto => ApprovalLevel.Analyst,
            ApprovalLevel.Analyst => ApprovalLevel.Supervisor,
            ApprovalLevel.Supervisor => ApprovalLevel.Manager,
            ApprovalLevel.Manager => ApprovalLevel.Director,
            ApprovalLevel.Director => null, // Already at highest level
            _ => null
        };
    }

    /// <summary>
    /// Daily summary job - runs once per day
    /// Generates summary of all approval SLA performance
    /// </summary>
    [AutomaticRetry(Attempts = 1)]
    [Queue("background")]
    public async Task GenerateDailySlaReportAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generating daily approval SLA report");

        try
        {
            var yesterday = DateTime.UtcNow.Date.AddDays(-1);
            var today = DateTime.UtcNow.Date;

            // Get approvals resolved yesterday
            var resolvedApprovals = await _context.Approvals
                .Where(a => a.ResolvedAt >= yesterday && a.ResolvedAt < today)
                .ToListAsync(cancellationToken);

            // Get currently overdue approvals
            var overdueApprovals = await _context.Approvals
                .Where(a => (a.Status == ApprovalStatus.Pending || a.Status == ApprovalStatus.InReview)
                    && a.IsOverdue)
                .ToListAsync(cancellationToken);

            var resolvedOnTime = resolvedApprovals.Count(a => a.SlaStatus == SlaStatus.OnTime);
            var resolvedBreached = resolvedApprovals.Count(a => a.SlaStatus == SlaStatus.Breached);
            var avgResponseTime = resolvedApprovals
                .Where(a => a.ResponseTimeMinutes.HasValue)
                .Select(a => a.ResponseTimeMinutes!.Value)
                .DefaultIfEmpty(0)
                .Average();

            _logger.LogInformation(
                "Daily SLA Report | Resolved: {Resolved} (OnTime: {OnTime}, Breached: {Breached}) | Currently Overdue: {Overdue} | Avg Response: {AvgMinutes} min",
                resolvedApprovals.Count, resolvedOnTime, resolvedBreached, overdueApprovals.Count, avgResponseTime);

            // TODO: Send email report to administrators
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating daily SLA report");
            throw;
        }
    }
}

/// <summary>
/// Extension methods to register approval jobs with Hangfire
/// </summary>
public static class ApprovalJobsExtensions
{
    /// <summary>
    /// Register recurring approval monitoring jobs
    /// </summary>
    public static void RegisterApprovalJobs(this IRecurringJobManager recurringJobManager)
    {
        // Monitor SLA status every 5 minutes
        recurringJobManager.AddOrUpdate<ApprovalSlaMonitorJob>(
            "approval-sla-monitor",
            job => job.MonitorApprovalSlasAsync(CancellationToken.None),
            "*/5 * * * *", // Every 5 minutes
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.FindSystemTimeZoneById("America/Mexico_City")
            });

        // Generate daily SLA report at 6 AM Mexico City time
        recurringJobManager.AddOrUpdate<ApprovalSlaMonitorJob>(
            "approval-daily-sla-report",
            job => job.GenerateDailySlaReportAsync(CancellationToken.None),
            "0 6 * * *", // Daily at 6 AM
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.FindSystemTimeZoneById("America/Mexico_City")
            });
    }
}
