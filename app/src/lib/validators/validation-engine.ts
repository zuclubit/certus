/**
 * CONSAR Validation Engine
 *
 * Complete validation engine for CONSAR files that integrates:
 * - File parsing (consar-parser)
 * - Mexican document validators (mexican-validators)
 * - Error catalog (consar-error-catalog)
 *
 * Features:
 * - Multi-stage validation (structure, format, business rules)
 * - Progress reporting
 * - Detailed error reporting with suggestions
 * - Performance metrics
 *
 * @module validation-engine
 */

import type {
  CONSARFileType,
  AnyRecord,
  ParsedFile,
  ValidationError as ParserValidationError,
} from '../types/consar-record'
import { CONSARParser } from '../parsers/consar-parser'
import {
  validateCURP,
  validateNSS,
  validateRFC,
  isValidRFCFormat,
} from './mexican-validators'
import {
  BATCH_REJECTION_CODES,
  RECORD_REJECTION_CODES,
  isValidAFORECode,
  isValidMovementType,
  type ErrorSeverity,
} from './consar-error-catalog'

// ============================================
// TYPES
// ============================================

/**
 * Validation result for a single field
 */
export interface FieldValidationResult {
  field: string
  value: unknown
  isValid: boolean
  errors: ValidationErrorDetail[]
  warnings: ValidationErrorDetail[]
}

/**
 * Detailed validation error
 */
export interface ValidationErrorDetail {
  code: string
  severity: ErrorSeverity
  message: string
  description?: string
  field?: string
  lineNumber?: number
  position?: number
  value?: string
  expectedValue?: string
  suggestion?: string
  reference?: string
}

/**
 * Validation result for a single record
 */
export interface RecordValidationResult {
  lineNumber: number
  recordType: string
  isValid: boolean
  errors: ValidationErrorDetail[]
  warnings: ValidationErrorDetail[]
  fieldResults: FieldValidationResult[]
  duration: number
}

/**
 * Validation result for the entire file
 */
export interface FileValidationResult {
  fileName: string
  fileType: CONSARFileType
  fileSize: number
  isValid: boolean
  isCompliant: boolean
  overallStatus: 'passed' | 'warning' | 'failed'
  summary: ValidationSummary
  batchErrors: ValidationErrorDetail[]
  recordResults: RecordValidationResult[]
  parsedFile: ParsedFile | null
  performance: PerformanceMetrics
  timestamp: Date
}

/**
 * Validation summary statistics
 */
export interface ValidationSummary {
  totalRecords: number
  validRecords: number
  invalidRecords: number
  warningRecords: number
  totalErrors: number
  totalWarnings: number
  errorsByCategory: Record<string, number>
  errorsBySeverity: Record<ErrorSeverity, number>
  complianceScore: number
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  parseTime: number
  validationTime: number
  totalTime: number
  recordsPerSecond: number
  averageRecordTime: number
}

/**
 * Validation progress
 */
export interface ValidationProgress {
  phase: 'parsing' | 'structure' | 'records' | 'summary' | 'complete'
  percentComplete: number
  recordsProcessed: number
  totalRecords: number
  currentMessage: string
  errorsFound: number
  warningsFound: number
}

/**
 * Validation options
 */
export interface ValidationOptions {
  validateStructure?: boolean
  validateRecords?: boolean
  validateCrossReferences?: boolean
  stopOnFirstError?: boolean
  maxErrors?: number
  skipWarnings?: boolean
  progressCallback?: (progress: ValidationProgress) => void
}

// ============================================
// VALIDATION ENGINE CLASS
// ============================================

export class ValidationEngine {
  private options: Required<ValidationOptions>
  private parser: CONSARParser | null = null
  private progress: ValidationProgress = {
    phase: 'parsing',
    percentComplete: 0,
    recordsProcessed: 0,
    totalRecords: 0,
    currentMessage: 'Iniciando...',
    errorsFound: 0,
    warningsFound: 0,
  }

  constructor(options: ValidationOptions = {}) {
    this.options = {
      validateStructure: options.validateStructure ?? true,
      validateRecords: options.validateRecords ?? true,
      validateCrossReferences: options.validateCrossReferences ?? true,
      stopOnFirstError: options.stopOnFirstError ?? false,
      maxErrors: options.maxErrors ?? 1000,
      skipWarnings: options.skipWarnings ?? false,
      progressCallback: options.progressCallback ?? (() => {}),
    }
  }

