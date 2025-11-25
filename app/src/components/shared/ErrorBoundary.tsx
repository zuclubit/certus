/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the component tree
 * Logs errors and displays fallback UI
 *
 * @version 1.0.0
 * @compliance React Best Practices 2025
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary Component
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, send to error tracking service
    // Example: Sentry, LogRocket, Application Insights
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo)
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo })

    // For now, just log to console in production
    console.error('[Production Error]', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    })
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  private handleGoHome = (): void => {
    window.location.href = '/'
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <Card className="max-w-2xl w-full p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Error Icon */}
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>

              {/* Error Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Algo salió mal
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Ha ocurrido un error inesperado en la aplicación
                </p>
              </div>

              {/* Error Message */}
              {this.state.error && (
                <div className="w-full bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm font-mono text-red-800 dark:text-red-300 break-words">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              {/* Development Mode: Show Stack Trace */}
              {import.meta.env.DEV && this.state.errorInfo && (
                <details className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Stack Trace (Development Only)
                  </summary>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="primary"
                  size="lg"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Intentar de nuevo
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="secondary"
                  size="lg"
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Ir al inicio
                </Button>

                <Button onClick={this.handleReload} variant="ghost" size="lg">
                  Recargar página
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>
                  Si el problema persiste, contacte al soporte técnico:
                </p>
                <p className="font-semibold">soporte@hergon.com</p>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook-based Error Boundary Wrapper
 * For use in functional components
 */
interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Error
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {error.message}
          </p>
        </div>
        <Button onClick={resetError} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </Button>
      </Card>
    </div>
  )
}

export default ErrorBoundary
