using Certus.Domain.Common;
using Certus.Domain.Enums;
using Certus.Domain.Services;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.Services.FileValidation;

/// <summary>
/// Implementation of IFileValidationService for CONSAR files
/// Coordinates file parsing and structure validation
/// </summary>
public class ConsarFileValidationService : IFileValidationService
{
    private readonly IConsarFileParser _parser;
    private readonly ILogger<ConsarFileValidationService> _logger;

    private static readonly Dictionary<FileType, ValidatorInfo[]> _validatorsByFileType = new()
    {
        [FileType.Nomina] = new[]
        {
            new ValidatorInfo { Code = "NOMINA_STR_01", Name = "Estructura de archivo", Group = "Estructura", Order = 1, IsRequired = true },
            new ValidatorInfo { Code = "NOMINA_HDR_01", Name = "Encabezado válido", Group = "Estructura", Order = 2, IsRequired = true },
            new ValidatorInfo { Code = "NOMINA_FTR_01", Name = "Sumario válido", Group = "Estructura", Order = 3, IsRequired = true },
            new ValidatorInfo { Code = "NOMINA_VAL_01", Name = "Validación CURP", Group = "Datos", Order = 10, IsRequired = true },
            new ValidatorInfo { Code = "NOMINA_VAL_02", Name = "Validación NSS", Group = "Datos", Order = 11, IsRequired = true },
            new ValidatorInfo { Code = "NOMINA_VAL_03", Name = "Validación RFC", Group = "Datos", Order = 12, IsRequired = true },
            new ValidatorInfo { Code = "NOMINA_VAL_04", Name = "Validación Cuenta", Group = "Datos", Order = 13, IsRequired = true },
            new ValidatorInfo { Code = "NOMINA_VAL_05", Name = "Validación Importes", Group = "Cálculos", Order = 20, IsRequired = true },
        },
        [FileType.Contable] = new[]
        {
            new ValidatorInfo { Code = "CONT_STR_01", Name = "Estructura de archivo", Group = "Estructura", Order = 1, IsRequired = true },
            new ValidatorInfo { Code = "CONT_VAL_01", Name = "Catálogo SAT", Group = "Datos", Order = 10, IsRequired = true },
            new ValidatorInfo { Code = "CONT_VAL_02", Name = "Balance debe/haber", Group = "Cálculos", Order = 20, IsRequired = true },
        },
        [FileType.Regularizacion] = new[]
        {
            new ValidatorInfo { Code = "REG_STR_01", Name = "Estructura de archivo", Group = "Estructura", Order = 1, IsRequired = true },
            new ValidatorInfo { Code = "REG_VAL_01", Name = "Referencia original", Group = "Datos", Order = 10, IsRequired = true },
            new ValidatorInfo { Code = "REG_VAL_02", Name = "Autorización CONSAR", Group = "Regulatorio", Order = 20, IsRequired = true },
        },

        // ========== SIEFORE Investment Portfolio Validators (.0300) ==========
        [FileType.CarteraSiefore] = new[]
        {
            // Structure validators
            new ValidatorInfo { Code = "CART_STR_01", Name = "Estructura de archivo", Group = "Estructura", Order = 1, IsRequired = true },
            new ValidatorInfo { Code = "CART_HDR_01", Name = "Encabezado válido", Group = "Estructura", Order = 2, IsRequired = true },
            new ValidatorInfo { Code = "CART_HDR_02", Name = "Código AFORE válido", Group = "Estructura", Order = 3, IsRequired = true },
            new ValidatorInfo { Code = "CART_HDR_03", Name = "Fecha de generación válida", Group = "Estructura", Order = 4, IsRequired = true },
            new ValidatorInfo { Code = "CART_REC_01", Name = "Tipos de registro válidos (301/302/303/307)", Group = "Estructura", Order = 5, IsRequired = true },

            // ISIN/Instrument validators
            new ValidatorInfo { Code = "CART_ISIN_01", Name = "Formato ISIN válido", Group = "Instrumentos", Order = 10, IsRequired = true },
            new ValidatorInfo { Code = "CART_ISIN_02", Name = "ISIN registrado en catálogo CONSAR", Group = "Instrumentos", Order = 11, IsRequired = false },
            new ValidatorInfo { Code = "CART_ISIN_03", Name = "Emisora válida", Group = "Instrumentos", Order = 12, IsRequired = true },
            new ValidatorInfo { Code = "CART_ISIN_04", Name = "Fecha vencimiento coherente", Group = "Instrumentos", Order = 13, IsRequired = true },

            // Valuation validators
            new ValidatorInfo { Code = "CART_VAL_01", Name = "Valor nominal positivo", Group = "Valuación", Order = 20, IsRequired = true },
            new ValidatorInfo { Code = "CART_VAL_02", Name = "Valor mercado consistente", Group = "Valuación", Order = 21, IsRequired = true },
            new ValidatorInfo { Code = "CART_VAL_03", Name = "Precio unitario razonable", Group = "Valuación", Order = 22, IsRequired = true },
            new ValidatorInfo { Code = "CART_VAL_04", Name = "Títulos/acciones positivos", Group = "Valuación", Order = 23, IsRequired = true },
            new ValidatorInfo { Code = "CART_VAL_05", Name = "Cálculo valor total correcto", Group = "Valuación", Order = 24, IsRequired = true },

            // Government instruments specific (301)
            new ValidatorInfo { Code = "CART_GOB_01", Name = "Emisora gobierno válida (CETES/BONOS/UDIBONOS)", Group = "Gobierno", Order = 30, IsRequired = true },
            new ValidatorInfo { Code = "CART_GOB_02", Name = "Plazo CETES válido", Group = "Gobierno", Order = 31, IsRequired = false },
            new ValidatorInfo { Code = "CART_GOB_03", Name = "Tasa cupón BONOS coherente", Group = "Gobierno", Order = 32, IsRequired = false },

            // Equities specific (303)
            new ValidatorInfo { Code = "CART_RV_01", Name = "Ticker/emisora BMV válida", Group = "RentaVariable", Order = 40, IsRequired = true },
            new ValidatorInfo { Code = "CART_RV_02", Name = "Serie válida", Group = "RentaVariable", Order = 41, IsRequired = false },
            new ValidatorInfo { Code = "CART_RV_03", Name = "Precio mercado razonable vs histórico", Group = "RentaVariable", Order = 42, IsRequired = false },

            // International ETFs specific (307)
            new ValidatorInfo { Code = "CART_ETF_01", Name = "ISIN internacional válido (US/IE/FR/LU)", Group = "ETFIntl", Order = 50, IsRequired = true },
            new ValidatorInfo { Code = "CART_ETF_02", Name = "Tipo cambio aplicado", Group = "ETFIntl", Order = 51, IsRequired = true },
            new ValidatorInfo { Code = "CART_ETF_03", Name = "Conversión MXN correcta", Group = "ETFIntl", Order = 52, IsRequired = true },

            // Regulatory limits
            new ValidatorInfo { Code = "CART_LIM_01", Name = "Límite concentración por emisora", Group = "Regulatorio", Order = 60, IsRequired = true },
            new ValidatorInfo { Code = "CART_LIM_02", Name = "Límite inversión internacional", Group = "Regulatorio", Order = 61, IsRequired = true },
            new ValidatorInfo { Code = "CART_LIM_03", Name = "Límite instrumentos estructurados", Group = "Regulatorio", Order = 62, IsRequired = false },

            // Totals validation
            new ValidatorInfo { Code = "CART_TOT_01", Name = "Suma total cartera", Group = "Totales", Order = 70, IsRequired = true },
            new ValidatorInfo { Code = "CART_TOT_02", Name = "Conteo registros correcto", Group = "Totales", Order = 71, IsRequired = true },
        },

        // ========== Derivatives Portfolio Validators (.0314) ==========
        [FileType.Derivados] = new[]
        {
            // Structure validators
            new ValidatorInfo { Code = "DER_STR_01", Name = "Estructura de archivo", Group = "Estructura", Order = 1, IsRequired = true },
            new ValidatorInfo { Code = "DER_HDR_01", Name = "Encabezado válido", Group = "Estructura", Order = 2, IsRequired = true },
            new ValidatorInfo { Code = "DER_HDR_02", Name = "Código AFORE válido", Group = "Estructura", Order = 3, IsRequired = true },
            new ValidatorInfo { Code = "DER_REC_01", Name = "Tipos de registro válidos (3010/3020/3030/3040)", Group = "Estructura", Order = 4, IsRequired = true },

            // LEI validators (Legal Entity Identifier)
            new ValidatorInfo { Code = "DER_LEI_01", Name = "Formato LEI válido (20 caracteres)", Group = "Contraparte", Order = 10, IsRequired = true },
            new ValidatorInfo { Code = "DER_LEI_02", Name = "LEI registrado en GLEIF", Group = "Contraparte", Order = 11, IsRequired = false },
            new ValidatorInfo { Code = "DER_LEI_03", Name = "Contraparte autorizada CONSAR", Group = "Contraparte", Order = 12, IsRequired = true },

            // Forward validators (3010)
            new ValidatorInfo { Code = "DER_FWD_01", Name = "Par de divisas válido", Group = "Forwards", Order = 20, IsRequired = true },
            new ValidatorInfo { Code = "DER_FWD_02", Name = "Fecha vencimiento futura", Group = "Forwards", Order = 21, IsRequired = true },
            new ValidatorInfo { Code = "DER_FWD_03", Name = "Monto nocional positivo", Group = "Forwards", Order = 22, IsRequired = true },
            new ValidatorInfo { Code = "DER_FWD_04", Name = "Tasa forward razonable", Group = "Forwards", Order = 23, IsRequired = true },
            new ValidatorInfo { Code = "DER_FWD_05", Name = "MTM consistente con mercado", Group = "Forwards", Order = 24, IsRequired = false },
            new ValidatorInfo { Code = "DER_FWD_06", Name = "Fechas operación coherentes", Group = "Forwards", Order = 25, IsRequired = true },

            // Futures validators (3020)
            new ValidatorInfo { Code = "DER_FUT_01", Name = "Código contrato válido", Group = "Futuros", Order = 30, IsRequired = true },
            new ValidatorInfo { Code = "DER_FUT_02", Name = "Bolsa reconocida", Group = "Futuros", Order = 31, IsRequired = true },
            new ValidatorInfo { Code = "DER_FUT_03", Name = "Número contratos positivo", Group = "Futuros", Order = 32, IsRequired = true },
            new ValidatorInfo { Code = "DER_FUT_04", Name = "Margen inicial depositado", Group = "Futuros", Order = 33, IsRequired = true },
            new ValidatorInfo { Code = "DER_FUT_05", Name = "Multiplicador correcto", Group = "Futuros", Order = 34, IsRequired = true },

            // Swap validators (3030)
            new ValidatorInfo { Code = "DER_SWP_01", Name = "Tipo swap válido (IRS/CCS)", Group = "Swaps", Order = 40, IsRequired = true },
            new ValidatorInfo { Code = "DER_SWP_02", Name = "Fecha efectiva válida", Group = "Swaps", Order = 41, IsRequired = true },
            new ValidatorInfo { Code = "DER_SWP_03", Name = "Fecha vencimiento válida", Group = "Swaps", Order = 42, IsRequired = true },
            new ValidatorInfo { Code = "DER_SWP_04", Name = "Monto nocional positivo", Group = "Swaps", Order = 43, IsRequired = true },
            new ValidatorInfo { Code = "DER_SWP_05", Name = "Tasa referencia válida (TIIE/SOFR)", Group = "Swaps", Order = 44, IsRequired = true },
            new ValidatorInfo { Code = "DER_SWP_06", Name = "Frecuencia pago válida", Group = "Swaps", Order = 45, IsRequired = true },
            new ValidatorInfo { Code = "DER_SWP_07", Name = "Monedas pata válidas", Group = "Swaps", Order = 46, IsRequired = true },

            // Option validators (3040)
            new ValidatorInfo { Code = "DER_OPT_01", Name = "Tipo opción válido (Call/Put)", Group = "Opciones", Order = 50, IsRequired = true },
            new ValidatorInfo { Code = "DER_OPT_02", Name = "Estilo opción válido (EU/AM)", Group = "Opciones", Order = 51, IsRequired = true },
            new ValidatorInfo { Code = "DER_OPT_03", Name = "Precio ejercicio positivo", Group = "Opciones", Order = 52, IsRequired = true },
            new ValidatorInfo { Code = "DER_OPT_04", Name = "Fecha expiración futura", Group = "Opciones", Order = 53, IsRequired = true },
            new ValidatorInfo { Code = "DER_OPT_05", Name = "Prima razonable", Group = "Opciones", Order = 54, IsRequired = true },
            new ValidatorInfo { Code = "DER_OPT_06", Name = "Greeks consistentes (Delta/Gamma/Vega)", Group = "Opciones", Order = 55, IsRequired = false },

            // Risk validators
            new ValidatorInfo { Code = "DER_RSK_01", Name = "Exposición neta por contraparte", Group = "Riesgo", Order = 60, IsRequired = true },
            new ValidatorInfo { Code = "DER_RSK_02", Name = "Límite derivados total", Group = "Riesgo", Order = 61, IsRequired = true },
            new ValidatorInfo { Code = "DER_RSK_03", Name = "Colateral suficiente", Group = "Riesgo", Order = 62, IsRequired = true },

            // Regulatory validators
            new ValidatorInfo { Code = "DER_REG_01", Name = "Propósito cobertura documentado", Group = "Regulatorio", Order = 70, IsRequired = true },
            new ValidatorInfo { Code = "DER_REG_02", Name = "Límite VaR derivados", Group = "Regulatorio", Order = 71, IsRequired = true },

            // Totals validation
            new ValidatorInfo { Code = "DER_TOT_01", Name = "Suma MTM total derivados", Group = "Totales", Order = 80, IsRequired = true },
            new ValidatorInfo { Code = "DER_TOT_02", Name = "Conteo registros correcto", Group = "Totales", Order = 81, IsRequired = true },
        }
    };

