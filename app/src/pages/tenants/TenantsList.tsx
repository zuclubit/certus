/**
 * TenantsList Page - Enterprise 2025
 *
 * Main page for AFORE/Tenant management.
 * Only accessible by SystemAdmin users.
 *
 * Features:
 * - List all tenants with filtering and search
 * - Create, edit, activate/deactivate tenants
 * - Statistics dashboard
 * - User invitation
 *
 * @version 1.0.0
 * @compliance CONSAR 2025
 */

import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// Tenant components
import {
  TenantPageHeader,
  TenantStatsGrid,
  TenantFilters,
  TenantCard,
  CreateTenantModal,
  EditTenantModal,
  InviteUserModal,
  type CreateTenantFormData,
  type EditTenantFormData,
} from '@/components/tenants'

// Confirmation modal
import { ConfirmationModal } from '@/components/ui/confirmation-modal'

// Hooks
import {
  useTenants,
  useTenantStatistics,
  useCreateTenant,
  useUpdateTenant,
  useActivateTenant,
  useDeactivateTenant,
  useInviteUser,
} from '@/hooks/useTenants'

// Types
import type { TenantEntity, TenantListParams, InviteUserRequest } from '@/types/tenant.types'
import { formDataToCreateRequest, formDataToUpdateRequest } from '@/types/tenant.types'

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
      <Building2
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
        No se encontraron AFOREs
      </h3>
      <p
        className={cn('text-sm', isDark ? 'text-neutral-500' : 'text-neutral-500')}
      >
        Intenta ajustar los filtros o crea una nueva AFORE
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
                'w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl',
                isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
              )}
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-5 w-32 sm:w-48 rounded',
                    isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
                  )}
                />
                <div
                  className={cn(
                    'h-5 w-16 rounded',
                    isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
                  )}
                />
              </div>
              <div
                className={cn(
                  'h-4 w-48 sm:w-64 rounded',
                  isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
                )}
              />
              <div className="flex gap-2">
                <div
                  className={cn(
                    'h-6 w-16 rounded-md',
                    isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
                  )}
                />
                <div
                  className={cn(
                    'h-6 w-12 rounded-md',
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

export function TenantsList() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const { toast } = useToast()

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'createdAt'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showToggleModal, setShowToggleModal] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<TenantEntity | null>(null)

  // ========================================
  // DATA FETCHING
  // ========================================

  const queryParams = useMemo<TenantListParams>(() => ({
    search: searchQuery || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    sortBy,
    sortOrder,
    pageSize: 50,
  }), [searchQuery, statusFilter, sortBy, sortOrder])

  const { data: tenantsData, isLoading: isLoadingTenants } = useTenants(queryParams)
  const { data: statistics, isLoading: isLoadingStats } = useTenantStatistics()

  const tenants = tenantsData?.items ?? []

  // ========================================
  // MUTATIONS
  // ========================================

  const createTenantMutation = useCreateTenant()
  const updateTenantMutation = useUpdateTenant()
  const activateTenantMutation = useActivateTenant()
  const deactivateTenantMutation = useDeactivateTenant()
  const inviteUserMutation = useInviteUser()

  // ========================================
  // HANDLERS
  // ========================================

  const handleCreateTenant = useCallback(
    (data: CreateTenantFormData) => {
      const request = formDataToCreateRequest(data)
      createTenantMutation.mutate(request, {
        onSuccess: (newTenant) => {
          setShowCreateModal(false)
          toast({
            title: 'AFORE creada',
            description: `${newTenant.name} ha sido creada exitosamente.`,
          })
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message || 'No se pudo crear la AFORE.',
            variant: 'destructive',
          })
        },
      })
    },
    [createTenantMutation, toast]
  )

  const handleEditTenant = useCallback(
    (tenantId: string, data: EditTenantFormData) => {
      const request = formDataToUpdateRequest(data)
      updateTenantMutation.mutate(
        { tenantId, data: request },
        {
          onSuccess: () => {
            setShowEditModal(false)
            setSelectedTenant(null)
            toast({
              title: 'AFORE actualizada',
              description: 'Los cambios han sido guardados.',
            })
          },
          onError: (error) => {
            toast({
              title: 'Error',
              description: error.message || 'No se pudo actualizar la AFORE.',
              variant: 'destructive',
            })
          },
        }
      )
    },
    [updateTenantMutation, toast]
  )

  const handleToggleStatus = useCallback(
    (_justification?: string) => {
      if (!selectedTenant) return

      const mutation = selectedTenant.isActive
        ? deactivateTenantMutation
        : activateTenantMutation

      mutation.mutate(selectedTenant.id, {
        onSuccess: () => {
          setShowToggleModal(false)
          setSelectedTenant(null)
          toast({
            title: selectedTenant.isActive ? 'AFORE desactivada' : 'AFORE activada',
            description: `${selectedTenant.name} ha sido ${selectedTenant.isActive ? 'desactivada' : 'activada'}.`,
          })
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message || 'No se pudo cambiar el estado de la AFORE.',
            variant: 'destructive',
          })
        },
      })
    },
    [selectedTenant, activateTenantMutation, deactivateTenantMutation, toast]
  )

  const handleInviteUser = useCallback(
    (tenantId: string, data: InviteUserRequest) => {
      inviteUserMutation.mutate(
        { tenantId, data },
        {
          onSuccess: () => {
            setShowInviteModal(false)
            setSelectedTenant(null)
            toast({
              title: 'Invitación enviada',
              description: `Se ha enviado una invitación a ${data.email}.`,
            })
          },
          onError: (error) => {
            toast({
              title: 'Error',
              description: error.message || 'No se pudo enviar la invitación.',
              variant: 'destructive',
            })
          },
        }
      )
    },
    [inviteUserMutation, toast]
  )

  // Card action handlers
  const handleEditClick = useCallback((tenant: TenantEntity) => {
    setSelectedTenant(tenant)
    setShowEditModal(true)
  }, [])

  const handleViewUsersClick = useCallback(
    (tenant: TenantEntity) => {
      navigate(`/tenants/${tenant.id}`)
    },
    [navigate]
  )

  const handleInviteClick = useCallback((tenant: TenantEntity) => {
    setSelectedTenant(tenant)
    setShowInviteModal(true)
  }, [])

  const handleToggleClick = useCallback((tenant: TenantEntity) => {
    setSelectedTenant(tenant)
    setShowToggleModal(true)
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setSortBy('name')
    setSortOrder('asc')
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
      <div className="max-w-[1800px] mx-auto px-3 xs:px-4 sm:px-6 py-3 xs:py-4 sm:py-6 space-y-3 xs:space-y-4 sm:space-y-6">
        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}
        <TenantPageHeader
          onCreateTenant={() => setShowCreateModal(true)}
          isLoading={createTenantMutation.isPending}
        />

        {/* ================================================================ */}
        {/* STATS DASHBOARD */}
        {/* ================================================================ */}
        <TenantStatsGrid statistics={statistics} isLoading={isLoadingStats} />

        {/* ================================================================ */}
        {/* FILTERS */}
        {/* ================================================================ */}
        <TenantFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onClearFilters={handleClearFilters}
        />

        {/* ================================================================ */}
        {/* TENANTS LIST */}
        {/* ================================================================ */}
        <div
          className="space-y-3 sm:space-y-4"
          role="region"
          aria-label="Lista de AFOREs"
          aria-busy={isLoadingTenants}
        >
          {isLoadingTenants ? (
            <LoadingSkeleton isDark={isDark} />
          ) : tenants.length === 0 ? (
            <EmptyState isDark={isDark} />
          ) : (
            tenants.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                onEdit={handleEditClick}
                onViewUsers={handleViewUsersClick}
                onInviteUser={handleInviteClick}
                onToggleStatus={handleToggleClick}
              />
            ))
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* MODALS */}
      {/* ================================================================ */}

      {/* Create Tenant Modal */}
      <CreateTenantModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTenant}
        isLoading={createTenantMutation.isPending}
      />

      {/* Edit Tenant Modal */}
      {selectedTenant && (
        <EditTenantModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedTenant(null)
          }}
          tenant={selectedTenant}
          onSubmit={handleEditTenant}
          isLoading={updateTenantMutation.isPending}
        />
      )}

      {/* Invite User Modal */}
      {selectedTenant && (
        <InviteUserModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false)
            setSelectedTenant(null)
          }}
          tenant={selectedTenant}
          onSubmit={handleInviteUser}
          isLoading={inviteUserMutation.isPending}
        />
      )}

      {/* Toggle Status Confirmation Modal */}
      <ConfirmationModal
        open={showToggleModal && selectedTenant !== null}
        onOpenChange={(open) => {
          setShowToggleModal(open)
          if (!open) setSelectedTenant(null)
        }}
        title={selectedTenant?.isActive ? 'Desactivar AFORE' : 'Activar AFORE'}
        description={
          selectedTenant
            ? selectedTenant.isActive
              ? `¿Está seguro de desactivar "${selectedTenant.name}"? Los usuarios de esta AFORE no podrán acceder al sistema.`
              : `¿Está seguro de reactivar "${selectedTenant.name}"? Los usuarios podrán volver a acceder al sistema.`
            : ''
        }
        confirmLabel={selectedTenant?.isActive ? 'Desactivar' : 'Activar'}
        cancelLabel="Cancelar"
        variant={selectedTenant?.isActive ? 'danger' : 'info'}
        requireJustification={selectedTenant?.isActive}
        justificationLabel="Motivo de desactivación (requerido)"
        justificationPlaceholder="Proporcione el motivo de la desactivación. Esta información será registrada en el historial de auditoría."
        minJustificationLength={10}
        onConfirm={handleToggleStatus}
        isLoading={
          activateTenantMutation.isPending || deactivateTenantMutation.isPending
        }
      />
    </div>
  )
}

export default TenantsList
