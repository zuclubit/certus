/**
 * ValidationTable Component
 *
 * Advanced table component using TanStack Table
 * Features: sorting, filtering, pagination, row selection
 */

import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  flexRender,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Eye, RotateCcw, Download, Trash2, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type { Validation } from '@/types'
import type { ValidationStatus } from '@/lib/constants'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export interface ValidationTableProps {
  data: Validation[]
  isLoading?: boolean
  onViewDetails?: (validation: Validation) => void
  onRetry?: (validation: Validation) => void
  onDownload?: (validation: Validation) => void
  onDelete?: (validation: Validation) => void
}

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get status badge styles
 */
function getStatusBadge(status: ValidationStatus, isDark: boolean) {
  const configs = {
    success: {
      icon: CheckCircle2,
      label: 'Exitosa',
      gradient: isDark
        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 163, 74, 0.12) 100%)',
      border: isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.3)',
      iconColor: 'text-green-500',
      textColor: isDark ? 'text-green-400' : 'text-green-700',
    },
    error: {
      icon: XCircle,
      label: 'Con errores',
      gradient: isDark
        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.12) 100%)',
      border: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)',
      iconColor: 'text-red-500',
      textColor: isDark ? 'text-red-400' : 'text-red-700',
    },
    warning: {
      icon: AlertCircle,
      label: 'Advertencias',
      gradient: isDark
        ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(202, 138, 4, 0.12) 100%)',
      border: isDark ? 'rgba(234, 179, 8, 0.4)' : 'rgba(234, 179, 8, 0.3)',
      iconColor: 'text-yellow-500',
      textColor: isDark ? 'text-yellow-400' : 'text-yellow-700',
    },
    processing: {
      icon: Clock,
      label: 'Procesando',
      gradient: isDark
        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.12) 100%)',
      border: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
      iconColor: 'text-blue-500',
      textColor: isDark ? 'text-blue-400' : 'text-blue-700',
    },
    pending: {
      icon: Clock,
      label: 'Pendiente',
      gradient: isDark
        ? 'linear-gradient(135deg, rgba(107, 114, 128, 0.2) 0%, rgba(75, 85, 99, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(107, 114, 128, 0.12) 0%, rgba(75, 85, 99, 0.12) 100%)',
      border: isDark ? 'rgba(107, 114, 128, 0.4)' : 'rgba(107, 114, 128, 0.3)',
      iconColor: 'text-gray-500',
      textColor: isDark ? 'text-gray-400' : 'text-gray-700',
    },
  }

  return configs[status] || configs.pending
}

