/**
 * RowDetailModal Component
 *
 * Modal de detalle de registro con diseño glassmorphic y responsive:
 * - Sistema de cierre unificado
 * - Botón copiar con feedback visual
 * - Espaciado progresivo sincronizado
 * - Grid adaptativo (1→2→3 columnas)
 * - Adaptación completa a todos los dispositivos
 *
 * @module RowDetailModal
 */

import { AlertCircle, AlertTriangle, CheckCircle, Copy, Check } from 'lucide-react'
import type { AnyRecord } from '@/lib/types/consar-record'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { SectionContainer } from '@/components/ui/section-container'
import { SectionHeader } from '@/components/ui/section-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { DataField } from '@/components/ui/data-field'
import { PremiumButton } from '@/components/ui/premium-button'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { useState } from 'react'

export interface RowDetailModalProps {
  record: AnyRecord
  isOpen: boolean
  onClose: () => void
}

/**
 * Status Badges Component
 * Muestra badges de estado del registro - SIEMPRE en línea separada
 */
function StatusBadges({ record }: { record: AnyRecord }) {
  if (record.isValid && record.warnings.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mt-2">
      {!record.isValid && (
        <StatusBadge variant="error" dot dotPulse size="sm">
          Con errores
        </StatusBadge>
      )}
      {record.warnings.length > 0 && (
        <StatusBadge variant="warning" dot size="sm">
          Con advertencias
        </StatusBadge>
      )}
    </div>
  )
}

/**
 * Raw Line Display Component
 * Shows the original line with copy-to-clipboard functionality
 */
function RawLineDisplay({ rawLine }: { rawLine: string }) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawLine)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <SectionContainer
      spacing="normal"
      glass
      elevated
      scrollable
      maxHeight="200px"
      className="relative"
    >
      {/* Header con título y botón de copiar */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className={cn(
          'ios-text-sm sm:ios-text-base ios-font-semibold',
          isDark ? 'text-neutral-300' : 'text-neutral-700'
        )}>
          Línea Original ({rawLine.length} caracteres)
        </h3>

        <button
          onClick={handleCopy}
          className={cn(
            'flex-shrink-0 flex items-center gap-1.5',
            'px-2.5 py-1.5 rounded-[8px]',
            'ios-text-xs sm:ios-text-sm ios-font-medium',
            'transition-all duration-200',
            'active:scale-95',
            isDark
              ? 'bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900',
            copied && (isDark ? 'bg-green-500/20' : 'bg-green-100')
          )}
          aria-label="Copiar línea completa"
          type="button"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Código */}
      <code
        className={cn(
          'block font-mono ios-text-xs sm:ios-text-caption1 whitespace-pre-wrap break-all',
          'px-3 py-2.5 rounded-[10px]',
          'select-all',
          isDark
            ? 'bg-neutral-900/70 text-cyan-300'
            : 'bg-neutral-50/95 text-cyan-700'
        )}
      >
        {rawLine}
      </code>

      {/* Metadata */}
      <div
        className={cn(
          'ios-text-xs mt-2',
          isDark ? 'text-neutral-500' : 'text-neutral-500'
        )}
      >
        Longitud: {rawLine.length} caracteres
      </div>
    </SectionContainer>
  )
}

/**
 * Parsed Fields Grid Component
 * Adaptive grid layout (1→2→3 columns) for parsed record fields
 */
