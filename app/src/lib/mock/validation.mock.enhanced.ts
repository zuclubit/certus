/**
 * Enhanced Mock Data Generator for CONSAR Validations
 *
 * Generates realistic mock data compliant with CONSAR regulations
 * Based on official CONSAR circulars and regulatory requirements
 *
 * @version 2.0.0
 * @compliance CONSAR Circular 19-8, 19-1, 28-2025
 * @security Implements data sanitization and validation
 */

import type {
  Validation,
  ValidationDetail,
  ValidationError,
  ValidatorResult,
  TimelineEvent,
  AuditLogEntry,
} from '@/types'
import type { FileType, ValidationStatus, ErrorSeverity } from '@/lib/constants'

// ============================================================================
// SECURITY & SANITIZATION
// ============================================================================

/**
 * Sanitize string to prevent XSS attacks
 */
const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 500) // Limit length
}

/**
 * Generate cryptographically secure random ID
 */
const secureRandomId = (): string => {
  const timestamp = Date.now()
  const randomPart = crypto.getRandomValues(new Uint8Array(16))
  const randomHex = Array.from(randomPart, b => b.toString(16).padStart(2, '0')).join('')
  return `${timestamp}-${randomHex.substring(0, 16)}`
}

// ============================================================================
// HELPER FUNCTIONS (Immutable & Pure)
// ============================================================================

const randomDate = (daysAgo: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date.toISOString()
}

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

const randomChoice = <T>(array: readonly T[]): T =>
  array[Math.floor(Math.random() * array.length)]

const randomDecimal = (min: number, max: number, decimals: number = 2): number => {
  const value = Math.random() * (max - min) + min
  return Number(value.toFixed(decimals))
}

// ============================================================================
// CONSAR-COMPLIANT FILE NAMES (Formato Oficial)
// ============================================================================

/**
 * Generate realistic CONSAR-compliant file names
 * Format: YYYYMMDD_TYPE_ACCOUNT_FOLIO.ext
 */
const generateCONSARFileName = (fileType: FileType): string => {
  const date = new Date()
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '')

  const accountCodes = {
    CONTABLE: ['1101', '1103', '7115', '5401', '2301'],
    NOMINA: ['NOMINA', 'APORT', 'RETIRO'],
    REGULARIZACION: ['AJUSTE', 'CONCI', 'CORREC']
  }

  const accounts = accountCodes[fileType]
  const account = randomChoice(accounts)
  const folio = String(randomInt(1000, 9999)).padStart(6, '0')
  const extensions = ['.txt', '.csv', '.dat']
  const ext = randomChoice(extensions)

  return `${yyyymmdd}_SB_${account}_${folio}${ext}`
}

const REALISTIC_FILE_NAMES: readonly string[] = [
  // Archivos CONTABLE (Balanzas y Estados)
  '20250804_SB_1101_001980.txt',  // Balanza de comprobación principal
  '20250804_SB_1103_001981.txt',  // Movimientos de divisas
  '20250804_SB_7115_001982.txt',  // Conversión de divisas a pesos MXN
  '20250115_SB_5401_001983.txt',  // Inversiones en valores
  '20250120_SB_2301_001984.txt',  // Pasivos y obligaciones

  // Archivos NOMINA
  '20250115_NOMINA_Q1_AFORE_XXI.txt',
  '20250130_APORT_PATRONALES_ENE2025.txt',
  '20250210_RETIRO_PARCIAL_Q1_2025.txt',

  // Archivos REGULARIZACION
  '20250125_AJUSTE_REGULARIZACION_Q4_2024.txt',
  '20250210_CONCI_BANCARIA_ENE2025.txt',
  '20250220_CORREC_SALDOS_INICIAL.txt',
] as const

// ============================================================================
// USER NAMES (Sanitized)
// ============================================================================

const USER_NAMES: readonly string[] = [
  'Juan Pérez González',
  'María García Rodríguez',
  'Carlos López Martínez',
  'Ana Martínez Hernández',
  'Roberto Sánchez Torres',
  'Laura Ramírez Cruz',
  'Miguel Ángel Flores',
  'Diana Morales Jiménez',
] as const

// ============================================================================
// VALIDATOR DEFINITIONS (37 Total - CONSAR Compliant)
// ============================================================================

