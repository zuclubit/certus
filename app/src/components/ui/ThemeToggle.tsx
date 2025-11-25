import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

/**
 * ThemeToggle - Ultra Refined Glass morphic Theme Toggle
 *
 * Minimal, beautiful toggle for switching between light and dark modes
 * Matches the ultra-refined glassmorphic design system
 */
export function ThemeToggle() {
  const theme = useAppStore(selectTheme)
  const setTheme = useAppStore((state) => state.setTheme)
  const isDark = theme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative flex items-center justify-center',
        'w-11 h-11 rounded-[18px]',
        'glass-ultra-clear depth-layer-3 fresnel-edge',
        'glass-gpu-accelerated spring-bounce',
        'active:scale-[0.88]',
        'transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2'
      )}
      style={{
        background: isDark ? `
          linear-gradient(
            135deg,
            rgba(45, 45, 55, 0.7) 0%,
            rgba(40, 40, 50, 0.65) 50%,
            rgba(45, 45, 55, 0.6) 100%
          )
        ` : `
          linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(250, 250, 255, 0.55) 50%,
            rgba(255, 255, 255, 0.5) 100%
          )
        `,
        backdropFilter: 'blur(16px) saturate(180%) brightness(1.05)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%) brightness(1.05)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.15)'
          : '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: isDark ? `
          0 4px 12px rgba(0, 0, 0, 0.3),
          0 2px 6px rgba(0, 0, 0, 0.2),
          0 1px 3px rgba(0, 0, 0, 0.15),
          inset 0 0 0 1px rgba(255, 255, 255, 0.08),
          inset 0 2px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.3)
        ` : `
          0 4px 12px rgba(0, 0, 0, 0.05),
          0 2px 6px rgba(0, 0, 0, 0.03),
          0 1px 3px rgba(0, 0, 0, 0.02),
          inset 0 0 0 1px rgba(255, 255, 255, 0.3),
          inset 0 2px 0 rgba(255, 255, 255, 0.5),
          inset 0 -1px 0 rgba(0, 0, 0, 0.05)
        `,
      }}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {/* Icons with smooth transition */}
      <div className="relative w-5 h-5">
        {/* Sun icon (light mode) */}
        <Sun
          className={cn(
            'absolute inset-0 transition-all duration-500',
            isDark
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100',
            'text-amber-500'
          )}
          strokeWidth={2.5}
          size={20}
        />

        {/* Moon icon (dark mode) */}
        <Moon
          className={cn(
            'absolute inset-0 transition-all duration-500',
            isDark
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0',
            'text-blue-400'
          )}
          strokeWidth={2.5}
          size={20}
        />
      </div>
    </button>
  )
}
