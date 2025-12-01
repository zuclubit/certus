/**
 * TenantDetail Page - Enterprise 2025
 *
 * Detail page for viewing and managing a specific AFORE/Tenant.
 * Includes user management functionality.
 *
 * Features:
 * - Tenant information display
 * - User list with filtering
 * - User role management
 * - User suspension/reactivation
 * - User invitation
 *
 * @version 1.0.0
 * @compliance CONSAR 2025
 */

import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Building2,
  Users,
  ArrowLeft,
  Edit2,
  UserPlus,
  Search,
  Mail,
  Clock,
  Shield,
  MoreVertical,
  RefreshCw,
  Ban,
  ChevronRight,
  Activity,
} from 'lucide-react'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalBody,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from '@/components/ui/responsive-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Tenant components
import {
  EditTenantModal,
  InviteUserModal,
  type EditTenantFormData,
} from '@/components/tenants'

// Hooks
import {
  useTenant,
  useTenantUsers,
  useUpdateTenant,
  useInviteUser,
  useChangeUserRole,
  useSuspendTenantUser,
  useReactivateTenantUser,
} from '@/hooks/useTenants'

// Types
import type {
  TenantEntity,
  TenantUserEntity,
  TenantUserRole,
  TenantUsersParams,
  InviteUserRequest,
} from '@/types/tenant.types'
import {
  parseTenantSettings,
  formDataToUpdateRequest,
  getRoleDisplayName,
  getRoleBadgeColor,
  getStatusDisplayName,
  getStatusBadgeColor,
} from '@/types/tenant.types'

// ============================================================================
// TYPES
// ============================================================================

