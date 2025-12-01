/**
 * useToast Hook
 *
 * A simple hook wrapper around Sonner toast library.
 * Provides a consistent API for displaying toast notifications.
 *
 * @version 1.0.0
 */

import { toast as sonnerToast } from 'sonner'

export interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description, variant = 'default', duration } = options

    switch (variant) {
      case 'destructive':
        sonnerToast.error(title, {
          description,
          duration,
        })
        break
      case 'success':
        sonnerToast.success(title, {
          description,
          duration,
        })
        break
      case 'warning':
        sonnerToast.warning(title, {
          description,
          duration,
        })
        break
      default:
        sonnerToast(title, {
          description,
          duration,
        })
    }
  }

  return { toast }
}

export default useToast
