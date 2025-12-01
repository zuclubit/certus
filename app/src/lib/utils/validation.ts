/**
 * Validation Utilities for CONSAR Files
 *
 * Implements validation rules compliant with CONSAR regulations
 * - File type validation
 * - File size validation
 * - File name format validation
 * - Content validation (CONSAR-specific)
 *
 * @version 1.0.0
 * @compliance CONSAR Circular 19-8, 19-1
 */

import type { FileType } from '@/lib/constants'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Allowed MIME types for CONSAR files
 */
export const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/csv',
  'application/octet-stream', // For .dat files
  'application/vnd.ms-excel', // Sometimes .csv files have this MIME type
] as const

/**
 * Allowed file extensions for CONSAR files
 * Based on Circular CONSAR 19-8 and backend ConsarFileType enum
 *
 * Categories:
 * - Legacy: .txt, .csv, .dat
 * - SAR Operations: .0100-.0700
 * - SIEFORE Portfolio: .0300-.0321
 * - Reconciliation: .1101
 * - Packages: .zip, .gpg
 */
export const ALLOWED_EXTENSIONS = [
  // Legacy formats
  '.txt', '.csv', '.dat',

  // SAR Operational files (Circular 19-8)
  '.0100', // Nómina - Aportaciones patronales
  '.0200', // Contable - Movimientos contables SIEFORES
  '.0300', // Cartera SIEFORE - Portafolio de inversiones
  '.0314', // Derivados - Posiciones en derivados financieros
  '.0316', // Confirmaciones - Confirmaciones de operaciones
  '.0317', // Control Cartera - Control/Resumen de cartera
  '.0321', // Fondos BMRPREV - Información fondos BMRPREV
  '.0400', // Regularización - Correcciones y ajustes
  '.0500', // Retiros - Solicitudes de retiro
  '.0600', // Traspasos - Solicitudes de traspaso entre AFOREs
  '.0700', // Aportaciones Voluntarias

  // Reconciliation files
  '.1101', // Totales Conciliación - Totales y conciliación

  // Package files
  '.zip',  // Paquete ZIP comprimido
  '.gpg',  // Archivo cifrado GPG
] as const

/**
 * CONSAR file type mappings (extension -> file type code)
 */
export const CONSAR_EXTENSION_MAP: Record<string, { code: number; name: string; description: string }> = {
  '.0100': { code: 100, name: 'Nomina', description: 'Archivo de Nómina - Aportaciones patronales' },
  '.0200': { code: 200, name: 'Contable', description: 'Archivo Contable - Movimientos contables SIEFORES' },
  '.0300': { code: 300, name: 'CarteraSiefore', description: 'Cartera de Inversión SIEFORE' },
  '.0314': { code: 314, name: 'Derivados', description: 'Posiciones en Derivados Financieros' },
  '.0316': { code: 316, name: 'Confirmaciones', description: 'Confirmaciones de Operaciones' },
  '.0317': { code: 317, name: 'ControlCartera', description: 'Control/Resumen de Cartera' },
  '.0321': { code: 321, name: 'FondosBmrprev', description: 'Información de Fondos BMRPREV' },
  '.0400': { code: 400, name: 'Regularizacion', description: 'Archivo de Regularización' },
  '.0500': { code: 500, name: 'Retiros', description: 'Archivo de Retiros' },
  '.0600': { code: 600, name: 'Traspasos', description: 'Archivo de Traspasos' },
  '.0700': { code: 700, name: 'AportacionesVoluntarias', description: 'Aportaciones Voluntarias' },
  '.1101': { code: 1101, name: 'TotalesConciliacion', description: 'Totales y Conciliación' },
}

/**
 * Subcuenta prefixes (from CONSAR file naming convention)
 */
export const CONSAR_SUBCUENTA_PREFIXES = {
  PS: { code: 1, name: 'Pensiones', description: 'SIEFORE Principal' },
  SB: { code: 2, name: 'SubcuentaBasica', description: 'Subcuenta Básica' },
  SA: { code: 3, name: 'SubcuentaAhorro', description: 'Subcuenta de Ahorro' },
  SV: { code: 4, name: 'SubcuentaVivienda', description: 'Subcuenta de Vivienda' },
} as const

/**
 * Regex to validate CONSAR numeric extensions (.NNNN format)
 */
export const CONSAR_NUMERIC_EXTENSION_PATTERN = /^\.\d{4}$/

