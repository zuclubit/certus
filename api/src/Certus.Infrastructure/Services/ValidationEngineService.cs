using System.Diagnostics;
using System.Text.RegularExpressions;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Domain.Interfaces;
using Certus.Domain.Services;
using Certus.Domain.ValueObjects;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.Services;

/// <summary>
/// Motor de ejecución de validaciones CONSAR
/// Executes validator rules against file records with performance optimization
/// </summary>
public class ValidationEngineService : IValidationEngineService
{
    private readonly ILogger<ValidationEngineService> _logger;
    private readonly IValidatorRuleRepository _validatorRepository;

    public ValidationEngineService(
        ILogger<ValidationEngineService> logger,
        IValidatorRuleRepository validatorRepository)
    {
        _logger = logger;
        _validatorRepository = validatorRepository;
    }

    public async Task<ValidationExecutionResult> ExecuteAsync(
        ValidationExecutionRequest request,
        IProgress<ValidationExecutionProgress>? progress = null,
        CancellationToken cancellationToken = default)
    {
        var sw = Stopwatch.StartNew();
        var result = new ValidationExecutionResult
        {
            FileId = request.FileId,
            FileName = request.FileName,
            FileType = request.FileType,
            TotalRecords = request.Records.Count,
            ValidatedBy = request.UserId,
            PresetId = request.PresetId
        };

        var context = new ValidationExecutionContext
        {
            FileId = request.FileId,
            FileName = request.FileName,
            FileType = request.FileType,
            Afore = request.Afore,
            TenantId = request.TenantId,
            TotalRecords = request.Records.Count
        };

        // Load validators from repository
        var validators = await LoadValidatorsAsync(request, cancellationToken);

        result.TotalValidators = validators.Count;

        // Ejecutar validadores por cada registro
        var recordIndex = 0;
        var failedRecords = new HashSet<int>();

        foreach (var record in request.Records)
        {
            cancellationToken.ThrowIfCancellationRequested();

            foreach (var validator in validators.Where(v => v.IsEnabled).OrderBy(v => v.RunOrder))
            {
                var output = await ExecuteValidatorAsync(validator, record, context, cancellationToken);
                result.ExecutedValidators++;

                // Clasificar resultado por criticidad
                switch (validator.Criticality)
                {
                    case ValidatorCriticality.Critical:
                        result.Results.Critical.Add(output);
                        break;
                    case ValidatorCriticality.Error:
                        result.Results.Errors.Add(output);
                        break;
                    case ValidatorCriticality.Warning:
                        result.Results.Warnings.Add(output);
                        break;
                    case ValidatorCriticality.Informational:
                        result.Results.Informational.Add(output);
                        break;
                }

                if (output.Status == ValidatorExecutionStatus.Failed)
                {
                    result.FailedValidators++;
                    failedRecords.Add(recordIndex);

                    if (validator.StopOnFailure && validator.Criticality >= ValidatorCriticality.Error)
                    {
                        break; // Detener validación de este registro
                    }
                }
            }

            recordIndex++;
            result.ValidatedRecords++;

            // Reportar progreso
            progress?.Report(new ValidationExecutionProgress
            {
                PercentComplete = (int)((double)recordIndex / request.Records.Count * 100),
                RecordsProcessed = recordIndex,
                TotalRecords = request.Records.Count,
                ValidatorsExecuted = result.ExecutedValidators,
                TotalValidators = result.TotalValidators,
                Status = "Procesando"
            });
        }

        sw.Stop();
        result.TotalExecutionTimeMs = sw.ElapsedMilliseconds;
        result.PassedRecords = request.Records.Count - failedRecords.Count;
        result.FailedRecords = failedRecords.Count;

        // Determinar estado general
        if (result.Results.Critical.Any(r => r.Status == ValidatorExecutionStatus.Failed) ||
            result.Results.Errors.Any(r => r.Status == ValidatorExecutionStatus.Failed))
        {
            result.OverallStatus = ValidationOverallStatus.Failed;
            result.IsCompliant = false;
        }
        else if (result.Results.Warnings.Any(r => r.Status == ValidatorExecutionStatus.Failed))
        {
            result.OverallStatus = ValidationOverallStatus.Warning;
            result.IsCompliant = true;
        }
        else
        {
            result.OverallStatus = ValidationOverallStatus.Passed;
            result.IsCompliant = true;
        }

        _logger.LogInformation(
            "Validation completed for {FileName}: {Status} - {PassedRecords}/{TotalRecords} records passed in {Duration}ms",
            request.FileName, result.OverallStatus, result.PassedRecords, result.TotalRecords, result.TotalExecutionTimeMs);

        return result;
    }

