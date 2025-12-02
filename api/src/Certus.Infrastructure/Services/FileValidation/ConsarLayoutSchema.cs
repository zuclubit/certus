using Certus.Domain.Enums;

namespace Certus.Infrastructure.Services.FileValidation;

/// <summary>
/// Esquema de configuración para layouts CONSAR.
/// Permite definir posiciones de campos sin hardcodear en el código.
/// VERSIONABLE: Soporta múltiples versiones de layouts por tipo de archivo.
/// </summary>
public interface IConsarLayoutSchemaProvider
{
    /// <summary>Obtiene esquema para tipo de archivo</summary>
    ConsarLayoutSchema? GetSchema(ConsarFileType fileType, string? version = null);

    /// <summary>Obtiene todas las versiones disponibles para un tipo</summary>
    IEnumerable<string> GetAvailableVersions(ConsarFileType fileType);
}

/// <summary>
/// Esquema de layout para un tipo de archivo CONSAR
/// </summary>
public class ConsarLayoutSchema
{
    public ConsarFileType FileType { get; init; }
    public string Version { get; init; } = "1.0";
    public string Description { get; init; } = string.Empty;
    public DateOnly? EffectiveFrom { get; init; }
    public DateOnly? EffectiveTo { get; init; }

    /// <summary>Definición del header</summary>
    public ConsarHeaderSchema Header { get; init; } = new();

    /// <summary>Definiciones de tipos de registro</summary>
    public Dictionary<string, ConsarRecordSchema> RecordTypes { get; init; } = new();
}

/// <summary>
/// Esquema del header del archivo
/// </summary>
public class ConsarHeaderSchema
{
    public int TotalLength { get; init; }
    public List<ConsarFieldSchema> Fields { get; init; } = new();
}

/// <summary>
/// Esquema de un tipo de registro
/// </summary>
public class ConsarRecordSchema
{
    public string RecordTypeCode { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public int MinLength { get; init; }
    public List<ConsarFieldSchema> Fields { get; init; } = new();
}

/// <summary>
/// Esquema de un campo individual
/// </summary>
public class ConsarFieldSchema
{
    public string Name { get; init; } = string.Empty;
    public int StartPosition { get; init; }
    public int Length { get; init; }
    public ConsarFieldType FieldType { get; init; }
    public int ImpliedDecimals { get; init; }
    public bool Required { get; init; }
    public string? Description { get; init; }
    public string? ValidationRegex { get; init; }
}

/// <summary>
/// Tipos de campo CONSAR
/// </summary>
public enum ConsarFieldType
{
    /// <summary>Texto/Alfanumérico</summary>
    String = 0,

    /// <summary>Numérico entero</summary>
    Integer = 1,

    /// <summary>Numérico con decimales implícitos</summary>
    Decimal = 2,

    /// <summary>Fecha YYYYMMDD</summary>
    DateYYYYMMDD = 3,

    /// <summary>Fecha YYMMDD</summary>
    DateYYMMDD = 4,

    /// <summary>Código ISIN</summary>
    ISIN = 5,

    /// <summary>Código LEI (20 caracteres)</summary>
    LEI = 6,

    /// <summary>Código de moneda ISO 4217</summary>
    Currency = 7,

    /// <summary>Booleano (0/1, S/N)</summary>
    Boolean = 8
}

/// <summary>
/// Proveedor de esquemas de layout basado en configuración
/// </summary>
public class ConsarLayoutSchemaProvider : IConsarLayoutSchemaProvider
{
    private readonly Dictionary<(ConsarFileType, string), ConsarLayoutSchema> _schemas;

    public ConsarLayoutSchemaProvider()
    {
        _schemas = new Dictionary<(ConsarFileType, string), ConsarLayoutSchema>();
        LoadDefaultSchemas();
    }

    public ConsarLayoutSchema? GetSchema(ConsarFileType fileType, string? version = null)
    {
        version ??= "1.0";

        if (_schemas.TryGetValue((fileType, version), out var schema))
            return schema;

        // Fallback a versión más reciente
        var latestVersion = _schemas.Keys
            .Where(k => k.Item1 == fileType)
            .OrderByDescending(k => k.Item2)
            .FirstOrDefault();

        if (latestVersion != default)
            return _schemas[latestVersion];

        return null;
    }

    public IEnumerable<string> GetAvailableVersions(ConsarFileType fileType)
    {
        return _schemas.Keys
            .Where(k => k.Item1 == fileType)
            .Select(k => k.Item2)
            .OrderBy(v => v);
    }