/**
 * Maximum file size in bytes (50MB)
 * CONSAR files typically range from 100KB to 15MB
 */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB

/**
 * Minimum file size in bytes (1KB)
 * Files smaller than this are likely empty or corrupted
 */
export const MIN_FILE_SIZE_BYTES = 1024 // 1KB

/**
 * CONSAR file name patterns
 *
 * Supported formats:
 * 1. TIPO_RFC_YYYYMMDD_SECUENCIA.ext (e.g., NOMINA_ABC123456789_20250115_0001.txt)
 * 2. YYYYMMDD_TIPO_CUENTA_FOLIO.ext (e.g., 20250115_SB_1101_001980.txt)
 * 3. YYYYMMDD_TIPO_CUENTA_FOLIO.NNNN (e.g., 20251127_SB_530_001000.1101) - CONSAR numeric extensions
 * 4. Simple: TIPO_YYYYMMDD.ext (e.g., CONTABLE_20250115.txt)
 */
export const CONSAR_FILE_NAME_PATTERNS = [
  // Pattern 1: TIPO_RFC_YYYYMMDD_SECUENCIA.ext (most common)
  /^(NOMINA|CONTABLE|REGULARIZACION)_[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}_\d{8}_\d{4}\.(txt|csv|dat|\d{4})$/i,
  // Pattern 2: YYYYMMDD_TIPO_CUENTA_FOLIO.ext (text extensions)
  /^\d{8}_[A-Z]+_[A-Z0-9]+_[\d-]+\.(txt|csv|dat)$/i,
  // Pattern 3: YYYYMMDD_TIPO_CUENTA_FOLIO.NNNN (CONSAR numeric extensions like .1101)
  // Allows hyphens in folio (e.g., 20251127_PS_430_000010-2.0300)
  /^\d{8}_[A-Z]+_\d+_[\d-]+\.\d{4}$/i,
  // Pattern 4: Simple TIPO_YYYYMMDD.ext
  /^(NOMINA|CONTABLE|REGULARIZACION|REG|NOM|CONT)_\d{8}\.(txt|csv|dat|\d{4})$/i,
  // Pattern 5: Legacy YYYYMMDD_*.ext (any extension including numeric)
  /^\d{8}_.*\.(txt|csv|dat|\d{4})$/i,
] as const

// Backwards compatibility
export const CONSAR_FILE_NAME_PATTERN = CONSAR_FILE_NAME_PATTERNS[1]

/**
 * Valid CONSAR account codes
 */
export const VALID_ACCOUNT_CODES = [
  '1101', // Balanza de comprobación principal
  '1103', // Movimientos de divisas
  '7115', // Conversión de divisas a pesos
  '5401', // Inversiones en valores
  '2301', // Pasivos y obligaciones
] as const

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
  errorCode?: string
  details?: Record<string, unknown>
}

/**
 * Validate file type (MIME type and extension)
 *
 * @param file - File to validate
 * @returns Validation result
 */
export const validateFileType = (file: File): ValidationResult => {
  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: 'No se ha proporcionado ningún archivo',
      errorCode: 'FILE_NOT_PROVIDED',
    }
  }

  // Extract file extension
  const fileName = file.name.toLowerCase()
  const extension = fileName.substring(fileName.lastIndexOf('.'))

  // Check extension - allow listed extensions OR CONSAR numeric extensions (.NNNN)
  const isAllowedExtension = ALLOWED_EXTENSIONS.includes(extension as any) ||
    CONSAR_NUMERIC_EXTENSION_PATTERN.test(extension)

  if (!isAllowedExtension) {
    return {
      isValid: false,
      error: `Formato de archivo no permitido. Use: .txt, .csv, .dat o extensiones numéricas CONSAR (.1101, .1102, etc.)`,
      errorCode: 'INVALID_EXTENSION',
      details: {
        providedExtension: extension,
        allowedExtensions: [...ALLOWED_EXTENSIONS, '.NNNN (extensiones numéricas CONSAR)'],
      },
    }
  }

  // Check MIME type - skip for numeric extensions and .dat files (browser doesn't recognize them)
  const isNumericExtension = CONSAR_NUMERIC_EXTENSION_PATTERN.test(extension)
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type as any)) {
    // Skip MIME type check for .dat files and CONSAR numeric extensions
    if (extension !== '.dat' && !isNumericExtension) {
      return {
        isValid: false,
        error: 'Tipo MIME de archivo no permitido',
        errorCode: 'INVALID_MIME_TYPE',
        details: {
          providedMimeType: file.type,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
        },
      }
    }
  }

  return { isValid: true }
}

