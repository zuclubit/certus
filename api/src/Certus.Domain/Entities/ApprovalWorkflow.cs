using Certus.Domain.Common;
using Certus.Domain.Enums;

namespace Certus.Domain.Entities;

/// <summary>
/// Plantilla de flujo de aprobación configurable por tenant
/// Define las reglas, pasos y matriz de aprobación
/// </summary>
public class ApprovalWorkflow : TenantEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public WorkflowStatus Status { get; private set; } = WorkflowStatus.Draft;
    public int Version { get; private set; } = 1;

    // Configuración general
    public int DefaultSlaHours { get; private set; } = 24;
    public int EscalationSlaHours { get; private set; } = 12;
    public bool AllowEscalation { get; private set; } = true;
    public bool AllowParallelApproval { get; private set; } = false;
    public bool RequireCommentsOnReject { get; private set; } = true;
    public bool AutoAssignToRole { get; private set; } = true;

    // Comportamientos
    public WorkflowRejectionBehavior RejectionBehavior { get; private set; } = WorkflowRejectionBehavior.EndWorkflow;
    public WorkflowTimeoutBehavior TimeoutBehavior { get; private set; } = WorkflowTimeoutBehavior.Escalate;

    // Filtros de aplicación (JSON) - qué tipos de validaciones aplican
    public string? FileTypeFilters { get; private set; } // JSON array: ["Nomina", "Contable"]
    public string? TriggerConditions { get; private set; } // JSON: condiciones para activar el workflow

    // Notificaciones (JSON)
    public string? NotificationSettings { get; private set; } // JSON: configuración de notificaciones

    // Metadata
    public string? Tags { get; private set; } // JSON array
    public string? Metadata { get; private set; } // JSON

    // Estadísticas
    public int TotalExecutions { get; private set; } = 0;
    public int SuccessfulExecutions { get; private set; } = 0;
    public double AverageCompletionTimeHours { get; private set; } = 0;

    // Navigation
    public virtual ICollection<ApprovalWorkflowStep> Steps { get; private set; } = new List<ApprovalWorkflowStep>();
    public virtual ICollection<ApprovalWorkflowRule> Rules { get; private set; } = new List<ApprovalWorkflowRule>();
    public virtual ICollection<ApprovalMatrixEntry> MatrixEntries { get; private set; } = new List<ApprovalMatrixEntry>();

    private ApprovalWorkflow() { } // EF Core

    public static ApprovalWorkflow Create(
        string name,
        string code,
        Guid tenantId,
        string? description = null,
        int defaultSlaHours = 24)
    {
        Guard.NotNullOrEmpty(name, nameof(name));
        Guard.NotNullOrEmpty(code, nameof(code));

        return new ApprovalWorkflow
        {
            Name = name,
            Code = code.ToUpperInvariant(),
            Description = description,
            TenantId = tenantId,
            DefaultSlaHours = defaultSlaHours,
            Status = WorkflowStatus.Draft
        };
    }

    public void Update(
        string name,
        string? description,
        int defaultSlaHours,
        int escalationSlaHours,
        bool allowEscalation,
        bool allowParallelApproval,
        bool requireCommentsOnReject,
        WorkflowRejectionBehavior rejectionBehavior,
        WorkflowTimeoutBehavior timeoutBehavior)
    {
        Name = name;
        Description = description;
        DefaultSlaHours = defaultSlaHours;
        EscalationSlaHours = escalationSlaHours;
        AllowEscalation = allowEscalation;
        AllowParallelApproval = allowParallelApproval;
        RequireCommentsOnReject = requireCommentsOnReject;
        RejectionBehavior = rejectionBehavior;
        TimeoutBehavior = timeoutBehavior;
    }

    public void SetFileTypeFilters(IEnumerable<string> fileTypes)
    {
        FileTypeFilters = System.Text.Json.JsonSerializer.Serialize(fileTypes);
    }

    public void SetTriggerConditions(object conditions)
    {
        TriggerConditions = System.Text.Json.JsonSerializer.Serialize(conditions);
    }

    public void SetNotificationSettings(object settings)
    {
        NotificationSettings = System.Text.Json.JsonSerializer.Serialize(settings);
    }

    public void Activate()
    {
        if (Steps.Count == 0)
            throw new InvalidOperationException("No se puede activar un workflow sin pasos definidos");

        if (MatrixEntries.Count == 0)
            throw new InvalidOperationException("No se puede activar un workflow sin matriz de aprobación");

        Status = WorkflowStatus.Active;
    }

    public void Deactivate()
    {
        Status = WorkflowStatus.Inactive;
    }

    public void Archive()
    {
        Status = WorkflowStatus.Archived;
    }

    public ApprovalWorkflow Clone(string newName, string newCode)
    {
        var cloned = Create(newName, newCode, TenantId, Description, DefaultSlaHours);
        cloned.EscalationSlaHours = EscalationSlaHours;
        cloned.AllowEscalation = AllowEscalation;
        cloned.AllowParallelApproval = AllowParallelApproval;
        cloned.RequireCommentsOnReject = RequireCommentsOnReject;
        cloned.RejectionBehavior = RejectionBehavior;
        cloned.TimeoutBehavior = TimeoutBehavior;
        cloned.FileTypeFilters = FileTypeFilters;
        cloned.TriggerConditions = TriggerConditions;
        cloned.NotificationSettings = NotificationSettings;
        return cloned;
    }

    public ApprovalWorkflowStep AddStep(
        int sequence,
        ApprovalLevel level,
        WorkflowStepAction action,
        int timeoutHours,
        string? name = null,
        string? description = null)
    {
        var step = ApprovalWorkflowStep.Create(Id, sequence, level, action, timeoutHours, name, description);
        Steps.Add(step);
        return step;
    }

    public void RemoveStep(Guid stepId)
    {
        var step = Steps.FirstOrDefault(s => s.Id == stepId);
        if (step != null)
            Steps.Remove(step);
    }

    public ApprovalWorkflowRule AddRule(
        WorkflowConditionType conditionType,
        WorkflowConditionOperator conditionOperator,
        string conditionValue,
        int priority = 0,
        string? name = null)
    {
        var rule = ApprovalWorkflowRule.Create(Id, conditionType, conditionOperator, conditionValue, priority, name);
        Rules.Add(rule);
        return rule;
    }

    public ApprovalMatrixEntry AddMatrixEntry(
        ApprovalLevel level,
        UserRole requiredRole,
        int? minApprovers = null,
        bool canEscalate = true)
    {
        var entry = ApprovalMatrixEntry.Create(Id, level, requiredRole, minApprovers, canEscalate);
        MatrixEntries.Add(entry);
        return entry;
    }

    public void RecordExecution(bool successful, double completionTimeHours)
    {
        TotalExecutions++;
        if (successful)
            SuccessfulExecutions++;

        // Calcular promedio móvil
        AverageCompletionTimeHours = ((AverageCompletionTimeHours * (TotalExecutions - 1)) + completionTimeHours) / TotalExecutions;
    }

    public double GetSuccessRate() =>
        TotalExecutions > 0 ? (double)SuccessfulExecutions / TotalExecutions * 100 : 0;

    public ApprovalWorkflowStep? GetStepByLevel(ApprovalLevel level) =>
        Steps.FirstOrDefault(s => s.Level == level && s.IsEnabled);

    public ApprovalWorkflowStep? GetNextStep(int currentSequence) =>
        Steps.Where(s => s.Sequence > currentSequence && s.IsEnabled)
             .OrderBy(s => s.Sequence)
             .FirstOrDefault();

    public IEnumerable<ApprovalMatrixEntry> GetApproversForLevel(ApprovalLevel level) =>
        MatrixEntries.Where(m => m.Level == level && m.IsEnabled);

    public bool CanUserApproveAtLevel(UserRole userRole, ApprovalLevel level) =>
        MatrixEntries.Any(m => m.Level == level && m.RequiredRole == userRole && m.IsEnabled);
}

