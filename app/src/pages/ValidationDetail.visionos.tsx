/**
 * ValidationDetail Page - VisionOS Enterprise 2026 Edition
 *
 * Rediseño completo con estética premium inspirada en:
 * - VisionOS spatial computing
 * - Linear 2025 design system
 * - Raycast Pro interface
 * - Stripe Sigma analytics
 * - Vercel Dashboard profundidad
 * - Coinbase Institutional enterprise UI
 *
 * Características:
 * - Fondo atmosférico con gradiente volumétrico
 * - Glass blur con profundidad diferenciada (3 niveles)
 * - Tarjeta de archivo con corner-bloom y sombras VisionOS
 * - Tabs flotantes estilo Raycast/Linear
 * - Cards de métricas con volumen 3D
 * - Botón premium con gradiente multicapa
 * - Microinteracciones fluidas hover/active/focus
 * - Tipografía jerarquizada SF Pro Display/Inter
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
  User,
  Bell,
  Settings,
  Zap,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PremiumButtonV2 } from '@/components/ui'
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
 * Get status badge configuration - VisionOS Edition
 */
function getStatusBadge(status: ValidationStatus, isDark: boolean) {
  const configs = {
    success: {
      icon: CheckCircle2,
      label: 'Validado',
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.15) 100%)',
      border: 'rgba(16, 185, 129, 0.35)',
      glow: '0 0 20px rgba(16, 185, 129, 0.15), 0 0 40px rgba(16, 185, 129, 0.08)',
      text: '#6EE7B7',
      icon_color: '#10B981',
    },
    error: {
      icon: XCircle,
      label: 'Con Errores',
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(220, 38, 38, 0.15) 100%)',
      border: 'rgba(239, 68, 68, 0.35)',
      glow: '0 0 20px rgba(239, 68, 68, 0.15), 0 0 40px rgba(239, 68, 68, 0.08)',
      text: '#FCA5A5',
      icon_color: '#EF4444',
    },
    warning: {
      icon: AlertTriangle,
      label: 'Con Advertencias',
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.15) 100%)',
      border: 'rgba(245, 158, 11, 0.35)',
      glow: '0 0 20px rgba(245, 158, 11, 0.15), 0 0 40px rgba(245, 158, 11, 0.08)',
      text: '#FCD34D',
      icon_color: '#F59E0B',
    },
    processing: {
      icon: Clock,
      label: 'Procesando',
      bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(37, 99, 235, 0.15) 100%)',
      border: 'rgba(59, 130, 246, 0.35)',
      glow: '0 0 20px rgba(59, 130, 246, 0.15), 0 0 40px rgba(59, 130, 246, 0.08)',
      text: '#93C5FD',
      icon_color: '#3B82F6',
    },
    pending: {
      icon: Clock,
      label: 'Pendiente',
      bg: 'linear-gradient(135deg, rgba(107, 114, 128, 0.18) 0%, rgba(75, 85, 99, 0.15) 100%)',
      border: 'rgba(107, 114, 128, 0.35)',
      glow: '0 0 20px rgba(107, 114, 128, 0.15), 0 0 40px rgba(107, 114, 128, 0.08)',
      text: '#D1D5DB',
      icon_color: '#6B7280',
    },
  }
  return configs[status] || configs.pending
}

/**
 * Get severity badge configuration
 */
