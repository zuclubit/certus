using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller para autenticación y gestión de sesión
/// </summary>
public class AuthController : BaseController
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthController> _logger;
    private readonly IConfiguration _configuration;

    public AuthController(
        IApplicationDbContext context,
        IJwtTokenService jwtTokenService,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Iniciar sesión con email y contraseña
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user == null)
        {
            _logger.LogWarning("Login failed: user not found for email {Email}", request.Email);
            return Unauthorized(new { error = "Credenciales inválidas" });
        }

        // Verificar si está bloqueado
        if (user.IsLockedOut)
        {
            _logger.LogWarning("Login failed: user {UserId} is locked out", user.Id);
            return Unauthorized(new { error = "Cuenta bloqueada. Contacte al administrador." });
        }

        // Verificar contraseña
        if (!user.VerifyPassword(request.Password))
        {
            user.RecordFailedLogin();
            await _context.SaveChangesAsync();

            _logger.LogWarning("Login failed: invalid password for user {UserId}", user.Id);
            return Unauthorized(new { error = "Credenciales inválidas" });
        }

        // Verificar estado
        if (user.Status != Domain.Enums.UserStatus.Active)
        {
            _logger.LogWarning("Login failed: user {UserId} status is {Status}", user.Id, user.Status);
            return Unauthorized(new { error = "Cuenta no activa" });
        }

        // Generar tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        // Guardar refresh token
        user.RecordSuccessfulLogin();
        user.SetRefreshToken(refreshToken, DateTime.UtcNow.AddDays(7));
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} logged in successfully", user.Id);

        return Ok(new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = 3600,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.FullName,
                Role = user.Role.ToString(),
                TenantId = user.TenantId,
                TenantName = user.Tenant?.Name,
                IsEmailVerified = user.IsEmailVerified
            }
        });
    }

    /// <summary>
    /// Refrescar token de acceso
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(RefreshResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RefreshResponse>> RefreshToken([FromBody] RefreshRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken);

        if (user == null || !user.ValidateRefreshToken(request.RefreshToken))
        {
            return Unauthorized(new { error = "Token inválido o expirado" });
        }

        // Generar nuevos tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        // Rotar refresh token
        user.SetRefreshToken(refreshToken, DateTime.UtcNow.AddDays(7));
        await _context.SaveChangesAsync();

        return Ok(new RefreshResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = 3600
        });
    }

    /// <summary>
    /// Cerrar sesión
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout()
    {
        if (CurrentUserId.HasValue)
        {
            var user = await _context.Users.FindAsync(CurrentUserId.Value);
            if (user != null)
            {
                user.RevokeRefreshToken();
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} logged out", CurrentUserId.Value);
            }
        }

        return NoContent();
    }

    /// <summary>
    /// Registrar nuevo usuario
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RegisterResponse>> Register([FromBody] RegisterRequest request)
    {
        // Validar email único
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (existingUser != null)
        {
            _logger.LogWarning("Registration failed: email {Email} already exists", request.Email);
            return Conflict(new { error = "El correo electrónico ya está registrado" });
        }

        // Buscar tenant (si no se proporciona, usar el default o crear uno)
        Tenant? tenant = null;
        if (request.TenantId.HasValue)
        {
            tenant = await _context.Tenants.FindAsync(request.TenantId.Value);
            if (tenant == null)
            {
                return BadRequest(new { error = "Organización no encontrada" });
            }
        }
        else
        {
            // Buscar o crear tenant default
            tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Name == "Default");
            if (tenant == null)
            {
                tenant = Tenant.Create("Default", "default");
                _context.Tenants.Add(tenant);
                await _context.SaveChangesAsync();
            }
        }

        // Crear usuario (User.Create handles password hashing internally)
        var user = Certus.Domain.Entities.User.Create(
            request.Email,
            request.Name,
            request.Password,
            tenant.Id,
            Certus.Domain.Enums.UserRole.Viewer // Rol por defecto
        );

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate email verification token and send email
        var verificationToken = user.GenerateEmailVerificationToken();
        await _context.SaveChangesAsync();

        // Build verification URL
        var frontendUrl = _configuration["FrontendUrl"] ?? "https://certus.hergon.digital";
        var verifyUrl = $"{frontendUrl}/verify-email?token={verificationToken}";

        // Send verification email (async, don't block registration)
        _ = Task.Run(async () =>
        {
            try
            {
                var emailBody = $@"
                    <h2>¡Bienvenido a Certus!</h2>
                    <p>Hola {user.Name},</p>
                    <p>Gracias por registrarte en Certus. Para completar tu registro y acceder a todas las funcionalidades, verifica tu correo electrónico:</p>
                    <p><a href=""{verifyUrl}"" style=""background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;"">Verificar mi correo</a></p>
                    <p>Este enlace expirará en 24 horas.</p>
                    <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
                    <p>Saludos,<br/>El equipo de Certus</p>
                ";

                await _emailService.SendAsync(
                    user.Email,
                    "¡Bienvenido a Certus! Verifica tu correo",
                    emailBody);

                _logger.LogInformation("Verification email sent to new user {Email}", user.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send verification email to {Email}", user.Email);
            }
        });

        // Generar tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        user.SetRefreshToken(refreshToken, DateTime.UtcNow.AddDays(7));
        user.RecordSuccessfulLogin();
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} registered successfully", user.Id);

        return CreatedAtAction(nameof(GetCurrentUser), new RegisterResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = 3600,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.FullName,
                Role = user.Role.ToString(),
                TenantId = user.TenantId,
                TenantName = tenant.Name,
                IsEmailVerified = user.IsEmailVerified
            }
        });
    }

    /// <summary>
    /// Obtener lista de organizaciones disponibles para registro
    /// </summary>
    [HttpGet("tenants")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<TenantDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TenantDto>>> GetTenants()
    {
        var tenants = await _context.Tenants
            .Where(t => t.Status == Domain.Enums.TenantStatus.Active)
            .OrderBy(t => t.Name)
            .Select(t => new TenantDto
            {
                Id = t.Id,
                Name = t.Name,
                Code = t.AforeCode
            })
            .ToListAsync();

        return Ok(tenants);
    }

    /// <summary>
    /// Obtener información del usuario actual
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        if (!CurrentUserId.HasValue)
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Id == CurrentUserId.Value);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.FullName,
            Role = user.Role.ToString(),
            TenantId = user.TenantId,
            TenantName = user.Tenant?.Name,
            AvatarUrl = user.AvatarUrl,
            IsEmailVerified = user.IsEmailVerified
        });
    }

    /// <summary>
    /// Solicitar restablecimiento de contraseña
    /// </summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ForgotPasswordResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ForgotPasswordResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        // Always return success to prevent email enumeration attacks
        var response = new ForgotPasswordResponse
        {
            Message = "Si el correo existe, recibirás instrucciones para restablecer tu contraseña.",
            EmailSent = true
        };

        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (user == null)
            {
                _logger.LogWarning("Password reset requested for non-existent email: {Email}", request.Email);
                return Ok(response);
            }

            if (user.Status != Domain.Enums.UserStatus.Active)
            {
                _logger.LogWarning("Password reset requested for inactive user: {UserId}", user.Id);
                return Ok(response);
            }

            // Generate reset token
            var token = user.GeneratePasswordResetToken();
            await _context.SaveChangesAsync();

            // Build reset URL
            var frontendUrl = _configuration["FrontendUrl"] ?? "https://certus.hergon.digital";
            var resetUrl = $"{frontendUrl}/reset-password?token={token}";

            // Send email
            var emailBody = $@"
                <h2>Recuperación de Contraseña - Certus</h2>
                <p>Hola {user.Name},</p>
                <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                <p><a href=""{resetUrl}"" style=""background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;"">Restablecer Contraseña</a></p>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                <p>Saludos,<br/>El equipo de Certus</p>
            ";

            var emailResult = await _emailService.SendAsync(
                user.Email,
                "Recuperación de Contraseña - Certus",
                emailBody);

            if (!emailResult.Success)
            {
                _logger.LogError("Failed to send password reset email to {Email}: {Error}",
                    user.Email, emailResult.ErrorMessage);
            }
            else
            {
                _logger.LogInformation("Password reset email sent to {Email}", user.Email);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing forgot password request for {Email}", request.Email);
        }

        return Ok(response);
    }

    /// <summary>
    /// Verificar token de restablecimiento de contraseña
    /// </summary>
    [HttpGet("verify-reset-token/{token}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(VerifyResetTokenResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<VerifyResetTokenResponse>> VerifyResetToken(string token)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.PasswordResetToken == token);

        if (user == null || !user.ValidatePasswordResetToken(token))
        {
            return Ok(new VerifyResetTokenResponse
            {
                Valid = false,
                Message = "Token inválido o expirado"
            });
        }

        return Ok(new VerifyResetTokenResponse
        {
            Valid = true,
            Email = MaskEmail(user.Email),
            Message = "Token válido"
        });
    }

    /// <summary>
    /// Restablecer contraseña con token
    /// </summary>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ResetPasswordResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ResetPasswordResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        // Validate passwords match
        if (request.NewPassword != request.ConfirmPassword)
        {
            return BadRequest(new { error = "Las contraseñas no coinciden" });
        }

        // Validate password strength
        var passwordError = ValidatePasswordStrength(request.NewPassword);
        if (passwordError != null)
        {
            return BadRequest(new { error = passwordError });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token);

        if (user == null || !user.ValidatePasswordResetToken(request.Token))
        {
            _logger.LogWarning("Invalid password reset attempt with token");
            return BadRequest(new { error = "Token inválido o expirado" });
        }

        // Reset password
        if (!user.ResetPassword(request.Token, request.NewPassword))
        {
            return BadRequest(new { error = "No se pudo restablecer la contraseña" });
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Password reset successful for user {UserId}", user.Id);

        return Ok(new ResetPasswordResponse
        {
            Success = true,
            Message = "Contraseña restablecida exitosamente"
        });
    }

    /// <summary>
    /// Cambiar contraseña (usuario autenticado)
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(typeof(ChangePasswordResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ChangePasswordResponse>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!CurrentUserId.HasValue)
        {
            return Unauthorized();
        }

        // Validate passwords match
        if (request.NewPassword != request.ConfirmPassword)
        {
            return BadRequest(new { error = "Las contraseñas no coinciden" });
        }

        // Validate password strength
        var passwordError = ValidatePasswordStrength(request.NewPassword);
        if (passwordError != null)
        {
            return BadRequest(new { error = passwordError });
        }

        var user = await _context.Users.FindAsync(CurrentUserId.Value);

        if (user == null)
        {
            return Unauthorized();
        }

        // Verify current password
        if (!user.VerifyPassword(request.CurrentPassword))
        {
            _logger.LogWarning("Change password failed: invalid current password for user {UserId}", user.Id);
            return BadRequest(new { error = "Contraseña actual incorrecta" });
        }

        // Ensure new password is different
        if (user.VerifyPassword(request.NewPassword))
        {
            return BadRequest(new { error = "La nueva contraseña debe ser diferente a la actual" });
        }

        // Change password
        user.ChangePassword(request.NewPassword);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Password changed successfully for user {UserId}", user.Id);

        return Ok(new ChangePasswordResponse
        {
            Success = true,
            Message = "Contraseña actualizada exitosamente"
        });
    }

    // ============================================
    // EMAIL VERIFICATION ENDPOINTS
    // ============================================

    /// <summary>
    /// Enviar/reenviar email de verificación
    /// Rate limited: 1 email each 2 minutes
    /// </summary>
    [HttpPost("send-verification-email")]
    [Authorize]
    [ProducesResponseType(typeof(SendVerificationEmailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<SendVerificationEmailResponse>> SendVerificationEmail()
    {
        if (!CurrentUserId.HasValue)
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(CurrentUserId.Value);
        if (user == null)
        {
            return Unauthorized();
        }

        // Check if already verified
        if (user.IsEmailVerified)
        {
            return Ok(new SendVerificationEmailResponse
            {
                Success = true,
                Message = "Tu correo ya está verificado"
            });
        }

        // Rate limiting - check if can send
        if (!user.CanSendVerificationEmail())
        {
            var waitSeconds = user.EmailVerificationSentAt.HasValue
                ? (int)(user.EmailVerificationSentAt.Value.AddMinutes(2) - DateTime.UtcNow).TotalSeconds
                : 0;

            return StatusCode(StatusCodes.Status429TooManyRequests, new SendVerificationEmailResponse
            {
                Success = false,
                Message = "Por favor espera antes de solicitar otro correo",
                ResendAvailableIn = Math.Max(0, waitSeconds)
            });
        }

        // Generate verification token
        var token = user.GenerateEmailVerificationToken();
        await _context.SaveChangesAsync();

        // Build verification URL
        var frontendUrl = _configuration["FrontendUrl"] ?? "https://certus.hergon.digital";
        var verifyUrl = $"{frontendUrl}/verify-email?token={token}";

        // Send email
        var emailBody = $@"
            <h2>Verifica tu correo electrónico - Certus</h2>
            <p>Hola {user.Name},</p>
            <p>Gracias por registrarte en Certus. Para completar tu registro, verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
            <p><a href=""{verifyUrl}"" style=""background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;"">Verificar Correo</a></p>
            <p>Este enlace expirará en 24 horas.</p>
            <p>Si no creaste una cuenta en Certus, puedes ignorar este correo.</p>
            <p>Saludos,<br/>El equipo de Certus</p>
        ";

        var emailResult = await _emailService.SendAsync(
            user.Email,
            "Verifica tu correo electrónico - Certus",
            emailBody);

        if (!emailResult.Success)
        {
            _logger.LogError("Failed to send verification email to {Email}: {Error}",
                user.Email, emailResult.ErrorMessage);
            return Ok(new SendVerificationEmailResponse
            {
                Success = false,
                Message = "Error al enviar el correo. Intenta nuevamente."
            });
        }

        _logger.LogInformation("Verification email sent to {Email}", user.Email);

        return Ok(new SendVerificationEmailResponse
        {
            Success = true,
            Message = "Correo de verificación enviado. Revisa tu bandeja de entrada."
        });
    }

    /// <summary>
    /// Verificar email con token
    /// </summary>
    [HttpGet("verify-email/{token}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(VerifyEmailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<VerifyEmailResponse>> VerifyEmail(string token)
    {
        if (string.IsNullOrEmpty(token))
        {
            return BadRequest(new VerifyEmailResponse
            {
                Success = false,
                Message = "Token requerido"
            });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.EmailVerificationToken == token);

        if (user == null)
        {
            _logger.LogWarning("Email verification failed: token not found");
            return BadRequest(new VerifyEmailResponse
            {
                Success = false,
                Message = "Token inválido o expirado"
            });
        }

        if (!user.CompleteEmailVerification(token))
        {
            _logger.LogWarning("Email verification failed: token expired for user {UserId}", user.Id);
            return BadRequest(new VerifyEmailResponse
            {
                Success = false,
                Message = "Token inválido o expirado"
            });
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Email verified successfully for user {UserId}", user.Id);

        return Ok(new VerifyEmailResponse
        {
            Success = true,
            Message = "¡Tu correo ha sido verificado exitosamente!",
            Email = MaskEmail(user.Email)
        });
    }

    /// <summary>
    /// Verificar estado de verificación de email del usuario actual
    /// </summary>
    [HttpGet("email-verification-status")]
    [Authorize]
    [ProducesResponseType(typeof(EmailVerificationStatusResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<EmailVerificationStatusResponse>> GetEmailVerificationStatus()
    {
        if (!CurrentUserId.HasValue)
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(CurrentUserId.Value);
        if (user == null)
        {
            return Unauthorized();
        }

        var canResend = user.CanSendVerificationEmail();
        int? resendIn = null;

        if (!canResend && user.EmailVerificationSentAt.HasValue)
        {
            resendIn = (int)(user.EmailVerificationSentAt.Value.AddMinutes(2) - DateTime.UtcNow).TotalSeconds;
            resendIn = Math.Max(0, resendIn.Value);
        }

        return Ok(new EmailVerificationStatusResponse
        {
            IsVerified = user.IsEmailVerified,
            CanResendEmail = canResend && !user.IsEmailVerified,
            ResendAvailableIn = resendIn
        });
    }

    /// <summary>
    /// Mask email for privacy (show only first 2 chars and domain)
    /// </summary>
    private static string MaskEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2) return "***@***.***";

        var name = parts[0];
        var domain = parts[1];
        var maskedName = name.Length > 2
            ? name[..2] + new string('*', Math.Min(name.Length - 2, 5))
            : name;

        return $"{maskedName}@{domain}";
    }

    /// <summary>
    /// Validate password strength (CONSAR requirements)
    /// </summary>
    private static string? ValidatePasswordStrength(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return "La contraseña es requerida";
        if (password.Length < 8)
            return "La contraseña debe tener al menos 8 caracteres";
        if (!password.Any(char.IsUpper))
            return "La contraseña debe incluir al menos una mayúscula";
        if (!password.Any(char.IsLower))
            return "La contraseña debe incluir al menos una minúscula";
        if (!password.Any(char.IsDigit))
            return "La contraseña debe incluir al menos un número";
        if (!password.Any(c => "!@#$%^&*(),.?\":{}|<>".Contains(c)))
            return "La contraseña debe incluir al menos un símbolo (!@#$%^&*...)";
        return null;
    }

    /// <summary>
    /// [Development only] Reset passwords for seed users
    /// </summary>
    [HttpPost("dev/reset-passwords")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> ResetPasswords(
        [FromServices] IWebHostEnvironment env,
        [FromServices] Certus.Infrastructure.Data.ApplicationDbContext dbContext)
    {
        if (!env.IsDevelopment())
        {
            return Forbid();
        }

        var newHash = BCrypt.Net.BCrypt.HashPassword("Admin123!", 11);
        _logger.LogInformation("Resetting passwords with new hash");

        // Reset all seed users
        var affected = await dbContext.Database.ExecuteSqlRawAsync(
            @"UPDATE users SET ""PasswordHash"" = {0}, ""FailedLoginAttempts"" = 0, ""LockoutEnd"" = NULL
              WHERE ""Email"" LIKE '%@certus.mx' OR ""Email"" LIKE '%@hergon.digital'",
            newHash);

        _logger.LogInformation("Reset {Count} user passwords", affected);

        return Ok(new { message = $"Reset {affected} user passwords", newPasswordIs = "Admin123!" });
    }

    /// <summary>
    /// [Development only] Get email verification token for testing
    /// </summary>
    [HttpGet("dev/get-verification-token/{email}")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetVerificationToken(
        string email,
        [FromServices] IWebHostEnvironment env)
    {
        if (!env.IsDevelopment())
        {
            return Forbid();
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

        if (user == null)
        {
            return NotFound(new { error = "User not found" });
        }

        return Ok(new
        {
            email = user.Email,
            isEmailVerified = user.IsEmailVerified,
            verificationToken = user.EmailVerificationToken,
            tokenExpiry = user.EmailVerificationTokenExpiry,
            lastSent = user.EmailVerificationSentAt
        });
    }
}

/// <summary>
/// Request de login
/// </summary>
public record LoginRequest(string Email, string Password);

/// <summary>
/// Response de login
/// </summary>
public record LoginResponse
{
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
    public int ExpiresIn { get; init; }
    public UserDto User { get; init; } = null!;
}

/// <summary>
/// Request de refresh token
/// </summary>
public record RefreshRequest(string RefreshToken);

/// <summary>
/// Response de refresh token
/// </summary>
public record RefreshResponse
{
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
    public int ExpiresIn { get; init; }
}

/// <summary>
/// DTO de usuario
/// </summary>
public record UserDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public Guid TenantId { get; init; }
    public string? TenantName { get; init; }
    public string? AvatarUrl { get; init; }
    public bool IsEmailVerified { get; init; }
}

/// <summary>
/// Request de registro
/// </summary>
public record RegisterRequest
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public Guid? TenantId { get; init; }
}

/// <summary>
/// Response de registro
/// </summary>
public record RegisterResponse
{
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
    public int ExpiresIn { get; init; }
    public UserDto User { get; init; } = null!;
}

/// <summary>
/// DTO de tenant/organización
/// </summary>
public record TenantDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
}

/// <summary>
/// Request para solicitar restablecimiento de contraseña
/// </summary>
public record ForgotPasswordRequest
{
    public string Email { get; init; } = string.Empty;
}

/// <summary>
/// Response de forgot-password
/// </summary>
public record ForgotPasswordResponse
{
    public string Message { get; init; } = string.Empty;
    public bool EmailSent { get; init; }
}

/// <summary>
/// Response de verificación de token
/// </summary>
public record VerifyResetTokenResponse
{
    public bool Valid { get; init; }
    public string? Email { get; init; }
    public string Message { get; init; } = string.Empty;
}

/// <summary>
/// Request para restablecer contraseña con token
/// </summary>
public record ResetPasswordRequest
{
    public string Token { get; init; } = string.Empty;
    public string NewPassword { get; init; } = string.Empty;
    public string ConfirmPassword { get; init; } = string.Empty;
}

/// <summary>
/// Response de reset-password
/// </summary>
public record ResetPasswordResponse
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
}

/// <summary>
/// Response de change-password
/// </summary>
public record ChangePasswordResponse
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
}

/// <summary>
/// Request para enviar email de verificación
/// </summary>
public record SendVerificationEmailRequest
{
    public string? Email { get; init; }
}

/// <summary>
/// Response de send-verification-email
/// </summary>
public record SendVerificationEmailResponse
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public int? ResendAvailableIn { get; init; } // Seconds until resend is allowed
}

/// <summary>
/// Response de verify-email
/// </summary>
public record VerifyEmailResponse
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public string? Email { get; init; }
}

/// <summary>
/// Response de check-email-verification-status
/// </summary>
public record EmailVerificationStatusResponse
{
    public bool IsVerified { get; init; }
    public bool CanResendEmail { get; init; }
    public int? ResendAvailableIn { get; init; } // Seconds until resend is allowed
}
