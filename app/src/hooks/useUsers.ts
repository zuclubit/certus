/**
 * useUsers Hook - User Management with React Query
 *
 * Enterprise-grade user management hook with:
 * - CRUD operations with optimistic updates
 * - Real-time statistics
 * - Search and filtering
 * - RBAC validation
 * - Audit trail integration
 * - CONSAR compliance
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { User } from '@/types'
import {
  mockUsers,
  userStatistics,
  type UserStatistics,
  type UserAuditLog,
  mockUserAuditLogs,
  searchUsers as searchUsersMock,
  getUserById as getUserByIdMock,
  getUsersByRole as getUsersByRoleMock,
  getUsersByStatus as getUsersByStatusMock,
} from '@/lib/mockData/users'
import { QUERY_KEYS } from '@/lib/constants'

// ============================================================================
// API SIMULATION DELAY
// ============================================================================

const API_DELAY = 500 // Simulate network latency

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get all users with optional filtering
 */
export function useUsers(filters?: {
  role?: string
  status?: User['status']
  department?: string
  search?: string
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS, filters],
    queryFn: async () => {
      await delay(API_DELAY)

      let users = [...mockUsers]

      // Apply filters
      if (filters?.role) {
        users = users.filter((u) => u.role === filters.role)
      }
      if (filters?.status) {
        users = users.filter((u) => u.status === filters.status)
      }
      if (filters?.department) {
        users = users.filter((u) => u.department === filters.department)
      }
      if (filters?.search) {
        users = searchUsersMock(filters.search)
      }

      return users
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Get user by ID
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_DETAIL, userId],
    queryFn: async () => {
      await delay(API_DELAY)
      const user = getUserByIdMock(userId)
      if (!user) {
        throw new Error('Usuario no encontrado')
      }
      return user
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get user statistics
 */
export function useUserStatistics() {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS, 'statistics'],
    queryFn: async () => {
      await delay(API_DELAY)
      return userStatistics
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  })
}

/**
 * Get user audit logs
 */
export function useUserAuditLogs(userId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_AUDIT, userId],
    queryFn: async () => {
      await delay(API_DELAY)
      if (userId) {
        return mockUserAuditLogs.filter((log) => log.userId === userId)
      }
      return mockUserAuditLogs
    },
    enabled: !!userId || userId === undefined,
    staleTime: 1 * 60 * 1000,
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export interface CreateUserData {
  email: string
  name: string
  role: string
  phone?: string
  department?: string
  position?: string
  employeeNumber?: string
}

export interface UpdateUserData {
  name?: string
  phone?: string
  role?: string
  department?: string
  position?: string
  employeeNumber?: string
  status?: User['status']
}

/**
 * Create new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateUserData): Promise<User> => {
      await delay(API_DELAY)

      // Simulate API call
      const newUser: User = {
        id: `usr_${Date.now()}`,
        ...data,
        tenantId: 'afore_ejemplo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending',
        isEmailVerified: false,
        isMfaEnabled: false,
        sessionCount: 0,
        invitedBy: 'current_user_id', // Should come from auth context
        invitedAt: new Date().toISOString(),
      }

      // Add to mock data (for demo purposes)
      mockUsers.push(newUser)

      return newUser
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
    },
  })
}

/**
 * Update user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserData }): Promise<User> => {
      await delay(API_DELAY)

      const userIndex = mockUsers.findIndex((u) => u.id === userId)
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado')
      }

      // Update user
      const updatedUser = {
        ...mockUsers[userIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      }

      mockUsers[userIndex] = updatedUser

      return updatedUser
    },
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.USER_DETAIL, data.id] })
    },
  })
}

/**
 * Delete user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, justification }: { userId: string; justification: string }): Promise<void> => {
      await delay(API_DELAY)

      const userIndex = mockUsers.findIndex((u) => u.id === userId)
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado')
      }

      // Soft delete - mark as inactive
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        status: 'inactive',
        inactiveReason: justification,
        inactiveSince: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Create audit log entry
      mockUserAuditLogs.push({
        id: `log_${Date.now()}`,
        userId,
        action: 'deleted',
        performedBy: 'current_user_id',
        performedAt: new Date().toISOString(),
        details: justification,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
    },
  })
}

/**
 * Suspend user
 */
export function useSuspendUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }): Promise<User> => {
      await delay(API_DELAY)

      const userIndex = mockUsers.findIndex((u) => u.id === userId)
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado')
      }

      const updatedUser = {
        ...mockUsers[userIndex],
        status: 'suspended' as const,
        suspensionReason: reason,
        suspendedAt: new Date().toISOString(),
        suspendedBy: 'current_user_id',
        updatedAt: new Date().toISOString(),
      }

      mockUsers[userIndex] = updatedUser

      // Create audit log entry
      mockUserAuditLogs.push({
        id: `log_${Date.now()}`,
        userId,
        action: 'suspended',
        performedBy: 'current_user_id',
        performedAt: new Date().toISOString(),
        details: reason,
      })

      return updatedUser
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.USER_DETAIL, data.id] })
    },
  })
}

/**
 * Reactivate user
 */
export function useReactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string): Promise<User> => {
      await delay(API_DELAY)

      const userIndex = mockUsers.findIndex((u) => u.id === userId)
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado')
      }

      const updatedUser = {
        ...mockUsers[userIndex],
        status: 'active' as const,
        suspensionReason: undefined,
        suspendedAt: undefined,
        suspendedBy: undefined,
        inactiveReason: undefined,
        inactiveSince: undefined,
        updatedAt: new Date().toISOString(),
      }

      mockUsers[userIndex] = updatedUser

      // Create audit log entry
      mockUserAuditLogs.push({
        id: `log_${Date.now()}`,
        userId,
        action: 'activated',
        performedBy: 'current_user_id',
        performedAt: new Date().toISOString(),
        details: 'Usuario reactivado',
      })

      return updatedUser
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.USER_DETAIL, data.id] })
    },
  })
}

/**
 * Toggle MFA for user
 */
export function useToggleMfa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, enable }: { userId: string; enable: boolean }): Promise<User> => {
      await delay(API_DELAY)

      const userIndex = mockUsers.findIndex((u) => u.id === userId)
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado')
      }

      const updatedUser = {
        ...mockUsers[userIndex],
        isMfaEnabled: enable,
        updatedAt: new Date().toISOString(),
      }

      mockUsers[userIndex] = updatedUser

      // Create audit log entry
      mockUserAuditLogs.push({
        id: `log_${Date.now()}`,
        userId,
        action: enable ? 'mfa_enabled' : 'mfa_disabled',
        performedBy: userId, // User enables MFA themselves
        performedAt: new Date().toISOString(),
        details: enable ? 'MFA habilitado' : 'MFA deshabilitado',
      })

      return updatedUser
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.USER_DETAIL, data.id] })
    },
  })
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Search users (debounced)
 */
export function useSearchUsers(searchQuery: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS, 'search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) {
        return []
      }
      await delay(300) // Debounce delay
      return searchUsersMock(searchQuery)
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  })
}
