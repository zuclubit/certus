/**
 * Scraper Service - Real API Implementation
 *
 * Handles normative scraping operations for CONSAR changes
 * against Certus API v1
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'

// ============================================
// TYPES
// ============================================

// All ScraperSourceTypes matching backend enum
export type ScraperSourceType =
  // TIER 1: CONSAR Core
  | 'DOF'           // Diario Oficial de la Federación
  | 'SIDOF'         // Sistema de Información DOF
  | 'GobMxConsar'   // Portal GOB.MX CONSAR
  | 'SinorConsar'   // SINOR CONSAR
  | 'RssFeed'       // RSS Feed
  // TIER 2: Regulatorias
  | 'CNBV'          // Comisión Nacional Bancaria
  | 'SHCP'          // Secretaría de Hacienda
  | 'BANXICO'       // Banco de México
  | 'SAT'           // Servicio de Administración Tributaria
  | 'RENAPO'        // Registro Nacional de Población
  | 'IMSS'          // Instituto Mexicano del Seguro Social
  | 'INFONAVIT'     // Instituto del Fondo de Vivienda
  | 'INEGI'         // Estadística y Geografía
  | 'SEPOMEX'       // Servicio Postal
  | 'SPEI'          // Sistema de Pagos Electrónicos
  // TIER 3: PLD (Prevención Lavado)
  | 'OFAC'          // Office of Foreign Assets Control
  | 'UIF'           // Unidad de Inteligencia Financiera
  | 'ONU'           // Naciones Unidas
  // TIER 4: Técnicas y Operativas
  | 'ConsarPortal'  // Portal CONSAR
  | 'ConsarSISET'   // CONSAR SISET Estadísticas
  | 'PROCESAR'      // Base de Datos SAR
  | 'AMAFORE'       // Asociación Mexicana AFOREs
  | 'CONDUSEF'      // Protección Usuarios
  | 'IndicesFinancieros' // UDI, INPC, TIIE
  | 'SarLayouts'    // Layouts SAR
  // TIER 5: Mercados
  | 'BMV'           // Bolsa Mexicana de Valores
  | 'CNSF'          // Comisión de Seguros
  | 'PENSIONISSSTE' // Pensiones ISSSTE
  | 'IPAB'          // Protección al Ahorro
  | 'SIEFOREPrecios'// Precios SIEFOREs
  // TIER 6: Infraestructura
  | 'STPS'          // Secretaría del Trabajo
  | 'FOVISSSTE'     // Fondo de Vivienda ISSSTE
  | 'INDEVAL'       // Depósito de Valores
  | 'MEXDER'        // Mercado de Derivados
  | 'TablasActuariales' // Mortalidad, invalidez
  // TIER 7: Complementarios
  | 'COFECE'        // Competencia Económica
  | 'PRODECON'      // Defensa del Contribuyente
  | 'INAI'          // Protección de Datos
  | 'PROFECO'       // Protección al Consumidor
  | 'LeySAR'        // Marco Legal SAR
  | 'CONASAMI'      // Salarios Mínimos
  | 'ASF'           // Auditoría Superior
  | 'CETES'         // Valores Gubernamentales
  | 'VALMER'        // Valuación de Mercado
  | 'SHF'           // Sociedad Hipotecaria
  | 'SUA'           // Sistema Autodeterminación
  | 'IDSE'          // IMSS Desde Su Empresa
  | 'ExpedienteAfore' // Expediente Electrónico
  | 'LISIT'         // Lista Instituciones
  | 'PensionBienestar' // Pensión Universal
  | 'Custom'        // Personalizado
export type ScraperExecutionStatus = 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Cancelled'
export type ScrapedDocumentStatus = 'Pending' | 'Processing' | 'Processed' | 'Failed' | 'Ignored' | 'Duplicate'
export type ScraperFrequency = 'Hourly' | 'Every6Hours' | 'Every12Hours' | 'Daily' | 'Weekly' | 'Monthly' | 'Manual'

export interface ScraperSource {
  id: string
  name: string
  description?: string
  baseUrl: string
  endpointPath?: string
  sourceType: ScraperSourceType
  frequency: ScraperFrequency
  isEnabled: boolean
  lastExecutedAt?: string
  lastSuccessAt?: string
  nextScheduledAt?: string
  configuration?: Record<string, unknown>
  consecutiveFailures: number
  lastError?: string
  createdAt: string
  updatedAt?: string
}

export interface ScraperExecution {
  id: string
  sourceId: string
  sourceName: string
  status: ScraperExecutionStatus
  startedAt: string
  completedAt?: string
  documentsFound: number
  documentsNew: number
  documentsDuplicate: number
  documentsError: number
  errorMessage?: string
  errorStackTrace?: string
  executionLog?: string
  triggeredBy: string
}

export interface ScrapedDocument {
  id: string
  executionId: string
  sourceId: string
  sourceName: string
  externalId: string
  title: string
  description?: string
  code?: string
  publishDate?: string
  effectiveDate?: string
  category?: string
  status: ScrapedDocumentStatus
  documentUrl?: string
  pdfUrl?: string
  rawHtml?: string
  extractedText?: string
  metadata?: Record<string, unknown>
  hash?: string
  processingError?: string
  processedBy?: string
  processedAt?: string
  normativeChangeId?: string
  createdAt: string
}

export interface ScraperStatistics {
  totalSources: number
  activeSources: number
  disabledSources: number
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  totalDocuments: number
  pendingDocuments: number
  processedDocuments: number
  bySourceType: Record<ScraperSourceType, number>
  byStatus: Record<ScrapedDocumentStatus, number>
  last24HoursExecutions: number
  last24HoursDocuments: number
}

export interface CreateScraperSourceRequest {
  name: string
  description?: string
  baseUrl: string
  endpointPath?: string
  sourceType: ScraperSourceType
  frequency: ScraperFrequency
  isEnabled?: boolean
  configuration?: Record<string, unknown>
}

export interface UpdateScraperSourceRequest {
  name?: string
  description?: string
  baseUrl?: string
  endpointPath?: string
  frequency?: ScraperFrequency
  isEnabled?: boolean
  configuration?: Record<string, unknown>
}

export interface ProcessDocumentRequest {
  priority?: 'Low' | 'Medium' | 'High'
  affectedValidators?: string[]
}

export interface SeedSourcesJobResponse {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  message: string
}

/**
 * Response from the execute source endpoint
 * Can be either an immediate execution or a queued job
 */
