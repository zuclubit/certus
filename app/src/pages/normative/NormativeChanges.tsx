/**
 * Normative Changes Page - VisionOS Enterprise 2026
 *
 * Main page for viewing and managing CONSAR normative changes
 * Features: Filtering, search, statistics, and change management
 * Uses TanStack Query for data fetching
 *
 * Design: Follows the same patterns as ApprovalsList, Dashboard, and other pages
 */

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import {
  useNormativeChanges,
  useNormativeStatistics,
  useApplyNormativeChange,
} from '@/hooks/useNormativeChanges'
import { SearchBar, FilterChip, PremiumButtonV2, StatusBadge } from '@/components/ui'
import {
  FileText,
  RefreshCw,
  Plus,
  Filter,
  Clock,
  CheckCircle2,
  Archive,
  AlertTriangle,
  ExternalLink,
  Calendar,
  Tag,
  Users,
  Loader2,
  AlertCircle,
  FileSearch,
} from 'lucide-react'
import type { NormativeStatus, NormativePriority } from '@/lib/services/api/normative.service'

// ============================================
// TYPES
// ============================================

interface StatCardConfig {
  label: string
  value: number
  icon: React.ElementType
  color: 'blue' | 'yellow' | 'green' | 'neutral' | 'red'
}

// ============================================
// STAT CARD COMPONENT
// ============================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  isDark,
}: StatCardConfig & { isDark: boolean }) {
  const colorConfig = {
    blue: {
      bg: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.3)',
      iconColor: 'text-blue-400',
    },
    yellow: {
      bg: 'rgba(234, 179, 8, 0.15)',
      border: 'rgba(234, 179, 8, 0.3)',
      iconColor: 'text-yellow-400',
    },
    green: {
      bg: 'rgba(34, 197, 94, 0.15)',
      border: 'rgba(34, 197, 94, 0.3)',
      iconColor: 'text-green-400',
    },
    neutral: {
      bg: 'rgba(107, 114, 128, 0.15)',
      border: 'rgba(107, 114, 128, 0.3)',
      iconColor: 'text-neutral-400',
    },
    red: {
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.3)',
      iconColor: 'text-red-400',
    },
  }

  const config = colorConfig[color]

  return (
    <div
      className="glass-ultra-premium depth-layer-2 rounded-[16px] p-4 transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: config.bg,
            border: `2px solid ${config.border}`,
          }}
        >
          <Icon className={cn('h-6 w-6', config.iconColor)} />
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              'ios-text-caption2 ios-font-regular truncate',
              isDark ? 'text-neutral-500' : 'text-neutral-600'
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              'ios-heading-title2 ios-font-bold',
              isDark ? 'text-neutral-200' : 'text-neutral-900'
            )}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// NORMATIVE CHANGE CARD COMPONENT
// ============================================

interface NormativeChangeCardProps {
  change: {
    id: string
    code: string
    title: string
    description: string
    publishDate: string
    effectiveDate: string
    status: string
    priority: string
    category: string
    affectedValidators: string[]
    documentUrl?: string
    appliedAt?: string
    appliedBy?: string
  }
  isDark: boolean
  onApply: (id: string) => void
  isApplying: boolean
}