    /// <summary>
    /// Carga esquemas por defecto basados en análisis de archivos reales
    /// AUDITADO: Basado en 285 archivos reales (29-Ago-2025 → 27-Nov-2025)
    /// </summary>
    private void LoadDefaultSchemas()
    {
        // Esquema .0300 - Cartera SIEFORE
        _schemas[(ConsarFileType.CarteraSiefore0300, "1.0")] = new ConsarLayoutSchema
        {
            FileType = ConsarFileType.CarteraSiefore0300,
            Version = "1.0",
            Description = "Cartera de Inversión SIEFORE - Layout 3030",
            EffectiveFrom = new DateOnly(2024, 1, 1),
            Header = new ConsarHeaderSchema
            {
                TotalLength = 350,
                Fields = new List<ConsarFieldSchema>
                {
                    new() { Name = "TotalRegistros", StartPosition = 0, Length = 8, FieldType = ConsarFieldType.Integer },
                    new() { Name = "TipoHeader", StartPosition = 8, Length = 2, FieldType = ConsarFieldType.String },
                    new() { Name = "CodigoLayout", StartPosition = 10, Length = 4, FieldType = ConsarFieldType.String },
                    new() { Name = "TipoAdicional", StartPosition = 14, Length = 2, FieldType = ConsarFieldType.String },
                    new() { Name = "CodigoAfore", StartPosition = 16, Length = 4, FieldType = ConsarFieldType.String },
                    new() { Name = "CodigoSiefore", StartPosition = 20, Length = 6, FieldType = ConsarFieldType.String },
                    new() { Name = "Secuencia", StartPosition = 26, Length = 2, FieldType = ConsarFieldType.String },
                    new() { Name = "FechaGeneracion", StartPosition = 28, Length = 8, FieldType = ConsarFieldType.DateYYYYMMDD }
                }
            },
            RecordTypes = new Dictionary<string, ConsarRecordSchema>
            {
                ["301"] = new ConsarRecordSchema
                {
                    RecordTypeCode = "301",
                    Category = "Gobierno",
                    MinLength = 200,
                    Fields = new List<ConsarFieldSchema>
                    {
                        new() { Name = "TipoRegistro", StartPosition = 0, Length = 3, FieldType = ConsarFieldType.String },
                        new() { Name = "ISIN", StartPosition = 3, Length = 15, FieldType = ConsarFieldType.ISIN, Required = true },
                        new() { Name = "Serie", StartPosition = 18, Length = 8, FieldType = ConsarFieldType.String },
                        new() { Name = "TipoEmisor", StartPosition = 26, Length = 6, FieldType = ConsarFieldType.String },
                        new() { Name = "Emisora", StartPosition = 32, Length = 7, FieldType = ConsarFieldType.String },
                        new() { Name = "FechaVencimiento", StartPosition = 39, Length = 6, FieldType = ConsarFieldType.DateYYMMDD },
                        new() { Name = "TasaCupon", StartPosition = 45, Length = 2, FieldType = ConsarFieldType.String },
                        new() { Name = "TitulosTotales", StartPosition = 47, Length = 18, FieldType = ConsarFieldType.Integer },
                        new() { Name = "ValorNominal", StartPosition = 65, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 },
                        new() { Name = "PrecioUnitario", StartPosition = 83, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 8 },
                        new() { Name = "ValorMercado", StartPosition = 101, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 },
                        new() { Name = "InteresesDevengados", StartPosition = 119, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 },
                        new() { Name = "ValorTotal", StartPosition = 137, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 },
                        new() { Name = "Duracion", StartPosition = 155, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 6 }
                    }
                },
                ["302"] = new ConsarRecordSchema
                {
                    RecordTypeCode = "302",
                    Category = "Otros",
                    MinLength = 180,
                    Fields = new List<ConsarFieldSchema>
                    {
                        new() { Name = "TipoRegistro", StartPosition = 0, Length = 4, FieldType = ConsarFieldType.String },
                        new() { Name = "Subcategoria", StartPosition = 3, Length = 9, FieldType = ConsarFieldType.String },
                        new() { Name = "ISIN", StartPosition = 12, Length = 15, FieldType = ConsarFieldType.ISIN },
                        new() { Name = "Serie", StartPosition = 27, Length = 7, FieldType = ConsarFieldType.String },
                        new() { Name = "TipoEmisor", StartPosition = 34, Length = 6, FieldType = ConsarFieldType.String },
                        new() { Name = "NombreInstrumento", StartPosition = 40, Length = 10, FieldType = ConsarFieldType.String },
                        new() { Name = "FechaVencimiento", StartPosition = 50, Length = 6, FieldType = ConsarFieldType.DateYYMMDD },
                        new() { Name = "TitulosCantidad", StartPosition = 66, Length = 18, FieldType = ConsarFieldType.Integer },
                        new() { Name = "ValorNominal", StartPosition = 84, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 },
                        new() { Name = "ValorMercado", StartPosition = 102, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 }
                    }
                },
                ["303"] = new ConsarRecordSchema
                {
                    RecordTypeCode = "303",
                    Category = "RentaVariable",
                    MinLength = 300,
                    Fields = new List<ConsarFieldSchema>
                    {
                        new() { Name = "TipoRegistro", StartPosition = 0, Length = 4, FieldType = ConsarFieldType.String },
                        new() { Name = "Subcategoria", StartPosition = 3, Length = 4, FieldType = ConsarFieldType.String },
                        new() { Name = "ISIN", StartPosition = 7, Length = 15, FieldType = ConsarFieldType.ISIN, Required = true },
                        new() { Name = "CUSIP", StartPosition = 22, Length = 8, FieldType = ConsarFieldType.String },
                        new() { Name = "Ticker", StartPosition = 30, Length = 10, FieldType = ConsarFieldType.String },
                        new() { Name = "Serie", StartPosition = 40, Length = 2, FieldType = ConsarFieldType.String },
                        new() { Name = "NumeroAcciones", StartPosition = 42, Length = 16, FieldType = ConsarFieldType.Integer },
                        new() { Name = "CostoUnitario", StartPosition = 58, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 8 },
                        new() { Name = "CostoTotal", StartPosition = 76, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 },
                        new() { Name = "PrecioMercado", StartPosition = 94, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 8 },
                        new() { Name = "ValorMercado", StartPosition = 112, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 },
                        new() { Name = "GananciaNoRealizada", StartPosition = 130, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 }
                    }
                },
                ["307"] = new ConsarRecordSchema
                {
                    RecordTypeCode = "307",
                    Category = "ETFInternacional",
                    MinLength = 300,
                    Fields = new List<ConsarFieldSchema>
                    {
                        new() { Name = "TipoRegistro", StartPosition = 0, Length = 4, FieldType = ConsarFieldType.String },
                        new() { Name = "ISIN", StartPosition = 7, Length = 15, FieldType = ConsarFieldType.ISIN, Required = true },
                        new() { Name = "NombreETF", StartPosition = 30, Length = 15, FieldType = ConsarFieldType.String },
                        new() { Name = "NumeroUnidades", StartPosition = 50, Length = 18, FieldType = ConsarFieldType.Integer },
                        new() { Name = "CostoMonedaOriginal", StartPosition = 68, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 },
                        new() { Name = "CostoMXN", StartPosition = 86, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 },
                        new() { Name = "ValorMercadoMXN", StartPosition = 122, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 },
                        new() { Name = "MonedaOriginal", StartPosition = 158, Length = 3, FieldType = ConsarFieldType.Currency },
                        new() { Name = "TipoCambio", StartPosition = 250, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 8 }
                    }
                }
            }
        };

        // Esquema .0314 - Derivados
        _schemas[(ConsarFileType.Derivados0314, "1.0")] = new ConsarLayoutSchema
        {
            FileType = ConsarFileType.Derivados0314,
            Version = "1.0",
            Description = "Derivados Financieros - Layout 8031/0314",
            EffectiveFrom = new DateOnly(2024, 1, 1),
            Header = new ConsarHeaderSchema
            {
                TotalLength = 500,
                Fields = new List<ConsarFieldSchema>
                {
                    new() { Name = "TotalRegistros", StartPosition = 0, Length = 8, FieldType = ConsarFieldType.Integer },
                    new() { Name = "TipoHeader", StartPosition = 8, Length = 2, FieldType = ConsarFieldType.String },
                    new() { Name = "CodigoLayout", StartPosition = 10, Length = 4, FieldType = ConsarFieldType.String },
                    new() { Name = "CodigoAfore", StartPosition = 16, Length = 4, FieldType = ConsarFieldType.String },
                    new() { Name = "FechaGeneracion", StartPosition = 28, Length = 8, FieldType = ConsarFieldType.DateYYYYMMDD }
                }
            },
            RecordTypes = new Dictionary<string, ConsarRecordSchema>
            {
                ["3010"] = new ConsarRecordSchema
                {
                    RecordTypeCode = "3010",
                    Category = "Forward",
                    MinLength = 400,
                    Fields = new List<ConsarFieldSchema>
                    {
                        new() { Name = "TipoRegistro", StartPosition = 0, Length = 4, FieldType = ConsarFieldType.String },
                        new() { Name = "TipoForward", StartPosition = 22, Length = 4, FieldType = ConsarFieldType.String },
                        new() { Name = "ParDivisas", StartPosition = 26, Length = 6, FieldType = ConsarFieldType.String },
                        new() { Name = "FechaVencimiento", StartPosition = 32, Length = 6, FieldType = ConsarFieldType.DateYYMMDD },
                        new() { Name = "IdContrato", StartPosition = 38, Length = 12, FieldType = ConsarFieldType.String },
                        new() { Name = "LEIContraparte", StartPosition = 50, Length = 20, FieldType = ConsarFieldType.LEI, Required = true }
                    }
                },
                ["3020"] = new ConsarRecordSchema
                {
                    RecordTypeCode = "3020",
                    Category = "Futuro",
                    MinLength = 350,
                    Fields = new List<ConsarFieldSchema>
                    {
                        new() { Name = "TipoRegistro", StartPosition = 0, Length = 4, FieldType = ConsarFieldType.String },
                        new() { Name = "CodigoContrato", StartPosition = 4, Length = 16, FieldType = ConsarFieldType.String },
                        new() { Name = "SubyacenteCodigo", StartPosition = 20, Length = 15, FieldType = ConsarFieldType.String },
                        new() { Name = "Bolsa", StartPosition = 35, Length = 10, FieldType = ConsarFieldType.String },
                        new() { Name = "MesVencimiento", StartPosition = 45, Length = 6, FieldType = ConsarFieldType.String },
                        new() { Name = "NumeroContratos", StartPosition = 51, Length = 14, FieldType = ConsarFieldType.Integer }
                    }
                },
                ["3040"] = new ConsarRecordSchema
                {
                    RecordTypeCode = "3040",
                    Category = "Opcion",
                    MinLength = 350,
                    Fields = new List<ConsarFieldSchema>
                    {
                        new() { Name = "TipoRegistro", StartPosition = 0, Length = 4, FieldType = ConsarFieldType.String },
                        new() { Name = "TipoOpcion", StartPosition = 4, Length = 1, FieldType = ConsarFieldType.String },
                        new() { Name = "EstiloOpcion", StartPosition = 5, Length = 1, FieldType = ConsarFieldType.String },
                        new() { Name = "SubyacenteCodigo", StartPosition = 6, Length = 15, FieldType = ConsarFieldType.String },
                        new() { Name = "LEIContraparte", StartPosition = 41, Length = 20, FieldType = ConsarFieldType.LEI }
                    }
                },
                ["3050"] = new ConsarRecordSchema
                {
                    RecordTypeCode = "3050",
                    Category = "Colateral",
                    MinLength = 200,
                    Fields = new List<ConsarFieldSchema>
                    {
                        new() { Name = "TipoRegistro", StartPosition = 0, Length = 4, FieldType = ConsarFieldType.String },
                        new() { Name = "TipoColateral", StartPosition = 4, Length = 6, FieldType = ConsarFieldType.String },
                        new() { Name = "IdContratoRelacionado", StartPosition = 10, Length = 20, FieldType = ConsarFieldType.String },
                        new() { Name = "LEIContraparte", StartPosition = 30, Length = 20, FieldType = ConsarFieldType.LEI },
                        new() { Name = "ValorColateral", StartPosition = 50, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 }
                    }
                }
            }
        };

        // Esquema .1101 - Totales/Conciliación
        _schemas[(ConsarFileType.TotalesConciliacion1101, "1.0")] = new ConsarLayoutSchema
        {
            FileType = ConsarFileType.TotalesConciliacion1101,
            Version = "1.0",
            Description = "Totales y Conciliación - Layout 7110",
            EffectiveFrom = new DateOnly(2024, 1, 1),
            Header = new ConsarHeaderSchema
            {
                TotalLength = 80,
                Fields = new List<ConsarFieldSchema>
                {
                    new() { Name = "TotalRegistros", StartPosition = 0, Length = 8, FieldType = ConsarFieldType.Integer },
                    new() { Name = "CodigoLayout", StartPosition = 10, Length = 4, FieldType = ConsarFieldType.String },
                    new() { Name = "CodigoAfore", StartPosition = 16, Length = 4, FieldType = ConsarFieldType.String },
                    new() { Name = "FechaGeneracion", StartPosition = 28, Length = 8, FieldType = ConsarFieldType.DateYYYYMMDD }
                }
            },
            RecordTypes = new Dictionary<string, ConsarRecordSchema>
            {
                ["30111"] = new ConsarRecordSchema
                {
                    RecordTypeCode = "30111",
                    Category = "TotalTipo1",
                    MinLength = 70,
                    Fields = new List<ConsarFieldSchema>
                    {
                        new() { Name = "TipoRegistro", StartPosition = 0, Length = 5, FieldType = ConsarFieldType.String },
                        new() { Name = "SubCategoria", StartPosition = 5, Length = 5, FieldType = ConsarFieldType.String },
                        new() { Name = "Valor1", StartPosition = 10, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 },
                        new() { Name = "Valor2", StartPosition = 28, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 },
                        new() { Name = "Valor3", StartPosition = 46, Length = 18, FieldType = ConsarFieldType.Decimal, ImpliedDecimals = 2 }
                    }
                }
            }
        };
    }
}
