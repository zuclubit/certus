using System.Text.Json.Serialization;

namespace Certus.Domain.ValueObjects;

/// <summary>
/// Grupo de condiciones con operador lógico
/// </summary>
public class ValidatorConditionGroup
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("operator")]
    public LogicalOperator Operator { get; set; } = LogicalOperator.And;

    [JsonPropertyName("conditions")]
    public List<ValidatorConditionItem> Conditions { get; set; } = new();
}

/// <summary>
/// Item de condición (puede ser condición simple o grupo anidado)
/// </summary>
public class ValidatorConditionItem
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("type")]
    public string Type { get; set; } = "condition"; // "condition" o "group"

    // Para condiciones simples
    [JsonPropertyName("field")]
    public string? Field { get; set; }

    [JsonPropertyName("dataType")]
    public ValidatorDataType DataType { get; set; } = ValidatorDataType.String;

    [JsonPropertyName("operator")]
    public ConditionOperator ConditionOperator { get; set; } = ConditionOperator.Equals;

    [JsonPropertyName("value")]
    public object? Value { get; set; }

    [JsonPropertyName("valueTo")]
    public object? ValueTo { get; set; } // Para operador BETWEEN

    [JsonPropertyName("valueFrom")]
    public string? ValueFrom { get; set; } // Para comparación campo a campo

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    // Para grupos anidados
    [JsonPropertyName("group")]
    public ValidatorConditionGroup? Group { get; set; }

    public static ValidatorConditionItem CreateCondition(
        string field,
        ValidatorDataType dataType,
        ConditionOperator op,
        object? value,
        string? message = null)
    {
        return new ValidatorConditionItem
        {
            Type = "condition",
            Field = field,
            DataType = dataType,
            ConditionOperator = op,
            Value = value,
            Message = message
        };
    }

    public static ValidatorConditionItem CreateGroup(ValidatorConditionGroup group)
    {
        return new ValidatorConditionItem
        {
            Type = "group",
            Group = group
        };
    }
}

/// <summary>
/// Acción a ejecutar cuando la validación falla
/// </summary>
public class ValidatorAction
{
    [JsonPropertyName("type")]
    public ActionType Type { get; set; } = ActionType.Reject;

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    [JsonPropertyName("metadata")]
    public Dictionary<string, object>? Metadata { get; set; }

    public static ValidatorAction Reject(string code, string message)
    {
        return new ValidatorAction
        {
            Type = ActionType.Reject,
            Code = code,
            Message = message
        };
    }

    public static ValidatorAction Warn(string code, string message)
    {
        return new ValidatorAction
        {
            Type = ActionType.Warn,
            Code = code,
            Message = message
        };
    }

    public static ValidatorAction Log(string code, string message)
    {
        return new ValidatorAction
        {
            Type = ActionType.Log,
            Code = code,
            Message = message
        };
    }
}

/// <summary>
/// Operador lógico para grupos de condiciones
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum LogicalOperator
{
    And,
    Or,
    Not
}

/// <summary>
/// Operador de comparación para condiciones
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ConditionOperator
{
    Equals,
    NotEquals,
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Contains,
    NotContains,
    StartsWith,
    EndsWith,
    MatchesRegex,
    InList,
    NotInList,
    IsEmpty,
    IsNotEmpty,
    Between
}

/// <summary>
/// Tipo de dato para validación
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ValidatorDataType
{
    String,
    Number,
    Date,
    Boolean,
    Curp,      // CURP mexicana
    Rfc,       // RFC mexicano
    Nss,       // Número de Seguro Social
    Account,   // Cuenta bancaria
    Currency   // Valor monetario
}

/// <summary>
/// Tipo de acción del validador
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ActionType
{
    Reject,    // Error bloqueante
    Warn,      // Advertencia no bloqueante
    Log,       // Solo registrar
    Custom     // Acción personalizada
}
