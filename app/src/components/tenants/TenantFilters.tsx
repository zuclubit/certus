/**
 * TenantFilters Component - Enterprise 2025
 *
 * Filter controls for tenant/AFORE list.
 * Supports search, status filter, and sorting.
 *
 * @version 1.0.0
 * @compliance CONSAR 2025
 */

import { memo, useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ============================================================================
// TYPES
// ============================================================================

export interface TenantFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: 'all' | 'active' | 'inactive'
  onStatusChange: (value: 'all' | 'active' | 'inactive') => void
  sortBy: 'name' | 'code' | 'createdAt'
  onSortByChange: (value: 'name' | 'code' | 'createdAt') => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (value: 'asc' | 'desc') => void
  onClearFilters: () => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
] as const

const SORT_OPTIONS = [
  { value: 'name', label: 'Nombre' },
  { value: 'code', label: 'Código' },
  { value: 'createdAt', label: 'Fecha de creación' },
] as const

// ============================================================================
// COMPONENT
// ============================================================================

export const TenantFilters = memo(function TenantFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
}: TenantFiltersProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const isMobile = useIsMobile()
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = statusFilter !== 'all' || sortBy !== 'name' || sortOrder !== 'asc'

  const getStatusLabel = () => STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label || 'Estado'
  const getSortLabel = () => SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Ordenar'

  return (
    <div
      className="rounded-xl sm:rounded-[20px] p-4 sm:p-5"
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
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl text-sm',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
              'transition-all duration-200',
              isDark
                ? 'bg-neutral-800/50 text-neutral-100 placeholder-neutral-500 border-neutral-700'
                : 'bg-white/50 text-neutral-900 placeholder-neutral-400 border-neutral-200',
              'border'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full',
                isDark ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'
              )}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Desktop Filters */}
        {!isMobile ? (
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className={cn(
                    'gap-2 min-w-[130px] justify-between',
                    statusFilter !== 'all' && 'ring-2 ring-violet-500/50'
                  )}
                >
                  <span>{getStatusLabel()}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {STATUS_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onStatusChange(option.value as 'all' | 'active' | 'inactive')}
                    className={cn(
                      statusFilter === option.value && 'bg-violet-500/10 text-violet-600'
                    )}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort By */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="gap-2 min-w-[140px] justify-between">
                  <span>Ordenar: {getSortLabel()}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onSortByChange(option.value as 'name' | 'code' | 'createdAt')}
                    className={cn(sortBy === option.value && 'bg-violet-500/10 text-violet-600')}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Order Toggle */}
            <Button
              variant="secondary"
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3"
              title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
            >
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </Button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={onClearFilters}
                className="gap-2 text-neutral-500 hover:text-neutral-700"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>
        ) : (
          /* Mobile Filter Toggle */
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className={cn('gap-2', hasActiveFilters && 'ring-2 ring-violet-500/50')}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 w-5 h-5 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Mobile Filters Panel */}
      {isMobile && showFilters && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
          {/* Status */}
          <div>
            <label className={cn('text-xs font-medium mb-2 block', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
              Estado
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onStatusChange(option.value as 'all' | 'active' | 'inactive')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    statusFilter === option.value
                      ? 'bg-violet-500 text-white'
                      : isDark
                        ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className={cn('text-xs font-medium mb-2 block', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
              Ordenar por
            </label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSortByChange(option.value as 'name' | 'code' | 'createdAt')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    sortBy === option.value
                      ? 'bg-violet-500 text-white'
                      : isDark
                        ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={() => {
                onClearFilters()
                setShowFilters(false)
              }}
              className="w-full gap-2"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  )
})

export default TenantFilters
