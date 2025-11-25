/**
 * LoadingScreen Component
 *
 * Full-screen loading indicator for route transitions
 * Uses Lottie animation with fallback spinner
 *
 * @version 1.0.0
 */

import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { LottieIcon } from '@/components/ui/LottieIcon'
import { getAnimation } from '@/lib/lottiePreloader'

export interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingScreen({
  message = 'Cargando...',
  fullScreen = true,
}: LoadingScreenProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const loadingAnimation = getAnimation('loading')

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullScreen && 'min-h-screen',
        !fullScreen && 'min-h-[400px]'
      )}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 100%)'
          : 'linear-gradient(135deg, rgba(249, 250, 251, 1) 0%, rgba(243, 244, 246, 1) 100%)',
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center space-y-6 p-8">
        {/* Loading Animation */}
        <div className="flex justify-center">
          {loadingAnimation ? (
            <div className="w-32 h-32">
              <LottieIcon
                animationData={loadingAnimation}
                loop
                autoplay
                speed={1}
                className="w-full h-full"
              />
            </div>
          ) : (
            // Fallback spinner
            <div
              className="w-16 h-16 border-4 rounded-full animate-spin"
              style={{
                borderColor: isDark
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'rgba(59, 130, 246, 0.15)',
                borderTopColor: isDark
                  ? 'rgb(59, 130, 246)'
                  : 'rgb(37, 99, 235)',
              }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p
            className={cn(
              'text-lg font-semibold',
              isDark ? 'text-gray-100' : 'text-gray-900'
            )}
          >
            {message}
          </p>
          <p
            className={cn(
              'text-sm font-medium',
              isDark ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            Por favor espera un momento
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: isDark
                  ? 'rgb(59, 130, 246)'
                  : 'rgb(37, 99, 235)',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Screen Reader Text */}
      <span className="sr-only">{message}. Por favor espere.</span>
    </div>
  )
}

export default LoadingScreen