    public ConsarFileValidationService(
        IConsarFileParser parser,
        ILogger<ConsarFileValidationService> logger)
    {
        _parser = parser;
        _logger = logger;
    }

    /// <summary>
    /// Parse file and extract records for validation
    /// </summary>
    public async Task<Result<FileParseResult>> ParseFileAsync(
        Stream fileStream,
        FileType fileType,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Parsing file of type {FileType}", fileType);

        var parseResult = await _parser.ParseAsync(fileStream, fileType, null, cancellationToken);

        if (parseResult.IsFailure)
        {
            return Result.Failure<FileParseResult>(parseResult.Error);
        }

        var consarResult = parseResult.Value;

        var result = new FileParseResult
        {
            FileType = fileType,
            TotalRecords = consarResult.Records.Count,
            TotalLines = consarResult.TotalLines,
            IsValid = consarResult.IsValid,
            Records = consarResult.Records,
            HeaderRecord = consarResult.HeaderRecord,
            FooterRecord = consarResult.FooterRecord,
            ParseErrors = consarResult.ParseErrors.Select(e => new FileParseError
            {
                LineNumber = e.LineNumber,
                ErrorCode = e.Code,
                Message = e.Message,
                RawLine = e.RawLine
            }).ToList(),
            Metadata = new Dictionary<string, object>
            {
                ["DetailRecordCount"] = consarResult.DetailRecordCount,
                ["ParseErrorCount"] = consarResult.ParseErrorCount,
                ["ParsedAt"] = consarResult.ParsedAt
            }
        };

        _logger.LogInformation(
            "Parsed file: {TotalLines} lines, {RecordCount} records, {ErrorCount} parse errors",
            result.TotalLines, result.TotalRecords, result.ParseErrors.Count);

        return Result.Success(result);
    }

