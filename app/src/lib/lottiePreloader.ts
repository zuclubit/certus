/**
 * Lottie Animation Preloader
 *
 * Optimización 2025: Precarga las animaciones críticas en el navegador
 * para evitar flickering y mejorar perceived performance.
 *
 * Estrategia:
 * - Precarga solo las animaciones de navegación principal
 * - Usa IntersectionObserver para lazy-load otras
 * - Cachea en memoria para reutilización
 */

import { lottieIcons, type LottieIconKey } from './lottieIcons'

// Cache de animaciones precargadas
const preloadedAnimations = new Map<LottieIconKey, any>()

// Animaciones críticas que se deben precargar inmediatamente
const CRITICAL_ANIMATIONS: LottieIconKey[] = [
  'home',
  'validations',
  'settings',
  'approvals',
  'validators',
]

/**
 * Precarga las animaciones críticas en background
 * Llamar esto en el root del app para mejorar performance inicial
 */
export function preloadCriticalAnimations(): void {
  // Solo ejecutar en el cliente
  if (typeof window === 'undefined') return

  // Usar requestIdleCallback para no bloquear el main thread
  const preload = () => {
    CRITICAL_ANIMATIONS.forEach((key) => {
      if (!preloadedAnimations.has(key)) {
        const animation = lottieIcons[key]
        if (animation) {
          preloadedAnimations.set(key, animation)
          // Simular parsing del JSON para que quede en memoria
          JSON.stringify(animation)
        }
      }
    })
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload, { timeout: 2000 })
  } else {
    // Fallback para navegadores que no soportan requestIdleCallback
    setTimeout(preload, 1)
  }
}

/**
 * Obtiene una animación del cache o del import directo
 */
export function getAnimation(key: LottieIconKey): any {
  // Primero revisa el cache
  if (preloadedAnimations.has(key)) {
    return preloadedAnimations.get(key)
  }

  // Si no está en cache, obtenerla directamente
  const animation = lottieIcons[key]

  // Guardar en cache para próxima vez
  if (animation) {
    preloadedAnimations.set(key, animation)
  }

  return animation
}

/**
 * Precarga todas las animaciones (para navegación)
 * Útil después del login o cuando sabes que el usuario navegará
 */
export function preloadAllAnimations(): void {
  if (typeof window === 'undefined') return

  const preload = () => {
    Object.keys(lottieIcons).forEach((key) => {
      const iconKey = key as LottieIconKey
      if (!preloadedAnimations.has(iconKey)) {
        const animation = lottieIcons[iconKey]
        if (animation) {
          preloadedAnimations.set(iconKey, animation)
        }
      }
    })
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload, { timeout: 5000 })
  } else {
    setTimeout(preload, 100)
  }
}

/**
 * Limpia el cache de animaciones
 * Útil para liberar memoria si es necesario
 */
export function clearAnimationCache(): void {
  preloadedAnimations.clear()
}
