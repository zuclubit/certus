using Certus.Domain.Common;
using Certus.Domain.Enums;

namespace Certus.Domain.Entities;

/// <summary>
/// Solicitud de aprobación para validaciones con errores (Flujo CONSAR)
/// </summary>
public class Approval : TenantEntity
{
    public Guid ValidationId { get; private set; }
    public ApprovalLevel Level { get; private set; } = ApprovalLevel.Supervisor;
    public ApprovalStatus Status { get; private set; } = ApprovalStatus.Pending;
    public SlaStatus SlaStatus { get; private set; } = SlaStatus.OnTime;

    // Solicitante
    public Guid RequestedById { get; private set; }
    public string RequestedByName { get; private set; } = string.Empty;
    public DateTime RequestedAt { get; private set; } = DateTime.UtcNow;
    public string? RequestReason { get; private set; }
    public string? RequestNotes { get; private set; }

    // Aprobador asignado
    public Guid? AssignedToId { get; private set; }
    public string? AssignedToName { get; private set; }
    public DateTime? AssignedAt { get; private set; }

    // Resolución
    public Guid? ResolvedById { get; private set; }
    public string? ResolvedByName { get; private set; }
    public DateTime? ResolvedAt { get; private set; }
    public string? ResolutionNotes { get; private set; }
    public string? RejectionReason { get; private set; }

    // SLA tracking
    public DateTime DueDate { get; private set; }
    public int? ResponseTimeMinutes { get; private set; }
    public bool IsOverdue { get; private set; } = false;

    // Escalación
    public bool IsEscalated { get; private set; } = false;
    public DateTime? EscalatedAt { get; private set; }
    public string? EscalationReason { get; private set; }
    public Guid? EscalatedFromId { get; private set; }

    // Metadata
    public int Priority { get; private set; } = 2; // 1=Alta, 2=Media, 3=Baja
    public string? Category { get; private set; }
    public string? Tags { get; private set; } // JSON array
    public string? Metadata { get; private set; } // JSON

    // Navigation
    public virtual Validation Validation { get; private set; } = null!;
    public virtual User RequestedBy { get; private set; } = null!;
    public virtual User? AssignedTo { get; private set; }
    public virtual User? ResolvedBy { get; private set; }
    public virtual Approval? EscalatedFrom { get; private set; }
    public virtual ICollection<ApprovalComment> Comments { get; private set; } = new List<ApprovalComment>();
    public virtual ICollection<ApprovalHistory> History { get; private set; } = new List<ApprovalHistory>();

    private Approval() { } // EF Core

    public static Approval Create(
        Guid validationId,
        Guid requestedById,
        string requestedByName,
        Guid tenantId,
        ApprovalLevel level = ApprovalLevel.Supervisor,
        string? requestReason = null,
        string? requestNotes = null,
        int priority = 2,
        int slaHours = 24)
    {
        return new Approval
        {
            ValidationId = validationId,
            RequestedById = requestedById,
            RequestedByName = requestedByName,
            TenantId = tenantId,
            Level = level,
            RequestReason = requestReason,
            RequestNotes = requestNotes,
            Priority = priority,
            DueDate = DateTime.UtcNow.AddHours(slaHours)
        };
    }

    public void Assign(Guid assignedToId, string assignedToName)
    {
        AssignedToId = assignedToId;
        AssignedToName = assignedToName;
        AssignedAt = DateTime.UtcNow;
        Status = ApprovalStatus.InReview;
        AddHistory("assigned", $"Asignado a {assignedToName}");
    }

    public void Approve(Guid resolvedById, string resolvedByName, string? notes = null)
    {
        ResolvedById = resolvedById;
        ResolvedByName = resolvedByName;
        ResolvedAt = DateTime.UtcNow;
        ResolutionNotes = notes;
        Status = ApprovalStatus.Approved;
        ResponseTimeMinutes = (int)(DateTime.UtcNow - RequestedAt).TotalMinutes;
        AddHistory("approved", $"Aprobado por {resolvedByName}");
    }

