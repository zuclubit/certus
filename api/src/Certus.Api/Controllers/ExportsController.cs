using System.Globalization;
using System.Text;
using System.Text.Json;
using Asp.Versioning;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Domain.Services;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller para exportación de reportes CONSAR
/// Soporta formatos: PDF, Excel, CSV, JSON
/// </summary>
[ApiVersion("1.0")]
[Authorize(Policy = "CanExport")]
public class ExportsController : BaseController
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<ExportsController> _logger;

    public ExportsController(
        IApplicationDbContext context,
        IFileStorageService fileStorage,
        ILogger<ExportsController> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _logger = logger;

        // Configure QuestPDF license
        QuestPDF.Settings.License = LicenseType.Community;
    }

    /// <summary>
    /// Exportar validación a PDF
    /// </summary>
    [HttpGet("validations/{id:guid}/pdf")]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportValidationPdf(
        Guid id,
        [FromQuery] bool includeErrors = true,
        [FromQuery] bool includeWarnings = true,
        CancellationToken cancellationToken = default)
    {
        var validation = await _context.Validations
            .Include(v => v.Errors.Where(e => e.IsVisible))
            .Include(v => v.UploadedBy)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

        if (validation == null)
            return NotFound(new { error = "Validación no encontrada" });

        var pdfDocument = GenerateValidationPdf(validation, includeErrors, includeWarnings);
        var pdfStream = new MemoryStream();
        pdfDocument.GeneratePdf(pdfStream);
        pdfStream.Position = 0;

        var fileName = $"Certus_Validation_{validation.FileName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.pdf";

        _logger.LogInformation(
            "PDF export generated for validation {ValidationId} by user {UserId}",
            id, CurrentUserId);

        return File(pdfStream, "application/pdf", fileName);
    }

    /// <summary>
    /// Exportar validación a Excel
    /// </summary>
    [HttpGet("validations/{id:guid}/excel")]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportValidationExcel(
        Guid id,
        [FromQuery] bool includeErrors = true,
        [FromQuery] bool includeWarnings = true,
        CancellationToken cancellationToken = default)
    {
        var validation = await _context.Validations
            .Include(v => v.Errors.Where(e => e.IsVisible))
            .Include(v => v.UploadedBy)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

        if (validation == null)
            return NotFound(new { error = "Validación no encontrada" });

        using var workbook = GenerateValidationExcel(validation, includeErrors, includeWarnings);
        var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;

        var fileName = $"Certus_Validation_{validation.FileName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";

        _logger.LogInformation(
            "Excel export generated for validation {ValidationId} by user {UserId}",
            id, CurrentUserId);

        return File(
            stream,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName);
    }

    /// <summary>
    /// Exportar validación a CSV
    /// </summary>
    [HttpGet("validations/{id:guid}/csv")]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportValidationCsv(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var validation = await _context.Validations
            .Include(v => v.Errors.Where(e => e.IsVisible))
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

        if (validation == null)
            return NotFound(new { error = "Validación no encontrada" });

        var csv = GenerateValidationCsv(validation);
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(csv));

        var fileName = $"Certus_Validation_{validation.FileName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

        return File(stream, "text/csv", fileName);
    }

    /// <summary>
    /// Exportar validación a JSON
    /// </summary>
    [HttpGet("validations/{id:guid}/json")]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportValidationJson(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var validation = await _context.Validations
            .Include(v => v.Errors.Where(e => e.IsVisible))
            .Include(v => v.UploadedBy)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

        if (validation == null)
            return NotFound(new { error = "Validación no encontrada" });

        var exportData = new
        {
            validation.Id,
            validation.FileName,
            FileType = validation.FileType.ToString(),
            Status = validation.Status.ToString(),
            validation.TotalRecords,
            validation.ValidRecords,
            validation.ErrorCount,
            validation.WarningCount,
            validation.UploadedAt,
            validation.CompletedAt,
            UploadedBy = validation.UploadedBy != null ? new
            {
                validation.UploadedBy.Id,
                validation.UploadedBy.Email,
                validation.UploadedBy.FullName
            } : null,
            Errors = validation.Errors.Select(e => new
            {
                e.Id,
                e.ValidatorCode,
                e.Message,
                Severity = e.Severity.ToString(),
                e.LineNumber,
                e.Field,
                e.Value,
                e.ExpectedValue
            })
        };

        var json = JsonSerializer.Serialize(exportData, new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
        var fileName = $"Certus_Validation_{validation.FileName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";

        return File(stream, "application/json", fileName);
    }

    /// <summary>
    /// Exportar reporte de validaciones por período
    /// </summary>
    [HttpGet("reports/period")]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportPeriodReport(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] FileType? fileType = null,
        [FromQuery] string format = "pdf",
        CancellationToken cancellationToken = default)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        // Convert DateTime to UTC for PostgreSQL timestamp with time zone compatibility
        var utcStartDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
        var utcEndDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

        var query = _context.Validations
            .Where(v => v.TenantId == CurrentTenantId.Value)
            .Where(v => v.UploadedAt >= utcStartDate && v.UploadedAt <= utcEndDate);

        if (fileType.HasValue)
            query = query.Where(v => v.FileType == fileType.Value);

        var validations = await query
            .Include(v => v.UploadedBy)
            .OrderByDescending(v => v.UploadedAt)
            .ToListAsync(cancellationToken);

        return format.ToLower() switch
        {
            "pdf" => await GeneratePeriodReportPdf(validations, startDate, endDate, fileType),
            "excel" => await GeneratePeriodReportExcel(validations, startDate, endDate, fileType),
            "csv" => GeneratePeriodReportCsv(validations, startDate, endDate),
            _ => BadRequest(new { error = "Formato no soportado. Use: pdf, excel, csv" })
        };
    }

    /// <summary>
    /// Exportar reporte de cumplimiento CONSAR
    /// </summary>
    [HttpGet("reports/compliance")]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportComplianceReport(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] string format = "pdf",
        CancellationToken cancellationToken = default)
    {
        if (!CurrentTenantId.HasValue)
            return Unauthorized();

        // Convert DateTime to UTC for PostgreSQL timestamp with time zone compatibility
        var utcStartDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
        var utcEndDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

        var validations = await _context.Validations
            .Where(v => v.TenantId == CurrentTenantId.Value)
            .Where(v => v.UploadedAt >= utcStartDate && v.UploadedAt <= utcEndDate)
            .Where(v => v.Status == ValidationStatus.Completed || v.Status == ValidationStatus.Approved)
            .Include(v => v.Errors)
            .ToListAsync(cancellationToken);

        // Calculate compliance metrics
        var metrics = new ComplianceMetrics
        {
            TotalValidations = validations.Count,
            ApprovedValidations = validations.Count(v => v.Status == ValidationStatus.Approved),
            WithErrors = validations.Count(v => v.ErrorCount > 0),
            WithWarnings = validations.Count(v => v.WarningCount > 0),
            ByFileType = validations
                .GroupBy(v => v.FileType)
                .ToDictionary(
                    g => g.Key.ToString(),
                    g => new FileTypeMetrics
                    {
                        Total = g.Count(),
                        Compliant = g.Count(v => v.Status == ValidationStatus.Approved),
                        NonCompliant = g.Count(v => v.ErrorCount > 0),
                        TotalRecords = g.Sum(v => v.TotalRecords),
                        TotalErrors = g.Sum(v => v.ErrorCount)
                    }),
            ComplianceRate = validations.Count > 0
                ? (double)validations.Count(v => v.Status == ValidationStatus.Approved) / validations.Count * 100
                : 0,
            StartDate = startDate,
            EndDate = endDate
        };

        if (format.ToLower() == "pdf")
        {
            return await GenerateComplianceReportPdf(metrics);
        }

        // Default to JSON for other formats
        var json = JsonSerializer.Serialize(metrics, new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
        return File(stream, "application/json", $"Certus_Compliance_Report_{DateTime.UtcNow:yyyyMMdd}.json");
    }

    #region PDF Generation

    private Document GenerateValidationPdf(Validation validation, bool includeErrors, bool includeWarnings)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(container => ComposeHeader(container, "Reporte de Validación"));
                page.Content().Element(container => ComposeValidationContent(container, validation, includeErrors, includeWarnings));
                page.Footer().Element(ComposeFooter);
            });
        });
    }

    private void ComposeHeader(IContainer container, string title)
    {
        container.Row(row =>
        {
            row.RelativeItem().Column(col =>
            {
                col.Item().Text("CERTUS").Bold().FontSize(20).FontColor(Colors.Blue.Darken2);
                col.Item().Text("Sistema de Validación CONSAR").FontSize(12).FontColor(Colors.Grey.Darken1);
            });

            row.RelativeItem().AlignRight().Column(col =>
            {
                col.Item().Text(title).FontSize(14).Bold();
                col.Item().Text($"Generado: {DateTime.Now:dd/MM/yyyy HH:mm}").FontSize(9);
            });
        });

        container.PaddingVertical(10).LineHorizontal(1).LineColor(Colors.Blue.Darken2);
    }

    private void ComposeValidationContent(
        IContainer container,
        Validation validation,
        bool includeErrors,
        bool includeWarnings)
    {
        container.Column(column =>
        {
            // Summary section
            column.Item().PaddingBottom(20).Element(c => ComposeSummarySection(c, validation));

            // Results section
            column.Item().PaddingBottom(20).Element(c => ComposeResultsSection(c, validation));

            // Errors section
            if (includeErrors && validation.Errors.Any(e => e.Severity == ErrorSeverity.Critical || e.Severity == ErrorSeverity.Error))
            {
                column.Item().PaddingBottom(20).Element(c => ComposeErrorsSection(c, validation, false));
            }

            // Warnings section
            if (includeWarnings && validation.Errors.Any(e => e.Severity == ErrorSeverity.Warning))
            {
                column.Item().Element(c => ComposeErrorsSection(c, validation, true));
            }
        });
    }

    private void ComposeSummarySection(IContainer container, Validation validation)
    {
        container.Column(column =>
        {
            column.Item().Text("Información General").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
            column.Item().PaddingTop(10).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(2);
                });

                table.Cell().Text("Archivo:").Bold();
                table.Cell().Text(validation.FileName);
                table.Cell().Text("Tipo:").Bold();
                table.Cell().Text(validation.FileType.ToString());

                table.Cell().Text("Estado:").Bold();
                table.Cell().Text(validation.Status.ToString());
                table.Cell().Text("Fecha:").Bold();
                table.Cell().Text(validation.UploadedAt.ToString("dd/MM/yyyy HH:mm"));

                table.Cell().Text("Tamaño:").Bold();
                table.Cell().Text($"{validation.FileSize / 1024.0:N2} KB");
                table.Cell().Text("Usuario:").Bold();
                table.Cell().Text(validation.UploadedBy?.FullName ?? "N/A");
            });
        });
    }

    private void ComposeResultsSection(IContainer container, Validation validation)
    {
        container.Column(column =>
        {
            column.Item().Text("Resultados de Validación").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
            column.Item().PaddingTop(10).Row(row =>
            {
                row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(10).Column(col =>
                {
                    col.Item().Text("Registros Totales").FontSize(9);
                    col.Item().Text(validation.TotalRecords.ToString("N0")).FontSize(18).Bold();
                });

                row.ConstantItem(10);

                row.RelativeItem().Border(1).BorderColor(Colors.Green.Darken1).Padding(10).Column(col =>
                {
                    col.Item().Text("Válidos").FontSize(9).FontColor(Colors.Green.Darken1);
                    col.Item().Text(validation.ValidRecords.ToString("N0")).FontSize(18).Bold().FontColor(Colors.Green.Darken1);
                });

                row.ConstantItem(10);

                row.RelativeItem().Border(1).BorderColor(Colors.Red.Darken1).Padding(10).Column(col =>
                {
                    col.Item().Text("Errores").FontSize(9).FontColor(Colors.Red.Darken1);
                    col.Item().Text(validation.ErrorCount.ToString("N0")).FontSize(18).Bold().FontColor(Colors.Red.Darken1);
                });

                row.ConstantItem(10);

                row.RelativeItem().Border(1).BorderColor(Colors.Orange.Darken1).Padding(10).Column(col =>
                {
                    col.Item().Text("Advertencias").FontSize(9).FontColor(Colors.Orange.Darken1);
                    col.Item().Text(validation.WarningCount.ToString("N0")).FontSize(18).Bold().FontColor(Colors.Orange.Darken1);
                });
            });
        });
    }

    private void ComposeErrorsSection(IContainer container, Validation validation, bool isWarnings)
    {
        var severities = isWarnings
            ? new[] { ErrorSeverity.Warning }
            : new[] { ErrorSeverity.Critical, ErrorSeverity.Error };

        var errors = validation.Errors
            .Where(e => severities.Contains(e.Severity))
            .OrderBy(e => e.LineNumber)
            .Take(50) // Limit for PDF
            .ToList();

        container.Column(column =>
        {
            column.Item().Text(isWarnings ? "Advertencias" : "Errores")
                .FontSize(14).Bold()
                .FontColor(isWarnings ? Colors.Orange.Darken2 : Colors.Red.Darken2);

            column.Item().PaddingTop(10).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(50);
                    columns.ConstantColumn(80);
                    columns.RelativeColumn();
                    columns.ConstantColumn(80);
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Línea").Bold();
                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Código").Bold();
                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Mensaje").Bold();
                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Campo").Bold();
                });

                foreach (var error in errors)
                {
                    table.Cell().Padding(3).Text(error.LineNumber.ToString());
                    table.Cell().Padding(3).Text(error.ValidatorCode);
                    table.Cell().Padding(3).Text(error.Message);
                    table.Cell().Padding(3).Text(error.Field ?? "-");
                }
            });

            if (errors.Count == 50)
            {
                column.Item().PaddingTop(5).Text("... y más. Consulte el reporte completo en la plataforma.")
                    .FontSize(9).Italic().FontColor(Colors.Grey.Darken1);
            }
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.AlignCenter().Text(text =>
        {
            text.Span("Certus - Sistema de Validación CONSAR | ");
            text.CurrentPageNumber();
            text.Span(" / ");
            text.TotalPages();
        });
    }

    private async Task<IActionResult> GeneratePeriodReportPdf(
        List<Validation> validations,
        DateTime startDate,
        DateTime endDate,
        FileType? fileType)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(9));

                page.Header().Element(c => ComposeHeader(c, "Reporte de Validaciones por Período"));
                page.Content().Element(c => ComposePeriodContent(c, validations, startDate, endDate, fileType));
                page.Footer().Element(ComposeFooter);
            });
        });

        var stream = new MemoryStream();
        document.GeneratePdf(stream);
        stream.Position = 0;

        var fileName = $"Certus_Period_Report_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.pdf";
        return File(stream, "application/pdf", fileName);
    }

    private void ComposePeriodContent(
        IContainer container,
        List<Validation> validations,
        DateTime startDate,
        DateTime endDate,
        FileType? fileType)
    {
        container.Column(column =>
        {
            // Summary
            column.Item().PaddingBottom(15).Row(row =>
            {
                row.RelativeItem().Text($"Período: {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}");
                if (fileType.HasValue)
                    row.RelativeItem().Text($"Tipo de archivo: {fileType}");
                row.RelativeItem().AlignRight().Text($"Total validaciones: {validations.Count}");
            });

            // Table
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1.5f);
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("Archivo").Bold().FontColor(Colors.White);
                    header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("Tipo").Bold().FontColor(Colors.White);
                    header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("Estado").Bold().FontColor(Colors.White);
                    header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("Registros").Bold().FontColor(Colors.White);
                    header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("Válidos").Bold().FontColor(Colors.White);
                    header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("Errores").Bold().FontColor(Colors.White);
                    header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("Advertencias").Bold().FontColor(Colors.White);
                    header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("Fecha").Bold().FontColor(Colors.White);
                });

                foreach (var v in validations.Take(100))
                {
                    var bgColor = v.Status == ValidationStatus.Approved ? Colors.Green.Lighten4 :
                                  v.ErrorCount > 0 ? Colors.Red.Lighten4 : Colors.White;

                    table.Cell().Background(bgColor).Padding(3).Text(TruncateString(v.FileName, 30));
                    table.Cell().Background(bgColor).Padding(3).Text(v.FileType.ToString());
                    table.Cell().Background(bgColor).Padding(3).Text(v.Status.ToString());
                    table.Cell().Background(bgColor).Padding(3).AlignRight().Text(v.TotalRecords.ToString("N0"));
                    table.Cell().Background(bgColor).Padding(3).AlignRight().Text(v.ValidRecords.ToString("N0"));
                    table.Cell().Background(bgColor).Padding(3).AlignRight().Text(v.ErrorCount.ToString("N0"));
                    table.Cell().Background(bgColor).Padding(3).AlignRight().Text(v.WarningCount.ToString("N0"));
                    table.Cell().Background(bgColor).Padding(3).Text(v.UploadedAt.ToString("dd/MM/yy HH:mm"));
                }
            });
        });
    }

    private async Task<IActionResult> GenerateComplianceReportPdf(ComplianceMetrics metrics)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(c => ComposeHeader(c, "Reporte de Cumplimiento CONSAR"));
                page.Content().Element(c => ComposeComplianceContent(c, metrics));
                page.Footer().Element(ComposeFooter);
            });
        });

        var stream = new MemoryStream();
        document.GeneratePdf(stream);
        stream.Position = 0;

        var fileName = $"Certus_Compliance_Report_{DateTime.UtcNow:yyyyMMdd}.pdf";
        return File(stream, "application/pdf", fileName);
    }

    private void ComposeComplianceContent(IContainer container, ComplianceMetrics metrics)
    {
        container.Column(column =>
        {
            // Period info
            column.Item().PaddingBottom(20).Text($"Período: {metrics.StartDate:dd/MM/yyyy} - {metrics.EndDate:dd/MM/yyyy}");

            // Compliance rate
            column.Item().PaddingBottom(20).Row(row =>
            {
                row.RelativeItem().Border(2).BorderColor(Colors.Blue.Darken2).Padding(20).Column(col =>
                {
                    col.Item().AlignCenter().Text("Tasa de Cumplimiento").FontSize(12);
                    col.Item().AlignCenter().Text($"{metrics.ComplianceRate:N1}%")
                        .FontSize(36).Bold()
                        .FontColor(metrics.ComplianceRate >= 95 ? Colors.Green.Darken2 : Colors.Orange.Darken2);
                });
            });

            // Summary metrics
            column.Item().PaddingBottom(20).Row(row =>
            {
                row.RelativeItem().Border(1).Padding(10).Column(col =>
                {
                    col.Item().Text("Total Validaciones").FontSize(9);
                    col.Item().Text(metrics.TotalValidations.ToString("N0")).FontSize(18).Bold();
                });

                row.ConstantItem(10);

                row.RelativeItem().Border(1).Padding(10).Column(col =>
                {
                    col.Item().Text("Aprobadas").FontSize(9).FontColor(Colors.Green.Darken1);
                    col.Item().Text(metrics.ApprovedValidations.ToString("N0")).FontSize(18).Bold().FontColor(Colors.Green.Darken1);
                });

                row.ConstantItem(10);

                row.RelativeItem().Border(1).Padding(10).Column(col =>
                {
                    col.Item().Text("Con Errores").FontSize(9).FontColor(Colors.Red.Darken1);
                    col.Item().Text(metrics.WithErrors.ToString("N0")).FontSize(18).Bold().FontColor(Colors.Red.Darken1);
                });

                row.ConstantItem(10);

                row.RelativeItem().Border(1).Padding(10).Column(col =>
                {
                    col.Item().Text("Con Advertencias").FontSize(9).FontColor(Colors.Orange.Darken1);
                    col.Item().Text(metrics.WithWarnings.ToString("N0")).FontSize(18).Bold().FontColor(Colors.Orange.Darken1);
                });
            });

            // By file type table
            column.Item().Text("Desglose por Tipo de Archivo").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
            column.Item().PaddingTop(10).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                });

                table.Header(header =>
                {
                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Tipo").Bold();
                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Total").Bold();
                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Cumple").Bold();
                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("No Cumple").Bold();
                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Registros").Bold();
                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Errores").Bold();
                });

                foreach (var (fileType, typeMetrics) in metrics.ByFileType)
                {
                    table.Cell().Padding(3).Text(fileType);
                    table.Cell().Padding(3).AlignRight().Text(typeMetrics.Total.ToString("N0"));
                    table.Cell().Padding(3).AlignRight().Text(typeMetrics.Compliant.ToString("N0"));
                    table.Cell().Padding(3).AlignRight().Text(typeMetrics.NonCompliant.ToString("N0"));
                    table.Cell().Padding(3).AlignRight().Text(typeMetrics.TotalRecords.ToString("N0"));
                    table.Cell().Padding(3).AlignRight().Text(typeMetrics.TotalErrors.ToString("N0"));
                }
            });
        });
    }

    #endregion

    #region Excel Generation

    private XLWorkbook GenerateValidationExcel(Validation validation, bool includeErrors, bool includeWarnings)
    {
        var workbook = new XLWorkbook();

        // Summary sheet
        var summarySheet = workbook.Worksheets.Add("Resumen");
        AddSummarySheet(summarySheet, validation);

        // Errors sheet
        if (includeErrors && validation.Errors.Any(e => e.Severity != ErrorSeverity.Warning))
        {
            var errorsSheet = workbook.Worksheets.Add("Errores");
            AddErrorsSheet(errorsSheet, validation, false);
        }

        // Warnings sheet
        if (includeWarnings && validation.Errors.Any(e => e.Severity == ErrorSeverity.Warning))
        {
            var warningsSheet = workbook.Worksheets.Add("Advertencias");
            AddErrorsSheet(warningsSheet, validation, true);
        }

        return workbook;
    }

    private void AddSummarySheet(IXLWorksheet sheet, Validation validation)
    {
        sheet.Cell(1, 1).Value = "CERTUS - Reporte de Validación";
        sheet.Cell(1, 1).Style.Font.Bold = true;
        sheet.Cell(1, 1).Style.Font.FontSize = 16;
        sheet.Range(1, 1, 1, 4).Merge();

        var row = 3;
        AddSummaryRow(sheet, ref row, "Archivo", validation.FileName);
        AddSummaryRow(sheet, ref row, "Tipo", validation.FileType.ToString());
        AddSummaryRow(sheet, ref row, "Estado", validation.Status.ToString());
        AddSummaryRow(sheet, ref row, "Fecha de carga", validation.UploadedAt.ToString("dd/MM/yyyy HH:mm"));
        AddSummaryRow(sheet, ref row, "Tamaño", $"{validation.FileSize / 1024.0:N2} KB");
        AddSummaryRow(sheet, ref row, "Usuario", validation.UploadedBy?.FullName ?? "N/A");

        row++;
        sheet.Cell(row, 1).Value = "Resultados";
        sheet.Cell(row, 1).Style.Font.Bold = true;
        row++;

        AddSummaryRow(sheet, ref row, "Registros totales", validation.TotalRecords.ToString("N0"));
        AddSummaryRow(sheet, ref row, "Registros válidos", validation.ValidRecords.ToString("N0"));
        AddSummaryRow(sheet, ref row, "Errores", validation.ErrorCount.ToString("N0"));
        AddSummaryRow(sheet, ref row, "Advertencias", validation.WarningCount.ToString("N0"));

        sheet.Columns().AdjustToContents();
    }

    private void AddSummaryRow(IXLWorksheet sheet, ref int row, string label, string value)
    {
        sheet.Cell(row, 1).Value = label;
        sheet.Cell(row, 1).Style.Font.Bold = true;
        sheet.Cell(row, 2).Value = value;
        row++;
    }

    private void AddErrorsSheet(IXLWorksheet sheet, Validation validation, bool isWarnings)
    {
        var severities = isWarnings
            ? new[] { ErrorSeverity.Warning }
            : new[] { ErrorSeverity.Critical, ErrorSeverity.Error };

        var errors = validation.Errors
            .Where(e => severities.Contains(e.Severity))
            .OrderBy(e => e.LineNumber)
            .ToList();

        // Headers
        var headers = new[] { "Línea", "Código", "Severidad", "Mensaje", "Campo", "Valor", "Valor Esperado" };
        for (var i = 0; i < headers.Length; i++)
        {
            sheet.Cell(1, i + 1).Value = headers[i];
            sheet.Cell(1, i + 1).Style.Font.Bold = true;
            sheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.LightGray;
        }

        // Data
        var row = 2;
        foreach (var error in errors)
        {
            sheet.Cell(row, 1).Value = error.LineNumber;
            sheet.Cell(row, 2).Value = error.ValidatorCode;
            sheet.Cell(row, 3).Value = error.Severity.ToString();
            sheet.Cell(row, 4).Value = error.Message;
            sheet.Cell(row, 5).Value = error.Field ?? "";
            sheet.Cell(row, 6).Value = error.Value ?? "";
            sheet.Cell(row, 7).Value = error.ExpectedValue ?? "";
            row++;
        }

        sheet.Columns().AdjustToContents();
        sheet.SheetView.FreezeRows(1);
    }

    private async Task<IActionResult> GeneratePeriodReportExcel(
        List<Validation> validations,
        DateTime startDate,
        DateTime endDate,
        FileType? fileType)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Validaciones");

        // Title
        sheet.Cell(1, 1).Value = $"Reporte de Validaciones: {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}";
        sheet.Cell(1, 1).Style.Font.Bold = true;
        sheet.Cell(1, 1).Style.Font.FontSize = 14;
        sheet.Range(1, 1, 1, 8).Merge();

        // Headers
        var headers = new[] { "Archivo", "Tipo", "Estado", "Registros", "Válidos", "Errores", "Advertencias", "Fecha" };
        for (var i = 0; i < headers.Length; i++)
        {
            sheet.Cell(3, i + 1).Value = headers[i];
            sheet.Cell(3, i + 1).Style.Font.Bold = true;
            sheet.Cell(3, i + 1).Style.Fill.BackgroundColor = XLColor.CornflowerBlue;
            sheet.Cell(3, i + 1).Style.Font.FontColor = XLColor.White;
        }

        // Data
        var row = 4;
        foreach (var v in validations)
        {
            sheet.Cell(row, 1).Value = v.FileName;
            sheet.Cell(row, 2).Value = v.FileType.ToString();
            sheet.Cell(row, 3).Value = v.Status.ToString();
            sheet.Cell(row, 4).Value = v.TotalRecords;
            sheet.Cell(row, 5).Value = v.ValidRecords;
            sheet.Cell(row, 6).Value = v.ErrorCount;
            sheet.Cell(row, 7).Value = v.WarningCount;
            sheet.Cell(row, 8).Value = v.UploadedAt.ToString("dd/MM/yyyy HH:mm");

            // Conditional formatting
            if (v.ErrorCount > 0)
                sheet.Row(row).Style.Fill.BackgroundColor = XLColor.LightPink;
            else if (v.Status == ValidationStatus.Approved)
                sheet.Row(row).Style.Fill.BackgroundColor = XLColor.LightGreen;

            row++;
        }

        sheet.Columns().AdjustToContents();
        sheet.SheetView.FreezeRows(3);

        var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;

        var fileName = $"Certus_Period_Report_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.xlsx";
        return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    #endregion

    #region CSV Generation

    private string GenerateValidationCsv(Validation validation)
    {
        var sb = new StringBuilder();

        // Headers
        sb.AppendLine("Linea,Codigo,Severidad,Mensaje,Campo,Valor,ValorEsperado");

        // Data
        foreach (var error in validation.Errors.OrderBy(e => e.LineNumber))
        {
            sb.AppendLine(string.Join(",",
                error.LineNumber,
                EscapeCsv(error.ValidatorCode),
                error.Severity.ToString(),
                EscapeCsv(error.Message),
                EscapeCsv(error.Field ?? ""),
                EscapeCsv(error.Value ?? ""),
                EscapeCsv(error.ExpectedValue ?? "")));
        }

        return sb.ToString();
    }

    private IActionResult GeneratePeriodReportCsv(List<Validation> validations, DateTime startDate, DateTime endDate)
    {
        var sb = new StringBuilder();

        // Headers
        sb.AppendLine("Archivo,Tipo,Estado,Registros,Validos,Errores,Advertencias,FechaCarga,Usuario");

        // Data
        foreach (var v in validations)
        {
            sb.AppendLine(string.Join(",",
                EscapeCsv(v.FileName),
                v.FileType.ToString(),
                v.Status.ToString(),
                v.TotalRecords,
                v.ValidRecords,
                v.ErrorCount,
                v.WarningCount,
                v.UploadedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                EscapeCsv(v.UploadedBy?.FullName ?? "")));
        }

        var stream = new MemoryStream(Encoding.UTF8.GetBytes(sb.ToString()));
        var fileName = $"Certus_Period_Report_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.csv";
        return File(stream, "text/csv", fileName);
    }

    private static string EscapeCsv(string value)
    {
        if (string.IsNullOrEmpty(value)) return "";
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }
        return value;
    }

    private static string TruncateString(string value, int maxLength)
    {
        if (string.IsNullOrEmpty(value)) return "";
        return value.Length <= maxLength ? value : value[..(maxLength - 3)] + "...";
    }

    #endregion
}

#region Helper Classes

public class ComplianceMetrics
{
    public int TotalValidations { get; set; }
    public int ApprovedValidations { get; set; }
    public int WithErrors { get; set; }
    public int WithWarnings { get; set; }
    public Dictionary<string, FileTypeMetrics> ByFileType { get; set; } = new();
    public double ComplianceRate { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class FileTypeMetrics
{
    public int Total { get; set; }
    public int Compliant { get; set; }
    public int NonCompliant { get; set; }
    public int TotalRecords { get; set; }
    public int TotalErrors { get; set; }
}

#endregion
