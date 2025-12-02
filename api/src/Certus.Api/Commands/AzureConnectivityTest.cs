using Azure.Core;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Azure.Storage.Blobs;
using Npgsql;

namespace Certus.Api.Commands;

/// <summary>
/// Azure connectivity test command for validating local development setup
/// Run with: dotnet run -- --test-azure
/// </summary>
public static class AzureConnectivityTest
{
    private const string PostgreSqlScope = "https://ossrdbms-aad.database.windows.net/.default";

    public static async Task<int> RunAsync(IConfiguration configuration, IHostEnvironment environment)
    {
        Console.WriteLine("╔════════════════════════════════════════════════════════════════╗");
        Console.WriteLine("║         Certus API - Azure Connectivity Test                   ║");
        Console.WriteLine("╚════════════════════════════════════════════════════════════════╝");
        Console.WriteLine();

        var hasErrors = false;
        var credential = GetCredential(environment);

        // Test 1: Azure AD Token Acquisition
        Console.WriteLine("[1/4] Testing Azure AD authentication...");
        try
        {
            var context = new TokenRequestContext(new[] { "https://management.azure.com/.default" });
            var token = await credential.GetTokenAsync(context, CancellationToken.None);
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"  ✓ Token acquired. Expires: {token.ExpiresOn:yyyy-MM-dd HH:mm:ss} UTC");
            Console.ResetColor();
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"  ✗ Failed: {ex.Message}");
            Console.ResetColor();
            hasErrors = true;
        }

        // Test 2: Key Vault
        Console.WriteLine("\n[2/4] Testing Key Vault access...");
        var keyVaultUri = configuration["Azure:KeyVault:VaultUri"];
        if (!string.IsNullOrEmpty(keyVaultUri))
        {
            try
            {
                var secretClient = new SecretClient(new Uri(keyVaultUri), credential);
                var secretsPage = secretClient.GetPropertiesOfSecretsAsync();
                var count = 0;
                await foreach (var _ in secretsPage)
                {
                    count++;
                    if (count >= 3) break; // Just test we can list
                }
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"  ✓ Key Vault accessible: {keyVaultUri}");
                Console.WriteLine($"    Secrets found: {count}+");
                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"  ✗ Key Vault error: {ex.Message}");
                Console.ResetColor();
                hasErrors = true;
            }
        }
        else
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("  ⚠ Key Vault URI not configured");
            Console.ResetColor();
        }

        // Test 3: Azure Blob Storage
        Console.WriteLine("\n[3/4] Testing Azure Blob Storage...");
        var storageAccount = configuration["AzureStorage:AccountName"]
            ?? configuration["Azure:Storage:AccountName"];
        var connectionString = configuration["AzureStorage:ConnectionString"]
            ?? configuration.GetConnectionString("AzureStorage");

        if (!string.IsNullOrEmpty(storageAccount) || !string.IsNullOrEmpty(connectionString))
        {
            try
            {
                BlobServiceClient blobClient;
                if (!string.IsNullOrEmpty(connectionString))
                {
                    blobClient = new BlobServiceClient(connectionString);
                    Console.WriteLine("  Using connection string...");
                }
                else
                {
                    var blobUri = new Uri($"https://{storageAccount}.blob.core.windows.net");
                    blobClient = new BlobServiceClient(blobUri, credential);
                    Console.WriteLine($"  Using DefaultAzureCredential for {storageAccount}...");
                }

                var containers = blobClient.GetBlobContainersAsync();
                var containerNames = new List<string>();
                await foreach (var container in containers)
                {
                    containerNames.Add(container.Name);
                    if (containerNames.Count >= 5) break;
                }

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"  ✓ Blob Storage accessible");
                Console.WriteLine($"    Containers: {string.Join(", ", containerNames)}");
                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"  ✗ Blob Storage error: {ex.Message}");
                Console.ResetColor();
                hasErrors = true;
            }
        }
        else
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("  ⚠ Storage account not configured");
            Console.ResetColor();
        }

        // Test 4: PostgreSQL with Azure AD Token
        Console.WriteLine("\n[4/4] Testing PostgreSQL connection...");
        var useTokenAuth = configuration.GetValue<bool>("Database:UseAzureTokenAuth");
        var pgConnectionString = configuration.GetConnectionString("DefaultConnection");

        if (!string.IsNullOrEmpty(pgConnectionString))
        {
            try
            {
                var builder = new NpgsqlConnectionStringBuilder(pgConnectionString);

                if (useTokenAuth)
                {
                    Console.WriteLine("  Using Azure AD token authentication...");
                    var context = new TokenRequestContext(new[] { PostgreSqlScope });
                    var token = await credential.GetTokenAsync(context, CancellationToken.None);
                    builder.Password = token.Token;
                }

                await using var conn = new NpgsqlConnection(builder.ConnectionString);
                await conn.OpenAsync();

                var cmd = new NpgsqlCommand("SELECT version(), current_database(), current_user", conn);
                await using var reader = await cmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    var version = reader.GetString(0);
                    var database = reader.GetString(1);
                    var user = reader.GetString(2);

                    // Parse PostgreSQL version
                    var versionShort = version.Split(' ').Take(2).Aggregate((a, b) => $"{a} {b}");

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine($"  ✓ PostgreSQL connection successful");
                    Console.WriteLine($"    Version: {versionShort}");
                    Console.WriteLine($"    Database: {database}");
                    Console.WriteLine($"    User: {user}");
                    Console.ResetColor();
                }
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"  ✗ PostgreSQL error: {ex.Message}");
                Console.ResetColor();
                hasErrors = true;
            }
        }
        else
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("  ⚠ PostgreSQL connection string not configured");
            Console.ResetColor();
        }

        // Summary
        Console.WriteLine("\n════════════════════════════════════════════════════════════════");
        if (hasErrors)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("Some tests failed. Check the errors above.");
            Console.ResetColor();
            return 1;
        }

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("All connectivity tests passed! ✓");
        Console.ResetColor();
        Console.WriteLine("\nYou can now run the API: dotnet run");
        return 0;
    }

    private static TokenCredential GetCredential(IHostEnvironment environment)
    {
        if (environment.IsDevelopment())
        {
            // Optimized chain for faster local development
            return new ChainedTokenCredential(
                new AzureCliCredential(),
                new VisualStudioCredential(),
                new VisualStudioCodeCredential(),
                new AzureDeveloperCliCredential());
        }

        return new ManagedIdentityCredential();
    }
}
