/**
 * Tenants Components - Enterprise 2025
 *
 * Barrel export for all AFORE/Tenant management components.
 * Organized following Atomic Design and modularity best practices.
 *
 * @version 1.0.0
 * @compliance CONSAR 2025
 */

// ============================================================================
// ATOMS
// ============================================================================

// (Atoms are in /components/ui)

// ============================================================================
// MOLECULES
// ============================================================================

export { TenantPageHeader } from './TenantPageHeader'
export type { TenantPageHeaderProps } from './TenantPageHeader'

export { TenantFilters } from './TenantFilters'
export type { TenantFiltersProps } from './TenantFilters'

export { TenantStatsGrid } from './TenantStatsGrid'
export type { TenantStatsGridProps } from './TenantStatsGrid'

// ============================================================================
// ORGANISMS
// ============================================================================

export { TenantCard } from './TenantCard'
export type { TenantCardProps, TenantCardActions } from './TenantCard'

// ============================================================================
// TEMPLATES / MODALS
// ============================================================================

export { CreateTenantModal, EditTenantModal } from './TenantModals'
export type { CreateTenantFormData, EditTenantFormData } from './TenantModals'

export { InviteUserModal } from './InviteUserModal'
export type { InviteUserFormData } from './InviteUserModal'
