namespace Certus.Domain.Enums;

/// <summary>
/// Estados posibles de un Tenant (AFORE)
/// </summary>
public enum TenantStatus
{
    /// <summary>
    /// Tenant activo con acceso completo
    /// </summary>
    Active = 0,

    /// <summary>
    /// Tenant inactivo (acceso limitado a solo lectura)
    /// </summary>
    Inactive = 1,

    /// <summary>
    /// Tenant suspendido temporalmente (sin acceso)
    /// </summary>
    Suspended = 2,

    /// <summary>
    /// Suscripción cancelada (preparando para eliminación)
    /// </summary>
    Cancelled = 3,

    /// <summary>
    /// Periodo de prueba
    /// </summary>
    Trial = 4,

    /// <summary>
    /// Pendiente de activación
    /// </summary>
    PendingActivation = 5
}
