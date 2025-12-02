using Certus.Domain.Common;
using Certus.Domain.Enums;

namespace Certus.Domain.Entities;

/// <summary>
/// Invitación de usuario al sistema
/// </summary>
public class UserInvitation : AuditableEntity
{
    public string Email { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public UserRole Role { get; private set; }
    public Guid TenantId { get; private set; }
    public InvitationStatus Status { get; private set; } = InvitationStatus.Pending;

    /// <summary>
    /// Token único para aceptar la invitación
    /// </summary>
    public string Token { get; private set; } = string.Empty;

    /// <summary>
    /// Mensaje opcional del administrador
    /// </summary>
    public string? Message { get; private set; }

    /// <summary>
    /// Fecha de expiración de la invitación
    /// </summary>
    public DateTime ExpiresAt { get; private set; }

    /// <summary>
    /// ID del usuario que envió la invitación
    /// </summary>
    public Guid InvitedById { get; private set; }

    /// <summary>
    /// Fecha de aceptación (si fue aceptada)
    /// </summary>
    public DateTime? AcceptedAt { get; private set; }

    /// <summary>
    /// ID del usuario creado al aceptar (si fue aceptada)
    /// </summary>
    public Guid? AcceptedUserId { get; private set; }

    /// <summary>
    /// Número de veces que se reenvió la invitación
    /// </summary>
    public int ResendCount { get; private set; } = 0;

    // Navigation properties
    public virtual Tenant Tenant { get; private set; } = null!;
    public virtual User InvitedBy { get; private set; } = null!;
    public virtual User? AcceptedUser { get; private set; }

    private UserInvitation() { } // EF Core

    /// <summary>
    /// Crear una nueva invitación
    /// </summary>
    public static UserInvitation Create(
        string email,
        string name,
        Guid tenantId,
        UserRole role,
        Guid invitedById,
        string? message = null,
        int expirationDays = 7)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required", nameof(email));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required", nameof(name));

        return new UserInvitation
        {
            Email = email.ToLowerInvariant(),
            Name = name,
            TenantId = tenantId,
            Role = role,
            InvitedById = invitedById,
            Message = message,
            Token = GenerateToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(expirationDays),
            Status = InvitationStatus.Pending
        };
    }

    /// <summary>
    /// Aceptar la invitación
    /// </summary>
    public void Accept(Guid userId)
    {
        if (Status != InvitationStatus.Pending)
            throw new InvalidOperationException("Only pending invitations can be accepted");

        if (ExpiresAt < DateTime.UtcNow)
            throw new InvalidOperationException("Invitation has expired");

        Status = InvitationStatus.Accepted;
        AcceptedAt = DateTime.UtcNow;
        AcceptedUserId = userId;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Marcar como expirada
    /// </summary>
    public void Expire()
    {
        if (Status == InvitationStatus.Pending)
        {
            Status = InvitationStatus.Expired;
            UpdatedAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Cancelar la invitación
    /// </summary>
    public void Cancel()
    {
        if (Status == InvitationStatus.Pending)
        {
            Status = InvitationStatus.Cancelled;
            UpdatedAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Extender la fecha de expiración
    /// </summary>
    public void ExtendExpiration(int additionalDays = 7)
    {
        if (Status != InvitationStatus.Pending)
            throw new InvalidOperationException("Only pending invitations can be extended");

        ExpiresAt = DateTime.UtcNow.AddDays(additionalDays);
        ResendCount++;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Regenerar el token
    /// </summary>
    public void RegenerateToken()
    {
        if (Status != InvitationStatus.Pending)
            throw new InvalidOperationException("Only pending invitations can have tokens regenerated");

        Token = GenerateToken();
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Verificar si la invitación está expirada
    /// </summary>
    public bool IsExpired => ExpiresAt < DateTime.UtcNow;

    /// <summary>
    /// Verificar si la invitación es válida para aceptar
    /// </summary>
    public bool IsValid => Status == InvitationStatus.Pending && !IsExpired;

    private static string GenerateToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("/", "_")
            .Replace("+", "-")
            .Replace("=", "")[..22];
    }
}
