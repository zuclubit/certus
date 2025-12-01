/**
 * Reference Data Service - Real API Implementation
 *
 * Provides access to CONSAR reference data including:
 * - AFOREs (Administradoras de Fondos para el Retiro)
 * - SIEFOREs (Sociedades de Inversión Especializada en Fondos para el Retiro)
 * - UDI (Unidad de Inversión)
 * - Exchange rates (Tipo de cambio FIX)
 * - LEI (Legal Entity Identifier)
 * - ISIN/CUSIP validation
 * - FIGI mapping
 * - Valmer prices and vectors
 * - Actuarial data
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'

// ============================================
// TYPES
// ============================================

export interface AforeInfo {
  code: string
  name: string
  fullName: string
  rfc: string
  isActive: boolean
  registrationDate?: string
}

export interface AforeValidationResult {
  isValid: boolean
  afore?: AforeInfo
  errorMessage?: string
}

export interface SieforeInfo {
  code: string
  name: string
  aforeCode: string
  aforeName: string
  type: string
  isActive: boolean
}

export interface SieforeValidationResult {
  isValid: boolean
  siefore?: SieforeInfo
  errorMessage?: string
}

export interface UdiValue {
  date: string
  value: number
  source: string
  lastUpdated: string
}

export interface ExchangeRateResult {
  date: string
  value: number
  type: 'FIX' | 'DOF'
  source: string
  lastUpdated: string
}

export interface ExchangeRateRangeResult {
  startDate: string
  endDate: string
  rates: ExchangeRateResult[]
}

export interface LeiAddress {
  firstAddressLine?: string
  city?: string
  region?: string
  country?: string
  postalCode?: string
}

export interface LeiRecord {
  lei: string
  legalName: string
  status: string
  legalAddress?: LeiAddress
  headquartersAddress?: LeiAddress
  registrationAuthority?: string
  legalJurisdiction?: string
  entityCategory?: string
  registrationDate?: string
  lastUpdateDate?: string
  nextRenewalDate?: string
}

export interface LeiValidationResult {
  isValid: boolean
  record?: LeiRecord
  errorMessage?: string
}

export interface IsinValidationResult {
  isValid: boolean
  isin?: string
  countryCode?: string
  nsin?: string
  checkDigit?: string
  errorMessage?: string
}

export interface CusipValidationResult {
  isValid: boolean
  cusip?: string
  issuerCode?: string
  issueCode?: string
  checkDigit?: string
  errorMessage?: string
}

export interface FigiMappingRequest {
  idType: 'ISIN' | 'CUSIP' | 'SEDOL' | 'TICKER'
  idValue: string
  exchangeCode?: string
  micCode?: string
}

export interface FigiMappingResult {
  figi?: string
  name?: string
  ticker?: string
  exchangeCode?: string
  micCode?: string
  securityType?: string
  marketSector?: string
  errorMessage?: string
}

export interface ValmerPrice {
  date: string
  ticker: string
  cleanPrice?: number
  dirtyPrice?: number
  yieldToMaturity?: number
  duration?: number
  convexity?: number
  spread?: number
  source: string
}

export interface ValmerVector {
  date: string
  curveType: string
  term: number
  rate: number
  source: string
}

export interface ValmerYieldCurve {
  date: string
  curveType: string
  points: ValmerVector[]
  source: string
}

export interface ActuarialFactors {
  date: string
  age: number
  gender: 'M' | 'F'
  type: string
  factor: number
  source: string
}

export interface MortalityRate {
  age: number
  gender: 'M' | 'F'
  qx: number
  lx: number
  dx: number
  ex: number
  tableType: string
  source: string
}

export interface ReferenceDataHealthStatus {
  isHealthy: boolean
  services: {
    banxico: boolean
    lei: boolean
    valmer: boolean
    figi: boolean
  }
  lastChecked: string
}

// ============================================
// SERVICE
// ============================================

export class ReferenceDataService {
  /**
   * Check health status of reference data services
   */
  static async getHealth(): Promise<ReferenceDataHealthStatus> {
    const response = await apiClient.get<ReferenceDataHealthStatus>(
      API_ENDPOINTS.REFERENCE_DATA.HEALTH
    )
    return response.data
  }

  // ============================================
  // AFORES
  // ============================================

  /**
   * Get all AFOREs
   */
  static async getAfores(): Promise<AforeInfo[]> {
    const response = await apiClient.get<AforeInfo[]>(
      API_ENDPOINTS.REFERENCE_DATA.AFORES
    )
    return response.data
  }

  /**
   * Validate AFORE code
   */
  static async validateAfore(code: string): Promise<AforeValidationResult> {
    const response = await apiClient.get<AforeValidationResult>(
      API_ENDPOINTS.REFERENCE_DATA.VALIDATE_AFORE(code)
    )
    return response.data
  }

  // ============================================
  // SIEFORES
  // ============================================

  /**
   * Get all SIEFOREs
   */
  static async getSiefores(): Promise<SieforeInfo[]> {
    const response = await apiClient.get<SieforeInfo[]>(
      API_ENDPOINTS.REFERENCE_DATA.SIEFORES
    )
    return response.data
  }

  /**
   * Validate SIEFORE code
   */
  static async validateSiefore(code: string): Promise<SieforeValidationResult> {
    const response = await apiClient.get<SieforeValidationResult>(
      API_ENDPOINTS.REFERENCE_DATA.VALIDATE_SIEFORE(code)
    )
    return response.data
  }

  // ============================================
  // UDI
  // ============================================

  /**
   * Get current UDI value
   */
  static async getUdi(date?: string): Promise<UdiValue> {
    const response = await apiClient.get<UdiValue>(
      API_ENDPOINTS.REFERENCE_DATA.UDI,
      { params: { date } }
    )
    return response.data
  }

  // ============================================
  // EXCHANGE RATES
  // ============================================

  /**
   * Get FIX exchange rate for a specific date
   */
  static async getExchangeRateFix(date?: string): Promise<ExchangeRateResult> {
    const response = await apiClient.get<ExchangeRateResult>(
      API_ENDPOINTS.REFERENCE_DATA.EXCHANGE_RATE_FIX,
      { params: { date } }
    )
    return response.data
  }

  /**
   * Get exchange rates for a date range
   */
  static async getExchangeRateRange(
    startDate: string,
    endDate: string
  ): Promise<ExchangeRateRangeResult> {
    const response = await apiClient.get<ExchangeRateRangeResult>(
      API_ENDPOINTS.REFERENCE_DATA.EXCHANGE_RATE_RANGE,
      { params: { startDate, endDate } }
    )
    return response.data
  }

  // ============================================
  // LEI
  // ============================================

  /**
   * Validate and get LEI information
   */
  static async getLei(lei: string): Promise<LeiValidationResult> {
    const response = await apiClient.get<LeiValidationResult>(
      API_ENDPOINTS.REFERENCE_DATA.LEI(lei)
    )
    return response.data
  }

  /**
   * Search LEI by name or other criteria
   */
  static async searchLei(query: string): Promise<LeiRecord[]> {
    const response = await apiClient.get<LeiRecord[]>(
      API_ENDPOINTS.REFERENCE_DATA.LEI_SEARCH,
      { params: { query } }
    )
    return response.data
  }

  // ============================================
  // SECURITIES IDENTIFIERS
  // ============================================

  /**
   * Validate ISIN
   */
  static async validateIsin(isin: string): Promise<IsinValidationResult> {
    const response = await apiClient.get<IsinValidationResult>(
      API_ENDPOINTS.REFERENCE_DATA.ISIN(isin)
    )
    return response.data
  }

  /**
   * Validate CUSIP
   */
  static async validateCusip(cusip: string): Promise<CusipValidationResult> {
    const response = await apiClient.get<CusipValidationResult>(
      API_ENDPOINTS.REFERENCE_DATA.CUSIP(cusip)
    )
    return response.data
  }

  /**
   * Map identifier to FIGI
   */
  static async mapToFigi(request: FigiMappingRequest): Promise<FigiMappingResult> {
    const response = await apiClient.post<FigiMappingResult>(
      API_ENDPOINTS.REFERENCE_DATA.FIGI_MAP,
      request
    )
    return response.data
  }

  // ============================================
  // VALMER
  // ============================================

  /**
   * Get Valmer price for a ticker
   */
  static async getValmerPrice(
    ticker: string,
    date?: string
  ): Promise<ValmerPrice> {
    const response = await apiClient.get<ValmerPrice>(
      API_ENDPOINTS.REFERENCE_DATA.VALMER_PRICE,
      { params: { ticker, date } }
    )
    return response.data
  }

  /**
   * Get Valmer price vector
   */
  static async getValmerVector(
    curveType: string,
    date?: string
  ): Promise<ValmerVector[]> {
    const response = await apiClient.get<ValmerVector[]>(
      API_ENDPOINTS.REFERENCE_DATA.VALMER_VECTOR,
      { params: { curveType, date } }
    )
    return response.data
  }

  /**
   * Get Valmer yield curve
   */
  static async getValmerYieldCurve(
    curveType: string,
    date?: string
  ): Promise<ValmerYieldCurve> {
    const response = await apiClient.get<ValmerYieldCurve>(
      API_ENDPOINTS.REFERENCE_DATA.VALMER_YIELD_CURVE,
      { params: { curveType, date } }
    )
    return response.data
  }

  // ============================================
  // ACTUARIAL
  // ============================================

  /**
   * Get actuarial factors
   */
  static async getActuarialFactors(params?: {
    age?: number
    gender?: 'M' | 'F'
    type?: string
    date?: string
  }): Promise<ActuarialFactors[]> {
    const response = await apiClient.get<ActuarialFactors[]>(
      API_ENDPOINTS.REFERENCE_DATA.ACTUARIAL_FACTORS,
      { params }
    )
    return response.data
  }

  /**
   * Get mortality rates
   */
  static async getMortalityRates(params?: {
    minAge?: number
    maxAge?: number
    gender?: 'M' | 'F'
    tableType?: string
  }): Promise<MortalityRate[]> {
    const response = await apiClient.get<MortalityRate[]>(
      API_ENDPOINTS.REFERENCE_DATA.ACTUARIAL_MORTALITY,
      { params }
    )
    return response.data
  }
}

export default ReferenceDataService
