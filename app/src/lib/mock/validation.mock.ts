/**
 * Mock Data Generator for Validations
 *
 * Generates realistic mock data for development and testing
 * Based on CONSAR validation specifications
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
import { VALIDATOR_GROUPS } from '@/lib/constants'

// Helper functions
const randomId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
const randomDate = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date.toISOString()
}
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomChoice = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)]

// Realistic file names
const FILE_NAMES = [
  '20250804_SB_544_001980.0300.txt',
  '20250115_NOMINA_AFORE_XXI.txt',
  '20250120_CONTABLE_1101_PRINCIPAL.txt',
  '20250125_REGULARIZACION_Q4_2024.txt',
  'BALANZA_COMPROBACION_ENE2025.txt',
  'NOMINA_QUINCENAL_15ENE2025.txt',
  'APORTACIONES_VOLUNTARIAS_Q1.txt',
]

// User names
const USER_NAMES = [
  'Juan Pérez',
  'María García',
  'Carlos López',
  'Ana Martínez',
  'Roberto Sánchez',
]

// Validator definitions (37 total)
const VALIDATOR_DEFINITIONS = [
  // Estructura (V01-V05)
  { code: 'V001', name: 'Validación de Longitud de Registro', group: 'Estructura' },
  { code: 'V002', name: 'Validación de Longitud de Encabezado', group: 'Estructura' },
  { code: 'V003', name: 'Validación de Tipo de Dato', group: 'Estructura' },
  { code: 'V004', name: 'Validación de Formato de Fecha', group: 'Estructura' },
  { code: 'V005', name: 'Validación de Caracteres Especiales', group: 'Estructura' },

  // Catálogos (V06-V10)
  { code: 'V006', name: 'Validación de Catálogo de Cuentas', group: 'Catálogos' },
  { code: 'V007', name: 'Validación de Catálogo de Subcuentas', group: 'Catálogos' },
  { code: 'V008', name: 'Validación de Catálogo de Entidades', group: 'Catálogos' },
  { code: 'V009', name: 'Validación de Catálogo de Divisas', group: 'Catálogos' },
  { code: 'V010', name: 'Validación de Catálogo de Tipos de Registro', group: 'Catálogos' },

  // Rangos (V11-V15)
  { code: 'V011', name: 'Validación de Rango de Saldos', group: 'Rangos' },
  { code: 'V012', name: 'Validación de Rango de Cargos', group: 'Rangos' },
  { code: 'V013', name: 'Validación de Rango de Abonos', group: 'Rangos' },
  { code: 'V014', name: 'Validación de Rango de Fechas', group: 'Rangos' },
  { code: 'V015', name: 'Validación de Rango de Tipos de Cambio', group: 'Rangos' },

  // Cálculos (V16-V20)
  { code: 'V016', name: 'Validación de Suma de Cargos', group: 'Cálculos' },
  { code: 'V017', name: 'Validación de Suma de Abonos', group: 'Cálculos' },
  { code: 'V018', name: 'Validación de Balanza Cuadrada', group: 'Cálculos' },
  { code: 'V019', name: 'Validación de Saldo Inicial + Movimientos', group: 'Cálculos' },
  { code: 'V020', name: 'Validación de Promedios Ponderados', group: 'Cálculos' },

  // Cruce (V21-V25)
  { code: 'V021', name: 'Validación de Contracuentas 71 vs 72', group: 'Cruce' },
  { code: 'V022', name: 'Validación de Plus vs Minus', group: 'Cruce' },
  { code: 'V023', name: 'Validación Cruzada con Nómina', group: 'Cruce' },
  { code: 'V024', name: 'Validación Cruzada con Aportaciones', group: 'Cruce' },
  { code: 'V025', name: 'Validación de Conciliación Bancaria', group: 'Cruce' },

  // Negocio (V26-V30)
  { code: 'V026', name: 'Validación de Comisiones Permitidas', group: 'Negocio' },
  { code: 'V027', name: 'Validación de Rendimientos Mínimos', group: 'Negocio' },
  { code: 'V028', name: 'Validación de Límites de Inversión', group: 'Negocio' },
  { code: 'V029', name: 'Validación de Portabilidad de Recursos', group: 'Negocio' },
  { code: 'V030', name: 'Validación de Retiros Programados', group: 'Negocio' },

  // Regulatorio (V31-V37)
  { code: 'V031', name: 'Conversión de Divisas a Pesos (7115)', group: 'Regulatorio' },
  { code: 'V032', name: 'Validación de Cuentas CONSAR Vigentes', group: 'Regulatorio' },
  { code: 'V033', name: 'Validación de Firma Electrónica', group: 'Regulatorio' },
  { code: 'V034', name: 'Validación de Plazos Regulatorios', group: 'Regulatorio' },
  { code: 'V035', name: 'Validación de Documentación Soporte', group: 'Regulatorio' },
  { code: 'V036', name: 'Validación de Cumplimiento SOX', group: 'Regulatorio' },
  { code: 'V037', name: 'Validación de Trazabilidad CONSAR', group: 'Regulatorio' },
]

/**
 * Generate a single validation mock
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

  const recordCount = randomInt(100, 50000)
  const errorCount = status === 'success' ? 0 : randomInt(0, 500)
  const warningCount = randomInt(0, 50)
  const validRecordCount = recordCount - errorCount

  return {
    id: randomId(),
    fileName: randomChoice(FILE_NAMES),
    fileType,
    fileSize: randomInt(50000, 10000000), // 50KB to 10MB
    status,
    uploadedBy: randomChoice(USER_NAMES),
    uploadedAt: randomDate(30),
    processedAt: status !== 'pending' ? randomDate(30) : undefined,
    validatedAt: status === 'success' ? randomDate(30) : undefined,
    errorCount,
    warningCount,
    recordCount,
    validRecordCount,
    progress: status === 'processing' ? randomInt(10, 90) : undefined,
    ...overrides,
  }
}

/**
 * Generate multiple validations
 */
