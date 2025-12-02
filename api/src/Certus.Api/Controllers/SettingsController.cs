using Asp.Versioning;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller para gestión de configuraciones de usuario y organización
/// </summary>
[Authorize]
[ApiVersion("1.0")]
public class SettingsController : BaseController
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(
        IApplicationDbContext context,
        ILogger<SettingsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ============================================================================
    // PROFILE SETTINGS
    // ============================================================================

    /// <summary>
    /// Obtener configuración del perfil del usuario actual
    /// </summary>
    [HttpGet("profile")]
    [SwaggerOperation(Summary = "Obtener perfil", Description = "Obtiene la configuración del perfil del usuario actual")]
    [ProducesResponseType(typeof(ProfileSettingsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProfileSettingsDto>> GetProfileSettings(
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Id == CurrentUserId, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        return Ok(new ProfileSettingsDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Avatar = user.Avatar,
            Phone = user.Phone,
            Department = user.Department,
            Position = user.Position,
            EmployeeNumber = user.EmployeeNumber,
            Language = user.Preferences?.Language ?? "es",
            Timezone = user.Preferences?.Timezone ?? "America/Mexico_City",
            DateFormat = user.Preferences?.DateFormat ?? "dd/MM/yyyy",
            TimeFormat = user.Preferences?.TimeFormat ?? "HH:mm",
            TenantId = user.TenantId,
            TenantName = user.Tenant?.Name ?? "",
            Role = user.Role.ToString()
        });
    }

    /// <summary>
    /// Actualizar configuración del perfil
    /// </summary>
    [HttpPut("profile")]
    [SwaggerOperation(Summary = "Actualizar perfil", Description = "Actualiza la configuración del perfil")]
    [ProducesResponseType(typeof(ProfileSettingsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProfileSettingsDto>> UpdateProfileSettings(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Id == CurrentUserId, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        // Actualizar datos básicos
        user.Update(
            request.Name ?? user.Name,
            request.Phone ?? user.Phone,
            request.Department ?? user.Department,
            request.Position ?? user.Position
        );

        // Actualizar avatar si se proporciona
        if (request.Avatar != null)
        {
            user.UpdateAvatar(request.Avatar);
        }

        // Actualizar preferencias
        if (request.Language != null || request.Timezone != null ||
            request.DateFormat != null || request.TimeFormat != null)
        {
            user.UpdatePreferences(
                request.Language ?? user.Preferences?.Language ?? "es",
                request.Timezone ?? user.Preferences?.Timezone ?? "America/Mexico_City",
                request.DateFormat ?? user.Preferences?.DateFormat ?? "dd/MM/yyyy",
                request.TimeFormat ?? user.Preferences?.TimeFormat ?? "HH:mm"
            );
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} updated profile settings", CurrentUserId);

        return Ok(new ProfileSettingsDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Avatar = user.Avatar,
            Phone = user.Phone,
            Department = user.Department,
            Position = user.Position,
            EmployeeNumber = user.EmployeeNumber,
            Language = user.Preferences?.Language ?? "es",
            Timezone = user.Preferences?.Timezone ?? "America/Mexico_City",
            DateFormat = user.Preferences?.DateFormat ?? "dd/MM/yyyy",
            TimeFormat = user.Preferences?.TimeFormat ?? "HH:mm",
            TenantId = user.TenantId,
            TenantName = user.Tenant?.Name ?? "",
            Role = user.Role.ToString()
        });
    }

    // ============================================================================
    // AFORE/ORGANIZATION SETTINGS
    // ============================================================================

    /// <summary>
    /// Obtener configuración de la organización (AFORE)
    /// </summary>
    [HttpGet("afore")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Configuración AFORE", Description = "Obtiene la configuración de la organización")]
    [ProducesResponseType(typeof(AforeSettingsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<AforeSettingsDto>> GetAforeSettings(
        CancellationToken cancellationToken)
    {
        if (!CurrentTenantId.HasValue)
        {
            return BadRequest(new { error = "No hay organización asociada" });
        }

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == CurrentTenantId.Value, cancellationToken);

        if (tenant == null)
        {
            return NotFound(new { error = "Organización no encontrada" });
        }

        return Ok(new AforeSettingsDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            AforeCode = tenant.AforeCode,
            TaxId = tenant.TaxId,
            ContactEmail = tenant.ContactEmail,
            ContactPhone = tenant.ContactPhone,
            Address = tenant.Address,
            City = tenant.City,
            State = tenant.State,
            PostalCode = tenant.PostalCode,
            Logo = tenant.Logo,
            PrimaryColor = tenant.PrimaryColor,
            SecondaryColor = tenant.SecondaryColor,
            DefaultValidationFlow = tenant.DefaultValidationFlow,
            RequireApproval = tenant.RequireApproval,
            AutoProcessValidations = tenant.AutoProcessValidations
        });
    }

    /// <summary>
    /// Actualizar configuración de la organización
    /// </summary>
    [HttpPut("afore")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Actualizar AFORE", Description = "Actualiza la configuración de la organización")]
    [ProducesResponseType(typeof(AforeSettingsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<AforeSettingsDto>> UpdateAforeSettings(
        [FromBody] UpdateAforeRequest request,
        CancellationToken cancellationToken)
    {
        if (!CurrentTenantId.HasValue)
        {
            return BadRequest(new { error = "No hay organización asociada" });
        }

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == CurrentTenantId.Value, cancellationToken);

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

        // Actualizar branding si se proporciona
        if (request.Logo != null || request.PrimaryColor != null || request.SecondaryColor != null)
        {
            tenant.UpdateBranding(
                request.Logo ?? tenant.Logo,
                request.PrimaryColor ?? tenant.PrimaryColor,
                request.SecondaryColor ?? tenant.SecondaryColor
            );
        }

        // Actualizar configuración de validaciones
        if (request.DefaultValidationFlow != null ||
            request.RequireApproval.HasValue ||
            request.AutoProcessValidations.HasValue)
        {
            tenant.UpdateValidationSettings(
                request.DefaultValidationFlow ?? tenant.DefaultValidationFlow,
                request.RequireApproval ?? tenant.RequireApproval,
                request.AutoProcessValidations ?? tenant.AutoProcessValidations
            );
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} updated AFORE settings for tenant {TenantId}",
            CurrentUserId, CurrentTenantId);

        return Ok(new AforeSettingsDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            AforeCode = tenant.AforeCode,
            TaxId = tenant.TaxId,
            ContactEmail = tenant.ContactEmail,
            ContactPhone = tenant.ContactPhone,
            Address = tenant.Address,
            City = tenant.City,
            State = tenant.State,
            PostalCode = tenant.PostalCode,
            Logo = tenant.Logo,
            PrimaryColor = tenant.PrimaryColor,
            SecondaryColor = tenant.SecondaryColor,
            DefaultValidationFlow = tenant.DefaultValidationFlow,
            RequireApproval = tenant.RequireApproval,
            AutoProcessValidations = tenant.AutoProcessValidations
        });
    }

    // ============================================================================
    // NOTIFICATION SETTINGS
    // ============================================================================

    /// <summary>
    /// Obtener configuración de notificaciones
    /// </summary>
    [HttpGet("notifications")]
    [SwaggerOperation(Summary = "Notificaciones", Description = "Obtiene configuración de notificaciones")]
    [ProducesResponseType(typeof(NotificationSettingsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<NotificationSettingsDto>> GetNotificationSettings(
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == CurrentUserId, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        // Default notification settings
        var settings = user.NotificationSettings ?? new NotificationSettingsDto
        {
            EmailEnabled = true,
            PushEnabled = true,
            ValidationCompleted = true,
            ValidationFailed = true,
            ApprovalRequired = true,
            ApprovalDecision = true,
            NormativeChanges = true,
            SystemAnnouncements = true,
            WeeklyReport = true,
            DailyDigest = false
        };

        return Ok(settings);
    }

    /// <summary>
    /// Actualizar configuración de notificaciones
    /// </summary>
    [HttpPut("notifications")]
    [SwaggerOperation(Summary = "Actualizar notificaciones", Description = "Actualiza configuración de notificaciones")]
    [ProducesResponseType(typeof(NotificationSettingsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<NotificationSettingsDto>> UpdateNotificationSettings(
        [FromBody] NotificationSettingsDto request,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == CurrentUserId, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        user.UpdateNotificationSettings(request);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} updated notification settings", CurrentUserId);

        return Ok(request);
    }

    // ============================================================================
    // SECURITY SETTINGS
    // ============================================================================

    /// <summary>
    /// Obtener configuración de seguridad
    /// </summary>
    [HttpGet("security")]
    [SwaggerOperation(Summary = "Seguridad", Description = "Obtiene configuración de seguridad")]
    [ProducesResponseType(typeof(SecuritySettingsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SecuritySettingsDto>> GetSecuritySettings(
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == CurrentUserId, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        // Get active sessions (mock for now, would come from a sessions table)
        var activeSessions = new List<SessionDto>
        {
            new SessionDto
            {
                Id = Guid.NewGuid().ToString(),
                Device = "Web Browser",
                Browser = "Chrome",
                Location = "Ciudad de México, México",
                IpAddress = "192.168.1.1",
                LastActivity = DateTime.UtcNow,
                IsCurrent = true
            }
        };

        return Ok(new SecuritySettingsDto
        {
            IsMfaEnabled = user.IsMfaEnabled,
            MfaMethod = user.MfaMethod,
            IsEmailVerified = user.IsEmailVerified,
            LastPasswordChange = user.LastPasswordChange,
            SessionTimeout = user.SessionTimeout ?? 60,
            ActiveSessions = activeSessions
        });
    }

    /// <summary>
    /// Actualizar configuración de seguridad
    /// </summary>
    [HttpPut("security")]
    [SwaggerOperation(Summary = "Actualizar seguridad", Description = "Actualiza configuración de seguridad")]
    [ProducesResponseType(typeof(SecuritySettingsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SecuritySettingsDto>> UpdateSecuritySettings(
        [FromBody] UpdateSecurityRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == CurrentUserId, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        // Actualizar MFA si se solicita
        if (request.EnableMfa.HasValue)
        {
            if (request.EnableMfa.Value)
            {
                user.EnableMfa(request.MfaMethod ?? "totp");
            }
            else
            {
                user.DisableMfa();
            }
        }

        // Actualizar timeout de sesión
        if (request.SessionTimeout.HasValue)
        {
            user.SetSessionTimeout(request.SessionTimeout.Value);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} updated security settings", CurrentUserId);

        return Ok(new SecuritySettingsDto
        {
            IsMfaEnabled = user.IsMfaEnabled,
            MfaMethod = user.MfaMethod,
            IsEmailVerified = user.IsEmailVerified,
            LastPasswordChange = user.LastPasswordChange,
            SessionTimeout = user.SessionTimeout ?? 60,
            ActiveSessions = new List<SessionDto>()
        });
    }

    /// <summary>
    /// Cambiar contraseña
    /// </summary>
    [HttpPost("security/change-password")]
    [SwaggerOperation(Summary = "Cambiar contraseña", Description = "Cambia la contraseña del usuario")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == CurrentUserId, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        // Verificar contraseña actual
        if (!user.VerifyPassword(request.CurrentPassword))
        {
            return BadRequest(new { error = "La contraseña actual es incorrecta" });
        }

        // Validar nueva contraseña
        if (request.NewPassword.Length < 8)
        {
            return BadRequest(new { error = "La nueva contraseña debe tener al menos 8 caracteres" });
        }

        if (request.NewPassword != request.ConfirmPassword)
        {
            return BadRequest(new { error = "Las contraseñas no coinciden" });
        }

        user.ChangePassword(request.NewPassword);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} changed password", CurrentUserId);

        return Ok(new { message = "Contraseña actualizada correctamente" });
    }

    /// <summary>
    /// Revocar sesión
    /// </summary>
    [HttpPost("security/revoke-session")]
    [SwaggerOperation(Summary = "Revocar sesión", Description = "Revoca una sesión activa")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> RevokeSession(
        [FromBody] RevokeSessionRequest request,
        CancellationToken cancellationToken)
    {
        // TODO: Implementar revocación de sesiones cuando se implemente el tracking de sesiones
        _logger.LogInformation("User {UserId} revoked session {SessionId}", CurrentUserId, request.SessionId);

        return Ok(new { message = "Sesión revocada correctamente" });
    }
}

// ============================================================================
// DTOs
// ============================================================================

public record ProfileSettingsDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Avatar { get; init; }
    public string? Phone { get; init; }
    public string? Department { get; init; }
    public string? Position { get; init; }
    public string? EmployeeNumber { get; init; }
    public string Language { get; init; } = "es";
    public string Timezone { get; init; } = "America/Mexico_City";
    public string DateFormat { get; init; } = "dd/MM/yyyy";
    public string TimeFormat { get; init; } = "HH:mm";
    public Guid TenantId { get; init; }
    public string TenantName { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
}

public record UpdateProfileRequest
{
    public string? Name { get; init; }
    public string? Avatar { get; init; }
    public string? Phone { get; init; }
    public string? Department { get; init; }
    public string? Position { get; init; }
    public string? Language { get; init; }
    public string? Timezone { get; init; }
    public string? DateFormat { get; init; }
    public string? TimeFormat { get; init; }
}

public record AforeSettingsDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? AforeCode { get; init; }
    public string? TaxId { get; init; }
    public string? ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public string? Logo { get; init; }
    public string? PrimaryColor { get; init; }
    public string? SecondaryColor { get; init; }
    public string? DefaultValidationFlow { get; init; }
    public bool RequireApproval { get; init; }
    public bool AutoProcessValidations { get; init; }
}

public record UpdateAforeRequest
{
    public string? ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public string? Logo { get; init; }
    public string? PrimaryColor { get; init; }
    public string? SecondaryColor { get; init; }
    public string? DefaultValidationFlow { get; init; }
    public bool? RequireApproval { get; init; }
    public bool? AutoProcessValidations { get; init; }
}

// Note: NotificationSettingsDto is defined in Certus.Domain.Entities.User

public record SecuritySettingsDto
{
    public bool IsMfaEnabled { get; init; }
    public string? MfaMethod { get; init; }
    public bool IsEmailVerified { get; init; }
    public DateTime? LastPasswordChange { get; init; }
    public int SessionTimeout { get; init; } = 60;
    public List<SessionDto> ActiveSessions { get; init; } = new();
}

public record SessionDto
{
    public string Id { get; init; } = string.Empty;
    public string Device { get; init; } = string.Empty;
    public string Browser { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public string IpAddress { get; init; } = string.Empty;
    public DateTime LastActivity { get; init; }
    public bool IsCurrent { get; init; }
}

public record UpdateSecurityRequest
{
    public bool? EnableMfa { get; init; }
    public string? MfaMethod { get; init; }
    public int? SessionTimeout { get; init; }
}

public record ChangePasswordRequest
{
    public string CurrentPassword { get; init; } = string.Empty;
    public string NewPassword { get; init; } = string.Empty;
    public string ConfirmPassword { get; init; } = string.Empty;
}

public record RevokeSessionRequest
{
    public string SessionId { get; init; } = string.Empty;
}