export interface ExecuteSourceResponse {
  // Common fields
  sourceId: string
  sourceName: string
  status: ScraperExecutionStatus | 'queued'
  message?: string

  // Immediate execution fields (when sync=true)
  id?: string
  startedAt?: string
  completedAt?: string
  documentsFound?: number
  documentsNew?: number
  documentsDuplicate?: number
  documentsError?: number
  errorMessage?: string
  triggeredBy?: string

  // Async execution fields (when status='queued')
  jobId?: string
  executionId?: string | null
}

// ============================================
// SERVICE
// ============================================

export class ScraperService {
  /**
   * Get all scraper sources
   */
  static async getSources(): Promise<ScraperSource[]> {
    const response = await apiClient.get<ScraperSource[]>(
      API_ENDPOINTS.SCRAPERS.SOURCES
    )
    return response.data
  }

  /**
   * Get scraper source by ID
   */
  static async getSourceById(id: string): Promise<ScraperSource> {
    const response = await apiClient.get<ScraperSource>(
      API_ENDPOINTS.SCRAPERS.SOURCE_DETAIL(id)
    )
    return response.data
  }

  /**
   * Create new scraper source
   */
  static async createSource(data: CreateScraperSourceRequest): Promise<ScraperSource> {
    const response = await apiClient.post<ScraperSource>(
      API_ENDPOINTS.SCRAPERS.SOURCES,
      data
    )
    return response.data
  }

