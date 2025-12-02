using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller for organization onboarding and registration
/// Handles multi-step registration flow for AFORE/CONSAR entities
/// </summary>
public class OnboardingController : BaseController
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<OnboardingController> _logger;

    public OnboardingController(
        IApplicationDbContext context,
        IJwtTokenService jwtTokenService,
        ILogger<OnboardingController> logger)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new organization with administrator
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CreateOrganizationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CreateOrganizationResponse>> Register([FromBody] CreateOrganizationRequest request)
    {
        _logger.LogInformation("Processing organization registration for {OrgName}", request.Organization?.Name);

        // Validate required fields
        if (request.Organization == null || string.IsNullOrWhiteSpace(request.Organization.Name))
        {
            return BadRequest(new { error = "Organization name is required" });
        }

        if (request.Administrator == null || string.IsNullOrWhiteSpace(request.Administrator.Email))
        {
            return BadRequest(new { error = "Administrator email is required" });
        }

        // Check if organization name already exists
        var existingTenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Name.ToLower() == request.Organization.Name.ToLower());

        if (existingTenant != null)
        {
            _logger.LogWarning("Registration failed: organization name {Name} already exists", request.Organization.Name);
            return Conflict(new { error = "Una organización con este nombre ya existe" });
        }

        // Check if AFORE code already exists
        if (!string.IsNullOrWhiteSpace(request.Organization.AforeCode))
        {
            var existingCode = await _context.Tenants
                .FirstOrDefaultAsync(t => t.AforeCode.ToLower() == request.Organization.AforeCode.ToLower());

            if (existingCode != null)
            {
                _logger.LogWarning("Registration failed: AFORE code {Code} already exists", request.Organization.AforeCode);
                return Conflict(new { error = "Este código AFORE ya está registrado" });
            }
        }

        // Check if email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Administrator.Email.ToLower());

        if (existingUser != null)
        {
            _logger.LogWarning("Registration failed: email {Email} already exists", request.Administrator.Email);
            return Conflict(new { error = "El correo electrónico ya está registrado" });
        }

        // Create tenant/organization
        var tenant = Tenant.Create(
            request.Organization.Name.Trim(),
            request.Organization.AforeCode?.ToUpper().Trim() ?? GenerateAforeCode(request.Organization.Name)
        );

        // Set additional tenant properties if provided
        if (!string.IsNullOrWhiteSpace(request.Organization.Rfc))
        {
            // tenant.Rfc = request.Organization.Rfc.ToUpper().Trim();
        }

        _context.Tenants.Add(tenant);
        await _context.SaveChangesAsync();

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Administrator.Password);

        // Create admin user
        var adminName = $"{request.Administrator.FirstName} {request.Administrator.LastName}".Trim();
        var user = Certus.Domain.Entities.User.Create(
            request.Administrator.Email.ToLower().Trim(),
            passwordHash,
            adminName,
            tenant.Id,
            UserRole.AforeAdmin // Organization admin role
        );

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        user.SetRefreshToken(refreshToken, DateTime.UtcNow.AddDays(7));
        user.RecordSuccessfulLogin();
        await _context.SaveChangesAsync();

        _logger.LogInformation("Organization {TenantId} and admin user {UserId} created successfully", tenant.Id, user.Id);

        // Process team invitations (async, don't wait)
        var invitedMembers = new List<InvitedMemberResponse>();
        if (request.Team?.Members?.Any() == true)
        {
            foreach (var member in request.Team.Members)
            {
                invitedMembers.Add(new InvitedMemberResponse
                {
                    Email = member.Email,
                    Name = member.Name,
                    Role = member.Role,
                    EmailSent = false // Would be true after sending invitation email
                });
            }
        }

        var response = new CreateOrganizationResponse
        {
            Success = true,
            Message = "Organización creada exitosamente",
            TenantId = tenant.Id.ToString(),
            AdminUserId = user.Id.ToString(),
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = 3600,
            EmailVerificationPending = false, // Set to true if email verification is required
            User = new OnboardingUserDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                Name = user.FullName,
                Role = user.Role.ToString(),
                TenantId = tenant.Id.ToString(),
                TenantName = tenant.Name,
                AforeCode = tenant.AforeCode
            },
            InvitedMembers = invitedMembers,
            NextSteps = new List<string>
            {
                "Configura tu primer flujo de validación",
                "Importa tus catálogos de referencia",
                "Invita a tu equipo de trabajo",
                "Realiza tu primera validación de prueba"
            }
        };

        return CreatedAtAction(nameof(GetOnboardingStatus), new { tenantId = tenant.Id }, response);
    }

    /// <summary>
    /// Check availability of organization name, AFORE code, or email
    /// </summary>
    [HttpGet("check-availability")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CheckAvailabilityResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<CheckAvailabilityResponse>> CheckAvailability(
        [FromQuery] string? name,
        [FromQuery] string? aforeCode,
        [FromQuery] string? email)
    {
        var response = new CheckAvailabilityResponse();

        // Check name availability
        if (!string.IsNullOrWhiteSpace(name))
        {
            response.NameChecked = true;
            var existingName = await _context.Tenants
                .AnyAsync(t => t.Name.ToLower() == name.ToLower());
            response.NameAvailable = !existingName;
            response.NameMessage = existingName ? "Este nombre ya está en uso" : null;
        }

        // Check AFORE code availability
        if (!string.IsNullOrWhiteSpace(aforeCode))
        {
            response.AforeCodeChecked = true;
            response.AforeCodeValid = IsValidAforeCode(aforeCode);

            if (response.AforeCodeValid)
            {
                var existingCode = await _context.Tenants
                    .AnyAsync(t => t.AforeCode.ToLower() == aforeCode.ToLower());
                response.AforeCodeAvailable = !existingCode;
                response.AforeCodeMessage = existingCode ? "Este código AFORE ya está registrado" : null;
            }
            else
            {
                response.AforeCodeAvailable = false;
                response.AforeCodeMessage = "Código AFORE inválido (debe tener 3-10 caracteres alfanuméricos)";
            }
        }

        // Check email availability
        if (!string.IsNullOrWhiteSpace(email))
        {
            response.EmailChecked = true;
            response.EmailValid = IsValidEmail(email);

            if (response.EmailValid)
            {
                var existingEmail = await _context.Users
                    .AnyAsync(u => u.Email.ToLower() == email.ToLower());
                response.EmailAvailable = !existingEmail;
                response.EmailMessage = existingEmail ? "Este correo ya está registrado" : null;
            }
            else
            {
                response.EmailAvailable = false;
                response.EmailMessage = "Formato de correo electrónico inválido";
            }
        }

        return Ok(response);
    }

    /// <summary>
    /// Get available organization types
    /// </summary>
    [HttpGet("organization-types")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<OrganizationTypeDto>), StatusCodes.Status200OK)]
    public ActionResult<List<OrganizationTypeDto>> GetOrganizationTypes()
    {
        var types = new List<OrganizationTypeDto>
        {
            new() { Value = "AFORE", Label = "AFORE", Description = "Administradora de Fondos para el Retiro" },
            new() { Value = "PENSIONISSSTE", Label = "PENSIONISSSTE", Description = "Fondo de pensiones del ISSSTE" },
            new() { Value = "ASSET_MANAGER", Label = "Administrador de Activos", Description = "Empresa administradora de inversiones" },
            new() { Value = "PROCESAR", Label = "Empresa Operadora", Description = "Empresa operadora del SAR" },
            new() { Value = "REGULATOR", Label = "Entidad Reguladora", Description = "CONSAR u otra entidad de supervisión" },
            new() { Value = "OTHER", Label = "Otra", Description = "Otro tipo de organización" }
        };

        return Ok(types);
    }

    /// <summary>
    /// Get available user roles for team invitations
    /// </summary>
    [HttpGet("roles")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<RoleDto>), StatusCodes.Status200OK)]
    public ActionResult<List<RoleDto>> GetAvailableRoles()
    {
        var roles = new List<RoleDto>
        {
            new() { Value = "AforeAdmin", Label = "Administrador AFORE", Description = "Acceso completo a la gestión de la organización" },
            new() { Value = "AforeAnalyst", Label = "Analista", Description = "Procesa validaciones y genera reportes" },
            new() { Value = "Supervisor", Label = "Supervisor", Description = "Supervisa y aprueba validaciones" },
            new() { Value = "Auditor", Label = "Auditor", Description = "Acceso de solo lectura para auditorías" },
            new() { Value = "Viewer", Label = "Visualizador", Description = "Acceso limitado de solo lectura" }
        };

        return Ok(roles);
    }

    /// <summary>
    /// Get Mexican states for address selection
    /// </summary>
    [HttpGet("mexican-states")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<StateDto>), StatusCodes.Status200OK)]
    public ActionResult<List<StateDto>> GetMexicanStates()
    {
        var states = new List<StateDto>
        {
            new() { Value = "AGU", Label = "Aguascalientes" },
            new() { Value = "BCN", Label = "Baja California" },
            new() { Value = "BCS", Label = "Baja California Sur" },
            new() { Value = "CAM", Label = "Campeche" },
            new() { Value = "CHP", Label = "Chiapas" },
            new() { Value = "CHH", Label = "Chihuahua" },
            new() { Value = "CMX", Label = "Ciudad de México" },
            new() { Value = "COA", Label = "Coahuila" },
            new() { Value = "COL", Label = "Colima" },
            new() { Value = "DUR", Label = "Durango" },
            new() { Value = "MEX", Label = "Estado de México" },
            new() { Value = "GUA", Label = "Guanajuato" },
            new() { Value = "GRO", Label = "Guerrero" },
            new() { Value = "HID", Label = "Hidalgo" },
            new() { Value = "JAL", Label = "Jalisco" },
            new() { Value = "MIC", Label = "Michoacán" },
            new() { Value = "MOR", Label = "Morelos" },
            new() { Value = "NAY", Label = "Nayarit" },
            new() { Value = "NLE", Label = "Nuevo León" },
            new() { Value = "OAX", Label = "Oaxaca" },
            new() { Value = "PUE", Label = "Puebla" },
            new() { Value = "QUE", Label = "Querétaro" },
            new() { Value = "ROO", Label = "Quintana Roo" },
            new() { Value = "SLP", Label = "San Luis Potosí" },
            new() { Value = "SIN", Label = "Sinaloa" },
            new() { Value = "SON", Label = "Sonora" },
            new() { Value = "TAB", Label = "Tabasco" },
            new() { Value = "TAM", Label = "Tamaulipas" },
            new() { Value = "TLA", Label = "Tlaxcala" },
            new() { Value = "VER", Label = "Veracruz" },
            new() { Value = "YUC", Label = "Yucatán" },
            new() { Value = "ZAC", Label = "Zacatecas" }
        };

        return Ok(states);
    }

    /// <summary>
    /// Get onboarding status for a tenant
    /// </summary>
    [HttpGet("status/{tenantId}")]
    [Authorize]
    [ProducesResponseType(typeof(OnboardingStatusResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OnboardingStatusResponse>> GetOnboardingStatus(Guid tenantId)
    {
        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant == null)
        {
            return NotFound(new { error = "Organización no encontrada" });
        }

        var userCount = await _context.Users.CountAsync(u => u.TenantId == tenantId);
        var pendingInvitations = 0; // Would come from invitations table

        var response = new OnboardingStatusResponse
        {
            TenantId = tenant.Id.ToString(),
            TenantName = tenant.Name,
            AforeCode = tenant.AforeCode,
            IsActive = tenant.IsActive,
            AdminEmailVerified = true, // Would be from user table
            TotalUsers = userCount,
            PendingInvitations = pendingInvitations,
            CreatedAt = tenant.CreatedAt.ToString("O"),
            CompletionPercentage = CalculateCompletionPercentage(tenant, userCount)
        };

        return Ok(response);
    }

    #region Private Methods

    private static string GenerateAforeCode(string name)
    {
        // Generate a simple code from the first letters of the name
        var words = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var code = string.Join("", words.Take(3).Select(w => w[0])).ToUpper();
        return code.Length >= 3 ? code : $"{code}{new Random().Next(100, 999)}";
    }

    private static bool IsValidAforeCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code)) return false;
        if (code.Length < 3 || code.Length > 10) return false;
        return code.All(c => char.IsLetterOrDigit(c));
    }

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    private static int CalculateCompletionPercentage(Tenant tenant, int userCount)
    {
        var score = 0;
        if (!string.IsNullOrWhiteSpace(tenant.Name)) score += 20;
        if (!string.IsNullOrWhiteSpace(tenant.AforeCode)) score += 20;
        if (tenant.IsActive) score += 20;
        if (userCount > 0) score += 20;
        if (userCount > 1) score += 20;
        return Math.Min(score, 100);
    }

    #endregion
}

