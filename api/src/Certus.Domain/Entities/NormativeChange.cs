using Certus.Domain.Common;
using Certus.Domain.Enums;

namespace Certus.Domain.Entities;

/// <summary>
/// Cambio Normativo CONSAR - Circular o disposición normativa
/// </summary>
public class NormativeChange : SoftDeletableEntity
{
    public string Code { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public DateTime PublishDate { get; private set; }
    public DateTime EffectiveDate { get; private set; }
    public NormativeStatus Status { get; private set; } = NormativeStatus.Pending;
    public NormativePriority Priority { get; private set; } = NormativePriority.Medium;
    public string Category { get; private set; } = string.Empty;
    public string AffectedValidators { get; private set; } = string.Empty; // JSON array
    public string? DocumentUrl { get; private set; }
    public string? Notes { get; private set; }
    public DateTime? AppliedAt { get; private set; }
    public string? AppliedBy { get; private set; }

    private NormativeChange() { } // EF Core

    public static NormativeChange Create(
        string code,
        string title,
        string description,
        DateTime publishDate,
        DateTime effectiveDate,
        NormativePriority priority,
        string category,
        string[] affectedValidators)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Code is required", nameof(code));

        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required", nameof(title));

        return new NormativeChange
        {
            Code = code.ToUpperInvariant(),
            Title = title,
            Description = description,
            PublishDate = publishDate,
            EffectiveDate = effectiveDate,
            Priority = priority,
            Category = category,
            AffectedValidators = System.Text.Json.JsonSerializer.Serialize(affectedValidators),
            Status = effectiveDate <= DateTime.UtcNow ? NormativeStatus.Active : NormativeStatus.Pending
        };
    }

    public void Update(string title, string description, string category)
    {
        Title = title;
        Description = description;
        Category = category;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDocumentUrl(string url)
    {
        DocumentUrl = url;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        Status = NormativeStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Archive()
    {
        Status = NormativeStatus.Archived;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Apply(string appliedBy)
    {
        Status = NormativeStatus.Active;
        AppliedAt = DateTime.UtcNow;
        AppliedBy = appliedBy;
        UpdatedAt = DateTime.UtcNow;
    }

    public string[] GetAffectedValidators()
    {
        if (string.IsNullOrEmpty(AffectedValidators))
            return Array.Empty<string>();

        return System.Text.Json.JsonSerializer.Deserialize<string[]>(AffectedValidators)
            ?? Array.Empty<string>();
    }
}
