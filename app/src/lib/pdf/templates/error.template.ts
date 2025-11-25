/**
 * Error Report Template
 *
 * Generates detailed error reports for CONSAR file validation
 */

import type { TDocumentDefinitions, Content, ContentTable } from 'pdfmake/interfaces'
import { BaseTemplate, type BaseTemplateOptions } from './base.template'
import { CONSARColors, type ErrorReportData } from '../types'

export interface ErrorTemplateOptions extends BaseTemplateOptions {
  data: ErrorReportData
  includeCharts?: boolean
  groupBySeverity?: boolean
  chartImages?: {
    errorDistribution?: string
    errorsBySeverity?: string
    errorsByType?: string
    errorsByField?: string
  }
}

/**
 * Error report template
 */
export class ErrorTemplate extends BaseTemplate {
  private data: ErrorReportData
  private includeCharts: boolean
  private groupBySeverity: boolean
  private chartImages?: ErrorTemplateOptions['chartImages']

  constructor(options: ErrorTemplateOptions) {
    super(options)
    this.data = options.data
    this.includeCharts = options.includeCharts ?? true
    this.groupBySeverity = options.groupBySeverity ?? true
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
        subject: 'Reporte de Errores CONSAR',
        keywords: 'CONSAR, errores, validación',
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

    // Error distribution
    content.push(this.renderErrorDistribution())

    // Charts (if enabled)
    if (this.includeCharts && this.chartImages) {
      content.push({ text: '', pageBreak: 'before' as const })
      content.push(this.renderCharts())
    }

    // Detailed errors
    content.push({ text: '', pageBreak: 'before' as const })
    if (this.groupBySeverity) {
      content.push(this.renderErrorsBySeverity())
    } else {
      content.push(this.renderAllErrors())
    }

    return content
  }

  /**
   * Render executive summary
   */
  private renderExecutiveSummary(): Content {
    const { summary } = this.data

    const criticalPercentage = summary.totalErrors > 0
      ? summary.criticalErrors / summary.totalErrors
      : 0

    return {
      stack: [
        this.renderSectionTitle('Resumen Ejecutivo'),
        {
          columns: [
            // Total Errors
            {
              width: '25%',
              stack: [
                { text: 'Total de Errores', style: 'statLabel' },
                {
                  text: this.formatNumber(summary.totalErrors),
                  style: 'statValue',
                  color: summary.totalErrors > 0 ? CONSARColors.error : CONSARColors.success,
                },
              ],
            },
            // Critical Errors
            {
              width: '25%',
              stack: [
                { text: 'Errores Críticos', style: 'statLabel' },
                {
                  text: this.formatNumber(summary.criticalErrors),
                  style: 'statValue',
                  color: summary.criticalErrors > 0 ? CONSARColors.critical : CONSARColors.success,
                },
              ],
            },
            // Error Types
            {
              width: '25%',
              stack: [
                { text: 'Tipos de Error', style: 'statLabel' },
                { text: this.formatNumber(summary.errorTypes), style: 'statValue' },
              ],
            },
            // Affected Records
            {
              width: '25%',
              stack: [
                { text: 'Registros Afectados', style: 'statLabel' },
                { text: this.formatNumber(summary.affectedRecords), style: 'statValue' },
              ],
            },
          ],
          columnGap: 10,
          margin: [0, 10, 0, 15],
        },
        // Status badge
        {
          text: summary.criticalErrors > 0
            ? `✗ ${summary.criticalErrors} Errores Críticos - Acción Inmediata Requerida`
            : summary.totalErrors > 0
            ? `⚠ ${summary.totalErrors} Errores Detectados - Requiere Atención`
            : '✓ Sin Errores Detectados',
          alignment: 'center' as const,
          color: '#ffffff',
          background: summary.criticalErrors > 0 ? CONSARColors.critical :
                     summary.totalErrors > 0 ? CONSARColors.error : CONSARColors.success,
          bold: true,
          margin: [0, 10, 0, 10],
          padding: [10, 5, 10, 5],
        },
      ],
    }
  }

  /**
   * Render error distribution
   */
  private renderErrorDistribution(): Content {
    const content: Content[] = [
      this.renderSectionTitle('Distribución de Errores'),
    ]

    // By severity
    content.push({
      text: 'Por Severidad',
      style: 'subsectionTitle',
    })
    content.push(this.renderDistributionTable(this.data.errorDistribution.bySeverity))

    // By type
    content.push({
      text: 'Por Tipo',
      style: 'subsectionTitle',
      margin: [0, 15, 0, 8],
    })
    content.push(this.renderDistributionTable(this.data.errorDistribution.byType))

    // By field
    content.push({
      text: 'Por Campo (Top 10)',
      style: 'subsectionTitle',
      margin: [0, 15, 0, 8],
    })
    content.push(this.renderDistributionTable(this.data.errorDistribution.byField.slice(0, 10)))

    return { stack: content }
  }

