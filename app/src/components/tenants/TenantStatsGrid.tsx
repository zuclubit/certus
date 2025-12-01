/**
 * TenantStatsGrid Component - Enterprise 2025
 *
 * Statistics grid for tenant/AFORE management dashboard.
 * Shows key metrics in a responsive grid layout.
 *
 * @version 1.0.0
 * @compliance CONSAR 2025
 */

import { memo } from 'react'
import { Building2, Users, CheckCircle, XCircle, Activity, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type { TenantsStatistics } from '@/types/tenant.types'

// ============================================================================
// TYPES
// ============================================================================

export interface TenantStatsGridProps {
  statistics?: TenantsStatistics
  isLoading?: boolean
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number | string
  trend?: string
  color: string
  isLoading?: boolean
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
  isLoading,
}: StatCardProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  if (isLoading) {
    return (
      <div
        className="rounded-xl sm:rounded-2xl p-4 sm:p-5 animate-pulse"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl', isDark ? 'bg-neutral-700/50' : 'bg-neutral-200')} />
          <div className="flex-1 space-y-2">
            <div className={cn('h-3 w-16 rounded', isDark ? 'bg-neutral-700/50' : 'bg-neutral-200')} />
            <div className={cn('h-6 w-12 rounded', isDark ? 'bg-neutral-700/50' : 'bg-neutral-200')} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(16px) saturate(140%)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.06)'
          : '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: isDark
          ? '0 4px 16px rgba(0, 0, 0, 0.3)'
          : '0 4px 16px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}30`,
          }}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs sm:text-sm', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'text-xl sm:text-2xl font-bold',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}
            >
              {value}
            </span>
            {trend && (
              <span className="text-xs text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TenantStatsGrid = memo(function TenantStatsGrid({
  statistics,
  isLoading,
}: TenantStatsGridProps) {
  const stats = [
    {
      icon: Building2,
      label: 'Total AFOREs',
      value: statistics?.totalTenants ?? 0,
      color: '#8B5CF6',
    },
    {
      icon: CheckCircle,
      label: 'AFOREs Activas',
      value: statistics?.activeTenants ?? 0,
      color: '#10B981',
    },
    {
      icon: XCircle,
      label: 'AFOREs Inactivas',
      value: statistics?.inactiveTenants ?? 0,
      color: '#EF4444',
    },
    {
      icon: Users,
      label: 'Total Usuarios',
      value: statistics?.totalUsers ?? 0,
      color: '#3B82F6',
    },
    {
      icon: Activity,
      label: 'Usuarios Activos',
      value: statistics?.activeUsers ?? 0,
      color: '#06B6D4',
    },
    {
      icon: TrendingUp,
      label: 'Validaciones',
      value: statistics?.totalValidations ?? 0,
      color: '#F59E0B',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          color={stat.color}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
})

export default TenantStatsGrid
