/**
 * TenantCard Component - Enterprise 2025
 *
 * Card component for displaying tenant/AFORE information.
 * Follows VisionOS design patterns.
 *
 * @version 1.0.0
 * @compliance CONSAR 2025
 */

import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  Activity,
  Calendar,
  CheckCircle,
  XCircle,
  Edit2,
  Eye,
  UserPlus,
  Power,
  MoreVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type { TenantEntity } from '@/types/tenant.types'
import { parseTenantSettings } from '@/types/tenant.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ============================================================================
// TYPES
// ============================================================================

export interface TenantCardProps {
  tenant: TenantEntity
  onEdit?: (tenant: TenantEntity) => void
  onViewUsers?: (tenant: TenantEntity) => void
  onInviteUser?: (tenant: TenantEntity) => void
  onToggleStatus?: (tenant: TenantEntity) => void
}

export interface TenantCardActions {
  onEdit?: (tenant: TenantEntity) => void
  onViewUsers?: (tenant: TenantEntity) => void
  onInviteUser?: (tenant: TenantEntity) => void
  onToggleStatus?: (tenant: TenantEntity) => void
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const TenantLogo = memo(function TenantLogo({
  tenant,
  isDark,
}: {
  tenant: TenantEntity
  isDark: boolean
}) {
  return (
    <div className="relative flex-shrink-0">
      {tenant.logo ? (
        <img
          src={tenant.logo}
          alt={tenant.name}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover"
          style={{
            border: isDark
              ? '2px solid rgba(139, 92, 246, 0.3)'
              : '2px solid rgba(139, 92, 246, 0.2)',
          }}
        />
      ) : (
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)'
              : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: isDark
              ? '2px solid rgba(139, 92, 246, 0.3)'
              : '2px solid rgba(139, 92, 246, 0.2)',
          }}
        >
          <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-violet-500" />
        </div>
      )}
      {/* Status indicator */}
      <div
        className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center"
        style={{
          background: tenant.isActive ? '#10B981' : '#EF4444',
          border: isDark ? '2px solid #0F172A' : '2px solid #FFFFFF',
        }}
        title={tenant.isActive ? 'Activa' : 'Inactiva'}
      >
        {tenant.isActive ? (
          <CheckCircle className="h-3 w-3 text-white" />
        ) : (
          <XCircle className="h-3 w-3 text-white" />
        )}
      </div>
    </div>
  )
})

const TenantInfo = memo(function TenantInfo({
  tenant,
  isDark,
}: {
  tenant: TenantEntity
  isDark: boolean
}) {
  const settings = parseTenantSettings(tenant.settings)

  return (
    <div className="flex-1 min-w-0">
      {/* Name and Code */}
      <div className="flex items-center gap-2 mb-1">
        <h3
          className={cn(
            'text-base sm:text-lg font-bold truncate',
            isDark ? 'text-neutral-100' : 'text-neutral-900'
          )}
          title={tenant.name}
        >
          {tenant.name}
        </h3>
        <span
          className="flex-shrink-0 px-2 py-0.5 rounded-md text-xs font-mono font-semibold"
          style={{
            background: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)',
            color: '#8B5CF6',
          }}
        >
          {tenant.aforeCode}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-2 sm:mb-3">
        <div className="flex items-center gap-1.5">
          <Users className={cn('h-3.5 w-3.5', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
          <span className={cn(isDark ? 'text-neutral-400' : 'text-neutral-600')}>
            {tenant.userCount} usuarios
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className={cn('h-3.5 w-3.5', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
          <span className={cn(isDark ? 'text-neutral-400' : 'text-neutral-600')}>
            {tenant.validationCount} validaciones
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <Calendar className={cn('h-3.5 w-3.5', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
          <span className={cn(isDark ? 'text-neutral-400' : 'text-neutral-600')}>
            {formatDate(tenant.createdAt)}
          </span>
        </div>
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {settings.features?.enableMfa && (
          <span
            className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981',
            }}
          >
            MFA
          </span>
        )}
        {settings.features?.enableApiAccess && (
          <span
            className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium"
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#3B82F6',
            }}
          >
            API
          </span>
        )}
        {settings.timezone && (
          <span
            className={cn(
              'px-2 py-0.5 rounded-md text-[10px] sm:text-xs',
              isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-600'
            )}
          >
            {settings.timezone}
          </span>
        )}
      </div>
    </div>
  )
})

const DesktopActions = memo(function DesktopActions({
  tenant,
  isDark,
  onEdit,
  onViewUsers,
  onInviteUser,
  onToggleStatus,
}: {
  tenant: TenantEntity
  isDark: boolean
} & TenantCardActions) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        onClick={() => onViewUsers?.(tenant)}
        className={cn(
          'p-2 rounded-lg transition-colors',
          isDark
            ? 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-300'
            : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-700'
        )}
        title="Ver usuarios"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => onEdit?.(tenant)}
        className={cn(
          'p-2 rounded-lg transition-colors',
          isDark
            ? 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-300'
            : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-700'
        )}
        title="Editar AFORE"
      >
        <Edit2 className="h-4 w-4" />
      </button>
      {tenant.isActive && (
        <button
          onClick={() => onInviteUser?.(tenant)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            isDark
              ? 'hover:bg-blue-950/50 text-blue-500 hover:text-blue-400'
              : 'hover:bg-blue-50 text-blue-600 hover:text-blue-700'
          )}
          title="Invitar usuario"
        >
          <UserPlus className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => onToggleStatus?.(tenant)}
        className={cn(
          'p-2 rounded-lg transition-colors',
          tenant.isActive
            ? isDark
              ? 'hover:bg-red-950/50 text-red-500 hover:text-red-400'
              : 'hover:bg-red-50 text-red-600 hover:text-red-700'
            : isDark
              ? 'hover:bg-green-950/50 text-green-500 hover:text-green-400'
              : 'hover:bg-green-50 text-green-600 hover:text-green-700'
        )}
        title={tenant.isActive ? 'Desactivar' : 'Activar'}
      >
        <Power className="h-4 w-4" />
      </button>
    </div>
  )
})

