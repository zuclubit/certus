/**
 * UserFilters Component - Enterprise 2025
 *
 * Componente de filtros responsive para la lista de usuarios.
 * Implementa:
 * - Mobile-first design
 * - Filtros colapsables en móvil
 * - Prevención de desbordamiento
 * - Debounce en búsqueda
 * - Accesibilidad completa
 *
 * @architecture Atomic Design - Molecule level
 */

import { memo, useState, useCallback, useEffect, useRef } from 'react'
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { USER_ROLES } from '@/lib/constants'
import type { User } from '@/types'
import { Button } from '@/components/ui/button'

// ============================================================================
// TYPES
// ============================================================================

export interface UserFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: User['status'] | 'all'
  onStatusChange: (value: User['status'] | 'all') => void
  roleFilter: string | 'all'
  onRoleChange: (value: string | 'all') => void
  /** Callback cuando se limpian todos los filtros */
  onClearFilters?: () => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
  { value: 'suspended', label: 'Suspendidos' },
  { value: 'pending', label: 'Pendientes' },
] as const

const ROLE_OPTIONS = [
  { value: 'all', label: 'Todos los roles' },
  { value: USER_ROLES.AFORE_ADMIN, label: 'Admin AFORE' },
  { value: USER_ROLES.AFORE_ANALYST, label: 'Analista AFORE' },
  { value: USER_ROLES.SYSTEM_ADMIN, label: 'Admin Sistema' },
  { value: USER_ROLES.AUDITOR, label: 'Auditor' },
] as const

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook para debounce de valores
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Select estilizado y responsive
 */
const FilterSelect = memo(function FilterSelect({
  value,
  onChange,
  options,
  label,
  isDark,
}: {
  value: string
  onChange: (value: string) => void
  options: readonly { value: string; label: string }[]
  label: string
  isDark: boolean
}) {
  return (
    <div className="relative w-full sm:w-auto">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full sm:w-auto px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl text-sm',
          'border transition-all duration-200 appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          'pr-8 sm:pr-10', // Espacio para el icono
          'min-h-[44px]', // Touch-friendly
          isDark
            ? 'bg-neutral-800/50 border-neutral-700 text-neutral-100'
            : 'bg-white/50 border-neutral-300 text-neutral-900'
        )}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          'absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none',
          isDark ? 'text-neutral-500' : 'text-neutral-400'
        )}
      />
    </div>
  )
})

/**
 * Input de búsqueda
 */
const SearchInput = memo(function SearchInput({
  value,
  onChange,
  onClear,
  isDark,
}: {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  isDark: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative flex-1 min-w-0">
      <Search
        className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none',
          isDark ? 'text-neutral-500' : 'text-neutral-400'
        )}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nombre, email..."
        className={cn(
          'w-full pl-10 pr-10 py-2.5 rounded-lg sm:rounded-xl text-sm',
          'border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          'min-h-[44px]', // Touch-friendly
          isDark
            ? 'bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-500'
            : 'bg-white/50 border-neutral-300 text-neutral-900 placeholder-neutral-400'
        )}
        aria-label="Buscar usuarios"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onClear()
            inputRef.current?.focus()
          }}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md',
            'transition-colors',
            isDark
              ? 'hover:bg-neutral-700 text-neutral-400'
              : 'hover:bg-neutral-200 text-neutral-500'
          )}
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
})

/**
 * Indicador de filtros activos
 */
const ActiveFiltersCount = memo(function ActiveFiltersCount({
  count,
}: {
  count: number
}) {
  if (count === 0) return null

  return (
    <span
      className={cn(
        'absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold',
        'flex items-center justify-center',
        'bg-primary-500 text-white'
      )}
    >
      {count}
    </span>
  )
})

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UserFilters - Componente de filtros para lista de usuarios
 *
 * En desktop: Todos los filtros visibles en una fila
 * En móvil: Búsqueda visible + botón para expandir filtros
 */
