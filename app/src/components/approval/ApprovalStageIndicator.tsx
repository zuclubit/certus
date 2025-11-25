/**
 * Approval Stage Indicator - VisionOS Enterprise 2026
 *
 * Premium visual indicator showing approval workflow stages and progress
 * Features: Glassmorphic nodes, connecting lines, SLA indicators, animations
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, User, AlertCircle } from 'lucide-react'
import { ApprovalLevel } from '@/types'
import type { ApprovalStage, ApprovalStatus } from '@/types'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ApprovalStageIndicatorProps {
  stages: ApprovalStage[]
  currentLevel: ApprovalLevel
  overallStatus: ApprovalStatus
  isDark?: boolean
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get level label
 */
function getLevelLabel(level: ApprovalLevel): string {
  const labels: Record<ApprovalLevel, string> = {
    [ApprovalLevel.AUTO]: 'Auto',
    [ApprovalLevel.ANALYST]: 'Analista',
    [ApprovalLevel.SUPERVISOR]: 'Supervisor',
    [ApprovalLevel.MANAGER]: 'Gerente',
    [ApprovalLevel.DIRECTOR]: 'Director',
  }
  return labels[level] || `Nivel ${level}`
}

/**
 * Get stage status color
 */
function getStageColor(
  stage: ApprovalStage,
  currentLevel: ApprovalLevel
): {
  color: string
  bgColor: string
  borderColor: string
  glowColor: string
} {
  // Completed stage (green)
  if (stage.status === 'approved') {
    return {
      color: 'text-green-400',
      bgColor: 'rgba(34, 197, 94, 0.15)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      glowColor: 'rgba(34, 197, 94, 0.4)',
    }
  }

  // Rejected stage (red)
  if (stage.status === 'rejected') {
    return {
      color: 'text-red-400',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      glowColor: 'rgba(239, 68, 68, 0.4)',
    }
  }

  // Current stage (blue)
  if (stage.level === currentLevel && stage.status === 'in_progress') {
    return {
      color: 'text-blue-400',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      glowColor: 'rgba(59, 130, 246, 0.4)',
    }
  }

  // Pending stage (neutral)
  return {
    color: 'text-neutral-500',
    bgColor: 'rgba(163, 163, 163, 0.1)',
    borderColor: 'rgba(163, 163, 163, 0.2)',
    glowColor: 'rgba(163, 163, 163, 0.3)',
  }
}

/**
 * Get SLA indicator color
 */
