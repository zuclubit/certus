namespace Certus.Domain.Enums;

/// <summary>
/// Tipos de organización/tenant
/// </summary>
public enum TenantType
{
    /// <summary>
    /// Administradora de Fondos para el Retiro
    /// </summary>
    Afore = 0,

    /// <summary>
    /// Empresa consultora o de auditoría
    /// </summary>
    Consultant = 1,

    /// <summary>
    /// Regulador (CONSAR, etc.)
    /// </summary>
    Regulator = 2,

    /// <summary>
    /// Proveedor de servicios tecnológicos
    /// </summary>
    Provider = 3,

    /// <summary>
    /// Otro tipo de organización
    /// </summary>
    Other = 99
}