const VALIDATOR_DEFINITIONS = [
  // GRUPO 1: Estructura (V001-V005) - Validaciones de formato
  {
    code: 'V001',
    name: 'Validación de Longitud de Registro',
    group: 'Estructura',
    description: 'Verifica que cada registro tenga exactamente 77 caracteres (formato posicional CONSAR)',
    reference: 'CONSAR Circular 19-8 Sección 3.1.2'
  },
  {
    code: 'V002',
    name: 'Validación de Longitud de Encabezado',
    group: 'Estructura',
    description: 'Verifica estructura del encabezado del archivo',
    reference: 'CONSAR Circular 19-8 Anexo A'
  },
  {
    code: 'V003',
    name: 'Validación de Tipo de Dato',
    group: 'Estructura',
    description: 'Verifica que campos numéricos sean numéricos, alfanuméricos válidos, etc.',
    reference: 'CONSAR Circular 19-8 Sección 3.2'
  },
  {
    code: 'V004',
    name: 'Validación de Formato de Fecha',
    group: 'Estructura',
    description: 'Verifica formato AAAAMMDD (8 caracteres numéricos)',
    reference: 'CONSAR Circular 19-8 Sección 3.3'
  },
  {
    code: 'V005',
    name: 'Validación de Caracteres Especiales',
    group: 'Estructura',
    description: 'Detecta caracteres no permitidos en archivos CONSAR',
    reference: 'CONSAR Circular 19-8 Sección 3.4'
  },

  // GRUPO 2: Catálogos (V006-V010) - Validaciones contra catálogos CONSAR
  {
    code: 'V006',
    name: 'Validación de Catálogo de Cuentas CONSAR',
    group: 'Catálogos',
    description: 'Verifica que cuentas existan en catálogo vigente CONSAR',
    reference: 'Disposiciones Contables AFORE 2022 Anexo B'
  },
  {
    code: 'V007',
    name: 'Validación de Catálogo de Subcuentas',
    group: 'Catálogos',
    description: 'Verifica que subcuentas sean válidas para cada cuenta',
    reference: 'Disposiciones Contables AFORE 2022 Anexo B.1'
  },
  {
    code: 'V008',
    name: 'Validación de Catálogo de Entidades Financieras',
    group: 'Catálogos',
    description: 'Verifica que entidades estén autorizadas y activas',
    reference: 'CONSAR Circular 19-1 Artículo 12'
  },
  {
    code: 'V009',
    name: 'Validación de Catálogo de Divisas',
    group: 'Catálogos',
    description: 'Verifica divisas permitidas: MXN, USD, EUR, GBP, JPY',
    reference: 'CONSAR Circular 28-2025 Artículo 1'
  },
  {
    code: 'V010',
    name: 'Validación de Catálogo de Tipos de Registro',
    group: 'Catálogos',
    description: 'Verifica códigos de tipo de registro válidos',
    reference: 'CONSAR Circular 19-8 Anexo C'
  },

  // GRUPO 3: Rangos (V011-V015) - Validaciones de rangos permitidos
  {
    code: 'V011',
    name: 'Validación de Rango de Saldos',
    group: 'Rangos',
    description: 'Verifica que saldos estén dentro de rangos lógicos',
    reference: 'Disposiciones Prudenciales Artículo 23'
  },
  {
    code: 'V012',
    name: 'Validación de Rango de Cargos',
    group: 'Rangos',
    description: 'Verifica que cargos no excedan límites operativos',
    reference: 'Disposiciones Prudenciales Artículo 24'
  },
  {
    code: 'V013',
    name: 'Validación de Rango de Abonos',
    group: 'Rangos',
    description: 'Verifica que abonos no excedan límites operativos',
    reference: 'Disposiciones Prudenciales Artículo 25'
  },
  {
    code: 'V014',
    name: 'Validación de Rango de Fechas',
    group: 'Rangos',
    description: 'Verifica que fechas sean válidas y no futuras',
    reference: 'CONSAR Circular 19-8 Sección 4.1'
  },
  {
    code: 'V015',
    name: 'Validación de Rango de Tipos de Cambio',
    group: 'Rangos',
    description: 'Verifica tipos de cambio dentro de bandas razonables (±15% del FIX)',
    reference: 'CONSAR Circular 28-2025 Artículo 2'
  },

  // GRUPO 4: Cálculos (V016-V020) - Validaciones aritméticas
  {
    code: 'V016',
    name: 'Validación de Suma de Cargos',
    group: 'Cálculos',
    description: 'Verifica suma total de cargos coincida con total declarado',
    reference: 'Disposiciones Contables AFORE 2022 Artículo 34'
  },
  {
    code: 'V017',
    name: 'Validación de Suma de Abonos',
    group: 'Cálculos',
    description: 'Verifica suma total de abonos coincida con total declarado',
    reference: 'Disposiciones Contables AFORE 2022 Artículo 35'
  },
  {
    code: 'V018',
    name: 'Validación de Balanza Cuadrada (Partida Doble)',
    group: 'Cálculos',
    description: 'Verifica: Saldo Inicial + Cargos - Abonos = Saldo Final',
    reference: 'Disposiciones Contables AFORE 2022 Artículo 36'
  },
  {
    code: 'V019',
    name: 'Validación de Saldo Inicial + Movimientos',
    group: 'Cálculos',
    description: 'Verifica consistencia de saldos entre períodos',
    reference: 'Disposiciones Contables AFORE 2022 Artículo 37'
  },
  {
    code: 'V020',
    name: 'Validación de Promedios Ponderados',
    group: 'Cálculos',
    description: 'Verifica cálculo de promedios ponderados de tasas',
    reference: 'CONSAR Circular 55-1 Artículo 18'
  },

  // GRUPO 5: Cruce (V021-V025) - Validaciones cruzadas
  {
    code: 'V021',
    name: 'Validación de Contracuentas 71 vs 72',
    group: 'Cruce',
    description: 'Verifica que cuenta 71xx = cuenta 72xx (signo opuesto)',
    reference: 'Disposiciones Contables AFORE 2022 Artículo 45'
  },
  {
    code: 'V022',
    name: 'Validación de Plus vs Minus',
    group: 'Cruce',
    description: 'Verifica compensación de posiciones plus y minus',
    reference: 'CONSAR Circular 55-1 Artículo 22'
  },
  {
    code: 'V023',
    name: 'Validación Cruzada con Nómina',
    group: 'Cruce',
    description: 'Verifica consistencia entre archivos contables y nómina',
    reference: 'CONSAR Circular 19-1 Artículo 15'
  },
  {
    code: 'V024',
    name: 'Validación Cruzada con Aportaciones',
    group: 'Cruce',
    description: 'Verifica aportaciones declaradas vs contabilizadas',
    reference: 'CONSAR Circular 19-1 Artículo 16'
  },
  {
    code: 'V025',
    name: 'Validación de Conciliación Bancaria',
    group: 'Cruce',
    description: 'Verifica conciliación de saldos bancarios',
    reference: 'Disposiciones Contables AFORE 2022 Artículo 52'
  },

  // GRUPO 6: Negocio (V026-V030) - Validaciones de reglas de negocio
  {
    code: 'V026',
    name: 'Validación de Comisiones Permitidas',
    group: 'Negocio',
    description: 'Verifica que comisiones no excedan topes CONSAR',
    reference: 'CONSAR Circular 15-19 Artículo 4'
  },
  {
    code: 'V027',
    name: 'Validación de Rendimientos Mínimos',
    group: 'Negocio',
    description: 'Verifica cumplimiento de rendimiento mínimo obligatorio',
    reference: 'LSAR Artículo 47'
  },
  {
    code: 'V028',
    name: 'Validación de Límites de Inversión',
    group: 'Negocio',
    description: 'Verifica límites por emisor, instrumento y régimen',
    reference: 'CONSAR Circular 55-1 Anexo 1'
  },
  {
    code: 'V029',
    name: 'Validación de Portabilidad de Recursos',
    group: 'Negocio',
    description: 'Verifica correcta contabilización de traspasos',
    reference: 'CONSAR Circular 19-1 Artículo 22'
  },
  {
    code: 'V030',
    name: 'Validación de Retiros Programados',
    group: 'Negocio',
    description: 'Verifica cálculo correcto de retiros programados',
    reference: 'LSAR Artículo 82'
  },

  // GRUPO 7: Regulatorio (V031-V037) - Validaciones de cumplimiento
  {
    code: 'V031',
    name: 'Conversión de Divisas a Pesos (Cuenta 7115)',
    group: 'Regulatorio',
    description: 'Verifica uso de tipo de cambio FIX Banxico con tolerancia ±0.05 MXN',
    reference: 'CONSAR Circular 28-2025 Artículo 3'
  },
  {
    code: 'V032',
    name: 'Validación de Cuentas CONSAR Vigentes',
    group: 'Regulatorio',
    description: 'Verifica uso de catálogo de cuentas vigente a la fecha',
    reference: 'Disposiciones Contables AFORE 2022 Artículo 8'
  },
  {
    code: 'V033',
    name: 'Validación de Firma Electrónica Avanzada',
    group: 'Regulatorio',
    description: 'Verifica integridad de firma digital del archivo',
    reference: 'CONSAR Circular 19-8 Anexo E'
  },
  {
    code: 'V034',
    name: 'Validación de Plazos Regulatorios',
    group: 'Regulatorio',
    description: 'Verifica cumplimiento de plazos de envío',
    reference: 'CONSAR Circular 19-1 Artículo 5'
  },
  {
    code: 'V035',
    name: 'Validación de Documentación Soporte',
    group: 'Regulatorio',
    description: 'Verifica existencia de documentación soporte obligatoria',
    reference: 'Disposiciones Contables AFORE 2022 Artículo 61'
  },
  {
    code: 'V036',
    name: 'Validación de Cumplimiento SOX (Sarbanes-Oxley)',
    group: 'Regulatorio',
    description: 'Verifica controles internos y segregación de funciones',
    reference: 'SOX Section 404 | CONSAR Best Practices'
  },
  {
    code: 'V037',
    name: 'Validación de Trazabilidad CONSAR',
    group: 'Regulatorio',
    description: 'Verifica trazabilidad completa de operaciones',
    reference: 'CONSAR Circular 19-8 Sección 7.2'
  },
] as const