function getSeverityBadge(severity: ErrorSeverity) {
  const configs = {
    critical: { label: 'CRÍTICO', color: '#FCA5A5', bg: 'rgba(239, 68, 68, 0.15)', icon: '🔴' },
    high: { label: 'ALTO', color: '#FDBA74', bg: 'rgba(249, 115, 22, 0.15)', icon: '🟠' },
    medium: { label: 'MEDIO', color: '#FCD34D', bg: 'rgba(245, 158, 11, 0.15)', icon: '🟡' },
    low: { label: 'BAJO', color: '#93C5FD', bg: 'rgba(59, 130, 246, 0.15)', icon: '🔵' },
    info: { label: 'INFO', color: '#D1D5DB', bg: 'rgba(107, 114, 128, 0.15)', icon: '⚪' },
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

export function ValidationDetailVisionOS() {
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
          includeDetails: false,
          maxDetailRecords: 0,
        })
      } catch (error) {
        console.error('Error generating PDF:', error)
      }
    } else {
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
        <div className="animate-spin h-12 w-12 border-3 border-blue-500 border-t-transparent rounded-full" />
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
    <div
      className="min-h-screen"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #070B14 0%, #0C111C 50%, #0A0E18 100%)'
          : 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
      }}
    >
      {/* Atmospheric Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)'
            : 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.02) 0%, transparent 50%)',
          zIndex: 0,
        }}
      />

      {/* Main Content Container - Elevated Layer */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* Top Navigation Header - Glass Premium */}
        <div
          className="flex items-center justify-between rounded-[20px] px-6 py-4"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
            backdropFilter: 'blur(20px) saturate(150%)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: isDark
              ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05) inset'
              : '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.8) inset',
          }}
        >
          {/* Back Button - Capsule Style */}
          <button
            onClick={() => navigate('/validations')}
            className="group flex items-center gap-3 px-5 py-2.5 rounded-[14px] transition-all duration-300"
            style={{
              background: isDark
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(255, 255, 255, 0.5)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement
              target.style.transform = 'translateY(-1px)'
              target.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.8)'
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement
              target.style.transform = 'translateY(0)'
              target.style.background = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.5)'
            }}
          >
            <ArrowLeft className="h-4 w-4" style={{ color: isDark ? '#93C5FD' : '#3B82F6' }} />
            <span
              className="font-semibold text-[14px]"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                color: isDark ? '#E5E7EB' : '#1F2937',
              }}
            >
              Validaciones
            </span>
          </button>

          {/* User Actions - Capsule Group */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              className="relative p-3 rounded-[12px] transition-all duration-300"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.5)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement
                target.style.transform = 'translateY(-1px)'
                target.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.8)'
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement
                target.style.transform = 'translateY(0)'
                target.style.background = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.5)'
              }}
            >
              <Bell className="h-4 w-4" style={{ color: isDark ? '#93C5FD' : '#3B82F6' }} />
              {/* Notification Badge */}
              <div
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                }}
              />
            </button>

            {/* Settings */}
            <button
              className="p-3 rounded-[12px] transition-all duration-300"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.5)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement
                target.style.transform = 'translateY(-1px) rotate(45deg)'
                target.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.8)'
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement
                target.style.transform = 'translateY(0) rotate(0deg)'
                target.style.background = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.5)'
              }}
            >
              <Settings className="h-4 w-4" style={{ color: isDark ? '#93C5FD' : '#3B82F6' }} />
            </button>

            {/* User Avatar - Glowing Ring */}
            <button
              className="relative p-0.5 rounded-[14px] transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement
                target.style.transform = 'scale(1.05)'
                target.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.5)'
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement
                target.style.transform = 'scale(1)'
                target.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
                    : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
                }}
              >
                <User className="h-5 w-5" style={{ color: isDark ? '#93C5FD' : '#3B82F6' }} />
              </div>
            </button>
          </div>
        </div>

        {/* File Card - Hero Section with Corner Bloom */}
        <FileCardHero validation={validation} isDark={isDark} statusConfig={statusConfig} StatusIcon={StatusIcon} />

        {/* Action Buttons Section */}
        <ActionsSection
          validation={validation}
          isDark={isDark}
          isPDFGenerating={isPDFGenerating}
          handleDownloadReport={handleDownloadReport}
          handleRetry={handleRetry}
          retryMutation={retryMutation}
          setShowVersionModal={setShowVersionModal}
          createVersionMutation={createVersionMutation}
          setShowDeleteModal={setShowDeleteModal}
        />

        {/* Tabs - Floating Raycast Style */}
        <TabsFloating
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          validation={validation}
          versionChain={versionChain}
          isDark={isDark}
        />

        {/* Tab Content */}
        {activeTab === 'resumen' && (
          <ResumenTabVisionOS
            validation={validation}
            isDark={isDark}
            validatorsByGroup={validatorsByGroup}
            expandedValidators={expandedValidators}
            toggleValidator={toggleValidator}
          />
        )}

        {activeTab === 'errores' && (
          <ErroresTabVisionOS
            errors={validation.errors}
            isDark={isDark}
            expandedErrors={expandedErrors}
            toggleError={toggleError}
          />
        )}

        {activeTab === 'advertencias' && (
          <AdvertenciasTabVisionOS warnings={validation.warnings} isDark={isDark} />
        )}

        {activeTab === 'datos' && <DatosTabVisionOS validation={validation} isDark={isDark} />}

        {activeTab === 'timeline' && <TimelineTabVisionOS timeline={validation.timeline} isDark={isDark} />}

        {activeTab === 'audit' && <AuditTabVisionOS auditLog={validation.auditLog} isDark={isDark} />}

        {activeTab === 'versions' && (
          <VersionChain
            versions={versionChain}
            currentVersionId={id!}
            onVersionClick={handleVersionClick}
            isDark={isDark}
          />
        )}
      </div>

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

/**
 * File Card Hero - Premium File Information Card with Corner Bloom
 */
function FileCardHero({ validation, isDark, statusConfig, StatusIcon }: any) {
  return (
    <div
      className="relative rounded-[24px] overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.5) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
        backdropFilter: 'blur(24px) saturate(180%)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: isDark
          ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.08) inset, 0 -1px 0 rgba(0, 0, 0, 0.5) inset'
          : '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.9) inset',
      }}
    >
      {/* Corner Bloom - Top Left */}
      <div
        className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Corner Bloom - Bottom Right */}
      <div
        className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at bottom right, rgba(147, 51, 234, 0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-10 py-8">
        {/* File Icon + Name */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-5 flex-1">
            {/* File Icon - Floating Card */}
            <div
              className="p-4 rounded-[16px]"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.12) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)',
                border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)',
                boxShadow: isDark
                  ? '0 0 24px rgba(59, 130, 246, 0.2), 0 8px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 0 24px rgba(59, 130, 246, 0.15), 0 8px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
              }}
            >
              <FileText className="h-8 w-8" style={{ color: isDark ? '#93C5FD' : '#3B82F6' }} />
            </div>

            {/* File Metadata */}
            <div className="flex-1">
              {/* File Name - Large & Bold */}
              <h1
                className="font-semibold mb-3"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                  fontSize: '20px',
                  lineHeight: '28px',
                  color: isDark ? '#F8FAFF' : '#0F172A',
                  letterSpacing: '-0.02em',
                }}
              >
                {validation.fileName}
              </h1>

              {/* File Info Pills */}
              <div className="flex flex-wrap items-center gap-3">
                {/* File Type */}
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-[10px] font-semibold"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                    fontSize: '13px',
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(88, 86, 214, 0.18) 0%, rgba(67, 56, 202, 0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(88, 86, 214, 0.12) 0%, rgba(67, 56, 202, 0.08) 100%)',
                    color: isDark ? '#C4B5FD' : '#6366F1',
                    border: isDark ? '1px solid rgba(88, 86, 214, 0.3)' : '1px solid rgba(88, 86, 214, 0.2)',
                  }}
                >
                  {validation.fileType}
                </span>

                {/* Separator */}
                <span style={{ color: isDark ? '#4B5563' : '#9CA3AF', fontSize: '14px' }}>•</span>

                {/* File Size */}
                <span
                  className="font-medium"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                    fontSize: '14px',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                  }}
                >
                  {formatFileSize(validation.fileSize)}
                </span>

                {/* Separator */}
                <span style={{ color: isDark ? '#4B5563' : '#9CA3AF', fontSize: '14px' }}>•</span>

                {/* Upload Time */}
                <span
                  className="font-medium"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                    fontSize: '14px',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                  }}
                >
                  {formatDistanceToNow(new Date(validation.uploadedAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge - Glowing */}
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-[14px]"
            style={{
              background: statusConfig.bg,
              border: `1px solid ${statusConfig.border}`,
              boxShadow: statusConfig.glow,
              backdropFilter: 'blur(12px)',
            }}
          >
            <StatusIcon className="h-5 w-5" style={{ color: statusConfig.icon_color }} />
            <span
              className="font-bold"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                fontSize: '14px',
                color: statusConfig.text,
              }}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Actions Section - Premium Buttons
 */
