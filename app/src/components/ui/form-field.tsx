/**
 * Form Field Components - VisionOS Enterprise 2025
 *
 * Standardized form field wrappers that integrate with React Hook Form
 * Provides consistent styling, error handling, and accessibility
 */

import * as React from 'react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { Input } from './input'
import { Label } from './label'
import { Switch } from './switch'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

// ============================================
// TYPES
// ============================================

interface BaseFieldProps {
  label?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

interface FormFieldProps<T extends FieldValues> extends BaseFieldProps {
  name: Path<T>
  control: Control<T>
}

// ============================================
// FORM FIELD WRAPPER
// ============================================

interface FormFieldWrapperProps extends BaseFieldProps {
  error?: string
  children: React.ReactNode
  htmlFor?: string
}

export function FormFieldWrapper({
  label,
  helperText,
  required,
  error,
  children,
  className,
  htmlFor,
}: FormFieldWrapperProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label
          htmlFor={htmlFor}
          className={cn(
            'text-sm font-semibold',
            isDark ? 'text-neutral-200' : 'text-neutral-700'
          )}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      )}
      {children}
      {helperText && !error && (
        <p
          className={cn(
            'text-xs',
            isDark ? 'text-neutral-500' : 'text-neutral-400'
          )}
        >
          {helperText}
        </p>
      )}
      {error && (
        <div className="flex items-center gap-1.5 text-red-500">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}

// ============================================
// TEXT INPUT FIELD
// ============================================

interface TextFieldProps<T extends FieldValues> extends FormFieldProps<T> {
  type?: 'text' | 'email' | 'tel' | 'url' | 'search'
  placeholder?: string
  autoComplete?: string
  autoFocus?: boolean
}

export function TextField<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  required,
  disabled,
  className,
  type = 'text',
  placeholder,
  autoComplete,
  autoFocus,
}: TextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormFieldWrapper
          label={label}
          helperText={helperText}
          required={required}
          error={error?.message}
          className={className}
          htmlFor={name}
        >
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
            className={cn(
              error && 'border-red-500 focus:ring-red-500/30'
            )}
          />
        </FormFieldWrapper>
      )}
    />
  )
}

// ============================================
// PASSWORD FIELD
// ============================================

interface PasswordFieldProps<T extends FieldValues> extends FormFieldProps<T> {
  placeholder?: string
  autoComplete?: string
  showStrengthIndicator?: boolean
}

export function PasswordField<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  required,
  disabled,
  className,
  placeholder,
  autoComplete = 'current-password',
  showStrengthIndicator,
}: PasswordFieldProps<T>) {
  const [showPassword, setShowPassword] = React.useState(false)
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const strength = showStrengthIndicator ? getPasswordStrength(field.value || '') : null

        return (
          <FormFieldWrapper
            label={label}
            helperText={helperText}
            required={required}
            error={error?.message}
            className={className}
            htmlFor={name}
          >
            <div className="relative">
              <Input
                {...field}
                id={name}
                type={showPassword ? 'text' : 'password'}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                aria-invalid={!!error}
                className={cn(
                  'pr-10',
                  error && 'border-red-500 focus:ring-red-500/30'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2',
                  'p-1 rounded-md transition-colors',
                  isDark
                    ? 'text-neutral-500 hover:text-neutral-300'
                    : 'text-neutral-400 hover:text-neutral-600'
                )}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {showStrengthIndicator && strength && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-colors',
                        level <= strength.level
                          ? strength.color
                          : isDark
                          ? 'bg-neutral-700'
                          : 'bg-neutral-200'
                      )}
                    />
                  ))}
                </div>
                <p
                  className={cn(
                    'text-xs font-medium',
                    strength.textColor
                  )}
                >
                  {strength.label}
                </p>
              </div>
            )}
          </FormFieldWrapper>
        )
      }}
    />
  )
}

function getPasswordStrength(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const levels = [
    { level: 1, label: 'Muy débil', color: 'bg-red-500', textColor: 'text-red-500' },
    { level: 2, label: 'Débil', color: 'bg-orange-500', textColor: 'text-orange-500' },
    { level: 3, label: 'Aceptable', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
    { level: 4, label: 'Fuerte', color: 'bg-green-500', textColor: 'text-green-500' },
  ]

  const level = Math.min(Math.max(score - 1, 0), 3)
  return levels[level]
}

// ============================================
// NUMBER FIELD
// ============================================

interface NumberFieldProps<T extends FieldValues> extends FormFieldProps<T> {
  placeholder?: string
  min?: number
  max?: number
  step?: number
}

export function NumberField<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  required,
  disabled,
  className,
  placeholder,
  min,
  max,
  step,
}: NumberFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormFieldWrapper
          label={label}
          helperText={helperText}
          required={required}
          error={error?.message}
          className={className}
          htmlFor={name}
        >
          <Input
            {...field}
            id={name}
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            onChange={(e) => field.onChange(e.target.valueAsNumber || '')}
            aria-invalid={!!error}
            className={cn(
              error && 'border-red-500 focus:ring-red-500/30'
            )}
          />
        </FormFieldWrapper>
      )}
    />
  )
}

