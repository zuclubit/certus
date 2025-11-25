/**
 * ValidationDetail Page
 *
 * Pantalla de detalle completa para validaciones CONSAR
 * Muestra: Resumen, Errores, Advertencias, Datos, Timeline, Audit Log
 * Con 37 validadores organizados en 7 grupos
 */

import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Trash2,
  Send,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PremiumButtonV2, PremiumAuditTable, PremiumTimeline } from '@/components/ui'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import {
  useValidationDetail,
  useRetryValidation,
  useDeleteValidation,
  useDownloadReport,
  useCreateCorrectedVersion,
  useVersionChain,
} from '@/hooks/useValidations'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ValidationStatus, ErrorSeverity } from '@/lib/constants'
import type { ValidationError, ValidatorResult, TimelineEvent, AuditLogEntry } from '@/types'
import { DataViewer } from '@/components/data-viewer'
import { exportToExcel, exportToCSV, exportToRaw } from '@/lib/exporters'
import type { CONSARFileType, ParsedFile } from '@/lib/types/consar-record'
import { usePDFGenerator, buildValidationReportData, buildErrorReportData } from '@/lib/pdf'
import { CreateCorrectedVersionModal } from '@/components/validations/CreateCorrectedVersionModal'
import { VersionChain } from '@/components/validations/VersionChain'

type TabType = 'resumen' | 'errores' | 'advertencias' | 'datos' | 'timeline' | 'audit' | 'versions'

/**
 * Get status badge configuration
 */
function getStatusBadge(status: ValidationStatus, isDark: boolean) {
  const configs = {
    success: {
      icon: CheckCircle2,
      label: 'Validado',
      bg: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
      border: isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.3)',
      text: isDark ? 'text-green-400' : 'text-green-700',
      icon_color: 'text-green-500',
    },
    error: {
      icon: XCircle,
      label: 'Con Errores',
      bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
      border: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)',
      text: isDark ? 'text-red-400' : 'text-red-700',
      icon_color: 'text-red-500',
    },
    warning: {
      icon: AlertTriangle,
      label: 'Con Advertencias',
      bg: isDark ? 'rgba(234, 179, 8, 0.15)' : 'rgba(234, 179, 8, 0.1)',
      border: isDark ? 'rgba(234, 179, 8, 0.4)' : 'rgba(234, 179, 8, 0.3)',
      text: isDark ? 'text-yellow-400' : 'text-yellow-700',
      icon_color: 'text-yellow-500',
    },
    processing: {
      icon: Clock,
      label: 'Procesando',
      bg: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
      border: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
      text: isDark ? 'text-blue-400' : 'text-blue-700',
      icon_color: 'text-blue-500',
    },
    pending: {
      icon: Clock,
      label: 'Pendiente',
      bg: isDark ? 'rgba(107, 114, 128, 0.15)' : 'rgba(107, 114, 128, 0.1)',
      border: isDark ? 'rgba(107, 114, 128, 0.4)' : 'rgba(107, 114, 128, 0.3)',
      text: isDark ? 'text-gray-400' : 'text-gray-700',
      icon_color: 'text-gray-500',
    },
  }
  return configs[status] || configs.pending
}

/**
 * Get severity badge configuration
 */
