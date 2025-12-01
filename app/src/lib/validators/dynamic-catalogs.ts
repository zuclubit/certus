/**
 * Dynamic Catalogs for CONSAR Validation
 *
 * This module provides a system for dynamically loading and updating
 * validation catalogs from external sources (API, files, etc.)
 *
 * Features:
 * - Cache management with TTL
 * - API integration for catalog updates
 * - Fallback to static catalogs
 * - Event-based catalog refresh
 *
 * @module dynamic-catalogs
 * @compliance CONSAR Circular 19-8
 */

import {
  AFORE_CATALOG,
  MOVEMENT_TYPE_CATALOG,
  SUBCUENTA_CATALOG,
  FILE_TYPE_CONFIG,
  type AFOREInfo,
  type MovementTypeInfo,
  type SubcuentaInfo,
  type FileTypeConfig,
} from './consar-error-catalog'

// ============================================
// TYPES
// ============================================

export interface CatalogCache<T> {
  data: T
  lastUpdated: Date
  expiresAt: Date
  source: 'static' | 'api' | 'file'
}

export interface CatalogUpdateResult {
  success: boolean
  source: string
  itemCount: number
  timestamp: Date
  error?: string
}

export interface DynamicCatalogOptions {
  apiBaseUrl?: string
  cacheMinutes?: number
  autoRefresh?: boolean
  onUpdate?: (catalogName: string, result: CatalogUpdateResult) => void
}

// ============================================
// CATALOG MANAGER CLASS
// ============================================

export class DynamicCatalogManager {
  private options: Required<DynamicCatalogOptions>
  private aforeCache: CatalogCache<Record<string, AFOREInfo>> | null = null
  private movementTypeCache: CatalogCache<Record<string, MovementTypeInfo>> | null = null
  private subcuentaCache: CatalogCache<Record<string, SubcuentaInfo>> | null = null
  private fileTypeCache: CatalogCache<Record<string, FileTypeConfig>> | null = null

  constructor(options: DynamicCatalogOptions = {}) {
    this.options = {
      apiBaseUrl: options.apiBaseUrl || '/api/v1/catalogs',
      cacheMinutes: options.cacheMinutes || 60, // 1 hour default
      autoRefresh: options.autoRefresh ?? false,
      onUpdate: options.onUpdate || (() => {}),
    }

    // Initialize with static catalogs
    this.initializeStaticCatalogs()
  }

  /**
   * Initialize caches with static catalog data
   */
  private initializeStaticCatalogs(): void {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.options.cacheMinutes * 60 * 1000)

    this.aforeCache = {
      data: { ...AFORE_CATALOG },
      lastUpdated: now,
      expiresAt,
      source: 'static',
    }

    this.movementTypeCache = {
      data: { ...MOVEMENT_TYPE_CATALOG },
      lastUpdated: now,
      expiresAt,
      source: 'static',
    }

    this.subcuentaCache = {
      data: { ...SUBCUENTA_CATALOG },
      lastUpdated: now,
      expiresAt,
      source: 'static',
    }