function ParsedFieldsGrid({ record }: { record: AnyRecord }) {
  const excludedFields = [
    'lineNumber',
    'rawLine',
    'fileType',
    'recordType',
    'isValid',
    'errors',
    'warnings',
    'parsedAt',
  ]

  const fields = Object.entries(record)
    .filter(([key]) => !excludedFields.includes(key))
    .map(([key, value]) => ({
      key,
      label: key
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^./, (str) => str.toUpperCase()),
      value,
      // Detectar tipo de campo
      variant: key.toLowerCase().includes('amount') || key.toLowerCase().includes('importe')
        ? 'currency'
        : key.toLowerCase().includes('date') || key.toLowerCase().includes('fecha')
        ? 'date'
        : key.toLowerCase().includes('code') ||
          key.toLowerCase().includes('nss') ||
          key.toLowerCase().includes('curp') ||
          key.toLowerCase().includes('cuenta') ||
          key.toLowerCase().includes('account')
        ? 'mono'
        : 'default',
    }))

  if (fields.length === 0) {
    return null
  }

  return (
    <SectionContainer spacing="normal" glass>
      <SectionHeader
        title="Campos Parseados"
        count={fields.length}
        size="sm"
      />

      {/* Grid optimizado con breakpoints estratégicos */}
      <div className={cn(
        'grid gap-x-3 gap-y-3 mt-3',
        // Mobile: 1 columna
        'grid-cols-1',
        // Small phones+: 1 columna
        'xs:grid-cols-1',
        // Tablets: 2 columnas
        'sm:grid-cols-2',
        // Large tablets: 2 columnas
        'md:grid-cols-2',
        // Desktop: 2 columnas
        'lg:grid-cols-2',
        // Large desktop: 3 columnas
        'xl:grid-cols-3'
      )}>
        {fields.map(({ key, label, value, variant }) => (
          <DataField
            key={key}
            label={label}
            value={typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined ? value : String(value)}
            variant={variant as 'default' | 'mono' | 'currency' | 'date'}
            copyable={variant === 'mono'}
            size="sm"
          />
        ))}
      </div>
    </SectionContainer>
  )
}

/**
 * Alert Item Component
 * Displays error or warning messages with semantic styling
 */
