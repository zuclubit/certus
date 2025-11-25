/**
 * CONSAR Schema Definitions
 *
 * Field definitions for parsing CONSAR positional format files (77 characters)
 * Based on Circular 19-8 and related CONSAR circulars
 *
 * @module consar-schema
 */

import type { CONSARFileType, RecordType } from '@/lib/types/consar-record'

/**
 * Field data types
 */
export type FieldType = 'string' | 'number' | 'date' | 'currency' | 'boolean'

/**
 * Field definition for positional parsing
 */
export interface FieldDefinition {
  /** Field name (camelCase) */
  name: string
  /** Display label (Spanish) */
  label: string
  /** Start position (1-indexed) */
  start: number
  /** End position (inclusive, 1-indexed) */
  end: number
  /** Length in characters */
  length: number
  /** Data type */
  type: FieldType
  /** Whether field is required (non-empty) */
  required: boolean
  /** Whether field should be trimmed */
  trim: boolean
  /** Padding character (for validation) */
  padding?: string
  /** Pattern validation (regex) */
  pattern?: RegExp
  /** Description for documentation */
  description?: string
  /** Allowed values (for enums) */
  allowedValues?: string[]
  /** Date format (for type='date') */
  dateFormat?: string
}

/**
 * Validator function type
 */
export type ValidatorFn = (value: string, record: Record<string, unknown>) => boolean

/**
 * Validator definition
 */
export interface ValidatorDefinition {
  /** Unique validator code (e.g., "NOMINA_VAL_01") */
  code: string
  /** Field name to validate */
  field: string
  /** Validation function */
  validate: ValidatorFn
  /** Error message template */
  message: string
  /** CONSAR circular reference */
  reference?: string
  /** Severity level */
  severity: 'error' | 'warning' | 'info'
}

/**
 * Schema definition for a CONSAR file type
 */
export interface CONSARSchema {
  /** File type */
  type: CONSARFileType
  /** Human-readable name */
  name: string
  /** Description */
  description: string
  /** Field definitions by record type */
  fields: Record<RecordType, FieldDefinition[]>
  /** Validators for this file type */
  validators: ValidatorDefinition[]
  /** Expected line length */
  lineLength: number
}

/**
 * Common validators used across schemas
 */
export const commonValidators = {
  /**
   * Validates RFC format (12-13 characters)
   */
  isValidRFC: (value: string): boolean => {
    const rfcPattern = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/
    return rfcPattern.test(value.trim())
  },

  /**
   * Validates CURP format (18 characters)
   */
  isValidCURP: (value: string): boolean => {
    const curpPattern = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/
    return curpPattern.test(value.trim())
  },

  /**
   * Validates NSS format (11 digits)
   */
  isValidNSS: (value: string): boolean => {
    const nssPattern = /^\d{11}$/
    return nssPattern.test(value.trim())
  },

  /**
   * Validates date format YYYYMMDD
   */
  isValidDate: (value: string): boolean => {
    const datePattern = /^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/
    if (!datePattern.test(value)) return false

    const year = parseInt(value.substring(0, 4), 10)
    const month = parseInt(value.substring(4, 6), 10)
    const day = parseInt(value.substring(6, 8), 10)

    const date = new Date(year, month - 1, day)
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    )
  },

  /**
   * Validates numeric amount (with 2 decimals)
   */
  isValidAmount: (value: string): boolean => {
    const amountPattern = /^\d{7}\d{2}$/ // 7 digits + 2 decimals
    return amountPattern.test(value.trim())
  },

  /**
   * Validates positive amount (non-zero)
   */
  isPositiveAmount: (value: string): boolean => {
    const amount = parseInt(value.trim(), 10)
    return !isNaN(amount) && amount > 0
  },

  /**
   * Validates account number (11 digits)
   */
  isValidAccount: (value: string): boolean => {
    const accountPattern = /^\d{11}$/
    return accountPattern.test(value.trim())
  },

  /**
   * Validates that field is not empty (after trim)
   */
  isNotEmpty: (value: string): boolean => {
    return value.trim().length > 0
  },

  /**
   * Validates that field contains only alphanumeric characters
   */
  isAlphanumeric: (value: string): boolean => {
    const alphanumericPattern = /^[A-Z0-9\s]+$/
    return alphanumericPattern.test(value.trim())
  },

  /**
   * Validates that date is not in the future
   */
  isNotFutureDate: (value: string): boolean => {
    if (!commonValidators.isValidDate(value)) return false

    const year = parseInt(value.substring(0, 4), 10)
    const month = parseInt(value.substring(4, 6), 10)
    const day = parseInt(value.substring(6, 8), 10)

    const date = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return date <= today
  },

  /**
   * Validates that date is within reasonable range (1900-2100)
   */
  isReasonableDate: (value: string): boolean => {
    if (!commonValidators.isValidDate(value)) return false

    const year = parseInt(value.substring(0, 4), 10)
    return year >= 1900 && year <= 2100
  },
}

/**
 * Parse date from YYYYMMDD format
 */
export function parseDate(value: string): Date | null {
  if (!commonValidators.isValidDate(value)) return null

  const year = parseInt(value.substring(0, 4), 10)
  const month = parseInt(value.substring(4, 6), 10)
  const day = parseInt(value.substring(6, 8), 10)

  return new Date(year, month - 1, day)
}

/**
 * Parse amount from string (9 digits = 7 integer + 2 decimals)
 */
export function parseAmount(value: string): number {
  const trimmed = value.trim()
  if (trimmed.length === 0) return 0

  // Amount is stored as integer in cents
  // Example: "000012345" = $123.45
  const amount = parseInt(trimmed, 10)
  return isNaN(amount) ? 0 : amount
}

/**
 * Format amount for display (cents to currency)
 */
export function formatAmount(cents: number): string {
  const dollars = cents / 100
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(dollars)
}

/**
 * Extract field value from line using field definition
 */
export function extractField(line: string, field: FieldDefinition): string {
  if (line.length < field.end) {
    return ''
  }

  // Positions are 1-indexed, substring is 0-indexed
  const value = line.substring(field.start - 1, field.end)

  return field.trim ? value.trim() : value
}

/**
 * Validate line length
 */
export function validateLineLength(line: string, expectedLength: number): boolean {
  return line.length === expectedLength
}

/**
 * Get all schemas
 */
export function getAllSchemas(): CONSARSchema[] {
  // Lazy import to avoid circular dependencies
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { nominaSchema } = require('./nomina.schema')
  const { contableSchema } = require('./contable.schema')
  const { regularizacionSchema } = require('./regularizacion.schema')

  return [nominaSchema, contableSchema, regularizacionSchema]
}

/**
 * Get schema by file type
 */
export function getSchemaByType(type: CONSARFileType): CONSARSchema | null {
  const schemas = getAllSchemas()
  return schemas.find(s => s.type === type) || null
}
