using System.Linq.Expressions;
using System.Reflection;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Common;
using Certus.Domain.Entities;
using Certus.Infrastructure.Data.Interceptors;
using Microsoft.EntityFrameworkCore;

namespace Certus.Infrastructure.Data;

/// <summary>
/// Contexto de base de datos principal
/// </summary>
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly ICurrentUserService _currentUserService;
    private readonly AuditableEntityInterceptor _auditableInterceptor;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentUserService currentUserService,
        AuditableEntityInterceptor auditableInterceptor)
        : base(options)
    {
        _currentUserService = currentUserService;
        _auditableInterceptor = auditableInterceptor;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Validation> Validations => Set<Validation>();
    public DbSet<ValidationError> ValidationErrors => Set<ValidationError>();
    public DbSet<ValidationWarning> ValidationWarnings => Set<ValidationWarning>();
    public DbSet<ValidatorResult> ValidatorResults => Set<ValidatorResult>();
    public DbSet<TimelineEvent> TimelineEvents => Set<TimelineEvent>();
    public DbSet<Catalog> Catalogs => Set<Catalog>();
    public DbSet<CatalogEntry> CatalogEntries => Set<CatalogEntry>();
    public DbSet<Approval> Approvals => Set<Approval>();
    public DbSet<ApprovalComment> ApprovalComments => Set<ApprovalComment>();
    public DbSet<ApprovalHistory> ApprovalHistories => Set<ApprovalHistory>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ValidatorRule> ValidatorRules => Set<ValidatorRule>();
    public DbSet<ValidatorGroup> ValidatorGroups => Set<ValidatorGroup>();
    public DbSet<ValidatorPreset> ValidatorPresets => Set<ValidatorPreset>();
    public DbSet<NormativeChange> NormativeChanges => Set<NormativeChange>();
    public DbSet<UserInvitation> UserInvitations => Set<UserInvitation>();

    // Scraper entities
    public DbSet<ScraperSource> ScraperSources => Set<ScraperSource>();
    public DbSet<ScraperExecution> ScraperExecutions => Set<ScraperExecution>();
    public DbSet<ScrapedDocument> ScrapedDocuments => Set<ScrapedDocument>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(_auditableInterceptor);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplicar todas las configuraciones del assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Configurar filtro global de soft delete
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(SoftDeletableEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .HasQueryFilter(CreateSoftDeleteFilter(entityType.ClrType));
            }
        }
    }

    private static LambdaExpression CreateSoftDeleteFilter(Type entityType)
    {
        var parameter = System.Linq.Expressions.Expression.Parameter(entityType, "e");
        var property = System.Linq.Expressions.Expression.Property(parameter, nameof(SoftDeletableEntity.IsDeleted));
        var falseConstant = System.Linq.Expressions.Expression.Constant(false);
        var comparison = System.Linq.Expressions.Expression.Equal(property, falseConstant);
        return System.Linq.Expressions.Expression.Lambda(comparison, parameter);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Procesar entidades auditables
        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.CreatedBy = _currentUserService.User.UserId?.ToString();
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedBy = _currentUserService.User.UserId?.ToString();
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