/// <summary>
/// Paso individual en un workflow de aprobación
/// Define qué nivel aprueba y bajo qué condiciones
/// </summary>
public class ApprovalWorkflowStep : BaseEntity
{
    public Guid WorkflowId { get; private set; }
    public int Sequence { get; private set; }
    public string? Name { get; private set; }
    public string? Description { get; private set; }

    // Configuración del paso
    public ApprovalLevel Level { get; private set; }
    public WorkflowStepAction Action { get; private set; }
    public int TimeoutHours { get; private set; } = 24;

    // Comportamiento
    public bool CanSkip { get; private set; } = false;
    public bool RequiresComment { get; private set; } = false;
    public bool NotifyOnEntry { get; private set; } = true;
    public bool NotifyOnExit { get; private set; } = true;
    public bool IsEnabled { get; private set; } = true;

    // Condiciones para saltar (JSON)
    public string? SkipConditions { get; private set; }

    // Usuarios específicos asignados (JSON array de GUIDs)
    public string? AssignedUserIds { get; private set; }

    // Navigation
    public virtual ApprovalWorkflow Workflow { get; private set; } = null!;

    private ApprovalWorkflowStep() { } // EF Core

    public static ApprovalWorkflowStep Create(
        Guid workflowId,
        int sequence,
        ApprovalLevel level,
        WorkflowStepAction action,
        int timeoutHours = 24,
        string? name = null,
        string? description = null)
    {
        return new ApprovalWorkflowStep
        {
            WorkflowId = workflowId,
            Sequence = sequence,
            Level = level,
            Action = action,
            TimeoutHours = timeoutHours,
            Name = name ?? $"Paso {sequence}: {level}",
            Description = description
        };
    }

