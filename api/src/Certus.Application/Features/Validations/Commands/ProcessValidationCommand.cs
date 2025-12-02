using Certus.Application.Common.Interfaces;
using Certus.Domain.Common;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Domain.Services;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Certus.Application.Features.Validations.Commands;

/// <summary>
/// Command to process and validate a CONSAR file
/// This is the main entry point for file validation workflow
/// Implements CONSAR Circular 19-8 validation requirements (2025)
/// </summary>
public record ProcessValidationCommand(
    Guid ValidationId,
    Guid? PresetId = null,
    List<Guid>? ValidatorIds = null
) : IRequest<Result<ProcessValidationResult>>;

/// <summary>
/// Result of processing a validation
/// </summary>
public record ProcessValidationResult(
    Guid ValidationId,
    ValidationStatus Status,
    int TotalRecords,
    int ValidRecords,
    int ErrorCount,
    int WarningCount,
    bool RequiresAuthorization,
    long ProcessingTimeMs
);

/// <summary>
/// Validator for ProcessValidationCommand
/// </summary>
public class ProcessValidationCommandValidator : AbstractValidator<ProcessValidationCommand>
{
    public ProcessValidationCommandValidator()
    {
        RuleFor(x => x.ValidationId)
            .NotEmpty()
            .WithMessage("ValidationId es requerido");
    }
}

