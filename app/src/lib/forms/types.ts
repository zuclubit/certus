/**
 * Form Types - Enterprise 2025
 *
 * Type definitions for form utilities
 */

import type { FieldError, FieldErrors } from 'react-hook-form'
import type { ZodIssue } from 'zod'

// ============================================
// FORM FIELD TYPES
// ============================================

export interface FormFieldProps {
  /** Field name for registration */
  name: string
  /** Field label */
  label?: string
  /** Helper text */
  helperText?: string
  /** Error message */
  error?: FieldError
  /** Required field indicator */
  required?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Placeholder text */
  placeholder?: string
}

export interface FormFieldState {
  isDirty: boolean
  isTouched: boolean
  isValid: boolean
  error?: FieldError
}

// ============================================
// FORM STATE TYPES
// ============================================

export interface FormSubmitState {
  isSubmitting: boolean
  isSubmitSuccessful: boolean
  submitCount: number
}

export interface FormValidationState {
  isValid: boolean
  isValidating: boolean
  errors: FieldErrors
}

// ============================================
// API FORM TYPES
// ============================================

export interface ApiFormError {
  field?: string
  message: string
  code?: string
}

export interface ApiFormResponse<T = unknown> {
  success: boolean
  data?: T
  errors?: ApiFormError[]
  message?: string
}

// ============================================
// FORM CONFIGURATION TYPES
// ============================================

export interface FormConfig {
  /** Auto-focus first field */
  autoFocus?: boolean
  /** Reset on successful submit */
  resetOnSuccess?: boolean
  /** Show validation on blur */
  validateOnBlur?: boolean
  /** Show validation on change */
  validateOnChange?: boolean
  /** Debounce validation (ms) */
  validationDebounce?: number
}

export interface FormFieldConfig {
  /** Field type */
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch'
  /** Field name */
  name: string
  /** Field label */
  label: string
  /** Placeholder */
  placeholder?: string
  /** Helper text */
  helperText?: string
  /** Required */
  required?: boolean
  /** Disabled */
  disabled?: boolean
  /** Options for select/radio */
  options?: Array<{ value: string; label: string }>
  /** Validation rules */
  rules?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: RegExp
  }
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Extract form data type from Zod schema
 */
export type FormDataFromSchema<T> = T extends import('zod').ZodType<infer U> ? U : never

/**
 * Make specific fields optional
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Make specific fields required
 */
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Form field name type helper
 */
export type FieldName<T> = keyof T & string

/**
 * Form field value type helper
 */
export type FieldValue<T, K extends keyof T> = T[K]

// ============================================
// ERROR HANDLING TYPES
// ============================================

export interface FormErrorSummary {
  hasErrors: boolean
  errorCount: number
  fieldErrors: Array<{
    field: string
    message: string
  }>
  globalErrors: string[]
}

/**
 * Convert Zod issues to form errors
 */
export function zodIssuesToFormErrors(issues: ZodIssue[]): FormErrorSummary {
  const fieldErrors: Array<{ field: string; message: string }> = []
  const globalErrors: string[] = []

  for (const issue of issues) {
    if (issue.path.length > 0) {
      fieldErrors.push({
        field: issue.path.join('.'),
        message: issue.message,
      })
    } else {
      globalErrors.push(issue.message)
    }
  }

  return {
    hasErrors: issues.length > 0,
    errorCount: issues.length,
    fieldErrors,
    globalErrors,
  }
}

/**
 * Convert API errors to field errors
 */
export function apiErrorsToFieldErrors(
  errors: ApiFormError[]
): Record<string, { message: string }> {
  const fieldErrors: Record<string, { message: string }> = {}

  for (const error of errors) {
    if (error.field) {
      fieldErrors[error.field] = { message: error.message }
    }
  }

  return fieldErrors
}
