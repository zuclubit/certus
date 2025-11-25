/**
 * FileCard Premium Component
 *
 * Ultra-premium dark card inspired by VisionOS, Linear, and fintech enterprise
 * Features:
 * - Deep dark gradient background (#0A0F1A → #0C111E)
 * - Ultra-rounded corners (20-26px)
 * - Translucent borders and subtle inner glow
 * - Premium glassmorphism with sophisticated shadows
 * - Clean hierarchy and elegant spacing
 *
 * @module FileCard
 */

import * as React from 'react'
import { Check, Download, Trash2, Send, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import './file-card.premium.css'

export interface FileCardProps {
  /** File name (displayed as H2/H3) */
  fileName: string
  /** File type label (e.g., "NÓMINA", "CONTABLE") */
  fileType: string
  /** File size (e.g., "2.4 MB") */
  fileSize: string
  /** Upload/creation date (e.g., "23 Nov 2024") */
  date: string
  /** Validation status */
  status?: 'validated' | 'pending' | 'error'
  /** Main action callback */
  onView?: () => void
  /** Download action callback */
  onDownload?: () => void
  /** Delete action callback */
  onDelete?: () => void
  /** Send/share action callback */
  onSend?: () => void
  /** Disable secondary actions */
  disableActions?: boolean
  /** Truncate file name to max lines (default: no truncate, wraps naturally) */
  truncateLines?: 1 | 2 | 3
  /** Custom class name */
  className?: string
}

/**
 * Premium Metadata Chip Component
 * Height: 26-30px, rounded-lg, subtle glassmorphism
 */
const MetadataChip = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        'h-[28px] px-3',
        'rounded-[12px]',
        'bg-white/[0.08]',
        'border border-white/[0.14]',
        'text-[11px] font-semibold leading-none',
        'text-white/70',
        'transition-all duration-200'
      )}
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {children}
    </div>
  )
}

/**
 * Premium Status Badge Component
 * Green validated style with check icon
 */
const StatusBadge = ({ status }: { status: 'validated' | 'pending' | 'error' }) => {
  const config = {
    validated: {
      bg: 'rgba(34,197,94,0.22)',
      border: 'rgba(34,197,94,0.55)',
      text: 'text-green-300',
      icon: Check,
      label: 'Validado',
    },
    pending: {
      bg: 'rgba(251,191,36,0.22)',
      border: 'rgba(251,191,36,0.55)',
      text: 'text-yellow-300',
      icon: FileText,
      label: 'Pendiente',
    },
    error: {
      bg: 'rgba(239,68,68,0.22)',
      border: 'rgba(239,68,68,0.55)',
      text: 'text-red-300',
      icon: Trash2,
      label: 'Error',
    },
  }

  const { bg, border, text, icon: Icon, label } = config[status]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2',
        'h-[36px] px-4',
        'rounded-[12px]',
        text,
        'font-semibold text-[13px] leading-none',
        'transition-all duration-200'
      )}
      style={{
        background: bg,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: border,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <Icon className="h-4 w-4" strokeWidth={2.5} />
      <span>{label}</span>
    </div>
  )
}

/**
 * Premium Primary Button Component
 * Glassmorphism with blue-purple gradient and glow
 */
const PrimaryButton = ({
  label,
  icon: Icon,
  onClick,
}: {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2.5',
        'h-[46px] px-6',
        'rounded-[14px]',
        'font-semibold text-[15px] leading-none',
        'text-white',
        'transition-all duration-300',
        'hover:scale-[1.02]',
        'active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/40'
      )}
      style={{
        background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(255,255,255,0.18)',
        boxShadow: '0 8px 22px rgba(99,102,241,0.45), 0 2px 8px rgba(59,130,246,0.3)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {Icon && <Icon className="h-5 w-5" strokeWidth={2} />}
      <span>{label}</span>
    </button>
  )
}

/**
 * Premium Secondary Action Button Component
 * Subtle outline style with gray icons
 */
