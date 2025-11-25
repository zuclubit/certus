/**
 * UserCard Component - Enterprise 2025
 *
 * Componente modular y reutilizable para mostrar información de usuario.
 * Sigue las mejores prácticas de 2025:
 * - Mobile-first responsive design
 * - Prevención de desbordamiento con truncamiento
 * - Flexbox con min-width: 0 para texto truncado
 * - Acciones responsive (botones en desktop, dropdown en móvil)
 * - Accesibilidad completa
 *
 * @see https://css-tricks.com/flexbox-truncated-text/
 * @see https://tanstack.com/table/latest
 */

import { memo, useState } from 'react'
import {
  Mail,
  Phone,
  Building2,
  Clock,
  Activity,
  Key,
  Edit2,
  Trash2,
  Ban,
  CheckCircle,
  UserX,
  MoreVertical,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type { User } from '@/types'
import { USER_ROLES } from '@/lib/constants'
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

export interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onSuspend?: (user: User) => void
  onReactivate?: (user: User) => void
}

export interface UserCardActions {
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onSuspend?: (user: User) => void
  onReactivate?: (user: User) => void
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getRoleBadgeStyles = (role: string) => {
  switch (role) {
    case USER_ROLES.SYSTEM_ADMIN:
      return {
        bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.12) 100%)',
        border: 'rgba(139, 92, 246, 0.3)',
        text: '#8B5CF6',
      }
    case USER_ROLES.AFORE_ADMIN:
      return {
        bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.12) 100%)',
        border: 'rgba(59, 130, 246, 0.3)',
        text: '#3B82F6',
      }
    case USER_ROLES.AUDITOR:
      return {
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.12) 100%)',
        border: 'rgba(245, 158, 11, 0.3)',
        text: '#F59E0B',
      }
    default: // AFORE_ANALYST
      return {
        bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.12) 100%)',
        border: 'rgba(16, 185, 129, 0.3)',
        text: '#10B981',
      }
  }
}

const getStatusConfig = (status: User['status']) => {
  switch (status) {
    case 'active':
      return { label: 'Activo', icon: CheckCircle, color: '#10B981' }
    case 'inactive':
      return { label: 'Inactivo', icon: UserX, color: '#64748B' }
    case 'suspended':
      return { label: 'Suspendido', icon: Ban, color: '#EF4444' }
    case 'pending':
      return { label: 'Pendiente', icon: Clock, color: '#F59E0B' }
  }
}

const formatRelativeTime = (dateString: string | undefined) => {
  if (!dateString) return 'Nunca'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

const formatRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    [USER_ROLES.SYSTEM_ADMIN]: 'Admin Sistema',
    [USER_ROLES.AFORE_ADMIN]: 'Admin AFORE',
    [USER_ROLES.AFORE_ANALYST]: 'Analista',
    [USER_ROLES.AUDITOR]: 'Auditor',
  }
  return labels[role] || role.replace('_', ' ')
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Avatar con indicador de estado
 */
const UserAvatar = memo(function UserAvatar({
  user,
  isDark,
}: {
  user: User
  isDark: boolean
}) {
  const status = getStatusConfig(user.status)
  const StatusIcon = status.icon

  return (
    <div className="relative flex-shrink-0">
      <img
        src={
          user.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
        }
        alt={user.name}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-[14px] object-cover"
        style={{
          border: isDark
            ? '2px solid rgba(255, 255, 255, 0.1)'
            : '2px solid rgba(255, 255, 255, 0.6)',
        }}
      />
      <div
        className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center"
        style={{
          background: status.color,
          border: isDark ? '2px solid #0F172A' : '2px solid #FFFFFF',
        }}
        title={status.label}
      >
        <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
      </div>
    </div>
  )
})

/**
 * Información principal del usuario (nombre, badges)
 */