#region DTOs

/// <summary>
/// Request for creating a new organization
/// </summary>
public class CreateOrganizationRequest
{
    public OrganizationData? Organization { get; set; }
    public AdministratorData? Administrator { get; set; }
    public ComplianceData? Compliance { get; set; }
    public ConfigurationData? Configuration { get; set; }
    public TeamData? Team { get; set; }
}

public class OrganizationData
{
    public string Name { get; set; } = string.Empty;
    public string? AforeCode { get; set; }
    public string? OrganizationType { get; set; }
    public string? Rfc { get; set; }
    public string? LegalName { get; set; }
    public AddressData? Address { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Logo { get; set; }
}

public class AddressData
{
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
}

public class AdministratorData
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
}

public class ComplianceData
{
    public bool ConsarRegistered { get; set; }
    public bool CnbvRegistered { get; set; }
    public string? ConsarRegistrationNumber { get; set; }
    public bool AcceptedTerms { get; set; }
    public bool AcceptedPrivacy { get; set; }
}

public class ConfigurationData
{
    public string? Timezone { get; set; }
    public string? Language { get; set; }
    public string? DateFormat { get; set; }
    public bool MfaEnabled { get; set; }
    public bool AuditExportEnabled { get; set; }
    public bool ApiAccessEnabled { get; set; }
    public bool AutoValidationEnabled { get; set; }
    public NotificationPreferencesData? NotificationPreferences { get; set; }
}

