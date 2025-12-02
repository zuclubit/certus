namespace Certus.Domain.Exceptions;

/// <summary>
/// Excepción base del dominio
/// </summary>
public class DomainException : Exception
{
    public string Code { get; }
    public IDictionary<string, object>? Details { get; }

    public DomainException(string message, string code = "DOMAIN_ERROR")
        : base(message)
    {
        Code = code;
    }

    public DomainException(string message, string code, IDictionary<string, object> details)
        : base(message)
    {
        Code = code;
        Details = details;
    }

    public DomainException(string message, Exception innerException, string code = "DOMAIN_ERROR")
        : base(message, innerException)
    {
        Code = code;
    }
}

/// <summary>
/// Entidad no encontrada
/// </summary>
public class EntityNotFoundException : DomainException
{
    public string EntityType { get; }
    public object EntityId { get; }

    public EntityNotFoundException(string entityType, object entityId)
        : base($"{entityType} con ID '{entityId}' no encontrado", "ENTITY_NOT_FOUND")
    {
        EntityType = entityType;
        EntityId = entityId;
    }
}

/// <summary>
/// Entidad duplicada
/// </summary>
public class DuplicateEntityException : DomainException
{
    public string EntityType { get; }
    public string Field { get; }
    public object Value { get; }

    public DuplicateEntityException(string entityType, string field, object value)
        : base($"Ya existe un {entityType} con {field} '{value}'", "DUPLICATE_ENTITY")
    {
        EntityType = entityType;
        Field = field;
        Value = value;
    }
}

/// <summary>
/// Error de validación de negocio
/// </summary>
public class BusinessValidationException : DomainException
{
    public IReadOnlyList<ValidationError> Errors { get; }

    public BusinessValidationException(string message)
        : base(message, "BUSINESS_VALIDATION_ERROR")
    {
        Errors = Array.Empty<ValidationError>();
    }

    public BusinessValidationException(IEnumerable<ValidationError> errors)
        : base("Errores de validación de negocio", "BUSINESS_VALIDATION_ERROR")
    {
        Errors = errors.ToList();
    }

    public BusinessValidationException(string field, string message)
        : base(message, "BUSINESS_VALIDATION_ERROR")
    {
        Errors = new[] { new ValidationError(field, message) };
    }
}

/// <summary>
/// Error de validación individual
/// </summary>
public record ValidationError(string Field, string Message, string? Code = null);

/// <summary>
/// Estado inválido para la operación
/// </summary>
public class InvalidStateException : DomainException
{
    public string CurrentState { get; }
    public string RequiredState { get; }

    public InvalidStateException(string entityType, string currentState, string requiredState)
        : base($"{entityType} está en estado '{currentState}', se requiere '{requiredState}'", "INVALID_STATE")
    {
        CurrentState = currentState;
        RequiredState = requiredState;
    }
}

/// <summary>
/// Operación no permitida
/// </summary>
public class OperationNotAllowedException : DomainException
{
    public string Operation { get; }
    public string? Reason { get; }

    public OperationNotAllowedException(string operation, string? reason = null)
        : base($"Operación '{operation}' no permitida" + (reason != null ? $": {reason}" : ""), "OPERATION_NOT_ALLOWED")
    {
        Operation = operation;
        Reason = reason;
    }
}

/// <summary>
/// Error de acceso multi-tenant
/// </summary>
public class TenantAccessException : DomainException
{
    public Guid RequestedTenantId { get; }
    public Guid UserTenantId { get; }

    public TenantAccessException(Guid requestedTenantId, Guid userTenantId)
        : base("No tiene acceso al tenant solicitado", "TENANT_ACCESS_DENIED")
    {
        RequestedTenantId = requestedTenantId;
        UserTenantId = userTenantId;
    }
}

/// <summary>
/// Error de archivo CONSAR
/// </summary>
public class ConsarFileException : DomainException
{
    public string FileName { get; }
    public int? Line { get; }
    public int? Column { get; }

    public ConsarFileException(string message, string fileName, int? line = null, int? column = null)
        : base(message, "CONSAR_FILE_ERROR")
    {
        FileName = fileName;
        Line = line;
        Column = column;
    }
}

/// <summary>
/// Error de estructura de archivo
/// </summary>
public class FileStructureException : ConsarFileException
{
    public string ExpectedFormat { get; }
    public string? ActualFormat { get; }

    public FileStructureException(string fileName, string expectedFormat, string? actualFormat = null)
        : base($"Estructura de archivo inválida. Se esperaba {expectedFormat}", fileName)
    {
        ExpectedFormat = expectedFormat;
        ActualFormat = actualFormat;
    }
}

/// <summary>
/// Error de límite de SLA excedido
/// </summary>
public class SlaBreachedException : DomainException
{
    public TimeSpan ElapsedTime { get; }
    public TimeSpan AllowedTime { get; }

    public SlaBreachedException(TimeSpan elapsedTime, TimeSpan allowedTime)
        : base($"SLA excedido: {elapsedTime.TotalHours:F1} horas (límite: {allowedTime.TotalHours:F1} horas)", "SLA_BREACHED")
    {
        ElapsedTime = elapsedTime;
        AllowedTime = allowedTime;
    }
}
