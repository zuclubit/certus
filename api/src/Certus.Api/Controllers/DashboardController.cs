using Asp.Versioning;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller para métricas y estadísticas del dashboard
/// Implementa caching distribuido para alto rendimiento
/// </summary>
[ApiVersion("1.0")]
[Authorize]
public class DashboardController : BaseController
{
    private readonly IApplicationDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly ILogger<DashboardController> _logger;

    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    public DashboardController(
        IApplicationDbContext context,
        IDistributedCache cache,
        ILogger<DashboardController> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Obtener estadísticas generales del dashboard
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(DashboardStatistics), StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardStatistics>> GetStatistics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        var cacheKey = $"dashboard:stats:{CurrentTenantId}:{startDate?.ToString("yyyyMMdd")}:{endDate?.ToString("yyyyMMdd")}";

        // Try cache first
        var cached = await _cache.GetStringAsync(cacheKey, cancellationToken);
        if (!string.IsNullOrEmpty(cached))
        {
            return Ok(JsonSerializer.Deserialize<DashboardStatistics>(cached));
        }

        var start = startDate ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        var validations = await _context.Validations
            .Where(v => v.TenantId == CurrentTenantId.Value)
            .Where(v => v.UploadedAt >= start && v.UploadedAt <= end)
            .ToListAsync(cancellationToken);

        var statistics = new DashboardStatistics
        {
            TotalValidations = validations.Count,
            PendingValidations = validations.Count(v => v.Status == ValidationStatus.Pending),
            ProcessingValidations = validations.Count(v => v.Status == ValidationStatus.Processing),
            CompletedValidations = validations.Count(v => v.Status == ValidationStatus.Completed),
            ApprovedValidations = validations.Count(v => v.Status == ValidationStatus.Approved),
            RejectedValidations = validations.Count(v => v.Status == ValidationStatus.Rejected),
            FailedValidations = validations.Count(v => v.Status == ValidationStatus.Failed),

            TotalRecordsProcessed = validations.Sum(v => v.TotalRecords),
            TotalValidRecords = validations.Sum(v => v.ValidRecords),
            TotalErrors = validations.Sum(v => v.ErrorCount),
            TotalWarnings = validations.Sum(v => v.WarningCount),

            SuccessRate = validations.Count > 0
                ? (double)validations.Count(v => v.Status == ValidationStatus.Approved) / validations.Count * 100
                : 0,

            AverageProcessingTimeMs = validations
                .Where(v => v.ProcessingTimeMs > 0)
                .Select(v => (double)v.ProcessingTimeMs)
                .DefaultIfEmpty(0)
                .Average(),

            ByFileType = validations
                .GroupBy(v => v.FileType.ToString())
                .ToDictionary(
                    g => g.Key,
                    g => new FileTypeStatistics
                    {
                        Total = g.Count(),
                        Approved = g.Count(v => v.Status == ValidationStatus.Approved),
                        WithErrors = g.Count(v => v.ErrorCount > 0),
                        TotalRecords = g.Sum(v => v.TotalRecords),
                        TotalErrors = g.Sum(v => v.ErrorCount)
                    }),

            ByStatus = validations
                .GroupBy(v => v.Status.ToString())
                .ToDictionary(g => g.Key, g => g.Count()),

            TrendData = GetTrendData(validations, start, end),

            Period = new PeriodInfo
            {
                StartDate = start,
                EndDate = end,
                GeneratedAt = DateTime.UtcNow
            }
        };

        // Cache the result
        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(statistics),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = CacheDuration },
            cancellationToken);

        return Ok(statistics);
    }

    /// <summary>
    /// Obtener validaciones recientes
    /// </summary>
    [HttpGet("recent-validations")]
    [ProducesResponseType(typeof(List<RecentValidation>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<RecentValidation>>> GetRecentValidations(
        [FromQuery] int count = 10,
        CancellationToken cancellationToken = default)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        var validations = await _context.Validations
            .Where(v => v.TenantId == CurrentTenantId.Value)
            .OrderByDescending(v => v.UploadedAt)
            .Take(count)
            .Select(v => new RecentValidation
            {
                Id = v.Id,
                FileName = v.FileName,
                FileType = v.FileType.ToString(),
                Status = v.Status.ToString(),
                TotalRecords = v.TotalRecords,
                ErrorCount = v.ErrorCount,
                WarningCount = v.WarningCount,
                UploadedAt = v.UploadedAt,
                UploadedBy = v.UploadedBy != null ? v.UploadedBy.FullName : null
            })
            .ToListAsync(cancellationToken);

        return Ok(validations);
    }

    /// <summary>
    /// Obtener actividad reciente (timeline)
    /// </summary>
    [HttpGet("activity")]
    [ProducesResponseType(typeof(List<ActivityItem>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ActivityItem>>> GetActivity(
        [FromQuery] int count = 20,
        CancellationToken cancellationToken = default)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        // Get recent validations and approvals
        var validations = await _context.Validations
            .Where(v => v.TenantId == CurrentTenantId.Value)
            .OrderByDescending(v => v.UpdatedAt)
            .Take(count)
            .Select(v => new
            {
                v.Id,
                v.FileName,
                v.Status,
                Timestamp = v.UpdatedAt,
                UserName = v.UploadedBy != null ? v.UploadedBy.FullName : "Sistema"
            })
            .ToListAsync(cancellationToken);

        var activity = validations.Select(v => new ActivityItem
        {
            Id = v.Id,
            Type = GetActivityType(v.Status),
            Title = GetActivityTitle(v.Status, v.FileName),
            Description = GetActivityDescription(v.Status),
            User = v.UserName,
            Timestamp = v.Timestamp,
            Icon = GetActivityIcon(v.Status),
            Color = GetActivityColor(v.Status)
        }).ToList();

        return Ok(activity);
    }

    /// <summary>
    /// Obtener alertas activas
    /// </summary>
    [HttpGet("alerts")]
    [ProducesResponseType(typeof(List<DashboardAlert>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<DashboardAlert>>> GetAlerts(CancellationToken cancellationToken = default)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        var alerts = new List<DashboardAlert>();

        // Check for pending validations older than 24 hours
        var oldPending = await _context.Validations
            .Where(v => v.TenantId == CurrentTenantId.Value)
            .Where(v => v.Status == ValidationStatus.Pending)
            .Where(v => v.UploadedAt < DateTime.UtcNow.AddHours(-24))
            .CountAsync(cancellationToken);

        if (oldPending > 0)
        {
            alerts.Add(new DashboardAlert
            {
                Id = Guid.NewGuid(),
                Type = "warning",
                Title = "Validaciones pendientes",
                Message = $"Hay {oldPending} validaciones pendientes de más de 24 horas",
                ActionUrl = "/validations?status=Pending",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Check for failed validations today
        var failedToday = await _context.Validations
            .Where(v => v.TenantId == CurrentTenantId.Value)
            .Where(v => v.Status == ValidationStatus.Failed)
            .Where(v => v.UploadedAt >= DateTime.UtcNow.Date)
            .CountAsync(cancellationToken);

        if (failedToday > 0)
        {
            alerts.Add(new DashboardAlert
            {
                Id = Guid.NewGuid(),
                Type = "error",
                Title = "Validaciones fallidas",
                Message = $"Hay {failedToday} validaciones fallidas hoy",
                ActionUrl = "/validations?status=Failed",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Check for validations pending approval
        var pendingApproval = await _context.Validations
            .Where(v => v.TenantId == CurrentTenantId.Value)
            .Where(v => v.Status == ValidationStatus.Completed)
            .Where(v => v.RequiresAuthorization)
            .CountAsync(cancellationToken);

        if (pendingApproval > 0)
        {
            alerts.Add(new DashboardAlert
            {
                Id = Guid.NewGuid(),
                Type = "info",
                Title = "Pendientes de aprobación",
                Message = $"Hay {pendingApproval} validaciones esperando aprobación",
                ActionUrl = "/approvals",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Check compliance rate
        var last30Days = await _context.Validations
            .Where(v => v.TenantId == CurrentTenantId.Value)
            .Where(v => v.UploadedAt >= DateTime.UtcNow.AddDays(-30))
            .ToListAsync(cancellationToken);

        if (last30Days.Count > 0)
        {
            var complianceRate = (double)last30Days.Count(v => v.Status == ValidationStatus.Approved) / last30Days.Count * 100;
            if (complianceRate < 90)
            {
                alerts.Add(new DashboardAlert
                {
                    Id = Guid.NewGuid(),
                    Type = "warning",
                    Title = "Tasa de cumplimiento baja",
                    Message = $"La tasa de cumplimiento es del {complianceRate:N1}% (objetivo: 90%)",
                    ActionUrl = "/reports/compliance",
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        return Ok(alerts);
    }

    /// <summary>
    /// Obtener métricas de rendimiento del sistema
    /// </summary>
    [HttpGet("performance")]
    [Authorize(Policy = "RequireSupervisor")]
    [ProducesResponseType(typeof(PerformanceMetrics), StatusCodes.Status200OK)]
    public async Task<ActionResult<PerformanceMetrics>> GetPerformance(
        [FromQuery] int days = 7,
        CancellationToken cancellationToken = default)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        var startDate = DateTime.UtcNow.AddDays(-days);

        var validations = await _context.Validations
            .Where(v => v.TenantId == CurrentTenantId.Value)
            .Where(v => v.UploadedAt >= startDate)
            .ToListAsync(cancellationToken);

        var validators = await _context.Set<ValidatorRule>()
            .Where(v => v.ExecutionCount > 0)
            .ToListAsync(cancellationToken);

        var metrics = new PerformanceMetrics
        {
            AverageProcessingTimeMs = validations
                .Where(v => v.ProcessingTimeMs > 0)
                .Select(v => (double)v.ProcessingTimeMs)
                .DefaultIfEmpty(0)
                .Average(),

            MaxProcessingTimeMs = (int)validations
                .Select(v => v.ProcessingTimeMs)
                .DefaultIfEmpty(0)
                .Max(),

            MinProcessingTimeMs = (int)validations
                .Where(v => v.ProcessingTimeMs > 0)
                .Select(v => v.ProcessingTimeMs)
                .DefaultIfEmpty(0)
                .Min(),

            TotalValidationsProcessed = validations.Count,
            TotalRecordsProcessed = validations.Sum(v => v.TotalRecords),

            ValidatorsPerformance = validators
                .OrderBy(v => v.AverageExecutionMs)
                .Take(10)
                .Select(v => new ValidatorPerformance
                {
                    Code = v.Code,
                    Name = v.Name,
                    AverageMs = v.AverageExecutionMs,
                    ExecutionCount = (int)v.ExecutionCount,
                    SuccessRate = v.ExecutionCount > 0 ? (double)v.PassCount / v.ExecutionCount * 100 : 0
                })
                .ToList(),

            SlowestValidators = validators
                .OrderByDescending(v => v.AverageExecutionMs)
                .Take(5)
                .Select(v => new ValidatorPerformance
                {
                    Code = v.Code,
                    Name = v.Name,
                    AverageMs = v.AverageExecutionMs,
                    ExecutionCount = (int)v.ExecutionCount,
                    SuccessRate = v.ExecutionCount > 0 ? (double)v.PassCount / v.ExecutionCount * 100 : 0
                })
                .ToList(),

            ProcessingTimeByFileType = validations
                .Where(v => v.ProcessingTimeMs > 0)
                .GroupBy(v => v.FileType.ToString())
                .ToDictionary(
                    g => g.Key,
                    g => g.Average(v => v.ProcessingTimeMs)),

            Period = new PeriodInfo
            {
                StartDate = startDate,
                EndDate = DateTime.UtcNow,
                GeneratedAt = DateTime.UtcNow
            }
        };

        return Ok(metrics);
    }

    /// <summary>
    /// Obtener datos para gráficas de tendencia
    /// </summary>
    [HttpGet("trends")]
    [ProducesResponseType(typeof(TrendData), StatusCodes.Status200OK)]
    public async Task<ActionResult<TrendData>> GetTrends(
        [FromQuery] int days = 30,
        [FromQuery] string groupBy = "day",
        CancellationToken cancellationToken = default)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        var startDate = DateTime.UtcNow.AddDays(-days);

        var validations = await _context.Validations
            .Where(v => v.TenantId == CurrentTenantId.Value)
            .Where(v => v.UploadedAt >= startDate)
            .OrderBy(v => v.UploadedAt)
            .ToListAsync(cancellationToken);

        var trends = new TrendData
        {
            Labels = new List<string>(),
            Datasets = new Dictionary<string, List<int>>
            {
                ["total"] = new(),
                ["approved"] = new(),
                ["errors"] = new(),
                ["records"] = new()
            }
        };

        var grouped = groupBy.ToLower() switch
        {
            "week" => validations.GroupBy(v => GetWeekStart(v.UploadedAt)),
            "month" => validations.GroupBy(v => new DateTime(v.UploadedAt.Year, v.UploadedAt.Month, 1)),
            _ => validations.GroupBy(v => v.UploadedAt.Date)
        };

        foreach (var group in grouped)
        {
            trends.Labels.Add(group.Key.ToString("dd/MM"));
            trends.Datasets["total"].Add(group.Count());
            trends.Datasets["approved"].Add(group.Count(v => v.Status == ValidationStatus.Approved));
            trends.Datasets["errors"].Add(group.Sum(v => v.ErrorCount));
            trends.Datasets["records"].Add(group.Sum(v => v.TotalRecords));
        }

        return Ok(trends);
    }

    #region Helper Methods

    private List<TrendDataPoint> GetTrendData(List<Validation> validations, DateTime start, DateTime end)
    {
        var days = (end - start).Days;
        var groupedData = new List<TrendDataPoint>();

        for (var i = 0; i <= Math.Min(days, 30); i++)
        {
            var date = start.AddDays(i).Date;
            var dayValidations = validations.Where(v => v.UploadedAt.Date == date).ToList();

            groupedData.Add(new TrendDataPoint
            {
                Date = date.ToString("yyyy-MM-dd"),
                Total = dayValidations.Count,
                Approved = dayValidations.Count(v => v.Status == ValidationStatus.Approved),
                WithErrors = dayValidations.Count(v => v.ErrorCount > 0),
                Records = dayValidations.Sum(v => v.TotalRecords)
            });
        }

        return groupedData;
    }

    private static DateTime GetWeekStart(DateTime date)
    {
        var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
        return date.AddDays(-diff).Date;
    }

    private static string GetActivityType(ValidationStatus status) => status switch
    {
        ValidationStatus.Pending => "upload",
        ValidationStatus.Processing => "processing",
        ValidationStatus.Completed => "completed",
        ValidationStatus.Approved => "approved",
        ValidationStatus.Rejected => "rejected",
        ValidationStatus.Failed => "failed",
        ValidationStatus.Cancelled => "cancelled",
        _ => "unknown"
    };

    private static string GetActivityTitle(ValidationStatus status, string fileName) => status switch
    {
        ValidationStatus.Pending => $"Archivo subido: {fileName}",
        ValidationStatus.Processing => $"Procesando: {fileName}",
        ValidationStatus.Completed => $"Validación completada: {fileName}",
        ValidationStatus.Approved => $"Validación aprobada: {fileName}",
        ValidationStatus.Rejected => $"Validación rechazada: {fileName}",
        ValidationStatus.Failed => $"Error en validación: {fileName}",
        ValidationStatus.Cancelled => $"Validación cancelada: {fileName}",
        _ => fileName
    };

    private static string GetActivityDescription(ValidationStatus status) => status switch
    {
        ValidationStatus.Pending => "Esperando procesamiento",
        ValidationStatus.Processing => "Ejecutando validadores",
        ValidationStatus.Completed => "Lista para revisión",
        ValidationStatus.Approved => "Cumple normativa CONSAR",
        ValidationStatus.Rejected => "No cumple normativa",
        ValidationStatus.Failed => "Error durante procesamiento",
        ValidationStatus.Cancelled => "Cancelada por usuario",
        _ => ""
    };

    private static string GetActivityIcon(ValidationStatus status) => status switch
    {
        ValidationStatus.Pending => "upload",
        ValidationStatus.Processing => "refresh-cw",
        ValidationStatus.Completed => "check-circle",
        ValidationStatus.Approved => "shield-check",
        ValidationStatus.Rejected => "x-circle",
        ValidationStatus.Failed => "alert-triangle",
        ValidationStatus.Cancelled => "minus-circle",
        _ => "file"
    };

    private static string GetActivityColor(ValidationStatus status) => status switch
    {
        ValidationStatus.Pending => "blue",
        ValidationStatus.Processing => "yellow",
        ValidationStatus.Completed => "green",
        ValidationStatus.Approved => "emerald",
        ValidationStatus.Rejected => "red",
        ValidationStatus.Failed => "red",
        ValidationStatus.Cancelled => "gray",
        _ => "gray"
    };

    #endregion
}

#region DTOs

public class DashboardStatistics
{
    public int TotalValidations { get; set; }
    public int PendingValidations { get; set; }
    public int ProcessingValidations { get; set; }
    public int CompletedValidations { get; set; }
    public int ApprovedValidations { get; set; }
    public int RejectedValidations { get; set; }
    public int FailedValidations { get; set; }

    public int TotalRecordsProcessed { get; set; }
    public int TotalValidRecords { get; set; }
    public int TotalErrors { get; set; }
    public int TotalWarnings { get; set; }

    public double SuccessRate { get; set; }
    public double AverageProcessingTimeMs { get; set; }

    public Dictionary<string, FileTypeStatistics> ByFileType { get; set; } = new();
    public Dictionary<string, int> ByStatus { get; set; } = new();
    public List<TrendDataPoint> TrendData { get; set; } = new();

    public PeriodInfo Period { get; set; } = new();
}

public class FileTypeStatistics
{
    public int Total { get; set; }
    public int Approved { get; set; }
    public int WithErrors { get; set; }
    public int TotalRecords { get; set; }
    public int TotalErrors { get; set; }
}

public class TrendDataPoint
{
    public string Date { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Approved { get; set; }
    public int WithErrors { get; set; }
    public int Records { get; set; }
}

public class PeriodInfo
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime GeneratedAt { get; set; }
}

public class RecentValidation
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int TotalRecords { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
    public DateTime UploadedAt { get; set; }
    public string? UploadedBy { get; set; }
}

public class ActivityItem
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string User { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string Icon { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public class DashboardAlert
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PerformanceMetrics
{
    public double AverageProcessingTimeMs { get; set; }
    public int MaxProcessingTimeMs { get; set; }
    public int MinProcessingTimeMs { get; set; }
    public int TotalValidationsProcessed { get; set; }
    public int TotalRecordsProcessed { get; set; }
    public List<ValidatorPerformance> ValidatorsPerformance { get; set; } = new();
    public List<ValidatorPerformance> SlowestValidators { get; set; } = new();
    public Dictionary<string, double> ProcessingTimeByFileType { get; set; } = new();
    public PeriodInfo Period { get; set; } = new();
}

public class ValidatorPerformance
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double AverageMs { get; set; }
    public int ExecutionCount { get; set; }
    public double SuccessRate { get; set; }
}

public class TrendData
{
    public List<string> Labels { get; set; } = new();
    public Dictionary<string, List<int>> Datasets { get; set; } = new();
}

#endregion
