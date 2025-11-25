/**
 * VersionChain Component
 *
 * Visualiza la cadena completa de versiones de un archivo
 * Muestra timeline de original → sustitutos
 */

import { FileText, ArrowRight, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Validation } from '@/types'

export interface VersionChainProps {
  versions: Validation[]
  currentVersionId: string
  onVersionClick: (validation: Validation) => void
  isDark?: boolean
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'success':
      return {
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/30',
        border: 'border-green-300 dark:border-green-700',
        label: 'Validado',
      }
    case 'error':
      return {
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/30',
        border: 'border-red-300 dark:border-red-700',
        label: 'Con Errores',
      }
    case 'warning':
      return {
        icon: AlertCircle,
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        border: 'border-yellow-300 dark:border-yellow-700',
        label: 'Con Advertencias',
      }
    case 'processing':
      return {
        icon: Clock,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-300 dark:border-blue-700',
        label: 'Procesando',
      }
    default:
      return {
        icon: FileText,
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        border: 'border-gray-300 dark:border-gray-700',
        label: 'Pendiente',
      }
  }
}

export function VersionChain({
  versions,
  currentVersionId,
  onVersionClick,
  isDark = false,
}: VersionChainProps) {
  if (versions.length === 0) {
    return null
  }

  // Sort by version number
  const sortedVersions = [...versions].sort((a, b) => (a.version || 1) - (b.version || 1))

  return (
    <Card className={cn('glass-ultra-premium', isDark && 'dark')}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Historial de Versiones
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {sortedVersions.length} {sortedVersions.length === 1 ? 'versión' : 'versiones'} •
              Conforme a Circular CONSAR 19-8
            </p>
          </div>
        </div>

        {/* Version Timeline */}
        <div className="space-y-4">
          {sortedVersions.map((version, index) => {
            const isActive = version.id === currentVersionId
            const isSuperseded = version.supersededAt
            const statusConfig = getStatusConfig(version.status)
            const StatusIcon = statusConfig.icon

            const showArrow = index < sortedVersions.length - 1

            return (
              <div key={version.id}>
                <div
                  className={cn(
                    'relative p-4 rounded-lg border-2 transition-all cursor-pointer',
                    isActive
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : isSuperseded
                      ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 opacity-60'
                      : statusConfig.border + ' ' + statusConfig.bg
                  )}
                  onClick={() => onVersionClick(version)}
                >
                  {/* Version Badge */}
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-white dark:bg-gray-800 border-2 border-current rounded-full">
                    <span
                      className={cn(
                        'text-sm font-bold',
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : isSuperseded
                          ? 'text-gray-500 dark:text-gray-500'
                          : statusConfig.color
                      )}
                    >
                      v{version.version || 1}
                    </span>
                  </div>

                  <div className="flex items-start gap-4 mt-2">
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                        statusConfig.bg
                      )}
                    >
                      <StatusIcon className={cn('h-5 w-5', statusConfig.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {version.isOriginal ? 'Archivo Original' : 'Versión Corregida'}
                            </h4>
                            {isSuperseded && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                Sustituido
                              </span>
                            )}
                            {isActive && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded">
                                Actual
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {version.fileName}
                          </p>

                          {version.substitutionReason && (
                            <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Razón de corrección:
                              </p>
                              <p className="text-sm text-gray-800 dark:text-gray-200">
                                {version.substitutionReason}
                              </p>
                            </div>
                          )}

                          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
                            <div>
                              <span className="font-medium">Estado:</span>{' '}
                              <span className={statusConfig.color}>{statusConfig.label}</span>
                            </div>
                            <div>
                              <span className="font-medium">Errores:</span> {version.errorCount}
                            </div>
                            <div>
                              <span className="font-medium">Advertencias:</span>{' '}
                              {version.warningCount}
                            </div>
                            <div>
                              <span className="font-medium">Subido:</span>{' '}
                              {formatDistanceToNow(new Date(version.uploadedAt), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </div>
                          </div>

                          {version.consarDirectory && (
                            <div className="mt-2">
                              <span
                                className={cn(
                                  'inline-flex items-center px-2 py-1 text-xs font-medium rounded',
                                  version.consarDirectory === 'RECEPCION'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                )}
                              >
                                Directorio: {version.consarDirectory}
                              </span>
                              {version.requiresAuthorization && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                  Requiere autorización
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {!isActive && (
                          <Button variant="ghost" size="sm" onClick={() => onVersionClick(version)}>
                            Ver
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow between versions */}
                {showArrow && (
                  <div className="flex justify-center py-2">
                    <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
