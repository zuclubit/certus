namespace Certus.Domain.Enums;

/// <summary>
/// Tipo de fuente para scraping de cambios normativos CONSAR y fuentes regulatorias mexicanas
/// </summary>
public enum ScraperSourceType
{
    /// <summary>
    /// Diario Oficial de la Federación - Principal fuente de circulares
    /// </summary>
    DOF = 1,

    /// <summary>
    /// Sistema de Información del DOF (SIDOF) - SEGOB
    /// </summary>
    SIDOF = 2,

    /// <summary>
    /// Portal GOB.MX CONSAR - Documentos oficiales
    /// </summary>
    GobMxConsar = 3,

    /// <summary>
    /// SINOR CONSAR - Sistema de Normatividad CONSAR
    /// </summary>
    SinorConsar = 4,

    /// <summary>
    /// RSS Feed personalizado
    /// </summary>
    RssFeed = 5,

    // ========================================
    // Fuentes Regulatorias Adicionales
    // ========================================

    /// <summary>
    /// CNBV - Comisión Nacional Bancaria y de Valores
    /// Criterios contables, reportes regulatorios R04/R08/R13
    /// </summary>
    CNBV = 10,

    /// <summary>
    /// SHCP - Secretaría de Hacienda y Crédito Público
    /// Normativa financiera, lineamientos
    /// </summary>
    SHCP = 11,

    /// <summary>
    /// BANXICO - Banco de México
    /// Calendarios, catálogo de instituciones financieras, CLABE
    /// </summary>
    BANXICO = 12,

    /// <summary>
    /// SAT - Servicio de Administración Tributaria
    /// Lista 69B, catálogo RFC, contribuyentes no válidos
    /// </summary>
    SAT = 13,

    /// <summary>
    /// RENAPO - Registro Nacional de Población
    /// Reglas de validación CURP
    /// </summary>
    RENAPO = 14,

    /// <summary>
    /// IMSS - Instituto Mexicano del Seguro Social
    /// Reglas NSS, validación de números de seguridad social
    /// </summary>
    IMSS = 15,

    /// <summary>
    /// INFONAVIT - Instituto del Fondo Nacional de la Vivienda
    /// Aportaciones, reglas operativas
    /// </summary>
    INFONAVIT = 16,

    /// <summary>
    /// INEGI - Instituto Nacional de Estadística y Geografía
    /// Catálogos geográficos, entidades, municipios
    /// </summary>
    INEGI = 17,

    /// <summary>
    /// SEPOMEX - Servicio Postal Mexicano
    /// Catálogo de códigos postales
    /// </summary>
    SEPOMEX = 18,

    /// <summary>
    /// SPEI - Sistema de Pagos Electrónicos Interbancarios
    /// Catálogo CLABE bancos, validación de cuentas
    /// </summary>
    SPEI = 19,

    // ========================================
    // Listas PLD (Prevención de Lavado de Dinero)
    // ========================================

    /// <summary>
    /// OFAC - Office of Foreign Assets Control (USA)
    /// Lista de sanciones internacionales SDN
    /// </summary>
    OFAC = 20,

    /// <summary>
    /// UIF - Unidad de Inteligencia Financiera
    /// Personas bloqueadas PLD nacional
    /// </summary>
    UIF = 21,

    /// <summary>
    /// ONU - Naciones Unidas
    /// Lista de sanciones del Consejo de Seguridad
    /// </summary>
    ONU = 22,

    // ========================================
    // Fuentes Técnicas y Operativas CONSAR
    // ========================================

    /// <summary>
    /// Portal CONSAR - Comunicados, Plantillas SAR, Esquemas XSD
    /// Formatos técnicos y documentación operativa
    /// </summary>
    ConsarPortal = 23,

    /// <summary>
    /// CONSAR SISET - Sistema de Estadísticas CONSAR
    /// IRN (Indicador de Rendimiento Neto), comisiones, recursos administrados
    /// Estadísticas del Sistema de Ahorro para el Retiro
    /// </summary>
    ConsarSISET = 54,

    // ========================================
    // Fuentes Operativas y del Mercado SAR
    // ========================================

    /// <summary>
    /// PROCESAR - Empresa Operadora de la Base de Datos Nacional SAR
    /// Layouts técnicos, especificaciones de archivos, documentación operativa
    /// </summary>
    PROCESAR = 24,

