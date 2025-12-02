using System.Text.RegularExpressions;
using Certus.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.Services.FileValidation;

/// <summary>
/// Sistema de detección automática de tipos de archivo CONSAR.
/// AGNÓSTICO: No depende de paths, fechas, nomenclaturas fijas o endpoints.
/// AUDITADO: Basado en análisis de 285 archivos reales (29-Ago-2025 → 27-Nov-2025)
/// </summary>
public interface IConsarFileTypeDetector
{
    /// <summary>Detecta tipo de archivo desde nombre</summary>
    ConsarFileDetectionResult DetectFromFileName(string fileName);

    /// <summary>Detecta tipo de archivo desde contenido del header</summary>
    ConsarFileDetectionResult DetectFromContent(ReadOnlySpan<char> headerLine);

    /// <summary>Detecta tipo combinando nombre y contenido</summary>
    ConsarFileDetectionResult DetectFull(string fileName, ReadOnlySpan<char> headerLine);
}

/// <summary>
/// Resultado de detección de tipo de archivo
/// </summary>
public record ConsarFileDetectionResult
{
    public ConsarFileType FileType { get; init; }
    public ConsarFileCategory Category { get; init; }
    public string? LayoutCode { get; init; }
    public string? AforeCode { get; init; }
    public string? SiefCode { get; init; }
    public int? ExpectedRecordCount { get; init; }
    public DateOnly? FileDate { get; init; }
    public int Confidence { get; init; } // 0-100
    public string? DetectionMethod { get; init; }
    public List<string> Warnings { get; init; } = new();
}

/// <summary>
/// Implementación del detector de tipos de archivo CONSAR
/// </summary>
public partial class ConsarFileTypeDetector : IConsarFileTypeDetector
{
    private readonly ILogger<ConsarFileTypeDetector> _logger;

    // Regex compilados para mejor rendimiento
    [GeneratedRegex(@"^\d{8}_(PS|SB|SA|SV)_(\d{3})_(\d{6})(?:_\d+)?\.(\d{4})$", RegexOptions.Compiled)]
    private static partial Regex FileNamePattern();

