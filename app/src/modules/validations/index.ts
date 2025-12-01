/**
 * Validations Module - Model Module Pattern
 *
 * This module serves as the reference implementation for feature modules.
 * It follows a clean architecture pattern with clear separation of concerns.
 *
 * Module Structure:
 * - types.ts: TypeScript interfaces and types
 * - constants.ts: Module-specific constants and enums
 * - schemas.ts: Zod validation schemas
 * - hooks.ts: React hooks (TanStack Query)
 * - service.ts: API service adapter
 * - utils.ts: Utility functions
 * - components/: UI components specific to this module
 *
 * @compliance CONSAR 2025
 */

// Types
export * from './types'

// Constants
export * from './constants'

// Schemas
export * from './schemas'

// Hooks (re-export from central hooks)
export {
  useValidations,
  useValidationDetail,
  useValidationStatistics,
  useRecentValidations,
  useFileUpload,
  useBatchUpload,
  useRetryValidation,
  useDeleteValidation,
  useDownloadReport,
  useSearchValidations,
  useCreateCorrectedVersion,
  useVersionChain,
  validationKeys,
} from '@/hooks/useValidations'

// Service (re-export adapter)
export { ValidationService } from '@/lib/services/validation.adapter'

// Utils
export * from './utils'
