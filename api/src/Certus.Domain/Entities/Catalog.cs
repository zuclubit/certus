using Certus.Domain.Common;

namespace Certus.Domain.Entities;

/// <summary>
/// Catálogo CONSAR - Contenedor de entradas de catálogo
/// </summary>
public class Catalog : AuditableEntity
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? Version { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime? EffectiveFrom { get; private set; }
    public DateTime? EffectiveTo { get; private set; }
    public string? Source { get; private set; } // CONSAR, INTERNO
    public string? Metadata { get; private set; } // JSON

    public virtual ICollection<CatalogEntry> Entries { get; private set; } = new List<CatalogEntry>();

    private Catalog() { } // EF Core

    public static Catalog Create(
        string code,
        string name,
        string? description = null,
        string? version = null,
        string? source = null)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Code is required", nameof(code));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required", nameof(name));

        return new Catalog
        {
            Code = code.ToUpperInvariant(),
            Name = name,
            Description = description,
            Version = version,
            Source = source ?? "CONSAR",
            EffectiveFrom = DateTime.UtcNow
        };
    }

    public void Update(string name, string? description = null)
    {
        Name = name;
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetVersion(string version)
    {
        Version = version;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        EffectiveTo = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddEntry(CatalogEntry entry)
    {
        Entries.Add(entry);
    }
}

/// <summary>
/// Entrada individual de catálogo CONSAR
/// </summary>
public class CatalogEntry : AuditableEntity
{
    public Guid CatalogId { get; private set; }
    public string Key { get; private set; } = string.Empty;
    public string Value { get; private set; } = string.Empty;
    public string? DisplayName { get; private set; }
    public string? Description { get; private set; }
    public int? SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;
    public string? ParentKey { get; private set; }
    public string? Metadata { get; private set; } // JSON

    public virtual Catalog Catalog { get; private set; } = null!;

    private CatalogEntry() { } // EF Core

    public static CatalogEntry Create(
        Guid catalogId,
        string key,
        string value,
        string? displayName = null,
        string? description = null,
        int? sortOrder = null,
        string? parentKey = null)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Key is required", nameof(key));

        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Value is required", nameof(value));

        return new CatalogEntry
        {
            CatalogId = catalogId,
            Key = key,
            Value = value,
            DisplayName = displayName ?? value,
            Description = description,
            SortOrder = sortOrder,
            ParentKey = parentKey
        };
    }

    public void Update(string value, string? displayName = null, string? description = null)
    {
        Value = value;
        DisplayName = displayName ?? value;
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
