/**
 * User Service - Real API Implementation
 *
 * Handles user management operations against Certus API v1
 * Includes user CRUD, role management, and settings
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { User, PaginatedResponse, ApiResponse } from '@/types'

// ============================================
// TYPES
// ============================================

export interface UserListParams {
  page?: number
  pageSize?: number
  status?: string[]
  role?: string[]
  department?: string
  search?: string
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateUserRequest {
  email: string
  name: string
  role: string
  department?: string
  position?: string
  phone?: string
}

export interface UpdateUserRequest {
  name?: string
  role?: string
  department?: string
  position?: string
  phone?: string
  status?: 'active' | 'inactive' | 'suspended'
}

export interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  phone?: string
  department?: string
  position?: string
  timezone?: string
  language?: string
  notifications: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  inApp: boolean
  sms: boolean
  validationComplete: boolean
  approvalRequired: boolean
  systemAlerts: boolean
}

export interface SecuritySettings {
  mfaEnabled: boolean
  mfaMethod?: 'totp' | 'sms' | 'email'
  lastPasswordChange?: string
  sessionTimeout: number
  activeSessions: number
}

// ============================================
// SERVICE
// ============================================

export class UserService {
  /**
   * Get paginated list of users
   */
  static async getUsers(params?: UserListParams): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.department) queryParams.append('department', params.department)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    params?.status?.forEach((s) => queryParams.append('status', s))
    params?.role?.forEach((r) => queryParams.append('role', r))

    const response = await apiClient.get<PaginatedResponse<User>>(
      `${API_ENDPOINTS.USERS.LIST}?${queryParams.toString()}`
    )

    return response.data
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<User>(API_ENDPOINTS.USERS.DETAIL(id))

    return {
      success: true,
      data: response.data,
      message: 'User retrieved successfully',
    }
  }

  /**
   * Create new user
   */
  static async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.post<User>(API_ENDPOINTS.USERS.CREATE, data)

    return {
      success: true,
      data: response.data,
      message: 'User created successfully',
    }
  }

  /**
   * Update user
   */
  static async updateUser(id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<User>(API_ENDPOINTS.USERS.UPDATE(id), data)

    return {
      success: true,
      data: response.data,
      message: 'User updated successfully',
    }
  }

  /**
   * Delete user (soft delete)
   */
  static async deleteUser(id: string, reason?: string): Promise<ApiResponse<void>> {
    await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id), {
      data: { reason },
    })

    return {
      success: true,
      data: undefined,
      message: 'User deleted successfully',
    }
  }

  /**
   * Suspend user
   */
  static async suspendUser(id: string, reason: string): Promise<ApiResponse<User>> {
    const response = await apiClient.post<User>(`${API_ENDPOINTS.USERS.DETAIL(id)}/suspend`, {
      reason,
    })

    return {
      success: true,
      data: response.data,
      message: 'User suspended',
    }
  }

  /**
   * Reactivate user
   */
  static async reactivateUser(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.post<User>(`${API_ENDPOINTS.USERS.DETAIL(id)}/reactivate`)

    return {
      success: true,
      data: response.data,
      message: 'User reactivated',
    }
  }

  /**
   * Reset user password
   */
  static async resetPassword(id: string): Promise<ApiResponse<void>> {
    await apiClient.post(`${API_ENDPOINTS.USERS.DETAIL(id)}/reset-password`)

    return {
      success: true,
      data: undefined,
      message: 'Password reset email sent',
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.get<UserProfile>(API_ENDPOINTS.SETTINGS.PROFILE)

    return {
      success: true,
      data: response.data,
      message: 'Profile retrieved successfully',
    }
  }

  /**
   * Update current user profile
   */
  static async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.patch<UserProfile>(API_ENDPOINTS.SETTINGS.PROFILE, data)

    return {
      success: true,
      data: response.data,
      message: 'Profile updated successfully',
    }
  }

  /**
   * Get notification settings
   */
  static async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    const response = await apiClient.get<NotificationSettings>(
      API_ENDPOINTS.SETTINGS.NOTIFICATIONS
    )

    return {
      success: true,
      data: response.data,
      message: 'Settings retrieved successfully',
    }
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(
    settings: Partial<NotificationSettings>
  ): Promise<ApiResponse<NotificationSettings>> {
    const response = await apiClient.patch<NotificationSettings>(
      API_ENDPOINTS.SETTINGS.NOTIFICATIONS,
      settings
    )

    return {
      success: true,
      data: response.data,
      message: 'Notification settings updated',
    }
  }

  /**
   * Get security settings
   */
  static async getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    const response = await apiClient.get<SecuritySettings>(API_ENDPOINTS.SETTINGS.SECURITY)

    return {
      success: true,
      data: response.data,
      message: 'Security settings retrieved',
    }
  }

  /**
   * Update security settings
   */
  static async updateSecuritySettings(
    settings: Partial<SecuritySettings>
  ): Promise<ApiResponse<SecuritySettings>> {
    const response = await apiClient.patch<SecuritySettings>(
      API_ENDPOINTS.SETTINGS.SECURITY,
      settings
    )

    return {
      success: true,
      data: response.data,
      message: 'Security settings updated',
    }
  }

  /**
   * Enable MFA
   */
  static async enableMfa(method: 'totp' | 'sms' | 'email'): Promise<ApiResponse<{ secret?: string; qrCode?: string }>> {
    const response = await apiClient.post<{ secret?: string; qrCode?: string }>(
      `${API_ENDPOINTS.SETTINGS.SECURITY}/mfa/enable`,
      { method }
    )

    return {
      success: true,
      data: response.data,
      message: 'MFA setup initiated',
    }
  }

  /**
   * Disable MFA
   */
  static async disableMfa(verificationCode: string): Promise<ApiResponse<void>> {
    await apiClient.post(`${API_ENDPOINTS.SETTINGS.SECURITY}/mfa/disable`, {
      code: verificationCode,
    })

    return {
      success: true,
      data: undefined,
      message: 'MFA disabled',
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    await apiClient.post(`${API_ENDPOINTS.SETTINGS.SECURITY}/change-password`, {
      currentPassword,
      newPassword,
    })

    return {
      success: true,
      data: undefined,
      message: 'Password changed successfully',
    }
  }

  /**
   * Get active sessions
   */
  static async getActiveSessions(): Promise<ApiResponse<Array<{
    id: string
    device: string
    location: string
    lastActivity: string
    isCurrent: boolean
  }>>> {
    const response = await apiClient.get(`${API_ENDPOINTS.SETTINGS.SECURITY}/sessions`)

    return {
      success: true,
      data: response.data,
      message: 'Sessions retrieved',
    }
  }

  /**
   * Revoke session
   */
  static async revokeSession(sessionId: string): Promise<ApiResponse<void>> {
    await apiClient.delete(`${API_ENDPOINTS.SETTINGS.SECURITY}/sessions/${sessionId}`)

    return {
      success: true,
      data: undefined,
      message: 'Session revoked',
    }
  }

  /**
   * Revoke all sessions except current
   */
  static async revokeAllSessions(): Promise<ApiResponse<void>> {
    await apiClient.delete(`${API_ENDPOINTS.SETTINGS.SECURITY}/sessions`)

    return {
      success: true,
      data: undefined,
      message: 'All sessions revoked',
    }
  }

  /**
   * Get user statistics
   */
  static async getStatistics(): Promise<ApiResponse<{
    total: number
    active: number
    inactive: number
    suspended: number
    pending: number
    mfaEnabled: number
    mfaDisabled: number
    recentLogins: number
    newUsersThisMonth: number
    byRole: Record<string, number>
    byDepartment: Record<string, number>
  }>> {
    const response = await apiClient.get(`${API_ENDPOINTS.USERS.LIST}/statistics`)
    return {
      success: true,
      data: response.data,
      message: 'Statistics retrieved successfully',
    }
  }

  /**
   * Invite new user
   */
  static async inviteUser(email: string, role: string): Promise<ApiResponse<User>> {
    const response = await apiClient.post<User>(`${API_ENDPOINTS.USERS.LIST}/invite`, {
      email,
      role,
    })

    return {
      success: true,
      data: response.data,
      message: 'Invitation sent successfully',
    }
  }

  /**
   * Resend invitation
   */
  static async resendInvitation(userId: string): Promise<ApiResponse<void>> {
    await apiClient.post(`${API_ENDPOINTS.USERS.DETAIL(userId)}/resend-invitation`)

    return {
      success: true,
      data: undefined,
      message: 'Invitation resent',
    }
  }
}

export default UserService
