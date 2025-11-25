/**
 * Base PDF Template
 *
 * Provides common structure and utilities for all PDF reports
 */

import type { TDocumentDefinitions, Content, ContentText, ContentTable, PageSize, PageOrientation } from 'pdfmake/interfaces'
import { CONSARColors, PDFTypography, type ReportMetadata } from '../types'

export interface BaseTemplateOptions {
  metadata: ReportMetadata
  orientation?: PageOrientation
  pageSize?: PageSize
  includePageNumbers?: boolean
  watermark?: string
  footerText?: string
}

/**
 * Base template class for all PDF reports
 */
export class BaseTemplate {
  protected metadata: ReportMetadata
  protected orientation: PageOrientation
  protected pageSize: PageSize
  protected includePageNumbers: boolean
  protected watermark?: string
  protected footerText?: string

  constructor(options: BaseTemplateOptions) {
    this.metadata = options.metadata
    this.orientation = options.orientation || 'portrait'
    this.pageSize = options.pageSize || 'LETTER'
    this.includePageNumbers = options.includePageNumbers ?? true
    this.watermark = options.watermark
    this.footerText = options.footerText
  }

  /**
   * Get base document definition
   */
  protected getBaseDocumentDefinition(): Partial<TDocumentDefinitions> {
    return {
      pageSize: this.pageSize,
      pageOrientation: this.orientation,
      pageMargins: [40, 80, 40, 60],

      // Header
      header: (currentPage: number, pageCount: number) => {
        return this.renderHeader(currentPage, pageCount)
      },

      // Footer
      footer: (currentPage: number, pageCount: number) => {
        return this.renderFooter(currentPage, pageCount)
      },

      // Watermark
      watermark: this.watermark ? {
        text: this.watermark,
        color: CONSARColors.border,
        opacity: 0.1,
        bold: true,
        italics: false,
      } : undefined,

      // Default styles
      defaultStyle: {
        font: 'Roboto',
        fontSize: PDFTypography.fontSize.body,
        color: CONSARColors.text,
        lineHeight: PDFTypography.lineHeight.normal,
      },

      // Custom styles
      styles: this.getStyles(),
    }
  }

  /**
   * Render header
   */
  protected renderHeader(currentPage: number, pageCount: number): Content {
    return {
      margin: [40, 20, 40, 20],
      columns: [
        // Logo placeholder
        {
          width: 100,
          stack: [
            {
              text: 'CERTUS',
              style: 'logo',
              color: CONSARColors.primary,
            },
          ],
        },
        // Title
        {
          width: '*',
          stack: [
            {
              text: this.metadata.title,
              style: 'headerTitle',
            },
            this.metadata.subtitle ? {
              text: this.metadata.subtitle,
              style: 'headerSubtitle',
            } : {},
          ],
          alignment: 'right' as const,
        },
      ],
    }
  }

  /**
   * Render footer
   */
  protected renderFooter(currentPage: number, pageCount: number): Content {
    const footerContent: Content[] = []

    // Custom footer text
    if (this.footerText) {
      footerContent.push({
        text: this.footerText,
        style: 'footerText',
        alignment: 'left' as const,
      })
    }

    // Page numbers
    if (this.includePageNumbers) {
      footerContent.push({
        text: `Página ${currentPage} de ${pageCount}`,
        style: 'pageNumber',
        alignment: 'right' as const,
      })
    }

    // Generation info
    footerContent.push({
      text: `Generado el ${this.formatDate(this.metadata.generatedAt)}`,
      style: 'footerText',
      alignment: 'center' as const,
    })

    return {
      margin: [40, 10, 40, 10],
      columns: footerContent.length === 3 ? [
        { width: '33%', ...footerContent[0] },
        { width: '34%', ...footerContent[2] },
        { width: '33%', ...footerContent[1] },
      ] : footerContent,
    }
  }

  /**
   * Render document info section
   */
  protected renderDocumentInfo(): Content {
    const infoRows: Array<[string, string]> = [
      ['Reporte', this.metadata.title],
      ['Fecha de generación', this.formatDateTime(this.metadata.generatedAt)],
    ]

    if (this.metadata.generatedBy) {
      infoRows.push(['Generado por', this.metadata.generatedBy])
    }

    if (this.metadata.version) {
      infoRows.push(['Versión', this.metadata.version])
    }

    if (this.metadata.fileInfo) {
      infoRows.push(
        ['Archivo', this.metadata.fileInfo.fileName],
        ['Tipo de archivo', this.metadata.fileInfo.fileType],
        ['Tamaño', this.formatFileSize(this.metadata.fileInfo.fileSize)],
        ['Fecha de carga', this.formatDateTime(this.metadata.fileInfo.uploadDate)]
      )
    }

    return {
      style: 'section',
      stack: [
        {
          text: 'Información del Documento',
          style: 'sectionTitle',
        },
        {
          table: {
            widths: [120, '*'],
            body: infoRows.map(([label, value]) => [
              { text: label, style: 'tableLabel', bold: true },
              { text: value, style: 'tableValue' },
            ]),
          },
          layout: 'noBorders',
        },
      ],
    }
  }

