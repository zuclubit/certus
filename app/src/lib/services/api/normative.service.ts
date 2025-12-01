/**
 * Normative Changes Service - Real API Implementation
 *
 * Handles CONSAR normative changes (circulars and regulatory dispositions)
 * against Certus API v1
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'

// ============================================
// TYPES
// ============================================

export type NormativeStatus = 'pending' | 'active' | 'archived'
export type NormativePriority = 'low' | 'medium' | 'high'

export interface NormativeChange {
  id: string
  code: string
  title: string
  description: string
  publishDate: string
  effectiveDate: string
  status: NormativeStatus
  priority: NormativePriority
  category: string
  affectedValidators: string[]
  documentUrl?: string
  notes?: string
  appliedAt?: string
  appliedBy?: string
}

export interface NormativeStatistics {
  total: number
  pending: number
  active: number
  archived: number
  highPriority: number
  byCategory: Record<string, number>
}

export interface NormativeFilters {
  status?: NormativeStatus
  priority?: NormativePriority
  category?: string
  search?: string
}

export interface CreateNormativeChangeRequest {
  code: string
  title: string
  description: string
  publishDate: string
  effectiveDate: string
  priority: string
  category: string
  affectedValidators: string[]
  documentUrl?: string
}

// ============================================
// SERVICE
// ============================================

export class NormativeService {
  /**
   * Get all normative changes with optional filters
   */
  static async getNormativeChanges(params?: NormativeFilters): Promise<NormativeChange[]> {
    const response = await apiClient.get<NormativeChange[]>(
      API_ENDPOINTS.NORMATIVE_CHANGES.LIST,
      { params }
    )
    return response.data
  }

  /**
   * Get normative change by ID
   */
  static async getNormativeChangeById(id: string): Promise<NormativeChange> {
    const response = await apiClient.get<NormativeChange>(
      API_ENDPOINTS.NORMATIVE_CHANGES.DETAIL(id)
    )
    return response.data
  }

  /**
   * Get normative changes statistics
   */
  static async getStatistics(): Promise<NormativeStatistics> {
    const response = await apiClient.get<NormativeStatistics>(
      API_ENDPOINTS.NORMATIVE_CHANGES.STATISTICS
    )
    return response.data
  }

  /**
   * Create new normative change (Admin only)
   */
  static async createNormativeChange(data: CreateNormativeChangeRequest): Promise<NormativeChange> {
    const response = await apiClient.post<NormativeChange>(
      API_ENDPOINTS.NORMATIVE_CHANGES.LIST,
      data
    )
    return response.data
  }

  /**
   * Apply normative change (Admin only)
   */
  static async applyNormativeChange(id: string): Promise<NormativeChange> {
    const response = await apiClient.post<NormativeChange>(
      API_ENDPOINTS.NORMATIVE_CHANGES.APPLY(id)
    )
    return response.data
  }

  /**
   * Archive normative change (Admin only)
   */
  static async archiveNormativeChange(id: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.NORMATIVE_CHANGES.ARCHIVE(id))
  }

  /**
   * Delete normative change (Admin only)
   */
  static async deleteNormativeChange(id: string, reason?: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.NORMATIVE_CHANGES.DETAIL(id), {
      params: { reason }
    })
  }
}

export default NormativeService
