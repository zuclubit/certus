/**
 * Validations Module - Zod Schemas
 *
 * Validation schemas for form inputs and API requests
 */

import { z } from 'zod'
import { VALIDATION_RULES } from './constants'

// ============================================
// FILE UPLOAD SCHEMAS
// ============================================

/**
 * File type enum schema
 */
export const fileTypeSchema = z.enum(
  ['PROCESAR', 'AFILIADOS', 'TRASPASOS', 'RETIROS', 'APORTACIONES'],
  {
    errorMap: () => ({ message: 'Tipo de archivo CONSAR inválido' }),
  }
)

/**
 * Validation status enum schema
 */
export const validationStatusSchema = z.enum(
  ['pending', 'processing', 'success', 'warning', 'error'],
  {
    errorMap: () => ({ message: 'Estado de validación inválido' }),
  }
)

/**
 * File upload form schema
 */
export const fileUploadSchema = z.object({
  file: z
    .custom<File>((val) => val instanceof File, {
      message: 'Debes seleccionar un archivo',
    })
    .refine(
      (file) => file.size <= VALIDATION_RULES.MAX_FILE_SIZE_MB * 1024 * 1024,
      `El archivo no puede exceder ${VALIDATION_RULES.MAX_FILE_SIZE_MB}MB`
    )
    .refine((file) => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      return VALIDATION_RULES.ALLOWED_EXTENSIONS.includes(extension)
    }, `Solo se permiten archivos ${VALIDATION_RULES.ALLOWED_EXTENSIONS.join(', ')}`),
  fileType: fileTypeSchema,
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
})

export type FileUploadFormData = z.infer<typeof fileUploadSchema>

/**
 * Batch upload schema
 */
export const batchUploadSchema = z.object({
  files: z
    .array(
      z.custom<File>((val) => val instanceof File, {
        message: 'Archivo inválido',
      })
    )
    .min(1, 'Debes seleccionar al menos un archivo')
    .max(
      VALIDATION_RULES.MAX_BATCH_FILES,
      `Máximo ${VALIDATION_RULES.MAX_BATCH_FILES} archivos por lote`
    ),
  fileType: fileTypeSchema,
})

export type BatchUploadFormData = z.infer<typeof batchUploadSchema>

// ============================================
// FILTER SCHEMAS
// ============================================

/**
 * Validation filter schema
 */
export const validationFilterSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(10).max(100).default(20),
  status: z.array(validationStatusSchema).optional(),
  fileType: z.array(fileTypeSchema).optional(),
  search: z
    .string()
    .min(VALIDATION_RULES.MIN_SEARCH_LENGTH, 'Mínimo 2 caracteres para buscar')
    .optional()
    .or(z.literal('')),
  sortBy: z.enum(['uploadedAt', 'fileName', 'status']).default('uploadedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

export type ValidationFilterFormData = z.infer<typeof validationFilterSchema>

// ============================================
// ACTION SCHEMAS
// ============================================

/**
 * Create corrected version schema (CONSAR Retransmission)
 */
export const createCorrectedVersionSchema = z.object({
  reason: z
    .string()
    .min(10, 'El motivo debe tener al menos 10 caracteres')
    .max(500, 'El motivo no puede exceder 500 caracteres'),
  file: z
    .custom<File>((val) => val instanceof File, {
      message: 'Debes seleccionar un archivo corregido',
    })
    .optional(),
})

export type CreateCorrectedVersionFormData = z.infer<typeof createCorrectedVersionSchema>

/**
 * Delete validation schema (with justification)
 */
export const deleteValidationSchema = z.object({
  justification: z
    .string()
    .min(10, 'La justificación debe tener al menos 10 caracteres')
    .max(500, 'La justificación no puede exceder 500 caracteres'),
})

export type DeleteValidationFormData = z.infer<typeof deleteValidationSchema>

/**
 * Retry validation schema
 */
export const retryValidationSchema = z.object({
  validationId: z.string().min(1, 'ID de validación requerido'),
})

export type RetryValidationFormData = z.infer<typeof retryValidationSchema>

// ============================================
// EXPORT SCHEMAS
// ============================================

/**
 * Export report schema
 */
export const exportReportSchema = z.object({
  format: z.enum(['pdf', 'excel', 'csv'], {
    errorMap: () => ({ message: 'Formato de exportación inválido' }),
  }),
  includeDetails: z.boolean().default(true),
  includeErrors: z.boolean().default(true),
  includeWarnings: z.boolean().default(true),
  includeTimeline: z.boolean().default(false),
})

export type ExportReportFormData = z.infer<typeof exportReportSchema>

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check size
  if (file.size > VALIDATION_RULES.MAX_FILE_SIZE_MB * 1024 * 1024) {
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de ${VALIDATION_RULES.MAX_FILE_SIZE_MB}MB`,
    }
  }

  // Check extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!VALIDATION_RULES.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Extensión no permitida. Solo se aceptan: ${VALIDATION_RULES.ALLOWED_EXTENSIONS.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Validate batch files
 */
export function validateBatchFiles(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (files.length > VALIDATION_RULES.MAX_BATCH_FILES) {
    errors.push(`Máximo ${VALIDATION_RULES.MAX_BATCH_FILES} archivos por lote`)
  }

  files.forEach((file, index) => {
    const result = validateFile(file)
    if (!result.valid && result.error) {
      errors.push(`Archivo ${index + 1} (${file.name}): ${result.error}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
