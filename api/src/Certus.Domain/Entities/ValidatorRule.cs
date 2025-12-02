using Certus.Domain.Common;
using Certus.Domain.Enums;
using Certus.Domain.ValueObjects;

namespace Certus.Domain.Entities;

/// <summary>
/// Regla de validación configurable para archivos CONSAR
/// </summary>
public class ValidatorRule : AuditableEntity
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public ValidatorType Type { get; private set; }
    public ValidatorCriticality Criticality { get; private set; }
    public ValidatorStatus Status { get; private set; } = ValidatorStatus.Draft;

    // Aplicabilidad
    public string FileTypes { get; private set; } = "[]"; // JSON array
    public string? RecordTypes { get; private set; } // JSON array
    public string? Afores { get; private set; } // JSON array (null = todos)

    // Lógica de validación
    public string ConditionGroup { get; private set; } = "{}"; // JSON ValidatorConditionGroup
    public string Action { get; private set; } = "{}"; // JSON ValidatorAction

    // Metadata
    public string? Category { get; private set; }
    public string? Tags { get; private set; } // JSON array
    public string? RegulatoryReference { get; private set; } // Ej: "CONSAR Circular 19-8, Anexo A"
    public string? Examples { get; private set; } // JSON array de ejemplos

    // Ejecución
    public bool IsEnabled { get; private set; } = true;
    public int RunOrder { get; private set; } = 100;
    public bool StopOnFailure { get; private set; } = false;
    public int Version { get; private set; } = 1;

    // Estadísticas
    public long ExecutionCount { get; private set; } = 0;
    public long PassCount { get; private set; } = 0;
    public long FailCount { get; private set; } = 0;
    public double AverageExecutionMs { get; private set; } = 0;

    private ValidatorRule() { } // EF Core

    public static ValidatorRule Create(
        string code,
        string name,
        string description,
        ValidatorType type,
        ValidatorCriticality criticality,
        List<FileType> fileTypes,
        ValidatorConditionGroup conditionGroup,
        ValidatorAction action,
        string? category = null,
        string? regulatoryReference = null,
        int runOrder = 100)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Code is required", nameof(code));

        return new ValidatorRule
        {
            Code = code.ToUpperInvariant(),
            Name = name,
            Description = description,
            Type = type,
            Criticality = criticality,
            FileTypes = System.Text.Json.JsonSerializer.Serialize(fileTypes.Select(f => f.ToString())),
            ConditionGroup = System.Text.Json.JsonSerializer.Serialize(conditionGroup),
            Action = System.Text.Json.JsonSerializer.Serialize(action),
            Category = category,
            RegulatoryReference = regulatoryReference,
            RunOrder = runOrder,
            Status = ValidatorStatus.Draft
        };
    }

    public void Activate()
    {
        Status = ValidatorStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        Status = ValidatorStatus.Inactive;
        IsEnabled = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetToTesting()
    {
        Status = ValidatorStatus.Testing;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Archive()
    {
        Status = ValidatorStatus.Archived;
        IsEnabled = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateConditions(ValidatorConditionGroup conditionGroup)
    {
        ConditionGroup = System.Text.Json.JsonSerializer.Serialize(conditionGroup);
        Version++;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateAction(ValidatorAction action)
    {
        Action = System.Text.Json.JsonSerializer.Serialize(action);
        Version++;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetFileTypes(List<FileType> fileTypes)
    {
        FileTypes = System.Text.Json.JsonSerializer.Serialize(fileTypes.Select(f => f.ToString()));
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAfores(List<string>? afores)
    {
        Afores = afores != null ? System.Text.Json.JsonSerializer.Serialize(afores) : null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRunOrder(int order)
    {
        RunOrder = order;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetStopOnFailure(bool stop)
    {
        StopOnFailure = stop;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Enable()
    {
        IsEnabled = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Disable()
    {
        IsEnabled = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordExecution(bool passed, double executionMs)
    {
        ExecutionCount++;
        if (passed)
            PassCount++;
        else
            FailCount++;

        // Moving average
        AverageExecutionMs = ((AverageExecutionMs * (ExecutionCount - 1)) + executionMs) / ExecutionCount;
    }

    public ValidatorConditionGroup GetConditionGroup()
    {
        return System.Text.Json.JsonSerializer.Deserialize<ValidatorConditionGroup>(ConditionGroup)
               ?? new ValidatorConditionGroup();
    }

    public ValidatorAction GetAction()
    {
        return System.Text.Json.JsonSerializer.Deserialize<ValidatorAction>(Action)
               ?? new ValidatorAction();
    }

    public List<FileType> GetFileTypes()
    {
        var types = System.Text.Json.JsonSerializer.Deserialize<List<string>>(FileTypes) ?? new();
        return types.Select(t => Enum.Parse<FileType>(t)).ToList();
    }

    public List<string>? GetAfores()
    {
        if (string.IsNullOrEmpty(Afores)) return null;
        return System.Text.Json.JsonSerializer.Deserialize<List<string>>(Afores);
    }
}

/// <summary>
/// Grupo de validadores para organización
/// </summary>
public class ValidatorGroup : AuditableEntity
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? Icon { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsEnabled { get; private set; } = true;

    private ValidatorGroup() { }

    public static ValidatorGroup Create(string code, string name, string? description = null, int sortOrder = 0)
    {
        return new ValidatorGroup
        {
            Code = code.ToUpperInvariant(),
            Name = name,
            Description = description,
            SortOrder = sortOrder
        };
    }
}

/// <summary>
/// Preset de validadores para aplicar a archivos
/// </summary>
public class ValidatorPreset : AuditableEntity
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public FileType FileType { get; private set; }
    public bool IsDefault { get; private set; }
    public bool IsEnabled { get; private set; } = true;
    public string ValidatorIds { get; private set; } = "[]"; // JSON array of validator IDs

    private ValidatorPreset() { }

    public static ValidatorPreset Create(
        string code,
        string name,
        FileType fileType,
        List<Guid> validatorIds,
        bool isDefault = false)
    {
        return new ValidatorPreset
        {
            Code = code.ToUpperInvariant(),
            Name = name,
            FileType = fileType,
            ValidatorIds = System.Text.Json.JsonSerializer.Serialize(validatorIds),
            IsDefault = isDefault
        };
    }

    public List<Guid> GetValidatorIds()
    {
        return System.Text.Json.JsonSerializer.Deserialize<List<Guid>>(ValidatorIds) ?? new();
    }

    public void SetValidatorIds(List<Guid> ids)
    {
        ValidatorIds = System.Text.Json.JsonSerializer.Serialize(ids);
        UpdatedAt = DateTime.UtcNow;
    }
}
