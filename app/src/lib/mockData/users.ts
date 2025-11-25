/**
 * Mock Users Data - Enterprise CONSAR Compliance 2025
 *
 * Realistic user data for testing RBAC, audit trails, and user management
 * Includes CONSAR-compliant fields for financial institutions
 */

import type { User } from '@/types'
import { USER_ROLES } from '@/lib/constants'

// ============================================================================
// MOCK USERS DATA
// ============================================================================

export const mockUsers: User[] = [
  // AFORE Administrators
  {
    id: 'usr_001',
    email: 'director.sistemas@afore-ejemplo.mx',
    name: 'María Fernanda González',
    role: USER_ROLES.AFORE_ADMIN,
    tenantId: 'afore_ejemplo',
    avatar: 'https://i.pravatar.cc/150?u=usr_001',
    phone: '+52 55 1234 5678',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2025-11-20T10:30:00Z',
    lastLogin: '2025-11-23T09:15:00Z',
    status: 'active',
    department: 'Tecnología',
    position: 'Directora de Sistemas',
    employeeNumber: 'EMP-001',
    isEmailVerified: true,
    isMfaEnabled: true,
    sessionCount: 1247,
  },
  {
    id: 'usr_002',
    email: 'jefe.validaciones@afore-ejemplo.mx',
    name: 'Carlos Alberto Ramírez',
    role: USER_ROLES.AFORE_ADMIN,
    tenantId: 'afore_ejemplo',
    avatar: 'https://i.pravatar.cc/150?u=usr_002',
    phone: '+52 55 2345 6789',
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2025-11-22T16:45:00Z',
    lastLogin: '2025-11-23T08:00:00Z',
    status: 'active',
    department: 'Operaciones',
    position: 'Jefe de Validaciones',
    employeeNumber: 'EMP-002',
    isEmailVerified: true,
    isMfaEnabled: true,
    sessionCount: 892,
  },

  // AFORE Analysts
  {
    id: 'usr_003',
    email: 'ana.lopez@afore-ejemplo.mx',
    name: 'Ana Patricia López',
    role: USER_ROLES.AFORE_ANALYST,
    tenantId: 'afore_ejemplo',
    avatar: 'https://i.pravatar.cc/150?u=usr_003',
    phone: '+52 55 3456 7890',
    createdAt: '2024-06-20T10:00:00Z',
    updatedAt: '2025-11-21T14:20:00Z',
    lastLogin: '2025-11-23T07:30:00Z',
    status: 'active',
    department: 'Validaciones',
    position: 'Analista de Validaciones',
    employeeNumber: 'EMP-003',
    isEmailVerified: true,
    isMfaEnabled: true,
    sessionCount: 654,
  },
  {
    id: 'usr_004',
    email: 'roberto.martinez@afore-ejemplo.mx',
    name: 'Roberto Martínez Sánchez',
    role: USER_ROLES.AFORE_ANALYST,
    tenantId: 'afore_ejemplo',
    avatar: 'https://i.pravatar.cc/150?u=usr_004',
    phone: '+52 55 4567 8901',
    createdAt: '2024-07-15T11:30:00Z',
    updatedAt: '2025-11-20T09:00:00Z',
    lastLogin: '2025-11-22T18:45:00Z',
    status: 'active',
    department: 'Validaciones',
    position: 'Analista Senior',
    employeeNumber: 'EMP-004',
    isEmailVerified: true,
    isMfaEnabled: false,
    sessionCount: 523,
  },
  {
    id: 'usr_005',
    email: 'laura.hernandez@afore-ejemplo.mx',
    name: 'Laura Gabriela Hernández',
    role: USER_ROLES.AFORE_ANALYST,
    tenantId: 'afore_ejemplo',
    avatar: 'https://i.pravatar.cc/150?u=usr_005',
    phone: '+52 55 5678 9012',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2025-11-23T08:15:00Z',
    lastLogin: '2025-11-23T08:15:00Z',
    status: 'active',
    department: 'Reportes',
    position: 'Analista de Reportes',
    employeeNumber: 'EMP-005',
    isEmailVerified: true,
    isMfaEnabled: true,
    sessionCount: 287,
  },

  // System Administrators
  {
    id: 'usr_006',
    email: 'admin@certus-consar.mx',
    name: 'Jorge Luis Pérez',
    role: USER_ROLES.SYSTEM_ADMIN,
    tenantId: 'certus_system',
    avatar: 'https://i.pravatar.cc/150?u=usr_006',
    phone: '+52 55 6789 0123',
    createdAt: '2023-11-01T00:00:00Z',
    updatedAt: '2025-11-23T10:00:00Z',
    lastLogin: '2025-11-23T10:00:00Z',
    status: 'active',
    department: 'Sistemas',
    position: 'Administrador de Sistema',
    employeeNumber: 'SYS-001',
    isEmailVerified: true,
    isMfaEnabled: true,
    sessionCount: 2154,
  },

  // Auditors
  {
    id: 'usr_007',
    email: 'auditor@consar.gob.mx',
    name: 'Patricia Morales Gutiérrez',
    role: USER_ROLES.AUDITOR,
    tenantId: 'consar_audit',
    avatar: 'https://i.pravatar.cc/150?u=usr_007',
    phone: '+52 55 7890 1234',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2025-11-21T16:30:00Z',
    lastLogin: '2025-11-21T16:30:00Z',
    status: 'active',
    department: 'Auditoría',
    position: 'Auditora CONSAR',
    employeeNumber: 'AUD-001',
    isEmailVerified: true,
    isMfaEnabled: true,
    sessionCount: 412,
  },

  // Inactive/Suspended Users
  {
    id: 'usr_008',
    email: 'juan.garcia@afore-ejemplo.mx',
    name: 'Juan Carlos García',
    role: USER_ROLES.AFORE_ANALYST,
    tenantId: 'afore_ejemplo',
    avatar: 'https://i.pravatar.cc/150?u=usr_008',
    phone: '+52 55 8901 2345',
    createdAt: '2024-04-10T09:00:00Z',
    updatedAt: '2025-10-15T12:00:00Z',
    lastLogin: '2025-10-15T12:00:00Z',
    status: 'suspended',
    department: 'Validaciones',
    position: 'Analista',
    employeeNumber: 'EMP-008',
    isEmailVerified: true,
    isMfaEnabled: false,
    sessionCount: 198,
    suspensionReason: 'Incumplimiento de políticas de seguridad',
    suspendedAt: '2025-10-15T12:00:00Z',
  },
  {
    id: 'usr_009',
    email: 'monica.torres@afore-ejemplo.mx',
    name: 'Mónica Torres Silva',
    role: USER_ROLES.AFORE_ANALYST,
    tenantId: 'afore_ejemplo',
    avatar: 'https://i.pravatar.cc/150?u=usr_009',
    phone: '+52 55 9012 3456',
    createdAt: '2023-12-05T10:00:00Z',
    updatedAt: '2025-08-20T15:00:00Z',
    lastLogin: '2025-08-20T15:00:00Z',
    status: 'inactive',
    department: 'Validaciones',
    position: 'Analista',
    employeeNumber: 'EMP-009',
    isEmailVerified: true,
    isMfaEnabled: false,
    sessionCount: 445,
    inactiveReason: 'Baja voluntaria',
    inactiveSince: '2025-08-20T15:00:00Z',
  },

  // Pending Users
  {
    id: 'usr_010',
    email: 'daniel.ruiz@afore-ejemplo.mx',
    name: 'Daniel Ruiz Mendoza',
    role: USER_ROLES.AFORE_ANALYST,
    tenantId: 'afore_ejemplo',
    avatar: 'https://i.pravatar.cc/150?u=usr_010',
    phone: '+52 55 0123 4567',
    createdAt: '2025-11-22T14:00:00Z',
    updatedAt: '2025-11-22T14:00:00Z',
    lastLogin: undefined,
    status: 'pending',
    department: 'Validaciones',
    position: 'Analista Junior',
    employeeNumber: 'EMP-010',
    isEmailVerified: false,
    isMfaEnabled: false,
    sessionCount: 0,
    invitedBy: 'usr_001',
    invitedAt: '2025-11-22T14:00:00Z',
  },

  // Additional active users for better testing
  {
    id: 'usr_011',
    email: 'fernando.diaz@afore-ejemplo.mx',
    name: 'Fernando Díaz Castillo',
    role: USER_ROLES.AFORE_ANALYST,
    tenantId: 'afore_ejemplo',
    avatar: 'https://i.pravatar.cc/150?u=usr_011',
    phone: '+52 55 1234 9876',
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2025-11-23T09:00:00Z',
    lastLogin: '2025-11-23T09:00:00Z',
    status: 'active',
    department: 'Catálogos',
    position: 'Especialista en Catálogos',
    employeeNumber: 'EMP-011',
    isEmailVerified: true,
    isMfaEnabled: true,
    sessionCount: 356,
  },
  {
    id: 'usr_012',
    email: 'sandra.rivera@afore-ejemplo.mx',
    name: 'Sandra Mariana Rivera',
    role: USER_ROLES.AFORE_ADMIN,
    tenantId: 'afore_ejemplo',
    avatar: 'https://i.pravatar.cc/150?u=usr_012',
    phone: '+52 55 2345 8765',
    createdAt: '2024-02-20T11:00:00Z',
    updatedAt: '2025-11-22T17:30:00Z',
    lastLogin: '2025-11-22T17:30:00Z',
    status: 'active',
    department: 'Operaciones',
    position: 'Gerente de Operaciones',
    employeeNumber: 'EMP-012',
    isEmailVerified: true,
    isMfaEnabled: true,
    sessionCount: 1045,
  },
]

