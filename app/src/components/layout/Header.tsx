import { useMemo } from 'react'
import { LogOut, User as UserIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useAppStore, selectUser, selectTenant, selectTheme } from '@/stores/appStore'
import {
  useNotificationStore,
  selectUnreadCount,
  selectNotifications,
} from '@/stores/notificationStore'
import { formatRelativeTime } from '@/lib/utils/format'
import { LottieIcon } from '@/components/ui/LottieIcon'
import { getAnimation } from '@/lib/lottiePreloader'

/**
 * Header - Ultra Refined visionOS 2025 Style
 *
 * Premium glassmorphic header with:
 * - Company/tenant information on left
 * - Notifications and theme toggle with Lottie animations
 * - User menu with avatar and info
 */
export function Header() {
  const user = useAppStore(selectUser)
  const tenant = useAppStore(selectTenant)
  const theme = useAppStore(selectTheme)
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const setTheme = useAppStore((state) => state.setTheme)
  const logout = useAppStore((state) => state.logout)
  const unreadCount = useNotificationStore(selectUnreadCount)
  const notifications = useNotificationStore(selectNotifications)
  const markAsRead = useNotificationStore((state) => state.markAsRead)

  const isDark = theme === 'dark'

  // Get Lottie animations
  const notificationAnimationData = getAnimation('notification')
  const themeAnimationData = getAnimation('lightMode')
  const userProfileAnimationData = getAnimation('userProfile')
  const settingsAnimationData = getAnimation('settings')

  // Memoize unread notifications
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read),
    [notifications]
  )

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const handleNotificationClick = (id: string) => {
    markAsRead(id)
  }

  const handleThemeToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30',
        // Height with margins - REDUCED
        'h-[68px] lg:h-[76px]',  // Reduced height
        // Margins - floating card effect - REDUCED
        'mx-3 my-2',              // Mobile - reduced vertical margin
        'lg:ml-3 lg:mr-3 lg:mt-2 lg:mb-2',  // Desktop - reduced margins
        'xl:ml-4 xl:mr-4 xl:mt-3 xl:mb-3',  // Large desktop - reduced margins
        '2xl:ml-5 2xl:mr-5 2xl:mt-3 2xl:mb-3',  // Extra large - reduced margins
        // Rounded corners - ALWAYS rounded (all four corners)
        'rounded-[28px]',        // Mobile - all corners
        'lg:rounded-[28px]',     // Desktop base - all corners
        'xl:rounded-[32px]',     // Desktop large - all corners
        '2xl:rounded-[36px]',    // Desktop extra large - all corners
        // visionOS Ultra effects - ENHANCED
        'glass-ultra-premium glass-caustics volumetric-light',
        'depth-layer-5 fresnel-edge iridescent-overlay',
        'light-leak-bottom subsurface-scatter',
        // Crystal & Light effects - ENHANCED
        'crystal-overlay prism-effect atmospheric-depth',
        'specular-highlights inner-glow frosted-premium edge-luminance',
        'glass-gpu-accelerated ultra-smooth',
        'animate-[backdrop-blur-in_1s_ease-out]',
        'transition-all duration-500'
      )}
      style={{
        background: isDark ? `
          linear-gradient(
            180deg,
            rgba(20, 20, 25, 0.95) 0%,
            rgba(25, 25, 32, 0.93) 25%,
            rgba(22, 22, 30, 0.92) 50%,
            rgba(25, 25, 32, 0.93) 75%,
            rgba(20, 20, 25, 0.95) 100%
          )
        ` : `
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(250, 250, 255, 0.96) 25%,
            rgba(255, 250, 255, 0.94) 50%,
            rgba(250, 255, 255, 0.96) 75%,
            rgba(255, 255, 255, 0.98) 100%
          )
        `,
        backdropFilter: isDark
          ? 'blur(40px) saturate(200%) brightness(1.05) contrast(1.08) hue-rotate(2deg)'
          : 'blur(40px) saturate(200%) brightness(1.15) contrast(1.05) hue-rotate(2deg)',
        WebkitBackdropFilter: isDark
          ? 'blur(40px) saturate(200%) brightness(1.05) contrast(1.08) hue-rotate(2deg)'
          : 'blur(40px) saturate(200%) brightness(1.15) contrast(1.05) hue-rotate(2deg)',
        borderBottom: isDark
          ? '2px solid rgba(255, 255, 255, 0.1)'
          : '2px solid rgba(255, 255, 255, 0.5)',
        borderLeft: isDark
          ? '0.5px solid rgba(255, 255, 255, 0.05)'
          : '0.5px solid rgba(255, 255, 255, 0.3)',
        boxShadow: isDark ? `
          0 0 0 0.5px rgba(255, 255, 255, 0.1),
          0 0 120px rgba(0, 0, 0, 0.6),
          0 0 80px rgba(0, 0, 0, 0.5),
          0 0 60px rgba(0, 0, 0, 0.4),
          0 0 40px rgba(0, 0, 0, 0.3),
          0 0 20px rgba(0, 0, 0, 0.2),
          0 0 10px rgba(0, 0, 0, 0.15),
          0 0 5px rgba(0, 0, 0, 0.1),
          inset 0 0 0 1px rgba(255, 255, 255, 0.08),
          inset 0 2px 0 rgba(255, 255, 255, 0.05),
          inset 0 -2px 0 rgba(0, 0, 0, 0.3),
          inset 0 0 60px rgba(135, 206, 250, 0.03)
        ` : `
          0 0 0 0.5px rgba(255, 255, 255, 0.9),
          0 0 120px rgba(0, 0, 0, 0.10),
          0 0 80px rgba(0, 0, 0, 0.08),
          0 0 60px rgba(0, 0, 0, 0.06),
          0 0 40px rgba(0, 0, 0, 0.05),
          0 0 20px rgba(0, 0, 0, 0.03),
          0 0 10px rgba(0, 0, 0, 0.02),
          0 0 5px rgba(0, 0, 0, 0.01),
          inset 0 0 0 1px rgba(255, 255, 255, 0.5),
          inset 0 2px 0 rgba(255, 255, 255, 0.6),
          inset 0 -2px 0 rgba(0, 0, 0, 0.05),
          inset 0 0 60px rgba(135, 206, 250, 0.05)
        `,
      }}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left side - Tenant/Company info */}
        <div className="flex items-center gap-3">
          {tenant && (
            <div className="flex flex-col">
              <p
                className={cn(
                  // iOS 2025 Typography - Caption 2 (12px, uppercase)
                  'ios-text-caption2 ios-font-semibold uppercase',
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                )}
                style={{ letterSpacing: '0.05em' }}
              >
                Organización
              </p>
              <p
                className={cn(
                  // iOS 2025 Typography - Body (17px) with gradient
                  'ios-text-body ios-font-bold lg:ios-text-callout',
                  isDark ? 'text-white' : 'text-neutral-900'
                )}
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #FFFFFF 0%, #E0E7FF 100%)'
                    : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.01em'
                }}
              >
                {tenant.name}
              </p>
            </div>
          )}
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Notifications with Lottie Icon */}
          {notificationAnimationData && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
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
                  aria-label="Notificaciones"
                >
                  <div className="w-6 h-6">
                    <LottieIcon
                      animationData={notificationAnimationData}
                      isActive={unreadCount > 0}
                      loop={false}
                      autoplay={false}
                      inactiveColor="default"
                      speed={1.0}
                      hoverEnabled={true}
                      className="transition-all duration-300"
                    />
                  </div>
                  {unreadCount > 0 && (
                    <div
                      className={cn(
                        "absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-white text-[9px] font-extrabold",
                        "glass-gpu-accelerated spring-bounce",
                        "active-glass-glow active-energy-pulse active-gradient-flow"
                      )}
                      style={{
                        background: `
                          linear-gradient(
                            135deg,
                            #FF3B30 0%,
                            #FF2D55 50%,
                            #FF375F 100%
                          )
                        `,
                        backgroundSize: '300% 300%',
                        animation: 'mesh-flow 6s ease-in-out infinite, glass-pulse 2.5s ease-in-out infinite',
                        boxShadow: `
                          0 0 0 2px rgba(255, 255, 255, 1),
                          0 0 0 3.5px rgba(255, 59, 48, 0.4),
                          0 0 20px rgba(255, 59, 48, 0.5),
                          0 0 40px rgba(255, 45, 85, 0.3),
                          0 4px 16px rgba(255, 59, 48, 0.4),
                          inset 0 0 15px rgba(255, 255, 255, 0.3),
                          inset 0 2px 0 rgba(255, 255, 255, 0.5),
                          inset 0 -1px 0 rgba(0, 0, 0, 0.25)
                        `,
                        border: '1.5px solid rgba(255, 255, 255, 0.4)',
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span className="ios-text-callout ios-font-semibold">Notificaciones</span>
                  {unreadCount > 0 && (
                    <Badge variant="primary">
                      {unreadCount} nuevas
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {unreadNotifications.length === 0 ? (
                    <div className="py-8 text-center ios-text-footnote text-neutral-500">
                      No hay notificaciones nuevas
                    </div>
                  ) : (
                    unreadNotifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex w-full items-start justify-between gap-2">
                          <p className="ios-text-footnote ios-font-semibold">{notification.title}</p>
                          <Badge
                            variant={
                              notification.type === 'error'
                                ? 'danger'
                                : notification.type === 'warning'
                                  ? 'warning'
                                  : notification.type === 'success'
                                    ? 'success'
                                    : 'primary'
                            }
                            className="shrink-0"
                          >
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="ios-text-caption1 text-neutral-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="ios-text-caption2 text-neutral-400">
                          {formatRelativeTime(notification.timestamp)}
                        </p>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                {unreadNotifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/notifications"
                        className="text-center ios-text-footnote ios-font-semibold text-primary-600 hover:text-primary-700"
                      >
                        Ver todas las notificaciones
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Divider */}
          <div
            className="h-8 w-px mx-1"
            style={{
              background: isDark
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0) 100%)'
                : 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)',
            }}
          />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-[16px]',
                  'glass-ultra-clear depth-layer-3 fresnel-edge',
                  'glass-gpu-accelerated spring-bounce',
                  'active:scale-[0.95]',
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
              >
                {/* Avatar with ultra-refined style */}
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-[14px]',
                    'text-white font-bold text-xs',
                    'glass-ultra-clear depth-layer-4 fresnel-edge chromatic-edges',
                    'glass-gpu-accelerated'
                  )}
                  style={{
                    background: `
                      linear-gradient(
                        135deg,
                        #0066FF 0%,
                        #5856D6 35%,
                        #7C3AED 65%,
                        #AF52DE 100%
                      )
                    `,
                    backgroundSize: '300% 300%',
                    animation: 'mesh-flow 8s ease-in-out infinite',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    boxShadow: `
                      0 0 0 0.5px rgba(88, 86, 214, 0.2),
                      0 0 20px rgba(0, 102, 255, 0.25),
                      0 0 40px rgba(88, 86, 214, 0.15),
                      0 6px 24px rgba(88, 86, 214, 0.2),
                      0 3px 12px rgba(0, 102, 255, 0.15),
                      0 1px 6px rgba(88, 86, 214, 0.1),
                      inset 0 0 30px rgba(255, 255, 255, 0.15),
                      inset 0 2px 0 rgba(255, 255, 255, 0.4),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.12)
                    `,
                  }}
                >
                  {user ? getInitials(user.name) : 'U'}
                </div>

                {/* User name - hidden on mobile */}
                <span
                  className={cn(
                    // iOS 2025 Typography - Footnote (15px)
                    'hidden md:inline ios-text-footnote ios-font-semibold',
                    isDark ? 'text-white' : 'text-neutral-900'
                  )}
                  style={{ letterSpacing: '-0.01em' }}
                >
                  {user?.name || 'Usuario'}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="ios-text-callout ios-font-semibold">{user?.name}</p>
                  <p className="ios-text-caption1 text-neutral-500 ios-font-regular">
                    {user?.email}
                  </p>
                  <p className="ios-text-caption2 text-neutral-400 ios-font-medium mt-1">
                    {user?.role.replace('_', ' ')}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Theme Toggle */}
              <DropdownMenuItem
                onClick={handleThemeToggle}
                className="flex items-center gap-3 cursor-pointer"
              >
                {themeAnimationData && (
                  <div className="w-6 h-6">
                    <LottieIcon
                      animationData={themeAnimationData}
                      isActive={!isDark}
                      loop={false}
                      autoplay={false}
                      inactiveColor="default"
                      speed={1.0}
                      hoverEnabled={true}
                      className="transition-all duration-300"
                    />
                  </div>
                )}
                <span className={cn(
                  'ios-text-footnote',
                  isDark ? 'text-neutral-200' : 'text-neutral-700'
                )}>
                  {isDark ? 'Modo claro' : 'Modo oscuro'}
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings/profile" className="flex items-center gap-3">
                  {userProfileAnimationData && (
                    <div className="w-6 h-6">
                      <LottieIcon
                        animationData={userProfileAnimationData}
                        isActive={false}
                        loop={false}
                        autoplay={false}
                        inactiveColor="default"
                        speed={1.0}
                        hoverEnabled={true}
                        className="transition-all duration-300"
                      />
                    </div>
                  )}
                  <span className={cn(
                    'ios-text-footnote',
                    isDark ? 'text-neutral-200' : 'text-neutral-700'
                  )}>
                    Mi perfil
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-3">
                  {settingsAnimationData && (
                    <div className="w-6 h-6">
                      <LottieIcon
                        animationData={settingsAnimationData}
                        isActive={false}
                        loop={false}
                        autoplay={false}
                        inactiveColor="default"
                        speed={1.0}
                        hoverEnabled={true}
                        className="transition-all duration-300"
                      />
                    </div>
                  )}
                  <span className={cn(
                    'ios-text-footnote',
                    isDark ? 'text-neutral-200' : 'text-neutral-700'
                  )}>
                    Configuración
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-3"
              >
                <LogOut className="h-5 w-5 text-danger-600" strokeWidth={2.5} />
                <span className="ios-text-footnote ios-font-semibold text-danger-600 focus:text-danger-700">
                  Cerrar sesión
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
