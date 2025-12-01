/**
 * useSettings Hook - CONSAR Compliance
 *
 * Custom React hook for settings operations
 * Uses TanStack Query for data fetching and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  SettingsService,
  type UpdateProfileRequest,
  type UpdatePasswordRequest,
  type AforeSettings,
  type NotificationSettings,
} from '@/lib/services/settings.adapter'

// ============================================
// QUERY KEYS
// ============================================

export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  afore: () => [...settingsKeys.all, 'afore'] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
  security: () => [...settingsKeys.all, 'security'] as const,
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook for fetching user profile
 */
export function useProfile(enabled: boolean = true) {
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: () => SettingsService.getProfile(),
    enabled,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook for fetching AFORE settings
 */
export function useAforeSettings(enabled: boolean = true) {
  return useQuery({
    queryKey: settingsKeys.afore(),
    queryFn: () => SettingsService.getAforeSettings(),
    enabled,
    staleTime: 300000, // 5 minutes
  })
}

/**
 * Hook for fetching notification settings
 */
export function useNotificationSettings(enabled: boolean = true) {
  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: () => SettingsService.getNotificationSettings(),
    enabled,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook for fetching security settings
 */
export function useSecuritySettings(enabled: boolean = true) {
  return useQuery({
    queryKey: settingsKeys.security(),
    queryFn: () => SettingsService.getSecuritySettings(),
    enabled,
    staleTime: 60000, // 1 minute
  })
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => SettingsService.updateProfile(data),
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.profile(), response)
    },
  })
}

/**
 * Hook for updating avatar
 */
export function useUpdateAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => SettingsService.updateAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() })
    },
  })
}

/**
 * Hook for updating AFORE settings
 */
export function useUpdateAforeSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<AforeSettings>) => SettingsService.updateAforeSettings(data),
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.afore(), response)
    },
  })
}

/**
 * Hook for updating notification settings
 */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<NotificationSettings>) =>
      SettingsService.updateNotificationSettings(data),
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.notifications(), response)
    },
  })
}

/**
 * Hook for updating password
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) => SettingsService.updatePassword(data),
  })
}

/**
 * Hook for enabling MFA
 */
export function useEnableMfa() {
  return useMutation({
    mutationFn: (method: 'totp' | 'sms' | 'email') => SettingsService.enableMfa(method),
  })
}

/**
 * Hook for verifying MFA
 */
export function useVerifyMfa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => SettingsService.verifyMfa(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security() })
    },
  })
}

/**
 * Hook for disabling MFA
 */
export function useDisableMfa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (password: string) => SettingsService.disableMfa(password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security() })
    },
  })
}

/**
 * Hook for removing trusted device
 */
export function useRemoveTrustedDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (deviceId: string) => SettingsService.removeTrustedDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security() })
    },
  })
}

/**
 * Hook for revoking all sessions
 */
export function useRevokeAllSessions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => SettingsService.revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security() })
    },
  })
}

// ============================================
// COMBINED HOOK FOR CONVENIENCE
// ============================================

/**
 * Combined hook providing all settings operations
 * Use individual hooks for better tree-shaking
 */
export function useSettings() {
  const queryClient = useQueryClient()

  return {
    // Query hooks
    useProfile,
    useAforeSettings,
    useNotificationSettings,
    useSecuritySettings,

    // Mutation hooks
    useUpdateProfile,
    useUpdateAvatar,
    useUpdateAforeSettings,
    useUpdateNotificationSettings,
    useUpdatePassword,
    useEnableMfa,
    useVerifyMfa,
    useDisableMfa,
    useRemoveTrustedDevice,
    useRevokeAllSessions,

    // Utility
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: settingsKeys.all }),
  }
}

export default useSettings
