using Certus.Domain.Services;
using Hangfire;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.BackgroundJobs;

/// <summary>
/// Implementation of IValidationJobScheduler using Hangfire
/// Wraps Hangfire job client for clean architecture compliance
/// </summary>
public class ValidationJobScheduler : IValidationJobScheduler
{
    private readonly IBackgroundJobClient _jobClient;
    private readonly ILogger<ValidationJobScheduler> _logger;

    public ValidationJobScheduler(
        IBackgroundJobClient jobClient,
        ILogger<ValidationJobScheduler> logger)
    {
        _jobClient = jobClient;
        _logger = logger;
    }

    public string EnqueueValidation(Guid validationId, Guid? presetId = null, string triggeredBy = "system")
    {
        var jobId = _jobClient.Enqueue<ValidationProcessorJob>(
            job => job.ProcessValidationAsync(
                validationId,
                presetId,
                triggeredBy,
                CancellationToken.None));

        _logger.LogInformation(
            "Validation job enqueued: {JobId} | ValidationId: {ValidationId} | TriggeredBy: {TriggeredBy}",
            jobId, validationId, triggeredBy);

        return jobId;
    }

    public string EnqueueValidationWithDelay(Guid validationId, TimeSpan delay, Guid? presetId = null, string triggeredBy = "system")
    {
        var jobId = _jobClient.Schedule<ValidationProcessorJob>(
            job => job.ProcessValidationAsync(
                validationId,
                presetId,
                triggeredBy,
                CancellationToken.None),
            delay);

        _logger.LogInformation(
            "Validation job scheduled: {JobId} | ValidationId: {ValidationId} | Delay: {Delay}",
            jobId, validationId, delay);

        return jobId;
    }

    public string EnqueueBatchValidation(List<Guid> validationIds, Guid? presetId = null)
    {
        var jobId = _jobClient.Enqueue<ValidationProcessorJob>(
            job => job.ProcessBatchAsync(
                validationIds,
                presetId,
                CancellationToken.None));

        _logger.LogInformation(
            "Batch validation job enqueued: {JobId} | Count: {Count}",
            jobId, validationIds.Count);

        return jobId;
    }
}
