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
/// Controller para gestión de tenants (AFOREs/Organizaciones)
/// Solo accesible para SystemAdmin
/// </summary>
[Authorize]
[ApiVersion("1.0")]
public class TenantsController : BaseController
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<TenantsController> _logger;

    public TenantsController(
        IApplicationDbContext context,
        ILogger<TenantsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ============================================================================
    // LIST & SEARCH
    // ============================================================================

    /// <summary>
    /// Obtener lista de tenants/organizaciones
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "RequireSystemAdmin")]
    [SwaggerOperation(Summary = "Listar tenants", Description = "Obtiene lista de organizaciones/AFOREs")]
    [ProducesResponseType(typeof(PagedTenantsResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedTenantsResponse>> GetTenants(
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] string? type = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "name",
        [FromQuery] string sortOrder = "asc",
        CancellationToken cancellationToken = default)
    {
        var query = _context.Tenants.Where(t => !t.IsDeleted);

        // Filtros
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(t =>
                t.Name.ToLower().Contains(searchLower) ||
                (t.AforeCode != null && t.AforeCode.ToLower().Contains(searchLower)) ||
                (t.TaxId != null && t.TaxId.ToLower().Contains(searchLower)));
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<TenantStatus>(status, true, out var statusEnum))
        {
            query = query.Where(t => t.Status == statusEnum);
        }

        if (!string.IsNullOrWhiteSpace(type) && Enum.TryParse<TenantType>(type, true, out var typeEnum))
        {
            query = query.Where(t => t.Type == typeEnum);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Ordenamiento
        query = sortBy.ToLower() switch
        {
            "code" => sortOrder == "desc"
                ? query.OrderByDescending(t => t.AforeCode)
                : query.OrderBy(t => t.AforeCode),
            "createdat" => sortOrder == "desc"
                ? query.OrderByDescending(t => t.CreatedAt)
                : query.OrderBy(t => t.CreatedAt),
            "status" => sortOrder == "desc"
                ? query.OrderByDescending(t => t.Status)
                : query.OrderBy(t => t.Status),
            _ => sortOrder == "desc"
                ? query.OrderByDescending(t => t.Name)
                : query.OrderBy(t => t.Name)
        };

        var tenants = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TenantListItemDto
            {
                Id = t.Id,
                Name = t.Name,
                AforeCode = t.AforeCode,
                TaxId = t.TaxId,
                Type = t.Type.ToString(),
                Status = t.Status.ToString().ToLower(),
                ContactEmail = t.ContactEmail,
                ContactPhone = t.ContactPhone,
                Address = t.Address,
                City = t.City,
                State = t.State,
                PostalCode = t.PostalCode,
                MaxUsers = t.MaxUsers,
                UserCount = _context.Users.Count(u => u.TenantId == t.Id && !u.IsDeleted),
                LicenseExpiresAt = t.LicenseExpiresAt,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(new PagedTenantsResponse
        {
            Data = tenants,
            Total = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    /// <summary>
    /// Obtener tenant por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Detalle de tenant", Description = "Obtiene información detallada de una organización")]
    [ProducesResponseType(typeof(TenantDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantDetailDto>> GetTenant(
        Guid id,
        CancellationToken cancellationToken)
    {
        // AforeAdmin solo puede ver su propio tenant
        if (CurrentUserRole != "SystemAdmin" && id != CurrentTenantId)
        {
            return Forbid();
        }

        var tenant = await _context.Tenants
            .Where(t => t.Id == id && !t.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);

        if (tenant == null)
        {
            return NotFound(new { error = "Organización no encontrada" });
        }

        var userCount = await _context.Users.CountAsync(u => u.TenantId == id && !u.IsDeleted, cancellationToken);
        var activeUsers = await _context.Users.CountAsync(u => u.TenantId == id && !u.IsDeleted && u.Status == UserStatus.Active, cancellationToken);
        var validationCount = await _context.Validations.CountAsync(v => v.TenantId == id, cancellationToken);

        return Ok(new TenantDetailDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            AforeCode = tenant.AforeCode,
            TaxId = tenant.TaxId,
            Type = tenant.Type.ToString(),
            Status = tenant.Status.ToString().ToLower(),
            ContactEmail = tenant.ContactEmail,
            ContactPhone = tenant.ContactPhone,
            Address = tenant.Address,
            City = tenant.City,
            State = tenant.State,
            PostalCode = tenant.PostalCode,
            MaxUsers = tenant.MaxUsers,
            UserCount = userCount,
            ActiveUsers = activeUsers,
            ValidationCount = validationCount,
            LicenseExpiresAt = tenant.LicenseExpiresAt,
            Settings = tenant.Settings,
            CreatedAt = tenant.CreatedAt,
            UpdatedAt = tenant.UpdatedAt
        });
    }

    // ============================================================================
    // CREATE & UPDATE
    // ============================================================================

    /// <summary>
    /// Crear nuevo tenant/organización
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "RequireSystemAdmin")]
    [SwaggerOperation(Summary = "Crear tenant", Description = "Crea una nueva organización/AFORE")]
    [ProducesResponseType(typeof(TenantListItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TenantListItemDto>> CreateTenant(
        [FromBody] CreateTenantRequest request,
        CancellationToken cancellationToken)
    {
        // Verificar nombre único
        var existingName = await _context.Tenants
            .AnyAsync(t => t.Name.ToLower() == request.Name.ToLower() && !t.IsDeleted, cancellationToken);

        if (existingName)
        {
            return Conflict(new { error = "Ya existe una organización con ese nombre" });
        }

        // Verificar código de AFORE único si se proporciona
        if (!string.IsNullOrWhiteSpace(request.AforeCode))
        {
            var existingCode = await _context.Tenants
                .AnyAsync(t => t.AforeCode != null && t.AforeCode.ToLower() == request.AforeCode.ToLower() && !t.IsDeleted, cancellationToken);

            if (existingCode)
            {
                return Conflict(new { error = "Ya existe una organización con ese código de AFORE" });
            }
        }

        // Parsear tipo
        var type = TenantType.Afore;
        if (!string.IsNullOrWhiteSpace(request.Type) && Enum.TryParse<TenantType>(request.Type, true, out var typeEnum))
        {
            type = typeEnum;
        }

        var tenant = Tenant.Create(
            request.Name,
            type,
            request.AforeCode,
            request.TaxId,
            request.ContactEmail ?? string.Empty
        );

        // Actualizar campos adicionales
        tenant.UpdateContact(
            request.ContactEmail,
            request.ContactPhone,
            request.Address,
            request.City,
            request.State,
            request.PostalCode
        );

        if (request.MaxUsers.HasValue)
        {
            tenant.SetMaxUsers(request.MaxUsers.Value);
        }

        _context.Tenants.Add(tenant);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Tenant {TenantId} created by {UserId}", tenant.Id, CurrentUserId);

        return CreatedAtAction(nameof(GetTenant), new { id = tenant.Id }, new TenantListItemDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            AforeCode = tenant.AforeCode,
            TaxId = tenant.TaxId,
            Type = tenant.Type.ToString(),
            Status = tenant.Status.ToString().ToLower(),
            ContactEmail = tenant.ContactEmail,
            ContactPhone = tenant.ContactPhone,
            Address = tenant.Address,
            City = tenant.City,
            State = tenant.State,
            PostalCode = tenant.PostalCode,
            MaxUsers = tenant.MaxUsers,
            UserCount = 0,
            CreatedAt = tenant.CreatedAt,
            UpdatedAt = tenant.UpdatedAt
        });
    }

    /// <summary>
    /// Actualizar tenant
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Actualizar tenant", Description = "Actualiza información de una organización")]
    [ProducesResponseType(typeof(TenantListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantListItemDto>> UpdateTenant(
        Guid id,
        [FromBody] UpdateTenantRequest request,
        CancellationToken cancellationToken)
    {
        // AforeAdmin solo puede actualizar su propio tenant (y con limitaciones)
        if (CurrentUserRole != "SystemAdmin" && id != CurrentTenantId)
        {
            return Forbid();
        }

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, cancellationToken);

        if (tenant == null)
        {
            return NotFound(new { error = "Organización no encontrada" });
        }

        // Actualizar datos de contacto
        tenant.UpdateContact(
            request.ContactEmail ?? tenant.ContactEmail,
            request.ContactPhone ?? tenant.ContactPhone,
            request.Address ?? tenant.Address,
            request.City ?? tenant.City,
            request.State ?? tenant.State,
            request.PostalCode ?? tenant.PostalCode
        );

        // Solo SystemAdmin puede actualizar estos campos
        if (CurrentUserRole == "SystemAdmin")
        {
            if (!string.IsNullOrWhiteSpace(request.Name) && request.Name != tenant.Name)
            {
                var existingName = await _context.Tenants
                    .AnyAsync(t => t.Name.ToLower() == request.Name.ToLower() && t.Id != id && !t.IsDeleted, cancellationToken);
                if (!existingName)
                {
                    tenant.UpdateName(request.Name);
                }
            }

            if (request.MaxUsers.HasValue)
            {
                tenant.SetMaxUsers(request.MaxUsers.Value);
            }

            if (request.LicenseExpiresAt.HasValue)
            {
                tenant.SetLicenseExpiration(request.LicenseExpiresAt.Value);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Tenant {TenantId} updated by {UserId}", tenant.Id, CurrentUserId);

        var userCount = await _context.Users.CountAsync(u => u.TenantId == id && !u.IsDeleted, cancellationToken);

        return Ok(new TenantListItemDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            AforeCode = tenant.AforeCode,
            TaxId = tenant.TaxId,
            Type = tenant.Type.ToString(),
            Status = tenant.Status.ToString().ToLower(),
            ContactEmail = tenant.ContactEmail,
            ContactPhone = tenant.ContactPhone,
            Address = tenant.Address,
            City = tenant.City,
            State = tenant.State,
            PostalCode = tenant.PostalCode,
            MaxUsers = tenant.MaxUsers,
            UserCount = userCount,
            LicenseExpiresAt = tenant.LicenseExpiresAt,
            CreatedAt = tenant.CreatedAt,
            UpdatedAt = tenant.UpdatedAt
        });
    }

    /// <summary>
    /// Eliminar tenant (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "RequireSystemAdmin")]
    [SwaggerOperation(Summary = "Eliminar tenant", Description = "Elimina una organización (soft delete)")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTenant(
        Guid id,
        CancellationToken cancellationToken)
    {
        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, cancellationToken);

        if (tenant == null)
        {
            return NotFound(new { error = "Organización no encontrada" });
        }

        tenant.Delete();
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogWarning("Tenant {TenantId} deleted by {UserId}", tenant.Id, CurrentUserId);

        return NoContent();
    }

    // ============================================================================
    // ACTIVATE / SUSPEND
    // ============================================================================

    /// <summary>
    /// Activar tenant
    /// </summary>
    [HttpPost("{id:guid}/activate")]
    [Authorize(Policy = "RequireSystemAdmin")]
    [SwaggerOperation(Summary = "Activar tenant", Description = "Activa una organización")]
    [ProducesResponseType(typeof(TenantListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantListItemDto>> ActivateTenant(
        Guid id,
        CancellationToken cancellationToken)
    {
        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, cancellationToken);

        if (tenant == null)
        {
            return NotFound(new { error = "Organización no encontrada" });
        }

        tenant.Activate();
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Tenant {TenantId} activated by {UserId}", tenant.Id, CurrentUserId);

        var userCount = await _context.Users.CountAsync(u => u.TenantId == id && !u.IsDeleted, cancellationToken);

        return Ok(new TenantListItemDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            AforeCode = tenant.AforeCode,
            Status = tenant.Status.ToString().ToLower(),
            UserCount = userCount,
            CreatedAt = tenant.CreatedAt,
            UpdatedAt = tenant.UpdatedAt
        });
    }

    // ============================================================================
    // TENANT USERS
    // ============================================================================

    /// <summary>
    /// Obtener usuarios de un tenant
    /// </summary>
    [HttpGet("{id:guid}/users")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Usuarios del tenant", Description = "Lista usuarios de una organización")]
    [ProducesResponseType(typeof(PagedTenantUsersResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedTenantUsersResponse>> GetTenantUsers(
        Guid id,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        // AforeAdmin solo puede ver usuarios de su tenant
        if (CurrentUserRole != "SystemAdmin" && id != CurrentTenantId)
        {
            return Forbid();
        }

        var query = _context.Users.Where(u => u.TenantId == id && !u.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(u =>
                u.Name.ToLower().Contains(searchLower) ||
                u.Email.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<UserRole>(role, true, out var roleEnum))
        {
            query = query.Where(u => u.Role == roleEnum);
        }

        var total = await query.CountAsync(cancellationToken);

        var users = await query
            .OrderBy(u => u.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new TenantUserDto
            {
                Id = u.Id,
                Email = u.Email,
                Name = u.Name,
                Role = u.Role.ToString(),
                Status = u.Status.ToString().ToLower(),
                LastLogin = u.LastLogin,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(new PagedTenantUsersResponse
        {
            Data = users,
            Total = total,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        });
    }

    /// <summary>
    /// Invitar usuario al tenant
    /// </summary>
    [HttpPost("{id:guid}/users/invite")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Invitar usuario", Description = "Invita un usuario al tenant")]
    [ProducesResponseType(typeof(TenantUserInviteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TenantUserInviteResponse>> InviteUserToTenant(
        Guid id,
        [FromBody] TenantUserInviteRequest request,
        CancellationToken cancellationToken)
    {
        if (CurrentUserRole != "SystemAdmin" && id != CurrentTenantId)
        {
            return Forbid();
        }

        // Verificar tenant existe
        var tenant = await _context.Tenants.FindAsync(new object[] { id }, cancellationToken);
        if (tenant == null)
        {
            return NotFound(new { error = "Organización no encontrada" });
        }

        // Verificar límite de usuarios
        var currentUserCount = await _context.Users.CountAsync(u => u.TenantId == id && !u.IsDeleted, cancellationToken);
        if (tenant.MaxUsers > 0 && currentUserCount >= tenant.MaxUsers)
        {
            return BadRequest(new { error = "Se ha alcanzado el límite de usuarios para esta organización" });
        }

        // Verificar email no existe
        var existingUser = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower() && !u.IsDeleted, cancellationToken);
        if (existingUser)
        {
            return Conflict(new { error = "Ya existe un usuario con ese correo electrónico" });
        }

        // Parsear rol
        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
        {
            return BadRequest(new { error = "Rol inválido" });
        }

        // Crear invitación
        var invitation = UserInvitation.Create(
            request.Email,
            request.Name,
            id,
            role,
            CurrentUserId ?? Guid.Empty,
            request.Message
        );

        _context.Set<UserInvitation>().Add(invitation);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "User invited to tenant {TenantId} by {UserId}: {Email}",
            id, CurrentUserId, request.Email);

        // TODO: Enviar email de invitación

        return Ok(new TenantUserInviteResponse
        {
            Success = true,
            InvitationId = invitation.Id,
            Email = request.Email,
            ExpiresAt = invitation.ExpiresAt
        });
    }

    /// <summary>
    /// Cambiar rol de usuario en tenant
    /// </summary>
    [HttpPatch("{id:guid}/users/{userId:guid}/role")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Cambiar rol", Description = "Cambia el rol de un usuario en el tenant")]
    [ProducesResponseType(typeof(TenantUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantUserDto>> ChangeTenantUserRole(
        Guid id,
        Guid userId,
        [FromBody] ChangeRoleRequest request,
        CancellationToken cancellationToken)
    {
        if (CurrentUserRole != "SystemAdmin" && id != CurrentTenantId)
        {
            return Forbid();
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == id && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado en esta organización" });
        }

        if (!Enum.TryParse<UserRole>(request.Role, true, out var newRole))
        {
            return BadRequest(new { error = "Rol inválido" });
        }

        // Verificar permisos para asignar rol
        if (CurrentUserRole == "AforeAdmin" && (newRole == UserRole.SystemAdmin || newRole == UserRole.AforeAdmin))
        {
            return BadRequest(new { error = "No tiene permisos para asignar ese rol" });
        }

        user.ChangeRole(newRole);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "User {UserId} role changed to {Role} by {ChangedBy}",
            userId, newRole, CurrentUserId);

        return Ok(new TenantUserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role.ToString(),
            Status = user.Status.ToString().ToLower(),
            LastLogin = user.LastLogin,
            CreatedAt = user.CreatedAt
        });
    }

    /// <summary>
    /// Suspender usuario del tenant
    /// </summary>
    [HttpPost("{id:guid}/users/{userId:guid}/suspend")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Suspender usuario", Description = "Suspende un usuario del tenant")]
    [ProducesResponseType(typeof(TenantUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantUserDto>> SuspendTenantUser(
        Guid id,
        Guid userId,
        [FromBody] SuspendUserRequest? request,
        CancellationToken cancellationToken)
    {
        if (CurrentUserRole != "SystemAdmin" && id != CurrentTenantId)
        {
            return Forbid();
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == id && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado en esta organización" });
        }

        if (user.Id == CurrentUserId)
        {
            return BadRequest(new { error = "No puede suspenderse a sí mismo" });
        }

        user.Suspend(request?.Reason ?? "Suspendido por administrador", CurrentUserEmail ?? "system");
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogWarning(
            "User {UserId} suspended in tenant {TenantId} by {SuspendedBy}",
            userId, id, CurrentUserId);

        return Ok(new TenantUserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role.ToString(),
            Status = user.Status.ToString().ToLower(),
            LastLogin = user.LastLogin,
            CreatedAt = user.CreatedAt
        });
    }

    /// <summary>
    /// Reactivar usuario del tenant
    /// </summary>
    [HttpPost("{id:guid}/users/{userId:guid}/reactivate")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Reactivar usuario", Description = "Reactiva un usuario suspendido del tenant")]
    [ProducesResponseType(typeof(TenantUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantUserDto>> ReactivateTenantUser(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (CurrentUserRole != "SystemAdmin" && id != CurrentTenantId)
        {
            return Forbid();
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == id && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado en esta organización" });
        }

        user.Reactivate();
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "User {UserId} reactivated in tenant {TenantId} by {ReactivatedBy}",
            userId, id, CurrentUserId);

        return Ok(new TenantUserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role.ToString(),
            Status = user.Status.ToString().ToLower(),
            LastLogin = user.LastLogin,
            CreatedAt = user.CreatedAt
        });
    }

    // ============================================================================
    // STATISTICS
    // ============================================================================

    /// <summary>
    /// Obtener estadísticas de tenants
    /// </summary>
    [HttpGet("statistics")]
    [Authorize(Policy = "RequireSystemAdmin")]
    [SwaggerOperation(Summary = "Estadísticas", Description = "Obtiene métricas globales de organizaciones")]
    [ProducesResponseType(typeof(TenantStatisticsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TenantStatisticsDto>> GetStatistics(
        CancellationToken cancellationToken)
    {
        var query = _context.Tenants.Where(t => !t.IsDeleted);

        var total = await query.CountAsync(cancellationToken);
        var active = await query.CountAsync(t => t.Status == TenantStatus.Active, cancellationToken);
        var inactive = await query.CountAsync(t => t.Status == TenantStatus.Inactive, cancellationToken);
        var suspended = await query.CountAsync(t => t.Status == TenantStatus.Suspended, cancellationToken);
        var trial = await query.CountAsync(t => t.Status == TenantStatus.Trial, cancellationToken);

        var totalUsers = await _context.Users.CountAsync(u => !u.IsDeleted, cancellationToken);
        var activeUsers = await _context.Users.CountAsync(u => !u.IsDeleted && u.Status == UserStatus.Active, cancellationToken);

        var thisMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var newThisMonth = await query.CountAsync(t => t.CreatedAt >= thisMonthStart, cancellationToken);

        var byType = await query
            .GroupBy(t => t.Type)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        return Ok(new TenantStatisticsDto
        {
            Total = total,
            Active = active,
            Inactive = inactive,
            Suspended = suspended,
            Trial = trial,
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            NewThisMonth = newThisMonth,
            ByType = byType.ToDictionary(x => x.Type.ToString(), x => x.Count)
        });
    }
}

// ============================================================================
// DTOs
// ============================================================================

public record TenantListItemDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? AforeCode { get; init; }
    public string? TaxId { get; init; }
    public string Type { get; init; } = "Afore";
    public string Status { get; init; } = "active";
    public string? ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public int MaxUsers { get; init; }
    public int UserCount { get; init; }
    public DateTime? LicenseExpiresAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record TenantDetailDto : TenantListItemDto
{
    public int ActiveUsers { get; init; }
    public int ValidationCount { get; init; }
    public string? Settings { get; init; }
}

public record PagedTenantsResponse
{
    public List<TenantListItemDto> Data { get; init; } = [];
    public int Total { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
}

public record CreateTenantRequest
{
    public string Name { get; init; } = string.Empty;
    public string? AforeCode { get; init; }
    public string? TaxId { get; init; }
    public string? Type { get; init; }
    public string? ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public int? MaxUsers { get; init; }
}

public record UpdateTenantRequest
{
    public string? Name { get; init; }
    public string? ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public int? MaxUsers { get; init; }
    public DateTime? LicenseExpiresAt { get; init; }
}

public record TenantUserDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string Status { get; init; } = "active";
    public DateTime? LastLogin { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record PagedTenantUsersResponse
{
    public List<TenantUserDto> Data { get; init; } = [];
    public int Total { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
}

public record TenantUserInviteRequest
{
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = "Viewer";
    public string? Message { get; init; }
}

public record TenantUserInviteResponse
{
    public bool Success { get; init; }
    public Guid InvitationId { get; init; }
    public string Email { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
}

public record ChangeRoleRequest
{
    public string Role { get; init; } = string.Empty;
}

public record SuspendUserRequest
{
    public string? Reason { get; init; }
}

public record TenantStatisticsDto
{
    public int Total { get; init; }
    public int Active { get; init; }
    public int Inactive { get; init; }
    public int Suspended { get; init; }
    public int Trial { get; init; }
    public int TotalUsers { get; init; }
    public int ActiveUsers { get; init; }
    public int NewThisMonth { get; init; }
    public Dictionary<string, int> ByType { get; init; } = new();
}
