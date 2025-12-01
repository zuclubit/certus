/**
 * Settings Service Adapter
 *
 * Provides a unified interface for settings operations
 * Connects to Certus API v1
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { ApiResponse } from '@/types'

// ============================================
// TYPES
// ============================================

export interface UserProfile {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  department?: string
  position?: string
  employeeNumber?: string
  language: 'es' | 'en'
  timezone: string
  dateFormat: string
}

export interface AforeSettings {
  aforeCode: string
  aforeName: string
  rfc: string
  contactEmail: string
  contactPhone: string
  maxFileSize: number // in MB
  allowedFileTypes: string[]
  retentionPeriodDays: number
  autoArchiveEnabled: boolean
  signatureRequired: boolean
}

export interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  inAppNotifications: boolean
  validationComplete: boolean
  validationError: boolean
  approvalRequired: boolean
  approvalComplete: boolean
  dailyDigest: boolean
  weeklyReport: boolean
  digestTime: string // HH:mm format
}

export interface SecuritySettings {
  mfaEnabled: boolean
  mfaMethod: 'totp' | 'sms' | 'email' | null
  sessionTimeout: number // in minutes
  passwordExpiryDays: number
  lastPasswordChange: string
  activeSessions: number
  trustedDevices: TrustedDevice[]
  loginHistory: LoginHistoryEntry[]
}

export interface TrustedDevice {
  id: string
  name: string
  browser: string
  os: string
  lastUsed: string
  isCurrent: boolean
}

export interface LoginHistoryEntry {
  id: string
  timestamp: string
  ipAddress: string
  location: string
  device: string
  success: boolean
}

export interface UpdateProfileRequest {
  name?: string
  phone?: string
  department?: string
  position?: string
  language?: 'es' | 'en'
  timezone?: string
  dateFormat?: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ============================================
// SERVICE
// ============================================

export class SettingsService {
  /**
   * Get user profile
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
   * Update user profile
   */
  static async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.put<UserProfile>(API_ENDPOINTS.SETTINGS.PROFILE, data)
    return {
      success: true,
      data: response.data,
      message: 'Profile updated successfully',
    }
  }

  /**
   * Update avatar
   */
  static async updateAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await apiClient.post<{ avatarUrl: string }>(
      `${API_ENDPOINTS.SETTINGS.PROFILE}/avatar`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )

    return {
      success: true,
      data: response.data,
      message: 'Avatar updated successfully',
    }
  }

  /**
   * Get AFORE settings
   */
  static async getAforeSettings(): Promise<ApiResponse<AforeSettings>> {
    const response = await apiClient.get<AforeSettings>(API_ENDPOINTS.SETTINGS.AFORE)
    return {
      success: true,
      data: response.data,
      message: 'AFORE settings retrieved successfully',
    }
  }

  /**
   * Update AFORE settings
   */
  static async updateAforeSettings(
    data: Partial<AforeSettings>
  ): Promise<ApiResponse<AforeSettings>> {
    const response = await apiClient.put<AforeSettings>(API_ENDPOINTS.SETTINGS.AFORE, data)
    return {
      success: true,
      data: response.data,
      message: 'AFORE settings updated successfully',
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
      message: 'Notification settings retrieved successfully',
    }
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(
    data: Partial<NotificationSettings>
  ): Promise<ApiResponse<NotificationSettings>> {
    const response = await apiClient.put<NotificationSettings>(
      API_ENDPOINTS.SETTINGS.NOTIFICATIONS,
      data
    )
    return {
      success: true,
      data: response.data,
      message: 'Notification settings updated successfully',
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
      message: 'Security settings retrieved successfully',
    }
  }

  /**
   * Update password
   */
  static async updatePassword(data: UpdatePasswordRequest): Promise<ApiResponse<void>> {
    await apiClient.post(`${API_ENDPOINTS.SETTINGS.SECURITY}/password`, data)
    return {
      success: true,
      data: undefined,
      message: 'Password updated successfully',
    }
  }

  /**
   * Enable MFA
   */
  static async enableMfa(
    method: 'totp' | 'sms' | 'email'
  ): Promise<ApiResponse<{ qrCode?: string; secret?: string }>> {
    const response = await apiClient.post<{ qrCode?: string; secret?: string }>(
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
   * Verify MFA setup
   */
  static async verifyMfa(code: string): Promise<ApiResponse<void>> {
    await apiClient.post(`${API_ENDPOINTS.SETTINGS.SECURITY}/mfa/verify`, { code })
    return {
      success: true,
      data: undefined,
      message: 'MFA verified successfully',
    }
  }

  /**
   * Disable MFA
   */
  static async disableMfa(password: string): Promise<ApiResponse<void>> {
    await apiClient.post(`${API_ENDPOINTS.SETTINGS.SECURITY}/mfa/disable`, { password })
    return {
      success: true,
      data: undefined,
      message: 'MFA disabled successfully',
    }
  }

  /**
   * Remove trusted device
   */
  static async removeTrustedDevice(deviceId: string): Promise<ApiResponse<void>> {
    await apiClient.delete(`${API_ENDPOINTS.SETTINGS.SECURITY}/devices/${deviceId}`)
    return {
      success: true,
      data: undefined,
      message: 'Device removed successfully',
    }
  }

  /**
   * Revoke all sessions
   */
  static async revokeAllSessions(): Promise<ApiResponse<void>> {
    await apiClient.post(`${API_ENDPOINTS.SETTINGS.SECURITY}/sessions/revoke-all`)
    return {
      success: true,
      data: undefined,
      message: 'All sessions revoked successfully',
    }
  }

}

export default SettingsService
