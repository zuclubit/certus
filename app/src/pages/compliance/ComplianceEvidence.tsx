/**
 * Compliance Evidence Page - VisionOS Enterprise Design
 *
 * Evidence management with:
 * - Evidence listing with filtering
 * - Upload functionality
 * - Status workflow
 * - Expiration tracking
 * - Control linkage
 *
 * @version 1.0.0
 * @compliance SOC 2 Type II, ISO 27001:2022
 */

import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  FileCheck,
  Search,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Calendar,
  User,
  File,
  FileText,
  Image,
  FileCode,
  FileBadge,
  Folder,
  Upload,
  Download,
  Eye,
  Edit2,
  Trash2,
  Link2,
  X,
  MoreVertical,
  Loader2,
  Info,
  RefreshCw,
  Grid,
  List,
  SortAsc,
  Tag,
  HardDrive,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEvidence, useApproveEvidence, useRejectEvidence } from '@/hooks/useCompliance'
import type { Evidence, EvidenceStatus, EvidenceType, ComplianceFramework } from '@/types/compliance.types'

// ============================================================================
// CONSTANTS
// ============================================================================

const statusConfig: Record<EvidenceStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Pendiente' },
  submitted: { icon: FileCheck, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Enviada' },
  under_review: { icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'En Revisión' },
  approved: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Aprobada' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Rechazada' },
  expired: { icon: AlertCircle, color: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-800', label: 'Expirada' },
}

const typeConfig: Record<EvidenceType, { icon: React.ElementType; color: string; label: string }> = {
  document: { icon: FileText, color: 'text-blue-500', label: 'Documento' },
  screenshot: { icon: Image, color: 'text-purple-500', label: 'Captura' },
  log: { icon: FileCode, color: 'text-amber-500', label: 'Log' },
  configuration: { icon: FileCode, color: 'text-emerald-500', label: 'Configuración' },
  policy: { icon: FileBadge, color: 'text-indigo-500', label: 'Política' },
  procedure: { icon: FileText, color: 'text-pink-500', label: 'Procedimiento' },
  certificate: { icon: FileBadge, color: 'text-emerald-500', label: 'Certificado' },
  report: { icon: FileText, color: 'text-orange-500', label: 'Reporte' },
  other: { icon: File, color: 'text-neutral-500', label: 'Otro' },
}

