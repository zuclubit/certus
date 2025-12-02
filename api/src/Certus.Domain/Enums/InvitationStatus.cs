namespace Certus.Domain.Enums;

/// <summary>
/// Estados posibles de una invitación de usuario
/// </summary>
public enum InvitationStatus
{
    /// <summary>
    /// Invitación pendiente de aceptar
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Invitación aceptada
    /// </summary>
    Accepted = 1,

    /// <summary>
    /// Invitación expirada
    /// </summary>
    Expired = 2,

    /// <summary>
    /// Invitación cancelada por el administrador
    /// </summary>
    Cancelled = 3
}
