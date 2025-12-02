using Certus.Application.Common.Interfaces;
using Certus.Application.DTOs;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller para gestión de flujos de aprobación
/// </summary>
[Authorize]
public class ApprovalsController : BaseController
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<ApprovalsController> _logger;

    public ApprovalsController(
        IApplicationDbContext context,
        ILogger<ApprovalsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtener lista de aprobaciones con filtros
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<ApprovalSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<ApprovalSummaryDto>>> GetApprovals(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] ApprovalStatus? status = null,
        [FromQuery] ApprovalLevel? level = null,
        [FromQuery] SlaStatus? slaStatus = null,
        [FromQuery] string? search = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true,
        CancellationToken cancellationToken = default)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        var query = _context.Approvals
            .Include(a => a.Validation)
            .Where(a => a.TenantId == CurrentTenantId.Value);

        // Filtros
        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

        if (level.HasValue)
            query = query.Where(a => a.Level == level.Value);

        if (slaStatus.HasValue)
            query = query.Where(a => a.SlaStatus == slaStatus.Value);

        if (dateFrom.HasValue)
            query = query.Where(a => a.RequestedAt >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(a => a.RequestedAt <= dateTo.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(a =>
                a.Validation.FileName.ToLower().Contains(term) ||
                a.RequestedByName.ToLower().Contains(term));
        }

        // Ordenamiento
        query = sortBy?.ToLower() switch
        {
            "status" => sortDescending ? query.OrderByDescending(a => a.Status) : query.OrderBy(a => a.Status),
            "level" => sortDescending ? query.OrderByDescending(a => a.Level) : query.OrderBy(a => a.Level),
            "duedate" => sortDescending ? query.OrderByDescending(a => a.DueDate) : query.OrderBy(a => a.DueDate),
            _ => sortDescending ? query.OrderByDescending(a => a.RequestedAt) : query.OrderBy(a => a.RequestedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new ApprovalSummaryDto
            {
                Id = a.Id,
                ValidationId = a.ValidationId,
                FileName = a.Validation.FileName,
                FileType = a.Validation.FileType.ToString(),
                Level = a.Level.ToString(),
                Status = a.Status.ToString(),
                SlaStatus = a.SlaStatus.ToString(),
                Priority = a.Priority.ToString(),
                RequestedByName = a.RequestedByName,
                RequestedAt = a.RequestedAt,
                AssignedToName = a.AssignedToName,
                DueDate = a.DueDate,
                IsOverdue = a.IsOverdue
            })
            .ToListAsync(cancellationToken);

        return Ok(new PaginatedResult<ApprovalSummaryDto>(items, page, pageSize, totalCount));
    }

    /// <summary>
    /// Obtener aprobación por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApprovalDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApprovalDto>> GetApproval(Guid id, CancellationToken cancellationToken)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        var approval = await _context.Approvals
            .Include(a => a.Validation)
            .Include(a => a.RequestedBy)
            .Include(a => a.AssignedTo)
            .Include(a => a.ResolvedBy)
            .Include(a => a.Comments)
            .Include(a => a.History)
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == CurrentTenantId.Value, cancellationToken);

        if (approval == null)
            return NotFound(new { error = "Aprobación no encontrada" });

        // Actualizar estado SLA
        approval.CheckSlaStatus();
        await _context.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(approval);
        return Ok(dto);
    }

    /// <summary>
    /// Aprobar solicitud
    /// </summary>
    [HttpPost("{id:guid}/approve")]
    [Authorize(Policy = "CanApprove")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Approve(
        Guid id,
        [FromBody] ApprovalActionRequest request,
        CancellationToken cancellationToken)
    {
        if (!CurrentTenantId.HasValue || !CurrentUserId.HasValue)
            return Unauthorized();

        var approval = await _context.Approvals
            .Include(a => a.Validation)
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == CurrentTenantId.Value, cancellationToken);

        if (approval == null)
            return NotFound(new { error = "Aprobación no encontrada" });

        if (approval.Status != ApprovalStatus.Pending && approval.Status != ApprovalStatus.InReview)
            return BadRequest(new { error = "Esta solicitud ya fue procesada" });

        var user = await _context.Users.FindAsync(new object[] { CurrentUserId.Value }, cancellationToken);
        if (user == null)
            return Unauthorized();

        approval.Approve(CurrentUserId.Value, user.FullName, request.Comment);

        // Autorizar la validación asociada
        approval.Validation.Authorize(user.FullName);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Approval {ApprovalId} approved by user {UserId}",
            id, CurrentUserId.Value);

        return NoContent();
    }

    /// <summary>
    /// Rechazar solicitud
    /// </summary>
    [HttpPost("{id:guid}/reject")]
    [Authorize(Policy = "CanApprove")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Reject(
        Guid id,
        [FromBody] RejectRequest request,
        CancellationToken cancellationToken)
    {
        if (!CurrentTenantId.HasValue || !CurrentUserId.HasValue)
            return Unauthorized();

        var approval = await _context.Approvals
            .Include(a => a.Validation)
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == CurrentTenantId.Value, cancellationToken);

        if (approval == null)
            return NotFound(new { error = "Aprobación no encontrada" });

        if (approval.Status != ApprovalStatus.Pending && approval.Status != ApprovalStatus.InReview)
            return BadRequest(new { error = "Esta solicitud ya fue procesada" });

        var user = await _context.Users.FindAsync(new object[] { CurrentUserId.Value }, cancellationToken);
        if (user == null)
            return Unauthorized();

        approval.Reject(CurrentUserId.Value, user.FullName, request.Reason, request.Comment);

        // Rechazar autorización de validación
        approval.Validation.RejectAuthorization(request.Reason);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Approval {ApprovalId} rejected by user {UserId}: {Reason}",
            id, CurrentUserId.Value, request.Reason);

        return NoContent();
    }

    /// <summary>
    /// Escalar solicitud a nivel superior
    /// </summary>
    [HttpPost("{id:guid}/escalate")]
    [Authorize(Policy = "CanApprove")]
    [ProducesResponseType(typeof(ApprovalDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApprovalDto>> Escalate(
        Guid id,
        [FromBody] EscalateRequest request,
        CancellationToken cancellationToken)
    {
        if (!CurrentTenantId.HasValue || !CurrentUserId.HasValue)
            return Unauthorized();

        var approval = await _context.Approvals
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == CurrentTenantId.Value, cancellationToken);

        if (approval == null)
            return NotFound(new { error = "Aprobación no encontrada" });

        if (approval.Status != ApprovalStatus.Pending && approval.Status != ApprovalStatus.InReview)
            return BadRequest(new { error = "Esta solicitud ya fue procesada" });

        if ((int)request.ToLevel <= (int)approval.Level)
            return BadRequest(new { error = "El nivel de escalación debe ser superior al actual" });

        var escalated = approval.Escalate(request.Reason, CurrentUserId.Value, request.ToLevel);

        _context.Approvals.Add(escalated);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Approval {ApprovalId} escalated to level {Level} by user {UserId}",
            id, request.ToLevel, CurrentUserId.Value);

        return Ok(MapToDto(escalated));
    }

    /// <summary>
    /// Asignar aprobación a usuario
    /// </summary>
    [HttpPost("{id:guid}/assign")]
    [Authorize(Policy = "RequireSupervisor")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Assign(
        Guid id,
        [FromBody] AssignRequest request,
        CancellationToken cancellationToken)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        var approval = await _context.Approvals
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == CurrentTenantId.Value, cancellationToken);

        if (approval == null)
            return NotFound(new { error = "Aprobación no encontrada" });

        var assignee = await _context.Users.FindAsync(new object[] { request.AssignToUserId }, cancellationToken);
        if (assignee == null)
            return BadRequest(new { error = "Usuario no encontrado" });

        approval.Assign(assignee.Id, assignee.FullName);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Agregar comentario
    /// </summary>
    [HttpPost("{id:guid}/comments")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> AddComment(
        Guid id,
        [FromBody] AddCommentRequest request,
        CancellationToken cancellationToken)
    {
        if (!CurrentTenantId.HasValue || !CurrentUserId.HasValue)
            return Unauthorized();

        var approval = await _context.Approvals
            .Include(a => a.Comments)
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == CurrentTenantId.Value, cancellationToken);

        if (approval == null)
            return NotFound(new { error = "Aprobación no encontrada" });

        var user = await _context.Users.FindAsync(new object[] { CurrentUserId.Value }, cancellationToken);
        if (user == null)
            return Unauthorized();

        var comment = ApprovalComment.Create(
            approval.Id,
            CurrentUserId.Value,
            user.FullName,
            request.Content,
            request.IsInternal);

        approval.AddComment(comment);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Obtener estadísticas de aprobaciones
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ApprovalStatisticsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApprovalStatisticsDto>> GetStatistics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        var query = _context.Approvals.Where(a => a.TenantId == CurrentTenantId.Value);

        if (startDate.HasValue)
            query = query.Where(a => a.RequestedAt >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(a => a.RequestedAt <= endDate.Value);

        var approvals = await query.ToListAsync(cancellationToken);

        var stats = new ApprovalStatisticsDto
        {
            Total = approvals.Count,
            Pending = approvals.Count(a => a.Status == ApprovalStatus.Pending),
            InReview = approvals.Count(a => a.Status == ApprovalStatus.InReview),
            Approved = approvals.Count(a => a.Status == ApprovalStatus.Approved),
            Rejected = approvals.Count(a => a.Status == ApprovalStatus.Rejected),
            Escalated = approvals.Count(a => a.Status == ApprovalStatus.Escalated),

            OnTime = approvals.Count(a => a.SlaStatus == SlaStatus.OnTime),
            AtRisk = approvals.Count(a => a.SlaStatus == SlaStatus.AtRisk),
            Breached = approvals.Count(a => a.SlaStatus == SlaStatus.Breached),

            AverageResponseTimeMinutes = approvals
                .Where(a => a.ResponseTimeMinutes.HasValue)
                .Select(a => a.ResponseTimeMinutes!.Value)
                .DefaultIfEmpty(0)
                .Average()
        };

        stats.ApprovalRate = stats.Total > 0 ? (double)stats.Approved / stats.Total * 100 : 0;
        stats.SlaComplianceRate = stats.Total > 0 ? (double)stats.OnTime / stats.Total * 100 : 0;

        stats.ByLevel = approvals
            .GroupBy(a => a.Level.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        stats.ByDay = approvals
            .GroupBy(a => a.RequestedAt.Date.ToString("yyyy-MM-dd"))
            .ToDictionary(g => g.Key, g => g.Count());

        return Ok(stats);
    }

    private static ApprovalDto MapToDto(Approval approval)
    {
        return new ApprovalDto
        {
            Id = approval.Id,
            ValidationId = approval.ValidationId,
            FileName = approval.Validation?.FileName ?? "",
            FileType = approval.Validation?.FileType.ToString() ?? "",
            Level = approval.Level.ToString(),
            Status = approval.Status.ToString(),
            SlaStatus = approval.SlaStatus.ToString(),
            Priority = approval.Priority.ToString(),
            RequestedBy = approval.RequestedBy != null ? new ApprovalUserDto
            {
                Id = approval.RequestedBy.Id,
                Name = approval.RequestedBy.FullName,
                Email = approval.RequestedBy.Email,
                Role = approval.RequestedBy.Role.ToString()
            } : new ApprovalUserDto { Name = approval.RequestedByName },
            RequestedAt = approval.RequestedAt,
            RequestReason = approval.RequestReason,
            RequestNotes = approval.RequestNotes,
            AssignedTo = approval.AssignedTo != null ? new ApprovalUserDto
            {
                Id = approval.AssignedTo.Id,
                Name = approval.AssignedTo.FullName,
                Email = approval.AssignedTo.Email,
                Role = approval.AssignedTo.Role.ToString()
            } : null,
            AssignedAt = approval.AssignedAt,
            ResolvedBy = approval.ResolvedBy != null ? new ApprovalUserDto
            {
                Id = approval.ResolvedBy.Id,
                Name = approval.ResolvedBy.FullName,
                Email = approval.ResolvedBy.Email
            } : null,
            ResolvedAt = approval.ResolvedAt,
            ResolutionNotes = approval.ResolutionNotes,
            RejectionReason = approval.RejectionReason,
            DueDate = approval.DueDate,
            ResponseTimeMinutes = approval.ResponseTimeMinutes,
            IsOverdue = approval.IsOverdue,
            IsEscalated = approval.IsEscalated,
            Comments = approval.Comments.Select(c => new ApprovalCommentDto
            {
                Id = c.Id,
                Content = c.Content,
                IsInternal = c.IsInternal,
                Timestamp = c.Timestamp
            }).ToList(),
            History = approval.History.Select(h => new ApprovalHistoryDto
            {
                Id = h.Id,
                Action = h.Action,
                Description = h.Description,
                Timestamp = h.Timestamp
            }).ToList()
        };
    }
}

// Request DTOs
public record ApprovalActionRequest(string? Comment);
public record RejectRequest(string Reason, string? Comment);
public record EscalateRequest(ApprovalLevel ToLevel, string Reason);
public record AssignRequest(Guid AssignToUserId, string? Reason);
public record AddCommentRequest(string Content, bool IsInternal = false);

public record PaginatedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;
}