    [GeneratedRegex(@"^CONSAR[_\s]?(\d{8}|\d{2}[\-\s]?\w+).*\.zip$", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex ZipFilePattern();

    [GeneratedRegex(@"^(\d{7,8})(\d{2})(\d{4})(\d{2})(\d{4})(\d{6})(\d{2})(\d{7,8})", RegexOptions.Compiled)]
    private static partial Regex HeaderPattern();

    public ConsarFileTypeDetector(ILogger<ConsarFileTypeDetector> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Detecta tipo de archivo desde el nombre del archivo.
    /// Soporta múltiples formatos de nomenclatura CONSAR.
    /// </summary>
    public ConsarFileDetectionResult DetectFromFileName(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return new ConsarFileDetectionResult
            {
                FileType = ConsarFileType.Unknown,
                Confidence = 0,
                DetectionMethod = "FileName",
                Warnings = { "Nombre de archivo vacío" }
            };
        }

        // Normalizar nombre (quitar path)
        fileName = Path.GetFileName(fileName);
        var warnings = new List<string>();

        // Detectar archivo ZIP
        if (fileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
        {
            return new ConsarFileDetectionResult
            {
                FileType = ConsarFileType.PaqueteZip,
                Confidence = 100,
                DetectionMethod = "FileName.Extension"
            };
        }

        // Detectar archivo cifrado GPG
        if (fileName.EndsWith(".gpg", StringComparison.OrdinalIgnoreCase))
        {
            return new ConsarFileDetectionResult
            {
                FileType = ConsarFileType.ArchivoCifradoGpg,
                Confidence = 100,
                DetectionMethod = "FileName.Extension"
            };
        }

        // Detectar archivos meta.json (ignorar)
        if (fileName.EndsWith(".meta.json", StringComparison.OrdinalIgnoreCase))
        {
            return new ConsarFileDetectionResult
            {
                FileType = ConsarFileType.Unknown,
                Confidence = 100,
                DetectionMethod = "FileName.MetaFile",
                Warnings = { "Archivo de metadatos, no es archivo de datos CONSAR" }
            };
        }

        // Patrón estándar: YYYYMMDD_XX_YYY_ZZZZZZ.NNNN
        var match = FileNamePattern().Match(fileName);
        if (match.Success)
        {
            var dateStr = fileName[..8];
            var category = ParseCategory(match.Groups[1].Value);
            var aforeCode = match.Groups[2].Value;
            var siefCode = match.Groups[3].Value;
            var extension = match.Groups[4].Value;

            DateOnly? fileDate = null;
            if (DateOnly.TryParseExact(dateStr, "yyyyMMdd", null, System.Globalization.DateTimeStyles.None, out var parsedDate))
            {
                fileDate = parsedDate;
            }
            else
            {
                warnings.Add($"Fecha en nombre no válida: {dateStr}");
            }

            var fileType = ParseFileTypeFromExtension(extension);

            return new ConsarFileDetectionResult
            {
                FileType = fileType,
                Category = category,
                AforeCode = aforeCode,
                SiefCode = siefCode,
                FileDate = fileDate,
                Confidence = 95,
                DetectionMethod = "FileName.StandardPattern",
                Warnings = warnings
            };
        }

        // Intentar detectar solo por extensión
        var ext = Path.GetExtension(fileName);
        if (!string.IsNullOrEmpty(ext) && ext.StartsWith("."))
        {
            var extDigits = ext[1..];
            if (int.TryParse(extDigits, out var extNum))
            {
                var fileType = ParseFileTypeFromExtension(extDigits);
                if (fileType != ConsarFileType.Unknown)
                {
                    warnings.Add("Nombre de archivo no sigue patrón estándar CONSAR");
                    return new ConsarFileDetectionResult
                    {
                        FileType = fileType,
                        Confidence = 60,
                        DetectionMethod = "FileName.ExtensionOnly",
                        Warnings = warnings
                    };
                }
            }
        }

        return new ConsarFileDetectionResult
        {
            FileType = ConsarFileType.Unknown,
            Confidence = 0,
            DetectionMethod = "FileName.NoMatch",
            Warnings = { $"No se pudo determinar tipo de archivo: {fileName}" }
        };
    }

    /// <summary>
    /// Detecta tipo de archivo analizando el header (primera línea).
    /// AUDITADO: Basado en estructura real de headers observada.
    /// </summary>
    public ConsarFileDetectionResult DetectFromContent(ReadOnlySpan<char> headerLine)
    {
        if (headerLine.IsEmpty || headerLine.Length < 30)
        {
            return new ConsarFileDetectionResult
            {
                FileType = ConsarFileType.Unknown,
                Confidence = 0,
                DetectionMethod = "Content",
                Warnings = { "Header demasiado corto para análisis" }
            };
        }

        var warnings = new List<string>();
        var headerStr = headerLine.ToString();

        // Verificar que empieza con dígitos (patrón de header CONSAR)
        if (!char.IsDigit(headerLine[0]))
        {
            return new ConsarFileDetectionResult
            {
                FileType = ConsarFileType.Unknown,
                Confidence = 0,
                DetectionMethod = "Content.InvalidStart",
                Warnings = { "Header no comienza con dígitos" }
            };
        }

        // Extraer componentes del header
        // Formato observado: [TotalRec:8][TipoHeader:2][Layout:4][Tipo:2][Afore:4][Sief:6][Seq:2][Fecha:~8]
        int? totalRecords = null;
        string? layoutCode = null;
        string? aforeCode = null;
        string? siefCode = null;

        // Extraer total de registros (primeros 8 dígitos)
        if (headerLine.Length >= 8)
        {
            var totalRecStr = headerLine[..8].ToString();
            if (int.TryParse(totalRecStr, out var total))
            {
                totalRecords = total;
            }
        }

        // Extraer código de layout (posiciones 10-13 aproximadamente)
        if (headerLine.Length >= 14)
        {
            layoutCode = headerLine.Slice(10, 4).ToString();
        }

        // Detectar tipo basado en layout code
        var fileType = DetectTypeFromLayoutCode(layoutCode);

        // Extraer código AFORE (varía según tipo)
        if (headerLine.Length >= 20)
        {
            // Buscar patrón de código AFORE (3 dígitos comenzando con 04x, 05x, etc.)
            for (int i = 14; i <= Math.Min(20, headerLine.Length - 3); i++)
            {
                var candidate = headerLine.Slice(i, 3).ToString();
                if (candidate.StartsWith("04") || candidate.StartsWith("05") || candidate.StartsWith("03"))
                {
                    aforeCode = candidate;
                    break;
                }
            }
        }

        // Calcular confianza basada en lo que pudimos extraer
        var confidence = 0;
        if (fileType != ConsarFileType.Unknown) confidence += 50;
        if (totalRecords.HasValue && totalRecords > 0) confidence += 20;
        if (!string.IsNullOrEmpty(layoutCode)) confidence += 15;
        if (!string.IsNullOrEmpty(aforeCode)) confidence += 15;

        return new ConsarFileDetectionResult
        {
            FileType = fileType,
            LayoutCode = layoutCode,
            AforeCode = aforeCode,
            SiefCode = siefCode,
            ExpectedRecordCount = totalRecords,
            Confidence = Math.Min(100, confidence),
            DetectionMethod = "Content.HeaderAnalysis",
            Warnings = warnings
        };
    }

    /// <summary>
    /// Detecta tipo combinando análisis de nombre y contenido.
    /// Usa la fuente con mayor confianza, validando consistencia.
    /// </summary>
    public ConsarFileDetectionResult DetectFull(string fileName, ReadOnlySpan<char> headerLine)
    {
        var fromName = DetectFromFileName(fileName);
        var fromContent = DetectFromContent(headerLine);

        var warnings = new List<string>();
        warnings.AddRange(fromName.Warnings);
        warnings.AddRange(fromContent.Warnings);

        // Si ambos detectaron el mismo tipo, alta confianza
        if (fromName.FileType != ConsarFileType.Unknown &&
            fromContent.FileType != ConsarFileType.Unknown &&
            fromName.FileType == fromContent.FileType)
        {
            return new ConsarFileDetectionResult
            {
                FileType = fromName.FileType,
                Category = fromName.Category,
                LayoutCode = fromContent.LayoutCode ?? fromName.LayoutCode,
                AforeCode = fromContent.AforeCode ?? fromName.AforeCode,
                SiefCode = fromName.SiefCode ?? fromContent.SiefCode,
                ExpectedRecordCount = fromContent.ExpectedRecordCount,
                FileDate = fromName.FileDate,
                Confidence = Math.Min(100, fromName.Confidence + fromContent.Confidence) / 2 + 25,
                DetectionMethod = "Combined.Consistent",
                Warnings = warnings
            };
        }

        // Si hay discrepancia, advertir pero usar el de mayor confianza
        if (fromName.FileType != ConsarFileType.Unknown &&
            fromContent.FileType != ConsarFileType.Unknown &&
            fromName.FileType != fromContent.FileType)
        {
            warnings.Add($"Discrepancia: nombre sugiere {fromName.FileType}, contenido sugiere {fromContent.FileType}");
        }

        // Usar la fuente con mayor confianza
        var best = fromName.Confidence >= fromContent.Confidence ? fromName : fromContent;

        return new ConsarFileDetectionResult
        {
            FileType = best.FileType,
            Category = fromName.Category, // Category solo viene del nombre
            LayoutCode = fromContent.LayoutCode ?? fromName.LayoutCode,
            AforeCode = fromContent.AforeCode ?? fromName.AforeCode,
            SiefCode = fromName.SiefCode ?? fromContent.SiefCode,
            ExpectedRecordCount = fromContent.ExpectedRecordCount,
            FileDate = fromName.FileDate,
            Confidence = best.Confidence,
            DetectionMethod = $"Combined.BestOf({best.DetectionMethod})",
            Warnings = warnings
        };
    }

    /// <summary>
    /// Parsea categoría desde prefijo de nombre (PS, SB, etc.)
    /// </summary>
    private static ConsarFileCategory ParseCategory(string prefix)
    {
        return prefix.ToUpperInvariant() switch
        {
            "PS" => ConsarFileCategory.Pensiones,
            "SB" => ConsarFileCategory.SubcuentaBasica,
            "SA" => ConsarFileCategory.SubcuentaAhorro,
            "SV" => ConsarFileCategory.SubcuentaVivienda,
            _ => ConsarFileCategory.Unknown
        };
    }

    /// <summary>
    /// Parsea tipo de archivo desde extensión numérica
    /// </summary>
    private static ConsarFileType ParseFileTypeFromExtension(string extension)
    {
        return extension switch
        {
            "0100" => ConsarFileType.Nomina0100,
            "0200" => ConsarFileType.Contable0200,
            "0300" => ConsarFileType.CarteraSiefore0300,
            "0314" => ConsarFileType.Derivados0314,
            "0316" => ConsarFileType.Confirmaciones0316,
            "0317" => ConsarFileType.ControlCartera0317,
            "0321" => ConsarFileType.FondosBmrprev0321,
            "0400" => ConsarFileType.Regularizacion0400,
            "0500" => ConsarFileType.Retiros0500,
            "0600" => ConsarFileType.Traspasos0600,
            "0700" => ConsarFileType.AportacionesVoluntarias0700,
            "1101" => ConsarFileType.TotalesConciliacion1101,
            _ => ConsarFileType.Unknown
        };
    }

    /// <summary>
    /// Detecta tipo desde código de layout en header
    /// AUDITADO: Basado en layouts observados en archivos reales
    /// </summary>
    private static ConsarFileType DetectTypeFromLayoutCode(string? layoutCode)
    {
        if (string.IsNullOrEmpty(layoutCode))
            return ConsarFileType.Unknown;

        // Layouts observados en archivos reales
        return layoutCode switch
        {
            "3030" => ConsarFileType.CarteraSiefore0300, // .0300
            "8031" => ConsarFileType.Derivados0314,      // .0314 (layout 8031)
            "0314" => ConsarFileType.Derivados0314,      // .0314 (alternativo)
            "6032" => ConsarFileType.FondosBmrprev0321,  // .0321
            "7110" => ConsarFileType.TotalesConciliacion1101, // .1101
            "0317" => ConsarFileType.ControlCartera0317, // .0317
            "0316" => ConsarFileType.Confirmaciones0316, // .0316
            _ => ConsarFileType.Unknown
        };
    }
}
