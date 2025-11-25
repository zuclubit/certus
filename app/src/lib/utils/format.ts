import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea una fecha en formato legible español
 * @param date - Fecha a formatear
 * @param formatStr - Formato personalizado (default: 'dd MMM yyyy, HH:mm')
 * @returns Fecha formateada
 */
export const formatDate = (
  date: Date | string | number,
  formatStr: string = 'dd MMM yyyy, HH:mm'
): string => {
  try {
    return format(new Date(date), formatStr, { locale: es })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Fecha inválida'
  }
}

/**
 * Formatea una fecha en tiempo relativo (ej: "hace 2 horas")
 * @param date - Fecha a formatear
 * @returns Tiempo relativo en español
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es,
    })
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return 'Fecha inválida'
  }
}

/**
 * Formatea un número como moneda mexicana (MXN)
 * @param amount - Monto a formatear
 * @returns Monto formateado con símbolo de peso
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatea un número con separadores de miles
 * @param num - Número a formatear
 * @param decimals - Número de decimales (default: 0)
 * @returns Número formateado
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Formatea un tamaño de archivo en formato legible (KB, MB, GB)
 * @param bytes - Tamaño en bytes
 * @param decimals - Número de decimales (default: 2)
 * @returns Tamaño formateado
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Formatea un porcentaje
 * @param value - Valor numérico (0-100)
 * @param decimals - Número de decimales (default: 1)
 * @returns Porcentaje formateado
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Formatea un código de validador (ej: "V01" -> "Validador 01")
 * @param code - Código del validador
 * @returns Código formateado
 */
export const formatValidatorCode = (code: string): string => {
  const match = code.match(/V(\d+)/)
  return match ? `Validador ${match[1]}` : code
}

/**
 * Trunca un texto largo con ellipsis
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @returns Texto truncado
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Capitaliza la primera letra de un string
 * @param str - String a capitalizar
 * @returns String capitalizado
 */
export const capitalize = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convierte un string a slug (URL-friendly)
 * @param str - String a convertir
 * @returns Slug
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}
