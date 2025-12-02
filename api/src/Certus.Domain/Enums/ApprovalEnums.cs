namespace Certus.Domain.Enums;

/// <summary>
/// Nivel de aprobación en el flujo de trabajo
/// </summary>
public enum ApprovalLevel
{
    Auto = 0,       // Validación automática del sistema
    Analyst = 1,    // Analista - primer nivel
    Supervisor = 2, // Supervisor - segundo nivel
    Manager = 3,    // Gerente - tercer nivel
    Director = 4    // Director - nivel ejecutivo
}

/// <summary>
/// Estado del flujo de aprobación
/// </summary>
public enum ApprovalStatus
{
    Pending,         // Pendiente de revisión
    InReview,        // En revisión
    Approved,        // Aprobado
    Rejected,        // Rechazado
    Cancelled,       // Cancelado
    Escalated,       // Escalado a nivel superior
    OnHold,          // En espera de información
    MoreInfoRequired // Se requiere más información
}

/// <summary>
/// Estado del SLA
/// </summary>
public enum SlaStatus
{
    OnTime,   // Dentro del tiempo (verde)
    AtRisk,   // En riesgo - 75%+ del tiempo (amarillo)
    Critical, // Crítico - 90%+ del tiempo (naranja)
    Breached  // Vencido - 100%+ del tiempo (rojo)
}

/// <summary>
/// Tipo de acción de aprobación
/// </summary>
public enum ApprovalActionType
{
    Submit,       // Enviar para aprobación
    Approve,      // Aprobar
    Reject,       // Rechazar
    RequestInfo,  // Solicitar información
    ProvideInfo,  // Proporcionar información
    Escalate,     // Escalar
    Reassign,     // Reasignar
    Cancel,       // Cancelar
    Comment       // Agregar comentario
}

/// <summary>
/// Prioridad del flujo de aprobación
/// </summary>
public enum ApprovalPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}

/// <summary>
/// Estado de un workflow de aprobación
/// </summary>
public enum WorkflowStatus
{
    Draft = 0,      // Borrador - en configuración
    Active = 1,     // Activo - disponible para uso
    Inactive = 2,   // Inactivo - pausado temporalmente
    Archived = 3    // Archivado - ya no se usa
}

/// <summary>
/// Comportamiento del workflow cuando se rechaza
/// </summary>
public enum WorkflowRejectionBehavior
{
    EndWorkflow = 0,        // Terminar el workflow completamente
    ReturnToPrevious = 1,   // Regresar al paso anterior
    ReturnToStart = 2,      // Regresar al inicio del workflow
    RequireResubmission = 3 // Requerir nueva envío
}

/// <summary>
/// Comportamiento del workflow cuando se agota el tiempo
/// </summary>
public enum WorkflowTimeoutBehavior
{
    None = 0,           // Sin acción
    Escalate = 1,       // Escalar al siguiente nivel
    AutoApprove = 2,    // Aprobar automáticamente
    AutoReject = 3,     // Rechazar automáticamente
    Notify = 4          // Solo notificar
}

/// <summary>
/// Acción a realizar en un paso del workflow
/// </summary>
public enum WorkflowStepAction
{
    Approve = 0,        // Requiere aprobación
    Review = 1,         // Solo revisión (sin aprobación formal)
    Notify = 2,         // Solo notificación
    Validate = 3,       // Validación automática
    Sign = 4            // Requiere firma digital
}

/// <summary>
/// Tipo de condición para reglas del workflow
/// </summary>
public enum WorkflowConditionType
{
    ErrorCount = 0,         // Número de errores
    WarningCount = 1,       // Número de advertencias
    FileType = 2,           // Tipo de archivo
    FileSize = 3,           // Tamaño del archivo
    RecordCount = 4,        // Cantidad de registros
    ValidationStatus = 5,   // Estado de validación
    UserRole = 6,           // Rol del usuario
    Amount = 7,             // Monto (si aplica)
    Custom = 99             // Condición personalizada
}

/// <summary>
/// Operador de comparación para condiciones
/// </summary>
public enum WorkflowConditionOperator
{
    Equals = 0,             // Igual a
    NotEquals = 1,          // Diferente de
    GreaterThan = 2,        // Mayor que
    GreaterThanOrEqual = 3, // Mayor o igual que
    LessThan = 4,           // Menor que
    LessThanOrEqual = 5,    // Menor o igual que
    Contains = 6,           // Contiene
    In = 7,                 // En lista
    NotIn = 8,              // No en lista
    StartsWith = 9,         // Comienza con
    EndsWith = 10           // Termina con
}