function getSLAIndicatorColor(stage: ApprovalStage): string {
  switch (stage.slaStatus) {
    case 'on_time':
      return 'rgba(34, 197, 94, 0.6)'
    case 'warning':
      return 'rgba(234, 179, 8, 0.6)'
    case 'critical':
      return 'rgba(249, 115, 22, 0.6)'
    case 'breached':
      return 'rgba(239, 68, 68, 0.6)'
    default:
      return 'rgba(163, 163, 163, 0.3)'
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export const ApprovalStageIndicator = React.forwardRef<HTMLDivElement, ApprovalStageIndicatorProps>(
  ({ stages, currentLevel, overallStatus, isDark = true, orientation = 'horizontal', className }, ref) => {
    const isHorizontal = orientation === 'horizontal'

    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          // Responsive: vertical on mobile (< 768px), horizontal on tablet and above
          isHorizontal
            ? 'flex flex-col md:flex-row md:items-center gap-4'
            : 'flex flex-col gap-4',
          className
        )}
      >
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1
          const colors = getStageColor(stage, currentLevel)
          const slaColor = getSLAIndicatorColor(stage)
          const isCurrent = stage.level === currentLevel
          const isCompleted = stage.status === 'approved'
          const isRejected = stage.status === 'rejected'

          return (
            <React.Fragment key={stage.id}>
              {/* Stage Node */}
              <div
                className={cn(
                  'relative flex flex-col items-center gap-2',
                  // Responsive: full width on mobile, flex-1 on desktop when horizontal
                  isHorizontal ? 'w-full md:flex-1' : 'w-full'
                )}
              >
                {/* Node Circle */}
                <div className="relative">
                  <div
                    className={cn(
                      'relative flex h-16 w-16 items-center justify-center rounded-full',
                      'transition-all duration-500',
                      isCurrent && 'scale-110'
                    )}
                    style={{
                      background: colors.bgColor,
                      border: `2px solid ${colors.borderColor}`,
                      backdropFilter: 'blur(8px)',
                      boxShadow: isCurrent
                        ? `0 0 24px ${colors.glowColor}, 0 8px 16px rgba(0,0,0,0.3)`
                        : `0 0 12px ${colors.glowColor}, 0 4px 8px rgba(0,0,0,0.2)`,
                    }}
                  >
                    {/* Icon */}
                    {isCompleted ? (
                      <CheckCircle2 className={cn('h-8 w-8', colors.color)} />
                    ) : isRejected ? (
                      <AlertCircle className={cn('h-8 w-8', colors.color)} />
                    ) : isCurrent ? (
                      <Clock className={cn('h-8 w-8', colors.color)} />
                    ) : (
                      <User className={cn('h-6 w-6', colors.color)} />
                    )}

                    {/* Pulsing animation for current stage */}
                    {isCurrent && stage.status === 'in_progress' && (
                      <div
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{
                          border: `2px solid ${colors.borderColor}`,
                          opacity: 0.4,
                        }}
                      />
                    )}
                  </div>

                  {/* SLA Indicator Ring */}
                  {isCurrent && stage.slaStatus && (
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(${slaColor} 60%, transparent 60%)`,
                        padding: '3px',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }}
                    />
                  )}

                  {/* Level Badge */}
                  <div
                    className={cn(
                      'absolute -top-1 -right-1',
                      'flex h-6 w-6 items-center justify-center rounded-full',
                      'ios-text-caption2 ios-font-bold'
                    )}
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(20,20,25,0.95) 0%, rgba(25,25,30,0.98) 100%)'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.98) 100%)',
                      border: `1.5px solid ${colors.borderColor}`,
                      color: colors.color,
                    }}
                  >
                    {stage.level}
                  </div>
                </div>

                {/* Stage Info */}
                <div className="text-center">
                  <p
                    className={cn(
                      'ios-text-footnote ios-font-semibold mb-0.5',
                      isCurrent ? colors.color : isDark ? 'text-neutral-400' : 'text-neutral-600'
                    )}
                  >
                    {getLevelLabel(stage.level)}
                  </p>

                  {/* Assignee */}
                  {stage.assignedTo && stage.assignedTo.length > 0 && (
                    <p
                      className={cn(
                        'ios-text-caption2 ios-font-regular',
                        isDark ? 'text-neutral-500' : 'text-neutral-600'
                      )}
                    >
                      {stage.assignedTo[0].name}
                      {stage.assignedTo.length > 1 && ` +${stage.assignedTo.length - 1}`}
                    </p>
                  )}

                  {/* Approvals Progress (for maker-checker) */}
                  {stage.requiredApprovals > 1 && (
                    <p
                      className={cn(
                        'ios-text-caption2 ios-font-medium mt-1',
                        isDark ? 'text-neutral-500' : 'text-neutral-600'
                      )}
                    >
                      {stage.currentApprovals}/{stage.requiredApprovals} aprobaciones
                    </p>
                  )}

                  {/* Duration */}
                  {stage.completedAt && stage.durationMinutes !== undefined && (
                    <p
                      className={cn(
                        'ios-text-caption2 ios-font-regular mt-1',
                        isDark ? 'text-neutral-600' : 'text-neutral-500'
                      )}
                    >
                      {Math.round(stage.durationMinutes)} min
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    'relative',
                    // Responsive: vertical on mobile, horizontal on desktop
                    isHorizontal
                      ? 'w-0.5 h-12 mx-auto md:w-auto md:h-0.5 md:flex-1'
                      : 'w-0.5 h-12 mx-auto'
                  )}
                  style={{
                    background:
                      stage.status === 'approved'
                        ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.4) 0%, rgba(163, 163, 163, 0.2) 100%)'
                        : isDark
                        ? 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
                  }}
                >
                  {/* Animated flow for current stage */}
                  {isCurrent && stage.status === 'in_progress' && (
                    <div
                      className={cn(
                        'absolute inset-0 animate-pulse',
                        isHorizontal ? 'h-full' : 'w-full'
                      )}
                      style={{
                        background: `linear-gradient(${
                          isHorizontal ? '90deg' : '180deg'
                        }, transparent 0%, ${colors.glowColor} 50%, transparent 100%)`,
                        animation: 'flow 2s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          )
        })}

        {/* Add flow animation keyframes */}
        <style>{`
          @keyframes flow {
            0% {
              opacity: 0;
              transform: ${isHorizontal ? 'translateX(-100%)' : 'translateY(-100%)'};
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: ${isHorizontal ? 'translateX(100%)' : 'translateY(100%)'};
            }
          }
        `}</style>
      </div>
    )
  }
)

ApprovalStageIndicator.displayName = 'ApprovalStageIndicator'
