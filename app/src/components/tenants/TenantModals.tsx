/**
 * TenantModals Component - Enterprise 2025
 *
 * Modal components for creating and editing tenants/AFOREs.
 * Follows VisionOS design patterns and accessibility standards.
 *
 * @version 1.0.0
 * @compliance CONSAR 2025
 */

import { memo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Building2, Globe, Shield } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import type { TenantEntity } from '@/types/tenant.types'
import { parseTenantSettings } from '@/types/tenant.types'

// ============================================================================
// TYPES
// ============================================================================

export interface CreateTenantFormData {
  name: string
  aforeCode: string
  logo?: string
  timezone: string
  language: string
  enableMfa: boolean
  emailNotifications: boolean
  inAppNotifications: boolean
}

export interface EditTenantFormData {
  name: string
  logo?: string
  timezone: string
  language: string
  enableMfa: boolean
  emailNotifications: boolean
  inAppNotifications: boolean
}

interface CreateTenantModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTenantFormData) => void
  isLoading?: boolean
}

interface EditTenantModalProps {
  isOpen: boolean
  onClose: () => void
  tenant: TenantEntity
  onSubmit: (tenantId: string, data: EditTenantFormData) => void
  isLoading?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TIMEZONES = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/Tijuana', label: 'Tijuana (GMT-8)' },
  { value: 'America/Hermosillo', label: 'Hermosillo (GMT-7)' },
  { value: 'America/Cancun', label: 'Cancún (GMT-5)' },
]

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
]

// ============================================================================
// CREATE MODAL
// ============================================================================