/**
 * Validate file size
 *
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB (default: 50)
 * @returns Validation result
 */
export const validateFileSize = (file: File, maxSizeMB: number = 50): ValidationResult => {
  if (!file) {
    return {
      isValid: false,
      error: 'No se ha proporcionado ningún archivo',
      errorCode: 'FILE_NOT_PROVIDED',
    }
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  // Check minimum size
  if (file.size < MIN_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `El archivo es demasiado pequeño (${formatFileSize(file.size)}). Tamaño mínimo: ${formatFileSize(MIN_FILE_SIZE_BYTES)}`,
      errorCode: 'FILE_TOO_SMALL',
      details: {
        fileSize: file.size,
        minSize: MIN_FILE_SIZE_BYTES,
      },
    }
  }

  // Check maximum size
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `El archivo excede el tamaño máximo permitido (${formatFileSize(file.size)} > ${formatFileSize(maxSizeBytes)})`,
      errorCode: 'FILE_TOO_LARGE',
      details: {
        fileSize: file.size,
        maxSize: maxSizeBytes,
      },
    }
  }

  return { isValid: true }
}

/**
 * Validate CONSAR file name format
 *
 * Supports multiple CONSAR file naming conventions:
 * 1. TIPO_RFC_YYYYMMDD_SECUENCIA.ext
 * 2. YYYYMMDD_TIPO_CUENTA_FOLIO.ext
 * 3. TIPO_YYYYMMDD.ext
 *
 * @param fileName - File name to validate
 * @returns Validation result
 */
export const validateCONSARFileName = (fileName: string): ValidationResult => {
  if (!fileName || typeof fileName !== 'string') {
    return {
      isValid: false,
      error: 'Nombre de archivo inválido',
      errorCode: 'INVALID_FILE_NAME',
    }
  }

  // Remove path if present
  const baseName = fileName.split('/').pop() || fileName

  // Check against all CONSAR patterns
  const matchedPattern = CONSAR_FILE_NAME_PATTERNS.find((pattern) => pattern.test(baseName))

  if (!matchedPattern) {
    return {
      isValid: false,
      error: 'El nombre del archivo no cumple con ningún formato CONSAR válido.',
      errorCode: 'INVALID_CONSAR_FORMAT',
      details: {
        providedName: baseName,
        expectedPatterns: [
          'TIPO_RFC_YYYYMMDD_SECUENCIA.ext (ej: NOMINA_ABC123456789_20250115_0001.txt)',
          'YYYYMMDD_TIPO_CUENTA_FOLIO.ext (ej: 20250115_SB_1101_001980.txt)',
          'TIPO_YYYYMMDD.ext (ej: CONTABLE_20250115.txt)',
        ],
      },
    }
  }

  // Extract date from different patterns
  let datePart: string | null = null

  // Pattern 1: TIPO_RFC_YYYYMMDD_SECUENCIA.ext - date is in 3rd position
  const pattern1Match = baseName.match(/^[A-Z]+_[A-Z0-9]+_(\d{8})_\d+\.\w+$/i)
  if (pattern1Match && pattern1Match[1]) {
    datePart = pattern1Match[1]
  }

  // Pattern 2 & 4: YYYYMMDD_*.ext - date is at the beginning
  if (!datePart && /^\d{8}/.test(baseName)) {
    datePart = baseName.substring(0, 8)
  }

  // Pattern 3: TIPO_YYYYMMDD.ext - date is after underscore
  const pattern3Match = baseName.match(/^[A-Z]+_(\d{8})\.\w+$/i)
  if (!datePart && pattern3Match && pattern3Match[1]) {
    datePart = pattern3Match[1]
  }

  // Validate date if found
  if (datePart && !isValidCONSARDate(datePart)) {
    return {
      isValid: false,
      error: `La fecha en el nombre del archivo (${datePart}) no es válida. Use formato YYYYMMDD`,
      errorCode: 'INVALID_DATE_FORMAT',
      details: {
        providedDate: datePart,
        expectedFormat: 'YYYYMMDD',
      },
    }
  }

  return {
    isValid: true,
    details: {
      matchedPattern: matchedPattern.source,
      extractedDate: datePart,
    },
  }
}

