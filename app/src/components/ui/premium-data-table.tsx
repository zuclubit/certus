/**
 * Premium Data Table - VisionOS Enterprise 2026
 *
 * Ultra-premium dark mode data table for fintech regulatory platform
 * Features: glass structure, error semantics, proper formatting, responsive
 */

import React from 'react'
import { cn } from '@/lib/utils'

// ============================================
// TYPES & INTERFACES
// ============================================

export type RecordStatus = 'error' | 'corrected' | 'warning' | 'success'

export interface ErrorRecord {
  line: number
  tipo: string
  cuenta: string
  fechaOriginal: string | Date | null
  fechaCorreccion: string | Date | null
  importeOriginal: number | null
  importeCorregido: number | null
  estado: RecordStatus
}

export interface PremiumDataTableProps {
  data: ErrorRecord[]
  isDark?: boolean
  maxHeight?: string
  className?: string
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format date without timezone string
 * Input: "2024-01-15T10:30:00.000Z" or Date object
 * Output: "15/01/2024"
 */
function formatDate(date: string | Date | null): string {
  if (!date) return 'Sin dato'

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida'
    }

    const day = String(dateObj.getDate()).padStart(2, '0')
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const year = dateObj.getFullYear()

    return `${day}/${month}/${year}`
  } catch {
    return 'Fecha inválida'
  }
}

/**
 * Format currency amount
 * Input: 15000.50 or null or NaN
 * Output: "$15,000.50" or "Sin dato"
 */
function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return 'Sin dato'
  if (isNaN(amount)) return 'Sin dato'

  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return 'Sin dato'
  }
}

/**
 * Get status chip configuration
 */
function getStatusConfig(status: RecordStatus) {
  const configs = {
    error: {
      label: 'Error',
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      border: 'border-red-500/30',
      icon: '❌',
    },
    corrected: {
      label: 'Corregido',
      bg: 'bg-green-500/15',
      text: 'text-green-400',
      border: 'border-green-500/30',
      icon: '✓',
    },
    warning: {
      label: 'Advertencia',
      bg: 'bg-yellow-500/15',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      icon: '⚠️',
    },
    success: {
      label: 'Válido',
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: '✓',
    },
  }

  return configs[status] || configs.error
}

/**
 * Get row border color based on status
 */
function getRowBorderColor(status: RecordStatus): string {
  const colors = {
    error: 'border-l-red-500/50',
    corrected: 'border-l-green-500/50',
    warning: 'border-l-yellow-500/50',
    success: 'border-l-blue-500/50',
  }

  return colors[status] || colors.error
}

// ============================================
// MAIN COMPONENT
// ============================================

