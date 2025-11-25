/**
 * Approval Detail Page - VisionOS Enterprise 2026
 *
 * Detailed view of single approval workflow
 * Features: Stage indicator, timeline, audit log, action panel
 */

import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { useWorkflowDetail } from '@/hooks/useApproval'
import {
  ApprovalStageIndicator,
  ApprovalActionPanel,
} from '@/components/approval'
import { PremiumTimeline, PremiumAuditTable } from '@/components/ui'
import { PremiumButtonV2 } from '@/components/ui/premium-button-v2'
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

// ============================================
// MAIN COMPONENT
// ============================================

export default function ApprovalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const { workflow, isLoading, error, refresh } = useWorkflowDetail(id!)

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
            Cargando workflow...
          </p>
        </div>
      </div>
    )
  }

  if (error || !workflow) {
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
          <AlertCircle className={cn('h-16 w-16 mx-auto mb-4 text-red-400')} />
          <h2 className={cn('ios-heading-title2 ios-font-bold mb-2', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
            Workflow no encontrado
          </h2>
          <p className={cn('ios-text-body ios-font-regular mb-6', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
            {error || 'El workflow solicitado no existe o no tienes permisos para verlo'}
          </p>
          <PremiumButtonV2 onClick={() => navigate('/approvals')} variant="primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Aprobaciones
          </PremiumButtonV2>
        </div>
      </div>
    )
  }

  // Mock timeline and audit log (in real app, these would come from the workflow)
  const timeline = workflow.history.map((entry) => ({
    id: entry.id,
    timestamp: entry.timestamp,
    type: entry.action,
    message: entry.comment || `${entry.action} por ${entry.performedBy.name}`,
    user: entry.performedBy.name,
  }))

  const auditLog = workflow.history.map((entry) => ({
    id: entry.id,
    timestamp: entry.timestamp,
    user: entry.performedBy.name,
    action: entry.action,
    resource: `Workflow ${workflow.id}`,
    details: entry.comment || 'Sin comentarios',
    ipAddress: '192.168.1.1', // Mock IP
  }))

  const canApprove = true // In real app: approvalService.canUserApprove(workflow, currentUser)

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/approvals')}
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
              {workflow.fileName}
            </h1>
            <p
              className={cn(
                'text-xs sm:text-sm lg:ios-text-body truncate',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              {workflow.fileType} • {workflow.afore}
            </p>
          </div>
        </div>

        <PremiumButtonV2 onClick={refresh} variant="secondary" size="md" className="w-full sm:w-auto">
          Actualizar
        </PremiumButtonV2>
      </div>

      {/* Stage Indicator */}
      <ApprovalStageIndicator
        stages={workflow.stages}
        currentLevel={workflow.currentLevel}
        overallStatus={workflow.status}
        isDark={isDark}
        orientation="horizontal"
      />

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* File Details - Responsive */}
          <div
            className="glass-ultra-premium depth-layer-2 rounded-2xl sm:rounded-[20px] p-4 sm:p-6"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(25,25,30,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
            }}
          >
            <h3 className={cn('text-sm sm:ios-text-body font-semibold mb-3 sm:mb-4', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
              Detalles del Archivo
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <FileText className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isDark ? 'text-neutral-500' : 'text-neutral-600')} />
                  <span className={cn('text-[10px] xs:text-xs sm:ios-text-footnote', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                    Nombre
                  </span>
                </div>
                <p className={cn('text-xs sm:ios-text-callout font-medium truncate', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                  {workflow.fileName}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <TrendingUp className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isDark ? 'text-neutral-500' : 'text-neutral-600')} />
                  <span className={cn('text-[10px] xs:text-xs sm:ios-text-footnote', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                    Tipo
                  </span>
                </div>
                <p className={cn('text-xs sm:ios-text-callout font-medium', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                  {workflow.fileType}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <User className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isDark ? 'text-neutral-500' : 'text-neutral-600')} />
                  <span className={cn('text-[10px] xs:text-xs sm:ios-text-footnote', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                    Enviado por
                  </span>
                </div>
                <p className={cn('text-xs sm:ios-text-callout font-medium truncate', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                  {workflow.submittedBy.name}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <Calendar className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isDark ? 'text-neutral-500' : 'text-neutral-600')} />
                  <span className={cn('text-[10px] xs:text-xs sm:ios-text-footnote', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                    Fecha
                  </span>
                </div>
                <p className={cn('text-xs sm:ios-text-callout font-medium', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                  {new Date(workflow.submittedAt).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <AlertCircle className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isDark ? 'text-neutral-500' : 'text-neutral-600')} />
                  <span className={cn('text-[10px] xs:text-xs sm:ios-text-footnote', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                    Registros
                  </span>
                </div>
                <p className={cn('text-xs sm:ios-text-callout font-medium', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                  {workflow.metadata.totalRecords.toLocaleString()}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <AlertCircle className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400')} />
                  <span className={cn('text-[10px] xs:text-xs sm:ios-text-footnote', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                    Errores
                  </span>
                </div>
                <p className={cn('text-xs sm:ios-text-callout font-medium text-red-400')}>
                  {workflow.metadata.totalErrors}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline - Responsive */}
          <div>
            <h3 className={cn('text-sm sm:ios-text-body font-semibold mb-2 sm:mb-3', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
              Timeline de Eventos
            </h3>
            <PremiumTimeline data={timeline} isDark={isDark} maxHeight="300px" />
          </div>

          {/* Audit Log - Responsive */}
          <div>
            <h3 className={cn('text-sm sm:ios-text-body font-semibold mb-2 sm:mb-3', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
              Registro de Auditoría
            </h3>
            <PremiumAuditTable data={auditLog} isDark={isDark} maxHeight="300px" />
          </div>
        </div>

        {/* Right Column - Actions - Responsive */}
        <div className="space-y-4 sm:space-y-6">
          <ApprovalActionPanel
            workflow={workflow}
            canApprove={canApprove}
            onApprove={async (comment) => {
              console.log('Approve:', comment)
              // In real app: await approvalStore.approveWorkflow(workflow.id, comment)
            }}
            onReject={async (comment) => {
              console.log('Reject:', comment)
              // In real app: await approvalStore.rejectWorkflow(workflow.id, comment)
            }}
            onEscalate={async (toLevel, reason) => {
              console.log('Escalate:', toLevel, reason)
              // In real app: await approvalStore.escalateWorkflow(workflow.id, toLevel, reason)
            }}
            onRequestInfo={async (message) => {
              console.log('Request info:', message)
              // In real app: await approvalStore.requestInfo(workflow.id, message)
            }}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  )
}
