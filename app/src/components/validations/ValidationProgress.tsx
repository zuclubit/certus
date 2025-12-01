/**
 * ValidationProgress Component
 *
 * Real-time validation progress display with:
 * - Progress bar with phase indicators
 * - Error/warning summary cards
 * - Detailed error list by category
 * - Performance metrics
 *
 * Integrates with ValidationEngine for CONSAR file validation
 *
 * @version 1.0.0
 * @compliance CONSAR Circular 19-8
 */

import { useMemo } from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Zap,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type {
  FileValidationResult,
  ValidationProgress as ValidationProgressType,
  ValidationErrorDetail,
} from '@/lib/validators/validation-engine'
import { useState } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationProgressProps {
  progress: ValidationProgressType | null
  result: FileValidationResult | null
  isValidating: boolean
  fileName?: string
}

interface ErrorCategoryGroup {
  category: string
  errors: ValidationErrorDetail[]
  count: number
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getPhaseProgress = (phase: ValidationProgressType['phase']): number => {
  const phases: ValidationProgressType['phase'][] = [
    'parsing',
    'structure',
    'records',
    'summary',
    'complete',
  ]
  const idx = phases.indexOf(phase)
  return ((idx + 1) / phases.length) * 100
}

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.round((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

const groupErrorsByCategory = (
  errors: ValidationErrorDetail[]
): ErrorCategoryGroup[] => {
  const groups: Record<string, ValidationErrorDetail[]> = {}

  errors.forEach((error) => {
    const category = error.field || 'General'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(error)
  })

  return Object.entries(groups)
    .map(([category, errors]) => ({
      category,
      errors,
      count: errors.length,
    }))
    .sort((a, b) => b.count - a.count)
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Progress Bar Component
 */
function ProgressBar({
  progress,
  isDark,
}: {
  progress: ValidationProgressType
  isDark: boolean
}) {
  return (
    <div className="space-y-3">
      {/* Phase Indicators */}
      <div className="flex justify-between text-xs font-medium">
        {['parsing', 'structure', 'records', 'summary', 'complete'].map(
          (phase) => {
            const isActive = progress.phase === phase
            const isPast =
              getPhaseProgress(progress.phase as ValidationProgressType['phase']) >
              getPhaseProgress(phase as ValidationProgressType['phase'])

            return (
              <div
                key={phase}
                className={cn(
                  'flex items-center gap-1 transition-colors',
                  isActive && (isDark ? 'text-blue-400' : 'text-blue-600'),
                  isPast && (isDark ? 'text-green-400' : 'text-green-600'),
                  !isActive && !isPast && (isDark ? 'text-neutral-500' : 'text-neutral-400')
                )}
              >
                {isPast ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : isActive ? (
                  <div className="h-3 w-3 rounded-full bg-current animate-pulse" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-current opacity-40" />
                )}
                <span className="hidden sm:inline capitalize">
                  {phase === 'parsing' && 'Parse'}
                  {phase === 'structure' && 'Estructura'}
                  {phase === 'records' && 'Registros'}
                  {phase === 'summary' && 'Resumen'}
                  {phase === 'complete' && 'Completo'}
                </span>
              </div>
            )
          }
        )}
      </div>

      {/* Progress Bar */}
      <div
        className={cn('relative h-2 rounded-full overflow-hidden')}
        style={{
          background: isDark ? 'rgba(45, 45, 55, 0.6)' : 'rgba(0, 0, 0, 0.08)',
        }}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress.percentComplete}%`,
            background: 'linear-gradient(90deg, #0066FF 0%, #5856D6 50%, #7C3AED 100%)',
          }}
        />
      </div>

      {/* Progress Details */}
      <div className="flex justify-between items-center text-xs">
        <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>
          {progress.currentMessage}
        </span>
        <span className={cn('font-semibold', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
          {progress.percentComplete}%
        </span>
      </div>

      {/* Records Progress */}
      {progress.totalRecords > 0 && (
        <div className="flex items-center gap-4 text-xs">
          <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>
            Registros: {progress.recordsProcessed.toLocaleString()} /{' '}
            {progress.totalRecords.toLocaleString()}
          </span>
          {progress.errorsFound > 0 && (
            <span className="text-red-500 font-medium">
              {progress.errorsFound} errores
            </span>
          )}
          {progress.warningsFound > 0 && (
            <span className="text-amber-500 font-medium">
              {progress.warningsFound} advertencias
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Summary Cards Component
 */
function SummaryCards({
  result,
  isDark,
}: {
  result: FileValidationResult
  isDark: boolean
}) {
  const cards = [
    {
      label: 'Total Registros',
      value: result.summary.totalRecords.toLocaleString(),
      icon: FileText,
      color: 'blue',
    },
    {
      label: 'Válidos',
      value: result.summary.validRecords.toLocaleString(),
      icon: CheckCircle2,
      color: 'green',
    },
    {
      label: 'Con Errores',
      value: result.summary.invalidRecords.toLocaleString(),
      icon: XCircle,
      color: 'red',
    },
    {
      label: 'Con Advertencias',
      value: result.summary.warningRecords.toLocaleString(),
      icon: AlertTriangle,
      color: 'amber',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn('p-4 rounded-[16px]', 'glass-ultra-clear depth-layer-1')}
          style={{
            background: isDark ? 'rgba(45, 45, 55, 0.4)' : 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon
              className={cn(
                'h-4 w-4',
                card.color === 'blue' && (isDark ? 'text-blue-400' : 'text-blue-600'),
                card.color === 'green' && (isDark ? 'text-green-400' : 'text-green-600'),
                card.color === 'red' && (isDark ? 'text-red-400' : 'text-red-600'),
                card.color === 'amber' && (isDark ? 'text-amber-400' : 'text-amber-600')
              )}
            />
            <span
              className={cn('text-xs font-medium', isDark ? 'text-neutral-400' : 'text-neutral-600')}
            >
              {card.label}
            </span>
          </div>
          <p
            className={cn('text-2xl font-bold', isDark ? 'text-neutral-100' : 'text-neutral-900')}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}

/**
 * Performance Metrics Component
 */
function PerformanceMetrics({
  result,
  isDark,
}: {
  result: FileValidationResult
  isDark: boolean
}) {
  return (
    <div
      className={cn('flex flex-wrap gap-4 p-4 rounded-[14px]', 'glass-ultra-clear')}
      style={{
        background: isDark ? 'rgba(45, 45, 55, 0.3)' : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center gap-2">
        <Clock className={cn('h-4 w-4', isDark ? 'text-neutral-400' : 'text-neutral-500')} />
        <span className={cn('text-xs', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
          Tiempo total:{' '}
          <span className="font-semibold">{formatDuration(result.performance.totalTime)}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Zap className={cn('h-4 w-4', isDark ? 'text-neutral-400' : 'text-neutral-500')} />
        <span className={cn('text-xs', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
          Velocidad:{' '}
          <span className="font-semibold">
            {result.performance.recordsPerSecond.toFixed(0)} reg/s
          </span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <FileText className={cn('h-4 w-4', isDark ? 'text-neutral-400' : 'text-neutral-500')} />
        <span className={cn('text-xs', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
          Tamaño:{' '}
          <span className="font-semibold">
            {(result.fileSize / 1024).toFixed(1)} KB
          </span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2
          className={cn(
            'h-4 w-4',
            result.summary.complianceScore >= 98
              ? isDark
                ? 'text-green-400'
                : 'text-green-600'
              : isDark
              ? 'text-amber-400'
              : 'text-amber-600'
          )}
        />
        <span className={cn('text-xs', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
          Cumplimiento:{' '}
          <span
            className={cn(
              'font-semibold',
              result.summary.complianceScore >= 98
                ? isDark
                  ? 'text-green-400'
                  : 'text-green-600'
                : isDark
                ? 'text-amber-400'
                : 'text-amber-600'
            )}
          >
            {result.summary.complianceScore.toFixed(1)}%
          </span>
        </span>
      </div>
    </div>
  )
}

/**
 * Error List Component
 */
function ErrorList({
  errors,
  isDark,
  title,
  variant,
}: {
  errors: ValidationErrorDetail[]
  isDark: boolean
  title: string
  variant: 'error' | 'warning'
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const groupedErrors = useMemo(() => groupErrorsByCategory(errors), [errors])

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  if (errors.length === 0) return null

  return (
    <div className="space-y-2">
      <h4
        className={cn(
          'text-sm font-semibold flex items-center gap-2',
          variant === 'error'
            ? isDark
              ? 'text-red-400'
              : 'text-red-600'
            : isDark
            ? 'text-amber-400'
            : 'text-amber-600'
        )}
      >
        {variant === 'error' ? (
          <XCircle className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        {title} ({errors.length})
      </h4>

      <div className="space-y-1">
        {groupedErrors.slice(0, 10).map((group) => (
          <div
            key={group.category}
            className={cn('rounded-[12px] overflow-hidden', 'glass-ultra-clear')}
            style={{
              background: isDark ? 'rgba(45, 45, 55, 0.3)' : 'rgba(255, 255, 255, 0.5)',
              border:
                variant === 'error'
                  ? isDark
                    ? '1px solid rgba(239, 68, 68, 0.2)'
                    : '1px solid rgba(239, 68, 68, 0.15)'
                  : isDark
                  ? '1px solid rgba(251, 191, 36, 0.2)'
                  : '1px solid rgba(251, 191, 36, 0.15)',
            }}
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(group.category)}
              className={cn(
                'w-full flex items-center justify-between p-3 text-left',
                'transition-colors hover:bg-black/5'
              )}
            >
              <div className="flex items-center gap-2">
                {expandedCategories.has(group.category) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium capitalize',
                    isDark ? 'text-neutral-200' : 'text-neutral-800'
                  )}
                >
                  {group.category}
                </span>
              </div>
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  variant === 'error'
                    ? isDark
                      ? 'bg-red-900/30 text-red-400'
                      : 'bg-red-100 text-red-700'
                    : isDark
                    ? 'bg-amber-900/30 text-amber-400'
                    : 'bg-amber-100 text-amber-700'
                )}
              >
                {group.count}
              </span>
            </button>

            {/* Expanded Error Details */}
            {expandedCategories.has(group.category) && (
              <div className="px-3 pb-3 space-y-2">
                {group.errors.slice(0, 5).map((error, idx) => (
                  <div
                    key={idx}
                    className={cn('p-2 rounded-lg text-xs', 'bg-black/5 dark:bg-white/5')}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded font-mono text-[10px]',
                          isDark ? 'bg-neutral-700' : 'bg-neutral-200'
                        )}
                      >
                        {error.code}
                      </span>
                      <span className={isDark ? 'text-neutral-300' : 'text-neutral-700'}>
                        {error.message}
                      </span>
                    </div>
                    {error.lineNumber && (
                      <p className={cn('mt-1', isDark ? 'text-neutral-500' : 'text-neutral-500')}>
                        Línea {error.lineNumber}
                        {error.value && `: "${error.value}"`}
                      </p>
                    )}
                    {error.suggestion && (
                      <p className={cn('mt-1', isDark ? 'text-blue-400' : 'text-blue-600')}>
                        💡 {error.suggestion}
                      </p>
                    )}
                  </div>
                ))}
                {group.errors.length > 5 && (
                  <p className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-500')}>
                    ... y {group.errors.length - 5} más
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {groupedErrors.length > 10 && (
          <p className={cn('text-xs text-center py-2', isDark ? 'text-neutral-500' : 'text-neutral-500')}>
            Mostrando 10 de {groupedErrors.length} categorías
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ValidationProgress({
  progress,
  result,
  isValidating,
  fileName,
}: ValidationProgressProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  // Collect all errors and warnings from result
  const allErrors = useMemo(() => {
    if (!result) return []
    const errors: ValidationErrorDetail[] = [...result.batchErrors]
    result.recordResults.forEach((record) => {
      errors.push(...record.errors)
    })
    return errors.filter((e) => e.severity === 'error' || e.severity === 'critical')
  }, [result])

  const allWarnings = useMemo(() => {
    if (!result) return []
    const warnings: ValidationErrorDetail[] = []
    result.recordResults.forEach((record) => {
      warnings.push(...record.warnings)
    })
    return warnings
  }, [result])

  // If not validating and no result, show nothing
  if (!isValidating && !result) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          {result ? (
            result.overallStatus === 'passed' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : result.overallStatus === 'warning' ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          )}
          <span>
            {isValidating
              ? 'Validando archivo...'
              : result?.overallStatus === 'passed'
              ? 'Validación exitosa'
              : result?.overallStatus === 'warning'
              ? 'Validación con advertencias'
              : 'Validación con errores'}
          </span>
          {fileName && (
            <span className={cn('text-sm font-normal', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
              ({fileName})
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar (while validating) */}
        {isValidating && progress && <ProgressBar progress={progress} isDark={isDark} />}

        {/* Results (when complete) */}
        {result && (
          <>
            {/* Summary Cards */}
            <SummaryCards result={result} isDark={isDark} />

            {/* Performance Metrics */}
            <PerformanceMetrics result={result} isDark={isDark} />

            {/* Compliance Score Banner */}
            {result.summary.complianceScore >= 98 ? (
              <div
                className={cn('flex items-center gap-3 p-4 rounded-[14px]')}
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)',
                  border: isDark
                    ? '1px solid rgba(34, 197, 94, 0.3)'
                    : '1px solid rgba(34, 197, 94, 0.25)',
                }}
              >
                <CheckCircle2 className={isDark ? 'text-green-400' : 'text-green-600'} />
                <div>
                  <p className={cn('font-semibold', isDark ? 'text-green-400' : 'text-green-700')}>
                    Archivo cumple con normatividad CONSAR
                  </p>
                  <p className={cn('text-sm', isDark ? 'text-green-300' : 'text-green-600')}>
                    El archivo está listo para ser procesado según Circular 19-8
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={cn('flex items-center gap-3 p-4 rounded-[14px]')}
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                  border: isDark
                    ? '1px solid rgba(251, 191, 36, 0.3)'
                    : '1px solid rgba(251, 191, 36, 0.25)',
                }}
              >
                <Info className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                <div>
                  <p className={cn('font-semibold', isDark ? 'text-amber-400' : 'text-amber-700')}>
                    Archivo requiere correcciones
                  </p>
                  <p className={cn('text-sm', isDark ? 'text-amber-300' : 'text-amber-600')}>
                    Revise los errores y advertencias antes de enviar a CONSAR
                  </p>
                </div>
              </div>
            )}

            {/* Error List */}
            <ErrorList
              errors={allErrors}
              isDark={isDark}
              title="Errores encontrados"
              variant="error"
            />

            {/* Warning List */}
            <ErrorList
              errors={allWarnings}
              isDark={isDark}
              title="Advertencias"
              variant="warning"
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ValidationProgress
