/**
 * CONSAR Parser Service
 *
 * Parses CONSAR positional format files (77 characters per line)
 * Validates records against schema and applies business rules
 *
 * @module consar-parser
 */

import type {
  CONSARFileType,
  AnyRecord,
  NominaRecord,
  ContableRecord,
  RegularizacionRecord,
  ValidationError,
  FileMetadata,
  ParsedFile,
} from '@/lib/types/consar-record'
import type { CONSARSchema, FieldDefinition } from '@/lib/schemas/consar-schema'
import {
  extractField,
  validateLineLength,
  parseDate,
  parseAmount,
} from '@/lib/schemas/consar-schema'
import { nominaSchema } from '@/lib/schemas/nomina.schema'
import { contableSchema } from '@/lib/schemas/contable.schema'
import { regularizacionSchema } from '@/lib/schemas/regularizacion.schema'

/**
 * CONSAR Parser Class
 */
export class CONSARParser {
  private schema: CONSARSchema

  constructor(fileType: CONSARFileType) {
    this.schema = this.getSchema(fileType)
  }

  /**
   * Get schema for file type
   */
  private getSchema(fileType: CONSARFileType): CONSARSchema {
    switch (fileType) {
      case 'NOMINA':
        return nominaSchema
      case 'CONTABLE':
        return contableSchema
      case 'REGULARIZACION':
        return regularizacionSchema
      default:
        throw new Error(`Unknown file type: ${fileType}`)
    }
  }

  /**
   * Parse entire file
   */
  async parseFile(file: File): Promise<ParsedFile> {
    const startTime = performance.now()

    // Extract metadata from filename
    const metadata = this.extractMetadata(file.name)

    // Read file content
    const content = await this.readFile(file)

    // Split into lines
    const lines = content.split(/\r?\n/).filter(line => line.length > 0)

    // Parse each line
    const records: AnyRecord[] = []
    const errors: ValidationError[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1

      try {
        const record = this.parseLine(line, lineNumber)
        records.push(record)
      } catch (error) {
        errors.push({
          code: 'PARSE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown parsing error',
          severity: 'error',
          field: 'line',
          position: lineNumber,
        })
      }
    }

    // Calculate statistics
    const validRecords = records.filter(r => r.isValid).length
    const invalidRecords = records.filter(r => !r.isValid && r.errors.length > 0).length
    const warningRecords = records.filter(r => r.warnings.length > 0).length

    const parseTime = performance.now() - startTime

    return {
      metadata,
      records,
      totalRecords: records.length,
      validRecords,
      invalidRecords,
      warningRecords,
      parseTime,
      fileSize: file.size,
      errors,
    }
  }

  /**
   * Parse single line
   */
  parseLine(line: string, lineNumber: number): AnyRecord {
    // Validate line length
    if (!validateLineLength(line, this.schema.lineLength)) {
      const error: ValidationError = {
        code: 'LINE_LENGTH_ERROR',
        message: `La línea debe tener exactamente ${this.schema.lineLength} caracteres, tiene ${line.length}`,
        severity: 'error',
        field: 'line',
      }

      return this.createErrorRecord(line, lineNumber, [error])
    }

    // Extract record type (first 2 characters)
    const recordType = line.substring(0, 2)

    // Get field definitions for this record type
    const fields = this.schema.fields[recordType]
    if (!fields) {
      const error: ValidationError = {
        code: 'UNKNOWN_RECORD_TYPE',
        message: `Tipo de registro desconocido: ${recordType}`,
        severity: 'error',
        field: 'recordType',
      }

      return this.createErrorRecord(line, lineNumber, [error])
    }

    // Parse fields
    const parsedData: Record<string, unknown> = {}
    for (const field of fields) {
      const value = extractField(line, field)
      parsedData[field.name] = this.parseFieldValue(value, field)
    }

    // Create base record
    const baseRecord = {
      lineNumber,
      rawLine: line,
      fileType: this.schema.type,
      recordType,
      isValid: true,
      errors: [],
      warnings: [],
      parsedAt: new Date(),
      ...parsedData,
    }

    // Validate record
    const { errors, warnings } = this.validateRecord(baseRecord, fields)

    // Create typed record
    const record = this.createTypedRecord(baseRecord, errors, warnings)

    return record
  }

  /**
   * Parse field value based on type
   */
  private parseFieldValue(value: string, field: FieldDefinition): unknown {
    switch (field.type) {
      case 'number':
        return parseInt(value.trim(), 10) || 0

      case 'date': {
        const dateObj = parseDate(value)
        return dateObj
      }

      case 'currency':
        return parseAmount(value)

      case 'boolean':
        return value.trim().toUpperCase() === 'S' || value.trim() === '1'

      case 'string':
      default:
        return field.trim ? value.trim() : value
    }
  }

