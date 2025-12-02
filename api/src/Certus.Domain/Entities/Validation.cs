using Certus.Domain.Common;
using Certus.Domain.Enums;
using Certus.Domain.Events;

namespace Certus.Domain.Entities;

/// <summary>
/// Validación de archivo CONSAR - Entidad principal del sistema
/// Aggregate Root for validation bounded context
/// </summary>
public class Validation : TenantEntity
{
    public string FileName { get; private set; } = string.Empty;
    public FileType FileType { get; private set; }
    public long FileSize { get; private set; }
    public string FilePath { get; private set; } = string.Empty;
    public string? MimeType { get; private set; }
    public string? Checksum { get; private set; }
    public ValidationStatus Status { get; private set; } = ValidationStatus.Pending;

    // Processing metrics
    public int RecordCount { get; private set; } = 0;
    public int ValidRecordCount { get; private set; } = 0;
    public int ErrorCount { get; private set; } = 0;
    public int WarningCount { get; private set; } = 0;
    public int Progress { get; private set; } = 0;

    /// <summary>
    /// Total number of validators executed for this validation
    /// This is the unique count of validators (not executions per record)
    /// </summary>
    public int TotalValidatorsExecuted { get; private set; } = 0;

    // Compatibility aliases
    public int TotalRecords => RecordCount;
    public int ValidRecords => ValidRecordCount;
    public long ProcessingTimeMs => ProcessedAt.HasValue && ProcessingStartedAt.HasValue
        ? (long)(ProcessedAt.Value - ProcessingStartedAt.Value).TotalMilliseconds
        : 0;
    public DateTime? CompletedAt => ProcessedAt;

    // Timestamps
    public DateTime UploadedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? ProcessingStartedAt { get; private set; }
    public DateTime? ProcessedAt { get; private set; }
    public DateTime? ValidatedAt { get; private set; }

    // Versioning (CONSAR compliance - Retransmisión)
    public int Version { get; private set; } = 1;
    public bool IsOriginal { get; private set; } = true;
    public bool IsSubstitute { get; private set; } = false;
    public Guid? ReplacesId { get; private set; }
    public Guid? ReplacedById { get; private set; }
    public string? SubstitutionReason { get; private set; }
    public DateTime? SupersededAt { get; private set; }
    public string? SupersededBy { get; private set; }

    // CONSAR metadata
    public string? ConsarDirectory { get; private set; } // RECEPCION, RETRANSMISION
    public bool RequiresAuthorization { get; private set; } = false;
    public string? AuthorizationStatus { get; private set; } // pending, approved, rejected
    public DateTime? AuthorizationDate { get; private set; }
    public string? AuthorizationOffice { get; private set; }

    // Relations
    public Guid UploadedById { get; private set; }
    public virtual User UploadedBy { get; private set; } = null!;
    // Nota: La relación con Tenant es implícita a través de TenantId heredado de TenantEntity
    // No se define navegación explícita para evitar conflictos con la propiedad TenantId de la clase base

    // Version chain
    public virtual Validation? ReplacesValidation { get; private set; }
    public virtual Validation? ReplacedByValidation { get; private set; }

    // Related entities
    public virtual ICollection<ValidationError> Errors { get; private set; } = new List<ValidationError>();
    public virtual ICollection<ValidationWarning> Warnings { get; private set; } = new List<ValidationWarning>();
    public virtual ICollection<ValidatorResult> ValidatorResults { get; private set; } = new List<ValidatorResult>();
    public virtual ICollection<TimelineEvent> Timeline { get; private set; } = new List<TimelineEvent>();

    private Validation() { } // EF Core

    public static Validation Create(
        string fileName,
        FileType fileType,
        long fileSize,
        string filePath,
        Guid uploadedById,
        Guid tenantId,
        string? mimeType = null,
        string? checksum = null)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("FileName is required", nameof(fileName));

        if (string.IsNullOrWhiteSpace(filePath))
            throw new ArgumentException("FilePath is required", nameof(filePath));

        var validation = new Validation
        {
            FileName = fileName,
            FileType = fileType,
            FileSize = fileSize,
            FilePath = filePath,
            MimeType = mimeType,
            Checksum = checksum,
            UploadedById = uploadedById,
            TenantId = tenantId,
            ConsarDirectory = "RECEPCION"
        };

        validation.AddDomainEvent(new ValidationCreatedEvent(
            validation.Id,
            fileName,
            fileType,
            uploadedById,
            tenantId));

