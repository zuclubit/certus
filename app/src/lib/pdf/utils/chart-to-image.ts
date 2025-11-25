/**
 * Chart to Image Converter
 *
 * Utilities for converting Recharts SVG charts to PNG images for PDF embedding
 */

import html2canvas from 'html2canvas'

export interface ChartToImageOptions {
  /**
   * DPI for the image (higher = better quality)
   * @default 300
   */
  dpi?: number

  /**
   * Background color
   * @default 'white'
   */
  backgroundColor?: string

  /**
   * Image format
   * @default 'image/png'
   */
  format?: 'image/png' | 'image/jpeg'

  /**
   * Image quality (0-1) for JPEG
   * @default 0.95
   */
  quality?: number

  /**
   * Width override (optional)
   */
  width?: number

  /**
   * Height override (optional)
   */
  height?: number
}

/**
 * Convert a DOM element (chart) to a base64 image
 */
export async function chartToImage(
  element: HTMLElement,
  options: ChartToImageOptions = {}
): Promise<string> {
  const {
    dpi = 300,
    backgroundColor = 'white',
    format = 'image/png',
    quality = 0.95,
    width,
    height,
  } = options

  // Calculate scale for DPI
  const scale = dpi / 96 // 96 is standard screen DPI

  try {
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: width || element.offsetWidth,
      height: height || element.offsetHeight,
    })

    // Convert to base64
    return canvas.toDataURL(format, quality)
  } catch (error) {
    console.error('Error converting chart to image:', error)
    throw new Error('Failed to convert chart to image')
  }
}

/**
 * Convert Recharts chart to image
 * Automatically finds the SVG element within the chart container
 */
export async function rechartsToImage(
  containerElement: HTMLElement,
  options: ChartToImageOptions = {}
): Promise<string> {
  // Find the recharts wrapper
  const rechartsWrapper = containerElement.querySelector('.recharts-wrapper') as HTMLElement

  if (!rechartsWrapper) {
    throw new Error('Recharts wrapper not found. Make sure the chart has rendered.')
  }

  return chartToImage(rechartsWrapper, options)
}

/**
 * Convert multiple charts to images in parallel
 */
export async function chartsToImages(
  elements: HTMLElement[],
  options: ChartToImageOptions = {}
): Promise<string[]> {
  const promises = elements.map(element => chartToImage(element, options))
  return Promise.all(promises)
}

/**
 * Wait for chart to render before converting
 */
export function waitForChartRender(element: HTMLElement, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    const checkInterval = setInterval(() => {
      const rechartsWrapper = element.querySelector('.recharts-wrapper')

      if (rechartsWrapper) {
        clearInterval(checkInterval)
        // Give it a bit more time to fully render
        setTimeout(() => resolve(), 100)
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        reject(new Error('Chart render timeout'))
      }
    }, 100)
  })
}

/**
 * Helper to render chart off-screen and convert to image
 */
export async function renderChartOffscreen(
  chartElement: React.ReactElement,
  options: ChartToImageOptions & { containerWidth?: number; containerHeight?: number } = {}
): Promise<string> {
  const {
    containerWidth = 600,
    containerHeight = 400,
    ...imageOptions
  } = options

  return new Promise((resolve, reject) => {
    // Create off-screen container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    container.style.width = `${containerWidth}px`
    container.style.height = `${containerHeight}px`
    document.body.appendChild(container)

    try {
      // Render chart (this would need React.render in actual implementation)
      // For now, we assume the caller will handle rendering

      // Wait for render and convert
      waitForChartRender(container)
        .then(() => rechartsToImage(container, imageOptions))
        .then(imageData => {
          // Cleanup
          document.body.removeChild(container)
          resolve(imageData)
        })
        .catch(error => {
          // Cleanup on error
          document.body.removeChild(container)
          reject(error)
        })
    } catch (error) {
      // Cleanup on error
      document.body.removeChild(container)
      reject(error)
    }
  })
}

/**
 * Helper to get optimized image options for PDF
 */
export function getPDFImageOptions(): ChartToImageOptions {
  return {
    dpi: 300, // High quality for print
    backgroundColor: 'white',
    format: 'image/png',
    quality: 0.95,
  }
}

/**
 * Helper to get fast image options for preview
 */
export function getPreviewImageOptions(): ChartToImageOptions {
  return {
    dpi: 150, // Lower quality for speed
    backgroundColor: 'white',
    format: 'image/jpeg',
    quality: 0.85,
  }
}

/**
 * Download image as file (useful for debugging)
 */
export function downloadImage(imageData: string, filename: string): void {
  const link = document.createElement('a')
  link.href = imageData
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
