import { memo } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

/**
 * Footer - Enterprise visionOS 2025
 *
 * Footer minimalista y elegante que se integra con el App Shell:
 * - Posicionado al final del contenido (no sticky)
 * - Diseño glassmorphic consistente
 * - Links accesibles con hover states CSS puros
 * - Responsive: stack en mobile, inline en desktop
 *
 * @architecture Atomic Design - Organism level
 */

interface FooterLinkProps {
  href: string
  children: React.ReactNode
  isDark: boolean
}

const FooterLink = memo(function FooterLink({ href, children, isDark }: FooterLinkProps) {
  return (
    <Link
      to={href}
      className={cn(
        'inline-flex items-center px-3 py-1.5 rounded-xl',
        'text-xs font-medium',
        'transition-all duration-200 ease-out',
        'active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2',
        // Colors & hover
        isDark
          ? 'text-neutral-400 hover:text-blue-400 hover:bg-white/[0.06]'
          : 'text-neutral-500 hover:text-blue-600 hover:bg-black/[0.04]',
        // Border
        isDark
          ? 'border border-white/[0.06] hover:border-white/[0.12]'
          : 'border border-black/[0.04] hover:border-black/[0.08]'
      )}
    >
      {children}
    </Link>
  )
})

export const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear()
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const links = [
    { label: 'Términos', href: '/docs/terminos' },
    { label: 'Privacidad', href: '/docs/privacidad' },
    { label: 'Ayuda', href: '/docs/ayuda' },
  ]

  return (
    <footer
      className={cn(
        // Spacing - floating card effect
        'mx-3 mb-3 mt-auto',
        'lg:mx-4 lg:mb-4',
        'xl:mx-5 xl:mb-5',
        // Rounded corners
        'rounded-2xl lg:rounded-3xl',
        // Transitions
        'transition-all duration-300'
      )}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(20, 20, 28, 0.85) 0%, rgba(16, 16, 24, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 255, 0.85) 100%)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: isDark
          ? '0 -4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 -4px 24px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      }}
      role="contentinfo"
    >
      <div className="px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Copyright */}
          <p
            className={cn(
              'text-xs font-medium text-center sm:text-left',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}
          >
            &copy; {currentYear} Certus CONSAR.{' '}
            <span className="hidden sm:inline">Todos los derechos reservados.</span>
          </p>

          {/* Links */}
          <nav
            className="flex items-center gap-1.5 sm:gap-2"
            aria-label="Enlaces del pie de página"
          >
            {links.map((link) => (
              <FooterLink key={link.href} href={link.href} isDark={isDark}>
                {link.label}
              </FooterLink>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
})
