/**
 * App Component - Enhanced Version
 *
 * Main application component with:
 * - Global Error Boundary
 * - Code Splitting (lazy loading)
 * - Security monitoring
 * - Performance optimization
 *
 * @version 2.0.0
 * @compliance Security Best Practices 2025
 */

import { lazy, Suspense, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import { useTheme } from '@/hooks/useTheme'

// ============================================================================
// LAZY LOADED PAGES (Code Splitting)
// ============================================================================

// Main pages
const Dashboard = lazy(() => import('@/pages/Dashboard.enterprise').then(module => ({ default: module.DashboardEnterprise })))
const Validations = lazy(() => import('@/pages/Validations').then(module => ({ default: module.Validations })))
const ValidationDetail = lazy(() => import('@/pages/ValidationDetail').then(module => ({ default: module.ValidationDetail })))
const Users = lazy(() => import('@/pages/Users.visionos').then(module => ({ default: module.UsersVisionOS })))
const Settings = lazy(() => import('@/pages/Settings').then(module => ({ default: module.Settings })))
const Login = lazy(() => import('@/pages/Login').then(module => ({ default: module.Login })))
const Register = lazy(() => import('@/pages/Register').then(module => ({ default: module.Register })))

// VisionOS Enhanced Modules (2025-2026)
const CatalogsVisionOS = lazy(() => import('@/pages/Catalogs.visionos').then(module => ({ default: module.CatalogsVisionOS })))
const ReportsVisionOS = lazy(() => import('@/pages/Reports.visionos').then(module => ({ default: module.ReportsVisionOS })))

// Catalogs sub-modules
const CatalogsList = lazy(() => import('@/pages/catalogs/CatalogsList').then(module => ({ default: module.CatalogsList })))
const CatalogsImport = lazy(() => import('@/pages/catalogs/CatalogsImport').then(module => ({ default: module.CatalogsImport })))
const CatalogsExport = lazy(() => import('@/pages/catalogs/CatalogsExport').then(module => ({ default: module.CatalogsExport })))
const CatalogsConfig = lazy(() => import('@/pages/catalogs/CatalogsConfig').then(module => ({ default: module.CatalogsConfig })))

// Normative module
const NormativeChanges = lazy(() => import('@/pages/normative/NormativeChanges').then(module => ({ default: module.NormativeChanges })))

// Admin module
const ValidationFlows = lazy(() => import('@/pages/admin/ValidationFlows').then(module => ({ default: module.ValidationFlows })))

// Approval Workflow module (VisionOS 2026)
const ApprovalsListVisionOS = lazy(() => import('@/pages/approvals/ApprovalsList.visionos').then(module => ({ default: module.ApprovalsListVisionOS })))
const ApprovalsList = lazy(() => import('@/pages/approvals/ApprovalsList'))
const ApprovalDetail = lazy(() => import('@/pages/approvals/ApprovalDetail'))

// Validators module
const ValidatorsList = lazy(() => import('@/pages/validators/ValidatorsList'))
const ValidatorDetail = lazy(() => import('@/pages/validators/ValidatorDetail'))

// Tenants/AFORE Management module (SystemAdmin only)
const TenantsList = lazy(() => import('@/pages/tenants/TenantsList').then(module => ({ default: module.TenantsList })))
const TenantDetail = lazy(() => import('@/pages/tenants/TenantDetail').then(module => ({ default: module.TenantDetail })))

// Scrapers module (SystemAdmin only)
const ScrapersList = lazy(() => import('@/pages/scrapers/ScrapersList').then(module => ({ default: module.ScrapersList })))

// Compliance Portal module (2025-2026)
const ComplianceDashboard = lazy(() => import('@/pages/compliance/ComplianceDashboard').then(module => ({ default: module.ComplianceDashboard })))
const ComplianceFrameworks = lazy(() => import('@/pages/compliance/ComplianceFrameworks').then(module => ({ default: module.ComplianceFrameworks })))
const ComplianceControls = lazy(() => import('@/pages/compliance/ComplianceControls').then(module => ({ default: module.ComplianceControls })))
const ComplianceEvidence = lazy(() => import('@/pages/compliance/ComplianceEvidence').then(module => ({ default: module.ComplianceEvidence })))
const ComplianceRisks = lazy(() => import('@/pages/compliance/ComplianceRisks').then(module => ({ default: module.ComplianceRisks })))
const ComplianceAudits = lazy(() => import('@/pages/compliance/ComplianceAudits').then(module => ({ default: module.ComplianceAudits })))

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
})

