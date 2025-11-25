/**
 * UI Components - Central Export
 *
 * Archivo de barril para importaciones simplificadas de componentes UI
 * Permite importar múltiples componentes en una sola línea
 *
 * Ejemplo:
 * import { SectionContainer, SectionHeader, DataField } from '@/components/ui'
 */

// Nuevos componentes modulares V2
export { SectionContainer } from './section-container'
export type { SectionContainerProps } from './section-container'

export { SectionHeader } from './section-header'
export type { SectionHeaderProps } from './section-header'

export { StatusBadge } from './status-badge'
export type { StatusBadgeProps } from './status-badge'

export { DataField } from './data-field'
export type { DataFieldProps } from './data-field'

export { SearchBar } from './search-bar'
export type { SearchBarProps } from './search-bar'

export { FilterChip } from './filter-chip'
export type { FilterChipProps } from './filter-chip'

export { ActionButton } from './action-button'
export type { ActionButtonProps } from './action-button'

export { FileCard } from './file-card.premium'
export type { FileCardProps } from './file-card.premium'

export { PremiumButtonFintech } from './premium-button-fintech'
export type { PremiumButtonFintechProps } from './premium-button-fintech'

export { PremiumButtonV2 } from './premium-button-v2'
export type { PremiumButtonV2Props } from './premium-button-v2'

export { PremiumDataTable } from './premium-data-table'
export type { PremiumDataTableProps, ErrorRecord, RecordStatus } from './premium-data-table'

export { PremiumAuditTable } from './premium-audit-table'
export type { PremiumAuditTableProps } from './premium-audit-table'

export { PremiumTimeline } from './premium-timeline'
export type { PremiumTimelineProps } from './premium-timeline'

// Componentes existentes
export { GlassmorphicCard } from './glassmorphic-card'
export type { GlassmorphicCardProps } from './glassmorphic-card'

export { FieldDisplayCard } from './field-display-card'
export type { FieldDisplayCardProps } from './field-display-card'

export { AlertCard } from './alert-card'

export { PremiumButton } from './premium-button'

export { Badge } from './badge'
export { Button } from './button'
export { Card } from './card'
export { Input } from './input'
export { Label } from './label'
export { ThemeToggle } from './ThemeToggle'
export { LottieIcon } from './LottieIcon'
export { Toaster } from './toaster'

// Dialog exports
export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
} from './dialog'
export type { DialogContentProps } from './dialog'

// Drawer exports
export {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
} from './drawer'

// Responsive Modal exports (Dialog + Drawer hybrid)
export {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalBody,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalClose,
  useResponsiveModal,
} from './responsive-modal'
export type {
  ResponsiveModalProps,
  ResponsiveModalContentProps,
  ResponsiveModalHeaderProps,
  ResponsiveModalBodyProps,
  ResponsiveModalFooterProps,
} from './responsive-modal'

// Modal Variants exports
export {
  ConfirmDialog,
  FormModal,
  DetailModal,
  AlertModal,
} from './modal-variants'
export type {
  ConfirmDialogProps,
  ConfirmDialogVariant,
  FormModalProps,
  DetailModalProps,
  AlertModalProps,
  AlertModalVariant,
} from './modal-variants'

// Dropdown exports
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './dropdown-menu'

// Avatar exports
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from './avatar'
