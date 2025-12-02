using System.Security.Cryptography;
using Certus.Domain.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using FileInfo = Certus.Domain.Services.FileInfo;

namespace Certus.Infrastructure.Services;

/// <summary>
/// Implementación de almacenamiento de archivos local
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(
        IConfiguration configuration,
        ILogger<LocalFileStorageService> logger)
    {
        _basePath = configuration["FileStorage:BasePath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "storage");
        _logger = logger;

        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
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
            // Generar path seguro
            var safeName = GenerateSafeFileName(fileName);
            var tenantFolder = Path.Combine(_basePath, tenantId.ToString());
            var targetFolder = string.IsNullOrEmpty(folder)
                ? tenantFolder
                : Path.Combine(tenantFolder, folder);

            if (!Directory.Exists(targetFolder))
            {
                Directory.CreateDirectory(targetFolder);
            }

            var filePath = Path.Combine(targetFolder, safeName);
            var relativePath = Path.GetRelativePath(_basePath, filePath);

            // Escribir archivo
            await using var fileStreamOut = new FileStream(filePath, FileMode.Create, FileAccess.Write);
            await fileStream.CopyToAsync(fileStreamOut, cancellationToken);

            // Calcular checksum
            fileStream.Position = 0;
            using var sha256 = SHA256.Create();
            var hash = await sha256.ComputeHashAsync(fileStream, cancellationToken);
            var checksum = Convert.ToHexString(hash);

            _logger.LogInformation("File uploaded: {FilePath} | Size: {Size}", relativePath, fileStream.Length);

            return new FileUploadResult
            {
                Success = true,
                FilePath = relativePath,
                FileName = safeName,
                FileSize = fileStream.Length,
                ContentType = contentType,
                Checksum = checksum
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file: {FileName}", fileName);
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
            var fullPath = Path.Combine(_basePath, filePath);

            if (!File.Exists(fullPath))
            {
                return new FileDownloadResult
                {
                    Success = false,
                    Error = "Archivo no encontrado"
                };
            }

            var fileInfo = new System.IO.FileInfo(fullPath);
            var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);

            return new FileDownloadResult
            {
                Success = true,
                Stream = stream,
                FileName = fileInfo.Name,
                ContentType = GetContentType(fileInfo.Extension),
                FileSize = fileInfo.Length
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file: {FilePath}", filePath);
            return new FileDownloadResult
            {
                Success = false,
                Error = ex.Message
            };
        }
    }

    public Task<bool> DeleteAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("File deleted: {FilePath}", filePath);
                return Task.FromResult(true);
            }

            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file: {FilePath}", filePath);
            return Task.FromResult(false);
        }
    }

    public Task<bool> ExistsAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_basePath, filePath);
        return Task.FromResult(File.Exists(fullPath));
    }

    public Task<FileInfo?> GetInfoAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_basePath, filePath);

        if (!File.Exists(fullPath))
            return Task.FromResult<FileInfo?>(null);

        var fileInfo = new System.IO.FileInfo(fullPath);

        return Task.FromResult<FileInfo?>(new FileInfo
        {
            Path = filePath,
            Name = fileInfo.Name,
            Size = fileInfo.Length,
            ContentType = GetContentType(fileInfo.Extension),
            CreatedAt = fileInfo.CreationTimeUtc,
            ModifiedAt = fileInfo.LastWriteTimeUtc
        });
    }

    public Task<string> GenerateDownloadUrlAsync(
        string filePath,
        TimeSpan expiration,
        CancellationToken cancellationToken = default)
    {
        // Para almacenamiento local, devolver path relativo
        // En producción con Azure Blob, generaría SAS token
        return Task.FromResult($"/api/files/download?path={Uri.EscapeDataString(filePath)}");
    }

    public async Task<string> CopyAsync(
        string sourcePath,
        string destinationPath,
        CancellationToken cancellationToken = default)
    {
        var fullSource = Path.Combine(_basePath, sourcePath);
        var fullDest = Path.Combine(_basePath, destinationPath);

        var destDir = Path.GetDirectoryName(fullDest);
        if (!string.IsNullOrEmpty(destDir) && !Directory.Exists(destDir))
        {
            Directory.CreateDirectory(destDir);
        }

        File.Copy(fullSource, fullDest, overwrite: true);
        return destinationPath;
    }

    public Task<string> MoveAsync(
        string sourcePath,
        string destinationPath,
        CancellationToken cancellationToken = default)
    {
        var fullSource = Path.Combine(_basePath, sourcePath);
        var fullDest = Path.Combine(_basePath, destinationPath);

        var destDir = Path.GetDirectoryName(fullDest);
        if (!string.IsNullOrEmpty(destDir) && !Directory.Exists(destDir))
        {
            Directory.CreateDirectory(destDir);
        }

        File.Move(fullSource, fullDest, overwrite: true);
        return Task.FromResult(destinationPath);
    }

    private static string GenerateSafeFileName(string fileName)
    {
        var extension = Path.GetExtension(fileName);
        var baseName = Path.GetFileNameWithoutExtension(fileName);

        // Limpiar nombre
        var invalidChars = Path.GetInvalidFileNameChars();
        var safeName = string.Join("_", baseName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));

        // Agregar timestamp para unicidad
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        var uniqueId = Guid.NewGuid().ToString("N")[..8];

        return $"{safeName}_{timestamp}_{uniqueId}{extension}";
    }

    private static string GetContentType(string extension)
    {
        return extension.ToLowerInvariant() switch
        {
            ".txt" => "text/plain",
            ".csv" => "text/csv",
            ".xml" => "application/xml",
            ".json" => "application/json",
            ".dat" => "application/octet-stream",
            ".pdf" => "application/pdf",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".xls" => "application/vnd.ms-excel",
            _ => "application/octet-stream"
        };
    }
}
