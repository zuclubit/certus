/**
 * Zod Validation Schemas - Enterprise 2025
 *
 * Centralized validation schemas for CONSAR compliance
 * Provides reusable, type-safe validation rules
 */

import { z } from 'zod'

// ============================================
// COMMON FIELD VALIDATORS
// ============================================

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .min(1, 'El correo electrónico es requerido')
  .email('Ingresa un correo electrónico válido')

/**
 * Password validation (strong)
 */
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
  .regex(/[a-z]/, 'Debe incluir al menos una letra minúscula')
  .regex(/[0-9]/, 'Debe incluir al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe incluir al menos un carácter especial')

/**
 * Simple password (for login only)
 */
export const simplePasswordSchema = z.string().min(1, 'La contraseña es requerida')

/**
 * Required string
 */
export const requiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName} es requerido`)

/**
 * Optional string
 */
export const optionalString = z.string().optional()

/**
 * CURP validation (Mexican personal ID)
 */
export const curpSchema = z
  .string()
  .min(18, 'El CURP debe tener 18 caracteres')
  .max(18, 'El CURP debe tener 18 caracteres')
  .regex(
    /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/,
    'Formato de CURP inválido'
  )

/**
 * RFC validation (Mexican tax ID)
 */
export const rfcSchema = z
  .string()
  .min(12, 'El RFC debe tener 12 o 13 caracteres')
  .max(13, 'El RFC debe tener 12 o 13 caracteres')
  .regex(
    /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/,
    'Formato de RFC inválido'
  )

/**
 * NSS validation (Mexican social security number)
 */
export const nssSchema = z
  .string()
  .length(11, 'El NSS debe tener 11 dígitos')
  .regex(/^[0-9]{11}$/, 'El NSS debe contener solo números')

/**
 * Phone number validation (Mexican format)
 */
export const phoneSchema = z
  .string()
  .min(10, 'El teléfono debe tener 10 dígitos')
  .max(10, 'El teléfono debe tener 10 dígitos')
  .regex(/^[0-9]{10}$/, 'El teléfono debe contener solo números')

/**
 * URL validation
 */
export const urlSchema = z.string().url('URL inválida').or(z.literal(''))

/**
 * Date validation (ISO format)
 */
export const dateSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Fecha inválida',
})

/**
 * Positive number validation
 */
export const positiveNumberSchema = z.number().positive('Debe ser un número positivo')

/**
 * Non-negative number validation
 */
export const nonNegativeNumberSchema = z.number().nonnegative('No puede ser negativo')

/**
 * Money amount validation (MXN)
 */
export const moneySchema = z
  .number()
  .nonnegative('El monto no puede ser negativo')
  .multipleOf(0.01, 'Máximo 2 decimales permitidos')

/**
 * Percentage validation (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, 'El porcentaje no puede ser negativo')
  .max(100, 'El porcentaje no puede ser mayor a 100')

// ============================================
// CONSAR-SPECIFIC VALIDATORS
// ============================================

/**
 * AFORE code validation
 */
export const aforeCodeSchema = z
  .string()
  .min(3, 'El código AFORE debe tener al menos 3 caracteres')
  .max(10, 'El código AFORE no puede exceder 10 caracteres')
  .regex(/^[A-Z0-9]+$/, 'Solo letras mayúsculas y números permitidos')

/**
 * File type validation
 */
export const fileTypeSchema = z.enum(['PROCESAR', 'AFILIADOS', 'TRASPASOS', 'RETIROS', 'APORTACIONES'], {
  errorMap: () => ({ message: 'Tipo de archivo CONSAR inválido' }),
})

/**
 * Validation status
 */
export const validationStatusSchema = z.enum(
  ['pending', 'processing', 'success', 'warning', 'error'],
  {
    errorMap: () => ({ message: 'Estado de validación inválido' }),
  }
)

/**
 * Approval level
 */
export const approvalLevelSchema = z.enum(['level_1', 'level_2', 'level_3', 'level_4'], {
  errorMap: () => ({ message: 'Nivel de aprobación inválido' }),
})

// ============================================
// COMPOSITE SCHEMAS
// ============================================

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: simplePasswordSchema,
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Register form schema
 */
export const registerSchema = z
  .object({
    firstName: requiredString('El nombre'),
    lastName: requiredString('El apellido'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  email: emailSchema,
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: simplePasswordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

/**
 * User profile schema
 */
export const userProfileSchema = z.object({
  firstName: requiredString('El nombre'),
  lastName: requiredString('El apellido'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  department: z.string().optional(),
  position: z.string().optional(),
})

export type UserProfileFormData = z.infer<typeof userProfileSchema>

/**
 * Create tenant/AFORE schema
 */
export const createTenantSchema = z.object({
  name: requiredString('El nombre de la AFORE'),
  aforeCode: aforeCodeSchema,
  logo: urlSchema.optional(),
  timezone: z.string().default('America/Mexico_City'),
  language: z.enum(['es', 'en']).default('es'),
  enableMfa: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  inAppNotifications: z.boolean().default(true),
})

export type CreateTenantFormData = z.infer<typeof createTenantSchema>

/**
 * Edit tenant/AFORE schema
 */
export const editTenantSchema = createTenantSchema.omit({ aforeCode: true })

export type EditTenantFormData = z.infer<typeof editTenantSchema>

/**
 * Create user schema
 */
export const createUserSchema = z.object({
  firstName: requiredString('El nombre'),
  lastName: requiredString('El apellido'),
  email: emailSchema,
  role: z.string().min(1, 'El rol es requerido'),
  department: z.string().optional(),
  sendInvitation: z.boolean().default(true),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>

/**
 * Invite user schema
 */
export const inviteUserSchema = z.object({
  email: emailSchema,
  role: z.string().min(1, 'El rol es requerido'),
  expirationDays: z.number().min(1).max(30).default(7),
  customMessage: z.string().max(500).optional(),
})

export type InviteUserFormData = z.infer<typeof inviteUserSchema>

/**
 * Report generation schema
 */
export const generateReportSchema = z.object({
  name: requiredString('El nombre del reporte'),
  type: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  format: z.enum(['pdf', 'xlsx', 'csv', 'json']),
  dateFrom: dateSchema,
  dateTo: dateSchema,
  includeDetails: z.boolean().default(true),
  includeCharts: z.boolean().default(false),
})

export type GenerateReportFormData = z.infer<typeof generateReportSchema>

/**
 * Approval action schema
 */
export const approvalActionSchema = z.object({
  comment: z
    .string()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(500, 'El comentario no puede exceder 500 caracteres'),
})

export type ApprovalActionFormData = z.infer<typeof approvalActionSchema>

/**
 * Delete confirmation schema (with justification)
 */
export const deleteConfirmationSchema = z.object({
  justification: z
    .string()
    .min(10, 'La justificación debe tener al menos 10 caracteres')
    .max(500, 'La justificación no puede exceder 500 caracteres'),
  confirmText: z.string().refine((val) => val === 'ELIMINAR', {
    message: 'Escribe ELIMINAR para confirmar',
  }),
})

export type DeleteConfirmationFormData = z.infer<typeof deleteConfirmationSchema>

// ============================================
// HELPERS
// ============================================

/**
 * Create a schema with conditional required field
 */
export function conditionalRequired<T extends z.ZodTypeAny>(
  schema: T,
  condition: (data: unknown) => boolean,
  message: string
) {
  return schema.refine(
    (val) => {
      if (condition(val)) {
        return val !== undefined && val !== null && val !== ''
      }
      return true
    },
    { message }
  )
}

/**
 * Create enum schema from array of options
 */
export function createEnumSchema<T extends string>(
  options: readonly T[],
  errorMessage = 'Opción inválida'
) {
  return z.enum(options as [T, ...T[]], {
    errorMap: () => ({ message: errorMessage }),
  })
}

/**
 * Create a string schema with min/max length
 */
export function createStringSchema(
  fieldName: string,
  options?: { min?: number; max?: number; optional?: boolean }
) {
  let schema = z.string()

  if (!options?.optional) {
    schema = schema.min(options?.min ?? 1, `${fieldName} es requerido`)
  }

  if (options?.max) {
    schema = schema.max(options.max, `${fieldName} no puede exceder ${options.max} caracteres`)
  }

  return options?.optional ? schema.optional() : schema
}
