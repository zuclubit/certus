/**
 * DataViewerHeader Component
 *
 * Responsive header with glassmorphic search, filters, and action buttons
 * Adapts layout from mobile (vertical stack) to desktop (horizontal)
 *
 * @module DataViewerHeader
 */

import { Download, Filter, FileText, FileDown } from 'lucide-react'
import { SearchBar, FilterChip, ActionButton } from '@/components/ui'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { cn } from '@/lib/utils'

export interface DataViewerHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  showErrorsOnly: boolean
  onShowErrorsOnlyChange: (show: boolean) => void
  enableExport?: boolean
  onExport?: (format: 'csv' | 'excel') => void
  onDownloadRaw?: () => void
  onDownloadPDF?: () => void
  isPDFGenerating?: boolean
  totalRecords: number
  filteredRecords: number
  errorCount?: number
}

export function DataViewerHeader({
  searchQuery,
  onSearchChange,
  showErrorsOnly,
  onShowErrorsOnlyChange,
  enableExport = true,
  onExport,
  onDownloadRaw,
  onDownloadPDF,
  isPDFGenerating = false,
  totalRecords,
  filteredRecords,
  errorCount,
}: DataViewerHeaderProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        'sm:gap-4',
        'p-3 xs:p-4 sm:p-5 md:p-6',
        'rounded-[16px] xs:rounded-[18px] sm:rounded-[20px]',
        'glass-premium backdrop-blur-xl',
        'border-2',
        isDark
          ? 'bg-white/5 border-white/10'
          : 'bg-white/60 border-neutral-200',
        'shadow-lg',
        isDark ? 'shadow-black/20' : 'shadow-neutral-900/10'
      )}
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {/* Top Row: Search */}
      <div className="w-full">
        <SearchBar
          value={searchQuery}
          onValueChange={onSearchChange}
          placeholder="Buscar en los datos..."
          size="sm"
          glass
          showCount
          resultCount={filteredRecords}
          totalCount={totalRecords}
        />
      </div>

      {/* Bottom Row: Filters and Actions */}
      <div
        className={cn(
          'flex flex-col gap-2',
          'xxs:gap-2.5',
          'xs:gap-3',
          'sm:gap-4'
        )}
      >
        {/* Filters Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <FilterChip
            label="Solo Errores"
            active={showErrorsOnly}
            onToggle={() => onShowErrorsOnlyChange(!showErrorsOnly)}
            icon={Filter}
            count={errorCount}
            size="sm"
            glass
          />
        </div>

        {/* Actions Row */}
        <div
          className={cn(
            'grid gap-2',
            'grid-cols-2',
            'xxs:grid-cols-2',
            'xs:grid-cols-4',
            'sm:flex sm:flex-wrap sm:justify-end'
          )}
        >
          {/* Download Raw File */}
          {onDownloadRaw && (
            <ActionButton
              label="Archivo Original"
              icon={FileText}
              onClick={onDownloadRaw}
              variant="default"
              size="sm"
              glass
              hideTextOnMobile
              title="Descargar archivo original (formato 77 caracteres)"
              className="w-full sm:w-auto"
            />
          )}

          {/* Download PDF */}
          {onDownloadPDF && (
            <ActionButton
              label={isPDFGenerating ? 'Generando...' : 'Reporte PDF'}
              icon={FileDown}
              onClick={onDownloadPDF}
              variant="default"
              size="sm"
              glass
              loading={isPDFGenerating}
              disabled={isPDFGenerating}
              hideTextOnMobile
              title="Genera un PDF completo con todos los registros parseados y gráficos detallados"
              className="w-full sm:w-auto"
            />
          )}

          {/* Export CSV */}
          {enableExport && onExport && (
            <>
              <ActionButton
                label="CSV"
                icon={Download}
                onClick={() => onExport('csv')}
                variant="secondary"
                size="sm"
                glass
                title="Exportar datos a formato CSV"
                className="w-full sm:w-auto"
              />

              {/* Export Excel */}
              <ActionButton
                label="Excel"
                icon={Download}
                onClick={() => onExport('excel')}
                variant="secondary"
                size="sm"
                glass
                title="Exportar datos a formato Excel"
                className="w-full sm:w-auto"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
