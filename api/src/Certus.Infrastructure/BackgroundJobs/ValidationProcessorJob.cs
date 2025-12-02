using Certus.Application.Common.Interfaces;
using Certus.Application.Features.Validations.Commands;
using Certus.Domain.Enums;
using Certus.Domain.Services;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire job for processing CONSAR file validations
/// Implements background processing with SignalR real-time notifications
/// Complies with CONSAR Circular 19-8 validation requirements
/// </summary>
public class ValidationProcessorJob
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _dbContext;
    private readonly IValidationNotificationService _notificationService;
    private readonly ILogger<ValidationProcessorJob> _logger;

    public ValidationProcessorJob(
        IMediator mediator,
        IApplicationDbContext dbContext,
        IValidationNotificationService notificationService,
        ILogger<ValidationProcessorJob> logger)
    {
        _mediator = mediator;
        _dbContext = dbContext;
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Process a single validation by ID
    /// Main entry point for background validation processing
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 30, 60, 120 })]
    [DisableConcurrentExecution(timeoutInSeconds: 1800)]
    [Queue("critical")]
    [JobDisplayName("Process Validation: {0}")]
    public async Task ProcessValidationAsync(
        Guid validationId,
        Guid? presetId = null,
        string triggeredBy = "system",
        CancellationToken cancellationToken = default)
    {
        var startTime = DateTime.UtcNow;
        _logger.LogInformation(
            "Starting validation processing for {ValidationId}, triggered by {TriggeredBy}",
            validationId, triggeredBy);

        // Load validation to get TenantId and UploadedById for notifications
        var validation = await _dbContext.Validations
            .AsNoTracking()
            .Where(v => v.Id == validationId)
            .Select(v => new { v.Id, v.TenantId, v.UploadedById, v.Status, v.FileName })
            .FirstOrDefaultAsync(cancellationToken);

        if (validation == null)
        {
            _logger.LogWarning("Validation {ValidationId} not found", validationId);
            return;
        }

        // Validate state - skip if already processed
        if (validation.Status != ValidationStatus.Pending && validation.Status != ValidationStatus.Processing)
        {
            _logger.LogInformation(
                "Validation {ValidationId} already processed with status {Status}, skipping",
                validationId, validation.Status);
            return;
        }

        try
        {
            // Notify clients that processing has started
            await NotifyProgressAsync(
                validationId, validation.TenantId, validation.UploadedById,
                0, 0, 0, "Iniciando", "Preparando validación...");

            // Execute the validation command
            var command = new ProcessValidationCommand(
                ValidationId: validationId,
                PresetId: presetId);

            var result = await _mediator.Send(command, cancellationToken);

            if (result.IsSuccess)
            {
                var data = result.Value;
                _logger.LogInformation(
                    "Validation {ValidationId} completed successfully: Status={Status}, Errors={Errors}, Warnings={Warnings}, Time={Time}ms",
                    validationId, data.Status, data.ErrorCount, data.WarningCount, data.ProcessingTimeMs);

                // Notify completion to all relevant groups (service handles dual-broadcast)
                await NotifyCompletionAsync(
                    validationId, validation.TenantId, validation.UploadedById,
                    data.Status.ToString(), data.ErrorCount, data.WarningCount,
                    data.TotalRecords, data.ValidRecords, validation.FileName);
            }
            else
            {
                _logger.LogWarning(
                    "Validation {ValidationId} failed: {Error}",
                    validationId, result.Error.Message);

                // CRITICAL FIX: Update validation state in DB when command returns failure
                // The ProcessValidationCommand should handle this, but we ensure it here
                await EnsureValidationErrorStateAsync(validationId, result.Error.Message, cancellationToken);

                // Notify error to all relevant groups (service handles dual-broadcast)
                await NotifyErrorAsync(
                    validationId, validation.TenantId, validation.UploadedById,
                    result.Error.Message, result.Error.Code);
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Validation {ValidationId} was cancelled", validationId);

            // Notify error
            await NotifyErrorAsync(
                validationId, validation.TenantId, validation.UploadedById,
                "La validación fue cancelada", "USER_CANCELLED");

            throw; // Re-throw for Hangfire to handle
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error processing validation {ValidationId}: {Message}",
                validationId, ex.Message);

            // Ensure validation is marked as error
            await EnsureValidationErrorStateAsync(validationId, ex.Message, CancellationToken.None);

            // Notify error
            await NotifyErrorAsync(
                validationId, validation.TenantId, validation.UploadedById,
                $"Error interno: {ex.Message}", "INTERNAL_ERROR");

            throw; // Re-throw for Hangfire retry logic
        }
    }

    /// <summary>
    /// Ensure validation is in Error state if processing failed
    /// This handles the case where ProcessValidationCommand fails but doesn't update the entity
    /// </summary>
    private async Task EnsureValidationErrorStateAsync(Guid validationId, string errorMessage, CancellationToken cancellationToken)
    {
        try
        {
            var validation = await _dbContext.Validations.FindAsync(new object[] { validationId }, cancellationToken);
            if (validation != null && validation.Status == ValidationStatus.Processing)
            {
                validation.CompleteWithErrors(1, 0);
                await _dbContext.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Marked validation {ValidationId} as Error due to processing failure", validationId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update validation {ValidationId} error state", validationId);
        }
    }

    /// <summary>
    /// Notify completion to all relevant SignalR groups
    /// The notification service handles broadcasting to both validation and tenant groups
    /// </summary>
    private async Task NotifyCompletionAsync(
        Guid validationId, Guid tenantId, Guid uploadedById,
        string status, int errorCount, int warningCount,
        int recordCount, int validRecordCount, string fileName)
    {
        var message = new ValidationCompletedMessage(
            validationId, tenantId, uploadedById,
            fileName, status, errorCount, warningCount, recordCount, validRecordCount);

        // Notify via service (handles dual-broadcast to validation and tenant groups)
        await _notificationService.NotifyValidationCompleted(validationId, tenantId, message);

        // Notify user who uploaded the file (CONSAR compliance - user notification)
        await _notificationService.NotifyUserUpdate(uploadedById, new
        {
            Type = "ValidationCompleted",
            ValidationId = validationId,
            Status = status,
            FileName = fileName,
            Message = status == "Success"
                ? $"Su archivo '{fileName}' ha sido validado exitosamente"
                : $"La validación de '{fileName}' ha finalizado con {errorCount} errores"
        });
    }

    /// <summary>
    /// Notify error to all relevant SignalR groups
    /// The notification service handles broadcasting to both validation and tenant groups
    /// </summary>
    private async Task NotifyErrorAsync(
        Guid validationId, Guid tenantId, Guid uploadedById,
        string error, string? details)
    {
        var message = new ValidationErrorMessage(validationId, tenantId, uploadedById, error, details);

        // Notify via service (handles dual-broadcast to validation and tenant groups)
        await _notificationService.NotifyValidationError(validationId, tenantId, message);

        // Notify user who uploaded
        await _notificationService.NotifyUserUpdate(uploadedById, new
        {
            Type = "ValidationError",
            ValidationId = validationId,
            Error = error,
            Message = $"Error en la validación: {error}"
        });
    }

    /// <summary>
    /// Helper method to send progress notifications
    /// </summary>
    private async Task NotifyProgressAsync(
        Guid validationId, Guid tenantId, Guid uploadedById,
        int progress, int recordsProcessed, int totalRecords,
        string status, string currentValidator)
    {
        try
        {
            var message = new ValidationProgressMessage(
                validationId, tenantId, uploadedById,
                progress, recordsProcessed, totalRecords, currentValidator, status);

            // Notify via service (handles dual-broadcast to validation and tenant groups)
            await _notificationService.NotifyValidationProgress(validationId, tenantId, message);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Failed to send progress notification for {ValidationId}", validationId);
        }
    }

    /// <summary>
    /// Process multiple validations in batch
    /// </summary>
    [AutomaticRetry(Attempts = 2, DelaysInSeconds = new[] { 60, 300 })]
    [Queue("default")]
    [JobDisplayName("Batch Process Validations ({0} items)")]
    public async Task ProcessBatchAsync(
        List<Guid> validationIds,
        Guid? presetId = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Starting batch validation processing for {Count} validations",
            validationIds.Count);

        var results = new List<(Guid Id, bool Success, string? Error)>();

        foreach (var validationId in validationIds)
        {
            cancellationToken.ThrowIfCancellationRequested();

            try
            {
                await ProcessValidationAsync(validationId, presetId, "batch", cancellationToken);
                results.Add((validationId, true, null));
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Batch: Validation {ValidationId} failed, continuing with others",
                    validationId);
                results.Add((validationId, false, ex.Message));
            }
        }

        var successCount = results.Count(r => r.Success);
        var failedCount = results.Count(r => !r.Success);

        _logger.LogInformation(
            "Batch validation completed: Success={Success}, Failed={Failed}",
            successCount, failedCount);
    }

    /// <summary>
    /// Reprocess failed validations within a date range
    /// </summary>
    [AutomaticRetry(Attempts = 1)]
    [Queue("default")]
    [JobDisplayName("Reprocess Failed Validations")]
    public async Task ReprocessFailedValidationsAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int maxCount = 50,
        CancellationToken cancellationToken = default)
    {
        var from = fromDate ?? DateTime.UtcNow.AddDays(-7);
        var to = toDate ?? DateTime.UtcNow;

        _logger.LogInformation(
            "Starting reprocess of failed validations from {From} to {To}",
            from, to);

        var failedValidations = await _dbContext.Validations
            .Where(v => v.Status == ValidationStatus.Error)
            .Where(v => v.CreatedAt >= from && v.CreatedAt <= to)
            .OrderByDescending(v => v.CreatedAt)
            .Take(maxCount)
            .Select(v => v.Id)
            .ToListAsync(cancellationToken);

        if (failedValidations.Count == 0)
        {
            _logger.LogInformation("No failed validations found to reprocess");
            return;
        }

        _logger.LogInformation(
            "Found {Count} failed validations to reprocess",
            failedValidations.Count);

        await ProcessBatchAsync(failedValidations, null, cancellationToken);
    }

    /// <summary>
    /// Process pending validations that haven't been processed
    /// </summary>
    [AutomaticRetry(Attempts = 1)]
    [Queue("default")]
    [JobDisplayName("Process Pending Validations")]
    public async Task ProcessPendingValidationsAsync(
        int maxAge = 60,
        int maxCount = 100,
        CancellationToken cancellationToken = default)
    {
        var cutoff = DateTime.UtcNow.AddMinutes(-maxAge);

        _logger.LogInformation(
            "Looking for pending validations older than {Cutoff}",
            cutoff);

        var pendingValidations = await _dbContext.Validations
            .Where(v => v.Status == ValidationStatus.Pending)
            .Where(v => v.CreatedAt < cutoff)
            .OrderBy(v => v.CreatedAt)
            .Take(maxCount)
            .Select(v => v.Id)
            .ToListAsync(cancellationToken);

        if (pendingValidations.Count == 0)
        {
            _logger.LogInformation("No orphaned pending validations found");
            return;
        }

        _logger.LogWarning(
            "Found {Count} orphaned pending validations - processing now",
            pendingValidations.Count);

        await ProcessBatchAsync(pendingValidations, null, cancellationToken);
    }

    /// <summary>
    /// Process stuck validations that are in Processing state for too long
    /// CONSAR compliance: Ensures no validations are left in limbo
    /// </summary>
    [AutomaticRetry(Attempts = 1)]
    [Queue("default")]
    [JobDisplayName("Process Stuck Validations")]
    public async Task ProcessStuckValidationsAsync(
        int maxProcessingMinutes = 30,
        int maxCount = 50,
        CancellationToken cancellationToken = default)
    {
        var cutoff = DateTime.UtcNow.AddMinutes(-maxProcessingMinutes);

        _logger.LogInformation(
            "Looking for stuck Processing validations older than {Cutoff}",
            cutoff);

        var stuckValidations = await _dbContext.Validations
            .Where(v => v.Status == ValidationStatus.Processing)
            .Where(v => v.ProcessingStartedAt != null && v.ProcessingStartedAt < cutoff)
            .OrderBy(v => v.ProcessingStartedAt)
            .Take(maxCount)
            .ToListAsync(cancellationToken);

        if (stuckValidations.Count == 0)
        {
            _logger.LogInformation("No stuck Processing validations found");
            return;
        }

        _logger.LogWarning(
            "Found {Count} stuck Processing validations - marking as error and reprocessing",
            stuckValidations.Count);

        foreach (var validation in stuckValidations)
        {
            // Mark as error first (to allow reprocessing)
            validation.CompleteWithErrors(1, 0);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        // Reprocess them
        var ids = stuckValidations.Select(v => v.Id).ToList();
        await ProcessBatchAsync(ids, null, cancellationToken);
    }
}

