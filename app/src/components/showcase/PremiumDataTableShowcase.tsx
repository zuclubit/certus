/**
 * Premium Data Table Showcase
 *
 * Demo page showing the PremiumDataTable component with sample data
 */

import { PremiumDataTable, type ErrorRecord } from '@/components/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { cn } from '@/lib/utils'

export function PremiumDataTableShowcase() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  // Sample data with various scenarios
  const sampleData: ErrorRecord[] = [
    {
      line: 125,
      tipo: 'APORTACION',
      cuenta: '1234567890123',
      fechaOriginal: '2024-01-15T10:30:00.000Z',
      fechaCorreccion: '2024-01-16T14:25:00.000Z',
      importeOriginal: 15000.50,
      importeCorregido: 15500.75,
      estado: 'corrected',
    },
    {
      line: 342,
      tipo: 'RETIRO',
      cuenta: '9876543210987',
      fechaOriginal: '2024-02-20T08:15:00.000Z',
      fechaCorreccion: null,
      importeOriginal: NaN, // Testing NaN handling
      importeCorregido: null,
      estado: 'error',
    },
    {
      line: 567,
      tipo: 'TRANSFERENCIA',
      cuenta: '4567890123456',
      fechaOriginal: null, // Testing null date
      fechaCorreccion: '2024-03-10T16:40:00.000Z',
      importeOriginal: 25000.00,
      importeCorregido: 25000.00,
      estado: 'warning',
    },
    {
      line: 789,
      tipo: 'APORTACION',
      cuenta: '7890123456789',
      fechaOriginal: '2024-04-05T12:00:00.000Z',
      fechaCorreccion: '2024-04-05T13:30:00.000Z',
      importeOriginal: 8750.25,
      importeCorregido: 8750.25,
      estado: 'success',
    },
    {
      line: 1023,
      tipo: 'DEVOLUCION',
      cuenta: '3216549870321',
      fechaOriginal: '2024-05-12T09:45:00.000Z',
      fechaCorreccion: '2024-05-13T11:20:00.000Z',
      importeOriginal: 12000.00,
      importeCorregido: 12500.50,
      estado: 'corrected',
    },
    {
      line: 1456,
      tipo: 'APORTACION',
      cuenta: '6549873210654',
      fechaOriginal: '2024-06-18T15:30:00.000Z',
      fechaCorreccion: null,
      importeOriginal: 18500.75,
      importeCorregido: null,
      estado: 'error',
    },
    {
      line: 1789,
      tipo: 'RETIRO',
      cuenta: '9873216540987',
      fechaOriginal: '2024-07-22T10:10:00.000Z',
      fechaCorreccion: '2024-07-23T14:50:00.000Z',
      importeOriginal: null, // Testing null amount
      importeCorregido: 5000.00,
      estado: 'warning',
    },
    {
      line: 2134,
      tipo: 'TRANSFERENCIA',
      cuenta: '1472583690147',
      fechaOriginal: '2024-08-30T13:25:00.000Z',
      fechaCorreccion: '2024-08-31T09:15:00.000Z',
      importeOriginal: 32000.00,
      importeCorregido: 32000.00,
      estado: 'corrected',
    },
    {
      line: 2567,
      tipo: 'APORTACION',
      cuenta: '2583691472580',
      fechaOriginal: '2024-09-15T11:40:00.000Z',
      fechaCorreccion: '2024-09-16T08:30:00.000Z',
      importeOriginal: 9500.50,
      importeCorregido: 9600.75,
      estado: 'success',
    },
    {
      line: 2890,
      tipo: 'DEVOLUCION',
      cuenta: '3691472583691',
      fechaOriginal: '2024-10-20T16:20:00.000Z',
      fechaCorreccion: null,
      importeOriginal: 15750.25,
      importeCorregido: null,
      estado: 'error',
    },
  ]

  const emptyData: ErrorRecord[] = []

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1
          className={cn(
            'ios-heading-large ios-font-bold mb-2',
            isDark ? 'text-neutral-100' : 'text-neutral-900'
          )}
        >
          Premium Data Table Showcase
        </h1>
        <p
          className={cn(
            'ios-text-body ios-font-regular',
            isDark ? 'text-neutral-400' : 'text-neutral-600'
          )}
        >
          VisionOS-Enterprise 2026 data table for fintech regulatory platform
        </p>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Component Features</CardTitle>
          <CardDescription>What makes this table premium</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">✓ Design</h3>
              <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
                <li>• Glass container with VisionOS styling</li>
                <li>• Fixed header with sticky positioning</li>
                <li>• Subtle zebra striping for readability</li>
                <li>• Border indicators for row status</li>
                <li>• Hover microinteractions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✓ Data Formatting</h3>
              <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
                <li>• Dates formatted without timezone (DD/MM/YYYY)</li>
                <li>• NaN values show as "Sin dato"</li>
                <li>• Currency formatted with MXN locale</li>
                <li>• Null handling with fallback text</li>
                <li>• Tabular numbers for alignment</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✓ Status Semantics</h3>
              <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
                <li>• Error (red): Records with critical errors</li>
                <li>• Corregido (green): Successfully corrected</li>
                <li>• Advertencia (yellow): Warnings to review</li>
                <li>• Válido (blue): No issues found</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✓ Responsive</h3>
              <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
                <li>• Horizontal scroll for mobile</li>
                <li>• Fixed column widths for stability</li>
                <li>• Max height with vertical scroll</li>
                <li>• Optimized for regulatory auditing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example 1: Table with Data */}
      <div className="space-y-3">
        <div>
          <h2
            className={cn(
              'ios-heading-title2 ios-font-bold mb-1',
              isDark ? 'text-neutral-200' : 'text-neutral-800'
            )}
          >
            Registros con Errores
          </h2>
          <p
            className={cn(
              'ios-text-callout ios-font-regular',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            10 registros encontrados con diversos estados y valores
          </p>
        </div>
        <PremiumDataTable data={sampleData} isDark={isDark} maxHeight="500px" />
      </div>

      {/* Example 2: Empty State */}
      <div className="space-y-3">
        <div>
          <h2
            className={cn(
              'ios-heading-title2 ios-font-bold mb-1',
              isDark ? 'text-neutral-200' : 'text-neutral-800'
            )}
          >
            Estado Vacío
          </h2>
          <p
            className={cn(
              'ios-text-callout ios-font-regular',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            Cómo se ve la tabla cuando no hay datos
          </p>
        </div>
        <PremiumDataTable data={emptyData} isDark={isDark} maxHeight="300px" />
      </div>

      {/* Data Issues Demonstrated */}
      <Card>
        <CardHeader>
          <CardTitle>Data Issues Fixed</CardTitle>
          <CardDescription>How the table handles problematic data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">🗓️ Date Formatting Issues</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500 mb-1">❌ Before (raw):</p>
                  <code className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">
                    2024-01-15T10:30:00.000Z
                  </code>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">✓ After (formatted):</p>
                  <code className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                    15/01/2024
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🔢 NaN Value Issues</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500 mb-1">❌ Before (NaN):</p>
                  <code className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">
                    NaN
                  </code>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">✓ After (handled):</p>
                  <code className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                    Sin dato
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">💰 Currency Formatting</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500 mb-1">❌ Before (raw number):</p>
                  <code className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">
                    15000.5
                  </code>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">✓ After (formatted):</p>
                  <code className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                    $15,000.50
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">❓ Null Value Handling</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500 mb-1">❌ Before (null):</p>
                  <code className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">
                    null
                  </code>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">✓ After (handled):</p>
                  <code className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                    Sin dato
                  </code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
          <CardDescription>How to use the component in your code</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto">
{`import { PremiumDataTable, type ErrorRecord } from '@/components/ui'

const errorRecords: ErrorRecord[] = [
  {
    line: 125,
    tipo: 'APORTACION',
    cuenta: '1234567890123',
    fechaOriginal: '2024-01-15T10:30:00.000Z',
    fechaCorreccion: '2024-01-16T14:25:00.000Z',
    importeOriginal: 15000.50,
    importeCorregido: 15500.75,
    estado: 'corrected',
  },
  // ... more records
]

export function MyComponent() {
  return (
    <PremiumDataTable
      data={errorRecords}
      isDark={true}
      maxHeight="600px"
    />
  )
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
