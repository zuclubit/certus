/**
 * CONSAR Validators Module
 *
 * Complete validation system for CONSAR files including:
 * - Mexican document validators (CURP, NSS, RFC, CLABE)
 * - CONSAR/PROCESAR error catalog
 * - Validation engine
 *
 * @module validators
 */

// Mexican document validators
export {
  validateCURP,
  validateNSS,
  validateRFC,
  validateCLABE,
  calculateCURPCheckDigit,
  calculateNSSCheckDigit,
  calculateRFCCheckDigit,
  calculateCLABECheckDigit,
  isValidCURPFormat,
  isValidNSSFormat,
  isValidRFCFormat,
  isValidCLABEFormat,
  mexicanValidators,
  type ValidationResult,
  type CURPData,
  type NSSData,
  type RFCData,
  type CLABEData,
} from './mexican-validators'

// Re-export constants from mexican-validators
export { mexicanValidators as MexicanValidators } from './mexican-validators'

// CONSAR error catalog
export {
  BATCH_REJECTION_CODES,
  RECORD_REJECTION_CODES,
  AFORE_CATALOG,
  MOVEMENT_TYPE_CATALOG,
  SUBCUENTA_CATALOG,
  FILE_TYPE_CONFIG,
  getErrorDefinition,
  getErrorsByCategory,
  getErrorsBySeverity,
  isValidAFORECode,
  getAFOREName,
  isValidMovementType,
  consarErrorCatalog,
  type ErrorSeverity,
  type ErrorDefinition,
  type AFOREInfo,
  type MovementTypeInfo,
  type SubcuentaInfo,
  type FileTypeConfig,
} from './consar-error-catalog'

// Validation engine
export {
  ValidationEngine,
  validateCONSARFile,
  type FieldValidationResult,
  type ValidationErrorDetail,
  type RecordValidationResult,
  type FileValidationResult,
  type ValidationSummary,
  type PerformanceMetrics,
  type ValidationProgress,
  type ValidationOptions,
} from './validation-engine'

// Dynamic catalogs
export {
  DynamicCatalogManager,
  getCatalogManager,
  resetCatalogManager,
  isValidAFORE,
  isValidMovement,
  getAFOREName as getAFORENameAsync,
  type CatalogCache,
  type CatalogUpdateResult,
  type DynamicCatalogOptions,
} from './dynamic-catalogs'
