using Certus.Domain.Entities;
using Certus.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller para consulta de Logs de Auditoría
/// Proporciona acceso a trazabilidad y cumplimiento CONSAR
/// </summary>
[Authorize(Policy = "RequireSupervisor")]
public class AuditLogController : BaseController
{
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly ILogger<AuditLogController> _logger;

    public AuditLogController(
        IAuditLogRepository auditLogRepository,
        ILogger<AuditLogController> logger)
    {
        _auditLogRepository = auditLogRepository;
        _logger = logger;
    }

    /// <summary>
    /// Obtener logs de auditoría con paginación y filtros
    /// </summary>
    [HttpGet]
    [SwaggerOperation(Summary = "Obtener logs de auditoría", Description = "Retorna logs paginados con filtros opcionales")]
    [ProducesResponseType(typeof(PagedAuditResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedAuditResult>> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? action = null,
        [FromQuery] string? entityType = null,
        [FromQuery] Guid? userId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        var result = await _auditLogRepository.GetPagedAsync(
            CurrentTenantId.Value,
            page,
            pageSize,
            action,
            entityType,
            userId,
            startDate,
            endDate,
            cancellationToken);

        var dtos = result.Items.Select(MapToDto).ToList();

        return Ok(new PagedAuditResult
        {
            Items = dtos,
            Page = result.Page,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount,
            TotalPages = (int)Math.Ceiling((double)result.TotalCount / result.PageSize)
        });
    }

    /// <summary>
    /// Obtener log de auditoría por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [SwaggerOperation(Summary = "Obtener log por ID", Description = "Retorna un registro de auditoría específico")]
    [ProducesResponseType(typeof(AuditLogDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AuditLogDto>> GetAuditLog(Guid id, CancellationToken cancellationToken)
    {
        var log = await _auditLogRepository.GetByIdAsync(id, cancellationToken);

        if (log == null)
            return NotFound(new { error = "Registro de auditoría no encontrado" });

        // Verify tenant access
        if (log.TenantId.HasValue && log.TenantId != CurrentTenantId)
            return Forbid();

        return Ok(MapToDto(log));
    }

    /// <summary>
    /// Obtener logs por usuario específico
    /// </summary>
    [HttpGet("user/{userId:guid}")]
    [SwaggerOperation(Summary = "Obtener logs por usuario", Description = "Retorna todos los logs de un usuario específico")]
    [ProducesResponseType(typeof(IEnumerable<AuditLogDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetByUser(
        Guid userId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var logs = await _auditLogRepository.GetByUserAsync(userId, startDate, endDate, cancellationToken);
        var dtos = logs.Select(MapToDto);
        return Ok(dtos);
    }

    /// <summary>
    /// Obtener logs por entidad
    /// </summary>
    [HttpGet("entity/{entityType}/{entityId:guid}")]
    [SwaggerOperation(Summary = "Obtener logs por entidad", Description = "Retorna el historial de cambios de una entidad específica")]
    [ProducesResponseType(typeof(IEnumerable<AuditLogDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetByEntity(
        string entityType,
        Guid entityId,
        CancellationToken cancellationToken)
    {
        var logs = await _auditLogRepository.GetByEntityAsync(entityType, entityId, cancellationToken);
        var dtos = logs.Select(MapToDto);
        return Ok(dtos);
    }

    /// <summary>
    /// Obtener logs por acción
    /// </summary>
    [HttpGet("action/{action}")]
    [SwaggerOperation(Summary = "Obtener logs por acción", Description = "Filtra logs por tipo de acción")]
    [ProducesResponseType(typeof(IEnumerable<AuditLogDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetByAction(
        string action,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var logs = await _auditLogRepository.GetByActionAsync(
            action,
            CurrentTenantId,
            startDate,
            endDate,
            cancellationToken);

        var dtos = logs.Select(MapToDto);
        return Ok(dtos);
    }

    /// <summary>
    /// Obtener logs por correlation ID
    /// </summary>
    [HttpGet("correlation/{correlationId}")]
    [SwaggerOperation(Summary = "Obtener logs por correlation ID", Description = "Obtiene todos los logs relacionados a una operación")]
    [ProducesResponseType(typeof(IEnumerable<AuditLogDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetByCorrelation(
        string correlationId,
        CancellationToken cancellationToken)
    {
        var logs = await _auditLogRepository.GetByCorrelationIdAsync(correlationId, cancellationToken);
        var dtos = logs.Select(MapToDto);
        return Ok(dtos);
    }

    /// <summary>
    /// Obtener logs por módulo
    /// </summary>
    [HttpGet("module/{module}")]
    [SwaggerOperation(Summary = "Obtener logs por módulo", Description = "Filtra logs por módulo del sistema")]
    [ProducesResponseType(typeof(IEnumerable<AuditLogDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetByModule(
        string module,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var logs = await _auditLogRepository.GetByModuleAsync(
            module,
            CurrentTenantId,
            startDate,
            endDate,
            cancellationToken);

        var dtos = logs.Select(MapToDto);
        return Ok(dtos);
    }

    /// <summary>
    /// Obtener estadísticas de auditoría
    /// </summary>
    [HttpGet("statistics")]
    [SwaggerOperation(Summary = "Obtener estadísticas", Description = "Retorna métricas agregadas de auditoría")]
    [ProducesResponseType(typeof(AuditStatisticsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<AuditStatisticsDto>> GetStatistics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        var stats = await _auditLogRepository.GetStatisticsAsync(
            CurrentTenantId.Value,
            startDate,
            endDate,
            cancellationToken);

        var dto = new AuditStatisticsDto
        {
            TotalLogs = stats.TotalLogs,
            UniqueUsers = stats.UniqueUsers,
            UniqueSessions = stats.UniqueSessions,
            ByAction = stats.ByAction,
            ByEntityType = stats.ByEntityType,
            ByModule = stats.ByModule,
            ByDay = stats.ByDay,
            ByHour = stats.ByHour,
            SuccessfulRequests = stats.SuccessfulRequests,
            FailedRequests = stats.FailedRequests,
            AverageResponseTimeMs = stats.AverageResponseTimeMs
        };

        return Ok(dto);
    }

    /// <summary>
    /// Obtener lista de tipos de acciones disponibles
    /// </summary>
    [HttpGet("actions")]
    [SwaggerOperation(Summary = "Obtener tipos de acciones", Description = "Retorna la lista de tipos de acciones de auditoría")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<AuditActionInfo>> GetActionTypes()
    {
        var actions = new List<AuditActionInfo>
        {
            // Authentication
            new(AuditActions.Login, "Autenticación", "Inicio de sesión exitoso"),
            new(AuditActions.Logout, "Autenticación", "Cierre de sesión"),
            new(AuditActions.LoginFailed, "Autenticación", "Intento de inicio de sesión fallido"),
            new(AuditActions.PasswordChanged, "Autenticación", "Cambio de contraseña"),
            new(AuditActions.TokenRefreshed, "Autenticación", "Token de acceso renovado"),

            // CRUD
            new(AuditActions.Create, "CRUD", "Creación de entidad"),
            new(AuditActions.Read, "CRUD", "Lectura de entidad"),
            new(AuditActions.Update, "CRUD", "Actualización de entidad"),
            new(AuditActions.Delete, "CRUD", "Eliminación de entidad"),
            new(AuditActions.SoftDelete, "CRUD", "Eliminación lógica"),
            new(AuditActions.Restore, "CRUD", "Restauración de entidad"),

            // Validations
            new(AuditActions.ValidationStarted, "Validaciones", "Inicio de validación"),
            new(AuditActions.ValidationCompleted, "Validaciones", "Validación completada"),
            new(AuditActions.ValidationFailed, "Validaciones", "Validación fallida"),
            new(AuditActions.ValidationCancelled, "Validaciones", "Validación cancelada"),

            // Files
            new(AuditActions.FileUploaded, "Archivos", "Carga de archivo"),
            new(AuditActions.FileDownloaded, "Archivos", "Descarga de archivo"),
            new(AuditActions.FileDeleted, "Archivos", "Eliminación de archivo"),
            new(AuditActions.FileSubstituted, "Archivos", "Sustitución de archivo"),

            // Approvals
            new(AuditActions.ApprovalRequested, "Aprobaciones", "Solicitud de aprobación"),
            new(AuditActions.ApprovalGranted, "Aprobaciones", "Aprobación concedida"),
            new(AuditActions.ApprovalRejected, "Aprobaciones", "Aprobación rechazada"),
            new(AuditActions.ApprovalEscalated, "Aprobaciones", "Aprobación escalada"),

            // Exports
            new(AuditActions.ExportGenerated, "Exportaciones", "Exportación generada"),
            new(AuditActions.ReportGenerated, "Exportaciones", "Reporte generado"),

            // Administration
            new(AuditActions.UserCreated, "Administración", "Usuario creado"),
            new(AuditActions.UserUpdated, "Administración", "Usuario actualizado"),
            new(AuditActions.UserDeactivated, "Administración", "Usuario desactivado"),
            new(AuditActions.RoleAssigned, "Administración", "Rol asignado"),
            new(AuditActions.PermissionChanged, "Administración", "Permisos modificados")
        };

        return Ok(actions);
    }

    /// <summary>
    /// Limpiar logs antiguos (Admin only)
    /// </summary>
    [HttpDelete("cleanup")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Limpiar logs antiguos", Description = "Elimina logs más antiguos que el período de retención")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> CleanupOldLogs(
        [FromQuery] int retentionDays = 365,
        CancellationToken cancellationToken = default)
    {
        if (retentionDays < 90)
            return BadRequest(new { error = "El período de retención mínimo es 90 días (cumplimiento CONSAR)" });

        await _auditLogRepository.CleanupOldLogsAsync(retentionDays, cancellationToken);

        _logger.LogInformation(
            "Audit logs older than {RetentionDays} days cleaned up by user {UserId}",
            retentionDays, CurrentUserId);

        return NoContent();
    }

    private static AuditLogDto MapToDto(AuditLog log)
    {
        return new AuditLogDto
        {
            Id = log.Id,
            TenantId = log.TenantId,
            UserId = log.UserId,
            Action = log.Action,
            EntityType = log.EntityType,
            EntityId = log.EntityId,
            OldValues = log.OldValues,
            NewValues = log.NewValues,
            Changes = log.Changes,
            IpAddress = log.IpAddress,
            UserAgent = log.UserAgent,
            RequestPath = log.RequestPath,
            RequestMethod = log.RequestMethod,
            StatusCode = log.StatusCode,
            DurationMs = log.DurationMs,
            ErrorMessage = log.ErrorMessage,
            CorrelationId = log.CorrelationId,
            Timestamp = log.Timestamp,
            SessionId = log.SessionId,
            Module = log.Module,
            SubModule = log.SubModule,
            Details = log.Details
        };
    }
}

// DTOs
public record AuditLogDto
{
    public Guid Id { get; init; }
    public Guid? TenantId { get; init; }
    public Guid? UserId { get; init; }
    public string Action { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
    public Guid? EntityId { get; init; }
    public string? OldValues { get; init; }
    public string? NewValues { get; init; }
    public string? Changes { get; init; }
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
    public string? RequestPath { get; init; }
    public string? RequestMethod { get; init; }
    public int? StatusCode { get; init; }
    public long? DurationMs { get; init; }
    public string? ErrorMessage { get; init; }
    public string? CorrelationId { get; init; }
    public DateTime Timestamp { get; init; }
    public string? SessionId { get; init; }
    public string? Module { get; init; }
    public string? SubModule { get; init; }
    public string? Details { get; init; }
}

public record PagedAuditResult
{
    public IReadOnlyList<AuditLogDto> Items { get; init; } = new List<AuditLogDto>();
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages { get; init; }
}

public record AuditStatisticsDto
{
    public int TotalLogs { get; init; }
    public int UniqueUsers { get; init; }
    public int UniqueSessions { get; init; }
    public Dictionary<string, int> ByAction { get; init; } = new();
    public Dictionary<string, int> ByEntityType { get; init; } = new();
    public Dictionary<string, int> ByModule { get; init; } = new();
    public Dictionary<string, int> ByDay { get; init; } = new();
    public Dictionary<string, int> ByHour { get; init; } = new();
    public int SuccessfulRequests { get; init; }
    public int FailedRequests { get; init; }
    public double AverageResponseTimeMs { get; init; }
}

public record AuditActionInfo(string Action, string Category, string Description);
