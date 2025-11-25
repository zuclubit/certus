/**
 * User Modals - VisionOS Premium Design System
 *
 * Modales para gestión de usuarios usando el sistema ResponsiveModal:
 * - Dialog en desktop (centrado)
 * - Drawer en mobile (bottom sheet con gestos)
 * - Accesibilidad completa con focus trap y keyboard navigation
 * - Responsive para pantallas pequeñas, medianas y grandes
 * - VisionOS glassmorphic design
 *
 * @architecture Clean Architecture + Component Composition
 * @pattern Compound Component Pattern
 */

import { useState, useEffect, useCallback, memo } from 'react'
import {
  Mail,
  Phone,
  Briefcase,
  Building2,
  Shield,
  AlertTriangle,
  Info,
  UserPlus,
  UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { USER_ROLES, type UserRole } from '@/lib/constants'
import type { User } from '@/types'

// Sistema de modales responsivo
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

// ============================================================================
// FORM DATA INTERFACES
// ============================================================================

export interface CreateUserFormData {
  email: string
  name: string
  role: UserRole
  phone?: string
  department?: string
  position?: string
  employeeNumber?: string
}

export interface EditUserFormData {
  name?: string
  phone?: string
  role?: UserRole
  department?: string
  position?: string
  employeeNumber?: string
}

// ============================================================================
// SHARED SUB-COMPONENTS
// ============================================================================

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * FormField - Campo de formulario con label, icono y error
 */
const FormField = memo(function FormField({
  label,
  required,
  error,
  children,
  icon: Icon,
}: FormFieldProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <label
        className={cn(
          'block text-[11px] sm:text-xs font-semibold',
          isDark ? 'text-neutral-300' : 'text-neutral-700'
        )}
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}
          />
        )}
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[10px] sm:text-xs text-red-500">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
})

/**
 * Genera clases CSS para inputs del formulario
 */
function getInputClassName(
  hasError: boolean,
  hasIcon: boolean,
  isDark: boolean
): string {
  return cn(
    // Base
    'w-full rounded-lg sm:rounded-xl',
    'text-[13px] sm:text-sm',
    'border-[1.5px] transition-all duration-200',
    'focus:outline-none focus:ring-2',
    // Padding responsive - más compacto en móvil
    'py-2.5 sm:py-3',
    hasIcon ? 'pl-10 pr-3 sm:pr-4' : 'px-3 sm:px-4',
    // Touch-friendly height
    'min-h-[44px] sm:min-h-[48px]',
    // Error state
    hasError
      ? 'border-red-500 focus:ring-red-500/30'
      : isDark
        ? 'border-neutral-700 focus:border-primary-500 focus:ring-primary-500/30'
        : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/30',
    // Theme colors
    isDark
      ? 'bg-neutral-800/80 text-neutral-100 placeholder-neutral-500'
      : 'bg-white text-neutral-900 placeholder-neutral-400'
  )
}

/**
 * ComplianceNotice - Aviso de cumplimiento CONSAR
 */
const ComplianceNotice = memo(function ComplianceNotice() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        'p-3 sm:p-4 rounded-xl sm:rounded-2xl',
        isDark ? 'bg-blue-950/30' : 'bg-blue-50'
      )}
      style={{
        border: isDark
          ? '1px solid rgba(59, 130, 246, 0.2)'
          : '1px solid rgba(59, 130, 246, 0.15)',
      }}
    >
      <div className="flex gap-2.5 sm:gap-3">
        <Info
          className={cn(
            'h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5',
            isDark ? 'text-blue-400' : 'text-blue-600'
          )}
        />
        <div>
          <h4
            className={cn(
              'text-[11px] sm:text-xs font-semibold mb-0.5 sm:mb-1',
              isDark ? 'text-blue-400' : 'text-blue-900'
            )}
          >
            Cumplimiento CONSAR 2025
          </h4>
          <p
            className={cn(
              'text-[10px] sm:text-xs leading-relaxed',
              isDark ? 'text-blue-300' : 'text-blue-800'
            )}
          >
            El usuario recibirá un correo de invitación para activar su cuenta.
            Se registrará en el historial de auditoría según las disposiciones
            de seguridad de la información.
          </p>
        </div>
      </div>
    </div>
  )
})

/**
 * ModalHeaderIcon - Icono estilizado para el header del modal
 */
