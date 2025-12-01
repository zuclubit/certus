/**
 * Catalog Service - Real API Implementation
 *
 * Handles CONSAR catalog operations against Certus API v1
 * Provides access to regulatory catalogs (AFOREs, accounts, etc.)
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { Catalog, CatalogEntry, PaginatedResponse, ApiResponse } from '@/types'

// ============================================
// TYPES
// ============================================

export interface CatalogFilters {
  page?: number
  pageSize?: number
  search?: string
  source?: string
  isActive?: boolean
}

export interface CatalogEntryFilters {
  page?: number
  pageSize?: number
  search?: string
  status?: 'active' | 'inactive'
}

export interface CatalogSource {
  code: string
  name: string
  description: string
  catalogCount: number
}

export interface CreateCatalogData {
  code: string
  name: string
  description?: string
  version?: string
  source?: string
}

// ============================================
// SERVICE
// ============================================

export class CatalogService {
  /**
   * Get all catalogs with optional filters
   */
  static async getCatalogs(params?: CatalogFilters): Promise<PaginatedResponse<Catalog>> {
    const response = await apiClient.get<PaginatedResponse<Catalog>>(
      API_ENDPOINTS.CATALOGS.LIST,
      { params }
    )

    return response.data
  }

  /**
   * Create a new catalog
   */
  static async createCatalog(data: CreateCatalogData): Promise<ApiResponse<Catalog>> {
    const response = await apiClient.post<Catalog>(API_ENDPOINTS.CATALOGS.CREATE, data)

    return {
      success: true,
      data: response.data,
      message: 'Catalog created successfully',
    }
  }

  /**
   * Delete a catalog (soft delete with justification for audit)
   */
  static async deleteCatalog(id: string, justification: string): Promise<ApiResponse<void>> {
    await apiClient.delete(API_ENDPOINTS.CATALOGS.DELETE(id), {
      data: { justification },
    })

    return {
      success: true,
      data: undefined,
      message: 'Catalog deleted successfully',
    }
  }

  /**
   * Get catalog by ID
   */
  static async getCatalogById(id: string): Promise<ApiResponse<Catalog>> {
    const response = await apiClient.get<Catalog>(API_ENDPOINTS.CATALOGS.DETAIL(id))

    return {
      success: true,
      data: response.data,
      message: 'Catalog retrieved successfully',
    }
  }

  /**
   * Get catalog by code (e.g., 'AFORES', 'FILE_TYPES', etc.)
   */
  static async getCatalogByCode(code: string): Promise<ApiResponse<Catalog>> {
    const response = await apiClient.get<Catalog>(API_ENDPOINTS.CATALOGS.BY_CODE(code))

    return {
      success: true,
      data: response.data,
      message: 'Catalog retrieved successfully',
    }
  }

  /**
   * Get catalogs by source (e.g., 'CONSAR', 'SAT', 'INTERNAL')
   */
  static async getCatalogsBySource(source: string): Promise<ApiResponse<Catalog[]>> {
    const response = await apiClient.get<Catalog[]>(API_ENDPOINTS.CATALOGS.BY_SOURCE(source))

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} catalogs from ${source}`,
    }
  }

  /**
   * Get catalog entries
   */
  static async getCatalogEntries(
    catalogId: string,
    params?: CatalogEntryFilters
  ): Promise<PaginatedResponse<CatalogEntry>> {
    const response = await apiClient.get<PaginatedResponse<CatalogEntry>>(
      API_ENDPOINTS.CATALOGS.ENTRIES(catalogId),
      { params }
    )

    return response.data
  }

  /**
   * Search catalog entries
   */
  static async searchCatalogEntries(
    catalogId: string,
    query: string
  ): Promise<ApiResponse<CatalogEntry[]>> {
    const response = await apiClient.get<CatalogEntry[]>(
      API_ENDPOINTS.CATALOGS.SEARCH_ENTRIES(catalogId),
      { params: { q: query } }
    )

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} entries`,
    }
  }

  /**
   * Get entry by code within a catalog
   */
  static async getEntryByCode(
    catalogId: string,
    code: string
  ): Promise<ApiResponse<CatalogEntry | null>> {
    const entries = await this.searchCatalogEntries(catalogId, code)
    const entry = entries.data.find((e) => e.code === code) || null

    return {
      success: true,
      data: entry,
      message: entry ? 'Entry found' : 'Entry not found',
    }
  }

  /**
   * Validate entry exists in catalog
   */
  static async validateEntry(catalogCode: string, entryCode: string): Promise<boolean> {
    try {
      const catalog = await this.getCatalogByCode(catalogCode)
      if (!catalog.data) return false

      const entry = await this.getEntryByCode(catalog.data.id, entryCode)
      return entry.data !== null && entry.data.status === 'active'
    } catch {
      return false
    }
  }

  /**
   * Get all AFOREs (convenience method)
   */
  static async getAfores(): Promise<ApiResponse<CatalogEntry[]>> {
    const catalog = await this.getCatalogByCode('AFORES')
    if (!catalog.data) {
      return {
        success: false,
        data: [],
        message: 'AFOREs catalog not found',
      }
    }

    const entries = await this.getCatalogEntries(catalog.data.id, {
      status: 'active',
      pageSize: 100,
    })

    return {
      success: true,
      data: entries.data,
      message: `Found ${entries.data.length} AFOREs`,
    }
  }

  /**
   * Get file types (convenience method)
   */
  static async getFileTypes(): Promise<ApiResponse<CatalogEntry[]>> {
    const catalog = await this.getCatalogByCode('FILE_TYPES')
    if (!catalog.data) {
      return {
        success: false,
        data: [],
        message: 'File types catalog not found',
      }
    }

    const entries = await this.getCatalogEntries(catalog.data.id, {
      status: 'active',
      pageSize: 100,
    })

    return {
      success: true,
      data: entries.data,
      message: `Found ${entries.data.length} file types`,
    }
  }

  /**
   * Get validation statuses (convenience method)
   */
  static async getValidationStatuses(): Promise<ApiResponse<CatalogEntry[]>> {
    const catalog = await this.getCatalogByCode('VALIDATION_STATUSES')
    if (!catalog.data) {
      return {
        success: false,
        data: [],
        message: 'Validation statuses catalog not found',
      }
    }

    const entries = await this.getCatalogEntries(catalog.data.id, {
      status: 'active',
      pageSize: 100,
    })

    return {
      success: true,
      data: entries.data,
      message: `Found ${entries.data.length} statuses`,
    }
  }

  /**
   * Get account types (convenience method)
   */
  static async getAccountTypes(): Promise<ApiResponse<CatalogEntry[]>> {
    const catalog = await this.getCatalogByCode('ACCOUNT_TYPES')
    if (!catalog.data) {
      return {
        success: false,
        data: [],
        message: 'Account types catalog not found',
      }
    }

    const entries = await this.getCatalogEntries(catalog.data.id, {
      status: 'active',
      pageSize: 100,
    })

    return {
      success: true,
      data: entries.data,
      message: `Found ${entries.data.length} account types`,
    }
  }
}

export default CatalogService
