using Certus.Application.Common.Interfaces;
using Certus.Application.DTOs;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Domain.Services;
using Certus.Domain.ValueObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller para gestión de reglas de validación
/// </summary>
[Authorize]
public class ValidatorsController : BaseController
{
    private readonly IApplicationDbContext _context;
    private readonly IValidationEngineService _validationEngine;
    private readonly ILogger<ValidatorsController> _logger;

    public ValidatorsController(
        IApplicationDbContext context,
        IValidationEngineService validationEngine,
        ILogger<ValidatorsController> logger)
    {
        _context = context;
        _validationEngine = validationEngine;
        _logger = logger;
    }

    /// <summary>
    /// Obtener lista de validadores
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ValidatorRuleSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ValidatorRuleSummaryDto>>> GetValidators(
        [FromQuery] string? search = null,
        [FromQuery] ValidatorStatus? status = null,
        [FromQuery] ValidatorCriticality? criticality = null,
        [FromQuery] ValidatorType? type = null,
        [FromQuery] FileType? fileType = null,
        [FromQuery] string? category = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Set<ValidatorRule>().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(v =>
                v.Code.ToLower().Contains(term) ||
                v.Name.ToLower().Contains(term));
        }

        if (status.HasValue)
            query = query.Where(v => v.Status == status.Value);

        if (criticality.HasValue)
            query = query.Where(v => v.Criticality == criticality.Value);

        if (type.HasValue)
            query = query.Where(v => v.Type == type.Value);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(v => v.Category == category);

        if (fileType.HasValue)
        {
            var fileTypeStr = fileType.Value.ToString();
            query = query.Where(v => v.FileTypes.Contains(fileTypeStr));
        }

        var validators = await query
            .OrderBy(v => v.RunOrder)
            .ThenBy(v => v.Code)
            .ToListAsync(cancellationToken);

        var dtos = validators.Select(v => new ValidatorRuleSummaryDto
        {
            Id = v.Id,
            Code = v.Code,
            Name = v.Name,
            Type = v.Type.ToString(),
            Criticality = v.Criticality.ToString(),
            Status = v.Status.ToString(),
            Category = v.Category,
            FileTypes = v.GetFileTypes().Select(f => f.ToString()).ToList(),
            IsEnabled = v.IsEnabled,
            ExecutionCount = v.ExecutionCount,
            SuccessRate = v.ExecutionCount > 0 ? (double)v.PassCount / v.ExecutionCount * 100 : 0
        }).ToList();

