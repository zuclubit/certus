/**
 * Skeleton - Base Component (VisionOS 2025)
 *
 * Componente primitivo base para crear skeleton loaders.
 * Siguiendo mejores prácticas de react-loading-skeleton y Tailwind CSS.
 *
 * Características:
 * - Soporte light/dark mode automático
 * - Animación shimmer, pulse o wave
 * - Glassmorphism opcional
 * - Completamente accesible
 * - Memoizado para performance
 *
 * @see https://www.npmjs.com/package/react-loading-skeleton
 * @see https://flowbite.com/docs/components/skeleton/
 */

import { memo, CSSProperties, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import './skeleton.css'

// ============================================================================
// TYPES
// ============================================================================

export type SkeletonAnimation = 'shimmer' | 'pulse' | 'wave' | 'none'
export type SkeletonVariant = 'default' | 'glass' | 'solid'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Width of the skeleton (CSS value) */
  width?: string | number
  /** Height of the skeleton (CSS value) */
  height?: string | number
  /** Border radius (CSS value) */
  radius?: string | number
  /** Make it circular (sets border-radius: 50%) */
  circle?: boolean
  /** Animation type */
  animation?: SkeletonAnimation
  /** Visual variant */
  variant?: SkeletonVariant
  /** Number of skeleton lines to render */
  count?: number
  /** Gap between multiple skeletons */
  gap?: string | number
  /** Additional className */
  className?: string
  /** Inline styles */
  style?: CSSProperties
}

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

/**
 * Base Skeleton Component
 *
 * @example
 * // Simple text skeleton
 * <Skeleton width="200px" height="16px" />
 *
 * @example
 * // Circle avatar skeleton
 * <Skeleton circle width={48} height={48} />
 *
 * @example
 * // Multiple lines
 * <Skeleton count={3} height="16px" gap={8} />
 *
 * @example
 * // Glass card skeleton
 * <Skeleton variant="glass" width="100%" height="200px" radius={20} />
 */
export const Skeleton = memo(function Skeleton({
  width = '100%',
  height = '1em',
  radius = 8,
  circle = false,
  animation = 'shimmer',
  variant = 'default',
  count = 1,
  gap = 8,
  className,
  style,
  ...props
}: SkeletonProps) {
  // Build animation class
  const animationClass = animation !== 'none' ? `skeleton-${animation}` : ''

  // Build variant class
  const variantClass = variant === 'glass' ? 'skeleton-glass-card' : ''

  // Calculate border radius
  const borderRadius = circle ? '50%' : typeof radius === 'number' ? `${radius}px` : radius

  // Single skeleton element
  const skeletonElement = (key?: number) => (
    <div
      key={key}
      className={cn(
        'skeleton-base',
        animationClass,
        variantClass,
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
      role="presentation"
      {...props}
    />
  )

  // Render multiple skeletons if count > 1
  if (count > 1) {
    return (
      <div
        className="flex flex-col"
        style={{ gap: typeof gap === 'number' ? `${gap}px` : gap }}
        aria-busy="true"
        aria-live="polite"
      >
        {Array.from({ length: count }).map((_, i) => skeletonElement(i))}
      </div>
    )
  }

  return skeletonElement()
})

// ============================================================================
// SKELETON TEXT - For text placeholders
// ============================================================================

export interface SkeletonTextProps extends Omit<SkeletonProps, 'circle'> {
  /** Number of text lines */
  lines?: number
  /** Last line width (for natural text appearance) */
  lastLineWidth?: string | number
}

export const SkeletonText = memo(function SkeletonText({
  lines = 1,
  lastLineWidth = '60%',
  height = '1em',
  gap = 8,
  ...props
}: SkeletonTextProps) {
  if (lines === 1) {
    return <Skeleton height={height} {...props} />
  }

  return (
    <div
      className="flex flex-col"
      style={{ gap: typeof gap === 'number' ? `${gap}px` : gap }}
      aria-busy="true"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={height}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          {...props}
        />
      ))}
    </div>
  )
})

// ============================================================================
// SKELETON CIRCLE - For avatars, icons
// ============================================================================

export interface SkeletonCircleProps extends Omit<SkeletonProps, 'circle' | 'radius'> {
  /** Size (width and height) */
  size?: string | number
}

export const SkeletonCircle = memo(function SkeletonCircle({
  size = 40,
  ...props
}: SkeletonCircleProps) {
  return <Skeleton circle width={size} height={size} {...props} />
})

// ============================================================================
// SKELETON IMAGE - For image placeholders
// ============================================================================

export interface SkeletonImageProps extends Omit<SkeletonProps, 'circle'> {
  /** Aspect ratio (e.g., "16/9", "4/3", "1/1") */
  aspectRatio?: string
}

export const SkeletonImage = memo(function SkeletonImage({
  aspectRatio = '16/9',
  radius = 12,
  ...props
}: SkeletonImageProps) {
  return (
    <Skeleton
      width="100%"
      height="auto"
      radius={radius}
      style={{ aspectRatio }}
      {...props}
    />
  )
})

// ============================================================================
// SKELETON BUTTON - For button placeholders
// ============================================================================

export interface SkeletonButtonProps extends Omit<SkeletonProps, 'circle'> {
  /** Button size preset */
  size?: 'sm' | 'md' | 'lg'
}

const buttonSizes = {
  sm: { width: '80px', height: '32px', radius: 8 },
  md: { width: '120px', height: '40px', radius: 10 },
  lg: { width: '160px', height: '48px', radius: 12 },
}

export const SkeletonButton = memo(function SkeletonButton({
  size = 'md',
  ...props
}: SkeletonButtonProps) {
  const sizeConfig = buttonSizes[size]
  return (
    <Skeleton
      width={sizeConfig.width}
      height={sizeConfig.height}
      radius={sizeConfig.radius}
      {...props}
    />
  )
})

// ============================================================================
// SKELETON BADGE - For badge/tag placeholders
// ============================================================================

export const SkeletonBadge = memo(function SkeletonBadge(props: Omit<SkeletonProps, 'circle'>) {
  return <Skeleton width="60px" height="22px" radius={11} {...props} />
})

// ============================================================================
// EXPORTS
// ============================================================================

export default Skeleton