// ============================================================================
// CONSAR-SPECIFIC ERROR TEMPLATES
// ============================================================================

interface ErrorTemplate {
  validatorCode: string
  message: string
  description: string
  suggestion: string
  field: string
  reference: string
  severity: ErrorSeverity
  category: 'estructura' | 'catalogo' | 'calculo' | 'cruce' | 'negocio' | 'regulatorio'
}

const CONSAR_ERROR_TEMPLATES: readonly ErrorTemplate[] = [
  // Errores de Estructura
  {
    validatorCode: 'V001',
    message: 'Longitud de registro incorrecta',
    description: 'El registro en la línea {line} tiene {value} caracteres cuando se esperaban exactamente 77 caracteres (formato posicional CONSAR)',
    suggestion: 'Verifique que el archivo tenga el formato posicional correcto de 77 caracteres por línea. No debe contener delimitadores adicionales.',
    field: 'RegistroCompleto',
    reference: 'CONSAR Circular 19-8 Sección 3.1.2',
    severity: 'critical',
    category: 'estructura'
  },
  {
    validatorCode: 'V004',
    message: 'Formato de fecha inválido',
    description: 'La fecha "{value}" en línea {line} no cumple formato AAAAMMDD. Debe ser 8 caracteres numéricos.',
    suggestion: 'Use formato AAAAMMDD. Ejemplo: 20250115 para 15 de enero de 2025.',
    field: 'FechaOperativa',
    reference: 'CONSAR Circular 19-8 Sección 3.3',
    severity: 'critical',
    category: 'estructura'
  },

  // Errores de Catálogos
  {
    validatorCode: 'V006',
    message: 'Cuenta no existe en catálogo CONSAR',
    description: 'La cuenta "{value}" utilizada en línea {line} no se encuentra en el catálogo vigente de cuentas CONSAR. Última actualización del catálogo: {catalogoFecha}',
    suggestion: 'Consulte el catálogo de cuentas CONSAR actualizado en www.consar.gob.mx o verifique si la cuenta fue dada de baja',
    field: 'ClaveCuenta',
    reference: 'Disposiciones Contables AFORE 2022 Anexo B',
    severity: 'critical',
    category: 'catalogo'
  },
  {
    validatorCode: 'V009',
    message: 'Divisa no permitida',
    description: 'La divisa "{value}" en línea {line} no está permitida. Divisas válidas: MXN, USD, EUR, GBP, JPY',
    suggestion: 'Utilice únicamente divisas autorizadas por CONSAR según Circular 28-2025',
    field: 'CodigoDivisa',
    reference: 'CONSAR Circular 28-2025 Artículo 1',
    severity: 'high',
    category: 'catalogo'
  },

  // Errores de Cálculos
  {
    validatorCode: 'V018',
    message: 'Balanza de comprobación no cuadra (Partida Doble)',
    description: 'Cuenta {cuenta} línea {line}: Saldo Inicial (${saldoInicial}) + Cargos (${cargos}) - Abonos (${abonos}) = ${calculado} pero Saldo Final declarado es ${saldoFinal}. Diferencia: ${diferencia}',
    suggestion: 'Recalcule: Saldo Final = Saldo Inicial + Cargos - Abonos. La diferencia debe ser exactamente $0.00',
    field: 'SaldoFinal',
    reference: 'Disposiciones Contables AFORE 2022 Artículo 36',
    severity: 'critical',
    category: 'calculo'
  },
  {
    validatorCode: 'V016',
    message: 'Suma de cargos no coincide',
    description: 'La suma de cargos ${value} no coincide con el total declarado ${expectedValue}. Diferencia: ${diferencia}',
    suggestion: 'Recalcule la suma total de todos los cargos del archivo',
    field: 'TotalCargos',
    reference: 'Disposiciones Contables AFORE 2022 Artículo 34',
    severity: 'critical',
    category: 'calculo'
  },

  // Errores de Cruce
  {
    validatorCode: 'V021',
    message: 'Contracuentas 71 vs 72 no coinciden',
    description: 'Cuenta 71{subcuenta}: ${suma71} debe ser igual a Cuenta 72{subcuenta}: ${suma72} (con signo opuesto). Diferencia encontrada: ${diferencia}',
    suggestion: 'Verifique movimientos en ambas contracuentas. Deben compensarse mutuamente según principio de partida doble',
    field: 'Contracuentas',
    reference: 'Disposiciones Contables AFORE 2022 Artículo 45',
    severity: 'high',
    category: 'cruce'
  },

  // Errores de Negocio
  {
    validatorCode: 'V028',
    message: 'Límite de inversión excedido',
    description: 'La inversión en emisor "{emisor}" alcanza {porcentaje}% del activo total, excediendo el límite permitido de {limite}%',
    suggestion: 'Reduzca la concentración en este emisor o verifique si aplica alguna excepción regulatoria',
    field: 'MontoInversion',
    reference: 'CONSAR Circular 55-1 Anexo 1',
    severity: 'high',
    category: 'negocio'
  },

  // Errores Regulatorios
  {
    validatorCode: 'V031',
    message: 'Tipo de cambio inválido para conversión de divisas (Cuenta 7115)',
    description: 'El tipo de cambio utilizado {value} para {divisa} difiere del tipo de cambio FIX oficial de Banxico {expectedValue} por {diferencia} MXN. Tolerancia máxima permitida: ±0.05 MXN',
    suggestion: 'Verifique el tipo de cambio FIX publicado por Banco de México para la fecha {fecha} en www.banxico.org.mx',
    field: 'TipoCambio',
    reference: 'CONSAR Circular 28-2025 Artículo 3',
    severity: 'critical',
    category: 'regulatorio'
  },
  {
    validatorCode: 'V033',
    message: 'Firma electrónica avanzada inválida o expirada',
    description: 'La firma digital del archivo no pudo ser verificada. Código de error: {errorCode}',
    suggestion: 'Regenere la firma electrónica avanzada utilizando el certificado vigente autorizado por CONSAR',
    field: 'FirmaDigital',
    reference: 'CONSAR Circular 19-8 Anexo E',
    severity: 'critical',
    category: 'regulatorio'
  },
  {
    validatorCode: 'V037',
    message: 'Trazabilidad CONSAR incompleta',
    description: 'Faltan campos obligatorios de trazabilidad: {camposFaltantes}. No es posible rastrear el origen de la operación.',
    suggestion: 'Complete todos los campos de trazabilidad: Usuario, Fecha/Hora, IP, Folio de autorización',
    field: 'Trazabilidad',
    reference: 'CONSAR Circular 19-8 Sección 7.2',
    severity: 'high',
    category: 'regulatorio'
  },
] as const

