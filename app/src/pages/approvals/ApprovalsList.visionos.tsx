/**
 * Approvals List Page - VisionOS Enterprise 2026
 *
 * Main page for viewing and managing approval workflows
 * Features premium design matching Reports/Catalogs/Validations
 *
 * @version 2.0.0
 * @compliance CONSAR Multi-level Approval System
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { useApprovals, useApprovalStatistics } from '@/hooks/useApproval'
import { ApprovalWorkflowCard } from '@/components/approval'
import { PremiumButtonV2 } from '@/components/ui'
import { LottieIcon } from '@/components/ui/LottieIcon'
import { getAnimation } from '@/lib/lottiePreloader'
import { Card, CardContent } from '@/components/ui/card'
import { ExportService } from '@/lib/services/export.adapter'
import {
  Filter,
  RefreshCw,
  Download,
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  X,
  Loader2,
} from 'lucide-react'
import type { ApprovalStatus, SLAStatus, ApprovalWorkflow } from '@/types'
import { ApprovalsSkeleton } from '@/components/ui/skeleton'

export function ApprovalsListVisionOS() {
  const navigate = useNavigate()
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const approvalsAnimationData = getAnimation('approvals')

  // Local filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<ApprovalStatus[]>([])
  const [selectedSLAs, setSelectedSLAs] = useState<SLAStatus[]>([])
  const [isExporting, setIsExporting] = useState(false)

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

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await ExportService.generateReport({
        name: `Approvals Export - ${new Date().toISOString().split('T')[0]}`,
        type: 'custom',
        format: 'xlsx',
        filters: {
          status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
          slaStatus: selectedSLAs.length > 0 ? selectedSLAs : undefined,
          search: searchQuery || undefined,
        },
      })

      if (response.success) {
        console.log('Export started:', response.data)
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleClearFilters = () => {
    setSelectedStatuses([])
    setSelectedSLAs([])
    setSearchQuery('')
  }

  // Show skeleton on initial load
  if (isLoading && workflows.length === 0) {
    return <ApprovalsSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* HEADER SECTION (Matching Validations/Catalogs/Reports structure) */}
      {/* ================================================================ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Lottie Icon */}
          {approvalsAnimationData && (
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-[20px]',
                'glass-ultra-premium depth-layer-4 fresnel-edge',
                'glass-gpu-accelerated spring-bounce'
              )}
              style={{
                background: `
                  linear-gradient(
                    135deg,
                    #10B981 0%,
                    #06B6D4 35%,
                    #3B82F6 65%,
                    #8B5CF6 100%
                  )
                `,
                backgroundSize: '300% 300%',
                animation: 'mesh-flow 8s ease-in-out infinite',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                boxShadow: `
                  0 0 40px rgba(16, 185, 129, 0.4),
                  0 8px 32px rgba(6, 182, 212, 0.3),
                  0 4px 16px rgba(59, 130, 246, 0.25),
                  inset 0 0 40px rgba(255, 255, 255, 0.2),
                  inset 0 2px 0 rgba(255, 255, 255, 0.5)
                `,
              }}
            >
              <div className="w-8 h-8">
                <LottieIcon
                  animationData={approvalsAnimationData}
                  isActive={true}
                  loop={false}
                  autoplay={true}
                  speed={1.0}
                  className="transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Title and Description */}
          <div>
            <h1
              className={cn(
                'ios-heading-title1 ios-text-glass-subtle lg:ios-heading-large',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}
              data-text="Aprobaciones"
            >
              Aprobaciones
            </h1>
            <p
              className={cn(
                'mt-1 ios-text-footnote ios-font-medium lg:ios-text-callout',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              Gestión de workflows de aprobación multi-nivel CONSAR
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-[12px]',
              'glass-ultra-clear transition-all duration-300 hover:scale-110',
              isLoading && 'cursor-not-allowed opacity-50'
            )}
          >
            <RefreshCw
              className={cn(
                'h-5 w-5',
                isDark ? 'text-neutral-400' : 'text-neutral-600',
                isLoading && 'animate-spin'
              )}
            />
          </button>

          <PremiumButtonV2
            label={isExporting ? 'Exportando...' : 'Exportar'}
            icon={Download}
            size="lg"
            loading={isExporting}
            onClick={handleExport}
          />
        </div>
      </div>

      {/* ================================================================ */}
      {/* STATS CARDS (Matching Validations/Catalogs grid layout) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            label: 'Total',
            value: stats.total.toString(),
            icon: CheckSquare,
            color: 'blue',
          },
          {
            label: 'Pendientes',
            value: stats.pending.toString(),
            icon: Clock,
            color: 'orange',
          },
          {
            label: 'Aprobados',
            value: stats.approved.toString(),
            icon: CheckCircle2,
            color: 'green',
          },
          {
            label: 'Rechazados',
            value: stats.rejected.toString(),
            icon: XCircle,
            color: 'red',
          },
          {
            label: 'SLA Vencido',
            value: stats.breached.toString(),
            icon: AlertCircle,
            color: 'red',
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isDark ? 'text-neutral-400' : 'text-neutral-600'
                    )}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={cn(
                      'mt-2 text-3xl font-bold',
                      isDark ? 'text-neutral-100' : 'text-neutral-900'
                    )}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-[12px]',
                    'glass-ultra-clear depth-layer-2'
                  )}
                  style={{
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <stat.icon
                    className={cn('h-6 w-6', isDark ? 'text-neutral-300' : 'text-neutral-700')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ================================================================ */}
      {/* SEARCH AND FILTERS */}
      {/* ================================================================ */}
      <Card>
        <CardContent className="p-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5',
                isDark ? 'text-neutral-500' : 'text-neutral-400'
              )}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre de archivo, AFORE, usuario..."
              className={cn(
                'w-full pl-10 pr-10 py-2.5 rounded-lg text-sm',
                'border transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                isDark
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-100 placeholder-neutral-500'
                  : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2',
                  'p-1 rounded-md transition-colors',
                  isDark ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'
                )}
              >
                <X className={cn('h-4 w-4', isDark ? 'text-neutral-400' : 'text-neutral-500')} />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className={cn('h-4 w-4', isDark ? 'text-neutral-500' : 'text-neutral-600')} />
              <span
                className={cn(
                  'text-sm font-semibold',
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                )}
              >
                Filtros:
              </span>
            </div>

            {/* Status Filters */}
            {[
              { value: 'pending', label: 'Pendiente', color: 'orange' },
              { value: 'in_progress', label: 'En Proceso', color: 'blue' },
              { value: 'approved', label: 'Aprobado', color: 'green' },
              { value: 'rejected', label: 'Rechazado', color: 'red' },
            ].map((status) => {
              const count =
                filterStats[status.value as keyof typeof filterStats] || 0
              const isActive = selectedStatuses.includes(status.value as ApprovalStatus)

              return (
                <button
                  key={status.value}
                  onClick={() =>
                    setSelectedStatuses((prev) =>
                      prev.includes(status.value as ApprovalStatus)
                        ? prev.filter((s) => s !== status.value)
                        : [...prev, status.value as ApprovalStatus]
                    )
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                    'flex items-center gap-2',
                    isActive
                      ? isDark
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-500 text-white'
                      : isDark
                      ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  )}
                >
                  {status.label}
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-xs font-bold',
                      isActive
                        ? 'bg-white/20'
                        : isDark
                        ? 'bg-neutral-700'
                        : 'bg-neutral-200'
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}

            {/* SLA Filters */}
            {[
              { value: 'warning', label: 'SLA Warning', color: 'yellow' },
              { value: 'critical', label: 'SLA Critical', color: 'orange' },
              { value: 'breached', label: 'SLA Vencido', color: 'red' },
            ].map((sla) => {
              const count = filterStats[sla.value as keyof typeof filterStats] || 0
              const isActive = selectedSLAs.includes(sla.value as SLAStatus)

              if (count === 0) return null

              return (
                <button
                  key={sla.value}
                  onClick={() =>
                    setSelectedSLAs((prev) =>
                      prev.includes(sla.value as SLAStatus)
                        ? prev.filter((s) => s !== sla.value)
                        : [...prev, sla.value as SLAStatus]
                    )
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                    'flex items-center gap-2',
                    isActive
                      ? 'bg-red-600 text-white'
                      : isDark
                      ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  )}
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  {sla.label}
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-xs font-bold',
                      isActive
                        ? 'bg-white/20'
                        : isDark
                        ? 'bg-neutral-700'
                        : 'bg-neutral-200'
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}

            {/* Clear Filters */}
            {(selectedStatuses.length > 0 || selectedSLAs.length > 0 || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isDark
                    ? 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800'
                    : 'text-neutral-600 hover:text-neutral-700 hover:bg-neutral-100'
                )}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* WORKFLOWS GRID */}
      {/* ================================================================ */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw
            className={cn(
              'h-12 w-12 animate-spin mx-auto mb-4',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}
          />
          <p
            className={cn(
              'text-sm font-medium',
              isDark ? 'text-neutral-500' : 'text-neutral-600'
            )}
          >
            Cargando workflows...
          </p>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckSquare
              className={cn(
                'h-16 w-16 mx-auto mb-4',
                isDark ? 'text-neutral-600' : 'text-neutral-400'
              )}
            />
            <p
              className={cn(
                'text-base font-semibold mb-2',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              No se encontraron workflows
            </p>
            <p className={cn('text-sm', isDark ? 'text-neutral-600' : 'text-neutral-500')}>
              {searchQuery || selectedStatuses.length > 0 || selectedSLAs.length > 0
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay workflows de aprobación en este momento'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
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

          {/* Results Count */}
          <div className="text-center">
            <p className={cn('text-sm', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
              Mostrando {filteredWorkflows.length} de {workflows.length} workflows
            </p>
          </div>
        </>
      )}
    </div>
  )
}

// Default export for lazy loading
export default ApprovalsListVisionOS
