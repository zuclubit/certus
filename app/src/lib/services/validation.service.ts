/**
 * Validation Service (Mock Implementation)
 *
 * Clean Architecture - Application Layer
 * Simulates API calls with realistic delays and responses
 * Uses mock data generators for realistic data
 */

import type {
  Validation,
  ValidationDetail,
  PaginatedResponse,
  ApiResponse,
  FileUploadForm,
} from '@/types'
import type { ValidationStatus, FileType } from '@/lib/constants'
import {
  generateValidations,
  generateValidationDetail,
  generateValidation,
  sanitizeString,
  secureRandomId,
} from '@/lib/mock/validation.mock.enhanced'

// Simulated in-memory storage
let mockValidationsStore: Validation[] = initializeMockData()

/**
 * Initialize mock data with version chains for testing
 * Generates 100+ records with realistic CONSAR 2025 data
 */
function initializeMockData(): Validation[] {
  const validations = generateValidations(120) // Generate 120 base records

  // Create multiple version chain examples to demonstrate CONSAR versioning workflow

  // VERSION CHAIN 1: NOMINA (3 versions - complete correction workflow)
  const chain1_v1_id = secureRandomId()
  const chain1_v1 = generateValidation({
    id: chain1_v1_id,
    fileName: 'NOMINA_ABC010101ABC_20250110_0001_v1.txt',
    fileType: 'NOMINA',
    status: 'error',
    errorCount: 120,
    warningCount: 15,
    recordCount: 5000,
    validRecordCount: 4880,
    uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    version: 1,
    isOriginal: true,
    isSubstitute: false,
    consarDirectory: 'RECEPCION',
  })

  const chain1_v2_id = secureRandomId()
  const chain1_v2 = generateValidation({
    id: chain1_v2_id,
    fileName: 'NOMINA_ABC010101ABC_20250110_0001_v2.txt',
    fileType: 'NOMINA',
    status: 'warning',
    errorCount: 0,
    warningCount: 35,
    recordCount: 5000,
    validRecordCount: 5000,
    uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    version: 2,
    isOriginal: false,
    isSubstitute: true,
    replacesId: chain1_v1_id,
    substitutionReason: 'Corrección de 120 registros con CURPs inválidas detectadas por validador NOMINA_VAL_02. Se actualizaron campos CURP en líneas 234-354 para cumplir con formato oficial de 18 caracteres establecido por RENAPO.',
    consarDirectory: 'RETRANSMISION',
  })

  const chain1_v3_id = secureRandomId()
  const chain1_v3 = generateValidation({
    id: chain1_v3_id,
    fileName: 'NOMINA_ABC010101ABC_20250110_0001_v3.txt',
    fileType: 'NOMINA',
    status: 'success',
    errorCount: 0,
    warningCount: 0,
    recordCount: 5000,
    validRecordCount: 5000,
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    validatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    version: 3,
    isOriginal: false,
    isSubstitute: true,
    replacesId: chain1_v2_id,
    substitutionReason: 'Corrección final de advertencias NOMINA_VAL_13 relacionadas con nombres de trabajadores menores a 5 caracteres. Se completaron 35 registros con apellido materno faltante conforme a documentación oficial.',
    consarDirectory: 'RETRANSMISION',
  })

  chain1_v1.replacedById = chain1_v2_id
  chain1_v1.supersededAt = chain1_v2.uploadedAt
  chain1_v2.replacedById = chain1_v3_id
  chain1_v2.supersededAt = chain1_v3.uploadedAt

  // VERSION CHAIN 2: CONTABLE (2 versions - still has warnings)
  const chain2_v1_id = secureRandomId()
  const chain2_v1 = generateValidation({
    id: chain2_v1_id,
    fileName: 'CONTABLE_XYZ990101XYZ_20250112_0023_v1.txt',
    fileType: 'CONTABLE',
    status: 'error',
    errorCount: 85,
    warningCount: 12,
    recordCount: 3500,
    validRecordCount: 3415,
    uploadedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    version: 1,
    isOriginal: true,
    isSubstitute: false,
    consarDirectory: 'RECEPCION',
  })

  const chain2_v2_id = secureRandomId()
  const chain2_v2 = generateValidation({
    id: chain2_v2_id,
    fileName: 'CONTABLE_XYZ990101XYZ_20250112_0023_v2.txt',
    fileType: 'CONTABLE',
    status: 'warning',
    errorCount: 0,
    warningCount: 18,
    recordCount: 3500,
    validRecordCount: 3500,
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    version: 2,
    isOriginal: false,
    isSubstitute: true,
    replacesId: chain2_v1_id,
    substitutionReason: 'Corrección de errores en códigos de cuenta contable. 85 registros tenían códigos inválidos que no cumplen CONTABLE_VAL_04 (4 dígitos numéricos). Se actualizaron conforme al catálogo SAT vigente.',
    consarDirectory: 'RETRANSMISION',
  })

  chain2_v1.replacedById = chain2_v2_id
  chain2_v1.supersededAt = chain2_v2.uploadedAt

  // VERSION CHAIN 3: REGULARIZACION (2 versions - corrected successfully)
  const chain3_v1_id = secureRandomId()
  const chain3_v1 = generateValidation({
    id: chain3_v1_id,
    fileName: 'REGULARIZACION_DEF850303DEF_20250108_0005_v1.txt',
    fileType: 'REGULARIZACION',
    status: 'error',
    errorCount: 45,
    warningCount: 8,
    recordCount: 1200,
    validRecordCount: 1155,
    uploadedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    version: 1,
    isOriginal: true,
    isSubstitute: false,
    consarDirectory: 'RECEPCION',
  })

  const chain3_v2_id = secureRandomId()
  const chain3_v2 = generateValidation({
    id: chain3_v2_id,
    fileName: 'REGULARIZACION_DEF850303DEF_20250108_0005_v2.txt',
    fileType: 'REGULARIZACION',
    status: 'success',
    errorCount: 0,
    warningCount: 0,
    recordCount: 1200,
    validRecordCount: 1200,
    uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    validatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    version: 2,
    isOriginal: false,
    isSubstitute: true,
    replacesId: chain3_v1_id,
    substitutionReason: 'Corrección de fechas de corrección inválidas que violaban REGULARIZACION_VAL_05. 45 registros tenían fecha de corrección anterior a fecha original. Se ajustaron fechas conforme a documentación de autorización CONSAR.',
    consarDirectory: 'RETRANSMISION',
  })

  chain3_v1.replacedById = chain3_v2_id
  chain3_v1.supersededAt = chain3_v2.uploadedAt

  // VERSION CHAIN 4: NOMINA (still in error state, needs correction)
  const chain4_v1_id = secureRandomId()
  const chain4_v1 = generateValidation({
    id: chain4_v1_id,
    fileName: 'NOMINA_GHI750505GHI_20250118_0042_v1.txt',
    fileType: 'NOMINA',
    status: 'error',
    errorCount: 200,
    warningCount: 30,
    recordCount: 8000,
    validRecordCount: 7800,
    uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    version: 1,
    isOriginal: true,
    isSubstitute: false,
    consarDirectory: 'RECEPCION',
  })

  const chain4_v2_id = secureRandomId()
  const chain4_v2 = generateValidation({
    id: chain4_v2_id,
    fileName: 'NOMINA_GHI750505GHI_20250118_0042_v2.txt',
    fileType: 'NOMINA',
    status: 'error',
    errorCount: 95,
    warningCount: 20,
    recordCount: 8000,
    validRecordCount: 7905,
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    version: 2,
    isOriginal: false,
    isSubstitute: true,
    replacesId: chain4_v1_id,
    substitutionReason: 'Primera corrección parcial. Se corrigieron 105 NSS inválidos de 200 errores totales detectados por NOMINA_VAL_01. Requiere segunda corrección para resolver NSS duplicados y fechas de pago futuras.',
    consarDirectory: 'RETRANSMISION',
  })

  chain4_v1.replacedById = chain4_v2_id
  chain4_v1.supersededAt = chain4_v2.uploadedAt

  // Add all version chains to store (newest first for each chain)
  validations.unshift(
    chain1_v3, chain1_v2, chain1_v1,
    chain2_v2, chain2_v1,
    chain3_v2, chain3_v1,
    chain4_v2, chain4_v1
  )

  return validations
}