function AlertItem({
  message,
  code,
  field,
  reference,
  variant,
}: {
  message: string
  code: string
  field?: string
  reference?: string
  variant: 'error' | 'warning'
}) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const variantConfig = {
    error: {
      bg: isDark ? 'bg-red-950/40' : 'bg-red-50/90',
      border: isDark ? 'border-red-900/50' : 'border-red-200/70',
      icon: isDark ? 'text-red-400' : 'text-red-600',
      text: isDark ? 'text-red-200' : 'text-red-900',
      meta: isDark ? 'text-red-300/80' : 'text-red-700/80',
    },
    warning: {
      bg: isDark ? 'bg-yellow-950/40' : 'bg-yellow-50/90',
      border: isDark ? 'border-yellow-900/50' : 'border-yellow-200/70',
      icon: isDark ? 'text-yellow-400' : 'text-yellow-600',
      text: isDark ? 'text-yellow-200' : 'text-yellow-900',
      meta: isDark ? 'text-yellow-300/80' : 'text-yellow-700/80',
    },
  }

  const config = variantConfig[variant]

  return (
    <div
      className={cn(
        'flex gap-2.5 sm:gap-3',
        'p-3 sm:p-3.5',
        'rounded-[10px] sm:rounded-[12px]',
        'border transition-all duration-300',
        config.bg,
        config.border
      )}
      role="alert"
    >
      {/* Icono */}
      {variant === 'error' ? (
        <AlertCircle className={cn('h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5', config.icon)} />
      ) : (
        <AlertTriangle className={cn('h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5', config.icon)} />
      )}

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className={cn('ios-text-sm sm:ios-text-footnote ios-font-semibold', config.text)}>
          {message}
        </p>

        {/* Metadata */}
        {(code || field || reference) && (
          <div className={cn(
            'flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5',
            'ios-text-xs sm:ios-text-caption1',
            config.meta
          )}>
            {code && <span>Código: {code}</span>}
            {field && <span className="truncate">Campo: {field}</span>}
            {reference && <span className="truncate">{reference}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Errors Section Component
 */
function ErrorsSection({ errors }: { errors: AnyRecord['errors'] }) {
  if (errors.length === 0) return null

  return (
    <SectionContainer spacing="normal" glass>
      <SectionHeader
        icon={AlertCircle}
        title="Errores"
        count={errors.length}
        size="sm"
      />

      <div className="space-y-2 sm:space-y-2.5 mt-3">
        {errors.map((error, index) => (
          <AlertItem
            key={index}
            variant="error"
            message={error.message}
            code={error.code}
            field={error.field}
            reference={error.reference}
          />
        ))}
      </div>
    </SectionContainer>
  )
}

/**
 * Warnings Section Component
 */
function WarningsSection({ warnings }: { warnings: AnyRecord['warnings'] }) {
  if (warnings.length === 0) return null

  return (
    <SectionContainer spacing="normal" glass>
      <SectionHeader
        icon={AlertTriangle}
        title="Advertencias"
        count={warnings.length}
        size="sm"
      />

      <div className="space-y-2 sm:space-y-2.5 mt-3">
        {warnings.map((warning, index) => (
          <AlertItem
            key={index}
            variant="warning"
            message={warning.message}
            code={warning.code}
            field={warning.field}
            reference={warning.reference}
          />
        ))}
      </div>
    </SectionContainer>
  )
}

/**
 * Success State Component
 */
function SuccessState({ record }: { record: AnyRecord }) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  if (!record.isValid || record.warnings.length > 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 sm:gap-3',
        'p-3.5 sm:p-4',
        'rounded-[10px] sm:rounded-[12px]',
        'border transition-all duration-300',
        isDark
          ? 'bg-green-950/40 border-green-900/50'
          : 'bg-green-50/90 border-green-200/70'
      )}
      role="status"
    >
      <CheckCircle
        className={cn(
          'h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0',
          isDark ? 'text-green-400' : 'text-green-600'
        )}
      />
      <p
        className={cn(
          'ios-text-sm sm:ios-text-body ios-font-semibold',
          isDark ? 'text-green-200' : 'text-green-900'
        )}
      >
        Registro válido sin errores ni advertencias
      </p>
    </div>
  )
}

/**
 * Main Modal Component
 * Orchestrates all sub-components with glassmorphic design
 */
export function RowDetailModal({ record, isOpen, onClose }: RowDetailModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}  // NO mostrar X en esquina
        className={cn(
          // Responsive width with progressive margins
          'w-[calc(100vw-16px)]',  // Mobile: 8px margin
          'xs:w-[calc(100vw-24px)]',
          'sm:w-[calc(100vw-32px)] sm:max-w-2xl',
          'md:max-w-3xl',
          'lg:max-w-4xl',
          'xl:max-w-5xl',
          '2xl:max-w-6xl',

          // Altura adaptativa
          'max-h-[95vh] xxs:max-h-[92vh] xs:max-h-[90vh] sm:max-h-[88vh]',
          'overflow-hidden flex flex-col',

          // visionOS Ultra effects
          'glass-ultra-premium glass-caustics volumetric-light',
          'depth-layer-5 fresnel-edge iridescent-overlay',
          'crystal-overlay prism-effect atmospheric-depth',
          'specular-highlights inner-glow frosted-premium edge-luminance',
          'glass-gpu-accelerated ultra-smooth',

          // Bordes redondeados adaptativos
          'rounded-[16px]',
          'xs:rounded-[18px]',
          'sm:rounded-[20px]',
          'md:rounded-[22px]',
          'lg:rounded-[24px]',
          'xl:rounded-[26px]'
        )}
        style={{
          background: isDark
            ? `linear-gradient(
                135deg,
                rgba(20, 20, 25, 0.97) 0%,
                rgba(25, 25, 32, 0.95) 25%,
                rgba(22, 22, 30, 0.94) 50%,
                rgba(25, 25, 32, 0.95) 75%,
                rgba(20, 20, 25, 0.97) 100%
              )`
            : `linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.98) 0%,
                rgba(250, 250, 255, 0.97) 25%,
                rgba(255, 250, 255, 0.96) 50%,
                rgba(250, 255, 255, 0.97) 75%,
                rgba(255, 255, 255, 0.98) 100%
              )`,
          backdropFilter: isDark
            ? 'blur(40px) saturate(200%) brightness(1.05) contrast(1.08)'
            : 'blur(40px) saturate(200%) brightness(1.15) contrast(1.05)',
          WebkitBackdropFilter: isDark
            ? 'blur(40px) saturate(200%) brightness(1.05) contrast(1.08)'
            : 'blur(40px) saturate(200%) brightness(1.15) contrast(1.05)',
          border: isDark
            ? '1.5px solid rgba(255, 255, 255, 0.12)'
            : '1.5px solid rgba(255, 255, 255, 0.6)',
          boxShadow: isDark
            ? `0 0 0 0.5px rgba(255, 255, 255, 0.1),
               0 0 120px rgba(0, 0, 0, 0.6),
               0 0 80px rgba(0, 0, 0, 0.5),
               inset 0 0 0 1px rgba(255, 255, 255, 0.08),
               inset 0 2px 0 rgba(255, 255, 255, 0.05)`
            : `0 0 0 0.5px rgba(255, 255, 255, 0.9),
               0 0 120px rgba(0, 0, 0, 0.10),
               0 0 80px rgba(0, 0, 0, 0.08),
               inset 0 0 0 1px rgba(255, 255, 255, 0.5),
               inset 0 2px 0 rgba(255, 255, 255, 0.6)`,
        }}
      >
        {/* Header with progressive padding */}
        <DialogHeader
          className={cn(
            'pb-3 sm:pb-4',
            'px-3 xs:px-4 sm:px-5 md:px-6'
          )}
          style={{
            borderBottom: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          <DialogTitle
            className={cn(
              'flex flex-col gap-0',
              'ios-text-base xs:ios-text-lg sm:ios-text-xl md:ios-heading-title3 ios-font-bold',
              'leading-tight',
              isDark ? 'text-white' : 'text-neutral-900'
            )}
          >
            <span>Detalle del Registro - Línea {record.lineNumber}</span>
            <StatusBadges record={record} />
          </DialogTitle>

          <DialogDescription
            className={cn(
              'ios-text-xs xs:ios-text-sm sm:ios-text-base ios-font-medium',
              'mt-2',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            <span className="block sm:inline">
              Tipo de archivo: <span className="ios-font-semibold">{record.fileType}</span>
            </span>
            <span className="hidden sm:inline mx-1.5">|</span>
            <span className="block sm:inline mt-0.5 sm:mt-0">
              Tipo de registro: <span className="ios-font-semibold">{record.recordType}</span>
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content with synchronized padding */}
        <div
          className={cn(
            'flex-1 overflow-y-auto custom-scrollbar',
            'px-3 xs:px-4 sm:px-5 md:px-6',
            'py-4 sm:py-5'
          )}
        >
          <div className="space-y-4 sm:space-y-5">
            {/* Raw Line */}
            <RawLineDisplay rawLine={record.rawLine} />

            {/* Parsed Fields */}
            <ParsedFieldsGrid record={record} />

            {/* Errors */}
            <ErrorsSection errors={record.errors} />

            {/* Warnings */}
            <WarningsSection warnings={record.warnings} />

            {/* Success State */}
            <SuccessState record={record} />
          </div>
        </div>

        {/* Footer with single close action */}
        <div
          className={cn(
            'flex justify-end',
            'pt-3 sm:pt-4',
            'px-3 xs:px-4 sm:px-5 md:px-6',
            'pb-3 xs:pb-4 sm:pb-5'
          )}
          style={{
            borderTop: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          <PremiumButton
            onClick={onClose}
            variant="secondary"
            size="md"
            className="w-full xs:w-auto min-w-[120px]"
          >
            Cerrar
          </PremiumButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
