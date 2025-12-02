using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Domain.Events;
using Certus.Domain.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Certus.Application.Features.Approvals.EventHandlers;

/// <summary>
/// Handles ValidationCompletedEvent to auto-create approvals when validation has errors
/// CONSAR Compliance: Ensures failed validations automatically trigger approval workflow
/// </summary>
public class ValidationCompletedEventHandler : INotificationHandler<ValidationCompletedEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IApprovalNotificationService _notificationService;
    private readonly ILogger<ValidationCompletedEventHandler> _logger;

    public ValidationCompletedEventHandler(
        IApplicationDbContext context,
        IApprovalNotificationService notificationService,
        ILogger<ValidationCompletedEventHandler> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ValidationCompletedEvent notification, CancellationToken cancellationToken)
    {
        // Only create approval if validation requires authorization (has errors)
        if (!notification.RequiresAuthorization)
        {
            _logger.LogDebug(
                "Validation {ValidationId} completed successfully, no approval required",
                notification.ValidationId);
            return;
        }

        try
        {
            // Load validation with user details
            var validation = await _context.Validations
                .Include(v => v.UploadedBy)
                .FirstOrDefaultAsync(v => v.Id == notification.ValidationId, cancellationToken);

            if (validation == null)
            {
                _logger.LogWarning(
                    "Validation {ValidationId} not found, cannot create approval",
                    notification.ValidationId);
                return;
            }

            // Check if approval already exists for this validation
            var existingApproval = await _context.Approvals
                .AnyAsync(a => a.ValidationId == notification.ValidationId
                    && a.Status != ApprovalStatus.Cancelled
                    && a.Status != ApprovalStatus.Rejected,
                    cancellationToken);

            if (existingApproval)
            {
                _logger.LogDebug(
                    "Approval already exists for validation {ValidationId}",
                    notification.ValidationId);
                return;
            }

            // Determine approval level and SLA based on error count and severity
            var (level, slaHours, priority) = DetermineApprovalParameters(
                notification.ErrorCount,
                notification.WarningCount,
                validation.FileType);

            // Create the approval
            var approval = Approval.Create(
                validationId: validation.Id,
                requestedById: validation.UploadedById,
                requestedByName: validation.UploadedBy?.FullName ?? "Sistema",
                tenantId: validation.TenantId,
                level: level,
                requestReason: $"Validación fallida con {notification.ErrorCount} errores y {notification.WarningCount} advertencias",
                requestNotes: $"Archivo: {notification.FileName} | Estado: {notification.Status}",
                priority: priority,
                slaHours: slaHours);

            _context.Approvals.Add(approval);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Auto-created approval {ApprovalId} for validation {ValidationId} | Level: {Level} | SLA: {SlaHours}h | Priority: {Priority}",
                approval.Id, validation.Id, level, slaHours, priority);

            // Send real-time notification
            await _notificationService.NotifyApprovalCreatedAsync(new ApprovalCreatedNotification(
                ApprovalId: approval.Id,
                ValidationId: validation.Id,
                TenantId: validation.TenantId,
                FileName: notification.FileName,
                FileType: validation.FileType.ToString(),
                Level: level.ToString(),
                Status: ApprovalStatus.Pending.ToString(),
                Priority: priority,
                ErrorCount: notification.ErrorCount,
                WarningCount: notification.WarningCount,
                RequestedById: validation.UploadedById,
                RequestedByName: validation.UploadedBy?.FullName ?? "Sistema",
                DueDate: approval.DueDate,
                RequestedAt: approval.RequestedAt
            ));

            // Notify tenant members about new approval
            await _notificationService.NotifyTenantUpdateAsync(validation.TenantId, new
            {
                type = "approval_created",
                approvalId = approval.Id,
                validationId = validation.Id,
                fileName = notification.FileName,
                level = level.ToString(),
                priority,
                dueDate = approval.DueDate
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to create approval for validation {ValidationId}",
                notification.ValidationId);
            throw;
        }
    }

    /// <summary>
    /// Determines approval level, SLA, and priority based on validation results
    /// CONSAR Compliance: Higher error counts require higher approval levels
    /// </summary>
    private static (ApprovalLevel level, int slaHours, int priority) DetermineApprovalParameters(
        int errorCount,
        int warningCount,
        FileType fileType)
    {
        // Critical files (Nómina, Contable) get higher priority
        var isCriticalFile = fileType == FileType.Nomina ||
                            fileType == FileType.Contable ||
                            fileType == FileType.Regularizacion;

        // Determine based on error severity
        return (errorCount, isCriticalFile) switch
        {
            // Critical: >100 errors OR >50 errors in critical file → Director level
            ( > 100, _) => (ApprovalLevel.Director, 8, 1),
            ( > 50, true) => (ApprovalLevel.Director, 8, 1),

            // High: 50-100 errors OR >20 errors in critical file → Manager level
            ( > 50, _) => (ApprovalLevel.Manager, 12, 1),
            ( > 20, true) => (ApprovalLevel.Manager, 12, 1),

            // Medium: 10-50 errors → Supervisor level
            ( > 10, _) => (ApprovalLevel.Supervisor, 24, 2),
            ( > 5, true) => (ApprovalLevel.Supervisor, 24, 2),

            // Low: <10 errors → Analyst level
            _ => (ApprovalLevel.Analyst, 48, 3)
        };
    }
}

/// <summary>
/// Handles ValidationFailedEvent for additional processing
/// </summary>
public class ValidationFailedEventHandler : INotificationHandler<ValidationFailedEvent>
{
    private readonly ILogger<ValidationFailedEventHandler> _logger;

    public ValidationFailedEventHandler(ILogger<ValidationFailedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ValidationFailedEvent notification, CancellationToken cancellationToken)
    {
        // Log the failure - actual approval creation is handled by ValidationCompletedEvent
        _logger.LogWarning(
            "Validation {ValidationId} failed: {ErrorMessage} | Errors: {ErrorCount}",
            notification.ValidationId,
            notification.ErrorMessage,
            notification.ErrorCount);

        return Task.CompletedTask;
    }
}
