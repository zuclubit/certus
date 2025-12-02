namespace Certus.Domain.Enums;

/// <summary>
/// Niveles de severidad para errores de validación
/// </summary>
public enum ErrorSeverity
{
    /// <summary>Información - no afecta la validación</summary>
    Info = 0,

    /// <summary>Advertencia - validación puede continuar</summary>
    Warning = 1,

    /// <summary>Error - requiere corrección</summary>
    Error = 2,

    /// <summary>Crítico - validación fallida, requiere retransmisión</summary>
    Critical = 3
}