    public async Task<ValidatorExecutionOutput> ExecuteValidatorAsync(
        ValidatorRule validator,
        ValidationRecord record,
        ValidationExecutionContext context,
        CancellationToken cancellationToken = default)
    {
        var sw = Stopwatch.StartNew();
        var output = new ValidatorExecutionOutput
        {
            ValidatorId = validator.Id,
            ValidatorCode = validator.Code,
            ValidatorName = validator.Name,
            Criticality = validator.Criticality,
            Category = validator.Category ?? DeriveGroupFromCode(validator.Code),
            Context = new ValidatorExecutionContextInfo
            {
                FileId = context.FileId,
                FileName = context.FileName,
                FileType = context.FileType.ToString(),
                Afore = context.Afore,
                RecordIndex = record.RecordIndex,
                LineNumber = record.LineNumber
            }
        };

        try
        {
            var conditionGroup = validator.GetConditionGroup();
            var action = validator.GetAction();

            var passed = EvaluateCondition(conditionGroup, record, context);

            if (passed)
            {
                output.Status = ValidatorExecutionStatus.Passed;
                output.Message = "Validación exitosa";
            }
            else
            {
                output.Status = ValidatorExecutionStatus.Failed;
                output.Message = action.Message;

                // Buscar el campo que falló para agregar contexto
                var failedCondition = FindFailedCondition(conditionGroup, record, context);
                if (failedCondition != null)
                {
                    output.Context.Field = failedCondition.Field;
                    output.Context.Value = record.GetFieldValue(failedCondition.Field ?? "");
                    output.Context.ExpectedValue = failedCondition.Value;
                    output.Description = failedCondition.Message;
                }
            }

            // Registrar ejecución en el validador
            validator.RecordExecution(passed, sw.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            output.Status = ValidatorExecutionStatus.Error;
            output.Message = $"Error ejecutando validador: {ex.Message}";
            _logger.LogError(ex, "Error executing validator {ValidatorCode}", validator.Code);
        }

        sw.Stop();
        output.ExecutionTimeMs = sw.ElapsedMilliseconds;

        return output;
    }

    public bool EvaluateCondition(
        ValidatorConditionGroup conditionGroup,
        ValidationRecord record,
        ValidationExecutionContext context)
    {
        if (conditionGroup.Conditions.Count == 0)
            return true;

        var results = new List<bool>();

        foreach (var item in conditionGroup.Conditions)
        {
            bool itemResult;

            if (item.Type == "group" && item.Group != null)
            {
                // Evaluar grupo anidado recursivamente
                itemResult = EvaluateCondition(item.Group, record, context);
            }
            else
            {
                // Evaluar condición simple
                itemResult = EvaluateSimpleCondition(item, record, context);
            }

            results.Add(itemResult);
        }

        // Aplicar operador lógico
        return conditionGroup.Operator switch
        {
            LogicalOperator.And => results.All(r => r),
            LogicalOperator.Or => results.Any(r => r),
            LogicalOperator.Not => results.Count > 0 && !results[0],
            _ => true
        };
    }

    private bool EvaluateSimpleCondition(
        ValidatorConditionItem condition,
        ValidationRecord record,
        ValidationExecutionContext context)
    {
        if (string.IsNullOrEmpty(condition.Field))
            return true;

        var fieldValue = record.GetFieldValue(condition.Field);

        // Si es comparación campo a campo
        if (!string.IsNullOrEmpty(condition.ValueFrom))
        {
            var compareValue = record.GetFieldValue(condition.ValueFrom);
            return EvaluateOperator(condition.ConditionOperator, fieldValue, compareValue, condition.DataType);
        }

        return EvaluateOperator(condition.ConditionOperator, fieldValue, condition.Value, condition.DataType, condition.ValueTo);
    }

    private bool EvaluateOperator(
        ConditionOperator op,
        object? fieldValue,
        object? expectedValue,
        ValidatorDataType dataType,
        object? valueTo = null)
    {
        try
        {
            return op switch
            {
                ConditionOperator.IsEmpty => IsEmpty(fieldValue),
                ConditionOperator.IsNotEmpty => !IsEmpty(fieldValue),
                ConditionOperator.Equals => AreEqual(fieldValue, expectedValue, dataType),
                ConditionOperator.NotEquals => !AreEqual(fieldValue, expectedValue, dataType),
                ConditionOperator.GreaterThan => Compare(fieldValue, expectedValue, dataType) > 0,
                ConditionOperator.GreaterThanOrEqual => Compare(fieldValue, expectedValue, dataType) >= 0,
                ConditionOperator.LessThan => Compare(fieldValue, expectedValue, dataType) < 0,
                ConditionOperator.LessThanOrEqual => Compare(fieldValue, expectedValue, dataType) <= 0,
                ConditionOperator.Between => IsBetween(fieldValue, expectedValue, valueTo, dataType),
                ConditionOperator.Contains => ToString(fieldValue).Contains(ToString(expectedValue), StringComparison.OrdinalIgnoreCase),
                ConditionOperator.NotContains => !ToString(fieldValue).Contains(ToString(expectedValue), StringComparison.OrdinalIgnoreCase),
                ConditionOperator.StartsWith => ToString(fieldValue).StartsWith(ToString(expectedValue), StringComparison.OrdinalIgnoreCase),
                ConditionOperator.EndsWith => ToString(fieldValue).EndsWith(ToString(expectedValue), StringComparison.OrdinalIgnoreCase),
                ConditionOperator.MatchesRegex => Regex.IsMatch(ToString(fieldValue), ToString(expectedValue)),
                ConditionOperator.InList => IsInList(fieldValue, expectedValue),
                ConditionOperator.NotInList => !IsInList(fieldValue, expectedValue),
                _ => true
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error evaluating operator {Operator}", op);
            return false;
        }
    }

    private static bool IsEmpty(object? value)
    {
        return value == null || string.IsNullOrWhiteSpace(value.ToString());
    }

    private static bool AreEqual(object? a, object? b, ValidatorDataType dataType)
    {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;

        return dataType switch
        {
            ValidatorDataType.Number => ToDecimal(a) == ToDecimal(b),
            ValidatorDataType.Date => ToDateTime(a) == ToDateTime(b),
            ValidatorDataType.Boolean => ToBool(a) == ToBool(b),
            ValidatorDataType.Currency => ToDecimal(a) == ToDecimal(b),
            _ => string.Equals(ToString(a), ToString(b), StringComparison.OrdinalIgnoreCase)
        };
    }

    private static int Compare(object? a, object? b, ValidatorDataType dataType)
    {
        if (a == null && b == null) return 0;
        if (a == null) return -1;
        if (b == null) return 1;

        return dataType switch
        {
            ValidatorDataType.Number or ValidatorDataType.Currency => ToDecimal(a).CompareTo(ToDecimal(b)),
            ValidatorDataType.Date => ToDateTime(a).CompareTo(ToDateTime(b)),
            _ => string.Compare(ToString(a), ToString(b), StringComparison.OrdinalIgnoreCase)
        };
    }

    private static bool IsBetween(object? value, object? from, object? to, ValidatorDataType dataType)
    {
        return Compare(value, from, dataType) >= 0 && Compare(value, to, dataType) <= 0;
    }

    private static bool IsInList(object? value, object? listValue)
    {
        if (value == null) return false;

        var list = listValue switch
        {
            IEnumerable<object> enumerable => enumerable.Select(ToString).ToList(),
            string str => str.Split(',').Select(s => s.Trim()).ToList(),
            _ => new List<string> { ToString(listValue) }
        };

        return list.Contains(ToString(value), StringComparer.OrdinalIgnoreCase);
    }

    private static string ToString(object? value) => value?.ToString() ?? string.Empty;

    private static decimal ToDecimal(object? value)
    {
        if (value == null) return 0;
        if (value is decimal d) return d;
        if (decimal.TryParse(value.ToString(), out var result)) return result;
        return 0;
    }

    private static DateTime ToDateTime(object? value)
    {
        if (value == null) return DateTime.MinValue;
        if (value is DateTime dt) return dt;
        if (DateTime.TryParse(value.ToString(), out var result)) return result;
        return DateTime.MinValue;
    }

    private static bool ToBool(object? value)
    {
        if (value == null) return false;
        if (value is bool b) return b;
        if (bool.TryParse(value.ToString(), out var result)) return result;
        return false;
    }

    private ValidatorConditionItem? FindFailedCondition(
        ValidatorConditionGroup group,
        ValidationRecord record,
        ValidationExecutionContext context)
    {
        foreach (var item in group.Conditions)
        {
            if (item.Type == "group" && item.Group != null)
            {
                var nested = FindFailedCondition(item.Group, record, context);
                if (nested != null) return nested;
            }
            else if (!EvaluateSimpleCondition(item, record, context))
            {
                return item;
            }
        }
        return null;
    }

    /// <summary>
    /// Load applicable validators from repository
    /// </summary>
    private async Task<List<ValidatorRule>> LoadValidatorsAsync(
        ValidationExecutionRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            List<ValidatorRule> validators;

            // If specific validator IDs are provided, load those
            if (request.ValidatorIds?.Any() == true)
            {
                validators = await _validatorRepository.GetByIdsAsync(request.ValidatorIds, cancellationToken);
            }
            // If a preset is specified, load validators from preset
            else if (request.PresetId.HasValue)
            {
                validators = await _validatorRepository.GetByPresetIdAsync(request.PresetId.Value, cancellationToken);
            }
            // Otherwise, load all applicable validators for file type
            else
            {
                validators = await _validatorRepository.GetByFileTypeAsync(
                    request.FileType,
                    request.Afore,
                    cancellationToken);
            }

            // Filter to only enabled and active validators
            validators = validators
                .Where(v => v.IsEnabled && v.Status == ValidatorStatus.Active)
                .OrderBy(v => v.RunOrder)
                .ToList();

            _logger.LogInformation(
                "Loaded {Count} validators for FileType={FileType}, Afore={Afore}",
                validators.Count, request.FileType, request.Afore);

            return validators;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading validators");
            return new List<ValidatorRule>();
        }
    }

    /// <summary>
    /// Derive group name from validator code (e.g., V01-001 -> "Grupo 1")
    /// </summary>
    private static string DeriveGroupFromCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code) || code.Length < 3)
            return "General";

        // Extract group number from code pattern VXX-XXX
        var groupPrefix = code.Substring(0, 3).ToUpperInvariant();

        return groupPrefix switch
        {
            "V01" => "Grupo 1 - Estructura de Archivo",
            "V02" => "Grupo 2 - Encabezado",
            "V03" => "Grupo 3 - Campos Obligatorios",
            "V04" => "Grupo 4 - Formato de Datos",
            "V05" => "Grupo 5 - Validación Cruzada",
            "V06" => "Grupo 6 - Catálogos",
            "V07" => "Grupo 7 - Reglas de Negocio",
            _ => "General"
        };
    }
}