// ============================================================================
// MOCK DATA GENERATORS (Immutable & Type-Safe)
// ============================================================================

/**
 * Generate a single validation with CONSAR-compliant data
 */
export const generateValidation = (overrides?: Partial<Validation>): Validation => {
  const fileType = randomChoice<FileType>(['NOMINA', 'CONTABLE', 'REGULARIZACION'])
  const status = randomChoice<ValidationStatus>([
    'success',
    'error',
    'warning',
    'processing',
    'pending',
  ])

  const recordCount = randomInt(500, 50000)
  const errorCount = status === 'success' ? 0 : status === 'error' ? randomInt(5, 500) : 0
  const warningCount = status === 'warning' ? randomInt(1, 50) : status === 'error' ? randomInt(0, 30) : 0
  const validRecordCount = recordCount - errorCount

  return {
    id: secureRandomId(),
    fileName: overrides?.fileName || generateCONSARFileName(fileType),
    fileType,
    fileSize: randomInt(100000, 15000000), // 100KB to 15MB (realistic for CONSAR files)
    status,
    uploadedBy: sanitizeString(randomChoice(USER_NAMES)),
    uploadedAt: randomDate(30),
    processedAt: status !== 'pending' ? randomDate(30) : undefined,
    validatedAt: status === 'success' ? randomDate(30) : undefined,
    errorCount,
    warningCount,
    recordCount,
    validRecordCount,
    progress: status === 'processing' ? randomInt(15, 85) : undefined,

    // Versioning defaults (CONSAR compliance)
    version: 1,
    isOriginal: true,
    isSubstitute: false,
    consarDirectory: 'RECEPCION',

    ...overrides,
  }
}

