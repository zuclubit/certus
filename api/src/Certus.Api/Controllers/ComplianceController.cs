using Asp.Versioning;
using Certus.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller for Compliance Portal (GRC) functionality
/// Provides endpoints for frameworks, controls, evidence, risks, audits, and tasks
///
/// Compliance Frameworks supported:
/// - SOC 2 Type II
/// - ISO 27001:2022
/// - NIST CSF 2.0
/// - CIS Controls v8
/// - CONSAR (Mexican pension regulation)
/// - CNBV (Mexican banking regulation)
/// </summary>
[ApiVersion("1.0")]
[Authorize]
public class ComplianceController : BaseController
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<ComplianceController> _logger;

    public ComplianceController(
        IApplicationDbContext context,
        ILogger<ComplianceController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ===== DASHBOARD =====

    /// <summary>
    /// Get compliance dashboard overview
    /// </summary>
    [HttpGet("dashboard")]
    [SwaggerOperation(Summary = "Get compliance dashboard overview")]
    [ProducesResponseType(typeof(ComplianceDashboardDto), StatusCodes.Status200OK)]
    public ActionResult<ComplianceDashboardDto> GetDashboard()
    {
        var dashboard = new ComplianceDashboardDto
        {
            OverallScore = 78,
            ScoreChange = 3,
            FrameworkScores = new List<FrameworkScoreDto>
            {
                new() { Framework = "SOC2", Name = "SOC 2 Type II", Score = 85, PreviousScore = 82, Change = 3, Status = "on_track", ControlsTotal = 120, ControlsImplemented = 102 },
                new() { Framework = "ISO27001", Name = "ISO 27001:2022", Score = 72, PreviousScore = 70, Change = 2, Status = "at_risk", ControlsTotal = 114, ControlsImplemented = 82 },
                new() { Framework = "CONSAR", Name = "CONSAR", Score = 91, PreviousScore = 88, Change = 3, Status = "on_track", ControlsTotal = 45, ControlsImplemented = 41 },
                new() { Framework = "CNBV", Name = "CNBV", Score = 65, PreviousScore = 65, Change = 0, Status = "behind", ControlsTotal = 89, ControlsImplemented = 58 }
            },
            ControlsOverview = new ControlsOverviewDto
            {
                Total = 368,
                Implemented = 283,
                InProgress = 52,
                NotImplemented = 28,
                NotApplicable = 5,
                Failed = 0,
                EffectivenessRate = 89,
                TestingCoverage = 76
            },
            RisksOverview = new RisksOverviewDto
            {
                Total = 24,
                Critical = 2,
                High = 5,
                Medium = 10,
                Low = 7,
                Overdue = 3,
                AvgScore = 42,
                MitigationRate = 68
            },
            TasksOverview = new TasksOverviewDto
            {
                Total = 156,
                Pending = 45,
                InProgress = 32,
                Completed = 72,
                Overdue = 7,
                DueThisWeek = 12,
                CompletionRate = 46
            },
            AuditsOverview = new AuditsOverviewDto
            {
                Planned = 4,
                InProgress = 1,
                Completed = 3,
                OpenFindings = 8,
                CriticalFindings = 1,
                UpcomingAudits = new List<UpcomingAuditDto>
                {
                    new() { Name = "SOC 2 Type II Annual Audit", Date = DateTime.UtcNow.AddDays(45).ToString("o"), Type = "external" },
                    new() { Name = "ISO 27001 Surveillance", Date = DateTime.UtcNow.AddDays(90).ToString("o"), Type = "surveillance" }
                }
            },
            EvidenceOverview = new EvidenceOverviewDto
            {
                Total = 892,
                Approved = 756,
                Pending = 98,
                Expired = 12,
                ExpiringThisMonth = 24,
                CollectionRate = 85
            },
            RecentActivity = GenerateRecentActivity(),
            UpcomingDeadlines = GenerateUpcomingDeadlines(),
            Alerts = GenerateAlerts()
        };

        return Ok(dashboard);
    }

    // ===== FRAMEWORKS =====

    /// <summary>
    /// Get all compliance frameworks
    /// </summary>
    [HttpGet("frameworks")]
    [SwaggerOperation(Summary = "Get all compliance frameworks")]
    [ProducesResponseType(typeof(IEnumerable<FrameworkDto>), StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<FrameworkDto>> GetFrameworks()
    {
        var frameworks = new List<FrameworkDto>
        {
            new()
            {
                Id = Guid.NewGuid().ToString(),
                Code = "SOC2",
                Name = "SOC 2 Type II",
                Version = "2023",
                Description = "Service Organization Control 2 - Security, Availability, Processing Integrity, Confidentiality, Privacy",
                IsActive = true,
                TotalControls = 120,
                ImplementedControls = 102,
                InProgressControls = 12,
                NotImplementedControls = 4,
                NotApplicableControls = 2,
                ComplianceScore = 85
            },
            new()
            {
                Id = Guid.NewGuid().ToString(),
                Code = "ISO27001",
                Name = "ISO 27001:2022",
                Version = "2022",
                Description = "Information Security Management System - International standard for managing information security",
                IsActive = true,
                TotalControls = 114,
                ImplementedControls = 82,
                InProgressControls = 18,
                NotImplementedControls = 12,
                NotApplicableControls = 2,
                ComplianceScore = 72
            },
            new()
            {
                Id = Guid.NewGuid().ToString(),
                Code = "CONSAR",
                Name = "CONSAR",
                Version = "2024",
                Description = "Comisión Nacional del Sistema de Ahorro para el Retiro - Mexican pension regulatory framework",
                IsActive = true,
                TotalControls = 45,
                ImplementedControls = 41,
                InProgressControls = 3,
                NotImplementedControls = 1,
                NotApplicableControls = 0,
                ComplianceScore = 91
            },
            new()
            {
                Id = Guid.NewGuid().ToString(),
                Code = "CNBV",
                Name = "CNBV",
                Version = "2024",
                Description = "Comisión Nacional Bancaria y de Valores - Mexican banking and securities regulatory framework",
                IsActive = true,
                TotalControls = 89,
                ImplementedControls = 58,
                InProgressControls = 19,
                NotImplementedControls = 11,
                NotApplicableControls = 1,
                ComplianceScore = 65
            }
        };

        return Ok(frameworks);
    }

    /// <summary>
    /// Get framework by ID
    /// </summary>
    [HttpGet("frameworks/{id}")]
    [SwaggerOperation(Summary = "Get framework by ID")]
    [ProducesResponseType(typeof(FrameworkDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<FrameworkDto> GetFrameworkById(string id)
    {
        // Return sample framework
        var framework = new FrameworkDto
        {
            Id = id,
            Code = "SOC2",
            Name = "SOC 2 Type II",
            Version = "2023",
            Description = "Service Organization Control 2",
            IsActive = true,
            TotalControls = 120,
            ImplementedControls = 102,
            ComplianceScore = 85
        };

        return Ok(framework);
    }

    /// <summary>
    /// Get framework by code
    /// </summary>
    [HttpGet("frameworks/code/{code}")]
    [SwaggerOperation(Summary = "Get framework by code")]
    [ProducesResponseType(typeof(FrameworkDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<FrameworkDto> GetFrameworkByCode(string code)
    {
        return GetFrameworkById(Guid.NewGuid().ToString());
    }

    // ===== CONTROLS =====

    /// <summary>
    /// Get all controls with pagination
    /// </summary>
    [HttpGet("controls")]
    [SwaggerOperation(Summary = "Get all controls")]
    [ProducesResponseType(typeof(PaginatedResponse<ControlDto>), StatusCodes.Status200OK)]
    public ActionResult<PaginatedResponse<ControlDto>> GetControls(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? frameworkId = null,
        [FromQuery] string? status = null)
    {
        var controls = GenerateSampleControls(pageSize);
        var response = new PaginatedResponse<ControlDto>
        {
            Success = true,
            Data = controls,
            Total = 368,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(368.0 / pageSize)
        };

        return Ok(response);
    }

    /// <summary>
    /// Get control by ID
    /// </summary>
    [HttpGet("controls/{id}")]
    [SwaggerOperation(Summary = "Get control by ID")]
    [ProducesResponseType(typeof(ControlDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<ControlDto> GetControlById(string id)
    {
        var control = GenerateSampleControls(1).First();
        control.Id = id;
        return Ok(control);
    }

    /// <summary>
    /// Get controls by framework
    /// </summary>
    [HttpGet("frameworks/{frameworkId}/controls")]
    [SwaggerOperation(Summary = "Get controls by framework")]
    [ProducesResponseType(typeof(IEnumerable<ControlDto>), StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<ControlDto>> GetControlsByFramework(string frameworkId)
    {
        return Ok(GenerateSampleControls(20));
    }

    /// <summary>
    /// Update control status
    /// </summary>
    [HttpPatch("controls/{id}/status")]
    [SwaggerOperation(Summary = "Update control status")]
    [ProducesResponseType(typeof(ControlDto), StatusCodes.Status200OK)]
    public ActionResult<ControlDto> UpdateControlStatus(string id, [FromBody] UpdateStatusRequest request)
    {
        var control = GenerateSampleControls(1).First();
        control.Id = id;
        control.Status = request.Status;
        return Ok(control);
    }

    // ===== EVIDENCE =====

    /// <summary>
    /// Get all evidence with pagination
    /// </summary>
    [HttpGet("evidence")]
    [SwaggerOperation(Summary = "Get all evidence")]
    [ProducesResponseType(typeof(PaginatedResponse<EvidenceDto>), StatusCodes.Status200OK)]
    public ActionResult<PaginatedResponse<EvidenceDto>> GetEvidence(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var evidence = GenerateSampleEvidence(pageSize);
        var response = new PaginatedResponse<EvidenceDto>
        {
            Success = true,
            Data = evidence,
            Total = 892,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(892.0 / pageSize)
        };

        return Ok(response);
    }

    /// <summary>
    /// Get evidence by ID
    /// </summary>
    [HttpGet("evidence/{id}")]
    [SwaggerOperation(Summary = "Get evidence by ID")]
    [ProducesResponseType(typeof(EvidenceDto), StatusCodes.Status200OK)]
    public ActionResult<EvidenceDto> GetEvidenceById(string id)
    {
        var evidence = GenerateSampleEvidence(1).First();
        evidence.Id = id;
        return Ok(evidence);
    }

    /// <summary>
    /// Get evidence by control
    /// </summary>
    [HttpGet("controls/{controlId}/evidence")]
    [SwaggerOperation(Summary = "Get evidence by control")]
    [ProducesResponseType(typeof(IEnumerable<EvidenceDto>), StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<EvidenceDto>> GetEvidenceByControl(string controlId)
    {
        return Ok(GenerateSampleEvidence(5));
    }

    /// <summary>
    /// Upload evidence
    /// </summary>
    [HttpPost("evidence")]
    [SwaggerOperation(Summary = "Upload evidence")]
    [ProducesResponseType(typeof(EvidenceDto), StatusCodes.Status201Created)]
    public ActionResult<EvidenceDto> UploadEvidence([FromForm] IFormFile file)
    {
        var evidence = GenerateSampleEvidence(1).First();
        return CreatedAtAction(nameof(GetEvidenceById), new { id = evidence.Id }, evidence);
    }

    /// <summary>
    /// Update evidence status
    /// </summary>
    [HttpPatch("evidence/{id}/status")]
    [SwaggerOperation(Summary = "Update evidence status")]
    [ProducesResponseType(typeof(EvidenceDto), StatusCodes.Status200OK)]
    public ActionResult<EvidenceDto> UpdateEvidenceStatus(string id, [FromBody] UpdateStatusRequest request)
    {
        var evidence = GenerateSampleEvidence(1).First();
        evidence.Id = id;
        evidence.Status = request.Status;
        return Ok(evidence);
    }

    /// <summary>
    /// Delete evidence
    /// </summary>
    [HttpDelete("evidence/{id}")]
    [SwaggerOperation(Summary = "Delete evidence")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public IActionResult DeleteEvidence(string id)
    {
        return NoContent();
    }

    // ===== RISKS =====

    /// <summary>
    /// Get all risks with pagination
    /// </summary>
    [HttpGet("risks")]
    [SwaggerOperation(Summary = "Get all risks")]
    [ProducesResponseType(typeof(PaginatedResponse<RiskDto>), StatusCodes.Status200OK)]
    public ActionResult<PaginatedResponse<RiskDto>> GetRisks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var risks = GenerateSampleRisks(pageSize);
        var response = new PaginatedResponse<RiskDto>
        {
            Success = true,
            Data = risks,
            Total = 24,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(24.0 / pageSize)
        };

        return Ok(response);
    }

    /// <summary>
    /// Get risk by ID
    /// </summary>
    [HttpGet("risks/{id}")]
    [SwaggerOperation(Summary = "Get risk by ID")]
    [ProducesResponseType(typeof(RiskDto), StatusCodes.Status200OK)]
    public ActionResult<RiskDto> GetRiskById(string id)
    {
        var risk = GenerateSampleRisks(1).First();
        risk.Id = id;
        return Ok(risk);
    }

    /// <summary>
    /// Create risk
    /// </summary>
    [HttpPost("risks")]
    [SwaggerOperation(Summary = "Create risk")]
    [ProducesResponseType(typeof(RiskDto), StatusCodes.Status201Created)]
    public ActionResult<RiskDto> CreateRisk([FromBody] CreateRiskRequest request)
    {
        var risk = GenerateSampleRisks(1).First();
        return CreatedAtAction(nameof(GetRiskById), new { id = risk.Id }, risk);
    }

    /// <summary>
    /// Update risk
    /// </summary>
    [HttpPut("risks/{id}")]
    [SwaggerOperation(Summary = "Update risk")]
    [ProducesResponseType(typeof(RiskDto), StatusCodes.Status200OK)]
    public ActionResult<RiskDto> UpdateRisk(string id, [FromBody] CreateRiskRequest request)
    {
        var risk = GenerateSampleRisks(1).First();
        risk.Id = id;
        return Ok(risk);
    }

    /// <summary>
    /// Update risk status
    /// </summary>
    [HttpPatch("risks/{id}/status")]
    [SwaggerOperation(Summary = "Update risk status")]
    [ProducesResponseType(typeof(RiskDto), StatusCodes.Status200OK)]
    public ActionResult<RiskDto> UpdateRiskStatus(string id, [FromBody] UpdateStatusRequest request)
    {
        var risk = GenerateSampleRisks(1).First();
        risk.Id = id;
        risk.Status = request.Status;
        return Ok(risk);
    }

    /// <summary>
    /// Get risk metrics
    /// </summary>
    [HttpGet("risks/metrics")]
    [SwaggerOperation(Summary = "Get risk metrics")]
    [ProducesResponseType(typeof(RiskMetricsDto), StatusCodes.Status200OK)]
    public ActionResult<RiskMetricsDto> GetRiskMetrics()
    {
        var metrics = new RiskMetricsDto
        {
            Total = 24,
            BySeverity = new Dictionary<string, int>
            {
                { "critical", 2 },
                { "high", 5 },
                { "medium", 10 },
                { "low", 7 }
            },
            ByStatus = new Dictionary<string, int>
            {
                { "identified", 4 },
                { "assessed", 3 },
                { "mitigating", 8 },
                { "mitigated", 6 },
                { "accepted", 2 },
                { "closed", 1 }
            },
            OverdueCount = 3,
            AvgMitigationProgress = 68
        };

        return Ok(metrics);
    }

    // ===== AUDITS =====

    /// <summary>
    /// Get all audits with pagination
    /// </summary>
    [HttpGet("audits")]
    [SwaggerOperation(Summary = "Get all audits")]
    [ProducesResponseType(typeof(PaginatedResponse<AuditDto>), StatusCodes.Status200OK)]
    public ActionResult<PaginatedResponse<AuditDto>> GetAudits(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var audits = GenerateSampleAudits(pageSize);
        var response = new PaginatedResponse<AuditDto>
        {
            Success = true,
            Data = audits,
            Total = 8,
            Page = page,
            PageSize = pageSize,
            TotalPages = 1
        };

        return Ok(response);
    }

    /// <summary>
    /// Get audit by ID
    /// </summary>
    [HttpGet("audits/{id}")]
    [SwaggerOperation(Summary = "Get audit by ID")]
    [ProducesResponseType(typeof(AuditDto), StatusCodes.Status200OK)]
    public ActionResult<AuditDto> GetAuditById(string id)
    {
        var audit = GenerateSampleAudits(1).First();
        audit.Id = id;
        return Ok(audit);
    }

    /// <summary>
    /// Create audit
    /// </summary>
    [HttpPost("audits")]
    [SwaggerOperation(Summary = "Create audit")]
    [ProducesResponseType(typeof(AuditDto), StatusCodes.Status201Created)]
    public ActionResult<AuditDto> CreateAudit([FromBody] CreateAuditRequest request)
    {
        var audit = GenerateSampleAudits(1).First();
        return CreatedAtAction(nameof(GetAuditById), new { id = audit.Id }, audit);
    }

    /// <summary>
    /// Get audit findings
    /// </summary>
    [HttpGet("audits/{auditId}/findings")]
    [SwaggerOperation(Summary = "Get audit findings")]
    [ProducesResponseType(typeof(IEnumerable<AuditFindingDto>), StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<AuditFindingDto>> GetAuditFindings(string auditId)
    {
        return Ok(GenerateSampleFindings(5));
    }

    // ===== TASKS =====

    /// <summary>
    /// Get all tasks with pagination
    /// </summary>
    [HttpGet("tasks")]
    [SwaggerOperation(Summary = "Get all tasks")]
    [ProducesResponseType(typeof(PaginatedResponse<ComplianceTaskDto>), StatusCodes.Status200OK)]
    public ActionResult<PaginatedResponse<ComplianceTaskDto>> GetTasks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var tasks = GenerateSampleTasks(pageSize);
        var response = new PaginatedResponse<ComplianceTaskDto>
        {
            Success = true,
            Data = tasks,
            Total = 156,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(156.0 / pageSize)
        };

        return Ok(response);
    }

    /// <summary>
    /// Get task by ID
    /// </summary>
    [HttpGet("tasks/{id}")]
    [SwaggerOperation(Summary = "Get task by ID")]
    [ProducesResponseType(typeof(ComplianceTaskDto), StatusCodes.Status200OK)]
    public ActionResult<ComplianceTaskDto> GetTaskById(string id)
    {
        var task = GenerateSampleTasks(1).First();
        task.Id = id;
        return Ok(task);
    }

    /// <summary>
    /// Create task
    /// </summary>
    [HttpPost("tasks")]
    [SwaggerOperation(Summary = "Create task")]
    [ProducesResponseType(typeof(ComplianceTaskDto), StatusCodes.Status201Created)]
    public ActionResult<ComplianceTaskDto> CreateTask([FromBody] CreateTaskRequest request)
    {
        var task = GenerateSampleTasks(1).First();
        return CreatedAtAction(nameof(GetTaskById), new { id = task.Id }, task);
    }

    /// <summary>
    /// Update task status
    /// </summary>
    [HttpPatch("tasks/{id}/status")]
    [SwaggerOperation(Summary = "Update task status")]
    [ProducesResponseType(typeof(ComplianceTaskDto), StatusCodes.Status200OK)]
    public ActionResult<ComplianceTaskDto> UpdateTaskStatus(string id, [FromBody] UpdateStatusRequest request)
    {
        var task = GenerateSampleTasks(1).First();
        task.Id = id;
        task.Status = request.Status;
        return Ok(task);
    }

    /// <summary>
    /// Update task checklist item
    /// </summary>
    [HttpPatch("tasks/{id}/checklist/{checklistItemId}")]
    [SwaggerOperation(Summary = "Update task checklist item")]
    [ProducesResponseType(typeof(ComplianceTaskDto), StatusCodes.Status200OK)]
    public ActionResult<ComplianceTaskDto> UpdateTaskChecklist(string id, string checklistItemId, [FromBody] UpdateChecklistRequest request)
    {
        var task = GenerateSampleTasks(1).First();
        task.Id = id;
        return Ok(task);
    }

    /// <summary>
    /// Get task metrics
    /// </summary>
    [HttpGet("tasks/metrics")]
    [SwaggerOperation(Summary = "Get task metrics")]
    [ProducesResponseType(typeof(TaskMetricsDto), StatusCodes.Status200OK)]
    public ActionResult<TaskMetricsDto> GetTaskMetrics()
    {
        var metrics = new TaskMetricsDto
        {
            Total = 156,
            Pending = 45,
            InProgress = 32,
            Completed = 72,
            Overdue = 7,
            CompletionRate = 46,
            AvgCompletionTime = 5.2
        };

        return Ok(metrics);
    }

    // ===== POLICIES =====

    /// <summary>
    /// Get all policies
    /// </summary>
    [HttpGet("policies")]
    [SwaggerOperation(Summary = "Get all policies")]
    [ProducesResponseType(typeof(IEnumerable<PolicyDto>), StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<PolicyDto>> GetPolicies()
    {
        return Ok(GenerateSamplePolicies());
    }

    /// <summary>
    /// Get policy by ID
    /// </summary>
    [HttpGet("policies/{id}")]
    [SwaggerOperation(Summary = "Get policy by ID")]
    [ProducesResponseType(typeof(PolicyDto), StatusCodes.Status200OK)]
    public ActionResult<PolicyDto> GetPolicyById(string id)
    {
        var policy = GenerateSamplePolicies().First();
        policy.Id = id;
        return Ok(policy);
    }

    // ===== HELPER METHODS =====

    private static List<ComplianceActivityDto> GenerateRecentActivity()
    {
        return new List<ComplianceActivityDto>
        {
            new() { Id = Guid.NewGuid().ToString(), Type = "evidence", Action = "uploaded", Description = "Uploaded access control policy document", User = "Carlos García", Timestamp = DateTime.UtcNow.AddHours(-2).ToString("o") },
            new() { Id = Guid.NewGuid().ToString(), Type = "control", Action = "status_changed", Description = "Control CC-2.1 marked as implemented", User = "María López", Timestamp = DateTime.UtcNow.AddHours(-4).ToString("o") },
            new() { Id = Guid.NewGuid().ToString(), Type = "risk", Action = "created", Description = "New risk identified: Third-party vendor security", User = "Juan Pérez", Timestamp = DateTime.UtcNow.AddHours(-6).ToString("o") },
            new() { Id = Guid.NewGuid().ToString(), Type = "task", Action = "completed", Description = "Completed quarterly access review", User = "Ana Martínez", Timestamp = DateTime.UtcNow.AddDays(-1).ToString("o") },
            new() { Id = Guid.NewGuid().ToString(), Type = "audit", Action = "finding_closed", Description = "Closed finding: Missing MFA implementation", User = "Pedro Sánchez", Timestamp = DateTime.UtcNow.AddDays(-2).ToString("o") }
        };
    }

    private static List<UpcomingDeadlineDto> GenerateUpcomingDeadlines()
    {
        return new List<UpcomingDeadlineDto>
        {
            new() { Id = Guid.NewGuid().ToString(), Type = "task", Title = "Complete SOC 2 evidence collection", DueDate = DateTime.UtcNow.AddDays(3).ToString("o"), DaysUntilDue = 3, Priority = "high", AssignedTo = "Carlos García" },
            new() { Id = Guid.NewGuid().ToString(), Type = "evidence", Title = "Upload Q4 penetration test report", DueDate = DateTime.UtcNow.AddDays(5).ToString("o"), DaysUntilDue = 5, Priority = "critical", AssignedTo = "María López" },
            new() { Id = Guid.NewGuid().ToString(), Type = "risk_review", Title = "Monthly risk assessment review", DueDate = DateTime.UtcNow.AddDays(7).ToString("o"), DaysUntilDue = 7, Priority = "medium", AssignedTo = "Juan Pérez" },
            new() { Id = Guid.NewGuid().ToString(), Type = "audit", Title = "SOC 2 audit preparation meeting", DueDate = DateTime.UtcNow.AddDays(14).ToString("o"), DaysUntilDue = 14, Priority = "high", AssignedTo = "Ana Martínez" },
            new() { Id = Guid.NewGuid().ToString(), Type = "policy_review", Title = "Annual information security policy review", DueDate = DateTime.UtcNow.AddDays(30).ToString("o"), DaysUntilDue = 30, Priority = "medium", AssignedTo = "Pedro Sánchez" }
        };
    }

    private static List<ComplianceAlertDto> GenerateAlerts()
    {
        return new List<ComplianceAlertDto>
        {
            new() { Id = Guid.NewGuid().ToString(), Type = "warning", Title = "Evidence expiring soon", Message = "24 evidence documents will expire within 30 days. Review and update as needed.", Link = "/compliance/evidence?expiring=true", Dismissible = true, CreatedAt = DateTime.UtcNow.AddDays(-1).ToString("o") },
            new() { Id = Guid.NewGuid().ToString(), Type = "error", Title = "Overdue tasks", Message = "7 compliance tasks are overdue. Immediate attention required.", Link = "/compliance/tasks?overdue=true", Dismissible = false, CreatedAt = DateTime.UtcNow.AddDays(-2).ToString("o") }
        };
    }

    private static List<ControlDto> GenerateSampleControls(int count)
    {
        var controls = new List<ControlDto>();
        var statuses = new[] { "implemented", "in_progress", "not_implemented" };
        var frameworks = new[] { "SOC2", "ISO27001", "CONSAR", "CNBV" };

        for (int i = 0; i < count; i++)
        {
            controls.Add(new ControlDto
            {
                Id = Guid.NewGuid().ToString(),
                Code = $"CC-{i + 1}.{(i % 5) + 1}",
                Name = $"Control {i + 1}",
                Description = "Description of the control and its requirements",
                Objective = "Ensure compliance with regulatory requirements",
                FrameworkId = Guid.NewGuid().ToString(),
                FrameworkCode = frameworks[i % frameworks.Length],
                Status = statuses[i % statuses.Length],
                Effectiveness = i % 3 == 0 ? "effective" : "partially_effective",
                Owner = new ControlOwnerDto { Id = Guid.NewGuid().ToString(), Name = "John Doe", Email = "john@certus.mx", Department = "IT Security" },
                EvidenceCount = i + 3,
                RiskCount = i % 3,
                Tags = new List<string> { "security", "access-control" },
                CreatedAt = DateTime.UtcNow.AddDays(-30).ToString("o"),
                UpdatedAt = DateTime.UtcNow.ToString("o")
            });
        }

        return controls;
    }

    private static List<EvidenceDto> GenerateSampleEvidence(int count)
    {
        var evidence = new List<EvidenceDto>();
        var statuses = new[] { "approved", "pending", "under_review" };
        var types = new[] { "document", "screenshot", "log", "policy" };

        for (int i = 0; i < count; i++)
        {
            evidence.Add(new EvidenceDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = $"Evidence Document {i + 1}",
                Description = "Evidence description and details",
                Type = types[i % types.Length],
                Status = statuses[i % statuses.Length],
                FileName = $"evidence_{i + 1}.pdf",
                FileSize = 1024 * (i + 1),
                MimeType = "application/pdf",
                UploadedBy = "John Doe",
                UploadedAt = DateTime.UtcNow.AddDays(-i).ToString("o"),
                ValidFrom = DateTime.UtcNow.AddDays(-30).ToString("o"),
                ValidUntil = DateTime.UtcNow.AddDays(335).ToString("o"),
                IsExpired = false,
                ExpiresInDays = 335
            });
        }

        return evidence;
    }

    private static List<RiskDto> GenerateSampleRisks(int count)
    {
        var risks = new List<RiskDto>();
        var severities = new[] { "critical", "high", "medium", "low" };
        var statuses = new[] { "identified", "assessed", "mitigating", "mitigated" };
        var categories = new[] { "security", "operational", "compliance", "financial" };

        for (int i = 0; i < count; i++)
        {
            risks.Add(new RiskDto
            {
                Id = Guid.NewGuid().ToString(),
                Title = $"Risk {i + 1}: Sample risk title",
                Description = "Detailed description of the risk and its potential impact",
                Category = categories[i % categories.Length],
                Status = statuses[i % statuses.Length],
                InherentSeverity = severities[i % severities.Length],
                ResidualSeverity = severities[(i + 1) % severities.Length],
                Likelihood = (i % 5) + 1,
                Impact = (i % 5) + 1,
                InherentScore = ((i % 5) + 1) * ((i % 5) + 1),
                ResidualScore = (i % 5) * (i % 5),
                Owner = "John Doe",
                OwnerEmail = "john@certus.mx",
                Department = "IT Security",
                MitigationProgress = 50 + (i * 10),
                CreatedAt = DateTime.UtcNow.AddDays(-30).ToString("o"),
                UpdatedAt = DateTime.UtcNow.ToString("o")
            });
        }

        return risks;
    }

    private static List<AuditDto> GenerateSampleAudits(int count)
    {
        var audits = new List<AuditDto>();
        var statuses = new[] { "planned", "in_progress", "completed" };
        var types = new[] { "internal", "external", "certification" };

        for (int i = 0; i < count; i++)
        {
            audits.Add(new AuditDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = $"Audit {i + 1}: {types[i % types.Length]} audit",
                Description = "Audit description and scope",
                Type = types[i % types.Length],
                Status = statuses[i % statuses.Length],
                LeadAuditor = "External Auditor",
                PlannedStartDate = DateTime.UtcNow.AddDays(i * 30).ToString("o"),
                PlannedEndDate = DateTime.UtcNow.AddDays((i * 30) + 14).ToString("o"),
                FindingsCount = i * 2,
                CriticalFindings = i % 2,
                MajorFindings = i,
                MinorFindings = i + 1,
                CreatedAt = DateTime.UtcNow.AddDays(-60).ToString("o"),
                UpdatedAt = DateTime.UtcNow.ToString("o")
            });
        }

        return audits;
    }

    private static List<AuditFindingDto> GenerateSampleFindings(int count)
    {
        var findings = new List<AuditFindingDto>();
        var severities = new[] { "critical", "major", "minor", "observation" };
        var statuses = new[] { "open", "in_remediation", "pending_verification", "closed" };

        for (int i = 0; i < count; i++)
        {
            findings.Add(new AuditFindingDto
            {
                Id = Guid.NewGuid().ToString(),
                Title = $"Finding {i + 1}: Sample finding",
                Description = "Description of the audit finding",
                Severity = severities[i % severities.Length],
                Status = statuses[i % statuses.Length],
                Recommendation = "Recommended remediation actions",
                ResponsiblePerson = "John Doe",
                DueDate = DateTime.UtcNow.AddDays(30).ToString("o"),
                CreatedAt = DateTime.UtcNow.AddDays(-14).ToString("o"),
                UpdatedAt = DateTime.UtcNow.ToString("o")
            });
        }

        return findings;
    }

    private static List<ComplianceTaskDto> GenerateSampleTasks(int count)
    {
        var tasks = new List<ComplianceTaskDto>();
        var statuses = new[] { "pending", "in_progress", "completed", "overdue" };
        var priorities = new[] { "critical", "high", "medium", "low" };
        var types = new[] { "evidence_collection", "control_review", "risk_assessment", "audit_prep" };

        for (int i = 0; i < count; i++)
        {
            tasks.Add(new ComplianceTaskDto
            {
                Id = Guid.NewGuid().ToString(),
                Title = $"Task {i + 1}: Sample task",
                Description = "Task description and requirements",
                Type = types[i % types.Length],
                Status = statuses[i % statuses.Length],
                Priority = priorities[i % priorities.Length],
                AssignedTo = "John Doe",
                AssignedToEmail = "john@certus.mx",
                DueDate = DateTime.UtcNow.AddDays(i + 7).ToString("o"),
                CreatedAt = DateTime.UtcNow.AddDays(-7).ToString("o"),
                UpdatedAt = DateTime.UtcNow.ToString("o")
            });
        }

        return tasks;
    }

    private static List<PolicyDto> GenerateSamplePolicies()
    {
        return new List<PolicyDto>
        {
            new() { Id = Guid.NewGuid().ToString(), Code = "POL-001", Title = "Information Security Policy", Category = "Security", Status = "approved", Version = "2.0", Owner = "CISO" },
            new() { Id = Guid.NewGuid().ToString(), Code = "POL-002", Title = "Access Control Policy", Category = "Security", Status = "approved", Version = "1.5", Owner = "IT Director" },
            new() { Id = Guid.NewGuid().ToString(), Code = "POL-003", Title = "Data Protection Policy", Category = "Privacy", Status = "approved", Version = "1.2", Owner = "DPO" },
            new() { Id = Guid.NewGuid().ToString(), Code = "POL-004", Title = "Incident Response Policy", Category = "Security", Status = "pending_approval", Version = "2.0", Owner = "CISO" },
            new() { Id = Guid.NewGuid().ToString(), Code = "POL-005", Title = "Business Continuity Policy", Category = "Operations", Status = "approved", Version = "1.0", Owner = "COO" }
        };
    }
}

// ===== DTOs =====

public record ComplianceDashboardDto
{
    public int OverallScore { get; init; }
    public int ScoreChange { get; init; }
    public List<FrameworkScoreDto> FrameworkScores { get; init; } = new();
    public ControlsOverviewDto ControlsOverview { get; init; } = new();
    public RisksOverviewDto RisksOverview { get; init; } = new();
    public TasksOverviewDto TasksOverview { get; init; } = new();
    public AuditsOverviewDto AuditsOverview { get; init; } = new();
    public EvidenceOverviewDto EvidenceOverview { get; init; } = new();
    public List<ComplianceActivityDto> RecentActivity { get; init; } = new();
    public List<UpcomingDeadlineDto> UpcomingDeadlines { get; init; } = new();
    public List<ComplianceAlertDto> Alerts { get; init; } = new();
}

public record FrameworkScoreDto
{
    public string Framework { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public int Score { get; init; }
    public int PreviousScore { get; init; }
    public int Change { get; init; }
    public string Status { get; init; } = string.Empty;
    public int ControlsTotal { get; init; }
    public int ControlsImplemented { get; init; }
}

public record ControlsOverviewDto
{
    public int Total { get; init; }
    public int Implemented { get; init; }
    public int InProgress { get; init; }
    public int NotImplemented { get; init; }
    public int NotApplicable { get; init; }
    public int Failed { get; init; }
    public int EffectivenessRate { get; init; }
    public int TestingCoverage { get; init; }
}

public record RisksOverviewDto
{
    public int Total { get; init; }
    public int Critical { get; init; }
    public int High { get; init; }
    public int Medium { get; init; }
    public int Low { get; init; }
    public int Overdue { get; init; }
    public int AvgScore { get; init; }
    public int MitigationRate { get; init; }
}

public record TasksOverviewDto
{
    public int Total { get; init; }
    public int Pending { get; init; }
    public int InProgress { get; init; }
    public int Completed { get; init; }
    public int Overdue { get; init; }
    public int DueThisWeek { get; init; }
    public int CompletionRate { get; init; }
}

public record AuditsOverviewDto
{
    public int Planned { get; init; }
    public int InProgress { get; init; }
    public int Completed { get; init; }
    public int OpenFindings { get; init; }
    public int CriticalFindings { get; init; }
    public List<UpcomingAuditDto> UpcomingAudits { get; init; } = new();
}

public record UpcomingAuditDto
{
    public string Name { get; init; } = string.Empty;
    public string Date { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
}

public record EvidenceOverviewDto
{
    public int Total { get; init; }
    public int Approved { get; init; }
    public int Pending { get; init; }
    public int Expired { get; init; }
    public int ExpiringThisMonth { get; init; }
    public int CollectionRate { get; init; }
}

public record ComplianceActivityDto
{
    public string Id { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Action { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string User { get; init; } = string.Empty;
    public string Timestamp { get; init; } = string.Empty;
}

public record UpcomingDeadlineDto
{
    public string Id { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string DueDate { get; init; } = string.Empty;
    public int DaysUntilDue { get; init; }
    public string Priority { get; init; } = string.Empty;
    public string? AssignedTo { get; init; }
}

public record ComplianceAlertDto
{
    public string Id { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? Link { get; init; }
    public bool Dismissible { get; init; }
    public string CreatedAt { get; init; } = string.Empty;
}

public record FrameworkDto
{
    public string Id { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Version { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public int TotalControls { get; init; }
    public int ImplementedControls { get; init; }
    public int InProgressControls { get; init; }
    public int NotImplementedControls { get; init; }
    public int NotApplicableControls { get; init; }
    public int ComplianceScore { get; init; }
}

public record ControlDto
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Objective { get; init; } = string.Empty;
    public string FrameworkId { get; init; } = string.Empty;
    public string FrameworkCode { get; init; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Effectiveness { get; init; } = string.Empty;
    public ControlOwnerDto Owner { get; init; } = new();
    public int EvidenceCount { get; init; }
    public int RiskCount { get; init; }
    public List<string> Tags { get; init; } = new();
    public string CreatedAt { get; init; } = string.Empty;
    public string UpdatedAt { get; init; } = string.Empty;
}

public record ControlOwnerDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Department { get; init; } = string.Empty;
}

public record EvidenceDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public int FileSize { get; init; }
    public string MimeType { get; init; } = string.Empty;
    public string UploadedBy { get; init; } = string.Empty;
    public string UploadedAt { get; init; } = string.Empty;
    public string ValidFrom { get; init; } = string.Empty;
    public string ValidUntil { get; init; } = string.Empty;
    public bool IsExpired { get; init; }
    public int ExpiresInDays { get; init; }
}

public record RiskDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string InherentSeverity { get; init; } = string.Empty;
    public string ResidualSeverity { get; init; } = string.Empty;
    public int Likelihood { get; init; }
    public int Impact { get; init; }
    public int InherentScore { get; init; }
    public int ResidualScore { get; init; }
    public string Owner { get; init; } = string.Empty;
    public string OwnerEmail { get; init; } = string.Empty;
    public string Department { get; init; } = string.Empty;
    public int MitigationProgress { get; init; }
    public string CreatedAt { get; init; } = string.Empty;
    public string UpdatedAt { get; init; } = string.Empty;
}

public record RiskMetricsDto
{
    public int Total { get; init; }
    public Dictionary<string, int> BySeverity { get; init; } = new();
    public Dictionary<string, int> ByStatus { get; init; } = new();
    public int OverdueCount { get; init; }
    public double AvgMitigationProgress { get; init; }
}

public record AuditDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string LeadAuditor { get; init; } = string.Empty;
    public string PlannedStartDate { get; init; } = string.Empty;
    public string PlannedEndDate { get; init; } = string.Empty;
    public int FindingsCount { get; init; }
    public int CriticalFindings { get; init; }
    public int MajorFindings { get; init; }
    public int MinorFindings { get; init; }
    public string CreatedAt { get; init; } = string.Empty;
    public string UpdatedAt { get; init; } = string.Empty;
}

public record AuditFindingDto
{
    public string Id { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Severity { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string Recommendation { get; init; } = string.Empty;
    public string ResponsiblePerson { get; init; } = string.Empty;
    public string DueDate { get; init; } = string.Empty;
    public string CreatedAt { get; init; } = string.Empty;
    public string UpdatedAt { get; init; } = string.Empty;
}

public record ComplianceTaskDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public string AssignedTo { get; init; } = string.Empty;
    public string AssignedToEmail { get; init; } = string.Empty;
    public string DueDate { get; init; } = string.Empty;
    public string CreatedAt { get; init; } = string.Empty;
    public string UpdatedAt { get; init; } = string.Empty;
}

public record TaskMetricsDto
{
    public int Total { get; init; }
    public int Pending { get; init; }
    public int InProgress { get; init; }
    public int Completed { get; init; }
    public int Overdue { get; init; }
    public int CompletionRate { get; init; }
    public double AvgCompletionTime { get; init; }
}

public record PolicyDto
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string Version { get; init; } = string.Empty;
    public string Owner { get; init; } = string.Empty;
}

public record PaginatedResponse<T>
{
    public bool Success { get; init; }
    public List<T> Data { get; init; } = new();
    public int Total { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
}

public record UpdateStatusRequest
{
    public string Status { get; init; } = string.Empty;
    public string? Notes { get; init; }
}

public record UpdateChecklistRequest
{
    public bool IsCompleted { get; init; }
}

public record CreateRiskRequest
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public int Likelihood { get; init; }
    public int Impact { get; init; }
}

public record CreateAuditRequest
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string PlannedStartDate { get; init; } = string.Empty;
    public string PlannedEndDate { get; init; } = string.Empty;
}

public record CreateTaskRequest
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public string AssignedTo { get; init; } = string.Empty;
    public string DueDate { get; init; } = string.Empty;
}
