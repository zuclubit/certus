/**
 * useMediaQuery Hook
 *
 * Hook para detectar media queries de forma reactiva.
 * Optimizado para SSR y con debounce para evitar re-renders excesivos.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
 */

import { useState, useEffect, useCallback } from 'react'

// Breakpoints predefinidos siguiendo sistema de diseño
export const BREAKPOINTS = {
  xxs: '(max-width: 359px)',
  xs: '(max-width: 479px)',
  sm: '(max-width: 639px)',
  md: '(max-width: 767px)',
  lg: '(max-width: 1023px)',
  xl: '(max-width: 1279px)',
  '2xl': '(max-width: 1535px)',

  // Mobile-first (min-width)
  'sm-up': '(min-width: 640px)',
  'md-up': '(min-width: 768px)',
  'lg-up': '(min-width: 1024px)',
  'xl-up': '(min-width: 1280px)',
  '2xl-up': '(min-width: 1536px)',

  // Accessibility
  'reduced-motion': '(prefers-reduced-motion: reduce)',
  'dark-mode': '(prefers-color-scheme: dark)',
  'high-contrast': '(prefers-contrast: high)',

  // Device detection
  'touch': '(hover: none) and (pointer: coarse)',
  'mouse': '(hover: hover) and (pointer: fine)',

  // Orientation
  'portrait': '(orientation: portrait)',
  'landscape': '(orientation: landscape)',
} as const

export type BreakpointKey = keyof typeof BREAKPOINTS

/**
 * Hook principal para media queries
 */
export function useMediaQuery(query: string): boolean {
  // Función para obtener el estado inicial (SSR-safe)
  const getMatches = useCallback((query: string): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  }, [])

  const [matches, setMatches] = useState<boolean>(() => getMatches(query))

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)

    // Actualizar estado inicial
    setMatches(mediaQuery.matches)

    // Handler para cambios
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Usar addEventListener moderno con fallback
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback para Safari < 14
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [query, getMatches])

  return matches
}

/**
 * Hook conveniente para detectar dispositivo móvil
 */
export function useIsMobile(): boolean {
  return useMediaQuery(BREAKPOINTS.md)
}

/**
 * Hook conveniente para detectar tablet
 */
export function useIsTablet(): boolean {
  const isAboveMobile = useMediaQuery(BREAKPOINTS['md-up'])
  const isBelowDesktop = useMediaQuery(BREAKPOINTS.lg)
  return isAboveMobile && isBelowDesktop
}

/**
 * Hook conveniente para detectar desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(BREAKPOINTS['lg-up'])
}

/**
 * Hook para preferencia de movimiento reducido
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(BREAKPOINTS['reduced-motion'])
}

/**
 * Hook para detectar dispositivo táctil
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery(BREAKPOINTS.touch)
}

/**
 * Hook que retorna el breakpoint actual
 */
export function useBreakpoint(): 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  const isXxs = useMediaQuery(BREAKPOINTS.xxs)
  const isXs = useMediaQuery(BREAKPOINTS.xs)
  const isSm = useMediaQuery(BREAKPOINTS.sm)
  const isMd = useMediaQuery(BREAKPOINTS.md)
  const isLg = useMediaQuery(BREAKPOINTS.lg)
  const isXl = useMediaQuery(BREAKPOINTS.xl)

  if (isXxs) return 'xxs'
  if (isXs) return 'xs'
  if (isSm) return 'sm'
  if (isMd) return 'md'
  if (isLg) return 'lg'
  if (isXl) return 'xl'
  return '2xl'
}

export default useMediaQuery
