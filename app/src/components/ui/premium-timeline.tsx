/**
 * Premium Timeline - VisionOS Enterprise 2026
 *
 * Ultra-premium vertical timeline for validation process history
 * Features: glass nodes, gradient connector, event types, smooth animations
 */

import React from 'react'
import { cn } from '@/lib/utils'
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Upload,
  RefreshCw,
  Download,
  FileText,
  User,
  Settings,
} from 'lucide-react'
import type { TimelineEvent } from '@/types'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface PremiumTimelineProps {
  data: TimelineEvent[]
  isDark?: boolean
  maxHeight?: string
  className?: string
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format timestamp to readable format
 * Input: "2024-01-15T10:30:00.000Z"
 * Output: "15/01/2024 10:30"
 */
function formatTimestamp(timestamp: string): string {
  if (!timestamp) return 'Sin dato'

  try {
    const date = new Date(timestamp)

    if (isNaN(date.getTime())) {
      return 'Fecha inválida'
    }

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch {
    return 'Fecha inválida'
  }
}

/**
 * Get relative time (e.g., "hace 2 horas")
 */
function getRelativeTime(timestamp: string): string {
  if (!timestamp) return ''

  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Ahora mismo'
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    if (diffDays < 30) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`

    return formatTimestamp(timestamp)
  } catch {
    return ''
  }
}

/**
 * Get event type configuration based on event type or message
 */
function getEventConfig(event: TimelineEvent): {
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  glowColor: string
} {
  const typeLower = event.type.toLowerCase()
  const messageLower = event.message.toLowerCase()

  // Success events (green)
  if (
    typeLower.includes('success') ||
    typeLower.includes('complete') ||
    messageLower.includes('completad') ||
    messageLower.includes('exitosa')
  ) {
    return {
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'rgba(34, 197, 94, 0.15)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      glowColor: 'rgba(34, 197, 94, 0.4)',
    }
  }

  // Error events (red)
  if (
    typeLower.includes('error') ||
    typeLower.includes('fail') ||
    messageLower.includes('error') ||
    messageLower.includes('fall')
  ) {
    return {
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      glowColor: 'rgba(239, 68, 68, 0.4)',
    }
  }

  // Warning events (yellow)
  if (
    typeLower.includes('warning') ||
    typeLower.includes('alert') ||
    messageLower.includes('advertencia')
  ) {
    return {
      icon: AlertCircle,
      color: 'text-yellow-400',
      bgColor: 'rgba(234, 179, 8, 0.15)',
      borderColor: 'rgba(234, 179, 8, 0.3)',
      glowColor: 'rgba(234, 179, 8, 0.4)',
    }
  }

  // Upload events (purple)
  if (typeLower.includes('upload') || messageLower.includes('subid') || messageLower.includes('cargad')) {
    return {
      icon: Upload,
      color: 'text-purple-400',
      bgColor: 'rgba(168, 85, 247, 0.15)',
      borderColor: 'rgba(168, 85, 247, 0.3)',
      glowColor: 'rgba(168, 85, 247, 0.4)',
    }
  }

  // Download events (cyan)
  if (typeLower.includes('download') || messageLower.includes('descargad')) {
    return {
      icon: Download,
      color: 'text-cyan-400',
      bgColor: 'rgba(6, 182, 212, 0.15)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      glowColor: 'rgba(6, 182, 212, 0.4)',
    }
  }

  // Retry/Processing events (orange)
  if (
    typeLower.includes('processing') ||
    typeLower.includes('retry') ||
    messageLower.includes('procesand') ||
    messageLower.includes('reintentar')
  ) {
    return {
      icon: RefreshCw,
      color: 'text-orange-400',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      borderColor: 'rgba(249, 115, 22, 0.3)',
      glowColor: 'rgba(249, 115, 22, 0.4)',
    }
  }

  // Document events (blue)
  if (typeLower.includes('document') || typeLower.includes('file') || messageLower.includes('documento')) {
    return {
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      glowColor: 'rgba(59, 130, 246, 0.4)',
    }
  }

  // User events (indigo)
  if (typeLower.includes('user') || messageLower.includes('usuario')) {
    return {
      icon: User,
      color: 'text-indigo-400',
      bgColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      glowColor: 'rgba(99, 102, 241, 0.4)',
    }
  }

  // Default (blue-gray)
  return {
    icon: Clock,
    color: 'text-blue-400',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export const PremiumTimeline = React.forwardRef<HTMLDivElement, PremiumTimelineProps>(
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
          className="overflow-auto p-6"
          style={{
            maxHeight,
          }}
        >
          {data.length === 0 ? (
            <div className="py-12 text-center">
              <Clock
                className={cn('h-12 w-12 mx-auto mb-4', isDark ? 'text-neutral-500' : 'text-neutral-400')}
              />
              <p
                className={cn(
                  'ios-text-body ios-font-medium',
                  isDark ? 'text-neutral-500' : 'text-neutral-400'
                )}
              >
                No hay eventos en el timeline
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {data.map((event, index) => {
                const config = getEventConfig(event)
                const Icon = config.icon
                const isLast = index === data.length - 1

                return (
                  <div key={event.id} className="flex gap-4 group">
                    {/* Timeline Node & Connector */}
                    <div className="flex flex-col items-center" style={{ width: '40px' }}>
                      {/* Node */}
                      <div
                        className={cn(
                          'relative flex h-10 w-10 items-center justify-center rounded-full',
                          'transition-all duration-300',
                          'group-hover:scale-110'
                        )}
                        style={{
                          background: config.bgColor,
                          border: `2px solid ${config.borderColor}`,
                          backdropFilter: 'blur(8px)',
                          boxShadow: `0 0 16px ${config.glowColor}, 0 4px 8px rgba(0,0,0,0.2)`,
                        }}
                      >
                        <Icon className={cn('h-5 w-5', config.color)} />

                        {/* Pulsing ring animation for recent events */}
                        {index === 0 && (
                          <div
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{
                              border: `2px solid ${config.borderColor}`,
                              opacity: 0.4,
                            }}
                          />
                        )}
                      </div>

                      {/* Connector Line */}
                      {!isLast && (
                        <div
                          className="w-0.5 flex-1 mt-2"
                          style={{
                            background: isDark
                              ? 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)'
                              : 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 100%)',
                            minHeight: '32px',
                          }}
                        />
                      )}
                    </div>

                    {/* Event Content */}
                    <div className={cn('flex-1', isLast ? 'pb-0' : 'pb-6')}>
                      {/* Event Message */}
                      <p
                        className={cn(
                          'ios-text-body ios-font-semibold mb-1',
                          isDark ? 'text-neutral-200' : 'text-neutral-800'
                        )}
                      >
                        {event.message}
                      </p>

                      {/* Event Metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {/* Timestamp */}
                        <span
                          className={cn(
                            'ios-text-footnote ios-font-regular tabular-nums',
                            isDark ? 'text-neutral-500' : 'text-neutral-600'
                          )}
                        >
                          {getRelativeTime(event.timestamp)}
                        </span>

                        {/* User */}
                        {event.user && (
                          <>
                            <span
                              className={cn(
                                'ios-text-footnote',
                                isDark ? 'text-neutral-600' : 'text-neutral-400'
                              )}
                            >
                              •
                            </span>
                            <span
                              className={cn(
                                'ios-text-footnote ios-font-medium',
                                isDark ? 'text-neutral-400' : 'text-neutral-600'
                              )}
                            >
                              {event.user}
                            </span>
                          </>
                        )}

                        {/* Event Type Badge */}
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-[6px]',
                            'ios-text-caption2 ios-font-semibold uppercase tracking-wide'
                          )}
                          style={{
                            background: config.bgColor,
                            color: config.color,
                            border: `1px solid ${config.borderColor}`,
                          }}
                        >
                          {event.type}
                        </span>
                      </div>

                      {/* Full Timestamp (hover tooltip-style) */}
                      <p
                        className={cn(
                          'mt-1 ios-text-caption2 ios-font-regular tabular-nums',
                          isDark ? 'text-neutral-600' : 'text-neutral-500'
                        )}
                      >
                        {formatTimestamp(event.timestamp)}
                      </p>

                      {/* Metadata (if exists) */}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div
                          className={cn('mt-2 p-3 rounded-[12px]', 'ios-text-footnote')}
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                            border: isDark
                              ? '1px solid rgba(255,255,255,0.05)'
                              : '1px solid rgba(0,0,0,0.05)',
                          }}
                        >
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span
                                className={cn(
                                  'ios-font-semibold',
                                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                                )}
                              >
                                {key}:
                              </span>
                              <span
                                className={cn(
                                  'ios-font-regular',
                                  isDark ? 'text-neutral-500' : 'text-neutral-700'
                                )}
                              >
                                {String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }
)

PremiumTimeline.displayName = 'PremiumTimeline'
