/**
 * Report Generator Modal - VisionOS Premium Design System
 *
 * Modal refactorizado para generación de reportes usando el nuevo sistema:
 * - ResponsiveModal (Dialog en desktop, Drawer en mobile)
 * - Validación en tiempo real
 * - Filtros avanzados CONSAR
 * - Microinteracciones premium
 * - Accesibilidad completa
 *
 * @compliance CONSAR Circular 19-8, NOM-151-SCFI-2016
 * @architecture Clean Architecture + Component Composition
 */

import { useState, useEffect } from 'react'
import {
  FileText,
  Calendar,
  Filter,
  AlertTriangle,
  Info,
  CheckCircle2,
  Download,
  ChevronDown,
  Settings,
  HelpCircle,
  X,
} from 'lucide-react'
import * as Collapsible from '@radix-ui/react-collapsible'
import * as Tooltip from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

// Local types
type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom'
type ReportFormat = 'pdf' | 'xlsx' | 'csv' | 'json'
type FileType = 'NOMINA' | 'CONTABLE' | 'REGULARIZACION'

// Nuevo sistema de modales
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalBody,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'

// ============================================================================
// INTERFACES
// ============================================================================

export interface ReportGeneratorFormData {
  name: string
  type: ReportType
  format: ReportFormat
  dateFrom: string
  dateTo: string
  includeSuccess: boolean
  includeErrors: boolean
  includeWarnings: boolean
  fileTypes: FileType[]
  includeAuditTrail: boolean
  includeStatistics: boolean
  digitalSignature: boolean
}

interface ReportGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReportGeneratorFormData) => void
  isGenerating?: boolean
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

interface SectionCardProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}

function SectionCard({ title, icon, children, className }: SectionCardProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        'rounded-xl p-5 border backdrop-blur-xl',
        isDark
          ? 'bg-neutral-800/30 border-neutral-700/50'
          : 'bg-white/50 border-neutral-200/50',
        className
      )}
      style={{
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.2)'
          : '0 8px 32px rgba(0, 0, 0, 0.06)',
      }}
    >
      <h3
        className={cn(
          'text-base font-bold mb-4 flex items-center gap-2.5',
          isDark ? 'text-neutral-100' : 'text-neutral-800'
        )}
      >
        <div
          className={cn('p-2 rounded-lg', isDark ? 'bg-primary-500/10' : 'bg-primary-50')}
        >
          {icon}
        </div>
        {title}
      </h3>
      {children}
    </div>
  )
}

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  hint?: string
  tooltip?: string
  children: React.ReactNode
}

