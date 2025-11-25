/**
 * ResponsiveModal Component - VisionOS Premium Design System
 *
 * Componente híbrido que renderiza:
 * - Dialog (desktop): Modal centrado tradicional
 * - Drawer (mobile): Bottom sheet con gestos
 *
 * Features:
 * - Detección automática de dispositivo
 * - API unificada para ambos modos
 * - Transiciones suaves entre breakpoints
 * - Accesibilidad completa
 * - VisionOS glassmorphic design
 *
 * @example
 * <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
 *   <ResponsiveModalHeader>
 *     <ResponsiveModalTitle>Título</ResponsiveModalTitle>
 *   </ResponsiveModalHeader>
 *   <ResponsiveModalBody>Contenido</ResponsiveModalBody>
 *   <ResponsiveModalFooter>
 *     <Button>Aceptar</Button>
 *   </ResponsiveModalFooter>
 * </ResponsiveModal>
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useMediaQuery'

// Dialog imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  type DialogContentProps,
} from './dialog'

// Drawer imports
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from './drawer'

// ============================================================================
// CONTEXT
// ============================================================================

interface ResponsiveModalContextValue {
  isMobile: boolean
  isOpen: boolean
}

const ResponsiveModalContext = React.createContext<ResponsiveModalContextValue>({
  isMobile: false,
  isOpen: false,
})

const useResponsiveModal = () => React.useContext(ResponsiveModalContext)

// ============================================================================
// RESPONSIVE MODAL ROOT
// ============================================================================

export interface ResponsiveModalProps {
  /** Estado de apertura */
  open: boolean
  /** Callback cuando cambia el estado */
  onOpenChange: (open: boolean) => void
  /** Contenido del modal */
  children: React.ReactNode
  /** Forzar modo específico (override detección automática) */
  forceMode?: 'dialog' | 'drawer'
  /** Escalar el fondo en drawer mode */
  shouldScaleBackground?: boolean
}

export function ResponsiveModal({
  open,
  onOpenChange,
  children,
  forceMode,
  shouldScaleBackground = true,
}: ResponsiveModalProps) {
  const isMobileDevice = useIsMobile()
  const isMobile = forceMode ? forceMode === 'drawer' : isMobileDevice

  const contextValue = React.useMemo(
    () => ({ isMobile, isOpen: open }),
    [isMobile, open]
  )

  if (isMobile) {
    return (
      <ResponsiveModalContext.Provider value={contextValue}>
        <Drawer
          open={open}
          onOpenChange={onOpenChange}
          shouldScaleBackground={shouldScaleBackground}
        >
          {children}
        </Drawer>
      </ResponsiveModalContext.Provider>
    )
  }

  return (
    <ResponsiveModalContext.Provider value={contextValue}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      </Dialog>
    </ResponsiveModalContext.Provider>
  )
}

// ============================================================================
// RESPONSIVE MODAL CONTENT
// ============================================================================

export interface ResponsiveModalContentProps
  extends Omit<DialogContentProps, 'showCloseButton'> {
  /** Mostrar botón de cerrar */
  showCloseButton?: boolean
  /** Mostrar handle en drawer mode */
  showHandle?: boolean
  /** Snap points para drawer */
  snapPoints?: (number | string)[]
}

export function ResponsiveModalContent({
  className,
  children,
  size = 'default',
  showCloseButton = true,
  showHandle = true,
  ...props
}: ResponsiveModalContentProps) {
  const { isMobile } = useResponsiveModal()

  if (isMobile) {
    return (
      <DrawerContent
        showHandle={showHandle}
        showCloseButton={showCloseButton}
        className={className}
      >
        {children}
      </DrawerContent>
    )
  }

  return (
    <DialogContent
      size={size}
      showCloseButton={showCloseButton}
      className={className}
      {...props}
    >
      {children}
    </DialogContent>
  )
}

// ============================================================================
// RESPONSIVE MODAL HEADER
// ============================================================================

export interface ResponsiveModalHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Variante compacta */
  compact?: boolean
}

export function ResponsiveModalHeader({
  className,
  compact = false,
  ...props
}: ResponsiveModalHeaderProps) {
  const { isMobile } = useResponsiveModal()

  if (isMobile) {
    return <DrawerHeader className={className} {...props} />
  }

  return <DialogHeader compact={compact} className={className} {...props} />
}

// ============================================================================
// RESPONSIVE MODAL BODY
// ============================================================================

export interface ResponsiveModalBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Sin padding */
  flush?: boolean
}

export function ResponsiveModalBody({
  className,
  flush = false,
  ...props
}: ResponsiveModalBodyProps) {
  const { isMobile } = useResponsiveModal()

  if (isMobile) {
    return (
      <DrawerBody
        className={cn(flush && 'px-0 py-0', className)}
        {...props}
      />
    )
  }

  return <DialogBody flush={flush} className={className} {...props} />
}

// ============================================================================
// RESPONSIVE MODAL FOOTER
// ============================================================================

export interface ResponsiveModalFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Sticky al fondo */
  sticky?: boolean
}

export function ResponsiveModalFooter({
  className,
  sticky = false,
  ...props
}: ResponsiveModalFooterProps) {
  const { isMobile } = useResponsiveModal()

  if (isMobile) {
    return <DrawerFooter className={className} {...props} />
  }

  return <DialogFooter sticky={sticky} className={className} {...props} />
}

// ============================================================================
// RESPONSIVE MODAL TITLE
// ============================================================================

export function ResponsiveModalTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { isMobile } = useResponsiveModal()

  if (isMobile) {
    return <DrawerTitle className={className} {...props} />
  }

  return <DialogTitle className={className} {...props} />
}

// ============================================================================
// RESPONSIVE MODAL DESCRIPTION
// ============================================================================

export function ResponsiveModalDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { isMobile } = useResponsiveModal()

  if (isMobile) {
    return <DrawerDescription className={className} {...props} />
  }

  return <DialogDescription className={className} {...props} />
}

// ============================================================================
// RESPONSIVE MODAL CLOSE
// ============================================================================

export function ResponsiveModalClose({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogClose>) {
  const { isMobile } = useResponsiveModal()

  if (isMobile) {
    return <DrawerClose className={className} {...props} />
  }

  return <DialogClose className={className} {...props} />
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  useResponsiveModal,
  ResponsiveModalContext,
}
