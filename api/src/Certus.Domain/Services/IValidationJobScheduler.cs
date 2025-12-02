namespace Certus.Domain.Services;

/// <summary>
/// Interface for scheduling validation processing jobs
/// Abstracts background job implementation details from the Application layer
/// </summary>
public interface IValidationJobScheduler
{
    /// <summary>
    /// Enqueue a validation for background processing
    /// </summary>
    /// <param name="validationId">The validation ID to process</param>
    /// <param name="presetId">Optional preset ID for custom validator selection</param>
    /// <param name="triggeredBy">Who triggered the processing (upload/manual/system)</param>
    /// <returns>The background job ID</returns>
    string EnqueueValidation(Guid validationId, Guid? presetId = null, string triggeredBy = "system");

    /// <summary>
    /// Enqueue a validation with delay
    /// </summary>
    /// <param name="validationId">The validation ID to process</param>
    /// <param name="delay">Delay before processing starts</param>
    /// <param name="presetId">Optional preset ID</param>
    /// <param name="triggeredBy">Who triggered the processing</param>
    /// <returns>The background job ID</returns>
    string EnqueueValidationWithDelay(Guid validationId, TimeSpan delay, Guid? presetId = null, string triggeredBy = "system");

    /// <summary>
    /// Enqueue batch processing of validations
    /// </summary>
    /// <param name="validationIds">List of validation IDs to process</param>
    /// <param name="presetId">Optional preset ID</param>
    /// <returns>The background job ID</returns>
    string EnqueueBatchValidation(List<Guid> validationIds, Guid? presetId = null);
}
