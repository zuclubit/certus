using Certus.Application.Common.Models;
using Certus.Application.DTOs;
using Certus.Application.Features.Validations.Commands;
using Certus.Application.Features.Validations.Queries;
using Certus.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller para gestión de validaciones CONSAR
/// </summary>
[Authorize]
public class ValidationsController : BaseController
{
    /// <summary>
    /// Obtener lista paginada de validaciones
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<ValidationSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<ValidationSummaryDto>>> GetValidations(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] ValidationStatus? status = null,
        [FromQuery] FileType? fileType = null,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var query = new GetValidationsQuery
        {
            Page = page,
            PageSize = pageSize,
            Status = status,
            FileType = fileType,
            SearchTerm = search,
            SortBy = sortBy,
            SortDescending = sortDescending,
            StartDate = startDate,
            EndDate = endDate
        };

        var result = await Mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Obtener validación por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ValidationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ValidationDto>> GetValidation(
        Guid id,
        [FromQuery] bool includeErrors = true,
        [FromQuery] bool includeWarnings = true,
        [FromQuery] bool includeValidatorResults = true,
        [FromQuery] bool includeTimeline = true)
    {
        var query = new GetValidationByIdQuery
        {
            ValidationId = id,
            IncludeErrors = includeErrors,
            IncludeWarnings = includeWarnings,
            IncludeValidatorResults = includeValidatorResults,
            IncludeTimeline = includeTimeline
        };

        var result = await Mediator.Send(query);

        if (result.IsFailure)
            return NotFound(new { error = result.Error, code = result.ErrorCode });

        return Ok(result.Value);
    }

    /// <summary>
    /// Obtener validaciones recientes
    /// </summary>
    [HttpGet("recent")]
    [ProducesResponseType(typeof(IReadOnlyList<ValidationSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ValidationSummaryDto>>> GetRecentValidations(
        [FromQuery] int count = 10)
    {
        var query = new GetRecentValidationsQuery { Count = count };
        var result = await Mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Obtener estadísticas de validaciones
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ValidationStatisticsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ValidationStatisticsDto>> GetStatistics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var query = new GetValidationStatisticsQuery
        {
            StartDate = startDate,
            EndDate = endDate
        };

        var result = await Mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Obtener historial de versiones de una validación
    /// </summary>
    [HttpGet("{id:guid}/versions")]
    [ProducesResponseType(typeof(IReadOnlyList<ValidationSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<ValidationSummaryDto>>> GetVersionHistory(Guid id)
    {
        var query = new GetVersionHistoryQuery { ValidationId = id };
        var result = await Mediator.Send(query);

        if (result.IsFailure)
            return NotFound(new { error = result.Error, code = result.ErrorCode });

        return Ok(result.Value);
    }

    /// <summary>
    /// Obtener registros parseados del archivo de validación (paginados)
    /// </summary>
    [HttpGet("{id:guid}/records")]
    [ProducesResponseType(typeof(ValidationRecordsResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ValidationRecordsResult>> GetValidationRecords(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] bool includeRawLines = false)
    {
        var query = new GetValidationRecordsQuery
        {
            ValidationId = id,
            Page = page,
            PageSize = pageSize,
            IncludeRawLines = includeRawLines
        };

        var result = await Mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.ErrorCode == "NOT_FOUND" || result.ErrorCode == "FILE_NOT_FOUND")
                return NotFound(new { error = result.Error, code = result.ErrorCode });

            return BadRequest(new { error = result.Error, code = result.ErrorCode });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Subir y crear nueva validación
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "CanManageValidations")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ValidationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(100 * 1024 * 1024)] // 100MB
    public async Task<ActionResult<ValidationDto>> UploadValidation(
        IFormFile file,
        [FromForm] FileType fileType,
        [FromForm] bool autoProcess = true)
    {
        var command = new UploadValidationCommand
        {
            File = file,
            FileType = fileType,
            AutoProcess = autoProcess
        };

        var result = await Mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(new { error = result.Error, code = result.ErrorCode });

        return CreatedAtAction(
            nameof(GetValidation),
            new { id = result.Value!.Id },
            result.Value);
    }

    /// <summary>
    /// Crear validación sustituta (Retransmisión CONSAR)
    /// </summary>
    [HttpPost("{id:guid}/substitute")]
    [Authorize(Policy = "CanManageValidations")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ValidationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [RequestSizeLimit(100 * 1024 * 1024)]
    public async Task<ActionResult<ValidationDto>> CreateSubstituteValidation(
        Guid id,
        IFormFile file,
        [FromForm] string substitutionReason,
        [FromForm] bool autoProcess = true)
    {
        var command = new CreateSubstituteValidationCommand
        {
            OriginalValidationId = id,
            File = file,
            SubstitutionReason = substitutionReason,
            AutoProcess = autoProcess
        };

        var result = await Mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.ErrorCode == "NOT_FOUND")
                return NotFound(new { error = result.Error, code = result.ErrorCode });

            return BadRequest(new { error = result.Error, code = result.ErrorCode });
        }

        return CreatedAtAction(
            nameof(GetValidation),
            new { id = result.Value!.Id },
            result.Value);
    }

    /// <summary>
    /// Procesar validación (ejecutar reglas de validación CONSAR)
    /// </summary>
    [HttpPost("{id:guid}/process")]
    [Authorize(Policy = "CanManageValidations")]
    [ProducesResponseType(typeof(ProcessValidationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProcessValidationResult>> ProcessValidation(
        Guid id,
        [FromBody] ProcessValidationRequest? request = null)
    {
        var command = new ProcessValidationCommand(
            ValidationId: id,
            PresetId: request?.PresetId,
            ValidatorIds: request?.ValidatorIds);

        var result = await Mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Code.Contains("NotFound"))
                return NotFound(new { error = result.Error.Message, code = result.Error.Code });

            return BadRequest(new { error = result.Error.Message, code = result.Error.Code });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Cancelar validación en progreso
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    [Authorize(Policy = "CanManageValidations")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelValidation(
        Guid id,
        [FromBody] CancelValidationRequest request)
    {
        var command = new CancelValidationCommand
        {
            ValidationId = id,
            Reason = request.Reason
        };

        var result = await Mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.ErrorCode == "NOT_FOUND")
                return NotFound(new { error = result.Error, code = result.ErrorCode });

            return BadRequest(new { error = result.Error, code = result.ErrorCode });
        }

        return NoContent();
    }

    /// <summary>
    /// Reprocesar validación existente (limpia resultados y ejecuta de nuevo)
    /// </summary>
    [HttpPost("{id:guid}/reprocess")]
    [Authorize(Policy = "CanManageValidations")]
    [ProducesResponseType(typeof(ProcessValidationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProcessValidationResult>> ReprocessValidation(
        Guid id,
        [FromBody] ProcessValidationRequest? request = null)
    {
        var command = new ReprocessValidationCommand(
            ValidationId: id,
            PresetId: request?.PresetId,
            ValidatorIds: request?.ValidatorIds);

        var result = await Mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Code.Contains("NotFound"))
                return NotFound(new { error = result.Error.Message, code = result.Error.Code });

            return BadRequest(new { error = result.Error.Message, code = result.Error.Code });
        }

        return Ok(result.Value);
    }
}

/// <summary>
/// Request para cancelar validación
/// </summary>
public record CancelValidationRequest(string Reason);

/// <summary>
/// Request para procesar validación
/// </summary>
public record ProcessValidationRequest(
    Guid? PresetId = null,
    List<Guid>? ValidatorIds = null);