    public void Update(
        string? name,
        string? description,
        WorkflowStepAction action,
        int timeoutHours,
        bool canSkip,
        bool requiresComment)
    {
        Name = name;
        Description = description;
        Action = action;
        TimeoutHours = timeoutHours;
        CanSkip = canSkip;
        RequiresComment = requiresComment;
    }

    public void SetSkipConditions(object conditions)
    {
        SkipConditions = System.Text.Json.JsonSerializer.Serialize(conditions);
    }

    public void SetAssignedUsers(IEnumerable<Guid> userIds)
    {
        AssignedUserIds = System.Text.Json.JsonSerializer.Serialize(userIds);
    }

    public void Enable() => IsEnabled = true;
    public void Disable() => IsEnabled = false;
}

/// <summary>
/// Regla de enrutamiento que determina cuándo aplicar un workflow
/// Basado en condiciones de la validación
/// </summary>
public class ApprovalWorkflowRule : BaseEntity
{
    public Guid WorkflowId { get; private set; }
    public string? Name { get; private set; }
    public string? Description { get; private set; }

    // Condición
    public WorkflowConditionType ConditionType { get; private set; }
    public WorkflowConditionOperator Operator { get; private set; }
    public string ConditionValue { get; private set; } = string.Empty;

    // Orden de evaluación (menor = primero)
    public int Priority { get; private set; } = 0;
    public bool IsEnabled { get; private set; } = true;

    // Para condiciones compuestas (AND/OR con otras reglas)
    public string? LogicalGroup { get; private set; }
    public bool UseAndOperator { get; private set; } = true; // true=AND, false=OR

    // Navigation
    public virtual ApprovalWorkflow Workflow { get; private set; } = null!;

    private ApprovalWorkflowRule() { } // EF Core

    public static ApprovalWorkflowRule Create(
        Guid workflowId,
        WorkflowConditionType conditionType,
        WorkflowConditionOperator conditionOperator,
        string conditionValue,
        int priority = 0,
        string? name = null)
    {
        return new ApprovalWorkflowRule
        {
            WorkflowId = workflowId,
            ConditionType = conditionType,
            Operator = conditionOperator,
            ConditionValue = conditionValue,
            Priority = priority,
            Name = name
        };
    }

    public void Update(
        string? name,
        string? description,
        WorkflowConditionType conditionType,
        WorkflowConditionOperator conditionOperator,
        string conditionValue,
        int priority)
    {
        Name = name;
        Description = description;
        ConditionType = conditionType;
        Operator = conditionOperator;
        ConditionValue = conditionValue;
        Priority = priority;
    }

    public void Enable() => IsEnabled = true;
    public void Disable() => IsEnabled = false;

    public bool Evaluate(Validation validation)
    {
        var value = GetValidationValue(validation);
        return EvaluateCondition(value);
    }

    private object? GetValidationValue(Validation validation)
    {
        return ConditionType switch
        {
            WorkflowConditionType.ErrorCount => validation.ErrorCount,
            WorkflowConditionType.WarningCount => validation.WarningCount,
            WorkflowConditionType.FileType => validation.FileType.ToString(),
            WorkflowConditionType.FileSize => validation.FileSize,
            WorkflowConditionType.RecordCount => validation.RecordCount,
            WorkflowConditionType.ValidationStatus => validation.Status.ToString(),
            _ => null
        };
    }