const UserInfo = memo(function UserInfo({
  user,
  isDark,
}: {
  user: User
  isDark: boolean
}) {
  const roleBadge = getRoleBadgeStyles(user.role)

  return (
    <div className="flex-1 min-w-0">
      {/* Nombre y badge MFA */}
      <div className="flex items-center gap-2 mb-1">
        <h3
          className={cn(
            'text-base sm:text-lg font-bold truncate',
            isDark ? 'text-neutral-100' : 'text-neutral-900'
          )}
          title={user.name}
        >
          {user.name}
        </h3>
        {user.isMfaEnabled && (
          <div
            className="flex-shrink-0 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold flex items-center gap-1"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981',
            }}
          >
            <Key className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">MFA</span>
          </div>
        )}
      </div>

      {/* Email y teléfono - stack en móvil, inline en desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm mb-2 sm:mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <Mail
            className={cn(
              'h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}
          />
          <span
            className={cn(
              'truncate',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
            title={user.email}
          >
            {user.email}
          </span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Phone
              className={cn(
                'h-3.5 w-3.5 sm:h-4 sm:w-4',
                isDark ? 'text-neutral-500' : 'text-neutral-400'
              )}
            />
            <span className={cn(isDark ? 'text-neutral-400' : 'text-neutral-600')}>
              {user.phone}
            </span>
          </div>
        )}
      </div>

      {/* Metadata badges - scrollable en móvil */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Role badge */}
        <div
          className="flex-shrink-0 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-[8px] text-[10px] sm:text-xs font-semibold"
          style={{
            background: roleBadge.bg,
            border: `1px solid ${roleBadge.border}`,
            color: roleBadge.text,
          }}
        >
          {formatRoleLabel(user.role)}
        </div>

        {/* Department - oculto en móvil pequeño */}
        {user.department && (
          <div className="hidden xs:flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
            <Building2
              className={cn(
                'h-3 w-3',
                isDark ? 'text-neutral-500' : 'text-neutral-400'
              )}
            />
            <span
              className={cn(
                'truncate max-w-[80px] sm:max-w-[120px]',
                isDark ? 'text-neutral-500' : 'text-neutral-500'
              )}
              title={user.department}
            >
              {user.department}
            </span>
          </div>
        )}

        {/* Last login */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
          <Clock
            className={cn(
              'h-3 w-3',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}
          />
          <span className={cn(isDark ? 'text-neutral-500' : 'text-neutral-500')}>
            {formatRelativeTime(user.lastLogin)}
          </span>
        </div>

        {/* Sessions - oculto en móvil */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <Activity
            className={cn(
              'h-3 w-3',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}
          />
          <span className={cn(isDark ? 'text-neutral-500' : 'text-neutral-500')}>
            {user.sessionCount} sesiones
          </span>
        </div>
      </div>
    </div>
  )
})

/**
 * Acciones en formato botones (desktop)
 */
const DesktopActions = memo(function DesktopActions({
  user,
  isDark,
  onEdit,
  onDelete,
  onSuspend,
  onReactivate,
}: {
  user: User
  isDark: boolean
} & UserCardActions) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {user.status === 'active' && (
        <>
          <button
            onClick={() => onEdit?.(user)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark
                ? 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-300'
                : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-700'
            )}
            title="Editar usuario"
            aria-label={`Editar ${user.name}`}
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onSuspend?.(user)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark
                ? 'hover:bg-yellow-950/50 text-yellow-600 hover:text-yellow-500'
                : 'hover:bg-yellow-50 text-yellow-600 hover:text-yellow-700'
            )}
            title="Suspender usuario"
            aria-label={`Suspender ${user.name}`}
          >
            <Ban className="h-4 w-4" />
          </button>
        </>
      )}

      {(user.status === 'inactive' || user.status === 'suspended') && (
        <button
          onClick={() => onReactivate?.(user)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            isDark
              ? 'hover:bg-green-950/50 text-green-600 hover:text-green-500'
              : 'hover:bg-green-50 text-green-600 hover:text-green-700'
          )}
          title="Reactivar usuario"
          aria-label={`Reactivar ${user.name}`}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      )}

      <button
        onClick={() => onDelete?.(user)}
        className={cn(
          'p-2 rounded-lg transition-colors',
          isDark
            ? 'hover:bg-red-950/50 text-red-600 hover:text-red-500'
            : 'hover:bg-red-50 text-red-600 hover:text-red-700'
        )}
        title="Eliminar usuario"
        aria-label={`Eliminar ${user.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
})

/**
 * Acciones en formato dropdown (móvil)
 */
const MobileActions = memo(function MobileActions({
  user,
  isDark,
  onEdit,
  onDelete,
  onSuspend,
  onReactivate,
}: {
  user: User
  isDark: boolean
} & UserCardActions) {
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
          aria-label="Más opciones"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {user.status === 'active' && (
          <>
            <DropdownMenuItem onClick={() => onEdit?.(user)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSuspend?.(user)}
              className="text-yellow-600"
            >
              <Ban className="h-4 w-4 mr-2" />
              Suspender
            </DropdownMenuItem>
          </>
        )}

        {(user.status === 'inactive' || user.status === 'suspended') && (
          <DropdownMenuItem
            onClick={() => onReactivate?.(user)}
            className="text-green-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reactivar
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onDelete?.(user)}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UserCard - Componente principal
 *
 * Muestra información de usuario de forma responsive y modular.
 * Usa dropdown en móvil y botones en desktop para las acciones.
 */
export const UserCard = memo(function UserCard({
  user,
  onEdit,
  onDelete,
  onSuspend,
  onReactivate,
}: UserCardProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const isMobile = useIsMobile()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'rounded-xl sm:rounded-[20px] p-4 sm:p-6 transition-all duration-300',
        'focus-within:ring-2 focus-within:ring-primary-500/50'
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
            ? '0 8px 24px rgba(0, 0, 0, 0.4)'
            : '0 8px 24px rgba(0, 0, 0, 0.1)'
          : isDark
            ? '0 4px 16px rgba(0, 0, 0, 0.3)'
            : '0 4px 16px rgba(0, 0, 0, 0.06)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <UserAvatar user={user} isDark={isDark} />

        <UserInfo user={user} isDark={isDark} />

        {/* Actions - responsive */}
        <div className="flex-shrink-0">
          {isMobile ? (
            <MobileActions
              user={user}
              isDark={isDark}
              onEdit={onEdit}
              onDelete={onDelete}
              onSuspend={onSuspend}
              onReactivate={onReactivate}
            />
          ) : (
            <DesktopActions
              user={user}
              isDark={isDark}
              onEdit={onEdit}
              onDelete={onDelete}
              onSuspend={onSuspend}
              onReactivate={onReactivate}
            />
          )}
        </div>
      </div>
    </div>
  )
})

export default UserCard
