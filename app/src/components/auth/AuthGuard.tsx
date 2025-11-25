import { Navigate, useLocation } from 'react-router-dom'
import { useAppStore, selectIsAuthenticated, selectUser } from '@/stores/appStore'
import { PERMISSIONS, type UserRole } from '@/lib/constants'

interface AuthGuardProps {
  children: React.ReactNode
  requiredPermission?: string
  requiredAction?: 'create' | 'read' | 'update' | 'delete' | 'download'
}

export function AuthGuard({
  children,
  requiredPermission,
  requiredAction = 'read',
}: AuthGuardProps) {
  const location = useLocation()
  const isAuthenticated = useAppStore(selectIsAuthenticated)
  const user = useAppStore(selectUser)

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If no specific permission required, just check authentication
  if (!requiredPermission) {
    return <>{children}</>
  }

  // Check if user has the required permission
  if (user) {
    const userPermissions = PERMISSIONS[user.role as UserRole]

    if (
      requiredPermission in userPermissions &&
      (userPermissions as any)[requiredPermission].includes(requiredAction)
    ) {
      return <>{children}</>
    }
  }

  // If user doesn't have permission, show unauthorized page
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-neutral-300">403</h1>
        <h2 className="mt-4 text-2xl font-semibold text-neutral-700">
          Acceso Denegado
        </h2>
        <p className="mt-2 text-neutral-500">
          No tienes permiso para acceder a esta página.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 rounded-lg bg-primary-500 px-6 py-2 text-white hover:bg-primary-600 transition-colors"
        >
          Volver
        </button>
      </div>
    </div>
  )
}