export function ValidationTable({
  data,
  isLoading = false,
  onViewDetails,
  onRetry,
  onDownload,
  onDelete,
}: ValidationTableProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Define columns
  const columns = useMemo<ColumnDef<Validation>[]>(
    () => [
      {
        accessorKey: 'fileName',
        minSize: 250,
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className={cn(
                'flex items-center gap-2 font-bold text-xs uppercase tracking-wider',
                'transition-colors hover:opacity-80',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              Archivo
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          )
        },
        cell: ({ row }) => {
          const fileName = row.getValue('fileName') as string
          const fileType = row.original.fileType
          const fileSize = row.original.fileSize

          return (
            <div className="space-y-1">
              <p
                className={cn(
                  'font-semibold text-sm',
                  isDark ? 'text-neutral-200' : 'text-neutral-800'
                )}
              >
                {fileName}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-[8px] text-xs font-semibold',
                    'glass-ultra-clear'
                  )}
                  style={{
                    background: isDark
                      ? 'rgba(88, 86, 214, 0.15)'
                      : 'rgba(88, 86, 214, 0.1)',
                    color: isDark ? 'rgb(147, 197, 253)' : 'rgb(37, 99, 235)',
                  }}
                >
                  {fileType}
                </span>
                <span
                  className={cn(
                    'text-xs font-medium',
                    isDark ? 'text-neutral-500' : 'text-neutral-500'
                  )}
                >
                  {formatFileSize(fileSize)}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        minSize: 150,
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className={cn(
                'flex items-center gap-2 font-bold text-xs uppercase tracking-wider',
                'transition-colors hover:opacity-80',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              Estado
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          )
        },
        cell: ({ row }) => {
          const status = row.getValue('status') as ValidationStatus
          const config = getStatusBadge(status, isDark)
          const Icon = config.icon
          const progress = row.original.progress

          return (
            <div className="space-y-1.5">
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px]',
                  'glass-ultra-clear depth-layer-1'
                )}
                style={{
                  background: config.gradient,
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${config.border}`,
                }}
              >
                <Icon className={cn('h-4 w-4', config.iconColor)} />
                <span className={cn('text-xs font-bold', config.textColor)}>
                  {config.label}
                </span>
              </div>
              {status === 'processing' && progress !== undefined && (
                <div className="w-full">
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium text-neutral-500 mt-0.5">{progress}%</p>
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'recordCount',
        minSize: 120,
        header: 'Registros',
        cell: ({ row }) => {
          const recordCount = row.getValue('recordCount') as number
          const validRecordCount = row.original.validRecordCount
          const errorCount = row.original.errorCount
          const warningCount = row.original.warningCount

          return (
            <div className="space-y-1">
              <p
                className={cn(
                  'text-sm font-bold',
                  isDark ? 'text-neutral-200' : 'text-neutral-800'
                )}
              >
                {recordCount.toLocaleString()}
              </p>
              {errorCount > 0 && (
                <p className="text-xs font-semibold text-red-500">
                  {errorCount} errores
                </p>
              )}
              {warningCount > 0 && (
                <p className="text-xs font-semibold text-yellow-500">
                  {warningCount} advertencias
                </p>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'uploadedBy',
        minSize: 180,
        header: 'Usuario',
        cell: ({ row }) => {
          const uploadedBy = row.getValue('uploadedBy') as string
          const uploadedAt = row.original.uploadedAt

          return (
            <div className="space-y-1">
              <p
                className={cn(
                  'text-sm font-semibold',
                  isDark ? 'text-neutral-200' : 'text-neutral-800'
                )}
              >
                {uploadedBy}
              </p>
              <p
                className={cn(
                  'text-xs font-medium',
                  isDark ? 'text-neutral-500' : 'text-neutral-500'
                )}
              >
                {formatDistanceToNow(new Date(uploadedAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
          )
        },
      },
      {
        id: 'actions',
        minSize: 180,
        header: 'Acciones',
        cell: ({ row }) => {
          const validation = row.original

          return (
            <div className="flex items-center gap-2">
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(validation)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-[10px]',
                    'glass-ultra-clear transition-all duration-300 hover:scale-110'
                  )}
                  style={{
                    background: isDark
                      ? 'rgba(0, 102, 255, 0.15)'
                      : 'rgba(0, 102, 255, 0.1)',
                  }}
                  title="Ver detalles"
                >
                  <Eye className={cn('h-4 w-4', isDark ? 'text-blue-400' : 'text-blue-600')} />
                </button>
              )}

              {onRetry && (validation.status === 'error' || validation.status === 'warning') && (
                <button
                  onClick={() => onRetry(validation)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-[10px]',
                    'glass-ultra-clear transition-all duration-300 hover:scale-110'
                  )}
                  style={{
                    background: isDark
                      ? 'rgba(234, 179, 8, 0.15)'
                      : 'rgba(234, 179, 8, 0.1)',
                  }}
                  title="Reintentar"
                >
                  <RotateCcw className={cn('h-4 w-4', isDark ? 'text-yellow-400' : 'text-yellow-600')} />
                </button>
              )}

              {onDownload && validation.status === 'success' && (
                <button
                  onClick={() => onDownload(validation)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-[10px]',
                    'glass-ultra-clear transition-all duration-300 hover:scale-110'
                  )}
                  style={{
                    background: isDark
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'rgba(34, 197, 94, 0.1)',
                  }}
                  title="Descargar"
                >
                  <Download className={cn('h-4 w-4', isDark ? 'text-green-400' : 'text-green-600')} />
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(validation)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-[10px]',
                    'glass-ultra-clear transition-all duration-300 hover:scale-110'
                  )}
                  style={{
                    background: isDark
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(239, 68, 68, 0.1)',
                  }}
                  title="Eliminar"
                >
                  <Trash2 className={cn('h-4 w-4', 'text-red-500')} />
                </button>
              )}
            </div>
          )
        },
      },
    ],
    [isDark, onViewDetails, onRetry, onDownload, onDelete]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <p
            className={cn(
              'text-center text-sm font-medium',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            No se encontraron validaciones
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[900px]">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={cn(
                          'px-6 py-4 text-left',
                          isDark
                            ? 'border-b border-neutral-800'
                            : 'border-b border-neutral-200'
                        )}
                        style={{ minWidth: header.column.columnDef.minSize }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'transition-colors',
                      isDark
                        ? 'hover:bg-neutral-800/30 border-b border-neutral-800/50'
                        : 'hover:bg-neutral-50/50 border-b border-neutral-200/50'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4"
                        style={{ minWidth: cell.column.columnDef.minSize }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p
          className={cn(
            'text-sm font-medium',
            isDark ? 'text-neutral-400' : 'text-neutral-600'
          )}
        >
          Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            data.length
          )}{' '}
          de {data.length} validaciones
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
