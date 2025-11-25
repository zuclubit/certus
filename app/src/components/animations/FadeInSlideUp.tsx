/**
 * FadeInSlideUp - VisionOS Enterprise Animation Component
 *
 * Animación de entrada suave con fade-in y slide-up para elementos del dashboard.
 * Compatible con el sistema de diseño VisionOS-Enterprise 2026.
 *
 * Características:
 * - Fade-in progresivo (opacity 0 → 1)
 * - Slide-up suave (translateY 20px → 0)
 * - Delays escalonados para múltiples elementos
 * - Curvas de easing VisionOS (cubic-bezier)
 * - Hardware-accelerated (transform, opacity)
 */

import { ReactNode, CSSProperties } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface FadeInSlideUpProps {
  children: ReactNode
  delay?: number
  duration?: number
  distance?: number
  className?: string
  style?: CSSProperties
}

// ============================================================================
// ANIMATION PRESETS - VisionOS Timing
// ============================================================================

const ANIMATION_PRESETS = {
  default: {
    duration: 600, // ms
    distance: 20, // px
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // VisionOS ease-out
  },
  subtle: {
    duration: 400,
    distance: 12,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Suave
  },
  dramatic: {
    duration: 800,
    distance: 32,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // Spring-like
  },
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FadeInSlideUp({
  children,
  delay = 0,
  duration = ANIMATION_PRESETS.default.duration,
  distance = ANIMATION_PRESETS.default.distance,
  className = '',
  style = {},
}: FadeInSlideUpProps) {
  return (
    <div
      className={`fade-in-slide-up ${className}`}
      style={{
        ...style,
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        '--slide-distance': `${distance}px`,
      } as CSSProperties & { '--slide-distance': string }}
    >
      {children}

      <style>{`
        @keyframes fadeInSlideUp {
          from {
            opacity: 0;
            transform: translateY(var(--slide-distance, 20px));
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-slide-up {
          animation-name: fadeInSlideUp;
          animation-timing-function: ${ANIMATION_PRESETS.default.easing};
          animation-fill-mode: both;
          will-change: transform, opacity;
        }

        /* Reduce motion para accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          .fade-in-slide-up {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// STAGGER WRAPPER - Para animar múltiples elementos con delays escalonados
// ============================================================================

export interface StaggerContainerProps {
  children: ReactNode[]
  staggerDelay?: number
  baseDelay?: number
  className?: string
}

export function StaggerContainer({
  children,
  staggerDelay = 100,
  baseDelay = 0,
  className = '',
}: StaggerContainerProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeInSlideUp key={index} delay={baseDelay + index * staggerDelay}>
          {child}
        </FadeInSlideUp>
      ))}
    </div>
  )
}

// ============================================================================
// SCALE FADE IN - Alternativa con escala
// ============================================================================

export interface ScaleFadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function ScaleFadeIn({
  children,
  delay = 0,
  duration = 500,
  className = '',
}: ScaleFadeInProps) {
  return (
    <div
      className={`scale-fade-in ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}

      <style>{`
        @keyframes scaleFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .scale-fade-in {
          animation-name: scaleFadeIn;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          animation-fill-mode: both;
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .scale-fade-in {
            animation: none !important;
            opacity: 1 !important;
            transform: scale(1) !important;
          }
        }
      `}</style>
    </div>
  )
}