/**
 * Generate multiple validations with guaranteed status distribution
 * Ensures we have examples of all states for testing
 */
export const generateValidations = (count: number): Validation[] => {
  const validations: Validation[] = []

  // First, create guaranteed examples of each status (for testing all scenarios)
  const guaranteedStatuses: Array<{ status: ValidationStatus; errorCount: number; warningCount: number }> = [
    { status: 'error', errorCount: 150, warningCount: 25 },      // High errors
    { status: 'error', errorCount: 50, warningCount: 10 },       // Medium errors
    { status: 'error', errorCount: 15, warningCount: 5 },        // Low errors
    { status: 'warning', errorCount: 0, warningCount: 75 },      // High warnings
    { status: 'warning', errorCount: 0, warningCount: 30 },      // Medium warnings
    { status: 'warning', errorCount: 0, warningCount: 8 },       // Low warnings
    { status: 'success', errorCount: 0, warningCount: 0 },       // Perfect file
    { status: 'success', errorCount: 0, warningCount: 0 },       // Another success
    { status: 'processing', errorCount: 0, warningCount: 0 },    // Currently processing
    { status: 'pending', errorCount: 0, warningCount: 0 },       // Waiting to start
  ]

  // Create guaranteed examples
  guaranteedStatuses.forEach(({ status, errorCount, warningCount }) => {
    const recordCount = randomInt(1000, 20000)
    const fileType = randomChoice<FileType>(['NOMINA', 'CONTABLE', 'REGULARIZACION'])

    validations.push(generateValidation({
      status,
      errorCount,
      warningCount,
      recordCount,
      validRecordCount: recordCount - errorCount,
      fileType,
      processedAt: status !== 'pending' ? randomDate(7) : undefined,
      validatedAt: status === 'success' ? randomDate(7) : undefined,
      progress: status === 'processing' ? randomInt(25, 75) : undefined,
      uploadedAt: randomDate(7), // Recent uploads
    }))
  })

  // Fill the rest with random validations
  const remaining = count - guaranteedStatuses.length
  for (let i = 0; i < remaining; i++) {
    validations.push(generateValidation())
  }

  return validations
}