  /**
   * Update scraper source
   */
  static async updateSource(id: string, data: UpdateScraperSourceRequest): Promise<ScraperSource> {
    const response = await apiClient.put<ScraperSource>(
      API_ENDPOINTS.SCRAPERS.SOURCE_DETAIL(id),
      data
    )
    return response.data
  }

  /**
   * Delete scraper source
   */
  static async deleteSource(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SCRAPERS.SOURCE_DETAIL(id))
  }

  /**
   * Execute scraping for a source
   * Returns ExecuteSourceResponse which can be either immediate execution or queued job
   */
  static async executeSource(sourceId: string): Promise<ExecuteSourceResponse> {
    const response = await apiClient.post<ExecuteSourceResponse>(
      API_ENDPOINTS.SCRAPERS.EXECUTE(sourceId)
    )
    return response.data
  }

  /**
   * Get all executions with optional filters
   */
  static async getExecutions(params?: {
    sourceId?: string
    status?: ScraperExecutionStatus
    page?: number
    pageSize?: number
  }): Promise<ScraperExecution[]> {
    const response = await apiClient.get<ScraperExecution[]>(
      API_ENDPOINTS.SCRAPERS.EXECUTIONS,
      { params }
    )
    return response.data
  }

  /**
   * Get execution by ID
   */
  static async getExecutionById(id: string): Promise<ScraperExecution> {
    const response = await apiClient.get<ScraperExecution>(
      API_ENDPOINTS.SCRAPERS.EXECUTION_DETAIL(id)
    )
    return response.data
  }

  /**
   * Get scraped documents with optional filters
   */
  static async getDocuments(params?: {
    executionId?: string
    sourceId?: string
    status?: ScrapedDocumentStatus
    page?: number
    pageSize?: number
  }): Promise<ScrapedDocument[]> {
    const response = await apiClient.get<ScrapedDocument[]>(
      API_ENDPOINTS.SCRAPERS.DOCUMENTS,
      { params }
    )
    return response.data
  }

  /**
   * Get document by ID
   */
  static async getDocumentById(id: string): Promise<ScrapedDocument> {
    const response = await apiClient.get<ScrapedDocument>(
      API_ENDPOINTS.SCRAPERS.DOCUMENT_DETAIL(id)
    )
    return response.data
  }

  /**
   * Process a scraped document to convert it to NormativeChange
   */
  static async processDocument(id: string, data?: ProcessDocumentRequest): Promise<ScrapedDocument> {
    const response = await apiClient.post<ScrapedDocument>(
      API_ENDPOINTS.SCRAPERS.PROCESS_DOCUMENT(id),
      data
    )
    return response.data
  }

  /**
   * Get scraper statistics
   */
  static async getStatistics(): Promise<ScraperStatistics> {
    const response = await apiClient.get<ScraperStatistics>(
      API_ENDPOINTS.SCRAPERS.STATISTICS
    )
    return response.data
  }

  /**
   * Execute all enabled scraper sources
   */
  static async executeAll(): Promise<ExecuteAllResponse> {
    const response = await apiClient.post<ExecuteAllResponse>(
      API_ENDPOINTS.SCRAPERS.EXECUTE_ALL
    )
    return response.data
  }

  /**
   * Toggle scraper source enabled/disabled
   */
  static async toggleSource(id: string): Promise<ScraperSource> {
    const response = await apiClient.post<ScraperSource>(
      API_ENDPOINTS.SCRAPERS.TOGGLE(id)
    )
    return response.data
  }

  /**
   * Cancel a running execution
   */
  static async cancelExecution(id: string): Promise<ScraperExecution> {
    const response = await apiClient.post<ScraperExecution>(
      API_ENDPOINTS.SCRAPERS.CANCEL_EXECUTION(id)
    )
    return response.data
  }

  /**
   * Process all pending documents
   */
  static async processAllDocuments(params?: {
    priority?: 'Low' | 'Medium' | 'High'
    sourceId?: string
  }): Promise<ProcessAllDocumentsResponse> {
    const response = await apiClient.post<ProcessAllDocumentsResponse>(
      API_ENDPOINTS.SCRAPERS.PROCESS_ALL_DOCUMENTS,
      params
    )
    return response.data
  }

  /**
   * Mark a document as ignored
   */
  static async ignoreDocument(id: string, reason?: string): Promise<ScrapedDocument> {
    const response = await apiClient.post<ScrapedDocument>(
      API_ENDPOINTS.SCRAPERS.IGNORE_DOCUMENT(id),
      { reason }
    )
    return response.data
  }

  /**
   * Seed missing scraper sources (Admin endpoint)
   * Enqueues a Hangfire job to add all predefined scraper sources that don't exist in the database
   * Returns a job ID to track the progress
   */
  static async seedMissingSources(): Promise<SeedSourcesJobResponse> {
    const response = await apiClient.post<SeedSourcesJobResponse>(
      '/v1/scrapers/admin/seed-sources'
    )
    return response.data
  }
}

