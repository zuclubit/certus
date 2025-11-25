import { useEffect } from 'react'
import { useAppStore, selectTheme } from '@/stores/appStore'

/**
 * Hook to apply theme class to document root
 * Syncs with Zustand store and applies 'dark' class to <html>
 */
export function useTheme() {
  const theme = useAppStore(selectTheme)
  const setTheme = useAppStore((state) => state.setTheme)

  useEffect(() => {
    const root = window.document.documentElement

    // Remove both classes first
    root.classList.remove('light', 'dark')

    // Add current theme class
    root.classList.add(theme)

    // Optional: Set data attribute for CSS
    root.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }
}
