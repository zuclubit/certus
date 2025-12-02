using Certus.Domain.Common;
using Certus.Domain.Enums;

namespace Certus.Domain.Entities;

/// <summary>
/// Usuario del sistema CONSAR
/// </summary>
public class User : TenantEntity
{
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Full name of the user (alias for Name for compatibility)
    /// </summary>
    public string FullName => Name;

    public UserRole Role { get; private set; } = UserRole.Viewer;
    public UserStatus Status { get; private set; } = UserStatus.Pending;

    public string? Avatar { get; private set; }
    public string? AvatarUrl => Avatar; // Compatibility alias
    public string? Phone { get; private set; }
    public string? Department { get; private set; }
    public string? Position { get; private set; }
    public string? EmployeeNumber { get; private set; }

    // Security
    public bool IsEmailVerified { get; private set; } = false;
    public bool IsMfaEnabled { get; private set; } = false;
    public string? MfaMethod { get; private set; }
    public DateTime? LastLogin { get; private set; }
    public DateTime? LastPasswordChange { get; private set; }
    public int SessionCount { get; private set; } = 0;
    public int FailedLoginAttempts { get; private set; } = 0;
    public DateTime? LockoutEnd { get; private set; }
    public int? SessionTimeout { get; private set; } = 60; // minutes

    // Refresh tokens
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiry { get; private set; }

    // Suspension (CONSAR compliance)
    public string? SuspensionReason { get; private set; }
    public DateTime? SuspendedAt { get; private set; }
    public string? SuspendedBy { get; private set; }

    // Invitation
    public string? InvitedBy { get; private set; }
    public DateTime? InvitedAt { get; private set; }
    public string? InvitationToken { get; private set; }

    // Password Reset
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiry { get; private set; }

    // Email Verification
    public string? EmailVerificationToken { get; private set; }
    public DateTime? EmailVerificationTokenExpiry { get; private set; }
    public DateTime? EmailVerificationSentAt { get; private set; }

    // User Preferences (stored as JSON)
    public UserPreferences? Preferences { get; private set; }

    // Notification Settings (stored as JSON)
    public NotificationSettingsDto? NotificationSettings { get; private set; }

    // Navigation
    public virtual Tenant Tenant { get; private set; } = null!;
    public virtual ICollection<Validation> Validations { get; private set; } = new List<Validation>();
    public virtual ICollection<AuditLog> AuditLogs { get; private set; } = new List<AuditLog>();

    private User() { } // EF Core