  /**
   * Render section title
   */
  protected renderSectionTitle(title: string): Content {
    return {
      text: title,
      style: 'sectionTitle',
      margin: [0, 15, 0, 10],
    }
  }

  /**
   * Render divider
   */
  protected renderDivider(): Content {
    return {
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 515,
          y2: 0,
          lineWidth: 1,
          lineColor: CONSARColors.border,
        },
      ],
      margin: [0, 10, 0, 10],
    }
  }

  /**
   * Render key-value table
   */
  protected renderKeyValueTable(data: Array<[string, string | number]>): ContentTable {
    return {
      table: {
        widths: [150, '*'],
        body: data.map(([key, value]) => [
          { text: key, style: 'tableLabel', bold: true },
          { text: String(value), style: 'tableValue' },
        ]),
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
    }
  }

  /**
   * Render status badge
   */
  protected renderStatusBadge(
    status: 'success' | 'warning' | 'error' | 'critical',
    text: string
  ): Content {
    const colors = {
      success: CONSARColors.success,
      warning: CONSARColors.warning,
      error: CONSARColors.error,
      critical: CONSARColors.critical,
    }

    return {
      text,
      color: '#ffffff',
      background: colors[status],
      bold: true,
      fontSize: PDFTypography.fontSize.small,
      margin: [0, 2, 0, 2],
      padding: [4, 2, 4, 2],
    }
  }

  /**
   * Get custom styles
   */
  protected getStyles() {
    return {
      // Logo
      logo: {
        fontSize: 18,
        bold: true,
        letterSpacing: 2,
      },

      // Headers
      headerTitle: {
        fontSize: PDFTypography.fontSize.heading2,
        bold: true,
        color: CONSARColors.primary,
      },
      headerSubtitle: {
        fontSize: PDFTypography.fontSize.body,
        color: CONSARColors.textLight,
        margin: [0, 2, 0, 0],
      },

      // Titles
      title: {
        fontSize: PDFTypography.fontSize.title,
        bold: true,
        color: CONSARColors.primary,
        margin: [0, 0, 0, 20],
      },
      subtitle: {
        fontSize: PDFTypography.fontSize.subtitle,
        bold: true,
        color: CONSARColors.text,
        margin: [0, 0, 0, 15],
      },
      sectionTitle: {
        fontSize: PDFTypography.fontSize.heading1,
        bold: true,
        color: CONSARColors.primary,
        margin: [0, 10, 0, 8],
      },
      subsectionTitle: {
        fontSize: PDFTypography.fontSize.heading2,
        bold: true,
        color: CONSARColors.text,
        margin: [0, 8, 0, 6],
      },

      // Tables
      tableHeader: {
        fontSize: PDFTypography.fontSize.body,
        bold: true,
        color: '#ffffff',
        fillColor: CONSARColors.primary,
        margin: [0, 5, 0, 5],
      },
      tableLabel: {
        fontSize: PDFTypography.fontSize.body,
        color: CONSARColors.textLight,
      },
      tableValue: {
        fontSize: PDFTypography.fontSize.body,
        color: CONSARColors.text,
      },

      // Footer
      footerText: {
        fontSize: PDFTypography.fontSize.small,
        color: CONSARColors.textLight,
      },
      pageNumber: {
        fontSize: PDFTypography.fontSize.small,
        color: CONSARColors.textLight,
        bold: true,
      },

      // Sections
      section: {
        margin: [0, 10, 0, 10],
      },

      // Stats
      statLabel: {
        fontSize: PDFTypography.fontSize.small,
        color: CONSARColors.textLight,
      },
      statValue: {
        fontSize: PDFTypography.fontSize.heading1,
        bold: true,
        color: CONSARColors.primary,
      },
    }
  }

  /**
   * Format date (short)
   */
  protected formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  }

  /**
   * Format date and time
   */
  protected formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  /**
   * Format file size
   */
  protected formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  /**
   * Format number
   */
  protected formatNumber(num: number): string {
    return new Intl.NumberFormat('es-MX').format(num)
  }

  /**
   * Format percentage
   */
  protected formatPercentage(value: number): string {
    return `${(value * 100).toFixed(2)}%`
  }
}