const ModalHeaderIcon = memo(function ModalHeaderIcon({
  icon: Icon,
  variant = 'primary',
}: {
  icon: React.ComponentType<{ className?: string }>
  variant?: 'primary' | 'warning' | 'danger'
}) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const variantStyles = {
    primary: {
      bg: isDark ? 'bg-primary-500/15' : 'bg-primary-100',
      border: isDark
        ? '1px solid rgba(139, 92, 246, 0.25)'
        : '1px solid rgba(139, 92, 246, 0.2)',
      shadow: '0 0 24px rgba(139, 92, 246, 0.2)',
      iconColor: 'text-primary-500',
    },
    warning: {
      bg: isDark ? 'bg-amber-500/15' : 'bg-amber-100',
      border: isDark
        ? '1px solid rgba(245, 158, 11, 0.25)'
        : '1px solid rgba(245, 158, 11, 0.2)',
      shadow: '0 0 24px rgba(245, 158, 11, 0.2)',
      iconColor: 'text-amber-500',
    },
    danger: {
      bg: isDark ? 'bg-red-500/15' : 'bg-red-100',
      border: isDark
        ? '1px solid rgba(239, 68, 68, 0.25)'
        : '1px solid rgba(239, 68, 68, 0.2)',
      shadow: '0 0 24px rgba(239, 68, 68, 0.2)',
      iconColor: 'text-red-500',
    },
  }

  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'flex-shrink-0',
        'w-10 h-10 sm:w-11 sm:h-11',
        'rounded-xl sm:rounded-2xl',
        'flex items-center justify-center',
        styles.bg
      )}
      style={{
        border: styles.border,
        boxShadow: styles.shadow,
      }}
    >
      <Icon className={cn('h-5 w-5 sm:h-5.5 sm:w-5.5', styles.iconColor)} />
    </div>
  )
})

// ============================================================================
// CREATE USER MODAL
// ============================================================================

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateUserFormData) => void
  isLoading?: boolean
}

export function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateUserModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [formData, setFormData] = useState<CreateUserFormData>({
    email: '',
    name: '',
    role: USER_ROLES.AFORE_ANALYST,
    phone: '',
    department: '',
    position: '',
    employeeNumber: '',
  })

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateUserFormData, string>>
  >({})

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        email: '',
        name: '',
        role: USER_ROLES.AFORE_ANALYST,
        phone: '',
        department: '',
        position: '',
        employeeNumber: '',
      })
      setErrors({})
    }
  }, [isOpen])

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof CreateUserFormData, string>> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }

    if (formData.phone && !/^\+?[0-9\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Teléfono inválido (mínimo 10 dígitos)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      onSubmit(formData)
    }
  }, [validateForm, onSubmit, formData])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose()
      }
    },
    [onClose]
  )

  const updateField = useCallback(
    <K extends keyof CreateUserFormData>(
      field: K,
      value: CreateUserFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    },
    [errors]
  )

  return (
    <ResponsiveModal open={isOpen} onOpenChange={handleOpenChange}>
      <ResponsiveModalContent size="lg">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-3 sm:gap-4">
            <ModalHeaderIcon icon={UserPlus} variant="primary" />
            <div className="min-w-0">
              <ResponsiveModalTitle>Crear Nuevo Usuario</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Complete la información para registrar un nuevo usuario
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>
          <div className="space-y-5 sm:space-y-6">
            {/* Section: Basic Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3
                className={cn(
                  'text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2',
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                )}
              >
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Información Básica
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Full Name - Full width */}
                <div className="sm:col-span-2">
                  <FormField label="Nombre Completo" required error={errors.name}>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Ej: María Fernanda González"
                      disabled={isLoading}
                      className={getInputClassName(!!errors.name, false, isDark)}
                      autoComplete="name"
                    />
                  </FormField>
                </div>

                {/* Email - Full width */}
                <div className="sm:col-span-2">
                  <FormField
                    label="Correo Electrónico"
                    required
                    error={errors.email}
                    icon={Mail}
                  >
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        updateField('email', e.target.value.toLowerCase())
                      }
                      placeholder="usuario@afore-ejemplo.mx"
                      disabled={isLoading}
                      className={getInputClassName(!!errors.email, true, isDark)}
                      autoComplete="email"
                    />
                  </FormField>
                </div>

                {/* Phone */}
                <FormField label="Teléfono" error={errors.phone} icon={Phone}>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+52 55 1234 5678"
                    disabled={isLoading}
                    className={getInputClassName(!!errors.phone, true, isDark)}
                    autoComplete="tel"
                  />
                </FormField>

                {/* Role */}
                <FormField label="Rol" required icon={Shield}>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      updateField('role', e.target.value as UserRole)
                    }
                    disabled={isLoading}
                    className={getInputClassName(false, true, isDark)}
                  >
                    <option value={USER_ROLES.AFORE_ANALYST}>
                      Analista AFORE
                    </option>
                    <option value={USER_ROLES.AFORE_ADMIN}>
                      Administrador AFORE
                    </option>
                    <option value={USER_ROLES.SYSTEM_ADMIN}>
                      Administrador de Sistema
                    </option>
                    <option value={USER_ROLES.AUDITOR}>Auditor</option>
                  </select>
                </FormField>
              </div>
            </div>

            {/* Section: Organization Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3
                className={cn(
                  'text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2',
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                )}
              >
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Información Organizacional
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Department */}
                <FormField label="Departamento">
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    placeholder="Ej: Validaciones"
                    disabled={isLoading}
                    className={getInputClassName(false, false, isDark)}
                  />
                </FormField>

                {/* Position */}
                <FormField label="Puesto" icon={Briefcase}>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => updateField('position', e.target.value)}
                    placeholder="Ej: Analista Senior"
                    disabled={isLoading}
                    className={getInputClassName(false, true, isDark)}
                  />
                </FormField>

                {/* Employee Number - Full width */}
                <div className="sm:col-span-2">
                  <FormField label="Número de Empleado">
                    <input
                      type="text"
                      value={formData.employeeNumber}
                      onChange={(e) =>
                        updateField('employeeNumber', e.target.value.toUpperCase())
                      }
                      placeholder="EMP-001"
                      disabled={isLoading}
                      className={getInputClassName(false, false, isDark)}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Compliance Notice */}
            <ComplianceNotice />
          </div>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            Crear Usuario
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================================================
// EDIT USER MODAL
// ============================================================================

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onSubmit: (userId: string, data: EditUserFormData) => void
  isLoading?: boolean
}

