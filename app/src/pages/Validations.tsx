/**
 * Validations Page
 *
 * Main page for managing CONSAR file validations
 * Features: upload, view, filter, and manage validations
 */

import { useState } from 'react'
import { FileCheck, Clock, CheckCircle2, XCircle, Upload } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PremiumButtonV2 } from '@/components/ui'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalBody,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from '@/components/ui/responsive-modal'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { LottieIcon } from '@/components/ui/LottieIcon'
import { getAnimation } from '@/lib/lottiePreloader'
import { FileUpload } from '@/components/validations/FileUpload'
import { ValidationTable } from '@/components/validations/ValidationTable'
import {
  useValidations,
  useValidationStatistics,
  useRetryValidation,
  useDeleteValidation,
  useDownloadReport,
} from '@/hooks/useValidations'
import type { Validation } from '@/types'
import { useNavigate } from 'react-router-dom'
import { ValidationsSkeleton } from '@/components/ui/skeleton'

export function Validations() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const validationsAnimationData = getAnimation('validations')
  const navigate = useNavigate()

  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [validationToDelete, setValidationToDelete] = useState<Validation | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Fetch validations
  const { data: validationsData, isLoading: isLoadingValidations } = useValidations({
    page: currentPage,
    pageSize,
  })

  // Fetch statistics
  const { data: statisticsData } = useValidationStatistics()

  // Mutations
  const retryMutation = useRetryValidation()
  const deleteMutation = useDeleteValidation()
  const downloadMutation = useDownloadReport()

  const validations = validationsData?.data || []
  const statistics = statisticsData?.data || {
    total: 0,
    processing: 0,
    success: 0,
    error: 0,
    warning: 0,
    pending: 0,
  }

  const handleViewDetails = (validation: Validation) => {
    navigate(`/validations/${validation.id}`)
  }

  const handleRetry = async (validation: Validation) => {
    try {
      await retryMutation.mutateAsync(validation.id)
    } catch (error) {
      console.error('Error retrying validation:', error)
    }
  }

  const handleDownload = async (validation: Validation) => {
    try {
      await downloadMutation.mutateAsync({ id: validation.id, format: 'pdf' })
    } catch (error) {
      console.error('Error downloading report:', error)
    }
  }

  const handleDeleteClick = (validation: Validation) => {
    setValidationToDelete(validation)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async (justification?: string) => {
    if (!validationToDelete) return

    try {
      await deleteMutation.mutateAsync({
        id: validationToDelete.id,
        justification
      })
      setShowDeleteModal(false)
      setValidationToDelete(null)
    } catch (error) {
      console.error('Error deleting validation:', error)
    }
  }

  const handleUploadComplete = () => {
    setShowUploadDialog(false)
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
  }

  // Show skeleton on initial load
  if (isLoadingValidations && validations.length === 0) {
    return <ValidationsSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {validationsAnimationData && (
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
                    #0066FF 0%,
                    #5856D6 35%,
                    #7C3AED 65%,
                    #AF52DE 100%
                  )
                `,
                backgroundSize: '300% 300%',
                animation: 'mesh-flow 8s ease-in-out infinite',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                boxShadow: `
                  0 0 40px rgba(88, 86, 214, 0.4),
                  0 8px 32px rgba(0, 102, 255, 0.3),
                  0 4px 16px rgba(124, 58, 237, 0.25),
                  inset 0 0 40px rgba(255, 255, 255, 0.2),
                  inset 0 2px 0 rgba(255, 255, 255, 0.5)
                `,
              }}
            >
              <div className="w-8 h-8">
                <LottieIcon
                  animationData={validationsAnimationData}
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
                // iOS 2025 Typography - Title 1 (28px) → Large Title (34px)
                'ios-heading-title1 ios-text-glass-subtle lg:ios-heading-large',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}
              data-text="Validaciones"
            >
              Validaciones
            </h1>
            <p
              className={cn(
                // iOS 2025 Typography - Footnote (15px) → Callout (16px)
                'mt-1 ios-text-footnote ios-font-medium lg:ios-text-callout',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              Gestión de validaciones de archivos CONSAR
            </p>
          </div>
        </div>
        <PremiumButtonV2
          label="Subir Archivo"
          icon={Upload}
          size="lg"
          onClick={() => setShowUploadDialog(true)}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total',
            value: statistics.total.toString(),
            icon: FileCheck,
            color: 'blue',
          },
          {
            label: 'Procesando',
            value: statistics.processing.toString(),
            icon: Clock,
            color: 'yellow',
          },
          {
            label: 'Exitosas',
            value: statistics.success.toString(),
            icon: CheckCircle2,
            color: 'green',
          },
          {
            label: 'Con errores',
            value: statistics.error.toString(),
            icon: XCircle,
            color: 'red',
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
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
                    'flex h-12 w-12 items-center justify-center rounded-[16px]',
                    'glass-ultra-clear depth-layer-2 fresnel-edge'
                  )}
                  style={{
                    background: isDark
                      ? 'rgba(45, 45, 55, 0.5)'
                      : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                >
                  <stat.icon
                    className={cn(
                      'h-6 w-6',
                      stat.color === 'blue' && (isDark ? 'text-blue-400' : 'text-blue-600'),
                      stat.color === 'yellow' && (isDark ? 'text-yellow-400' : 'text-yellow-600'),
                      stat.color === 'green' && (isDark ? 'text-green-400' : 'text-green-600'),
                      stat.color === 'red' && (isDark ? 'text-red-400' : 'text-red-600')
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Dialog - ResponsiveModal */}
      <ResponsiveModal open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <ResponsiveModalContent size="lg">
          <ResponsiveModalHeader>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center',
                  'glass-ultra-premium'
                )}
                style={{
                  background: `linear-gradient(135deg, #0066FF 0%, #5856D6 50%, #7C3AED 100%)`,
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <ResponsiveModalTitle>Subir Archivo</ResponsiveModalTitle>
                <ResponsiveModalDescription>
                  Selecciona un archivo CONSAR para validación
                </ResponsiveModalDescription>
              </div>
            </div>
          </ResponsiveModalHeader>
          <ResponsiveModalBody>
            <FileUpload
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </ResponsiveModalBody>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Main Content */}
      {validations.length === 0 && !isLoadingValidations ? (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Validaciones</CardTitle>
            <CardDescription>Historial completo de archivos validados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <div
                className={cn(
                  'inline-flex h-20 w-20 items-center justify-center rounded-[24px] mb-6',
                  'glass-ultra-clear depth-layer-3 fresnel-edge'
                )}
                style={{
                  background: isDark
                    ? 'rgba(45, 45, 55, 0.4)'
                    : 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(16px)',
                  border: isDark
                    ? '1.5px solid rgba(255, 255, 255, 0.1)'
                    : '1.5px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                <FileCheck
                  className={cn('h-10 w-10', isDark ? 'text-neutral-500' : 'text-neutral-400')}
                />
              </div>
              <h3
                className={cn(
                  'text-lg font-semibold mb-2',
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                )}
              >
                No hay validaciones disponibles
              </h3>
              <p
                className={cn(
                  'text-sm font-medium mb-6',
                  isDark ? 'text-neutral-500' : 'text-neutral-500'
                )}
              >
                Sube tu primer archivo para comenzar con el proceso de validación
              </p>
              <PremiumButtonV2
                label="Subir Archivo"
                icon={Upload}
                size="lg"
                onClick={() => setShowUploadDialog(true)}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Validaciones</CardTitle>
              <CardDescription>
                Historial completo de archivos validados ({statistics.total} total)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ValidationTable
                data={validations}
                isLoading={isLoadingValidations}
                onViewDetails={handleViewDetails}
                onRetry={handleRetry}
                onDownload={handleDownload}
                onDelete={handleDeleteClick}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Eliminar Validación"
        description={`¿Está seguro de eliminar la validación "${validationToDelete?.fileName}"? Esta acción marcará el registro como eliminado y se registrará en el historial de auditoría.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        requireJustification={true}
        justificationLabel="Justificación (requerida por normatividad)"
        justificationPlaceholder="Por favor proporciona una razón detallada para eliminar esta validación. Esta información se registrará en el historial de auditoría y es requerida por las regulaciones de CONSAR y cumplimiento normativo."
        minJustificationLength={20}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
