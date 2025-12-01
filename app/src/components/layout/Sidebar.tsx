import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAVIGATION_ITEMS, PERMISSIONS, type UserRole } from '@/lib/constants'
import { useAppStore, selectUser, selectSidebarOpen, selectTheme } from '@/stores/appStore'
import { LottieIcon } from '@/components/ui/LottieIcon'
import { type LottieIconKey } from '@/lib/lottieIcons'
import { getAnimation } from '@/lib/lottiePreloader'

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
  tenants: 'analytics', // AFOREs management icon
  scrapers: 'settings', // Scrapers/automation icon (using settings as fallback)
  compliance: 'validators', // Compliance portal icon (using validators as proxy)
}

/**
 * Sidebar - VisionOS/Arc/Linear/Fintech Premium Style
 *
 * Ultra-modern fintech aesthetic:
 * - Dark glassmorphism with controlled blur
 * - Capsule card buttons with premium depth
 * - Blue glow effects and defined borders
 * - Premium typography (Inter/SF Pro)
 * - Collapsed mode support
 */
export function Sidebar() {
  const location = useLocation()
  const user = useAppStore(selectUser)
  const sidebarOpen = useAppStore(selectSidebarOpen)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const hasPermission = (requiredPermission: string | null): boolean => {
    if (!requiredPermission) return true
    if (!user) return false

    const userPermissions = PERMISSIONS[user.role as UserRole]
    return requiredPermission in userPermissions &&
           (userPermissions as any)[requiredPermission].length > 0
  }

  const filteredNavItems = NAVIGATION_ITEMS.filter((item) =>
    hasPermission(item.requiredPermission)
  )

  return (
    <>
      {/* Sidebar - VisionOS + Fintech Enterprise 2026 */}
      {/* NOTE: Sidebar is hidden on mobile (lg:hidden), BottomNav is used instead */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen flex flex-col',
          'hidden lg:flex lg:relative lg:z-auto',
          'transition-all duration-300 ease-out'
        )}
        style={{
          // Premium Width: 260-300px (responsive)
          width: sidebarOpen
            ? window.innerWidth >= 1536 ? '300px'    // 2xl - Extra large screens
              : window.innerWidth >= 1280 ? '280px'  // xl - Large screens
              : '260px'                               // lg - Base desktop
            : window.innerWidth >= 1536 ? '88px'     // 2xl collapsed
              : window.innerWidth >= 1280 ? '84px'   // xl collapsed
              : '80px',                               // lg collapsed

          // Gradiente Atmosférico: #070B14 → #0C111C → #0A0E18
          background: isDark ? `
            linear-gradient(
              180deg,
              #070B14 0%,
              #0C111C 40%,
              #0A0E18 100%
            )
          ` : `
            linear-gradient(
              180deg,
              #F8F9FC 0%,
              #F5F6FA 50%,
              #F2F4F8 100%
            )
          `,

          // Blur Suave 14-22px (VisionOS 2026)
          backdropFilter: 'blur(18px) saturate(125%)',
          WebkitBackdropFilter: 'blur(18px) saturate(125%)',

          // Borde Perimetral Ultra Sutil
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.06)'
            : '1px solid rgba(226, 232, 240, 0.8)',
          borderLeft: 'none',

          // Inner Shadow Ligera para Simular Volumen
          boxShadow: isDark ? `
            0 8px 36px rgba(0, 0, 0, 0.6),
            0 4px 18px rgba(0, 0, 0, 0.45),
            0 2px 8px rgba(0, 0, 0, 0.35),
            inset -1px 0 0 rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.03),
            inset 0 -1px 0 rgba(0, 0, 0, 0.25)
          ` : `
            0 8px 36px rgba(15, 23, 42, 0.08),
            0 4px 18px rgba(15, 23, 42, 0.04),
            0 2px 8px rgba(15, 23, 42, 0.02),
            inset -1px 0 0 rgba(255, 255, 255, 0.8),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.02)
          `,

          // Espaciado Vertical: 24px arriba
          paddingTop: '24px',
          paddingBottom: '24px',
        }}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Encabezado de Marca - Bloque Único Integrado */}
        <div
          className="flex items-center justify-center relative"
          style={{
            paddingLeft: sidebarOpen ? '24px' : '0',
            paddingRight: sidebarOpen ? '24px' : '0',
            paddingBottom: '16px',
            marginBottom: '16px',
            // Separador Inferior Fino Elegante Difuminado
            borderBottom: isDark
              ? '1px solid rgba(255, 255, 255, 0.05)'
              : '1px solid rgba(226, 232, 240, 0.6)',
            boxShadow: isDark ? `
              0 1px 0 rgba(255, 255, 255, 0.03),
              0 2px 4px rgba(0, 0, 0, 0.15),
              inset 0 -1px 0 rgba(0, 0, 0, 0.2)
            ` : `
              0 1px 0 rgba(255, 255, 255, 0.4),
              0 2px 4px rgba(15, 23, 42, 0.02),
              inset 0 -1px 0 rgba(0, 0, 0, 0.02)
            `,
          }}
        >
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            {/* Logo con Glow Radial Azul Controlado (No Saturado) */}
            <div className="relative flex items-center justify-center">
              {/* Glow Radial Controlado VisionOS 2026 */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: isDark
                    ? 'radial-gradient(circle at center, rgba(59, 130, 246, 0.10) 0%, rgba(59, 130, 246, 0.05) 35%, transparent 65%)'
                    : 'radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 35%, transparent 65%)',
                  filter: 'blur(10px)',
                  transform: 'scale(1.7)',
                  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />

              <img
                src="/certus-logo.png"
                alt="Certus Logo"
                className={cn(
                  "h-[94px] w-[94px] object-contain relative z-10",  // 72px + 30% = 93.6px → 94px
                  "transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
                  "group-hover:scale-[1.06] group-active:scale-[0.98]"
                )}
                style={{
                  filter: isDark
                    ? 'drop-shadow(0 0 16px rgba(59, 130, 246, 0.35)) drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))'
                    : 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.3)) drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))',
                }}
              />
            </div>
          </Link>
        </div>

        {/* Navigation - Pill Cards Ultra Refinados VisionOS 2026 */}
        <nav className="flex-1 overflow-y-auto px-5 py-1">
          <ul className="space-y-[12px]">
            {filteredNavItems.map((item) => {
              const lottieIconKey = iconMap[item.id]
              // Use preloader to get cached animation
              const animationData = lottieIconKey ? getAnimation(lottieIconKey) : null
              const isActive = location.pathname === item.path

              // Skip items without animation data or icon key
              if (!animationData || !lottieIconKey) {
                console.warn(`Missing animation data for ${item.id}`)
                return null
              }

              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={cn(
                      'group relative flex items-center',
                      // Pill Card Ultra Refinado: Roundness 20-24px
                      'min-h-[52px]',          // lg (1024px)
                      'xl:min-h-[54px]',       // xl (1280px)
                      '2xl:min-h-[56px]',      // 2xl (1536px)
                      'rounded-[22px]',        // lg (1024px) - Ultra suave
                      'xl:rounded-[23px]',     // xl (1280px)
                      '2xl:rounded-[24px]',    // 2xl (1536px)
                      'gap-[14px]',            // Gap refinado
                      // Padding interno
                      sidebarOpen ? 'px-[15px]' : 'px-0',
                      // Smooth transitions VisionOS 2026
                      'transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)',
                      'active:scale-[0.98]',
                      // Focus states
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                      // Centered when collapsed
                      !sidebarOpen && 'justify-center'
                    )}
                    style={isActive ? {
                      // Estado Activo: Blue Glass (#12203A) con Luminancia Suave
                      background: isDark ? `
                        linear-gradient(
                          135deg,
                          rgba(18, 32, 58, 0.88) 0%,
                          rgba(16, 28, 52, 0.82) 100%
                        )
                      ` : `
                        linear-gradient(
                          135deg,
                          rgba(219, 234, 254, 0.95) 0%,
                          rgba(191, 219, 254, 0.88) 100%
                        )
                      `,
                      backdropFilter: 'blur(14px) saturate(135%)',
                      WebkitBackdropFilter: 'blur(14px) saturate(135%)',

                      // Borde discreto
                      border: isDark
                        ? '1px solid rgba(59, 130, 246, 0.32)'
                        : '1px solid rgba(59, 130, 246, 0.25)',

                      // Glow Azul Suave Envolvente Difuminado + Micro Sombra
                      boxShadow: isDark ? `
                        0 0 0 1px rgba(59, 130, 246, 0.22),
                        0 0 24px rgba(59, 130, 246, 0.16),
                        0 0 12px rgba(59, 130, 246, 0.10),
                        0 3px 14px rgba(0, 0, 0, 0.32),
                        0 1.5px 6px rgba(0, 0, 0, 0.22),
                        inset 0 1px 0 rgba(255, 255, 255, 0.14),
                        inset 0 0 20px rgba(59, 130, 246, 0.07)
                      ` : `
                        0 0 0 1px rgba(59, 130, 246, 0.16),
                        0 0 24px rgba(59, 130, 246, 0.08),
                        0 0 12px rgba(59, 130, 246, 0.05),
                        0 3px 14px rgba(15, 23, 42, 0.08),
                        0 1.5px 6px rgba(15, 23, 42, 0.04),
                        inset 0 1px 0 rgba(255, 255, 255, 0.75),
                        inset 0 0 20px rgba(59, 130, 246, 0.04)
                      `,

                      // Elevación física sutil
                      transform: 'translateY(-1.2px)',
                    } : {
                      // Estado Inactivo: Glass-Dark Sutil
                      background: isDark ? `
                        linear-gradient(
                          135deg,
                          rgba(255, 255, 255, 0.04) 0%,
                          rgba(255, 255, 255, 0.02) 100%
                        )
                      ` : `
                        linear-gradient(
                          135deg,
                          rgba(255, 255, 255, 0.7) 0%,
                          rgba(248, 250, 252, 0.6) 100%
                        )
                      `,
                      backdropFilter: 'blur(12px) saturate(108%)',
                      WebkitBackdropFilter: 'blur(12px) saturate(108%)',

                      // Borde discreto
                      border: isDark
                        ? '1px solid rgba(255, 255, 255, 0.10)'
                        : '1px solid rgba(226, 232, 240, 0.5)',

                      boxShadow: isDark ? `
                        0 2px 9px rgba(0, 0, 0, 0.14),
                        inset 0 1px 0 rgba(255, 255, 255, 0.06)
                      ` : `
                        0 2px 9px rgba(15, 23, 42, 0.04),
                        inset 0 1px 0 rgba(255, 255, 255, 0.5)
                      `,
                    }}
                    // Hover: Elevación Física 1-1.5px + Brillo 8-10%
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        const target = e.currentTarget as HTMLElement
                        target.style.background = isDark ? `
                          linear-gradient(
                            135deg,
                            rgba(255, 255, 255, 0.055) 0%,
                            rgba(255, 255, 255, 0.035) 100%
                          )
                        ` : `
                          linear-gradient(
                            135deg,
                            rgba(255, 255, 255, 0.82) 0%,
                            rgba(248, 250, 252, 0.72) 100%
                          )
                        `
                        // Borde Reactivo con Color Activo Muy Sutil
                        target.style.border = isDark
                          ? '1px solid rgba(255, 255, 255, 0.135)'
                          : '1px solid rgba(226, 232, 240, 0.6)'
                        target.style.boxShadow = isDark ? `
                          0 3.5px 13px rgba(0, 0, 0, 0.18),
                          inset 0 1px 0 rgba(255, 255, 255, 0.09)
                        ` : `
                          0 3.5px 13px rgba(15, 23, 42, 0.055),
                          inset 0 1px 0 rgba(255, 255, 255, 0.58)
                        `
                        // Elevación Física 1.5px
                        target.style.transform = 'translateY(-1.5px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        const target = e.currentTarget as HTMLElement
                        target.style.background = isDark ? `
                          linear-gradient(
                            135deg,
                            rgba(255, 255, 255, 0.04) 0%,
                            rgba(255, 255, 255, 0.02) 100%
                          )
                        ` : `
                          linear-gradient(
                            135deg,
                            rgba(255, 255, 255, 0.7) 0%,
                            rgba(248, 250, 252, 0.6) 100%
                          )
                        `
                        target.style.border = isDark
                          ? '1px solid rgba(255, 255, 255, 0.10)'
                          : '1px solid rgba(226, 232, 240, 0.5)'
                        target.style.boxShadow = isDark ? `
                          0 2px 9px rgba(0, 0, 0, 0.14),
                          inset 0 1px 0 rgba(255, 255, 255, 0.06)
                        ` : `
                          0 2px 9px rgba(15, 23, 42, 0.04),
                          inset 0 1px 0 rgba(255, 255, 255, 0.5)
                        `
                        target.style.transform = 'translateY(0)'
                      }
                    }}
                    title={!sidebarOpen ? item.label : undefined}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    role="link"
                  >
                    {/* Iconos con Stroke 1.75px + Glow Interno Sutil 3-4px */}
                    <div className="relative flex items-center justify-center shrink-0">
                      <div
                        className={cn(
                          // Icon size 30% más grande - Protagonismo absoluto
                          'w-[40px] h-[40px]',      // lg (1024px) - 31px + 30% = 40.3px → 40px
                          'xl:w-[44px] xl:h-[44px]', // xl (1280px) - 34px + 30% = 44.2px → 44px
                          '2xl:w-[46px] 2xl:h-[46px]', // 2xl (1536px) - 35px + 30% = 45.5px → 46px
                          'flex items-center justify-center relative'
                        )}
                        style={{
                          zIndex: 10,
                          isolation: 'isolate',
                          // Glow Interno Sutil 3-4px
                          filter: isDark
                            ? isActive
                              ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.22)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.18)) brightness(1.12)'
                              : 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.12)) brightness(1.0)'
                            : 'none',
                        }}
                      >
                        <div
                          className={cn(
                            'w-full h-full',
                            'transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)',
                            // Hover: Aumento de Brillo 8-10%
                            !isActive && 'group-hover:scale-[1.08] group-hover:brightness-[1.09]',
                            // Active state: Bounce animation
                            isActive && 'animate-[scale-bounce_0.4s_cubic-bezier(0.4, 0, 0.2, 1)]'
                          )}
                          style={{
                            transformOrigin: 'center',
                            // Simular stroke 1.75px con subtle outline
                            WebkitFontSmoothing: 'antialiased',
                          }}
                        >
                          <LottieIcon
                            animationData={animationData}
                            isActive={isActive}
                            loop={false}
                            autoplay={false}
                            inactiveColor="default"
                            speed={1.0}
                            hoverEnabled={!isActive}
                            className="w-full h-full"
                            style={{
                              // Color: Blanco Suave rgba(255,255,255,0.92)
                              filter: isDark && !isActive ? 'brightness(0.92)' : 'none',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Texto 15px Semibold Color #EEF1FF */}
                    {sidebarOpen && (
                      <span
                        style={{
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif',
                          fontSize: '15px',  // 15px fijo
                          fontWeight: 600,   // semibold
                          letterSpacing: '-0.01em',
                          lineHeight: 1.35,
                          // Color #EEF1FF para texto normal
                          color: isActive
                            ? isDark
                              ? '#EEF1FF'
                              : '#1E40AF'
                            : isDark
                              ? '#EEF1FF'
                              : '#475569',
                          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                          // Hover: Aumento de Brillo en Label 8-10%
                          filter: !isActive && isDark ? 'brightness(0.95)' : 'none',
                        }}
                        className={cn(
                          !isActive && isDark && 'group-hover:brightness-[1.08]',
                          !isActive && !isDark && 'group-hover:text-slate-900'
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Botón Colapsable - Estilo Secundario Glass */}
        <div
          className="px-5 relative"
          style={{
            paddingTop: '22px',     // Espaciado 22-24px
            paddingBottom: '0px',
            borderTop: isDark
              ? '1px solid rgba(255, 255, 255, 0.05)'
              : '1px solid rgba(226, 232, 240, 0.6)',
            boxShadow: isDark ? `
              0 -1px 0 rgba(255, 255, 255, 0.03),
              inset 0 1px 0 rgba(0, 0, 0, 0.18)
            ` : `
              0 -1px 0 rgba(255, 255, 255, 0.4),
              inset 0 1px 0 rgba(0, 0, 0, 0.02)
            `,
          }}
        >
          <button
            onClick={toggleSidebar}
            className={cn(
              'flex items-center justify-center w-full',
              'h-[42px]',
              'rounded-[20px]',
              'transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)',
              'active:scale-[0.97]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
            )}
            style={{
              // Estilo Secundario Glass (más discreto)
              background: isDark ? `
                linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.035) 0%,
                  rgba(255, 255, 255, 0.02) 100%
                )
              ` : `
                linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.58) 0%,
                  rgba(248, 250, 252, 0.48) 100%
                )
              `,
              backdropFilter: 'blur(10px) saturate(105%)',
              WebkitBackdropFilter: 'blur(10px) saturate(105%)',

              // Borde discreto
              border: isDark
                ? '1px solid rgba(255, 255, 255, 0.09)'
                : '1px solid rgba(226, 232, 240, 0.5)',

              // Sin glow
              boxShadow: isDark ? `
                0 2px 7px rgba(0, 0, 0, 0.12),
                inset 0 1px 0 rgba(255, 255, 255, 0.045)
              ` : `
                0 2px 7px rgba(15, 23, 42, 0.032),
                inset 0 1px 0 rgba(255, 255, 255, 0.38)
              `,
            }}
            aria-label={sidebarOpen ? 'Contraer menú' : 'Expandir menú'}
            // Hover con Brillo Interno Controlado
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? `
                linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.048) 0%,
                  rgba(255, 255, 255, 0.032) 100%
                )
              ` : `
                linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.72) 0%,
                  rgba(248, 250, 252, 0.62) 100%
                )
              `
              e.currentTarget.style.border = isDark
                ? '1px solid rgba(255, 255, 255, 0.115)'
                : '1px solid rgba(226, 232, 240, 0.58)'
              e.currentTarget.style.boxShadow = isDark ? `
                0 2.5px 9px rgba(0, 0, 0, 0.14),
                inset 0 1px 0 rgba(255, 255, 255, 0.058)
              ` : `
                0 2.5px 9px rgba(15, 23, 42, 0.038),
                inset 0 1px 0 rgba(255, 255, 255, 0.48)
              `
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? `
                linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.035) 0%,
                  rgba(255, 255, 255, 0.02) 100%
                )
              ` : `
                linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.58) 0%,
                  rgba(248, 250, 252, 0.48) 100%
                )
              `
              e.currentTarget.style.border = isDark
                ? '1px solid rgba(255, 255, 255, 0.09)'
                : '1px solid rgba(226, 232, 240, 0.5)'
              e.currentTarget.style.boxShadow = isDark ? `
                0 2px 7px rgba(0, 0, 0, 0.12),
                inset 0 1px 0 rgba(255, 255, 255, 0.045)
              ` : `
                0 2px 7px rgba(15, 23, 42, 0.032),
                inset 0 1px 0 rgba(255, 255, 255, 0.38)
              `
            }}
          >
            {/* Icono Centrado 18px */}
            {sidebarOpen ? (
              <ChevronLeft
                className="transition-all duration-250"
                style={{
                  width: '18px',
                  height: '18px',
                  color: isDark ? '#B0B5C3' : '#64748B',
                  strokeWidth: 2,
                }}
              />
            ) : (
              <ChevronRight
                className="transition-all duration-250"
                style={{
                  width: '18px',
                  height: '18px',
                  color: isDark ? '#B0B5C3' : '#64748B',
                  strokeWidth: 2,
                }}
              />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
