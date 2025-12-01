/**
 * Generic Data Table - VisionOS Enterprise 2026
 *
 * Standardized, reusable table component using TanStack Table
 * Features: sorting, pagination, loading states, empty states, row selection
 * Follows VisionOS design system with glassmorphism and depth layers
 */

import { useState, type ReactNode } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
  type ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

// ============================================
// TYPES
// ============================================

export interface DataTableProps<TData, TValue> {
  /** Column definitions using TanStack Table ColumnDef */
  columns: ColumnDef<TData, TValue>[]
  /** Data array to display */
  data: TData[]
  /** Loading state */
  isLoading?: boolean
  /** Enable row selection */
  enableRowSelection?: boolean
  /** Enable sorting */
  enableSorting?: boolean
  /** Enable pagination */
  enablePagination?: boolean
  /** Default page size */
  pageSize?: number
  /** Page size options */
  pageSizeOptions?: number[]
  /** Empty state message */
  emptyMessage?: string
  /** Empty state icon */
  emptyIcon?: ReactNode
  /** Minimum table width */
  minWidth?: string
  /** On row selection change */
  onRowSelectionChange?: (selection: RowSelectionState) => void
  /** Additional class names */
  className?: string
  /** Custom loading component */
  loadingComponent?: ReactNode
  /** Server-side pagination total */
  totalItems?: number
  /** Server-side pagination handler */
  onPaginationChange?: (pagination: { page: number; pageSize: number }) => void
  /** Server-side sorting handler */
  onSortingChange?: (sorting: SortingState) => void
  /** Whether pagination is server-side */
  serverSide?: boolean
  /** Current page for server-side pagination (1-indexed) */
  currentPage?: number
  /** Total pages for server-side pagination */
  totalPages?: number
}

export interface SortableHeaderProps {
  column: {
    getIsSorted: () => false | 'asc' | 'desc'
    toggleSorting: (desc?: boolean) => void
  }
  children: ReactNode
  className?: string
}

// ============================================
// HELPER COMPONENTS
// ============================================

/**
 * Sortable column header component
 */
export function SortableHeader({ column, children, className }: SortableHeaderProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className={cn(
        'flex items-center gap-2 font-bold text-xs uppercase tracking-wider',
        'transition-colors hover:opacity-80',
        isDark ? 'text-neutral-400' : 'text-neutral-600',
        className
      )}
    >
      {children}
      {column.getIsSorted() === 'asc' ? (
        <ArrowUp className="h-4 w-4" />
      ) : column.getIsSorted() === 'desc' ? (
        <ArrowDown className="h-4 w-4" />
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      )}
    </button>
  )
}

/**
 * Loading skeleton for table
 */
