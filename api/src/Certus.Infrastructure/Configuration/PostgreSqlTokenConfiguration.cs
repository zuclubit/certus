using Azure.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Certus.Infrastructure.Configuration;

/// <summary>
/// PostgreSQL configuration with Azure AD/Entra ID token authentication
/// Reference: https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/security-connect-with-managed-identity
/// </summary>
public static class PostgreSqlTokenConfiguration
{
    /// <summary>
    /// Azure PostgreSQL OAuth scope for token requests
    /// </summary>
    private const string PostgreSqlScope = "https://ossrdbms-aad.database.windows.net/.default";

    /// <summary>
    /// Token refresh interval (tokens are valid for 1 hour, refresh at 55 minutes)
    /// </summary>
    private static readonly TimeSpan TokenRefreshInterval = TimeSpan.FromMinutes(55);

    /// <summary>
    /// Configures NpgsqlDataSource with automatic Azure AD token refresh
    /// Uses UsePeriodicPasswordProvider for automatic token management
    /// </summary>
    public static IServiceCollection AddPostgreSqlWithAzureAuth(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var connectionConfig = GetConnectionConfiguration(configuration);

        if (connectionConfig.UseTokenAuth)
        {
            // Use Azure AD token authentication
            services.AddSingleton(sp =>
            {
                var logger = sp.GetRequiredService<ILogger<NpgsqlDataSourceBuilder>>();
                return CreateTokenAuthDataSource(connectionConfig, environment, logger);
            });
        }
        else
        {
            // Use standard connection string (for local development with password)
            services.AddSingleton(sp =>
            {
                var builder = new NpgsqlDataSourceBuilder(connectionConfig.ConnectionString);
                return builder.Build();
            });
        }

        return services;
    }

    /// <summary>
    /// Creates an NpgsqlDataSource with automatic Azure AD token refresh
    /// </summary>
    private static NpgsqlDataSource CreateTokenAuthDataSource(
        PostgreSqlConnectionConfig config,
        IHostEnvironment environment,
        ILogger logger)
    {
        var credential = AzureCredentialConfiguration.GetCredential(environment);

        var builder = new NpgsqlDataSourceBuilder(config.ConnectionString);

        // Configure automatic periodic token refresh
        builder.UsePeriodicPasswordProvider(
            async (settings, cancellationToken) =>
            {
                try
                {
                    var context = new TokenRequestContext(new[] { PostgreSqlScope });
                    var token = await credential.GetTokenAsync(context, cancellationToken);

                    logger.LogDebug(
                        "PostgreSQL token acquired. Expires: {ExpiresOn}",
                        token.ExpiresOn);

                    return token.Token;
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to acquire PostgreSQL access token");
                    throw;
                }
            },
            TokenRefreshInterval,
            TimeSpan.FromSeconds(5) // Failure retry interval
        );

        logger.LogInformation(
            "PostgreSQL configured with Azure AD token authentication. Host: {Host}",
            config.Host);

        return builder.Build();
    }

    /// <summary>
    /// Gets PostgreSQL connection configuration from app settings
    /// </summary>
    private static PostgreSqlConnectionConfig GetConnectionConfiguration(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException(
                "PostgreSQL connection string not found. " +
                "Set 'ConnectionStrings:DefaultConnection' in configuration.");
        }

        // Parse connection string to extract host
        var builder = new NpgsqlConnectionStringBuilder(connectionString);

        // Determine if we should use token auth based on:
        // 1. Explicit configuration
        // 2. Azure PostgreSQL hostname detection
        // 3. Absence of password in connection string
        var useTokenAuth = configuration.GetValue<bool?>("Database:UseAzureTokenAuth")
            ?? IsAzurePostgreSql(builder.Host)
            && string.IsNullOrEmpty(builder.Password);

        return new PostgreSqlConnectionConfig
        {
            ConnectionString = connectionString,
            Host = builder.Host ?? "",
            Database = builder.Database ?? "certus",
            Username = builder.Username ?? "",
            UseTokenAuth = useTokenAuth
        };
    }

    /// <summary>
    /// Checks if the hostname indicates an Azure PostgreSQL server
    /// </summary>
    private static bool IsAzurePostgreSql(string? hostname)
    {
        if (string.IsNullOrEmpty(hostname))
            return false;

        return hostname.EndsWith(".postgres.database.azure.com", StringComparison.OrdinalIgnoreCase) ||
               hostname.EndsWith(".postgres.cosmos.azure.com", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Builds a connection string for Azure PostgreSQL with token auth
    /// </summary>
    public static string BuildAzureConnectionString(
        string host,
        string database,
        string username,
        bool sslMode = true)
    {
        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = host,
            Database = database,
            Username = username,
            SslMode = sslMode ? SslMode.Require : SslMode.Prefer,
            // Connection pooling settings
            Pooling = true,
            MinPoolSize = 1,
            MaxPoolSize = 100,
            ConnectionIdleLifetime = 300,
            ConnectionPruningInterval = 60,
            // Timeout settings
            Timeout = 30,
            CommandTimeout = 60,
            // Keep alive for Azure
            KeepAlive = 60
        };

        return builder.ConnectionString;
    }
}

/// <summary>
/// PostgreSQL connection configuration
/// </summary>
internal class PostgreSqlConnectionConfig
{
    public string ConnectionString { get; init; } = string.Empty;
    public string Host { get; init; } = string.Empty;
    public string Database { get; init; } = string.Empty;
    public string Username { get; init; } = string.Empty;
    public bool UseTokenAuth { get; init; }
}
