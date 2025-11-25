/**
 * Dialog Component - VisionOS Premium Design System
 *
 * Componente base de dialog/modal siguiendo mejores prácticas:
 * - Accesibilidad WAI-ARIA completa
 * - Focus trap automático
 * - Animaciones iOS-style
 * - Soporte para reduced-motion
 * - Theme-aware (dark/light)
 * - Múltiples tamaños
 * - Glassmorphic VisionOS styling
 *
 * @see https://www.radix-ui.com/primitives/docs/components/dialog
 */

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

// ============================================================================
// DIALOG ROOT & TRIGGER
// ============================================================================

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

// ============================================================================
// DIALOG OVERLAY
// ============================================================================

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      // Base
      'fixed inset-0 z-[var(--z-modal-backdrop,500)]',
      'bg-black/50 backdrop-blur-sm',

      // Animations
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
      'duration-200',

      // Reduced motion
      'motion-reduce:animate-none motion-reduce:transition-opacity',

      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// ============================================================================
// DIALOG CONTENT VARIANTS
// ============================================================================

const dialogContentVariants = cva(
  [
    // Base positioning
    'fixed left-[50%] top-[50%] z-[var(--z-modal-content,520)]',
    'translate-x-[-50%] translate-y-[-50%]',

    // Sizing
    'w-[calc(100%-32px)]',
    'max-h-[calc(100vh-48px)] max-h-[calc(100dvh-48px)]',

    // Structure
    'flex flex-col overflow-hidden',

    // Visual
    'rounded-[20px] sm:rounded-[24px]',
    'border-[1.5px]',

    // Animations
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
    'data-[state=open]:zoom-in-[0.96] data-[state=closed]:zoom-out-[0.96]',
    'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
    'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
    'duration-300',

    // Reduced motion
    'motion-reduce:animate-none motion-reduce:transition-opacity',

    // Focus outline
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  ],
  {
    variants: {
      size: {
        sm: 'max-w-[400px]',
        default: 'max-w-[560px]',
        md: 'max-w-[560px]',
        lg: 'max-w-[720px]',
        xl: 'max-w-[900px]',
        '2xl': 'max-w-[1100px]',
        '3xl': 'max-w-[1400px]',
        full: 'max-w-[calc(100vw-32px)] sm:max-w-[calc(100vw-64px)]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

// ============================================================================
// DIALOG CONTENT
// ============================================================================

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  /** Mostrar botón de cerrar (default: true) */
  showCloseButton?: boolean
  /** Callback al cerrar con el botón X */
  onCloseClick?: () => void
  /** Forzar tema (override del store) */
  forceTheme?: 'light' | 'dark'
  /** Clase adicional para el overlay */
  overlayClassName?: string
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      children,
      size,
      showCloseButton = true,
      onCloseClick,
      forceTheme,
      overlayClassName,
      ...props
    },
    ref
  ) => {
    const storeTheme = useAppStore(selectTheme)
    const theme = forceTheme || storeTheme
    const isDark = theme === 'dark'

    return (
      <DialogPortal>
        <DialogOverlay className={overlayClassName} />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(dialogContentVariants({ size }), className)}
          style={{
            // VisionOS Glass Premium
            background: isDark
              ? `linear-gradient(
                  135deg,
                  rgba(20, 20, 25, 0.97) 0%,
                  rgba(25, 25, 32, 0.95) 50%,
                  rgba(20, 20, 25, 0.97) 100%
                )`
              : `linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.98) 0%,
                  rgba(250, 250, 255, 0.96) 50%,
                  rgba(255, 255, 255, 0.98) 100%
                )`,
            backdropFilter: isDark
              ? 'blur(32px) saturate(180%) brightness(0.95)'
              : 'blur(32px) saturate(180%) brightness(1.05)',
            WebkitBackdropFilter: isDark
              ? 'blur(32px) saturate(180%) brightness(0.95)'
              : 'blur(32px) saturate(180%) brightness(1.05)',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(255, 255, 255, 0.6)',
            boxShadow: isDark
              ? `0 0 0 0.5px rgba(255, 255, 255, 0.08),
                 0 24px 80px rgba(0, 0, 0, 0.5),
                 0 12px 40px rgba(0, 0, 0, 0.35),
                 inset 0 1px 0 rgba(255, 255, 255, 0.08)`
              : `0 0 0 0.5px rgba(255, 255, 255, 0.8),
                 0 24px 80px rgba(0, 0, 0, 0.12),
                 0 12px 40px rgba(0, 0, 0, 0.08),
                 inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
          }}
          {...props}
        >
          {/* Crystal highlight effect */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[1px] pointer-events-none"
            style={{
              background: `linear-gradient(
                90deg,
                transparent 0%,
                ${isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.6)'} 50%,
                transparent 100%
              )`,
            }}
          />

          {children}

          {showCloseButton && (
            <DialogPrimitive.Close
              onClick={onCloseClick}
              className={cn(
                'absolute right-4 top-4 z-[var(--z-modal-close,530)]',
                'h-9 w-9 flex items-center justify-center',
                'rounded-xl',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                'disabled:pointer-events-none',
                'hover:scale-105 active:scale-95',
                isDark
                  ? 'bg-white/10 hover:bg-white/15 text-neutral-400 hover:text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700'
              )}
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  }
)
DialogContent.displayName = DialogPrimitive.Content.displayName

// ============================================================================
// DIALOG HEADER
// ============================================================================

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variante compacta para headers más pequeños */
  compact?: boolean
}

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, compact = false, ...props }, ref) => {
    const theme = useAppStore(selectTheme)
    const isDark = theme === 'dark'

    return (
      <div
        ref={ref}
        className={cn(
          'flex-shrink-0',
          compact ? 'px-4 py-3 sm:px-5 sm:py-4' : 'px-5 py-4 sm:px-6 sm:py-5',
          className
        )}
        style={{
          borderBottom: `1px solid ${
            isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
          }`,
        }}
        {...props}
      />
    )
  }
)
DialogHeader.displayName = 'DialogHeader'

// ============================================================================
// DIALOG BODY
// ============================================================================

interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Sin padding (para contenido flush) */
  flush?: boolean
}

const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ className, flush = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex-1 overflow-y-auto overflow-x-hidden',
        'overscroll-contain',
        // Custom scrollbar
        'scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600',
        'scrollbar-track-transparent',
        !flush && 'px-5 py-4 sm:px-6 sm:py-5',
        className
      )}
      {...props}
    />
  )
)
DialogBody.displayName = 'DialogBody'

// ============================================================================
// DIALOG FOOTER
// ============================================================================

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Sticky al fondo (para modales con mucho scroll) */
  sticky?: boolean
}

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, sticky = false, ...props }, ref) => {
    const theme = useAppStore(selectTheme)
    const isDark = theme === 'dark'

    return (
      <div
        ref={ref}
        className={cn(
          'flex-shrink-0',
          'px-5 py-4 sm:px-6 sm:py-5',
          'flex items-center justify-end gap-3',
          // Mobile: stack vertically
          'flex-col-reverse sm:flex-row',
          // Sticky variant
          sticky && 'sticky bottom-0 backdrop-blur-xl',
          className
        )}
        style={{
          borderTop: `1px solid ${
            isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
          }`,
          background: sticky
            ? isDark
              ? 'rgba(20, 20, 25, 0.9)'
              : 'rgba(255, 255, 255, 0.9)'
            : isDark
            ? 'rgba(255, 255, 255, 0.02)'
            : 'rgba(0, 0, 0, 0.02)',
        }}
        {...props}
      />
    )
  }
)
DialogFooter.displayName = 'DialogFooter'

// ============================================================================
// DIALOG TITLE
// ============================================================================

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        'text-xl sm:text-2xl font-bold',
        'leading-tight tracking-tight',
        isDark ? 'text-neutral-100' : 'text-neutral-900',
        className
      )}
      {...props}
    />
  )
})
DialogTitle.displayName = DialogPrimitive.Title.displayName

// ============================================================================
// DIALOG DESCRIPTION
// ============================================================================

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn(
        'text-sm mt-1.5',
        'leading-relaxed',
        isDark ? 'text-neutral-400' : 'text-neutral-600',
        className
      )}
      {...props}
    />
  )
})
DialogDescription.displayName = DialogPrimitive.Description.displayName

// ============================================================================
// EXPORTS
// ============================================================================

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