function ActionsSection({
  validation,
  isDark,
  isPDFGenerating,
  handleDownloadReport,
  handleRetry,
  retryMutation,
  setShowVersionModal,
  createVersionMutation,
  setShowDeleteModal,
}: any) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Primary Action - Ultra Premium Button */}
      <button
        onClick={() => handleDownloadReport('pdf')}
        disabled={isPDFGenerating}
        className="group relative overflow-hidden rounded-[16px] px-6 py-3.5 transition-all duration-300"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)'
            : 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 50%, #F472B6 100%)',
          border: 'none',
          boxShadow: isDark
            ? '0 0 40px rgba(59, 130, 246, 0.4), 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            : '0 0 40px rgba(59, 130, 246, 0.3), 0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        }}
        onMouseEnter={(e) => {
          const target = e.currentTarget as HTMLElement
          target.style.transform = 'translateY(-2px)'
          target.style.boxShadow = isDark
            ? '0 0 50px rgba(59, 130, 246, 0.6), 0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
            : '0 0 50px rgba(59, 130, 246, 0.4), 0 12px 32px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.7)'
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget as HTMLElement
          target.style.transform = 'translateY(0)'
          target.style.boxShadow = isDark
            ? '0 0 40px rgba(59, 130, 246, 0.4), 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            : '0 0 40px rgba(59, 130, 246, 0.3), 0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
        }}
        onMouseDown={(e) => {
          const target = e.currentTarget as HTMLElement
          target.style.transform = 'translateY(0) scale(0.98)'
        }}
        onMouseUp={(e) => {
          const target = e.currentTarget as HTMLElement
          target.style.transform = 'translateY(-2px) scale(1)'
        }}
      >
        {/* Top Glow */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-2.5">
          {isPDFGenerating ? (
            <RefreshCw className="h-4 w-4 animate-spin" style={{ color: '#FFFFFF' }} />
          ) : (
            <Download className="h-4 w-4" style={{ color: '#FFFFFF' }} />
          )}
          <span
            className="font-bold"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
              fontSize: '15px',
              color: '#FFFFFF',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            {isPDFGenerating ? 'Generando PDF...' : 'Reporte Resumen'}
          </span>
        </div>
      </button>

      {/* Secondary Actions - Glass Buttons */}
      <div className="flex flex-wrap gap-3">
        {(validation.status === 'error' || validation.status === 'warning') && !validation.supersededAt && (
          <>
            <button
              onClick={handleRetry}
              disabled={retryMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] transition-all duration-300"
              style={{
                background: isDark
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(255, 255, 255, 0.7)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                backdropFilter: 'blur(12px)',
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement
                target.style.transform = 'translateY(-1px)'
                target.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement
                target.style.transform = 'translateY(0)'
                target.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.7)'
              }}
            >
              <RefreshCw
                className={cn('h-4 w-4', retryMutation.isPending && 'animate-spin')}
                style={{ color: isDark ? '#93C5FD' : '#3B82F6' }}
              />
              <span
                className="font-semibold"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  fontSize: '14px',
                  color: isDark ? '#E5E7EB' : '#1F2937',
                }}
              >
                Re-validar
              </span>
            </button>

            <button
              onClick={() => setShowVersionModal(true)}
              disabled={createVersionMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] transition-all duration-300"
              style={{
                background: isDark
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(255, 255, 255, 0.7)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                backdropFilter: 'blur(12px)',
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement
                target.style.transform = 'translateY(-1px)'
                target.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement
                target.style.transform = 'translateY(0)'
                target.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.7)'
              }}
            >
              <FileText className="h-4 w-4" style={{ color: isDark ? '#93C5FD' : '#3B82F6' }} />
              <span
                className="font-semibold"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  fontSize: '14px',
                  color: isDark ? '#E5E7EB' : '#1F2937',
                }}
              >
                Versión Corregida
              </span>
            </button>
          </>
        )}

        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] transition-all duration-300"
          style={{
            background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
            border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
            backdropFilter: 'blur(12px)',
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement
            target.style.transform = 'translateY(-1px)'
            target.style.background = isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.12)'
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement
            target.style.transform = 'translateY(0)'
            target.style.background = isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)'
          }}
        >
          <Trash2 className="h-4 w-4" style={{ color: isDark ? '#FCA5A5' : '#EF4444' }} />
          <span
            className="font-semibold"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
              fontSize: '14px',
              color: isDark ? '#FCA5A5' : '#DC2626',
            }}
          >
            Borrar
          </span>
        </button>
      </div>
    </div>
  )
}

/**
 * Tabs Floating - Raycast/Linear Style - Responsive Multi-Device
 */
