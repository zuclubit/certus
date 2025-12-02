using Certus.Domain.Entities;
using Certus.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Certus.Infrastructure.Data.Repositories;

/// <summary>
/// Implementación del repositorio de Catálogos CONSAR
/// Optimized for .NET 8 with Clean Architecture (2025)
/// </summary>
public class CatalogRepository : BaseRepository<Catalog>, ICatalogRepository
{
    public CatalogRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Catalog?> GetByCodeAsync(
        string code,
        CancellationToken cancellationToken = default)
    {
        var normalizedCode = code.ToUpperInvariant();
        return await DbSet
            .FirstOrDefaultAsync(c => c.Code == normalizedCode, cancellationToken);
    }

    public async Task<Catalog?> GetByCodeWithEntriesAsync(
        string code,
        CancellationToken cancellationToken = default)
    {
        var normalizedCode = code.ToUpperInvariant();
        return await DbSet
            .Include(c => c.Entries.Where(e => e.IsActive).OrderBy(e => e.SortOrder ?? int.MaxValue))
            .FirstOrDefaultAsync(c => c.Code == normalizedCode, cancellationToken);
    }

    public async Task<IReadOnlyList<Catalog>> GetActiveAsync(
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Catalog>> GetBySourceAsync(
        string source,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.Source == source)
            .OrderBy(c => c.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> CodeExistsAsync(
        string code,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        var normalizedCode = code.ToUpperInvariant();
        var query = DbSet.Where(c => c.Code == normalizedCode);

        if (excludeId.HasValue)
            query = query.Where(c => c.Id != excludeId.Value);

        return await query.AnyAsync(cancellationToken);
    }
}

/// <summary>
/// Implementación del repositorio de Entradas de Catálogo
/// Optimized for .NET 8 with Clean Architecture (2025)
/// </summary>
public class CatalogEntryRepository : BaseRepository<CatalogEntry>, ICatalogEntryRepository
{
    public CatalogEntryRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<CatalogEntry?> GetByKeyAsync(
        Guid catalogId,
        string key,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(e => e.CatalogId == catalogId && e.Key == key, cancellationToken);
    }

    public async Task<IReadOnlyList<CatalogEntry>> GetByCatalogAsync(
        Guid catalogId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.CatalogId == catalogId)
            .OrderBy(e => e.SortOrder ?? int.MaxValue)
            .ThenBy(e => e.Key)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CatalogEntry>> GetActiveByCatalogAsync(
        Guid catalogId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.CatalogId == catalogId && e.IsActive)
            .OrderBy(e => e.SortOrder ?? int.MaxValue)
            .ThenBy(e => e.Key)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CatalogEntry>> GetByParentKeyAsync(
        Guid catalogId,
        string parentKey,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.CatalogId == catalogId && e.ParentKey == parentKey && e.IsActive)
            .OrderBy(e => e.SortOrder ?? int.MaxValue)
            .ThenBy(e => e.Key)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> KeyExistsAsync(
        Guid catalogId,
        string key,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(e => e.CatalogId == catalogId && e.Key == key);

        if (excludeId.HasValue)
            query = query.Where(e => e.Id != excludeId.Value);

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CatalogEntry>> SearchAsync(
        Guid catalogId,
        string searchTerm,
        int maxResults = 50,
        CancellationToken cancellationToken = default)
    {
        var term = searchTerm.ToLower();
        return await DbSet
            .Where(e => e.CatalogId == catalogId &&
                       e.IsActive &&
                       (e.Key.ToLower().Contains(term) ||
                        e.Value.ToLower().Contains(term) ||
                        (e.DisplayName != null && e.DisplayName.ToLower().Contains(term))))
            .OrderBy(e => e.SortOrder ?? int.MaxValue)
            .Take(maxResults)
            .ToListAsync(cancellationToken);
    }
}