/**
 * Simulate network delay
 */
const simulateDelay = (ms: number = 800): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Validation Service Interface
 */
export class ValidationService {
  /**
   * Get paginated list of validations with optional filters
   */
  static async getValidations(params: {
    page?: number
    pageSize?: number
    status?: ValidationStatus[]
    fileType?: FileType[]
    search?: string
    sortBy?: 'uploadedAt' | 'fileName' | 'status'
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<Validation>> {
    await simulateDelay(600)

    const {
      page = 1,
      pageSize = 10,
      status,
      fileType,
      search,
      sortBy = 'uploadedAt',
      sortOrder = 'desc',
    } = params

    // Filter validations (exclude soft-deleted records)
    let filtered = mockValidationsStore.filter((v) => !(v as any).isDeleted)

    if (status && status.length > 0) {
      filtered = filtered.filter((v) => status.includes(v.status))
    }

    if (fileType && fileType.length > 0) {
      filtered = filtered.filter((v) => fileType.includes(v.fileType))
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (v) =>
          v.fileName.toLowerCase().includes(searchLower) ||
          v.uploadedBy.toLowerCase().includes(searchLower)
      )
    }

    // Sort validations
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'uploadedAt':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
        case 'fileName':
          comparison = a.fileName.localeCompare(b.fileName)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Paginate
    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const data = filtered.slice(start, end)

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  /**
   * Get validation detail by ID
   */
  static async getValidationById(id: string): Promise<ApiResponse<ValidationDetail>> {
    await simulateDelay(800)

    const validation = mockValidationsStore.find((v) => v.id === id)

    if (!validation) {
      throw new Error(`Validation with id ${id} not found`)
    }

    const detail = generateValidationDetail(id)

    return {
      success: true,
      data: detail,
      message: 'Validation detail retrieved successfully',
    }
  }

  /**
   * Upload file for validation
   */
  static async uploadFile(formData: FileUploadForm): Promise<ApiResponse<Validation>> {
    await simulateDelay(1500)

    const { files, fileType } = formData

    if (files.length === 0) {
      throw new Error('No files provided')
    }

    const file = files[0]

    // Create new validation with processing status
    const newValidation = generateValidation({
      fileName: file.name,
      fileType,
      fileSize: file.size,
      status: 'processing',
      uploadedAt: new Date().toISOString(),
      progress: 0,
    })

    // Add to store
    mockValidationsStore.unshift(newValidation)

    // Simulate async processing
    this.simulateProcessing(newValidation.id)

    return {
      success: true,
      data: newValidation,
      message: 'File uploaded successfully and validation started',
    }
  }

  /**
   * Simulate file processing with progress updates
   */
  private static async simulateProcessing(id: string): Promise<void> {
    // Simulate processing stages
    const stages = [
      { progress: 10, delay: 500 },
      { progress: 25, delay: 800 },
      { progress: 45, delay: 1000 },
      { progress: 60, delay: 1200 },
      { progress: 75, delay: 900 },
      { progress: 90, delay: 600 },
      { progress: 100, delay: 400 },
    ]

    for (const stage of stages) {
      await simulateDelay(stage.delay)

      const validation = mockValidationsStore.find((v) => v.id === id)
      if (validation) {
        validation.progress = stage.progress
      }
    }

    // Complete processing
    await simulateDelay(500)
    const validation = mockValidationsStore.find((v) => v.id === id)
    if (validation) {
      // Randomly assign final status
      const finalStatus = Math.random() > 0.7 ? 'success' : Math.random() > 0.5 ? 'error' : 'warning'

      validation.status = finalStatus
      validation.processedAt = new Date().toISOString()
      validation.validatedAt = finalStatus === 'success' ? new Date().toISOString() : undefined
      validation.progress = undefined

      // Generate realistic error/warning counts
      if (finalStatus === 'error') {
        validation.errorCount = Math.floor(Math.random() * 200) + 10
        validation.warningCount = Math.floor(Math.random() * 30)
        validation.validRecordCount = validation.recordCount - validation.errorCount
      } else if (finalStatus === 'warning') {
        validation.errorCount = 0
        validation.warningCount = Math.floor(Math.random() * 50) + 5
        validation.validRecordCount = validation.recordCount
      } else {
        validation.errorCount = 0
        validation.warningCount = 0
        validation.validRecordCount = validation.recordCount
      }
    }
  }

  /**
   * Retry validation
   */
  static async retryValidation(id: string): Promise<ApiResponse<Validation>> {
    await simulateDelay(500)

    const validation = mockValidationsStore.find((v) => v.id === id)

    if (!validation) {
      throw new Error(`Validation with id ${id} not found`)
    }

    // Reset to processing
    validation.status = 'processing'
    validation.progress = 0
    validation.processedAt = undefined
    validation.validatedAt = undefined

    // Simulate processing
    this.simulateProcessing(id)

    return {
      success: true,
      data: validation,
      message: 'Validation retry started',
    }
  }

  /**
   * Delete validation (soft delete with justification)
   * Complies with financial regulations requiring audit trail
   */
  static async deleteValidation(
    id: string,
    justification?: string
  ): Promise<ApiResponse<void>> {
    await simulateDelay(400)

    const validation = mockValidationsStore.find((v) => v.id === id)

    if (!validation) {
      throw new Error(`Validation with id ${id} not found`)
    }

    // Soft delete: Mark as deleted instead of removing from array
    // This maintains audit trail as required by compliance regulations
    ;(validation as any).deletedAt = new Date().toISOString()
    ;(validation as any).deletedBy = 'Admin User' // TODO: Get from auth context
    ;(validation as any).deleteReason = justification || 'No reason provided'
    ;(validation as any).isDeleted = true

    // Log audit trail
    console.log('[AUDIT] Validation soft deleted:', {
      id: validation.id,
      fileName: validation.fileName,
      deletedAt: (validation as any).deletedAt,
      deletedBy: (validation as any).deletedBy,
      reason: justification,
    })

    return {
      success: true,
      data: undefined,
      message: 'Validation deleted successfully',
    }
  }

  /**
   * Get validation statistics
   */
  static async getStatistics(): Promise<ApiResponse<{
    total: number
    processing: number
    success: number
    error: number
    warning: number
    pending: number
  }>> {
    await simulateDelay(300)

    const stats = {
      total: mockValidationsStore.length,
      processing: mockValidationsStore.filter((v) => v.status === 'processing').length,
      success: mockValidationsStore.filter((v) => v.status === 'success').length,
      error: mockValidationsStore.filter((v) => v.status === 'error').length,
      warning: mockValidationsStore.filter((v) => v.status === 'warning').length,
      pending: mockValidationsStore.filter((v) => v.status === 'pending').length,
    }

    return {
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully',
    }
  }

  /**
   * Download validation report
   */
  static async downloadReport(
    id: string,
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<ApiResponse<{ url: string; fileName: string }>> {
    await simulateDelay(1200)

    const validation = mockValidationsStore.find((v) => v.id === id)

    if (!validation) {
      throw new Error(`Validation with id ${id} not found`)
    }

    // Simulate file generation
    const fileName = `${validation.fileName.replace('.txt', '')}_report.${format}`
    const url = `blob:${window.location.origin}/${Math.random().toString(36).substr(2, 9)}`

    return {
      success: true,
      data: { url, fileName },
      message: 'Report generated successfully',
    }
  }

  /**
   * Batch upload files
   */
  static async batchUpload(
    files: File[],
    fileType: FileType
  ): Promise<ApiResponse<Validation[]>> {
    await simulateDelay(2000)

    const validations: Validation[] = []

    for (const file of files) {
      const newValidation = generateValidation({
        fileName: file.name,
        fileType,
        fileSize: file.size,
        status: 'processing',
        uploadedAt: new Date().toISOString(),
        progress: 0,
      })

      mockValidationsStore.unshift(newValidation)
      validations.push(newValidation)

      // Simulate processing
      this.simulateProcessing(newValidation.id)
    }

    return {
      success: true,
      data: validations,
      message: `${files.length} files uploaded successfully`,
    }
  }

  /**
   * Search validations by file name or user
   */
  static async searchValidations(query: string): Promise<ApiResponse<Validation[]>> {
    await simulateDelay(400)

    const searchLower = query.toLowerCase()
    const results = mockValidationsStore.filter(
      (v) =>
        v.fileName.toLowerCase().includes(searchLower) ||
        v.uploadedBy.toLowerCase().includes(searchLower)
    )

    return {
      success: true,
      data: results.slice(0, 20), // Limit to 20 results
      message: `Found ${results.length} results`,
    }
  }

  /**
   * Get recent validations
   */
  static async getRecentValidations(limit: number = 5): Promise<ApiResponse<Validation[]>> {
    await simulateDelay(300)

    const recent = [...mockValidationsStore]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, limit)

    return {
      success: true,
      data: recent,
      message: 'Recent validations retrieved successfully',
    }
  }

  /**
   * Clear all validations (for testing)
   */
  static async clearAll(): Promise<ApiResponse<void>> {
    await simulateDelay(200)

    mockValidationsStore = []

    return {
      success: true,
      data: undefined,
      message: 'All validations cleared',
    }
  }

  /**
   * Reset to initial mock data (for testing)
   */
  static async resetMockData(): Promise<ApiResponse<void>> {
    await simulateDelay(200)

    mockValidationsStore = initializeMockData()

    return {
      success: true,
      data: undefined,
      message: 'Mock data reset successfully',
    }
  }

  /**
   * Create corrected version (substitute file)
   * Complies with CONSAR Circular 19-8 - RETRANSMISION process
   */
  static async createCorrectedVersion(
    id: string,
    reason: string
  ): Promise<ApiResponse<Validation>> {
    await simulateDelay(800)

    const originalValidation = mockValidationsStore.find((v) => v.id === id)

    if (!originalValidation) {
      throw new Error(`Validation with id ${id} not found`)
    }

    // Cannot create version of a soft-deleted record
    if ((originalValidation as any).isDeleted) {
      throw new Error('Cannot create version of deleted validation')
    }

    // Create new validation as substitute
    const currentVersion = originalValidation.version || 1
    const newVersion = currentVersion + 1

    const correctedValidation = generateValidation({
      fileName: originalValidation.fileName.replace(/\.txt$/, `_v${newVersion}.txt`),
      fileType: originalValidation.fileType,
      fileSize: originalValidation.fileSize,
      status: 'pending', // Needs to be re-validated
      uploadedAt: new Date().toISOString(),
      progress: undefined,
    })

    // Set versioning metadata
    correctedValidation.version = newVersion
    correctedValidation.isOriginal = false
    correctedValidation.isSubstitute = true
    correctedValidation.replacesId = id
    correctedValidation.substitutionReason = reason

    // Set CONSAR metadata
    correctedValidation.consarDirectory = 'RETRANSMISION'
    correctedValidation.requiresAuthorization = false // Will be determined by timing

    // Mark original as superseded
    originalValidation.supersededAt = new Date().toISOString()
    originalValidation.replacedById = correctedValidation.id

    // Add to store
    mockValidationsStore.unshift(correctedValidation)

    // Log audit trail
    console.log('[AUDIT] Corrected version created:', {
      originalId: id,
      newId: correctedValidation.id,
      version: newVersion,
      reason,
      originalVersion: currentVersion,
    })

    return {
      success: true,
      data: correctedValidation,
      message: `Corrected version v${newVersion} created successfully`,
    }
  }

  /**
   * Get version chain for a validation
   * Returns all versions (original + substitutes)
   */
  static async getVersionChain(id: string): Promise<ApiResponse<Validation[]>> {
    await simulateDelay(400)

    const validation = mockValidationsStore.find((v) => v.id === id)

    if (!validation) {
      throw new Error(`Validation with id ${id} not found`)
    }

    const chain: Validation[] = []

    // Find the original (root) version
    let currentId = validation.replacesId || id
    let current = mockValidationsStore.find((v) => v.id === currentId)

    // Go back to find original
    while (current && current.replacesId) {
      currentId = current.replacesId
      current = mockValidationsStore.find((v) => v.id === currentId)
    }

    // Now traverse forward collecting all versions
    if (current) {
      chain.push(current)

      // Find all substitutes
      let nextId = current.replacedById
      while (nextId) {
        const next = mockValidationsStore.find((v) => v.id === nextId)
        if (next) {
          chain.push(next)
          nextId = next.replacedById
        } else {
          break
        }
      }
    }

    return {
      success: true,
      data: chain,
      message: `Found ${chain.length} versions in chain`,
    }
  }
}
