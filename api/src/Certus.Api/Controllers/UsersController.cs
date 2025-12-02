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
/// Controller para gestión de usuarios en el sistema
/// Proporciona operaciones CRUD y gestión de usuarios
/// </summary>
[Authorize]
[ApiVersion("1.0")]
public class UsersController : BaseController
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IApplicationDbContext context,
        ILogger<UsersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ============================================================================
    // LIST & SEARCH
    // ============================================================================

    /// <summary>
    /// Obtener lista de usuarios
    /// SystemAdmin: todos los usuarios
    /// AforeAdmin: usuarios de su tenant
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Listar usuarios", Description = "Obtiene lista paginada de usuarios")]
    [ProducesResponseType(typeof(PagedUsersResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedUsersResponse>> GetUsers(
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] string? status = null,
        [FromQuery] string? department = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "name",
        [FromQuery] string sortOrder = "asc",
        CancellationToken cancellationToken = default)
    {
        var query = _context.Users.Where(u => !u.IsDeleted);

        // Si no es SystemAdmin, filtrar por tenant
        if (CurrentUserRole != "SystemAdmin")
        {
            query = query.Where(u => u.TenantId == CurrentTenantId);
        }

        // Filtros
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(u =>
                u.Name.ToLower().Contains(searchLower) ||
                u.Email.ToLower().Contains(searchLower) ||
                (u.EmployeeNumber != null && u.EmployeeNumber.ToLower().Contains(searchLower)));
        }

        if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<UserRole>(role, true, out var roleEnum))
        {
            query = query.Where(u => u.Role == roleEnum);
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<UserStatus>(status, true, out var statusEnum))
        {
            query = query.Where(u => u.Status == statusEnum);
        }

        if (!string.IsNullOrWhiteSpace(department))
        {
            query = query.Where(u => u.Department != null && u.Department.ToLower().Contains(department.ToLower()));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Ordenamiento
        query = sortBy.ToLower() switch
        {
            "email" => sortOrder == "desc"
                ? query.OrderByDescending(u => u.Email)
                : query.OrderBy(u => u.Email),
            "createdat" => sortOrder == "desc"
                ? query.OrderByDescending(u => u.CreatedAt)
                : query.OrderBy(u => u.CreatedAt),
            "lastlogin" => sortOrder == "desc"
                ? query.OrderByDescending(u => u.LastLogin)
                : query.OrderBy(u => u.LastLogin),
            "status" => sortOrder == "desc"
                ? query.OrderByDescending(u => u.Status)
                : query.OrderBy(u => u.Status),
            _ => sortOrder == "desc"
                ? query.OrderByDescending(u => u.Name)
                : query.OrderBy(u => u.Name)
        };

        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserDetailDto
            {
                Id = u.Id,
                Email = u.Email,
                Name = u.Name,
                Role = u.Role.ToString(),
                TenantId = u.TenantId,
                TenantName = u.Tenant.Name,
                Avatar = u.Avatar,
                Phone = u.Phone,
                Department = u.Department,
                Position = u.Position,
                EmployeeNumber = u.EmployeeNumber,
                Status = u.Status.ToString().ToLower(),
                IsEmailVerified = u.IsEmailVerified,
                IsMfaEnabled = u.IsMfaEnabled,
                LastLogin = u.LastLogin,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(new PagedUsersResponse
        {
            Data = users,
            Total = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    /// <summary>
    /// Obtener usuario por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Detalle de usuario", Description = "Obtiene información detallada de un usuario")]
    [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<UserDetailDto>> GetUser(
        Guid id,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.Tenant)
            .Where(u => u.Id == id && !u.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        // Verificar acceso
        if (CurrentUserRole != "SystemAdmin" && user.TenantId != CurrentTenantId)
        {
            return Forbid();
        }

        return Ok(new UserDetailDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role.ToString(),
            TenantId = user.TenantId,
            TenantName = user.Tenant.Name,
            Avatar = user.Avatar,
            Phone = user.Phone,
            Department = user.Department,
            Position = user.Position,
            EmployeeNumber = user.EmployeeNumber,
            Status = user.Status.ToString().ToLower(),
            IsEmailVerified = user.IsEmailVerified,
            IsMfaEnabled = user.IsMfaEnabled,
            LastLogin = user.LastLogin,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            SuspensionReason = user.SuspensionReason,
            SuspendedAt = user.SuspendedAt,
            SuspendedBy = user.SuspendedBy
        });
    }

    // ============================================================================
    // CREATE & UPDATE
    // ============================================================================

    /// <summary>
    /// Crear nuevo usuario
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Crear usuario", Description = "Crea un nuevo usuario en el sistema")]
    [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UserDetailDto>> CreateUser(
        [FromBody] CreateUserRequest request,
        CancellationToken cancellationToken)
    {
        // Determinar el tenant
        var tenantId = request.TenantId ?? CurrentTenantId;

        // SystemAdmin puede crear en cualquier tenant, otros solo en el suyo
        if (CurrentUserRole != "SystemAdmin" && tenantId != CurrentTenantId)
        {
            return Forbid();
        }

        // Verificar que el tenant existe
        var tenant = await _context.Tenants.FindAsync(new object[] { tenantId!.Value }, cancellationToken);
        if (tenant == null)
        {
            return BadRequest(new { error = "AFORE no encontrada" });
        }

        // Verificar email único
        var existingUser = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (existingUser)
        {
            return Conflict(new { error = "Ya existe un usuario con ese correo electrónico" });
        }

        // Parsear rol
        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
        {
            return BadRequest(new { error = "Rol inválido" });
        }

        // AforeAdmin no puede crear usuarios con rol >= al suyo
        if (CurrentUserRole == "AforeAdmin" && (role == UserRole.SystemAdmin || role == UserRole.AforeAdmin))
        {
            return BadRequest(new { error = "No tiene permisos para asignar ese rol" });
        }

        // Crear usuario
        var newUser = Certus.Domain.Entities.User.CreateInvitation(
            request.Email,
            request.Name,
            tenantId.Value,
            role,
            CurrentUserEmail ?? "system"
        );

        // Actualizar campos adicionales usando el método Update
        newUser.Update(
            request.Name,
            request.Phone,
            request.Department,
            request.Position
        );

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "User {UserId} created by {CreatedBy}",
            newUser.Id, CurrentUserId);

        return CreatedAtAction(nameof(GetUser), new { id = newUser.Id }, new UserDetailDto
        {
            Id = newUser.Id,
            Email = newUser.Email,
            Name = newUser.Name,
            Role = newUser.Role.ToString(),
            TenantId = newUser.TenantId,
            TenantName = tenant.Name,
            Phone = newUser.Phone,
            Department = newUser.Department,
            Position = newUser.Position,
            EmployeeNumber = newUser.EmployeeNumber,
            Status = newUser.Status.ToString().ToLower(),
            IsEmailVerified = newUser.IsEmailVerified,
            IsMfaEnabled = newUser.IsMfaEnabled,
            CreatedAt = newUser.CreatedAt,
            UpdatedAt = newUser.UpdatedAt
        });
    }

    /// <summary>
    /// Actualizar usuario
    /// </summary>
    [HttpPatch("{id:guid}")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Actualizar usuario", Description = "Actualiza los datos de un usuario")]
    [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<UserDetailDto>> UpdateUser(
        Guid id,
        [FromBody] UpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        // Verificar acceso
        if (CurrentUserRole != "SystemAdmin" && user.TenantId != CurrentTenantId)
        {
            return Forbid();
        }

        // Actualizar campos usando el método Update del User entity
        user.Update(
            request.Name ?? user.Name,
            request.Phone ?? user.Phone,
            request.Department ?? user.Department,
            request.Position ?? user.Position
        );

        // Cambiar rol si se especifica
        if (!string.IsNullOrWhiteSpace(request.Role) && Enum.TryParse<UserRole>(request.Role, true, out var newRole))
        {
            // Verificar permisos para cambiar rol
            if (CurrentUserRole == "AforeAdmin" && (newRole == UserRole.SystemAdmin || newRole == UserRole.AforeAdmin))
            {
                return BadRequest(new { error = "No tiene permisos para asignar ese rol" });
            }
            user.ChangeRole(newRole);
        }

        // Cambiar status si se especifica
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (request.Status.ToLower() == "active" && user.Status != UserStatus.Active)
            {
                user.Reactivate();
            }
            else if (request.Status.ToLower() == "suspended" && user.Status != UserStatus.Suspended)
            {
                user.Suspend("Suspendido por administrador", CurrentUserEmail ?? "system");
            }
            // Note: Inactive status can be set by suspending with a specific reason
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "User {UserId} updated by {UpdatedBy}",
            user.Id, CurrentUserId);

        return Ok(new UserDetailDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role.ToString(),
            TenantId = user.TenantId,
            TenantName = user.Tenant.Name,
            Avatar = user.Avatar,
            Phone = user.Phone,
            Department = user.Department,
            Position = user.Position,
            EmployeeNumber = user.EmployeeNumber,
            Status = user.Status.ToString().ToLower(),
            IsEmailVerified = user.IsEmailVerified,
            IsMfaEnabled = user.IsMfaEnabled,
            LastLogin = user.LastLogin,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        });
    }

    /// <summary>
    /// Eliminar usuario (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Eliminar usuario", Description = "Elimina un usuario (soft delete)")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteUser(
        Guid id,
        [FromBody] DeleteUserRequest? request,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        // Verificar acceso
        if (CurrentUserRole != "SystemAdmin" && user.TenantId != CurrentTenantId)
        {
            return Forbid();
        }

        // No permitir eliminarse a sí mismo
        if (user.Id == CurrentUserId)
        {
            return BadRequest(new { error = "No puede eliminarse a sí mismo" });
        }

        user.SoftDelete(CurrentUserEmail ?? "system", request?.Reason);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogWarning(
            "User {UserId} deleted by {DeletedBy}. Reason: {Reason}",
            user.Id, CurrentUserId, request?.Reason ?? "No especificada");

        return NoContent();
    }

    // ============================================================================
    // ACTIONS
    // ============================================================================

    /// <summary>
    /// Suspender usuario
    /// </summary>
    [HttpPost("{id:guid}/suspend")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Suspender usuario", Description = "Suspende un usuario")]
    [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<UserDetailDto>> SuspendUser(
        Guid id,
        [FromBody] UserSuspendRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        if (CurrentUserRole != "SystemAdmin" && user.TenantId != CurrentTenantId)
        {
            return Forbid();
        }

        if (user.Id == CurrentUserId)
        {
            return BadRequest(new { error = "No puede suspenderse a sí mismo" });
        }

        user.Suspend(request.Reason, CurrentUserEmail ?? "system");
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogWarning(
            "User {UserId} suspended by {SuspendedBy}. Reason: {Reason}",
            user.Id, CurrentUserId, request.Reason);

        return Ok(new UserDetailDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role.ToString(),
            TenantId = user.TenantId,
            TenantName = user.Tenant.Name,
            Status = user.Status.ToString().ToLower(),
            SuspensionReason = user.SuspensionReason,
            SuspendedAt = user.SuspendedAt,
            SuspendedBy = user.SuspendedBy,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        });
    }

    /// <summary>
    /// Reactivar usuario
    /// </summary>
    [HttpPost("{id:guid}/reactivate")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Reactivar usuario", Description = "Reactiva un usuario suspendido")]
    [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<UserDetailDto>> ReactivateUser(
        Guid id,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        if (CurrentUserRole != "SystemAdmin" && user.TenantId != CurrentTenantId)
        {
            return Forbid();
        }

        user.Reactivate();
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "User {UserId} reactivated by {ReactivatedBy}",
            user.Id, CurrentUserId);

        return Ok(new UserDetailDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role.ToString(),
            TenantId = user.TenantId,
            TenantName = user.Tenant.Name,
            Status = user.Status.ToString().ToLower(),
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        });
    }

    /// <summary>
    /// Reset password (enviar email)
    /// </summary>
    [HttpPost("{id:guid}/reset-password")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Reset password", Description = "Envía email de reset de password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetPassword(
        Guid id,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        if (CurrentUserRole != "SystemAdmin" && user.TenantId != CurrentTenantId)
        {
            return Forbid();
        }

        // TODO: Implementar envío de email de reset
        _logger.LogInformation(
            "Password reset requested for user {UserId} by {RequestedBy}",
            user.Id, CurrentUserId);

        return NoContent();
    }

    // ============================================================================
    // STATISTICS
    // ============================================================================

    /// <summary>
    /// Obtener estadísticas de usuarios
    /// </summary>
    [HttpGet("statistics")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Estadísticas de usuarios", Description = "Obtiene métricas de usuarios")]
    [ProducesResponseType(typeof(UserStatisticsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserStatisticsDto>> GetStatistics(
        CancellationToken cancellationToken)
    {
        try
        {
            var query = _context.Users.Where(u => !u.IsDeleted);

            // Si no es SystemAdmin, filtrar por tenant
            if (CurrentUserRole != "SystemAdmin" && CurrentTenantId.HasValue)
            {
                query = query.Where(u => u.TenantId == CurrentTenantId.Value);
            }

            var total = await query.CountAsync(cancellationToken);
            var active = await query.CountAsync(u => u.Status == UserStatus.Active, cancellationToken);
            var inactive = await query.CountAsync(u => u.Status == UserStatus.Inactive, cancellationToken);
            var suspended = await query.CountAsync(u => u.Status == UserStatus.Suspended, cancellationToken);
            var pending = await query.CountAsync(u => u.Status == UserStatus.Pending, cancellationToken);
            var mfaEnabled = await query.CountAsync(u => u.IsMfaEnabled, cancellationToken);

            var last24h = DateTime.UtcNow.AddDays(-1);
            var thisMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            var recentLogins = await query.CountAsync(u => u.LastLogin != null && u.LastLogin > last24h, cancellationToken);
            var newThisMonth = await query.CountAsync(u => u.CreatedAt >= thisMonthStart, cancellationToken);

            // Conteo por rol - materialize first to avoid EF Core translation issues
            var roleGroups = await query
                .GroupBy(u => u.Role)
                .Select(g => new { Role = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            var byRole = roleGroups.ToDictionary(x => x.Role.ToString(), x => x.Count);

            // Conteo por departamento - materialize first
            var deptGroups = await query
                .Where(u => u.Department != null && u.Department != "")
                .GroupBy(u => u.Department!)
                .Select(g => new { Department = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            var byDepartment = deptGroups
                .Where(x => x.Department != null)
                .ToDictionary(x => x.Department!, x => x.Count);

            return Ok(new UserStatisticsDto
            {
                Total = total,
                Active = active,
                Inactive = inactive,
                Suspended = suspended,
                Pending = pending,
                MfaEnabled = mfaEnabled,
                MfaDisabled = total - mfaEnabled,
                RecentLogins = recentLogins,
                NewUsersThisMonth = newThisMonth,
                ByRole = byRole,
                ByDepartment = byDepartment
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user statistics");
            return StatusCode(500, new { error = "Error al obtener estadísticas de usuarios", details = ex.Message });
        }
    }
}

// ============================================================================
// DTOs
// ============================================================================

public record UserDetailDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public Guid TenantId { get; init; }
    public string? TenantName { get; init; }
    public string? Avatar { get; init; }
    public string? Phone { get; init; }
    public string? Department { get; init; }
    public string? Position { get; init; }
    public string? EmployeeNumber { get; init; }
    public string Status { get; init; } = "active";
    public bool IsEmailVerified { get; init; }
    public bool IsMfaEnabled { get; init; }
    public DateTime? LastLogin { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public string? SuspensionReason { get; init; }
    public DateTime? SuspendedAt { get; init; }
    public string? SuspendedBy { get; init; }
}

public record PagedUsersResponse
{
    public IEnumerable<UserDetailDto> Data { get; init; } = [];
    public int Total { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
}

public record CreateUserRequest
{
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = "Viewer";
    public Guid? TenantId { get; init; }
    public string? Phone { get; init; }
    public string? Department { get; init; }
    public string? Position { get; init; }
    public string? EmployeeNumber { get; init; }
}

public record UpdateUserRequest
{
    public string? Name { get; init; }
    public string? Phone { get; init; }
    public string? Role { get; init; }
    public string? Department { get; init; }
    public string? Position { get; init; }
    public string? Status { get; init; }
}

public record DeleteUserRequest
{
    public string? Reason { get; init; }
}

public record UserSuspendRequest
{
    public string Reason { get; init; } = string.Empty;
}

public record UserStatisticsDto
{
    public int Total { get; init; }
    public int Active { get; init; }
    public int Inactive { get; init; }
    public int Suspended { get; init; }
    public int Pending { get; init; }
    public int MfaEnabled { get; init; }
    public int MfaDisabled { get; init; }
    public int RecentLogins { get; init; }
    public int NewUsersThisMonth { get; init; }
    public Dictionary<string, int> ByRole { get; init; } = new();
    public Dictionary<string, int> ByDepartment { get; init; } = new();
}
