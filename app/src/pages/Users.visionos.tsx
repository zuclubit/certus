/**
 * Users VisionOS - Enterprise 2025
 *
 * Página de gestión de usuarios completamente refactorizada.
 * Implementa las mejores prácticas de 2025:
 *
 * - Arquitectura modular con componentes reutilizables
 * - Mobile-first responsive design
 * - Prevención de desbordamiento en todas las pantallas
 * - Accesibilidad WCAG 2.1 AA
 * - Performance optimizada con memo y useMemo
 *
 * @see https://tanstack.com/table/latest
 * @see https://ui.shadcn.com/docs/components/drawer
 * @see https://www.smashingmagazine.com/2022/12/accessible-front-end-patterns-responsive-tables-part1/
 */

import { useState, useMemo, useCallback } from 'react'
import { Users as UsersIcon } from 'lucide-react'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { cn } from '@/lib/utils'

// Componentes modulares del módulo de usuarios
import {
  UserPageHeader,
  UserStatsGrid,
  UserFilters,
  UserCard,
  CreateUserModal,
  EditUserModal,
  type CreateUserFormData,
  type EditUserFormData,
} from '@/components/users'

// Modal de confirmación
import { ConfirmationModal } from '@/components/ui/confirmation-modal'

// Hooks de datos
import {
  useUsers,
  useUserStatistics,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useSuspendUser,
  useReactivateUser,
} from '@/hooks/useUsers'

