using Certus.Domain.Common;
using Certus.Domain.Enums;

namespace Certus.Domain.Entities;

/// <summary>
/// Documento extraído por el scraper
/// Almacena datos crudos antes de procesarlos a NormativeChange
/// </summary>
public class ScrapedDocument : AuditableEntity
{
    public Guid ExecutionId { get; private set; }
    public Guid SourceId { get; private set; }
    public ScrapedDocumentStatus Status { get; private set; } = ScrapedDocumentStatus.New;

    // Datos extraídos
    public string ExternalId { get; private set; } = string.Empty; // ID único de la fuente
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? Code { get; private set; } // Código de circular (ej: CONSAR 19-21)
    public DateTime? PublishDate { get; private set; }
    public DateTime? EffectiveDate { get; private set; }
    public string? Category { get; private set; }
    public string? DocumentUrl { get; private set; }
    public string? PdfUrl { get; private set; }
    public string? RawHtml { get; private set; }
    public string? ExtractedText { get; private set; }
    public string? Metadata { get; private set; } // JSON con datos adicionales

    // Procesamiento
    public Guid? NormativeChangeId { get; private set; } // Si fue procesado exitosamente
    public string? ProcessingError { get; private set; }
    public string? ProcessedBy { get; private set; }
    public DateTime? ProcessedAt { get; private set; }
    public string? Hash { get; private set; } // Para detectar duplicados

    // Navigation properties
    public virtual ScraperExecution Execution { get; private set; } = null!;
    public virtual ScraperSource Source { get; private set; } = null!;
    public virtual NormativeChange? NormativeChange { get; private set; }

    private ScrapedDocument() { } // EF Core

    public static ScrapedDocument Create(
        Guid executionId,
        Guid sourceId,
        string externalId,
        string title)
    {
        if (string.IsNullOrWhiteSpace(externalId))
            throw new ArgumentException("External ID is required", nameof(externalId));

        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required", nameof(title));

        var doc = new ScrapedDocument
        {
            ExecutionId = executionId,
            SourceId = sourceId,
            ExternalId = externalId,
            Title = title,
            Status = ScrapedDocumentStatus.New
        };

        doc.CalculateHash();
        return doc;
    }

    public void SetDetails(
        string? description,
        string? code,
        DateTime? publishDate,
        DateTime? effectiveDate,
        string? category)
    {
        Description = description;
        Code = code?.ToUpperInvariant();
        PublishDate = publishDate;
        EffectiveDate = effectiveDate;
        Category = category;
        UpdatedAt = DateTime.UtcNow;
        CalculateHash();
    }

    public void SetUrls(string? documentUrl, string? pdfUrl)
    {
        DocumentUrl = documentUrl;
        PdfUrl = pdfUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRawContent(string? html, string? extractedText)
    {
        RawHtml = html;
        ExtractedText = extractedText;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetMetadata(string json)
    {
        Metadata = json;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsProcessed(Guid normativeChangeId, string processedBy)
    {
        Status = ScrapedDocumentStatus.Processed;
        NormativeChangeId = normativeChangeId;
        ProcessedBy = processedBy;
        ProcessedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsIgnored(string reason)
    {
        Status = ScrapedDocumentStatus.Ignored;
        ProcessingError = reason;
        ProcessedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsNeedsReview(string reason)
    {
        Status = ScrapedDocumentStatus.NeedsReview;
        ProcessingError = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsError(string error)
    {
        Status = ScrapedDocumentStatus.Error;
        ProcessingError = error;
        ProcessedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsDuplicate(string hash)
    {
        return Hash == hash;
    }

    private void CalculateHash()
    {
        var content = $"{SourceId}|{ExternalId}|{Code}|{Title}|{PublishDate:yyyyMMdd}";
        using var sha = System.Security.Cryptography.SHA256.Create();
        var bytes = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(content));
        Hash = Convert.ToHexString(bytes);
    }

    /// <summary>
    /// Convierte el documento scrapeado a un NormativeChange
    /// </summary>
    public NormativeChange ToNormativeChange(
        NormativePriority priority = NormativePriority.Medium,
        string[]? affectedValidators = null)
    {
        var code = Code ?? ExternalId;
        var category = Category ?? "General";
        var publishDate = PublishDate ?? CreatedAt;
        var effectiveDate = EffectiveDate ?? publishDate.AddDays(30);

        var change = NormativeChange.Create(
            code,
            Title,
            Description ?? "",
            publishDate,
            effectiveDate,
            priority,
            category,
            affectedValidators ?? Array.Empty<string>());

        if (!string.IsNullOrEmpty(PdfUrl))
            change.SetDocumentUrl(PdfUrl);
        else if (!string.IsNullOrEmpty(DocumentUrl))
            change.SetDocumentUrl(DocumentUrl);

        return change;
    }
}
