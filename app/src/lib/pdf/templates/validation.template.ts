/**
 * Validation Report Template
 *
 * Generates comprehensive validation reports for CONSAR files
 */

import type { TDocumentDefinitions, Content, ContentTable } from 'pdfmake/interfaces'
import { BaseTemplate, type BaseTemplateOptions } from './base.template'
import { CONSARColors, type ValidationReportData } from '../types'

export interface ValidationTemplateOptions extends BaseTemplateOptions {
  data: ValidationReportData
  includeCharts?: boolean
  includeDetails?: boolean
  maxDetailRecords?: number
  chartImages?: {
    errorsByType?: string
    errorsByField?: string
    validationOverview?: string
  }
}

/**
 * Validation report template
 */
export class ValidationTemplate extends BaseTemplate {
  private data: ValidationReportData
  private includeCharts: boolean
  private includeDetails: boolean
  private maxDetailRecords: number
  private chartImages?: ValidationTemplateOptions['chartImages']

  constructor(options: ValidationTemplateOptions) {
    super(options)
    this.data = options.data
    this.includeCharts = options.includeCharts ?? true
    this.includeDetails = options.includeDetails ?? true
    this.maxDetailRecords = options.maxDetailRecords ?? 100
    this.chartImages = options.chartImages
  }

  /**
   * Get complete document definition
   */
  getDocumentDefinition(): TDocumentDefinitions {
    const baseDefinition = this.getBaseDocumentDefinition()

    return {
      ...baseDefinition,
      info: {
        title: this.metadata.title,
        author: this.metadata.generatedBy || 'Certus',
        subject: 'Reporte de Validación CONSAR',
        keywords: 'CONSAR, validación, compliance',
        creator: 'Certus PDF Generator',
        producer: 'pdfmake',
      },
      content: this.renderBody(),
    }
  }

  /**
   * Render report body
   */
  private renderBody(): Content {
    const content: Content[] = []

    // Title
    content.push({
      text: this.metadata.title,
      style: 'title',
    })

    // Document info
    content.push(this.renderDocumentInfo())

    content.push(this.renderDivider())

    // Executive summary
    content.push(this.renderExecutiveSummary())

    content.push(this.renderDivider())

    // File structure
    content.push(this.renderFileStructure())

    content.push(this.renderDivider())

    // Error analysis
    content.push(this.renderErrorAnalysis())

    // Charts (if enabled and available)
    if (this.includeCharts && this.chartImages) {
      content.push({ text: '', pageBreak: 'before' as const })
      content.push(this.renderCharts())
    }

    // Top errors
    content.push({ text: '', pageBreak: 'before' as const })
    content.push(this.renderTopErrors())

    // Detailed records (if enabled)
    if (this.includeDetails && this.data.records) {
      content.push({ text: '', pageBreak: 'before' as const })
      content.push(this.renderDetailedRecords())
    }

    return content
  }

  /**
   * Render executive summary
   */
  private renderExecutiveSummary(): Content {
    const { summary } = this.data

    const errorRate = summary.errorRate
    const status = errorRate === 0 ? 'success' : errorRate < 0.05 ? 'warning' : 'error'

    return {
      stack: [
        this.renderSectionTitle('Resumen Ejecutivo'),
        {
          columns: [
            // Total Records
            {
              width: '25%',
              stack: [
                { text: 'Total de Registros', style: 'statLabel' },
                { text: this.formatNumber(summary.totalRecords), style: 'statValue' },
              ],
            },
            // Valid Records
            {
              width: '25%',
              stack: [
                { text: 'Registros Válidos', style: 'statLabel' },
                {
                  text: this.formatNumber(summary.validRecords),
                  style: 'statValue',
                  color: CONSARColors.success,
                },
              ],
            },
            // Invalid Records
            {
              width: '25%',
              stack: [
                { text: 'Registros Inválidos', style: 'statLabel' },
                {
                  text: this.formatNumber(summary.invalidRecords),
                  style: 'statValue',
                  color: summary.invalidRecords > 0 ? CONSARColors.error : CONSARColors.success,
                },
              ],
            },
            // Error Rate
            {
              width: '25%',
              stack: [
                { text: 'Tasa de Error', style: 'statLabel' },
                {
                  text: this.formatPercentage(summary.errorRate),
                  style: 'statValue',
                  color: status === 'success' ? CONSARColors.success :
                         status === 'warning' ? CONSARColors.warning : CONSARColors.error,
                },
              ],
            },
          ],
          columnGap: 10,
          margin: [0, 10, 0, 15],
        },
        // Status badge
        {
          text: errorRate === 0 ? '✓ Archivo Válido' :
                errorRate < 0.05 ? '⚠ Errores Menores Detectados' :
                '✗ Errores Críticos Detectados',
          alignment: 'center' as const,
          color: '#ffffff',
          background: status === 'success' ? CONSARColors.success :
                     status === 'warning' ? CONSARColors.warning : CONSARColors.error,
          bold: true,
          margin: [0, 10, 0, 10],
          padding: [10, 5, 10, 5],
        },
        // Processing time (if available)
        summary.processingTime ? {
          text: `Tiempo de procesamiento: ${summary.processingTime.toFixed(2)}s`,
          style: 'footerText',
          alignment: 'center' as const,
          margin: [0, 5, 0, 0],
        } : {},
      ],
    }
  }

