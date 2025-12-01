/**
 * Login Page - VisionOS Enterprise 2026 Ultra Premium
 *
 * Características Premium:
 * - Sistema de glassmorphism iOS 2025 Liquid Glass completo
 * - Toggle de tema visible con detección automática del sistema
 * - Logo real de Certus con animación
 * - Validaciones avanzadas con feedback visual
 * - Responsividad total (xxs → 2xl)
 * - Microinteracciones premium
 * - Footer glassmorphic responsive y adaptativo
 * - Componentes reutilizables del sistema
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PremiumButtonV2 } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { toast } from 'sonner'
import { LogIn, Shield, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuthService } from '@/lib/services/api/auth.service'

interface ValidationError {
  email?: string
  password?: string
}

export function Login() {
  const navigate = useNavigate()
  const login = useAppStore((state) => state.login)
  const theme = useAppStore(selectTheme)
  const setTheme = useAppStore((state) => state.setTheme)
  const isDark = theme === 'dark'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationError>({})
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  })

  // Auto-detect system theme on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light')
    }

    // Set initial theme based on system preference if not already set
    if (!localStorage.getItem('app-store')) {
      setTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [setTheme])

  // Real-time validation
  const validateEmail = (value: string): string | undefined => {
    if (!value) return 'El correo electrónico es requerido'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Formato de correo inválido'
    return undefined
  }

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'La contraseña es requerida'
    if (value.length < 6) return 'Mínimo 6 caracteres'
    return undefined
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (touched.email) {
      const error = validateEmail(value)
      setErrors((prev) => ({ ...prev, email: error }))
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (touched.password) {
      const error = validatePassword(password)
      setErrors((prev) => ({ ...prev, password: error }))
    }
  }

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }))
    const error = validateEmail(email)
    setErrors((prev) => ({ ...prev, email: error }))
  }

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }))
    const error = validatePassword(password)
    setErrors((prev) => ({ ...prev, password: error }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({ email: true, password: true })

    // Validate all fields
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    setErrors({
      email: emailError,
      password: passwordError,
    })

    // Stop if there are errors
    if (emailError || passwordError) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    setLoading(true)

    try {
      // Call real API
      const response = await AuthService.login({ email, password })

      if (response.success && response.data) {
        const { user } = response.data

        // Create tenant object from user data
        const tenant = {
          id: user.tenantId,
          name: user.tenantName || 'Default',
          afore: user.tenantName || 'DEFAULT',
          settings: {
            notifications: {
              email: true,
              sms: false,
              inApp: true,
            },
            timezone: 'America/Mexico_City',
            language: 'es',
          },
        }

        // Update store with authenticated user
        login(user, tenant)

        toast.success('Sesión iniciada correctamente', {
          description: `Bienvenido, ${user.name}`,
        })

        // Navigate to dashboard
        navigate('/')
      }
    } catch (error) {
      // Error toast is handled by apiClient interceptor
      console.error('Login error:', error)
      toast.error('Error al iniciar sesión', {
        description: 'Credenciales inválidas o error de servidor',
      })
    } finally {
      setLoading(false)
    }
  }

  const isEmailValid = touched.email && !errors.email
  const isPasswordValid = touched.password && !errors.password

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col relative overflow-hidden',
        'pb-safe' // Safe area for mobile devices
      )}
      style={{
        background: isDark
          ? `linear-gradient(
              135deg,
              rgba(15, 15, 20, 1) 0%,
              rgba(20, 20, 25, 1) 50%,
              rgba(15, 15, 20, 1) 100%
            )`
          : `linear-gradient(
              135deg,
              rgba(245, 245, 250, 1) 0%,
              rgba(250, 250, 255, 1) 50%,
              rgba(245, 245, 250, 1) 100%
            )`,
      }}
    >
      {/* Theme Toggle - Absolute Top Right with Responsive Positioning */}
      <div
        className={cn(
          'absolute z-50',
          'top-3 right-3', // xxs: 340px
          'xs:top-4 xs:right-4', // xs: 360px+
          'sm:top-5 sm:right-5', // sm: 480px+
          'md:top-6 md:right-6', // md: 768px+
          'lg:top-6 lg:right-6' // lg: 1024px+
        )}
      >
        <ThemeToggle />
      </div>

      {/* Decorative background elements - Animated with Responsive Sizes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Orb 1 - Top Left */}
        <div
          className={cn(
            'absolute top-20 -left-20 rounded-full blur-3xl opacity-20',
            'w-48 h-48', // xxs-xs: 192px
            'sm:w-64 sm:h-64', // sm: 256px
            'md:w-80 md:h-80', // md: 320px
            'lg:w-96 lg:h-96', // lg: 384px
            isDark ? 'bg-blue-500' : 'bg-blue-400'
          )}
          style={{
            animation: 'glass-float 8s ease-in-out infinite',
          }}
        />
        {/* Orb 2 - Bottom Right */}
        <div
          className={cn(
            'absolute bottom-20 -right-20 rounded-full blur-3xl opacity-20',
            'w-48 h-48', // xxs-xs: 192px
            'sm:w-64 sm:h-64', // sm: 256px
            'md:w-80 md:h-80', // md: 320px
            'lg:w-96 lg:h-96', // lg: 384px
            isDark ? 'bg-purple-500' : 'bg-purple-400'
          )}
          style={{
            animation: 'glass-float 10s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />
        {/* Orb 3 - Center */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-10',
            'w-64 h-64', // xxs-xs: 256px
            'sm:w-96 sm:h-96', // sm: 384px
            'md:w-[500px] md:h-[500px]', // md: 500px
            'lg:w-[600px] lg:h-[600px]', // lg: 600px
            isDark ? 'bg-indigo-500' : 'bg-indigo-400'
          )}
          style={{
            animation: 'glass-float 12s ease-in-out infinite',
            animationDelay: '2s',
          }}
        />
      </div>

      {/* Main Content - Centered with Flex Grow */}
      <div className="flex-1 flex items-center justify-center px-3 py-16 sm:px-4 sm:py-20 md:px-6 md:py-24">
        {/* Login Card Container - Responsive Max Width */}
        <div
          className={cn(
            'relative w-full',
            'max-w-[340px]', // xxs: 340px
            'xs:max-w-[380px]', // xs: 380px
            'sm:max-w-md', // sm: 448px
            'md:max-w-lg', // md: 512px
            'lg:max-w-xl' // lg: 576px
          )}
        >
          <div
            className={cn(
              'glass-ultra-premium depth-layer-4 fresnel-edge',
              'rounded-[20px] sm:rounded-[24px] md:rounded-[28px]',
              'p-5 xs:p-6 sm:p-7 md:p-8',
              'relative overflow-hidden',
              'backdrop-blur-2xl transition-all duration-500',
              'spring-bounce'
            )}
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(20,20,25,0.95) 0%, rgba(15,15,20,0.98) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.98) 100%)',
              backdropFilter: 'blur(32px) saturate(180%) brightness(1.05)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%) brightness(1.05)',
              border: isDark
                ? '1.5px solid rgba(255,255,255,0.12)'
                : '1.5px solid rgba(255,255,255,0.6)',
              boxShadow: isDark
                ? `0 24px 64px rgba(0, 0, 0, 0.6),
                   0 12px 32px rgba(0, 0, 0, 0.4),
                   0 6px 16px rgba(0, 0, 0, 0.3),
                   inset 0 0 0 1px rgba(255, 255, 255, 0.1),
                   inset 0 2px 0 rgba(255, 255, 255, 0.15)`
                : `0 24px 64px rgba(0, 0, 0, 0.15),
                   0 12px 32px rgba(0, 0, 0, 0.1),
                   0 6px 16px rgba(0, 0, 0, 0.05),
                   inset 0 0 0 1px rgba(255, 255, 255, 0.6),
                   inset 0 2px 0 rgba(255, 255, 255, 0.8)`,
            }}
          >
            {/* Shimmer effect */}
            <div
              className="absolute inset-0 glass-shimmer opacity-30"
              style={{
                background: isDark
                  ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              }}
            />

            {/* Logo and Header */}
            <div className="text-center mb-5 xs:mb-6 sm:mb-7 md:mb-8 relative z-10">
              {/* Logo Real de Certus - Responsive Sizes */}
              <div className="flex justify-center mb-3 xs:mb-4 sm:mb-5 md:mb-6">
                <div
                  className={cn(
                    'relative rounded-[18px] sm:rounded-[20px] md:rounded-[24px]',
                    'flex items-center justify-center overflow-hidden',
                    'glass-ultra-premium depth-layer-3 fresnel-edge',
                    'transition-all duration-500 hover:scale-105 hover:rotate-3',
                    'spring-bounce',
                    'h-16 w-16', // xxs: 64px
                    'xs:h-18 xs:w-18', // xs: 72px
                    'sm:h-20 sm:w-20', // sm: 80px
                    'md:h-24 md:w-24' // md: 96px
                  )}
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(30,30,40,0.8) 0%, rgba(25,25,35,0.9) 100%)'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: isDark
                      ? '1.5px solid rgba(255,255,255,0.15)'
                      : '1.5px solid rgba(255,255,255,0.5)',
                    boxShadow: isDark
                      ? `0 8px 32px rgba(0, 0, 0, 0.5),
                         0 4px 16px rgba(0, 0, 0, 0.3),
                         inset 0 0 20px rgba(255, 255, 255, 0.08),
                         inset 0 2px 0 rgba(255, 255, 255, 0.12)`
                      : `0 8px 32px rgba(0, 0, 0, 0.1),
                         0 4px 16px rgba(0, 0, 0, 0.05),
                         inset 0 0 20px rgba(255, 255, 255, 0.5),
                         inset 0 2px 0 rgba(255, 255, 255, 0.8)`,
                  }}
                >
                  <img
                    src="/certus-logo.png"
                    alt="Certus Logo"
                    className={cn(
                      'object-contain',
                      'h-10 w-10', // xxs: 40px
                      'xs:h-11 xs:w-11', // xs: 44px
                      'sm:h-12 sm:w-12', // sm: 48px
                      'md:h-14 md:w-14' // md: 56px
                    )}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <Shield
                    className={cn(
                      'hidden',
                      'h-8 w-8', // xxs: 32px
                      'xs:h-9 xs:w-9', // xs: 36px
                      'sm:h-10 sm:w-10', // sm: 40px
                      'md:h-12 md:w-12', // md: 48px
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    )}
                    strokeWidth={2}
                  />
                </div>
              </div>

              {/* Title - Responsive Text Sizes */}
              <h1
                className={cn(
                  'ios-font-bold mb-1.5 sm:mb-2',
                  'text-xl', // xxs: 20px
                  'xs:text-2xl', // xs: 24px
                  'sm:text-3xl', // sm: 30px
                  'md:text-4xl', // md: 36px
                  isDark ? 'text-neutral-100' : 'text-neutral-900'
                )}
              >
                Certus
              </h1>
              <p
                className={cn(
                  'ios-font-regular mb-2 sm:mb-3',
                  'text-xs', // xxs: 12px
                  'xs:text-sm', // xs: 14px
                  'sm:text-base', // sm: 16px
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                )}
              >
                Sistema de Validación CONSAR
              </p>
            </div>

            {/* Login Form - Responsive Spacing */}
            <form
              onSubmit={handleLogin}
              className="space-y-4 xs:space-y-4.5 sm:space-y-5 md:space-y-6 relative z-10"
            >
              {/* Email Field with Advanced Validation */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label
                  htmlFor="email"
                  className={cn(
                    'ios-font-semibold flex items-center gap-1.5 sm:gap-2',
                    'text-xs sm:text-sm',
                    isDark ? 'text-neutral-300' : 'text-neutral-700'
                  )}
                >
                  <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@afore.mx"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={handleEmailBlur}
                    className={cn(
                      'h-11 sm:h-12 rounded-xl border-2 transition-all duration-300',
                      'text-sm sm:text-base pr-10',
                      'focus:ring-4',
                      errors.email && touched.email
                        ? isDark
                          ? 'border-red-500/50 bg-red-500/5 text-red-400 placeholder:text-red-400/50 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-red-500/50 bg-red-50 text-red-900 placeholder:text-red-400/50 focus:border-red-500 focus:ring-red-500/20'
                        : isEmailValid
                        ? isDark
                          ? 'border-green-500/50 bg-green-500/5 text-neutral-100 placeholder:text-neutral-500 focus:border-green-500 focus:ring-green-500/20'
                          : 'border-green-500/50 bg-green-50 text-neutral-900 placeholder:text-neutral-400 focus:border-green-500 focus:ring-green-500/20'
                        : isDark
                        ? 'bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-white/50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:ring-blue-500/20',
                      isDark
                        ? 'focus:bg-neutral-800/70'
                        : 'focus:bg-white/70'
                    )}
                  />
                  {touched.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {errors.email ? (
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 animate-icon-pop" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 animate-icon-pop" />
                      )}
                    </div>
                  )}
                </div>
                {errors.email && touched.email && (
                  <p
                    className={cn(
                      'text-[10px] xs:text-xs font-medium flex items-center gap-1 sm:gap-1.5 animate-slide-up',
                      isDark ? 'text-red-400' : 'text-red-600'
                    )}
                  >
                    <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field with Advanced Validation */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label
                  htmlFor="password"
                  className={cn(
                    'ios-font-semibold flex items-center gap-1.5 sm:gap-2',
                    'text-xs sm:text-sm',
                    isDark ? 'text-neutral-300' : 'text-neutral-700'
                  )}
                >
                  <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={handlePasswordBlur}
                    className={cn(
                      'h-11 sm:h-12 rounded-xl border-2 transition-all duration-300',
                      'text-sm sm:text-base pr-10',
                      'focus:ring-4',
                      errors.password && touched.password
                        ? isDark
                          ? 'border-red-500/50 bg-red-500/5 text-red-400 placeholder:text-red-400/50 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-red-500/50 bg-red-50 text-red-900 placeholder:text-red-400/50 focus:border-red-500 focus:ring-red-500/20'
                        : isPasswordValid
                        ? isDark
                          ? 'border-green-500/50 bg-green-500/5 text-neutral-100 placeholder:text-neutral-500 focus:border-green-500 focus:ring-green-500/20'
                          : 'border-green-500/50 bg-green-50 text-neutral-900 placeholder:text-neutral-400 focus:border-green-500 focus:ring-green-500/20'
                        : isDark
                        ? 'bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-white/50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:ring-blue-500/20',
                      isDark
                        ? 'focus:bg-neutral-800/70'
                        : 'focus:bg-white/70'
                    )}
                  />
                  {touched.password && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {errors.password ? (
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 animate-icon-pop" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 animate-icon-pop" />
                      )}
                    </div>
                  )}
                </div>
                {errors.password && touched.password && (
                  <p
                    className={cn(
                      'text-[10px] xs:text-xs font-medium flex items-center gap-1 sm:gap-1.5 animate-slide-up',
                      isDark ? 'text-red-400' : 'text-red-600'
                    )}
                  >
                    <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Login Button - Premium */}
              <div className="pt-1 sm:pt-2">
                <PremiumButtonV2
                  type="submit"
                  label={loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  icon={loading ? undefined : LogIn}
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                />
              </div>

              {/* Register Link */}
              <div className="text-center pt-2 sm:pt-3">
                <p
                  className={cn(
                    'ios-font-regular',
                    'text-xs sm:text-sm',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                >
                  ¿No tienes cuenta?{' '}
                  <Link
                    to="/register"
                    className={cn(
                      'ios-font-semibold transition-colors duration-200',
                      isDark
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-blue-600 hover:text-blue-500'
                    )}
                  >
                    Crear cuenta
                  </Link>
                </p>
              </div>

            </form>
          </div>

          {/* Bottom decorative line - Responsive Width */}
          <div
            className={cn(
              'absolute -bottom-1.5 sm:-bottom-2',
              'left-1/2 -translate-x-1/2',
              'w-2/3 sm:w-3/4',
              'h-0.5 sm:h-1',
              'rounded-full blur-sm',
              isDark
                ? 'bg-gradient-to-r from-transparent via-blue-500/50 to-transparent'
                : 'bg-gradient-to-r from-transparent via-blue-400/30 to-transparent'
            )}
          />
        </div>
      </div>

      {/* Footer - Premium Glassmorphic Responsive */}
      <footer className="relative z-10 w-full px-3 pb-4 xs:px-4 xs:pb-5 sm:px-6 sm:pb-6 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div
            className={cn(
              'glass-ultra-clear depth-layer-2 fresnel-edge',
              'rounded-xl sm:rounded-2xl',
              'p-3 xs:p-4 sm:p-5 md:p-6',
              'border transition-all duration-300',
              'backdrop-blur-xl'
            )}
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(25,25,35,0.6) 0%, rgba(20,20,30,0.7) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(250,250,255,0.9) 100%)',
              backdropFilter: 'blur(20px) saturate(150%)',
              WebkitBackdropFilter: 'blur(20px) saturate(150%)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(255,255,255,0.4)',
              boxShadow: isDark
                ? `0 8px 24px rgba(0, 0, 0, 0.4),
                   0 4px 12px rgba(0, 0, 0, 0.3),
                   inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                : `0 8px 24px rgba(0, 0, 0, 0.06),
                   0 4px 12px rgba(0, 0, 0, 0.04),
                   inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
            }}
          >
            {/* Footer Content - Responsive Layout */}
            <div className="flex flex-col items-center gap-2 xs:gap-2.5 sm:gap-3">
              {/* Main Text - Adaptive Layout for Mobile */}
              <div className="text-center">
                <p
                  className={cn(
                    'ios-font-medium',
                    'text-[10px] xs:text-xs sm:text-sm',
                    'leading-relaxed',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                >
                  {/* Mobile: Stack vertically */}
                  <span className="block xxs:inline">
                    © 2026 Hergon
                  </span>
                  <span className="hidden xxs:inline mx-1.5">·</span>
                  <span className="block xxs:inline">
                    Sistema de Validación CONSAR
                  </span>
                </p>
              </div>

              {/* Secondary Text - Rights */}
              <p
                className={cn(
                  'ios-font-regular text-center',
                  'text-[9px] xs:text-[10px] sm:text-xs',
                  isDark ? 'text-neutral-500' : 'text-neutral-500'
                )}
              >
                Todos los derechos reservados
              </p>

              {/* Decorative Dot */}
              <div
                className={cn(
                  'w-1 h-1 rounded-full',
                  isDark ? 'bg-neutral-600' : 'bg-neutral-400'
                )}
              />
            </div>
          </div>
        </div>
      </footer>

      {/* Animation styles */}
      <style>{`
        @keyframes glass-float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }
      `}</style>
    </div>
  )
}
