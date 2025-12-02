using Certus.Domain.Entities;

namespace Certus.Domain.Interfaces;

/// <summary>
/// Repositorio específico para Catálogos CONSAR
/// </summary>
public interface ICatalogRepository : IRepository<Catalog>
{
    Task<Catalog?> GetByCodeAsync(
        string code,
        CancellationToken cancellationToken = default);

    Task<Catalog?> GetByCodeWithEntriesAsync(
        string code,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Catalog>> GetActiveAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Catalog>> GetBySourceAsync(
        string source,
        CancellationToken cancellationToken = default);

    Task<bool> CodeExistsAsync(
        string code,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Repositorio específico para Entradas de Catálogo
/// </summary>
public interface ICatalogEntryRepository : IRepository<CatalogEntry>
{
    Task<CatalogEntry?> GetByKeyAsync(
        Guid catalogId,
        string key,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CatalogEntry>> GetByCatalogAsync(
        Guid catalogId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CatalogEntry>> GetActiveByCatalogAsync(
        Guid catalogId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CatalogEntry>> GetByParentKeyAsync(
        Guid catalogId,
        string parentKey,
        CancellationToken cancellationToken = default);

    Task<bool> KeyExistsAsync(
        Guid catalogId,
        string key,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CatalogEntry>> SearchAsync(
        Guid catalogId,
        string searchTerm,
        int maxResults = 50,
        CancellationToken cancellationToken = default);
}