function TabsFloating({ activeTab, setActiveTab, validation, versionChain, isDark }: any) {
  const tabs = [
    { id: 'resumen', label: 'Resumen', shortLabel: 'Resumen', icon: CheckCircle2 },
    { id: 'errores', label: `Errores (${validation.errorCount})`, shortLabel: `Err (${validation.errorCount})`, icon: XCircle },
    { id: 'advertencias', label: `Advertencias (${validation.warningCount})`, shortLabel: `Adv (${validation.warningCount})`, icon: AlertTriangle },
    { id: 'datos', label: 'Datos', shortLabel: 'Datos', icon: FileText },
    {
      id: 'versions',
      label: `Versiones (${versionChain.length})`,
      shortLabel: `Ver (${versionChain.length})`,
      icon: FileText,
      show: versionChain.length > 1,
    },
    { id: 'timeline', label: 'Timeline', shortLabel: 'Time', icon: Clock },
    { id: 'audit', label: 'Audit Log', shortLabel: 'Audit', icon: AlertCircle },
  ].filter((tab) => tab.show !== false)

  return (
    <div
      className={cn(
        // Responsive container
        "flex gap-1.5 xs:gap-2 sm:gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide",
        "px-1.5 py-1.5 xs:px-2 xs:py-2 sm:px-2 sm:py-2",
        "rounded-[14px] xs:rounded-[16px] sm:rounded-[18px]",
        // Full bleed en móvil
        "-mx-4 sm:mx-0"
      )}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.4) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.7) 100%)',
        backdropFilter: 'blur(16px) saturate(150%)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: isDark
          ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.3)'
          : 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 4px 12px rgba(0, 0, 0, 0.08)',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "inline-flex items-center justify-center",
              // Responsive gap
              "gap-1 xs:gap-1.5 sm:gap-2.5",
              // Responsive padding
              "px-2 py-1.5 xs:px-3 xs:py-2 sm:px-5 sm:py-2.5",
              // Responsive border-radius
              "rounded-lg xs:rounded-[10px] sm:rounded-[14px]",
              // Responsive text
              "font-semibold text-[10px] xs:text-xs sm:text-sm",
              "whitespace-nowrap shrink-0 snap-start transition-all duration-300"
            )}
            style={
              isActive
                ? {
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.2) 100%)'
                      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(37, 99, 235, 0.12) 100%)',
                    border: isDark ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)',
                    color: isDark ? '#93C5FD' : '#3B82F6',
                    boxShadow: isDark
                      ? '0 0 20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                      : '0 0 20px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                    transform: 'translateY(0)',
                  }
                : {
                    background: 'transparent',
                    border: '1px solid transparent',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                  }
            }
            onMouseEnter={(e) => {
              if (!isActive) {
                const target = e.currentTarget as HTMLElement
                target.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.6)'
                target.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                const target = e.currentTarget as HTMLElement
                target.style.background = 'transparent'
                target.style.transform = 'translateY(0)'
              }
            }}
          >
            <Icon
              className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4"
              style={{
                color: isActive ? (isDark ? '#93C5FD' : '#3B82F6') : isDark ? '#6B7280' : '#9CA3AF',
              }}
            />
            {/* Responsive labels - short en móvil, completo en desktop */}
            <span className="sm:hidden">{tab.shortLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Resumen Tab - VisionOS Edition
 */
function ResumenTabVisionOS({ validation, isDark, validatorsByGroup, expandedValidators, toggleValidator }: any) {
  return (
    <div className="space-y-8">
      {/* Stats Cards - With Depth */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total Registros',
            value: validation.recordCount.toLocaleString(),
            icon: FileText,
            color: { start: '#3B82F6', end: '#2563EB', glow: 'rgba(59, 130, 246, 0.3)' },
          },
          {
            label: 'Validados OK',
            value: `${validation.validRecordCount.toLocaleString()}`,
            percentage: Math.round((validation.validRecordCount / validation.recordCount) * 100),
            icon: CheckCircle2,
            color: { start: '#10B981', end: '#059669', glow: 'rgba(16, 185, 129, 0.3)' },
          },
          {
            label: 'Errores',
            value: validation.errorCount.toLocaleString(),
            icon: XCircle,
            color: { start: '#EF4444', end: '#DC2626', glow: 'rgba(239, 68, 68, 0.3)' },
          },
          {
            label: 'Advertencias',
            value: validation.warningCount.toLocaleString(),
            icon: AlertTriangle,
            color: { start: '#F59E0B', end: '#D97706', glow: 'rgba(245, 158, 11, 0.3)' },
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="relative rounded-[20px] p-6 transition-all duration-300"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
                backdropFilter: 'blur(20px) saturate(160%)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: isDark
                  ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                  : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement
                target.style.transform = 'translateY(-2px)'
                target.style.boxShadow = isDark
                  ? `0 12px 32px rgba(0, 0, 0, 0.5), 0 0 24px ${stat.color.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.12)`
                  : `0 12px 32px rgba(0, 0, 0, 0.12), 0 0 24px ${stat.color.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.9)`
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement
                target.style.transform = 'translateY(0)'
                target.style.boxShadow = isDark
                  ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                  : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}
            >
              {/* Icon - Floating Mini Card */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="p-3 rounded-[14px]"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color.start}15 0%, ${stat.color.end}12 100%)`,
                    border: `1px solid ${stat.color.start}30`,
                    boxShadow: `0 0 16px ${stat.color.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                  }}
                >
                  <Icon className="h-6 w-6" style={{ color: stat.color.start }} />
                </div>
              </div>

              {/* Label */}
              <p
                className="font-medium mb-2"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  fontSize: '13px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  letterSpacing: '0.01em',
                }}
              >
                {stat.label}
              </p>

              {/* Value */}
              <div className="flex items-baseline gap-2">
                <p
                  className="font-bold"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                    fontSize: '28px',
                    lineHeight: '32px',
                    color: isDark ? '#F8FAFF' : '#0F172A',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {stat.value}
                </p>
                {stat.percentage !== undefined && (
                  <span
                    className="font-semibold"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                      fontSize: '16px',
                      color: isDark ? '#6EE7B7' : '#059669',
                    }}
                  >
                    {stat.percentage}%
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Validators Section - Will be implemented next */}
      <div
        className="rounded-[20px] p-8"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(20px) saturate(160%)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        }}
      >
        <h3
          className="font-bold mb-2"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
            fontSize: '18px',
            color: isDark ? '#F8FAFF' : '#0F172A',
          }}
        >
          Validadores Ejecutados ({validation.validators.length}/37)
        </h3>
        <p
          className="mb-6"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
            fontSize: '14px',
            color: isDark ? '#9CA3AF' : '#6B7280',
          }}
        >
          Agrupados por categoría según especificaciones CONSAR
        </p>

        <div className="space-y-6">
          {Array.from(validatorsByGroup.entries()).map(([group, validators]) => (
            <div key={group}>
              <h4
                className="font-bold uppercase tracking-wide mb-3"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  fontSize: '12px',
                  color: isDark ? '#6B7280' : '#9CA3AF',
                  letterSpacing: '0.05em',
                }}
              >
                {group}
              </h4>
              <div className="space-y-2">
                {validators.map((validator: ValidatorResult) => {
                  const isExpanded = expandedValidators.has(validator.code)
                  const isPassed = validator.status === 'passed'

                  return (
                    <div
                      key={validator.code}
                      className="rounded-[14px] p-4 transition-all duration-300"
                      style={{
                        background: isDark ? 'rgba(45, 55, 72, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <button
                        onClick={() => toggleValidator(validator.code)}
                        className="w-full flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {isPassed ? (
                            <CheckCircle2 className="h-5 w-5" style={{ color: '#10B981' }} />
                          ) : (
                            <XCircle className="h-5 w-5" style={{ color: '#EF4444' }} />
                          )}
                          <span
                            className="font-semibold text-left"
                            style={{
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                              fontSize: '14px',
                              color: isDark ? '#E5E7EB' : '#1F2937',
                            }}
                          >
                            {validator.code} - {validator.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className="font-medium"
                            style={{
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                              fontSize: '13px',
                              color: isDark ? '#9CA3AF' : '#6B7280',
                            }}
                          >
                            {isPassed ? 'Passed' : `${validator.errorCount} errores`} • {validator.duration}ms
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }} />
                          ) : (
                            <ChevronRight className="h-5 w-5" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }} />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div
                          className="mt-4 pt-4 space-y-2"
                          style={{
                            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          <p style={{ fontSize: '13px', color: isDark ? '#D1D5DB' : '#4B5563' }}>
                            <span className="font-semibold">Código:</span> {validator.code}
                          </p>
                          <p style={{ fontSize: '13px', color: isDark ? '#D1D5DB' : '#4B5563' }}>
                            <span className="font-semibold">Grupo:</span> {validator.group}
                          </p>
                          <p style={{ fontSize: '13px', color: isDark ? '#D1D5DB' : '#4B5563' }}>
                            <span className="font-semibold">Duración:</span> {validator.duration}ms
                          </p>
                          <p style={{ fontSize: '13px', color: isDark ? '#D1D5DB' : '#4B5563' }}>
                            <span className="font-semibold">Errores:</span> {validator.errorCount}
                          </p>
                          <p style={{ fontSize: '13px', color: isDark ? '#D1D5DB' : '#4B5563' }}>
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
  )
}

/**
 * Errores Tab - VisionOS Edition
 */
function ErroresTabVisionOS({ errors, isDark, expandedErrors, toggleError }: any) {
  if (!errors || errors.length === 0) {
    return (
      <div
        className="rounded-[20px] p-16 text-center"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(20px) saturate(160%)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        }}
      >
        {/* Success Icon with Glow */}
        <div
          className="inline-flex p-6 rounded-[20px] mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.12) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 0 32px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          <CheckCircle2 className="h-16 w-16" style={{ color: '#10B981' }} />
        </div>

        <h3
          className="font-bold mb-3"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
            fontSize: '20px',
            color: isDark ? '#F8FAFF' : '#0F172A',
          }}
        >
          No hay errores
        </h3>
        <p
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
            fontSize: '14px',
            color: isDark ? '#9CA3AF' : '#6B7280',
          }}
        >
          La validación se completó exitosamente sin errores críticos
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between">
        <h2
          className="font-bold"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
            fontSize: '20px',
            color: isDark ? '#F8FAFF' : '#0F172A',
          }}
        >
          Errores Críticos ({errors.length})
        </h2>

        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] transition-all duration-300"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.7)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(12px)',
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement
            target.style.transform = 'translateY(-1px)'
            target.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement
            target.style.transform = 'translateY(0)'
            target.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.7)'
          }}
        >
          <Download className="h-4 w-4" style={{ color: isDark ? '#93C5FD' : '#3B82F6' }} />
          <span
            className="font-semibold"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
              fontSize: '14px',
              color: isDark ? '#E5E7EB' : '#1F2937',
            }}
          >
            Exportar Errores
          </span>
        </button>
      </div>

      {/* Error Cards */}
      {errors.map((error: ValidationError) => {
        const isExpanded = expandedErrors.has(error.id)
        const severityConfig = getSeverityBadge(error.severity)

        return (
          <div
            key={error.id}
            className="rounded-[18px] overflow-hidden transition-all duration-300"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
              backdropFilter: 'blur(20px) saturate(160%)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
              boxShadow: isDark
                ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            }}
          >
            <button
              onClick={() => toggleError(error.id)}
              className="w-full p-6 text-left"
              style={{ cursor: 'pointer' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Severity Icon */}
                  <span className="text-3xl mt-1">{severityConfig.icon}</span>

                  <div className="flex-1">
                    {/* Validator Name + Severity Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="font-bold"
                        style={{
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                          fontSize: '15px',
                          color: isDark ? '#F8FAFF' : '#0F172A',
                        }}
                      >
                        {error.validatorCode} - {error.validatorName}
                      </span>
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-[8px] font-bold"
                        style={{
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                          fontSize: '11px',
                          background: severityConfig.bg,
                          color: severityConfig.color,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {severityConfig.label}
                      </span>
                    </div>

                    {/* Error Message */}
                    <p
                      className="font-semibold"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                        fontSize: '14px',
                        color: isDark ? '#D1D5DB' : '#4B5563',
                        lineHeight: '20px',
                      }}
                    >
                      {error.message}
                    </p>
                  </div>
                </div>

                {/* Expand Icon */}
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }} />
                ) : (
                  <ChevronRight className="h-5 w-5 flex-shrink-0" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }} />
                )}
              </div>
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-6 pb-6 pl-[76px] space-y-5">
                {/* Error Details Card */}
                <div
                  className="p-5 rounded-[14px]"
                  style={{
                    background: isDark ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.6)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p
                        className="font-semibold mb-1.5"
                        style={{
                          fontSize: '12px',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        📍 Ubicación
                      </p>
                      <p style={{ fontSize: '14px', color: isDark ? '#E5E7EB' : '#1F2937' }}>
                        Línea {error.line}, Columna {error.column}
                      </p>
                    </div>

                    <div>
                      <p
                        className="font-semibold mb-1.5"
                        style={{
                          fontSize: '12px',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Campo
                      </p>
                      <p
                        className="font-mono"
                        style={{ fontSize: '13px', color: isDark ? '#93C5FD' : '#3B82F6' }}
                      >
                        {error.field}
                      </p>
                    </div>

                    <div>
                      <p
                        className="font-semibold mb-1.5"
                        style={{
                          fontSize: '12px',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        ❌ Valor encontrado
                      </p>
                      <p
                        className="font-mono"
                        style={{ fontSize: '13px', color: '#EF4444' }}
                      >
                        "{error.value}"
                      </p>
                    </div>

                    {error.expectedValue && (
                      <div>
                        <p
                          className="font-semibold mb-1.5"
                          style={{
                            fontSize: '12px',
                            color: isDark ? '#9CA3AF' : '#6B7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          ✓ Valor esperado
                        </p>
                        <p
                          className="font-mono"
                          style={{ fontSize: '13px', color: '#10B981' }}
                        >
                          {error.expectedValue}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {error.description && (
                  <div>
                    <p
                      className="font-semibold mb-2"
                      style={{
                        fontSize: '13px',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                      }}
                    >
                      📝 Descripción
                    </p>
                    <p style={{ fontSize: '14px', color: isDark ? '#D1D5DB' : '#4B5563', lineHeight: '20px' }}>
                      {error.description}
                    </p>
                  </div>
                )}

                {/* Suggestion */}
                {error.suggestion && (
                  <div>
                    <p
                      className="font-semibold mb-2"
                      style={{
                        fontSize: '13px',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                      }}
                    >
                      💡 Sugerencia
                    </p>
                    <p style={{ fontSize: '14px', color: isDark ? '#D1D5DB' : '#4B5563', lineHeight: '20px' }}>
                      {error.suggestion}
                    </p>
                  </div>
                )}

                {/* Reference */}
                {error.reference && (
                  <div>
                    <p
                      className="font-semibold mb-2"
                      style={{
                        fontSize: '13px',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                      }}
                    >
                      📖 Referencia
                    </p>
                    <p style={{ fontSize: '14px', color: '#3B82F6' }}>{error.reference}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-[12px] transition-all duration-300"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.7)',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLElement
                      target.style.transform = 'translateY(-1px)'
                      target.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLElement
                      target.style.transform = 'translateY(0)'
                      target.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#E5E7EB' : '#1F2937' }}>
                      Ver registro completo
                    </span>
                  </button>

                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-[12px] transition-all duration-300"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.7)',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLElement
                      target.style.transform = 'translateY(-1px)'
                      target.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLElement
                      target.style.transform = 'translateY(0)'
                      target.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#E5E7EB' : '#1F2937' }}>
                      Ver en contexto
                    </span>
                  </button>

                  {error.reference && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-[12px] transition-all duration-300"
                      style={{
                        background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                        border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)',
                      }}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLElement
                        target.style.transform = 'translateY(-1px)'
                        target.style.background = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)'
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLElement
                        target.style.transform = 'translateY(0)'
                        target.style.background = isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)'
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" style={{ color: '#3B82F6' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#3B82F6' }}>
                        Ver circular CONSAR
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Advertencias Tab - VisionOS Edition
 */
function AdvertenciasTabVisionOS({ warnings, isDark }: any) {
  if (!warnings || warnings.length === 0) {
    return (
      <div
        className="rounded-[20px] p-16 text-center"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(20px) saturate(160%)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        }}
      >
        <div
          className="inline-flex p-6 rounded-[20px] mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.12) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 0 32px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          <CheckCircle2 className="h-16 w-16" style={{ color: '#10B981' }} />
        </div>

        <h3
          className="font-bold mb-3"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
            fontSize: '20px',
            color: isDark ? '#F8FAFF' : '#0F172A',
          }}
        >
          No hay advertencias
        </h3>
        <p
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
            fontSize: '14px',
            color: isDark ? '#9CA3AF' : '#6B7280',
          }}
        >
          Todas las validaciones pasaron sin advertencias
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2
        className="font-bold mb-5"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
          fontSize: '20px',
          color: isDark ? '#F8FAFF' : '#0F172A',
        }}
      >
        Advertencias ({warnings.length})
      </h2>

      {warnings.map((warning: any) => (
        <div
          key={warning.id}
          className="p-5 rounded-[16px] transition-all duration-300"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
            backdropFilter: 'blur(20px) saturate(160%)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
            boxShadow: isDark
              ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
              : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement
            target.style.transform = 'translateY(-1px)'
            target.style.boxShadow = isDark
              ? '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 158, 11, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
              : '0 12px 32px rgba(0, 0, 0, 0.12), 0 0 20px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement
            target.style.transform = 'translateY(0)'
            target.style.boxShadow = isDark
              ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
              : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="p-2.5 rounded-[12px] flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.12) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                boxShadow: '0 0 16px rgba(245, 158, 11, 0.2)',
              }}
            >
              <AlertTriangle className="h-5 w-5" style={{ color: '#F59E0B' }} />
            </div>

            <div className="flex-1">
              <p
                className="font-semibold mb-2"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  fontSize: '14px',
                  color: isDark ? '#F8FAFF' : '#0F172A',
                }}
              >
                {warning.validatorCode} - {warning.message}
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                }}
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

/**
 * Datos Tab - VisionOS Edition with DataViewer Integration (Premium Refined)
 */
function DatosTabVisionOS({ validation, isDark }: any) {
  const [mockFile, setMockFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedFile | null>(null)

  // Create mock File object from validation data
  useMemo(() => {
    // Generate mock CONSAR file content (77 characters per line)
    const generateMockFileContent = (fileType: string) => {
      const lines: string[] = []
      const numRecords = Math.min(validation.totalRecords || 100, 1000)

      if (fileType === 'NOMINA') {
        const header = '01NOMINA  ABC12345678920250122001101                                    '
        lines.push(header)

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

        const totalAmount = String(numRecords * 500000).padStart(12, '0')
        const footer = `03${String(numRecords).padStart(8, '0')}${totalAmount}                                                       `
        lines.push(footer.substring(0, 77))
      } else {
        // Other file types implementation
        const header = '01CONTABLEABC12345678920250122202501                                '
        lines.push(header)

        for (let i = 0; i < numRecords; i++) {
          const line = `02${String(1000 + i).padStart(4, '0')}${'0000'}20250122${String(i * 10000).padStart(12, '0')}${String(i * 5000).padStart(12, '0')}REF${String(i).padStart(16, '0')}`.padEnd(77, ' ')
          lines.push(line)
        }

        const footer = `03${String(numRecords).padStart(8, '0')}${'000000000000000'}                                     `
        lines.push(footer)
      }

      return lines.join('\n')
    }

    const fileType = validation.fileType || 'NOMINA'
    const content = generateMockFileContent(fileType)
    const blob = new Blob([content], { type: 'text/plain' })
    const rfc = 'ABC123456789'
    const date = new Date().toISOString().substring(0, 10).replace(/-/g, '')
    const mockFileName = `${fileType}_${rfc}_${date}_0001.txt`

    const file = new File([blob], mockFileName, { type: 'text/plain' })
    setMockFile(file)
  }, [validation])

  const handleExport = async (format: 'csv' | 'excel') => {
    if (!parsedData) return

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
        className="rounded-[20px] p-12 text-center"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(20px) saturate(160%)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        }}
      >
        <Clock className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: isDark ? '#93C5FD' : '#3B82F6' }} />
        <p style={{ fontSize: '14px', color: isDark ? '#9CA3AF' : '#6B7280' }}>Preparando datos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Premium Header Card */}
      <div
        className="rounded-[18px] p-6"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(20px) saturate(160%)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Icon Floating Card */}
            <div
              className="p-3 rounded-[14px]"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.12) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)',
                border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)',
                boxShadow: isDark
                  ? '0 0 20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 0 20px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
              }}
            >
              <FileText className="h-6 w-6" style={{ color: isDark ? '#93C5FD' : '#3B82F6' }} />
            </div>

            {/* Title & Description */}
            <div>
              <h3
                className="font-bold mb-1"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                  fontSize: '18px',
                  color: isDark ? '#F8FAFF' : '#0F172A',
                }}
              >
                Visor de Datos Tabular
              </h3>
              <div className="flex items-center gap-2">
                <p
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                    fontSize: '14px',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                  }}
                >
                  {validation.totalRecords?.toLocaleString() || 0} registros
                </p>
                <span style={{ color: isDark ? '#4B5563' : '#9CA3AF', fontSize: '14px' }}>•</span>
                <p
                  className="font-mono"
                  style={{
                    fontSize: '13px',
                    color: isDark ? '#93C5FD' : '#3B82F6',
                  }}
                >
                  {validation.fileName}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Pills */}
          <div className="flex items-center gap-2">
            {/* Valid Records */}
            <div
              className="px-3 py-1.5 rounded-[10px]"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.12) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#10B981' }} />
                <span
                  className="font-semibold"
                  style={{
                    fontSize: '12px',
                    color: isDark ? '#6EE7B7' : '#059669',
                  }}
                >
                  {validation.validRecordCount?.toLocaleString() || 0} OK
                </span>
              </div>
            </div>

            {/* Errors */}
            {validation.errorCount > 0 && (
              <div
                className="px-3 py-1.5 rounded-[10px]"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.12) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5" style={{ color: '#EF4444' }} />
                  <span
                    className="font-semibold"
                    style={{
                      fontSize: '12px',
                      color: isDark ? '#FCA5A5' : '#DC2626',
                    }}
                  >
                    {validation.errorCount.toLocaleString()} Errores
                  </span>
                </div>
              </div>
            )}

            {/* Warnings */}
            {validation.warningCount > 0 && (
              <div
                className="px-3 py-1.5 rounded-[10px]"
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.12) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" style={{ color: '#F59E0B' }} />
                  <span
                    className="font-semibold"
                    style={{
                      fontSize: '12px',
                      color: isDark ? '#FCD34D' : '#D97706',
                    }}
                  >
                    {validation.warningCount.toLocaleString()} Advertencias
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center gap-4 pt-4" style={{ borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
              }}
            />
            <span style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Tipo: <span className="font-semibold" style={{ color: isDark ? '#E5E7EB' : '#1F2937' }}>{validation.fileType}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
              }}
            />
            <span style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Tamaño: <span className="font-semibold" style={{ color: isDark ? '#E5E7EB' : '#1F2937' }}>{formatFileSize(validation.fileSize)}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)',
              }}
            />
            <span style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Subido: <span className="font-semibold" style={{ color: isDark ? '#E5E7EB' : '#1F2937' }}>
                {formatDistanceToNow(new Date(validation.uploadedAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* DataViewer Container - Premium Wrapped */}
      <div
        className="rounded-[20px] overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(20px) saturate(160%)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        }}
      >
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

/**
 * Timeline Tab - VisionOS Edition
 */
function TimelineTabVisionOS({ timeline, isDark }: any) {
  return (
    <div
      className="rounded-[20px] p-8"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
        backdropFilter: 'blur(20px) saturate(160%)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
        boxShadow: isDark
          ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
          : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      }}
    >
      <h3
        className="font-bold mb-2"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
          fontSize: '18px',
          color: isDark ? '#F8FAFF' : '#0F172A',
        }}
      >
        Timeline de Eventos
      </h3>
      <p
        className="mb-8"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
          fontSize: '14px',
          color: isDark ? '#9CA3AF' : '#6B7280',
        }}
      >
        Historial cronológico del proceso de validación
      </p>

      <div className="space-y-6">
        {timeline.map((event: TimelineEvent, index: number) => (
          <div key={event.id} className="flex gap-5">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div
                className="flex h-10 w-10 items-center justify-center rounded-[12px]"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.25)',
                }}
              >
                <Clock className="h-5 w-5" style={{ color: '#3B82F6' }} />
              </div>

              {/* Connector Line */}
              {index < timeline.length - 1 && (
                <div
                  className="w-0.5 flex-1 mt-3"
                  style={{
                    background: isDark
                      ? 'linear-gradient(180deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%)'
                      : 'linear-gradient(180deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)',
                    minHeight: '32px',
                  }}
                />
              )}
            </div>

            {/* Event Content */}
            <div className="flex-1 pb-8">
              <p
                className="font-semibold mb-1.5"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  fontSize: '14px',
                  color: isDark ? '#F8FAFF' : '#0F172A',
                }}
              >
                {event.message}
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                }}
              >
                {formatDistanceToNow(new Date(event.timestamp), {
                  addSuffix: true,
                  locale: es,
                })}
                {event.user && ` • ${event.user}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Audit Tab - VisionOS Edition
 */
function AuditTabVisionOS({ auditLog, isDark }: any) {
  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
        backdropFilter: 'blur(20px) saturate(160%)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
        boxShadow: isDark
          ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
          : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      }}
    >
      {/* Header */}
      <div className="px-8 py-6" style={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)' }}>
        <h3
          className="font-bold mb-2"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
            fontSize: '18px',
            color: isDark ? '#F8FAFF' : '#0F172A',
          }}
        >
          Audit Log
        </h3>
        <p
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
            fontSize: '14px',
            color: isDark ? '#9CA3AF' : '#6B7280',
          }}
        >
          Registro completo de auditoría para cumplimiento CONSAR
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              style={{
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                background: isDark ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <th
                className="text-left p-4 font-bold"
                style={{
                  fontSize: '12px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Timestamp
              </th>
              <th
                className="text-left p-4 font-bold"
                style={{
                  fontSize: '12px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Usuario
              </th>
              <th
                className="text-left p-4 font-bold"
                style={{
                  fontSize: '12px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Acción
              </th>
              <th
                className="text-left p-4 font-bold"
                style={{
                  fontSize: '12px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Recurso
              </th>
              <th
                className="text-left p-4 font-bold"
                style={{
                  fontSize: '12px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Detalles
              </th>
              <th
                className="text-left p-4 font-bold"
                style={{
                  fontSize: '12px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                IP
              </th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map((entry: AuditLogEntry) => (
              <tr
                key={entry.id}
                className="transition-colors duration-200"
                style={{
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement
                  target.style.background = isDark ? 'rgba(45, 55, 72, 0.4)' : 'rgba(255, 255, 255, 0.7)'
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement
                  target.style.background = 'transparent'
                }}
              >
                <td className="p-4" style={{ fontSize: '13px', color: isDark ? '#D1D5DB' : '#4B5563' }}>
                  {new Date(entry.timestamp).toLocaleString('es-MX')}
                </td>
                <td className="p-4 font-medium" style={{ fontSize: '13px', color: isDark ? '#E5E7EB' : '#1F2937' }}>
                  {entry.user}
                </td>
                <td className="p-4">
                  <code
                    className="px-2.5 py-1 rounded-[8px] font-mono"
                    style={{
                      fontSize: '12px',
                      background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                      color: isDark ? '#93C5FD' : '#3B82F6',
                    }}
                  >
                    {entry.action}
                  </code>
                </td>
                <td className="p-4" style={{ fontSize: '13px', color: isDark ? '#D1D5DB' : '#4B5563' }}>
                  {entry.resource}
                </td>
                <td className="p-4" style={{ fontSize: '13px', color: isDark ? '#D1D5DB' : '#4B5563' }}>
                  {entry.details}
                </td>
                <td className="p-4 font-mono" style={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  {entry.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