/**
 * Generate CONSAR-compliant validation errors with realistic data
 */
export const generateValidationErrors = (count: number): ValidationError[] => {
  return Array.from({ length: count }, () => {
    const template = randomChoice(CONSAR_ERROR_TEMPLATES)
    const line = randomInt(1, 50000)
    const column = randomInt(1, 77) // CONSAR format is 77 characters

    // Generate realistic values based on error type
    let value = ''
    let expectedValue: string | undefined

    switch (template.category) {
      case 'estructura':
        value = template.validatorCode === 'V001' ? String(randomInt(50, 90)) : '20259915' // Invalid date
        expectedValue = template.validatorCode === 'V001' ? '77' : '20250115'
        break
      case 'catalogo':
        value = template.validatorCode === 'V006' ? `99${randomInt(10, 99)}` : randomChoice(['BTC', 'ETH', 'XYZ'])
        break
      case 'calculo':
        const saldoInicial = randomDecimal(100000, 5000000, 2)
        const cargos = randomDecimal(10000, 500000, 2)
        const abonos = randomDecimal(10000, 500000, 2)
        const calculado = saldoInicial + cargos - abonos
        const saldoFinal = calculado + randomDecimal(-1000, 1000, 2) // Add error
        value = saldoFinal.toFixed(2)
        expectedValue = calculado.toFixed(2)
        break
      case 'regulatorio':
        if (template.validatorCode === 'V031') {
          const tipoCambioFIX = 17.45
          const tipoCambioUtilizado = tipoCambioFIX + randomDecimal(0.06, 0.15, 2) // Exceeds tolerance
          value = tipoCambioUtilizado.toFixed(4)
          expectedValue = tipoCambioFIX.toFixed(4)
        }
        break
      default:
        value = String(randomInt(1000, 999999))
    }

    return {
      id: secureRandomId(),
      validatorCode: template.validatorCode,
      validatorName: VALIDATOR_DEFINITIONS.find(v => v.code === template.validatorCode)?.name || template.message,
      severity: template.severity,
      message: template.message,
      description: template.description
        .replace('{line}', line.toString())
        .replace('{value}', value)
        .replace('{expectedValue}', expectedValue || 'N/A')
        .replace('{cuenta}', `${randomInt(1000, 9999)}`)
        .replace('{saldoInicial}', String(randomDecimal(100000, 5000000, 2)))
        .replace('{cargos}', String(randomDecimal(10000, 500000, 2)))
        .replace('{abonos}', String(randomDecimal(10000, 500000, 2)))
        .replace('{saldoFinal}', value)
        .replace('{calculado}', expectedValue || '0')
        .replace('{diferencia}', String(randomDecimal(0.01, 1000, 2)))
        .replace('{divisa}', randomChoice(['USD', 'EUR', 'GBP']))
        .replace('{fecha}', '2025-01-15')
        .replace('{catalogoFecha}', '2024-12-31'),
      suggestion: template.suggestion
        .replace('{fecha}', '2025-01-15'),
      line,
      column,
      field: template.field,
      value,
      expectedValue,
      reference: template.reference,
    }
  })
}

