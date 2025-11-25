/**
 * CONSAR Record Types
 *
 * TypeScript interfaces for CONSAR file records following the official normative.
 * Based on Circular 19-8 (positional format 77 characters)
 *
 * @module consar-record
 */

/**
 * File types supported by CONSAR validation system
 */
export type CONSARFileType = 'NOMINA' | 'CONTABLE' | 'REGULARIZACION'

/**
 * Record types within CONSAR files
 */
export type RecordType =
  | '01' // Header
  | '02' // Detail
  | '03' // Footer
  | '04' // Control
  | string // Allow for future types

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info'

/**
 * Individual validation result
 */
export interface ValidationError {
  /** Unique validator identifier (e.g., "NOMINA_VAL_01") */
  code: string
  /** Human-readable error message */
  message: string
  /** Field name that failed validation */
  field?: string
  /** Position in line where error occurred */
  position?: number
  /** Severity level */
  severity: ValidationSeverity
  /** Reference to CONSAR circular (e.g., "Circular 19-8, Art. 5.1") */
  reference?: string
}

/**
 * Base interface for all CONSAR records
 */
export interface CONSARRecord {
  /** Line number in original file (1-indexed) */
  lineNumber: number
  /** Raw line content (77 characters) */
  rawLine: string
  /** File type this record belongs to */
  fileType: CONSARFileType
  /** Record type (01=Header, 02=Detail, etc.) */
  recordType: RecordType
  /** Whether this record passed all validations */
  isValid: boolean
  /** Validation errors for this record */
  errors: ValidationError[]
  /** Warnings for this record (non-blocking) */
  warnings: ValidationError[]
  /** Parsed timestamp (if applicable) */
  parsedAt: Date
}

/**
 * NOMINA specific record fields
 * Extends base CONSARRecord with NOMINA-specific data
 */
export interface NominaRecord extends CONSARRecord {
  fileType: 'NOMINA'
  /** Employee account number (11 digits) */
  account: string
  /** Transaction date (YYYYMMDD) */
  date: string
  /** Parsed date object */
  dateObj: Date | null
  /** Amount in cents (9 digits with 2 decimals) */
  amount: number
  /** Movement type (A=Alta, B=Baja, M=Modificación) */
  movementType: 'A' | 'B' | 'M' | string
  /** CURP (18 characters) */
  curp: string
  /** NSS (11 digits) */
  nss: string
  /** Employee name */
  employeeName: string
  /** Company RFC */
  companyRFC: string
  /** Additional fields per schema */
  [key: string]: unknown
}

/**
 * CONTABLE specific record fields
 * Extends base CONSARRecord with accounting-specific data
 */
export interface ContableRecord extends CONSARRecord {
  fileType: 'CONTABLE'
  /** Account code (SAT catalog) */
  accountCode: string
  /** Sub-account code */
  subAccountCode?: string
  /** Transaction date (YYYYMMDD) */
  date: string
  /** Parsed date object */
  dateObj: Date | null
  /** Debit amount in cents */
  debitAmount: number
  /** Credit amount in cents */
  creditAmount: number
  /** Transaction concept */
  concept: string
  /** Reference number */
  reference: string
  /** Currency code (MXN, USD, etc.) */
  currency: string
  /** Additional fields per schema */
  [key: string]: unknown
}

/**
 * REGULARIZACION specific record fields
 * Extends base CONSARRecord with regularization-specific data
 */
export interface RegularizacionRecord extends CONSARRecord {
  fileType: 'REGULARIZACION'
  /** Employee account number */
  account: string
  /** Original transaction date */
  originalDate: string
  /** Correction date */
  correctionDate: string
  /** Parsed dates */
  originalDateObj: Date | null
  correctionDateObj: Date | null
  /** Original amount */
  originalAmount: number
  /** Corrected amount */
  correctedAmount: number
  /** Reason for regularization */
  reason: string
  /** Authorization reference */
  authReference: string
  /** Additional fields per schema */
  [key: string]: unknown
}

/**
 * Union type for all CONSAR record types
 */
export type AnyRecord = NominaRecord | ContableRecord | RegularizacionRecord

/**
 * File metadata extracted from filename
 * Format: [TYPE]_[RFC]_[YYYYMMDD]_[SEQUENCE].txt
 */
export interface FileMetadata {
  /** File type (NOMINA, CONTABLE, REGULARIZACION) */
  type: CONSARFileType
  /** Company RFC */
  rfc: string
  /** File date (YYYYMMDD) */
  date: string
  /** Parsed date object */
  dateObj: Date
  /** Sequence number */
  sequence: string
  /** Original filename */
  originalName: string
}

/**
 * Parsing progress information
 */
export interface ParsingProgress {
  /** Total lines in file */
  totalLines: number
  /** Lines processed so far */
  processedLines: number
  /** Percentage complete (0-100) */
  percentage: number
  /** Estimated time remaining in ms */
  estimatedTimeRemaining?: number
  /** Current parsing phase */
  phase: 'reading' | 'parsing' | 'validating' | 'complete' | 'error'
  /** Error message if phase is 'error' */
  errorMessage?: string
}

/**
 * Parsed file result
 */
export interface ParsedFile {
  /** File metadata */
  metadata: FileMetadata
  /** All parsed records */
  records: AnyRecord[]
  /** Total records in file */
  totalRecords: number
  /** Valid records count */
  validRecords: number
  /** Invalid records count */
  invalidRecords: number
  /** Records with warnings count */
  warningRecords: number
  /** Parsing duration in ms */
  parseTime: number
  /** File size in bytes */
  fileSize: number
  /** Parsing errors (file-level, not record-level) */
  errors: ValidationError[]
}

/**
 * Filter options for record display
 */
export interface RecordFilter {
  /** Show only records with errors */
  showErrorsOnly?: boolean
  /** Show only records with warnings */
  showWarningsOnly?: boolean
  /** Show only valid records */
  showValidOnly?: boolean
  /** Filter by record type */
  recordType?: RecordType[]
  /** Date range filter */
  dateRange?: {
    start: Date
    end: Date
  }
  /** Amount range filter (in cents) */
  amountRange?: {
    min: number
    max: number
  }
  /** Text search query */
  searchQuery?: string
}

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json'

/**
 * Export options
 */
export interface ExportOptions {
  /** Format to export */
  format: ExportFormat
  /** Include only visible (filtered) records */
  filteredOnly?: boolean
  /** Include validation errors in export */
  includeErrors?: boolean
  /** Include warnings in export */
  includeWarnings?: boolean
  /** Custom filename (without extension) */
  filename?: string
  /** Include summary sheet (Excel only) */
  includeSummary?: boolean
  /** Include styling (Excel only) */
  applyFormatting?: boolean
}
