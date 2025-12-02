using System.Runtime.CompilerServices;
using System.Text;
using Certus.Domain.Common;
using Certus.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.Services.FileValidation;

/// <summary>
/// Parser universal para archivos CONSAR.
/// AGNÓSTICO: No depende de tipos hardcodeados, usa esquemas configurables.
/// RESILIENTE: Maneja cambios en formatos con fallback y logging.
/// AUDITADO: Basado en 285 archivos reales (29-Ago-2025 → 27-Nov-2025)
/// </summary>
public interface IConsarUniversalParser
{
    /// <summary>Parsea archivo con detección automática de tipo</summary>
    Task<ConsarParseResult> ParseAsync(
        Stream stream,
        string? fileName = null,
        CancellationToken cancellationToken = default);

    /// <summary>Parsea archivo con tipo específico</summary>
    Task<ConsarParseResult> ParseAsync(
        Stream stream,
        ConsarFileType fileType,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Resultado del parsing universal
/// </summary>
public class ConsarParseResult
{
    public bool Success { get; init; }
    public ConsarFileType DetectedFileType { get; init; }
    public ConsarFileCategory Category { get; init; }
    public ConsarFileDetectionResult? Detection { get; init; }
    public ConsarHeaderInfo? Header { get; init; }
    public List<ConsarRecord> Records { get; init; } = new();
    public List<ConsarParseWarning> Warnings { get; init; } = new();
    public List<ConsarParseError> Errors { get; init; } = new();
    public int TotalLines { get; init; }
    public int ParsedRecords => Records.Count;
    public int FailedLines => Errors.Count;
    public TimeSpan ParseDuration { get; init; }
}

/// <summary>
/// Información del header del archivo
/// </summary>
public class ConsarHeaderInfo
{
    public int? TotalRecords { get; init; }
    public string? HeaderType { get; init; }
    public string? LayoutCode { get; init; }
    public string? AforeCode { get; init; }
    public string? SiefCode { get; init; }
    public string? Sequence { get; init; }
    public DateOnly? FileDate { get; init; }
    public string RawHeader { get; init; } = string.Empty;
}

/// <summary>
/// Registro parseado universal
/// </summary>
public class ConsarRecord
{
    public int LineNumber { get; set; }
    public string RecordTypeCode { get; set; } = string.Empty;
    public string RecordCategory { get; set; } = string.Empty;
    public Dictionary<string, object?> Fields { get; set; } = new();
    public string RawLine { get; set; } = string.Empty;
    public bool IsValid { get; set; } = true;
    public List<string> ValidationMessages { get; set; } = new();

    public T? GetField<T>(string fieldName)
    {
        if (Fields.TryGetValue(fieldName, out var value) && value is T typedValue)
            return typedValue;
        return default;
    }

    public void SetField(string fieldName, object? value) => Fields[fieldName] = value;
}

/// <summary>
/// Advertencia durante parsing
/// </summary>
public record ConsarParseWarning(int LineNumber, string Code, string Message);

/// <summary>
/// Error durante parsing
/// </summary>
public record ConsarParseError(int LineNumber, string Code, string Message, string? RawLine = null);

/// <summary>
/// Implementación del parser universal
/// </summary>
public class ConsarUniversalParser : IConsarUniversalParser
{
    private readonly IConsarFileTypeDetector _typeDetector;
    private readonly ILogger<ConsarUniversalParser> _logger;

    public ConsarUniversalParser(
        IConsarFileTypeDetector typeDetector,
        ILogger<ConsarUniversalParser> logger)
    {
        _typeDetector = typeDetector;
        _logger = logger;
    }

    public async Task<ConsarParseResult> ParseAsync(
        Stream stream,
        string? fileName = null,
        CancellationToken cancellationToken = default)
    {
        var startTime = DateTime.UtcNow;
        var warnings = new List<ConsarParseWarning>();
        var errors = new List<ConsarParseError>();
        var records = new List<ConsarRecord>();

        using var reader = new StreamReader(stream, Encoding.GetEncoding("ISO-8859-1"), detectEncodingFromByteOrderMarks: false);

        // Leer primera línea para detección
        var firstLine = await reader.ReadLineAsync(cancellationToken);
        if (string.IsNullOrEmpty(firstLine))
        {
            return new ConsarParseResult
            {
                Success = false,
                Errors = { new ConsarParseError(0, "EMPTY_FILE", "Archivo vacío") },
                ParseDuration = DateTime.UtcNow - startTime
            };
        }

        // Detectar tipo
        var detection = _typeDetector.DetectFull(fileName ?? "unknown", firstLine.AsSpan());
        warnings.AddRange(detection.Warnings.Select(w => new ConsarParseWarning(0, "DETECTION", w)));

        if (detection.FileType == ConsarFileType.Unknown)
        {
            _logger.LogWarning("No se pudo detectar tipo de archivo: {FileName}", fileName);
        }

        // Parsear header
        var header = ParseHeader(firstLine, detection);

        // Parsear resto del archivo
        var lineNumber = 1;
        string? line;

        while ((line = await reader.ReadLineAsync(cancellationToken)) != null)
        {
            cancellationToken.ThrowIfCancellationRequested();
            lineNumber++;

            if (string.IsNullOrWhiteSpace(line))
                continue;

            try
            {
                var record = ParseRecord(line, lineNumber, detection.FileType);
                if (record.IsValid)
                {
                    records.Add(record);
                }
                else
                {
                    warnings.AddRange(record.ValidationMessages.Select(m =>
                        new ConsarParseWarning(lineNumber, "VALIDATION", m)));
                    records.Add(record); // Agregamos aunque no sea válido
                }
            }
            catch (Exception ex)
            {
                errors.Add(new ConsarParseError(lineNumber, "PARSE_ERROR", ex.Message, line));
            }
        }

        // Validar conteo de registros si está disponible
        if (header.TotalRecords.HasValue && records.Count != header.TotalRecords.Value - 1) // -1 por header
        {
            warnings.Add(new ConsarParseWarning(0, "RECORD_COUNT",
                $"Registros esperados: {header.TotalRecords}, encontrados: {records.Count + 1}"));
        }

        var duration = DateTime.UtcNow - startTime;

        _logger.LogInformation(
            "Parseado archivo {FileType}: {Records} registros, {Warnings} advertencias, {Errors} errores en {Duration}ms",
            detection.FileType, records.Count, warnings.Count, errors.Count, duration.TotalMilliseconds);

        return new ConsarParseResult
        {
            Success = errors.Count == 0,
            DetectedFileType = detection.FileType,
            Category = detection.Category,
            Detection = detection,
            Header = header,
            Records = records,
            Warnings = warnings,
            Errors = errors,
            TotalLines = lineNumber,
            ParseDuration = duration
        };
    }

    public async Task<ConsarParseResult> ParseAsync(
        Stream stream,
        ConsarFileType fileType,
        CancellationToken cancellationToken = default)
    {
        // Crear detección manual
        var startTime = DateTime.UtcNow;
        var warnings = new List<ConsarParseWarning>();
        var errors = new List<ConsarParseError>();
        var records = new List<ConsarRecord>();

        using var reader = new StreamReader(stream, Encoding.GetEncoding("ISO-8859-1"), detectEncodingFromByteOrderMarks: false);

        var firstLine = await reader.ReadLineAsync(cancellationToken);
        if (string.IsNullOrEmpty(firstLine))
        {
            return new ConsarParseResult
            {
                Success = false,
                DetectedFileType = fileType,
                Errors = { new ConsarParseError(0, "EMPTY_FILE", "Archivo vacío") },
                ParseDuration = DateTime.UtcNow - startTime
            };
        }

        var detection = new ConsarFileDetectionResult
        {
            FileType = fileType,
            Confidence = 100,
            DetectionMethod = "Manual"
        };

        var header = ParseHeader(firstLine, detection);

        var lineNumber = 1;
        string? line;

        while ((line = await reader.ReadLineAsync(cancellationToken)) != null)
        {
            cancellationToken.ThrowIfCancellationRequested();
            lineNumber++;

            if (string.IsNullOrWhiteSpace(line))
                continue;

            try
            {
                var record = ParseRecord(line, lineNumber, fileType);
                records.Add(record);

                if (!record.IsValid)
                {
                    warnings.AddRange(record.ValidationMessages.Select(m =>
                        new ConsarParseWarning(lineNumber, "VALIDATION", m)));
                }
            }
            catch (Exception ex)
            {
                errors.Add(new ConsarParseError(lineNumber, "PARSE_ERROR", ex.Message, line));
            }
        }

        return new ConsarParseResult
        {
            Success = errors.Count == 0,
            DetectedFileType = fileType,
            Detection = detection,
            Header = header,
            Records = records,
            Warnings = warnings,
            Errors = errors,
            TotalLines = lineNumber,
            ParseDuration = DateTime.UtcNow - startTime
        };
    }

    /// <summary>
    /// Parsea header del archivo
    /// </summary>
    private ConsarHeaderInfo ParseHeader(string headerLine, ConsarFileDetectionResult detection)
    {
        var header = new ConsarHeaderInfo { RawHeader = headerLine };

        if (headerLine.Length < 8)
            return header;

        // Extraer total de registros (primeros 8 dígitos)
        int? totalRecords = null;
        if (int.TryParse(headerLine.AsSpan(0, 8), out var total))
        {
            totalRecords = total;
        }

        // Extraer layout code (posiciones 10-13)
        string? layoutCode = null;
        if (headerLine.Length >= 14)
        {
            layoutCode = headerLine.Substring(10, 4);
        }

        // Extraer código AFORE (buscar patrón 04x, 05x, 03x)
        string? aforeCode = detection.AforeCode;
        if (string.IsNullOrEmpty(aforeCode) && headerLine.Length >= 20)
        {
            for (int i = 14; i <= Math.Min(20, headerLine.Length - 4); i++)
            {
                var candidate = headerLine.Substring(i, 4);
                if (candidate.StartsWith("044") || candidate.StartsWith("053") || candidate.StartsWith("043"))
                {
                    aforeCode = candidate[..3];
                    break;
                }
            }
        }

        return new ConsarHeaderInfo
        {
            TotalRecords = totalRecords,
            LayoutCode = layoutCode ?? detection.LayoutCode,
            AforeCode = aforeCode,
            SiefCode = detection.SiefCode,
            FileDate = detection.FileDate,
            RawHeader = headerLine
        };
    }

    /// <summary>
    /// Parsea un registro según el tipo de archivo.
    /// AUDITADO: Usa tipos de registro reales observados.
    /// </summary>
    private ConsarRecord ParseRecord(string line, int lineNumber, ConsarFileType fileType)
    {
        var record = new ConsarRecord
        {
            LineNumber = lineNumber,
            RawLine = line
        };

        // Determinar tipo de registro desde prefijo
        var recordTypeCode = GetRecordTypeCode(line, fileType);
        record.RecordTypeCode = recordTypeCode;
        record.RecordCategory = GetRecordCategory(recordTypeCode, fileType);

        // Parsear campos según tipo de archivo y registro
        switch (fileType)
        {
            case ConsarFileType.CarteraSiefore0300:
                ParseCartera0300Record(record, line);
                break;

            case ConsarFileType.Derivados0314:
                ParseDerivados0314Record(record, line);
                break;

            case ConsarFileType.FondosBmrprev0321:
                ParseBmrprev0321Record(record, line);
                break;

            case ConsarFileType.TotalesConciliacion1101:
                ParseTotales1101Record(record, line);
                break;

            default:
                // Parser genérico para tipos no específicos
                ParseGenericRecord(record, line);
                break;
        }

        return record;
    }

    /// <summary>
    /// Obtiene código de tipo de registro según tipo de archivo.
    /// AUDITADO: Longitudes de código basadas en archivos reales.
    /// </summary>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static string GetRecordTypeCode(string line, ConsarFileType fileType)
    {
        if (line.Length < 3) return "UNK";

        return fileType switch
        {
            // .0300 usa 3-4 caracteres: 301M, 3020, 3030, etc.
            ConsarFileType.CarteraSiefore0300 => line.Length >= 4 ? line[..4] : line[..3],

            // .0314 usa 4 caracteres: 3010, 3020, 3030, etc.
            ConsarFileType.Derivados0314 => line.Length >= 4 ? line[..4] : line[..3],

            // .0321 usa 3 caracteres: 301
            ConsarFileType.FondosBmrprev0321 => line[..3],

            // .1101 usa 5 caracteres: 30111, 30112, etc.
            ConsarFileType.TotalesConciliacion1101 => line.Length >= 5 ? line[..5] : line[..3],

            // Default: 3 caracteres
            _ => line[..3]
        };
    }

    /// <summary>
    /// Obtiene categoría descriptiva del registro
    /// </summary>
    private static string GetRecordCategory(string recordTypeCode, ConsarFileType fileType)
    {
        if (fileType == ConsarFileType.CarteraSiefore0300)
        {
            if (recordTypeCode.StartsWith("301")) return "Gobierno";
            if (recordTypeCode.StartsWith("302")) return "Otros";
            if (recordTypeCode.StartsWith("303")) return "RentaVariable";
            if (recordTypeCode.StartsWith("304")) return "Estructurados";
            if (recordTypeCode.StartsWith("307")) return "ETFInternacional";
            if (recordTypeCode.StartsWith("308")) return "RVInternacional";
            if (recordTypeCode.StartsWith("309")) return "Totales";
            return "Desconocido";
        }

        if (fileType == ConsarFileType.Derivados0314)
        {
            return recordTypeCode switch
            {
                "3010" => "Forward",
                "3020" => "Futuro",
                "3030" => "Swap",
                "3040" => "Opcion",
                "3050" => "Colateral",
                "3061" => "Totales",
                "3062" => "Control",
                "3081" => "Adicional81",
                "3110" => "Adicional110",
                _ => "Desconocido"
            };
        }

        return "General";
    }

    #region Parsers específicos por tipo de archivo

    /// <summary>
    /// Parsea registro de Cartera SIEFORE (.0300)
    /// AUDITADO: Posiciones basadas en archivos reales
    /// </summary>
    private void ParseCartera0300Record(ConsarRecord record, string line)
    {
        if (line.Length < 20)
        {
            record.IsValid = false;
            record.ValidationMessages.Add("Línea demasiado corta para .0300");
            return;
        }

        var typeCode = record.RecordTypeCode;

        // Registros tipo 301 (Gobierno) - empiezan con "301"
        if (typeCode.StartsWith("301"))
        {
            ParseCartera301(record, line);
        }
        // Registros tipo 302 (Otros) - empiezan con "302"
        else if (typeCode.StartsWith("302"))
        {
            ParseCartera302(record, line);
        }
        // Registros tipo 303 (Renta Variable) - empiezan con "303"
        else if (typeCode.StartsWith("303"))
        {
            ParseCartera303(record, line);
        }
        // Registros tipo 307 (ETF Internacional) - empiezan con "307"
        else if (typeCode.StartsWith("307"))
        {
            ParseCartera307(record, line);
        }
        // Registros tipo 308 (RV Internacional) - empiezan con "308"
        else if (typeCode.StartsWith("308"))
        {
            ParseCartera308(record, line);
        }
        // Registros tipo 309 (Totales) - empiezan con "309"
        else if (typeCode.StartsWith("309"))
        {
            ParseCartera309(record, line);
        }
        else
        {
            record.ValidationMessages.Add($"Tipo de registro no reconocido: {typeCode}");
        }
    }

    private void ParseCartera301(ConsarRecord record, string line)
    {
        // Tipo 301 - Instrumentos Gubernamentales
        // Formato observado: 301MXBIGO000X350        0      BI  CETES  260108...

        record.SetField("Categoria", "Gobierno");

        if (line.Length < 3) return;

        // ISIN (posición 3, longitud 15)
        if (line.Length >= 18)
            record.SetField("ISIN", line.Substring(3, 15).Trim());

        // Serie (posición 18, longitud 8)
        if (line.Length >= 26)
            record.SetField("Serie", line.Substring(18, 8).Trim());

        // Tipo Emisor (posición 26, longitud 6)
        if (line.Length >= 32)
            record.SetField("TipoEmisor", line.Substring(26, 6).Trim());

        // Emisora (posición 32, longitud 7)
        if (line.Length >= 39)
            record.SetField("Emisora", line.Substring(32, 7).Trim());

        // Fecha Vencimiento YYMMDD (posición 39, longitud 6)
        if (line.Length >= 45)
        {
            var fechaStr = line.Substring(39, 6).Trim();
            record.SetField("FechaVencimientoRaw", fechaStr);
            if (DateOnly.TryParseExact(fechaStr, "yyMMdd", null, System.Globalization.DateTimeStyles.None, out var fecha))
                record.SetField("FechaVencimiento", fecha);
        }

        // Valores numéricos (posiciones aproximadas basadas en análisis)
        if (line.Length >= 200)
        {
            // Títulos/Cantidad
            record.SetField("TitulosTotales", ParseLong(line.AsSpan(47, 18)));

            // Valor Nominal
            record.SetField("ValorNominal", ParseDecimal(line.AsSpan(65, 18), 2));

            // Precio Unitario
            record.SetField("PrecioUnitario", ParseDecimal(line.AsSpan(83, 18), 8));

            // Valor Mercado
            record.SetField("ValorMercado", ParseDecimal(line.AsSpan(101, 18), 2));

            // Intereses Devengados
            record.SetField("InteresesDevengados", ParseDecimal(line.AsSpan(119, 18), 2));

            // Valor Total
            record.SetField("ValorTotal", ParseDecimal(line.AsSpan(137, 18), 2));
        }

        // Flags de identificación
        var emisora = record.GetField<string>("Emisora") ?? "";
        record.SetField("EsCETE", emisora.Contains("CETE"));
        record.SetField("EsBONO", emisora.Contains("BONO"));
        record.SetField("EsUDIBONO", emisora.Contains("UDI"));
    }

    private void ParseCartera302(ConsarRecord record, string line)
    {
        // Tipo 302 - Otros instrumentos
        record.SetField("Categoria", "Otros");

        if (line.Length < 4) return;

        // Subcategoría (4-8)
        record.SetField("Subcategoria", line.Substring(3, Math.Min(6, line.Length - 3)).Trim());

        if (line.Length >= 27)
        {
            // ISIN o código referencia
            record.SetField("ISIN", line.Substring(12, 15).Trim());
        }

        if (line.Length >= 60)
        {
            // Nombre instrumento
            record.SetField("NombreInstrumento", line.Substring(40, Math.Min(10, line.Length - 40)).Trim());
        }

        // Identificar tipo especial
        var lineContent = line.ToUpperInvariant();
        record.SetField("EsEfectivo", lineContent.Contains("EFECTIV"));
        record.SetField("EsBMRPREV", lineContent.Contains("BMRPREV"));
        record.SetField("EsDerivadoRef", lineContent.Contains("CSPMXP") || lineContent.Contains("SPOT"));
    }

    private void ParseCartera303(ConsarRecord record, string line)
    {
        // Tipo 303 - Renta Variable Nacional
        record.SetField("Categoria", "RentaVariable");

        if (line.Length < 10) return;

        // Subcategoría (posición 3-7)
        if (line.Length >= 7)
            record.SetField("Subcategoria", line.Substring(3, 4).Trim());

        // ISIN (posición 7-22)
        if (line.Length >= 22)
            record.SetField("ISIN", line.Substring(7, 15).Trim());

        // CUSIP o código adicional (posición 22-30)
        if (line.Length >= 30)
        {
            var cusipSection = line.Substring(22, 8).Trim();
            if (long.TryParse(cusipSection, out var cusipNum) && cusipNum > 0)
                record.SetField("CUSIP", cusipSection);
        }

        // Ticker (posición 30-40)
        if (line.Length >= 40)
            record.SetField("Ticker", line.Substring(30, 10).Trim());

        // Serie (posición 40-42)
        if (line.Length >= 42)
            record.SetField("Serie", line.Substring(40, 2).Trim());

        // Valores numéricos
        if (line.Length >= 150)
        {
            record.SetField("NumeroAcciones", ParseLong(line.AsSpan(42, 16)));
            record.SetField("CostoUnitario", ParseDecimal(line.AsSpan(58, 18), 8));
            record.SetField("CostoTotal", ParseDecimal(line.AsSpan(76, 18), 2));
            record.SetField("PrecioMercado", ParseDecimal(line.AsSpan(94, 18), 8));
            record.SetField("ValorMercado", ParseDecimal(line.AsSpan(112, 18), 2));
            record.SetField("GananciaNoRealizada", ParseDecimal(line.AsSpan(130, 18), 2));
        }
    }

    private void ParseCartera307(ConsarRecord record, string line)
    {
        // Tipo 307 - ETFs Internacionales
        record.SetField("Categoria", "ETFInternacional");

        if (line.Length < 22) return;

        // ISIN internacional (posición 7-22)
        var isin = line.Substring(7, 15).Trim();
        record.SetField("ISIN", isin);

        // País de emisión desde ISIN
        if (isin.Length >= 2)
            record.SetField("PaisEmision", isin[..2]);

        // Nombre ETF (posición 30-45)
        if (line.Length >= 45)
            record.SetField("NombreETF", line.Substring(30, 15).Trim());

        // Valores numéricos
        if (line.Length >= 160)
        {
            record.SetField("NumeroUnidades", ParseLong(line.AsSpan(50, 18)));
            record.SetField("CostoMonedaOriginal", ParseDecimal(line.AsSpan(68, 18), 2));
            record.SetField("CostoMXN", ParseDecimal(line.AsSpan(86, 18), 2));
            record.SetField("ValorMercadoMXN", ParseDecimal(line.AsSpan(122, 18), 2));
        }

        // Flags
        record.SetField("EsUSA", isin.StartsWith("US"));
        record.SetField("EsEuropa", isin.StartsWith("IE") || isin.StartsWith("FR") || isin.StartsWith("LU"));
    }

    private void ParseCartera308(ConsarRecord record, string line)
    {
        // Tipo 308 - Renta Variable Internacional
        record.SetField("Categoria", "RVInternacional");

        if (line.Length < 22) return;

        var isin = line.Substring(7, 15).Trim();
        record.SetField("ISIN", isin);

        if (isin.Length >= 2)
            record.SetField("PaisEmision", isin[..2]);

        if (line.Length >= 50)
            record.SetField("NombreEmpresa", line.Substring(30, 20).Trim());

        if (line.Length >= 55)
            record.SetField("Bolsa", line.Substring(50, 5).Trim());

        record.SetField("EsADR", isin.StartsWith("US"));
    }

    private void ParseCartera309(ConsarRecord record, string line)
    {
        // Tipo 309 - Totales
        record.SetField("Categoria", "Totales");
        record.SetField("EsRegistroControl", true);

        if (line.Length >= 51)
        {
            record.SetField("TipoTotales", line.Substring(3, 4).Trim());
            record.SetField("TotalRegistros", ParseLong(line.AsSpan(7, 8)));
            record.SetField("TotalValorMercado", ParseDecimal(line.AsSpan(15, 18), 2));
            record.SetField("TotalValorNominal", ParseDecimal(line.AsSpan(33, 18), 2));
        }
    }

    /// <summary>
    /// Parsea registro de Derivados (.0314)
    /// </summary>
    private void ParseDerivados0314Record(ConsarRecord record, string line)
    {
        var typeCode = record.RecordTypeCode;

        switch (typeCode)
        {
            case "3010":
                ParseForward3010(record, line);
                break;
            case "3020":
                ParseFuturo3020(record, line);
                break;
            case "3030":
                ParseSwap3030(record, line);
                break;
            case "3040":
                ParseOpcion3040(record, line);
                break;
            case "3050":
                ParseColateral3050(record, line);
                break;
            case "3061":
            case "3062":
                ParseDerivadosTotales(record, line);
                break;
            case "3081":
            case "3110":
                // Tipos adicionales observados - parsing genérico
                record.SetField("TipoAdicional", typeCode);
                ParseGenericRecord(record, line);
                break;
            default:
                record.ValidationMessages.Add($"Tipo de derivado no reconocido: {typeCode}");
                break;
        }
    }

    private void ParseForward3010(ConsarRecord record, string line)
    {
        record.SetField("TipoDerivado", "Forward");

        if (line.Length < 100) return;

        // Tipo Forward (posición ~22-26)
        if (line.Length >= 30)
            record.SetField("TipoForward", line.Substring(22, 4).Trim());

        // Par de divisas (posición ~26-32)
        if (line.Length >= 38)
        {
            var currencyPair = line.Substring(26, 6).Trim();
            record.SetField("ParDivisas", currencyPair);

            if (currencyPair.Length >= 6)
            {
                record.SetField("MonedaBase", currencyPair[..3]);
                record.SetField("MonedaCotizada", currencyPair[3..]);
            }
        }

        // LEI Contraparte (20 caracteres, posición ~50-70)
        if (line.Length >= 70)
        {
            var lei = line.Substring(50, 20).Trim();
            record.SetField("LEIContraparte", lei);
            record.SetField("LEIValido", !string.IsNullOrEmpty(lei) && lei.Length == 20);
        }

        // Flags
        var parDivisas = record.GetField<string>("ParDivisas") ?? "";
        record.SetField("EsFXForward", parDivisas.Contains("USD") || parDivisas.Contains("EUR") || parDivisas.Contains("JPY"));
    }

    private void ParseFuturo3020(ConsarRecord record, string line)
    {
        record.SetField("TipoDerivado", "Futuro");

        if (line.Length >= 65)
        {
            record.SetField("CodigoContrato", line.Substring(4, 16).Trim());
            record.SetField("SubyacenteCodigo", line.Substring(20, 15).Trim());
            record.SetField("Bolsa", line.Substring(35, 10).Trim());
            record.SetField("MesVencimiento", line.Substring(45, 6).Trim());
            record.SetField("NumeroContratos", ParseLong(line.AsSpan(51, 14)));
        }
    }

    private void ParseSwap3030(ConsarRecord record, string line)
    {
        record.SetField("TipoDerivado", "Swap");

        if (line.Length >= 66)
        {
            record.SetField("TipoSwap", line.Substring(4, 6).Trim());
            record.SetField("IdContrato", line.Substring(10, 20).Trim());
            record.SetField("LEIContraparte", line.Substring(30, 20).Trim());

            var fechaEfectivaStr = line.Substring(50, 8).Trim();
            if (DateOnly.TryParseExact(fechaEfectivaStr, "yyyyMMdd", null, System.Globalization.DateTimeStyles.None, out var fechaEf))
                record.SetField("FechaEfectiva", fechaEf);

            var fechaVencStr = line.Substring(58, 8).Trim();
            if (DateOnly.TryParseExact(fechaVencStr, "yyyyMMdd", null, System.Globalization.DateTimeStyles.None, out var fechaVenc))
                record.SetField("FechaVencimiento", fechaVenc);
        }
    }

    private void ParseOpcion3040(ConsarRecord record, string line)
    {
        record.SetField("TipoDerivado", "Opcion");

        if (line.Length >= 10)
        {
            record.SetField("TipoOpcion", line.Substring(4, 1).Trim() == "C" ? "Call" : "Put");
            record.SetField("EstiloOpcion", line.Substring(5, 1).Trim() == "E" ? "Europeo" : "Americano");
        }

        if (line.Length >= 21)
            record.SetField("SubyacenteCodigo", line.Substring(6, 15).Trim());

        if (line.Length >= 61)
            record.SetField("LEIContraparte", line.Substring(41, 20).Trim());
    }

    private void ParseColateral3050(ConsarRecord record, string line)
    {
        record.SetField("TipoDerivado", "Colateral");

        if (line.Length >= 50)
        {
            record.SetField("TipoColateral", line.Substring(4, 6).Trim());
            record.SetField("IdContratoRelacionado", line.Substring(10, 20).Trim());
            record.SetField("LEIContraparte", line.Substring(30, 20).Trim());
        }

        if (line.Length >= 68)
            record.SetField("ValorColateral", ParseDecimal(line.AsSpan(50, 18), 2));
    }

    private void ParseDerivadosTotales(ConsarRecord record, string line)
    {
        record.SetField("EsRegistroControl", true);

        if (line.Length >= 54)
        {
            record.SetField("TipoTotales", line.Substring(4, 6).Trim());
            record.SetField("TotalContratos", ParseLong(line.AsSpan(10, 8)));
            record.SetField("TotalNocional", ParseDecimal(line.AsSpan(18, 18), 2));
            record.SetField("TotalMTM", ParseDecimal(line.AsSpan(36, 18), 2));
        }
    }

    /// <summary>
    /// Parsea registro BMRPREV (.0321)
    /// </summary>
    private void ParseBmrprev0321Record(ConsarRecord record, string line)
    {
        record.SetField("Categoria", "BMRPREV");

        if (line.Length >= 18)
        {
            record.SetField("ISIN", line.Substring(3, 15).Trim());
        }

        if (line.Length >= 39)
        {
            record.SetField("Emisora", line.Substring(32, 7).Trim());
        }
    }

    /// <summary>
    /// Parsea registro de Totales/Conciliación (.1101)
    /// </summary>
    private void ParseTotales1101Record(ConsarRecord record, string line)
    {
        record.SetField("Categoria", "Totales");

        // Los registros .1101 tienen códigos de 5 dígitos: 30111, 30112, etc.
        if (line.Length >= 10)
        {
            record.SetField("SubTipo", line.Substring(0, 5));
            record.SetField("SubCategoria", line.Substring(5, 5).Trim());
        }

        // Extraer valores numéricos (posiciones varían según subtipo)
        if (line.Length >= 70)
        {
            record.SetField("Valor1", ParseDecimal(line.AsSpan(10, 18), 2));
            record.SetField("Valor2", ParseDecimal(line.AsSpan(28, 18), 2));
            record.SetField("Valor3", ParseDecimal(line.AsSpan(46, 18), 2));
        }
    }

    /// <summary>
    /// Parser genérico para tipos no específicos
    /// </summary>
    private void ParseGenericRecord(ConsarRecord record, string line)
    {
        record.SetField("RawContent", line);

        // Intentar extraer campos numéricos genéricos
        var numericFields = new List<decimal>();
        for (int i = 0; i + 18 <= line.Length; i += 18)
        {
            var value = ParseDecimal(line.AsSpan(i, 18), 2);
            if (value != 0)
                numericFields.Add(value);
        }

        if (numericFields.Count > 0)
            record.SetField("NumericFields", numericFields);
    }

    #endregion

    #region Helpers de parsing

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static long ParseLong(ReadOnlySpan<char> span)
    {
        var trimmed = span.Trim();
        return long.TryParse(trimmed, out var result) ? result : 0;
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static decimal ParseDecimal(ReadOnlySpan<char> span, int impliedDecimals)
    {
        var trimmed = span.Trim();
        if (!long.TryParse(trimmed, out var rawValue))
            return 0m;

        return rawValue / (decimal)Math.Pow(10, impliedDecimals);
    }

    #endregion
}