    /// <summary>
    /// AMAFORE - Asociación Mexicana de Administradoras de Fondos para el Retiro
    /// Estadísticas, informes del mercado, documentación sectorial
    /// </summary>
    AMAFORE = 25,

    /// <summary>
    /// CONDUSEF - Comisión Nacional para la Protección y Defensa de los Usuarios de Servicios Financieros
    /// Normatividad de protección al usuario, quejas, comparativos
    /// </summary>
    CONDUSEF = 26,

    /// <summary>
    /// Índices Financieros - BANXICO/INEGI
    /// UDI, INPC, TIIE, tipos de cambio, indicadores económicos
    /// </summary>
    IndicesFinancieros = 27,

    /// <summary>
    /// SAR Layouts Técnicos - Especificaciones de archivos CONSAR
    /// Layouts de movimientos, traspasos, retiros, aportaciones
    /// </summary>
    SarLayouts = 28,

    // ========================================
    // Fuentes de Mercado e Inversiones SAR
    // ========================================

    /// <summary>
    /// BMV - Bolsa Mexicana de Valores
    /// Precios SIEFOREs, fondos de inversión, datos de mercado
    /// </summary>
    BMV = 29,

    /// <summary>
    /// CNSF - Comisión Nacional de Seguros y Fianzas
    /// Rentas vitalicias, seguros de pensiones, tarifas actuariales
    /// </summary>
    CNSF = 30,

    /// <summary>
    /// PENSIONISSSTE - Fondo de Pensiones del ISSSTE
    /// Sistema de pensiones del sector público federal
    /// </summary>
    PENSIONISSSTE = 31,

    /// <summary>
    /// IPAB - Instituto para la Protección al Ahorro Bancario
    /// Límites de cobertura, instituciones cubiertas, seguro de depósitos
    /// </summary>
    IPAB = 32,

    /// <summary>
    /// Precios de SIEFOREs - CONSAR
    /// Precios diarios de valuación, rendimientos, plusvalía
    /// </summary>
    SIEFOREPrecios = 33,

    // ========================================
    // Fuentes Laborales e Infraestructura Financiera
    // ========================================

    /// <summary>
    /// STPS - Secretaría del Trabajo y Previsión Social
    /// Normatividad laboral, salarios mínimos, reformas que afectan aportaciones SAR
    /// </summary>
    STPS = 34,

    /// <summary>
    /// FOVISSSTE - Fondo de la Vivienda del ISSSTE
    /// Subcuenta de vivienda para trabajadores del Estado (5% SBC)
    /// </summary>
    FOVISSSTE = 35,

    /// <summary>
    /// INDEVAL - S.D. Indeval
    /// Depósito central de valores, custodia de títulos de SIEFOREs
    /// </summary>
    INDEVAL = 36,

    /// <summary>
    /// MEXDER - Mercado Mexicano de Derivados
    /// Futuros, opciones y derivados para cobertura de portafolios SIEFORE
    /// </summary>
    MEXDER = 37,

    /// <summary>
    /// Tablas Actuariales - CNSF/CONSAR
    /// Mortalidad, invalidez, sobrevivencia para cálculo de pensiones
    /// </summary>
    TablasActuariales = 38,

    // ========================================
    // Fuentes Regulatorias Complementarias
    // ========================================

    /// <summary>
    /// COFECE - Comisión Federal de Competencia Económica
    /// Concentraciones, fusiones de AFOREs, competencia en mercado
    /// </summary>
    COFECE = 39,

    /// <summary>
    /// PRODECON - Procuraduría de la Defensa del Contribuyente
    /// Criterios fiscales, ISR pensiones, defensa del contribuyente
    /// </summary>
    PRODECON = 40,

    /// <summary>
    /// INAI - Instituto Nacional de Transparencia y Protección de Datos
    /// Protección datos personales, LFPDPPP, derechos ARCO
    /// </summary>
    INAI = 41,

    /// <summary>
    /// PROFECO - Procuraduría Federal del Consumidor
    /// Protección consumidor, contratos adhesión, publicidad
    /// </summary>
    PROFECO = 42,

    /// <summary>
    /// Ley SAR - Marco Legal del Sistema de Ahorro para el Retiro
    /// Ley SAR, LSS, LISSSTE, Reglamentos, Circulares, Reformas
    /// </summary>
    LeySAR = 43,