/**
 * Generate validator results (all 37 validators)
 */
export const generateValidatorResults = (): ValidatorResult[] => {
  return VALIDATOR_DEFINITIONS.map((validator) => {
    // Higher probability of passing for most validators
    const statusWeights: ValidatorResult['status'][] = [
      'passed', 'passed', 'passed', 'passed', // 80% pass rate
      'failed',
      'warning'
    ]
    const status = randomChoice(statusWeights)

    return {
      code: validator.code,
      name: validator.name,
      group: validator.group,
      status,
      duration: randomInt(50, 3000), // 50ms to 3s (realistic processing time)
      errorCount: status === 'failed' ? randomInt(1, 100) : 0,
      warningCount: status === 'warning' ? randomInt(1, 25) : 0,
    }
  })
}

/**
 * Generate detailed timeline events with performance metrics
 */
export const generateTimelineEvents = (recordCount: number = 12543): TimelineEvent[] => {
  const events = [
    {
      type: 'upload',
      message: `Archivo recibido vía SFTP seguro: ${randomDecimal(1.5, 15.5, 2)} MB`,
    },
    {
      type: 'security_scan',
      message: 'Escaneo de seguridad completado: Sin amenazas detectadas',
    },
    {
      type: 'parsing',
      message: `Análisis de estructura iniciado: ${recordCount.toLocaleString()} registros detectados`,
    },
    {
      type: 'validation_structure',
      message: `V001-V005: Estructura validada (${recordCount.toLocaleString()}/${recordCount.toLocaleString()} registros OK)`,
    },
    {
      type: 'validation_catalogs',
      message: `V006-V010: Catálogos validados (${randomInt(100, 1000)} cuentas verificadas contra catálogo CONSAR vigente)`,
    },
    {
      type: 'validation_ranges',
      message: `V011-V015: Rangos validados (Tipos de cambio vs FIX Banxico ±0.05 MXN)`,
    },
    {
      type: 'validation_calculations',
      message: `V016-V020: Cálculos validados (Partida doble: ${randomInt(0, 100)} errores detectados)`,
    },
    {
      type: 'validation_cross',
      message: `V021-V025: Validaciones cruzadas (Contracuentas 71 vs 72, Plus vs Minus)`,
    },
    {
      type: 'validation_business',
      message: `V026-V030: Reglas de negocio (Límites de inversión, comisiones CONSAR)`,
    },
    {
      type: 'validation_regulatory',
      message: `V031-V037: Cumplimiento regulatorio (Firma digital, trazabilidad, SOX)`,
    },
    {
      type: 'validation_completed',
      message: `Proceso completado en ${randomDecimal(1.5, 5.8, 1)} segundos`,
    },
    {
      type: 'report_generated',
      message: 'Reporte de resultados generado en formatos PDF y Excel',
    },
  ]

  let baseTime = new Date()
  baseTime.setMinutes(baseTime.getMinutes() - 15)

  return events.map((event, index) => {
    const timestamp = new Date(baseTime.getTime() + index * 45000) // 45 seconds apart
    return {
      id: secureRandomId(),
      timestamp: timestamp.toISOString(),
      type: event.type,
      message: sanitizeString(event.message),
      user: index === 0 ? sanitizeString(randomChoice(USER_NAMES)) : 'Sistema Automático HERGON',
      metadata: {
        step: index + 1,
        totalSteps: events.length,
        performanceMs: randomInt(100, 5000)
      },
    }
  })
}

