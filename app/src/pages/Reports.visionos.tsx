/**
 * Reports Page - Enterprise 2025 VisionOS
 *
 * Módulo de exportación y reportes CONSAR 2025
 * Conectado a endpoints reales del backend:
 * - GET /v1/exports/reports/period - Reporte por período
 * - GET /v1/exports/reports/compliance - Reporte de cumplimiento
 * - GET /v1/exports/validations/{id}/pdf|excel|csv|json - Exportar validación
 *
 * @compliance CONSAR Circular 19-8, NOM-151-SCFI-2016
 * @version 2.1.0
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Calendar,
  FileDown,
  TrendingUp,
  BarChart3,
  Activity,
  Shield,
  Loader2,
  FileSpreadsheet,
  FileJson,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { PremiumButtonV2 } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { LottieIcon } from '@/components/ui/LottieIcon'
import { getAnimation } from '@/lib/lottiePreloader'
import { useToast } from '@/hooks/use-toast'
import { useValidations } from '@/hooks/useValidations'
import { ExportService } from '@/lib/services/api/export.service'
import type { Validation } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json'

interface ExportOption {
  format: ExportFormat
  label: string
  icon: React.ElementType
  description: string
  color: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const EXPORT_OPTIONS: ExportOption[] = [
  {
    format: 'pdf',
    label: 'PDF',
    icon: FileText,
    description: 'Reporte formal con gráficos y resumen ejecutivo',
    color: '#EF4444',
  },
  {
    format: 'excel',
    label: 'Excel',
    icon: FileSpreadsheet,
    description: 'Datos detallados para análisis en hojas de cálculo',
    color: '#22C55E',
  },
  {
    format: 'csv',
    label: 'CSV',
    icon: FileDown,
    description: 'Datos planos para importación a otros sistemas',
    color: '#3B82F6',
  },
  {
    format: 'json',
    label: 'JSON',
    icon: FileJson,
    description: 'Formato estructurado para integraciones API',
    color: '#F59E0B',
  },
]

// ============================================================================
// COMPONENTS
// ============================================================================

interface ExportCardProps {
  option: ExportOption
  onExport: (format: ExportFormat) => void
  isLoading: boolean
  disabled?: boolean
}

function ExportCard({ option, onExport, isLoading, disabled }: ExportCardProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const Icon = option.icon

  return (
    <button
      onClick={() => onExport(option.format)}
      disabled={isLoading || disabled}
      className={cn(
        'p-5 rounded-[16px] border transition-all duration-300 text-left w-full',
        'hover:scale-[1.02] hover:shadow-lg',
        isLoading && 'opacity-50 cursor-wait',
        disabled && 'opacity-50 cursor-not-allowed',
        isDark
          ? 'bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800'
          : 'bg-white border-neutral-200 hover:bg-neutral-50'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className="p-3 rounded-[12px] flex-shrink-0"
          style={{
            background: `${option.color}20`,
            boxShadow: `0 0 20px ${option.color}30`,
          }}
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: option.color }} />
          ) : (
            <Icon className="h-6 w-6" style={{ color: option.color }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'text-base font-bold mb-1',
              isDark ? 'text-neutral-100' : 'text-neutral-900'
            )}
          >
            {option.label}
          </h3>
          <p
            className={cn(
              'text-sm',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            {option.description}
          </p>
        </div>
        <Download
          className={cn(
            'h-5 w-5 flex-shrink-0',
            isDark ? 'text-neutral-500' : 'text-neutral-400'
          )}
        />
      </div>
    </button>
  )
}

interface ValidationExportRowProps {
  validation: Validation
  onExport: (validationId: string, format: ExportFormat) => void
  exportingId: string | null
}

function ValidationExportRow({ validation, onExport, exportingId }: ValidationExportRowProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  // Guard against undefined/null validation
  if (!validation || !validation.id) return null

  const isExporting = exportingId === validation.id

  const getStatusConfig = (status: string | undefined) => {
    const configs: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
      Completed: { icon: CheckCircle2, color: 'text-green-500', label: 'Completado' },
      Approved: { icon: CheckCircle2, color: 'text-green-500', label: 'Aprobado' },
      Failed: { icon: AlertCircle, color: 'text-red-500', label: 'Fallido' },
      Rejected: { icon: AlertCircle, color: 'text-red-500', label: 'Rechazado' },
      Pending: { icon: Clock, color: 'text-yellow-500', label: 'Pendiente' },
      Processing: { icon: Loader2, color: 'text-blue-500', label: 'Procesando' },
    }
    return (status && configs[status]) || configs.Pending
  }

  const statusConfig = getStatusConfig(validation.status)
  const StatusIcon = statusConfig.icon
  const canExport = validation.status === 'Completed' || validation.status === 'Approved'

  // Safe accessors for potentially undefined fields
  const totalRecords = validation.totalRecords ?? 0
  const fileName = validation.fileName ?? 'Sin nombre'
  const fileType = validation.fileType ?? 'Desconocido'
  const uploadedAt = validation.uploadedAt
    ? new Date(validation.uploadedAt).toLocaleDateString('es-MX')
    : 'Fecha desconocida'

  return (
    <div
      className={cn(
        'p-4 rounded-[12px] border transition-all duration-200',
        isDark
          ? 'bg-neutral-800/30 border-neutral-700/50'
          : 'bg-white border-neutral-200'
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <StatusIcon className={cn('h-5 w-5 flex-shrink-0', statusConfig.color)} />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'text-sm font-medium truncate',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}
            >
              {fileName}
            </p>
            <p
              className={cn(
                'text-xs',
                isDark ? 'text-neutral-500' : 'text-neutral-500'
              )}
            >
              {fileType} • {totalRecords.toLocaleString()} registros • {uploadedAt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canExport ? (
            <>
              {EXPORT_OPTIONS.slice(0, 3).map((opt) => (
                <button
                  key={opt.format}
                  onClick={() => onExport(validation.id, opt.format)}
                  disabled={isExporting}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    'hover:scale-110',
                    isDark
                      ? 'hover:bg-neutral-700 text-neutral-400'
                      : 'hover:bg-neutral-100 text-neutral-600'
                  )}
                  title={`Exportar a ${opt.label}`}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <opt.icon className="h-4 w-4" />
                  )}
                </button>
              ))}
            </>
          ) : (
            <span
              className={cn(
                'text-xs px-2 py-1 rounded',
                isDark ? 'bg-neutral-700 text-neutral-400' : 'bg-neutral-100 text-neutral-500'
              )}
            >
              {statusConfig.label}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ReportsVisionOS() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const { toast } = useToast()
  const reportsAnimationData = getAnimation('reports')

  // State
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)
  const [exportingValidationId, setExportingValidationId] = useState<string | null>(null)
  const [periodForm, setPeriodForm] = useState({
    startDate: '',
    endDate: '',
    fileType: '',
    format: 'pdf' as ExportFormat,
  })

  // Fetch recent validations for export
  const {
    data: validationsResponse,
    isLoading: validationsLoading,
    refetch: refetchValidations,
  } = useValidations({ pageSize: 20 })

  const validations = validationsResponse?.data || []

  // Calculate statistics from validations with defensive checks
  const statistics = useMemo(() => {
    // Filter out invalid entries
    const validEntries = validations.filter((v) => v && v.id)

    const completed = validEntries.filter(
      (v) => v.status === 'Completed' || v.status === 'Approved'
    ).length
    const withErrors = validEntries.filter((v) => (v.errorCount ?? 0) > 0).length
    const totalRecords = validEntries.reduce((sum, v) => sum + (v.totalRecords ?? 0), 0)

    return {
      totalValidations: validEntries.length,
      completed,
      withErrors,
      totalRecords,
      complianceRate: validEntries.length > 0 ? (completed / validEntries.length) * 100 : 0,
    }
  }, [validations])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleExportValidation = async (validationId: string, format: ExportFormat) => {
    setExportingValidationId(validationId)
    try {
      await ExportService.exportAndDownload(validationId, format)
      toast({
        title: 'Exportación completada',
        description: `El archivo ${format.toUpperCase()} se ha descargado correctamente.`,
      })
    } catch (error) {
      toast({
        title: 'Error de exportación',
        description:
          error instanceof Error ? error.message : 'No se pudo exportar el archivo.',
        variant: 'destructive',
      })
    } finally {
      setExportingValidationId(null)
    }
  }

  const handlePeriodReportExport = async () => {
    if (!periodForm.startDate || !periodForm.endDate) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor selecciona las fechas de inicio y fin.',
        variant: 'destructive',
      })
      return
    }

    setExportingFormat(periodForm.format)
    try {
      const result = await ExportService.generatePeriodReport({
        startDate: periodForm.startDate,
        endDate: periodForm.endDate,
        format: periodForm.format === 'excel' ? 'excel' : periodForm.format as 'pdf' | 'csv',
        fileTypes: periodForm.fileType ? [periodForm.fileType] : undefined,
      })
      ExportService.downloadFile(result.data)
      toast({
        title: 'Reporte generado',
        description: 'El reporte de período se ha descargado correctamente.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'No se pudo generar el reporte.',
        variant: 'destructive',
      })
    } finally {
      setExportingFormat(null)
    }
  }

  const handleComplianceReportExport = async (format: ExportFormat) => {
    if (!periodForm.startDate || !periodForm.endDate) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor selecciona las fechas de inicio y fin.',
        variant: 'destructive',
      })
      return
    }

    setExportingFormat(format)
    try {
      const result = await ExportService.generateComplianceReport({
        startDate: periodForm.startDate,
        endDate: periodForm.endDate,
        format: format === 'excel' ? 'excel' : 'pdf',
      })
      ExportService.downloadFile(result.data)
      toast({
        title: 'Reporte de cumplimiento generado',
        description: 'El reporte se ha descargado correctamente.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'No se pudo generar el reporte.',
        variant: 'destructive',
      })
    } finally {
      setExportingFormat(null)
    }
  }

  // Get today's date for max attribute
  const today = new Date().toISOString().split('T')[0]

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {reportsAnimationData && (
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-[20px]',
                'glass-ultra-premium depth-layer-4 fresnel-edge',
                'glass-gpu-accelerated spring-bounce'
              )}
              style={{
                background: `
                  linear-gradient(
                    135deg,
                    #F59E0B 0%,
                    #EF4444 35%,
                    #EC4899 65%,
                    #8B5CF6 100%
                  )
                `,
                backgroundSize: '300% 300%',
                animation: 'mesh-flow 8s ease-in-out infinite',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                boxShadow: `
                  0 0 40px rgba(245, 158, 11, 0.4),
                  0 8px 32px rgba(239, 68, 68, 0.3),
                  0 4px 16px rgba(139, 92, 246, 0.25),
                  inset 0 0 40px rgba(255, 255, 255, 0.2),
                  inset 0 2px 0 rgba(255, 255, 255, 0.5)
                `,
              }}
            >
              <div className="w-8 h-8">
                <LottieIcon
                  animationData={reportsAnimationData}
                  isActive={true}
                  loop={false}
                  autoplay={true}
                  speed={1.0}
                  className="transition-all duration-300"
                />
              </div>
            </div>
          )}

          <div>
            <h1
              className={cn(
                'ios-heading-title1 ios-text-glass-subtle lg:ios-heading-large',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}
              data-text="Reportes y Exportación"
            >
              Reportes y Exportación
            </h1>
            <p
              className={cn(
                'mt-1 ios-text-footnote ios-font-medium lg:ios-text-callout',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              Generación de reportes regulatorios CONSAR en múltiples formatos
            </p>
          </div>
        </div>

        <button
          onClick={() => refetchValidations()}
          className={cn(
            'p-2 rounded-lg transition-colors',
            isDark
              ? 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700'
          )}
          title="Actualizar datos"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total Validaciones',
            value: statistics.totalValidations.toString(),
            icon: FileText,
            color: 'blue',
          },
          {
            label: 'Completadas',
            value: statistics.completed.toString(),
            icon: CheckCircle2,
            color: 'green',
          },
          {
            label: 'Tasa Cumplimiento',
            value: `${statistics.complianceRate.toFixed(1)}%`,
            icon: TrendingUp,
            color: 'purple',
          },
          {
            label: 'Registros Procesados',
            value: statistics.totalRecords.toLocaleString(),
            icon: BarChart3,
            color: 'yellow',
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isDark ? 'text-neutral-400' : 'text-neutral-600'
                    )}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={cn(
                      'mt-2 text-3xl font-bold',
                      isDark ? 'text-neutral-100' : 'text-neutral-900'
                    )}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-[12px]',
                    'glass-ultra-clear depth-layer-2'
                  )}
                >
                  <stat.icon
                    className={cn('h-6 w-6', isDark ? 'text-neutral-300' : 'text-neutral-700')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Generar Reporte por Período
          </CardTitle>
          <CardDescription>
            Exporta un reporte consolidado de validaciones para un rango de fechas específico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label
                className={cn(
                  'block text-sm font-medium mb-2',
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                )}
              >
                Fecha Inicio *
              </label>
              <input
                type="date"
                value={periodForm.startDate}
                onChange={(e) => setPeriodForm({ ...periodForm, startDate: e.target.value })}
                max={today}
                className={cn(
                  'w-full px-3 py-2.5 rounded-lg border text-sm',
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-100'
                    : 'bg-white border-neutral-300 text-neutral-900'
                )}
              />
            </div>
            <div>
              <label
                className={cn(
                  'block text-sm font-medium mb-2',
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                )}
              >
                Fecha Fin *
              </label>
              <input
                type="date"
                value={periodForm.endDate}
                onChange={(e) => setPeriodForm({ ...periodForm, endDate: e.target.value })}
                min={periodForm.startDate || undefined}
                max={today}
                className={cn(
                  'w-full px-3 py-2.5 rounded-lg border text-sm',
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-100'
                    : 'bg-white border-neutral-300 text-neutral-900'
                )}
              />
            </div>
            <div>
              <label
                className={cn(
                  'block text-sm font-medium mb-2',
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                )}
              >
                Tipo de Archivo
              </label>
              <select
                value={periodForm.fileType}
                onChange={(e) => setPeriodForm({ ...periodForm, fileType: e.target.value })}
                className={cn(
                  'w-full px-3 py-2.5 rounded-lg border text-sm',
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-100'
                    : 'bg-white border-neutral-300 text-neutral-900'
                )}
              >
                <option value="">Todos</option>
                <option value="Nomina">NOMINA</option>
                <option value="Contable">CONTABLE</option>
                <option value="Regularizacion">REGULARIZACIÓN</option>
              </select>
            </div>
            <div>
              <label
                className={cn(
                  'block text-sm font-medium mb-2',
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                )}
              >
                Formato
              </label>
              <select
                value={periodForm.format}
                onChange={(e) =>
                  setPeriodForm({ ...periodForm, format: e.target.value as ExportFormat })
                }
                className={cn(
                  'w-full px-3 py-2.5 rounded-lg border text-sm',
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-100'
                    : 'bg-white border-neutral-300 text-neutral-900'
                )}
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <PremiumButtonV2
              label="Generar Reporte de Período"
              icon={exportingFormat ? Loader2 : Download}
              size="lg"
              onClick={handlePeriodReportExport}
              disabled={!!exportingFormat || !periodForm.startDate || !periodForm.endDate}
            />
            <PremiumButtonV2
              label="Reporte de Cumplimiento CONSAR"
              icon={exportingFormat ? Loader2 : Shield}
              size="lg"
              variant="secondary"
              onClick={() => handleComplianceReportExport('pdf')}
              disabled={!!exportingFormat || !periodForm.startDate || !periodForm.endDate}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Validations for Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exportar Validaciones Individuales
          </CardTitle>
          <CardDescription>
            Descarga reportes detallados de validaciones específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : validations.length === 0 ? (
              <div
                className={cn(
                  'text-center py-12',
                  isDark ? 'text-neutral-500' : 'text-neutral-500'
                )}
              >
                <FileText
                  className={cn(
                    'h-12 w-12 mx-auto mb-4',
                    isDark ? 'text-neutral-600' : 'text-neutral-300'
                  )}
                />
                <p className="ios-text-callout">No hay validaciones disponibles para exportar</p>
                <button
                  onClick={() => navigate('/validations')}
                  className={cn(
                    'mt-4 text-sm font-medium',
                    isDark ? 'text-primary-400' : 'text-primary-600'
                  )}
                >
                  Ir a Validaciones →
                </button>
              </div>
            ) : (
              validations
                .filter((v) => v && v.id) // Filter out invalid entries
                .map((validation) => (
                  <ValidationExportRow
                    key={validation.id}
                    validation={validation}
                    onExport={handleExportValidation}
                    exportingId={exportingValidationId}
                  />
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Info Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Compliance Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Cumplimiento Normativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  Circular CONSAR 19-8
                </span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  NOM-151-SCFI-2016
                </span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  Retención 10 años
                </span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Formats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" />
              Formatos Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {EXPORT_OPTIONS.map((opt) => (
                <div key={opt.format} className="flex items-center gap-2">
                  <opt.icon className="h-4 w-4" style={{ color: opt.color }} />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isDark ? 'text-neutral-300' : 'text-neutral-700'
                    )}
                  >
                    {opt.label}
                  </span>
                  <span
                    className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-500')}
                  >
                    - {opt.description.split(' ').slice(0, 3).join(' ')}...
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Resumen Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  Exportables
                </span>
                <span className={cn('text-sm font-bold text-green-500')}>
                  {statistics.completed}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  Con errores
                </span>
                <span className={cn('text-sm font-bold text-red-500')}>
                  {statistics.withErrors}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  Pendientes
                </span>
                <span className={cn('text-sm font-bold text-yellow-500')}>
                  {statistics.totalValidations - statistics.completed}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes mesh-flow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  )
}

export default ReportsVisionOS
