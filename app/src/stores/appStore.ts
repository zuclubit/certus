import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User, Tenant } from '@/types'
import { STORAGE_KEYS } from '@/lib/constants'

interface AppState {
  // User state
  user: User | null
  tenant: Tenant | null
  isAuthenticated: boolean

  // UI state
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  language: 'es' | 'en'

  // Actions
  setUser: (user: User | null) => void
  setTenant: (tenant: Tenant | null) => void
  login: (user: User, tenant: Tenant) => void
  logout: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: 'es' | 'en') => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        tenant: null,
        isAuthenticated: false,
        sidebarOpen: true,
        theme: 'light',
        language: 'es',

        // Actions
        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!user,
          }),

        setTenant: (tenant) =>
          set({
            tenant,
          }),

        login: (user, tenant) =>
          set({
            user,
            tenant,
            isAuthenticated: true,
          }),

        logout: () => {
          // Clear local storage
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.USER)
          localStorage.removeItem(STORAGE_KEYS.TENANT)

          // Reset state
          set({
            user: null,
            tenant: null,
            isAuthenticated: false,
          })
        },

        toggleSidebar: () =>
          set((state) => ({
            sidebarOpen: !state.sidebarOpen,
          })),

        setSidebarOpen: (open) =>
          set({
            sidebarOpen: open,
          }),

        setTheme: (theme) =>
          set({
            theme,
          }),

        setLanguage: (language) =>
          set({
            language,
          }),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          user: state.user,
          tenant: state.tenant,
          isAuthenticated: state.isAuthenticated,
          theme: state.theme,
          language: state.language,
        }),
      }
    ),
    {
      name: 'AppStore',
    }
  )
)

// Selectors for common use cases
export const selectUser = (state: AppState) => state.user
export const selectTenant = (state: AppState) => state.tenant
export const selectIsAuthenticated = (state: AppState) => state.isAuthenticated
export const selectSidebarOpen = (state: AppState) => state.sidebarOpen
export const selectTheme = (state: AppState) => state.theme
export const selectLanguage = (state: AppState) => state.language