        return validation;
    }

    /// <summary>
    /// Crear versión sustituta (retransmisión CONSAR)
    /// </summary>
    public static Validation CreateSubstitute(
        Validation original,
        string fileName,
        long fileSize,
        string filePath,
        string substitutionReason,
        Guid uploadedById,
        string? checksum = null)
    {
        var substitute = new Validation
        {
            FileName = fileName,
            FileType = original.FileType,
            FileSize = fileSize,
            FilePath = filePath,
            Checksum = checksum,
            UploadedById = uploadedById,
            TenantId = original.TenantId,
            Version = original.Version + 1,
            IsOriginal = false,
            IsSubstitute = true,
            ReplacesId = original.Id,
            SubstitutionReason = substitutionReason,
            ConsarDirectory = "RETRANSMISION"
        };

        return substitute;
    }

    public void StartProcessing()
    {
        Status = ValidationStatus.Processing;
        ProcessingStartedAt = DateTime.UtcNow;
        Progress = 0;
        AddTimelineEvent("processing_started", "Iniciando procesamiento de validación");

        AddDomainEvent(new ValidationProcessingStartedEvent(Id, FileName, RecordCount));
    }

    public void UpdateProgress(int progress, int recordCount = 0, int validRecordCount = 0)
    {
        Progress = Math.Clamp(progress, 0, 100);
        if (recordCount > 0) RecordCount = recordCount;
        if (validRecordCount > 0) ValidRecordCount = validRecordCount;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Sets the total number of unique validators that were executed
    /// </summary>
    public void SetTotalValidatorsExecuted(int count)
    {
        TotalValidatorsExecuted = count;
    }

    public void CompleteWithSuccess()
    {
        Status = ValidationStatus.Success;
        ProcessedAt = DateTime.UtcNow;
        ValidatedAt = DateTime.UtcNow;
        Progress = 100;
        AddTimelineEvent("validation_completed", "Validación completada exitosamente");

        AddDomainEvent(new ValidationCompletedEvent(
            Id, FileName, Status, RecordCount, ValidRecordCount,
            ErrorCount, WarningCount, RequiresAuthorization));
    }

    public void CompleteWithWarnings(int warningCount)
    {
        Status = ValidationStatus.Warning;
        WarningCount = warningCount;
        ProcessedAt = DateTime.UtcNow;
        ValidatedAt = DateTime.UtcNow;
        Progress = 100;
        AddTimelineEvent("validation_completed_warnings", $"Validación completada con {warningCount} advertencias");

        AddDomainEvent(new ValidationCompletedEvent(
            Id, FileName, Status, RecordCount, ValidRecordCount,
            ErrorCount, WarningCount, RequiresAuthorization));
    }

    public void CompleteWithErrors(int errorCount, int warningCount = 0)
    {
        Status = ValidationStatus.Error;
        ErrorCount = errorCount;
        WarningCount = warningCount;
        ProcessedAt = DateTime.UtcNow;
        Progress = 100;
        RequiresAuthorization = true;
        AuthorizationStatus = "pending";
        AddTimelineEvent("validation_failed", $"Validación fallida con {errorCount} errores");

        AddDomainEvent(new ValidationFailedEvent(Id, FileName, $"Validación fallida con {errorCount} errores", errorCount));
    }

    public void Cancel(string reason, string cancelledBy = "system")
    {
        Status = ValidationStatus.Cancelled;
        AddTimelineEvent("validation_cancelled", $"Validación cancelada: {reason}");

        AddDomainEvent(new ValidationCancelledEvent(Id, reason, cancelledBy));
    }

    public void MarkAsSuperseded(Guid replacedById, string supersededBy)
    {
        ReplacedById = replacedById;
        SupersededAt = DateTime.UtcNow;
        SupersededBy = supersededBy;
        AddTimelineEvent("superseded", $"Archivo sustituido por versión {Version + 1}");
    }

    public void Authorize(string authorizationOffice)
    {
        AuthorizationStatus = "approved";
        AuthorizationDate = DateTime.UtcNow;
        AuthorizationOffice = authorizationOffice;
        AddTimelineEvent("authorized", $"Archivo autorizado por {authorizationOffice}");
    }

    public void RejectAuthorization(string reason)
    {
        AuthorizationStatus = "rejected";
        AddTimelineEvent("authorization_rejected", $"Autorización rechazada: {reason}");
    }

    public void AddError(ValidationError error)
    {
        Errors.Add(error);
        ErrorCount = Errors.Count;
    }

    public void AddWarning(ValidationWarning warning)
    {
        Warnings.Add(warning);
        WarningCount = Warnings.Count;
    }

    public void AddValidatorResult(ValidatorResult result)
    {
        ValidatorResults.Add(result);
    }

    /// <summary>
    /// Reset validation for reprocessing - clears all results and resets status to Pending
    /// </summary>
    public void ResetForReprocessing()
    {
        // Reset status and metrics
        Status = ValidationStatus.Pending;
        Progress = 0;
        ErrorCount = 0;
        WarningCount = 0;
        ValidRecordCount = 0;
        ProcessingStartedAt = null;
        ProcessedAt = null;
        ValidatedAt = null;
        RequiresAuthorization = false;
        AuthorizationStatus = null;
        AuthorizationDate = null;
        AuthorizationOffice = null;

        // Clear collections (EF Core will handle deletions)
        Errors.Clear();
        Warnings.Clear();
        ValidatorResults.Clear();

        // Add timeline event
        AddTimelineEvent("reprocess_started", "Validación reiniciada para reprocesamiento");
        UpdatedAt = DateTime.UtcNow;
    }

    private void AddTimelineEvent(string type, string message)
    {
        Timeline.Add(TimelineEvent.Create(Id, type, message));
    }
}
