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
 */
export const ALLOWED_EXTENSIONS = ['.txt', '.csv', '.dat'] as const

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
 * Format: YYYYMMDD_TYPE_ACCOUNT_FOLIO.ext
 */
export const CONSAR_FILE_NAME_PATTERN =
  /^\d{8}_[A-Z]+_[A-Z0-9]+_\d{4,6}\.(txt|csv|dat)$/i

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

  // Check extension
  if (!ALLOWED_EXTENSIONS.includes(extension as any)) {
    return {
      isValid: false,
      error: `Formato de archivo no permitido. Use solo: ${ALLOWED_EXTENSIONS.join(', ')}`,
      errorCode: 'INVALID_EXTENSION',
      details: {
        providedExtension: extension,
        allowedExtensions: ALLOWED_EXTENSIONS,
      },
    }
  }

  // Check MIME type
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type as any)) {
    // Some browsers don't set MIME type correctly for .dat files, so we allow it
    if (extension !== '.dat') {
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

  // Check against CONSAR pattern
  if (!CONSAR_FILE_NAME_PATTERN.test(baseName)) {
    return {
      isValid: false,
      error: 'El nombre del archivo no cumple con el formato CONSAR. Formato esperado: YYYYMMDD_TIPO_CUENTA_FOLIO.ext',
      errorCode: 'INVALID_CONSAR_FORMAT',
      details: {
        providedName: baseName,
        expectedPattern: 'YYYYMMDD_TIPO_CUENTA_FOLIO.ext',
        example: '20250115_SB_1101_001980.txt',
      },
    }
  }

  // Extract and validate date portion
  const datePart = baseName.substring(0, 8)
  if (!isValidCONSARDate(datePart)) {
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

  return { isValid: true }
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
 * Validate file content structure (for text files)
 * Checks if file has correct number of characters per line (77 for CONSAR)
 *
 * @param content - File content as string
 * @returns Validation result
 */
export const validateFileContent = async (file: File): Promise<ValidationResult> => {
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

    // CONSAR files should have 77 characters per line (positional format)
    const invalidLines: number[] = []
    nonEmptyLines.forEach((line, index) => {
      if (line.length !== 77) {
        invalidLines.push(index + 1)
      }
    })

    if (invalidLines.length > 0) {
      return {
        isValid: false,
        error: `El archivo contiene líneas con longitud incorrecta. CONSAR requiere exactamente 77 caracteres por línea.`,
        errorCode: 'INVALID_LINE_LENGTH',
        details: {
          totalLines: nonEmptyLines.length,
          invalidLines: invalidLines.slice(0, 10), // Show first 10 invalid lines
          invalidLineCount: invalidLines.length,
          expectedLength: 77,
        },
      }
    }

    return {
      isValid: true,
      details: {
        lineCount: nonEmptyLines.length,
        characterCount: content.length,
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
 * Detect file type from file name
 *
 * @param fileName - File name to analyze
 * @returns FileType or null
 */
export const detectFileType = (fileName: string): FileType | null => {
  const upperName = fileName.toUpperCase()

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

  // Try to detect from account code
  for (const code of VALID_ACCOUNT_CODES) {
    if (upperName.includes(code)) {
      return 'CONTABLE'
    }
  }

  return null
}

/**
 * Extract metadata from CONSAR file name
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
  const match = baseName.match(/^(\d{8})_([A-Z]+)_([A-Z0-9]+)_(\d{4,6})\.(\w+)$/i)

  if (!match) {
    return null
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
