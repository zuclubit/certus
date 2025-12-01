/**
 * InviteUserModal Component - Enterprise 2025
 *
 * Modal for inviting users to a tenant/AFORE.
 * Follows VisionOS design patterns.
 *
 * @version 1.0.0
 * @compliance CONSAR 2025
 */

import { memo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { UserPlus, Mail, User, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { TenantEntity, TenantUserRole, InviteUserRequest } from '@/types/tenant.types'
import { getRoleDisplayName, getRoleBadgeColor } from '@/types/tenant.types'

// ============================================================================
// TYPES
// ============================================================================

export interface InviteUserFormData {
  email: string
  name: string
  role: TenantUserRole
}

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  tenant: TenantEntity
  onSubmit: (tenantId: string, data: InviteUserRequest) => void
  isLoading?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const AVAILABLE_ROLES: { value: TenantUserRole; label: string; description: string }[] = [
  {
    value: 'AforeAdmin',
    label: 'Administrador AFORE',
    description: 'Acceso completo a la gestión de la AFORE y sus usuarios',
  },
  {
    value: 'AforeAnalyst',
    label: 'Analista',
    description: 'Puede crear y revisar validaciones',
  },
  {
    value: 'Supervisor',
    label: 'Supervisor',
    description: 'Puede aprobar/rechazar validaciones y ver reportes',
  },
  {
    value: 'Auditor',
    label: 'Auditor',
    description: 'Acceso de solo lectura a validaciones y reportes',
  },
  {
    value: 'Viewer',
    label: 'Visualizador',
    description: 'Acceso limitado de solo lectura',
  },
]

// ============================================================================
// COMPONENT
// ============================================================================

export const InviteUserModal = memo(function InviteUserModal({
  isOpen,
  onClose,
  tenant,
  onSubmit,
  isLoading = false,
}: InviteUserModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InviteUserFormData>({
    defaultValues: {
      email: '',
      name: '',
      role: 'AforeAnalyst',
    },
  })

  const selectedRole = watch('role')

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const handleFormSubmit = (data: InviteUserFormData) => {
    onSubmit(tenant.id, data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <UserPlus className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <DialogTitle>Invitar Usuario</DialogTitle>
              <DialogDescription>
                Enviar invitación para unirse a <strong>{tenant.name}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 mt-4">
          {/* User Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-name" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Nombre completo *
              </Label>
              <Input
                id="invite-name"
                {...register('name', {
                  required: 'El nombre es requerido',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                })}
                placeholder="Juan Pérez García"
                className="mt-1.5"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="invite-email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Correo electrónico *
              </Label>
              <Input
                id="invite-email"
                type="email"
                {...register('email', {
                  required: 'El correo es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo electrónico inválido',
                  },
                })}
                placeholder="usuario@ejemplo.com"
                className="mt-1.5"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Rol en la organización *
            </Label>

            <div className="space-y-2">
              {AVAILABLE_ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setValue('role', role.value)}
                  className={cn(
                    'w-full p-3 rounded-xl text-left transition-all duration-200',
                    'border-2',
                    selectedRole === role.value
                      ? 'border-violet-500 bg-violet-500/10'
                      : isDark
                        ? 'border-neutral-700 hover:border-neutral-600 bg-neutral-800/50'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white/50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'font-medium text-sm',
                            isDark ? 'text-neutral-200' : 'text-neutral-800'
                          )}
                        >
                          {role.label}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-medium border',
                            getRoleBadgeColor(role.value)
                          )}
                        >
                          {getRoleDisplayName(role.value)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-xs mt-0.5',
                          isDark ? 'text-neutral-400' : 'text-neutral-500'
                        )}
                      >
                        {role.description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        selectedRole === role.value
                          ? 'border-violet-500 bg-violet-500'
                          : isDark
                            ? 'border-neutral-600'
                            : 'border-neutral-300'
                      )}
                    >
                      {selectedRole === role.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <input type="hidden" {...register('role', { required: true })} />
          </div>

          {/* Info Box */}
          <div
            className={cn(
              'p-3 rounded-xl text-xs',
              isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'
            )}
          >
            <p className={isDark ? 'text-blue-300' : 'text-blue-700'}>
              <strong>Nota:</strong> El usuario recibirá un correo electrónico con instrucciones
              para activar su cuenta y establecer su contraseña. La invitación expira en 7 días.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {isLoading ? 'Enviando...' : 'Enviar invitación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
})

export default InviteUserModal
