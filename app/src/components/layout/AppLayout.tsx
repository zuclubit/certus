import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { BottomNav } from './BottomNav'
import { useAppStore, selectTheme } from '@/stores/appStore'

export function AppLayout() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      className="flex min-h-screen"
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

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Header - scrolls with content */}
        <Header />

        {/* Page content with bottom padding for BottomNav on mobile */}
        <main className="flex-1 pb-24 xs:pb-26 sm:pb-28 md:pb-32 lg:pb-6">
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>

        {/* Footer - hidden on mobile when BottomNav is present */}
        <div className="hidden lg:block">
          <Footer />
        </div>
      </div>

      {/* Bottom Navigation - only on mobile/tablet */}
      <BottomNav />
    </div>
  )
}
