import { Settings as SettingsIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

export function Settings() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div className="space-y-6">
      <div>
        <h1
          className={cn(
            // iOS 2025 Typography - Title 1 with glass effect
            'ios-heading-title1 ios-text-glass-subtle flex items-center gap-2',
            isDark ? 'text-neutral-100' : 'text-neutral-900'
          )}
          data-text="Configuración"
        >
          <SettingsIcon className="h-8 w-8 text-primary-600" />
          Configuración
        </h1>
        <p className={cn(
          // iOS 2025 Typography - Callout
          'mt-2 ios-text-callout',
          isDark ? 'text-neutral-400' : 'text-neutral-600'
        )}>
          Configuración del sistema y preferencias
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración del Sistema</CardTitle>
          <CardDescription>
            Ajustes y preferencias de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn(
            'text-center py-12',
            isDark ? 'text-neutral-500' : 'text-neutral-500'
          )}>
            <SettingsIcon className={cn(
              'h-12 w-12 mx-auto mb-4',
              isDark ? 'text-neutral-600' : 'text-neutral-300'
            )} />
            <p className="ios-text-callout">El módulo de configuración estará disponible próximamente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
