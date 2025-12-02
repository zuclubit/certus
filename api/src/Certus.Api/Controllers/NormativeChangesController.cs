using Asp.Versioning;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller para gestión de Cambios Normativos CONSAR
/// Proporciona seguimiento de circulares y disposiciones normativas
/// </summary>
[ApiVersion("1.0")]
[Authorize]
public class NormativeChangesController : BaseController
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<NormativeChangesController> _logger;

    public NormativeChangesController(
        IApplicationDbContext context,
        ILogger<NormativeChangesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtener lista de todos los cambios normativos
    /// </summary>
    [HttpGet]
    [SwaggerOperation(Summary = "Obtener todos los cambios normativos", Description = "Retorna la lista de cambios normativos CONSAR")]
    [ProducesResponseType(typeof(IEnumerable<NormativeChangeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<NormativeChangeDto>>> GetNormativeChanges(
        [FromQuery] NormativeStatus? status = null,
        [FromQuery] NormativePriority? priority = null,
        [FromQuery] string? category = null,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.NormativeChanges.AsNoTracking();

        if (status.HasValue)
            query = query.Where(n => n.Status == status.Value);

        if (priority.HasValue)
            query = query.Where(n => n.Priority == priority.Value);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(n => n.Category == category);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(n =>
                n.Code.Contains(search) ||
                n.Title.Contains(search) ||
                n.Description.Contains(search));

        var changes = await query
            .OrderByDescending(n => n.PublishDate)
            .ToListAsync(cancellationToken);

        var dtos = changes.Select(n => new NormativeChangeDto
        {
            Id = n.Id,
            Code = n.Code,
            Title = n.Title,
            Description = n.Description,
            PublishDate = n.PublishDate,
            EffectiveDate = n.EffectiveDate,
            Status = n.Status.ToString().ToLowerInvariant(),
            Priority = n.Priority.ToString().ToLowerInvariant(),
            Category = n.Category,
            AffectedValidators = n.GetAffectedValidators(),
            DocumentUrl = n.DocumentUrl,
            AppliedAt = n.AppliedAt,
            AppliedBy = n.AppliedBy
        });

        return Ok(dtos);
    }

    /// <summary>
    /// Obtener cambio normativo por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [SwaggerOperation(Summary = "Obtener cambio normativo por ID", Description = "Retorna el detalle de un cambio normativo")]
    [ProducesResponseType(typeof(NormativeChangeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<NormativeChangeDto>> GetNormativeChange(Guid id, CancellationToken cancellationToken)
    {
        var change = await _context.NormativeChanges
            .AsNoTracking()
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);

        if (change == null)
            return NotFound(new { error = "Cambio normativo no encontrado" });

        var dto = new NormativeChangeDto
        {
            Id = change.Id,
            Code = change.Code,
            Title = change.Title,
            Description = change.Description,
            PublishDate = change.PublishDate,
            EffectiveDate = change.EffectiveDate,
            Status = change.Status.ToString().ToLowerInvariant(),
            Priority = change.Priority.ToString().ToLowerInvariant(),
            Category = change.Category,
            AffectedValidators = change.GetAffectedValidators(),
            DocumentUrl = change.DocumentUrl,
            Notes = change.Notes,
            AppliedAt = change.AppliedAt,
            AppliedBy = change.AppliedBy
        };

        return Ok(dto);
    }

    /// <summary>
    /// Obtener estadísticas de cambios normativos
    /// </summary>
    [HttpGet("statistics")]
    [SwaggerOperation(Summary = "Obtener estadísticas", Description = "Retorna estadísticas de cambios normativos")]
    [ProducesResponseType(typeof(NormativeStatisticsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<NormativeStatisticsDto>> GetStatistics(CancellationToken cancellationToken)
    {
        var changes = await _context.NormativeChanges.AsNoTracking().ToListAsync(cancellationToken);

        var statistics = new NormativeStatisticsDto
        {
            Total = changes.Count,
            Pending = changes.Count(c => c.Status == NormativeStatus.Pending),
            Active = changes.Count(c => c.Status == NormativeStatus.Active),
            Archived = changes.Count(c => c.Status == NormativeStatus.Archived),
            HighPriority = changes.Count(c => c.Priority == NormativePriority.High),
            ByCategory = changes
                .GroupBy(c => c.Category)
                .ToDictionary(g => g.Key, g => g.Count())
        };

        return Ok(statistics);
    }

    /// <summary>
    /// Crear nuevo cambio normativo (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Crear cambio normativo", Description = "Crea un nuevo registro de cambio normativo")]
    [ProducesResponseType(typeof(NormativeChangeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<NormativeChangeDto>> CreateNormativeChange(
        [FromBody] CreateNormativeChangeRequest request,
        CancellationToken cancellationToken)
    {
        // Validar código único
        var exists = await _context.NormativeChanges
            .AnyAsync(n => n.Code == request.Code.ToUpperInvariant(), cancellationToken);

        if (exists)
            return BadRequest(new { error = $"Ya existe un cambio normativo con el código '{request.Code}'" });

        var change = NormativeChange.Create(
            request.Code,
            request.Title,
            request.Description,
            request.PublishDate,
            request.EffectiveDate,
            Enum.Parse<NormativePriority>(request.Priority, true),
            request.Category,
            request.AffectedValidators);

        if (!string.IsNullOrEmpty(request.DocumentUrl))
            change.SetDocumentUrl(request.DocumentUrl);

        _context.NormativeChanges.Add(change);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("NormativeChange {Code} created by user {UserId}", request.Code, CurrentUserId);

        var dto = new NormativeChangeDto
        {
            Id = change.Id,
            Code = change.Code,
            Title = change.Title,
            Description = change.Description,
            PublishDate = change.PublishDate,
            EffectiveDate = change.EffectiveDate,
            Status = change.Status.ToString().ToLowerInvariant(),
            Priority = change.Priority.ToString().ToLowerInvariant(),
            Category = change.Category,
            AffectedValidators = change.GetAffectedValidators(),
            DocumentUrl = change.DocumentUrl
        };

        return CreatedAtAction(nameof(GetNormativeChange), new { id = change.Id }, dto);
    }

    /// <summary>
    /// Aplicar cambio normativo
    /// </summary>
    [HttpPost("{id:guid}/apply")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Aplicar cambio normativo", Description = "Marca el cambio normativo como aplicado")]
    [ProducesResponseType(typeof(NormativeChangeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<NormativeChangeDto>> ApplyNormativeChange(
        Guid id,
        CancellationToken cancellationToken)
    {
        var change = await _context.NormativeChanges
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);

        if (change == null)
            return NotFound(new { error = "Cambio normativo no encontrado" });

        change.Apply(CurrentUserId?.ToString() ?? "system");
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("NormativeChange {Code} applied by user {UserId}", change.Code, CurrentUserId);

        var dto = new NormativeChangeDto
        {
            Id = change.Id,
            Code = change.Code,
            Title = change.Title,
            Description = change.Description,
            PublishDate = change.PublishDate,
            EffectiveDate = change.EffectiveDate,
            Status = change.Status.ToString().ToLowerInvariant(),
            Priority = change.Priority.ToString().ToLowerInvariant(),
            Category = change.Category,
            AffectedValidators = change.GetAffectedValidators(),
            DocumentUrl = change.DocumentUrl,
            AppliedAt = change.AppliedAt,
            AppliedBy = change.AppliedBy
        };

        return Ok(dto);
    }

    /// <summary>
    /// Archivar cambio normativo
    /// </summary>
    [HttpPost("{id:guid}/archive")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Archivar cambio normativo", Description = "Marca el cambio normativo como archivado")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ArchiveNormativeChange(Guid id, CancellationToken cancellationToken)
    {
        var change = await _context.NormativeChanges
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);

        if (change == null)
            return NotFound(new { error = "Cambio normativo no encontrado" });

        change.Archive();
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("NormativeChange {Code} archived by user {UserId}", change.Code, CurrentUserId);

        return NoContent();
    }

    /// <summary>
    /// Eliminar cambio normativo (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Eliminar cambio normativo", Description = "Elimina un cambio normativo (soft delete)")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteNormativeChange(
        Guid id,
        [FromQuery] string? reason = null,
        CancellationToken cancellationToken = default)
    {
        var change = await _context.NormativeChanges
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);

        if (change == null)
            return NotFound(new { error = "Cambio normativo no encontrado" });

        change.SoftDelete(CurrentUserId?.ToString() ?? "system", reason);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("NormativeChange {Code} deleted by user {UserId}", change.Code, CurrentUserId);

        return NoContent();
    }
}

// DTOs
public record NormativeChangeDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public DateTime PublishDate { get; init; }
    public DateTime EffectiveDate { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string[] AffectedValidators { get; init; } = Array.Empty<string>();
    public string? DocumentUrl { get; init; }
    public string? Notes { get; init; }
    public DateTime? AppliedAt { get; init; }
    public string? AppliedBy { get; init; }
}

public record NormativeStatisticsDto
{
    public int Total { get; init; }
    public int Pending { get; init; }
    public int Active { get; init; }
    public int Archived { get; init; }
    public int HighPriority { get; init; }
    public Dictionary<string, int> ByCategory { get; init; } = new();
}

public record CreateNormativeChangeRequest(
    string Code,
    string Title,
    string Description,
    DateTime PublishDate,
    DateTime EffectiveDate,
    string Priority,
    string Category,
    string[] AffectedValidators,
    string? DocumentUrl = null);