function NormativeChangeCard({
  change,
  isDark,
  onApply,
  isApplying,
}: NormativeChangeCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          variant: 'success' as const,
          label: 'Vigente',
          icon: CheckCircle2,
        }
      case 'pending':
        return {
          variant: 'warning' as const,
          label: 'Pendiente',
          icon: Clock,
        }
      case 'archived':
        return {
          variant: 'neutral' as const,
          label: 'Archivado',
          icon: Archive,
        }
      default:
        return {
          variant: 'neutral' as const,
          label: status,
          icon: FileText,
        }
    }
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return { variant: 'error' as const, label: 'Alta' }
      case 'medium':
        return { variant: 'warning' as const, label: 'Media' }
      case 'low':
        return { variant: 'neutral' as const, label: 'Baja' }
      default:
        return { variant: 'neutral' as const, label: priority }
    }
  }

  const statusConfig = getStatusConfig(change.status)
  const priorityConfig = getPriorityConfig(change.priority)

  return (
    <div
      className="glass-ultra-premium depth-layer-3 rounded-[20px] p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(20,20,25,0.85) 0%, rgba(25,25,30,0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.98) 100%)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3
              className={cn(
                'ios-heading-title3 ios-font-bold',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}
            >
              {change.code}
            </h3>
            <StatusBadge variant={statusConfig.variant} size="sm" dot dotPulse={change.status === 'pending'}>
              {statusConfig.label}
            </StatusBadge>
            <StatusBadge variant={priorityConfig.variant} size="sm">
              {priorityConfig.label}
            </StatusBadge>
          </div>
          <h4
            className={cn(
              'ios-text-body ios-font-semibold',
              isDark ? 'text-neutral-200' : 'text-neutral-800'
            )}
          >
            {change.title}
          </h4>
        </div>
      </div>

      {/* Description */}
      <p
        className={cn(
          'ios-text-footnote ios-font-regular mb-4 line-clamp-2',
          isDark ? 'text-neutral-400' : 'text-neutral-600'
        )}
      >
        {change.description}
      </p>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-neutral-200/10">
        {/* Category */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Tag
              className={cn('h-3 w-3', isDark ? 'text-neutral-500' : 'text-neutral-400')}
            />
            <span
              className={cn(
                'ios-text-caption2 ios-font-regular',
                isDark ? 'text-neutral-500' : 'text-neutral-500'
              )}
            >
              Categoría
            </span>
          </div>
          <StatusBadge variant="info" size="xs">
            {change.category}
          </StatusBadge>
        </div>

        {/* Publish Date */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar
              className={cn('h-3 w-3', isDark ? 'text-neutral-500' : 'text-neutral-400')}
            />
            <span
              className={cn(
                'ios-text-caption2 ios-font-regular',
                isDark ? 'text-neutral-500' : 'text-neutral-500'
              )}
            >
              Publicación
            </span>
          </div>
          <p
            className={cn(
              'ios-text-footnote ios-font-semibold',
              isDark ? 'text-neutral-200' : 'text-neutral-800'
            )}
          >
            {new Date(change.publishDate).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Effective Date */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Clock
              className={cn('h-3 w-3', isDark ? 'text-neutral-500' : 'text-neutral-400')}
            />
            <span
              className={cn(
                'ios-text-caption2 ios-font-regular',
                isDark ? 'text-neutral-500' : 'text-neutral-500'
              )}
            >
              Vigencia
            </span>
          </div>
          <p
            className={cn(
              'ios-text-footnote ios-font-semibold',
              isDark ? 'text-neutral-200' : 'text-neutral-800'
            )}
          >
            {new Date(change.effectiveDate).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Affected Validators */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Users
              className={cn('h-3 w-3', isDark ? 'text-neutral-500' : 'text-neutral-400')}
            />
            <span
              className={cn(
                'ios-text-caption2 ios-font-regular',
                isDark ? 'text-neutral-500' : 'text-neutral-500'
              )}
            >
              Validadores
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {change.affectedValidators.slice(0, 3).map((validator) => (
              <StatusBadge key={validator} variant="info" size="xs">
                {validator}
              </StatusBadge>
            ))}
            {change.affectedValidators.length > 3 && (
              <StatusBadge variant="neutral" size="xs">
                +{change.affectedValidators.length - 3}
              </StatusBadge>
            )}
          </div>
        </div>
      </div>

      {/* Applied Info */}
      {change.appliedAt && (
        <div
          className={cn(
            'ios-text-caption2 ios-font-regular mb-4 pt-3 border-t',
            isDark
              ? 'text-neutral-500 border-neutral-700/50'
              : 'text-neutral-500 border-neutral-200'
          )}
        >
          Aplicado el{' '}
          {new Date(change.appliedAt).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          por {change.appliedBy}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-neutral-200/10">
        <PremiumButtonV2
          label="Ver detalle"
          icon={FileSearch}
          size="sm"
          onClick={() => {}}
        />

        {change.documentUrl && (
          <a
            href={change.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2 px-4 h-[40px] rounded-[20px]',
              'ios-text-sm ios-font-semibold',
              'transition-all duration-200',
              'border-2',
              isDark
                ? 'bg-neutral-800/50 border-neutral-700/50 text-neutral-300 hover:bg-neutral-700/50'
                : 'bg-white/80 border-neutral-300 text-neutral-700 hover:bg-neutral-100'
            )}
          >
            <ExternalLink className="h-4 w-4" />
            Circular
          </a>
        )}

        {change.status === 'pending' && (
          <PremiumButtonV2
            label={isApplying ? 'Aplicando...' : 'Aplicar cambios'}
            icon={isApplying ? Loader2 : CheckCircle2}
            size="sm"
            onClick={() => onApply(change.id)}
            disabled={isApplying}
          />
        )}
      </div>
    </div>
  )
}

// ============================================
// LOADING SKELETON
// ============================================

function LoadingSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="space-y-4">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-[16px] p-4 animate-pulse"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'h-12 w-12 rounded-full',
                  isDark ? 'bg-neutral-700' : 'bg-neutral-200'
                )}
              />
              <div className="flex-1 space-y-2">
                <div
                  className={cn(
                    'h-3 w-16 rounded',
                    isDark ? 'bg-neutral-700' : 'bg-neutral-200'
                  )}
                />
                <div
                  className={cn(
                    'h-5 w-10 rounded',
                    isDark ? 'bg-neutral-700' : 'bg-neutral-200'
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[20px] p-5 animate-pulse"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div
                    className={cn(
                      'h-6 w-24 rounded',
                      isDark ? 'bg-neutral-700' : 'bg-neutral-200'
                    )}
                  />
                  <div
                    className={cn(
                      'h-6 w-16 rounded-full',
                      isDark ? 'bg-neutral-700' : 'bg-neutral-200'
                    )}
                  />
                </div>
                <div
                  className={cn(
                    'h-4 w-3/4 rounded',
                    isDark ? 'bg-neutral-700' : 'bg-neutral-200'
                  )}
                />
              </div>
            </div>
            <div
              className={cn(
                'h-12 w-full rounded',
                isDark ? 'bg-neutral-700' : 'bg-neutral-200'
              )}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({ isDark, hasFilters }: { isDark: boolean; hasFilters: boolean }) {
  return (
    <div
      className="glass-ultra-premium depth-layer-2 rounded-[20px] p-12 text-center"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
      }}
    >
      <div
        className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{
          background: isDark ? 'rgba(107, 114, 128, 0.15)' : 'rgba(107, 114, 128, 0.1)',
          border: `2px solid ${isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.2)'}`,
        }}
      >
        <FileText className={cn('h-10 w-10', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
      </div>
      <h3
        className={cn(
          'ios-heading-title3 ios-font-semibold mb-2',
          isDark ? 'text-neutral-200' : 'text-neutral-900'
        )}
      >
        {hasFilters ? 'No se encontraron resultados' : 'No hay cambios normativos'}
      </h3>
      <p
        className={cn(
          'ios-text-body ios-font-regular',
          isDark ? 'text-neutral-500' : 'text-neutral-600'
        )}
      >
        {hasFilters
          ? 'Intenta ajustar los filtros de búsqueda'
          : 'Aún no se han registrado cambios normativos CONSAR'}
      </p>
    </div>
  )
}

// ============================================
// ERROR STATE
// ============================================

function ErrorState({
  isDark,
  message,
  onRetry,
}: {
  isDark: boolean
  message: string
  onRetry: () => void
}) {
  return (
    <div
      className="glass-ultra-premium depth-layer-2 rounded-[20px] p-8"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(127, 29, 29, 0.2) 0%, rgba(20, 20, 25, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(254, 226, 226, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
        border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'ios-heading-title3 ios-font-semibold mb-1',
              isDark ? 'text-red-300' : 'text-red-800'
            )}
          >
            Error al cargar cambios normativos
          </h3>
          <p
            className={cn(
              'ios-text-footnote ios-font-regular',
              isDark ? 'text-red-400' : 'text-red-600'
            )}
          >
            {message}
          </p>
        </div>
        <PremiumButtonV2 label="Reintentar" icon={RefreshCw} size="sm" onClick={onRetry} />
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function NormativeChanges() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  // Local filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<NormativeStatus[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<NormativePriority[]>([])

  // Build API filters
  const apiFilters = useMemo(() => {
    const filters: {
      status?: NormativeStatus
      priority?: NormativePriority
      search?: string
    } = {}

    if (selectedStatuses.length === 1) {
      filters.status = selectedStatuses[0]
    }
    if (selectedPriorities.length === 1) {
      filters.priority = selectedPriorities[0]
    }
    if (searchQuery) {
      filters.search = searchQuery
    }

    return filters
  }, [selectedStatuses, selectedPriorities, searchQuery])

  // TanStack Query hooks
  const { data: normativeChanges, isLoading, error, refetch } = useNormativeChanges(apiFilters)
  const { data: statistics } = useNormativeStatistics()
  const applyMutation = useApplyNormativeChange()

  // Compute stats
  const stats = useMemo(() => {
    if (statistics) {
      return {
        total: statistics.total,
        pending: statistics.pending,
        active: statistics.active,
        archived: statistics.archived,
        highPriority: statistics.highPriority,
      }
    }
    return {
      total: normativeChanges?.length || 0,
      pending: normativeChanges?.filter((c) => c.status === 'pending').length || 0,
      active: normativeChanges?.filter((c) => c.status === 'active').length || 0,
      archived: normativeChanges?.filter((c) => c.status === 'archived').length || 0,
      highPriority: normativeChanges?.filter((c) => c.priority === 'high').length || 0,
    }
  }, [statistics, normativeChanges])

  // Filter counts for chips
  const filterCounts = useMemo(() => {
    const changes = normativeChanges || []
    return {
      pending: changes.filter((c) => c.status === 'pending').length,
      active: changes.filter((c) => c.status === 'active').length,
      archived: changes.filter((c) => c.status === 'archived').length,
      high: changes.filter((c) => c.priority === 'high').length,
      medium: changes.filter((c) => c.priority === 'medium').length,
      low: changes.filter((c) => c.priority === 'low').length,
    }
  }, [normativeChanges])

  // Filter locally for additional precision
  const filteredChanges = useMemo(() => {
    if (!normativeChanges) return []

    return normativeChanges.filter((change) => {
      // Status filter (multi-select)
      if (selectedStatuses.length > 1 && !selectedStatuses.includes(change.status as NormativeStatus)) {
        return false
      }

      // Priority filter (multi-select)
      if (
        selectedPriorities.length > 1 &&
        !selectedPriorities.includes(change.priority as NormativePriority)
      ) {
        return false
      }

      return true
    })
  }, [normativeChanges, selectedStatuses, selectedPriorities])

  // Handlers
  const handleRefresh = () => {
    refetch()
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedStatuses([])
    setSelectedPriorities([])
  }

  const handleApplyChange = async (id: string) => {
    try {
      await applyMutation.mutateAsync(id)
    } catch (err) {
      console.error('Failed to apply normative change:', err)
    }
  }

  const toggleStatus = (status: NormativeStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const togglePriority = (priority: NormativePriority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    )
  }

  const hasFilters = Boolean(searchQuery) || selectedStatuses.length > 0 || selectedPriorities.length > 0

  // Stats card config
  const statsConfig: StatCardConfig[] = [
    { label: 'Total', value: stats.total, icon: FileText, color: 'blue' },
    { label: 'Pendientes', value: stats.pending, icon: Clock, color: 'yellow' },
    { label: 'Vigentes', value: stats.active, icon: CheckCircle2, color: 'green' },
    { label: 'Archivados', value: stats.archived, icon: Archive, color: 'neutral' },
    { label: 'Alta Prioridad', value: stats.highPriority, icon: AlertTriangle, color: 'red' },
  ]

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className={cn(
              'ios-heading-large ios-font-bold mb-2',
              isDark ? 'text-neutral-100' : 'text-neutral-900'
            )}
          >
            Cambios Normativos CONSAR
          </h1>
          <p
            className={cn(
              'ios-text-body ios-font-regular',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            Seguimiento y gestión de circulares y disposiciones normativas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PremiumButtonV2
            label="Actualizar"
            icon={RefreshCw}
            size="md"
            onClick={handleRefresh}
            disabled={isLoading}
          />
          <PremiumButtonV2
            label="Registrar cambio"
            icon={Plus}
            size="md"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSkeleton isDark={isDark} />}

      {/* Error State */}
      {error && !isLoading && (
        <ErrorState isDark={isDark} message={error.message} onRetry={handleRefresh} />
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {statsConfig.map((stat) => (
              <StatCard key={stat.label} {...stat} isDark={isDark} />
            ))}
          </div>

          {/* Search & Filters */}
          <div
            className="glass-ultra-premium depth-layer-2 rounded-[20px] p-4 sm:p-5"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(20,20,25,0.85) 0%, rgba(25,25,30,0.9) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.98) 100%)',
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <SearchBar
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  placeholder="Buscar por código, título o descripción..."
                  size="md"
                  showCount
                  resultCount={filteredChanges.length}
                  totalCount={normativeChanges?.length || 0}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter
                    className={cn('h-4 w-4', isDark ? 'text-neutral-500' : 'text-neutral-400')}
                  />
                  <span
                    className={cn(
                      'ios-text-footnote ios-font-semibold',
                      isDark ? 'text-neutral-400' : 'text-neutral-600'
                    )}
                  >
                    Estado:
                  </span>
                </div>

                <FilterChip
                  label="Pendiente"
                  count={filterCounts.pending}
                  active={selectedStatuses.includes('pending')}
                  onToggle={() => toggleStatus('pending')}
                  size="sm"
                />
                <FilterChip
                  label="Vigente"
                  count={filterCounts.active}
                  active={selectedStatuses.includes('active')}
                  onToggle={() => toggleStatus('active')}
                  size="sm"
                />
                <FilterChip
                  label="Archivado"
                  count={filterCounts.archived}
                  active={selectedStatuses.includes('archived')}
                  onToggle={() => toggleStatus('archived')}
                  size="sm"
                />

                {/* Priority filters */}
                <div
                  className={cn(
                    'h-6 w-px mx-1',
                    isDark ? 'bg-neutral-700' : 'bg-neutral-300'
                  )}
                />
                <span
                  className={cn(
                    'ios-text-footnote ios-font-semibold',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                >
                  Prioridad:
                </span>
                <FilterChip
                  label="Alta"
                  count={filterCounts.high}
                  active={selectedPriorities.includes('high')}
                  onToggle={() => togglePriority('high')}
                  size="sm"
                />
                <FilterChip
                  label="Media"
                  count={filterCounts.medium}
                  active={selectedPriorities.includes('medium')}
                  onToggle={() => togglePriority('medium')}
                  size="sm"
                />

                {/* Clear filters */}
                {hasFilters && (
                  <button
                    onClick={handleClearFilters}
                    className={cn(
                      'ios-text-footnote ios-font-semibold',
                      'px-3 py-1.5 rounded-lg transition-colors',
                      isDark
                        ? 'text-primary-400 hover:bg-primary-500/20'
                        : 'text-primary-600 hover:bg-primary-100'
                    )}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Changes List */}
          {filteredChanges.length > 0 ? (
            <div className="space-y-4">
              {filteredChanges.map((change) => (
                <NormativeChangeCard
                  key={change.id}
                  change={change}
                  isDark={isDark}
                  onApply={handleApplyChange}
                  isApplying={applyMutation.isPending}
                />
              ))}

              {/* Results count */}
              <div
                className={cn(
                  'text-center ios-text-caption1 ios-font-regular py-4',
                  isDark ? 'text-neutral-500' : 'text-neutral-500'
                )}
              >
                Mostrando {filteredChanges.length} de {normativeChanges?.length || 0} cambios
                normativos
              </div>
            </div>
          ) : (
            <EmptyState isDark={isDark} hasFilters={hasFilters} />
          )}
        </>
      )}
    </div>
  )
}

export default NormativeChanges
