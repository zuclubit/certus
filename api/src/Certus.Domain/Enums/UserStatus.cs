namespace Certus.Domain.Enums;

/// <summary>
/// Estados de usuario
/// </summary>
public enum UserStatus
{
    /// <summary>Usuario activo</summary>
    Active = 0,

    /// <summary>Usuario inactivo</summary>
    Inactive = 1,

    /// <summary>Usuario suspendido por administrador</summary>
    Suspended = 2,

    /// <summary>Invitación pendiente de aceptar</summary>
    Pending = 3
}
