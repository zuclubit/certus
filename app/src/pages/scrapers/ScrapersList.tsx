/**
 * Scrapers List Page - VisionOS Enhanced
 *
 * Management interface for normative web scrapers
 * Monitors sources, executions, and scraped documents
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Globe,
  Play,
  Pause,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Loader2,
  Plus,
  ExternalLink,
  Trash2,
  Database,
  Search,
  Filter,
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { useToast } from '@/hooks/use-toast'
import { ScraperService } from '@/lib/services/api/scraper.service'
import { ExecutionMonitor } from '@/components/scrapers/ExecutionMonitor'
import type {
  ScraperSource,
  ScraperExecution,
  ScraperSourceType,
  ScraperFrequency,
  CreateScraperSourceRequest,
  SeedSourcesJobResponse,
} from '@/lib/services/api/scraper.service'

// Category filter options
const CATEGORY_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'Core', label: 'Core CONSAR' },
  { value: 'Regulatorio', label: 'Regulatorios' },
  { value: 'PLD', label: 'PLD' },
  { value: 'Técnico', label: 'Técnicos' },
  { value: 'Mercado', label: 'Mercados' },
  { value: 'Infraestructura', label: 'Infraestructura' },
  { value: 'Complementario', label: 'Complementarios' },
] as const

// ============================================
// HELPER COMPONENTS
// ============================================

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    // Execution statuses
    Pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
    Running: { color: 'bg-blue-100 text-blue-800', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    Completed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-3 w-3" /> },
    Failed: { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
    Cancelled: { color: 'bg-neutral-100 text-neutral-800', icon: <XCircle className="h-3 w-3" /> },
    // Document statuses
    Processing: { color: 'bg-blue-100 text-blue-800', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    Processed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-3 w-3" /> },
    Ignored: { color: 'bg-neutral-100 text-neutral-800', icon: <AlertTriangle className="h-3 w-3" /> },
    Duplicate: { color: 'bg-orange-100 text-orange-800', icon: <AlertTriangle className="h-3 w-3" /> },
  }

  const config = statusConfig[status] || { color: 'bg-neutral-100', icon: null }

  return (
    <Badge className={cn('gap-1', config.color)}>
      {config.icon}
      {status}
    </Badge>
  )
}

function SourceTypeBadge({ type }: { type: ScraperSourceType }) {
  // Complete configuration for all 50+ scraper source types
  const typeConfig: Record<string, { color: string; label: string; category: string }> = {
    // TIER 1: CONSAR Core (Emerald)
    DOF: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200', label: 'DOF', category: 'Core' },
    SIDOF: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200', label: 'SIDOF', category: 'Core' },
    GobMxConsar: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200', label: 'GOB.MX', category: 'Core' },
    SinorConsar: { color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200', label: 'SINOR', category: 'Core' },
    RssFeed: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200', label: 'RSS', category: 'Core' },
    // TIER 2: Regulatorios (Blue)
    CNBV: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', label: 'CNBV', category: 'Regulatorio' },
    SHCP: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', label: 'SHCP', category: 'Regulatorio' },
    BANXICO: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', label: 'BANXICO', category: 'Regulatorio' },
    SAT: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', label: 'SAT', category: 'Regulatorio' },
    RENAPO: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', label: 'RENAPO', category: 'Regulatorio' },
    IMSS: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', label: 'IMSS', category: 'Regulatorio' },
    INFONAVIT: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', label: 'INFONAVIT', category: 'Regulatorio' },
    INEGI: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', label: 'INEGI', category: 'Regulatorio' },
    SEPOMEX: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', label: 'SEPOMEX', category: 'Regulatorio' },
    SPEI: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', label: 'SPEI', category: 'Regulatorio' },
    // TIER 3: PLD (Red)
    OFAC: { color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200', label: 'OFAC', category: 'PLD' },
    UIF: { color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200', label: 'UIF', category: 'PLD' },
    ONU: { color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200', label: 'ONU', category: 'PLD' },
    // TIER 4: Técnicas (Purple)
    ConsarPortal: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200', label: 'CONSAR Portal', category: 'Técnico' },
    ConsarSISET: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200', label: 'SISET', category: 'Técnico' },
    PROCESAR: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200', label: 'PROCESAR', category: 'Técnico' },
    AMAFORE: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200', label: 'AMAFORE', category: 'Técnico' },
    CONDUSEF: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200', label: 'CONDUSEF', category: 'Técnico' },
    IndicesFinancieros: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200', label: 'Índices', category: 'Técnico' },
    SarLayouts: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200', label: 'SAR Layouts', category: 'Técnico' },
    // TIER 5: Mercados (Orange)
    BMV: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200', label: 'BMV', category: 'Mercado' },
    CNSF: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200', label: 'CNSF', category: 'Mercado' },
    PENSIONISSSTE: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200', label: 'PENSIONISSSTE', category: 'Mercado' },
    IPAB: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200', label: 'IPAB', category: 'Mercado' },
    SIEFOREPrecios: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200', label: 'SIEFORE', category: 'Mercado' },
    CETES: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200', label: 'CETES', category: 'Mercado' },
    VALMER: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200', label: 'VALMER', category: 'Mercado' },
    // TIER 6: Infraestructura (Cyan)
    STPS: { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200', label: 'STPS', category: 'Infraestructura' },
    FOVISSSTE: { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200', label: 'FOVISSSTE', category: 'Infraestructura' },
    INDEVAL: { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200', label: 'INDEVAL', category: 'Infraestructura' },
    MEXDER: { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200', label: 'MEXDER', category: 'Infraestructura' },
    TablasActuariales: { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200', label: 'Actuarial', category: 'Infraestructura' },
    // TIER 7: Complementarios (Neutral)
    COFECE: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200', label: 'COFECE', category: 'Complementario' },
    PRODECON: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200', label: 'PRODECON', category: 'Complementario' },
    INAI: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200', label: 'INAI', category: 'Complementario' },
    PROFECO: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200', label: 'PROFECO', category: 'Complementario' },
    LeySAR: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200', label: 'Ley SAR', category: 'Complementario' },
    CONASAMI: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200', label: 'CONASAMI', category: 'Complementario' },
    ASF: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200', label: 'ASF', category: 'Complementario' },
    SHF: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200', label: 'SHF', category: 'Complementario' },
    SUA: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200', label: 'SUA', category: 'Complementario' },
    IDSE: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200', label: 'IDSE', category: 'Complementario' },
    ExpedienteAfore: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200', label: 'Expediente', category: 'Complementario' },
    LISIT: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200', label: 'LISIT', category: 'Complementario' },
    PensionBienestar: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200', label: 'Bienestar', category: 'Complementario' },
    Custom: { color: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-200', label: 'Custom', category: 'Otro' },
  }

  const config = typeConfig[type] || { color: 'bg-neutral-100 text-neutral-800', label: type, category: 'Otro' }

  return (
    <Badge className={cn('text-xs font-medium', config.color)} title={`Categoría: ${config.category}`}>
      {config.label}
    </Badge>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  isDark,
}: {
  title: string
  value: number | string
  description?: string
  icon: React.ElementType
  color: string
  isDark: boolean
}) {
  return (
    <Card className={cn(
      'ios-card-glass transition-all hover:scale-[1.02]',
      isDark ? 'bg-neutral-900/60' : 'bg-white/60'
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn(
              'text-sm font-medium',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}>
              {title}
            </p>
            <p className={cn(
              'text-2xl font-bold mt-1',
              isDark ? 'text-neutral-100' : 'text-neutral-900'
            )}>
              {value}
            </p>
            {description && (
              <p className={cn(
                'text-xs mt-1',
                isDark ? 'text-neutral-500' : 'text-neutral-500'
              )}>
                {description}
              </p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', color)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ScrapersList() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<'sources' | 'executions' | 'documents'>('sources')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newSource, setNewSource] = useState<Partial<CreateScraperSourceRequest>>({
    sourceType: 'DOF',
    frequency: 'Daily',
    isEnabled: true,
  })

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Execution Monitor state
  const [monitorOpen, setMonitorOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState<{ id: string; name: string } | null>(null)

  // Queries
  const { data: sources = [], isLoading: sourcesLoading, refetch: refetchSources } = useQuery({
    queryKey: ['scraperSources'],
    queryFn: () => ScraperService.getSources(),
  })

  const { data: executions = [], isLoading: executionsLoading } = useQuery({
    queryKey: ['scraperExecutions'],
    queryFn: () => ScraperService.getExecutions(),
  })

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['scrapedDocuments'],
    queryFn: () => ScraperService.getDocuments(),
  })

  const { data: statistics } = useQuery({
    queryKey: ['scraperStatistics'],
    queryFn: () => ScraperService.getStatistics(),
  })

  // Mutations
  const executeMutation = useMutation({
    mutationFn: (sourceId: string) => ScraperService.executeSource(sourceId),
    onSuccess: () => {
      toast({
        title: 'Scraping iniciado',
        description: 'La ejecución del scraper ha comenzado.',
      })
      queryClient.invalidateQueries({ queryKey: ['scraperExecutions'] })
      queryClient.invalidateQueries({ queryKey: ['scraperSources'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo iniciar el scraping.',
        variant: 'destructive',
      })
    },
  })

  const createSourceMutation = useMutation({
    mutationFn: (data: CreateScraperSourceRequest) => ScraperService.createSource(data),
    onSuccess: () => {
      toast({
        title: 'Fuente creada',
        description: 'La fuente de scraping ha sido creada exitosamente.',
      })
      setCreateDialogOpen(false)
      setNewSource({
        sourceType: 'DOF',
        frequency: 'Daily',
        isEnabled: true,
      })
      queryClient.invalidateQueries({ queryKey: ['scraperSources'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la fuente.',
        variant: 'destructive',
      })
    },
  })

  const deleteSourceMutation = useMutation({
    mutationFn: (id: string) => ScraperService.deleteSource(id),
    onSuccess: () => {
      toast({
        title: 'Fuente eliminada',
        description: 'La fuente de scraping ha sido eliminada.',
      })
      queryClient.invalidateQueries({ queryKey: ['scraperSources'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la fuente.',
        variant: 'destructive',
      })
    },
  })

  const processDocumentMutation = useMutation({
    mutationFn: (id: string) => ScraperService.processDocument(id),
    onSuccess: () => {
      toast({
        title: 'Documento procesado',
        description: 'El documento ha sido convertido a cambio normativo.',
      })
      queryClient.invalidateQueries({ queryKey: ['scrapedDocuments'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo procesar el documento.',
        variant: 'destructive',
      })
    },
  })

  // Seed missing sources mutation (Hangfire job)
  const seedSourcesMutation = useMutation({
    mutationFn: () => ScraperService.seedMissingSources(),
    onSuccess: (data: SeedSourcesJobResponse) => {
      toast({
        title: 'Job encolado',
        description: `${data.message} (Job ID: ${data.jobId})`,
      })
      // Poll for updates after a delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['scraperSources'] })
        queryClient.invalidateQueries({ queryKey: ['scraperStatistics'] })
      }, 3000)
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo encolar el job de siembra de fuentes.',
        variant: 'destructive',
      })
    },
  })

  const handleCreateSource = () => {
    if (!newSource.name || !newSource.baseUrl) {
      toast({
        title: 'Error',
        description: 'El nombre y la URL base son requeridos.',
        variant: 'destructive',
      })
      return
    }
    createSourceMutation.mutate(newSource as CreateScraperSourceRequest)
  }

  // Open execution monitor for a source
  const handleExecuteWithMonitor = (source: ScraperSource) => {
    setSelectedSource({ id: source.id, name: source.name })
    setMonitorOpen(true)
  }

  // Handle execution completion
  const handleExecutionComplete = (_execution: ScraperExecution) => {
    // Refresh data
    queryClient.invalidateQueries({ queryKey: ['scraperExecutions'] })
    queryClient.invalidateQueries({ queryKey: ['scraperSources'] })
    queryClient.invalidateQueries({ queryKey: ['scrapedDocuments'] })
    queryClient.invalidateQueries({ queryKey: ['scraperStatistics'] })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  // Get category for source type
  const getSourceCategory = (type: string): string => {
    const categoryMap: Record<string, string> = {
      DOF: 'Core', SIDOF: 'Core', GobMxConsar: 'Core', SinorConsar: 'Core', RssFeed: 'Core',
      CNBV: 'Regulatorio', SHCP: 'Regulatorio', BANXICO: 'Regulatorio', SAT: 'Regulatorio',
      RENAPO: 'Regulatorio', IMSS: 'Regulatorio', INFONAVIT: 'Regulatorio', INEGI: 'Regulatorio',
      SEPOMEX: 'Regulatorio', SPEI: 'Regulatorio',
      OFAC: 'PLD', UIF: 'PLD', ONU: 'PLD',
      ConsarPortal: 'Técnico', ConsarSISET: 'Técnico', PROCESAR: 'Técnico', AMAFORE: 'Técnico',
      CONDUSEF: 'Técnico', IndicesFinancieros: 'Técnico', SarLayouts: 'Técnico',
      BMV: 'Mercado', CNSF: 'Mercado', PENSIONISSSTE: 'Mercado', IPAB: 'Mercado',
      SIEFOREPrecios: 'Mercado', CETES: 'Mercado', VALMER: 'Mercado',
      STPS: 'Infraestructura', FOVISSSTE: 'Infraestructura', INDEVAL: 'Infraestructura',
      MEXDER: 'Infraestructura', TablasActuariales: 'Infraestructura',
    }
    return categoryMap[type] || 'Complementario'
  }

  // Filter sources
  const filteredSources = sources.filter((source) => {
    const matchesSearch = searchQuery === '' ||
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.sourceType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === 'all' ||
      getSourceCategory(source.sourceType) === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className={cn(
              'ios-heading-title1 ios-text-glass-subtle flex items-center gap-2',
              isDark ? 'text-neutral-100' : 'text-neutral-900'
            )}
          >
            <Globe className="h-8 w-8 text-primary-600" />
            Scrapers Normativos
          </h1>
          <p className={cn(
            'mt-2 ios-text-callout',
            isDark ? 'text-neutral-400' : 'text-neutral-600'
          )}>
            Extracción automática de cambios normativos CONSAR
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              refetchSources()
              queryClient.invalidateQueries({ queryKey: ['scraperExecutions'] })
              queryClient.invalidateQueries({ queryKey: ['scrapedDocuments'] })
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => seedSourcesMutation.mutate()}
            disabled={seedSourcesMutation.isPending}
            title="Agregar todas las fuentes predefinidas que faltan en la base de datos"
          >
            {seedSourcesMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            <span className="hidden sm:inline">Poblar Fuentes</span>
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nueva Fuente</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Fuente de Scraping</DialogTitle>
                <DialogDescription>
                  Configure una nueva fuente para extraer cambios normativos.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Ej: DOF - CONSAR"
                    value={newSource.name || ''}
                    onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Descripción de la fuente..."
                    value={newSource.description || ''}
                    onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="baseUrl">URL Base</Label>
                  <Input
                    id="baseUrl"
                    placeholder="https://www.dof.gob.mx"
                    value={newSource.baseUrl || ''}
                    onChange={(e) => setNewSource({ ...newSource, baseUrl: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endpointPath">Ruta del Endpoint (opcional)</Label>
                  <Input
                    id="endpointPath"
                    placeholder="/busqueda"
                    value={newSource.endpointPath || ''}
                    onChange={(e) => setNewSource({ ...newSource, endpointPath: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo de Fuente</Label>
                    <Select
                      value={newSource.sourceType}
                      onValueChange={(value) =>
                        setNewSource({ ...newSource, sourceType: value as ScraperSourceType })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOF">DOF</SelectItem>
                        <SelectItem value="SIDOF">SIDOF</SelectItem>
                        <SelectItem value="GobMxConsar">GOB.MX CONSAR</SelectItem>
                        <SelectItem value="SinorConsar">SINOR CONSAR</SelectItem>
                        <SelectItem value="RssFeed">RSS Feed</SelectItem>
                        <SelectItem value="Custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Frecuencia</Label>
                    <Select
                      value={newSource.frequency}
                      onValueChange={(value) =>
                        setNewSource({ ...newSource, frequency: value as ScraperFrequency })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hourly">Cada hora</SelectItem>
                        <SelectItem value="Every6Hours">Cada 6 horas</SelectItem>
                        <SelectItem value="Every12Hours">Cada 12 horas</SelectItem>
                        <SelectItem value="Daily">Diario</SelectItem>
                        <SelectItem value="Weekly">Semanal</SelectItem>
                        <SelectItem value="Monthly">Mensual</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isEnabled"
                    checked={newSource.isEnabled}
                    onCheckedChange={(checked) => setNewSource({ ...newSource, isEnabled: checked })}
                  />
                  <Label htmlFor="isEnabled">Habilitado</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateSource}
                  disabled={createSourceMutation.isPending}
                >
                  {createSourceMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Crear Fuente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Fuentes Activas"
            value={statistics.activeSources}
            description={`de ${statistics.totalSources} total`}
            icon={Globe}
            color="bg-emerald-500"
            isDark={isDark}
          />
          <StatCard
            title="Ejecuciones (24h)"
            value={statistics.last24HoursExecutions}
            description={`${statistics.successfulExecutions} exitosas`}
            icon={Play}
            color="bg-blue-500"
            isDark={isDark}
          />
          <StatCard
            title="Documentos Pendientes"
            value={statistics.pendingDocuments}
            description={`de ${statistics.totalDocuments} total`}
            icon={FileText}
            color="bg-orange-500"
            isDark={isDark}
          />
          <StatCard
            title="Procesados (24h)"
            value={statistics.last24HoursDocuments}
            description="nuevos documentos"
            icon={CheckCircle2}
            color="bg-purple-500"
            isDark={isDark}
          />
        </div>
      )}

      {/* Tabs Content */}
      <Card className={cn(
        'ios-card-glass',
        isDark ? 'bg-neutral-900/60' : 'bg-white/60'
      )}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <CardHeader>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sources" className="gap-2">
                <Globe className="h-4 w-4" />
                Fuentes ({sources.length})
              </TabsTrigger>
              <TabsTrigger value="executions" className="gap-2">
                <Play className="h-4 w-4" />
                Ejecuciones ({executions.length})
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="h-4 w-4" />
                Documentos ({documents.length})
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          {/* Sources Tab */}
          <TabsContent value="sources">
            <CardContent>
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Buscar fuentes por nombre, tipo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2 text-neutral-400" />
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_FILTERS.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Results info */}
              {(searchQuery || categoryFilter !== 'all') && (
                <div className={cn(
                  'text-sm mb-3 flex items-center gap-2',
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                )}>
                  <span>
                    Mostrando {filteredSources.length} de {sources.length} fuentes
                  </span>
                  {(searchQuery || categoryFilter !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                      className="h-6 px-2 text-xs"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              )}

              {sourcesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : filteredSources.length === 0 && sources.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className={cn(
                    'h-12 w-12 mx-auto mb-4',
                    isDark ? 'text-neutral-600' : 'text-neutral-300'
                  )} />
                  <p className={cn(
                    'ios-text-callout mb-2',
                    isDark ? 'text-neutral-500' : 'text-neutral-500'
                  )}>
                    No hay fuentes configuradas
                  </p>
                  <p className={cn(
                    'text-sm mb-4',
                    isDark ? 'text-neutral-600' : 'text-neutral-400'
                  )}>
                    Usa "Poblar Fuentes" para agregar las 40+ fuentes predefinidas
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="secondary" onClick={() => seedSourcesMutation.mutate()}>
                      <Database className="h-4 w-4 mr-2" />
                      Poblar Fuentes
                    </Button>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Manualmente
                    </Button>
                  </div>
                </div>
              ) : filteredSources.length === 0 ? (
                <div className="text-center py-8">
                  <Search className={cn(
                    'h-12 w-12 mx-auto mb-4',
                    isDark ? 'text-neutral-600' : 'text-neutral-300'
                  )} />
                  <p className={cn(
                    'ios-text-callout',
                    isDark ? 'text-neutral-500' : 'text-neutral-500'
                  )}>
                    No se encontraron fuentes con los filtros actuales
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Frecuencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Última Ejecución</TableHead>
                      <TableHead>Próxima Ejecución</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSources.map((source) => (
                      <TableRow key={source.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <TableCell>
                          <div className="font-medium">{source.name}</div>
                          {source.description && (
                            <div className={cn(
                              'text-sm truncate max-w-xs',
                              isDark ? 'text-neutral-500' : 'text-neutral-500'
                            )}>
                              {source.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <SourceTypeBadge type={source.sourceType} />
                        </TableCell>
                        <TableCell className="capitalize">
                          {source.frequency === 'Every6Hours' ? 'Cada 6h' :
                           source.frequency === 'Every12Hours' ? 'Cada 12h' :
                           source.frequency === 'Hourly' ? 'Cada hora' :
                           source.frequency === 'Daily' ? 'Diario' :
                           source.frequency === 'Weekly' ? 'Semanal' :
                           source.frequency === 'Monthly' ? 'Mensual' : source.frequency}
                        </TableCell>
                        <TableCell>
                          {source.isEnabled ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Activo
                            </Badge>
                          ) : (
                            <Badge className="bg-neutral-100 text-neutral-800">
                              <Pause className="h-3 w-3 mr-1" />
                              Inactivo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(source.lastExecutedAt)}</TableCell>
                        <TableCell>{formatDate(source.nextScheduledAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleExecuteWithMonitor(source)}
                              disabled={executeMutation.isPending}
                              title="Ejecutar con monitor"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(source.baseUrl, '_blank')}
                              title="Abrir URL"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSourceMutation.mutate(source.id)}
                              disabled={deleteSourceMutation.isPending}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions">
            <CardContent>
              {executionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : executions.length === 0 ? (
                <div className="text-center py-8">
                  <Play className={cn(
                    'h-12 w-12 mx-auto mb-4',
                    isDark ? 'text-neutral-600' : 'text-neutral-300'
                  )} />
                  <p className={cn(
                    'ios-text-callout',
                    isDark ? 'text-neutral-500' : 'text-neutral-500'
                  )}>
                    No hay ejecuciones registradas
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fuente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead>Documentos</TableHead>
                      <TableHead>Disparado Por</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.map((execution) => (
                      <TableRow key={execution.id}>
                        <TableCell className="font-medium">{execution.sourceName}</TableCell>
                        <TableCell>
                          <StatusBadge status={execution.status} />
                        </TableCell>
                        <TableCell>{formatDate(execution.startedAt)}</TableCell>
                        <TableCell>{formatDate(execution.completedAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 text-sm">
                            <span className="text-green-600">+{execution.documentsNew}</span>
                            <span className="text-orange-600">{execution.documentsDuplicate} dup</span>
                            {execution.documentsError > 0 && (
                              <span className="text-red-600">{execution.documentsError} err</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{execution.triggeredBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <CardContent>
              {documentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className={cn(
                    'h-12 w-12 mx-auto mb-4',
                    isDark ? 'text-neutral-600' : 'text-neutral-300'
                  )} />
                  <p className={cn(
                    'ios-text-callout',
                    isDark ? 'text-neutral-500' : 'text-neutral-500'
                  )}>
                    No hay documentos extraídos
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Fuente</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Publicación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="font-medium max-w-md truncate" title={doc.title}>
                            {doc.title}
                          </div>
                          {doc.category && (
                            <Badge variant="neutral" className="mt-1">
                              {doc.category}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{doc.sourceName}</TableCell>
                        <TableCell>
                          {doc.code || '-'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={doc.status} />
                        </TableCell>
                        <TableCell>{formatDate(doc.publishDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {doc.status === 'Pending' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => processDocumentMutation.mutate(doc.id)}
                                disabled={processDocumentMutation.isPending}
                                title="Procesar documento"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {doc.documentUrl && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(doc.documentUrl, '_blank')}
                                title="Ver documento"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Execution Monitor Modal */}
      {selectedSource && (
        <ExecutionMonitor
          sourceId={selectedSource.id}
          sourceName={selectedSource.name}
          isOpen={monitorOpen}
          onClose={() => setMonitorOpen(false)}
          onExecutionComplete={handleExecutionComplete}
        />
      )}
    </div>
  )
}

export default ScrapersList