  /**
   * Create a ValidationErrorDetail from a record error code
   */
  private createRecordError(
    code: string,
    overrides: Partial<ValidationErrorDetail> = {}
  ): ValidationErrorDetail {
    const errorDef = RECORD_REJECTION_CODES[code]
    return {
      code: errorDef?.code || code,
      severity: errorDef?.severity || 'error',
      message: errorDef?.message || `Error ${code}`,
      description: errorDef?.description,
      reference: errorDef?.reference,
      suggestion: errorDef?.suggestion,
      ...overrides,
    }
  }

  /**
   * Create a ValidationErrorDetail from a batch error code
   */
  private createBatchError(
    code: string,
    overrides: Partial<ValidationErrorDetail> = {}
  ): ValidationErrorDetail {
    const errorDef = BATCH_REJECTION_CODES[code]
    return {
      code: errorDef?.code || code,
      severity: errorDef?.severity || 'error',
      message: errorDef?.message || `Error ${code}`,
      description: errorDef?.description,
      reference: errorDef?.reference,
      suggestion: errorDef?.suggestion,
      ...overrides,
    }
  }

  /**
   * Validate a file completely
   */
  async validateFile(
    file: File,
    fileType: CONSARFileType
  ): Promise<FileValidationResult> {
    const startTime = performance.now()

    // Initialize result
    const result: FileValidationResult = {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      isValid: true,
      isCompliant: true,
      overallStatus: 'passed',
      summary: this.createEmptySummary(),
      batchErrors: [],
      recordResults: [],
      parsedFile: null,
      performance: {
        parseTime: 0,
        validationTime: 0,
        totalTime: 0,
        recordsPerSecond: 0,
        averageRecordTime: 0,
      },
      timestamp: new Date(),
    }

    try {
      // Phase 1: Validate file name and basic structure
      this.updateProgress('structure', 0, 'Validando nombre de archivo...')
      const fileNameErrors = this.validateFileName(file.name, fileType)
      result.batchErrors.push(...fileNameErrors)

      // Phase 2: Parse file
      this.updateProgress('parsing', 5, 'Parseando archivo...')
      const parseStartTime = performance.now()

      this.parser = new CONSARParser(fileType)
      const parsedFile = await this.parser.parseFile(file)
      result.parsedFile = parsedFile

      result.performance.parseTime = performance.now() - parseStartTime
      result.summary.totalRecords = parsedFile.records.length

      // Add parser errors as batch errors
      for (const error of parsedFile.errors) {
        result.batchErrors.push(this.convertParserError(error))
      }

      // Phase 3: Validate structure
      if (this.options.validateStructure) {
        this.updateProgress('structure', 15, 'Validando estructura...')
        const structureErrors = this.validateStructure(parsedFile, fileType)
        result.batchErrors.push(...structureErrors)
      }

      // Check if we should continue with record validation
      const hasCriticalBatchErrors = result.batchErrors.some(
        e => e.severity === 'critical'
      )

      if (hasCriticalBatchErrors && this.options.stopOnFirstError) {
        this.updateProgress('complete', 100, 'Validación detenida por errores críticos')
        return this.finalizeResult(result, startTime)
      }

      // Phase 4: Validate records
      if (this.options.validateRecords) {
        const validationStartTime = performance.now()

        this.updateProgress('records', 20, 'Validando registros...')

        let errorCount = 0
        const totalRecords = parsedFile.records.length

        for (let i = 0; i < totalRecords; i++) {
          const record = parsedFile.records[i]
          if (!record) continue // Skip undefined records

          // Update progress
          const percentComplete = 20 + Math.floor((i / totalRecords) * 75)
          this.updateProgress(
            'records',
            percentComplete,
            `Validando registro ${i + 1} de ${totalRecords}...`,
            i + 1,
            totalRecords
          )

          // Validate record
          const recordResult = this.validateRecord(record, fileType)
          result.recordResults.push(recordResult)

          // Update error counts
          errorCount += recordResult.errors.length
          result.summary.totalErrors += recordResult.errors.length
          result.summary.totalWarnings += recordResult.warnings.length

          if (!recordResult.isValid) {
            result.summary.invalidRecords++
          } else if (recordResult.warnings.length > 0) {
            result.summary.warningRecords++
          } else {
            result.summary.validRecords++
          }

          // Check max errors
          if (errorCount >= this.options.maxErrors) {
            result.batchErrors.push({
              code: 'ENGINE_MAX_ERRORS',
              severity: 'warning',
              message: `Se alcanzó el límite máximo de errores (${this.options.maxErrors})`,
              description: 'La validación se detuvo para evitar sobrecarga',
            })
            break
          }
        }

        result.performance.validationTime = performance.now() - validationStartTime
      }

      // Phase 5: Cross-reference validation
      if (this.options.validateCrossReferences) {
        this.updateProgress('summary', 95, 'Validando referencias cruzadas...')
        const crossRefErrors = this.validateCrossReferences(result)
        result.batchErrors.push(...crossRefErrors)
      }

      // Finalize
      this.updateProgress('complete', 100, 'Validación completada')
      return this.finalizeResult(result, startTime)
    } catch (error) {
      result.batchErrors.push({
        code: 'ENGINE_ERROR',
        severity: 'critical',
        message: `Error durante la validación: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      })
      result.isValid = false
      result.overallStatus = 'failed'
      return this.finalizeResult(result, startTime)
    }
  }

  /**
   * Validate file name format
   */
  private validateFileName(
    fileName: string,
    expectedType: CONSARFileType
  ): ValidationErrorDetail[] {
    const errors: ValidationErrorDetail[] = []

    // Expected format: TIPO_RFC_YYYYMMDD_SECUENCIA.txt
    const pattern = /^([A-Z]+)_([A-ZÑ&0-9]{12,13})_(\d{8})_(\d{4})\.txt$/i
    const match = fileName.match(pattern)

    if (!match || !match[1] || !match[2] || !match[3] || !match[4]) {
      const loteError = BATCH_REJECTION_CODES['LOTE_013']
      if (loteError) {
        errors.push({
          code: loteError.code,
          severity: loteError.severity,
          message: loteError.message,
          description: loteError.description,
          value: fileName,
          expectedValue: 'TIPO_RFC_YYYYMMDD_NNNN.txt',
        })
      }
      return errors
    }

    const fileType = match[1]
    const rfc = match[2]
    const dateStr = match[3]
    const sequence = match[4]

    // Validate file type matches
    if (fileType.toUpperCase() !== expectedType) {
      errors.push({
        code: 'LOTE_004',
        severity: 'error',
        message: `Tipo de archivo en nombre no coincide: esperado ${expectedType}, encontrado ${fileType}`,
        value: fileType,
        expectedValue: expectedType,
      })
    }

    // Validate RFC format
    if (!isValidRFCFormat(rfc)) {
      const rfcResult = validateRFC(rfc)
      if (!rfcResult.isValid) {
        const loteError = BATCH_REJECTION_CODES['LOTE_007']
        if (loteError) {
          errors.push({
            code: loteError.code,
            severity: loteError.severity,
            message: loteError.message,
            description: rfcResult.errors.join('; '),
            value: rfc,
          })
        }
      }
    }

    // Validate date
    const month = parseInt(dateStr.substring(4, 6), 10)
    const day = parseInt(dateStr.substring(6, 8), 10)

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      const loteError = BATCH_REJECTION_CODES['LOTE_008']
      if (loteError) {
        errors.push({
          code: loteError.code,
          severity: loteError.severity,
          message: loteError.message,
          value: dateStr,
        })
      }
    }

    // Validate sequence
    const seqNum = parseInt(sequence, 10)
    if (seqNum < 1 || seqNum > 9999) {
      errors.push({
        code: 'LOTE_SEQ',
        severity: 'warning',
        message: 'Número de secuencia fuera de rango (0001-9999)',
        value: sequence,
      })
    }

    return errors
  }

  /**
   * Validate file structure
   */
  private validateStructure(
    parsedFile: ParsedFile,
    _fileType: CONSARFileType
  ): ValidationErrorDetail[] {
    const errors: ValidationErrorDetail[] = []

    // Helper to safely push batch errors
    const pushBatchError = (code: string, overrides?: Partial<ValidationErrorDetail>) => {
      const errorDef = BATCH_REJECTION_CODES[code]
      if (errorDef) {
        errors.push({
          code: errorDef.code,
          severity: errorDef.severity,
          message: errorDef.message,
          description: errorDef.description,
          ...overrides,
        })
      }
    }

    const pushRecordError = (code: string, overrides?: Partial<ValidationErrorDetail>) => {
      const errorDef = RECORD_REJECTION_CODES[code]
      if (errorDef) {
        errors.push({
          code: errorDef.code,
          severity: errorDef.severity,
          message: errorDef.message,
          description: errorDef.description,
          ...overrides,
        })
      }
    }

    // Check for empty file
    if (parsedFile.records.length === 0) {
      pushBatchError('LOTE_012')
      return errors
    }

    // Check header
    const headerRecords = parsedFile.records.filter(r => r.recordType === '01')
    if (headerRecords.length === 0) {
      pushBatchError('LOTE_001')
    } else if (headerRecords.length > 1) {
      pushRecordError('REG_081', { value: headerRecords.length.toString() })
    }

    // Check footer
    const footerRecords = parsedFile.records.filter(r => r.recordType === '03')
    if (footerRecords.length === 0) {
      pushBatchError('LOTE_002')
    } else if (footerRecords.length > 1) {
      pushRecordError('REG_082', { value: footerRecords.length.toString() })
    }

    // Check record order
    const firstRecord = parsedFile.records[0]
    const lastRecord = parsedFile.records[parsedFile.records.length - 1]

    if (firstRecord && firstRecord.recordType !== '01') {
      errors.push({
        code: 'LOTE_ORDER_01',
        severity: 'error',
        message: 'El primer registro debe ser de tipo 01 (encabezado)',
        lineNumber: 1,
      })
    }

    if (lastRecord && lastRecord.recordType !== '03') {
      errors.push({
        code: 'LOTE_ORDER_03',
        severity: 'error',
        message: 'El último registro debe ser de tipo 03 (sumaria)',
        lineNumber: parsedFile.records.length,
      })
    }

    // Check for footer not at end
    for (let i = 0; i < parsedFile.records.length - 1; i++) {
      const currentRecord = parsedFile.records[i]
      if (currentRecord && currentRecord.recordType === '03') {
        pushRecordError('REG_083', { lineNumber: i + 1 })
      }
    }

    // Validate detail record count
    const detailRecords = parsedFile.records.filter(r => r.recordType === '02')
    if (footerRecords.length > 0 && footerRecords[0]) {
      const footer = footerRecords[0] as any
      const declaredCount = footer.totalRecords || 0

      if (declaredCount !== detailRecords.length) {
        pushBatchError('LOTE_005', {
          value: detailRecords.length.toString(),
          expectedValue: declaredCount.toString(),
        })
      }

      // LOTE_006: Validate sum of amounts matches footer total (Circular 19-8, Art. 5.3.2)
      const declaredTotal = footer.totalAmount || 0
      const calculatedTotal = detailRecords.reduce((sum, record) => {
        const amount = 'amount' in record ? (record.amount as number) || 0 : 0
        return sum + amount
      }, 0)

      if (declaredTotal > 0 && Math.abs(declaredTotal - calculatedTotal) > 1) {
        pushBatchError('LOTE_006', {
          value: (calculatedTotal / 100).toFixed(2),
          expectedValue: (declaredTotal / 100).toFixed(2),
          description: `Suma calculada: $${(calculatedTotal / 100).toFixed(2)}, Suma declarada: $${(declaredTotal / 100).toFixed(2)}`,
        })
      }
    }

    // LOTE_014: Check for non-ASCII characters (Circular 19-8, Art. 4.3)
    // Check each record's rawLine for non-ASCII characters
    const nonAsciiChars: string[] = []
    for (const record of parsedFile.records) {
      if (record.rawLine) {
        const matches = record.rawLine.match(/[^\x20-\x7E\x0A\x0D]/g)
        if (matches) {
          nonAsciiChars.push(...matches)
        }
      }
    }
    if (nonAsciiChars.length > 0) {
      pushBatchError('LOTE_014', {
        value: `${nonAsciiChars.length} caracteres no ASCII encontrados`,
        description: `Caracteres inválidos: ${nonAsciiChars.slice(0, 5).map((c: string) => `0x${c.charCodeAt(0).toString(16)}`).join(', ')}`,
      })
    }

    return errors
  }

  /**
   * Validate a single record
   */
  private validateRecord(
    record: AnyRecord,
    fileType: CONSARFileType
  ): RecordValidationResult {
    const startTime = performance.now()
    const errors: ValidationErrorDetail[] = []
    const warnings: ValidationErrorDetail[] = []
    const fieldResults: FieldValidationResult[] = []

    // Skip non-detail records for detailed validation
    if (record.recordType !== '02') {
      return {
        lineNumber: record.lineNumber,
        recordType: record.recordType,
        isValid: true,
        errors: [],
        warnings: [],
        fieldResults: [],
        duration: performance.now() - startTime,
      }
    }

    // Add parser-level errors
    for (const error of record.errors) {
      errors.push({
        code: error.code,
        severity: error.severity === 'error' ? 'error' : 'warning',
        message: error.message,
        field: error.field,
        lineNumber: record.lineNumber,
        reference: error.reference,
      })
    }

    // Add parser-level warnings
    for (const warning of record.warnings) {
      warnings.push({
        code: warning.code,
        severity: 'warning',
        message: warning.message,
        field: warning.field,
        lineNumber: record.lineNumber,
        reference: warning.reference,
      })
    }

    // Validate CURP if present
    const curpValue = 'curp' in record ? (record.curp as string) : null
    if (curpValue) {
      const curpResult = this.validateCURPField(curpValue, record.lineNumber)
      fieldResults.push(curpResult)
      errors.push(...curpResult.errors)
      warnings.push(...curpResult.warnings)
    }

    // Validate NSS if present
    const nssValue = 'nss' in record ? (record.nss as string) : null
    if (nssValue) {
      const nssResult = this.validateNSSField(nssValue, record.lineNumber)
      fieldResults.push(nssResult)
      errors.push(...nssResult.errors)
      warnings.push(...nssResult.warnings)

      // REG_013: Cross-validate NSS with CURP birth year (Circular 19-8, Art. 3.2)
      if (curpValue && curpValue.length >= 10 && nssResult.isValid) {
        const curpYear = parseInt(curpValue.substring(4, 6), 10)
        const nssYear = parseInt(nssValue.substring(2, 4), 10)
        // Year from CURP and NSS should be close (NSS year is registration year)
        // Allow some flexibility as NSS registration can be years after birth
        const yearDiff = Math.abs(curpYear - nssYear)
        if (yearDiff > 50) {
          warnings.push(this.createRecordError('REG_013', {
            lineNumber: record.lineNumber,
            value: `CURP año: ${curpYear}, NSS año: ${nssYear}`,
            description: 'El año derivado del CURP y NSS difieren significativamente',
          }))
        }
      }
    }

    // Validate RFC if present
    if ('companyRFC' in record && record.companyRFC) {
      const rfcResult = this.validateRFCField(record.companyRFC as string, record.lineNumber)
      fieldResults.push(rfcResult)
      errors.push(...rfcResult.errors)
      warnings.push(...rfcResult.warnings)
    }

    // Validate account if present
    if ('account' in record && record.account) {
      const accountResult = this.validateAccountField(record.account as string, record.lineNumber)
      fieldResults.push(accountResult)
      errors.push(...accountResult.errors)
      warnings.push(...accountResult.warnings)
    }

    // Validate amount if present
    if ('amount' in record) {
      const amountResult = this.validateAmountField(record.amount as number, record.lineNumber)
      fieldResults.push(amountResult)
      errors.push(...amountResult.errors)
      warnings.push(...amountResult.warnings)
    }

    // Validate movement type if present
    if ('movementType' in record && record.movementType) {
      const movementResult = this.validateMovementTypeField(
        record.movementType as string,
        fileType,
        record.lineNumber
      )
      fieldResults.push(movementResult)
      errors.push(...movementResult.errors)
      warnings.push(...movementResult.warnings)
    }

    // Validate date if present
    if ('date' in record && record.date) {
      const dateResult = this.validateDateField(record.date as string, record.lineNumber)
      fieldResults.push(dateResult)
      errors.push(...dateResult.errors)
      warnings.push(...dateResult.warnings)
    }

    // Validate employee name if present
    const employeeName = 'employeeName' in record ? (record.employeeName as string) : null
    if (employeeName !== undefined && employeeName !== null) {
      const nameResult = this.validateNameField(employeeName, record.lineNumber)
      fieldResults.push(nameResult)
      errors.push(...nameResult.errors)
      warnings.push(...nameResult.warnings)

      // REG_073: Cross-validate name initials with CURP (Circular 19-8, Art. 3.2.4)
      if (curpValue && curpValue.length >= 4 && employeeName.trim().length >= 2) {
        const curpInitials = curpValue.substring(0, 4).toUpperCase()
        const nameParts = employeeName.trim().toUpperCase().split(/\s+/)

        // Extract expected initials from name (first letter of each word)
        // CURP format: APELLIDO1[0] + APELLIDO1[vocal] + APELLIDO2[0] + NOMBRE[0]
        if (nameParts.length >= 2) {
          const firstLetter = nameParts[0]?.[0] || ''
          const lastLetter = nameParts[nameParts.length - 1]?.[0] || ''

          // Check if first letter of CURP matches first letter of first name or last name
          const matchesFirst = curpInitials[0] === firstLetter || curpInitials[3] === firstLetter
          const matchesLast = curpInitials[0] === lastLetter || curpInitials[3] === lastLetter

          if (!matchesFirst && !matchesLast) {
            warnings.push(this.createRecordError('REG_073', {
              lineNumber: record.lineNumber,
              value: `CURP: ${curpInitials}, Nombre: ${nameParts.slice(0, 2).join(' ')}`,
              description: 'Las iniciales del CURP no coinciden con el nombre registrado',
            }))
          }
        }
      }
    }

    return {
      lineNumber: record.lineNumber,
      recordType: record.recordType,
      isValid: errors.length === 0,
      errors: this.options.skipWarnings ? errors : errors,
      warnings: this.options.skipWarnings ? [] : warnings,
      fieldResults,
      duration: performance.now() - startTime,
    }
  }

  /**
   * Validate CURP field
   */
  private validateCURPField(curp: string, lineNumber: number): FieldValidationResult {
    const errors: ValidationErrorDetail[] = []
    const warnings: ValidationErrorDetail[] = []

    if (!curp || curp.trim().length === 0) {
      errors.push(this.createRecordError('REG_001', { lineNumber, value: curp }))
    } else {
      const result = validateCURP(curp)

      for (const error of result.errors) {
        errors.push(this.createRecordError('REG_001', {
          message: error,
          field: 'curp',
          lineNumber,
          value: curp,
        }))
      }

      for (const warning of result.warnings) {
        warnings.push(this.createRecordError('REG_004', {
          severity: 'warning',
          message: warning,
          field: 'curp',
          lineNumber,
          value: curp,
        }))
      }
    }

    return {
      field: 'curp',
      value: curp,
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validate NSS field
   */
  private validateNSSField(nss: string, lineNumber: number): FieldValidationResult {
    const errors: ValidationErrorDetail[] = []
    const warnings: ValidationErrorDetail[] = []

    if (!nss || nss.trim().length === 0) {
      errors.push(this.createRecordError('REG_010', { lineNumber, value: nss }))
    } else {
      const result = validateNSS(nss)

      for (const error of result.errors) {
        errors.push(this.createRecordError('REG_010', {
          message: error,
          field: 'nss',
          lineNumber,
          value: nss,
        }))
      }

      for (const warning of result.warnings) {
        warnings.push(this.createRecordError('REG_013', {
          severity: 'warning',
          message: warning,
          field: 'nss',
          lineNumber,
          value: nss,
        }))
      }
    }

    return {
      field: 'nss',
      value: nss,
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validate RFC field
   */
  private validateRFCField(rfc: string, lineNumber: number): FieldValidationResult {
    const errors: ValidationErrorDetail[] = []
    const warnings: ValidationErrorDetail[] = []

    if (!rfc || rfc.trim().length === 0) {
      errors.push(this.createRecordError('REG_020', { lineNumber, value: rfc }))
    } else {
      const result = validateRFC(rfc)

      for (const error of result.errors) {
        errors.push(this.createRecordError('REG_020', {
          message: error,
          field: 'rfc',
          lineNumber,
          value: rfc,
        }))
      }

      for (const warning of result.warnings) {
        warnings.push(this.createRecordError('REG_021', {
          severity: 'warning',
          message: warning,
          field: 'rfc',
          lineNumber,
          value: rfc,
        }))
      }
    }

    return {
      field: 'rfc',
      value: rfc,
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validate account field
   */
  private validateAccountField(account: string, lineNumber: number): FieldValidationResult {
    const errors: ValidationErrorDetail[] = []
    const warnings: ValidationErrorDetail[] = []

    if (!account || account.trim().length === 0) {
      errors.push(this.createRecordError('REG_030', { lineNumber, value: account }))
    } else if (!/^\d{11}$/.test(account.trim())) {
      errors.push(this.createRecordError('REG_030', {
        lineNumber,
        value: account,
        expectedValue: '11 dígitos numéricos',
      }))
    }

    return {
      field: 'account',
      value: account,
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validate amount field
   */
  private validateAmountField(amount: number, lineNumber: number): FieldValidationResult {
    const errors: ValidationErrorDetail[] = []
    const warnings: ValidationErrorDetail[] = []

    if (typeof amount !== 'number' || isNaN(amount)) {
      errors.push(this.createRecordError('REG_040', { lineNumber, value: String(amount) }))
    } else if (amount <= 0) {
      errors.push(this.createRecordError('REG_041', { lineNumber, value: String(amount) }))
    } else if (amount > 99999999999) {
      // Max 9 digits in cents = 99,999,999.99
      errors.push(this.createRecordError('REG_043', { lineNumber, value: String(amount) }))
    }

    // Warning for unusually large amounts
    if (amount > 10000000) {
      // > $100,000
      warnings.push(this.createRecordError('REG_042', {
        severity: 'warning',
        lineNumber,
        value: String(amount / 100),
      }))
    }

    return {
      field: 'amount',
      value: amount,
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validate movement type field
   */
  private validateMovementTypeField(
    movementType: string,
    fileType: CONSARFileType,
    lineNumber: number
  ): FieldValidationResult {
    const errors: ValidationErrorDetail[] = []
    const warnings: ValidationErrorDetail[] = []

    if (!isValidMovementType(movementType, fileType)) {
      errors.push(this.createRecordError('REG_060', { lineNumber, value: movementType }))
    }

    return {
      field: 'movementType',
      value: movementType,
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validate date field
   */
  private validateDateField(date: string, lineNumber: number): FieldValidationResult {
    const errors: ValidationErrorDetail[] = []
    const warnings: ValidationErrorDetail[] = []

    if (!date || date.trim().length === 0) {
      errors.push(this.createRecordError('REG_050', { lineNumber, value: date }))
      return { field: 'date', value: date, isValid: false, errors, warnings }
    }

    // Check format
    if (!/^\d{8}$/.test(date)) {
      errors.push(this.createRecordError('REG_050', { lineNumber, value: date }))
      return { field: 'date', value: date, isValid: false, errors, warnings }
    }

    const year = parseInt(date.substring(0, 4), 10)
    const month = parseInt(date.substring(4, 6), 10)
    const day = parseInt(date.substring(6, 8), 10)

    // Validate month
    if (month < 1 || month > 12) {
      errors.push(this.createRecordError('REG_053', { lineNumber, value: month.toString() }))
    }

    // Validate day
    const daysInMonth = new Date(year, month, 0).getDate()
    if (day < 1 || day > daysInMonth) {
      errors.push(this.createRecordError('REG_054', { lineNumber, value: day.toString() }))
    }

    // Check for future date
    const dateObj = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dateObj > today) {
      errors.push(this.createRecordError('REG_051', { lineNumber, value: date }))
    }

    // Check for very old date (before SAR)
    if (year < 1997) {
      warnings.push(this.createRecordError('REG_052', { severity: 'warning', lineNumber, value: date }))
    }

    return {
      field: 'date',
      value: date,
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validate name field
   */
  private validateNameField(name: string, lineNumber: number): FieldValidationResult {
    const errors: ValidationErrorDetail[] = []
    const warnings: ValidationErrorDetail[] = []

    if (!name || name.trim().length === 0) {
      errors.push(this.createRecordError('REG_070', { lineNumber, value: name }))
    } else {
      const trimmed = name.trim()

      if (trimmed.length < 5) {
        warnings.push(this.createRecordError('REG_071', { severity: 'warning', lineNumber, value: name }))
      }

      // Check for invalid characters
      if (!/^[A-ZÁÉÍÓÚÑ\s]+$/i.test(trimmed)) {
        warnings.push(this.createRecordError('REG_072', { severity: 'warning', lineNumber, value: name }))
      }
    }

    return {
      field: 'employeeName',
      value: name,
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validate cross-references between records
   */
  private validateCrossReferences(result: FileValidationResult): ValidationErrorDetail[] {
    const errors: ValidationErrorDetail[] = []

    if (!result.parsedFile) return errors

    // Check for duplicate NSS
    const nssMap = new Map<string, number[]>()
    for (const record of result.parsedFile.records) {
      if ('nss' in record && record.nss && record.recordType === '02') {
        const nss = record.nss as string
        if (!nssMap.has(nss)) {
          nssMap.set(nss, [])
        }
        nssMap.get(nss)!.push(record.lineNumber)
      }
    }

    nssMap.forEach((lines, nss) => {
      if (lines.length > 1) {
        errors.push({
          code: 'REG_061',
          severity: 'warning',
          message: `NSS ${nss} aparece ${lines.length} veces en líneas: ${lines.join(', ')}`,
          field: 'nss',
          value: nss,
        })
      }
    })

    // Validate AFORE code in header
    const header = result.parsedFile.records.find(r => r.recordType === '01')
    if (header && 'afore' in header) {
      const aforeCode = header.afore as string
      if (aforeCode && !isValidAFORECode(aforeCode)) {
        errors.push(this.createBatchError('LOTE_009', { value: aforeCode }))
      }
    }

    return errors
  }

  /**
   * Convert parser error to validation error detail
   */
  private convertParserError(error: ParserValidationError): ValidationErrorDetail {
    return {
      code: error.code,
      severity: error.severity === 'error' ? 'error' : error.severity === 'warning' ? 'warning' : 'info',
      message: error.message,
      field: error.field,
      position: error.position,
      reference: error.reference,
    }
  }

  /**
   * Create empty summary
   */
  private createEmptySummary(): ValidationSummary {
    return {
      totalRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      warningRecords: 0,
      totalErrors: 0,
      totalWarnings: 0,
      errorsByCategory: {},
      errorsBySeverity: { critical: 0, error: 0, warning: 0, info: 0 },
      complianceScore: 100,
    }
  }

  /**
   * Update progress
   */
  private updateProgress(
    phase: ValidationProgress['phase'],
    percentComplete: number,
    message: string,
    recordsProcessed?: number,
    totalRecords?: number
  ): void {
    this.progress = {
      phase,
      percentComplete,
      recordsProcessed: recordsProcessed ?? this.progress.recordsProcessed,
      totalRecords: totalRecords ?? this.progress.totalRecords,
      currentMessage: message,
      errorsFound: this.progress.errorsFound,
      warningsFound: this.progress.warningsFound,
    }
    this.options.progressCallback(this.progress)
  }

  /**
   * Finalize result with calculated metrics
   */
  private finalizeResult(
    result: FileValidationResult,
    startTime: number
  ): FileValidationResult {
    result.performance.totalTime = performance.now() - startTime

    // Calculate records per second
    if (result.summary.totalRecords > 0 && result.performance.validationTime > 0) {
      result.performance.recordsPerSecond =
        (result.summary.totalRecords / result.performance.validationTime) * 1000
      result.performance.averageRecordTime =
        result.performance.validationTime / result.summary.totalRecords
    }

    // Calculate compliance score
    if (result.summary.totalRecords > 0) {
      result.summary.complianceScore =
        (result.summary.validRecords / result.summary.totalRecords) * 100
    }

    // Add batch errors to totals
    result.summary.totalErrors += result.batchErrors.filter(
      e => e.severity === 'error' || e.severity === 'critical'
    ).length
    result.summary.totalWarnings += result.batchErrors.filter(
      e => e.severity === 'warning'
    ).length

    // Count errors by severity
    for (const error of result.batchErrors) {
      result.summary.errorsBySeverity[error.severity]++
    }

    for (const recordResult of result.recordResults) {
      for (const error of recordResult.errors) {
        result.summary.errorsBySeverity[error.severity]++
      }
      for (const warning of recordResult.warnings) {
        result.summary.errorsBySeverity[warning.severity]++
      }
    }

    // Determine overall status
    const hasCritical = result.summary.errorsBySeverity.critical > 0
    const hasErrors = result.summary.errorsBySeverity.error > 0
    const hasWarnings = result.summary.errorsBySeverity.warning > 0

    if (hasCritical || hasErrors) {
      result.overallStatus = 'failed'
      result.isValid = false
      result.isCompliant = false
    } else if (hasWarnings) {
      result.overallStatus = 'warning'
      result.isValid = true
      result.isCompliant = result.summary.complianceScore >= 98
    } else {
      result.overallStatus = 'passed'
      result.isValid = true
      result.isCompliant = true
    }

    return result
  }
}

// ============================================
// CONVENIENCE FUNCTION
// ============================================

/**
 * Quick validation function
 */
export async function validateCONSARFile(
  file: File,
  fileType: CONSARFileType,
  options?: ValidationOptions
): Promise<FileValidationResult> {
  const engine = new ValidationEngine(options)
  return engine.validateFile(file, fileType)
}

export default ValidationEngine
