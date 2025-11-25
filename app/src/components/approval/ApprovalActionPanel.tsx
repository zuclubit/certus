/**
 * Approval Action Panel - VisionOS Enterprise 2026
 *
 * Premium action panel for approval workflow operations
 * Features:
 * - Modal confirmations for all actions
 * - Multi-device responsive design
 * - SLA display with urgency indicators
 * - Glassmorphic VisionOS design
 *
 * @version 2.0.0 - Migrated to ResponsiveModal system
 * @compliance CONSAR Multi-level Approval System
 */

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  XCircle,
  ArrowUpCircle,
  MessageSquare,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { PremiumButtonV2 } from '@/components/ui/premium-button-v2'
import {
  ApprovalActionModal,
  ValidationErrorModal,
  type ApprovalActionType,
} from './ApprovalModals'
import type { ApprovalWorkflow, ApprovalLevel } from '@/types'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ApprovalActionPanelProps {
  workflow: ApprovalWorkflow
  canApprove: boolean
  onApprove?: (comment: string) => void | Promise<void>
  onReject?: (comment: string) => void | Promise<void>
  onEscalate?: (toLevel: ApprovalLevel, reason: string) => void | Promise<void>
  onRequestInfo?: (message: string) => void | Promise<void>
  isDark?: boolean
  className?: string
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get remaining time display
 */
function getRemainingTimeDisplay(remainingMinutes: number): string {
  if (remainingMinutes <= 0) return 'Vencido'

  const hours = Math.floor(remainingMinutes / 60)
  const minutes = Math.floor(remainingMinutes % 60)

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h restantes`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m restantes`
  } else {
    return `${minutes}m restantes`
  }
}

/**
 * Get SLA urgency color
 */
