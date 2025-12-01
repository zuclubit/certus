/**
 * TenantPageHeader Component - Enterprise 2025
 *
 * Header component for the Tenants/AFORE management page.
 * Includes title, description, and create button.
 *
 * @version 1.0.0
 * @compliance CONSAR 2025
 */

import { memo } from 'react'
import { Plus, Building2, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { Button } from '@/components/ui/button'

// ============================================================================
// TYPES
// ============================================================================

export interface TenantPageHeaderProps {
  onCreateTenant: () => void
  isLoading?: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TenantPageHeader = memo(function TenantPageHeader({
  onCreateTenant,
  isLoading = false,
}: TenantPageHeaderProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      className="rounded-xl sm:rounded-[20px] p-4 sm:p-6"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)'
          : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)',
        backdropFilter: 'blur(16px) saturate(140%)',
        border: isDark
          ? '1px solid rgba(139, 92, 246, 0.2)'
          : '1px solid rgba(139, 92, 246, 0.15)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title and description */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%)'
                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
            }}
          >
            <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-violet-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1
                className={cn(
                  'text-xl sm:text-2xl font-bold',
                  isDark ? 'text-neutral-100' : 'text-neutral-900'
                )}
              >
                Gestión de AFOREs
              </h1>
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium"
                style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#8B5CF6',
                }}
              >
                <Shield className="h-3 w-3" />
                <span className="hidden sm:inline">Admin</span>
              </div>
            </div>
            <p
              className={cn(
                'text-sm sm:text-base',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              Administre las organizaciones AFORE y sus usuarios en el sistema Certus
            </p>
          </div>
        </div>

        {/* Create button */}
        <Button
          onClick={onCreateTenant}
          disabled={isLoading}
          className={cn(
            'gap-2 min-w-[140px]',
            'bg-gradient-to-r from-violet-600 to-blue-600',
            'hover:from-violet-700 hover:to-blue-700',
            'text-white shadow-lg shadow-violet-500/25',
            'transition-all duration-300 hover:shadow-violet-500/40'
          )}
        >
          <Plus className="h-4 w-4" />
          <span>Nueva AFORE</span>
        </Button>
      </div>
    </div>
  )
})

export default TenantPageHeader
