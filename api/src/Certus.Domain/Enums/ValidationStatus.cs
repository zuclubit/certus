namespace Certus.Domain.Enums;

/// <summary>
/// Estados posibles de una validación CONSAR
/// </summary>
public enum ValidationStatus
{
    /// <summary>Pendiente de procesamiento</summary>
    Pending = 0,

    /// <summary>En proceso de validación</summary>
    Processing = 1,

    /// <summary>Validación exitosa sin errores</summary>
    Success = 2,

    /// <summary>Validación completada con advertencias</summary>
    Warning = 3,

    /// <summary>Validación fallida con errores</summary>
    Error = 4,

    /// <summary>Validación cancelada</summary>
    Cancelled = 5,

    /// <summary>Validación completada (alias para Success)</summary>
    Completed = 2,

    /// <summary>Validación aprobada</summary>
    Approved = 6,

    /// <summary>Validación rechazada</summary>
    Rejected = 7,

    /// <summary>Validación fallida (alias para Error)</summary>
    Failed = 4
}
