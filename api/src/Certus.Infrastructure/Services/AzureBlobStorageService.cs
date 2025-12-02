using System.Security.Cryptography;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Certus.Domain.Services;
using Certus.Infrastructure.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using FileInfo = Certus.Domain.Services.FileInfo;

namespace Certus.Infrastructure.Services;

/// <summary>
/// Azure Blob Storage implementation for file storage
/// Uses DefaultAzureCredential for seamless local/cloud authentication
/// Reference: https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-dotnet-get-started
/// </summary>
public class AzureBlobStorageService : IFileStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;
    private readonly ILogger<AzureBlobStorageService> _logger;

    public AzureBlobStorageService(
        IConfiguration configuration,
        IHostEnvironment environment,
        ILogger<AzureBlobStorageService> logger)
    {
        _logger = logger;
        _containerName = configuration["AzureStorage:ContainerName"]
            ?? configuration["Azure:Storage:ContainerName"]
            ?? "validations";

        // Priority: Connection String > Account Name with Managed Identity
        var connectionString = configuration["AzureStorage:ConnectionString"]
            ?? configuration.GetConnectionString("AzureStorage");

        if (!string.IsNullOrEmpty(connectionString))
        {
            // Development or explicit connection string configuration
            _blobServiceClient = new BlobServiceClient(connectionString);
            _logger.LogInformation("Azure Blob Storage configured with connection string");
        }
        else
        {
            // Production: Use DefaultAzureCredential with optimized settings
            var accountName = configuration["AzureStorage:AccountName"]
                ?? configuration["Azure:Storage:AccountName"]
                ?? throw new InvalidOperationException(
                    "Azure Storage account name is required. " +
                    "Set 'AzureStorage:AccountName' or provide a connection string.");

            var blobUri = new Uri($"https://{accountName}.blob.core.windows.net");
            var credential = AzureCredentialConfiguration.GetCredential(environment);

            _blobServiceClient = new BlobServiceClient(blobUri, credential);
            _logger.LogInformation(
                "Azure Blob Storage configured with DefaultAzureCredential. Account: {AccountName}",
                accountName);
        }

        // Ensure container exists (async initialization)
        EnsureContainerExistsAsync().GetAwaiter().GetResult();
    }

    private async Task EnsureContainerExistsAsync()
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating blob container {Container}", _containerName);
        }
    }

    public async Task<FileUploadResult> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        Guid tenantId,
        string? folder = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);

            // Generate unique blob name
            var safeName = GenerateSafeFileName(fileName);
            var blobPath = string.IsNullOrEmpty(folder)
                ? $"{tenantId}/{safeName}"
                : $"{tenantId}/{folder}/{safeName}";

            var blobClient = containerClient.GetBlobClient(blobPath);

            // Calculate checksum before upload
            fileStream.Position = 0;
            using var sha256 = SHA256.Create();
            var hash = await sha256.ComputeHashAsync(fileStream, cancellationToken);
            var checksum = Convert.ToHexString(hash);

            // Reset stream position for upload
            fileStream.Position = 0;

            // Upload with metadata
            var blobHttpHeaders = new BlobHttpHeaders { ContentType = contentType };
            var metadata = new Dictionary<string, string>
            {
                ["OriginalFileName"] = fileName,
                ["TenantId"] = tenantId.ToString(),
                ["Checksum"] = checksum,
                ["UploadedAt"] = DateTime.UtcNow.ToString("O")
            };

            await blobClient.UploadAsync(
                fileStream,
                new BlobUploadOptions
                {
                    HttpHeaders = blobHttpHeaders,
                    Metadata = metadata
                },
                cancellationToken);

            _logger.LogInformation(
                "File uploaded to Azure Blob: {BlobPath} | Size: {Size}",
                blobPath, fileStream.Length);

            return new FileUploadResult
            {
                Success = true,
                FilePath = blobPath,
                FileName = safeName,
                FileSize = fileStream.Length,
                ContentType = contentType,
                Checksum = checksum
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to Azure Blob: {FileName}", fileName);
            return new FileUploadResult
            {
                Success = false,
                Error = ex.Message
            };
        }
    }

    public async Task<FileDownloadResult> DownloadAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(filePath);

            if (!await blobClient.ExistsAsync(cancellationToken))
            {
                return new FileDownloadResult
                {
                    Success = false,
                    Error = "Archivo no encontrado"
                };
            }

            var properties = await blobClient.GetPropertiesAsync(cancellationToken: cancellationToken);
            var response = await blobClient.OpenReadAsync(cancellationToken: cancellationToken);

            return new FileDownloadResult
            {
                Success = true,
                Stream = response,
                FileName = Path.GetFileName(filePath),
                ContentType = properties.Value.ContentType,
                FileSize = properties.Value.ContentLength
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file from Azure Blob: {FilePath}", filePath);
            return new FileDownloadResult
            {
                Success = false,
                Error = ex.Message
            };
        }
    }

    public async Task<bool> DeleteAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(filePath);

            var response = await blobClient.DeleteIfExistsAsync(
                DeleteSnapshotsOption.IncludeSnapshots,
                cancellationToken: cancellationToken);

            if (response.Value)
            {
                _logger.LogInformation("File deleted from Azure Blob: {FilePath}", filePath);
            }

            return response.Value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from Azure Blob: {FilePath}", filePath);
            return false;
        }
    }

    public async Task<bool> ExistsAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        var blobClient = containerClient.GetBlobClient(filePath);
        return await blobClient.ExistsAsync(cancellationToken);
    }

    public async Task<FileInfo?> GetInfoAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(filePath);

            if (!await blobClient.ExistsAsync(cancellationToken))
                return null;

            var properties = await blobClient.GetPropertiesAsync(cancellationToken: cancellationToken);

            return new FileInfo
            {
                Path = filePath,
                Name = Path.GetFileName(filePath),
                Size = properties.Value.ContentLength,
                ContentType = properties.Value.ContentType,
                CreatedAt = properties.Value.CreatedOn.UtcDateTime,
                ModifiedAt = properties.Value.LastModified.UtcDateTime,
                Checksum = properties.Value.Metadata.TryGetValue("Checksum", out var checksum) ? checksum : null
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting info for Azure Blob: {FilePath}", filePath);
            return null;
        }
    }

    public async Task<string> GenerateDownloadUrlAsync(
        string filePath,
        TimeSpan expiration,
        CancellationToken cancellationToken = default)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        var blobClient = containerClient.GetBlobClient(filePath);

        // Generate SAS token
        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _containerName,
            BlobName = filePath,
            Resource = "b",
            StartsOn = DateTimeOffset.UtcNow.AddMinutes(-5),
            ExpiresOn = DateTimeOffset.UtcNow.Add(expiration)
        };

        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        var sasUri = blobClient.GenerateSasUri(sasBuilder);
        return sasUri.ToString();
    }

    public async Task<string> CopyAsync(
        string sourcePath,
        string destinationPath,
        CancellationToken cancellationToken = default)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        var sourceBlob = containerClient.GetBlobClient(sourcePath);
        var destBlob = containerClient.GetBlobClient(destinationPath);

        var copyOperation = await destBlob.StartCopyFromUriAsync(
            sourceBlob.Uri,
            cancellationToken: cancellationToken);

        await copyOperation.WaitForCompletionAsync(cancellationToken);

        return destinationPath;
    }

    public async Task<string> MoveAsync(
        string sourcePath,
        string destinationPath,
        CancellationToken cancellationToken = default)
    {
        await CopyAsync(sourcePath, destinationPath, cancellationToken);
        await DeleteAsync(sourcePath, cancellationToken);
        return destinationPath;
    }

    private static string GenerateSafeFileName(string fileName)
    {
        var extension = Path.GetExtension(fileName);
        var baseName = Path.GetFileNameWithoutExtension(fileName);

        // Clean name
        var invalidChars = Path.GetInvalidFileNameChars();
        var safeName = string.Join("_", baseName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));

        // Add timestamp for uniqueness
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        var uniqueId = Guid.NewGuid().ToString("N")[..8];

        return $"{safeName}_{timestamp}_{uniqueId}{extension}";
    }
}
