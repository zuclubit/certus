namespace Certus.Domain.Services;

/// <summary>
/// Servicio de almacenamiento de archivos
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Subir archivo
    /// </summary>
    Task<FileUploadResult> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        Guid tenantId,
        string? folder = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Descargar archivo
    /// </summary>
    Task<FileDownloadResult> DownloadAsync(
        string filePath,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Eliminar archivo
    /// </summary>
    Task<bool> DeleteAsync(
        string filePath,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Verificar si existe archivo
    /// </summary>
    Task<bool> ExistsAsync(
        string filePath,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtener información del archivo
    /// </summary>
    Task<FileInfo?> GetInfoAsync(
        string filePath,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generar URL de descarga temporal
    /// </summary>
    Task<string> GenerateDownloadUrlAsync(
        string filePath,
        TimeSpan expiration,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Copiar archivo
    /// </summary>
    Task<string> CopyAsync(
        string sourcePath,
        string destinationPath,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Mover archivo
    /// </summary>
    Task<string> MoveAsync(
        string sourcePath,
        string destinationPath,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Resultado de carga de archivo
/// </summary>
public class FileUploadResult
{
    public bool Success { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public string Checksum { get; set; } = string.Empty;
    public string? Error { get; set; }
}

/// <summary>
/// Resultado de descarga de archivo
/// </summary>
public class FileDownloadResult
{
    public bool Success { get; set; }
    public Stream? Stream { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? Error { get; set; }
}

/// <summary>
/// Información de archivo
/// </summary>
public class FileInfo
{
    public string Path { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public long Size { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public string? Checksum { get; set; }
    public Dictionary<string, string> Metadata { get; set; } = new();
}
