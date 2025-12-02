namespace Certus.Infrastructure.Services.ReferenceData;

/// <summary>
/// Catálogo completo de series BANXICO SIE
/// Actualizado 2025 incluyendo TIIE de Fondeo obligatorio
/// </summary>
public static class BanxicoSeriesCatalog
{
    #region Tipo de Cambio

    /// <summary>Tipo de cambio pesos por dólar E.U.A. (FIX)</summary>
    public const string TipoCambioFix = "SF43718";

    /// <summary>Tipo de cambio pesos por dólar E.U.A. (fecha liquidación)</summary>
    public const string TipoCambioLiquidacion = "SF60653";

    /// <summary>Euro</summary>
    public const string Euro = "SF46410";

    /// <summary>Yen japonés</summary>
    public const string Yen = "SF46406";

    /// <summary>Libra esterlina</summary>
    public const string LibraEsterlina = "SF46407";

    /// <summary>Dólar canadiense</summary>
    public const string DolarCanadiense = "SF60632";

    /// <summary>Franco suizo</summary>
    public const string FrancoSuizo = "SF60633";

    #endregion

    #region TIIE - Tasas de Interés Interbancarias

    /// <summary>TIIE a 28 días (deprecated para nuevos contratos desde 2025)</summary>
    public const string TIIE28Dias = "SF60648";

    /// <summary>TIIE a 91 días</summary>
    public const string TIIE91Dias = "SF60649";

    /// <summary>TIIE a 182 días</summary>
    public const string TIIE182Dias = "SF60650";

    /// <summary>
    /// TIIE de Fondeo a 1 día
    /// IMPORTANTE: Obligatorio para nuevos contratos desde 1 de enero de 2025
    /// </summary>
    public const string TIIEFondeo1D = "SF61745";

    #endregion

    #region CETES - Certificados de la Tesorería

    /// <summary>CETES a 28 días</summary>
    public const string Cetes28Dias = "SF60633";

    /// <summary>CETES a 91 días</summary>
    public const string Cetes91Dias = "SF60634";

    /// <summary>CETES a 182 días</summary>
    public const string Cetes182Dias = "SF60635";

    /// <summary>CETES a 364 días</summary>
    public const string Cetes364Dias = "SF60636";

    #endregion

    #region Bonos y Valores Gubernamentales

    /// <summary>Bondes D a 3 años</summary>
    public const string BondesD3A = "SF43936";

    /// <summary>Bondes D a 5 años</summary>
    public const string BondesD5A = "SF43937";

    /// <summary>Bonos M a 10 años</summary>
    public const string BonosM10A = "SF43938";

    /// <summary>Bonos M a 20 años</summary>
    public const string BonosM20A = "SF43939";

    /// <summary>Bonos M a 30 años</summary>
    public const string BonosM30A = "SF43940";

    /// <summary>UDIBONOS a 3 años</summary>
    public const string Udibonos3A = "SF60647";

    /// <summary>UDIBONOS a 10 años</summary>
    public const string Udibonos10A = "SF60646";

    /// <summary>UDIBONOS a 30 años</summary>
    public const string Udibonos30A = "SF60645";

    #endregion

    #region UDI y INPC

    /// <summary>Valor de la Unidad de Inversión (UDI)</summary>
    public const string UDI = "SP68257";

    /// <summary>INPC General</summary>
    public const string INPCGeneral = "SP1";

    /// <summary>INPC Subyacente</summary>
    public const string INPCSubyacente = "SP56335";

    #endregion

    #region Reservas y Agregados Monetarios

    /// <summary>Reservas Internacionales</summary>
    public const string ReservasInternacionales = "SF43707";

    /// <summary>Base monetaria</summary>
    public const string BaseMonetaria = "SF43708";

    /// <summary>M1 (Agregado monetario)</summary>
    public const string M1 = "SF43709";

    /// <summary>M2 (Agregado monetario)</summary>
    public const string M2 = "SF43710";

    #endregion

    #region Tasas de Referencia

    /// <summary>Tasa objetivo de Banxico</summary>
    public const string TasaObjetivo = "SF61745";

    /// <summary>CPP (Costo Porcentual Promedio)</summary>
    public const string CPP = "SF60656";

    /// <summary>CCP (Costo de Captación a Plazo)</summary>
    public const string CCP = "SF60657";

    #endregion

    /// <summary>
    /// Obtiene la descripción de una serie
    /// </summary>
    public static string GetSeriesDescription(string seriesId) => seriesId switch
    {
        TipoCambioFix => "Tipo de cambio pesos por dólar E.U.A. (FIX)",
        TipoCambioLiquidacion => "Tipo de cambio pesos por dólar E.U.A. (Liquidación)",
        Euro => "Euro",
        Yen => "Yen japonés",
        LibraEsterlina => "Libra esterlina",
        DolarCanadiense => "Dólar canadiense",
        TIIE28Dias => "TIIE a 28 días",
        TIIE91Dias => "TIIE a 91 días",
        TIIE182Dias => "TIIE a 182 días",
        TIIEFondeo1D => "TIIE de Fondeo a 1 día",
        Cetes28Dias => "CETES a 28 días",
        Cetes91Dias => "CETES a 91 días",
        Cetes182Dias => "CETES a 182 días",
        Cetes364Dias => "CETES a 364 días",
        UDI => "Valor de la UDI",
        ReservasInternacionales => "Reservas Internacionales",
        _ => $"Serie {seriesId}"
    };

    /// <summary>
    /// Series recomendadas para validaciones CONSAR/SIEFORE
    /// </summary>
    public static readonly string[] ConsarRecommendedSeries = new[]
    {
        TipoCambioFix,
        TIIEFondeo1D,    // Obligatorio 2025
        TIIE28Dias,
        Cetes28Dias,
        Cetes91Dias,
        UDI,
        ReservasInternacionales
    };

    /// <summary>
    /// Series de tipo de cambio para monedas principales
    /// </summary>
    public static readonly Dictionary<string, string> CurrencySeriesMap = new()
    {
        ["USD"] = TipoCambioFix,
        ["EUR"] = Euro,
        ["JPY"] = Yen,
        ["GBP"] = LibraEsterlina,
        ["CAD"] = DolarCanadiense
    };
}
