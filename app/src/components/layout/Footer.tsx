import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <footer
      className={cn(
        'sticky bottom-0 z-20',
        // Margins - floating card effect - REDUCED
        'mx-3 mb-2',
        'lg:mx-3 lg:mb-2',
        'xl:mx-4 xl:mb-3',
        '2xl:mx-5 2xl:mb-3',
        // Rounded corners - ultra-refined
        'rounded-[24px]',
        'lg:rounded-[24px]',
        'xl:rounded-[28px]',
        '2xl:rounded-[32px]',
        // visionOS Ultra effects
        'glass-ultra-premium glass-caustics volumetric-light',
        'depth-layer-5 fresnel-edge iridescent-overlay',
        'light-leak-top subsurface-scatter',
        'crystal-overlay prism-effect atmospheric-depth',
        'specular-highlights inner-glow frosted-premium edge-luminance',
        'glass-gpu-accelerated ultra-smooth',
        'animate-[backdrop-blur-in_1s_ease-out]',
        'transition-all duration-500'
      )}
      style={{
        background: isDark ? `
          linear-gradient(
            135deg,
            rgba(20, 20, 25, 0.96) 0%,
            rgba(25, 25, 32, 0.94) 25%,
            rgba(22, 22, 30, 0.93) 50%,
            rgba(25, 25, 32, 0.94) 75%,
            rgba(20, 20, 25, 0.96) 100%
          )
        ` : `
          linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.96) 0%,
            rgba(250, 250, 255, 0.94) 25%,
            rgba(255, 250, 255, 0.93) 50%,
            rgba(250, 255, 255, 0.94) 75%,
            rgba(255, 255, 255, 0.96) 100%
          )
        `,
        backdropFilter: isDark
          ? 'blur(40px) saturate(200%) brightness(1.05) contrast(1.08)'
          : 'blur(40px) saturate(200%) brightness(1.15) contrast(1.05)',
        WebkitBackdropFilter: isDark
          ? 'blur(40px) saturate(200%) brightness(1.05) contrast(1.08)'
          : 'blur(40px) saturate(200%) brightness(1.15) contrast(1.05)',
        border: isDark
          ? '1.5px solid rgba(255, 255, 255, 0.12)'
          : '1.5px solid rgba(255, 255, 255, 0.6)',
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
          inset 0 0 0 1px rgba(255, 255, 255, 0.4),
          inset 0 2px 0 rgba(255, 255, 255, 0.5),
          inset 0 -2px 0 rgba(0, 0, 0, 0.05),
          inset 0 0 60px rgba(135, 206, 250, 0.05)
        `,
      }}
    >
      <div className="px-5 py-2 lg:px-6 lg:py-2.5">
        <div className="flex flex-row items-center justify-between gap-3">
          {/* Left side - Copyright */}
          <div
            className={cn(
              'text-xs font-medium',
              isDark ? 'text-neutral-400' : 'text-neutral-500'
            )}
          >
            <p className="leading-relaxed">
              &copy; {currentYear} Certus.{' '}
              <span className={isDark ? 'text-neutral-500' : 'text-neutral-400'}>
                Todos los derechos reservados.
              </span>
            </p>
          </div>

          {/* Right side - Links */}
          <div className="flex flex-row items-center flex-shrink-0 gap-2 text-xs">
            {['Términos de uso', 'Privacidad', 'Ayuda'].map((label) => {
              const href = label === 'Términos de uso' ? '/docs/terminos'
                : label === 'Privacidad' ? '/docs/privacidad'
                : '/docs/ayuda'

              return (
                <a
                  key={label}
                  href={href}
                  className={cn(
                    'flex items-center font-medium',
                    'px-2 py-1 rounded-[10px]',
                    'glass-ultra-clear depth-layer-2 fresnel-edge',
                    'glass-gpu-accelerated spring-bounce',
                    'active:scale-[0.95]',
                    'transition-all duration-300',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40'
                  )}
                  style={{
                    color: isDark ? 'rgb(212, 212, 216)' : 'rgb(82, 82, 91)',
                    background: isDark ? `
                      linear-gradient(
                        135deg,
                        rgba(45, 45, 55, 0.5) 0%,
                        rgba(40, 40, 50, 0.45) 50%,
                        rgba(45, 45, 55, 0.4) 100%
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
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: isDark ? `
                      0 2px 8px rgba(0, 0, 0, 0.2),
                      0 1px 4px rgba(0, 0, 0, 0.15),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.05),
                      inset 0 1px 0 rgba(255, 255, 255, 0.08)
                    ` : `
                      0 2px 8px rgba(0, 0, 0, 0.04),
                      0 1px 4px rgba(0, 0, 0, 0.03),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4)
                    `,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? `
                      linear-gradient(
                        135deg,
                        rgba(55, 55, 65, 0.65) 0%,
                        rgba(50, 50, 60, 0.6) 50%,
                        rgba(55, 55, 65, 0.58) 100%
                      )
                    ` : `
                      linear-gradient(
                        135deg,
                        rgba(245, 248, 255, 0.7) 0%,
                        rgba(248, 248, 255, 0.65) 50%,
                        rgba(245, 250, 255, 0.6) 100%
                      )
                    `
                    e.currentTarget.style.color = isDark ? 'rgb(96, 165, 250)' : 'rgb(37, 99, 235)'
                    e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)'
                    e.currentTarget.style.boxShadow = isDark ? `
                      0 4px 12px rgba(0, 0, 0, 0.3),
                      0 2px 6px rgba(0, 0, 0, 0.2),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.1),
                      inset 0 1px 0 rgba(255, 255, 255, 0.12)
                    ` : `
                      0 4px 12px rgba(0, 0, 0, 0.06),
                      0 2px 6px rgba(0, 0, 0, 0.04),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.4),
                      inset 0 1px 0 rgba(255, 255, 255, 0.5)
                    `
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDark ? `
                      linear-gradient(
                        135deg,
                        rgba(45, 45, 55, 0.5) 0%,
                        rgba(40, 40, 50, 0.45) 50%,
                        rgba(45, 45, 55, 0.4) 100%
                      )
                    ` : `
                      linear-gradient(
                        135deg,
                        rgba(255, 255, 255, 0.5) 0%,
                        rgba(250, 250, 255, 0.45) 50%,
                        rgba(255, 255, 255, 0.4) 100%
                      )
                    `
                    e.currentTarget.style.color = isDark ? 'rgb(212, 212, 216)' : 'rgb(82, 82, 91)'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = isDark ? `
                      0 2px 8px rgba(0, 0, 0, 0.2),
                      0 1px 4px rgba(0, 0, 0, 0.15),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.05),
                      inset 0 1px 0 rgba(255, 255, 255, 0.08)
                    ` : `
                      0 2px 8px rgba(0, 0, 0, 0.04),
                      0 1px 4px rgba(0, 0, 0, 0.03),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4)
                    `
                  }}
                >
                  {label}
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
