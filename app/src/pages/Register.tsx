/**
 * Register Page - VisionOS Enterprise 2026 Ultra Premium
 *
 * User registration with:
 * - Sistema de glassmorphism iOS 2025 Liquid Glass completo
 * - Toggle de tema visible con detección automática del sistema
 * - Logo real de Certus con animación
 * - Validaciones avanzadas con feedback visual
 * - Responsividad total (xxs → 2xl)
 * - Microinteracciones premium
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PremiumButtonV2 } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { toast } from 'sonner'
import { UserPlus, Shield, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuthService } from '@/lib/services/api'

interface ValidationError {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function Register() {
  const navigate = useNavigate()
  const login = useAppStore((state) => state.login)
  const theme = useAppStore(selectTheme)
  const setTheme = useAppStore((state) => state.setTheme)
  const isDark = theme === 'dark'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationError>({})
  const [touched, setTouched] = useState<{
    name: boolean
    email: boolean
    password: boolean
    confirmPassword: boolean
  }>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  // Auto-detect system theme on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light')
    }

    if (!localStorage.getItem('app-store')) {
      setTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [setTheme])

  // Validation functions
  const validateName = (value: string): string | undefined => {
    if (!value) return 'El nombre es requerido'
    if (value.length < 2) return 'Mínimo 2 caracteres'
    return undefined
  }

  const validateEmail = (value: string): string | undefined => {
    if (!value) return 'El correo electrónico es requerido'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Formato de correo inválido'
    return undefined
  }

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'La contraseña es requerida'
    if (value.length < 6) return 'Mínimo 6 caracteres'
    if (!/[A-Z]/.test(value)) return 'Debe incluir al menos una mayúscula'
    if (!/[0-9]/.test(value)) return 'Debe incluir al menos un número'
    return undefined
  }

  const validateConfirmPassword = (value: string): string | undefined => {
    if (!value) return 'Confirma tu contraseña'
    if (value !== password) return 'Las contraseñas no coinciden'
    return undefined
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (touched.name) {
      const error = validateName(value)
      setErrors((prev) => ({ ...prev, name: error }))
    }
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
      const error = validatePassword(value)
      setErrors((prev) => ({ ...prev, password: error }))
    }
    if (touched.confirmPassword && confirmPassword) {
      const confirmError = value !== confirmPassword ? 'Las contraseñas no coinciden' : undefined
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
    }
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    if (touched.confirmPassword) {
      const error = validateConfirmPassword(value)
      setErrors((prev) => ({ ...prev, confirmPassword: error }))
    }
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    let error: string | undefined
    switch (field) {
      case 'name':
        error = validateName(name)
        break
      case 'email':
        error = validateEmail(email)
        break
      case 'password':
        error = validatePassword(password)
        break
      case 'confirmPassword':
        error = validateConfirmPassword(confirmPassword)
        break
    }
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const nameError = validateName(name)
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmPasswordError = validateConfirmPassword(confirmPassword)

    setTouched({ name: true, email: true, password: true, confirmPassword: true })
    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    })

    if (nameError || emailError || passwordError || confirmPasswordError) {
      toast.error('Por favor, corrige los errores en el formulario')
      return
    }

    setLoading(true)

    try {
      const response = await AuthService.register({
        name,
        email,
        password,
      })

      if (response.success && response.data) {
        // Login the user with the returned data
        login(response.data.user)
        toast.success('Cuenta creada exitosamente')
        navigate('/')
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { error?: string } } }
      if (err?.response?.status === 409) {
        setErrors((prev) => ({ ...prev, email: 'Este correo ya está registrado' }))
        toast.error('Este correo ya está registrado')
      } else {
        toast.error(err?.response?.data?.error || 'Error al crear la cuenta')
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid =
    name &&
    email &&
    password &&
    confirmPassword &&
    !errors.name &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center',
        'p-3 xs:p-4 sm:p-6 lg:p-8',
        'transition-all duration-500',
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      )}
    >
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-3 right-3 xs:top-4 xs:right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Back to Login Link */}
      <div className="fixed top-3 left-3 xs:top-4 xs:left-4 sm:top-6 sm:left-6 z-50">
        <Link
          to="/login"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'text-xs sm:text-sm font-medium',
            'transition-all duration-300',
            isDark
              ? 'text-neutral-400 hover:text-white hover:bg-white/5'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/5'
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Iniciar sesión</span>
        </Link>
      </div>

      {/* Main Card */}
      <div
        className={cn(
          'relative w-full',
          'max-w-[320px] xs:max-w-[360px] sm:max-w-[420px]',
          'glass-ultra depth-layer-3',
          'rounded-2xl sm:rounded-3xl',
          'p-4 xs:p-5 sm:p-6 lg:p-8',
          'border transition-all duration-500',
          isDark ? 'border-white/10' : 'border-black/5'
        )}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 30, 40, 0.8), rgba(20, 20, 30, 0.9))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
          backdropFilter: 'blur(40px) saturate(180%)',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          {/* Logo */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <div
              className={cn(
                'relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20',
                'rounded-xl sm:rounded-2xl',
                'flex items-center justify-center',
                'transition-all duration-500'
              )}
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2))'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))',
                boxShadow: isDark
                  ? '0 8px 32px rgba(59, 130, 246, 0.2)'
                  : '0 8px 32px rgba(59, 130, 246, 0.15)',
              }}
            >
              <Shield
                className={cn(
                  'w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10',
                  isDark ? 'text-blue-400' : 'text-blue-600'
                )}
              />
            </div>
          </div>

          {/* Title */}
          <h1
            className={cn(
              'ios-font-semibold',
              'text-lg xs:text-xl sm:text-2xl',
              'tracking-tight',
              isDark ? 'text-white' : 'text-neutral-900'
            )}
          >
            Crear cuenta
          </h1>
          <p
            className={cn(
              'ios-font-regular',
              'text-xs sm:text-sm',
              'mt-1',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            Regístrate en Certus CONSAR
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Name Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label
              htmlFor="name"
              className={cn(
                'ios-font-medium text-xs sm:text-sm',
                isDark ? 'text-neutral-300' : 'text-neutral-700'
              )}
            >
              Nombre completo
            </Label>
            <div className="relative">
              <User
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2',
                  'w-4 h-4 sm:w-5 sm:h-5',
                  errors.name && touched.name
                    ? 'text-red-400'
                    : isDark
                      ? 'text-neutral-500'
                      : 'text-neutral-400'
                )}
              />
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => handleBlur('name')}
                className={cn(
                  'pl-10 sm:pl-11',
                  'h-10 sm:h-11',
                  'text-sm sm:text-base',
                  'rounded-lg sm:rounded-xl',
                  'border transition-all duration-300',
                  errors.name && touched.name
                    ? 'border-red-400 focus:border-red-500'
                    : isDark
                      ? 'border-white/10 bg-white/5 focus:border-blue-500/50'
                      : 'border-black/10 bg-white focus:border-blue-500/50'
                )}
                disabled={loading}
              />
              {touched.name && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.name ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : name ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : null}
                </div>
              )}
            </div>
            {errors.name && touched.name && (
              <p className="text-[10px] sm:text-xs text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label
              htmlFor="email"
              className={cn(
                'ios-font-medium text-xs sm:text-sm',
                isDark ? 'text-neutral-300' : 'text-neutral-700'
              )}
            >
              Correo electrónico
            </Label>
            <div className="relative">
              <Mail
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2',
                  'w-4 h-4 sm:w-5 sm:h-5',
                  errors.email && touched.email
                    ? 'text-red-400'
                    : isDark
                      ? 'text-neutral-500'
                      : 'text-neutral-400'
                )}
              />
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={cn(
                  'pl-10 sm:pl-11',
                  'h-10 sm:h-11',
                  'text-sm sm:text-base',
                  'rounded-lg sm:rounded-xl',
                  'border transition-all duration-300',
                  errors.email && touched.email
                    ? 'border-red-400 focus:border-red-500'
                    : isDark
                      ? 'border-white/10 bg-white/5 focus:border-blue-500/50'
                      : 'border-black/10 bg-white focus:border-blue-500/50'
                )}
                disabled={loading}
              />
              {touched.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.email ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : email ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : null}
                </div>
              )}
            </div>
            {errors.email && touched.email && (
              <p className="text-[10px] sm:text-xs text-red-400 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label
              htmlFor="password"
              className={cn(
                'ios-font-medium text-xs sm:text-sm',
                isDark ? 'text-neutral-300' : 'text-neutral-700'
              )}
            >
              Contraseña
            </Label>
            <div className="relative">
              <Lock
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2',
                  'w-4 h-4 sm:w-5 sm:h-5',
                  errors.password && touched.password
                    ? 'text-red-400'
                    : isDark
                      ? 'text-neutral-500'
                      : 'text-neutral-400'
                )}
              />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={cn(
                  'pl-10 sm:pl-11',
                  'h-10 sm:h-11',
                  'text-sm sm:text-base',
                  'rounded-lg sm:rounded-xl',
                  'border transition-all duration-300',
                  errors.password && touched.password
                    ? 'border-red-400 focus:border-red-500'
                    : isDark
                      ? 'border-white/10 bg-white/5 focus:border-blue-500/50'
                      : 'border-black/10 bg-white focus:border-blue-500/50'
                )}
                disabled={loading}
              />
              {touched.password && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.password ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : password ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : null}
                </div>
              )}
            </div>
            {errors.password && touched.password && (
              <p className="text-[10px] sm:text-xs text-red-400 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label
              htmlFor="confirmPassword"
              className={cn(
                'ios-font-medium text-xs sm:text-sm',
                isDark ? 'text-neutral-300' : 'text-neutral-700'
              )}
            >
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Lock
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2',
                  'w-4 h-4 sm:w-5 sm:h-5',
                  errors.confirmPassword && touched.confirmPassword
                    ? 'text-red-400'
                    : isDark
                      ? 'text-neutral-500'
                      : 'text-neutral-400'
                )}
              />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={cn(
                  'pl-10 sm:pl-11',
                  'h-10 sm:h-11',
                  'text-sm sm:text-base',
                  'rounded-lg sm:rounded-xl',
                  'border transition-all duration-300',
                  errors.confirmPassword && touched.confirmPassword
                    ? 'border-red-400 focus:border-red-500'
                    : isDark
                      ? 'border-white/10 bg-white/5 focus:border-blue-500/50'
                      : 'border-black/10 bg-white focus:border-blue-500/50'
                )}
                disabled={loading}
              />
              {touched.confirmPassword && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.confirmPassword ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : confirmPassword ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : null}
                </div>
              )}
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="text-[10px] sm:text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <PremiumButtonV2
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={!isFormValid || loading}
              leftIcon={<UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </PremiumButtonV2>
          </div>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p
              className={cn(
                'text-xs sm:text-sm',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className={cn(
                  'font-semibold transition-colors',
                  isDark
                    ? 'text-blue-400 hover:text-blue-300'
                    : 'text-blue-600 hover:text-blue-700'
                )}
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-6 sm:mt-8 text-center">
        <p
          className={cn(
            'text-[10px] sm:text-xs',
            isDark ? 'text-neutral-500' : 'text-neutral-400'
          )}
        >
          © 2025 Certus CONSAR. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}

export default Register
