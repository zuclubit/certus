using System.Buffers;
using System.IO.Pipelines;
using System.Text;
using Certus.Domain.Common;
using Certus.Domain.Enums;
using Certus.Domain.Services;
using Certus.Domain.ValueObjects;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.Services.FileValidation;

/// <summary>
/// High-performance CONSAR file parser using System.IO.Pipelines
/// Parses fixed-width TXT files according to CONSAR Circular 19-8 specifications
/// </summary>
public class ConsarFileParser : IConsarFileParser
{
    private readonly ILogger<ConsarFileParser> _logger;
    private const int BufferSize = 65536; // 64KB buffer for streaming

    public ConsarFileParser(ILogger<ConsarFileParser> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Parse CONSAR file asynchronously with streaming for large files
    /// </summary>
    public async Task<Result<ConsarFileParseResult>> ParseAsync(
        Stream fileStream,
        FileType fileType,
        IProgress<int>? progress = null,
        CancellationToken cancellationToken = default)
    {
        var result = new ConsarFileParseResult
        {
            FileType = fileType,
            ParsedAt = DateTime.UtcNow
        };

        try
        {
            var records = new List<ValidationRecord>();
            var lineNumber = 0;
            var errors = new List<ConsarParseError>();

            using var reader = new StreamReader(fileStream, Encoding.GetEncoding("ISO-8859-1"), detectEncodingFromByteOrderMarks: false);

            string? line;
            while ((line = await reader.ReadLineAsync(cancellationToken)) != null)
            {
                cancellationToken.ThrowIfCancellationRequested();
                lineNumber++;

                if (string.IsNullOrWhiteSpace(line))
                    continue;

                var parseResult = ParseLine(line, lineNumber, fileType);

                if (parseResult.IsSuccess)
                {
                    var record = parseResult.Value;
                    record.LineNumber = lineNumber;
                    record.RawLine = line;

                    // Identify record type
                    record.RecordTypeEnum = IdentifyRecordType(line, fileType);
                    record.RecordType = record.RecordTypeEnum.ToString();

                    records.Add(record);

                    // Track header/footer
                    if (record.RecordTypeEnum == Domain.Services.ConsarRecordType.Header)
                        result.HeaderRecord = record;
                    else if (record.RecordTypeEnum == Domain.Services.ConsarRecordType.Footer)
                        result.FooterRecord = record;
                    else
                        result.DetailRecords.Add(record);
                }
                else
                {
                    errors.Add(new ConsarParseError(lineNumber, parseResult.Error.Code, parseResult.Error.Message, line));
                }

                // Report progress every 1000 lines
                if (lineNumber % 1000 == 0)
                {
                    progress?.Report(lineNumber);
                }
            }

            result.TotalLines = lineNumber;
            result.Records = records;
            result.ParseErrors = errors;
            result.IsValid = errors.Count == 0;

            _logger.LogInformation(
                "Parsed CONSAR file: {FileType}, {TotalLines} lines, {RecordCount} records, {ErrorCount} parse errors",
                fileType, lineNumber, records.Count, errors.Count);

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing CONSAR file");
            return Result.Failure<ConsarFileParseResult>(
                Error.External("Parser.Error", $"Error al procesar archivo: {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse a single line according to file type specifications
    /// </summary>
    private Result<ValidationRecord> ParseLine(string line, int lineNumber, FileType fileType)
    {
        return fileType switch
        {
            FileType.Nomina => ParseNominaLine(line, lineNumber),
            FileType.Contable => ParseContableLine(line, lineNumber),
            FileType.Regularizacion => ParseRegularizacionLine(line, lineNumber),
            FileType.Retiros => ParseRetirosLine(line, lineNumber),
            FileType.Traspasos => ParseTraspasosLine(line, lineNumber),
            FileType.Aportaciones => ParseAportacionesLine(line, lineNumber),
            FileType.CarteraSiefore => ParseCarteraSieforeLine(line, lineNumber),
            FileType.Derivados => ParseDerivadosLine(line, lineNumber),
            _ => Result.Failure<ValidationRecord>(Error.AsValidation("Parser.UnknownType", $"Tipo de archivo no soportado: {fileType}"))
        };
    }

    /// <summary>
    /// Parse NOMINA file line - Worker payroll deductions
    /// Based on CONSAR Circular 19-8 Anexo specifications
    /// </summary>
    private Result<ValidationRecord> ParseNominaLine(string line, int lineNumber)
    {
        // NOMINA format (example layout - adjust to actual CONSAR specs):
        // Pos 1-2:   Record type (01=Header, 02=Detail, 03=Footer)
        // Pos 3-13:  NSS (11 digits)
        // Pos 14-31: CURP (18 characters)
        // Pos 32-44: RFC (13 characters, padded)
        // Pos 45-55: Account number (11 digits)
        // Pos 56-70: Amount (15 digits, 2 implied decimals)
        // Pos 71-78: Date (YYYYMMDD)
        // Pos 79:    Movement type (A=Alta, B=Baja, M=Modificación)
        // Pos 80-119: Worker name (40 characters)
        // Pos 120-132: Company RFC (13 characters)

        const int MinLineLength = 132;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente ({line.Length} < {MinLineLength})"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1, // Zero-indexed
            LineNumber = lineNumber
        };

        try
        {
            // Extract fields
            record.SetField("TipoRegistro", line[..2].Trim());
            record.SetField("NSS", line.Substring(2, 11).Trim());
            record.SetField("CURP", line.Substring(13, 18).Trim());
            record.SetField("RFC", line.Substring(31, 13).Trim());
            record.SetField("NumeroCuenta", line.Substring(44, 11).Trim());
            record.SetField("Importe", line.Substring(55, 15).Trim());
            record.SetField("Fecha", line.Substring(70, 8).Trim());
            record.SetField("TipoMovimiento", line.Substring(78, 1).Trim());
            record.SetField("NombreTrabajador", line.Substring(79, 40).Trim());
            record.SetField("RFCPatron", line.Substring(119, 13).Trim());

            // Parse and validate critical fields
            var nssValue = record.GetFieldValue("NSS")?.ToString();
            if (!string.IsNullOrEmpty(nssValue) && Nss.IsValid(nssValue))
            {
                record.SetField("NSS_Valid", true);
            }

            var curpValue = record.GetFieldValue("CURP")?.ToString();
            if (!string.IsNullOrEmpty(curpValue) && Curp.IsValid(curpValue))
            {
                record.SetField("CURP_Valid", true);
            }

            var rfcValue = record.GetFieldValue("RFC")?.ToString();
            if (!string.IsNullOrEmpty(rfcValue) && Rfc.IsValid(rfcValue))
            {
                record.SetField("RFC_Valid", true);
            }

            // Parse amount
            var importeStr = record.GetFieldValue("Importe")?.ToString();
            if (!string.IsNullOrEmpty(importeStr) && long.TryParse(importeStr, out var importeCents))
            {
                var importe = Money.FromCents(importeCents);
                record.SetField("ImporteParsed", importe.Amount);
            }

            // Parse date
            var fechaStr = record.GetFieldValue("Fecha")?.ToString();
            if (!string.IsNullOrEmpty(fechaStr) && DateTime.TryParseExact(fechaStr, "yyyyMMdd", null, System.Globalization.DateTimeStyles.None, out var fecha))
            {
                record.SetField("FechaParsed", fecha);
            }

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error extrayendo campos - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse CONTABLE file line - Accounting records
    /// </summary>
    private Result<ValidationRecord> ParseContableLine(string line, int lineNumber)
    {
        // CONTABLE format:
        // Pos 1-2:   Record type
        // Pos 3-12:  Account code (SAT catalog)
        // Pos 13-22: Subaccount code
        // Pos 23-30: Date (YYYYMMDD)
        // Pos 31-45: Debit amount (15 digits)
        // Pos 46-60: Credit amount (15 digits)
        // Pos 61-110: Concept (50 characters)
        // Pos 111-130: Reference (20 characters)
        // Pos 131-133: Currency (3 characters)

        const int MinLineLength = 133;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente ({line.Length} < {MinLineLength})"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", line[..2].Trim());
            record.SetField("CodigoCuenta", line.Substring(2, 10).Trim());
            record.SetField("CodigoSubcuenta", line.Substring(12, 10).Trim());
            record.SetField("Fecha", line.Substring(22, 8).Trim());
            record.SetField("MontoDebito", line.Substring(30, 15).Trim());
            record.SetField("MontoCredito", line.Substring(45, 15).Trim());
            record.SetField("Concepto", line.Substring(60, 50).Trim());
            record.SetField("Referencia", line.Substring(110, 20).Trim());
            record.SetField("Moneda", line.Substring(130, 3).Trim());

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse REGULARIZACION file line - Correction records
    /// </summary>
    private Result<ValidationRecord> ParseRegularizacionLine(string line, int lineNumber)
    {
        const int MinLineLength = 200;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", line[..2].Trim());
            record.SetField("NSS", line.Substring(2, 11).Trim());
            record.SetField("CURP", line.Substring(13, 18).Trim());
            record.SetField("NumeroCuenta", line.Substring(31, 11).Trim());
            record.SetField("FechaOriginal", line.Substring(42, 8).Trim());
            record.SetField("FechaCorreccion", line.Substring(50, 8).Trim());
            record.SetField("ImporteOriginal", line.Substring(58, 15).Trim());
            record.SetField("ImporteCorregido", line.Substring(73, 15).Trim());
            record.SetField("MotivoRegularizacion", line.Substring(88, 100).Trim());
            record.SetField("ReferenciaAutorizacion", line.Substring(188, 12).Trim());

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse RETIROS file line - Withdrawal records
    /// </summary>
    private Result<ValidationRecord> ParseRetirosLine(string line, int lineNumber)
    {
        const int MinLineLength = 180;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", line[..2].Trim());
            record.SetField("NSS", line.Substring(2, 11).Trim());
            record.SetField("CURP", line.Substring(13, 18).Trim());
            record.SetField("NumeroCuenta", line.Substring(31, 11).Trim());
            record.SetField("TipoRetiro", line.Substring(42, 2).Trim());
            record.SetField("ImporteRetiro", line.Substring(44, 15).Trim());
            record.SetField("FechaSolicitud", line.Substring(59, 8).Trim());
            record.SetField("FechaPago", line.Substring(67, 8).Trim());
            record.SetField("ClaveAfore", line.Substring(75, 3).Trim());
            record.SetField("Beneficiario", line.Substring(78, 100).Trim());

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse TRASPASOS file line - Transfer between AFORE records
    /// </summary>
    private Result<ValidationRecord> ParseTraspasosLine(string line, int lineNumber)
    {
        const int MinLineLength = 150;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", line[..2].Trim());
            record.SetField("NSS", line.Substring(2, 11).Trim());
            record.SetField("CURP", line.Substring(13, 18).Trim());
            record.SetField("AforeOrigen", line.Substring(31, 3).Trim());
            record.SetField("AforeDestino", line.Substring(34, 3).Trim());
            record.SetField("FechaSolicitud", line.Substring(37, 8).Trim());
            record.SetField("FechaEfectiva", line.Substring(45, 8).Trim());
            record.SetField("SaldoTraspaso", line.Substring(53, 15).Trim());
            record.SetField("TipoTraspaso", line.Substring(68, 2).Trim());
            record.SetField("MotivoTraspaso", line.Substring(70, 80).Trim());

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse APORTACIONES file line - Contribution records
    /// </summary>
    private Result<ValidationRecord> ParseAportacionesLine(string line, int lineNumber)
    {
        const int MinLineLength = 160;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", line[..2].Trim());
            record.SetField("NSS", line.Substring(2, 11).Trim());
            record.SetField("CURP", line.Substring(13, 18).Trim());
            record.SetField("RFCPatron", line.Substring(31, 13).Trim());
            record.SetField("Bimestre", line.Substring(44, 6).Trim());
            record.SetField("AportacionPatronal", line.Substring(50, 15).Trim());
            record.SetField("AportacionTrabajador", line.Substring(65, 15).Trim());
            record.SetField("AportacionGobierno", line.Substring(80, 15).Trim());
            record.SetField("AportacionVoluntaria", line.Substring(95, 15).Trim());
            record.SetField("SalarioBaseCotizacion", line.Substring(110, 15).Trim());
            record.SetField("DiasLaborados", line.Substring(125, 3).Trim());
            record.SetField("ClaveAfore", line.Substring(128, 3).Trim());

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error - {ex.Message}"));
        }
    }

    #region SIEFORE Portfolio Parsers (.0300, .0314)

    /// <summary>
    /// Parse CARTERA SIEFORE file line (.0300) - Investment Portfolio
    /// Layout types: 301 (Government), 302 (Other), 303 (Equities), 307 (Intl ETFs)
    /// </summary>
    private Result<ValidationRecord> ParseCarteraSieforeLine(string line, int lineNumber)
    {
        // Header line has different structure
        if (lineNumber == 1)
        {
            return ParseCarteraSiefereHeaderLine(line, lineNumber);
        }

        // Determine record type from first 3 characters
        if (line.Length < 3)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente para determinar tipo"));
        }

        var recordTypeCode = line[..3];

        return recordTypeCode switch
        {
            "301" => ParseCartera301Line(line, lineNumber), // Government instruments
            "302" => ParseCartera302Line(line, lineNumber), // Other instruments (derivatives refs, cash, etc.)
            "303" => ParseCartera303Line(line, lineNumber), // Equities/Stocks
            "304" => ParseCartera304Line(line, lineNumber), // Structured products/CKDs
            "307" => ParseCartera307Line(line, lineNumber), // International ETFs
            "308" => ParseCartera308Line(line, lineNumber), // International equities/ADRs
            "309" => ParseCartera309Line(line, lineNumber), // Summary/Control totals
            "310" => ParseCartera310Line(line, lineNumber), // Additional summary/control
            _ => Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.UnknownRecordType", $"Línea {lineNumber}: tipo de registro desconocido: {recordTypeCode}"))
        };
    }

    /// <summary>
    /// Parse header line for Cartera SIEFORE (.0300)
    /// Format: [TotalRecords:8][HeaderType:2][LayoutCode:4][AforeCode:4][Sequence:6][FileType:2][Date:8]
    /// </summary>
    private Result<ValidationRecord> ParseCarteraSiefereHeaderLine(string line, int lineNumber)
    {
        const int MinHeaderLength = 34;

        if (line.Length < MinHeaderLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.HeaderTooShort", $"Encabezado demasiado corto ({line.Length} < {MinHeaderLength})"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = 0,
            LineNumber = lineNumber
        };

        try
        {
            // Parse header fields
            record.SetField("TotalRegistros", ParseIntSafe(line[..8]));
            record.SetField("TipoHeader", line.Substring(8, 2).Trim());
            record.SetField("CodigoLayout", line.Substring(10, 4).Trim());
            record.SetField("CodigoAfore", line.Substring(14, 4).Trim());
            record.SetField("Secuencia", line.Substring(18, 6).Trim());
            record.SetField("TipoArchivo", line.Substring(24, 2).Trim());
            record.SetField("FechaGeneracion", ParseDateSafe(line.Substring(26, 8)));

            // Validate layout code
            var layoutCode = record.GetFieldValue("CodigoLayout")?.ToString();
            if (layoutCode != "0300" && layoutCode != "3030")
            {
                record.SetField("LayoutWarning", $"Código de layout inesperado: {layoutCode}");
            }

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.HeaderParse", $"Error parseando encabezado: {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 301 - Government instruments (CETES, BONOS, UDIBONOS)
    /// High-performance fixed-width parsing
    /// </summary>
    private Result<ValidationRecord> ParseCartera301Line(string line, int lineNumber)
    {
        const int MinLineLength = 200;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente ({line.Length} < {MinLineLength})"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            // Basic identification fields
            record.SetField("TipoRegistro", "301");
            record.SetField("CategoriaInstrumento", "Gobierno");

            // ISIN/Ticker (positions 3-17) - 15 chars
            record.SetField("ISIN", line.Substring(3, 15).Trim());

            // Series/SubSeries info (positions 18-25)
            record.SetField("Serie", line.Substring(18, 8).Trim());

            // Issuer type code (positions 26-31) - 6 chars
            record.SetField("TipoEmisor", line.Substring(26, 6).Trim());

            // Issuer name (positions 32-38) - 7 chars
            record.SetField("Emisora", line.Substring(32, 7).Trim());

            // Maturity date YYMMDD (positions 39-45) - 6 chars
            record.SetField("FechaVencimiento", ParseShortDateSafe(line.Substring(39, 6)));
            record.SetField("FechaVencimientoRaw", line.Substring(39, 6).Trim());

            // Coupon/Rate indicator (position 45-46)
            record.SetField("TasaCupon", line.Substring(45, 2).Trim());

            // Positions/Titles (positions 47-65) - typically 18 chars for large numbers
            record.SetField("TitulosTotales", ParseLongSafe(line.Substring(47, 18)));

            // Valuation fields (positions 65-83)
            record.SetField("ValorNominal", ParseDecimalWithImpliedDecimals(line.Substring(65, 18), 2));

            // Price per unit (positions 83-101)
            record.SetField("PrecioUnitario", ParseDecimalWithImpliedDecimals(line.Substring(83, 18), 8));

            // Market value (positions 101-119)
            record.SetField("ValorMercado", ParseDecimalWithImpliedDecimals(line.Substring(101, 18), 2));

            // Accrued interest (positions 119-137)
            record.SetField("InteresesDevengados", ParseDecimalWithImpliedDecimals(line.Substring(119, 18), 2));

            // Total value including interest (positions 137-155)
            record.SetField("ValorTotal", ParseDecimalWithImpliedDecimals(line.Substring(137, 18), 2));

            // Duration/Modified duration
            if (line.Length >= 173)
            {
                record.SetField("Duracion", ParseDecimalWithImpliedDecimals(line.Substring(155, 18), 6));
            }

            // Currency code (if available)
            if (line.Length >= 180)
            {
                var currencySection = line.Substring(173, 7).Trim();
                if (!string.IsNullOrEmpty(currencySection))
                {
                    record.SetField("Moneda", currencySection);
                }
            }

            // Set computed fields for validation
            var isin = record.GetFieldValue("ISIN")?.ToString() ?? "";
            record.SetField("EsGobierno", isin.StartsWith("MX"));
            record.SetField("EsCETE", record.GetFieldValue("Emisora")?.ToString()?.Contains("CETE") ?? false);
            record.SetField("EsBONO", record.GetFieldValue("Emisora")?.ToString()?.Contains("BONO") ?? false);
            record.SetField("EsUDIBONO", record.GetFieldValue("Emisora")?.ToString()?.Contains("UDI") ?? false);

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando 301 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 302 - Other instruments (derivatives refs, cash, BMRPREV, etc.)
    /// </summary>
    private Result<ValidationRecord> ParseCartera302Line(string line, int lineNumber)
    {
        const int MinLineLength = 180;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente ({line.Length} < {MinLineLength})"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "302");
            record.SetField("CategoriaInstrumento", "Otros");

            // Sub-category/Sequence (positions 3-11) - varies by sub-type
            record.SetField("Subcategoria", line.Substring(3, 9).Trim());

            // ISIN or reference code (positions 12-26)
            record.SetField("ISIN", line.Substring(12, 15).Trim());

            // Padding/Series (positions 27-33)
            record.SetField("Serie", line.Substring(27, 7).Trim());

            // Type code (positions 34-39)
            record.SetField("TipoEmisor", line.Substring(34, 6).Trim());

            // Instrument name (positions 40-49)
            record.SetField("NombreInstrumento", line.Substring(40, 10).Trim());

            // Maturity date YYMMDD (positions 50-55)
            record.SetField("FechaVencimiento", ParseShortDateSafe(line.Substring(50, 6)));

            // Operation date YYYYMMDD (positions 56-66)
            if (line.Length >= 66)
            {
                var opDateStr = line.Substring(56, 8).Trim();
                if (!string.IsNullOrEmpty(opDateStr) && opDateStr != "00000000")
                {
                    record.SetField("FechaOperacion", ParseDateSafe(opDateStr));
                }
            }

            // Value/Position fields (positions 66-84)
            record.SetField("TitulosCantidad", ParseLongSafe(line.Substring(66, 18)));

            // Nominal value (positions 84-102)
            record.SetField("ValorNominal", ParseDecimalWithImpliedDecimals(line.Substring(84, 18), 2));

            // Market value (positions 102-120)
            record.SetField("ValorMercado", ParseDecimalWithImpliedDecimals(line.Substring(102, 18), 2));

            // MTM Gain/Loss (positions 120-138)
            record.SetField("MTMGananciaPerdida", ParseDecimalWithImpliedDecimals(line.Substring(120, 18), 2));

            // Identify special types
            var instrumentName = record.GetFieldValue("NombreInstrumento")?.ToString() ?? "";
            record.SetField("EsEfectivo", instrumentName.Contains("EFECTIV"));
            record.SetField("EsBMRPREV", instrumentName.Contains("BMRPREV"));
            record.SetField("EsDerivadoRef", instrumentName.Contains("CSPMXP") || instrumentName.Contains("SPOT"));

            // Currency indicator (positions 156+)
            if (line.Length >= 165)
            {
                record.SetField("Moneda", line.Substring(156, 9).Trim());
            }

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando 302 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 303 - Equities/Stocks (GFINBURO, BIMBO, CEMEX, etc.)
    /// </summary>
    private Result<ValidationRecord> ParseCartera303Line(string line, int lineNumber)
    {
        const int MinLineLength = 300;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente ({line.Length} < {MinLineLength})"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "303");
            record.SetField("CategoriaInstrumento", "RentaVariable");

            // Subcategory sequence (positions 3-7)
            record.SetField("Subcategoria", line.Substring(3, 4).Trim());

            // ISIN code (positions 7-22) - 15 chars for Mexican equities
            var isin = line.Substring(7, 15).Trim();
            record.SetField("ISIN", isin);

            // CUSIP or additional code (positions 22-30)
            var cusipSection = line.Substring(22, 8).Trim();
            if (long.TryParse(cusipSection, out var cusipNum) && cusipNum > 0)
            {
                record.SetField("CUSIP", cusipSection);
            }

            // Ticker symbol (positions 30-40) - approximate
            record.SetField("Ticker", line.Substring(30, 10).Trim());

            // Series (positions 40-42)
            record.SetField("Serie", line.Substring(40, 2).Trim());

            // Number of shares/titles (positions 42-58) - 16 chars
            record.SetField("NumeroAcciones", ParseLongSafe(line.Substring(42, 16)));

            // Cost basis per share (positions 58-76)
            record.SetField("CostoUnitario", ParseDecimalWithImpliedDecimals(line.Substring(58, 18), 8));

            // Total cost basis (positions 76-94)
            record.SetField("CostoTotal", ParseDecimalWithImpliedDecimals(line.Substring(76, 18), 2));

            // Current market price (positions 94-112)
            record.SetField("PrecioMercado", ParseDecimalWithImpliedDecimals(line.Substring(94, 18), 8));

            // Market value (positions 112-130)
            record.SetField("ValorMercado", ParseDecimalWithImpliedDecimals(line.Substring(112, 18), 2));

            // Unrealized gain/loss (positions 130-148)
            record.SetField("GananciaNoRealizada", ParseDecimalWithImpliedDecimals(line.Substring(130, 18), 2));

            // Market identifier (positions 148-152)
            if (line.Length >= 152)
            {
                record.SetField("MercadoOperacion", line.Substring(148, 4).Trim());
            }

            // Sector/Industry code (positions 152-160)
            if (line.Length >= 160)
            {
                record.SetField("SectorIndustria", line.Substring(152, 8).Trim());
            }

            // Exchange rate if applicable (positions 250+)
            if (line.Length >= 270)
            {
                record.SetField("TipoCambio", ParseDecimalWithImpliedDecimals(line.Substring(250, 18), 8));
            }

            // Determine if domestic or international
            record.SetField("EsDomestico", isin.StartsWith("MX"));
            record.SetField("EsInternacional", !isin.StartsWith("MX"));

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando 303 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 307 - International ETFs (US, IE, FR prefixed ISINs)
    /// </summary>
    private Result<ValidationRecord> ParseCartera307Line(string line, int lineNumber)
    {
        const int MinLineLength = 300;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente ({line.Length} < {MinLineLength})"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "307");
            record.SetField("CategoriaInstrumento", "ETFInternacional");

            // Subcategory (positions 3-7)
            record.SetField("Subcategoria", line.Substring(3, 4).Trim());

            // ISIN (positions 7-22) - International format (US, IE, FR, etc.)
            var isin = line.Substring(7, 15).Trim();
            record.SetField("ISIN", isin);

            // Country code extraction from ISIN
            if (isin.Length >= 2)
            {
                record.SetField("PaisEmision", isin[..2]);
            }

            // Additional ID/SEDOL (positions 22-30)
            record.SetField("SEDOL", line.Substring(22, 8).Trim());

            // Fund/ETF name (positions 30-45)
            record.SetField("NombreETF", line.Substring(30, 15).Trim());

            // Series indicator (positions 45-50)
            record.SetField("Serie", line.Substring(45, 5).Trim());

            // Number of units (positions 50-68)
            record.SetField("NumeroUnidades", ParseLongSafe(line.Substring(50, 18)));

            // Cost in original currency (positions 68-86)
            record.SetField("CostoMonedaOriginal", ParseDecimalWithImpliedDecimals(line.Substring(68, 18), 2));

            // Cost in MXN (positions 86-104)
            record.SetField("CostoMXN", ParseDecimalWithImpliedDecimals(line.Substring(86, 18), 2));

            // Current price original currency (positions 104-122)
            record.SetField("PrecioMonedaOriginal", ParseDecimalWithImpliedDecimals(line.Substring(104, 18), 8));

            // Market value MXN (positions 122-140)
            record.SetField("ValorMercadoMXN", ParseDecimalWithImpliedDecimals(line.Substring(122, 18), 2));

            // Unrealized gain/loss MXN (positions 140-158)
            record.SetField("GananciaNoRealizadaMXN", ParseDecimalWithImpliedDecimals(line.Substring(140, 18), 2));

            // Currency code (positions 158-161)
            if (line.Length >= 165)
            {
                var currencyCode = line.Substring(158, 3).Trim();
                if (!string.IsNullOrEmpty(currencyCode))
                {
                    record.SetField("MonedaOriginal", currencyCode);
                }
            }

            // Exchange rate used (positions 250-268)
            if (line.Length >= 268)
            {
                record.SetField("TipoCambioAplicado", ParseDecimalWithImpliedDecimals(line.Substring(250, 18), 8));
            }

            // Set type flags
            record.SetField("EsUSA", isin.StartsWith("US"));
            record.SetField("EsEuropa", isin.StartsWith("IE") || isin.StartsWith("FR") || isin.StartsWith("LU"));
            record.SetField("EsETF", true);

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando 307 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 304 - Structured Products (CKDs, FIBRAs, Structured Notes)
    /// </summary>
    private Result<ValidationRecord> ParseCartera304Line(string line, int lineNumber)
    {
        const int MinLineLength = 200;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente ({line.Length} < {MinLineLength})"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "304");
            record.SetField("CategoriaInstrumento", "Estructurados");

            // Subcategory (positions 3-7)
            record.SetField("Subcategoria", line.Substring(3, 4).Trim());

            // ISIN/Ticker (positions 7-22)
            var isin = line.Substring(7, 15).Trim();
            record.SetField("ISIN", isin);

            // Additional ID (positions 22-30)
            record.SetField("IdAdicional", line.Substring(22, 8).Trim());

            // Instrument name (positions 30-45)
            record.SetField("NombreInstrumento", line.Substring(30, 15).Trim());

            // Instrument type (positions 45-55)
            record.SetField("TipoInstrumento", line.Substring(45, 10).Trim());

            // Number of titles/units (positions 55-73)
            record.SetField("NumeroTitulos", ParseLongSafe(line.Substring(55, 18)));

            // Cost basis (positions 73-91)
            record.SetField("CostoAdquisicion", ParseDecimalWithImpliedDecimals(line.Substring(73, 18), 2));

            // Current valuation (positions 91-109)
            record.SetField("ValuacionActual", ParseDecimalWithImpliedDecimals(line.Substring(91, 18), 2));

            // Market value (positions 109-127)
            record.SetField("ValorMercado", ParseDecimalWithImpliedDecimals(line.Substring(109, 18), 2));

            // Unrealized gain/loss (positions 127-145)
            record.SetField("GananciaNoRealizada", ParseDecimalWithImpliedDecimals(line.Substring(127, 18), 2));

            // Determine product type
            var instrumentType = record.GetFieldValue("TipoInstrumento")?.ToString() ?? "";
            record.SetField("EsCKD", instrumentType.Contains("CKD") || isin.Contains("CKD"));
            record.SetField("EsFIBRA", instrumentType.Contains("FIBRA") || isin.Contains("FIBRA"));
            record.SetField("EsEstructurado", true);

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando 304 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 308 - International Equities/ADRs
    /// </summary>
    private Result<ValidationRecord> ParseCartera308Line(string line, int lineNumber)
    {
        const int MinLineLength = 300;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente ({line.Length} < {MinLineLength})"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "308");
            record.SetField("CategoriaInstrumento", "RentaVariableIntl");

            // Subcategory (positions 3-7)
            record.SetField("Subcategoria", line.Substring(3, 4).Trim());

            // ISIN (positions 7-22) - International format
            var isin = line.Substring(7, 15).Trim();
            record.SetField("ISIN", isin);

            // Country code extraction from ISIN
            if (isin.Length >= 2)
            {
                record.SetField("PaisEmision", isin[..2]);
            }

            // CUSIP/SEDOL (positions 22-30)
            record.SetField("CUSIP", line.Substring(22, 8).Trim());

            // Company name/Ticker (positions 30-50)
            record.SetField("NombreEmpresa", line.Substring(30, 20).Trim());

            // Exchange code (positions 50-55)
            record.SetField("Bolsa", line.Substring(50, 5).Trim());

            // Number of shares (positions 55-73)
            record.SetField("NumeroAcciones", ParseLongSafe(line.Substring(55, 18)));

            // Cost in original currency (positions 73-91)
            record.SetField("CostoMonedaOriginal", ParseDecimalWithImpliedDecimals(line.Substring(73, 18), 2));

            // Cost in MXN (positions 91-109)
            record.SetField("CostoMXN", ParseDecimalWithImpliedDecimals(line.Substring(91, 18), 2));

            // Current price original currency (positions 109-127)
            record.SetField("PrecioMonedaOriginal", ParseDecimalWithImpliedDecimals(line.Substring(109, 18), 6));

            // Market value MXN (positions 127-145)
            record.SetField("ValorMercadoMXN", ParseDecimalWithImpliedDecimals(line.Substring(127, 18), 2));

            // Unrealized gain/loss MXN (positions 145-163)
            record.SetField("GananciaNoRealizadaMXN", ParseDecimalWithImpliedDecimals(line.Substring(145, 18), 2));

            // Currency code (positions 163-166)
            if (line.Length >= 166)
            {
                record.SetField("MonedaOriginal", line.Substring(163, 3).Trim());
            }

            // Exchange rate (positions 250-268)
            if (line.Length >= 268)
            {
                record.SetField("TipoCambio", ParseDecimalWithImpliedDecimals(line.Substring(250, 18), 8));
            }

            // Determine market type
            record.SetField("EsUSA", isin.StartsWith("US"));
            record.SetField("EsADR", record.GetFieldValue("EsUSA")?.ToString() == "True");
            record.SetField("EsEuropa", isin.StartsWith("GB") || isin.StartsWith("DE") || isin.StartsWith("FR"));
            record.SetField("EsInternacional", true);

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando 308 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 309 - Summary/Control totals for portfolio
    /// </summary>
    private Result<ValidationRecord> ParseCartera309Line(string line, int lineNumber)
    {
        const int MinLineLength = 100;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente ({line.Length} < {MinLineLength})"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "309");
            record.SetField("CategoriaInstrumento", "Totales");

            // Summary type code (positions 3-7)
            record.SetField("TipoTotales", line.Substring(3, 4).Trim());

            // Total records count (positions 7-15)
            record.SetField("TotalRegistros", ParseLongSafe(line.Substring(7, 8)));

            // Total market value (positions 15-33)
            record.SetField("TotalValorMercado", ParseDecimalWithImpliedDecimals(line.Substring(15, 18), 2));

            // Total nominal value (positions 33-51)
            if (line.Length >= 51)
            {
                record.SetField("TotalValorNominal", ParseDecimalWithImpliedDecimals(line.Substring(33, 18), 2));
            }

            // Total cost (positions 51-69)
            if (line.Length >= 69)
            {
                record.SetField("TotalCosto", ParseDecimalWithImpliedDecimals(line.Substring(51, 18), 2));
            }

            // Total unrealized gain/loss (positions 69-87)
            if (line.Length >= 87)
            {
                record.SetField("TotalGananciaNoRealizada", ParseDecimalWithImpliedDecimals(line.Substring(69, 18), 2));
            }

            record.SetField("EsRegistroControl", true);

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando 309 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 310 - Additional summary/control records
    /// </summary>
    private Result<ValidationRecord> ParseCartera310Line(string line, int lineNumber)
    {
        const int MinLineLength = 50;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente ({line.Length} < {MinLineLength})"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "310");
            record.SetField("CategoriaInstrumento", "ControlAdicional");

            // Control type (positions 3-7)
            record.SetField("TipoControl", line.Substring(3, 4).Trim());

            // Control value 1 (positions 7-25)
            record.SetField("ValorControl1", ParseDecimalWithImpliedDecimals(line.Substring(7, 18), 2));

            // Control value 2 (positions 25-43)
            if (line.Length >= 43)
            {
                record.SetField("ValorControl2", ParseDecimalWithImpliedDecimals(line.Substring(25, 18), 2));
            }

            record.SetField("EsRegistroControl", true);

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando 310 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse DERIVADOS file line (.0314) - Derivatives (Forwards, Futures, Swaps, Options)
    /// </summary>
    private Result<ValidationRecord> ParseDerivadosLine(string line, int lineNumber)
    {
        // Header line
        if (lineNumber == 1)
        {
            return ParseDerivadosHeaderLine(line, lineNumber);
        }

        // Determine record type from first 4 characters
        if (line.Length < 4)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente"));
        }

        var recordTypeCode = line[..4];

        return recordTypeCode switch
        {
            "3010" => ParseDerivados3010Line(line, lineNumber), // Forwards
            "3020" => ParseDerivados3020Line(line, lineNumber), // Futures
            "3030" => ParseDerivados3030Line(line, lineNumber), // Swaps
            "3040" => ParseDerivados3040Line(line, lineNumber), // Options
            "3050" => ParseDerivados3050Line(line, lineNumber), // Collateral/Margin positions
            "3060" => ParseDerivados3060Line(line, lineNumber), // Derivative valuations
            "3061" => ParseDerivados3061Line(line, lineNumber), // Derivative summary/totals
            "3062" => ParseDerivados3062Line(line, lineNumber), // Additional derivative summary
            _ => Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.UnknownRecordType", $"Línea {lineNumber}: tipo de registro derivado desconocido: {recordTypeCode}"))
        };
    }

    /// <summary>
    /// Parse header line for Derivados (.0314)
    /// </summary>
    private Result<ValidationRecord> ParseDerivadosHeaderLine(string line, int lineNumber)
    {
        const int MinHeaderLength = 34;

        if (line.Length < MinHeaderLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.HeaderTooShort", $"Encabezado derivados demasiado corto"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = 0,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TotalRegistros", ParseIntSafe(line[..8]));
            record.SetField("TipoHeader", line.Substring(8, 2).Trim());
            record.SetField("CodigoLayout", line.Substring(10, 4).Trim());
            record.SetField("CodigoAfore", line.Substring(14, 4).Trim());
            record.SetField("Secuencia", line.Substring(18, 6).Trim());
            record.SetField("TipoArchivo", line.Substring(24, 2).Trim());
            record.SetField("FechaGeneracion", ParseDateSafe(line.Substring(26, 8)));

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.HeaderParse", $"Error parseando encabezado derivados: {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 3010 - Forwards (FX Forwards, Index Forwards)
    /// Based on actual file structure analysis
    /// </summary>
    private Result<ValidationRecord> ParseDerivados3010Line(string line, int lineNumber)
    {
        const int MinLineLength = 400;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente para Forward"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "3010");
            record.SetField("TipoDerivado", "Forward");

            // Skip padding (positions 4-14)
            // Derivative type code (positions 22-26)
            record.SetField("TipoForward", line.Substring(22, 4).Trim()); // FWD

            // Currency pair (positions 26-32)
            var currencyPair = line.Substring(26, 6).Trim();
            record.SetField("ParDivisas", currencyPair);

            // Maturity date YYMMDD (positions 32-38)
            record.SetField("FechaVencimiento", ParseShortDateSafe(line.Substring(32, 6)));

            // Contract identifier (positions 38-50)
            record.SetField("IdContrato", line.Substring(38, 12).Trim());

            // LEI (Legal Entity Identifier) of counterparty (positions 50-70) - 20 chars
            var lei = line.Substring(50, 20).Trim();
            record.SetField("LEIContraparte", lei);

            // Validate LEI format (20 alphanumeric characters)
            record.SetField("LEIValido", !string.IsNullOrEmpty(lei) && lei.Length == 20);

            // Reference instrument section (positions ~120-150)
            // Look for *CSPMXP pattern which indicates spot reference
            var spotRefIndex = line.IndexOf("*CSPMXP", StringComparison.Ordinal);
            if (spotRefIndex > 0 && spotRefIndex + 15 < line.Length)
            {
                record.SetField("InstrumentoReferencia", line.Substring(spotRefIndex, 15).Trim());
            }

            // Direction indicator (positions ~150)
            record.SetField("DireccionOperacion", line.Contains("V25") ? "Venta" : "Compra");

            // Trade date YYYYMMDD (search for 8-digit date pattern after position 140)
            var tradeDateMatch = ExtractDateFromPosition(line, 140, 200);
            if (tradeDateMatch.HasValue)
            {
                record.SetField("FechaOperacion", tradeDateMatch.Value);
            }

            // Start date
            var startDateMatch = ExtractDateFromPosition(line, 148, 210);
            if (startDateMatch.HasValue)
            {
                record.SetField("FechaInicio", startDateMatch.Value);
            }

            // Maturity date (full format YYYYMMDD)
            var maturityDateMatch = ExtractDateFromPosition(line, 156, 220);
            if (maturityDateMatch.HasValue)
            {
                record.SetField("FechaVencimientoFull", maturityDateMatch.Value);
            }

            // Notional amount (search for large number - typically 15-18 digits)
            // Position varies but usually around 180-200
            if (line.Length >= 220)
            {
                record.SetField("MontoNocional", ParseLongSafe(line.Substring(180, 18)));
            }

            // Strike/Forward rate (positions ~240-260)
            if (line.Length >= 270)
            {
                record.SetField("TasaForward", ParseDecimalWithImpliedDecimals(line.Substring(250, 18), 8));
            }

            // MTM Value (positions ~270-290)
            if (line.Length >= 300)
            {
                record.SetField("ValorMTM", ParseDecimalWithImpliedDecimals(line.Substring(280, 18), 2));
            }

            // Currency codes
            if (currencyPair.Length >= 6)
            {
                record.SetField("MonedaBase", currencyPair[..3]);
                record.SetField("MonedaCotizada", currencyPair[3..]);
            }

            // Determine forward type
            record.SetField("EsFXForward", currencyPair.Contains("USD") || currencyPair.Contains("EUR") ||
                           currencyPair.Contains("JPY") || currencyPair.Contains("CHF"));
            record.SetField("EsIndexForward", currencyPair.Contains("SPX") || currencyPair.Contains("SX5E") ||
                           currencyPair.Contains("UKX") || currencyPair.Contains("NDEU"));

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando Forward 3010 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 3020 - Futures
    /// </summary>
    private Result<ValidationRecord> ParseDerivados3020Line(string line, int lineNumber)
    {
        const int MinLineLength = 350;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente para Futuro"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "3020");
            record.SetField("TipoDerivado", "Futuro");

            // Contract code (positions 4-20)
            record.SetField("CodigoContrato", line.Substring(4, 16).Trim());

            // Underlying asset (positions 20-35)
            record.SetField("SubyacenteCodigo", line.Substring(20, 15).Trim());

            // Exchange code (positions 35-45)
            record.SetField("Bolsa", line.Substring(35, 10).Trim());

            // Expiration month/year (positions 45-51)
            record.SetField("MesVencimiento", line.Substring(45, 6).Trim());

            // Number of contracts (positions 51-65)
            record.SetField("NumeroContratos", ParseLongSafe(line.Substring(51, 14)));

            // Position direction: Long/Short (position 65)
            record.SetField("Posicion", line.Substring(65, 1).Trim() == "L" ? "Long" : "Short");

            // Entry price (positions 66-84)
            record.SetField("PrecioEntrada", ParseDecimalWithImpliedDecimals(line.Substring(66, 18), 6));

            // Current price (positions 84-102)
            record.SetField("PrecioActual", ParseDecimalWithImpliedDecimals(line.Substring(84, 18), 6));

            // Contract multiplier (positions 102-116)
            record.SetField("Multiplicador", ParseDecimalWithImpliedDecimals(line.Substring(102, 14), 2));

            // Notional value (positions 116-134)
            record.SetField("ValorNocional", ParseDecimalWithImpliedDecimals(line.Substring(116, 18), 2));

            // MTM value (positions 134-152)
            record.SetField("ValorMTM", ParseDecimalWithImpliedDecimals(line.Substring(134, 18), 2));

            // Initial margin (positions 152-170)
            record.SetField("MargenInicial", ParseDecimalWithImpliedDecimals(line.Substring(152, 18), 2));

            // Currency (positions 170-173)
            record.SetField("Moneda", line.Substring(170, 3).Trim());

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando Futuro 3020 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 3030 - Interest Rate Swaps, Currency Swaps
    /// </summary>
    private Result<ValidationRecord> ParseDerivados3030Line(string line, int lineNumber)
    {
        const int MinLineLength = 400;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente para Swap"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "3030");
            record.SetField("TipoDerivado", "Swap");

            // Swap type (IRS, CCS, etc.) - positions 4-10
            record.SetField("TipoSwap", line.Substring(4, 6).Trim());

            // Contract ID (positions 10-30)
            record.SetField("IdContrato", line.Substring(10, 20).Trim());

            // LEI Counterparty (positions 30-50)
            record.SetField("LEIContraparte", line.Substring(30, 20).Trim());

            // Effective date YYYYMMDD (positions 50-58)
            record.SetField("FechaEfectiva", ParseDateSafe(line.Substring(50, 8)));

            // Maturity date YYYYMMDD (positions 58-66)
            record.SetField("FechaVencimiento", ParseDateSafe(line.Substring(58, 8)));

            // Notional amount (positions 66-84)
            record.SetField("MontoNocional", ParseDecimalWithImpliedDecimals(line.Substring(66, 18), 2));

            // Pay leg details
            // Pay rate type: Fixed/Float (position 84)
            record.SetField("PagarTipoTasa", line.Substring(84, 1).Trim() == "F" ? "Fija" : "Variable");

            // Pay rate/spread (positions 85-99)
            record.SetField("PagarTasa", ParseDecimalWithImpliedDecimals(line.Substring(85, 14), 6));

            // Pay frequency (position 99)
            record.SetField("PagarFrecuencia", ParseSwapFrequency(line.Substring(99, 1)));

            // Receive leg details
            // Receive rate type (position 100)
            record.SetField("RecibirTipoTasa", line.Substring(100, 1).Trim() == "F" ? "Fija" : "Variable");

            // Receive rate/spread (positions 101-115)
            record.SetField("RecibirTasa", ParseDecimalWithImpliedDecimals(line.Substring(101, 14), 6));

            // Reference rate index (TIIE, LIBOR, SOFR, etc.) - positions 115-125
            record.SetField("IndiceTasaReferencia", line.Substring(115, 10).Trim());

            // Current MTM value (positions 200-218)
            if (line.Length >= 220)
            {
                record.SetField("ValorMTM", ParseDecimalWithImpliedDecimals(line.Substring(200, 18), 2));
            }

            // Pay leg currency (positions 125-128)
            record.SetField("MonedaPagar", line.Substring(125, 3).Trim());

            // Receive leg currency (positions 128-131)
            record.SetField("MonedaRecibir", line.Substring(128, 3).Trim());

            // Determine swap type
            var payMoney = record.GetFieldValue("MonedaPagar")?.ToString() ?? "";
            var recMoney = record.GetFieldValue("MonedaRecibir")?.ToString() ?? "";
            record.SetField("EsCrosssCurrency", payMoney != recMoney);
            record.SetField("EsIRS", payMoney == recMoney);

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando Swap 3030 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 3040 - Options (FX Options, Equity Options)
    /// </summary>
    private Result<ValidationRecord> ParseDerivados3040Line(string line, int lineNumber)
    {
        const int MinLineLength = 350;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente para Opción"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "3040");
            record.SetField("TipoDerivado", "Opcion");

            // Option type: Call/Put (position 4)
            record.SetField("TipoOpcion", line.Substring(4, 1).Trim() == "C" ? "Call" : "Put");

            // Style: European/American (position 5)
            record.SetField("EstiloOpcion", line.Substring(5, 1).Trim() == "E" ? "Europeo" : "Americano");

            // Underlying code (positions 6-21)
            record.SetField("SubyacenteCodigo", line.Substring(6, 15).Trim());

            // Contract ID (positions 21-41)
            record.SetField("IdContrato", line.Substring(21, 20).Trim());

            // LEI Counterparty (positions 41-61)
            record.SetField("LEIContraparte", line.Substring(41, 20).Trim());

            // Expiration date YYYYMMDD (positions 61-69)
            record.SetField("FechaExpiracion", ParseDateSafe(line.Substring(61, 8)));

            // Strike price (positions 69-87)
            record.SetField("PrecioEjercicio", ParseDecimalWithImpliedDecimals(line.Substring(69, 18), 6));

            // Number of contracts (positions 87-101)
            record.SetField("NumeroContratos", ParseLongSafe(line.Substring(87, 14)));

            // Position: Long/Short (position 101)
            record.SetField("Posicion", line.Substring(101, 1).Trim() == "L" ? "Long" : "Short");

            // Premium paid/received (positions 102-120)
            record.SetField("Prima", ParseDecimalWithImpliedDecimals(line.Substring(102, 18), 2));

            // Current underlying price (positions 120-138)
            record.SetField("PrecioSubyacenteActual", ParseDecimalWithImpliedDecimals(line.Substring(120, 18), 6));

            // Option delta (positions 138-152)
            record.SetField("Delta", ParseDecimalWithImpliedDecimals(line.Substring(138, 14), 8));

            // Option gamma (positions 152-166)
            record.SetField("Gamma", ParseDecimalWithImpliedDecimals(line.Substring(152, 14), 8));

            // Option vega (positions 166-180)
            record.SetField("Vega", ParseDecimalWithImpliedDecimals(line.Substring(166, 14), 8));

            // Current MTM value (positions 180-198)
            record.SetField("ValorMTM", ParseDecimalWithImpliedDecimals(line.Substring(180, 18), 2));

            // Intrinsic value (positions 198-216)
            record.SetField("ValorIntrinseco", ParseDecimalWithImpliedDecimals(line.Substring(198, 18), 2));

            // Currency (positions 216-219)
            record.SetField("Moneda", line.Substring(216, 3).Trim());

            // Determine moneyness
            var strike = record.GetFieldAsDecimal("PrecioEjercicio");
            var spot = record.GetFieldAsDecimal("PrecioSubyacenteActual");
            var isCall = record.GetFieldValue("TipoOpcion")?.ToString() == "Call";

            if (strike > 0 && spot > 0)
            {
                if (isCall)
                {
                    record.SetField("Moneyness", spot > strike ? "ITM" : (spot < strike ? "OTM" : "ATM"));
                }
                else
                {
                    record.SetField("Moneyness", spot < strike ? "ITM" : (spot > strike ? "OTM" : "ATM"));
                }
            }

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando Opción 3040 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 3050 - Collateral/Margin positions for derivatives
    /// </summary>
    private Result<ValidationRecord> ParseDerivados3050Line(string line, int lineNumber)
    {
        const int MinLineLength = 200;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente para Colateral"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "3050");
            record.SetField("TipoDerivado", "Colateral");

            // Collateral type (positions 4-10)
            record.SetField("TipoColateral", line.Substring(4, 6).Trim());

            // Related derivative contract ID (positions 10-30)
            record.SetField("IdContratoRelacionado", line.Substring(10, 20).Trim());

            // Counterparty LEI (positions 30-50)
            var lei = line.Substring(30, 20).Trim();
            record.SetField("LEIContraparte", lei);

            // Collateral value (positions 50-68)
            record.SetField("ValorColateral", ParseDecimalWithImpliedDecimals(line.Substring(50, 18), 2));

            // Collateral type (Cash/Securities) (positions 68-70)
            var collTypeCode = line.Substring(68, 2).Trim();
            record.SetField("ClaseColateral", collTypeCode == "CA" ? "Efectivo" : "Valores");

            // Currency (positions 70-73)
            if (line.Length >= 73)
            {
                record.SetField("Moneda", line.Substring(70, 3).Trim());
            }

            // Date posted (positions 73-81)
            if (line.Length >= 81)
            {
                record.SetField("FechaDeposito", ParseDateSafe(line.Substring(73, 8)));
            }

            // Margin requirement (positions 81-99)
            if (line.Length >= 99)
            {
                record.SetField("RequerimientoMargen", ParseDecimalWithImpliedDecimals(line.Substring(81, 18), 2));
            }

            // Excess/Deficit (positions 99-117)
            if (line.Length >= 117)
            {
                record.SetField("ExcesoDeficit", ParseDecimalWithImpliedDecimals(line.Substring(99, 18), 2));
            }

            // Clearing house (positions 117-137)
            if (line.Length >= 137)
            {
                record.SetField("CamaraCompensacion", line.Substring(117, 20).Trim());
            }

            record.SetField("EsColateralEfectivo", collTypeCode == "CA");
            record.SetField("EsColateralValores", collTypeCode != "CA");

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando Colateral 3050 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 3060 - Derivative valuations/MTM details
    /// </summary>
    private Result<ValidationRecord> ParseDerivados3060Line(string line, int lineNumber)
    {
        const int MinLineLength = 150;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente para Valuación"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "3060");
            record.SetField("TipoDerivado", "Valuacion");

            // Valuation type (positions 4-10)
            record.SetField("TipoValuacion", line.Substring(4, 6).Trim());

            // Related contract ID (positions 10-30)
            record.SetField("IdContrato", line.Substring(10, 20).Trim());

            // Valuation date (positions 30-38)
            record.SetField("FechaValuacion", ParseDateSafe(line.Substring(30, 8)));

            // Mark-to-Market value (positions 38-56)
            record.SetField("ValorMTM", ParseDecimalWithImpliedDecimals(line.Substring(38, 18), 2));

            // Delta equivalent (positions 56-74)
            if (line.Length >= 74)
            {
                record.SetField("DeltaEquivalente", ParseDecimalWithImpliedDecimals(line.Substring(56, 18), 8));
            }

            // Credit exposure (positions 74-92)
            if (line.Length >= 92)
            {
                record.SetField("ExposicionCredito", ParseDecimalWithImpliedDecimals(line.Substring(74, 18), 2));
            }

            // Potential future exposure (positions 92-110)
            if (line.Length >= 110)
            {
                record.SetField("ExposicionFutura", ParseDecimalWithImpliedDecimals(line.Substring(92, 18), 2));
            }

            // Currency (positions 110-113)
            if (line.Length >= 113)
            {
                record.SetField("Moneda", line.Substring(110, 3).Trim());
            }

            record.SetField("EsValuacion", true);

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando Valuación 3060 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 3061 - Derivative summary/totals
    /// </summary>
    private Result<ValidationRecord> ParseDerivados3061Line(string line, int lineNumber)
    {
        const int MinLineLength = 100;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente para Totales Derivados"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "3061");
            record.SetField("TipoDerivado", "Totales");

            // Summary type (positions 4-10)
            record.SetField("TipoTotales", line.Substring(4, 6).Trim());

            // Total contracts count (positions 10-18)
            record.SetField("TotalContratos", ParseLongSafe(line.Substring(10, 8)));

            // Total notional (positions 18-36)
            record.SetField("TotalNocional", ParseDecimalWithImpliedDecimals(line.Substring(18, 18), 2));

            // Total MTM value (positions 36-54)
            record.SetField("TotalMTM", ParseDecimalWithImpliedDecimals(line.Substring(36, 18), 2));

            // Total positive MTM (positions 54-72)
            if (line.Length >= 72)
            {
                record.SetField("TotalMTMPositivo", ParseDecimalWithImpliedDecimals(line.Substring(54, 18), 2));
            }

            // Total negative MTM (positions 72-90)
            if (line.Length >= 90)
            {
                record.SetField("TotalMTMNegativo", ParseDecimalWithImpliedDecimals(line.Substring(72, 18), 2));
            }

            record.SetField("EsRegistroControl", true);

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando Totales 3061 - {ex.Message}"));
        }
    }

    /// <summary>
    /// Parse record type 3062 - Additional derivative summary/control
    /// </summary>
    private Result<ValidationRecord> ParseDerivados3062Line(string line, int lineNumber)
    {
        const int MinLineLength = 50;

        if (line.Length < MinLineLength)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.LineTooShort", $"Línea {lineNumber}: longitud insuficiente para Control Adicional"));
        }

        var record = new ValidationRecord
        {
            RecordIndex = lineNumber - 1,
            LineNumber = lineNumber
        };

        try
        {
            record.SetField("TipoRegistro", "3062");
            record.SetField("TipoDerivado", "ControlAdicional");

            // Control type (positions 4-10)
            record.SetField("TipoControl", line.Substring(4, 6).Trim());

            // Control value 1 (positions 10-28)
            record.SetField("ValorControl1", ParseDecimalWithImpliedDecimals(line.Substring(10, 18), 2));

            // Control value 2 (positions 28-46)
            if (line.Length >= 46)
            {
                record.SetField("ValorControl2", ParseDecimalWithImpliedDecimals(line.Substring(28, 18), 2));
            }

            record.SetField("EsRegistroControl", true);

            return Result.Success(record);
        }
        catch (Exception ex)
        {
            return Result.Failure<ValidationRecord>(
                Error.AsValidation("Parser.FieldExtraction", $"Línea {lineNumber}: error parseando Control 3062 - {ex.Message}"));
        }
    }

    #endregion

    #region Helper Methods for SIEFORE Parsing

    /// <summary>
    /// Parse integer safely, returning 0 on failure
    /// </summary>
    private static int ParseIntSafe(string value)
    {
        return int.TryParse(value.Trim(), out var result) ? result : 0;
    }

    /// <summary>
    /// Parse long safely, returning 0 on failure
    /// </summary>
    private static long ParseLongSafe(string value)
    {
        return long.TryParse(value.Trim(), out var result) ? result : 0;
    }

    /// <summary>
    /// Parse date from YYYYMMDD format
    /// </summary>
    private static DateTime? ParseDateSafe(string value)
    {
        value = value.Trim();
        if (string.IsNullOrEmpty(value) || value == "00000000")
            return null;

        if (DateTime.TryParseExact(value, "yyyyMMdd", null, System.Globalization.DateTimeStyles.None, out var result))
            return result;

        return null;
    }

    /// <summary>
    /// Parse short date from YYMMDD format
    /// </summary>
    private static DateTime? ParseShortDateSafe(string value)
    {
        value = value.Trim();
        if (string.IsNullOrEmpty(value) || value == "000000")
            return null;

        if (DateTime.TryParseExact(value, "yyMMdd", null, System.Globalization.DateTimeStyles.None, out var result))
            return result;

        return null;
    }

    /// <summary>
    /// Parse decimal with implied decimal places
    /// </summary>
    private static decimal ParseDecimalWithImpliedDecimals(string value, int impliedDecimals)
    {
        value = value.Trim();
        if (string.IsNullOrEmpty(value) || !long.TryParse(value, out var rawValue))
            return 0m;

        return rawValue / (decimal)Math.Pow(10, impliedDecimals);
    }

    /// <summary>
    /// Extract date from approximate position range
    /// </summary>
    private static DateTime? ExtractDateFromPosition(string line, int startPos, int endPos)
    {
        if (line.Length < endPos)
            endPos = line.Length;

        for (int i = startPos; i <= endPos - 8; i++)
        {
            var candidate = line.Substring(i, 8);
            if (candidate.StartsWith("20") && DateTime.TryParseExact(candidate, "yyyyMMdd", null,
                System.Globalization.DateTimeStyles.None, out var result))
            {
                return result;
            }
        }

        return null;
    }

    /// <summary>
    /// Parse swap payment frequency code
    /// </summary>
    private static string ParseSwapFrequency(string code)
    {
        return code.Trim().ToUpperInvariant() switch
        {
            "M" => "Mensual",
            "T" => "Trimestral",
            "S" => "Semestral",
            "A" => "Anual",
            "D" => "Diario",
            _ => code
        };
    }

    #endregion

    /// <summary>
    /// Identify record type from line content
    /// </summary>
    private Domain.Services.ConsarRecordType IdentifyRecordType(string line, FileType fileType)
    {
        if (line.Length < 2)
            return Domain.Services.ConsarRecordType.Unknown;

        // For SIEFORE files, first line is header, use different logic
        if (fileType == FileType.CarteraSiefore || fileType == FileType.Derivados)
        {
            return IdentifySiefereRecordType(line, fileType);
        }

        var typeCode = line[..2];

        return typeCode switch
        {
            "01" => Domain.Services.ConsarRecordType.Header,
            "02" => Domain.Services.ConsarRecordType.Detail,
            "03" => Domain.Services.ConsarRecordType.Footer,
            "04" => Domain.Services.ConsarRecordType.Control,
            "99" => Domain.Services.ConsarRecordType.Footer,
            _ => Domain.Services.ConsarRecordType.Detail // Default to detail
        };
    }

    /// <summary>
    /// Identify record type for SIEFORE investment portfolio files
    /// </summary>
    private static Domain.Services.ConsarRecordType IdentifySiefereRecordType(string line, FileType fileType)
    {
        if (line.Length < 3)
            return Domain.Services.ConsarRecordType.Unknown;

        // Header detection: starts with 0000 (record count at beginning)
        if (line.StartsWith("0000"))
            return Domain.Services.ConsarRecordType.Header;

        // Cartera SIEFORE (.0300) record types
        if (fileType == FileType.CarteraSiefore)
        {
            var typeCode = line[..3];
            return typeCode switch
            {
                "301" => Domain.Services.ConsarRecordType.Detail, // Government instruments
                "302" => Domain.Services.ConsarRecordType.Detail, // Other instruments
                "303" => Domain.Services.ConsarRecordType.Detail, // Equities
                "304" => Domain.Services.ConsarRecordType.Detail, // Structured products (CKDs, FIBRAs)
                "307" => Domain.Services.ConsarRecordType.Detail, // International ETFs
                "308" => Domain.Services.ConsarRecordType.Detail, // International equities/ADRs
                "309" => Domain.Services.ConsarRecordType.Footer, // Summary/Control totals
                "310" => Domain.Services.ConsarRecordType.Footer, // Additional control
                _ => Domain.Services.ConsarRecordType.Unknown
            };
        }

        // Derivados (.0314) record types
        if (fileType == FileType.Derivados)
        {
            if (line.Length < 4)
                return Domain.Services.ConsarRecordType.Unknown;

            var typeCode = line[..4];
            return typeCode switch
            {
                "3010" => Domain.Services.ConsarRecordType.Detail, // Forwards
                "3020" => Domain.Services.ConsarRecordType.Detail, // Futures
                "3030" => Domain.Services.ConsarRecordType.Detail, // Swaps
                "3040" => Domain.Services.ConsarRecordType.Detail, // Options
                "3050" => Domain.Services.ConsarRecordType.Detail, // Collateral/Margin
                "3060" => Domain.Services.ConsarRecordType.Detail, // Valuations
                "3061" => Domain.Services.ConsarRecordType.Footer, // Summary/Totals
                "3062" => Domain.Services.ConsarRecordType.Footer, // Additional control
                _ => Domain.Services.ConsarRecordType.Unknown
            };
        }

        return Domain.Services.ConsarRecordType.Unknown;
    }
}

/// <summary>
/// Interface for CONSAR file parser
/// </summary>
public interface IConsarFileParser
{
    Task<Result<ConsarFileParseResult>> ParseAsync(
        Stream fileStream,
        FileType fileType,
        IProgress<int>? progress = null,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of parsing a CONSAR file
/// </summary>
public class ConsarFileParseResult
{
    public FileType FileType { get; set; }
    public DateTime ParsedAt { get; set; }
    public int TotalLines { get; set; }
    public bool IsValid { get; set; }

    public ValidationRecord? HeaderRecord { get; set; }
    public ValidationRecord? FooterRecord { get; set; }
    public List<ValidationRecord> DetailRecords { get; set; } = new();
    public List<ValidationRecord> Records { get; set; } = new();
    public List<ConsarParseError> ParseErrors { get; set; } = new();

    public int DetailRecordCount => DetailRecords.Count;
    public int ParseErrorCount => ParseErrors.Count;
}