export const UserFilters = memo(function UserFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  roleFilter,
  onRoleChange,
  onClearFilters,
}: UserFiltersProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const isMobile = useIsMobile()

  // Estado local para búsqueda con debounce
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debouncedSearch = useDebounce(localSearch, 300)

  // Estado para filtros expandidos en móvil
  const [showFilters, setShowFilters] = useState(false)

  // Sincronizar búsqueda debounceada
  useEffect(() => {
    onSearchChange(debouncedSearch)
  }, [debouncedSearch, onSearchChange])

  // Sincronizar cuando el valor externo cambia
  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Contar filtros activos
  const activeFiltersCount =
    (statusFilter !== 'all' ? 1 : 0) + (roleFilter !== 'all' ? 1 : 0)

  // Verificar si hay filtros activos
  const hasActiveFilters =
    activeFiltersCount > 0 || searchQuery.trim().length > 0

  // Handler para limpiar todos los filtros
  const handleClearAll = useCallback(() => {
    setLocalSearch('')
    onSearchChange('')
    onStatusChange('all')
    onRoleChange('all')
    onClearFilters?.()
  }, [onSearchChange, onStatusChange, onRoleChange, onClearFilters])

  return (
    <div
      className={cn(
        'rounded-xl sm:rounded-[20px] p-3 sm:p-4',
        'transition-all duration-300'
      )}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(16px) saturate(140%)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.06)'
          : '1px solid rgba(255, 255, 255, 0.6)',
      }}
      role="search"
      aria-label="Filtros de usuarios"
    >
      {/* Fila principal: Búsqueda + Toggle de filtros (móvil) o todos los filtros (desktop) */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Búsqueda - siempre visible */}
        <SearchInput
          value={localSearch}
          onChange={setLocalSearch}
          onClear={() => {
            setLocalSearch('')
            onSearchChange('')
          }}
          isDark={isDark}
        />

        {/* Desktop: Filtros inline */}
        {!isMobile && (
          <>
            <FilterSelect
              value={statusFilter}
              onChange={(v) => onStatusChange(v as User['status'] | 'all')}
              options={STATUS_OPTIONS}
              label="Filtrar por estado"
              isDark={isDark}
            />
            <FilterSelect
              value={roleFilter}
              onChange={(v) => onRoleChange(v as string | 'all')}
              options={ROLE_OPTIONS}
              label="Filtrar por rol"
              isDark={isDark}
            />
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </>
        )}

        {/* Móvil: Botón para mostrar/ocultar filtros */}
        {isMobile && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium',
                'border transition-all duration-200',
                'min-h-[44px]',
                showFilters
                  ? isDark
                    ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                    : 'bg-primary-50 border-primary-200 text-primary-600'
                  : isDark
                    ? 'bg-neutral-800/50 border-neutral-700 text-neutral-300'
                    : 'bg-white/50 border-neutral-300 text-neutral-700'
              )}
              aria-expanded={showFilters}
              aria-controls="mobile-filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtros</span>
              <ActiveFiltersCount count={activeFiltersCount} />
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className={cn(
                  'flex items-center justify-center p-2.5 rounded-xl',
                  'border transition-all duration-200',
                  'min-h-[44px] min-w-[44px]',
                  isDark
                    ? 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:text-neutral-300'
                    : 'bg-white/50 border-neutral-300 text-neutral-500 hover:text-neutral-700'
                )}
                aria-label="Limpiar todos los filtros"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Móvil: Filtros expandibles */}
      {isMobile && showFilters && (
        <div
          id="mobile-filters"
          className={cn(
            'mt-3 pt-3 space-y-3',
            'border-t',
            isDark ? 'border-neutral-700/50' : 'border-neutral-200'
          )}
        >
          <FilterSelect
            value={statusFilter}
            onChange={(v) => onStatusChange(v as User['status'] | 'all')}
            options={STATUS_OPTIONS}
            label="Filtrar por estado"
            isDark={isDark}
          />
          <FilterSelect
            value={roleFilter}
            onChange={(v) => onRoleChange(v as string | 'all')}
            options={ROLE_OPTIONS}
            label="Filtrar por rol"
            isDark={isDark}
          />
        </div>
      )}
    </div>
  )
})

export default UserFilters
