/**
 * UserPageHeader Component - Enterprise 2025
 *
 * Header responsive para la página de usuarios.
 * Implementa:
 * - Mobile-first design
 * - Stack en móvil, inline en desktop
 * - Prevención de desbordamiento
 * - Botón fullwidth en móvil
 *
 * @architecture Atomic Design - Molecule level
 */

import { memo } from 'react'
import { Users as UsersIcon, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { PremiumButtonV2 } from '@/components/ui'

// ============================================================================
// TYPES
// ============================================================================

export interface UserPageHeaderProps {
  onCreateUser: () => void
  isLoading?: boolean
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UserPageHeader - Header de la página de usuarios
 *
 * Layout responsive:
 * - Móvil: Stack vertical con botón fullwidth
 * - Desktop: Flexbox horizontal con justify-between
 */
export const UserPageHeader = memo(function UserPageHeader({
  onCreateUser,
  isLoading = false,
}: UserPageHeaderProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const isMobile = useIsMobile()

  return (
    <div
      className="rounded-xl sm:rounded-[24px] p-4 sm:p-6"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(20px) saturate(150%)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05) inset'
          : '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.8) inset',
      }}
    >
      <div
        className={cn(
          'flex',
          // Móvil: stack vertical
          'flex-col gap-4',
          // Desktop: horizontal con items al centro
          'sm:flex-row sm:items-center sm:justify-between sm:gap-6'
        )}
      >
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div
            className="flex-shrink-0 p-2.5 sm:p-3.5 rounded-xl sm:rounded-[16px]"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              boxShadow:
                '0 0 24px rgba(139, 92, 246, 0.3), 0 8px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            <UsersIcon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <h1
              className="text-xl sm:text-2xl font-bold truncate"
              style={{
                fontFamily: '"SF Pro Display", "Inter", system-ui, sans-serif',
                color: isDark ? '#FFFFFF' : '#0F172A',
                letterSpacing: '-0.02em',
              }}
            >
              Gestión de Usuarios
            </h1>
            <p
              className="text-xs sm:text-sm font-medium mt-0.5 truncate"
              style={{
                color: isDark
                  ? 'rgba(255, 255, 255, 0.6)'
                  : 'rgba(15, 23, 42, 0.6)',
              }}
            >
              Administración de usuarios y control de accesos • CONSAR 2025
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {isMobile ? (
            // Móvil: Botón fullwidth
            <button
              onClick={onCreateUser}
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'px-4 py-3 rounded-xl text-sm font-semibold',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'min-h-[48px]' // Touch-friendly
              )}
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
                color: '#FFFFFF',
              }}
            >
              <UserPlus className="h-5 w-5" />
              <span>Nuevo Usuario</span>
            </button>
          ) : (
            // Desktop: Botón premium
            <PremiumButtonV2
              label="Nuevo Usuario"
              icon={UserPlus}
              size="lg"
              onClick={onCreateUser}
              disabled={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
})

export default UserPageHeader