export const generateValidations = (count: number): Validation[] => {
  return Array.from({ length: count }, () => generateValidation())
}

/**
 * Generate validation errors
 */
export const generateValidationErrors = (count: number): ValidationError[] => {
  const severities: ErrorSeverity[] = ['critical', 'high', 'medium', 'low', 'info']

  const errorTemplates = [
    {
      message: 'Longitud de registro incorrecta',
      description: 'El registro en la línea {line} tiene {value} caracteres cuando se esperaban 77',
      suggestion: 'Verifique que el archivo tenga el formato posicional correcto',
      field: 'RegistroCompleto',
    },
    {
      message: 'Cuenta no existe en catálogo CONSAR',
      description: 'La cuenta "{value}" no se encuentra en el catálogo vigente',
      suggestion: 'Consulte el catálogo de cuentas CONSAR actualizado',
      field: 'ClaveCuenta',
    },
    {
      message: 'Balanza no cuadra',
      description: 'Diferencia de ${value} entre saldo calculado y saldo final',
      suggestion: 'Verifique: Saldo Inicial + Cargos - Abonos = Saldo Final',
      field: 'SaldoFinal',
    },
    {
      message: 'Tipo de cambio fuera de rango',
      description: 'Tipo de cambio {value} está fuera del rango permitido (18.50 - 21.50)',
      suggestion: 'Verifique el tipo de cambio FIX del día',
      field: 'TipoCambio',
    },
    {
      message: 'Suma de cargos no coincide',
      description: 'La suma de cargos ${value} no coincide con el total declarado ${expectedValue}',
      suggestion: 'Recalcule la suma total de cargos del archivo',
      field: 'TotalCargos',
    },
  ]

  return Array.from({ length: count }, (_, i) => {
    const template = randomChoice(errorTemplates)
    const validator = randomChoice(VALIDATOR_DEFINITIONS)
    const line = randomInt(1, 10000)

    return {
      id: randomId(),
      validatorCode: validator.code,
      validatorName: validator.name,
      severity: randomChoice(severities),
      message: template.message,
      description: template.description
        .replace('{line}', line.toString())
        .replace('{value}', randomInt(50, 100).toString())
        .replace('{expectedValue}', randomInt(50, 100).toString()),
      suggestion: template.suggestion,
      line,
      column: randomInt(1, 77),
      field: template.field,
      value: randomInt(1000, 9999).toString(),
      expectedValue: Math.random() > 0.5 ? randomInt(1000, 9999).toString() : undefined,
      reference: `CONSAR Circular ${randomInt(19, 52)}-${randomInt(1, 10)}`,
    }
  })
}

