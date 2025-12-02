using Asp.Versioning;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Infrastructure.BackgroundJobs;
using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller para gestión de Scrapers de Cambios Normativos CONSAR
/// Proporciona endpoints para configurar, ejecutar y monitorear scrapers
/// </summary>
[ApiVersion("1.0")]
[Authorize(Policy = "RequireAdmin")]
public class ScrapersController : BaseController
{
    private readonly IApplicationDbContext _context;
    private readonly INormativeScraperService _scraperService;
    private readonly IBackgroundJobClient _jobClient;
    private readonly ILogger<ScrapersController> _logger;

    public ScrapersController(
        IApplicationDbContext context,
        INormativeScraperService scraperService,
        IBackgroundJobClient jobClient,
        ILogger<ScrapersController> logger)
    {
        _context = context;
        _scraperService = scraperService;
        _jobClient = jobClient;
        _logger = logger;
    }

    // ===== SOURCES =====

    /// <summary>
    /// Obtener lista de todas las fuentes de scraping
    /// </summary>
    [HttpGet("sources")]
    [SwaggerOperation(Summary = "Obtener todas las fuentes de scraping")]
    [ProducesResponseType(typeof(IEnumerable<ScraperSourceDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ScraperSourceDto>>> GetSources(
        [FromQuery] bool includeDisabled = true,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ScraperSources.AsNoTracking().Where(s => !s.IsDeleted);

        if (!includeDisabled)
            query = query.Where(s => s.IsEnabled);

        var sources = await query
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);

        var dtos = sources.Select(MapToSourceDto);

        return Ok(dtos);
    }

    /// <summary>
    /// Obtener fuente de scraping por ID
    /// </summary>
    [HttpGet("sources/{id:guid}")]
    [SwaggerOperation(Summary = "Obtener fuente de scraping por ID")]
    [ProducesResponseType(typeof(ScraperSourceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ScraperSourceDto>> GetSource(Guid id, CancellationToken cancellationToken)
    {
        var source = await _context.ScraperSources
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted, cancellationToken);

        if (source == null)
            return NotFound(new { error = "Fuente no encontrada" });

        return Ok(MapToSourceDto(source));
    }

    /// <summary>
    /// Crear nueva fuente de scraping
    /// </summary>
    [HttpPost("sources")]
    [SwaggerOperation(Summary = "Crear nueva fuente de scraping")]
    [ProducesResponseType(typeof(ScraperSourceDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ScraperSourceDto>> CreateSource(
        [FromBody] CreateScraperSourceRequest request,
        CancellationToken cancellationToken)
    {
        // Validar tipo de fuente
        if (!Enum.TryParse<ScraperSourceType>(request.SourceType, true, out var sourceType))
        {
            return BadRequest(new { error = $"Tipo de fuente inválido: {request.SourceType}" });
        }

        if (!Enum.TryParse<ScraperFrequency>(request.Frequency, true, out var frequency))
        {
            return BadRequest(new { error = $"Frecuencia inválida: {request.Frequency}" });
        }

        var source = ScraperSource.Create(
            request.Name,
            request.Description,
            sourceType,
            request.BaseUrl,
            frequency);

        if (!string.IsNullOrEmpty(request.EndpointPath))
            source.SetEndpoint(request.EndpointPath);

        if (!string.IsNullOrEmpty(request.Configuration))
            source.SetConfiguration(request.Configuration);

        _context.ScraperSources.Add(source);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("ScraperSource {Name} created by {UserId}", request.Name, CurrentUserId);

        return CreatedAtAction(nameof(GetSource), new { id = source.Id }, MapToSourceDto(source));
    }

    /// <summary>
    /// Actualizar fuente de scraping
    /// </summary>
    [HttpPut("sources/{id:guid}")]
    [SwaggerOperation(Summary = "Actualizar fuente de scraping")]
    [ProducesResponseType(typeof(ScraperSourceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ScraperSourceDto>> UpdateSource(
        Guid id,
        [FromBody] UpdateScraperSourceRequest request,
        CancellationToken cancellationToken)
    {
        var source = await _context.ScraperSources
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted, cancellationToken);

        if (source == null)
            return NotFound(new { error = "Fuente no encontrada" });

        if (!string.IsNullOrEmpty(request.EndpointPath))
            source.SetEndpoint(request.EndpointPath);

        if (!string.IsNullOrEmpty(request.Configuration))
            source.SetConfiguration(request.Configuration);

        if (!string.IsNullOrEmpty(request.Frequency) &&
            Enum.TryParse<ScraperFrequency>(request.Frequency, true, out var frequency))
        {
            source.UpdateFrequency(frequency);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(MapToSourceDto(source));
    }

    /// <summary>
    /// Habilitar/deshabilitar fuente de scraping
    /// </summary>
    [HttpPost("sources/{id:guid}/toggle")]
    [SwaggerOperation(Summary = "Habilitar/deshabilitar fuente")]
    [ProducesResponseType(typeof(ScraperSourceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ScraperSourceDto>> ToggleSource(
        Guid id,
        [FromQuery] bool enabled,
        CancellationToken cancellationToken)
    {
        var source = await _context.ScraperSources
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted, cancellationToken);

        if (source == null)
            return NotFound(new { error = "Fuente no encontrada" });

        if (enabled)
            source.Enable();
        else
            source.Disable();

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "ScraperSource {Name} {Action} by {UserId}",
            source.Name, enabled ? "enabled" : "disabled", CurrentUserId);

        return Ok(MapToSourceDto(source));
    }

    /// <summary>
    /// Eliminar fuente de scraping (soft delete)
    /// </summary>
    [HttpDelete("sources/{id:guid}")]
    [SwaggerOperation(Summary = "Eliminar fuente de scraping")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSource(Guid id, CancellationToken cancellationToken)
    {
        var source = await _context.ScraperSources
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted, cancellationToken);

        if (source == null)
            return NotFound(new { error = "Fuente no encontrada" });

        source.SoftDelete(CurrentUserId?.ToString() ?? "system");
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("ScraperSource {Name} deleted by {UserId}", source.Name, CurrentUserId);

        return NoContent();
    }

    // ===== EXECUTIONS =====

    /// <summary>
    /// Ejecutar scraping para una fuente específica
    /// </summary>
    [HttpPost("sources/{id:guid}/execute")]
    [SwaggerOperation(Summary = "Ejecutar scraping para una fuente")]
    [ProducesResponseType(typeof(ScraperExecutionResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ScraperExecutionResultDto>> ExecuteSource(
        Guid id,
        [FromQuery] bool async = true,
        CancellationToken cancellationToken = default)
    {
        var source = await _context.ScraperSources
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted, cancellationToken);

        if (source == null)
            return NotFound(new { error = "Fuente no encontrada" });

        if (async)
        {
            // Ejecutar en background con Hangfire
            var jobId = _jobClient.EnqueueSourceScraping(id, CurrentUserId?.ToString() ?? "manual");

            return Ok(new ScraperExecutionResultDto
            {
                SourceId = id,
                SourceName = source.Name,
                Status = "queued",
                JobId = jobId,
                Message = "Scraping encolado para ejecución en background"
            });
        }
        else
        {
            // Ejecutar síncronamente
            var result = await _scraperService.ExecuteScrapingAsync(
                id,
                CurrentUserId?.ToString() ?? "manual",
                cancellationToken);

            return Ok(new ScraperExecutionResultDto
            {
                ExecutionId = result.ExecutionId,
                SourceId = result.SourceId,
                SourceName = result.SourceName,
                Success = result.Success,
                Status = result.Status.ToString().ToLowerInvariant(),
                DocumentsFound = result.DocumentsFound,
                DocumentsNew = result.DocumentsNew,
                DocumentsDuplicate = result.DocumentsDuplicate,
                DocumentsError = result.DocumentsError,
                DurationMs = result.DurationMs,
                ErrorMessage = result.ErrorMessage,
                StartedAt = result.StartedAt,
                CompletedAt = result.CompletedAt
            });
        }
    }

    /// <summary>
    /// Ejecutar scraping para todas las fuentes habilitadas
    /// </summary>
    [HttpPost("execute-all")]
    [SwaggerOperation(Summary = "Ejecutar scraping para todas las fuentes")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> ExecuteAllSources(CancellationToken cancellationToken)
    {
        var enabledSources = await _context.ScraperSources
            .Where(s => s.IsEnabled && !s.IsDeleted)
            .Select(s => new { s.Id, s.Name })
            .ToListAsync(cancellationToken);

        var jobs = enabledSources.Select(s =>
            _jobClient.EnqueueSourceScraping(s.Id, CurrentUserId?.ToString() ?? "manual")).ToList();

        _logger.LogInformation(
            "Enqueued {Count} scraping jobs by {UserId}",
            jobs.Count, CurrentUserId);

        return Ok(new
        {
            message = $"Se encolaron {jobs.Count} trabajos de scraping",
            sources = enabledSources.Select(s => s.Name),
            jobIds = jobs
        });
    }

    /// <summary>
    /// Obtener historial de ejecuciones
    /// </summary>
    [HttpGet("executions")]
    [SwaggerOperation(Summary = "Obtener historial de ejecuciones")]
    [ProducesResponseType(typeof(IEnumerable<ExecutionHistoryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ExecutionHistoryDto>>> GetExecutions(
        [FromQuery] Guid? sourceId = null,
        [FromQuery] int limit = 50,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ScraperExecutions
            .AsNoTracking()
            .Include(e => e.Source)
            .OrderByDescending(e => e.StartedAt)
            .AsQueryable();

        if (sourceId.HasValue)
            query = query.Where(e => e.SourceId == sourceId.Value);

        var executions = await query.Take(limit).ToListAsync(cancellationToken);

        var dtos = executions.Select(e => new ExecutionHistoryDto
        {
            Id = e.Id,
            SourceId = e.SourceId,
            SourceName = e.Source?.Name ?? "Unknown",
            StartedAt = e.StartedAt,
            CompletedAt = e.CompletedAt,
            Status = e.Status.ToString().ToLowerInvariant(),
            DocumentsFound = e.DocumentsFound,
            DocumentsNew = e.DocumentsNew,
            DocumentsDuplicate = e.DocumentsDuplicate,
            DocumentsError = e.DocumentsError,
            DurationMs = e.DurationMs,
            ErrorMessage = e.ErrorMessage,
            TriggeredBy = e.TriggeredBy
        });

        return Ok(dtos);
    }

    /// <summary>
    /// Cancelar ejecución en progreso
    /// </summary>
    [HttpPost("executions/{id:guid}/cancel")]
    [SwaggerOperation(Summary = "Cancelar ejecución")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> CancelExecution(Guid id, CancellationToken cancellationToken)
    {
        await _scraperService.CancelExecutionAsync(id, cancellationToken);
        return Ok(new { message = "Solicitud de cancelación enviada" });
    }

    // ===== DOCUMENTS =====

    /// <summary>
    /// Obtener documentos scrapeados pendientes de procesamiento
    /// </summary>
    [HttpGet("documents")]
    [SwaggerOperation(Summary = "Obtener documentos scrapeados")]
    [ProducesResponseType(typeof(IEnumerable<ScrapedDocumentDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ScrapedDocumentDto>>> GetDocuments(
        [FromQuery] ScrapedDocumentStatus? status = null,
        [FromQuery] Guid? executionId = null,
        [FromQuery] int limit = 100,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ScrapedDocuments
            .AsNoTracking()
            .Include(d => d.Source)
            .OrderByDescending(d => d.CreatedAt)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(d => d.Status == status.Value);

        if (executionId.HasValue)
            query = query.Where(d => d.ExecutionId == executionId.Value);

        var documents = await query.Take(limit).ToListAsync(cancellationToken);

        var dtos = documents.Select(d => new ScrapedDocumentDto
        {
            Id = d.Id,
            ExecutionId = d.ExecutionId,
            SourceName = d.Source?.Name ?? "Unknown",
            ExternalId = d.ExternalId,
            Code = d.Code,
            Title = d.Title,
            Description = d.Description,
            PublishDate = d.PublishDate,
            EffectiveDate = d.EffectiveDate,
            Category = d.Category,
            DocumentUrl = d.DocumentUrl,
            PdfUrl = d.PdfUrl,
            Status = d.Status.ToString().ToLowerInvariant(),
            ProcessedAt = d.ProcessedAt,
            NormativeChangeId = d.NormativeChangeId,
            CreatedAt = d.CreatedAt
        });

        return Ok(dtos);
    }

    /// <summary>
    /// Procesar documento y convertirlo a NormativeChange
    /// </summary>
    [HttpPost("documents/{id:guid}/process")]
    [SwaggerOperation(Summary = "Procesar documento scrapeado")]
    [ProducesResponseType(typeof(ProcessDocumentResultDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProcessDocumentResultDto>> ProcessDocument(
        Guid id,
        [FromBody] ProcessDocumentRequest request,
        CancellationToken cancellationToken)
    {
        var priority = NormativePriority.Medium;
        if (!string.IsNullOrEmpty(request.Priority) &&
            Enum.TryParse<NormativePriority>(request.Priority, true, out var p))
        {
            priority = p;
        }

        var result = await _scraperService.ProcessDocumentAsync(
            id,
            CurrentUserId?.ToString() ?? "manual",
            priority,
            request.AffectedValidators,
            cancellationToken);

        return Ok(new ProcessDocumentResultDto
        {
            DocumentId = result.DocumentId,
            Success = result.Success,
            NormativeChangeId = result.NormativeChangeId,
            Status = result.Status.ToString().ToLowerInvariant(),
            ErrorMessage = result.ErrorMessage
        });
    }

    /// <summary>
    /// Procesar todos los documentos pendientes
    /// </summary>
    [HttpPost("documents/process-all")]
    [SwaggerOperation(Summary = "Procesar todos los documentos pendientes")]
    [ProducesResponseType(typeof(ProcessBatchResultDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProcessBatchResultDto>> ProcessAllDocuments(
        [FromQuery] Guid? executionId = null,
        [FromQuery] bool async = true,
        CancellationToken cancellationToken = default)
    {
        if (async)
        {
            var jobId = _jobClient.EnqueueDocumentProcessing(executionId);
            return Ok(new ProcessBatchResultDto
            {
                Message = "Procesamiento encolado en background",
                JobId = jobId
            });
        }

        var result = await _scraperService.ProcessPendingDocumentsAsync(
            executionId,
            autoAssignPriority: true,
            cancellationToken);

        return Ok(new ProcessBatchResultDto
        {
            TotalProcessed = result.TotalProcessed,
            SuccessCount = result.SuccessCount,
            ErrorCount = result.ErrorCount,
            IgnoredCount = result.IgnoredCount
        });
    }

    /// <summary>
    /// Marcar documento como ignorado
    /// </summary>
    [HttpPost("documents/{id:guid}/ignore")]
    [SwaggerOperation(Summary = "Ignorar documento")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> IgnoreDocument(
        Guid id,
        [FromQuery] string reason = "Ignorado manualmente",
        CancellationToken cancellationToken = default)
    {
        var document = await _context.ScrapedDocuments
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (document == null)
            return NotFound(new { error = "Documento no encontrado" });

        document.MarkAsIgnored(reason);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Documento marcado como ignorado" });
    }

    // ===== STATISTICS =====

    /// <summary>
    /// Obtener estadísticas de scrapers
    /// </summary>
    [HttpGet("statistics")]
    [SwaggerOperation(Summary = "Obtener estadísticas de scrapers")]
    [ProducesResponseType(typeof(ScraperStatisticsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ScraperStatisticsDto>> GetStatistics(CancellationToken cancellationToken)
    {
        var sources = await _context.ScraperSources
            .Where(s => !s.IsDeleted)
            .ToListAsync(cancellationToken);

        var last24Hours = DateTime.UtcNow.AddHours(-24);
        var recentExecutions = await _context.ScraperExecutions
            .Where(e => e.StartedAt >= last24Hours)
            .ToListAsync(cancellationToken);

        var pendingDocuments = await _context.ScrapedDocuments
            .CountAsync(d => d.Status == ScrapedDocumentStatus.New, cancellationToken);

        var statistics = new ScraperStatisticsDto
        {
            TotalSources = sources.Count,
            EnabledSources = sources.Count(s => s.IsEnabled),
            DisabledSources = sources.Count(s => !s.IsEnabled),
            FailingSources = sources.Count(s => s.ConsecutiveFailures > 0),
            TotalExecutions24h = recentExecutions.Count,
            SuccessfulExecutions24h = recentExecutions.Count(e => e.Status == ScraperExecutionStatus.Completed),
            FailedExecutions24h = recentExecutions.Count(e => e.Status == ScraperExecutionStatus.Failed),
            DocumentsFound24h = recentExecutions.Sum(e => e.DocumentsFound),
            NewDocuments24h = recentExecutions.Sum(e => e.DocumentsNew),
            PendingDocuments = pendingDocuments,
            SourcesByType = sources.GroupBy(s => s.SourceType.ToString())
                .ToDictionary(g => g.Key, g => g.Count())
        };

        return Ok(statistics);
    }

    // ===== HELPERS =====

    private static ScraperSourceDto MapToSourceDto(ScraperSource source) => new()
    {
        Id = source.Id,
        Name = source.Name,
        Description = source.Description,
        SourceType = source.SourceType.ToString(),
        BaseUrl = source.BaseUrl,
        EndpointPath = source.EndpointPath,
        Frequency = source.Frequency.ToString(),
        IsEnabled = source.IsEnabled,
        LastExecutionAt = source.LastExecutionAt,
        NextScheduledAt = source.NextScheduledAt,
        ConsecutiveFailures = source.ConsecutiveFailures,
        TotalExecutions = source.TotalExecutions,
        TotalDocumentsFound = source.TotalDocumentsFound,
        LastError = source.LastError,
        CreatedAt = source.CreatedAt
    };
}

// ===== DTOs =====

public record ScraperSourceDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string SourceType { get; init; } = string.Empty;
    public string BaseUrl { get; init; } = string.Empty;
    public string? EndpointPath { get; init; }
    public string Frequency { get; init; } = string.Empty;
    public bool IsEnabled { get; init; }
    public DateTime? LastExecutionAt { get; init; }
    public DateTime? NextScheduledAt { get; init; }
    public int ConsecutiveFailures { get; init; }
    public int TotalExecutions { get; init; }
    public int TotalDocumentsFound { get; init; }
    public string? LastError { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreateScraperSourceRequest(
    string Name,
    string Description,
    string SourceType,
    string BaseUrl,
    string Frequency,
    string? EndpointPath = null,
    string? Configuration = null);

public record UpdateScraperSourceRequest(
    string? EndpointPath = null,
    string? Frequency = null,
    string? Configuration = null);

public record ScraperExecutionResultDto
{
    public Guid? ExecutionId { get; init; }
    public Guid SourceId { get; init; }
    public string SourceName { get; init; } = string.Empty;
    public bool Success { get; init; }
    public string Status { get; init; } = string.Empty;
    public int DocumentsFound { get; init; }
    public int DocumentsNew { get; init; }
    public int DocumentsDuplicate { get; init; }
    public int DocumentsError { get; init; }
    public long DurationMs { get; init; }
    public string? ErrorMessage { get; init; }
    public string? JobId { get; init; }
    public string? Message { get; init; }
    public DateTime StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
}

public record ExecutionHistoryDto
{
    public Guid Id { get; init; }
    public Guid SourceId { get; init; }
    public string SourceName { get; init; } = string.Empty;
    public DateTime StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public string Status { get; init; } = string.Empty;
    public int DocumentsFound { get; init; }
    public int DocumentsNew { get; init; }
    public int DocumentsDuplicate { get; init; }
    public int DocumentsError { get; init; }
    public long DurationMs { get; init; }
    public string? ErrorMessage { get; init; }
    public string? TriggeredBy { get; init; }
}

public record ScrapedDocumentDto
{
    public Guid Id { get; init; }
    public Guid ExecutionId { get; init; }
    public string SourceName { get; init; } = string.Empty;
    public string ExternalId { get; init; } = string.Empty;
    public string? Code { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime? PublishDate { get; init; }
    public DateTime? EffectiveDate { get; init; }
    public string? Category { get; init; }
    public string? DocumentUrl { get; init; }
    public string? PdfUrl { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime? ProcessedAt { get; init; }
    public Guid? NormativeChangeId { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record ProcessDocumentRequest(
    string? Priority = null,
    string[]? AffectedValidators = null);

public record ProcessDocumentResultDto
{
    public Guid DocumentId { get; init; }
    public bool Success { get; init; }
    public Guid? NormativeChangeId { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? ErrorMessage { get; init; }
}

public record ProcessBatchResultDto
{
    public int TotalProcessed { get; init; }
    public int SuccessCount { get; init; }
    public int ErrorCount { get; init; }
    public int IgnoredCount { get; init; }
    public string? Message { get; init; }
    public string? JobId { get; init; }
}

public record ScraperStatisticsDto
{
    public int TotalSources { get; init; }
    public int EnabledSources { get; init; }
    public int DisabledSources { get; init; }
    public int FailingSources { get; init; }
    public int TotalExecutions24h { get; init; }
    public int SuccessfulExecutions24h { get; init; }
    public int FailedExecutions24h { get; init; }
    public int DocumentsFound24h { get; init; }
    public int NewDocuments24h { get; init; }
    public int PendingDocuments { get; init; }
    public Dictionary<string, int> SourcesByType { get; init; } = new();
}
