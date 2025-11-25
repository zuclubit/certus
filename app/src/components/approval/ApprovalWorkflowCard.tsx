/**
 * Approval Workflow Card - VisionOS Enterprise 2026
 *
 * Premium glassmorphic card displaying approval workflow summary
 * Features: SLA indicators, status badges, progress tracking
 */

import React from 'react'
import { cn } from '@/lib/utils'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  User,
  Calendar,
  FileText,
} from 'lucide-react'
import type { ApprovalWorkflow, SLAStatus, ApprovalStatus } from '@/types'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ApprovalWorkflowCardProps {
  workflow: ApprovalWorkflow
  isDark?: boolean
  onClick?: (workflow: ApprovalWorkflow) => void
  className?: string
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get status configuration
 */
function getStatusConfig(status: ApprovalStatus): {
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  label: string
} {
  switch (status) {
    case 'approved':
      return {
        icon: CheckCircle2,
        color: 'text-green-400',
        bgColor: 'rgba(34, 197, 94, 0.15)',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        label: 'Aprobado',
      }
    case 'rejected':
      return {
        icon: XCircle,
        color: 'text-red-400',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        label: 'Rechazado',
      }
    case 'in_progress':
      return {
        icon: Clock,
        color: 'text-blue-400',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        label: 'En Proceso',
      }
    case 'escalated':
      return {
        icon: AlertCircle,
        color: 'text-orange-400',
        bgColor: 'rgba(249, 115, 22, 0.15)',
        borderColor: 'rgba(249, 115, 22, 0.3)',
        label: 'Escalado',
      }
    case 'on_hold':
      return {
        icon: AlertCircle,
        color: 'text-yellow-400',
        bgColor: 'rgba(234, 179, 8, 0.15)',
        borderColor: 'rgba(234, 179, 8, 0.3)',
        label: 'En Espera',
      }
    default:
      return {
        icon: Clock,
        color: 'text-neutral-400',
        bgColor: 'rgba(163, 163, 163, 0.15)',
        borderColor: 'rgba(163, 163, 163, 0.3)',
        label: 'Pendiente',
      }
  }
}

/**
 * Get SLA status color
 */
function getSLAColor(slaStatus: SLAStatus): {
  color: string
  bgColor: string
  label: string
} {
  switch (slaStatus) {
    case 'on_time':
      return {
        color: 'text-green-400',
        bgColor: 'rgba(34, 197, 94, 0.15)',
        label: 'A Tiempo',
      }
    case 'warning':
      return {
        color: 'text-yellow-400',
        bgColor: 'rgba(234, 179, 8, 0.15)',
        label: 'Advertencia',
      }
    case 'critical':
      return {
        color: 'text-orange-400',
        bgColor: 'rgba(249, 115, 22, 0.15)',
        label: 'Crítico',
      }
    case 'breached':
      return {
        color: 'text-red-400',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        label: 'Vencido',
      }
  }
}

/**
 * Get level label
 */
function getLevelLabel(level: number): string {
  const labels = ['Auto', 'Analista', 'Supervisor', 'Gerente', 'Director']
  return labels[level] || `Nivel ${level}`
}

/**
 * Format date
 */
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ============================================
// MAIN COMPONENT
// ============================================

export const ApprovalWorkflowCard = React.forwardRef<HTMLDivElement, ApprovalWorkflowCardProps>(
  ({ workflow, isDark = true, onClick, className }, ref) => {
    const statusConfig = getStatusConfig(workflow.status)
    const slaConfig = getSLAColor(workflow.overallSLAStatus)
    const StatusIcon = statusConfig.icon

    const currentStage = workflow.stages.find((s) => s.level === workflow.currentLevel)

    return (
      <div
        ref={ref}
        className={cn(
          'group relative overflow-hidden rounded-[16px]',
          'glass-ultra-premium depth-layer-2',
          'transition-all duration-300',
          'hover:scale-[1.02] hover:depth-layer-3',
          onClick && 'cursor-pointer',
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
        onClick={() => onClick?.(workflow)}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FileText
                  className={cn('h-4 w-4 flex-shrink-0', isDark ? 'text-neutral-400' : 'text-neutral-600')}
                />
                <h3
                  className={cn(
                    'ios-text-body ios-font-semibold truncate',
                    isDark ? 'text-neutral-200' : 'text-neutral-800'
                  )}
                >
                  {workflow.fileName}
                </h3>
              </div>
              <p
                className={cn(
                  'ios-text-footnote ios-font-regular',
                  isDark ? 'text-neutral-500' : 'text-neutral-600'
                )}
              >
                {workflow.fileType} • {workflow.afore}
              </p>
            </div>

            {/* Status Badge */}
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-[8px] border',
                'ios-text-footnote ios-font-semibold'
              )}
              style={{
                background: statusConfig.bgColor,
                borderColor: statusConfig.borderColor,
                color: statusConfig.color,
              }}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </div>
          </div>

          {/* Current Level */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  background: statusConfig.color,
                  boxShadow: `0 0 8px ${statusConfig.color}`,
                }}
              />
              <span
                className={cn(
                  'ios-text-callout ios-font-medium',
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                )}
              >
                Nivel {workflow.currentLevel}: {getLevelLabel(workflow.currentLevel)}
              </span>
            </div>

            {currentStage?.assignedTo && currentStage.assignedTo.length > 0 && (
              <>
                <span className={cn('ios-text-callout', isDark ? 'text-neutral-600' : 'text-neutral-400')}>
                  •
                </span>
                <div className="flex items-center gap-1.5">
                  <User className={cn('h-3.5 w-3.5', isDark ? 'text-neutral-500' : 'text-neutral-600')} />
                  <span
                    className={cn(
                      'ios-text-callout ios-font-regular',
                      isDark ? 'text-neutral-400' : 'text-neutral-600'
                    )}
                  >
                    {currentStage.assignedTo[0].name}
                    {currentStage.assignedTo.length > 1 && ` +${currentStage.assignedTo.length - 1}`}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* SLA Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: '60%', // Calculate based on actual SLA
                    background: slaConfig.color,
                    boxShadow: `0 0 8px ${slaConfig.bgColor}`,
                  }}
                />
              </div>
            </div>
            <span
              className={cn('ios-text-caption2 ios-font-semibold', slaConfig.color)}
              style={{
                textShadow: `0 0 8px ${slaConfig.bgColor}`,
              }}
            >
              {slaConfig.label}
            </span>
          </div>
        </div>

        {/* Metadata Row */}
        <div
          className="px-6 py-3 border-t flex items-center justify-between"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          }}
        >
          <div className="flex items-center gap-4">
            {/* Submitted Date */}
            <div className="flex items-center gap-1.5">
              <Calendar className={cn('h-3.5 w-3.5', isDark ? 'text-neutral-500' : 'text-neutral-600')} />
              <span
                className={cn(
                  'ios-text-caption2 ios-font-regular',
                  isDark ? 'text-neutral-500' : 'text-neutral-600'
                )}
              >
                {formatDate(workflow.submittedAt)}
              </span>
            </div>

            {/* Submitted By */}
            <span
              className={cn(
                'ios-text-caption2 ios-font-regular',
                isDark ? 'text-neutral-500' : 'text-neutral-600'
              )}
            >
              por {workflow.submittedBy.name}
            </span>
          </div>

          {/* Arrow */}
          {onClick && (
            <ArrowRight
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                'group-hover:translate-x-1',
                isDark ? 'text-neutral-500' : 'text-neutral-600'
              )}
            />
          )}
        </div>

        {/* Priority Indicator (if high/urgent) */}
        {(workflow.priority === 'high' || workflow.priority === 'urgent') && (
          <div
            className="absolute top-2 left-2 h-3 w-3 rounded-full"
            style={{
              background: workflow.priority === 'urgent' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(249, 115, 22, 0.8)',
              boxShadow:
                workflow.priority === 'urgent'
                  ? '0 0 12px rgba(239, 68, 68, 0.6)'
                  : '0 0 12px rgba(249, 115, 22, 0.6)',
            }}
          />
        )}
      </div>
    )
  }
)

ApprovalWorkflowCard.displayName = 'ApprovalWorkflowCard'