    private bool EvaluateCondition(object? value)
    {
        if (value == null) return false;

        return Operator switch
        {
            WorkflowConditionOperator.Equals => value.ToString() == ConditionValue,
            WorkflowConditionOperator.NotEquals => value.ToString() != ConditionValue,
            WorkflowConditionOperator.GreaterThan => CompareNumeric(value, ConditionValue) > 0,
            WorkflowConditionOperator.GreaterThanOrEqual => CompareNumeric(value, ConditionValue) >= 0,
            WorkflowConditionOperator.LessThan => CompareNumeric(value, ConditionValue) < 0,
            WorkflowConditionOperator.LessThanOrEqual => CompareNumeric(value, ConditionValue) <= 0,
            WorkflowConditionOperator.Contains => value.ToString()?.Contains(ConditionValue) ?? false,
            WorkflowConditionOperator.In => ConditionValue.Split(',').Contains(value.ToString()),
            WorkflowConditionOperator.NotIn => !ConditionValue.Split(',').Contains(value.ToString()),
            _ => false
        };
    }

    private static int CompareNumeric(object value, string target)
    {
        if (double.TryParse(value.ToString(), out var numValue) &&
            double.TryParse(target, out var numTarget))
        {
            return numValue.CompareTo(numTarget);
        }
        return 0;
    }
}

/// <summary>
/// Entrada en la matriz de aprobación
/// Define qué rol puede aprobar en qué nivel
/// </summary>
public class ApprovalMatrixEntry : BaseEntity
{
    public Guid WorkflowId { get; private set; }
    public ApprovalLevel Level { get; private set; }
    public UserRole RequiredRole { get; private set; }

    // Configuración
    public int? MinApprovers { get; private set; } // null = 1 aprobador
    public bool CanEscalate { get; private set; } = true;
    public bool CanDelegate { get; private set; } = false;
    public bool IsEnabled { get; private set; } = true;

    // Límites de autoridad
    public int? MaxErrorCount { get; private set; } // Máximo de errores que puede aprobar
    public decimal? MaxAmount { get; private set; } // Monto máximo (si aplica)

    // Usuarios específicos (opcional, JSON array de GUIDs)
    public string? SpecificUserIds { get; private set; }

    // Sustitutos cuando no está disponible (JSON array de GUIDs)
    public string? DelegateUserIds { get; private set; }

    // Navigation
    public virtual ApprovalWorkflow Workflow { get; private set; } = null!;

    private ApprovalMatrixEntry() { } // EF Core

    public static ApprovalMatrixEntry Create(
        Guid workflowId,
        ApprovalLevel level,
        UserRole requiredRole,
        int? minApprovers = null,
        bool canEscalate = true)
    {
        return new ApprovalMatrixEntry
        {
            WorkflowId = workflowId,
            Level = level,
            RequiredRole = requiredRole,
            MinApprovers = minApprovers,
            CanEscalate = canEscalate
        };
    }

    public void Update(
        UserRole requiredRole,
        int? minApprovers,
        bool canEscalate,
        bool canDelegate,
        int? maxErrorCount)
    {
        RequiredRole = requiredRole;
        MinApprovers = minApprovers;
        CanEscalate = canEscalate;
        CanDelegate = canDelegate;
        MaxErrorCount = maxErrorCount;
    }

    public void SetSpecificUsers(IEnumerable<Guid> userIds)
    {
        SpecificUserIds = System.Text.Json.JsonSerializer.Serialize(userIds);
    }

    public void SetDelegateUsers(IEnumerable<Guid> userIds)
    {
        DelegateUserIds = System.Text.Json.JsonSerializer.Serialize(userIds);
    }

    public void Enable() => IsEnabled = true;
    public void Disable() => IsEnabled = false;

    public IEnumerable<Guid> GetSpecificUsers()
    {
        if (string.IsNullOrEmpty(SpecificUserIds))
            return Enumerable.Empty<Guid>();

        return System.Text.Json.JsonSerializer.Deserialize<IEnumerable<Guid>>(SpecificUserIds)
            ?? Enumerable.Empty<Guid>();
    }

    public IEnumerable<Guid> GetDelegateUsers()
    {
        if (string.IsNullOrEmpty(DelegateUserIds))
            return Enumerable.Empty<Guid>();

        return System.Text.Json.JsonSerializer.Deserialize<IEnumerable<Guid>>(DelegateUserIds)
            ?? Enumerable.Empty<Guid>();
    }
}