/**
 * Generate validator results (37 validators)
 */
export const generateValidatorResults = (): ValidatorResult[] => {
  return VALIDATOR_DEFINITIONS.map((validator) => {
    const status = randomChoice<ValidatorResult['status']>([
      'passed',
      'failed',
      'warning',
      'passed',
      'passed', // More weight to passed
    ])

    return {
      code: validator.code,
      name: validator.name,
      group: validator.group,
      status,
      duration: randomInt(100, 5000), // 100ms to 5s
      errorCount: status === 'failed' ? randomInt(1, 50) : 0,
      warningCount: status === 'warning' ? randomInt(1, 10) : 0,
    }
  })
}

/**
 * Generate timeline events
 */
export const generateTimelineEvents = (): TimelineEvent[] => {
  const events = [
    {
      type: 'upload',
      message: 'Archivo subido al sistema',
    },
    {
      type: 'parsing',
      message: 'Análisis de estructura del archivo iniciado',
    },
    {
      type: 'validation_started',
      message: 'Proceso de validación iniciado (37 validadores)',
    },
    {
      type: 'validation_structure',
      message: 'Validación de estructura completada (V01-V05)',
    },
    {
      type: 'validation_catalogs',
      message: 'Validación de catálogos completada (V06-V10)',
    },
    {
      type: 'validation_ranges',
      message: 'Validación de rangos completada (V11-V15)',
    },
    {
      type: 'validation_calculations',
      message: 'Validación de cálculos completada (V16-V20)',
    },
    {
      type: 'validation_cross',
      message: 'Validación de cruces completada (V21-V25)',
    },
    {
      type: 'validation_business',
      message: 'Validación de negocio completada (V26-V30)',
    },
    {
      type: 'validation_regulatory',
      message: 'Validación regulatoria completada (V31-V37)',
    },
    {
      type: 'validation_completed',
      message: 'Proceso de validación completado',
    },
    {
      type: 'report_generated',
      message: 'Reporte de resultados generado',
    },
  ]

  let baseTime = new Date()
  baseTime.setMinutes(baseTime.getMinutes() - 10)

  return events.map((event, index) => {
    const timestamp = new Date(baseTime.getTime() + index * 30000) // 30 seconds apart
    return {
      id: randomId(),
      timestamp: timestamp.toISOString(),
      type: event.type,
      message: event.message,
      user: index === 0 ? randomChoice(USER_NAMES) : 'Sistema',
      metadata: { step: index + 1, totalSteps: events.length },
    }
  })
}

/**
 * Generate audit log entries
 */
export const generateAuditLog = (): AuditLogEntry[] => {
  const actions = [
    { action: 'UPLOAD', resource: 'validation', details: 'Archivo subido para validación' },
    { action: 'VIEW', resource: 'validation', details: 'Consulta de detalle de validación' },
    { action: 'DOWNLOAD', resource: 'report', details: 'Descarga de reporte de errores' },
    { action: 'RETRY', resource: 'validation', details: 'Re-procesamiento de archivo' },
  ]

  return actions.map((item) => ({
    id: randomId(),
    timestamp: randomDate(7),
    user: randomChoice(USER_NAMES),
    action: item.action,
    resource: item.resource,
    details: item.details,
    ipAddress: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
  }))
}

/**
 * Generate a complete validation detail
 */
export const generateValidationDetail = (id?: string): ValidationDetail => {
  const validation = generateValidation({ id })
  const errorCount = validation.errorCount
  const hasErrors = errorCount > 0

  return {
    ...validation,
    errors: hasErrors ? generateValidationErrors(Math.min(errorCount, 100)) : [],
    warnings: validation.warningCount > 0 ? generateValidationErrors(Math.min(validation.warningCount, 20)).map(e => ({
      id: e.id,
      validatorCode: e.validatorCode,
      message: e.message,
      line: e.line,
      column: e.column,
    })) : [],
    validators: generateValidatorResults(),
    timeline: generateTimelineEvents(),
    auditLog: generateAuditLog(),
  }
}
