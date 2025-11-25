import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-base font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 disabled:pointer-events-none disabled:opacity-50 glass-gpu-accelerated spring-bounce active:scale-[0.95]',
  {
    variants: {
      variant: {
        primary: '',
        secondary: '',
        danger: '',
        ghost: '',
        link: 'underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-[14px]',
        md: 'h-11 px-6 rounded-[16px]',
        lg: 'h-12 px-8 text-lg rounded-[18px]',
        icon: 'h-10 w-10 rounded-[14px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Show loading spinner and disable button */
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, isLoading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const theme = useAppStore(selectTheme)
    const isDark = theme === 'dark'
    const [isHovered, setIsHovered] = React.useState(false)

    // Define styles for each variant
    const getVariantStyle = () => {
      switch (variant) {
        case 'primary':
          return {
            background: isHovered ? `
              linear-gradient(
                135deg,
                #0052CC 0%,
                #4845B8 25%,
                #6B2FCC 50%,
                #9842C0 75%,
                #0052CC 100%
              )
            ` : `
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
            animation: 'mesh-flow 10s ease-in-out infinite, gradient-flow-active 10s ease-in-out infinite',
            color: 'white',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            // iOS 2025 Liquid Glass shadows - Optimized to 4 layers (.regular material)
            boxShadow: isHovered ? `
              0 4px 16px rgba(88, 86, 214, 0.4),
              0 12px 32px rgba(0, 102, 255, 0.35),
              inset 0 1px 0 rgba(255, 255, 255, 0.6),
              inset 0 -1px 2px rgba(0, 0, 0, 0.2)
            ` : `
              0 2px 8px rgba(88, 86, 214, 0.3),
              0 8px 24px rgba(0, 102, 255, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.5),
              inset 0 -1px 2px rgba(0, 0, 0, 0.15)
            `,
          }

        case 'secondary':
          return {
            background: isHovered
              ? isDark ? `
                  linear-gradient(
                    135deg,
                    rgba(55, 55, 65, 0.75) 0%,
                    rgba(50, 50, 60, 0.72) 50%,
                    rgba(55, 55, 65, 0.70) 100%
                  )
                ` : `
                  linear-gradient(
                    135deg,
                    rgba(245, 248, 255, 0.85) 0%,
                    rgba(248, 248, 255, 0.82) 50%,
                    rgba(245, 250, 255, 0.80) 100%
                  )
                `
              : isDark ? `
                  linear-gradient(
                    135deg,
                    rgba(45, 45, 55, 0.65) 0%,
                    rgba(40, 40, 50, 0.60) 50%,
                    rgba(45, 45, 55, 0.58) 100%
                  )
                ` : `
                  linear-gradient(
                    135deg,
                    rgba(255, 255, 255, 0.75) 0%,
                    rgba(250, 250, 255, 0.70) 50%,
                    rgba(255, 255, 255, 0.68) 100%
                  )
                `,
            backdropFilter: 'blur(16px) saturate(180%) brightness(1.02)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%) brightness(1.02)',
            color: isDark ? 'rgb(212, 212, 216)' : 'rgb(82, 82, 91)',
            border: isDark
              ? '1.5px solid rgba(255, 255, 255, 0.12)'
              : '1.5px solid rgba(255, 255, 255, 0.6)',
            boxShadow: isHovered
              ? isDark ? `
                  0 4px 18px rgba(0, 0, 0, 0.35),
                  0 2px 10px rgba(0, 0, 0, 0.25),
                  inset 0 0 0 1px rgba(255, 255, 255, 0.12),
                  inset 0 2px 0 rgba(255, 255, 255, 0.15)
                ` : `
                  0 4px 18px rgba(0, 0, 0, 0.08),
                  0 2px 10px rgba(0, 0, 0, 0.05),
                  inset 0 0 0 1px rgba(255, 255, 255, 0.45),
                  inset 0 2px 0 rgba(255, 255, 255, 0.65)
                `
              : isDark ? `
                  0 3px 16px rgba(0, 0, 0, 0.3),
                  0 2px 8px rgba(0, 0, 0, 0.2),
                  inset 0 0 0 1px rgba(255, 255, 255, 0.08),
                  inset 0 2px 0 rgba(255, 255, 255, 0.12)
                ` : `
                  0 3px 16px rgba(0, 0, 0, 0.06),
                  0 2px 8px rgba(0, 0, 0, 0.04),
                  inset 0 0 0 1px rgba(255, 255, 255, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.6)
                `,
          }

        case 'danger':
          return {
            background: isHovered ? `
              linear-gradient(
                135deg,
                #DC1C1C 0%,
                #CC0052 50%,
                #DC1C1C 100%
              )
            ` : `
              linear-gradient(
                135deg,
                #EF4444 0%,
                #DC2626 50%,
                #EF4444 100%
              )
            `,
            backgroundSize: '200% 200%',
            color: 'white',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            // iOS 2025 Liquid Glass shadows - Optimized to 4 layers
            boxShadow: isHovered ? `
              0 4px 16px rgba(239, 68, 68, 0.4),
              0 12px 32px rgba(220, 38, 38, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.6),
              inset 0 -1px 2px rgba(0, 0, 0, 0.2)
            ` : `
              0 2px 8px rgba(239, 68, 68, 0.3),
              0 8px 24px rgba(220, 38, 38, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.5),
              inset 0 -1px 2px rgba(0, 0, 0, 0.15)
            `,
          }

        case 'ghost':
          return {
            background: isHovered
              ? isDark ? 'rgba(55, 55, 65, 0.4)' : 'rgba(245, 245, 250, 0.6)'
              : 'transparent',
            color: isDark ? 'rgb(212, 212, 216)' : 'rgb(82, 82, 91)',
          }

        default:
          return {}
      }
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={{
          ...getVariantStyle(),
          ...style,
        }}
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
