/**
 * DataViewerFooter Component
 *
 * Footer section with statistics and metadata
 *
 * @module DataViewerFooter
 */

import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react'

export interface DataViewerFooterProps {
  totalRecords: number
  validRecords: number
  invalidRecords: number
  warningRecords: number
  parseTime: number
  filteredRecords: number
}

export function DataViewerFooter({
  totalRecords,
  validRecords,
  invalidRecords,
  warningRecords,
  parseTime,
  filteredRecords,
}: DataViewerFooterProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      {/* Statistics */}
      <div className="flex items-center gap-6 flex-wrap">
        {/* Total */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Total:</span>
          <span className="text-gray-900 dark:text-gray-100 font-semibold tabular-nums">
            {totalRecords.toLocaleString('es-MX')}
          </span>
        </div>

        {/* Valid */}
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-gray-600 dark:text-gray-400 font-medium">Válidos:</span>
          <span className="text-green-700 dark:text-green-300 font-semibold tabular-nums">
            {validRecords.toLocaleString('es-MX')}
          </span>
          <span className="text-gray-500 dark:text-gray-500 text-xs">
            ({((validRecords / totalRecords) * 100).toFixed(1)}%)
          </span>
        </div>

        {/* Errors */}
        {invalidRecords > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">Errores:</span>
            <span className="text-red-700 dark:text-red-300 font-semibold tabular-nums">
              {invalidRecords.toLocaleString('es-MX')}
            </span>
            <span className="text-gray-500 dark:text-gray-500 text-xs">
              ({((invalidRecords / totalRecords) * 100).toFixed(1)}%)
            </span>
          </div>
        )}

        {/* Warnings */}
        {warningRecords > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">Advertencias:</span>
            <span className="text-yellow-700 dark:text-yellow-300 font-semibold tabular-nums">
              {warningRecords.toLocaleString('es-MX')}
            </span>
          </div>
        )}
      </div>

      {/* Parse time */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Clock className="h-4 w-4" />
        <span>
          Procesado en{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
            {(parseTime / 1000).toFixed(2)}s
          </span>
        </span>
      </div>
    </div>
  )
}