    public static User Create(
        string email,
        string name,
        string password,
        Guid tenantId,
        UserRole role = UserRole.Viewer)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required", nameof(email));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required", nameof(name));

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

        return new User
        {
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            Name = name,
            TenantId = tenantId,
            Role = role,
            Status = UserStatus.Active,
            LastPasswordChange = DateTime.UtcNow,
            Preferences = new UserPreferences()
        };
    }

    public static User CreateInvitation(
        string email,
        string name,
        Guid tenantId,
        UserRole role,
        string invitedBy)
    {
        var user = new User
        {
            Email = email.ToLowerInvariant(),
            PasswordHash = string.Empty,
            Name = name,
            TenantId = tenantId,
            Role = role,
            Status = UserStatus.Pending,
            InvitedBy = invitedBy,
            InvitedAt = DateTime.UtcNow,
            InvitationToken = Guid.NewGuid().ToString("N"),
            Preferences = new UserPreferences()
        };

        return user;
    }

    public void Update(string? name, string? phone, string? department, string? position)
    {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name;

        Phone = phone;
        Department = department;
        Position = position;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateAvatar(string? avatar)
    {
        Avatar = avatar;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePreferences(string language, string timezone, string dateFormat, string timeFormat)
    {
        Preferences = new UserPreferences
        {
            Language = language,
            Timezone = timezone,
            DateFormat = dateFormat,
            TimeFormat = timeFormat
        };
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateNotificationSettings(NotificationSettingsDto settings)
    {
        NotificationSettings = settings;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangeRole(UserRole newRole)
    {
        Role = newRole;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPassword(string passwordHash)
    {
        PasswordHash = passwordHash;
        Status = UserStatus.Active;
        InvitationToken = null;
        LastPasswordChange = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangePassword(string newPassword)
    {
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        LastPasswordChange = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRefreshToken(string token, DateTime expiry)
    {
        RefreshToken = token;
        RefreshTokenExpiry = expiry;
    }

    public void RevokeRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiry = null;
    }

    public void RecordLogin()
    {
        LastLogin = DateTime.UtcNow;
        SessionCount++;
        FailedLoginAttempts = 0;
        LockoutEnd = null;
    }

    /// <summary>
    /// Alias for RecordLogin for compatibility
    /// </summary>
    public void RecordSuccessfulLogin() => RecordLogin();

    /// <summary>
    /// Verify password against stored BCrypt hash
    /// </summary>
    public bool VerifyPassword(string password)
    {
        if (string.IsNullOrEmpty(PasswordHash) || string.IsNullOrEmpty(password))
            return false;

        try
        {
            return BCrypt.Net.BCrypt.Verify(password, PasswordHash);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Validate refresh token is valid and not expired
    /// </summary>
    public bool ValidateRefreshToken(string token)
    {
        if (string.IsNullOrEmpty(RefreshToken) || string.IsNullOrEmpty(token))
            return false;

        return RefreshToken == token &&
               RefreshTokenExpiry.HasValue &&
               RefreshTokenExpiry.Value > DateTime.UtcNow;
    }

    public void RecordFailedLogin()
    {
        FailedLoginAttempts++;

        // Lock after 5 failed attempts for 30 minutes
        if (FailedLoginAttempts >= 5)
        {
            LockoutEnd = DateTime.UtcNow.AddMinutes(30);
        }
    }

    public bool IsLockedOut => LockoutEnd.HasValue && LockoutEnd > DateTime.UtcNow;

    public void Suspend(string reason, string suspendedBy)
    {
        Status = UserStatus.Suspended;
        SuspensionReason = reason;
        SuspendedAt = DateTime.UtcNow;
        SuspendedBy = suspendedBy;
        RevokeRefreshToken();
    }

    public void Reactivate()
    {
        Status = UserStatus.Active;
        SuspensionReason = null;
        SuspendedAt = null;
        SuspendedBy = null;
        FailedLoginAttempts = 0;
        LockoutEnd = null;
    }

    public void VerifyEmail()
    {
        IsEmailVerified = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void EnableMfa(string method = "totp")
    {
        IsMfaEnabled = true;
        MfaMethod = method;
        UpdatedAt = DateTime.UtcNow;
    }

    public void DisableMfa()
    {
        IsMfaEnabled = false;
        MfaMethod = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetSessionTimeout(int minutes)
    {
        SessionTimeout = minutes > 0 ? minutes : 60;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Generate a password reset token (valid for 1 hour)
    /// </summary>
    public string GeneratePasswordResetToken()
    {
        PasswordResetToken = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
        PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        UpdatedAt = DateTime.UtcNow;
        return PasswordResetToken;
    }

    /// <summary>
    /// Validate password reset token
    /// </summary>
    public bool ValidatePasswordResetToken(string token)
    {
        if (string.IsNullOrEmpty(PasswordResetToken) || string.IsNullOrEmpty(token))
            return false;

        return PasswordResetToken == token &&
               PasswordResetTokenExpiry.HasValue &&
               PasswordResetTokenExpiry.Value > DateTime.UtcNow;
    }

    /// <summary>
    /// Clear password reset token after successful reset
    /// </summary>
    public void ClearPasswordResetToken()
    {
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;
    }

    /// <summary>
    /// Reset password using a valid token
    /// </summary>
    public bool ResetPassword(string token, string newPassword)
    {
        if (!ValidatePasswordResetToken(token))
            return false;

        ChangePassword(newPassword);
        ClearPasswordResetToken();
        FailedLoginAttempts = 0;
        LockoutEnd = null;
        return true;
    }

    // ============================================
    // EMAIL VERIFICATION METHODS
    // ============================================

    /// <summary>
    /// Generate an email verification token (valid for 24 hours)
    /// Uses cryptographically secure random bytes for token generation
    /// </summary>
    public string GenerateEmailVerificationToken()
    {
        // Generate URL-safe token using CSPRNG (64 bytes = 512 bits)
        EmailVerificationToken = Convert.ToBase64String(
            System.Security.Cryptography.RandomNumberGenerator.GetBytes(64))
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
        EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
        EmailVerificationSentAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        return EmailVerificationToken;
    }

    /// <summary>
    /// Validate email verification token
    /// Checks: token exists, matches, not expired
    /// </summary>
    public bool ValidateEmailVerificationToken(string token)
    {
        if (string.IsNullOrEmpty(EmailVerificationToken) || string.IsNullOrEmpty(token))
            return false;

        return EmailVerificationToken == token &&
               EmailVerificationTokenExpiry.HasValue &&
               EmailVerificationTokenExpiry.Value > DateTime.UtcNow;
    }

    /// <summary>
    /// Clear email verification token after successful verification
    /// </summary>
    public void ClearEmailVerificationToken()
    {
        EmailVerificationToken = null;
        EmailVerificationTokenExpiry = null;
    }

    /// <summary>
    /// Complete email verification using a valid token
    /// Sets IsEmailVerified = true and clears token
    /// </summary>
    public bool CompleteEmailVerification(string token)
    {
        if (!ValidateEmailVerificationToken(token))
            return false;

        IsEmailVerified = true;
        ClearEmailVerificationToken();
        UpdatedAt = DateTime.UtcNow;
        return true;
    }

    /// <summary>
    /// Check if a new verification email can be sent (rate limiting)
    /// Prevents spam by requiring 2 minutes between sends
    /// </summary>
    public bool CanSendVerificationEmail()
    {
        if (!EmailVerificationSentAt.HasValue)
            return true;

        return DateTime.UtcNow > EmailVerificationSentAt.Value.AddMinutes(2);
    }

    /// <summary>
    /// Check if email needs verification
    /// </summary>
    public bool RequiresEmailVerification => !IsEmailVerified;
}

/// <summary>
/// User preferences (stored as JSON)
/// </summary>
public class UserPreferences
{
    public string Language { get; set; } = "es";
    public string Timezone { get; set; } = "America/Mexico_City";
    public string DateFormat { get; set; } = "dd/MM/yyyy";
    public string TimeFormat { get; set; } = "HH:mm";
}

/// <summary>
/// Notification settings (stored as JSON)
/// </summary>
public record NotificationSettingsDto
{
    public bool EmailEnabled { get; init; } = true;
    public bool PushEnabled { get; init; } = true;
    public bool ValidationCompleted { get; init; } = true;
    public bool ValidationFailed { get; init; } = true;
    public bool ApprovalRequired { get; init; } = true;
    public bool ApprovalDecision { get; init; } = true;
    public bool NormativeChanges { get; init; } = true;
    public bool SystemAnnouncements { get; init; } = true;
    public bool WeeklyReport { get; init; } = true;
    public bool DailyDigest { get; init; } = false;
}