// ============================================================================
// ERROR HANDLER
// ============================================================================

const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Global Error Boundary caught:', error, errorInfo)
  }

  // TODO: In production, send to monitoring service
  // Example: Azure Application Insights, Sentry, LogRocket
  if (import.meta.env.PROD) {
    // Send to monitoring service
    // trackError(error, {
    //   componentStack: errorInfo.componentStack,
    //   timestamp: new Date().toISOString(),
    //   userAgent: navigator.userAgent,
    //   url: window.location.href,
    // })
  }
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function AppContent() {
  // Apply theme class to HTML root
  useTheme()

  // Security: Log console warnings in production
  useEffect(() => {
    if (import.meta.env.PROD) {
      // Disable console in production for security
      console.log = () => {}
      console.debug = () => {}
      console.info = () => {}
      // Keep console.error and console.warn for critical issues
    }
  }, [])

  // Performance: Preload critical routes
  useEffect(() => {
    // Preload Dashboard (most common initial route)
    const timer = setTimeout(() => {
      import('@/pages/Dashboard.enterprise')
      import('@/pages/Validations')
    }, 2000) // Preload after 2 seconds

    return () => clearTimeout(timer)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Automatically scroll to top on route change */}
        <ScrollToTop />
        <Suspense fallback={<LoadingScreen message="Cargando aplicación" />}>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <Suspense fallback={<LoadingScreen message="Cargando inicio de sesión" />}>
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <Suspense fallback={<LoadingScreen message="Cargando registro" />}>
                  <Register />
                </Suspense>
              }
            />

            {/* Protected routes with layout */}
            <Route
              element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route
                path="/"
                element={
                  <Suspense fallback={<LoadingScreen message="Cargando dashboard" fullScreen={false} />}>
                    <Dashboard />
                  </Suspense>
                }
              />

              {/* Validations Routes */}
              <Route
                path="/validations"
                element={
                  <AuthGuard requiredPermission="validations">
                    <Suspense fallback={<LoadingScreen message="Cargando validaciones" fullScreen={false} />}>
                      <Validations />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/validations/:id"
                element={
                  <AuthGuard requiredPermission="validations">
                    <Suspense fallback={<LoadingScreen message="Cargando detalle de validación" fullScreen={false} />}>
                      <ValidationDetail />
                    </Suspense>
                  </AuthGuard>
                }
              />

              {/* Reports Routes */}
              <Route
                path="/reports"
                element={
                  <AuthGuard requiredPermission="reports">
                    <Suspense fallback={<LoadingScreen message="Cargando reportes" fullScreen={false} />}>
                      <ReportsVisionOS />
                    </Suspense>
                  </AuthGuard>
                }
              />

              {/* Catalogs Routes */}
              <Route
                path="/catalogs"
                element={
                  <AuthGuard requiredPermission="catalogs">
                    <Suspense fallback={<LoadingScreen message="Cargando catálogos" fullScreen={false} />}>
                      <CatalogsVisionOS />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/catalogs/list"
                element={
                  <AuthGuard requiredPermission="catalogs">
                    <Suspense fallback={<LoadingScreen message="Cargando lista de catálogos" fullScreen={false} />}>
                      <CatalogsList />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/catalogs/import"
                element={
                  <AuthGuard requiredPermission="catalogs">
                    <Suspense fallback={<LoadingScreen message="Cargando importación" fullScreen={false} />}>
                      <CatalogsImport />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/catalogs/export"
                element={
                  <AuthGuard requiredPermission="catalogs">
                    <Suspense fallback={<LoadingScreen message="Cargando exportación" fullScreen={false} />}>
                      <CatalogsExport />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/catalogs/config"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando configuración" fullScreen={false} />}>
                      <CatalogsConfig />
                    </Suspense>
                  </AuthGuard>
                }
              />

              {/* Normative Routes */}
              <Route
                path="/normative"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando normativa" fullScreen={false} />}>
                      <NormativeChanges />
                    </Suspense>
                  </AuthGuard>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/flows"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando flujos de validación" fullScreen={false} />}>
                      <ValidationFlows />
                    </Suspense>
                  </AuthGuard>
                }
              />

              {/* Users Routes */}
              <Route
                path="/users"
                element={
                  <AuthGuard requiredPermission="users">
                    <Suspense fallback={<LoadingScreen message="Cargando usuarios" fullScreen={false} />}>
                      <Users />
                    </Suspense>
                  </AuthGuard>
                }
              />

              {/* Approvals Routes */}
              <Route
                path="/approvals"
                element={
                  <AuthGuard requiredPermission="validations">
                    <Suspense fallback={<LoadingScreen message="Cargando aprobaciones" fullScreen={false} />}>
                      <ApprovalsListVisionOS />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/approvals/legacy"
                element={
                  <AuthGuard requiredPermission="validations">
                    <Suspense fallback={<LoadingScreen message="Cargando aprobaciones (versión legacy)" fullScreen={false} />}>
                      <ApprovalsList />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/approvals/:id"
                element={
                  <AuthGuard requiredPermission="validations">
                    <Suspense fallback={<LoadingScreen message="Cargando detalle de aprobación" fullScreen={false} />}>
                      <ApprovalDetail />
                    </Suspense>
                  </AuthGuard>
                }
              />

              {/* Validators Routes */}
              <Route
                path="/validators"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando validadores" fullScreen={false} />}>
                      <ValidatorsList />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/validators/:id"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando detalle de validador" fullScreen={false} />}>
                      <ValidatorDetail />
                    </Suspense>
                  </AuthGuard>
                }
              />

              {/* Settings Routes */}
              <Route
                path="/settings"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando configuración" fullScreen={false} />}>
                      <Settings />
                    </Suspense>
                  </AuthGuard>
                }
              />

              {/* Tenants/AFORE Management Routes (SystemAdmin only) */}
              <Route
                path="/tenants"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando AFOREs" fullScreen={false} />}>
                      <TenantsList />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/tenants/:id"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando detalle de AFORE" fullScreen={false} />}>
                      <TenantDetail />
                    </Suspense>
                  </AuthGuard>
                }
              />

              {/* Scrapers Management Routes (SystemAdmin only) */}
              <Route
                path="/scrapers"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando scrapers" fullScreen={false} />}>
                      <ScrapersList />
                    </Suspense>
                  </AuthGuard>
                }
              />

              {/* Compliance Portal Routes */}
              <Route
                path="/compliance"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando portal de cumplimiento" fullScreen={false} />}>
                      <ComplianceDashboard />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/compliance/frameworks"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando frameworks" fullScreen={false} />}>
                      <ComplianceFrameworks />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/compliance/controls"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando controles" fullScreen={false} />}>
                      <ComplianceControls />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/compliance/evidence"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando evidencias" fullScreen={false} />}>
                      <ComplianceEvidence />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/compliance/risks"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando riesgos" fullScreen={false} />}>
                      <ComplianceRisks />
                    </Suspense>
                  </AuthGuard>
                }
              />
              <Route
                path="/compliance/audits"
                element={
                  <AuthGuard requiredPermission="settings">
                    <Suspense fallback={<LoadingScreen message="Cargando auditorías" fullScreen={false} />}>
                      <ComplianceAudits />
                    </Suspense>
                  </AuthGuard>
                }
              />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      {/* Global Components */}
      <Toaster />

      {/* React Query Devtools (only in development) */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

// ============================================================================
// EXPORT WITH ERROR BOUNDARY
// ============================================================================

function App() {
  return (
    <ErrorBoundary onError={handleGlobalError}>
      <AppContent />
    </ErrorBoundary>
  )
}

export default App
