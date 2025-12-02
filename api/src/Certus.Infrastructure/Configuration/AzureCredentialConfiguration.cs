using Azure.Core;
using Azure.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Certus.Infrastructure.Configuration;

/// <summary>
/// Azure credential configuration following 2025 best practices
/// Uses ChainedTokenCredential for optimal performance in both local and cloud environments
/// Reference: https://learn.microsoft.com/en-us/dotnet/azure/sdk/authentication/credential-chains
/// </summary>
public static class AzureCredentialConfiguration
{
    private static TokenCredential? _cachedCredential;
    private static readonly object _lock = new();

    /// <summary>
    /// Gets a cached TokenCredential instance optimized for the current environment
    /// Reusing credentials prevents HTTP 429 throttling from Microsoft Entra ID
    /// </summary>
    public static TokenCredential GetCredential(IHostEnvironment? environment = null)
    {
        if (_cachedCredential != null)
            return _cachedCredential;

        lock (_lock)
        {
            if (_cachedCredential != null)
                return _cachedCredential;

            _cachedCredential = CreateCredential(environment);
            return _cachedCredential;
        }
    }

    /// <summary>
    /// Creates an optimized TokenCredential based on environment
    /// - Production: Uses ManagedIdentityCredential directly for best performance
    /// - Development: Uses ChainedTokenCredential with Azure CLI first for faster auth
    /// </summary>
    private static TokenCredential CreateCredential(IHostEnvironment? environment)
    {
        var isDevelopment = environment?.IsDevelopment() ??
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

        if (isDevelopment)
        {
            // Development: Use ChainedTokenCredential for faster local authentication
            // Azure CLI is typically fastest for local development
            return new ChainedTokenCredential(
                new AzureCliCredential(),
                new VisualStudioCredential(),
                new VisualStudioCodeCredential(),
                new AzureDeveloperCliCredential(),
                // Fallback to DefaultAzureCredential for other scenarios
                new DefaultAzureCredential(new DefaultAzureCredentialOptions
                {
                    ExcludeAzureCliCredential = true,
                    ExcludeVisualStudioCredential = true,
                    ExcludeVisualStudioCodeCredential = true,
                    ExcludeAzureDeveloperCliCredential = true
                })
            );
        }

        // Production: Use ManagedIdentityCredential for best performance and security
        // Check for User-Assigned Managed Identity first
        var userAssignedClientId = Environment.GetEnvironmentVariable("AZURE_CLIENT_ID");

        if (!string.IsNullOrEmpty(userAssignedClientId))
        {
            return new ManagedIdentityCredential(userAssignedClientId);
        }

        // Fall back to System-Assigned Managed Identity
        return new ManagedIdentityCredential();
    }

    /// <summary>
    /// Creates DefaultAzureCredentialOptions optimized for local development
    /// Excludes slow credential types for faster startup
    /// </summary>
    public static DefaultAzureCredentialOptions GetOptimizedOptions(bool isDevelopment)
    {
        if (isDevelopment)
        {
            return new DefaultAzureCredentialOptions
            {
                // Exclude slow/unused credentials for faster local auth
                ExcludeEnvironmentCredential = false,
                ExcludeManagedIdentityCredential = true, // Not available locally
                ExcludeSharedTokenCacheCredential = true,
                ExcludeInteractiveBrowserCredential = true,
                // Keep these for local development
                ExcludeAzureCliCredential = false,
                ExcludeVisualStudioCredential = false,
                ExcludeVisualStudioCodeCredential = false,
                ExcludeAzureDeveloperCliCredential = false,
                // Retry options for better resilience
                Retry =
                {
                    MaxRetries = 3,
                    Delay = TimeSpan.FromSeconds(1),
                    MaxDelay = TimeSpan.FromSeconds(10),
                    Mode = RetryMode.Exponential
                }
            };
        }

        return new DefaultAzureCredentialOptions
        {
            // Production: Use Managed Identity only for best performance
            ExcludeEnvironmentCredential = true,
            ExcludeManagedIdentityCredential = false,
            ExcludeSharedTokenCacheCredential = true,
            ExcludeInteractiveBrowserCredential = true,
            ExcludeAzureCliCredential = true,
            ExcludeVisualStudioCredential = true,
            ExcludeVisualStudioCodeCredential = true,
            ExcludeAzureDeveloperCliCredential = true,
            Retry =
            {
                MaxRetries = 5,
                Delay = TimeSpan.FromSeconds(2),
                MaxDelay = TimeSpan.FromSeconds(30),
                Mode = RetryMode.Exponential
            }
        };
    }

    /// <summary>
    /// Validates that the credential can authenticate successfully
    /// Useful for health checks and startup validation
    /// </summary>
    public static async Task<bool> ValidateCredentialAsync(
        TokenCredential credential,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Request a token for Azure Resource Manager to validate credentials
            var context = new TokenRequestContext(new[] { "https://management.azure.com/.default" });
            var token = await credential.GetTokenAsync(context, cancellationToken);
            return !string.IsNullOrEmpty(token.Token);
        }
        catch
        {
            return false;
        }
    }
}
