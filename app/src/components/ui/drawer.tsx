/**
 * Drawer Component - VisionOS Premium Design System
 *
 * Componente drawer/bottom-sheet para dispositivos móviles.
 * Basado en Vaul con diseño VisionOS glassmorphic.
 *
 * Features:
 * - Animaciones iOS-style con física realista
 * - Gestos de arrastre con snap points
 * - Soporte para backdrop scaling
 * - Accesibilidad completa
 * - Theme-aware
 *
 * @see https://vaul.emilkowal.ski/
 */

import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

// ============================================================================
// DRAWER ROOT
// ============================================================================

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
  shouldScaleBackground?: boolean
}) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
)
Drawer.displayName = 'Drawer'

// ============================================================================
// DRAWER COMPONENTS
// ============================================================================

const DrawerTrigger = DrawerPrimitive.Trigger
const DrawerPortal = DrawerPrimitive.Portal
const DrawerClose = DrawerPrimitive.Close

// ============================================================================
// DRAWER OVERLAY
// ============================================================================

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-[var(--z-drawer-backdrop,500)]',
      'bg-black/50 backdrop-blur-sm',
      className
    )}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

// ============================================================================
// DRAWER CONTENT
// ============================================================================

interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  /** Mostrar el handle de arrastre (default: true) */
  showHandle?: boolean
  /** Mostrar botón de cerrar (default: false en drawer) */
  showCloseButton?: boolean
  /** Dirección del drawer */
  direction?: 'bottom' | 'top' | 'left' | 'right'
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(
  (
    {
      className,
      children,
      showHandle = true,
      showCloseButton = false,
      direction = 'bottom',
      ...props
    },
    ref
  ) => {
    const theme = useAppStore(selectTheme)
    const isDark = theme === 'dark'

    const directionStyles = {
      bottom: 'inset-x-0 bottom-0 rounded-t-[20px]',
      top: 'inset-x-0 top-0 rounded-b-[20px]',
      left: 'inset-y-0 left-0 rounded-r-[20px] max-w-[90vw]',
      right: 'inset-y-0 right-0 rounded-l-[20px] max-w-[90vw]',
    }

    const isVertical = direction === 'bottom' || direction === 'top'

    return (
      <DrawerPortal>
        <DrawerOverlay />
        <DrawerPrimitive.Content
          ref={ref}
          className={cn(
            'fixed z-[var(--z-drawer,510)]',
            'flex flex-col',
            'border-[1.5px]',
            isVertical ? 'max-h-[96vh] max-h-[96dvh]' : 'h-full',
            directionStyles[direction],
            className
          )}
          style={{
            // VisionOS Glass Premium
            background: isDark
              ? `linear-gradient(
                  180deg,
                  rgba(25, 25, 32, 0.98) 0%,
                  rgba(20, 20, 25, 0.99) 100%
                )`
              : `linear-gradient(
                  180deg,
                  rgba(255, 255, 255, 0.99) 0%,
                  rgba(250, 250, 255, 0.98) 100%
                )`,
            backdropFilter: isDark
              ? 'blur(40px) saturate(180%) brightness(0.95)'
              : 'blur(40px) saturate(180%) brightness(1.05)',
            WebkitBackdropFilter: isDark
              ? 'blur(40px) saturate(180%) brightness(0.95)'
              : 'blur(40px) saturate(180%) brightness(1.05)',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(255, 255, 255, 0.6)',
            boxShadow: isDark
              ? `0 -8px 40px rgba(0, 0, 0, 0.5),
                 inset 0 1px 0 rgba(255, 255, 255, 0.08)`
              : `0 -8px 40px rgba(0, 0, 0, 0.1),
                 inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
            // Safe area for iOS
            paddingBottom: 'env(safe-area-inset-bottom, 0)',
          }}
          {...props}
        >
          {/* Handle */}
          {showHandle && isVertical && (
            <div className="flex justify-center pt-4 pb-2">
              <div
                className={cn(
                  'w-12 h-1.5 rounded-full',
                  isDark ? 'bg-white/25' : 'bg-neutral-300'
                )}
              />
            </div>
          )}

          {/* Close button */}
          {showCloseButton && (
            <DrawerPrimitive.Close
              className={cn(
                'absolute top-4 right-4 z-10',
                'h-9 w-9 flex items-center justify-center',
                'rounded-xl',
                'transition-all duration-200',
                'hover:scale-105 active:scale-95',
                isDark
                  ? 'bg-white/10 hover:bg-white/15 text-neutral-400 hover:text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700'
              )}
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </DrawerPrimitive.Close>
          )}

          {children}
        </DrawerPrimitive.Content>
      </DrawerPortal>
    )
  }
)
DrawerContent.displayName = 'DrawerContent'

// ============================================================================
// DRAWER HEADER
// ============================================================================

const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      ref={ref}
      className={cn('flex-shrink-0 px-5 py-4', className)}
      style={{
        borderBottom: `1px solid ${
          isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
        }`,
      }}
      {...props}
    />
  )
})
DrawerHeader.displayName = 'DrawerHeader'

// ============================================================================
// DRAWER BODY
// ============================================================================

const DrawerBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex-1 overflow-y-auto overflow-x-hidden',
      'px-5 py-4',
      'overscroll-contain',
      className
    )}
    {...props}
  />
))
DrawerBody.displayName = 'DrawerBody'

// ============================================================================
// DRAWER FOOTER
// ============================================================================

const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      ref={ref}
      className={cn(
        'flex-shrink-0',
        'px-5 py-4',
        'flex flex-col gap-3',
        className
      )}
      style={{
        borderTop: `1px solid ${
          isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
        }`,
        background: isDark
          ? 'rgba(255, 255, 255, 0.02)'
          : 'rgba(0, 0, 0, 0.02)',
        // Extra padding for safe area (added to existing)
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
      }}
      {...props}
    />
  )
})
DrawerFooter.displayName = 'DrawerFooter'

// ============================================================================
// DRAWER TITLE
// ============================================================================

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <DrawerPrimitive.Title
      ref={ref}
      className={cn(
        'text-xl font-bold',
        'leading-tight tracking-tight',
        isDark ? 'text-neutral-100' : 'text-neutral-900',
        className
      )}
      {...props}
    />
  )
})
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

// ============================================================================
// DRAWER DESCRIPTION
// ============================================================================

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <DrawerPrimitive.Description
      ref={ref}
      className={cn(
        'text-sm mt-1',
        'leading-relaxed',
        isDark ? 'text-neutral-400' : 'text-neutral-600',
        className
      )}
      {...props}
    />
  )
})
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

// ============================================================================
// EXPORTS
// ============================================================================

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