// ============================================
// TEXTAREA FIELD
// ============================================

interface TextareaFieldProps<T extends FieldValues> extends FormFieldProps<T> {
  placeholder?: string
  rows?: number
  maxLength?: number
  showCharCount?: boolean
}

export function TextareaField<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  required,
  disabled,
  className,
  placeholder,
  rows = 4,
  maxLength,
  showCharCount,
}: TextareaFieldProps<T>) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormFieldWrapper
          label={label}
          helperText={helperText}
          required={required}
          error={error?.message}
          className={className}
          htmlFor={name}
        >
          <textarea
            {...field}
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            aria-invalid={!!error}
            className={cn(
              'w-full px-3 py-2 rounded-xl text-sm',
              'border transition-all duration-200 resize-y',
              'focus:outline-none focus:ring-2',
              isDark
                ? 'bg-neutral-800/50 border-neutral-700 text-neutral-100 focus:border-blue-500 focus:ring-blue-500/30'
                : 'bg-white border-neutral-300 text-neutral-900 focus:border-blue-500 focus:ring-blue-500/30',
              error && 'border-red-500 focus:ring-red-500/30',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
          {showCharCount && maxLength && (
            <p
              className={cn(
                'text-xs text-right',
                isDark ? 'text-neutral-500' : 'text-neutral-400'
              )}
            >
              {(field.value || '').length} / {maxLength}
            </p>
          )}
        </FormFieldWrapper>
      )}
    />
  )
}

// ============================================
// SELECT FIELD
// ============================================

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectFieldProps<T extends FieldValues> extends FormFieldProps<T> {
  options: SelectOption[]
  placeholder?: string
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  required,
  disabled,
  className,
  options,
  placeholder,
}: SelectFieldProps<T>) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormFieldWrapper
          label={label}
          helperText={helperText}
          required={required}
          error={error?.message}
          className={className}
          htmlFor={name}
        >
          <select
            {...field}
            id={name}
            disabled={disabled}
            aria-invalid={!!error}
            className={cn(
              'w-full px-3 py-2 rounded-xl text-sm',
              'border transition-all duration-200 cursor-pointer',
              'focus:outline-none focus:ring-2',
              isDark
                ? 'bg-neutral-800/50 border-neutral-700 text-neutral-100 focus:border-blue-500 focus:ring-blue-500/30'
                : 'bg-white border-neutral-300 text-neutral-900 focus:border-blue-500 focus:ring-blue-500/30',
              error && 'border-red-500 focus:ring-red-500/30',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        </FormFieldWrapper>
      )}
    />
  )
}

// ============================================
// SWITCH FIELD
// ============================================

interface SwitchFieldProps<T extends FieldValues> extends FormFieldProps<T> {
  description?: string
}

export function SwitchField<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  disabled,
  className,
  description,
}: SwitchFieldProps<T>) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={cn('flex items-center justify-between', className)}>
          <div className="space-y-0.5">
            {label && (
              <Label
                htmlFor={name}
                className={cn(
                  'text-sm font-semibold',
                  isDark ? 'text-neutral-200' : 'text-neutral-700'
                )}
              >
                {label}
              </Label>
            )}
            {(description || helperText) && (
              <p
                className={cn(
                  'text-xs',
                  isDark ? 'text-neutral-500' : 'text-neutral-400'
                )}
              >
                {description || helperText}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-500 font-medium">
                {error.message}
              </p>
            )}
          </div>
          <Switch
            id={name}
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
        </div>
      )}
    />
  )
}

// ============================================
// CHECKBOX FIELD
// ============================================

interface CheckboxFieldProps<T extends FieldValues> extends FormFieldProps<T> {
  description?: string
}

export function CheckboxField<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  disabled,
  className,
  description,
}: CheckboxFieldProps<T>) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={cn('flex items-start gap-3', className)}>
          <input
            id={name}
            type="checkbox"
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            disabled={disabled}
            className={cn(
              'mt-1 h-4 w-4 rounded border-2',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              isDark
                ? 'border-neutral-600 bg-neutral-800 focus:ring-blue-500/30'
                : 'border-neutral-300 bg-white focus:ring-blue-500/30',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
          <div className="space-y-0.5">
            {label && (
              <Label
                htmlFor={name}
                className={cn(
                  'text-sm font-medium cursor-pointer',
                  isDark ? 'text-neutral-200' : 'text-neutral-700'
                )}
              >
                {label}
              </Label>
            )}
            {(description || helperText) && (
              <p
                className={cn(
                  'text-xs',
                  isDark ? 'text-neutral-500' : 'text-neutral-400'
                )}
              >
                {description || helperText}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-500 font-medium">
                {error.message}
              </p>
            )}
          </div>
        </div>
      )}
    />
  )
}

// ============================================
// EXPORTS
// ============================================

export {
  type FormFieldProps,
  type BaseFieldProps,
  type SelectOption,
}