  /**
   * Validate record against schema validators
   */
  private validateRecord(
    record: Record<string, unknown>,
    fields: FieldDefinition[]
  ): { errors: ValidationError[]; warnings: ValidationError[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Field-level validations
    for (const field of fields) {
      // Required field validation
      if (field.required) {
        const value = record[field.name]
        const stringValue = String(value || '').trim()

        if (stringValue.length === 0) {
          errors.push({
            code: 'REQUIRED_FIELD',
            message: `Campo requerido: ${field.label}`,
            severity: 'error',
            field: field.name,
          })
        }
      }

      // Pattern validation
      if (field.pattern) {
        const value = String(record[field.name] || '')
        if (value.length > 0 && !field.pattern.test(value)) {
          errors.push({
            code: 'PATTERN_MISMATCH',
            message: `Formato inválido en campo: ${field.label}`,
            severity: 'error',
            field: field.name,
          })
        }
      }

      // Allowed values validation
      if (field.allowedValues && field.allowedValues.length > 0) {
        const value = String(record[field.name] || '').trim()
        if (value.length > 0 && !field.allowedValues.includes(value)) {
          errors.push({
            code: 'INVALID_VALUE',
            message: `Valor no permitido en ${field.label}. Valores permitidos: ${field.allowedValues.join(', ')}`,
            severity: 'error',
            field: field.name,
          })
        }
      }
    }

    // Schema-level validators
    for (const validator of this.schema.validators) {
      const fieldValue = String(record[validator.field] || '')

      try {
        const isValid = validator.validate(fieldValue, record)

        if (!isValid) {
          const validationError: ValidationError = {
            code: validator.code,
            message: validator.message,
            severity: validator.severity,
            field: validator.field,
            reference: validator.reference,
          }

          if (validator.severity === 'error') {
            errors.push(validationError)
          } else {
            warnings.push(validationError)
          }
        }
      } catch (error) {
        // Validator threw an exception
        errors.push({
          code: 'VALIDATOR_ERROR',
          message: `Error en validación ${validator.code}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error',
          field: validator.field,
        })
      }
    }

    return { errors, warnings }
  }

  /**
   * Create typed record based on file type
   */
  private createTypedRecord(
    baseRecord: Record<string, unknown>,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): AnyRecord {
    const isValid = errors.length === 0

    switch (this.schema.type) {
      case 'NOMINA':
        return {
          ...baseRecord,
          fileType: 'NOMINA',
          account: String(baseRecord.account || ''),
          date: String(baseRecord.paymentDate || ''),
          dateObj: baseRecord.paymentDate as Date | null,
          amount: Number(baseRecord.amount || 0),
          movementType: String(baseRecord.movementType || ''),
          curp: String(baseRecord.curp || ''),
          nss: String(baseRecord.nss || ''),
          employeeName: String(baseRecord.employeeName || ''),
          companyRFC: String(baseRecord.companyRFC || ''),
          isValid,
          errors,
          warnings,
        } as NominaRecord

      case 'CONTABLE':
        return {
          ...baseRecord,
          fileType: 'CONTABLE',
          accountCode: String(baseRecord.accountCode || ''),
          subAccountCode: String(baseRecord.subAccountCode || ''),
          date: String(baseRecord.date || ''),
          dateObj: baseRecord.date as Date | null,
          debitAmount: Number(baseRecord.debitAmount || 0),
          creditAmount: Number(baseRecord.creditAmount || 0),
          concept: String(baseRecord.concept || ''),
          reference: String(baseRecord.reference || ''),
          currency: String(baseRecord.currency || 'MXN'),
          isValid,
          errors,
          warnings,
        } as ContableRecord

      case 'REGULARIZACION':
        return {
          ...baseRecord,
          fileType: 'REGULARIZACION',
          account: String(baseRecord.account || ''),
          originalDate: String(baseRecord.originalDate || ''),
          correctionDate: String(baseRecord.correctionDate || ''),
          originalDateObj: baseRecord.originalDate as Date | null,
          correctionDateObj: baseRecord.correctionDate as Date | null,
          originalAmount: Number(baseRecord.originalAmount || 0),
          correctedAmount: Number(baseRecord.correctedAmount || 0),
          reason: String(baseRecord.reason || ''),
          authReference: String(baseRecord.authReference || ''),
          isValid,
          errors,
          warnings,
        } as RegularizacionRecord

      default:
        throw new Error(`Unknown file type: ${this.schema.type}`)
    }
  }

  /**
   * Create error record when parsing fails
   */
  private createErrorRecord(
    line: string,
    lineNumber: number,
    errors: ValidationError[]
  ): AnyRecord {
    // Generic error record (defaults to NOMINA structure)
    return {
      lineNumber,
      rawLine: line,
      fileType: this.schema.type,
      recordType: line.substring(0, 2),
      isValid: false,
      errors,
      warnings: [],
      parsedAt: new Date(),
      account: '',
      date: '',
      dateObj: null,
      amount: 0,
      movementType: '',
      curp: '',
      nss: '',
      employeeName: '',
      companyRFC: '',
    } as NominaRecord
  }

  /**
   * Read file as text
   */
  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        const content = event.target?.result as string
        resolve(content)
      }

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'))
      }

      reader.readAsText(file, 'UTF-8')
    })
  }

  /**
   * Extract metadata from filename
   * Expected format: [TYPE]_[RFC]_[YYYYMMDD]_[SEQUENCE].txt
   */
  extractMetadata(filename: string): FileMetadata {
    const parts = filename.replace('.txt', '').split('_')

    if (parts.length < 4) {
      throw new Error(
        'Nombre de archivo inválido. Formato esperado: TIPO_RFC_YYYYMMDD_SECUENCIA.txt'
      )
    }

    const [type, rfc, dateStr, sequence] = parts

    // Validate file type
    if (!['NOMINA', 'CONTABLE', 'REGULARIZACION'].includes(type)) {
      throw new Error(`Tipo de archivo inválido: ${type}`)
    }

    // Parse date
    const dateObj = parseDate(dateStr)
    if (!dateObj) {
      throw new Error(`Fecha inválida en nombre de archivo: ${dateStr}`)
    }

    return {
      type: type as CONSARFileType,
      rfc,
      date: dateStr,
      dateObj,
      sequence,
      originalName: filename,
    }
  }
}

/**
 * Convenience function to parse file
 */
export async function parseConsarFile(
  file: File,
  fileType: CONSARFileType
): Promise<ParsedFile> {
  const parser = new CONSARParser(fileType)
  return parser.parseFile(file)
}