  /**
   * Render file structure
   */
  private renderFileStructure(): Content {
    const { fileStructure } = this.data

    return {
      stack: [
        this.renderSectionTitle('Estructura del Archivo'),
        this.renderKeyValueTable([
          ['Línea de encabezado (01)', fileStructure.hasHeader ? 'Sí' : 'No'],
          ['Línea de pie (03)', fileStructure.hasFooter ? 'Sí' : 'No'],
          ['Registros de detalle (02)', this.formatNumber(fileStructure.detailRecords)],
          ['Total de líneas', this.formatNumber(fileStructure.totalLines)],
        ]),
      ],
    }
  }

  /**
   * Render error analysis
   */
  private renderErrorAnalysis(): Content {
    const content: Content[] = [
      this.renderSectionTitle('Análisis de Errores'),
    ]

    // Errors by type
    if (this.data.errorsByType.length > 0) {
      content.push({
        text: 'Errores por Tipo',
        style: 'subsectionTitle',
      })

      content.push(this.renderErrorsByTypeTable())
    } else {
      content.push({
        text: 'No se detectaron errores en el archivo.',
        color: CONSARColors.success,
        bold: true,
        margin: [0, 10, 0, 10],
      })
    }

    // Errors by field
    if (this.data.errorsByField.length > 0) {
      content.push({
        text: 'Errores por Campo',
        style: 'subsectionTitle',
        margin: [0, 15, 0, 8],
      })

      content.push(this.renderErrorsByFieldTable())
    }

    return { stack: content }
  }

  /**
   * Render errors by type table
   */
  private renderErrorsByTypeTable(): ContentTable {
    const { errorsByType } = this.data

    return {
      table: {
        widths: ['*', 80, 80, 80],
        headerRows: 1,
        body: [
          // Header
          [
            { text: 'Tipo de Error', style: 'tableHeader' },
            { text: 'Cantidad', style: 'tableHeader', alignment: 'right' as const },
            { text: 'Porcentaje', style: 'tableHeader', alignment: 'right' as const },
            { text: 'Severidad', style: 'tableHeader', alignment: 'center' as const },
          ],
          // Rows
          ...errorsByType.map(error => [
            { text: error.type, fontSize: 10 },
            { text: this.formatNumber(error.count), fontSize: 10, alignment: 'right' as const },
            { text: this.formatPercentage(error.percentage), fontSize: 10, alignment: 'right' as const },
            {
              text: error.severity.toUpperCase(),
              fontSize: 8,
              bold: true,
              color: '#ffffff',
              fillColor: error.severity === 'critical' ? CONSARColors.critical :
                        error.severity === 'error' ? CONSARColors.error : CONSARColors.warning,
              alignment: 'center' as const,
            },
          ]),
        ],
      },
      layout: {
        hLineWidth: (i: number, node: any) => i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5,
        vLineWidth: () => 0,
        hLineColor: () => CONSARColors.border,
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6,
      },
      margin: [0, 5, 0, 10],
    }
  }

  /**
   * Render errors by field table
   */
  private renderErrorsByFieldTable(): ContentTable {
    const { errorsByField } = this.data
    const topFields = errorsByField.slice(0, 10) // Top 10 fields with most errors

    return {
      table: {
        widths: ['*', 100, 100],
        headerRows: 1,
        body: [
          // Header
          [
            { text: 'Campo', style: 'tableHeader' },
            { text: 'Cantidad', style: 'tableHeader', alignment: 'right' as const },
            { text: 'Porcentaje', style: 'tableHeader', alignment: 'right' as const },
          ],
          // Rows
          ...topFields.map(field => [
            { text: field.field, fontSize: 10 },
            { text: this.formatNumber(field.count), fontSize: 10, alignment: 'right' as const },
            { text: this.formatPercentage(field.percentage), fontSize: 10, alignment: 'right' as const },
          ]),
        ],
      },
      layout: {
        hLineWidth: (i: number, node: any) => i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5,
        vLineWidth: () => 0,
        hLineColor: () => CONSARColors.border,
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6,
      },
      margin: [0, 5, 0, 10],
    }
  }

