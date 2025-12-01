/**
 * Validations Module - Constants
 *
 * Module-specific constants, configurations, and mappings
 */

import {
  FileText,
  Users,
  Repeat,
  ArrowLeftRight,
  Wallet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import type { ValidationStatus, FileType } from '@/lib/constants'

// ============================================
// FILE TYPE CONFIG
// ============================================

export interface FileTypeConfig {
  label: string
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
  extensions: string[]
  maxSizeMB: number
}

export const FILE_TYPE_CONFIG: Record<FileType, FileTypeConfig> = {
  PROCESAR: {
    label: 'PROCESAR',
    description: 'Archivos de procesamiento general',
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    extensions: ['.txt', '.csv'],
    maxSizeMB: 100,
  },
  AFILIADOS: {
    label: 'AFILIADOS',
    description: 'Registro de trabajadores afiliados',
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    extensions: ['.txt', '.csv'],
    maxSizeMB: 200,
  },
  TRASPASOS: {
    label: 'TRASPASOS',
    description: 'Movimientos de traspaso entre AFOREs',
    icon: Repeat,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    extensions: ['.txt', '.csv'],
    maxSizeMB: 150,
  },
  RETIROS: {
    label: 'RETIROS',
    description: 'Solicitudes de retiro de fondos',
    icon: ArrowLeftRight,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    extensions: ['.txt', '.csv'],
    maxSizeMB: 100,
  },
  APORTACIONES: {
    label: 'APORTACIONES',
    description: 'Registro de aportaciones',
    icon: Wallet,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    extensions: ['.txt', '.csv'],
    maxSizeMB: 200,
  },
}

// ============================================
// STATUS CONFIG
// ============================================

export interface StatusConfig {
  label: string
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
  priority: number
}

export const STATUS_CONFIG: Record<ValidationStatus, StatusConfig> = {
  pending: {
    label: 'Pendiente',
    description: 'En espera de procesamiento',
    icon: Clock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    priority: 1,
  },
  processing: {
    label: 'Procesando',
    description: 'Validación en progreso',
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    priority: 2,
  },
  success: {
    label: 'Exitosa',
    description: 'Validación completada sin errores',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    priority: 4,
  },
  warning: {
    label: 'Con advertencias',
    description: 'Validación completada con advertencias',
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    priority: 3,
  },
  error: {
    label: 'Con errores',
    description: 'Validación fallida',
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    priority: 5,
  },
}

// ============================================
// VALIDATION RULES CONFIG
// ============================================

export const VALIDATION_RULES = {
  // File constraints
  MAX_FILE_SIZE_MB: 200,
  ALLOWED_EXTENSIONS: ['.txt', '.csv'],
  MAX_BATCH_FILES: 10,

  // Processing
  PROCESSING_TIMEOUT_MS: 300000, // 5 minutes
  POLLING_INTERVAL_MS: 5000,
  MAX_RETRIES: 3,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],

  // Search
  MIN_SEARCH_LENGTH: 2,
  SEARCH_DEBOUNCE_MS: 300,

  // Retention
  MAX_VERSION_HISTORY: 10,
  RETENTION_DAYS: 365,
} as const

// ============================================
// ERROR SEVERITY CONFIG
// ============================================

export const ERROR_SEVERITY_CONFIG = {
  critical: {
    label: 'Crítico',
    description: 'Error que impide el procesamiento',
    color: 'text-red-600',
    bgColor: 'bg-red-600/10',
  },
  error: {
    label: 'Error',
    description: 'Error que debe ser corregido',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  warning: {
    label: 'Advertencia',
    description: 'Posible problema a revisar',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
} as const

// ============================================
// EXPORT FORMATS
// ============================================

export const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF', description: 'Reporte completo en PDF' },
  { value: 'excel', label: 'Excel', description: 'Datos en formato Excel (.xlsx)' },
  { value: 'csv', label: 'CSV', description: 'Datos en formato CSV' },
] as const

export type ExportFormat = (typeof EXPORT_FORMATS)[number]['value']

// ============================================
// CONSAR COMPLIANCE
// ============================================

export const CONSAR_CONFIG = {
  // Circular references
  CIRCULAR_19_8: 'Circular CONSAR 19-8',
  CIRCULAR_26_11: 'Circular CONSAR 26-11',

  // Retransmission rules
  RETRANSMISSION_DEADLINE_HOURS: 72,
  MAX_RETRANSMISSIONS: 3,

  // Compliance thresholds
  MIN_COMPLIANCE_SCORE: 98,
  ACCEPTABLE_ERROR_RATE: 0.02, // 2%

  // Audit requirements
  AUDIT_LOG_RETENTION_YEARS: 10,
} as const
