/**
 * Approvals List Page - VisionOS Enterprise 2026
 *
 * Main page for viewing and managing approval workflows
 * Features: Filtering, sorting, search, bulk actions
 * Uses TanStack Query for data fetching
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { useApprovals, useApprovalStatistics } from '@/hooks/useApproval'
import { ApprovalWorkflowCard } from '@/components/approval'
import { SearchBar, FilterChip, PremiumButtonV2 } from '@/components/ui'
import {
  Filter,
  RefreshCw,
  Download,
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import type { ApprovalStatus, SLAStatus, ApprovalWorkflow } from '@/types'

// ============================================
// MAIN COMPONENT
// ============================================

export default function ApprovalsList() {
  const navigate = useNavigate()
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  // Local filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<ApprovalStatus[]>([])
  const [selectedSLAs, setSelectedSLAs] = useState<SLAStatus[]>([])

  // TanStack Query hooks
  const {
    data: approvalsResponse,
    isLoading,
    refetch,
  } = useApprovals({
    search: searchQuery || undefined,
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    slaStatus: selectedSLAs.length > 0 ? selectedSLAs : undefined,
  })

  const { data: statisticsResponse } = useApprovalStatistics()

  // Extract workflows from response
  const workflows: ApprovalWorkflow[] = useMemo(() => {
    return approvalsResponse?.data || []
  }, [approvalsResponse])

  // Compute local filter stats from all workflows
  const filterStats = useMemo(() => {
    const all = workflows
    return {
      pending: all.filter((w) => w.status === 'pending').length,
      in_progress: all.filter((w) => w.status === 'in_progress').length,
      approved: all.filter((w) => w.status === 'approved').length,
      rejected: all.filter((w) => w.status === 'rejected').length,
      warning: all.filter((w) => w.overallSLAStatus === 'warning').length,
      critical: all.filter((w) => w.overallSLAStatus === 'critical').length,
      breached: all.filter((w) => w.overallSLAStatus === 'breached').length,
    }
  }, [workflows])

  // Filter workflows locally for display
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((workflow) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          workflow.fileName.toLowerCase().includes(query) ||
          workflow.fileType.toLowerCase().includes(query) ||
          workflow.afore.toLowerCase().includes(query) ||
          workflow.submittedBy.name.toLowerCase().includes(query)

        if (!matchesSearch) return false
      }

      // Status filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(workflow.status)) {
        return false
      }

      // SLA filter
      if (selectedSLAs.length > 0 && !selectedSLAs.includes(workflow.overallSLAStatus)) {
        return false
      }

      return true
    })
  }, [workflows, searchQuery, selectedStatuses, selectedSLAs])

  // Stats from server or computed locally
  const stats = useMemo(() => {
    if (statisticsResponse?.data) {
      return {
        total: statisticsResponse.data.total || workflows.length,
        pending: statisticsResponse.data.pending || filterStats.pending,
        approved: statisticsResponse.data.approved || filterStats.approved,
        rejected: statisticsResponse.data.rejected || filterStats.rejected,
        breached: statisticsResponse.data.breached || filterStats.breached,
      }
    }
    return {
      total: workflows.length,
      pending: filterStats.pending,
      approved: filterStats.approved,
      rejected: filterStats.rejected,
      breached: filterStats.breached,
    }
  }, [statisticsResponse, workflows, filterStats])

  const handleRefresh = () => {
    refetch()
  }

  const handleClearFilters = () => {
    setSelectedStatuses([])
    setSelectedSLAs([])
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={cn(
              'ios-heading-large ios-font-bold mb-2',
              isDark ? 'text-neutral-100' : 'text-neutral-900'
            )}
          >
            Aprobaciones
          </h1>
          <p
            className={cn(
              'ios-text-body ios-font-regular',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            Gestión de workflows de aprobación multi-nivel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PremiumButtonV2
            onClick={handleRefresh}
            disabled={isLoading}
            variant="secondary"
            size="md"
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Actualizar
          </PremiumButtonV2>

          <PremiumButtonV2
            onClick={() => {
              /* Export functionality */
            }}
            variant="primary"
            size="md"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </PremiumButtonV2>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total */}
        <div
          className="glass-ultra-premium depth-layer-2 rounded-[16px] p-4"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                border: '2px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <CheckSquare className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className={cn('ios-text-caption2 ios-font-regular', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                Total
              </p>
              <p className={cn('ios-heading-title2 ios-font-bold', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div
          className="glass-ultra-premium depth-layer-2 rounded-[16px] p-4"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(249, 115, 22, 0.15)',
                border: '2px solid rgba(249, 115, 22, 0.3)',
              }}
            >
              <Clock className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className={cn('ios-text-caption2 ios-font-regular', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                Pendientes
              </p>
              <p className={cn('ios-heading-title2 ios-font-bold', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        {/* Approved */}
        <div
          className="glass-ultra-premium depth-layer-2 rounded-[16px] p-4"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '2px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className={cn('ios-text-caption2 ios-font-regular', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                Aprobados
              </p>
              <p className={cn('ios-heading-title2 ios-font-bold', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                {stats.approved}
              </p>
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div
          className="glass-ultra-premium depth-layer-2 rounded-[16px] p-4"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className={cn('ios-text-caption2 ios-font-regular', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                Rechazados
              </p>
              <p className={cn('ios-heading-title2 ios-font-bold', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                {stats.rejected}
              </p>
            </div>
          </div>
        </div>

        {/* Breached SLA */}
        <div
          className="glass-ultra-premium depth-layer-2 rounded-[16px] p-4"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className={cn('ios-text-caption2 ios-font-regular', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                SLA Vencido
              </p>
              <p className={cn('ios-heading-title2 ios-font-bold', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                {stats.breached}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre de archivo, AFORE, usuario..."
          isDark={isDark}
        />

        {/* Filter Chips */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className={cn('h-4 w-4', isDark ? 'text-neutral-500' : 'text-neutral-600')} />
            <span className={cn('ios-text-footnote ios-font-semibold', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
              Filtros:
            </span>
          </div>

          {/* Status Filters */}
          <FilterChip
            label="Pendiente"
            count={filterStats.pending}
            isActive={selectedStatuses.includes('pending')}
            onClick={() =>
              setSelectedStatuses((prev) =>
                prev.includes('pending') ? prev.filter((s) => s !== 'pending') : [...prev, 'pending']
              )
            }
            variant="warning"
            isDark={isDark}
          />

          <FilterChip
            label="En Proceso"
            count={filterStats.in_progress}
            isActive={selectedStatuses.includes('in_progress')}
            onClick={() =>
              setSelectedStatuses((prev) =>
                prev.includes('in_progress') ? prev.filter((s) => s !== 'in_progress') : [...prev, 'in_progress']
              )
            }
            variant="info"
            isDark={isDark}
          />

          <FilterChip
            label="Aprobado"
            count={stats.approved}
            isActive={selectedStatuses.includes('approved')}
            onClick={() =>
              setSelectedStatuses((prev) =>
                prev.includes('approved') ? prev.filter((s) => s !== 'approved') : [...prev, 'approved']
              )
            }
            variant="success"
            isDark={isDark}
          />

          <FilterChip
            label="Rechazado"
            count={stats.rejected}
            isActive={selectedStatuses.includes('rejected')}
            onClick={() =>
              setSelectedStatuses((prev) =>
                prev.includes('rejected') ? prev.filter((s) => s !== 'rejected') : [...prev, 'rejected']
              )
            }
            variant="danger"
            isDark={isDark}
          />

          {/* Clear Filters */}
          {(selectedStatuses.length > 0 || selectedSLAs.length > 0 || searchQuery) && (
            <PremiumButtonV2
              onClick={handleClearFilters}
              variant="ghost"
              size="sm"
            >
              Limpiar filtros
            </PremiumButtonV2>
          )}
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw
              className={cn('h-12 w-12 animate-spin mx-auto mb-4', isDark ? 'text-neutral-500' : 'text-neutral-400')}
            />
            <p className={cn('ios-text-body ios-font-medium', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
              Cargando workflows...
            </p>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div
            className="glass-ultra-premium depth-layer-2 rounded-[20px] p-12 text-center"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
            }}
          >
            <CheckSquare className={cn('h-16 w-16 mx-auto mb-4', isDark ? 'text-neutral-600' : 'text-neutral-400')} />
            <p className={cn('ios-text-body ios-font-semibold mb-2', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
              No se encontraron workflows
            </p>
            <p className={cn('ios-text-footnote ios-font-regular', isDark ? 'text-neutral-600' : 'text-neutral-500')}>
              {searchQuery || selectedStatuses.length > 0 || selectedSLAs.length > 0
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay workflows de aprobación en este momento'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredWorkflows.map((workflow) => (
              <ApprovalWorkflowCard
                key={workflow.id}
                workflow={workflow}
                isDark={isDark}
                onClick={(w) => navigate(`/approvals/${w.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      {!isLoading && filteredWorkflows.length > 0 && (
        <div className="text-center">
          <p className={cn('ios-text-footnote ios-font-regular', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
            Mostrando {filteredWorkflows.length} de {workflows.length} workflows
          </p>
        </div>
      )}
    </div>
  )
}
