import * as React from 'react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      ref={ref}
      className={cn(
        // Rounded corners - ultra-refined
        'rounded-[20px]',
        'lg:rounded-[24px]',
        'xl:rounded-[26px]',
        '2xl:rounded-[28px]',
        // visionOS Ultra effects
        'glass-ultra-premium glass-caustics volumetric-light',
        'depth-layer-4 fresnel-edge iridescent-overlay',
        'subsurface-scatter',
        'crystal-overlay prism-effect atmospheric-depth',
        'specular-highlights inner-glow frosted-premium edge-luminance',
        'glass-gpu-accelerated ultra-smooth',
        'transition-all duration-300',
        className
      )}
      style={{
        background: isDark ? `
          linear-gradient(
            135deg,
            rgba(20, 20, 25, 0.92) 0%,
            rgba(25, 25, 32, 0.90) 25%,
            rgba(22, 22, 30, 0.89) 50%,
            rgba(25, 25, 32, 0.90) 75%,
            rgba(20, 20, 25, 0.92) 100%
          )
        ` : `
          linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.92) 0%,
            rgba(250, 250, 255, 0.90) 25%,
            rgba(255, 250, 255, 0.89) 50%,
            rgba(250, 255, 255, 0.90) 75%,
            rgba(255, 255, 255, 0.92) 100%
          )
        `,
        backdropFilter: isDark
          ? 'blur(32px) saturate(180%) brightness(1.03) contrast(1.05)'
          : 'blur(32px) saturate(180%) brightness(1.12) contrast(1.03)',
        WebkitBackdropFilter: isDark
          ? 'blur(32px) saturate(180%) brightness(1.03) contrast(1.05)'
          : 'blur(32px) saturate(180%) brightness(1.12) contrast(1.03)',
        border: isDark
          ? '1.5px solid rgba(255, 255, 255, 0.12)'
          : '1.5px solid rgba(255, 255, 255, 0.6)',
        boxShadow: isDark ? `
          0 0 0 0.5px rgba(255, 255, 255, 0.08),
          0 0 60px rgba(0, 0, 0, 0.4),
          0 0 40px rgba(0, 0, 0, 0.35),
          0 0 20px rgba(0, 0, 0, 0.25),
          0 8px 32px rgba(0, 0, 0, 0.3),
          0 4px 16px rgba(0, 0, 0, 0.2),
          0 2px 8px rgba(0, 0, 0, 0.15),
          inset 0 0 0 1px rgba(255, 255, 255, 0.06),
          inset 0 2px 0 rgba(255, 255, 255, 0.04),
          inset 0 -2px 0 rgba(0, 0, 0, 0.25),
          inset 0 0 40px rgba(135, 206, 250, 0.02)
        ` : `
          0 0 0 0.5px rgba(255, 255, 255, 0.85),
          0 0 60px rgba(0, 0, 0, 0.08),
          0 0 40px rgba(0, 0, 0, 0.06),
          0 0 20px rgba(0, 0, 0, 0.04),
          0 8px 32px rgba(0, 0, 0, 0.05),
          0 4px 16px rgba(0, 0, 0, 0.03),
          0 2px 8px rgba(0, 0, 0, 0.02),
          inset 0 0 0 1px rgba(255, 255, 255, 0.35),
          inset 0 2px 0 rgba(255, 255, 255, 0.45),
          inset 0 -2px 0 rgba(0, 0, 0, 0.04),
          inset 0 0 40px rgba(135, 206, 250, 0.04)
        `,
      }}
      {...props}
    />
  )
})
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      ref={ref}
      className={cn('px-6 py-5 lg:px-7 lg:py-6', className)}
      style={{
        borderBottom: isDark
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: isDark ? `
          0 1px 0 rgba(255, 255, 255, 0.03),
          0 2px 6px rgba(0, 0, 0, 0.2)
        ` : `
          0 1px 0 rgba(255, 255, 255, 0.5),
          0 2px 6px rgba(0, 0, 0, 0.02)
        `,
      }}
      {...props}
    />
  )
})
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <h3
      ref={ref}
      className={cn(
        // iOS 2025 Typography - Title 3 (20px) → Title 2 (22px responsive)
        'ios-heading-title3 ios-text-glass-subtle',
        'lg:text-2xl', // Upgrade to 22px on desktop
        isDark ? 'text-neutral-100' : 'text-neutral-800',
        className
      )}
      data-text={typeof props.children === 'string' ? props.children : undefined}
      {...props}
    />
  )
})
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <p
      ref={ref}
      className={cn(
        // iOS 2025 Typography - Footnote (15px)
        'ios-text-footnote ios-font-medium mt-1.5',
        isDark ? 'text-neutral-400' : 'text-neutral-500',
        className
      )}
      {...props}
    />
  )
})
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-6 py-5 lg:px-7 lg:py-6', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      ref={ref}
      className={cn('px-6 py-5 lg:px-7 lg:py-6', className)}
      style={{
        borderTop: isDark
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.08)',
        background: isDark ? `
          linear-gradient(
            135deg,
            rgba(18, 18, 22, 0.5) 0%,
            rgba(20, 20, 25, 0.45) 50%,
            rgba(18, 18, 22, 0.5) 100%
          )
        ` : `
          linear-gradient(
            135deg,
            rgba(248, 248, 252, 0.6) 0%,
            rgba(250, 250, 255, 0.55) 50%,
            rgba(248, 248, 252, 0.6) 100%
          )
        `,
        boxShadow: isDark ? `
          0 -1px 0 rgba(255, 255, 255, 0.03),
          0 -2px 6px rgba(0, 0, 0, 0.2)
        ` : `
          0 -1px 0 rgba(255, 255, 255, 0.5),
          0 -2px 6px rgba(0, 0, 0, 0.02)
        `,
      }}
      {...props}
    />
  )
})
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
