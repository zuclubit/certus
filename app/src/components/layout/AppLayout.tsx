import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { BottomNav } from './BottomNav'
import { useAppStore, selectTheme } from '@/stores/appStore'

/**
 * AppLayout - Enterprise App Shell 2025
 *
 * Implementa el patrón "App Shell" moderno:
 * - Viewport fijo (h-screen) con overflow controlado
 * - Sidebar fijo en desktop, BottomNav en mobile
 * - Área de contenido scrolleable independiente
 * - Header sticky que flota con el scroll
 *
 * @architecture
 * ┌─────────────────────────────────────────────────┐
 * │ ROOT: h-dvh overflow-hidden                     │
 * ├────────────┬────────────────────────────────────┤
 * │            │ SCROLL CONTAINER: overflow-y-auto  │
 * │  SIDEBAR   │ ┌────────────────────────────────┐ │
 * │  (fixed)   │ │ HEADER: sticky top-0           │ │
 * │            │ ├────────────────────────────────┤ │
 * │            │ │ MAIN: content area             │ │
 * │            │ ├────────────────────────────────┤ │
 * │            │ │ FOOTER: (desktop only)         │ │
 * │            │ └────────────────────────────────┘ │
 * ├────────────┴────────────────────────────────────┤
 * │ BOTTOM NAV: fixed (mobile only)                 │
 * └─────────────────────────────────────────────────┘
 */
export function AppLayout() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      className="flex h-dvh overflow-hidden"
      style={{
        background: isDark ? `
          linear-gradient(
            135deg,
            rgba(15, 15, 20, 1) 0%,
            rgba(20, 20, 25, 1) 50%,
            rgba(15, 15, 20, 1) 100%
          )
        ` : `
          linear-gradient(
            135deg,
            rgba(245, 245, 250, 1) 0%,
            rgba(250, 250, 255, 1) 50%,
            rgba(245, 245, 250, 1) 100%
          )
        `
      }}
    >
      {/* Sidebar - hidden on mobile/tablet, shown on desktop */}
      <Sidebar />

      {/* Scrollable content area */}
      <div
        className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarGutter: 'stable',
        }}
      >
        {/*
         * Inner wrapper with min-h-full ensures:
         * - If content < viewport: footer stays at bottom of viewport
         * - If content > viewport: footer appears after scrolling past content
         */}
        <div className="flex flex-col min-h-full">
          {/* Header - sticky floating card */}
          <Header />

          {/* Page content - grows to fill available space */}
          <main className="flex-1 pb-24 xs:pb-26 sm:pb-28 md:pb-32 lg:pb-6">
            <div className="container mx-auto p-4 sm:p-6">
              <Outlet />
            </div>
          </main>

          {/* Footer - always at the bottom, hidden on mobile */}
          <div className="hidden lg:block shrink-0 mt-auto">
            <Footer />
          </div>
        </div>
      </div>

      {/* Bottom Navigation - only on mobile/tablet */}
      <BottomNav />
    </div>
  )
}