function getSeverityBadge(severity: ErrorSeverity) {
  const configs = {
    critical: { label: 'CRÍTICO', color: 'text-red-600', bg: 'bg-red-100', icon: '🔴' },
    high: { label: 'ALTO', color: 'text-orange-600', bg: 'bg-orange-100', icon: '🟠' },
    medium: { label: 'MEDIO', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '🟡' },
    low: { label: 'BAJO', color: 'text-blue-600', bg: 'bg-blue-100', icon: '🔵' },
    info: { label: 'INFO', color: 'text-gray-600', bg: 'bg-gray-100', icon: '⚪' },
  }
  return configs[severity] || configs.info
}

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function ValidationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [activeTab, setActiveTab] = useState<TabType>('resumen')
  const [expandedValidators, setExpandedValidators] = useState<Set<string>>(new Set())
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set())
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)

  // Fetch validation detail
  const { data: detailData, isLoading } = useValidationDetail(id)
  const validation = detailData?.data

  // Mutations
  const retryMutation = useRetryValidation()
  const deleteMutation = useDeleteValidation()
  const downloadMutation = useDownloadReport()
  const createVersionMutation = useCreateCorrectedVersion()

  // PDF Generator hook
  const { generateValidationReport, generateErrorReport, isGenerating: isPDFGenerating } = usePDFGenerator()

  // Version chain
  const { data: versionChainData } = useVersionChain(id)
  const versionChain = versionChainData?.data || []

  // Group validators by group
  const validatorsByGroup = useMemo(() => {
    if (!validation?.validators) return new Map()

    const groups = new Map<string, ValidatorResult[]>()
    validation.validators.forEach((validator) => {
      const group = validator.group
      if (!groups.has(group)) {
        groups.set(group, [])
      }
      groups.get(group)!.push(validator)
    })
    return groups
  }, [validation?.validators])

  const handleRetry = async () => {
    if (!id) return
    try {
      await retryMutation.mutateAsync(id)
    } catch (error) {
      console.error('Error retrying validation:', error)
    }
  }

  const handleDelete = async (justification?: string) => {
    if (!id || !validation) return

    try {
      await deleteMutation.mutateAsync({ id, justification })
      setShowDeleteModal(false)
      navigate('/validations')
    } catch (error) {
      console.error('Error deleting validation:', error)
    }
  }

  const handleDownloadReport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!id || !validation) return

    // For PDF, use the new PDF generation system
    if (format === 'pdf') {
      try {
        // Build mock ParsedFile from validation data
        const mockParsedFile: ParsedFile = {
          fileType: validation.fileType as CONSARFileType,
          totalRecords: validation.totalRecords || 0,
          validRecords: validation.validRecords || 0,
          hasHeader: true,
          hasFooter: true,
          detailRecords: validation.totalRecords || 0,
          records: [],
          errors: validation.errors?.map((err: ValidationError) => ({
            lineNumber: err.lineNumber || 0,
            field: err.field || '',
            message: err.message || '',
            type: err.type || 'validation',
            severity: err.severity || 'error',
            value: undefined,
          })) || [],
        }

        // Generate validation report
        const reportData = buildValidationReportData(mockParsedFile, validation.fileName)
        await generateValidationReport(reportData, {
          includeCharts: true,
          includeDetails: false, // Don't include detailed records
          maxDetailRecords: 0,
        })
      } catch (error) {
        console.error('Error generating PDF:', error)
      }
    } else {
      // For other formats, use existing download mutation
      try {
        await downloadMutation.mutateAsync({ id, format })
      } catch (error) {
        console.error('Error downloading report:', error)
      }
    }
  }

  const toggleValidator = (code: string) => {
    const newExpanded = new Set(expandedValidators)
    if (newExpanded.has(code)) {
      newExpanded.delete(code)
    } else {
      newExpanded.add(code)
    }
    setExpandedValidators(newExpanded)
  }

  const toggleError = (errorId: string) => {
    const newExpanded = new Set(expandedErrors)
    if (newExpanded.has(errorId)) {
      newExpanded.delete(errorId)
    } else {
      newExpanded.add(errorId)
    }
    setExpandedErrors(newExpanded)
  }

  const handleCreateVersion = async (reason: string) => {
    if (!id || !validation) return

    try {
      const response = await createVersionMutation.mutateAsync({ id, reason })
      setShowVersionModal(false)

      // Navigate to new version
      if (response.data?.id) {
        navigate(`/validations/${response.data.id}`)
      }
    } catch (error) {
      console.error('Error creating corrected version:', error)
    }
  }

  const handleVersionClick = (version: typeof validation) => {
    if (version && version.id !== id) {
      navigate(`/validations/${version.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!validation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Validación no encontrada</h2>
        <Button onClick={() => navigate('/validations')}>Volver a Validaciones</Button>
      </div>
    )
  }

  const statusConfig = getStatusBadge(validation.status, isDark)
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/validations')}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Validaciones
        </Button>

        {/* Title and status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText
                    className={cn('h-6 w-6', isDark ? 'text-blue-400' : 'text-blue-600')}
                  />
                  <h1
                    className={cn(
                      'text-2xl font-bold',
                      isDark ? 'text-neutral-100' : 'text-neutral-900'
                    )}
                  >
                    {validation.fileName}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span
                    className={cn(
                      'inline-flex items-center px-3 py-1 rounded-[10px] font-semibold',
                      'glass-ultra-clear'
                    )}
                    style={{
                      background: isDark
                        ? 'rgba(88, 86, 214, 0.15)'
                        : 'rgba(88, 86, 214, 0.1)',
                      color: isDark ? 'rgb(147, 197, 253)' : 'rgb(37, 99, 235)',
                    }}
                  >
                    {validation.fileType}
                  </span>
                  <span className={cn('font-medium', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                    •
                  </span>
                  <span className={cn('font-medium', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                    {formatFileSize(validation.fileSize)}
                  </span>
                  <span className={cn('font-medium', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                    •
                  </span>
                  <span className={cn('font-medium', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                    {formatDistanceToNow(new Date(validation.uploadedAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-[12px]',
                  'glass-ultra-clear'
                )}
                style={{
                  background: statusConfig.bg,
                  border: `1px solid ${statusConfig.border}`,
                }}
              >
                <StatusIcon className={cn('h-5 w-5', statusConfig.icon_color)} />
                <span className={cn('text-sm font-bold', statusConfig.text)}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* Actions - Grouped by priority */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* Primary Action */}
              <PremiumButtonV2
                label={isPDFGenerating ? 'Generando PDF...' : 'Reporte Resumen'}
                icon={Download}
                size="md"
                loading={isPDFGenerating}
                onClick={() => handleDownloadReport('pdf')}
                title="Genera un PDF rápido con resumen de validación (sin registros detallados)"
              />

              {/* Secondary Actions */}
              <div className="flex flex-wrap gap-2">
                {(validation.status === 'error' || validation.status === 'warning') && !validation.supersededAt && (
                  <>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={handleRetry}
                      disabled={retryMutation.isPending}
                      title="Volver a procesar este archivo"
                    >
                      <RefreshCw className={cn('h-4 w-4', retryMutation.isPending && 'animate-spin')} />
                      Re-validar
                    </Button>
                    <PremiumButtonV2
                      label="Crear Versión Corregida"
                      icon={FileText}
                      size="md"
                      loading={createVersionMutation.isPending}
                      onClick={() => setShowVersionModal(true)}
                      title="Crear archivo sustituto conforme a Circular CONSAR 19-8"
                    />
                  </>
                )}

                {validation.supersededAt && (
                  <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <span className="text-sm font-medium">
                      ⚠️ Este archivo ha sido sustituido por una versión más reciente
                    </span>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setShowDeleteModal(true)}
                  title="Eliminar esta validación permanentemente"
                >
                  <Trash2 className="h-4 w-4" />
                  Borrar
                </Button>

                {validation.status === 'success' && (
                  <Button
                    variant="secondary"
                    size="md"
                    disabled
                    title="Enviar validación aprobada a CONSAR (próximamente)"
                  >
                    <Send className="h-4 w-4" />
                    Enviar a CONSAR
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs - Responsive con scroll horizontal en móvil */}
      <div className={cn(
        "flex gap-1.5 xs:gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-3 mb-1 border-b",
        "-mx-4 px-4 sm:mx-0 sm:px-0", // Full bleed en móvil
        isDark ? "border-gray-800" : "border-gray-200"
      )}>
        {[
          { id: 'resumen', label: 'Resumen', shortLabel: 'Resumen', icon: CheckCircle2 },
          { id: 'errores', label: `Errores (${validation.errorCount})`, shortLabel: `Err (${validation.errorCount})`, icon: XCircle },
          { id: 'advertencias', label: `Advertencias (${validation.warningCount})`, shortLabel: `Adv (${validation.warningCount})`, icon: AlertTriangle },
          { id: 'datos', label: 'Datos', shortLabel: 'Datos', icon: FileText },
          { id: 'versions', label: `Versiones (${versionChain.length})`, shortLabel: `Ver (${versionChain.length})`, icon: FileText, show: versionChain.length > 1 },
          { id: 'timeline', label: 'Timeline', shortLabel: 'Time', icon: Clock },
          { id: 'audit', label: 'Audit Log', shortLabel: 'Audit', icon: AlertCircle },
        ].filter(tab => tab.show !== false).map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'inline-flex items-center justify-center',
                // Responsive gap y padding
                'gap-1 xs:gap-1.5 sm:gap-2',
                'px-2 py-1.5 xs:px-2.5 xs:py-1.5 sm:px-4 sm:py-2',
                // Responsive border-radius
                'rounded-lg xs:rounded-[10px] sm:rounded-[12px]',
                // Responsive text
                'font-semibold text-[10px] xs:text-xs sm:text-sm',
                'transition-all duration-300 whitespace-nowrap shrink-0 snap-start',
                activeTab === tab.id
                  ? 'glass-ultra-premium depth-layer-2'
                  : 'glass-ultra-clear hover:scale-[1.02]'
              )}
              style={
                activeTab === tab.id
                  ? {
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.2) 0%, rgba(88, 86, 214, 0.2) 100%)'
                        : 'linear-gradient(135deg, rgba(0, 102, 255, 0.12) 0%, rgba(88, 86, 214, 0.12) 100%)',
                      border: isDark
                        ? '1px solid rgba(0, 102, 255, 0.4)'
                        : '1px solid rgba(0, 102, 255, 0.3)',
                      color: isDark ? 'rgb(147, 197, 253)' : 'rgb(37, 99, 235)',
                    }
                  : {
                      background: isDark
                        ? 'rgba(45, 45, 55, 0.4)'
                        : 'rgba(255, 255, 255, 0.6)',
                      color: isDark ? 'rgb(212, 212, 216)' : 'rgb(82, 82, 91)',
                    }
              }
            >
              <Icon className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
              {/* Mostrar label corto en móvil, completo en desktop */}
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'resumen' && (
        <ResumenTab validation={validation} isDark={isDark} validatorsByGroup={validatorsByGroup} expandedValidators={expandedValidators} toggleValidator={toggleValidator} />
      )}

      {activeTab === 'errores' && (
        <ErroresTab errors={validation.errors} isDark={isDark} expandedErrors={expandedErrors} toggleError={toggleError} />
      )}

      {activeTab === 'advertencias' && (
        <AdvertenciasTab warnings={validation.warnings} isDark={isDark} />
      )}

      {activeTab === 'datos' && (
        <DatosTab validation={validation} isDark={isDark} />
      )}

      {activeTab === 'timeline' && (
        <TimelineTab timeline={validation.timeline} isDark={isDark} />
      )}

      {activeTab === 'audit' && (
        <AuditTab auditLog={validation.auditLog} isDark={isDark} />
      )}

      {activeTab === 'versions' && (
        <VersionChain
          versions={versionChain}
          currentVersionId={id!}
          onVersionClick={handleVersionClick}
          isDark={isDark}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Eliminar Validación"
        description={`¿Está seguro de eliminar la validación "${validation?.fileName}"? Esta acción marcará el registro como eliminado y se registrará en el historial de auditoría.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        requireJustification={true}
        justificationLabel="Justificación (requerida por normatividad)"
        justificationPlaceholder="Por favor proporciona una razón detallada para eliminar esta validación. Esta información se registrará en el historial de auditoría y es requerida por las regulaciones de CONSAR y cumplimiento normativo."
        minJustificationLength={20}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Create Corrected Version Modal */}
      <CreateCorrectedVersionModal
        open={showVersionModal}
        onOpenChange={setShowVersionModal}
        validation={validation}
        onConfirm={handleCreateVersion}
        isLoading={createVersionMutation.isPending}
      />
    </div>
  )
}