interface UserCardProps {
  user: TenantUserEntity
  isDark: boolean
  onChangeRole: (user: TenantUserEntity) => void
  onSuspend: (user: TenantUserEntity) => void
  onReactivate: (user: TenantUserEntity) => void
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TenantHeader({
  tenant,
  isDark,
  onEdit,
  onInvite,
}: {
  tenant: TenantEntity
  isDark: boolean
  onEdit: () => void
  onInvite: () => void
}) {
  const settings = parseTenantSettings(tenant.settings)

  return (
    <div
      className="rounded-xl sm:rounded-[20px] p-4 sm:p-6"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)'
          : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)',
        backdropFilter: 'blur(16px) saturate(140%)',
        border: isDark
          ? '1px solid rgba(139, 92, 246, 0.2)'
          : '1px solid rgba(139, 92, 246, 0.15)',
      }}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          {tenant.logo ? (
            <img
              src={tenant.logo}
              alt={tenant.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover"
              style={{ border: '3px solid rgba(139, 92, 246, 0.3)' }}
            />
          ) : (
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
                border: '3px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-violet-500" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className={cn('text-xl sm:text-2xl font-bold', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                  {tenant.name}
                </h1>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    tenant.isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  )}
                >
                  {tenant.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <p className={cn('text-sm font-mono', isDark ? 'text-violet-400' : 'text-violet-600')}>
                Código: {tenant.aforeCode}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="gap-2" onClick={onEdit}>
                <Edit2 className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              {tenant.isActive && (
                <Button
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
                  onClick={onInvite}
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Invitar</span>
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Users className={cn('h-4 w-4', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
              <span className={cn('text-sm', isDark ? 'text-neutral-300' : 'text-neutral-600')}>
                {tenant.userCount} usuarios
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className={cn('h-4 w-4', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
              <span className={cn('text-sm', isDark ? 'text-neutral-300' : 'text-neutral-600')}>
                {tenant.validationCount} validaciones
              </span>
            </div>
            {settings.timezone && (
              <div className="flex items-center gap-2">
                <Clock className={cn('h-4 w-4', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
                <span className={cn('text-sm', isDark ? 'text-neutral-300' : 'text-neutral-600')}>
                  {settings.timezone}
                </span>
              </div>
            )}
            {settings.features?.enableMfa && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/15 text-emerald-500">
                MFA Activo
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function UserCard({ user, isDark, onChangeRole, onSuspend, onReactivate }: UserCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(16px) saturate(140%)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(255, 255, 255, 0.6)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-semibold"
          style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)' }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn('font-medium truncate', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
              {user.name}
            </span>
            <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border', getRoleBadgeColor(user.role as TenantUserRole))}>
              {getRoleDisplayName(user.role as TenantUserRole)}
            </span>
            <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border', getStatusBadgeColor(user.status as any))}>
              {getStatusDisplayName(user.status as any)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Mail className={cn('h-3 w-3', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
              <span className={cn('truncate', isDark ? 'text-neutral-400' : 'text-neutral-600')}>{user.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className={cn('h-3 w-3', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
              <span className={cn(isDark ? 'text-neutral-500' : 'text-neutral-500')}>
                Último acceso: {formatDate(user.lastLogin)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn('p-2 rounded-lg transition-colors', isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100')}>
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onChangeRole(user)}>
              <Shield className="h-4 w-4 mr-2" />
              Cambiar rol
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.status === 'Active' ? (
              <DropdownMenuItem onClick={() => onSuspend(user)} className="text-amber-600">
                <Ban className="h-4 w-4 mr-2" />
                Suspender
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onReactivate(user)} className="text-emerald-600">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reactivar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function ChangeRoleModal({
  isOpen,
  onClose,
  user,
  currentRole,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  user: TenantUserEntity | null
  currentRole: TenantUserRole
  onSubmit: (role: TenantUserRole) => void
  isLoading: boolean
}) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const [selectedRole, setSelectedRole] = useState<TenantUserRole>(currentRole)

  const roles: { value: TenantUserRole; label: string }[] = [
    { value: 'AforeAdmin', label: 'Administrador AFORE' },
    { value: 'AforeAnalyst', label: 'Analista' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Auditor', label: 'Auditor' },
    { value: 'Viewer', label: 'Visualizador' },
  ]

  if (!user) return null

  const handleClose = () => {
    setSelectedRole(currentRole)
    onClose()
  }

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                isDark ? 'bg-blue-950/40' : 'bg-blue-100'
              )}
              style={{
                border: isDark ? '1.5px solid rgba(59, 130, 246, 0.3)' : '1.5px solid rgba(59, 130, 246, 0.25)',
              }}
            >
              <Shield className={cn('h-5 w-5', isDark ? 'text-blue-400' : 'text-blue-600')} />
            </div>
            <div className="flex-1 min-w-0">
              <ResponsiveModalTitle>Cambiar rol de usuario</ResponsiveModalTitle>
              <ResponsiveModalDescription className="mt-1">
                Seleccione el nuevo rol para {user.name}
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>
          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                className={cn(
                  'w-full p-3 rounded-lg text-left transition-all duration-200 border-2',
                  selectedRole === role.value
                    ? 'border-violet-500 bg-violet-500/10'
                    : isDark
                      ? 'border-neutral-700 hover:border-neutral-600 bg-neutral-800/50'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('font-medium text-sm', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                    {role.label}
                  </span>
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      selectedRole === role.value ? 'border-violet-500 bg-violet-500' : isDark ? 'border-neutral-600' : 'border-neutral-300'
                    )}
                  >
                    {selectedRole === role.value && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={() => onSubmit(selectedRole)}
            disabled={isLoading || selectedRole === currentRole}
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
          >
            {isLoading ? 'Guardando...' : 'Cambiar rol'}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TenantDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const { toast } = useToast()

  // ========================================
  // STATE
  // ========================================
  const [searchQuery, setSearchQuery] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<TenantUserEntity | null>(null)

  // ========================================
  // DATA
  // ========================================
  const { data: tenant, isLoading: isLoadingTenant } = useTenant(id || '')
  const usersParams = useMemo<TenantUsersParams>(
    () => ({ search: searchQuery || undefined }),
    [searchQuery]
  )
  const { data: usersData, isLoading: isLoadingUsers } = useTenantUsers(id || '', usersParams)
  const users = usersData?.items ?? []

  // ========================================
  // MUTATIONS
  // ========================================
  const updateTenantMutation = useUpdateTenant()
  const inviteUserMutation = useInviteUser()
  const changeRoleMutation = useChangeUserRole()
  const suspendMutation = useSuspendTenantUser()
  const reactivateMutation = useReactivateTenantUser()

  // ========================================
  // HANDLERS
  // ========================================
  const handleEditTenant = useCallback(
    (tenantId: string, data: EditTenantFormData) => {
      const request = formDataToUpdateRequest(data)
      updateTenantMutation.mutate(
        { tenantId, data: request },
        {
          onSuccess: () => {
            setShowEditModal(false)
            toast({ title: 'AFORE actualizada', description: 'Los cambios han sido guardados.' })
          },
          onError: (error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
          },
        }
      )
    },
    [updateTenantMutation, toast]
  )

  const handleInviteUser = useCallback(
    (tenantId: string, data: InviteUserRequest) => {
      inviteUserMutation.mutate(
        { tenantId, data },
        {
          onSuccess: () => {
            setShowInviteModal(false)
            toast({ title: 'Invitación enviada', description: `Se ha enviado una invitación a ${data.email}.` })
          },
          onError: (error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
          },
        }
      )
    },
    [inviteUserMutation, toast]
  )

  const handleChangeRole = useCallback(
    (role: TenantUserRole) => {
      if (!selectedUser || !id) return
      changeRoleMutation.mutate(
        { tenantId: id, userId: selectedUser.id, role },
        {
          onSuccess: () => {
            setShowChangeRoleModal(false)
            setSelectedUser(null)
            toast({ title: 'Rol actualizado', description: 'El rol del usuario ha sido actualizado.' })
          },
          onError: (error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
          },
        }
      )
    },
    [selectedUser, id, changeRoleMutation, toast]
  )

  const handleSuspend = useCallback(
    (justification?: string) => {
      if (!selectedUser || !id || !justification) return
      suspendMutation.mutate(
        { tenantId: id, userId: selectedUser.id, reason: justification },
        {
          onSuccess: () => {
            setShowSuspendModal(false)
            setSelectedUser(null)
            toast({ title: 'Usuario suspendido', description: 'El usuario ha sido suspendido.' })
          },
          onError: (error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
          },
        }
      )
    },
    [selectedUser, id, suspendMutation, toast]
  )

  const handleReactivate = useCallback(
    (user: TenantUserEntity) => {
      if (!id) return
      reactivateMutation.mutate(
        { tenantId: id, userId: user.id },
        {
          onSuccess: () => {
            toast({ title: 'Usuario reactivado', description: 'El usuario ha sido reactivado.' })
          },
          onError: (error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
          },
        }
      )
    },
    [id, reactivateMutation, toast]
  )

  // ========================================
  // RENDER
  // ========================================
  if (isLoadingTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">AFORE no encontrada</h2>
          <Button onClick={() => navigate('/tenants')}>Volver a la lista</Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen pb-safe"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #070B14 0%, #0C111C 50%, #0A0E18 100%)'
          : 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-3 xs:px-4 sm:px-6 py-3 xs:py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <Link
            to="/tenants"
            className={cn(
              'flex items-center gap-1 hover:underline',
              isDark ? 'text-neutral-400 hover:text-neutral-300' : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            AFOREs
          </Link>
          <ChevronRight className={cn('h-4 w-4', isDark ? 'text-neutral-600' : 'text-neutral-400')} />
          <span className={cn('font-medium', isDark ? 'text-neutral-200' : 'text-neutral-800')}>{tenant.name}</span>
        </nav>

        {/* Header */}
        <TenantHeader
          tenant={tenant}
          isDark={isDark}
          onEdit={() => setShowEditModal(true)}
          onInvite={() => setShowInviteModal(true)}
        />

        {/* Users Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={cn('text-lg font-semibold', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
              Usuarios ({users.length})
            </h2>
            <div className="relative w-64">
              <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar usuario..."
                className={cn(
                  'w-full pl-10 pr-4 py-2 rounded-lg text-sm border',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
                  isDark
                    ? 'bg-neutral-800/50 text-neutral-100 border-neutral-700'
                    : 'bg-white/50 text-neutral-900 border-neutral-200'
                )}
              />
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {isLoadingUsers ? (
              <div className="text-center py-8 text-neutral-500">Cargando usuarios...</div>
            ) : users.length === 0 ? (
              <div
                className="rounded-xl p-8 text-center"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                }}
              >
                <Users className="h-12 w-12 mx-auto mb-3 text-neutral-400" />
                <p className="text-neutral-500">No hay usuarios en esta AFORE</p>
              </div>
            ) : (
              users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  isDark={isDark}
                  onChangeRole={(u) => {
                    setSelectedUser(u)
                    setShowChangeRoleModal(true)
                  }}
                  onSuspend={(u) => {
                    setSelectedUser(u)
                    setShowSuspendModal(true)
                  }}
                  onReactivate={handleReactivate}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditTenantModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        tenant={tenant}
        onSubmit={handleEditTenant}
        isLoading={updateTenantMutation.isPending}
      />

      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        tenant={tenant}
        onSubmit={handleInviteUser}
        isLoading={inviteUserMutation.isPending}
      />

      <ChangeRoleModal
        isOpen={showChangeRoleModal}
        onClose={() => {
          setShowChangeRoleModal(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        currentRole={(selectedUser?.role as TenantUserRole) || 'Viewer'}
        onSubmit={handleChangeRole}
        isLoading={changeRoleMutation.isPending}
      />

      <ConfirmationModal
        open={showSuspendModal && selectedUser !== null}
        onOpenChange={(open) => {
          setShowSuspendModal(open)
          if (!open) setSelectedUser(null)
        }}
        title="Suspender usuario"
        description={selectedUser ? `¿Está seguro de suspender a "${selectedUser.name}"? El usuario no podrá acceder al sistema.` : ''}
        confirmLabel="Suspender"
        cancelLabel="Cancelar"
        variant="warning"
        requireJustification
        justificationLabel="Motivo de suspensión"
        justificationPlaceholder="Proporcione el motivo de la suspensión..."
        minJustificationLength={10}
        onConfirm={handleSuspend}
        isLoading={suspendMutation.isPending}
      />
    </div>
  )
}

export default TenantDetail
