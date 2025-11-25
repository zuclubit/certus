import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NAVIGATION_ITEMS, PERMISSIONS, type UserRole } from '@/lib/constants'
import { useAppStore, selectUser, selectTheme } from '@/stores/appStore'
import { useNotificationStore, selectUnreadCount } from '@/stores/notificationStore'
import { LottieIcon } from '@/components/ui/LottieIcon'
import { type LottieIconKey } from '@/lib/lottieIcons'
import { getAnimation, preloadCriticalAnimations } from '@/lib/lottiePreloader'

// Map navigation item IDs to Lottie icon keys
const iconMap: Record<string, LottieIconKey> = {
  dashboard: 'home',
  validations: 'validations',
  reports: 'reports',
  catalogs: 'catalogs',
  approvals: 'approvals', // Dedicated approvals icon
  validators: 'validators', // Dedicated validators icon
  users: 'users',
  settings: 'settings',
}

// Ultra-optimized mobile labels - Shorter versions for tiny screens
const mobileLabels: Record<string, { xs: string; sm: string; md: string }> = {
  'Dashboard': { xs: 'Casa', sm: 'Inicio', md: 'Inicio' },
  'Validaciones': { xs: 'Válido', sm: 'Validar', md: 'Validar' },
  'Reportes': { xs: 'Reporte', sm: 'Reportes', md: 'Reportes' },
  'Catálogos': { xs: 'Datos', sm: 'Datos', md: 'Datos' },
  'Aprobaciones': { xs: 'Aprob', sm: 'Aprobar', md: 'Aprobar' },
  'Validadores': { xs: 'Valid', sm: 'Config', md: 'Config' },
  'Usuarios': { xs: 'Users', sm: 'Usuarios', md: 'Usuarios' },
  'Configuración': { xs: 'Config', sm: 'Ajustes', md: 'Ajustes' },
}

// Hook to get current screen size - SSR-safe with debouncing
function useScreenSize() {
  // Initialize with undefined to avoid hydration mismatch
  const [size, setSize] = React.useState<'xs' | 'sm' | 'md' | undefined>(undefined)

  React.useEffect(() => {
    // Debounce resize events for performance
    let timeoutId: NodeJS.Timeout

    const updateSize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (typeof window === 'undefined') return

        const width = window.innerWidth
        if (width < 375) setSize('xs')       // Very small phones
        else if (width < 480) setSize('sm')  // Small phones
        else setSize('md')                   // Medium+ phones
      }, 100) // 100ms debounce
    }

    // Initial size check
    updateSize()

    window.addEventListener('resize', updateSize, { passive: true })
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  // Default to 'md' for SSR and initial render
  return size ?? 'md'
}

/**
 * BottomNav - Clean iOS/Material Style
 *
 * Cloned from nav-mobile.png reference:
 * - Filled icon when active
 * - Outline icon when inactive
 * - Solid blue background (no gradient)
 * - Clean white container
 * - Soft shadow
 * - Simple and modern
 */