const frameworkColors: Record<ComplianceFramework, string> = {
  SOC2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ISO27001: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  NIST_CSF: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CIS_V8: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  CONSAR: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  CNBV: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  GDPR: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  LFPDPPP: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  PCI_DSS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getExpirationStatus(expiresInDays: number): { color: string; label: string } {
  if (expiresInDays < 0) return { color: 'text-red-500 bg-red-100 dark:bg-red-900/30', label: 'Expirada' }
  if (expiresInDays <= 7) return { color: 'text-red-500 bg-red-100 dark:bg-red-900/30', label: `${expiresInDays}d` }
  if (expiresInDays <= 30) return { color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30', label: `${expiresInDays}d` }
  if (expiresInDays <= 90) return { color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30', label: `${Math.floor(expiresInDays / 30)}m` }
  return { color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30', label: `${Math.floor(expiresInDays / 30)}m` }
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: EvidenceStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}

function TypeBadge({ type }: { type: EvidenceType }) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
      <Icon className={cn('w-3.5 h-3.5', config.color)} />
      {config.label}
    </span>
  )
}

function EvidenceCard({ evidence, onSelect, isSelected }: { evidence: Evidence; onSelect: () => void; isSelected: boolean }) {
  const statusCfg = statusConfig[evidence.status]
  const typeCfg = typeConfig[evidence.type]
  const StatusIcon = statusCfg.icon
  const TypeIcon = typeCfg.icon
  const expirationStatus = getExpirationStatus(evidence.expiresInDays)

  return (
    <div
      onClick={onSelect}
      className={cn(
        'glass-card p-4 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group',
        isSelected && 'ring-2 ring-primary-500 shadow-lg'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl', statusCfg.bg)}>
          <StatusIcon className={cn('w-5 h-5', statusCfg.color)} />
        </div>
        <div className="flex items-center gap-2">
          {evidence.isExpired ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertTriangle className="w-3 h-3" />
              Expirada
            </span>
          ) : evidence.expiresInDays <= 30 && (
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', expirationStatus.color)}>
              <Clock className="w-3 h-3" />
              {expirationStatus.label}
            </span>
          )}
        </div>
      </div>

      {/* File Icon & Name */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800')}>
          <TypeIcon className={cn('w-6 h-6', typeCfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-neutral-900 dark:text-white text-sm truncate">{evidence.name}</h4>
          <p className="text-xs text-neutral-500 truncate">{evidence.fileName}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{evidence.description}</p>

      {/* Frameworks */}
      <div className="flex flex-wrap gap-1 mb-3">
        {evidence.frameworkIds.map(fw => (
          <span key={fw} className={cn('px-1.5 py-0.5 rounded text-xs font-medium', frameworkColors[fw])}>
            {fw}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
        <div className="flex items-center gap-1">
          <HardDrive className="w-3.5 h-3.5" />
          {formatFileSize(evidence.fileSize)}
        </div>
        <div className="flex items-center gap-1">
          <Link2 className="w-3.5 h-3.5" />
          {evidence.controlIds.length} controles
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <User className="w-3 h-3" />
          {evidence.uploadedBy}
        </div>
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Calendar className="w-3 h-3" />
          {new Date(evidence.uploadedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
        </div>
      </div>

      {/* Status Banner */}
      <StatusBadge status={evidence.status} />
    </div>
  )
}

function EvidenceRow({ evidence, onSelect, isSelected }: { evidence: Evidence; onSelect: () => void; isSelected: boolean }) {
  const statusCfg = statusConfig[evidence.status]
  const typeCfg = typeConfig[evidence.type]
  const StatusIcon = statusCfg.icon
  const TypeIcon = typeCfg.icon
  const expirationStatus = getExpirationStatus(evidence.expiresInDays)

  return (
    <tr
      onClick={onSelect}
      className={cn(
        'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors',
        isSelected && 'bg-primary-50 dark:bg-primary-900/10'
      )}
    >
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <TypeIcon className={cn('w-5 h-5', typeCfg.color)} />
          <span className="text-xs text-neutral-500">{typeCfg.label}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="max-w-xs">
          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{evidence.name}</p>
          <p className="text-xs text-neutral-500 truncate">{evidence.fileName}</p>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge status={evidence.status} />
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {evidence.frameworkIds.slice(0, 2).map(fw => (
            <span key={fw} className={cn('px-1.5 py-0.5 rounded text-xs font-medium', frameworkColors[fw])}>
              {fw}
            </span>
          ))}
          {evidence.frameworkIds.length > 2 && (
            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
              +{evidence.frameworkIds.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{evidence.controlIds.length}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {evidence.isExpired ? (
          <span className="inline-flex items-center gap-1 text-xs text-red-500">
            <AlertTriangle className="w-3 h-3" /> Expirada
          </span>
        ) : (
          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', expirationStatus.color)}>
            {expirationStatus.label}
          </span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{formatFileSize(evidence.fileSize)}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {new Date(evidence.uploadedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onSelect() }}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation() }}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function EvidenceDetailPanel({ evidence, onClose, onApprove, onReject }: {
  evidence: Evidence
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}) {
  const statusCfg = statusConfig[evidence.status]
  const typeCfg = typeConfig[evidence.type]
  const StatusIcon = statusCfg.icon
  const TypeIcon = typeCfg.icon
  const expirationStatus = getExpirationStatus(evidence.expiresInDays)

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-xl', statusCfg.bg)}>
              <TypeIcon className={cn('w-6 h-6', typeCfg.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">{evidence.name}</h3>
              <p className="text-xs text-neutral-500">{evidence.fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Status & Expiration */}
        <div className="flex items-center gap-3">
          <StatusBadge status={evidence.status} />
          {evidence.isExpired ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Expirada
            </span>
          ) : evidence.expiresInDays <= 90 && (
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', expirationStatus.color)}>
              <Clock className="w-3.5 h-3.5" />
              Expira en {expirationStatus.label}
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Descripción</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{evidence.description}</p>
        </div>

        {/* File Info */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Información del Archivo</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-neutral-500">Tipo</span>
              <p className="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-1">
                <TypeIcon className={cn('w-4 h-4', typeCfg.color)} />
                {typeCfg.label}
              </p>
            </div>
            <div>
              <span className="text-xs text-neutral-500">Tamaño</span>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{formatFileSize(evidence.fileSize)}</p>
            </div>
            <div>
              <span className="text-xs text-neutral-500">Versión</span>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">v{evidence.version}</p>
            </div>
            <div>
              <span className="text-xs text-neutral-500">MIME Type</span>
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{evidence.mimeType}</p>
            </div>
          </div>
        </div>

        {/* Frameworks */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Frameworks</h4>
          <div className="flex flex-wrap gap-2">
            {evidence.frameworkIds.map(fw => (
              <span key={fw} className={cn('px-2.5 py-1 rounded-lg text-xs font-medium', frameworkColors[fw])}>
                {fw}
              </span>
            ))}
          </div>
        </div>

        {/* Linked Controls */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Controles Vinculados</h4>
          <div className="space-y-2">
            {evidence.controlIds.length > 0 ? (
              evidence.controlIds.map(controlId => (
                <div key={controlId} className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                  <Link2 className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300 font-mono">{controlId}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500">Sin controles vinculados</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-500">Válido desde</span>
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {new Date(evidence.validFrom).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-500">Válido hasta</span>
            </div>
            <p className={cn('text-sm font-medium', evidence.isExpired ? 'text-red-500' : 'text-neutral-900 dark:text-white')}>
              {new Date(evidence.validUntil).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Upload Info */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{evidence.uploadedBy}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Subido el {new Date(evidence.uploadedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Review Info */}
        {evidence.reviewedBy && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{evidence.reviewedBy}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Revisado el {new Date(evidence.reviewedAt!).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            {evidence.reviewNotes && (
              <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">{evidence.reviewNotes}</p>
            )}
          </div>
        )}

        {/* Tags */}
        {evidence.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Etiquetas</h4>
            <div className="flex flex-wrap gap-2">
              {evidence.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-center gap-3">
          {evidence.status === 'under_review' && (
            <>
              <button
                onClick={onApprove}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprobar
              </button>
              <button
                onClick={onReject}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <XCircle className="w-4 h-4" />
                Rechazar
              </button>
            </>
          )}
          {evidence.status !== 'under_review' && (
            <>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium">
                <Download className="w-4 h-4" />
                Descargar
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium">
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickStats({ evidence }: { evidence: Evidence[] }) {
  const stats = useMemo(() => {
    const total = evidence.length
    const approved = evidence.filter(e => e.status === 'approved').length
    const pending = evidence.filter(e => e.status === 'pending' || e.status === 'submitted').length
    const expired = evidence.filter(e => e.isExpired).length
    const expiringThisMonth = evidence.filter(e => !e.isExpired && e.expiresInDays <= 30).length

    return { total, approved, pending, expired, expiringThisMonth }
  }, [evidence])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-neutral-500">Total</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.approved}</p>
            <p className="text-xs text-neutral-500">Aprobadas</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.pending}</p>
            <p className="text-xs text-neutral-500">Pendientes</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.expired}</p>
            <p className="text-xs text-neutral-500">Expiradas</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.expiringThisMonth}</p>
            <p className="text-xs text-neutral-500">Por Expirar</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ComplianceEvidence() {
  const { data: evidenceResponse, isLoading } = useEvidence()
  const approveMutation = useApproveEvidence()
  const rejectMutation = useRejectEvidence()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<EvidenceStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<EvidenceType | 'all'>('all')

  const evidence = evidenceResponse?.data || []

  const filteredEvidence = useMemo(() => {
    return evidence.filter(e => {
      const matchesSearch = !searchQuery ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.fileName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || e.status === statusFilter
      const matchesType = typeFilter === 'all' || e.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [evidence, searchQuery, statusFilter, typeFilter])

  const handleApprove = useCallback(() => {
    if (selectedEvidence) {
      approveMutation.mutate({ id: selectedEvidence.id, notes: 'Aprobada' })
      setSelectedEvidence({ ...selectedEvidence, status: 'approved' })
    }
  }, [selectedEvidence, approveMutation])

  const handleReject = useCallback(() => {
    if (selectedEvidence) {
      rejectMutation.mutate({ id: selectedEvidence.id, notes: 'Rechazada' })
      setSelectedEvidence({ ...selectedEvidence, status: 'rejected' })
    }
  }, [selectedEvidence, rejectMutation])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-sm text-neutral-500">Cargando evidencias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
            <Link to="/compliance" className="hover:text-primary-600">Portal de Cumplimiento</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-neutral-900 dark:text-white">Evidencias</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Gestión de Evidencias
          </h1>
          <p className="text-neutral-500 mt-1">
            {filteredEvidence.length} de {evidence.length} evidencias
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium">
            <Upload className="w-4 h-4" />
            Subir Evidencia
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats evidence={evidence} />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar evidencias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EvidenceStatus | 'all')}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todos los estados</option>
            {(Object.keys(statusConfig) as EvidenceStatus[]).map(status => (
              <option key={status} value={status}>{statusConfig[status].label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as EvidenceType | 'all')}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todos los tipos</option>
            {(Object.keys(typeConfig) as EvidenceType[]).map(type => (
              <option key={type} value={type}>{typeConfig[type].label}</option>
            ))}
          </select>
          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2.5 transition-colors',
                viewMode === 'grid' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-white dark:bg-neutral-800 text-neutral-400 hover:text-neutral-600'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2.5 transition-colors',
                viewMode === 'list' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-white dark:bg-neutral-800 text-neutral-400 hover:text-neutral-600'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evidence List/Grid */}
        <div className={cn(selectedEvidence ? 'lg:col-span-2' : 'lg:col-span-3')}>
          {viewMode === 'grid' ? (
            <div className={cn(
              'grid gap-4',
              selectedEvidence ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            )}>
              {filteredEvidence.map(e => (
                <EvidenceCard
                  key={e.id}
                  evidence={e}
                  onSelect={() => setSelectedEvidence(selectedEvidence?.id === e.id ? null : e)}
                  isSelected={selectedEvidence?.id === e.id}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Frameworks</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Controles</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Expira</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tamaño</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {filteredEvidence.map(e => (
                    <EvidenceRow
                      key={e.id}
                      evidence={e}
                      onSelect={() => setSelectedEvidence(selectedEvidence?.id === e.id ? null : e)}
                      isSelected={selectedEvidence?.id === e.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredEvidence.length === 0 && (
            <div className="glass-card p-12 rounded-2xl text-center">
              <FileCheck className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                No se encontraron evidencias
              </h3>
              <p className="text-neutral-500 text-sm mb-4">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
                  : 'No hay evidencias cargadas en el sistema'}
              </p>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium">
                <Upload className="w-4 h-4" />
                Subir Primera Evidencia
              </button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedEvidence && (
          <div className="lg:col-span-1">
            <EvidenceDetailPanel
              evidence={selectedEvidence}
              onClose={() => setSelectedEvidence(null)}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplianceEvidence
