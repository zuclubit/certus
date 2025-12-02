using Azure.Extensions.AspNetCore.Configuration.Secrets;
using Azure.Security.KeyVault.Secrets;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Certus.Infrastructure.Configuration;

/// <summary>
/// Azure Key Vault configuration provider for secure secrets management
/// Reference: https://learn.microsoft.com/en-us/aspnet/core/security/key-vault-configuration
/// </summary>
public static class AzureKeyVaultConfiguration
{
    /// <summary>
    /// Adds Azure Key Vault as a configuration source
    /// Uses DefaultAzureCredential for seamless local/cloud authentication
    /// </summary>
    public static IConfigurationBuilder AddAzureKeyVaultConfiguration(
        this IConfigurationBuilder builder,
        IHostEnvironment environment)
    {
        var builtConfig = builder.Build();
        var keyVaultUri = builtConfig["KeyVault:VaultUri"]
            ?? builtConfig["Azure:KeyVault:VaultUri"]
            ?? Environment.GetEnvironmentVariable("KEYVAULT_URI");

        if (string.IsNullOrEmpty(keyVaultUri))
        {
            // Key Vault is optional in development
            if (environment.IsDevelopment())
            {
                Console.WriteLine("Warning: Azure Key Vault URI not configured. Using local secrets.");
                return builder;
            }

            throw new InvalidOperationException(
                "Azure Key Vault URI is required in production. " +
                "Set 'KeyVault:VaultUri' in configuration or 'KEYVAULT_URI' environment variable.");
        }

        var credential = AzureCredentialConfiguration.GetCredential(environment);
        var secretClient = new SecretClient(new Uri(keyVaultUri), credential);

        builder.AddAzureKeyVault(
            secretClient,
            new AzureKeyVaultConfigurationOptions
            {
                // Custom key name transformation: replace '--' with ':'
                // This allows secrets like 'ConnectionStrings--DefaultConnection'
                // to map to 'ConnectionStrings:DefaultConnection' in config
                Manager = new CertusKeyVaultSecretManager()
            });

        return builder;
    }
}

/// <summary>
/// Custom secret manager for Key Vault key name transformation
/// Follows Azure naming conventions and maps to .NET configuration hierarchy
/// </summary>
public class CertusKeyVaultSecretManager : Azure.Extensions.AspNetCore.Configuration.Secrets.KeyVaultSecretManager
{
    /// <summary>
    /// Determines if a secret should be loaded based on its name
    /// </summary>
    public override bool Load(SecretProperties properties)
    {
        // Load all enabled secrets that are not expired
        return properties.Enabled == true &&
               (properties.ExpiresOn == null || properties.ExpiresOn > DateTimeOffset.UtcNow);
    }

    /// <summary>
    /// Transforms secret names to configuration keys
    /// Key Vault: 'ConnectionStrings--DefaultConnection' -> Config: 'ConnectionStrings:DefaultConnection'
    /// </summary>
    public override string GetKey(KeyVaultSecret secret)
    {
        // Replace '--' with ':' for hierarchical configuration
        // Replace '-' with ':' for single-level nesting
        return secret.Name
            .Replace("--", ConfigurationPath.KeyDelimiter)
            .Replace("-", ConfigurationPath.KeyDelimiter);
    }
}
