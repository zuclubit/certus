/**
 * Validator Detail Page - VisionOS Enterprise 2026
 *
 * Detailed view of single validator with test playground
 * Features: Validator info, test playground, metrics, examples
 *
 * @version 2.0.0 - Migrated to ResponsiveModal system
 */

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { useValidatorDetail, useValidatorTesting } from '@/hooks/useValidators'
import { ValidatorTestPlayground } from '@/components/validators'
import {
  DeleteValidatorModal,
  ToggleValidatorModal,
  DuplicateValidatorModal,
} from '@/components/validators/ValidatorModals'
import { PremiumButtonV2 } from '@/components/ui/premium-button-v2'
import {
  ArrowLeft,
  Shield,
  Edit,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  Code,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Zap,
  Terminal,
} from 'lucide-react'

// ============================================
// MAIN COMPONENT
// ============================================

export default function ValidatorDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  // Handle "new" validator case - redirect to validators list for now
  // TODO: Implement validator creation UI
  useEffect(() => {
    if (id === 'new') {
      console.warn('Validator creation UI not implemented yet')
      navigate('/validators')
    }
  }, [id, navigate])

  const { validator, isLoading, error, refresh } = useValidatorDetail(id!)
  const {
    testCases,
    testResults,
    runTest,
    runTestsForValidator,
    isLoading: isTestingLoading,
  } = useValidatorTesting(id)

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showToggleModal, setShowToggleModal] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)

  // Action handlers
  const handleDelete = async (justification: string) => {
    setIsActionLoading(true)
    try {
      console.log('Deleting validator:', id, 'Justification:', justification)
      // TODO: Implement API call
      setShowDeleteModal(false)
      navigate('/validators')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleToggle = async () => {
    setIsActionLoading(true)
    try {
      console.log('Toggling validator:', id, 'New state:', !validator?.isEnabled)
      // TODO: Implement API call
      setShowToggleModal(false)
      refresh()
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDuplicate = async (newName: string) => {
    setIsActionLoading(true)
    try {
      console.log('Duplicating validator:', id, 'New name:', newName)
      // TODO: Implement API call
      setShowDuplicateModal(false)
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className={cn(
              'h-16 w-16 rounded-full border-4 border-t-blue-500 animate-spin mx-auto mb-4',
              isDark ? 'border-neutral-800' : 'border-neutral-200'
            )}
          />
          <p className={cn('ios-text-body ios-font-medium', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
            Cargando validador...
          </p>
        </div>
      </div>
    )
  }

  if (error || !validator) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div
          className="glass-ultra-premium depth-layer-2 rounded-[20px] p-12 text-center max-w-md"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
          }}
        >
          <Shield className={cn('h-16 w-16 mx-auto mb-4 text-red-400')} />
          <h2 className={cn('ios-heading-title2 ios-font-bold mb-2', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
            Validador no encontrado
          </h2>
          <p className={cn('ios-text-body ios-font-regular mb-6', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
            {error || 'El validador solicitado no existe'}
          </p>
          <PremiumButtonV2 onClick={() => navigate('/validators')} variant="primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Validadores
          </PremiumButtonV2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/validators')}
            className={cn(
              'flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-[10px]',
              'transition-all duration-200 flex-shrink-0',
              isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
            )}
          >
            <ArrowLeft className={cn('h-4 w-4 sm:h-5 sm:w-5', isDark ? 'text-neutral-400' : 'text-neutral-600')} />
          </button>

          <div className="min-w-0">
            <h1
              className={cn(
                'text-lg sm:text-xl lg:ios-heading-large font-bold mb-0.5 sm:mb-1 truncate',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}
            >
              {validator.name}
            </h1>
            <p
              className={cn(
                'text-xs sm:text-sm lg:ios-text-body font-mono truncate',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              {validator.code}
            </p>
          </div>
        </div>

        {/* Action buttons - Responsive */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <PremiumButtonV2
            onClick={() => setShowDuplicateModal(true)}
            variant="secondary"
            size="md"
            className="flex-1 sm:flex-none"
          >
            <Copy className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Duplicar</span>
          </PremiumButtonV2>

          <PremiumButtonV2
            onClick={() => navigate(`/validators/${id}/edit`)}
            variant="secondary"
            size="md"
            className="flex-1 sm:flex-none"
          >
            <Edit className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Editar</span>
          </PremiumButtonV2>

          <PremiumButtonV2
            onClick={() => setShowDeleteModal(true)}
            variant="danger"
            size="md"
            className="flex-1 sm:flex-none"
          >
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Eliminar</span>
          </PremiumButtonV2>
        </div>
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Validator Info - Responsive */}
          <div
            className="glass-ultra-premium depth-layer-2 rounded-2xl sm:rounded-[20px] p-4 sm:p-6"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
            }}
          >
            <h3 className={cn('text-sm sm:ios-text-body font-semibold mb-3 sm:mb-4', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
              Información del Validador
            </h3>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className={cn('ios-text-footnote ios-font-semibold mb-1 block', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                  Descripción
                </label>
                <p className={cn('ios-text-callout ios-font-regular', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                  {validator.description}
                </p>
              </div>

              {/* Type and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn('ios-text-footnote ios-font-semibold mb-1 block', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                    Tipo
                  </label>
                  <p className={cn('ios-text-callout ios-font-medium', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                    {validator.type}
                  </p>
                </div>

                <div>
                  <label className={cn('ios-text-footnote ios-font-semibold mb-1 block', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                    Categoría
                  </label>
                  <p className={cn('ios-text-callout ios-font-medium', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                    {validator.category}
                  </p>
                </div>
              </div>

              {/* Criticality and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn('ios-text-footnote ios-font-semibold mb-1 block', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                    Criticidad
                  </label>
                  <p className={cn('ios-text-callout ios-font-medium', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                    {validator.criticality}
                  </p>
                </div>

                <div>
                  <label className={cn('ios-text-footnote ios-font-semibold mb-1 block', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                    Estado
                  </label>
                  <p className={cn('ios-text-callout ios-font-medium', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                    {validator.status}
                  </p>
                </div>
              </div>

              {/* File Types */}
              <div>
                <label className={cn('ios-text-footnote ios-font-semibold mb-2 block', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                  Aplica a tipos de archivo
                </label>
                <div className="flex flex-wrap gap-2">
                  {validator.fileTypes.map((fileType) => (
                    <span
                      key={fileType}
                      className={cn(
                        'inline-flex items-center px-3 py-1.5 rounded-[8px]',
                        'ios-text-footnote ios-font-mono ios-font-medium'
                      )}
                      style={{
                        background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                        color: isDark ? 'rgba(96, 165, 250, 1)' : 'rgba(37, 99, 235, 1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      {fileType}
                    </span>
                  ))}
                </div>
              </div>

              {/* Regulatory Reference */}
              {validator.regulatoryReference && (
                <div>
                  <label className={cn('ios-text-footnote ios-font-semibold mb-1 block', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                    Referencia regulatoria
                  </label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-400" />
                    <p className={cn('ios-text-callout ios-font-medium text-purple-400')}>
                      {validator.regulatoryReference}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions/Commands Section */}
              <div>
                <label className={cn('ios-text-footnote ios-font-semibold mb-2 block', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Comandos y Acciones
                  </div>
                </label>
                <div
                  className="p-4 rounded-[12px] space-y-3"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Action Type */}
                  <div className="flex items-center justify-between">
                    <span className={cn('text-xs font-medium', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                      Tipo de acción:
                    </span>
                    <div className="flex items-center gap-2">
                      {validator.action?.type === 'reject' && (
                        <span
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Rechazar
                        </span>
                      )}
                      {validator.action?.type === 'warn' && (
                        <span
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{
                            background: 'rgba(234, 179, 8, 0.15)',
                            color: '#eab308',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                          }}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          Advertir
                        </span>
                      )}
                      {validator.action?.type === 'log' && (
                        <span
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                          }}
                        >
                          <Terminal className="h-3.5 w-3.5" />
                          Registrar
                        </span>
                      )}
                      {validator.action?.type === 'custom' && (
                        <span
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{
                            background: 'rgba(168, 85, 247, 0.15)',
                            color: '#a855f7',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                          }}
                        >
                          <Zap className="h-3.5 w-3.5" />
                          Personalizado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Error Code */}
                  {validator.action?.code && (
                    <div className="flex items-center justify-between">
                      <span className={cn('text-xs font-medium', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                        Código de error:
                      </span>
                      <code
                        className="px-2 py-0.5 rounded text-xs font-mono"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                          color: isDark ? '#f472b6' : '#db2777',
                        }}
                      >
                        {validator.action.code}
                      </code>
                    </div>
                  )}

                  {/* Message */}
                  {validator.action?.message && (
                    <div>
                      <span className={cn('text-xs font-medium mb-1 block', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                        Mensaje de error:
                      </span>
                      <div
                        className="p-2.5 rounded-lg text-xs"
                        style={{
                          background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: isDark ? '#fca5a5' : '#dc2626',
                        }}
                      >
                        "{validator.action.message}"
                      </div>
                    </div>
                  )}

                  {/* Auto-fix */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/10">
                    <span className={cn('text-xs font-medium', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                      Auto-corrección:
                    </span>
                    <span
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium',
                        validator.action?.autoFix
                          ? 'bg-green-500/15 text-green-500'
                          : 'bg-neutral-500/15 text-neutral-500'
                      )}
                    >
                      {validator.action?.autoFix ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Disponible
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          No disponible
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Validation Logic Preview */}
              <div>
                <label className={cn('ios-text-footnote ios-font-semibold mb-2 block', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Lógica de validación
                  </div>
                </label>
                <div
                  className="p-4 rounded-[12px]"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Operator */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-bold uppercase',
                        validator.conditionGroup?.logic === 'AND' || validator.conditionGroup?.operator === 'and'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                      )}
                    >
                      {validator.conditionGroup?.logic || validator.conditionGroup?.operator || 'AND'}
                    </span>
                    <span className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                      {validator.conditionGroup?.conditions?.length || 0} condiciones
                    </span>
                  </div>

                  {/* Conditions List */}
                  <div className="space-y-2">
                    {validator.conditionGroup?.conditions?.map((condition: any, index: number) => (
                      <div
                        key={condition.id || index}
                        className="flex items-center gap-2 p-2 rounded-lg"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        }}
                      >
                        <span className={cn('text-xs font-mono font-semibold', isDark ? 'text-cyan-400' : 'text-cyan-600')}>
                          {condition.field}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase"
                          style={{
                            background: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
                            color: '#a855f7',
                          }}
                        >
                          {condition.operator?.replace(/_/g, ' ')}
                        </span>
                        {condition.value !== undefined && condition.value !== '' && (
                          <span className={cn('text-xs font-mono', isDark ? 'text-green-400' : 'text-green-600')}>
                            {Array.isArray(condition.value)
                              ? `[${condition.value.join(', ')}]`
                              : JSON.stringify(condition.value)}
                          </span>
                        )}
                        {condition.valueFrom && (
                          <span className={cn('text-xs font-mono', isDark ? 'text-orange-400' : 'text-orange-600')}>
                            ← {condition.valueFrom}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Raw JSON Toggle */}
                  <details className="mt-3">
                    <summary className={cn('text-xs cursor-pointer hover:underline', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                      Ver JSON completo
                    </summary>
                    <pre className={cn('mt-2 text-[10px] font-mono overflow-x-auto p-2 rounded', isDark ? 'text-neutral-400 bg-black/20' : 'text-neutral-700 bg-black/5')}>
                      {JSON.stringify(validator.conditionGroup, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          </div>

          {/* Test Playground */}
          <div>
            <h3 className={cn('ios-text-body ios-font-semibold mb-3', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
              Test Playground
            </h3>
            <ValidatorTestPlayground
              validatorId={validator.id}
              testCases={testCases}
              testResults={testResults}
              onRunTest={async (testCaseId) => {
                await runTest(testCaseId)
              }}
              onRunAllTests={async () => {
                await runTestsForValidator(validator.id)
              }}
              onAddTestCase={(testCase) => {
                console.log('Add test case:', testCase)
                // In real app: validatorStore.addTestCase(testCase)
              }}
              onDeleteTestCase={(testCaseId) => {
                console.log('Delete test case:', testCaseId)
                // In real app: validatorStore.removeTestCase(testCaseId)
              }}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions - Responsive */}
          <div
            className="glass-ultra-premium depth-layer-2 rounded-2xl sm:rounded-[20px] p-4 sm:p-5"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
            }}
          >
            <h4 className={cn('text-sm sm:ios-text-callout font-semibold mb-2 sm:mb-3', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
              Acciones Rápidas
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => setShowToggleModal(true)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-[12px]',
                  'transition-all duration-200',
                  isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
                )}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {validator.isEnabled ? (
                    <ToggleRight className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  ) : (
                    <ToggleLeft className={cn('h-4 w-4 sm:h-5 sm:w-5', isDark ? 'text-neutral-600' : 'text-neutral-400')} />
                  )}
                  <span className={cn('text-xs sm:ios-text-callout font-medium', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                    {validator.isEnabled ? 'Desactivar' : 'Activar'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Metadata - Responsive */}
          <div
            className="glass-ultra-premium depth-layer-2 rounded-2xl sm:rounded-[20px] p-4 sm:p-5"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
            }}
          >
            <h4 className={cn('ios-text-callout ios-font-semibold mb-3', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
              Metadatos
            </h4>

            <div className="space-y-3">
              <div>
                <label className={cn('ios-text-caption2 ios-font-regular mb-0.5 block', isDark ? 'text-neutral-600' : 'text-neutral-500')}>
                  Creado
                </label>
                <p className={cn('ios-text-footnote ios-font-medium', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  {new Date(validator.createdAt).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <label className={cn('ios-text-caption2 ios-font-regular mb-0.5 block', isDark ? 'text-neutral-600' : 'text-neutral-500')}>
                  Última actualización
                </label>
                <p className={cn('ios-text-footnote ios-font-medium', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  {new Date(validator.updatedAt).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <label className={cn('ios-text-caption2 ios-font-regular mb-0.5 block', isDark ? 'text-neutral-600' : 'text-neutral-500')}>
                  Versión
                </label>
                <p className={cn('ios-text-footnote ios-font-medium', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  v{validator.version}
                </p>
              </div>

              <div>
                <label className={cn('ios-text-caption2 ios-font-regular mb-0.5 block', isDark ? 'text-neutral-600' : 'text-neutral-500')}>
                  Orden de ejecución
                </label>
                <p className={cn('ios-text-footnote ios-font-medium', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  #{validator.runOrder}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteValidatorModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        validator={validator}
        onConfirm={handleDelete}
        isLoading={isActionLoading}
      />

      <ToggleValidatorModal
        open={showToggleModal}
        onOpenChange={setShowToggleModal}
        validator={validator}
        onConfirm={handleToggle}
        isLoading={isActionLoading}
      />

      <DuplicateValidatorModal
        open={showDuplicateModal}
        onOpenChange={setShowDuplicateModal}
        validator={validator}
        onConfirm={handleDuplicate}
        isLoading={isActionLoading}
      />
    </div>
  )
}