// Resumen Tab Component
function ResumenTab({
  validation,
  isDark,
  validatorsByGroup,
  expandedValidators,
  toggleValidator,
}: any) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total Registros',
            value: validation.recordCount.toLocaleString(),
            icon: FileText,
            color: 'blue',
            glowColor: 'rgba(59, 130, 246, 0.3)',
          },
          {
            label: 'Validados OK',
            value: `${validation.validRecordCount.toLocaleString()} (${Math.round((validation.validRecordCount / validation.recordCount) * 100)}%)`,
            icon: CheckCircle2,
            color: 'green',
            glowColor: 'rgba(34, 197, 94, 0.3)',
          },
          {
            label: 'Errores',
            value: validation.errorCount.toLocaleString(),
            icon: XCircle,
            color: 'red',
            glowColor: 'rgba(239, 68, 68, 0.3)',
          },
          {
            label: 'Advertencias',
            value: validation.warningCount.toLocaleString(),
            icon: AlertTriangle,
            color: 'yellow',
            glowColor: 'rgba(234, 179, 8, 0.3)',
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={cn(
                'p-6 rounded-[20px]',
                'glass-ultra-premium depth-layer-2',
                'transition-all duration-300 hover:scale-[1.02]'
              )}
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
                backdropFilter: 'blur(20px) saturate(110%)',
                border: isDark
                  ? '1.5px solid rgba(255,255,255,0.08)'
                  : '1.5px solid rgba(255,255,255,0.4)',
                boxShadow: `0 4px 16px ${stat.glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p
                    className={cn(
                      'ios-text-footnote ios-font-semibold uppercase tracking-wide mb-2',
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
                    )}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={cn(
                      'ios-heading-title2 ios-font-bold tabular-nums',
                      isDark ? 'text-neutral-100' : 'text-neutral-900'
                    )}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-[16px]"
                  style={{
                    background: isDark
                      ? 'rgba(45, 45, 55, 0.5)'
                      : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: `0 0 20px ${stat.glowColor}`,
                  }}
                >
                  <Icon
                    className={cn(
                      'h-7 w-7',
                      stat.color === 'blue' && (isDark ? 'text-blue-400' : 'text-blue-600'),
                      stat.color === 'green' && (isDark ? 'text-green-400' : 'text-green-600'),
                      stat.color === 'red' && (isDark ? 'text-red-400' : 'text-red-600'),
                      stat.color === 'yellow' && (isDark ? 'text-yellow-400' : 'text-yellow-600')
                    )}
                    style={{
                      filter: `drop-shadow(0 0 8px ${stat.glowColor})`,
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Validators by Group */}
      <div
        className={cn('rounded-[20px]', 'glass-ultra-premium depth-layer-3', 'overflow-hidden')}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15,15,20,0.95) 0%, rgba(20,20,25,0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.98) 100%)',
          backdropFilter: 'blur(24px) saturate(120%)',
          border: isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(255,255,255,0.4)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
          <h3 className={cn('ios-heading-title2 ios-font-bold mb-1', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
            Validadores Ejecutados ({validation.validators.length}/37)
          </h3>
          <p className={cn('ios-text-callout ios-font-regular', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
            Agrupados por categoría según especificaciones CONSAR
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from(validatorsByGroup.entries()).map(([group, validators]) => (
              <div key={group} className="space-y-2">
                <h3
                  className={cn(
                    'text-sm font-bold uppercase tracking-wide',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                >
                  {group}
                </h3>
                <div className="space-y-2">
                  {validators.map((validator: ValidatorResult) => {
                    const isExpanded = expandedValidators.has(validator.code)
                    const isPassed = validator.status === 'passed'

                    return (
                      <div
                        key={validator.code}
                        className={cn(
                          'p-4 rounded-[14px] transition-all duration-300',
                          'glass-ultra-clear depth-layer-1'
                        )}
                        style={{
                          background: isDark
                            ? 'rgba(45, 45, 55, 0.4)'
                            : 'rgba(255, 255, 255, 0.6)',
                        }}
                      >
                        <button
                          onClick={() => toggleValidator(validator.code)}
                          className="w-full flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {isPassed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span
                              className={cn(
                                'font-semibold',
                                isDark ? 'text-neutral-200' : 'text-neutral-800'
                              )}
                            >
                              {validator.code} - {validator.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'text-sm font-medium',
                                isDark ? 'text-neutral-400' : 'text-neutral-600'
                              )}
                            >
                              {isPassed ? 'Passed' : `${validator.errorCount} errores`} • {validator.duration}ms
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-neutral-700 space-y-2">
                            <p className="text-sm">
                              <span className="font-semibold">Código:</span> {validator.code}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Grupo:</span> {validator.group}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Duración:</span> {validator.duration}ms
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Errores:</span> {validator.errorCount}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Advertencias:</span> {validator.warningCount}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Errores Tab Component
function ErroresTab({ errors, isDark, expandedErrors, toggleError }: any) {
  if (errors.length === 0) {
    return (
      <div
        className={cn('rounded-[20px] p-12 text-center', 'glass-ultra-premium depth-layer-3')}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15,15,20,0.95) 0%, rgba(20,20,25,0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.98) 100%)',
          backdropFilter: 'blur(24px) saturate(120%)',
          border: isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(255,255,255,0.4)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        <div
          className="inline-flex h-20 w-20 items-center justify-center rounded-[20px] mb-6"
          style={{
            background: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            boxShadow: '0 0 24px rgba(34, 197, 94, 0.3)',
          }}
        >
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>
        <h3
          className={cn(
            'ios-heading-title2 ios-font-bold mb-2',
            isDark ? 'text-neutral-200' : 'text-neutral-800'
          )}
        >
          No hay errores
        </h3>
        <p
          className={cn(
            'ios-text-body ios-font-regular',
            isDark ? 'text-neutral-400' : 'text-neutral-600'
          )}
        >
          La validación se completó exitosamente sin errores críticos
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={cn(
              'ios-heading-title2 ios-font-bold mb-1',
              isDark ? 'text-neutral-200' : 'text-neutral-800'
            )}
          >
            Errores Críticos ({errors.length})
          </h2>
          <p
            className={cn(
              'ios-text-callout ios-font-regular',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            Errores encontrados durante la validación
          </p>
        </div>
        <Button variant="secondary" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar Errores
        </Button>
      </div>

      {errors.map((error: ValidationError) => {
        const isExpanded = expandedErrors.has(error.id)
        const severityConfig = getSeverityBadge(error.severity)

        return (
          <div
            key={error.id}
            className={cn('rounded-[16px] overflow-hidden', 'glass-ultra-premium depth-layer-2')}
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
              backdropFilter: 'blur(20px) saturate(110%)',
              border: isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(255,255,255,0.4)',
              boxShadow: isDark
                ? '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                : '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            <div className="p-6">
              <button
                onClick={() => toggleError(error.id)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{severityConfig.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={cn(
                            'font-bold',
                            isDark ? 'text-neutral-200' : 'text-neutral-800'
                          )}
                        >
                          {error.validatorCode} - {error.validatorName}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-[8px] text-xs font-bold',
                            severityConfig.bg,
                            severityConfig.color
                          )}
                        >
                          {severityConfig.label}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-base font-semibold',
                          isDark ? 'text-neutral-300' : 'text-neutral-700'
                        )}
                      >
                        {error.message}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 flex-shrink-0" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="space-y-4 pl-11">
                  <div
                    className={cn(
                      'p-4 rounded-[12px]',
                      isDark ? 'bg-neutral-800/50' : 'bg-neutral-100/50'
                    )}
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold mb-1">📍 Ubicación:</p>
                        <p>Línea {error.line}, Columna {error.column}</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Campo:</p>
                        <p className="font-mono">{error.field}</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">❌ Valor encontrado:</p>
                        <p className="font-mono text-red-500">"{error.value}"</p>
                      </div>
                      {error.expectedValue && (
                        <div>
                          <p className="font-semibold mb-1">✓ Valor esperado:</p>
                          <p className="font-mono text-green-500">{error.expectedValue}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">📝 Descripción:</p>
                    <p
                      className={cn(
                        'text-sm',
                        isDark ? 'text-neutral-300' : 'text-neutral-700'
                      )}
                    >
                      {error.description}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">💡 Sugerencia:</p>
                    <p
                      className={cn(
                        'text-sm',
                        isDark ? 'text-neutral-300' : 'text-neutral-700'
                      )}
                    >
                      {error.suggestion}
                    </p>
                  </div>

                  {error.reference && (
                    <div>
                      <p className="font-semibold mb-2">📖 Referencia:</p>
                      <p className="text-sm text-blue-500">{error.reference}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button variant="secondary" size="sm">
                      Ver registro completo
                    </Button>
                    <Button variant="secondary" size="sm">
                      Ver en contexto
                    </Button>
                    {error.reference && (
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                        Ver circular CONSAR
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Advertencias Tab Component (simplified, similar to Errores)
function AdvertenciasTab({ warnings, isDark }: any) {
  if (warnings.length === 0) {
    return (
      <div
        className={cn('rounded-[20px] p-12 text-center', 'glass-ultra-premium depth-layer-3')}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15,15,20,0.95) 0%, rgba(20,20,25,0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.98) 100%)',
          backdropFilter: 'blur(24px) saturate(120%)',
          border: isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(255,255,255,0.4)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        <div
          className="inline-flex h-20 w-20 items-center justify-center rounded-[20px] mb-6"
          style={{
            background: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            boxShadow: '0 0 24px rgba(34, 197, 94, 0.3)',
          }}
        >
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>
        <h3
          className={cn(
            'ios-heading-title2 ios-font-bold mb-2',
            isDark ? 'text-neutral-200' : 'text-neutral-800'
          )}
        >
          No hay advertencias
        </h3>
        <p
          className={cn(
            'ios-text-body ios-font-regular',
            isDark ? 'text-neutral-400' : 'text-neutral-600'
          )}
        >
          La validación se completó sin advertencias
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2
          className={cn(
            'ios-heading-title2 ios-font-bold mb-1',
            isDark ? 'text-neutral-200' : 'text-neutral-800'
          )}
        >
          Advertencias ({warnings.length})
        </h2>
        <p
          className={cn(
            'ios-text-callout ios-font-regular',
            isDark ? 'text-neutral-400' : 'text-neutral-600'
          )}
        >
          Puntos de atención identificados durante la validación
        </p>
      </div>

      {warnings.map((warning: any) => (
        <div
          key={warning.id}
          className={cn('rounded-[16px] p-6', 'glass-ultra-premium depth-layer-2')}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
            backdropFilter: 'blur(20px) saturate(110%)',
            border: isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(255,255,255,0.4)',
            boxShadow: isDark
              ? '0 4px 16px rgba(234, 179, 8, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 4px 16px rgba(234, 179, 8, 0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[12px] flex-shrink-0"
              style={{
                background: isDark ? 'rgba(234, 179, 8, 0.15)' : 'rgba(234, 179, 8, 0.1)',
                border: '1.5px solid rgba(234, 179, 8, 0.3)',
                boxShadow: '0 0 16px rgba(234, 179, 8, 0.3)',
              }}
            >
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p
                className={cn(
                  'ios-text-body ios-font-semibold mb-2',
                  isDark ? 'text-neutral-200' : 'text-neutral-800'
                )}
              >
                {warning.validatorCode} - {warning.message}
              </p>
              <p
                className={cn(
                  'ios-text-footnote ios-font-regular',
                  isDark ? 'text-neutral-500' : 'text-neutral-600'
                )}
              >
                Línea {warning.line}, Columna {warning.column}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Datos Tab Component with DataViewer
function DatosTab({ validation, isDark }: any) {
  const [mockFile, setMockFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedFile | null>(null)

  // Create mock File object from validation data
  useMemo(() => {
    // Generate mock CONSAR file content (77 characters per line)
    const generateMockFileContent = (fileType: string) => {
      const lines: string[] = []
      const numRecords = Math.min(validation.totalRecords || 100, 1000)

      if (fileType === 'NOMINA') {
        // Header (01) for NOMINA
        const header = '01NOMINA  ABC12345678920250122001101                                    '
        lines.push(header)

        // Generate detail lines (02)
        for (let i = 0; i < numRecords; i++) {
          const nss = String(12345678900 + i).padStart(11, '0')
          const curp = `AAAA850101HDFLRN0${String(i % 10)}`
          const name = `TRABAJADOR ${String(i + 1).padStart(4, '0')}                    `.substring(0, 40)
          const amount = String(Math.floor(Math.random() * 10000000) + 100000).padStart(9, '0')
          const movType = ['A', 'B', 'M'][i % 3]
          const date = '20250122'
          const account = String(20000000000 + i).padStart(11, '0')

          const line = `02${nss}${curp}${name}${amount}${movType}${date}${account}`
          lines.push(line.substring(0, 77).padEnd(77, ' '))
        }

        // Footer (03)
        const totalAmount = String(numRecords * 500000).padStart(12, '0')
        const footer = `03${String(numRecords).padStart(8, '0')}${totalAmount}                                                       `
        lines.push(footer.substring(0, 77))
      } else if (fileType === 'CONTABLE') {
        // Header for CONTABLE
        const header = '01CONTABLEABC12345678920250122202501                                '
        lines.push(header)

        // Generate detail lines
        for (let i = 0; i < numRecords; i++) {
          const accountCode = String(1000 + (i % 100)).padStart(4, '0')
          const subAccount = '0000'
          const date = '20250122'
          const debit = String(Math.floor(Math.random() * 1000000000)).padStart(12, '0')
          const credit = i % 2 === 0 ? String(Math.floor(Math.random() * 1000000000)).padStart(12, '0') : '000000000000'
          const reference = `REF${String(i + 1).padStart(16, '0')}`
          const concept = `CONCEPTO CONTABLE ${String(i + 1).padStart(4, '0')}                  `.substring(0, 50)
          const currency = 'MXN'

          const line = `02${accountCode}${subAccount}${date}${debit}${credit}${reference}${concept}${currency}`
          lines.push(line.substring(0, 77).padEnd(77, ' '))
        }

        // Footer
        const totalDebit = String(numRecords * 5000000).padStart(15, '0')
        const totalCredit = String(numRecords * 2500000).padStart(15, '0')
        const footer = `03${String(numRecords).padStart(8, '0')}${totalDebit}${totalCredit}                                     `
        lines.push(footer.substring(0, 77))
      } else {
        // REGULARIZACION
        const header = '01REGULARIZACIONABC12345678920250122  01                               '
        lines.push(header)

        // Generate detail lines
        for (let i = 0; i < numRecords; i++) {
          const account = String(20000000000 + i).padStart(11, '0')
          const nss = String(12345678900 + i).padStart(11, '0')
          const originalDate = '20240115'
          const correctionDate = '20250122'
          const originalAmount = String(Math.floor(Math.random() * 10000000) + 100000).padStart(9, '0')
          const correctedAmount = String(Math.floor(Math.random() * 10000000) + 100000).padStart(9, '0')
          const reason = `CORRECCION SALARIAL           `.substring(0, 30)
          const authRef = `AUTH${String(i + 1).padStart(15, '0')}`

          const line = `02${account}${nss}${originalDate}${correctionDate}${originalAmount}${correctedAmount}${reason}${authRef}`
          lines.push(line.substring(0, 77).padEnd(77, ' '))
        }

        // Footer
        const totalOriginal = String(numRecords * 500000).padStart(12, '0')
        const totalCorrected = String(numRecords * 550000).padStart(12, '0')
        const footer = `03${String(numRecords).padStart(8, '0')}${totalOriginal}${totalCorrected}                                           `
        lines.push(footer.substring(0, 77))
      }

      return lines.join('\n')
    }

    // Generate proper CONSAR filename: TIPO_RFC_YYYYMMDD_SECUENCIA.txt
    const fileType = validation.fileType || 'NOMINA'
    const content = generateMockFileContent(fileType)
    const blob = new Blob([content], { type: 'text/plain' })
    const rfc = 'ABC123456789'
    const date = new Date().toISOString().substring(0, 10).replace(/-/g, '')
    const mockFileName = `${fileType}_${rfc}_${date}_0001.txt`

    const file = new File([blob], mockFileName, { type: 'text/plain' })
    setMockFile(file)
  }, [validation])

  // Handle export
  const handleExport = async (format: 'csv' | 'excel') => {
    if (!parsedData) {
      console.warn('No parsed data available for export')
      return
    }

    try {
      if (format === 'excel') {
        await exportToExcel(parsedData, {
          format: 'excel',
          includeErrors: true,
          includeWarnings: true,
          includeSummary: true,
          applyFormatting: true,
        })
      } else {
        exportToCSV(parsedData, {
          format: 'csv',
          includeErrors: true,
        })
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (!mockFile) {
    return (
      <div
        className={cn('rounded-[20px] py-12 text-center', 'glass-ultra-premium depth-layer-3')}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15,15,20,0.95) 0%, rgba(20,20,25,0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.98) 100%)',
          backdropFilter: 'blur(24px) saturate(120%)',
          border: isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(255,255,255,0.4)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        <Clock className={cn('h-12 w-12 animate-spin mx-auto mb-4', isDark ? 'text-blue-400' : 'text-blue-600')} />
        <p className={cn('ios-text-body ios-font-medium', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
          Preparando datos...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        className={cn('rounded-[20px] overflow-hidden', 'glass-ultra-premium depth-layer-3')}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15,15,20,0.95) 0%, rgba(20,20,25,0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.98) 100%)',
          backdropFilter: 'blur(24px) saturate(120%)',
          border: isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(255,255,255,0.4)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
          <h3 className={cn('ios-heading-title2 ios-font-bold mb-1', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
            Visor de Datos Tabular
          </h3>
          <p className={cn('ios-text-callout ios-font-regular', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
            Vista interactiva de {validation.totalRecords?.toLocaleString() || 0} registros del archivo {validation.fileName}
          </p>
        </div>
        <div className="p-6">
          <DataViewer
            file={mockFile}
            fileType={validation.fileType as CONSARFileType}
            maxHeight={800}
            rowHeight={40}
            enableExport={true}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  )
}

// Timeline Tab Component
function TimelineTab({ timeline, isDark }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={cn(
              'ios-heading-title2 ios-font-bold mb-1',
              isDark ? 'text-neutral-200' : 'text-neutral-800'
            )}
          >
            Timeline de Eventos
          </h2>
          <p
            className={cn(
              'ios-text-callout ios-font-regular',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            Historial cronológico del proceso de validación
          </p>
        </div>
      </div>

      <PremiumTimeline data={timeline} isDark={isDark} maxHeight="600px" />
    </div>
  )
}

// Audit Tab Component
function AuditTab({ auditLog, isDark }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={cn(
              'ios-heading-title2 ios-font-bold mb-1',
              isDark ? 'text-neutral-200' : 'text-neutral-800'
            )}
          >
            Audit Log
          </h2>
          <p
            className={cn(
              'ios-text-callout ios-font-regular',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            Registro completo de auditoría para cumplimiento CONSAR
          </p>
        </div>
      </div>

      <PremiumAuditTable data={auditLog} isDark={isDark} maxHeight="600px" />
    </div>
  )
}
