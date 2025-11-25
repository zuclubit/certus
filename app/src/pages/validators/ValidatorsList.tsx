/**
 * Validators List Page - VisionOS Enterprise 2026
 *
 * Main page for viewing and managing validator rules
 * Features: Filtering, search, toggle active/inactive, metrics display
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { useValidators } from '@/hooks/useValidators'
import { ValidatorCard } from '@/components/validators'
import { SearchBar, FilterChip, PremiumButtonV2 } from '@/components/ui'
import {
  Filter,
  RefreshCw,
  Plus,
  Download,
  Upload,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { ValidatorStatus, ValidatorCriticality } from '@/types'
import type { ValidatorType } from '@/types'

// ============================================
// MAIN COMPONENT
// ============================================

export default function ValidatorsList() {
  const navigate = useNavigate()
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const {
    validators,
    filters,
    isLoading,
    loadValidators,
    setFilters,
    resetFilters,
    toggleValidator,
    getActiveValidators,
    getValidatorsByStatus,
    getValidatorsByCriticality,
  } = useValidators()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<ValidatorStatus[]>([])
  const [selectedCriticalities, setSelectedCriticalities] = useState<ValidatorCriticality[]>([])

  // Load validators on mount
  useEffect(() => {
    loadValidators()
  }, [loadValidators])

  // Filter validators locally for display
  const filteredValidators = validators.filter((validator) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        validator.name.toLowerCase().includes(query) ||
        validator.code.toLowerCase().includes(query) ||
        validator.description.toLowerCase().includes(query) ||
        validator.category.toLowerCase().includes(query)

      if (!matchesSearch) return false
    }

    // Status filter
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(validator.status)) {
      return false
    }

    // Criticality filter
    if (selectedCriticalities.length > 0 && !selectedCriticalities.includes(validator.criticality)) {
      return false
    }

    return true
  })

  // Stats
  const stats = {
    total: validators.length,
    active: getActiveValidators().length,
    critical: getValidatorsByCriticality(ValidatorCriticality.CRITICAL).length,
    errors: getValidatorsByCriticality(ValidatorCriticality.ERROR).length,
    warnings: getValidatorsByCriticality(ValidatorCriticality.WARNING).length,
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1
            className={cn(
              'text-xl sm:text-2xl lg:ios-heading-large font-bold mb-1 sm:mb-2 truncate',
              isDark ? 'text-neutral-100' : 'text-neutral-900'
            )}
          >
            Configurador de Validadores
          </h1>
          <p
            className={cn(
              'text-sm sm:ios-text-body font-normal truncate',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            Gestión de reglas de validación CONSAR
          </p>
        </div>

        {/* Action Buttons - Responsive Grid */}
        <div className="grid grid-cols-4 xs:flex xs:flex-wrap gap-2 sm:gap-3">
          <PremiumButtonV2
            icon={RefreshCw}
            onClick={() => loadValidators()}
            disabled={isLoading}
            loading={isLoading}
            size="md"
            className="flex-1 xs:flex-none"
            aria-label="Actualizar"
          >
            <span className="hidden sm:inline ml-2">Actualizar</span>
          </PremiumButtonV2>

          <PremiumButtonV2
            icon={Upload}
            onClick={() => {
              /* Import functionality */
            }}
            size="md"
            className="flex-1 xs:flex-none"
            aria-label="Importar"
          >
            <span className="hidden sm:inline ml-2">Importar</span>
          </PremiumButtonV2>

          <PremiumButtonV2
            icon={Download}
            onClick={() => {
              /* Export functionality */
            }}
            size="md"
            className="flex-1 xs:flex-none"
            aria-label="Exportar"
          >
            <span className="hidden sm:inline ml-2">Exportar</span>
          </PremiumButtonV2>

          <PremiumButtonV2
            icon={Plus}
            onClick={() => navigate('/validators/new')}
            size="md"
            variant="primary"
            className="flex-1 xs:flex-none"
            aria-label="Nuevo Validador"
          >
            <span className="hidden sm:inline ml-2">Nuevo</span>
          </PremiumButtonV2>
        </div>
      </div>

      {/* Stats Cards - Responsive */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
        {/* Total */}
        <div
          className="glass-ultra-premium depth-layer-2 rounded-xl sm:rounded-[16px] p-3 sm:p-4"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                border: '2px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className={cn('text-[10px] sm:ios-text-caption2 font-normal truncate', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                Total
              </p>
              <p className={cn('text-lg sm:ios-heading-title2 font-bold', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        {/* Active */}
        <div
          className="glass-ultra-premium depth-layer-2 rounded-xl sm:rounded-[16px] p-3 sm:p-4"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '2px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className={cn('text-[10px] sm:ios-text-caption2 font-normal truncate', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                Activos
              </p>
              <p className={cn('text-lg sm:ios-heading-title2 font-bold', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                {stats.active}
              </p>
            </div>
          </div>
        </div>

        {/* Critical */}
        <div
          className="glass-ultra-premium depth-layer-2 rounded-xl sm:rounded-[16px] p-3 sm:p-4"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
            </div>
            <div className="min-w-0">
              <p className={cn('text-[10px] sm:ios-text-caption2 font-normal truncate', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                Críticos
              </p>
              <p className={cn('text-lg sm:ios-heading-title2 font-bold', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                {stats.critical}
              </p>
            </div>
          </div>
        </div>

        {/* Errors */}
        <div
          className="glass-ultra-premium depth-layer-2 rounded-xl sm:rounded-[16px] p-3 sm:p-4"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(249, 115, 22, 0.15)',
                border: '2px solid rgba(249, 115, 22, 0.3)',
              }}
            >
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
            </div>
            <div className="min-w-0">
              <p className={cn('text-[10px] sm:ios-text-caption2 font-normal truncate', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                Errores
              </p>
              <p className={cn('text-lg sm:ios-heading-title2 font-bold', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                {stats.errors}
              </p>
            </div>
          </div>
        </div>

        {/* Warnings */}
        <div
          className="glass-ultra-premium depth-layer-2 rounded-xl sm:rounded-[16px] p-3 sm:p-4 col-span-2 xs:col-span-1"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(234, 179, 8, 0.15)',
                border: '2px solid rgba(234, 179, 8, 0.3)',
              }}
            >
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <p className={cn('text-[10px] sm:ios-text-caption2 font-normal truncate', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                Advertencias
              </p>
              <p className={cn('text-lg sm:ios-heading-title2 font-bold', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                {stats.warnings}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Responsive */}
      <div className="space-y-3 sm:space-y-4">
        {/* Search */}
        <SearchBar
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Buscar por nombre, código..."
          className="w-full"
        />

        {/* Filter Chips - Responsive */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Filter className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isDark ? 'text-neutral-500' : 'text-neutral-600')} />
            <span className={cn('text-xs sm:ios-text-footnote font-semibold', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
              Filtros:
            </span>
          </div>

          {/* Status Filters */}
          <FilterChip
            label="Activo"
            count={getValidatorsByStatus(ValidatorStatus.ACTIVE).length}
            active={selectedStatuses.includes(ValidatorStatus.ACTIVE)}
            onToggle={() =>
              setSelectedStatuses((prev) =>
                prev.includes(ValidatorStatus.ACTIVE)
                  ? prev.filter((s) => s !== ValidatorStatus.ACTIVE)
                  : [...prev, ValidatorStatus.ACTIVE]
              )
            }
          />

          <FilterChip
            label="Borrador"
            count={getValidatorsByStatus(ValidatorStatus.DRAFT).length}
            active={selectedStatuses.includes(ValidatorStatus.DRAFT)}
            onToggle={() =>
              setSelectedStatuses((prev) =>
                prev.includes(ValidatorStatus.DRAFT)
                  ? prev.filter((s) => s !== ValidatorStatus.DRAFT)
                  : [...prev, ValidatorStatus.DRAFT]
              )
            }
          />

          {/* Criticality Filters */}
          <FilterChip
            label="Crítico"
            count={stats.critical}
            active={selectedCriticalities.includes(ValidatorCriticality.CRITICAL)}
            onToggle={() =>
              setSelectedCriticalities((prev) =>
                prev.includes(ValidatorCriticality.CRITICAL)
                  ? prev.filter((c) => c !== ValidatorCriticality.CRITICAL)
                  : [...prev, ValidatorCriticality.CRITICAL]
              )
            }
          />

          <FilterChip
            label="Error"
            count={stats.errors}
            active={selectedCriticalities.includes(ValidatorCriticality.ERROR)}
            onToggle={() =>
              setSelectedCriticalities((prev) =>
                prev.includes(ValidatorCriticality.ERROR)
                  ? prev.filter((c) => c !== ValidatorCriticality.ERROR)
                  : [...prev, ValidatorCriticality.ERROR]
              )
            }
          />

          {/* Clear Filters */}
          {(selectedStatuses.length > 0 || selectedCriticalities.length > 0 || searchQuery) && (
            <button
              onClick={() => {
                setSelectedStatuses([])
                setSelectedCriticalities([])
                setSearchQuery('')
                resetFilters()
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                isDark
                  ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              )}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Validators List - Responsive */}
      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          <div className="text-center py-8 sm:py-12">
            <RefreshCw
              className={cn('h-10 w-10 sm:h-12 sm:w-12 animate-spin mx-auto mb-3 sm:mb-4', isDark ? 'text-neutral-500' : 'text-neutral-400')}
            />
            <p className={cn('text-sm sm:ios-text-body font-medium', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
              Cargando validadores...
            </p>
          </div>
        ) : filteredValidators.length === 0 ? (
          <div
            className="glass-ultra-premium depth-layer-2 rounded-2xl sm:rounded-[20px] p-6 sm:p-12 text-center"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
            }}
          >
            <Shield className={cn('h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4', isDark ? 'text-neutral-600' : 'text-neutral-400')} />
            <p className={cn('text-sm sm:ios-text-body font-semibold mb-1.5 sm:mb-2', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
              No se encontraron validadores
            </p>
            <p className={cn('text-xs sm:ios-text-footnote font-normal', isDark ? 'text-neutral-600' : 'text-neutral-500')}>
              {searchQuery || selectedStatuses.length > 0 || selectedCriticalities.length > 0
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Crea tu primer validador para comenzar'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filteredValidators.map((validator) => (
              <ValidatorCard
                key={validator.id}
                validator={validator}
                isDark={isDark}
                onToggle={toggleValidator}
                onClick={(v) => navigate(`/validators/${v.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Results Count - Responsive */}
      {!isLoading && filteredValidators.length > 0 && (
        <div className="text-center py-2 sm:py-0">
          <p className={cn('text-xs sm:ios-text-footnote font-normal', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
            Mostrando {filteredValidators.length} de {validators.length} validadores
          </p>
        </div>
      )}
    </div>
  )
}