    /// <summary>
    /// Validate file structure (header, footer, record types)
    /// </summary>
    public async Task<FileValidationResult> ValidateStructureAsync(
        Stream fileStream,
        FileType fileType,
        CancellationToken cancellationToken = default)
    {
        var result = new FileValidationResult();
        var sw = System.Diagnostics.Stopwatch.StartNew();

        var parseResult = await _parser.ParseAsync(fileStream, fileType, null, cancellationToken);

        if (parseResult.IsFailure)
        {
            result.Errors.Add(new FileValidationError
            {
                ValidatorCode = "STRUCT_001",
                ValidatorName = "Parser",
                Severity = ErrorSeverity.Critical,
                Message = parseResult.Error.Message,
                Line = 0
            });
            sw.Stop();
            result.Duration = sw.Elapsed;
            return result;
        }

        var parsed = parseResult.Value;

        // SIEFORE files (.0300, .0314) use header with record count, no footer
        var isSiefereFile = fileType == FileType.CarteraSiefore || fileType == FileType.Derivados;

        // Validate header exists
        if (parsed.HeaderRecord == null)
        {
            result.Errors.Add(new FileValidationError
            {
                ValidatorCode = "STRUCT_002",
                ValidatorName = "Encabezado",
                Severity = ErrorSeverity.Critical,
                Message = isSiefereFile
                    ? "El archivo no contiene registro de encabezado con conteo de registros"
                    : "El archivo no contiene registro de encabezado (tipo 01)",
                Line = 1
            });
        }

        // For SIEFORE files, validate header record count
        if (isSiefereFile && parsed.HeaderRecord != null)
        {
            var headerCount = parsed.HeaderRecord.GetFieldValue<int>("TotalRegistros");
            if (headerCount > 0 && headerCount != parsed.DetailRecordCount)
            {
                result.Warnings.Add(new FileValidationWarning
                {
                    ValidatorCode = "STRUCT_SIEFORE_001",
                    Message = $"Conteo de registros SIEFORE: El conteo en encabezado ({headerCount}) no coincide con registros procesados ({parsed.DetailRecordCount})",
                    Line = 1
                });
            }

            // Validate AFORE code is present
            var aforeCode = parsed.HeaderRecord.GetFieldValue<string>("CodigoAfore");
            if (string.IsNullOrWhiteSpace(aforeCode))
            {
                result.Errors.Add(new FileValidationError
                {
                    ValidatorCode = "STRUCT_SIEFORE_002",
                    ValidatorName = "Código AFORE",
                    Severity = ErrorSeverity.Error,
                    Message = "Código AFORE no encontrado en encabezado",
                    Line = 1
                });
            }

            // Validate generation date
            var genDate = parsed.HeaderRecord.GetFieldValue<DateTime?>("FechaGeneracion");
            if (genDate == null)
            {
                result.Warnings.Add(new FileValidationWarning
                {
                    ValidatorCode = "STRUCT_SIEFORE_003",
                    Message = "Fecha de generación no válida en encabezado",
                    Line = 1
                });
            }
        }

        // Validate footer exists (only for non-SIEFORE files)
        if (!isSiefereFile && parsed.FooterRecord == null)
        {
            result.Errors.Add(new FileValidationError
            {
                ValidatorCode = "STRUCT_003",
                ValidatorName = "Sumario",
                Severity = ErrorSeverity.Critical,
                Message = "El archivo no contiene registro de sumario (tipo 03/99)",
                Line = parsed.TotalLines
            });
        }

        // Validate record count matches footer if present (non-SIEFORE)
        if (!isSiefereFile && parsed.FooterRecord != null)
        {
            var footerCount = parsed.FooterRecord.GetFieldValue<int>("TotalRegistros");
            if (footerCount > 0 && footerCount != parsed.DetailRecordCount)
            {
                result.Errors.Add(new FileValidationError
                {
                    ValidatorCode = "STRUCT_004",
                    ValidatorName = "Conteo de registros",
                    Severity = ErrorSeverity.Error,
                    Message = $"El conteo de registros en sumario ({footerCount}) no coincide con registros procesados ({parsed.DetailRecordCount})",
                    Line = parsed.TotalLines,
                    Value = parsed.DetailRecordCount.ToString(),
                    ExpectedValue = footerCount.ToString()
                });
            }
        }

        // Add parse errors
        foreach (var parseError in parsed.ParseErrors)
        {
            result.Errors.Add(new FileValidationError
            {
                ValidatorCode = parseError.Code,
                ValidatorName = "Parser",
                Severity = ErrorSeverity.Error,
                Message = parseError.Message,
                Line = parseError.LineNumber,
                Value = parseError.RawLine
            });
        }

        result.RecordCount = parsed.TotalLines;
        result.ValidRecordCount = parsed.Records.Count;

        sw.Stop();
        result.Duration = sw.Elapsed;

        return result;
    }

