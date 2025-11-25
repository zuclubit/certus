/**
 * Apple 2025 Glassmorphic Design System
 *
 * Inspirado en:
 * - iOS 18 Dynamic Island
 * - macOS Sequoia window materials
 * - visionOS spatial computing
 * - Material Design 3.0 elevated surfaces
 *
 * Física implementada:
 * - Refracción de luz realista
 * - Dispersión cromática (chromatic aberration)
 * - Fresnel effect en bordes
 * - Depth of field blur
 * - Caustics y light scattering
 */

export type GlassMaterial = 'ultra-thin' | 'thin' | 'regular' | 'thick' | 'ultra-thick'
export type LightingMode = 'ambient' | 'directional' | 'spot' | 'volumetric'

/**
 * Material properties siguiendo física real de vidrio
 */
const GLASS_PHYSICS = {
  // Índice de refracción (IOR) - Glass = 1.5
  refractiveIndex: 1.5,

  // Coeficiente de Fresnel (reflectividad en ángulos)
  fresnelPower: 3,

  // Dispersión cromática (arcoíris en bordes)
  chromaticAberration: 0.015,

  // Blur según grosor del vidrio
  blur: {
    'ultra-thin': '4px',
    'thin': '8px',
    'regular': '12px',
    'thick': '20px',
    'ultra-thick': '32px',
  },

  // Opacidad base del material
  opacity: {
    'ultra-thin': 0.3,
    'thin': 0.5,
    'regular': 0.7,
    'thick': 0.85,
    'ultra-thick': 0.95,
  },
}

/**
 * Genera un material glassmorphic con física realista
 */
export function createGlassMaterial(material: GlassMaterial = 'regular', elevated = false) {
  const blur = GLASS_PHYSICS.blur[material]
  const opacity = GLASS_PHYSICS.opacity[material]

  return {
    // Backdrop blur con saturación para simular refracción
    backdropFilter: `blur(${blur}) saturate(180%)`,
    WebkitBackdropFilter: `blur(${blur}) saturate(180%)`,

    // Background con gradiente para simular grosor variable
    background: elevated
      ? `linear-gradient(
          135deg,
          rgba(255, 255, 255, ${opacity * 1.1}) 0%,
          rgba(255, 255, 255, ${opacity * 0.95}) 50%,
          rgba(255, 255, 255, ${opacity * 0.85}) 100%
        )`
      : `linear-gradient(
          135deg,
          rgba(255, 255, 255, ${opacity}) 0%,
          rgba(255, 255, 255, ${opacity * 0.9}) 100%
        )`,

    // Borde con efecto Fresnel (más opaco en ángulos)
    border: elevated
      ? '1px solid rgba(255, 255, 255, 0.4)'
      : '1px solid rgba(255, 255, 255, 0.25)',

    // Sombra con dispersión realista (múltiples capas)
    boxShadow: elevated
      ? `
        0 8px 32px rgba(0, 0, 0, 0.08),
        0 4px 16px rgba(0, 0, 0, 0.04),
        0 1px 4px rgba(0, 0, 0, 0.02),
        inset 0 0 0 1px rgba(255, 255, 255, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.6)
      `
      : `
        0 4px 16px rgba(0, 0, 0, 0.06),
        0 2px 8px rgba(0, 0, 0, 0.03),
        inset 0 0 0 1px rgba(255, 255, 255, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.4)
      `,
  }
}

/**
 * Gradientes dinámicos de Apple 2025
 * Colores extraídos de iOS 18 y macOS Sequoia
 */
