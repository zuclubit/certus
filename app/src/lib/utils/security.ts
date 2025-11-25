/**
 * Security Utilities
 *
 * Implements OWASP Top 10 security best practices
 * - XSS Prevention
 * - Input Sanitization
 * - Secure ID Generation
 * - Content Security
 *
 * @version 1.0.0
 * @compliance OWASP Top 10 2021
 */

/**
 * Sanitize string to prevent XSS attacks
 * Removes dangerous characters and limits length
 *
 * @param str - Input string to sanitize
 * @param maxLength - Maximum allowed length (default: 500)
 * @returns Sanitized string safe for display
 */
export const sanitizeString = (str: string, maxLength: number = 500): string => {
  if (!str || typeof str !== 'string') {
    return ''
  }

  return str
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/['"]/g, '') // Remove quotes to prevent attribute injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, onerror=, etc)
    .replace(/data:text\/html/gi, '') // Remove data URI with HTML
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim()
    .substring(0, maxLength) // Limit length to prevent DoS
}

/**
 * Sanitize HTML content using allowlist approach
 * Only allows safe tags and removes all attributes
 *
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML safe for dangerouslySetInnerHTML
 */
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return ''
  }

  // Allowlist of safe tags
  const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre']
  const tagRegex = new RegExp(`<\\/?(?!(?:${allowedTags.join('|')})\\b)[^>]+>`, 'gi')

  return html
    .replace(tagRegex, '') // Remove non-allowed tags
    .replace(/<(\w+)[^>]*>/g, '<$1>') // Remove all attributes from allowed tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
}

/**
 * Generate cryptographically secure random ID
 * Uses Web Crypto API for true randomness
 *
 * @returns Secure random ID (format: timestamp-hexadecimal)
 */
export const secureRandomId = (): string => {
  const timestamp = Date.now()

  // Generate 16 cryptographically secure random bytes
  const randomBytes = new Uint8Array(16)
  crypto.getRandomValues(randomBytes)

  // Convert to hexadecimal
  const randomHex = Array.from(randomBytes, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')

  return `${timestamp}-${randomHex.substring(0, 16)}`
}

/**
 * Generate secure UUID v4
 * Compliant with RFC 4122
 *
 * @returns UUID v4 string
 */
export const generateUUID = (): string => {
  if (crypto.randomUUID) {
    // Use native crypto.randomUUID if available (modern browsers)
    return crypto.randomUUID()
  }

  // Fallback implementation
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // Variant 10

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-')
}

/**
 * Hash string using SHA-256
 * Useful for checksums, file integrity verification
 *
 * @param data - String to hash
 * @returns Promise<hexadecimal hash>
 */
export const hashSHA256 = async (data: string): Promise<string> => {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Validate email format
 * Uses RFC 5322 compliant regex
 *
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false
  }

  // RFC 5322 compliant regex (simplified but secure)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  return emailRegex.test(email) && email.length <= 254 // RFC 5321 max length
}

/**
 * Validate URL format and protocol
 * Only allows http:// and https://
 *
 * @param url - URL to validate
 * @returns true if valid and safe URL
 */
export const isValidURL = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    const parsedURL = new URL(url)
    // Only allow HTTP and HTTPS protocols
    return parsedURL.protocol === 'http:' || parsedURL.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Escape string for use in RegExp
 * Prevents ReDoS attacks
 *
 * @param str - String to escape
 * @returns Escaped string safe for RegExp
 */
export const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Rate limiter for client-side actions
 * Prevents abuse and DoS
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()

  /**
   * Check if action is allowed based on rate limit
   *
   * @param key - Unique identifier (e.g., userId, IP)
   * @param maxAttempts - Maximum attempts allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if action is allowed
   */
  public isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []

    // Filter out attempts outside the time window
    const recentAttempts = attempts.filter((timestamp) => now - timestamp < windowMs)

    if (recentAttempts.length >= maxAttempts) {
      return false
    }

    // Record this attempt
    recentAttempts.push(now)
    this.attempts.set(key, recentAttempts)

    return true
  }

  /**
   * Clear rate limit for a key
   *
   * @param key - Unique identifier to clear
   */
  public clear(key: string): void {
    this.attempts.delete(key)
  }
}

/**
 * CSRF Token Generator
 * Generates and validates anti-CSRF tokens
 */
export class CSRFTokenManager {
  private static readonly TOKEN_KEY = 'csrf_token'
  private static readonly TOKEN_EXPIRY_MS = 3600000 // 1 hour

  /**
   * Generate new CSRF token
   *
   * @returns CSRF token string
   */
  public static generateToken(): string {
    const token = generateUUID()
    const expiresAt = Date.now() + this.TOKEN_EXPIRY_MS

    sessionStorage.setItem(
      this.TOKEN_KEY,
      JSON.stringify({
        token,
        expiresAt,
      })
    )

    return token
  }

  /**
   * Validate CSRF token
   *
   * @param token - Token to validate
   * @returns true if token is valid and not expired
   */
  public static validateToken(token: string): boolean {
    try {
      const stored = sessionStorage.getItem(this.TOKEN_KEY)
      if (!stored) {
        return false
      }

      const { token: storedToken, expiresAt } = JSON.parse(stored)

      if (Date.now() > expiresAt) {
        // Token expired
        sessionStorage.removeItem(this.TOKEN_KEY)
        return false
      }

      return token === storedToken
    } catch {
      return false
    }
  }

  /**
   * Get current valid CSRF token or generate new one
   *
   * @returns Valid CSRF token
   */
  public static getToken(): string {
    try {
      const stored = sessionStorage.getItem(this.TOKEN_KEY)
      if (stored) {
        const { token, expiresAt } = JSON.parse(stored)
        if (Date.now() < expiresAt) {
          return token
        }
      }
    } catch {
      // Fall through to generate new token
    }

    return this.generateToken()
  }
}

/**
 * Content Security Policy Helper
 * Generates CSP meta tag content
 *
 * @returns CSP directives string
 */
export const generateCSP = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: Remove unsafe-* in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.banxico.org.mx https://*.consar.gob.mx",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

/**
 * Secure localStorage wrapper
 * Encrypts data before storing (basic XOR cipher for demo)
 * In production, use Web Crypto API for proper encryption
 */
export class SecureStorage {
  private static readonly SECRET_KEY = 'hergon-v1-secret' // Should be env variable

  /**
   * XOR cipher for basic encryption (demo purposes)
   * In production, use crypto.subtle.encrypt with AES-GCM
   */
  private static encrypt(data: string): string {
    let encrypted = ''
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length)
      )
    }
    return btoa(encrypted)
  }

  private static decrypt(data: string): string {
    const decoded = atob(data)
    let decrypted = ''
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length)
      )
    }
    return decrypted
  }

  /**
   * Set item in localStorage with encryption
   */
  public static setItem(key: string, value: string): void {
    try {
      const encrypted = this.encrypt(value)
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error('SecureStorage.setItem error:', error)
    }
  }

  /**
   * Get item from localStorage with decryption
   */
  public static getItem(key: string): string | null {
    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) {
        return null
      }
      return this.decrypt(encrypted)
    } catch (error) {
      console.error('SecureStorage.getItem error:', error)
      return null
    }
  }

  /**
   * Remove item from localStorage
   */
  public static removeItem(key: string): void {
    localStorage.removeItem(key)
  }
}

export default {
  sanitizeString,
  sanitizeHTML,
  secureRandomId,
  generateUUID,
  hashSHA256,
  isValidEmail,
  isValidURL,
  escapeRegExp,
  RateLimiter,
  CSRFTokenManager,
  generateCSP,
  SecureStorage,
}