    /// <summary>
    /// Validate file content according to CONSAR rules
    /// </summary>
    public async Task<FileValidationResult> ValidateContentAsync(
        Stream fileStream,
        FileType fileType,
        IReadOnlyDictionary<string, object>? options = null,
        CancellationToken cancellationToken = default)
    {
        // This method delegates to the full ValidateAsync
        return await ValidateAsync(fileStream, fileType, options, null, cancellationToken);
    }

    /// <summary>
    /// Complete file validation
    /// </summary>
    public async Task<FileValidationResult> ValidateAsync(
        Stream fileStream,
        FileType fileType,
        IReadOnlyDictionary<string, object>? options = null,
        IProgress<ValidationProgress>? progress = null,
        CancellationToken cancellationToken = default)
    {
        var result = new FileValidationResult();
        var sw = System.Diagnostics.Stopwatch.StartNew();

        // First validate structure
        var structureResult = await ValidateStructureAsync(fileStream, fileType, cancellationToken);

        // Copy structure errors/warnings
        result.Errors.AddRange(structureResult.Errors);
        result.Warnings.AddRange(structureResult.Warnings);
        result.RecordCount = structureResult.RecordCount;
        result.ValidRecordCount = structureResult.ValidRecordCount;

        // If structure validation failed with critical errors, stop
        if (structureResult.Errors.Any(e => e.Severity == ErrorSeverity.Critical))
        {
            sw.Stop();
            result.Duration = sw.Elapsed;
            return result;
        }

        // Reset stream for content validation
        if (fileStream.CanSeek)
        {
            fileStream.Seek(0, SeekOrigin.Begin);
        }

        // Note: Content validation with business rules is handled by ValidationEngineService
        // This service focuses on structure and format validation

        sw.Stop();
        result.Duration = sw.Elapsed;

        return result;
    }

    /// <summary>
    /// Get validators available for a file type
    /// </summary>
    public IReadOnlyList<ValidatorInfo> GetValidators(FileType fileType)
    {
        if (_validatorsByFileType.TryGetValue(fileType, out var validators))
        {
            return validators;
        }

        return Array.Empty<ValidatorInfo>();
    }
}