    public void Reject(Guid resolvedById, string resolvedByName, string rejectionReason, string? notes = null)
    {
        ResolvedById = resolvedById;
        ResolvedByName = resolvedByName;
        ResolvedAt = DateTime.UtcNow;
        RejectionReason = rejectionReason;
        ResolutionNotes = notes;
        Status = ApprovalStatus.Rejected;
        ResponseTimeMinutes = (int)(DateTime.UtcNow - RequestedAt).TotalMinutes;
        AddHistory("rejected", $"Rechazado por {resolvedByName}: {rejectionReason}");
    }

    public void RequestMoreInfo(Guid resolvedById, string resolvedByName, string infoRequired)
    {
        ResolvedById = resolvedById;
        ResolvedByName = resolvedByName;
        Status = ApprovalStatus.MoreInfoRequired;
        ResolutionNotes = infoRequired;
        AddHistory("more_info_required", $"Información adicional requerida por {resolvedByName}");
    }

    public Approval Escalate(string reason, Guid escalatedById, ApprovalLevel newLevel)
    {
        IsEscalated = true;
        EscalatedAt = DateTime.UtcNow;
        EscalationReason = reason;
        Status = ApprovalStatus.Escalated;
        AddHistory("escalated", $"Escalado a nivel {newLevel}: {reason}");

        // Crear nueva aprobación para el nivel superior
        var escalated = new Approval
        {
            ValidationId = ValidationId,
            RequestedById = RequestedById,
            RequestedByName = RequestedByName,
            TenantId = TenantId,
            Level = newLevel,
            RequestReason = RequestReason,
            RequestNotes = $"Escalado: {reason}",
            Priority = Math.Max(1, Priority - 1), // Aumentar prioridad
            DueDate = DateTime.UtcNow.AddHours(12), // SLA más corto
            EscalatedFromId = Id,
            IsEscalated = false
        };

        return escalated;
    }

    public void Cancel(string reason)
    {
        Status = ApprovalStatus.Cancelled;
        ResolutionNotes = reason;
        ResolvedAt = DateTime.UtcNow;
        AddHistory("cancelled", $"Cancelado: {reason}");
    }

    public void CheckSlaStatus()
    {
        if (Status == ApprovalStatus.Pending || Status == ApprovalStatus.InReview)
        {
            var now = DateTime.UtcNow;
            var timeRemaining = DueDate - now;

            if (timeRemaining.TotalMinutes <= 0)
            {
                SlaStatus = SlaStatus.Breached;
                IsOverdue = true;
            }
            else if (timeRemaining.TotalHours <= 4)
            {
                SlaStatus = SlaStatus.AtRisk;
            }
            else
            {
                SlaStatus = SlaStatus.OnTime;
            }
        }
    }

    public void AddComment(ApprovalComment comment)
    {
        Comments.Add(comment);
    }

    private void AddHistory(string action, string description)
    {
        History.Add(ApprovalHistory.Create(Id, action, description));
    }
}

/// <summary>
/// Comentario en una solicitud de aprobación
/// </summary>
public class ApprovalComment : BaseEntity
{
    public Guid ApprovalId { get; private set; }
    public Guid UserId { get; private set; }
    public string UserName { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public bool IsInternal { get; private set; } = false;
    public string? Attachments { get; private set; } // JSON array
    public DateTime Timestamp { get; private set; } = DateTime.UtcNow;

    public virtual Approval Approval { get; private set; } = null!;

    private ApprovalComment() { } // EF Core

    public static ApprovalComment Create(
        Guid approvalId,
        Guid userId,
        string userName,
        string content,
        bool isInternal = false,
        string? attachments = null)
    {
        return new ApprovalComment
        {
            ApprovalId = approvalId,
            UserId = userId,
            UserName = userName,
            Content = content,
            IsInternal = isInternal,
            Attachments = attachments
        };
    }
}

/// <summary>
/// Historial de cambios de estado de aprobación
/// </summary>
public class ApprovalHistory : BaseEntity
{
    public Guid ApprovalId { get; private set; }
    public string Action { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string? Metadata { get; private set; } // JSON
    public DateTime Timestamp { get; private set; } = DateTime.UtcNow;

    public virtual Approval Approval { get; private set; } = null!;

    private ApprovalHistory() { } // EF Core

    public static ApprovalHistory Create(
        Guid approvalId,
        string action,
        string description,
        string? metadata = null)
    {
        return new ApprovalHistory
        {
            ApprovalId = approvalId,
            Action = action,
            Description = description,
            Metadata = metadata
        };
    }
}
