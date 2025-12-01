/**
 * Validations Module - Types
 *
 * Type definitions for the validations domain
 * These types align with the backend API contracts
 */

import type { ValidationStatus, FileType } from '@/lib/constants'

// ============================================
// CORE TYPES
// ============================================

/**
 * Validation entity
 */
export interface Validation {
  id: string
  fileName: string
  fileType: FileType
  fileSize: number
  status: ValidationStatus
  uploadedBy: string
  uploadedAt: string
  processedAt?: string
  recordCount?: number
  validRecordCount?: number
  errorCount: number
  warningCount: number
  progress?: number
  version: number
  isLatestVersion: boolean
  replacesId?: string
  replacedById?: string
}

/**
 * Validation detail with additional information
 */
export interface ValidationDetail extends Validation {
  summary: ValidationSummary
  errors: ValidationError[]
  warnings: ValidationWarning[]
  timeline: ValidationTimelineEntry[]
  downloadUrl?: string
}

/**
 * Validation summary statistics
 */
export interface ValidationSummary {
  totalRecords: number
  validRecords: number
  errorRecords: number
  warningRecords: number
  processingTimeMs: number
  complianceScore: number
}

/**
 * Validation error entry
 */
export interface ValidationError {
  line: number
  column?: string
  field: string
  value: string
  rule: string
  message: string
  severity: 'error' | 'critical'
  suggestion?: string
}

/**
 * Validation warning entry
 */
export interface ValidationWarning {
  line: number
  column?: string
  field: string
  value: string
  rule: string
  message: string
  suggestion?: string
}

/**
 * Timeline entry for validation process
 */
export interface ValidationTimelineEntry {
  timestamp: string
  event: string
  description: string
  user?: string
  details?: Record<string, unknown>
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

/**
 * File upload form data
 */
export interface FileUploadForm {
  file: File
  fileType: FileType
  description?: string
  priority?: 'normal' | 'high' | 'urgent'
}

/**
 * Validation filter parameters
 */
export interface ValidationFilterParams {
  page?: number
  pageSize?: number
  status?: ValidationStatus[]
  fileType?: FileType[]
  search?: string
  sortBy?: 'uploadedAt' | 'fileName' | 'status'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

/**
 * Validation statistics response
 */
export interface ValidationStatistics {
  total: number
  processing: number
  success: number
  error: number
  warning: number
  pending: number
  todayCount: number
  weekCount: number
  averageProcessingTimeMs: number
}

/**
 * Create corrected version request
 */
export interface CreateCorrectedVersionRequest {
  validationId: string
  reason: string
  file?: File
}

// ============================================
// UI STATE TYPES
// ============================================

/**
 * Validation table row selection
 */
export interface ValidationRowSelection {
  [key: string]: boolean
}

/**
 * File upload state
 */
export interface FileUploadState {
  file: File | null
  fileType: FileType | null
  progress: number
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error'
  error?: string
}

/**
 * Validation view mode
 */
export type ValidationViewMode = 'table' | 'grid' | 'timeline'

/**
 * Validation detail tab
 */
export type ValidationDetailTab = 'summary' | 'errors' | 'warnings' | 'timeline' | 'versions'
