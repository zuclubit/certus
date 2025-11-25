/**
 * LoadingState Component
 *
 * Loading indicator with progress bar for file parsing
 *
 * @module LoadingState
 */

import type { ParsingProgress } from '@/lib/types/consar-record'
import { Loader2, FileText, CheckCircle2 } from 'lucide-react'

export interface LoadingStateProps {
  progress: ParsingProgress | null
}

export function LoadingState({ progress }: LoadingStateProps) {
  if (!progress) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-400">Cargando archivo...</p>
        </div>
      </div>
    )
  }

  const { phase, percentage, processedLines, totalLines } = progress

  const getPhaseLabel = () => {
    switch (phase) {
      case 'reading':
        return 'Leyendo archivo'
      case 'parsing':
        return 'Parseando registros'
      case 'validating':
        return 'Validando datos'
      case 'complete':
        return 'Completado'
      case 'error':
        return 'Error'
      default:
        return 'Procesando'
    }
  }

  const getPhaseIcon = () => {
    switch (phase) {
      case 'complete':
        return <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      default:
        return <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-full max-w-md space-y-6 p-8">
        {/* Icon */}
        <div className="flex justify-center">{getPhaseIcon()}</div>

        {/* Phase label */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {getPhaseLabel()}
          </h3>
          {phase === 'parsing' && totalLines > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {processedLines.toLocaleString('es-MX')} de {totalLines.toLocaleString('es-MX')}{' '}
              líneas procesadas
            </p>
          )}
        </div>

        {/* Progress bar */}
        {phase !== 'complete' && phase !== 'error' && (
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>{percentage}%</span>
              {progress.estimatedTimeRemaining && (
                <span>
                  ~{Math.ceil(progress.estimatedTimeRemaining / 1000)}s restantes
                </span>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {phase === 'error' && progress.errorMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-900 dark:text-red-100">{progress.errorMessage}</p>
          </div>
        )}

        {/* File icon */}
        {(phase === 'reading' || phase === 'parsing') && (
          <div className="flex justify-center opacity-50">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />
          </div>
        )}
      </div>
    </div>
  )
}

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}