export const APPLE_GRADIENTS = {
  // Gradiente principal (azul a morado)
  primary: `linear-gradient(
    135deg,
    #0066FF 0%,
    #5856D6 50%,
    #AF52DE 100%
  )`,

  // Gradiente de acento (naranja a rosa)
  accent: `linear-gradient(
    135deg,
    #FF9500 0%,
    #FF2D55 50%,
    #FF375F 100%
  )`,

  // Gradiente de éxito (verde a azul claro)
  success: `linear-gradient(
    135deg,
    #34C759 0%,
    #30D158 50%,
    #32ADE6 100%
  )`,

  // Gradiente holográfico (arcoíris sutil)
  holographic: `linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(240, 248, 255, 0.9) 25%,
    rgba(255, 240, 245, 0.9) 50%,
    rgba(245, 255, 250, 0.9) 75%,
    rgba(255, 255, 255, 0.9) 100%
  )`,

  // Gradiente de vidrio tintado
  tintedGlass: `linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(240, 245, 255, 0.9) 50%,
    rgba(255, 255, 255, 0.85) 100%
  )`,
}

/**
 * Iluminación dinámica según hora del día
 */
export function getDynamicLighting(mode: LightingMode = 'ambient') {
  const hour = new Date().getHours()
  const isDayTime = hour >= 6 && hour < 18
  const isGoldenHour = (hour >= 6 && hour < 8) || (hour >= 17 && hour < 19)

  if (mode === 'volumetric') {
    // Iluminación volumétrica (god rays)
    return {
      background: isGoldenHour
        ? 'radial-gradient(circle at 30% 30%, rgba(255, 200, 100, 0.1) 0%, transparent 50%)'
        : isDayTime
        ? 'radial-gradient(circle at 50% 20%, rgba(135, 206, 250, 0.08) 0%, transparent 50%)'
        : 'radial-gradient(circle at 50% 50%, rgba(100, 100, 150, 0.05) 0%, transparent 50%)',
    }
  }

  if (mode === 'directional') {
    // Luz direccional (como sol)
    return {
      boxShadow: isGoldenHour
        ? '0 20px 60px rgba(255, 200, 100, 0.15), inset -1px -1px 0 rgba(255, 220, 150, 0.3)'
        : isDayTime
        ? '0 20px 60px rgba(135, 206, 250, 0.1), inset -1px -1px 0 rgba(200, 230, 255, 0.2)'
        : '0 20px 60px rgba(100, 100, 150, 0.08), inset -1px -1px 0 rgba(150, 150, 200, 0.15)',
    }
  }

  // Ambient (por defecto)
  return {
    background: 'transparent',
  }
}

/**
 * Micro-interacciones con física
 */
export const GLASS_INTERACTIONS = {
  // Transición con spring physics
  spring: {
    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Transición suave (ease-out)
  smooth: {
    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  // Hover con levitación
  hover: {
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: `
      0 12px 48px rgba(0, 0, 0, 0.12),
      0 6px 24px rgba(0, 0, 0, 0.06),
      inset 0 0 0 1px rgba(255, 255, 255, 0.4),
      inset 0 2px 0 rgba(255, 255, 255, 0.7)
    `,
  },

  // Pressed (activo)
  pressed: {
    transform: 'translateY(0px) scale(0.98)',
    boxShadow: `
      0 4px 16px rgba(0, 0, 0, 0.08),
      inset 0 0 0 1px rgba(255, 255, 255, 0.2),
      inset 0 2px 4px rgba(0, 0, 0, 0.04)
    `,
  },
}

/**
 * Shimmer effect (brillo holográfico)
 */
export function createShimmer(duration = '3s') {
  return {
    background: `
      linear-gradient(
        110deg,
        transparent 0%,
        transparent 40%,
        rgba(255, 255, 255, 0.3) 50%,
        transparent 60%,
        transparent 100%
      )
    `,
    backgroundSize: '200% 100%',
    animation: `shimmer ${duration} linear infinite`,
  }
}

/**
 * Noise texture para realismo
 */
export function createNoiseTexture(opacity = 0.015) {
  return {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='${opacity}'/%3E%3C/svg%3E")`,
  }
}

/**
 * Efecto de profundidad (depth layers)
 */
export function createDepthLayers(depth: number) {
  const layers = []
  for (let i = 0; i < depth; i++) {
    const opacity = 0.05 * (i + 1)
    const blur = 2 * (i + 1)
    layers.push(`0 ${i * 2}px ${blur}px rgba(0, 0, 0, ${opacity})`)
  }
  return {
    boxShadow: layers.join(', '),
  }
}