/// <summary>
/// Handler for ProcessValidationCommand
/// Orchestrates the complete file validation workflow according to CONSAR standards
/// </summary>
public class ProcessValidationCommandHandler : IRequestHandler<ProcessValidationCommand, Result<ProcessValidationResult>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IValidationEngineService _validationEngine;
    private readonly IFileStorageService _fileStorage;
    private readonly IFileValidationService _fileParser;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<ProcessValidationCommandHandler> _logger;
    private readonly IPublisher _publisher;

    public ProcessValidationCommandHandler(
        IApplicationDbContext dbContext,
        IValidationEngineService validationEngine,
        IFileStorageService fileStorage,
        IFileValidationService fileParser,
        ICurrentUserService currentUser,
        ILogger<ProcessValidationCommandHandler> logger,
        IPublisher publisher)
    {
        _dbContext = dbContext;
        _validationEngine = validationEngine;
        _fileStorage = fileStorage;
        _fileParser = fileParser;
        _currentUser = currentUser;
        _logger = logger;
        _publisher = publisher;
    }

    public async Task<Result<ProcessValidationResult>> Handle(
        ProcessValidationCommand request,
        CancellationToken cancellationToken)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();

        // 1. Load validation entity directly from DbContext to ensure proper tracking
        var validation = await _dbContext.Validations.FindAsync(new object[] { request.ValidationId }, cancellationToken);

        if (validation == null)
        {
            return Result.Failure<ProcessValidationResult>(
                Error.Domain.ValidationNotFound(request.ValidationId));
        }

        // Load navigation collections to ensure proper EF Core change tracking
        // Without this, adding to collections causes UPDATE instead of INSERT
        await _dbContext.Entry(validation).Collection(v => v.Timeline).LoadAsync(cancellationToken);
        await _dbContext.Entry(validation).Collection(v => v.Errors).LoadAsync(cancellationToken);
        await _dbContext.Entry(validation).Collection(v => v.Warnings).LoadAsync(cancellationToken);
        await _dbContext.Entry(validation).Collection(v => v.ValidatorResults).LoadAsync(cancellationToken);

        // 2. Check if already processed
        if (validation.Status != ValidationStatus.Pending)
        {
            return Result.Failure<ProcessValidationResult>(Error.Domain.AlreadyProcessed);
        }

        // 3. Start processing
        validation.StartProcessing();
        await _dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            // 4. Download file from storage
            _logger.LogInformation("Downloading file {FileName} from storage", validation.FileName);
            var downloadResult = await _fileStorage.DownloadAsync(validation.FilePath, cancellationToken);

            if (!downloadResult.Success || downloadResult.Stream == null)
            {
                validation.CompleteWithErrors(1, 0);
                validation.AddError(ValidationError.Create(
                    validationId: validation.Id,
                    validatorCode: "FILE_001",
                    validatorName: "Descarga de Archivo",
                    severity: ErrorSeverity.Critical,
                    message: downloadResult.Error ?? "No se pudo descargar el archivo desde el almacenamiento",
                    line: 0,
                    description: "Error al recuperar el archivo del almacenamiento de Azure"));
                await _dbContext.SaveChangesAsync(cancellationToken);

                return Result.Failure<ProcessValidationResult>(
                    Error.External("File.DownloadFailed", "Error al descargar archivo"));
            }

            // 5. Parse file records
            _logger.LogInformation("Parsing file {FileName}", validation.FileName);
            var parseResult = await _fileParser.ParseFileAsync(
                downloadResult.Stream,
                validation.FileType,
                cancellationToken);

            if (parseResult.IsFailure)
            {
                validation.CompleteWithErrors(1, 0);
                validation.AddError(ValidationError.Create(
                    validationId: validation.Id,
                    validatorCode: "PARSE_001",
                    validatorName: "Parser de Archivo CONSAR",
                    severity: ErrorSeverity.Critical,
                    message: $"Error al procesar archivo: {parseResult.Error.Message}",
                    line: 0,
                    description: "El archivo no cumple con el formato esperado según la Circular CONSAR 19-8"));
                await _dbContext.SaveChangesAsync(cancellationToken);

                return Result.Failure<ProcessValidationResult>(parseResult.Error);
            }

            var parsedFile = parseResult.Value;
            validation.UpdateProgress(10, parsedFile.TotalRecords, 0);

            // 6. Execute validators
            _logger.LogInformation(
                "Executing validators on {RecordCount} records",
                parsedFile.Records.Count);

            var validationRequest = new ValidationExecutionRequest
            {
                FileId = validation.Id,
                FileName = validation.FileName,
                FileType = validation.FileType,
                TenantId = validation.TenantId,
                UserId = _currentUser.User.UserId ?? Guid.Empty,
                Afore = _currentUser.User.TenantId?.ToString() ?? "",
                Records = parsedFile.Records,
                PresetId = request.PresetId,
                ValidatorIds = request.ValidatorIds
            };

            var progress = new Progress<ValidationExecutionProgress>(p =>
            {
                // Update progress (10-90% range for validation)
                var adjustedProgress = 10 + (int)(p.PercentComplete * 0.8);
                validation.UpdateProgress(adjustedProgress);
            });

            var executionResult = await _validationEngine.ExecuteAsync(
                validationRequest,
                progress,
                cancellationToken);

            // 7. Store validation results - Critical Errors
            foreach (var critical in executionResult.Results.Critical.Where(r => r.Status == ValidatorExecutionStatus.Failed))
            {
                validation.AddError(ValidationError.Create(
                    validationId: validation.Id,
                    validatorCode: critical.ValidatorCode,
                    validatorName: critical.ValidatorName,
                    severity: ErrorSeverity.Critical,
                    message: critical.Message,
                    line: critical.Context.LineNumber ?? 0,
                    description: critical.Description,
                    suggestion: critical.Suggestion,
                    column: null,
                    field: critical.Context.Field,
                    value: critical.Context.Value?.ToString(),
                    expectedValue: critical.Context.ExpectedValue?.ToString()));
            }

            // Store validation results - Regular Errors
            foreach (var error in executionResult.Results.Errors.Where(r => r.Status == ValidatorExecutionStatus.Failed))
            {
                validation.AddError(ValidationError.Create(
                    validationId: validation.Id,
                    validatorCode: error.ValidatorCode,
                    validatorName: error.ValidatorName,
                    severity: ErrorSeverity.Error,
                    message: error.Message,
                    line: error.Context.LineNumber ?? 0,
                    description: error.Description,
                    suggestion: error.Suggestion,
                    column: null,
                    field: error.Context.Field,
                    value: error.Context.Value?.ToString(),
                    expectedValue: error.Context.ExpectedValue?.ToString()));
            }

            // Store validation results - Warnings
            foreach (var warning in executionResult.Results.Warnings.Where(r => r.Status == ValidatorExecutionStatus.Failed))
            {
                validation.AddWarning(ValidationWarning.Create(
                    validationId: validation.Id,
                    validatorCode: warning.ValidatorCode,
                    message: warning.Message,
                    line: warning.Context.LineNumber ?? 0,
                    column: null));
            }

            // Store aggregated validator results (grouped by ValidatorCode)
            // This ensures we get 37 validators instead of 2512+ individual results
            var allValidatorResults = executionResult.Results.Critical
                .Concat(executionResult.Results.Errors)
                .Concat(executionResult.Results.Warnings)
                .Concat(executionResult.Results.Informational);

            // Aggregate results by validator code
            var aggregatedResults = allValidatorResults
                .GroupBy(r => r.ValidatorCode)
                .Select(g => new
                {
                    Code = g.Key,
                    Name = g.First().ValidatorName,
                    Category = g.First().Category ?? g.First().Criticality.ToString(),
                    ErrorCount = g.Count(r => r.Status == ValidatorExecutionStatus.Failed &&
                                              r.Criticality is ValidatorCriticality.Critical or ValidatorCriticality.Error),
                    WarningCount = g.Count(r => r.Status == ValidatorExecutionStatus.Failed &&
                                                r.Criticality == ValidatorCriticality.Warning),
                    TotalDurationMs = g.Sum(r => r.ExecutionTimeMs),
                    HasFailed = g.Any(r => r.Status == ValidatorExecutionStatus.Failed)
                })
                .ToList();

            foreach (var aggregated in aggregatedResults)
            {
                var validatorResult = ValidatorResult.Create(
                    validationId: validation.Id,
                    code: aggregated.Code,
                    name: aggregated.Name,
                    group: aggregated.Category);

                validatorResult.Complete(aggregated.ErrorCount, aggregated.WarningCount, (int)aggregated.TotalDurationMs);
                validation.AddValidatorResult(validatorResult);
            }

            // Store the total number of unique validators executed
            validation.SetTotalValidatorsExecuted(aggregatedResults.Count);

            // 8. Complete validation with appropriate status
            var totalErrorCount = executionResult.Results.Critical.Count(r => r.Status == ValidatorExecutionStatus.Failed)
                                + executionResult.Results.Errors.Count(r => r.Status == ValidatorExecutionStatus.Failed);
            var totalWarningCount = executionResult.Results.Warnings.Count(r => r.Status == ValidatorExecutionStatus.Failed);

            if (totalErrorCount > 0)
            {
                validation.CompleteWithErrors(totalErrorCount, totalWarningCount);
            }
            else if (totalWarningCount > 0)
            {
                validation.CompleteWithWarnings(totalWarningCount);
            }
            else
            {
                validation.CompleteWithSuccess();
            }

            // 9. Save all changes
            await _dbContext.SaveChangesAsync(cancellationToken);

            // 10. Publish domain events
            foreach (var domainEvent in validation.DomainEvents)
            {
                await _publisher.Publish(domainEvent, cancellationToken);
            }
            validation.ClearDomainEvents();

            sw.Stop();

            _logger.LogInformation(
                "Validation {ValidationId} completed: Status={Status}, Errors={Errors}, Warnings={Warnings}, Time={Time}ms",
                validation.Id, validation.Status, totalErrorCount, totalWarningCount, sw.ElapsedMilliseconds);

            return Result.Success(new ProcessValidationResult(
                validation.Id,
                validation.Status,
                executionResult.TotalRecords,
                executionResult.PassedRecords,
                totalErrorCount,
                totalWarningCount,
                validation.RequiresAuthorization,
                sw.ElapsedMilliseconds));
        }
        catch (OperationCanceledException)
        {
            validation.Cancel("Operación cancelada por el usuario");
            await _dbContext.SaveChangesAsync(CancellationToken.None);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing validation {ValidationId}", request.ValidationId);

            validation.CompleteWithErrors(1, 0);
            validation.AddError(ValidationError.Create(
                validationId: validation.Id,
                validatorCode: "SYSTEM_001",
                validatorName: "Error del Sistema",
                severity: ErrorSeverity.Critical,
                message: $"Error interno: {ex.Message}",
                line: 0,
                description: "Se produjo un error inesperado durante el procesamiento"));

            await _dbContext.SaveChangesAsync(CancellationToken.None);

            return Result.Failure<ProcessValidationResult>(
                Error.External("Processing.Error", ex.Message));
        }
    }
}
