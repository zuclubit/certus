using Azure.Core;
using Azure.Identity;
using Certus.Application.Common.Interfaces;
using Certus.Infrastructure.Data.Interceptors;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Certus.Infrastructure.Data;

/// <summary>
/// Factory para crear el DbContext en tiempo de diseño (migraciones)
/// Supports Azure AD token authentication for PostgreSQL
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    private const string PostgreSqlScope = "https://ossrdbms-aad.database.windows.net/.default";

    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../Certus.Api"))
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        var useAzureTokenAuth = configuration.GetValue<bool>("Database:UseAzureTokenAuth");

        if (useAzureTokenAuth)
        {
            // Use Azure AD token authentication
            var credential = new DefaultAzureCredential(new DefaultAzureCredentialOptions
            {
                ExcludeVisualStudioCredential = false,
                ExcludeAzureCliCredential = false,
                ExcludeManagedIdentityCredential = true,
                ExcludeEnvironmentCredential = true
            });

            var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
            dataSourceBuilder.UsePeriodicPasswordProvider(
                async (settings, cancellationToken) =>
                {
                    var context = new TokenRequestContext(new[] { PostgreSqlScope });
                    var token = await credential.GetTokenAsync(context, cancellationToken);
                    Console.WriteLine($"[Design-Time] PostgreSQL token acquired. Expires: {token.ExpiresOn}");
                    return token.Token;
                },
                TimeSpan.FromMinutes(55),
                TimeSpan.FromSeconds(5)
            );

            var dataSource = dataSourceBuilder.Build();

            optionsBuilder.UseNpgsql(dataSource, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
            });
        }
        else
        {
            // Use standard connection string
            optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
            });
        }

        // Create mock services for design time
        var mockUserService = new DesignTimeUserService();
        var mockDateTime = new DesignTimeDateTime();
        var auditInterceptor = new AuditableEntityInterceptor(mockUserService, mockDateTime);

        return new ApplicationDbContext(optionsBuilder.Options, mockUserService, auditInterceptor);
    }
}

/// <summary>
/// Mock user service for design-time operations
/// </summary>
internal class DesignTimeUserService : ICurrentUserService
{
    public ICurrentUser User { get; } = new DesignTimeUser();
}

/// <summary>
/// Mock DateTime service for design-time operations
/// </summary>
internal class DesignTimeDateTime : IDateTime
{
    public DateTime Now => DateTime.Now;
    public DateTime UtcNow => DateTime.UtcNow;
    public DateOnly Today => DateOnly.FromDateTime(DateTime.Today);
}

/// <summary>
/// Mock user for design-time operations
/// </summary>
internal class DesignTimeUser : ICurrentUser
{
    public Guid? UserId => null;
    public Guid? TenantId => null;
    public string? Email => "system@certus.mx";
    public string? Name => "System";
    public IReadOnlyList<string> Roles => Array.Empty<string>();
    public IReadOnlyList<string> Permissions => Array.Empty<string>();
    public bool IsAuthenticated => false;

    public bool HasRole(string role) => false;
    public bool HasPermission(string permission) => false;
    public bool HasAnyRole(params string[] roles) => false;
    public bool HasAnyPermission(params string[] permissions) => false;
}