function getSLAUrgencyColor(slaStatus: string): string {
  switch (slaStatus) {
    case 'on_time':
      return 'text-green-400'
    case 'warning':
      return 'text-yellow-400'
    case 'critical':
      return 'text-orange-400'
    case 'breached':
      return 'text-red-400'
    default:
      return 'text-neutral-400'
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export const ApprovalActionPanel = React.forwardRef<HTMLDivElement, ApprovalActionPanelProps>(
  (
    {
      workflow,
      canApprove,
      onApprove,
      onReject,
      onEscalate,
      onRequestInfo,
      isDark = true,
      className,
    },
    ref
  ) => {
    // Modal states
    const [activeModal, setActiveModal] = useState<ApprovalActionType | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    const currentStage = workflow.stages.find((s) => s.level === workflow.currentLevel)
    const isCompleted = workflow.status === 'approved' || workflow.status === 'rejected'

    // Action handlers
    const handleApprove = async (comment: string) => {
      setIsSubmitting(true)
      try {
        await onApprove?.(comment)
        setActiveModal(null)
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleReject = async (comment: string) => {
      setIsSubmitting(true)
      try {
        await onReject?.(comment)
        setActiveModal(null)
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleEscalate = async (comment: string) => {
      const nextLevel = (workflow.currentLevel + 1) as ApprovalLevel
      setIsSubmitting(true)
      try {
        await onEscalate?.(nextLevel, comment)
        setActiveModal(null)
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleRequestInfo = async (comment: string) => {
      setIsSubmitting(true)
      try {
        await onRequestInfo?.(comment)
        setActiveModal(null)
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleConfirm = async (comment: string) => {
      switch (activeModal) {
        case 'approve':
          await handleApprove(comment)
          break
        case 'reject':
          await handleReject(comment)
          break
        case 'escalate':
          await handleEscalate(comment)
          break
        case 'request_info':
          await handleRequestInfo(comment)
          break
      }
    }

    return (
      <>
        <div
          ref={ref}
          className={cn(
            'glass-ultra-premium depth-layer-3 rounded-[20px] overflow-hidden',
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
          {/* Header with SLA - Responsive */}
          <div
            className="px-4 py-3 sm:px-6 sm:py-4 border-b"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3
                  className={cn(
                    'text-sm sm:ios-text-body font-semibold mb-0.5 sm:mb-1',
                    isDark ? 'text-neutral-200' : 'text-neutral-800'
                  )}
                >
                  Acciones de Aprobación
                </h3>
                <p
                  className={cn(
                    'text-[10px] xs:text-xs sm:ios-text-footnote truncate',
                    isDark ? 'text-neutral-500' : 'text-neutral-600'
                  )}
                >
                  Nivel {workflow.currentLevel}: {currentStage?.assignedTo?.[0]?.role || 'Sin asignar'}
                </p>
              </div>

              {/* SLA Indicator - Responsive */}
              {currentStage && !isCompleted && currentStage.slaConfig && (
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <Clock className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', getSLAUrgencyColor(currentStage.slaStatus || 'on_time'))} />
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-[10px] xs:text-xs sm:ios-text-footnote font-semibold',
                        getSLAUrgencyColor(currentStage.slaStatus || 'on_time')
                      )}
                    >
                      {currentStage.slaStatus === 'breached'
                        ? 'Vencido'
                        : getRemainingTimeDisplay(currentStage.slaConfig?.maxDurationMinutes || 0)}
                    </p>
                    <p
                      className={cn(
                        'text-[8px] xs:text-[10px] sm:ios-text-caption2 hidden xs:block',
                        isDark ? 'text-neutral-600' : 'text-neutral-500'
                      )}
                    >
                      SLA: {(currentStage.slaConfig?.maxDurationMinutes || 0) / 60}h
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content - Responsive padding */}
          <div className="p-4 sm:p-6">
            {isCompleted ? (
              // Completed State
              <div className="text-center py-6 sm:py-8">
                <div
                  className="inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full mb-3 sm:mb-4"
                  style={{
                    background:
                      workflow.status === 'approved'
                        ? 'rgba(34, 197, 94, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                    border: `2px solid ${
                      workflow.status === 'approved'
                        ? 'rgba(34, 197, 94, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)'
                    }`,
                    boxShadow: `0 0 24px ${
                      workflow.status === 'approved'
                        ? 'rgba(34, 197, 94, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)'
                    }`,
                  }}
                >
                  {workflow.status === 'approved' ? (
                    <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                  ) : (
                    <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
                  )}
                </div>
                <p
                  className={cn(
                    'text-sm sm:ios-text-body font-semibold mb-1.5 sm:mb-2',
                    isDark ? 'text-neutral-200' : 'text-neutral-800'
                  )}
                >
                  {workflow.status === 'approved' ? 'Workflow Aprobado' : 'Workflow Rechazado'}
                </p>
                <p
                  className={cn(
                    'text-[10px] xs:text-xs sm:ios-text-footnote',
                    isDark ? 'text-neutral-500' : 'text-neutral-600'
                  )}
                >
                  {workflow.completedAt &&
                    new Date(workflow.completedAt).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                </p>
              </div>
            ) : !canApprove ? (
              // Cannot Approve State
              <div className="text-center py-6 sm:py-8">
                <AlertTriangle
                  className={cn('h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4', isDark ? 'text-yellow-500' : 'text-yellow-600')}
                />
                <p
                  className={cn(
                    'text-sm sm:ios-text-body font-semibold mb-1.5 sm:mb-2',
                    isDark ? 'text-neutral-300' : 'text-neutral-700'
                  )}
                >
                  No tienes permisos para aprobar
                </p>
                <p
                  className={cn(
                    'text-[10px] xs:text-xs sm:ios-text-footnote',
                    isDark ? 'text-neutral-500' : 'text-neutral-600'
                  )}
                >
                  Este workflow está asignado a otro usuario o nivel
                </p>
              </div>
            ) : (
              // Action Buttons - Responsive grid
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* Approve */}
                <PremiumButtonV2
                  label={<><span className="sm:hidden">Aprobar</span><span className="hidden sm:inline">Aprobar</span></>}
                  icon={CheckCircle2}
                  onClick={() => setActiveModal('approve')}
                  disabled={isSubmitting}
                  size="lg"
                  fullWidth
                />

                {/* Reject */}
                <PremiumButtonV2
                  label={<><span className="sm:hidden">Rechazar</span><span className="hidden sm:inline">Rechazar</span></>}
                  icon={XCircle}
                  onClick={() => setActiveModal('reject')}
                  disabled={isSubmitting}
                  size="lg"
                  fullWidth
                />

                {/* Request Info */}
                <PremiumButtonV2
                  label={<><span className="sm:hidden">Info</span><span className="hidden sm:inline">Solicitar Info</span></>}
                  icon={MessageSquare}
                  onClick={() => setActiveModal('request_info')}
                  disabled={isSubmitting}
                  size="md"
                  fullWidth
                />

                {/* Escalate */}
                <PremiumButtonV2
                  label={<><span className="sm:hidden">Escalar</span><span className="hidden sm:inline">Escalar</span></>}
                  icon={ArrowUpCircle}
                  onClick={() => setActiveModal('escalate')}
                  disabled={isSubmitting || workflow.currentLevel >= 4}
                  size="md"
                  fullWidth
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Confirmation Modal */}
        {activeModal && (
          <ApprovalActionModal
            open={!!activeModal}
            onOpenChange={(open) => !open && setActiveModal(null)}
            actionType={activeModal}
            workflowName={workflow.fileName}
            currentLevel={workflow.currentLevel}
            onConfirm={handleConfirm}
            isLoading={isSubmitting}
          />
        )}

        {/* Validation Error Modal */}
        <ValidationErrorModal
          open={!!validationError}
          onOpenChange={(open) => !open && setValidationError(null)}
          message={validationError || ''}
        />
      </>
    )
  }
)

ApprovalActionPanel.displayName = 'ApprovalActionPanel'
