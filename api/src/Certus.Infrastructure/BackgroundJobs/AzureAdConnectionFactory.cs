using Hangfire.PostgreSql;
using Npgsql;

namespace Certus.Infrastructure.BackgroundJobs;

/// <summary>
/// Connection factory for Hangfire that uses NpgsqlDataSource with Azure AD token authentication.
/// This ensures Hangfire can use the same Azure AD authenticated connections as the rest of the application.
/// </summary>
public class AzureAdConnectionFactory : IConnectionFactory
{
    private readonly NpgsqlDataSource _dataSource;

    public AzureAdConnectionFactory(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource ?? throw new ArgumentNullException(nameof(dataSource));
    }

    public NpgsqlConnection GetOrCreateConnection()
    {
        return _dataSource.OpenConnection();
    }
}
