using Certus.Application.Common.Interfaces;
using Certus.Domain.Common;
using Certus.Domain.Enums;
using Certus.Domain.Services;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Certus.Application.Features.Validations.Commands;

/// <summary>
/// Command to reprocess an existing validation
/// Clears all previous results and re-executes the validation with new aggregation logic
/// </summary>
public record ReprocessValidationCommand(
    Guid ValidationId,
    Guid? PresetId = null,
    List<Guid>? ValidatorIds = null
) : IRequest<Result<ProcessValidationResult>>;

/// <summary>
/// Validator for ReprocessValidationCommand
/// </summary>
public class ReprocessValidationCommandValidator : AbstractValidator<ReprocessValidationCommand>
{
    public ReprocessValidationCommandValidator()
    {
        RuleFor(x => x.ValidationId)
            .NotEmpty()
            .WithMessage("ValidationId es requerido");
    }
}

/// <summary>
/// Handler for ReprocessValidationCommand
/// Resets a validation and re-executes the validation workflow
/// </summary>
public class ReprocessValidationCommandHandler : IRequestHandler<ReprocessValidationCommand, Result<ProcessValidationResult>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IValidationEngineService _validationEngine;
    private readonly IFileStorageService _fileStorage;
    private readonly IFileValidationService _fileParser;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<ReprocessValidationCommandHandler> _logger;
    private readonly IPublisher _publisher;

    public ReprocessValidationCommandHandler(
        IApplicationDbContext dbContext,
        IValidationEngineService validationEngine,
        IFileStorageService fileStorage,
        IFileValidationService fileParser,
        ICurrentUserService currentUser,
        ILogger<ReprocessValidationCommandHandler> logger,
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
        ReprocessValidationCommand request,
        CancellationToken cancellationToken)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();

        // 1. Load validation entity
        var validation = await _dbContext.Validations.FindAsync(new object[] { request.ValidationId }, cancellationToken);

        if (validation == null)
        {
            return Result.Failure<ProcessValidationResult>(
                Error.Domain.ValidationNotFound(request.ValidationId));
        }

        // Load navigation collections
        await _dbContext.Entry(validation).Collection(v => v.Timeline).LoadAsync(cancellationToken);
        await _dbContext.Entry(validation).Collection(v => v.Errors).LoadAsync(cancellationToken);
        await _dbContext.Entry(validation).Collection(v => v.Warnings).LoadAsync(cancellationToken);
        await _dbContext.Entry(validation).Collection(v => v.ValidatorResults).LoadAsync(cancellationToken);

        // 2. Reset validation for reprocessing (clear all results)
        _logger.LogInformation("Resetting validation {ValidationId} for reprocessing", request.ValidationId);
        validation.ResetForReprocessing();
        await _dbContext.SaveChangesAsync(cancellationToken);

        // 3. Start processing
        validation.StartProcessing();
        await _dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            // 4. Download file from storage
            _logger.LogInformation("Downloading file {FileName} from storage for reprocessing", validation.FileName);
            var downloadResult = await _fileStorage.DownloadAsync(validation.FilePath, cancellationToken);

            if (!downloadResult.Success || downloadResult.Stream == null)
            {
                validation.CompleteWithErrors(1, 0);
                validation.AddError(Domain.Entities.ValidationError.Create(
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
                validation.AddError(Domain.Entities.ValidationError.Create(
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
                validation.AddError(Domain.Entities.ValidationError.Create(
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
                validation.AddError(Domain.Entities.ValidationError.Create(
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
                validation.AddWarning(Domain.Entities.ValidationWarning.Create(
                    validationId: validation.Id,
                    validatorCode: warning.ValidatorCode,
                    message: warning.Message,
                    line: warning.Context.LineNumber ?? 0,
                    column: null));
            }

            // Store aggregated validator results (grouped by ValidatorCode)
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
                var validatorResult = Domain.Entities.ValidatorResult.Create(
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
                "Reprocessing {ValidationId} completed: Status={Status}, Errors={Errors}, Warnings={Warnings}, Time={Time}ms",
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
            _logger.LogError(ex, "Error reprocessing validation {ValidationId}", request.ValidationId);

            validation.CompleteWithErrors(1, 0);
            validation.AddError(Domain.Entities.ValidationError.Create(
                validationId: validation.Id,
                validatorCode: "SYSTEM_001",
                validatorName: "Error del Sistema",
                severity: ErrorSeverity.Critical,
                message: $"Error interno: {ex.Message}",
                line: 0,
                description: "Se produjo un error inesperado durante el reprocesamiento"));

            await _dbContext.SaveChangesAsync(CancellationToken.None);

            return Result.Failure<ProcessValidationResult>(
                Error.External("Reprocessing.Error", ex.Message));
        }
    }
}