  /**
   * Render charts
   */
  private renderCharts(): Content {
    const content: Content[] = [
      this.renderSectionTitle('Visualizaciones'),
    ]

    if (this.chartImages?.errorsByType) {
      content.push({
        text: 'Distribución de Errores por Tipo',
        style: 'subsectionTitle',
      })
      content.push({
        image: this.chartImages.errorsByType,
        width: 500,
        margin: [0, 10, 0, 20],
      })
    }

    if (this.chartImages?.errorsByField) {
      content.push({
        text: 'Distribución de Errores por Campo',
        style: 'subsectionTitle',
      })
      content.push({
        image: this.chartImages.errorsByField,
        width: 500,
        margin: [0, 10, 0, 20],
      })
    }

    if (this.chartImages?.validationOverview) {
      content.push({
        text: 'Resumen de Validación',
        style: 'subsectionTitle',
      })
      content.push({
        image: this.chartImages.validationOverview,
        width: 500,
        margin: [0, 10, 0, 20],
      })
    }

    return { stack: content }
  }

  /**
   * Render top errors
   */
  private renderTopErrors(): Content {
    const { topErrors } = this.data

    if (topErrors.length === 0) {
      return {
        stack: [
          this.renderSectionTitle('Errores Principales'),
          {
            text: 'No se detectaron errores.',
            color: CONSARColors.success,
            bold: true,
          },
        ],
      }
    }

    return {
      stack: [
        this.renderSectionTitle('Errores Principales'),
        {
          table: {
            widths: [50, '*', 100, 150],
            headerRows: 1,
            body: [
              // Header
              [
                { text: 'Línea', style: 'tableHeader' },
                { text: 'Campo', style: 'tableHeader' },
                { text: 'Valor', style: 'tableHeader' },
                { text: 'Error', style: 'tableHeader' },
              ],
              // Rows
              ...topErrors.slice(0, 20).map(error => [
                { text: String(error.lineNumber), fontSize: 10, alignment: 'right' as const },
                { text: error.fieldName, fontSize: 10 },
                { text: error.value || 'N/A', fontSize: 10, color: CONSARColors.textLight },
                { text: error.errorMessage, fontSize: 9, color: CONSARColors.error },
              ]),
            ],
          },
          layout: {
            hLineWidth: (i: number, node: any) => i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5,
            vLineWidth: () => 0,
            hLineColor: () => CONSARColors.border,
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 6,
            paddingBottom: () => 6,
          },
        },
      ],
    }
  }

  /**
   * Render detailed records
   */
  private renderDetailedRecords(): Content {
    const records = this.data.records?.slice(0, this.maxDetailRecords) || []

    if (records.length === 0) {
      return {
        stack: [
          this.renderSectionTitle('Registros Detallados'),
          { text: 'No hay registros disponibles.', color: CONSARColors.textLight },
        ],
      }
    }

    return {
      stack: [
        this.renderSectionTitle('Registros Detallados'),
        {
          text: `Mostrando ${records.length} de ${this.data.records?.length || 0} registros`,
          style: 'footerText',
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            widths: [40, 50, 60, '*'],
            headerRows: 1,
            body: [
              // Header
              [
                { text: 'Línea', style: 'tableHeader' },
                { text: 'Tipo', style: 'tableHeader' },
                { text: 'Estado', style: 'tableHeader' },
                { text: 'Errores', style: 'tableHeader' },
              ],
              // Rows
              ...records.map(record => [
                { text: String(record.lineNumber), fontSize: 9, alignment: 'right' as const },
                { text: record.recordType, fontSize: 9 },
                {
                  text: record.isValid ? 'VÁLIDO' : 'INVÁLIDO',
                  fontSize: 8,
                  bold: true,
                  color: '#ffffff',
                  fillColor: record.isValid ? CONSARColors.success : CONSARColors.error,
                  alignment: 'center' as const,
                },
                {
                  text: record.errors.length > 0 ? record.errors.join(', ') : 'Sin errores',
                  fontSize: 8,
                  color: record.errors.length > 0 ? CONSARColors.error : CONSARColors.textLight,
                },
              ]),
            ],
          },
          layout: {
            hLineWidth: (i: number, node: any) => i === 0 || i === 1 ? 1 : 0.5,
            vLineWidth: () => 0,
            hLineColor: () => CONSARColors.border,
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          },
        },
      ],
    }
  }
}