const SecondaryActionButton = ({
  icon: Icon,
  onClick,
  disabled = false,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
  disabled?: boolean
  label: string
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        'inline-flex items-center justify-center',
        'h-[42px] w-[42px]',
        'rounded-[12px]',
        'transition-all duration-200',
        'focus:outline-none',
        disabled
          ? [
              'bg-white/[0.04]',
              'border border-white/[0.08]',
              'text-white/[0.18]',
              'cursor-not-allowed',
            ]
          : [
              'bg-white/[0.06]',
              'border border-white/[0.14]',
              'text-white/60',
              'hover:bg-white/[0.10]',
              'hover:border-white/[0.20]',
              'hover:text-white/80',
              'active:scale-95',
              'focus:ring-2 focus:ring-white/20',
            ]
      )}
      style={
        !disabled
          ? {
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }
          : undefined
      }
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
    </button>
  )
}

/**
 * Main FileCard Premium Component
 */
export const FileCard = React.forwardRef<HTMLDivElement, FileCardProps>(
  (
    {
      fileName,
      fileType,
      fileSize,
      date,
      status = 'validated',
      onView,
      onDownload,
      onDelete,
      onSend,
      disableActions = false,
      truncateLines,
      className,
    },
    ref
  ) => {
    const theme = useAppStore(selectTheme)
    const isDark = theme === 'dark'

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          'p-6 sm:p-7 md:p-8',
          'rounded-[24px]',
          'border',
          'transition-all duration-300',
          'hover:translate-y-[-2px]',
          // Prevent any overflow
          'overflow-hidden',
          'min-w-0',
          className
        )}
        style={
          isDark
            ? {
                background: 'linear-gradient(145deg, #0A0F1A 0%, #0C111E 100%)',
                borderColor: 'rgba(255,255,255,0.06)',
                boxShadow:
                  '0 18px 36px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.03)',
              }
            : {
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
                borderColor: 'rgba(0,0,0,0.08)',
                boxShadow: '0 18px 36px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.5)',
              }
        }
      >
        {/* Header Section: File Name */}
        <div className="mb-4 min-w-0 w-full">
          <h2
            className={cn(
              'text-left',
              'font-bold text-[22px] leading-tight tracking-tight',
              'sm:text-[24px]',
              'md:text-[26px]',
              isDark ? 'text-[#EAF1FF]' : 'text-gray-900',
              'mb-3',
              // Prevent overflow - CRITICAL
              'overflow-hidden',
              'overflow-wrap-anywhere',
              'min-w-0',
              'w-full',
              // Truncate with ellipsis if truncateLines is specified
              truncateLines && 'line-clamp-' + truncateLines
            )}
            style={{
              ...(isDark
                ? { textShadow: '0 1px 3px rgba(234,241,255,0.1)' }
                : {}),
              // Force word breaking
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              hyphens: 'auto',
              // Line clamp for truncation
              ...(truncateLines
                ? {
                    display: '-webkit-box',
                    WebkitLineClamp: truncateLines,
                    WebkitBoxOrient: 'vertical' as const,
                  }
                : {}),
            }}
            title={fileName}
          >
            {fileName}
          </h2>

          {/* Metadata Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <MetadataChip>{fileType}</MetadataChip>
            <span className={cn('text-white/30 text-[11px]', 'hidden xxs:inline')}>•</span>
            <MetadataChip>{fileSize}</MetadataChip>
            <span className={cn('text-white/30 text-[11px]', 'hidden xs:inline')}>•</span>
            <MetadataChip>{date}</MetadataChip>
          </div>
        </div>

        {/* Status Section */}
        <div className="mb-5">
          <StatusBadge status={status} />
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Primary Action */}
          {onView && <PrimaryButton label="Ver Detalles" icon={FileText} onClick={onView} />}

          {/* Secondary Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {onDownload && (
              <SecondaryActionButton
                icon={Download}
                onClick={onDownload}
                disabled={disableActions}
                label="Descargar"
              />
            )}
            {onSend && (
              <SecondaryActionButton
                icon={Send}
                onClick={onSend}
                disabled={disableActions}
                label="Enviar"
              />
            )}
            {onDelete && (
              <SecondaryActionButton
                icon={Trash2}
                onClick={onDelete}
                disabled={disableActions}
                label="Eliminar"
              />
            )}
          </div>
        </div>
      </div>
    )
  }
)

FileCard.displayName = 'FileCard'
