using Certus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Certus.Application.Common.Interfaces;

/// <summary>
/// Contexto de base de datos de la aplicación
/// Optimized for .NET 8 with Clean Architecture patterns (2025)
/// </summary>
public interface IApplicationDbContext
{
    // Entity Sets
    DbSet<Tenant> Tenants { get; }
    DbSet<User> Users { get; }
    DbSet<Validation> Validations { get; }
    DbSet<ValidationError> ValidationErrors { get; }
    DbSet<ValidationWarning> ValidationWarnings { get; }
    DbSet<ValidatorResult> ValidatorResults { get; }
    DbSet<TimelineEvent> TimelineEvents { get; }
    DbSet<Catalog> Catalogs { get; }
    DbSet<CatalogEntry> CatalogEntries { get; }
    DbSet<Approval> Approvals { get; }
    DbSet<ApprovalComment> ApprovalComments { get; }
    DbSet<ApprovalHistory> ApprovalHistories { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<ValidatorRule> ValidatorRules { get; }
    DbSet<ValidatorGroup> ValidatorGroups { get; }
    DbSet<ValidatorPreset> ValidatorPresets { get; }
    DbSet<NormativeChange> NormativeChanges { get; }
    DbSet<UserInvitation> UserInvitations { get; }

    // Scraper entities
    DbSet<ScraperSource> ScraperSources { get; }
    DbSet<ScraperExecution> ScraperExecutions { get; }
    DbSet<ScrapedDocument> ScrapedDocuments { get; }

    /// <summary>
    /// Database facade for transaction management and raw SQL operations
    /// </summary>
    DatabaseFacade Database { get; }

    /// <summary>
    /// Gets a DbSet for the specified entity type
    /// </summary>
    DbSet<TEntity> Set<TEntity>() where TEntity : class;

    /// <summary>
    /// Gets an EntityEntry for the specified entity providing access to change tracking
    /// </summary>
    EntityEntry<TEntity> Entry<TEntity>(TEntity entity) where TEntity : class;

    /// <summary>
    /// Saves all changes made in this context to the database
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
