/**
 * Validator Card - VisionOS Enterprise 2026
 *
 * Premium glassmorphic card for displaying validator rules
 * Features: Status indicators, criticality badges, metrics display
 */

import React from 'react'
import { cn } from '@/lib/utils'
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Settings,
  TrendingUp,
  Clock,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import type { ValidatorRule, ValidatorCriticality, ValidatorStatus } from '@/types'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ValidatorCardProps {
  validator: ValidatorRule
  metrics?: {
    totalExecutions: number
    failureRate: number
    avgExecutionTimeMs: number
  }
  isDark?: boolean
  onToggle?: (id: string) => void
  onClick?: (validator: ValidatorRule) => void
  className?: string
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get criticality configuration
 */
function getCriticalityConfig(criticality: ValidatorCriticality): {
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  label: string
} {
  switch (criticality) {
    case 'critical':
      return {
        icon: AlertTriangle,
        color: 'text-red-400',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        label: 'Crítico',
      }
    case 'error':
      return {
        icon: XCircle,
        color: 'text-orange-400',
        bgColor: 'rgba(249, 115, 22, 0.15)',
        borderColor: 'rgba(249, 115, 22, 0.3)',
        label: 'Error',
      }
    case 'warning':
      return {
        icon: AlertTriangle,
        color: 'text-yellow-400',
        bgColor: 'rgba(234, 179, 8, 0.15)',
        borderColor: 'rgba(234, 179, 8, 0.3)',
        label: 'Advertencia',
      }
    case 'informational':
      return {
        icon: Info,
        color: 'text-blue-400',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        label: 'Info',
      }
  }
}

/**
 * Get status configuration
 */
function getStatusConfig(status: ValidatorStatus): {
  color: string
  bgColor: string
  label: string
} {
  switch (status) {
    case 'active':
      return {
        color: 'text-green-400',
        bgColor: 'rgba(34, 197, 94, 0.15)',
        label: 'Activo',
      }
    case 'inactive':
      return {
        color: 'text-neutral-500',
        bgColor: 'rgba(163, 163, 163, 0.15)',
        label: 'Inactivo',
      }
    case 'draft':
      return {
        color: 'text-blue-400',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        label: 'Borrador',
      }
    case 'testing':
      return {
        color: 'text-purple-400',
        bgColor: 'rgba(168, 85, 247, 0.15)',
        label: 'Prueba',
      }
    case 'archived':
      return {
        color: 'text-neutral-600',
        bgColor: 'rgba(115, 115, 115, 0.15)',
        label: 'Archivado',
      }
  }
}

/**
 * Get type icon
 */
function getTypeIcon(type: string): React.ElementType {
  const typeMap: Record<string, React.ElementType> = {
    format: Shield,
    range: TrendingUp,
    reference: CheckCircle2,
    calculation: Settings,
    business_rule: Shield,
    regulatory: Shield,
    custom: Settings,
  }
  return typeMap[type] || Shield
}

// ============================================
// MAIN COMPONENT
// ============================================

export const ValidatorCard = React.forwardRef<HTMLDivElement, ValidatorCardProps>(
  ({ validator, metrics, isDark = true, onToggle, onClick, className }, ref) => {
    const criticalityConfig = getCriticalityConfig(validator.criticality)
    const statusConfig = getStatusConfig(validator.status)
    const TypeIcon = getTypeIcon(validator.type)
    const CriticalityIcon = criticalityConfig.icon

    return (
      <div
        ref={ref}
        className={cn(
          'group relative overflow-hidden rounded-[16px]',
          'glass-ultra-premium depth-layer-2',
          'transition-all duration-300',
          onClick && 'cursor-pointer hover:scale-[1.02] hover:depth-layer-3',
          className
        )}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
          backdropFilter: 'blur(24px) saturate(120%)',
          border: isDark
            ? '1.5px solid rgba(255,255,255,0.08)'
            : '1.5px solid rgba(255,255,255,0.4)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
        onClick={() => onClick?.(validator)}
      >
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-start gap-3 mb-3">
            {/* Type Icon */}
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[10px] flex-shrink-0"
              style={{
                background: criticalityConfig.bgColor,
                border: `1.5px solid ${criticalityConfig.borderColor}`,
              }}
            >
              <TypeIcon className={cn('h-5 w-5', criticalityConfig.color)} />
            </div>

            {/* Title and Code */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={cn(
                    'ios-text-callout ios-font-semibold truncate',
                    isDark ? 'text-neutral-200' : 'text-neutral-800'
                  )}
                >
                  {validator.name}
                </h3>
              </div>
              <p
                className={cn(
                  'ios-text-caption2 ios-font-mono',
                  isDark ? 'text-neutral-500' : 'text-neutral-600'
                )}
              >
                {validator.code}
              </p>
            </div>

            {/* Toggle Switch */}
            {onToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggle(validator.id)
                }}
                className={cn(
                  'flex items-center justify-center h-8 w-8 rounded-[8px]',
                  'transition-all duration-200',
                  'hover:bg-white/10'
                )}
              >
                {validator.isEnabled ? (
                  <ToggleRight className="h-6 w-6 text-green-400" />
                ) : (
                  <ToggleLeft className={cn('h-6 w-6', isDark ? 'text-neutral-600' : 'text-neutral-400')} />
                )}
              </button>
            )}
          </div>

          {/* Description */}
          <p
            className={cn(
              'ios-text-footnote ios-font-regular line-clamp-2 mb-3',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            {validator.description}
          </p>

          {/* Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Criticality Badge */}
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px]',
                'ios-text-caption2 ios-font-semibold'
              )}
              style={{
                background: criticalityConfig.bgColor,
                color: criticalityConfig.color,
                border: `1px solid ${criticalityConfig.borderColor}`,
              }}
            >
              <CriticalityIcon className="h-3 w-3" />
              {criticalityConfig.label}
            </div>

            {/* Status Badge */}
            <div
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-[6px]',
                'ios-text-caption2 ios-font-medium'
              )}
              style={{
                background: statusConfig.bgColor,
                color: statusConfig.color,
              }}
            >
              {statusConfig.label}
            </div>

            {/* Category */}
            <div
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-[6px]',
                'ios-text-caption2 ios-font-regular'
              )}
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              }}
            >
              {validator.category}
            </div>
          </div>
        </div>

        {/* Metrics Footer */}
        {metrics && (
          <div
            className="px-5 py-3 border-t flex items-center justify-between"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}
          >
            {/* Executions */}
            <div className="flex items-center gap-1.5">
              <TrendingUp className={cn('h-3.5 w-3.5', isDark ? 'text-neutral-500' : 'text-neutral-600')} />
              <span
                className={cn(
                  'ios-text-caption2 ios-font-medium',
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                )}
              >
                {metrics.totalExecutions.toLocaleString()} exec
              </span>
            </div>

            {/* Failure Rate */}
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  background:
                    metrics.failureRate > 10
                      ? 'rgba(239, 68, 68, 0.8)'
                      : metrics.failureRate > 5
                      ? 'rgba(234, 179, 8, 0.8)'
                      : 'rgba(34, 197, 94, 0.8)',
                }}
              />
              <span
                className={cn(
                  'ios-text-caption2 ios-font-medium',
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                )}
              >
                {metrics.failureRate.toFixed(1)}% fallos
              </span>
            </div>

            {/* Avg Time */}
            <div className="flex items-center gap-1.5">
              <Clock className={cn('h-3.5 w-3.5', isDark ? 'text-neutral-500' : 'text-neutral-600')} />
              <span
                className={cn(
                  'ios-text-caption2 ios-font-medium',
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                )}
              >
                {metrics.avgExecutionTimeMs.toFixed(0)}ms
              </span>
            </div>
          </div>
        )}

        {/* File Types */}
        <div
          className="px-5 py-2 border-t"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'ios-text-caption2 ios-font-regular',
                isDark ? 'text-neutral-600' : 'text-neutral-500'
              )}
            >
              Aplica a:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {validator.fileTypes.map((fileType) => (
                <span
                  key={fileType}
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-[4px]',
                    'ios-text-caption2 ios-font-mono'
                  )}
                  style={{
                    background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                    color: isDark ? 'rgba(96, 165, 250, 1)' : 'rgba(37, 99, 235, 1)',
                  }}
                >
                  {fileType}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Regulatory Reference */}
        {validator.regulatoryReference && (
          <div
            className="px-5 py-2 border-t"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex items-center gap-2">
              <Shield className={cn('h-3.5 w-3.5', isDark ? 'text-purple-500' : 'text-purple-600')} />
              <span
                className={cn(
                  'ios-text-caption2 ios-font-medium',
                  isDark ? 'text-purple-400' : 'text-purple-600'
                )}
              >
                {validator.regulatoryReference}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }
)

ValidatorCard.displayName = 'ValidatorCard'