/// <summary>
/// Extension methods for Hangfire job registration
/// </summary>
public static class ValidationProcessorJobExtensions
{
    /// <summary>
    /// Register recurring validation cleanup jobs
    /// </summary>
    public static void RegisterValidationJobs(this IRecurringJobManager recurringJobManager)
    {
        // Process orphaned pending validations every 15 minutes
        recurringJobManager.AddOrUpdate<ValidationProcessorJob>(
            "validation-process-pending",
            job => job.ProcessPendingValidationsAsync(60, 100, CancellationToken.None),
            "*/15 * * * *",
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.FindSystemTimeZoneById("America/Mexico_City"),
                MisfireHandling = MisfireHandlingMode.Ignorable
            });

        // Process stuck Processing validations every 10 minutes
        recurringJobManager.AddOrUpdate<ValidationProcessorJob>(
            "validation-process-stuck",
            job => job.ProcessStuckValidationsAsync(30, 50, CancellationToken.None),
            "*/10 * * * *",
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.FindSystemTimeZoneById("America/Mexico_City"),
                MisfireHandling = MisfireHandlingMode.Ignorable
            });

        // Reprocess failed validations daily at 3 AM
        recurringJobManager.AddOrUpdate<ValidationProcessorJob>(
            "validation-reprocess-failed",
            job => job.ReprocessFailedValidationsAsync(null, null, 50, CancellationToken.None),
            "0 3 * * *",
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.FindSystemTimeZoneById("America/Mexico_City"),
                MisfireHandling = MisfireHandlingMode.Relaxed
            });
    }

    /// <summary>
    /// Enqueue a validation for background processing
    /// </summary>
    public static string EnqueueValidation(
        this IBackgroundJobClient jobClient,
        Guid validationId,
        Guid? presetId = null,
        string triggeredBy = "system")
    {
        return jobClient.Enqueue<ValidationProcessorJob>(
            job => job.ProcessValidationAsync(
                validationId,
                presetId,
                triggeredBy,
                CancellationToken.None));
    }

    /// <summary>
    /// Enqueue a validation with delay
    /// </summary>
    public static string EnqueueValidationWithDelay(
        this IBackgroundJobClient jobClient,
        Guid validationId,
        TimeSpan delay,
        Guid? presetId = null,
        string triggeredBy = "system")
    {
        return jobClient.Schedule<ValidationProcessorJob>(
            job => job.ProcessValidationAsync(
                validationId,
                presetId,
                triggeredBy,
                CancellationToken.None),
            delay);
    }

    /// <summary>
    /// Enqueue batch processing
    /// </summary>
    public static string EnqueueBatchValidation(
        this IBackgroundJobClient jobClient,
        List<Guid> validationIds,
        Guid? presetId = null)
    {
        return jobClient.Enqueue<ValidationProcessorJob>(
            job => job.ProcessBatchAsync(
                validationIds,
                presetId,
                CancellationToken.None));
    }
}
