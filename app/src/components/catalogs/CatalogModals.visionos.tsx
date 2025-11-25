/**
 * Catalog Modals - VisionOS Premium Design System
 *
 * Modal para crear catálogos migrado al sistema ResponsiveModal para:
 * - Dialog en desktop, Drawer en móvil
 * - Accesibilidad completa con focus trap
 * - Animaciones iOS-style
 * - Ajustes multi-dispositivo
 *
 * @compliance CONSAR regulatory requirements
 * @architecture Clean Architecture + Component Composition
 */

import { useState } from 'react'
import {
  Database,
  Shield,
  Zap,
  AlertTriangle,
  Info,
  Settings,
  XCircle,
} from 'lucide-react'
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalBody,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

// ============================================================================
// TYPES
// ============================================================================

export interface CatalogFormData {
  code: string
  name: string
  description: string
  type: 'regulatory' | 'reference' | 'operational'
  frequency: 'manual' | 'daily' | 'weekly' | 'monthly'
  autoUpdate: boolean
  strictValidation: boolean
  notifyChanges: boolean
}

export interface CreateCatalogModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CatalogFormData) => void
  isLoading?: boolean
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface FormInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  type?: 'text' | 'textarea'
  rows?: number
  transform?: (value: string) => string
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  type = 'text',
  rows = 3,
  transform,
}: FormInputProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = transform ? transform(e.target.value) : e.target.value
    onChange(newValue)
  }

  const inputClasses = cn(
    // Responsive sizing
    'w-full',
    'px-3 py-2 xs:px-3.5 xs:py-2.5 sm:px-4 sm:py-2.5',
    // Responsive text
    'text-xs xs:text-sm',
    // Responsive border-radius
    'rounded-lg xs:rounded-xl',
    'border transition-all duration-200',
    'focus:outline-none focus:ring-2',
    error
      ? 'border-red-500 focus:ring-red-500/30'
      : 'border-neutral-300 dark:border-neutral-600 focus:border-blue-500 focus:ring-blue-500/30',
    isDark
      ? 'bg-neutral-800/50 text-neutral-100 placeholder-neutral-500'
      : 'bg-white text-neutral-900 placeholder-neutral-400',
    disabled && 'opacity-50 cursor-not-allowed'
  )

  return (
    <div className="space-y-1.5 xs:space-y-2">
      <label
        className={cn(
          'block text-[10px] xs:text-xs sm:text-sm font-semibold',
          isDark ? 'text-neutral-300' : 'text-neutral-700'
        )}
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={cn(inputClasses, 'resize-none')}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
        />
      )}

      {error && (
        <p className="flex items-center gap-1 text-[10px] xs:text-xs text-red-500">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

interface FormSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}

function FormSelect({ label, value, onChange, options, disabled }: FormSelectProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div className="space-y-1.5 xs:space-y-2">
      <label
        className={cn(
          'block text-[10px] xs:text-xs sm:text-sm font-semibold',
          isDark ? 'text-neutral-300' : 'text-neutral-700'
        )}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'w-full',
          'px-3 py-2 xs:px-3.5 xs:py-2.5 sm:px-4 sm:py-2.5',
          'text-xs xs:text-sm',
          'rounded-lg xs:rounded-xl',
          'border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/30',
          isDark
            ? 'bg-neutral-800/50 border-neutral-600 text-neutral-100'
            : 'bg-white border-neutral-300 text-neutral-900',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface FormCheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon: React.ElementType
  disabled?: boolean
}

function FormCheckbox({ label, checked, onChange, icon: Icon, disabled }: FormCheckboxProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <label
      className={cn(
        'flex items-center gap-2 xs:gap-3',
        'p-2.5 xs:p-3',
        'rounded-lg xs:rounded-xl',
        'cursor-pointer transition-colors',
        isDark
          ? 'bg-neutral-800/50 hover:bg-neutral-700/50'
          : 'bg-neutral-50 hover:bg-neutral-100',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-3.5 w-3.5 xs:h-4 xs:w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
      />
      <Icon className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-blue-500" />
      <span
        className={cn(
          'text-[10px] xs:text-xs sm:text-sm font-medium',
          isDark ? 'text-neutral-300' : 'text-neutral-700'
        )}
      >
        {label}
      </span>
    </label>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CreateCatalogModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateCatalogModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [formData, setFormData] = useState<CatalogFormData>({
    code: '',
    name: '',
    description: '',
    type: 'regulatory',
    frequency: 'manual',
    autoUpdate: false,
    strictValidation: true,
    notifyChanges: true,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CatalogFormData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CatalogFormData, string>> = {}

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido'
    } else if (!/^CAT_[A-Z_]+$/.test(formData.code)) {
      newErrors.code = 'Formato: CAT_NOMBRE_MAYUSCULAS'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.length < 5) {
      newErrors.name = 'Mínimo 5 caracteres'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Mínimo 20 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData)
      // Reset form
      setFormData({
        code: '',
        name: '',
        description: '',
        type: 'regulatory',
        frequency: 'manual',
        autoUpdate: false,
        strictValidation: true,
        notifyChanges: true,
      })
      setErrors({})
    }
  }

  const handleCancel = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'regulatory',
      frequency: 'manual',
      autoUpdate: false,
      strictValidation: true,
      notifyChanges: true,
    })
    setErrors({})
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCancel()
    } else {
      onOpenChange(newOpen)
    }
  }

  const catalogTypeOptions = [
    { value: 'regulatory', label: 'Normativo (CONSAR)' },
    { value: 'reference', label: 'Referencia (INEGI, SAT)' },
    { value: 'operational', label: 'Operacional (Interno)' },
  ]

  const frequencyOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'daily', label: 'Diaria' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
  ]

  return (
    <ResponsiveModal open={open} onOpenChange={handleOpenChange}>
      <ResponsiveModalContent size="xl">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-3 xs:gap-4">
            {/* Icon */}
            <div
              className={cn(
                'flex-shrink-0',
                'w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12',
                'rounded-xl xs:rounded-2xl',
                'flex items-center justify-center',
                isDark ? 'bg-blue-500/15' : 'bg-blue-100'
              )}
              style={{
                border: isDark
                  ? '1px solid rgba(59, 130, 246, 0.25)'
                  : '1px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 0 24px rgba(59, 130, 246, 0.2)',
              }}
            >
              <Database
                className="h-5 w-5 xs:h-5.5 xs:w-5.5 sm:h-6 sm:w-6 text-blue-500"
                strokeWidth={1.8}
              />
            </div>

            {/* Title */}
            <div className="min-w-0">
              <ResponsiveModalTitle>Crear Nuevo Catálogo</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Configure un nuevo catálogo conforme a normativa CONSAR
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>
          <div className="space-y-5 xs:space-y-6">
            {/* Section: Basic Information */}
            <div className="space-y-3 xs:space-y-4">
              <h3
                className={cn(
                  'text-[10px] xs:text-xs sm:text-sm font-bold flex items-center gap-1.5 xs:gap-2',
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                )}
              >
                <Info className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                Información Básica
              </h3>

              {/* Grid responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                <FormInput
                  label="Código del Catálogo"
                  value={formData.code}
                  onChange={(v) => setFormData({ ...formData, code: v })}
                  placeholder="CAT_EJEMPLO"
                  error={errors.code}
                  required
                  disabled={isLoading}
                  transform={(v) => v.toUpperCase()}
                />

                <FormSelect
                  label="Tipo de Catálogo"
                  value={formData.type}
                  onChange={(v) => setFormData({ ...formData, type: v as any })}
                  options={catalogTypeOptions}
                  disabled={isLoading}
                />

                <div className="sm:col-span-2">
                  <FormInput
                    label="Nombre del Catálogo"
                    value={formData.name}
                    onChange={(v) => setFormData({ ...formData, name: v })}
                    placeholder="Ej: Catálogo de AFOREs"
                    error={errors.name}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="sm:col-span-2">
                  <FormInput
                    label="Descripción"
                    value={formData.description}
                    onChange={(v) => setFormData({ ...formData, description: v })}
                    placeholder="Describe el propósito y contenido del catálogo..."
                    error={errors.description}
                    required
                    disabled={isLoading}
                    type="textarea"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Section: Configuration */}
            <div className="space-y-3 xs:space-y-4">
              <h3
                className={cn(
                  'text-[10px] xs:text-xs sm:text-sm font-bold flex items-center gap-1.5 xs:gap-2',
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                )}
              >
                <Settings className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                Configuración
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                <FormSelect
                  label="Frecuencia de Actualización"
                  value={formData.frequency}
                  onChange={(v) => setFormData({ ...formData, frequency: v as any })}
                  options={frequencyOptions}
                  disabled={isLoading}
                />

                <div className="space-y-2 xs:space-y-3">
                  <FormCheckbox
                    label="Auto-actualización"
                    checked={formData.autoUpdate}
                    onChange={(v) => setFormData({ ...formData, autoUpdate: v })}
                    icon={Zap}
                    disabled={isLoading}
                  />
                  <FormCheckbox
                    label="Validación estricta"
                    checked={formData.strictValidation}
                    onChange={(v) => setFormData({ ...formData, strictValidation: v })}
                    icon={Shield}
                    disabled={isLoading}
                  />
                  <FormCheckbox
                    label="Notificar cambios"
                    checked={formData.notifyChanges}
                    onChange={(v) => setFormData({ ...formData, notifyChanges: v })}
                    icon={AlertTriangle}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Compliance Notice */}
            <div
              className={cn(
                'p-3 xs:p-4 rounded-xl xs:rounded-2xl',
                isDark ? 'bg-blue-950/30' : 'bg-blue-50'
              )}
              style={{
                border: isDark
                  ? '1px solid rgba(59, 130, 246, 0.2)'
                  : '1px solid rgba(59, 130, 246, 0.15)',
              }}
            >
              <div className="flex gap-2.5 xs:gap-3">
                <Info
                  className={cn(
                    'h-4 w-4 xs:h-5 xs:w-5 flex-shrink-0 mt-0.5',
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  )}
                />
                <div>
                  <h4
                    className={cn(
                      'text-[10px] xs:text-xs sm:text-sm font-semibold mb-0.5 xs:mb-1',
                      isDark ? 'text-blue-400' : 'text-blue-900'
                    )}
                  >
                    Cumplimiento Normativo 2025
                  </h4>
                  <p
                    className={cn(
                      'text-[9px] xs:text-[10px] sm:text-xs leading-relaxed',
                      isDark ? 'text-blue-300' : 'text-blue-800'
                    )}
                  >
                    Este catálogo será registrado en el historial de auditoría. Asegúrate de que
                    cumple con las disposiciones CONSAR vigentes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            Crear Catálogo
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