// ============================================================================
// AUDIT LOG ENTRIES FOR USER ACTIONS
// ============================================================================

export interface UserAuditLog {
  id: string
  userId: string
  action: 'created' | 'updated' | 'deleted' | 'suspended' | 'activated' | 'role_changed' | 'permissions_modified' | 'login' | 'logout' | 'password_reset' | 'mfa_enabled' | 'mfa_disabled'
  performedBy: string
  performedAt: string
  details: string
  ipAddress?: string
  userAgent?: string
  changes?: Record<string, { old: any; new: any }>
}

export const mockUserAuditLogs: UserAuditLog[] = [
  {
    id: 'log_001',
    userId: 'usr_003',
    action: 'created',
    performedBy: 'usr_001',
    performedAt: '2024-06-20T10:00:00Z',
    details: 'Usuario creado por María Fernanda González',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  {
    id: 'log_002',
    userId: 'usr_008',
    action: 'suspended',
    performedBy: 'usr_001',
    performedAt: '2025-10-15T12:00:00Z',
    details: 'Usuario suspendido por incumplimiento de políticas de seguridad',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  },
  {
    id: 'log_003',
    userId: 'usr_004',
    action: 'role_changed',
    performedBy: 'usr_001',
    performedAt: '2025-09-10T14:30:00Z',
    details: 'Rol actualizado de AFORE_ANALYST a AFORE_ANALYST (promoción a Senior)',
    ipAddress: '192.168.1.100',
    changes: {
      position: { old: 'Analista', new: 'Analista Senior' },
    },
  },
  {
    id: 'log_004',
    userId: 'usr_005',
    action: 'mfa_enabled',
    performedBy: 'usr_005',
    performedAt: '2025-09-15T09:00:00Z',
    details: 'Autenticación de dos factores habilitada',
    ipAddress: '192.168.1.150',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  },
]

// ============================================================================
// USER STATISTICS
// ============================================================================

export interface UserStatistics {
  total: number
  active: number
  inactive: number
  suspended: number
  pending: number
  byRole: Record<string, number>
  byDepartment: Record<string, number>
  mfaEnabled: number
  mfaDisabled: number
  recentLogins: number // Last 24h
  newUsersThisMonth: number
}

export function calculateUserStatistics(users: User[]): UserStatistics {
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const stats: UserStatistics = {
    total: users.length,
    active: 0,
    inactive: 0,
    suspended: 0,
    pending: 0,
    byRole: {},
    byDepartment: {},
    mfaEnabled: 0,
    mfaDisabled: 0,
    recentLogins: 0,
    newUsersThisMonth: 0,
  }

  users.forEach((user) => {
    // Status counts
    if (user.status === 'active') stats.active++
    else if (user.status === 'inactive') stats.inactive++
    else if (user.status === 'suspended') stats.suspended++
    else if (user.status === 'pending') stats.pending++

    // Role counts
    stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1

    // Department counts
    if (user.department) {
      stats.byDepartment[user.department] = (stats.byDepartment[user.department] || 0) + 1
    }

    // MFA counts
    if (user.isMfaEnabled) stats.mfaEnabled++
    else stats.mfaDisabled++

    // Recent logins (last 24h)
    if (user.lastLogin && new Date(user.lastLogin) > last24h) {
      stats.recentLogins++
    }

    // New users this month
    if (new Date(user.createdAt) > thisMonthStart) {
      stats.newUsersThisMonth++
    }
  })

  return stats
}

export const userStatistics = calculateUserStatistics(mockUsers)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getUserById(userId: string): User | undefined {
  return mockUsers.find((u) => u.id === userId)
}

export function getUsersByRole(role: string): User[] {
  return mockUsers.filter((u) => u.role === role)
}

export function getUsersByStatus(status: User['status']): User[] {
  return mockUsers.filter((u) => u.status === status)
}

export function searchUsers(query: string): User[] {
  const lowerQuery = query.toLowerCase()
  return mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(lowerQuery) ||
      u.email.toLowerCase().includes(lowerQuery) ||
      u.employeeNumber?.toLowerCase().includes(lowerQuery) ||
      u.department?.toLowerCase().includes(lowerQuery)
  )
}