export const PremiumDataTable = React.forwardRef<HTMLDivElement, PremiumDataTableProps>(
  ({ data, isDark = true, maxHeight = '600px', className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          'glass-ultra-premium depth-layer-3 rounded-[20px]',
          'overflow-hidden',
          className
        )}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15,15,20,0.95) 0%, rgba(20,20,25,0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.98) 100%)',
          backdropFilter: 'blur(24px) saturate(120%)',
          border: isDark
            ? '1.5px solid rgba(255,255,255,0.08)'
            : '1.5px solid rgba(255,255,255,0.4)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        {/* Scrollable Container */}
        <div
          className="overflow-auto"
          style={{
            maxHeight,
          }}
        >
          <table className="w-full border-collapse">
            {/* FIXED HEADER */}
            <thead
              className={cn(
                'sticky top-0 z-10',
                'backdrop-blur-md'
              )}
              style={{
                background: isDark
                  ? 'rgba(20,20,25,0.95)'
                  : 'rgba(250,250,255,0.95)',
                borderBottom: isDark
                  ? '1px solid rgba(255,255,255,0.1)'
                  : '1px solid rgba(0,0,0,0.08)',
                boxShadow: isDark
                  ? '0 2px 8px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <tr>
                {/* LÍNEA */}
                <th
                  className={cn(
                    'px-4 py-4 text-left',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '80px' }}
                >
                  Línea
                </th>

                {/* TIPO */}
                <th
                  className={cn(
                    'px-4 py-4 text-left',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '100px' }}
                >
                  Tipo
                </th>

                {/* CUENTA */}
                <th
                  className={cn(
                    'px-4 py-4 text-left',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '140px' }}
                >
                  Cuenta
                </th>

                {/* FECHA ORIGINAL */}
                <th
                  className={cn(
                    'px-4 py-4 text-left',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '120px' }}
                >
                  Fecha Original
                </th>

                {/* FECHA CORRECCIÓN */}
                <th
                  className={cn(
                    'px-4 py-4 text-left',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '130px' }}
                >
                  Fecha Corrección
                </th>

                {/* IMPORTE ORIGINAL */}
                <th
                  className={cn(
                    'px-4 py-4 text-right',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '140px' }}
                >
                  Importe Original
                </th>

                {/* IMPORTE CORREGIDO */}
                <th
                  className={cn(
                    'px-4 py-4 text-right',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '150px' }}
                >
                  Importe Corregido
                </th>

                {/* ESTADO */}
                <th
                  className={cn(
                    'px-4 py-4 text-center',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '130px' }}
                >
                  Estado
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div
                      className={cn(
                        'ios-text-body ios-font-medium',
                        isDark ? 'text-neutral-500' : 'text-neutral-400'
                      )}
                    >
                      No hay registros con errores
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((record, index) => {
                  const statusConfig = getStatusConfig(record.estado)
                  const isEven = index % 2 === 0

                  return (
                    <tr
                      key={`${record.line}-${index}`}
                      className={cn(
                        'border-l-4 transition-all duration-200',
                        getRowBorderColor(record.estado),
                        'hover:scale-[1.002]',
                        isDark
                          ? 'hover:bg-neutral-800/40'
                          : 'hover:bg-neutral-50/60'
                      )}
                      style={{
                        background: isEven
                          ? isDark
                            ? 'rgba(25,25,30,0.3)'
                            : 'rgba(248,248,252,0.4)'
                          : 'transparent',
                        borderBottom: isDark
                          ? '1px solid rgba(255,255,255,0.04)'
                          : '1px solid rgba(0,0,0,0.04)',
                      }}
                    >
                      {/* LÍNEA */}
                      <td
                        className={cn(
                          'px-4 py-3',
                          'ios-text-callout ios-font-semibold',
                          isDark ? 'text-neutral-300' : 'text-neutral-700'
                        )}
                      >
                        {record.line}
                      </td>

                      {/* TIPO */}
                      <td
                        className={cn(
                          'px-4 py-3',
                          'ios-text-callout ios-font-medium',
                          isDark ? 'text-neutral-300' : 'text-neutral-700'
                        )}
                      >
                        <code
                          className={cn(
                            'px-2 py-1 rounded-[6px]',
                            'ios-text-footnote ios-font-mono'
                          )}
                          style={{
                            background: isDark
                              ? 'rgba(45,45,55,0.5)'
                              : 'rgba(240,240,245,0.8)',
                            color: isDark ? '#93C5FD' : '#3B82F6',
                          }}
                        >
                          {record.tipo}
                        </code>
                      </td>

                      {/* CUENTA */}
                      <td
                        className={cn(
                          'px-4 py-3',
                          'ios-text-callout ios-font-mono',
                          isDark ? 'text-neutral-300' : 'text-neutral-700'
                        )}
                      >
                        {record.cuenta}
                      </td>

                      {/* FECHA ORIGINAL */}
                      <td
                        className={cn(
                          'px-4 py-3',
                          'ios-text-callout ios-font-regular',
                          isDark ? 'text-neutral-400' : 'text-neutral-600'
                        )}
                      >
                        {formatDate(record.fechaOriginal)}
                      </td>

                      {/* FECHA CORRECCIÓN */}
                      <td
                        className={cn(
                          'px-4 py-3',
                          'ios-text-callout ios-font-regular',
                          isDark ? 'text-green-400' : 'text-green-600'
                        )}
                      >
                        {formatDate(record.fechaCorreccion)}
                      </td>

                      {/* IMPORTE ORIGINAL */}
                      <td
                        className={cn(
                          'px-4 py-3 text-right',
                          'ios-text-callout ios-font-semibold tabular-nums',
                          isDark ? 'text-neutral-300' : 'text-neutral-700'
                        )}
                      >
                        {formatCurrency(record.importeOriginal)}
                      </td>

                      {/* IMPORTE CORREGIDO */}
                      <td
                        className={cn(
                          'px-4 py-3 text-right',
                          'ios-text-callout ios-font-semibold tabular-nums',
                          isDark ? 'text-green-400' : 'text-green-600'
                        )}
                      >
                        {formatCurrency(record.importeCorregido)}
                      </td>

                      {/* ESTADO */}
                      <td className="px-4 py-3 text-center">
                        <div
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5',
                            'rounded-[8px] border',
                            'ios-text-footnote ios-font-semibold',
                            statusConfig.bg,
                            statusConfig.text,
                            statusConfig.border
                          )}
                          style={{
                            backdropFilter: 'blur(8px)',
                          }}
                        >
                          <span className="text-xs">{statusConfig.icon}</span>
                          <span>{statusConfig.label}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)

PremiumDataTable.displayName = 'PremiumDataTable'