public class NotificationPreferencesData
{
    public bool Email { get; set; } = true;
    public bool Sms { get; set; }
    public bool InApp { get; set; } = true;
    public bool ValidationAlerts { get; set; } = true;
    public bool ApprovalReminders { get; set; } = true;
    public bool SystemUpdates { get; set; }
}

public class TeamData
{
    public List<TeamMemberData>? Members { get; set; }
}

public class TeamMemberData
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "Viewer";
}

/// <summary>
/// Response for organization creation
/// </summary>
public class CreateOrganizationResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string AdminUserId { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public bool EmailVerificationPending { get; set; }
    public OnboardingUserDto User { get; set; } = null!;
    public List<InvitedMemberResponse> InvitedMembers { get; set; } = new();
    public List<string> NextSteps { get; set; } = new();
}

public class OnboardingUserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string TenantName { get; set; } = string.Empty;
    public string AforeCode { get; set; } = string.Empty;
}

public class InvitedMemberResponse
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool EmailSent { get; set; }
}

/// <summary>
/// Response for availability check
/// </summary>
public class CheckAvailabilityResponse
{
    public bool NameChecked { get; set; }
    public bool NameAvailable { get; set; }
    public string? NameMessage { get; set; }

    public bool AforeCodeChecked { get; set; }
    public bool AforeCodeAvailable { get; set; }
    public bool AforeCodeValid { get; set; }
    public string? AforeCodeMessage { get; set; }

    public bool EmailChecked { get; set; }
    public bool EmailAvailable { get; set; }
    public bool EmailValid { get; set; }
    public string? EmailMessage { get; set; }
}

/// <summary>
/// DTO for organization type
/// </summary>
public class OrganizationTypeDto
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

/// <summary>
/// DTO for role
/// </summary>
public class RoleDto
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

/// <summary>
/// DTO for state
/// </summary>
public class StateDto
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
}

/// <summary>
/// Response for onboarding status
/// </summary>
public class OnboardingStatusResponse
{
    public string TenantId { get; set; } = string.Empty;
    public string TenantName { get; set; } = string.Empty;
    public string AforeCode { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool AdminEmailVerified { get; set; }
    public int TotalUsers { get; set; }
    public int PendingInvitations { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public int CompletionPercentage { get; set; }
}

#endregion