export function EditUserModal({
  isOpen,
  onClose,
  user,
  onSubmit,
  isLoading = false,
}: EditUserModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [formData, setFormData] = useState<EditUserFormData>({
    name: user.name,
    phone: user.phone || '',
    role: user.role,
    department: user.department || '',
    position: user.position || '',
    employeeNumber: user.employeeNumber || '',
  })

  const [errors, setErrors] = useState<
    Partial<Record<keyof EditUserFormData, string>>
  >({})

  // Update form when user changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name,
        phone: user.phone || '',
        role: user.role,
        department: user.department || '',
        position: user.position || '',
        employeeNumber: user.employeeNumber || '',
      })
      setErrors({})
    }
  }, [isOpen, user])

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof EditUserFormData, string>> = {}

    if (formData.name && formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }

    if (formData.phone && !/^\+?[0-9\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Teléfono inválido (mínimo 10 dígitos)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      // Only send changed fields
      const changedData: EditUserFormData = {}
      if (formData.name !== user.name) changedData.name = formData.name
      if (formData.phone !== user.phone) changedData.phone = formData.phone
      if (formData.role !== user.role) changedData.role = formData.role
      if (formData.department !== user.department)
        changedData.department = formData.department
      if (formData.position !== user.position)
        changedData.position = formData.position
      if (formData.employeeNumber !== user.employeeNumber)
        changedData.employeeNumber = formData.employeeNumber

      onSubmit(user.id, changedData)
    }
  }, [validateForm, formData, user, onSubmit])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose()
      }
    },
    [onClose]
  )

  const updateField = useCallback(
    <K extends keyof EditUserFormData>(field: K, value: EditUserFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    },
    [errors]
  )

  return (
    <ResponsiveModal open={isOpen} onOpenChange={handleOpenChange}>
      <ResponsiveModalContent size="lg">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-3 sm:gap-4">
            <ModalHeaderIcon icon={UserCog} variant="warning" />
            <div className="min-w-0 flex-1">
              <ResponsiveModalTitle>Editar Usuario</ResponsiveModalTitle>
              <ResponsiveModalDescription className="truncate">
                {user.email}
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Name - Full width */}
            <div className="sm:col-span-2">
              <FormField label="Nombre Completo" error={errors.name}>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  disabled={isLoading}
                  className={getInputClassName(!!errors.name, false, isDark)}
                  autoComplete="name"
                />
              </FormField>
            </div>

            {/* Phone */}
            <FormField label="Teléfono" error={errors.phone} icon={Phone}>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                disabled={isLoading}
                className={getInputClassName(!!errors.phone, true, isDark)}
                autoComplete="tel"
              />
            </FormField>

            {/* Role */}
            <FormField label="Rol" icon={Shield}>
              <select
                value={formData.role}
                onChange={(e) => updateField('role', e.target.value as UserRole)}
                disabled={isLoading}
                className={getInputClassName(false, true, isDark)}
              >
                <option value={USER_ROLES.AFORE_ANALYST}>Analista AFORE</option>
                <option value={USER_ROLES.AFORE_ADMIN}>
                  Administrador AFORE
                </option>
                <option value={USER_ROLES.SYSTEM_ADMIN}>
                  Administrador de Sistema
                </option>
                <option value={USER_ROLES.AUDITOR}>Auditor</option>
              </select>
            </FormField>

            {/* Department */}
            <FormField label="Departamento">
              <input
                type="text"
                value={formData.department}
                onChange={(e) => updateField('department', e.target.value)}
                disabled={isLoading}
                className={getInputClassName(false, false, isDark)}
              />
            </FormField>

            {/* Position */}
            <FormField label="Puesto" icon={Briefcase}>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => updateField('position', e.target.value)}
                disabled={isLoading}
                className={getInputClassName(false, true, isDark)}
              />
            </FormField>

            {/* Employee Number - Full width */}
            <div className="sm:col-span-2">
              <FormField label="Número de Empleado">
                <input
                  type="text"
                  value={formData.employeeNumber}
                  onChange={(e) =>
                    updateField('employeeNumber', e.target.value.toUpperCase())
                  }
                  disabled={isLoading}
                  className={getInputClassName(false, false, isDark)}
                />
              </FormField>
            </div>
          </div>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            Guardar Cambios
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