export const CreateTenantModal = memo(function CreateTenantModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateTenantModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTenantFormData>({
    defaultValues: {
      name: '',
      aforeCode: '',
      logo: '',
      timezone: 'America/Mexico_City',
      language: 'es',
      enableMfa: true,
      emailNotifications: true,
      inAppNotifications: true,
    },
  })

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const handleFormSubmit = (data: CreateTenantFormData) => {
    onSubmit(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              <Building2 className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <DialogTitle>Nueva AFORE</DialogTitle>
              <DialogDescription>
                Complete los datos para registrar una nueva organización AFORE
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 mt-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className={cn('text-sm font-semibold', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
              Información básica
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nombre de la AFORE *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'El nombre es requerido' })}
                  placeholder="AFORE Ejemplo S.A. de C.V."
                  className="mt-1.5"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="aforeCode">Código AFORE *</Label>
                <Input
                  id="aforeCode"
                  {...register('aforeCode', {
                    required: 'El código es requerido',
                    pattern: {
                      value: /^[A-Z0-9]+$/,
                      message: 'Solo letras mayúsculas y números',
                    },
                    maxLength: { value: 10, message: 'Máximo 10 caracteres' },
                  })}
                  placeholder="AFE001"
                  className="mt-1.5 font-mono uppercase"
                />
                {errors.aforeCode && (
                  <p className="text-xs text-red-500 mt-1">{errors.aforeCode.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="logo">URL del Logo</Label>
                <Input
                  id="logo"
                  {...register('logo')}
                  placeholder="https://..."
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="space-y-4">
            <h4 className={cn('text-sm font-semibold flex items-center gap-2', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
              <Globe className="h-4 w-4" />
              Configuración regional
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timezone">Zona horaria</Label>
                <select
                  id="timezone"
                  {...register('timezone')}
                  className={cn(
                    'w-full mt-1.5 px-3 py-2 rounded-lg text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-100'
                      : 'bg-white border-neutral-200 text-neutral-900',
                    'border'
                  )}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="language">Idioma</Label>
                <select
                  id="language"
                  {...register('language')}
                  className={cn(
                    'w-full mt-1.5 px-3 py-2 rounded-lg text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-100'
                      : 'bg-white border-neutral-200 text-neutral-900',
                    'border'
                  )}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Security & Notifications */}
          <div className="space-y-4">
            <h4 className={cn('text-sm font-semibold flex items-center gap-2', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
              <Shield className="h-4 w-4" />
              Seguridad y notificaciones
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Autenticación de dos factores (MFA)</Label>
                  <p className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-400')}>
                    Requiere verificación adicional al iniciar sesión
                  </p>
                </div>
                <Switch
                  checked={watch('enableMfa')}
                  onCheckedChange={(checked: boolean) => setValue('enableMfa', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones por email</Label>
                  <p className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-400')}>
                    Alertas y reportes por correo electrónico
                  </p>
                </div>
                <Switch
                  checked={watch('emailNotifications')}
                  onCheckedChange={(checked: boolean) => setValue('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones en la aplicación</Label>
                  <p className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-400')}>
                    Alertas en tiempo real dentro del sistema
                  </p>
                </div>
                <Switch
                  checked={watch('inAppNotifications')}
                  onCheckedChange={(checked: boolean) => setValue('inAppNotifications', checked)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
            >
              {isLoading ? 'Creando...' : 'Crear AFORE'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
})

// ============================================================================
// EDIT MODAL
// ============================================================================

export const EditTenantModal = memo(function EditTenantModal({
  isOpen,
  onClose,
  tenant,
  onSubmit,
  isLoading = false,
}: EditTenantModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const settings = parseTenantSettings(tenant.settings)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditTenantFormData>({
    defaultValues: {
      name: tenant.name,
      logo: tenant.logo || '',
      timezone: settings.timezone || 'America/Mexico_City',
      language: settings.language || 'es',
      enableMfa: settings.features?.enableMfa ?? true,
      emailNotifications: settings.notifications?.email ?? true,
      inAppNotifications: settings.notifications?.inApp ?? true,
    },
  })

  // Reset form when tenant changes
  useEffect(() => {
    if (isOpen && tenant) {
      const s = parseTenantSettings(tenant.settings)
      reset({
        name: tenant.name,
        logo: tenant.logo || '',
        timezone: s.timezone || 'America/Mexico_City',
        language: s.language || 'es',
        enableMfa: s.features?.enableMfa ?? true,
        emailNotifications: s.notifications?.email ?? true,
        inAppNotifications: s.notifications?.inApp ?? true,
      })
    }
  }, [isOpen, tenant, reset])

  const handleFormSubmit = (data: EditTenantFormData) => {
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
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <DialogTitle>Editar AFORE</DialogTitle>
              <DialogDescription>
                Modifique la configuración de {tenant.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 mt-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className={cn('text-sm font-semibold', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
              Información básica
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-name">Nombre de la AFORE *</Label>
                <Input
                  id="edit-name"
                  {...register('name', { required: 'El nombre es requerido' })}
                  className="mt-1.5"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label>Código AFORE</Label>
                <Input value={tenant.aforeCode} disabled className="mt-1.5 font-mono opacity-50" />
                <p className={cn('text-xs mt-1', isDark ? 'text-neutral-500' : 'text-neutral-400')}>
                  El código no puede ser modificado
                </p>
              </div>

              <div>
                <Label htmlFor="edit-logo">URL del Logo</Label>
                <Input
                  id="edit-logo"
                  {...register('logo')}
                  placeholder="https://..."
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="space-y-4">
            <h4 className={cn('text-sm font-semibold flex items-center gap-2', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
              <Globe className="h-4 w-4" />
              Configuración regional
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-timezone">Zona horaria</Label>
                <select
                  id="edit-timezone"
                  {...register('timezone')}
                  className={cn(
                    'w-full mt-1.5 px-3 py-2 rounded-lg text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-100'
                      : 'bg-white border-neutral-200 text-neutral-900',
                    'border'
                  )}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="edit-language">Idioma</Label>
                <select
                  id="edit-language"
                  {...register('language')}
                  className={cn(
                    'w-full mt-1.5 px-3 py-2 rounded-lg text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-100'
                      : 'bg-white border-neutral-200 text-neutral-900',
                    'border'
                  )}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Security & Notifications */}
          <div className="space-y-4">
            <h4 className={cn('text-sm font-semibold flex items-center gap-2', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
              <Shield className="h-4 w-4" />
              Seguridad y notificaciones
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Autenticación de dos factores (MFA)</Label>
                  <p className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-400')}>
                    Requiere verificación adicional al iniciar sesión
                  </p>
                </div>
                <Switch
                  checked={watch('enableMfa')}
                  onCheckedChange={(checked: boolean) => setValue('enableMfa', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones por email</Label>
                  <p className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-400')}>
                    Alertas y reportes por correo electrónico
                  </p>
                </div>
                <Switch
                  checked={watch('emailNotifications')}
                  onCheckedChange={(checked: boolean) => setValue('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones en la aplicación</Label>
                  <p className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-400')}>
                    Alertas en tiempo real dentro del sistema
                  </p>
                </div>
                <Switch
                  checked={watch('inAppNotifications')}
                  onCheckedChange={(checked: boolean) => setValue('inAppNotifications', checked)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
})

export default { CreateTenantModal, EditTenantModal }