/**
 * Generate comprehensive audit log entries
 */
export const generateAuditLog = (): AuditLogEntry[] => {
  const actions = [
    {
      action: 'FILE_UPLOAD',
      resource: 'validation',
      details: 'Archivo subido vía interfaz web con cifrado TLS 1.3'
    },
    {
      action: 'SECURITY_SCAN',
      resource: 'security',
      details: 'Escaneo antivirus y anti-malware completado'
    },
    {
      action: 'VALIDATION_START',
      resource: 'rules_engine',
      details: 'Ejecución de 37 validadores CONSAR iniciada'
    },
    {
      action: 'CATALOG_VERIFICATION',
      resource: 'catalog_consar',
      details: 'Verificación contra catálogo CONSAR versión 2025-Q1'
    },
    {
      action: 'BANXICO_API_CALL',
      resource: 'external_api',
      details: 'Consulta de tipos de cambio FIX a API Banxico'
    },
    {
      action: 'VALIDATION_COMPLETE',
      resource: 'rules_engine',
      details: 'Validación completada: Generar reporte de resultados'
    },
    {
      action: 'REPORT_DOWNLOAD',
      resource: 'report',
      details: 'Reporte de errores descargado en formato Excel'
    },
    {
      action: 'FILE_ARCHIVE',
      resource: 'storage',
      details: 'Archivo archivado en Azure Blob Storage (cifrado AES-256)'
    },
  ]

  return actions.map((item, index) => ({
    id: secureRandomId(),
    timestamp: randomDate(7),
    user: sanitizeString(index === 0 ? randomChoice(USER_NAMES) : 'Sistema Automático'),
    action: item.action,
    resource: item.resource,
    details: sanitizeString(item.details),
    ipAddress: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
  }))
}

/**
 * Generate a complete validation detail with CONSAR compliance
 */
export const generateValidationDetail = (id?: string): ValidationDetail => {
  const validation = generateValidation({ id })
  const errorCount = validation.errorCount
  const warningCount = validation.warningCount
  const hasErrors = errorCount > 0
  const hasWarnings = warningCount > 0

  return {
    ...validation,
    errors: hasErrors ? generateValidationErrors(Math.min(errorCount, 100)) : [],
    warnings: hasWarnings
      ? generateValidationErrors(Math.min(warningCount, 30)).map(e => ({
          id: e.id,
          validatorCode: e.validatorCode,
          message: e.message,
          line: e.line,
          column: e.column,
        }))
      : [],
    validators: generateValidatorResults(),
    timeline: generateTimelineEvents(validation.recordCount),
    auditLog: generateAuditLog(),
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  VALIDATOR_DEFINITIONS,
  CONSAR_ERROR_TEMPLATES,
  REALISTIC_FILE_NAMES,
  USER_NAMES,
  generateCONSARFileName,
  sanitizeString,
  secureRandomId,
}
