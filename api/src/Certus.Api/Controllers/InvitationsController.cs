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
/// Controller para gestión de invitaciones de usuarios
/// Permite invitar nuevos usuarios al sistema vía email
/// </summary>
[Authorize]
[ApiVersion("1.0")]
public class InvitationsController : BaseController
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<InvitationsController> _logger;

    public InvitationsController(
        IApplicationDbContext context,
        ILogger<InvitationsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ============================================================================
    // SEND INVITATION
    // ============================================================================

    /// <summary>
    /// Enviar invitación a nuevo usuario
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Enviar invitación", Description = "Envía invitación por email a un nuevo usuario")]
    [ProducesResponseType(typeof(InvitationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<InvitationDto>> SendInvitation(
        [FromBody] SendInvitationRequest request,
        CancellationToken cancellationToken)
    {
        // Verificar que el email no esté ya registrado
        var existingUser = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower() && !u.IsDeleted, cancellationToken);

        if (existingUser)
        {
            return Conflict(new { error = "Ya existe un usuario con ese correo electrónico" });
        }

        // Verificar que no haya una invitación pendiente
        var existingInvitation = await _context.Set<UserInvitation>()
            .AnyAsync(i => i.Email.ToLower() == request.Email.ToLower() &&
                          i.Status == InvitationStatus.Pending &&
                          i.ExpiresAt > DateTime.UtcNow, cancellationToken);

        if (existingInvitation)
        {
            return Conflict(new { error = "Ya existe una invitación pendiente para ese correo electrónico" });
        }

        // Determinar tenant
        var tenantId = request.TenantId ?? CurrentTenantId;
        if (!tenantId.HasValue)
        {
            return BadRequest(new { error = "Debe especificar una organización" });
        }

        // Verificar permisos
        if (CurrentUserRole != "SystemAdmin" && tenantId != CurrentTenantId)
        {
            return Forbid();
        }

        // Verificar tenant existe
        var tenant = await _context.Tenants.FindAsync(new object[] { tenantId.Value }, cancellationToken);
        if (tenant == null)
        {
            return BadRequest(new { error = "Organización no encontrada" });
        }

        // Parsear rol
        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
        {
            return BadRequest(new { error = "Rol inválido" });
        }

        // AforeAdmin no puede invitar con rol superior
        if (CurrentUserRole == "AforeAdmin" && (role == UserRole.SystemAdmin || role == UserRole.AforeAdmin))
        {
            return BadRequest(new { error = "No tiene permisos para asignar ese rol" });
        }

        // Crear invitación
        var invitation = UserInvitation.Create(
            request.Email,
            request.Name,
            tenantId.Value,
            role,
            CurrentUserId ?? Guid.Empty,
            request.Message
        );

        _context.Set<UserInvitation>().Add(invitation);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Invitation sent to {Email} for tenant {TenantId} by {InvitedBy}",
            request.Email, tenantId, CurrentUserId);

        // TODO: Enviar email de invitación

        return CreatedAtAction(nameof(GetInvitation), new { id = invitation.Id }, new InvitationDto
        {
            Id = invitation.Id,
            Email = invitation.Email,
            Name = invitation.Name,
            Role = invitation.Role.ToString(),
            TenantId = invitation.TenantId,
            TenantName = tenant.Name,
            Status = invitation.Status.ToString().ToLower(),
            Message = invitation.Message,
            InvitedById = invitation.InvitedById,
            InvitedByName = CurrentUserEmail,
            CreatedAt = invitation.CreatedAt,
            ExpiresAt = invitation.ExpiresAt
        });
    }

    // ============================================================================
    // GET INVITATIONS
    // ============================================================================

    /// <summary>
    /// Obtener invitación por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Detalle de invitación", Description = "Obtiene información de una invitación")]
    [ProducesResponseType(typeof(InvitationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InvitationDto>> GetInvitation(
        Guid id,
        CancellationToken cancellationToken)
    {
        var invitation = await _context.Set<UserInvitation>()
            .Include(i => i.Tenant)
            .Include(i => i.InvitedBy)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (invitation == null)
        {
            return NotFound(new { error = "Invitación no encontrada" });
        }

        // Verificar acceso
        if (CurrentUserRole != "SystemAdmin" && invitation.TenantId != CurrentTenantId)
        {
            return Forbid();
        }

        return Ok(MapToDto(invitation));
    }

    /// <summary>
    /// Obtener invitaciones pendientes
    /// </summary>
    [HttpGet("pending")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Invitaciones pendientes", Description = "Lista invitaciones pendientes")]
    [ProducesResponseType(typeof(PagedInvitationsResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedInvitationsResponse>> GetPendingInvitations(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Set<UserInvitation>()
            .Include(i => i.Tenant)
            .Include(i => i.InvitedBy)
            .Where(i => i.Status == InvitationStatus.Pending);

        // Filtrar por tenant si no es SystemAdmin
        if (CurrentUserRole != "SystemAdmin" && CurrentTenantId.HasValue)
        {
            query = query.Where(i => i.TenantId == CurrentTenantId.Value);
        }

        var total = await query.CountAsync(cancellationToken);

        var invitations = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return Ok(new PagedInvitationsResponse
        {
            Data = invitations.Select(MapToDto).ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        });
    }

    // ============================================================================
    // RESEND INVITATION
    // ============================================================================

    /// <summary>
    /// Reenviar invitación
    /// </summary>
    [HttpPost("{id:guid}/resend")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Reenviar invitación", Description = "Reenvía email de invitación")]
    [ProducesResponseType(typeof(InvitationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<InvitationDto>> ResendInvitation(
        Guid id,
        CancellationToken cancellationToken)
    {
        var invitation = await _context.Set<UserInvitation>()
            .Include(i => i.Tenant)
            .Include(i => i.InvitedBy)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (invitation == null)
        {
            return NotFound(new { error = "Invitación no encontrada" });
        }

        if (CurrentUserRole != "SystemAdmin" && invitation.TenantId != CurrentTenantId)
        {
            return Forbid();
        }

        if (invitation.Status != InvitationStatus.Pending)
        {
            return BadRequest(new { error = "Solo se pueden reenviar invitaciones pendientes" });
        }

        // Extender fecha de expiración
        invitation.ExtendExpiration(7);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invitation {InvitationId} resent by {UserId}", id, CurrentUserId);

        // TODO: Reenviar email

        return Ok(MapToDto(invitation));
    }

    // ============================================================================
    // CANCEL INVITATION
    // ============================================================================

    /// <summary>
    /// Cancelar invitación
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Cancelar invitación", Description = "Cancela una invitación pendiente")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelInvitation(
        Guid id,
        CancellationToken cancellationToken)
    {
        var invitation = await _context.Set<UserInvitation>()
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (invitation == null)
        {
            return NotFound(new { error = "Invitación no encontrada" });
        }

        if (CurrentUserRole != "SystemAdmin" && invitation.TenantId != CurrentTenantId)
        {
            return Forbid();
        }

        invitation.Cancel();
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invitation {InvitationId} cancelled by {UserId}", id, CurrentUserId);

        return NoContent();
    }

    // ============================================================================
    // VERIFY & ACCEPT (Public endpoints for invitation flow)
    // ============================================================================

    /// <summary>
    /// Verificar token de invitación
    /// </summary>
    [HttpGet("verify/{token}")]
    [AllowAnonymous]
    [SwaggerOperation(Summary = "Verificar invitación", Description = "Verifica si un token de invitación es válido")]
    [ProducesResponseType(typeof(InvitationVerifyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<InvitationVerifyResponse>> VerifyInvitation(
        string token,
        CancellationToken cancellationToken)
    {
        var invitation = await _context.Set<UserInvitation>()
            .Include(i => i.Tenant)
            .FirstOrDefaultAsync(i => i.Token == token, cancellationToken);

        if (invitation == null)
        {
            return NotFound(new { error = "Invitación no encontrada" });
        }

        if (invitation.Status != InvitationStatus.Pending)
        {
            return BadRequest(new {
                error = invitation.Status == InvitationStatus.Accepted
                    ? "Esta invitación ya fue aceptada"
                    : "Esta invitación ha sido cancelada o expiró"
            });
        }

        if (invitation.ExpiresAt < DateTime.UtcNow)
        {
            invitation.Expire();
            await _context.SaveChangesAsync(cancellationToken);
            return BadRequest(new { error = "Esta invitación ha expirado" });
        }

        return Ok(new InvitationVerifyResponse
        {
            IsValid = true,
            Email = invitation.Email,
            Name = invitation.Name,
            Role = invitation.Role.ToString(),
            TenantName = invitation.Tenant.Name,
            ExpiresAt = invitation.ExpiresAt
        });
    }

    /// <summary>
    /// Aceptar invitación y crear cuenta
    /// </summary>
    [HttpPost("accept")]
    [AllowAnonymous]
    [SwaggerOperation(Summary = "Aceptar invitación", Description = "Acepta invitación y crea cuenta de usuario")]
    [ProducesResponseType(typeof(InvitationAcceptResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<InvitationAcceptResponse>> AcceptInvitation(
        [FromBody] AcceptInvitationRequest request,
        CancellationToken cancellationToken)
    {
        var invitation = await _context.Set<UserInvitation>()
            .Include(i => i.Tenant)
            .FirstOrDefaultAsync(i => i.Token == request.Token, cancellationToken);

        if (invitation == null)
        {
            return NotFound(new { error = "Invitación no encontrada" });
        }

        if (invitation.Status != InvitationStatus.Pending)
        {
            return BadRequest(new { error = "Esta invitación ya no es válida" });
        }

        if (invitation.ExpiresAt < DateTime.UtcNow)
        {
            invitation.Expire();
            await _context.SaveChangesAsync(cancellationToken);
            return BadRequest(new { error = "Esta invitación ha expirado" });
        }

        // Verificar que email coincide
        if (!invitation.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { error = "El correo no coincide con la invitación" });
        }

        // Crear usuario
        var user = Certus.Domain.Entities.User.Create(
            invitation.Email,
            request.Name ?? invitation.Name,
            request.Password,
            invitation.TenantId,
            invitation.Role
        );

        if (!string.IsNullOrWhiteSpace(request.Phone))
        {
            user.Update(user.Name, request.Phone, null, null);
        }

        // Marcar como verificado ya que vino por invitación
        user.VerifyEmail();

        _context.Users.Add(user);

        // Actualizar invitación
        invitation.Accept(user.Id);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Invitation {InvitationId} accepted, user {UserId} created",
            invitation.Id, user.Id);

        return Ok(new InvitationAcceptResponse
        {
            Success = true,
            UserId = user.Id,
            Email = user.Email,
            Name = user.Name,
            TenantId = user.TenantId,
            TenantName = invitation.Tenant.Name,
            Role = user.Role.ToString()
        });
    }

    // ============================================================================
    // GET AVAILABLE ROLES
    // ============================================================================

    /// <summary>
    /// Obtener roles disponibles para invitaciones
    /// </summary>
    [HttpGet("roles")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Roles disponibles", Description = "Lista roles que pueden ser asignados en invitaciones")]
    [ProducesResponseType(typeof(List<RoleOptionDto>), StatusCodes.Status200OK)]
    public ActionResult<List<RoleOptionDto>> GetAvailableRoles()
    {
        var roles = new List<RoleOptionDto>();

        // SystemAdmin puede asignar cualquier rol
        if (CurrentUserRole == "SystemAdmin")
        {
            roles.Add(new RoleOptionDto { Value = "SystemAdmin", Label = "Administrador del Sistema", Description = "Acceso total al sistema" });
            roles.Add(new RoleOptionDto { Value = "AforeAdmin", Label = "Administrador de AFORE", Description = "Administra su organización" });
        }

        // Todos los admins pueden asignar estos roles
        roles.Add(new RoleOptionDto { Value = "AforeAnalyst", Label = "Analista", Description = "Crea y gestiona validaciones" });
        roles.Add(new RoleOptionDto { Value = "Supervisor", Label = "Supervisor", Description = "Supervisa y aprueba validaciones" });
        roles.Add(new RoleOptionDto { Value = "Auditor", Label = "Auditor", Description = "Audita validaciones y reportes" });
        roles.Add(new RoleOptionDto { Value = "Viewer", Label = "Visor", Description = "Solo lectura" });

        return Ok(roles);
    }

    // ============================================================================
    // HELPERS
    // ============================================================================

    private static InvitationDto MapToDto(UserInvitation invitation)
    {
        return new InvitationDto
        {
            Id = invitation.Id,
            Email = invitation.Email,
            Name = invitation.Name,
            Role = invitation.Role.ToString(),
            TenantId = invitation.TenantId,
            TenantName = invitation.Tenant?.Name,
            Status = invitation.Status.ToString().ToLower(),
            Message = invitation.Message,
            InvitedById = invitation.InvitedById,
            InvitedByName = invitation.InvitedBy?.Name,
            CreatedAt = invitation.CreatedAt,
            ExpiresAt = invitation.ExpiresAt,
            AcceptedAt = invitation.AcceptedAt,
            AcceptedUserId = invitation.AcceptedUserId
        };
    }
}

// ============================================================================
// DTOs
// ============================================================================

public record SendInvitationRequest
{
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = "Viewer";
    public Guid? TenantId { get; init; }
    public string? Message { get; init; }
}

public record AcceptInvitationRequest
{
    public string Token { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Name { get; init; }
    public string Password { get; init; } = string.Empty;
    public string? Phone { get; init; }
}

public record InvitationDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public Guid TenantId { get; init; }
    public string? TenantName { get; init; }
    public string Status { get; init; } = "pending";
    public string? Message { get; init; }
    public Guid InvitedById { get; init; }
    public string? InvitedByName { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime ExpiresAt { get; init; }
    public DateTime? AcceptedAt { get; init; }
    public Guid? AcceptedUserId { get; init; }
}

public record PagedInvitationsResponse
{
    public List<InvitationDto> Data { get; init; } = [];
    public int Total { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
}

public record InvitationVerifyResponse
{
    public bool IsValid { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string TenantName { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
}

public record InvitationAcceptResponse
{
    public bool Success { get; init; }
    public Guid UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public Guid TenantId { get; init; }
    public string TenantName { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
}

public record RoleOptionDto
{
    public string Value { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}
