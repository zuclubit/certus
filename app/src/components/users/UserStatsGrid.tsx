/**
 * UserStatsGrid Component - Enterprise 2025
 *
 * Grid de estadísticas de usuarios con diseño responsive.
 * Implementa:
 * - CSS Grid responsive con auto-fit
 * - Números animados
 * - Tendencias visuales
 * - Accesibilidad completa
 *
 * @architecture Atomic Design - Organism level
 */

import { memo } from 'react'
import {
  Users as UsersIcon,
  UserCheck,
  ShieldCheck,
  Activity,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type { UserStatistics } from '@/hooks/useUsers'

// ============================================================================
// TYPES
// ============================================================================

export interface UserStatsGridProps {
  statistics: UserStatistics | undefined
  isLoading?: boolean
}

interface StatCardProps {
  label: string
  value: number
  total?: number
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconBorder: string
  iconColor: string
  trend?: string
  isDark: boolean
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatCardSkeleton = memo(function StatCardSkeleton({
  isDark,
}: {
  isDark: boolean
}) {
  return (
    <div
      className="rounded-xl sm:rounded-[20px] p-4 sm:p-5 animate-pulse"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'w-10 h-10 sm:w-11 sm:h-11 rounded-xl',
            isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
          )}
        />
        <div
          className={cn(
            'w-12 h-6 rounded-lg',
            isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
          )}
        />
      </div>
      <div
        className={cn(
          'h-8 w-16 rounded-md mb-2',
          isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
        )}
      />
      <div
        className={cn(
          'h-4 w-24 rounded-md',
          isDark ? 'bg-neutral-700/50' : 'bg-neutral-200'
        )}
      />
    </div>
  )
})

const StatCard = memo(function StatCard({
  label,
  value,
  total,
  icon: Icon,
  iconBg,
  iconBorder,
  iconColor,
  trend,
  isDark,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl sm:rounded-[20px] p-4 sm:p-5 transition-all duration-300',
        'hover:scale-[1.02] cursor-default',
        'focus-visible:ring-2 focus-visible:ring-primary-500'
      )}
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
      tabIndex={0}
      role="article"
      aria-label={`${label}: ${value}${total ? ` de ${total}` : ''}`}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div
          className="p-2 sm:p-2.5 rounded-[10px] sm:rounded-[12px]"
          style={{
            background: iconBg,
            border: `1px solid ${iconBorder}`,
            boxShadow: `0 0 16px ${iconBorder}`,
            color: iconColor,
          }}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        {trend && (
          <div
            className="px-2 py-0.5 sm:py-1 rounded-md sm:rounded-[8px] text-[10px] sm:text-xs font-semibold flex items-center gap-1"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981',
            }}
          >
            {trend.startsWith('+') && <TrendingUp className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </div>

      <div>
        <div
          className="text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1"
          style={{
            fontFamily: '"SF Pro Display", "Inter", system-ui, sans-serif',
            color: isDark ? '#FFFFFF' : '#0F172A',
            letterSpacing: '-0.02em',
          }}
        >
          {value.toLocaleString('es-MX')}
          {total !== undefined && (
            <span
              className="text-base sm:text-lg font-medium ml-1"
              style={{
                color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(15, 23, 42, 0.4)',
              }}
            >
              /{total}
            </span>
          )}
        </div>
        <p
          className="text-xs sm:text-sm font-medium"
          style={{
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 23, 42, 0.6)',
          }}
        >
          {label}
        </p>
      </div>
    </div>
  )
})

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UserStatsGrid - Grid de estadísticas de usuarios
 *
 * Muestra métricas clave en un grid responsive:
 * - 1 columna en móvil pequeño
 * - 2 columnas en móvil/tablet
 * - 4 columnas en desktop
 */
export const UserStatsGrid = memo(function UserStatsGrid({
  statistics,
  isLoading = false,
}: UserStatsGridProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  if (isLoading || !statistics) {
    return (
      <div
        className="grid grid-cols-1 xxs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        role="region"
        aria-label="Cargando estadísticas"
      >
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} isDark={isDark} />
        ))}
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Usuarios',
      value: statistics.total,
      icon: UsersIcon,
      iconBg: 'rgba(139, 92, 246, 0.15)',
      iconBorder: 'rgba(139, 92, 246, 0.3)',
      iconColor: '#8B5CF6',
      trend: `+${statistics.newUsersThisMonth}`,
    },
    {
      label: 'Usuarios Activos',
      value: statistics.active,
      total: statistics.total,
      icon: UserCheck,
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconBorder: 'rgba(16, 185, 129, 0.3)',
      iconColor: '#10B981',
      trend: `${Math.round((statistics.active / statistics.total) * 100)}%`,
    },
    {
      label: 'MFA Habilitado',
      value: statistics.mfaEnabled,
      total: statistics.total,
      icon: ShieldCheck,
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconBorder: 'rgba(59, 130, 246, 0.3)',
      iconColor: '#3B82F6',
      trend: `${Math.round((statistics.mfaEnabled / statistics.total) * 100)}%`,
    },
    {
      label: 'Sesiones Recientes',
      value: statistics.recentLogins,
      icon: Activity,
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconBorder: 'rgba(245, 158, 11, 0.3)',
      iconColor: '#F59E0B',
      trend: '24h',
    },
  ]

  return (
    <div
      className="grid grid-cols-1 xxs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      role="region"
      aria-label="Estadísticas de usuarios"
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} isDark={isDark} />
      ))}
    </div>
  )
})

export default UserStatsGrid