        return Ok(dtos);
    }

    /// <summary>
    /// Obtener validador por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ValidatorRuleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ValidatorRuleDto>> GetValidator(Guid id, CancellationToken cancellationToken)
    {
        var validator = await _context.Set<ValidatorRule>().FindAsync(new object[] { id }, cancellationToken);

        if (validator == null)
            return NotFound(new { error = "Validador no encontrado" });

        return Ok(MapToDto(validator));
    }

    /// <summary>
    /// Crear nuevo validador
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "RequireSupervisor")]
    [ProducesResponseType(typeof(ValidatorRuleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ValidatorRuleDto>> CreateValidator(
        [FromBody] CreateValidatorRequest request,
        CancellationToken cancellationToken)
    {
        // Verificar código único
        var exists = await _context.Set<ValidatorRule>()
            .AnyAsync(v => v.Code == request.Code.ToUpperInvariant(), cancellationToken);

        if (exists)
            return BadRequest(new { error = "Ya existe un validador con este código" });

        var conditionGroup = MapConditionGroup(request.ConditionGroup);
        var action = new ValidatorAction
        {
            Type = Enum.Parse<ActionType>(request.Action.Type, true),
            Code = request.Action.Code,
            Message = request.Action.Message
        };

        var fileTypes = request.FileTypes
            .Select(f => Enum.Parse<FileType>(f, true))
            .ToList();

        var validator = ValidatorRule.Create(
            request.Code,
            request.Name,
            request.Description,
            Enum.Parse<ValidatorType>(request.Type, true),
            Enum.Parse<ValidatorCriticality>(request.Criticality, true),
            fileTypes,
            conditionGroup,
            action,
            request.Category,
            request.RegulatoryReference,
            request.RunOrder);

        if (request.IsEnabled)
            validator.Enable();

        if (request.StopOnFailure)
            validator.SetStopOnFailure(true);

        await _context.Set<ValidatorRule>().AddAsync(validator, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Validator created: {Code} by user {UserId}", validator.Code, CurrentUserId);

        return CreatedAtAction(
            nameof(GetValidator),
            new { id = validator.Id },
            MapToDto(validator));
    }

    /// <summary>
    /// Actualizar validador
    /// </summary>
    [HttpPatch("{id:guid}")]
    [Authorize(Policy = "RequireSupervisor")]
    [ProducesResponseType(typeof(ValidatorRuleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ValidatorRuleDto>> UpdateValidator(
        Guid id,
        [FromBody] UpdateValidatorRequest request,
        CancellationToken cancellationToken)
    {
        var validator = await _context.Set<ValidatorRule>().FindAsync(new object[] { id }, cancellationToken);

        if (validator == null)
            return NotFound(new { error = "Validador no encontrado" });

        if (request.ConditionGroup != null)
        {
            var conditionGroup = MapConditionGroup(request.ConditionGroup);
            validator.UpdateConditions(conditionGroup);
        }

        if (request.Action != null)
        {
            var action = new ValidatorAction
            {
                Type = Enum.Parse<ActionType>(request.Action.Type, true),
                Code = request.Action.Code,
                Message = request.Action.Message
            };
            validator.UpdateAction(action);
        }

        if (request.IsEnabled.HasValue)
        {
            if (request.IsEnabled.Value)
                validator.Enable();
            else
                validator.Disable();
        }

        if (request.RunOrder.HasValue)
            validator.SetRunOrder(request.RunOrder.Value);

        if (request.StopOnFailure.HasValue)
            validator.SetStopOnFailure(request.StopOnFailure.Value);

        if (request.Status != null)
        {
            var newStatus = Enum.Parse<ValidatorStatus>(request.Status, true);
            switch (newStatus)
            {
                case ValidatorStatus.Active:
                    validator.Activate();
                    break;
                case ValidatorStatus.Inactive:
                    validator.Deactivate();
                    break;
                case ValidatorStatus.Testing:
                    validator.SetToTesting();
                    break;
                case ValidatorStatus.Archived:
                    validator.Archive();
                    break;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Validator updated: {Code} by user {UserId}", validator.Code, CurrentUserId);

        return Ok(MapToDto(validator));
    }

    /// <summary>
    /// Eliminar validador
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "RequireAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteValidator(Guid id, CancellationToken cancellationToken)
    {
        var validator = await _context.Set<ValidatorRule>().FindAsync(new object[] { id }, cancellationToken);

        if (validator == null)
            return NotFound(new { error = "Validador no encontrado" });

        _context.Set<ValidatorRule>().Remove(validator);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Validator deleted: {Code} by user {UserId}", validator.Code, CurrentUserId);

        return NoContent();
    }

    /// <summary>
    /// Obtener grupos de validadores
    /// </summary>
    [HttpGet("groups")]
    [ProducesResponseType(typeof(List<ValidatorGroupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ValidatorGroupDto>>> GetGroups(CancellationToken cancellationToken)
    {
        var groups = await _context.Set<ValidatorGroup>()
            .OrderBy(g => g.SortOrder)
            .ToListAsync(cancellationToken);

        var validators = await _context.Set<ValidatorRule>()
            .Where(v => v.IsEnabled)
            .ToListAsync(cancellationToken);

        var dtos = groups.Select(g => new ValidatorGroupDto
        {
            Id = g.Id,
            Code = g.Code,
            Name = g.Name,
            Description = g.Description,
            Icon = g.Icon,
            ValidatorCount = validators.Count(v => v.Category == g.Code),
            IsEnabled = g.IsEnabled
        }).ToList();

        return Ok(dtos);
    }

    /// <summary>
    /// Obtener presets de validadores
    /// </summary>
    [HttpGet("presets")]
    [ProducesResponseType(typeof(List<ValidatorPresetDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ValidatorPresetDto>>> GetPresets(
        [FromQuery] FileType? fileType = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Set<ValidatorPreset>().AsQueryable();

        if (fileType.HasValue)
            query = query.Where(p => p.FileType == fileType.Value);

        var presets = await query
            .Where(p => p.IsEnabled)
            .ToListAsync(cancellationToken);

        var dtos = presets.Select(p => new ValidatorPresetDto
        {
            Id = p.Id,
            Code = p.Code,
            Name = p.Name,
            Description = p.Description,
            FileType = p.FileType.ToString(),
            IsDefault = p.IsDefault,
            IsEnabled = p.IsEnabled,
            ValidatorIds = p.GetValidatorIds(),
            ValidatorCount = p.GetValidatorIds().Count
        }).ToList();

        return Ok(dtos);
    }

    /// <summary>
    /// Ejecutar validación
    /// </summary>
    [HttpPost("execute")]
    [Authorize(Policy = "CanManageValidations")]
    [ProducesResponseType(typeof(ValidationReportDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ValidationReportDto>> Execute(
        [FromBody] ExecuteValidationRequest request,
        CancellationToken cancellationToken)
    {
        if (!CurrentTenantId.HasValue || !CurrentUserId.HasValue)
            return Unauthorized();

        var executionRequest = new ValidationExecutionRequest
        {
            FileId = request.FileId,
            FileName = request.FileName,
            FileType = Enum.Parse<FileType>(request.FileType, true),
            Afore = request.Afore,
            TenantId = CurrentTenantId.Value,
            UserId = CurrentUserId.Value,
            Records = request.Records.Select(r => new ValidationRecord
            {
                RecordIndex = r.RecordIndex,
                Fields = r.Fields
            }).ToList(),
            PresetId = request.PresetId
        };

        var result = await _validationEngine.ExecuteAsync(executionRequest, null, cancellationToken);

        var report = new ValidationReportDto
        {
            FileId = result.FileId,
            FileName = result.FileName,
            FileType = result.FileType.ToString(),
            TotalRecords = result.TotalRecords,
            ValidatedRecords = result.ValidatedRecords,
            PassedRecords = result.PassedRecords,
            FailedRecords = result.FailedRecords,
            Results = new ValidationResultsDto
            {
                Critical = result.Results.Critical.Select(MapResultItem).ToList(),
                Errors = result.Results.Errors.Select(MapResultItem).ToList(),
                Warnings = result.Results.Warnings.Select(MapResultItem).ToList(),
                Informational = result.Results.Informational.Select(MapResultItem).ToList()
            },
            TotalValidators = result.TotalValidators,
            ExecutedValidators = result.ExecutedValidators,
            FailedValidators = result.FailedValidators,
            TotalExecutionTimeMs = result.TotalExecutionTimeMs,
            OverallStatus = result.OverallStatus.ToString(),
            IsCompliant = result.IsCompliant,
            ValidatedAt = result.ValidatedAt,
            PresetId = result.PresetId
        };

        return Ok(report);
    }

    /// <summary>
    /// Obtener métricas de validadores
    /// </summary>
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(ValidatorMetricsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ValidatorMetricsDto>> GetMetrics(CancellationToken cancellationToken)
    {
        var validators = await _context.Set<ValidatorRule>().ToListAsync(cancellationToken);

        var metrics = new ValidatorMetricsDto
        {
            TotalValidators = validators.Count,
            ActiveValidators = validators.Count(v => v.Status == ValidatorStatus.Active && v.IsEnabled),
            TotalExecutions = validators.Sum(v => v.ExecutionCount),
            OverallSuccessRate = validators.Sum(v => v.ExecutionCount) > 0
                ? (double)validators.Sum(v => v.PassCount) / validators.Sum(v => v.ExecutionCount) * 100
                : 0,
            AverageExecutionMs = validators.Where(v => v.ExecutionCount > 0)
                .Select(v => v.AverageExecutionMs)
                .DefaultIfEmpty(0)
                .Average(),

            ByType = validators.GroupBy(v => v.Type.ToString())
                .ToDictionary(g => g.Key, g => g.Count()),
            ByCriticality = validators.GroupBy(v => v.Criticality.ToString())
                .ToDictionary(g => g.Key, g => g.Count()),
            ByStatus = validators.GroupBy(v => v.Status.ToString())
                .ToDictionary(g => g.Key, g => g.Count()),

            TopPerformers = validators
                .Where(v => v.ExecutionCount > 0)
                .OrderByDescending(v => (double)v.PassCount / v.ExecutionCount)
                .Take(5)
                .Select(v => new ValidatorPerformanceDto
                {
                    Id = v.Id,
                    Code = v.Code,
                    Name = v.Name,
                    ExecutionCount = v.ExecutionCount,
                    SuccessRate = (double)v.PassCount / v.ExecutionCount * 100,
                    AverageExecutionMs = v.AverageExecutionMs
                })
                .ToList(),

            MostFailed = validators
                .Where(v => v.FailCount > 0)
                .OrderByDescending(v => v.FailCount)
                .Take(5)
                .Select(v => new ValidatorPerformanceDto
                {
                    Id = v.Id,
                    Code = v.Code,
                    Name = v.Name,
                    ExecutionCount = v.ExecutionCount,
                    SuccessRate = v.ExecutionCount > 0 ? (double)v.PassCount / v.ExecutionCount * 100 : 0,
                    AverageExecutionMs = v.AverageExecutionMs
                })
                .ToList()
        };

        return Ok(metrics);
    }

    private static ValidatorRuleDto MapToDto(ValidatorRule validator)
    {
        return new ValidatorRuleDto
        {
            Id = validator.Id,
            Code = validator.Code,
            Name = validator.Name,
            Description = validator.Description,
            Type = validator.Type.ToString(),
            Criticality = validator.Criticality.ToString(),
            Status = validator.Status.ToString(),
            FileTypes = validator.GetFileTypes().Select(f => f.ToString()).ToList(),
            Category = validator.Category,
            RegulatoryReference = validator.RegulatoryReference,
            IsEnabled = validator.IsEnabled,
            RunOrder = validator.RunOrder,
            StopOnFailure = validator.StopOnFailure,
            Version = validator.Version,
            CreatedAt = validator.CreatedAt,
            UpdatedAt = validator.UpdatedAt,
            ExecutionCount = validator.ExecutionCount,
            PassCount = validator.PassCount,
            FailCount = validator.FailCount,
            AverageExecutionMs = validator.AverageExecutionMs
        };
    }

    private static ValidatorConditionGroup MapConditionGroup(ValidatorConditionGroupDto dto)
    {
        return new ValidatorConditionGroup
        {
            Id = dto.Id,
            Operator = Enum.Parse<LogicalOperator>(dto.Operator, true),
            Conditions = dto.Conditions.Select(MapConditionItem).ToList()
        };
    }

    private static ValidatorConditionItem MapConditionItem(ValidatorConditionItemDto dto)
    {
        var item = new ValidatorConditionItem
        {
            Id = dto.Id,
            Type = dto.Type,
            Field = dto.Field,
            DataType = Enum.TryParse<ValidatorDataType>(dto.DataType, true, out var dt) ? dt : ValidatorDataType.String,
            ConditionOperator = Enum.TryParse<ConditionOperator>(dto.Operator, true, out var op) ? op : ConditionOperator.Equals,
            Value = dto.Value,
            ValueTo = dto.ValueTo,
            ValueFrom = dto.ValueFrom,
            Message = dto.Message
        };

        if (dto.Group != null)
            item.Group = MapConditionGroup(dto.Group);

        return item;
    }

    private static ValidatorResultItemDto MapResultItem(ValidatorExecutionOutput output)
    {
        return new ValidatorResultItemDto
        {
            ValidatorId = output.ValidatorId,
            ValidatorCode = output.ValidatorCode,
            ValidatorName = output.ValidatorName,
            Status = output.Status.ToString(),
            Criticality = output.Criticality.ToString(),
            Message = output.Message,
            ExecutionTimeMs = output.ExecutionTimeMs,
            Context = new ValidatorResultContextDto
            {
                FileId = output.Context.FileId,
                FileName = output.Context.FileName,
                FileType = output.Context.FileType,
                Afore = output.Context.Afore,
                RecordIndex = output.Context.RecordIndex,
                LineNumber = output.Context.LineNumber,
                Field = output.Context.Field,
                Value = output.Context.Value,
                ExpectedValue = output.Context.ExpectedValue
            }
        };
    }
}

// Request DTOs
public record CreateValidatorRequest(
    string Code,
    string Name,
    string Description,
    string Type,
    string Criticality,
    List<string> FileTypes,
    ValidatorConditionGroupDto ConditionGroup,
    ValidatorActionDto Action,
    string? Category = null,
    string? RegulatoryReference = null,
    int RunOrder = 100,
    bool IsEnabled = true,
    bool StopOnFailure = false);

public record UpdateValidatorRequest(
    ValidatorConditionGroupDto? ConditionGroup = null,
    ValidatorActionDto? Action = null,
    string? Status = null,
    bool? IsEnabled = null,
    int? RunOrder = null,
    bool? StopOnFailure = null);

public record ExecuteValidationRequest(
    Guid FileId,
    string FileName,
    string FileType,
    string Afore,
    List<ValidationRecordDto> Records,
    Guid? PresetId = null);

public record ValidationRecordDto(
    int RecordIndex,
    Dictionary<string, object?> Fields);
