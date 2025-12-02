namespace Certus.Domain.Enums;

/// <summary>
/// Tipo de validador
/// </summary>
public enum ValidatorType
{
    Format,         // Validación de formato (longitud, patrón)
    Range,          // Validación de rango (min/max)
    Reference,      // Validación de referencia cruzada
    Calculation,    // Validación de cálculos
    BusinessRule,   // Regla de negocio personalizada
    Regulatory,     // Regla regulatoria CONSAR
    Custom,         // Validador personalizado
    Structure,      // Validación de estructura de archivo
    Catalog,        // Validación contra catálogos
    Logic,          // Validación de lógica de negocio
    ExternalApi,    // Validación contra APIs externas (GLEIF, OpenFIGI, BANXICO)
    Compliance,     // Validación de cumplimiento regulatorio (límites, concentración)
    CrossFile       // Validación entre archivos relacionados
}

/// <summary>
/// Nivel de criticidad del validador
/// </summary>
public enum ValidatorCriticality
{
    Informational = 0, // Solo información
    Warning = 1,       // Advertencia no bloqueante
    Error = 2,         // Error que bloquea
    Critical = 3       // Error crítico que requiere atención inmediata
}

/// <summary>
/// Estado del validador
/// </summary>
public enum ValidatorStatus
{
    Draft,      // En borrador
    Testing,    // En pruebas
    Active,     // Activo en producción
    Inactive,   // Desactivado temporalmente
    Archived    // Archivado
}

/// <summary>
/// Categoría de validación CONSAR
/// </summary>
public enum ConsarValidatorCategory
{
    Estructura,     // Validaciones de estructura de archivo
    Catalogos,      // Validaciones contra catálogos
    Rangos,         // Validaciones de rangos de valores
    Calculos,       // Validaciones de cálculos
    Cruce,          // Validaciones de cruce de información
    Negocio,        // Reglas de negocio
    Regulatorio     // Validaciones regulatorias específicas
}
