using Certus.Domain.Common;
using Certus.Domain.Enums;

namespace Certus.Domain.Entities;

/// <summary>
/// Tenant - Representa una AFORE u organización en el sistema multi-tenant
/// </summary>
public class Tenant : SoftDeletableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? AforeCode { get; private set; }
    public string? TaxId { get; private set; }
    public TenantType Type { get; private set; } = TenantType.Afore;
    public TenantStatus Status { get; private set; } = TenantStatus.Active;

    // Contact Information
    public string? ContactEmail { get; private set; }
    public string? ContactPhone { get; private set; }
    public string? Address { get; private set; }
    public string? City { get; private set; }
    public string? State { get; private set; }
    public string? PostalCode { get; private set; }

    // Branding
    public string? Logo { get; private set; }
    public string? PrimaryColor { get; private set; }
    public string? SecondaryColor { get; private set; }

    // Subscription/License
    public int MaxUsers { get; private set; } = 50;
    public DateTime? LicenseExpiresAt { get; private set; }

    // Validation Settings
    public string? DefaultValidationFlow { get; private set; }
    public bool RequireApproval { get; private set; } = true;
    public bool AutoProcessValidations { get; private set; } = false;

    // Configuraciones JSON
    public string? Settings { get; private set; } = "{}";

    // Legacy compatibility
    public bool IsActive => Status == TenantStatus.Active;

    // Navigation properties
    public virtual ICollection<User> Users { get; private set; } = new List<User>();
    public virtual ICollection<Validation> Validations { get; private set; } = new List<Validation>();
    public virtual ICollection<Catalog> Catalogs { get; private set; } = new List<Catalog>();
    public virtual ICollection<UserInvitation> Invitations { get; private set; } = new List<UserInvitation>();

    private Tenant() { } // EF Core

    /// <summary>
    /// Create a new tenant
    /// </summary>
    public static Tenant Create(
        string name,
        TenantType type = TenantType.Afore,
        string? aforeCode = null,
        string? taxId = null,
        string? contactEmail = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required", nameof(name));

        return new Tenant
        {
            Name = name,
            Type = type,
            AforeCode = aforeCode?.ToUpperInvariant(),
            TaxId = taxId,
            ContactEmail = contactEmail,
            Status = TenantStatus.Active
        };
    }

    /// <summary>
    /// Legacy factory method for backwards compatibility
    /// </summary>
    public static Tenant Create(string name, string aforeCode, string? logo = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required", nameof(name));

        if (string.IsNullOrWhiteSpace(aforeCode))
            throw new ArgumentException("AFORE code is required", nameof(aforeCode));

        return new Tenant
        {
            Name = name,
            AforeCode = aforeCode.ToUpperInvariant(),
            Logo = logo,
            Type = TenantType.Afore,
            Status = TenantStatus.Active
        };
    }

    /// <summary>
    /// Update tenant name
    /// </summary>
    public void UpdateName(string name)
    {
        if (!string.IsNullOrWhiteSpace(name))
        {
            Name = name;
            UpdatedAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Update contact information
    /// </summary>
    public void UpdateContact(
        string? contactEmail,
        string? contactPhone,
        string? address,
        string? city,
        string? state,
        string? postalCode)
    {
        ContactEmail = contactEmail;
        ContactPhone = contactPhone;
        Address = address;
        City = city;
        State = state;
        PostalCode = postalCode;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Update branding
    /// </summary>
    public void UpdateBranding(string? logo, string? primaryColor, string? secondaryColor)
    {
        Logo = logo;
        PrimaryColor = primaryColor;
        SecondaryColor = secondaryColor;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Update validation settings
    /// </summary>
    public void UpdateValidationSettings(string? defaultFlow, bool requireApproval, bool autoProcess)
    {
        DefaultValidationFlow = defaultFlow;
        RequireApproval = requireApproval;
        AutoProcessValidations = autoProcess;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Set max users limit
    /// </summary>
    public void SetMaxUsers(int maxUsers)
    {
        MaxUsers = maxUsers > 0 ? maxUsers : 50;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Set license expiration date
    /// </summary>
    public void SetLicenseExpiration(DateTime expiresAt)
    {
        LicenseExpiresAt = expiresAt;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Legacy update method for backwards compatibility
    /// </summary>
    public void Update(string name, string? logo)
    {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name;

        Logo = logo;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Update settings JSON
    /// </summary>
    public void UpdateSettings(string settingsJson)
    {
        Settings = settingsJson;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Activate tenant
    /// </summary>
    public void Activate()
    {
        Status = TenantStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Deactivate tenant
    /// </summary>
    public void Deactivate()
    {
        Status = TenantStatus.Inactive;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Suspend tenant
    /// </summary>
    public void Suspend()
    {
        Status = TenantStatus.Suspended;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Soft delete the tenant
    /// </summary>
    public void Delete()
    {
        SoftDelete("system");
        Status = TenantStatus.Cancelled;
    }

    /// <summary>
    /// Check if license is expired
    /// </summary>
    public bool IsLicenseExpired => LicenseExpiresAt.HasValue && LicenseExpiresAt.Value < DateTime.UtcNow;
}