  /**
   * Render distribution table
   */
  private renderDistributionTable(data: Array<{ [key: string]: string | number }>): ContentTable {
    if (data.length === 0) {
      return {
        text: 'No hay datos disponibles.',
        style: 'footerText',
        margin: [0, 5, 0, 10],
      } as any
    }

    // Get column names dynamically
    const firstItem = data[0]
    const columns = Object.keys(firstItem)
    const labelColumn = columns[0]
    const countColumn = columns.find(c => c.includes('count')) || columns[1]
    const percentageColumn = columns.find(c => c.includes('percentage')) || columns[2]

    return {
      table: {
        widths: ['*', 100, 100],
        headerRows: 1,
        body: [
          // Header
          [
            { text: this.capitalizeFirst(labelColumn), style: 'tableHeader' },
            { text: 'Cantidad', style: 'tableHeader', alignment: 'right' as const },
            { text: 'Porcentaje', style: 'tableHeader', alignment: 'right' as const },
          ],
          // Rows
          ...data.map(item => {
            const label = String(item[labelColumn])
            const count = Number(item[countColumn])
            const percentage = Number(item[percentageColumn])

            return [
              { text: label, fontSize: 10 },
              { text: this.formatNumber(count), fontSize: 10, alignment: 'right' as const },
              { text: this.formatPercentage(percentage), fontSize: 10, alignment: 'right' as const },
            ]
          }),
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

    if (this.chartImages?.errorsBySeverity) {
      content.push({
        text: 'Distribución por Severidad',
        style: 'subsectionTitle',
      })
      content.push({
        image: this.chartImages.errorsBySeverity,
        width: 500,
        margin: [0, 10, 0, 20],
      })
    }

    if (this.chartImages?.errorsByType) {
      content.push({
        text: 'Distribución por Tipo',
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
        text: 'Distribución por Campo',
        style: 'subsectionTitle',
      })
      content.push({
        image: this.chartImages.errorsByField,
        width: 500,
        margin: [0, 10, 0, 20],
      })
    }

    return { stack: content }
  }

  /**
   * Render errors grouped by severity
   */
  private renderErrorsBySeverity(): Content {
    const content: Content[] = [
      this.renderSectionTitle('Errores Detallados'),
    ]

    // Group errors by severity
    const critical = this.data.errors.filter(e => e.severity === 'critical')
    const errors = this.data.errors.filter(e => e.severity === 'error')
    const warnings = this.data.errors.filter(e => e.severity === 'warning')

    // Critical errors
    if (critical.length > 0) {
      content.push({
        text: `Errores Críticos (${critical.length})`,
        style: 'subsectionTitle',
        color: CONSARColors.critical,
      })
      content.push(this.renderErrorsTable(critical))
    }

    // Errors
    if (errors.length > 0) {
      content.push({
        text: `Errores (${errors.length})`,
        style: 'subsectionTitle',
        color: CONSARColors.error,
        margin: [0, 15, 0, 8],
      })
      content.push(this.renderErrorsTable(errors))
    }

    // Warnings
    if (warnings.length > 0) {
      content.push({
        text: `Advertencias (${warnings.length})`,
        style: 'subsectionTitle',
        color: CONSARColors.warning,
        margin: [0, 15, 0, 8],
      })
      content.push(this.renderErrorsTable(warnings))
    }

    return { stack: content }
  }

  /**
   * Render all errors (not grouped)
   */
  private renderAllErrors(): Content {
    return {
      stack: [
        this.renderSectionTitle('Errores Detallados'),
        {
          text: `Total: ${this.data.errors.length} errores`,
          style: 'footerText',
          margin: [0, 0, 0, 10],
        },
        this.renderErrorsTable(this.data.errors),
      ],
    }
  }

  /**
   * Render errors table
   */
  private renderErrorsTable(errors: ErrorReportData['errors']): ContentTable {
    const maxErrors = 100 // Limit to prevent huge PDFs
    const displayErrors = errors.slice(0, maxErrors)

    return {
      table: {
        widths: [40, 80, 70, '*', 80],
        headerRows: 1,
        body: [
          // Header
          [
            { text: 'Línea', style: 'tableHeader' },
            { text: 'Campo', style: 'tableHeader' },
            { text: 'Tipo', style: 'tableHeader' },
            { text: 'Mensaje', style: 'tableHeader' },
            { text: 'Severidad', style: 'tableHeader' },
          ],
          // Rows
          ...displayErrors.map(error => [
            { text: String(error.lineNumber), fontSize: 9, alignment: 'right' as const },
            { text: error.fieldName, fontSize: 9 },
            { text: error.errorType, fontSize: 8, color: CONSARColors.textLight },
            {
              stack: [
                { text: error.errorMessage, fontSize: 9, color: CONSARColors.error },
                error.value ? {
                  text: `Valor: ${error.value}`,
                  fontSize: 7,
                  color: CONSARColors.textLight,
                  margin: [0, 2, 0, 0],
                } : {},
                error.expectedFormat ? {
                  text: `Formato esperado: ${error.expectedFormat}`,
                  fontSize: 7,
                  color: CONSARColors.textLight,
                  italics: true,
                  margin: [0, 2, 0, 0],
                } : {},
              ],
            },
            {
              text: error.severity.toUpperCase(),
              fontSize: 7,
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
        hLineWidth: (i: number, node: any) => i === 0 || i === 1 ? 1 : 0.5,
        vLineWidth: () => 0,
        hLineColor: () => CONSARColors.border,
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
      margin: [0, 5, 0, 10],
    }
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}
