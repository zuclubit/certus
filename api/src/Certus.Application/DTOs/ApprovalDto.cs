using Certus.Domain.Enums;

namespace Certus.Application.DTOs;

/// <summary>
/// DTO de flujo de aprobación
/// </summary>
public class ApprovalDto
{
    public Guid Id { get; set; }
    public Guid ValidationId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public string Afore { get; set; } = string.Empty;

    public string Level { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string SlaStatus { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;

    public ApprovalUserDto RequestedBy { get; set; } = null!;
    public DateTime RequestedAt { get; set; }
    public string? RequestReason { get; set; }
    public string? RequestNotes { get; set; }

    public ApprovalUserDto? AssignedTo { get; set; }
    public DateTime? AssignedAt { get; set; }

    public ApprovalUserDto? ResolvedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionNotes { get; set; }
    public string? RejectionReason { get; set; }

    public DateTime DueDate { get; set; }
    public int? ResponseTimeMinutes { get; set; }
    public bool IsOverdue { get; set; }
    public bool IsEscalated { get; set; }

    public ApprovalMetadataDto? Metadata { get; set; }
    public List<ApprovalCommentDto> Comments { get; set; } = new();
    public List<ApprovalHistoryDto> History { get; set; } = new();
}

/// <summary>
/// DTO resumido de aprobación para listas
/// </summary>
public class ApprovalSummaryDto
{
    public Guid Id { get; set; }
    public Guid ValidationId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string SlaStatus { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string RequestedByName { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
    public string? AssignedToName { get; set; }
    public DateTime DueDate { get; set; }
    public bool IsOverdue { get; set; }
}

/// <summary>
/// DTO de usuario para aprobaciones
/// </summary>
public class ApprovalUserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? AvatarUrl { get; set; }
}

/// <summary>
/// DTO de metadata de aprobación
/// </summary>
public class ApprovalMetadataDto
{
    public int TotalRecords { get; set; }
    public int TotalErrors { get; set; }
    public int TotalWarnings { get; set; }
    public int CriticalErrors { get; set; }
    public double ValidationScore { get; set; }
    public string ComplianceStatus { get; set; } = "pending";
    public List<string> Tags { get; set; } = new();
}

/// <summary>
/// DTO de comentario de aprobación
/// </summary>
public class ApprovalCommentDto
{
    public Guid Id { get; set; }
    public ApprovalUserDto Author { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// DTO de historial de aprobación
/// </summary>
public class ApprovalHistoryDto
{
    public Guid Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// DTO de estadísticas de aprobaciones
/// </summary>
public class ApprovalStatisticsDto
{
    public int Total { get; set; }
    public int Pending { get; set; }
    public int InReview { get; set; }
    public int Approved { get; set; }
    public int Rejected { get; set; }
    public int Escalated { get; set; }

    public int OnTime { get; set; }
    public int AtRisk { get; set; }
    public int Breached { get; set; }

    public double AverageResponseTimeMinutes { get; set; }
    public double ApprovalRate { get; set; }
    public double SlaComplianceRate { get; set; }

    public Dictionary<string, int> ByLevel { get; set; } = new();
    public Dictionary<string, int> ByDay { get; set; } = new();
}

/// <summary>
/// DTO de configuración de SLA
/// </summary>
public class SlaConfigurationDto
{
    public int Level { get; set; }
    public int MaxDurationMinutes { get; set; }
    public int WarningThresholdPercent { get; set; } = 75;
    public int CriticalThresholdPercent { get; set; } = 90;
    public bool AutoEscalate { get; set; }
    public int? EscalateToLevel { get; set; }
    public bool BusinessHoursOnly { get; set; } = true;
}