// Types
import type { User } from '@/types'

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="rounded-xl sm:rounded-[20px] p-8 sm:p-12 text-center"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(16px) saturate(140%)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.06)'
          : '1px solid rgba(255, 255, 255, 0.6)',
      }}
    >
      <UsersIcon
        className={cn(
          'h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4',
          isDark ? 'text-neutral-600' : 'text-neutral-300'
        )}
      />
      <h3
        className={cn(
          'text-base sm:text-lg font-semibold mb-2',
          isDark ? 'text-neutral-300' : 'text-neutral-700'
        )}
      >
        No se encontraron usuarios
      </h3>
      <p
        className={cn(
          'text-sm',
          isDark ? 'text-neutral-500' : 'text-neutral-500'
        )}
      >
        Intenta ajustar los filtros o crea un nuevo usuario
      </p>
    </div>
  )
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function LoadingSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl sm:rounded-[20px] p-4 sm:p-6 animate-pulse"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          }}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={cn(
                'w-12 h-12 sm:w-14 sm:h-14 rounded-xl',
                isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
              )}
            />
            <div className="flex-1 space-y-2">
              <div
                className={cn(
                  'h-5 w-32 sm:w-48 rounded',
                  isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
                )}
              />
              <div
                className={cn(
                  'h-4 w-48 sm:w-64 rounded',
                  isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
                )}
              />
              <div className="flex gap-2">
                <div
                  className={cn(
                    'h-6 w-20 rounded-md',
                    isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
                  )}
                />
                <div
                  className={cn(
                    'h-6 w-16 rounded-md',
                    isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export function UsersVisionOS() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  // Filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<User['status'] | 'all'>('all')
  const [roleFilter, setRoleFilter] = useState<string | 'all'>('all')

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // ========================================
  // DATA FETCHING
  // ========================================

  const filters = useMemo(() => {
    const f: Record<string, string> = {}
    if (statusFilter !== 'all') f.status = statusFilter
    if (roleFilter !== 'all') f.role = roleFilter
    if (searchQuery) f.search = searchQuery
    return f
  }, [statusFilter, roleFilter, searchQuery])

  const { data: users = [], isLoading: isLoadingUsers } = useUsers(filters)
  const { data: statistics, isLoading: isLoadingStats } = useUserStatistics()

  // ========================================
  // MUTATIONS
  // ========================================

  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()
  const suspendUserMutation = useSuspendUser()
  const reactivateUserMutation = useReactivateUser()

  // ========================================
  // HANDLERS
  // ========================================

  const handleCreateUser = useCallback((data: CreateUserFormData) => {
    createUserMutation.mutate(data, {
      onSuccess: () => setShowCreateModal(false),
    })
  }, [createUserMutation])

  const handleEditUser = useCallback((userId: string, data: EditUserFormData) => {
    updateUserMutation.mutate(
      { userId, data },
      {
        onSuccess: () => {
          setShowEditModal(false)
          setSelectedUser(null)
        },
      }
    )
  }, [updateUserMutation])

  const handleDeleteUser = useCallback((justification?: string) => {
    if (selectedUser && justification) {
      deleteUserMutation.mutate(
        { userId: selectedUser.id, justification },
        {
          onSuccess: () => {
            setShowDeleteModal(false)
            setSelectedUser(null)
          },
        }
      )
    }
  }, [selectedUser, deleteUserMutation])

  const handleSuspendUser = useCallback((justification?: string) => {
    if (selectedUser && justification) {
      suspendUserMutation.mutate(
        { userId: selectedUser.id, reason: justification },
        {
          onSuccess: () => {
            setShowSuspendModal(false)
            setSelectedUser(null)
          },
        }
      )
    }
  }, [selectedUser, suspendUserMutation])

  const handleReactivateUser = useCallback((user: User) => {
    reactivateUserMutation.mutate(user.id)
  }, [reactivateUserMutation])

  // User card action handlers
  const handleEditClick = useCallback((user: User) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }, [])

  const handleDeleteClick = useCallback((user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }, [])

  const handleSuspendClick = useCallback((user: User) => {
    setSelectedUser(user)
    setShowSuspendModal(true)
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setRoleFilter('all')
  }, [])

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className="min-h-screen pb-safe"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #070B14 0%, #0C111C 50%, #0A0E18 100%)'
          : 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
      }}
    >
      {/* Contenedor principal con padding responsive y safe areas */}
      <div className="max-w-[1800px] mx-auto px-3 xs:px-4 sm:px-6 py-3 xs:py-4 sm:py-6 space-y-3 xs:space-y-4 sm:space-y-6">
        {/* ================================================================ */}
        {/* HEADER - Responsive con stack en móvil */}
        {/* ================================================================ */}
        <UserPageHeader
          onCreateUser={() => setShowCreateModal(true)}
          isLoading={createUserMutation.isPending}
        />

        {/* ================================================================ */}
        {/* STATS DASHBOARD - Grid responsive */}
        {/* ================================================================ */}
        <UserStatsGrid statistics={statistics} isLoading={isLoadingStats} />

        {/* ================================================================ */}
        {/* FILTERS - Colapsable en móvil */}
        {/* ================================================================ */}
        <UserFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          onClearFilters={handleClearFilters}
        />

        {/* ================================================================ */}
        {/* USERS LIST - Cards responsive */}
        {/* ================================================================ */}
        <div
          className="space-y-3 sm:space-y-4"
          role="region"
          aria-label="Lista de usuarios"
          aria-busy={isLoadingUsers}
        >
          {isLoadingUsers ? (
            <LoadingSkeleton isDark={isDark} />
          ) : users.length === 0 ? (
            <EmptyState isDark={isDark} />
          ) : (
            users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onSuspend={handleSuspendClick}
                onReactivate={handleReactivateUser}
              />
            ))
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* MODALS */}
      {/* ================================================================ */}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        isLoading={createUserMutation.isPending}
      />

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
          onSubmit={handleEditUser}
          isLoading={updateUserMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteModal && selectedUser !== null}
        onOpenChange={(open) => {
          setShowDeleteModal(open)
          if (!open) setSelectedUser(null)
        }}
        title="Eliminar Usuario"
        description={
          selectedUser
            ? `¿Está seguro de eliminar al usuario "${selectedUser.name}"? Esta acción marcará el registro como eliminado y se registrará en el historial de auditoría.`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        requireJustification={true}
        justificationLabel="Justificación (requerida por normatividad)"
        justificationPlaceholder="Por favor proporciona una razón detallada para eliminar este usuario. Esta información será registrada en el historial de auditoría y es requerida por las regulaciones CONSAR y cumplimiento normativo."
        minJustificationLength={20}
        onConfirm={handleDeleteUser}
        isLoading={deleteUserMutation.isPending}
      />

      {/* Suspend Confirmation Modal */}
      <ConfirmationModal
        open={showSuspendModal && selectedUser !== null}
        onOpenChange={(open) => {
          setShowSuspendModal(open)
          if (!open) setSelectedUser(null)
        }}
        title="Suspender Usuario"
        description={
          selectedUser
            ? `¿Está seguro de suspender al usuario "${selectedUser.name}"? El usuario no podrá acceder al sistema hasta que sea reactivado.`
            : ''
        }
        confirmLabel="Suspender"
        cancelLabel="Cancelar"
        variant="warning"
        requireJustification={true}
        justificationLabel="Motivo de suspensión (requerido)"
        justificationPlaceholder="Proporciona el motivo de la suspensión. Ejemplo: Incumplimiento de políticas de seguridad, ausencia prolongada, etc."
        minJustificationLength={20}
        onConfirm={handleSuspendUser}
        isLoading={suspendUserMutation.isPending}
      />
    </div>
  )
}

export default UsersVisionOS
