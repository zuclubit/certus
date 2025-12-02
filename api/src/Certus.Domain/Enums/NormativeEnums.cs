namespace Certus.Domain.Enums;

/// <summary>
/// Estado del cambio normativo
/// </summary>
public enum NormativeStatus
{
    /// <summary>Pendiente de aplicar</summary>
    Pending = 0,

    /// <summary>Vigente/Activo</summary>
    Active = 1,

    /// <summary>Archivado/Histórico</summary>
    Archived = 2
}

/// <summary>
/// Prioridad del cambio normativo
/// </summary>
public enum NormativePriority
{
    /// <summary>Baja prioridad</summary>
    Low = 0,

    /// <summary>Prioridad media</summary>
    Medium = 1,

    /// <summary>Alta prioridad</summary>
    High = 2
}