/**
 * Validate CONSAR date format (YYYYMMDD)
 *
 * @param dateStr - Date string to validate
 * @returns true if valid CONSAR date
 */
export const isValidCONSARDate = (dateStr: string): boolean => {
  if (!dateStr || dateStr.length !== 8) {
    return false
  }

  const year = parseInt(dateStr.substring(0, 4), 10)
  const month = parseInt(dateStr.substring(4, 6), 10)
  const day = parseInt(dateStr.substring(6, 8), 10)

  // Check year range (2020-2030 is reasonable)
  if (year < 2020 || year > 2030) {
    return false
  }

  // Check month range
  if (month < 1 || month > 12) {
    return false
  }

  // Check day range
  if (day < 1 || day > 31) {
    return false
  }

  // Validate actual date
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

/**
 * Validate complete file (type, size, name)
 *
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result
 */
export const validateFile = (
  file: File,
  options: {
    checkFileName?: boolean
    maxSizeMB?: number
  } = {}
): ValidationResult => {
  const { checkFileName = true, maxSizeMB = 50 } = options

  // Validate file type
  const typeResult = validateFileType(file)
  if (!typeResult.isValid) {
    return typeResult
  }

  // Validate file size
  const sizeResult = validateFileSize(file, maxSizeMB)
  if (!sizeResult.isValid) {
    return sizeResult
  }

  // Validate file name (optional)
  if (checkFileName) {
    const nameResult = validateCONSARFileName(file.name)
    if (!nameResult.isValid) {
      return nameResult
    }
  }

  return { isValid: true }
}

/**
 * Validate multiple files
 *
 * @param files - Files to validate
 * @param options - Validation options
 * @returns Validation results for each file
 */
export const validateFiles = (
  files: File[],
  options?: {
    checkFileName?: boolean
    maxSizeMB?: number
    maxFiles?: number
  }
): { file: File; result: ValidationResult }[] => {
  const { maxFiles = 10 } = options || {}

  // Check max files limit
  if (files.length > maxFiles) {
    const errorResult: ValidationResult = {
      isValid: false,
      error: `Número máximo de archivos excedido (${files.length} > ${maxFiles})`,
      errorCode: 'TOO_MANY_FILES',
      details: {
        providedCount: files.length,
        maxCount: maxFiles,
      },
    }

    return files.map((file) => ({ file, result: errorResult }))
  }

  return files.map((file) => ({
    file,
    result: validateFile(file, options),
  }))
}

/**
 * Line lengths per CONSAR file type by extension
 * Based on Circular 19-8 and backend schema definitions
 *
 * Note: Different record types (01 header, 02 detail, 03 footer) may have different lengths.
 * Line length validation is skipped for CONSAR numeric extension files (.0XXX)
 * as the backend performs comprehensive validation.
 */
export const CONSAR_LINE_LENGTHS: Record<string, number | null> = {
  // Legacy text file types (strict validation)
  NOMINA: 100,       // Detail records end at position 100
  CONTABLE: 115,     // Detail records end at position 115
  REGULARIZACION: 77, // Standard CONSAR format
  DEFAULT: null,     // null = skip validation (let backend handle it)

  // CONSAR numeric extensions - variable line lengths, skip client-side validation
  '.0100': null,     // Nómina - variable structure
  '.0200': null,     // Contable - variable structure
  '.0300': null,     // Cartera SIEFORE - variable structure
  '.0314': null,     // Derivados - variable structure
  '.0316': null,     // Confirmaciones - variable structure
  '.0317': null,     // Control Cartera - variable structure
  '.0321': null,     // Fondos BMRPREV - variable structure
  '.0400': null,     // Regularización - variable structure
  '.0500': null,     // Retiros - variable structure
  '.0600': null,     // Traspasos - variable structure
  '.0700': null,     // Aportaciones Voluntarias - variable structure
  '.1101': null,     // Totales Conciliación - variable structure
}

/**
 * Validate file content structure (for text files)
 * Checks if file has correct number of characters per line based on file type
 *
 * For CONSAR files with numeric extensions (.0XXX), line length validation
 * is skipped and delegated to the backend for comprehensive validation.
 *
 * @param file - File to validate
 * @param fileType - Optional file type to determine expected line length
 * @returns Validation result
 */
export const validateFileContent = async (
  file: File,
  fileType?: FileType
): Promise<ValidationResult> => {
  try {
    const content = await readFileAsText(file)

    // Split into lines
    const lines = content.split(/\r?\n/)

    // Filter out empty lines at the end
    const nonEmptyLines = lines.filter((line, index) => {
      // Allow last line to be empty
      if (index === lines.length - 1) {
        return line.trim().length > 0
      }
      return true
    })

    // Check if file has any content
    if (nonEmptyLines.length === 0) {
      return {
        isValid: false,
        error: 'El archivo está vacío',
        errorCode: 'EMPTY_FILE',
      }
    }

    // Get file extension for lookup
    const fileName = file.name.toLowerCase()
    const extension = fileName.substring(fileName.lastIndexOf('.'))

    // Check if this is a CONSAR numeric extension file
    const isConsarNumericExtension = CONSAR_NUMERIC_EXTENSION_PATTERN.test(extension)

    // Look up expected line length - first by extension, then by file type
    let expectedLength: number | null = null
    if (isConsarNumericExtension) {
      // CONSAR numeric extension files - check extension-specific config
      expectedLength = CONSAR_LINE_LENGTHS[extension] ?? null
    } else {
      // Legacy text files - check by file type
      const detectedType = fileType || detectFileType(file.name)
      if (detectedType) {
        expectedLength = CONSAR_LINE_LENGTHS[detectedType] ?? null
      }
    }

    // Skip line length validation for CONSAR files with variable structure
    // Backend will perform comprehensive validation
    if (expectedLength === null) {
      return {
        isValid: true,
        details: {
          lineCount: nonEmptyLines.length,
          characterCount: content.length,
          detectedType: fileType || detectFileType(file.name) || 'CONSAR',
          validationSkipped: true,
          reason: 'Line length validation delegated to backend for CONSAR files',
        },
      }
    }

    // Validate line lengths for legacy text files
    const invalidLines: { line: number; length: number }[] = []
    const validLengths: number[] = [expectedLength, 77] // Accept both specific length and standard 77

    nonEmptyLines.forEach((line, index) => {
      const lineLength = line.length
      // Allow lines within 5% tolerance or exact match for known lengths
      const isValidLength = validLengths.some((len: number) => {
        return lineLength === len || (lineLength >= len - 5 && lineLength <= len + 5)
      })

      if (!isValidLength && lineLength > 0) {
        invalidLines.push({ line: index + 1, length: lineLength })
      }
    })

    // Only report error if more than 10% of lines are invalid
    const errorThreshold = Math.max(1, Math.floor(nonEmptyLines.length * 0.1))

    if (invalidLines.length > errorThreshold) {
      return {
        isValid: false,
        error: `El archivo contiene ${invalidLines.length} líneas con longitud incorrecta. Esperado: ~${expectedLength} caracteres por línea.`,
        errorCode: 'INVALID_LINE_LENGTH',
        details: {
          totalLines: nonEmptyLines.length,
          invalidLines: invalidLines.slice(0, 10),
          invalidLineCount: invalidLines.length,
          expectedLength,
          fileType: fileType || detectFileType(file.name) || 'UNKNOWN',
        },
      }
    }

    return {
      isValid: true,
      details: {
        lineCount: nonEmptyLines.length,
        characterCount: content.length,
        detectedType: fileType || detectFileType(file.name) || 'UNKNOWN',
        expectedLineLength: expectedLength,
      },
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Error al leer el archivo: ${error instanceof Error ? error.message : 'Unknown error'}`,
      errorCode: 'FILE_READ_ERROR',
    }
  }
}

/**
 * Read file as text
 *
 * @param file - File to read
 * @returns Promise<file content as string>
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        resolve(content)
      } else {
        reject(new Error('Failed to read file as text'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Error reading file'))
    }

    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * Format file size for display
 *
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * CONSAR extension to FileType mapping
 * Based on Circular 19-8 file type specifications
 */
export const CONSAR_EXTENSION_TO_FILE_TYPE: Record<string, FileType> = {
  // Nómina - Payroll files
  '.0100': 'NOMINA',

  // Contable - Accounting files
  '.0200': 'CONTABLE',

  // Cartera SIEFORE - Portfolio files (mapped to CONTABLE for processing)
  '.0300': 'CONTABLE',
  '.0314': 'CONTABLE',
  '.0316': 'CONTABLE',
  '.0317': 'CONTABLE',
  '.0321': 'CONTABLE',

  // Regularización - Adjustment files
  '.0400': 'REGULARIZACION',

  // Retiros/Traspasos - Withdrawal and transfer files
  '.0500': 'REGULARIZACION',
  '.0600': 'REGULARIZACION',
  '.0700': 'REGULARIZACION',

  // Conciliación - Reconciliation files
  '.1101': 'CONTABLE',
}

/**
 * Detect file type from file name
 * Priority: 1) CONSAR extension, 2) Keywords in filename, 3) Account codes
 *
 * @param fileName - File name to analyze
 * @returns FileType or null
 */
export const detectFileType = (fileName: string): FileType | null => {
  const lowerName = fileName.toLowerCase()
  const upperName = fileName.toUpperCase()

  // 1. Check CONSAR numeric extension first (most reliable)
  const extension = lowerName.substring(lowerName.lastIndexOf('.'))
  if (CONSAR_NUMERIC_EXTENSION_PATTERN.test(extension)) {
    const mappedType = CONSAR_EXTENSION_TO_FILE_TYPE[extension]
    if (mappedType) {
      return mappedType
    }
  }

  // 2. Check for keywords in filename
  if (upperName.includes('NOMINA') || upperName.includes('APORT')) {
    return 'NOMINA'
  }

  if (upperName.includes('CONTABLE') || upperName.includes('BALANZA')) {
    return 'CONTABLE'
  }

  if (
    upperName.includes('REGULARIZACION') ||
    upperName.includes('AJUSTE') ||
    upperName.includes('CONCI')
  ) {
    return 'REGULARIZACION'
  }

  // 3. Try to detect from account code
  for (const code of VALID_ACCOUNT_CODES) {
    if (upperName.includes(code)) {
      return 'CONTABLE'
    }
  }

  return null
}

/**
 * Get human-readable file type label from extension
 *
 * @param extension - File extension (e.g., '.0300')
 * @returns Human-readable label
 */
export const getFileTypeLabel = (extension: string): string => {
  const mapping = CONSAR_EXTENSION_MAP[extension.toLowerCase()]
  if (mapping) {
    return mapping.name
  }
  return 'Archivo CONSAR'
}

/**
 * Extract metadata from CONSAR file name
 * Supports both text extensions (.txt, .csv) and numeric extensions (.1101, .1102)
 *
 * @param fileName - File name to parse
 * @returns Metadata object or null
 */
export const extractFileMetadata = (
  fileName: string
): {
  date: string
  type: string
  account: string
  folio: string
  extension: string
} | null => {
  const baseName = fileName.split('/').pop() || fileName

  // Pattern for both text and numeric extensions: YYYYMMDD_TYPE_ACCOUNT_FOLIO.EXT
  // Examples: 20251127_SB_530_001000.1101, 20250115_SB_1101_001980.txt
  const match = baseName.match(/^(\d{8})_([A-Z]+)_(\d+)_(\d{4,6})\.(\d{4}|\w+)$/i)

  if (!match || !match[1] || !match[2] || !match[3] || !match[4] || !match[5]) {
    // Try alternate pattern with alphanumeric account
    const altMatch = baseName.match(/^(\d{8})_([A-Z]+)_([A-Z0-9]+)_(\d{4,6})\.(\d{4}|\w+)$/i)
    if (!altMatch || !altMatch[1] || !altMatch[2] || !altMatch[3] || !altMatch[4] || !altMatch[5]) {
      return null
    }
    return {
      date: altMatch[1],
      type: altMatch[2],
      account: altMatch[3],
      folio: altMatch[4],
      extension: altMatch[5],
    }
  }

  return {
    date: match[1],
    type: match[2],
    account: match[3],
    folio: match[4],
    extension: match[5],
  }
}

/**
 * Check if file is a CONSAR file based on name pattern
 *
 * @param fileName - File name to check
 * @returns true if file appears to be a CONSAR file
 */
export const isCONSARFile = (fileName: string): boolean => {
  return validateCONSARFileName(fileName).isValid
}

export default {
  validateFileType,
  validateFileSize,
  validateCONSARFileName,
  validateFile,
  validateFiles,
  validateFileContent,
  isValidCONSARDate,
  readFileAsText,
  formatFileSize,
  detectFileType,
  extractFileMetadata,
  isCONSARFile,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MIN_FILE_SIZE_BYTES,
}