    // ========================================
    // Fuentes Complementarias SAR
    // ========================================

    /// <summary>
    /// CONASAMI - Comisión Nacional de los Salarios Mínimos
    /// Salarios mínimos, UMA, topes SBC para aportaciones SAR
    /// </summary>
    CONASAMI = 44,

    /// <summary>
    /// ASF - Auditoría Superior de la Federación
    /// Auditorías a CONSAR, IMSS, sistema de pensiones federal
    /// </summary>
    ASF = 45,

    /// <summary>
    /// CETES - Valores Gubernamentales
    /// Tasas CETES, BONDES, UDIBONOS para inversión de SIEFOREs
    /// </summary>
    CETES = 46,

    /// <summary>
    /// VALMER - Valuación Operativa y Referencias de Mercado
    /// Precios de valuación, vectores, curvas para portafolios SIEFORE
    /// </summary>
    VALMER = 47,

    /// <summary>
    /// SHF - Sociedad Hipotecaria Federal
    /// Cofinanciamiento, garantías hipotecarias con subcuenta vivienda
    /// </summary>
    SHF = 48,

    // ========================================
    // Fuentes Operativas y Servicios SAR
    // ========================================

    /// <summary>
    /// SUA - Sistema Único de Autodeterminación
    /// Cálculo de aportaciones patronales IMSS/INFONAVIT/SAR
    /// </summary>
    SUA = 49,

    /// <summary>
    /// IDSE - IMSS Desde Su Empresa
    /// Trámites patronales digitales, movimientos afiliatorios
    /// </summary>
    IDSE = 50,

    /// <summary>
    /// Expediente Electrónico AFORE
    /// Expediente único del trabajador en el SAR
    /// </summary>
    ExpedienteAfore = 51,

    /// <summary>
    /// LISIT - Lista de Instituciones del Sistema Financiero
    /// Catálogos de instituciones financieras autorizadas
    /// </summary>
    LISIT = 52,

    /// <summary>
    /// Pensión del Bienestar - Programa de pensión universal
    /// Pensión para adultos mayores, compatibilidad con SAR
    /// </summary>
    PensionBienestar = 53,

    /// <summary>
    /// Fuente personalizada con configuración específica
    /// </summary>
    Custom = 99
}

/// <summary>
/// Estado de ejecución del scraper
/// </summary>
public enum ScraperExecutionStatus
{
    /// <summary>
    /// Programado para ejecución
    /// </summary>
    Scheduled = 0,

    /// <summary>
    /// En ejecución
    /// </summary>
    Running = 1,

    /// <summary>
    /// Completado exitosamente
    /// </summary>
    Completed = 2,

    /// <summary>
    /// Completado con advertencias
    /// </summary>
    CompletedWithWarnings = 3,

    /// <summary>
    /// Falló durante la ejecución
    /// </summary>
    Failed = 4,

    /// <summary>
    /// Cancelado por el usuario
    /// </summary>
    Cancelled = 5,

    /// <summary>
    /// Tiempo de espera agotado
    /// </summary>
    TimedOut = 6
}

/// <summary>
/// Estado del documento extraído
/// </summary>
public enum ScrapedDocumentStatus
{
    /// <summary>
    /// Nuevo documento pendiente de revisión
    /// </summary>
    New = 0,

    /// <summary>
    /// Procesado y convertido a NormativeChange
    /// </summary>
    Processed = 1,

    /// <summary>
    /// Ignorado (duplicado o no relevante)
    /// </summary>
    Ignored = 2,

    /// <summary>
    /// Requiere revisión manual
    /// </summary>
    NeedsReview = 3,

    /// <summary>
    /// Error durante el procesamiento
    /// </summary>
    Error = 4
}

/// <summary>
/// Frecuencia de ejecución del scraper
/// </summary>
public enum ScraperFrequency
{
    /// <summary>
    /// Cada hora
    /// </summary>
    Hourly = 1,

    /// <summary>
    /// Cada 6 horas
    /// </summary>
    Every6Hours = 2,

    /// <summary>
    /// Cada 12 horas
    /// </summary>
    Every12Hours = 3,

    /// <summary>
    /// Diariamente
    /// </summary>
    Daily = 4,

    /// <summary>
    /// Semanalmente
    /// </summary>
    Weekly = 5,

    /// <summary>
    /// Solo ejecución manual
    /// </summary>
    Manual = 99
}
