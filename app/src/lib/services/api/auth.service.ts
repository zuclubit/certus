/**
 * Auth Service - Real API Implementation
 *
 * Handles authentication operations against Certus API v1
 * Implements JWT Bearer token authentication flow
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS, STORAGE_KEYS } from '@/lib/constants'
import type { User, ApiResponse } from '@/types'

// ============================================
// TYPES
// ============================================

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
  tenantId?: string
}

export interface RegisterResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}

export interface TenantOption {
  id: string
  name: string
  code: string
}

// ============================================
// SERVICE
// ============================================

export class AuthService {
  /**
   * Login with email and password
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)

    // Store tokens
    if (response.data.accessToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken)
    }
    if (response.data.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken)
    }
    if (response.data.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user))
    }

    return {
      success: true,
      data: response.data,
      message: 'Login successful',
    }
  }

  /**
   * Register a new user
   */
  static async register(credentials: RegisterCredentials): Promise<ApiResponse<RegisterResponse>> {
    const response = await apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, credentials)

    // Store tokens
    if (response.data.accessToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken)
    }
    if (response.data.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken)
    }
    if (response.data.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user))
    }

    return {
      success: true,
      data: response.data,
      message: 'Registration successful',
    }
  }

  /**
   * Get available tenants for registration
   */
  static async getTenants(): Promise<ApiResponse<TenantOption[]>> {
    const response = await apiClient.get<TenantOption[]>(API_ENDPOINTS.AUTH.TENANTS)

    return {
      success: true,
      data: response.data,
      message: 'Tenants retrieved successfully',
    }
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch {
      // Continue with local cleanup even if API call fails
    }

    // Clear local storage
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.TENANT)

    return {
      success: true,
      data: undefined,
      message: 'Logout successful',
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    })

    // Update tokens
    if (response.data.accessToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken)
    }
    if (response.data.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken)
    }

    return {
      success: true,
      data: response.data,
      message: 'Token refreshed',
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME)

    // Update cached user
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data))

    return {
      success: true,
      data: response.data,
      message: 'User retrieved successfully',
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    return !!token
  }

  /**
   * Get cached user from localStorage
   */
  static getCachedUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER)
    if (!userStr) return null

    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }
}

export default AuthService
