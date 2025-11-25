/**
 * Reports Page - Enterprise 2025 VisionOS
 *
 * Módulo de reportes con cumplimiento CONSAR 2025
 * - Generación de reportes de validación con trazabilidad
 * - Exportación en múltiples formatos (PDF, Excel, CSV)
 * - Auditoría completa y retención de 10 años
 * - Firmas digitales y no repudio
 *
 * @compliance CONSAR Circular 19-8, NOM-151-SCFI-2016
 * @version 2.0.0
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Filter,
  Calendar,
  FileDown,
  TrendingUp,
  BarChart3,
  Activity,
  Shield,
  Eye,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { PremiumButtonV2 } from '@/components/ui'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { LottieIcon } from '@/components/ui/LottieIcon'
import { getAnimation } from '@/lib/lottiePreloader'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Report, ReportType, ReportFormat } from '@/types'
import {
  ReportGeneratorModal,
  type ReportGeneratorFormData,
} from '@/components/reports/ReportGeneratorModal.visionos'

export function ReportsVisionOS() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const reportsAnimationData = getAnimation('reports')

  const [showGeneratorModal, setShowGeneratorModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)

  // ============================================================================
  // MOCK DATA - Enterprise Grade Reports
  // ============================================================================

  const statistics = {
    totalReports: 248,
    thisMonth: 45,
    completed: 231,
    processing: 3,
    failed: 14,
    averageTime: '2.4m',
  }

  const mockReports: Report[] = [
    {
      id: 'RPT_001',
      name: 'Reporte Mensual de Validaciones - Enero 2025',
      type: 'monthly',
      format: 'pdf',
      status: 'completed',
      createdBy: 'Ana García',
      createdAt: '2025-01-23T10:30:00Z',
      completedAt: '2025-01-23T10:32:45Z',
      downloadUrl: '/api/reports/RPT_001/download',
      filters: {
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        status: ['success', 'error', 'warning'],
      },
    },
    {
      id: 'RPT_002',
      name: 'Análisis de Errores Críticos - Q4 2024',
      type: 'custom',
      format: 'xlsx',
      status: 'completed',
      createdBy: 'Carlos Mendoza',
      createdAt: '2025-01-22T14:15:00Z',
      completedAt: '2025-01-22T14:18:23Z',
      downloadUrl: '/api/reports/RPT_002/download',
      filters: {
        dateFrom: '2024-10-01',
        dateTo: '2024-12-31',
        status: ['error'],
      },
    },
    {
      id: 'RPT_003',
      name: 'Reporte Semanal de Cumplimiento',
      type: 'weekly',
      format: 'pdf',
      status: 'processing',
      createdBy: 'Laura Sánchez',
      createdAt: '2025-01-23T15:45:00Z',
      filters: {
        dateFrom: '2025-01-20',
        dateTo: '2025-01-26',
      },
    },
    {
      id: 'RPT_004',
      name: 'Exportación Completa de Validaciones',
      type: 'custom',
      format: 'csv',
      status: 'completed',
      createdBy: 'Roberto Torres',
      createdAt: '2025-01-21T09:00:00Z',
      completedAt: '2025-01-21T09:05:12Z',
      downloadUrl: '/api/reports/RPT_004/download',
      filters: {
        dateFrom: '2025-01-01',
        dateTo: '2025-01-21',
      },
    },
    {
      id: 'RPT_005',
      name: 'Auditoría de Trazabilidad CONSAR',
      type: 'custom',
      format: 'pdf',
      status: 'failed',
      createdBy: 'Patricia Ramírez',
      createdAt: '2025-01-20T16:30:00Z',
      filters: {
        dateFrom: '2024-12-01',
        dateTo: '2025-01-20',
      },
    },
  ]

  // Filter reports by status
  const filteredReports = mockReports.filter((report) => {
    if (selectedStatus === 'all') return true
    return report.status === selectedStatus
  })

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleGenerateReport = () => {
    setShowGeneratorModal(true)
  }

  const handleSubmitReport = (data: ReportGeneratorFormData) => {
    setIsGenerating(true)
    console.log('Generating report with data:', data)

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      setShowGeneratorModal(false)
      // TODO: Implement actual API call and refresh reports list
    }, 3000)
  }

  const handleDeleteClick = (report: Report) => {
    setReportToDelete(report)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = (justification?: string) => {
    console.log('Deleting report:', reportToDelete?.id, 'Justification:', justification)
    // TODO: Implement API call with audit trail
    setShowDeleteModal(false)
    setReportToDelete(null)
  }

  const handleDownload = (report: Report) => {
    console.log('Downloading report:', report.id, report.format)
    // TODO: Implement download functionality
  }

  const handleRetry = (report: Report) => {
    console.log('Retrying report generation:', report.id)
    // TODO: Implement retry functionality
  }

  const handleViewDetails = (report: Report) => {
    console.log('Viewing report details:', report.id)
    // TODO: Navigate to report detail page
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getStatusConfig = (status: Report['status']) => {
    const configs = {
      completed: {
        icon: CheckCircle2,
        label: 'Completado',
        gradient: isDark
          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%)'
          : 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 163, 74, 0.12) 100%)',
        border: isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.3)',
        iconColor: 'text-green-500',
        textColor: isDark ? 'text-green-400' : 'text-green-700',
      },
      processing: {
        icon: Clock,
        label: 'Procesando',
        gradient: isDark
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)'
          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.12) 100%)',
        border: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
        iconColor: 'text-blue-500',
        textColor: isDark ? 'text-blue-400' : 'text-blue-700',
      },
      failed: {
        icon: XCircle,
        label: 'Fallido',
        gradient: isDark
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.12) 100%)',
        border: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)',
        iconColor: 'text-red-500',
        textColor: isDark ? 'text-red-400' : 'text-red-700',
      },
      pending: {
        icon: Clock,
        label: 'Pendiente',
        gradient: isDark
          ? 'linear-gradient(135deg, rgba(107, 114, 128, 0.2) 0%, rgba(75, 85, 99, 0.2) 100%)'
          : 'linear-gradient(135deg, rgba(107, 114, 128, 0.12) 0%, rgba(75, 85, 99, 0.12) 100%)',
        border: isDark ? 'rgba(107, 114, 128, 0.4)' : 'rgba(107, 114, 128, 0.3)',
        iconColor: 'text-gray-500',
        textColor: isDark ? 'text-gray-400' : 'text-gray-700',
      },
    }
    return configs[status] || configs.pending
  }

  const getFormatIcon = (format: ReportFormat) => {
    const icons = {
      pdf: FileText,
      xlsx: FileDown,
      csv: FileDown,
      json: FileDown,
    }
    return icons[format] || FileText
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* HEADER SECTION (Matching Validations/Catalogs structure) */}
      {/* ================================================================ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Lottie Icon */}
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
                  loop={true}
                  autoplay={true}
                  speed={1.0}
                  className="transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Title and Description */}
          <div>
            <h1
              className={cn(
                'ios-heading-title1 ios-text-glass-subtle lg:ios-heading-large',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}
              data-text="Reportes"
            >
              Reportes
            </h1>
            <p
              className={cn(
                'mt-1 ios-text-footnote ios-font-medium lg:ios-text-callout',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              Generación y gestión de reportes regulatorios CONSAR
            </p>
          </div>
        </div>

        {/* Action Button */}
        <PremiumButtonV2
          label="Generar Reporte"
          icon={Plus}
          size="lg"
          onClick={handleGenerateReport}
        />
      </div>

      {/* ================================================================ */}
      {/* STATS CARDS (Matching Validations/Catalogs grid layout) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total de Reportes',
            value: statistics.totalReports.toString(),
            icon: FileText,
            color: 'blue',
          },
          {
            label: 'Este Mes',
            value: statistics.thisMonth.toString(),
            icon: Calendar,
            color: 'purple',
          },
          {
            label: 'Completados',
            value: statistics.completed.toString(),
            icon: CheckCircle2,
            color: 'green',
          },
          {
            label: 'Tiempo Promedio',
            value: statistics.averageTime,
            icon: TrendingUp,
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
                  style={{
                    backdropFilter: 'blur(12px)',
                  }}
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

      {/* ================================================================ */}
      {/* FILTERS BAR */}
      {/* ================================================================ */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col xxs:flex-row flex-wrap items-start xxs:items-center gap-3">
            <Filter className={cn('h-5 w-5 flex-shrink-0', isDark ? 'text-neutral-400' : 'text-neutral-600')} />
            <div className="flex flex-wrap gap-2 w-full xxs:w-auto">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'completed', label: 'Completados' },
                { value: 'processing', label: 'En Proceso' },
                { value: 'failed', label: 'Fallidos' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={cn(
                    'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200',
                    'whitespace-nowrap shrink-0',
                    selectedStatus === filter.value
                      ? isDark
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-500 text-white'
                      : isDark
                      ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* REPORTS TABLE */}
      {/* ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Generados</CardTitle>
          <CardDescription>
            Historial completo de reportes con trazabilidad y auditoría
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
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
                <p className="ios-text-callout">
                  No se encontraron reportes con el filtro seleccionado
                </p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const statusConfig = getStatusConfig(report.status)
                const FormatIcon = getFormatIcon(report.format)
                const StatusIcon = statusConfig.icon

                return (
                  <div
                    key={report.id}
                    className={cn(
                      'p-4 rounded-[16px] border transition-all duration-300',
                      'hover:shadow-lg cursor-pointer',
                      isDark
                        ? 'bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800'
                        : 'bg-white border-neutral-200 hover:bg-neutral-50'
                    )}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
                      {/* Left: Report Info */}
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <div className="flex items-start gap-3">
                          {/* Format Icon */}
                          <div
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-[10px] flex-shrink-0',
                              'glass-ultra-clear depth-layer-2'
                            )}
                          >
                            <FormatIcon className="h-5 w-5 text-primary-500" />
                          </div>

                          {/* Report Details */}
                          <div className="flex-1 min-w-0">
                            <h3
                              className={cn(
                                'text-sm sm:text-base font-semibold truncate',
                                isDark ? 'text-neutral-100' : 'text-neutral-900'
                              )}
                            >
                              {report.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm">
                              <span
                                className={cn(
                                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                                )}
                              >
                                {report.createdBy}
                              </span>
                              <span
                                className={cn(
                                  isDark ? 'text-neutral-500' : 'text-neutral-500'
                                )}
                              >
                                •
                              </span>
                              <span
                                className={cn(
                                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                                )}
                              >
                                {formatDistanceToNow(new Date(report.createdAt), {
                                  addSuffix: true,
                                  locale: es,
                                })}
                              </span>
                              <span
                                className={cn(
                                  isDark ? 'text-neutral-500' : 'text-neutral-500'
                                )}
                              >
                                •
                              </span>
                              <span
                                className={cn(
                                  'uppercase font-semibold',
                                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                                )}
                              >
                                {report.format}
                              </span>
                            </div>

                            {/* Processing Time */}
                            {report.completedAt && (
                              <div className="mt-2 text-xs">
                                <span
                                  className={cn(
                                    isDark ? 'text-neutral-500' : 'text-neutral-500'
                                  )}
                                >
                                  Tiempo de generación:{' '}
                                  {(() => {
                                    const start = new Date(report.createdAt)
                                    const end = new Date(report.completedAt)
                                    const diff = Math.floor((end.getTime() - start.getTime()) / 1000)
                                    return diff < 60 ? `${diff}s` : `${Math.floor(diff / 60)}m ${diff % 60}s`
                                  })()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status and Actions */}
                      <div className="flex flex-col xxs:flex-row items-start xxs:items-center gap-3 w-full sm:w-auto">
                        {/* Status Badge */}
                        <div
                          className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-[10px]',
                            'glass-ultra-clear depth-layer-2 shrink-0'
                          )}
                          style={{
                            background: statusConfig.gradient,
                            border: `1px solid ${statusConfig.border}`,
                          }}
                        >
                          <StatusIcon className={cn('h-4 w-4', statusConfig.iconColor)} />
                          <span className={cn('text-xs sm:text-sm font-medium', statusConfig.textColor)}>
                            {statusConfig.label}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 flex-wrap">
                          {report.status === 'completed' && (
                            <button
                              onClick={() => handleDownload(report)}
                              className={cn(
                                'p-2 rounded-[10px] transition-all duration-200',
                                'hover:scale-110 glass-ultra-clear'
                              )}
                              title="Descargar"
                            >
                              <Download
                                className={cn(
                                  'h-4 w-4',
                                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                                )}
                              />
                            </button>
                          )}

                          {report.status === 'failed' && (
                            <button
                              onClick={() => handleRetry(report)}
                              className={cn(
                                'p-2 rounded-[10px] transition-all duration-200',
                                'hover:scale-110 glass-ultra-clear'
                              )}
                              title="Reintentar"
                            >
                              <RefreshCw
                                className={cn(
                                  'h-4 w-4',
                                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                                )}
                              />
                            </button>
                          )}

                          <button
                            onClick={() => handleViewDetails(report)}
                            className={cn(
                              'p-2 rounded-[10px] transition-all duration-200',
                              'hover:scale-110 glass-ultra-clear'
                            )}
                            title="Ver detalles"
                          >
                            <Eye
                              className={cn(
                                'h-4 w-4',
                                isDark ? 'text-neutral-400' : 'text-neutral-600'
                              )}
                            />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(report)}
                            className={cn(
                              'p-2 rounded-[10px] transition-all duration-200',
                              'hover:scale-110 glass-ultra-clear'
                            )}
                            title="Eliminar"
                          >
                            <Trash2
                              className={cn(
                                'h-4 w-4',
                                isDark ? 'text-red-400' : 'text-red-600'
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* ADDITIONAL INFO GRID */}
      {/* ================================================================ */}
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockReports.slice(0, 3).map((report) => {
                const statusConfig = getStatusConfig(report.status)
                return (
                  <div key={report.id} className="flex items-center gap-2">
                    <statusConfig.icon
                      className={cn('h-4 w-4 flex-shrink-0', statusConfig.iconColor)}
                    />
                    <span
                      className={cn(
                        'text-sm truncate',
                        isDark ? 'text-neutral-300' : 'text-neutral-700'
                      )}
                    >
                      {report.name.slice(0, 30)}...
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estadísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  Tasa de éxito
                </span>
                <span className={cn('text-sm font-bold text-green-500')}>
                  {((statistics.completed / statistics.totalReports) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  En proceso
                </span>
                <span className={cn('text-sm font-bold text-blue-500')}>
                  {statistics.processing}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  Fallidos
                </span>
                <span className={cn('text-sm font-bold text-red-500')}>{statistics.failed}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================================================================ */}
      {/* MODALS */}
      {/* ================================================================ */}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Eliminar Reporte"
        description={`¿Está seguro de eliminar el reporte "${reportToDelete?.name}"? Esta acción se registrará en el historial de auditoría según NOM-151-SCFI-2016.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        requireJustification={true}
        justificationLabel="Justificación (requerida por normatividad)"
        justificationPlaceholder="Por favor proporciona una razón detallada para eliminar este reporte. Esta información se registrará en el historial de auditoría y es requerida por las regulaciones de CONSAR."
        minJustificationLength={20}
        onConfirm={handleDeleteConfirm}
        isLoading={false}
      />

      {/* Report Generator Modal */}
      <ReportGeneratorModal
        isOpen={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
        onSubmit={handleSubmitReport}
        isGenerating={isGenerating}
      />
    </div>
  )
}