    this.fileTypeCache = {
      data: { ...FILE_TYPE_CONFIG },
      lastUpdated: now,
      expiresAt,
      source: 'static',
    }
  }

  /**
   * Check if cache is expired
   */
  private isCacheExpired<T>(cache: CatalogCache<T> | null): boolean {
    if (!cache) return true
    return new Date() > cache.expiresAt
  }

  /**
   * Get AFORE catalog (with auto-refresh if needed)
   */
  async getAFORECatalog(): Promise<Record<string, AFOREInfo>> {
    if (this.isCacheExpired(this.aforeCache) && this.options.autoRefresh) {
      await this.refreshAFORECatalog()
    }
    return this.aforeCache?.data || AFORE_CATALOG
  }

  /**
   * Get active AFOREs only
   */
  async getActiveAFOREs(): Promise<AFOREInfo[]> {
    const catalog = await this.getAFORECatalog()
    return Object.values(catalog).filter((afore) => afore.active)
  }

  /**
   * Validate AFORE code against current catalog
   */
  async isValidAFORECode(code: string): Promise<boolean> {
    const catalog = await this.getAFORECatalog()
    const afore = catalog[code]
    return afore !== undefined && afore.active
  }

  /**
   * Get AFORE info by code
   */
  async getAFOREInfo(code: string): Promise<AFOREInfo | null> {
    const catalog = await this.getAFORECatalog()
    return catalog[code] || null
  }

  /**
   * Refresh AFORE catalog from API
   */
  async refreshAFORECatalog(): Promise<CatalogUpdateResult> {
    try {
      const response = await fetch(`${this.options.apiBaseUrl}/afores`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const now = new Date()

      // Transform API response to catalog format
      const catalogData: Record<string, AFOREInfo> = {}
      for (const item of data.items || data) {
        catalogData[item.code] = {
          code: item.code,
          name: item.name,
          rfc: item.rfc,
          active: item.active ?? true,
        }
      }

      this.aforeCache = {
        data: catalogData,
        lastUpdated: now,
        expiresAt: new Date(now.getTime() + this.options.cacheMinutes * 60 * 1000),
        source: 'api',
      }

      const result: CatalogUpdateResult = {
        success: true,
        source: 'api',
        itemCount: Object.keys(catalogData).length,
        timestamp: now,
      }

      this.options.onUpdate('afore', result)
      return result
    } catch (error) {
      const result: CatalogUpdateResult = {
        success: false,
        source: 'api',
        itemCount: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }

      this.options.onUpdate('afore', result)
      return result
    }
  }

  /**
   * Get movement type catalog
   */
  async getMovementTypeCatalog(): Promise<Record<string, MovementTypeInfo>> {
    if (this.isCacheExpired(this.movementTypeCache) && this.options.autoRefresh) {
      await this.refreshMovementTypeCatalog()
    }
    return this.movementTypeCache?.data || MOVEMENT_TYPE_CATALOG
  }

  /**
   * Validate movement type for file type
   */
  async isValidMovementType(
    movementCode: string,
    fileType: string
  ): Promise<boolean> {
    const catalog = await this.getMovementTypeCatalog()
    const movement = catalog[movementCode]
    return movement !== undefined && movement.fileTypes.includes(fileType)
  }

  /**
   * Refresh movement type catalog from API
   */
  async refreshMovementTypeCatalog(): Promise<CatalogUpdateResult> {
    try {
      const response = await fetch(`${this.options.apiBaseUrl}/movement-types`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const now = new Date()

      const catalogData: Record<string, MovementTypeInfo> = {}
      for (const item of data.items || data) {
        catalogData[item.code] = {
          code: item.code,
          name: item.name,
          description: item.description,
          requiresAmount: item.requiresAmount ?? true,
          fileTypes: item.fileTypes || [],
        }
      }

      this.movementTypeCache = {
        data: catalogData,
        lastUpdated: now,
        expiresAt: new Date(now.getTime() + this.options.cacheMinutes * 60 * 1000),
        source: 'api',
      }

      const result: CatalogUpdateResult = {
        success: true,
        source: 'api',
        itemCount: Object.keys(catalogData).length,
        timestamp: now,
      }

      this.options.onUpdate('movementType', result)
      return result
    } catch (error) {
      return {
        success: false,
        source: 'api',
        itemCount: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get subcuenta catalog
   */
  async getSubcuentaCatalog(): Promise<Record<string, SubcuentaInfo>> {
    return this.subcuentaCache?.data || SUBCUENTA_CATALOG
  }

  /**
   * Get file type configuration
   */
  async getFileTypeConfig(fileType: string): Promise<FileTypeConfig | null> {
    const catalog = this.fileTypeCache?.data || FILE_TYPE_CONFIG
    return catalog[fileType] || null
  }

  /**
   * Get all supported file types
   */
  async getSupportedFileTypes(): Promise<string[]> {
    const catalog = this.fileTypeCache?.data || FILE_TYPE_CONFIG
    return Object.keys(catalog)
  }

  /**
   * Manually update AFORE catalog (for testing or admin purposes)
   */
  updateAFORECatalog(afores: AFOREInfo[]): void {
    const catalogData: Record<string, AFOREInfo> = {}
    for (const afore of afores) {
      catalogData[afore.code] = afore
    }

    const now = new Date()
    this.aforeCache = {
      data: catalogData,
      lastUpdated: now,
      expiresAt: new Date(now.getTime() + this.options.cacheMinutes * 60 * 1000),
      source: 'file',
    }
  }

  /**
   * Get cache status for all catalogs
   */
  getCacheStatus(): Record<string, { expired: boolean; source: string; lastUpdated: Date }> {
    return {
      afore: {
        expired: this.isCacheExpired(this.aforeCache),
        source: this.aforeCache?.source || 'none',
        lastUpdated: this.aforeCache?.lastUpdated || new Date(0),
      },
      movementType: {
        expired: this.isCacheExpired(this.movementTypeCache),
        source: this.movementTypeCache?.source || 'none',
        lastUpdated: this.movementTypeCache?.lastUpdated || new Date(0),
      },
      subcuenta: {
        expired: this.isCacheExpired(this.subcuentaCache),
        source: this.subcuentaCache?.source || 'none',
        lastUpdated: this.subcuentaCache?.lastUpdated || new Date(0),
      },
      fileType: {
        expired: this.isCacheExpired(this.fileTypeCache),
        source: this.fileTypeCache?.source || 'none',
        lastUpdated: this.fileTypeCache?.lastUpdated || new Date(0),
      },
    }
  }

  /**
   * Force refresh all catalogs
   */
  async refreshAllCatalogs(): Promise<Record<string, CatalogUpdateResult>> {
    const results = await Promise.all([
      this.refreshAFORECatalog(),
      this.refreshMovementTypeCatalog(),
    ])

    return {
      afore: results[0],
      movementType: results[1],
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let catalogManagerInstance: DynamicCatalogManager | null = null

/**
 * Get or create the global catalog manager instance
 */
export function getCatalogManager(
  options?: DynamicCatalogOptions
): DynamicCatalogManager {
  if (!catalogManagerInstance) {
    catalogManagerInstance = new DynamicCatalogManager(options)
  }
  return catalogManagerInstance
}

/**
 * Reset the catalog manager instance (for testing)
 */
export function resetCatalogManager(): void {
  catalogManagerInstance = null
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Quick check if AFORE code is valid
 */
export async function isValidAFORE(code: string): Promise<boolean> {
  const manager = getCatalogManager()
  return manager.isValidAFORECode(code)
}

/**
 * Quick check if movement type is valid for file type
 */
export async function isValidMovement(
  movementCode: string,
  fileType: string
): Promise<boolean> {
  const manager = getCatalogManager()
  return manager.isValidMovementType(movementCode, fileType)
}

/**
 * Get AFORE name by code
 */
export async function getAFOREName(code: string): Promise<string> {
  const manager = getCatalogManager()
  const info = await manager.getAFOREInfo(code)
  return info?.name || 'Desconocida'
}

export default DynamicCatalogManager
