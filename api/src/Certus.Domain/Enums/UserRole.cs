namespace Certus.Domain.Enums;

/// <summary>
/// Roles de usuario en el sistema CONSAR
/// </summary>
public enum UserRole
{
    /// <summary>Administrador del sistema - acceso total</summary>
    SystemAdmin = 0,

    /// <summary>Administrador de AFORE - gestión de su tenant</summary>
    AforeAdmin = 1,

    /// <summary>Analista de AFORE - operaciones de validación</summary>
    AforeAnalyst = 2,

    /// <summary>Supervisor - aprobaciones y revisión</summary>
    Supervisor = 3,

    /// <summary>Auditor - solo lectura para cumplimiento</summary>
    Auditor = 4,

    /// <summary>Viewer - solo visualización</summary>
    Viewer = 5
}