export function BottomNav() {
  const location = useLocation()
  const user = useAppStore(selectUser)
  const unreadCount = useNotificationStore(selectUnreadCount)
  const screenSize = useScreenSize()
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  // Preload critical animations on mount
  React.useEffect(() => {
    preloadCriticalAnimations()
  }, [])

  const hasPermission = (requiredPermission: string | null): boolean => {
    if (!requiredPermission) return true
    if (!user) return false

    const userPermissions = PERMISSIONS[user.role as UserRole]
    return (
      requiredPermission in userPermissions &&
      (userPermissions as any)[requiredPermission].length > 0
    )
  }

  const filteredNavItems = NAVIGATION_ITEMS.filter((item) =>
    hasPermission(item.requiredPermission)
  )

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pointer-events-none"
      role="navigation"
      aria-label="Navegación principal móvil"
    >
      {/* Safe area container - Optimized for small screens */}
      <div className="px-1.5 xxs:px-2 xs:px-2.5 sm:px-4 md:px-6 pb-safe">
        {/* Floating glassmorphic container - visionOS 2025 Ultra Refined */}
        <div
          className={cn(
            "relative max-w-md mx-auto pointer-events-auto mb-1.5 xxs:mb-2 xs:mb-2.5 sm:mb-4 md:mb-5",
            // OPTIMIZED: Padding reducido para acomodar 7 items
            "p-[5px] xxs:p-[6px] xs:p-[7px] sm:p-[9px] md:p-[11px]",
            // visionOS effects - ENHANCED
            "glass-ultra-premium glass-caustics volumetric-light",
            "depth-layer-5 fresnel-edge chromatic-edges",
            "mesh-gradient-holographic iridescent-overlay",
            // NEW: Crystal & Light effects
            "crystal-overlay prism-effect atmospheric-depth",
            "specular-highlights inner-glow frosted-premium edge-luminance",
            "glass-gpu-accelerated subsurface-scatter",
            "animate-[backdrop-blur-in_0.8s_ease-out]"
          )}
          style={{
            borderRadius: '28px',
            background: isDark ? `
              linear-gradient(
                135deg,
                rgba(20, 20, 25, 0.92) 0%,
                rgba(25, 25, 32, 0.90) 25%,
                rgba(22, 22, 30, 0.88) 50%,
                rgba(25, 25, 32, 0.90) 75%,
                rgba(20, 20, 25, 0.92) 100%
              )
            ` : `
              linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.95) 0%,
                rgba(250, 250, 255, 0.92) 25%,
                rgba(255, 250, 255, 0.90) 50%,
                rgba(250, 255, 255, 0.92) 75%,
                rgba(255, 255, 255, 0.95) 100%
              )
            `,
            backdropFilter: isDark
              ? 'blur(32px) saturate(200%) brightness(1.05) contrast(1.08) hue-rotate(2deg)'
              : 'blur(32px) saturate(200%) brightness(1.15) contrast(1.05) hue-rotate(2deg)',
            WebkitBackdropFilter: isDark
              ? 'blur(32px) saturate(200%) brightness(1.05) contrast(1.08) hue-rotate(2deg)'
              : 'blur(32px) saturate(200%) brightness(1.15) contrast(1.05) hue-rotate(2deg)',
            border: isDark
              ? '1.5px solid rgba(255, 255, 255, 0.1)'
              : '1.5px solid rgba(255, 255, 255, 0.5)',
            // Sombra ultra-refinada con profundidad extrema
            boxShadow: isDark ? `
              0 0 0 0.5px rgba(255, 255, 255, 0.1),
              0 24px 96px rgba(0, 0, 0, 0.7),
              0 16px 64px rgba(0, 0, 0, 0.6),
              0 12px 48px rgba(0, 0, 0, 0.5),
              0 8px 32px rgba(0, 0, 0, 0.4),
              0 4px 16px rgba(0, 0, 0, 0.3),
              0 2px 8px rgba(0, 0, 0, 0.2),
              0 1px 4px rgba(0, 0, 0, 0.15),
              inset 0 0 0 1px rgba(255, 255, 255, 0.08),
              inset 0 4px 0 rgba(255, 255, 255, 0.12),
              inset 0 -2px 0 rgba(0, 0, 0, 0.3),
              inset 0 0 60px rgba(135, 206, 250, 0.03)
            ` : `
              0 0 0 0.5px rgba(255, 255, 255, 0.8),
              0 24px 96px rgba(0, 0, 0, 0.14),
              0 16px 64px rgba(0, 0, 0, 0.12),
              0 12px 48px rgba(0, 0, 0, 0.10),
              0 8px 32px rgba(0, 0, 0, 0.08),
              0 4px 16px rgba(0, 0, 0, 0.05),
              0 2px 8px rgba(0, 0, 0, 0.03),
              0 1px 4px rgba(0, 0, 0, 0.02),
              inset 0 0 0 1px rgba(255, 255, 255, 0.5),
              inset 0 4px 0 rgba(255, 255, 255, 0.9),
              inset 0 -2px 0 rgba(0, 0, 0, 0.05),
              inset 0 0 60px rgba(135, 206, 250, 0.05)
            `,
          }}
        >
          {/* Navigation items - Espaciado optimizado para 7 items */}
          <div className="flex items-center justify-between gap-[1px] xxs:gap-[2px] xs:gap-[3px] sm:gap-[4px] md:gap-[6px]">
            {filteredNavItems.map((item) => {
              const lottieIconKey = iconMap[item.id]
              // Use preloader to get cached animation
              const animationData = lottieIconKey ? getAnimation(lottieIconKey) : null
              const isActive = location.pathname === item.path
              const hasNotifications = item.id === 'validations' && unreadCount > 0
              const labelData = mobileLabels[item.label]
              const mobileLabel = labelData ? labelData[screenSize] : item.label

              // Skip items without animation data or icon key
              if (!animationData || !lottieIconKey) {
                console.warn(`Missing animation data for ${item.id}`)
                return null
              }

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    'group relative flex flex-col items-center justify-center',
                    // OPTIMIZED: Padding extra compacto para 7 items
                    // Mobile (icon only): Círculo más compacto
                    'p-[4px]',                   // 320px - ultra compacto
                    'xxs:p-[5px]',               // 340px
                    'xs:p-[6px]',                // 360px
                    'sm:p-[7px]',                // 480px
                    // Tablet+ (icon + text): Padding diferenciado
                    'md:py-[9px] md:px-[12px]',  // 768px - Con label
                    'rounded-[14px] md:rounded-[16px]',  // Border radius más ajustado
                    // visionOS Ultra effects - ENHANCED for active state
                    isActive && 'active-glass-glow light-leak-left light-leak-right',
                    isActive && 'active-holographic active-energy-pulse active-gradient-flow',
                    isActive && 'active-crystal-facets active-aurora active-liquid-metal',
                    isActive && 'active-depth-glow active-particle-field',
                    !isActive && 'glass-ultra-clear chromatic-edges depth-layer-3',
                    'glass-gpu-accelerated',
                    // IMPROVED: Transiciones suaves y responsivas
                    'transition-all duration-300 ease-out',
                    // FIXED: Active press scale sin layout shift
                    'active:scale-[0.96]',  // Menos agresivo
                    // FIXED: Hover solo cuando NO está activo
                    !isActive && 'hover:scale-[1.02]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2',
                  )}
                  style={isActive ? {
                    background: `
                      linear-gradient(
                        135deg,
                        #0066FF 0%,
                        #5856D6 25%,
                        #7C3AED 50%,
                        #AF52DE 75%,
                        #0066FF 100%
                      )
                    `,
                    backgroundSize: '300% 300%',
                    animation: 'mesh-flow 8s ease-in-out infinite, gradient-flow-active 8s ease-in-out infinite',
                    // iOS 2025 Liquid Glass shadows - Optimized to 4 layers (.thin material)
                    boxShadow: `
                      0 2px 8px rgba(88, 86, 214, 0.3),
                      0 8px 24px rgba(0, 102, 255, 0.25),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6),
                      inset 0 -1px 2px rgba(0, 0, 0, 0.15)
                    `,
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  } : {
                    background: isDark ? `
                      linear-gradient(
                        135deg,
                        rgba(45, 45, 55, 0.6) 0%,
                        rgba(40, 40, 50, 0.55) 50%,
                        rgba(45, 45, 55, 0.5) 100%
                      )
                    ` : `
                      linear-gradient(
                        135deg,
                        rgba(255, 255, 255, 0.5) 0%,
                        rgba(250, 250, 255, 0.45) 50%,
                        rgba(255, 255, 255, 0.4) 100%
                      )
                    `,
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.12)'
                      : '1px solid rgba(255, 255, 255, 0.35)',
                    // iOS 2025 Liquid Glass shadows - Optimized to 4 layers (.thin material)
                    boxShadow: isDark ? `
                      0 2px 8px rgba(0, 0, 0, 0.25),
                      0 1px 4px rgba(0, 0, 0, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1),
                      inset 0 -1px 1px rgba(0, 0, 0, 0.2)
                    ` : `
                      0 2px 8px rgba(0, 0, 0, 0.04),
                      0 1px 4px rgba(0, 0, 0, 0.02),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4),
                      inset 0 -1px 1px rgba(0, 0, 0, 0.04)
                    `,
                  }}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  role="link"
                >
                  {/* Icon container - FIXED: No layout shift on active */}
                  <div className="relative flex items-center justify-center">
                    {/*
                      CRITICAL FIX: Espacio fijo reservado para el icono
                      - El contenedor mantiene tamaño constante
                      - El icono interno usa transform (no afecta layout)
                      - Previene layout shift cuando cambia estado activo/inactivo
                    */}
                    <div
                      className={cn(
                        // Contenedor con tamaño FIJO - Compacto para 7 items
                        'w-[24px] h-[24px]',            // 320px - compacto
                        'xxs:w-[26px] xxs:h-[26px]',   // 340px
                        'xs:w-[28px] xs:h-[28px]',     // 360px
                        'sm:w-[30px] sm:h-[30px]',     // 480px
                        'md:w-[28px] md:h-[28px]',     // 768px
                        // Flex para centrar el icono interno
                        'flex items-center justify-center',
                        'relative'
                      )}
                      style={{
                        zIndex: 100,
                        isolation: 'isolate',
                      }}
                    >
                      {/* Icono interno - USA TRANSFORM para escalar sin layout shift */}
                      <div
                        className={cn(
                          'w-full h-full',
                          'transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                          // HOVER: Solo cuando NO está activo
                          !isActive && 'group-hover:scale-110',
                          // ACTIVE: Más grande de forma PERMANENTE + bounce inicial
                          isActive && 'scale-125',
                          isActive && 'animate-[scale-bounce_0.4s_ease-out]'
                        )}
                        style={{
                          // Transform no afecta el layout del contenedor padre
                          transformOrigin: 'center',
                        }}
                      >
                        <LottieIcon
                          animationData={animationData}
                          isActive={isActive}
                          loop={false}
                          autoplay={false}
                          inactiveColor="default"
                          speed={1.0}
                          hoverEnabled={!isActive}  // Solo hover cuando inactivo
                          className="w-full h-full"
                        />
                      </div>
                    </div>

                    {/* Badge (notifications) - Optimized for small screens */}
                    {hasNotifications && (
                      <div className="absolute -top-1 -right-1 flex items-center justify-center">
                        <div
                          className={cn(
                            "flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-white text-[8.5px] font-extrabold",
                            "glass-gpu-accelerated spring-bounce",
                            // Premium crystal effects for badge
                            "active-glass-glow active-energy-pulse active-gradient-flow",
                            "active-holographic active-crystal-facets active-liquid-metal"
                          )}
                          style={{
                            background: `
                              linear-gradient(
                                135deg,
                                #FF3B30 0%,
                                #FF2D55 33%,
                                #FF375F 66%,
                                #FF3B30 100%
                              )
                            `,
                            backgroundSize: '300% 300%',
                            animation: 'mesh-flow 6s ease-in-out infinite, glass-pulse 2.5s ease-in-out infinite, gradient-flow-active 6s ease-in-out infinite',
                            boxShadow: `
                              0 0 0 2.5px rgba(255, 255, 255, 1),
                              0 0 0 4.5px rgba(255, 59, 48, 0.5),
                              0 0 30px rgba(255, 59, 48, 0.6),
                              0 0 50px rgba(255, 45, 85, 0.4),
                              0 0 70px rgba(255, 55, 95, 0.3),
                              0 8px 24px rgba(255, 59, 48, 0.5),
                              0 4px 12px rgba(255, 45, 85, 0.4),
                              0 2px 6px rgba(255, 55, 95, 0.3),
                              inset 0 0 20px rgba(255, 255, 255, 0.3),
                              inset 0 0 40px rgba(255, 150, 150, 0.2),
                              inset 0 3px 0 rgba(255, 255, 255, 0.5),
                              inset 0 -1.5px 0 rgba(0, 0, 0, 0.25)
                            `,
                            border: '1.5px solid rgba(255, 255, 255, 0.4)',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Label - HIDDEN on mobile, visible only on tablets+ */}
                  <span
                    className={cn(
                      // HIDDEN by default (mobile), visible from tablets
                      'hidden md:block',
                      // iOS 2025 Typography - Caption 1 (13px) for mobile nav
                      'ios-text-caption1',
                      'leading-tight whitespace-nowrap',
                      'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                      // Color - white when active, context-appropriate when inactive
                      isActive
                        ? 'text-white drop-shadow-sm ios-font-semibold'
                        : isDark
                          ? 'text-neutral-200 ios-font-medium'
                          : 'text-neutral-700 ios-font-medium',
                      // Hover effect for inactive
                      !isActive && (isDark ? 'group-hover:text-blue-400 group-hover:ios-font-semibold' : 'group-hover:text-blue-500 group-hover:ios-font-semibold')
                    )}
                    style={{
                      letterSpacing: '-0.02em',
                    }}
                    title={item.label}
                  >
                    {mobileLabel}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