const MobileActions = memo(function MobileActions({
  tenant,
  isDark,
  onEdit,
  onViewUsers,
  onInviteUser,
  onToggleStatus,
}: {
  tenant: TenantEntity
  isDark: boolean
} & TenantCardActions) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'p-2 rounded-lg transition-colors',
            isDark
              ? 'hover:bg-neutral-800 text-neutral-400'
              : 'hover:bg-neutral-100 text-neutral-600'
          )}
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onViewUsers?.(tenant)}>
          <Eye className="h-4 w-4 mr-2" />
          Ver usuarios
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit?.(tenant)}>
          <Edit2 className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        {tenant.isActive && (
          <DropdownMenuItem onClick={() => onInviteUser?.(tenant)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar usuario
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onToggleStatus?.(tenant)}
          className={tenant.isActive ? 'text-red-600' : 'text-green-600'}
        >
          <Power className="h-4 w-4 mr-2" />
          {tenant.isActive ? 'Desactivar' : 'Activar'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TenantCard = memo(function TenantCard({
  tenant,
  onEdit,
  onViewUsers,
  onInviteUser,
  onToggleStatus,
}: TenantCardProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)

  const handleCardClick = () => {
    navigate(`/tenants/${tenant.id}`)
  }

  return (
    <div
      className={cn(
        'rounded-xl sm:rounded-[20px] p-4 sm:p-6 transition-all duration-300',
        'cursor-pointer focus-within:ring-2 focus-within:ring-violet-500/50'
      )}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(16px) saturate(140%)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.06)'
          : '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: isHovered
          ? isDark
            ? '0 8px 24px rgba(139, 92, 246, 0.15)'
            : '0 8px 24px rgba(139, 92, 246, 0.1)'
          : isDark
            ? '0 4px 16px rgba(0, 0, 0, 0.3)'
            : '0 4px 16px rgba(0, 0, 0, 0.06)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <TenantLogo tenant={tenant} isDark={isDark} />
        <TenantInfo tenant={tenant} isDark={isDark} />

        {/* Prevent card click when clicking actions */}
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {isMobile ? (
            <MobileActions
              tenant={tenant}
              isDark={isDark}
              onEdit={onEdit}
              onViewUsers={onViewUsers}
              onInviteUser={onInviteUser}
              onToggleStatus={onToggleStatus}
            />
          ) : (
            <DesktopActions
              tenant={tenant}
              isDark={isDark}
              onEdit={onEdit}
              onViewUsers={onViewUsers}
              onInviteUser={onInviteUser}
              onToggleStatus={onToggleStatus}
            />
          )}
        </div>
      </div>
    </div>
  )
})

export default TenantCard
