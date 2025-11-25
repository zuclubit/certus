/**
 * PDF Generator Service
 *
 * Main service for generating PDF reports
 */

import type { TDocumentDefinitions } from 'pdfmake/interfaces'
import type {
  ReportType,
  PDFGenerationOptions,
  ValidationReportData,
  ErrorReportData,
} from '../types'

/**
 * Lazy load pdfmake to reduce initial bundle size
 */
async function loadPDFMake() {
  const pdfMakeModule = await import('pdfmake/build/pdfmake')
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts')

  // Get the actual pdfMake instance
  const pdfMake = pdfMakeModule.default || pdfMakeModule

  // Get the fonts - handle different export formats
  const fonts = pdfFontsModule.default?.pdfMake?.vfs ||
                pdfFontsModule.pdfMake?.vfs ||
                (pdfFontsModule as any).vfs

  if (!fonts) {
    throw new Error('Could not load pdfMake fonts')
  }

  // Set the virtual file system
  pdfMake.vfs = fonts

  return pdfMake
}

/**
 * Main PDF Generator class
 */
export class PDFGeneratorService {
  private static instance: PDFGeneratorService
  private pdfMakeInstance: any = null
  private isInitialized = false

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): PDFGeneratorService {
    if (!PDFGeneratorService.instance) {
      PDFGeneratorService.instance = new PDFGeneratorService()
    }
    return PDFGeneratorService.instance
  }

  /**
   * Initialize pdfmake (lazy loading)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    this.pdfMakeInstance = await loadPDFMake()
    this.isInitialized = true
  }

  /**
   * Generate validation report
   */
  async generateValidationReport(
    data: ValidationReportData,
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<void> {
    await this.initialize()

    const { ValidationTemplate } = await import('../templates/validation.template')

    const template = new ValidationTemplate({
      metadata: data.metadata,
      data,
      orientation: options.orientation || 'portrait',
      includePageNumbers: options.includePageNumbers ?? true,
      includeCharts: options.includeCharts ?? true,
      includeDetails: options.includeDetails ?? true,
      maxDetailRecords: options.maxDetailRecords || 100,
      watermark: options.watermark,
      footerText: options.footerText,
    })

    const docDefinition = template.getDocumentDefinition()

    return this.generatePDF(docDefinition, this.getFileName('validation', data.metadata.title))
  }

  /**
   * Generate error report
   */
  async generateErrorReport(
    data: ErrorReportData,
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<void> {
    await this.initialize()

    const { ErrorTemplate } = await import('../templates/error.template')

    const template = new ErrorTemplate({
      metadata: data.metadata,
      data,
      orientation: options.orientation || 'portrait',
      includePageNumbers: options.includePageNumbers ?? true,
      includeCharts: options.includeCharts ?? true,
      groupBySeverity: true,
      watermark: options.watermark,
      footerText: options.footerText,
    })

    const docDefinition = template.getDocumentDefinition()

    return this.generatePDF(docDefinition, this.getFileName('errors', data.metadata.title))
  }

  /**
   * Generate PDF from document definition
   */
  private async generatePDF(docDefinition: TDocumentDefinitions, filename: string): Promise<void> {
    if (!this.pdfMakeInstance) {
      throw new Error('PDFMake not initialized. Call initialize() first.')
    }

    return new Promise((resolve, reject) => {
      try {
        const pdfDocGenerator = this.pdfMakeInstance.createPdf(docDefinition)

        pdfDocGenerator.download(filename, () => {
          resolve()
        })
      } catch (error) {
        console.error('Error generating PDF:', error)
        reject(error)
      }
    })
  }

  /**
   * Generate PDF as blob (for preview or upload)
   */
  async generatePDFBlob(docDefinition: TDocumentDefinitions): Promise<Blob> {
    if (!this.pdfMakeInstance) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      try {
        const pdfDocGenerator = this.pdfMakeInstance.createPdf(docDefinition)

        pdfDocGenerator.getBlob((blob: Blob) => {
          resolve(blob)
        })
      } catch (error) {
        console.error('Error generating PDF blob:', error)
        reject(error)
      }
    })
  }

  /**
   * Generate PDF as base64 string
   */
  async generatePDFBase64(docDefinition: TDocumentDefinitions): Promise<string> {
    if (!this.pdfMakeInstance) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      try {
        const pdfDocGenerator = this.pdfMakeInstance.createPdf(docDefinition)

        pdfDocGenerator.getBase64((base64: string) => {
          resolve(base64)
        })
      } catch (error) {
        console.error('Error generating PDF base64:', error)
        reject(error)
      }
    })
  }

  /**
   * Open PDF in new window (for preview)
   */
  async previewPDF(docDefinition: TDocumentDefinitions): Promise<void> {
    if (!this.pdfMakeInstance) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      try {
        const pdfDocGenerator = this.pdfMakeInstance.createPdf(docDefinition)

        pdfDocGenerator.open({}, window)
        resolve()
      } catch (error) {
        console.error('Error previewing PDF:', error)
        reject(error)
      }
    })
  }

  /**
   * Generate filename
   */
  private getFileName(reportType: string, title: string): string {
    const sanitizedTitle = title
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()

    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')

    return `certus_${reportType}_${sanitizedTitle}_${timestamp}.pdf`
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized
  }
}

/**
 * Convenience function to get generator instance
 */
export function getPDFGenerator(): PDFGeneratorService {
  return PDFGeneratorService.getInstance()
}