/**
 * Response from execute all sources
 */
export interface ExecuteAllResponse {
  totalSources: number
  executionsStarted: number
  executionsQueued: number
  executions: Array<{
    sourceId: string
    sourceName: string
    status: 'started' | 'queued' | 'skipped' | 'failed'
    executionId?: string
    jobId?: string
    message?: string
  }>
}

/**
 * Response from process all documents
 */
export interface ProcessAllDocumentsResponse {
  totalDocuments: number
  processed: number
  failed: number
  skipped: number
  results: Array<{
    documentId: string
    title: string
    status: 'processed' | 'failed' | 'skipped'
    normativeChangeId?: string
    error?: string
  }>
}

/**
 * Category configuration for source types
 */
export const SCRAPER_SOURCE_CATEGORIES = {
  core: {
    label: 'CONSAR Core',
    types: ['DOF', 'SIDOF', 'GobMxConsar', 'SinorConsar', 'RssFeed'],
    color: 'emerald',
  },
  regulatory: {
    label: 'Regulatorios',
    types: ['CNBV', 'SHCP', 'BANXICO', 'SAT', 'RENAPO', 'IMSS', 'INFONAVIT', 'INEGI', 'SEPOMEX', 'SPEI'],
    color: 'blue',
  },
  pld: {
    label: 'PLD',
    types: ['OFAC', 'UIF', 'ONU'],
    color: 'red',
  },
  technical: {
    label: 'Técnicas',
    types: ['ConsarPortal', 'ConsarSISET', 'PROCESAR', 'AMAFORE', 'CONDUSEF', 'IndicesFinancieros', 'SarLayouts'],
    color: 'purple',
  },
  market: {
    label: 'Mercados',
    types: ['BMV', 'CNSF', 'PENSIONISSSTE', 'IPAB', 'SIEFOREPrecios', 'CETES', 'VALMER'],
    color: 'orange',
  },
  infrastructure: {
    label: 'Infraestructura',
    types: ['STPS', 'FOVISSSTE', 'INDEVAL', 'MEXDER', 'TablasActuariales'],
    color: 'cyan',
  },
  complementary: {
    label: 'Complementarios',
    types: ['COFECE', 'PRODECON', 'INAI', 'PROFECO', 'LeySAR', 'CONASAMI', 'ASF', 'SHF', 'SUA', 'IDSE', 'ExpedienteAfore', 'LISIT', 'PensionBienestar', 'Custom'],
    color: 'neutral',
  },
} as const

/**
 * Get category for a source type
 */
export function getSourceTypeCategory(sourceType: string): { label: string; color: string } {
  for (const [, category] of Object.entries(SCRAPER_SOURCE_CATEGORIES)) {
    if (category.types.includes(sourceType as ScraperSourceType)) {
      return { label: category.label, color: category.color }
    }
  }
  return { label: 'Otro', color: 'neutral' }
}

export default ScraperService
