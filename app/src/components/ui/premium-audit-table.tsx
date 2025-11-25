/**
 * Premium Audit Table - VisionOS Enterprise 2026
 *
 * Ultra-premium dark mode audit log table for CONSAR compliance
 * Features: glass structure, action badges, timestamp formatting, IP tracking
 */

import React from 'react'
import { cn } from '@/lib/utils'
import type { AuditLogEntry } from '@/types'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface PremiumAuditTableProps {
  data: AuditLogEntry[]
  isDark?: boolean
  maxHeight?: string
  className?: string
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format timestamp without timezone string
 * Input: "2024-01-15T10:30:00.000Z" or Date object
 * Output: "15/01/2024 10:30:00"
 */
function formatTimestamp(timestamp: string): string {
  if (!timestamp) return 'Sin dato'

  try {
    const date = new Date(timestamp)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Fecha inválida'
    }

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  } catch {
    return 'Fecha inválida'
  }
}

/**
 * Get action badge color based on action type
 */
function getActionColor(action: string): {
  bg: string
  text: string
  border: string
} {
  const actionLower = action.toLowerCase()

  // Create actions (green)
  if (actionLower.includes('create') || actionLower.includes('upload') || actionLower.includes('add')) {
    return {
      bg: 'bg-green-500/15',
      text: 'text-green-400',
      border: 'border-green-500/30',
    }
  }

  // Update actions (blue)
  if (actionLower.includes('update') || actionLower.includes('edit') || actionLower.includes('modify')) {
    return {
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
    }
  }

  // Delete actions (red)
  if (actionLower.includes('delete') || actionLower.includes('remove')) {
    return {
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      border: 'border-red-500/30',
    }
  }

  // View/Read actions (purple)
  if (actionLower.includes('view') || actionLower.includes('read') || actionLower.includes('download')) {
    return {
      bg: 'bg-purple-500/15',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
    }
  }

  // Authentication actions (yellow)
  if (actionLower.includes('login') || actionLower.includes('logout') || actionLower.includes('auth')) {
    return {
      bg: 'bg-yellow-500/15',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
    }
  }

  // Default (neutral)
  return {
    bg: 'bg-neutral-500/15',
    text: 'text-neutral-400',
    border: 'border-neutral-500/30',
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export const PremiumAuditTable = React.forwardRef<HTMLDivElement, PremiumAuditTableProps>(
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
              className={cn('sticky top-0 z-10', 'backdrop-blur-md')}
              style={{
                background: isDark ? 'rgba(20,20,25,0.95)' : 'rgba(250,250,255,0.95)',
                borderBottom: isDark
                  ? '1px solid rgba(255,255,255,0.1)'
                  : '1px solid rgba(0,0,0,0.08)',
                boxShadow: isDark
                  ? '0 2px 8px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <tr>
                {/* TIMESTAMP */}
                <th
                  className={cn(
                    'px-4 py-4 text-left',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '160px' }}
                >
                  Timestamp
                </th>

                {/* USUARIO */}
                <th
                  className={cn(
                    'px-4 py-4 text-left',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '140px' }}
                >
                  Usuario
                </th>

                {/* ACCIÓN */}
                <th
                  className={cn(
                    'px-4 py-4 text-left',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '150px' }}
                >
                  Acción
                </th>

                {/* RECURSO */}
                <th
                  className={cn(
                    'px-4 py-4 text-left',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '180px' }}
                >
                  Recurso
                </th>

                {/* DETALLES */}
                <th
                  className={cn(
                    'px-4 py-4 text-left',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '250px' }}
                >
                  Detalles
                </th>

                {/* IP */}
                <th
                  className={cn(
                    'px-4 py-4 text-left',
                    'ios-text-footnote ios-font-semibold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                  style={{ minWidth: '130px' }}
                >
                  IP Address
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div
                      className={cn(
                        'ios-text-body ios-font-medium',
                        isDark ? 'text-neutral-500' : 'text-neutral-400'
                      )}
                    >
                      No hay registros de auditoría
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((entry, index) => {
                  const actionColor = getActionColor(entry.action)
                  const isEven = index % 2 === 0

                  return (
                    <tr
                      key={entry.id}
                      className={cn(
                        'transition-all duration-200',
                        'hover:scale-[1.001]',
                        isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-neutral-50/60'
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
                      {/* TIMESTAMP */}
                      <td
                        className={cn(
                          'px-4 py-3',
                          'ios-text-callout ios-font-regular tabular-nums',
                          isDark ? 'text-neutral-400' : 'text-neutral-600'
                        )}
                      >
                        {formatTimestamp(entry.timestamp)}
                      </td>

                      {/* USUARIO */}
                      <td
                        className={cn(
                          'px-4 py-3',
                          'ios-text-callout ios-font-semibold',
                          isDark ? 'text-neutral-300' : 'text-neutral-700'
                        )}
                      >
                        {entry.user}
                      </td>

                      {/* ACCIÓN */}
                      <td className="px-4 py-3">
                        <div
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5',
                            'rounded-[8px] border',
                            'ios-text-footnote ios-font-mono ios-font-semibold',
                            actionColor.bg,
                            actionColor.text,
                            actionColor.border
                          )}
                          style={{
                            backdropFilter: 'blur(8px)',
                          }}
                        >
                          {entry.action}
                        </div>
                      </td>

                      {/* RECURSO */}
                      <td
                        className={cn(
                          'px-4 py-3',
                          'ios-text-callout ios-font-medium',
                          isDark ? 'text-neutral-300' : 'text-neutral-700'
                        )}
                      >
                        {entry.resource}
                      </td>

                      {/* DETALLES */}
                      <td
                        className={cn(
                          'px-4 py-3',
                          'ios-text-callout ios-font-regular',
                          isDark ? 'text-neutral-400' : 'text-neutral-600'
                        )}
                      >
                        <div className="max-w-xs truncate" title={entry.details}>
                          {entry.details}
                        </div>
                      </td>

                      {/* IP */}
                      <td
                        className={cn(
                          'px-4 py-3',
                          'ios-text-callout ios-font-mono tabular-nums',
                          isDark ? 'text-blue-400' : 'text-blue-600'
                        )}
                      >
                        {entry.ipAddress || 'N/A'}
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

PremiumAuditTable.displayName = 'PremiumAuditTable'
