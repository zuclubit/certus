/**
 * ScrollToTop Component
 *
 * Automatically scrolls to top of the page when the route changes.
 * Uses React Router's useLocation hook to detect navigation changes.
 *
 * Features:
 * - Smooth scroll to top on route change
 * - Works with all navigation methods (Link, navigate, browser back/forward)
 * - Zero UI - pure functionality component
 *
 * @version 1.0.0
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop Hook Component
 *
 * Place this component inside BrowserRouter to enable automatic
 * scroll restoration on route changes.
 *
 * @example
 * ```tsx
 * <BrowserRouter>
 *   <ScrollToTop />
 *   <Routes>...</Routes>
 * </BrowserRouter>
 * ```
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top instantly on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Use 'instant' for immediate scroll, 'smooth' for animated
    })

    // Alternative: If you prefer smooth scroll
    // window.scrollTo({
    //   top: 0,
    //   left: 0,
    //   behavior: 'smooth',
    // })

    // For better browser compatibility, you can also use:
    // document.documentElement.scrollTop = 0
    // document.body.scrollTop = 0
  }, [pathname])

  // This component doesn't render anything
  return null
}