function FormField({
  label,
  required,
  error,
  hint,
  tooltip,
  children,
}: FormFieldProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div className="space-y-2">
      <label
        className={cn(
          'block text-sm font-medium flex items-center gap-1.5',
          isDark ? 'text-neutral-200' : 'text-neutral-700'
        )}
      >
        {label}
        {required && (
          <span className="text-red-400" aria-label="requerido">
            *
          </span>
        )}
        {tooltip && (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                className={cn(
                  'rounded-full p-0.5 transition-colors',
                  isDark ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'
                )}
              >
                <HelpCircle className="h-3.5 w-3.5 text-neutral-500" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className={cn(
                  'max-w-xs px-3 py-2 text-xs rounded-lg shadow-lg z-[600]',
                  isDark
                    ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                    : 'bg-white text-neutral-900 border border-neutral-200'
                )}
                sideOffset={5}
              >
                {tooltip}
                <Tooltip.Arrow className={isDark ? 'fill-neutral-800' : 'fill-white'} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5" role="alert">
          <AlertTriangle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-neutral-500 mt-1.5">{hint}</p>}
    </div>
  )
}

// ============================================================================
// SHARED INPUT STYLES
// ============================================================================

function getInputClassName(hasError: boolean, isDark: boolean) {
  return cn(
    'w-full px-3 py-2.5 rounded-xl text-sm',
    'border-[1.5px] transition-all duration-200',
    'focus:outline-none focus:ring-2',
    'min-h-[48px]',
    hasError
      ? 'border-red-500 focus:ring-red-500/30'
      : isDark
      ? 'border-neutral-700 focus:border-primary-500 focus:ring-primary-500/30'
      : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/30',
    isDark
      ? 'bg-neutral-800/80 text-neutral-100 placeholder-neutral-500'
      : 'bg-white text-neutral-900 placeholder-neutral-400'
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ReportGeneratorModal({
  isOpen,
  onClose,
  onSubmit,
  isGenerating = false,
}: ReportGeneratorModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [formData, setFormData] = useState<ReportGeneratorFormData>({
    name: '',
    type: 'monthly',
    format: 'pdf',
    dateFrom: '',
    dateTo: '',
    includeSuccess: true,
    includeErrors: true,
    includeWarnings: true,
    fileTypes: ['NOMINA', 'CONTABLE', 'REGULARIZACION'],
    includeAuditTrail: true,
    includeStatistics: true,
    digitalSignature: false,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ReportGeneratorFormData, string>>>(
    {}
  )
  const [estimatedSize, setEstimatedSize] = useState('~2.5 MB')
  const [estimatedTime, setEstimatedTime] = useState('~45 segundos')
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  // Auto-generate report name
  useEffect(() => {
    if (!formData.name && formData.type && formData.dateFrom && formData.dateTo) {
      const typeLabels = {
        daily: 'Diario',
        weekly: 'Semanal',
        monthly: 'Mensual',
        custom: 'Personalizado',
      }
      const startDate = new Date(formData.dateFrom)
      const month = startDate.toLocaleString('es', { month: 'short' })
      const year = startDate.getFullYear()

      setFormData((prev) => ({
        ...prev,
        name: `Reporte ${typeLabels[formData.type]} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`,
      }))
    }
  }, [formData.type, formData.dateFrom, formData.dateTo, formData.name])

  // Calculate estimated size and time
  useEffect(() => {
    const statusCount =
      (formData.includeSuccess ? 1 : 0) +
      (formData.includeErrors ? 1 : 0) +
      (formData.includeWarnings ? 1 : 0)
    const fileTypeCount = formData.fileTypes.length
    const baseSizeMB = 0.5
    const sizePerStatus = 0.5
    const sizePerFileType = 0.3
    const sizeAuditTrail = formData.includeAuditTrail ? 0.8 : 0
    const sizeSignature = formData.digitalSignature ? 0.2 : 0

    const totalSize =
      baseSizeMB +
      sizePerStatus * statusCount +
      sizePerFileType * fileTypeCount +
      sizeAuditTrail +
      sizeSignature

    setEstimatedSize(`~${totalSize.toFixed(1)} MB`)
    setEstimatedTime(`~${Math.ceil(totalSize * 15)} segundos`)
  }, [
    formData.includeSuccess,
    formData.includeErrors,
    formData.includeWarnings,
    formData.fileTypes,
    formData.includeAuditTrail,
    formData.digitalSignature,
  ])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ReportGeneratorFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del reporte es requerido'
    } else if (formData.name.length < 10) {
      newErrors.name = 'El nombre debe tener al menos 10 caracteres'
    }

    if (!formData.dateFrom) {
      newErrors.dateFrom = 'La fecha de inicio es requerida'
    }

    if (!formData.dateTo) {
      newErrors.dateTo = 'La fecha de fin es requerida'
    }

    if (formData.dateFrom && formData.dateTo) {
      const start = new Date(formData.dateFrom)
      const end = new Date(formData.dateTo)
      if (start > end) {
        newErrors.dateTo = 'La fecha de fin debe ser posterior a la fecha de inicio'
      }

      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 365) {
        newErrors.dateTo = 'El rango máximo permitido es de 1 año'
      }
    }

    if (!formData.includeSuccess && !formData.includeErrors && !formData.includeWarnings) {
      newErrors.includeSuccess = 'Debe seleccionar al menos un estado de validación'
    }

    if (formData.fileTypes.length === 0) {
      newErrors.fileTypes = 'Debe seleccionar al menos un tipo de archivo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const statusFilters = [
    {
      key: 'includeSuccess' as const,
      label: 'Exitosas',
      icon: CheckCircle2,
      colorClass: 'text-green-500',
    },
    {
      key: 'includeErrors' as const,
      label: 'Con Errores',
      icon: X,
      colorClass: 'text-red-500',
    },
    {
      key: 'includeWarnings' as const,
      label: 'Advertencias',
      icon: AlertTriangle,
      colorClass: 'text-yellow-500',
    },
  ]

  const fileTypeOptions = [
    { value: 'NOMINA' as FileType, label: 'NOMINA' },
    { value: 'CONTABLE' as FileType, label: 'CONTABLE' },
    { value: 'REGULARIZACION' as FileType, label: 'REGULARIZACION' },
  ]

  const advancedOptions = [
    {
      key: 'includeAuditTrail' as const,
      label: 'Incluir Trazabilidad Completa',
      description: 'Historial de cambios y auditoría (CONSAR Circular 19-8)',
    },
    {
      key: 'includeStatistics' as const,
      label: 'Incluir Estadísticas Detalladas',
      description: 'Gráficos y análisis de tendencias',
    },
    {
      key: 'digitalSignature' as const,
      label: 'Firma Digital (FIEL)',
      description: 'Autenticación con certificado SAT para validez legal',
    },
  ]

  return (
    <Tooltip.Provider delayDuration={300}>
      <ResponsiveModal open={isOpen} onOpenChange={handleOpenChange}>
        <ResponsiveModalContent size="xl">
          <ResponsiveModalHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                }}
              >
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <ResponsiveModalTitle>Generar Reporte</ResponsiveModalTitle>
                <ResponsiveModalDescription>
                  Configuración avanzada de reportes regulatorios
                </ResponsiveModalDescription>
              </div>
            </div>
          </ResponsiveModalHeader>

          <ResponsiveModalBody>
            <div className="space-y-5">
              {/* Basic Information */}
              <SectionCard
                title="Información General"
                icon={<Info className="h-4 w-4 text-primary-500" />}
              >
                <div className="grid grid-cols-1 gap-4">
                  {/* Report Name */}
                  <FormField
                    label="Nombre del Reporte"
                    required
                    error={errors.name}
                    tooltip="Identificador único para el reporte. Se genera automáticamente basado en el tipo y fechas."
                  >
                    <div className="relative">
                      <FileText
                        className={cn(
                          'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none',
                          isDark ? 'text-neutral-500' : 'text-neutral-400'
                        )}
                      />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value })
                          if (errors.name) setErrors({ ...errors, name: undefined })
                        }}
                        placeholder="Ej: Reporte Q1 2025"
                        disabled={isGenerating}
                        maxLength={100}
                        className={cn(getInputClassName(!!errors.name, isDark), 'pl-10')}
                      />
                    </div>
                    {!errors.name && formData.name && (
                      <p className="text-xs text-neutral-500 mt-1.5">
                        {formData.name.length}/100 caracteres
                      </p>
                    )}
                  </FormField>

                  {/* Type and Format */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Tipo de Reporte" required>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value as ReportType })
                        }
                        disabled={isGenerating}
                        className={getInputClassName(false, isDark)}
                      >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                        <option value="custom">Personalizado</option>
                      </select>
                    </FormField>

                    <FormField label="Formato" required>
                      <select
                        value={formData.format}
                        onChange={(e) =>
                          setFormData({ ...formData, format: e.target.value as ReportFormat })
                        }
                        disabled={isGenerating}
                        className={getInputClassName(false, isDark)}
                      >
                        <option value="pdf">PDF (Recomendado)</option>
                        <option value="xlsx">Excel</option>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                      </select>
                    </FormField>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Fecha Inicio" required error={errors.dateFrom}>
                      <div className="relative">
                        <Calendar
                          className={cn(
                            'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none',
                            isDark ? 'text-neutral-500' : 'text-neutral-400'
                          )}
                        />
                        <input
                          type="date"
                          value={formData.dateFrom}
                          onChange={(e) => {
                            setFormData({ ...formData, dateFrom: e.target.value })
                            if (errors.dateFrom) setErrors({ ...errors, dateFrom: undefined })
                          }}
                          max={today}
                          disabled={isGenerating}
                          className={cn(getInputClassName(!!errors.dateFrom, isDark), 'pl-10')}
                        />
                      </div>
                    </FormField>

                    <FormField
                      label="Fecha Fin"
                      required
                      error={errors.dateTo}
                      hint={
                        !formData.dateFrom
                          ? 'Selecciona fecha de inicio primero'
                          : 'Fin del período (máximo 1 año)'
                      }
                    >
                      <div className="relative">
                        <Calendar
                          className={cn(
                            'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none',
                            isDark ? 'text-neutral-500' : 'text-neutral-400'
                          )}
                        />
                        <input
                          type="date"
                          value={formData.dateTo}
                          onChange={(e) => {
                            setFormData({ ...formData, dateTo: e.target.value })
                            if (errors.dateTo) setErrors({ ...errors, dateTo: undefined })
                          }}
                          min={formData.dateFrom || undefined}
                          max={today}
                          disabled={isGenerating || !formData.dateFrom}
                          className={cn(
                            getInputClassName(!!errors.dateTo, isDark),
                            'pl-10',
                            !formData.dateFrom && 'opacity-50 cursor-not-allowed'
                          )}
                        />
                      </div>
                    </FormField>
                  </div>
                </div>
              </SectionCard>

              {/* Filters */}
              <SectionCard
                title="Filtros de Validación"
                icon={<Filter className="h-4 w-4 text-primary-500" />}
              >
                <div className="space-y-4">
                  {/* Status Filters */}
                  <FormField label="Estados de Validación" error={errors.includeSuccess}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {statusFilters.map((option) => (
                        <label
                          key={option.key}
                          className={cn(
                            'flex items-center rounded-xl cursor-pointer transition-all',
                            'gap-2.5 p-3 min-h-[48px]',
                            'border-2',
                            formData[option.key]
                              ? 'bg-primary-500/10 border-primary-500'
                              : isDark
                              ? 'bg-neutral-800/50 border-transparent hover:border-neutral-700'
                              : 'bg-neutral-50 border-transparent hover:border-neutral-300',
                            isGenerating && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={formData[option.key]}
                            onChange={(e) => {
                              setFormData({ ...formData, [option.key]: e.target.checked })
                              if (errors.includeSuccess)
                                setErrors({ ...errors, includeSuccess: undefined })
                            }}
                            disabled={isGenerating}
                            className="h-5 w-5 shrink-0 rounded border-neutral-400 text-primary-600 focus:ring-2 focus:ring-primary-500"
                          />
                          <option.icon className={cn('h-5 w-5 shrink-0', option.colorClass)} />
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isDark ? 'text-neutral-200' : 'text-neutral-700'
                            )}
                          >
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </FormField>

                  {/* File Type Filters */}
                  <FormField label="Tipos de Archivo CONSAR" error={errors.fileTypes as string}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {fileTypeOptions.map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            'flex items-center rounded-xl cursor-pointer transition-all',
                            'gap-2.5 p-3 min-h-[48px]',
                            'border-2',
                            formData.fileTypes.includes(option.value)
                              ? 'bg-primary-500/10 border-primary-500'
                              : isDark
                              ? 'bg-neutral-800/50 border-transparent hover:border-neutral-700'
                              : 'bg-neutral-50 border-transparent hover:border-neutral-300',
                            isGenerating && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={formData.fileTypes.includes(option.value)}
                            onChange={(e) => {
                              const newFileTypes = e.target.checked
                                ? [...formData.fileTypes, option.value]
                                : formData.fileTypes.filter((t) => t !== option.value)
                              setFormData({ ...formData, fileTypes: newFileTypes })
                              if (errors.fileTypes)
                                setErrors({ ...errors, fileTypes: undefined })
                            }}
                            disabled={isGenerating}
                            className="h-5 w-5 shrink-0 rounded border-neutral-400 text-primary-600 focus:ring-2 focus:ring-primary-500"
                          />
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isDark ? 'text-neutral-200' : 'text-neutral-700'
                            )}
                          >
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </FormField>
                </div>
              </SectionCard>

              {/* Advanced Options - Collapsible */}
              <Collapsible.Root
                open={isAdvancedOpen}
                onOpenChange={setIsAdvancedOpen}
                className={cn(
                  'rounded-xl border overflow-hidden transition-all backdrop-blur-xl',
                  isDark
                    ? 'bg-neutral-800/30 border-neutral-700/50'
                    : 'bg-white/50 border-neutral-200/50'
                )}
              >
                <Collapsible.Trigger
                  className={cn(
                    'w-full p-5 flex items-center justify-between',
                    'text-left transition-colors',
                    isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-100/50'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        isDark ? 'bg-primary-500/10' : 'bg-primary-50'
                      )}
                    >
                      <Settings className="h-4 w-4 text-primary-500" />
                    </div>
                    <div>
                      <h3
                        className={cn(
                          'text-base font-bold',
                          isDark ? 'text-neutral-100' : 'text-neutral-800'
                        )}
                      >
                        Opciones Avanzadas
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Configuración adicional para el reporte
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-neutral-500 transition-transform duration-200',
                      isAdvancedOpen && 'rotate-180'
                    )}
                  />
                </Collapsible.Trigger>

                <Collapsible.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                  <div className="px-5 pb-5 space-y-3">
                    {advancedOptions.map((option) => (
                      <label
                        key={option.key}
                        className={cn(
                          'flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors',
                          isDark
                            ? 'bg-neutral-800 hover:bg-neutral-750'
                            : 'bg-neutral-50 hover:bg-neutral-100',
                          isGenerating && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={formData[option.key]}
                          onChange={(e) =>
                            setFormData({ ...formData, [option.key]: e.target.checked })
                          }
                          disabled={isGenerating}
                          className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <span
                            className={cn(
                              'text-sm font-medium block',
                              isDark ? 'text-neutral-300' : 'text-neutral-700'
                            )}
                          >
                            {option.label}
                          </span>
                          <span className="text-xs block mt-1 text-neutral-500">
                            {option.description}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </Collapsible.Content>
              </Collapsible.Root>

              {/* Estimated Info */}
              <div
                className={cn(
                  'rounded-xl p-5 border backdrop-blur-xl',
                  isDark
                    ? 'bg-gradient-to-br from-blue-950/40 to-primary-950/30 border-blue-800/50'
                    : 'bg-gradient-to-br from-blue-50 to-primary-50 border-blue-200'
                )}
              >
                <div className="flex gap-3">
                  <Info
                    className={cn(
                      'h-5 w-5 flex-shrink-0 mt-0.5',
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    )}
                  />
                  <div>
                    <h4
                      className={cn(
                        'text-sm font-semibold mb-1',
                        isDark ? 'text-blue-300' : 'text-blue-900'
                      )}
                    >
                      Información Estimada
                    </h4>
                    <div
                      className={cn(
                        'text-xs space-y-1',
                        isDark ? 'text-blue-300/80' : 'text-blue-800'
                      )}
                    >
                      <p>Tamaño aproximado: {estimatedSize}</p>
                      <p>Tiempo de generación: {estimatedTime}</p>
                      <p className="mt-2 pt-2 border-t border-blue-400/30">
                        Este reporte cumple con NOM-151-SCFI-2016 y es válido para
                        presentación ante CONSAR
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ResponsiveModalBody>

          <ResponsiveModalFooter>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isGenerating}
              className="sm:w-auto w-full"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isGenerating}
              isLoading={isGenerating}
              className="sm:w-auto w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Generar Reporte
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </Tooltip.Provider>
  )
}
