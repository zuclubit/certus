/**
 * Users Components - Enterprise 2025
 *
 * Barrel export para todos los componentes del módulo de usuarios.
 * Organizado siguiendo Atomic Design y mejores prácticas de modularidad.
 *
 * @see https://bradfrost.com/blog/post/atomic-web-design/
 */

// ============================================================================
// ATOMS
// ============================================================================

// (Los átomos están en /components/ui)

// ============================================================================
// MOLECULES
// ============================================================================

export { UserPageHeader } from './UserPageHeader'
export type { UserPageHeaderProps } from './UserPageHeader'

export { UserFilters } from './UserFilters'
export type { UserFiltersProps } from './UserFilters'

export { UserStatsGrid } from './UserStatsGrid'
export type { UserStatsGridProps } from './UserStatsGrid'

// ============================================================================
// ORGANISMS
// ============================================================================

export { UserCard } from './UserCard'
export type { UserCardProps, UserCardActions } from './UserCard'

// ============================================================================
// TEMPLATES / MODALS
// ============================================================================

export { CreateUserModal, EditUserModal } from './UserModals.visionos'
export type {
  CreateUserFormData,
  EditUserFormData,
} from './UserModals.visionos'
