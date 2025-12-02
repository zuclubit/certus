namespace Certus.Domain.Enums;

/// <summary>
/// Tipos de archivos CONSAR soportados
/// Basado en CONSAR Circular 19-8 (2025)
/// </summary>
public enum FileType
{
    /// <summary>Archivo de nómina</summary>
    Nomina = 0,

    /// <summary>Archivo contable</summary>
    Contable = 1,

    /// <summary>Archivo de regularización</summary>
    Regularizacion = 2,

    /// <summary>Archivo de retiros</summary>
    Retiros = 3,

    /// <summary>Archivo de traspasos</summary>
    Traspasos = 4,

    /// <summary>Archivo de aportaciones</summary>
    Aportaciones = 5,

    // ========== SIEFORE Investment Portfolio Files (Circular 19-8) ==========

    /// <summary>
    /// Archivo .0300 - Cartera de Inversión SIEFORE
    /// Contiene posiciones en instrumentos: gobierno, deuda privada, renta variable, ETFs
    /// Record types: 301 (Gobierno), 302 (Otros), 303 (Acciones), 307 (ETFs Intl)
    /// </summary>
    CarteraSiefore = 300,

    /// <summary>
    /// Archivo .0314 - Derivados SIEFORE
    /// Contiene posiciones en derivados: Forwards, Futuros, Swaps, Opciones
    /// Record types: 3010 (Forwards), 3020 (Futuros), 3030 (Swaps), 3040 (Opciones)
    /// </summary>
    Derivados = 314,

    /// <summary>
    /// Archivo .0301 - Detalle de Operaciones de Cartera
    /// </summary>
    OperacionesCartera = 301,

    /// <summary>
    /// Archivo .0302 - Valuación de Cartera
    /// </summary>
    ValuacionCartera = 302,

    /// <summary>
    /// Archivo .0303 - Composición de Cartera por Emisora
    /// </summary>
    ComposicionCartera = 303,

    /// <summary>
    /// Archivo .0304 - Operaciones en Mercado de Dinero
    /// </summary>
    MercadoDinero = 304,

    /// <summary>
    /// Archivo .0305 - Operaciones de Reporto
    /// </summary>
    Reportos = 305,

    /// <summary>
    /// Archivo .0306 - Préstamo de Valores
    /// </summary>
    PrestamoValores = 306,

    /// <summary>
    /// Archivo .0310 - Operaciones con Divisas
    /// </summary>
    OperacionesDivisas = 310,

    /// <summary>
    /// Archivo .0315 - Colateral de Derivados
    /// </summary>
    ColateralDerivados = 315,

    /// <summary>
    /// Archivo .0320 - Valor en Riesgo (VaR)
    /// </summary>
    ValorEnRiesgo = 320,

    /// <summary>
    /// Archivo .0400 - Estados Financieros SIEFORE
    /// </summary>
    EstadosFinancieros = 400,

    /// <summary>
    /// Archivo .0500 - Información de Afiliados
    /// </summary>
    InfoAfiliados = 500,

    /// <summary>Otro tipo de archivo</summary>
    Otro = 99
}