function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={cn(
                'h-10 rounded-lg flex-1 animate-pulse',
                isDark ? 'bg-neutral-800/50' : 'bg-neutral-200/50'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  enableRowSelection = false,
  enableSorting = true,
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50],
  emptyMessage = 'No se encontraron registros',
  emptyIcon,
  minWidth = '800px',
  onRowSelectionChange,
  className,
  loadingComponent,
  totalItems,
  onPaginationChange,
  onSortingChange,
  serverSide = false,
  currentPage = 1,
  totalPages = 1,
}: DataTableProps<TData, TValue>) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: serverSide ? currentPage - 1 : 0,
    pageSize,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Handle sorting change
  const handleSortingChange = (updater: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updater === 'function' ? updater(sorting) : updater
    setSorting(newSorting)
    if (serverSide && onSortingChange) {
      onSortingChange(newSorting)
    }
  }

  // Handle pagination change
  const handlePaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => {
    const newPagination = typeof updater === 'function' ? updater(pagination) : updater
    setPagination(newPagination)
    if (serverSide && onPaginationChange) {
      onPaginationChange({
        page: newPagination.pageIndex + 1, // Convert to 1-indexed
        pageSize: newPagination.pageSize,
      })
    }
  }

  // Handle row selection change
  const handleRowSelectionChange = (
    updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)
  ) => {
    const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
    setRowSelection(newSelection)
    if (onRowSelectionChange) {
      onRowSelectionChange(newSelection)
    }
  }

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting && !serverSide ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination && !serverSide ? getPaginationRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    onRowSelectionChange: enableRowSelection ? handleRowSelectionChange : undefined,
    onColumnFiltersChange: setColumnFilters,
    enableRowSelection,
    manualPagination: serverSide,
    manualSorting: serverSide,
    pageCount: serverSide ? totalPages : undefined,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
    },
  })

  // Calculate pagination info
  const totalRowCount = serverSide ? (totalItems ?? data.length) : data.length
  const startRow = pagination.pageIndex * pagination.pageSize + 1
  const endRow = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRowCount)
  const currentPageNum = serverSide ? currentPage : pagination.pageIndex + 1
  const totalPagesNum = serverSide ? totalPages : table.getPageCount()

  // Loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }

    return (
      <Card className={className}>
        <CardContent className="p-0">
          <div className="flex items-center justify-center p-8 gap-3">
            <Loader2
              className={cn('h-6 w-6 animate-spin', isDark ? 'text-blue-400' : 'text-blue-600')}
            />
            <span className={cn('text-sm font-medium', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
              Cargando datos...
            </span>
          </div>
          <TableSkeleton columns={Math.min(columns.length, 5)} />
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-3">
            {emptyIcon}
            <p
              className={cn(
                'text-center text-sm font-medium',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              {emptyMessage}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full" style={{ minWidth }}>
              {/* Header */}
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={cn(
                          'px-6 py-4 text-left',
                          isDark ? 'border-b border-neutral-800' : 'border-b border-neutral-200'
                        )}
                        style={{
                          minWidth: header.column.columnDef.minSize,
                          maxWidth: header.column.columnDef.maxSize,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              {/* Body */}
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    className={cn(
                      'transition-colors',
                      isDark
                        ? 'hover:bg-neutral-800/30 border-b border-neutral-800/50'
                        : 'hover:bg-neutral-50/50 border-b border-neutral-200/50',
                      row.getIsSelected() &&
                        (isDark ? 'bg-blue-500/10' : 'bg-blue-50')
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4"
                        style={{
                          minWidth: cell.column.columnDef.minSize,
                          maxWidth: cell.column.columnDef.maxSize,
                        }}
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
      {enablePagination && totalRowCount > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Info */}
          <div className="flex items-center gap-4">
            <p
              className={cn(
                'text-sm font-medium',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              Mostrando {startRow} - {endRow} de {totalRowCount.toLocaleString()} registros
            </p>

            {/* Page size selector */}
            <select
              value={pagination.pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value)
                handlePaginationChange({
                  pageIndex: 0,
                  pageSize: newSize,
                })
              }}
              className={cn(
                'h-9 px-3 rounded-lg text-sm font-medium',
                'border transition-colors cursor-pointer',
                isDark
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:border-neutral-600'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
              )}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} por página
                </option>
              ))}
            </select>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {/* First page */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePaginationChange({ ...pagination, pageIndex: 0 })}
              disabled={currentPageNum <= 1}
              className="h-9 w-9"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePaginationChange({ ...pagination, pageIndex: pagination.pageIndex - 1 })
              }
              disabled={currentPageNum <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            {/* Page indicator */}
            <span
              className={cn(
                'px-4 text-sm font-medium',
                isDark ? 'text-neutral-300' : 'text-neutral-700'
              )}
            >
              Página {currentPageNum} de {totalPagesNum}
            </span>

            {/* Next page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePaginationChange({ ...pagination, pageIndex: pagination.pageIndex + 1 })
              }
              disabled={currentPageNum >= totalPagesNum}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>

            {/* Last page */}
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                handlePaginationChange({ ...pagination, pageIndex: totalPagesNum - 1 })
              }
              disabled={currentPageNum >= totalPagesNum}
              className="h-9 w-9"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Row selection info */}
      {enableRowSelection && Object.keys(rowSelection).length > 0 && (
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700'
          )}
        >
          <span className="text-sm font-medium">
            {Object.keys(rowSelection).length} registro(s) seleccionado(s)
          </span>
        </div>
      )}
    </div>
  )
}

// ============================================
// UTILITY EXPORTS
// ============================================

export { type ColumnDef, type SortingState, type RowSelectionState }
