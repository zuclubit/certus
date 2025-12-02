namespace Certus.Domain.Enums;

/// <summary>
/// Tipos de archivos CONSAR basados en nomenclatura real observada.
/// AUDITADO: Basado en análisis de 285 archivos reales (29-Ago-2025 → 27-Nov-2025)
/// </summary>
public enum ConsarFileType
{
    /// <summary>Tipo desconocido o no detectado</summary>
    Unknown = 0,

    // ========================================
    // Archivos de Cartera/Portafolio
    // ========================================

    /// <summary>
    /// .0300 - Cartera de Inversión SIEFORE
    /// Layout: 3030
    /// Registros: 301M (Gobierno), 302x (Otros), 303x (RV), 307x (ETF Intl), 308x (RV Intl)
    /// </summary>
    CarteraSiefore0300 = 300,

    /// <summary>
    /// .0314 - Derivados Financieros
    /// Layout: 8031/0314
    /// Registros: 3010 (Forwards), 3020 (Futuros), 3030 (Swaps), 3040 (Opciones), 3050 (Colateral)
    /// </summary>
    Derivados0314 = 314,

    /// <summary>
    /// .0316 - Confirmaciones de Operaciones
    /// Layout: Variable
    /// </summary>
    Confirmaciones0316 = 316,

    /// <summary>
    /// .0317 - Control/Resumen de Cartera
    /// Layout: Corto (header only en algunos casos)
    /// </summary>
    ControlCartera0317 = 317,

    /// <summary>
    /// .0321 - Información de Fondos BMRPREV
    /// Layout: 6032
    /// Registros: 301 (Fondos BMRPREV por tipo)
    /// </summary>
    FondosBmrprev0321 = 321,

    // ========================================
    // Archivos de Totales/Conciliación
    // ========================================

    /// <summary>
    /// .1101 - Totales y Conciliación
    /// Layout: 7110
    /// Registros: 30111-30172 (múltiples subcategorías)
    /// </summary>
    TotalesConciliacion1101 = 1101,

    // ========================================
    // Archivos Operativos SAR (existentes)
    // ========================================

    /// <summary>.0100 - Nómina/Aportaciones</summary>
    Nomina0100 = 100,

    /// <summary>.0200 - Contable</summary>
    Contable0200 = 200,

    /// <summary>.0400 - Regularización</summary>
    Regularizacion0400 = 400,

    /// <summary>.0500 - Retiros</summary>
    Retiros0500 = 500,

    /// <summary>.0600 - Traspasos</summary>
    Traspasos0600 = 600,

    /// <summary>.0700 - Aportaciones Voluntarias</summary>
    AportacionesVoluntarias0700 = 700,

    // ========================================
    // Archivos de Paquetes
    // ========================================

    /// <summary>ZIP - Paquete comprimido conteniendo múltiples archivos</summary>
    PaqueteZip = 9000,

    /// <summary>GPG - Archivo cifrado</summary>
    ArchivoCifradoGpg = 9001
}

/// <summary>
/// Subcategorías de archivos según prefijo de nombre (PS, SB, etc.)
/// </summary>
public enum ConsarFileCategory
{
    /// <summary>Categoría desconocida</summary>
    Unknown = 0,

    /// <summary>PS - Pensiones (SIEFORE Principal)</summary>
    Pensiones = 1,

    /// <summary>SB - Subcuenta Básica</summary>
    SubcuentaBasica = 2,

    /// <summary>SA - Subcuenta de Ahorro</summary>
    SubcuentaAhorro = 3,

    /// <summary>SV - Subcuenta de Vivienda</summary>
    SubcuentaVivienda = 4
}

/// <summary>
/// Tipos de registro en archivos .0300 (Cartera SIEFORE)
/// AUDITADO: Basado en análisis de archivos reales
/// </summary>
public enum Cartera0300RecordType
{
    /// <summary>Header del archivo</summary>
    Header = 0,

    /// <summary>301M - Instrumentos Gubernamentales (CETES, BONOS, UDIBONOS)</summary>
    Gobierno301 = 301,

    /// <summary>302x - Otros instrumentos (efectivo, BMRPREV, derivados ref)</summary>
    Otros302 = 302,

    /// <summary>303x - Renta Variable Nacional (acciones BMV)</summary>
    RentaVariable303 = 303,

    /// <summary>304x - Instrumentos Estructurados (CKDs, FIBRAs)</summary>
    Estructurados304 = 304,

    /// <summary>307x - ETFs Internacionales</summary>
    EtfInternacional307 = 307,

    /// <summary>308x - Renta Variable Internacional (ADRs)</summary>
    RvInternacional308 = 308,

    /// <summary>309x - Totales/Resumen</summary>
    Totales309 = 309,

    /// <summary>Tipo no reconocido</summary>
    Unknown = 999
}

/// <summary>
/// Tipos de registro en archivos .0314 (Derivados)
/// AUDITADO: Basado en análisis de archivos reales
/// </summary>
public enum Derivados0314RecordType
{
    /// <summary>Header del archivo</summary>
    Header = 0,

    /// <summary>3010 - Forwards (FX, Índices)</summary>
    Forward3010 = 3010,

    /// <summary>3020 - Futuros</summary>
    Futuro3020 = 3020,

    /// <summary>3030 - Swaps (IRS, CCS)</summary>
    Swap3030 = 3030,

    /// <summary>3040 - Opciones</summary>
    Opcion3040 = 3040,

    /// <summary>3050 - Colateral/Márgenes</summary>
    Colateral3050 = 3050,

    /// <summary>3061 - Totales Derivados</summary>
    Totales3061 = 3061,

    /// <summary>3062 - Control Adicional</summary>
    ControlAdicional3062 = 3062,

    /// <summary>3081 - Tipo adicional observado</summary>
    Adicional3081 = 3081,

    /// <summary>3110 - Tipo adicional observado (16 registros en muestra)</summary>
    Adicional3110 = 3110,

    /// <summary>Tipo no reconocido</summary>
    Unknown = 9999
}
