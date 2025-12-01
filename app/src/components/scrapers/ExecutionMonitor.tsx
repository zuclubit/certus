/**
 * Execution Monitor Component
 *
 * Real-time monitoring of scraper execution with detailed feedback
 * Uses SignalR WebSocket for real-time updates instead of polling
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Terminal,
  Activity,
  Zap,
  TrendingUp,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { ScraperService } from '@/lib/services/api/scraper.service'
import type {
  ScraperExecution,
  ScrapedDocument,
} from '@/lib/services/api/scraper.service'
import {
  useScraperSignalR,
  type ScraperExecutionStartedMessage,
  type ScraperExecutionProgressMessage,
  type ScraperDocumentFoundMessage,
  type ScraperExecutionCompletedMessage,
  type ScraperExecutionFailedMessage,
  type ScraperLogMessage,
} from '@/hooks/useScraperSignalR'

// ============================================
// TYPES
// ============================================

interface ExecutionMonitorProps {
  sourceId: string
  sourceName: string
  isOpen: boolean
  onClose: () => void
  onExecutionComplete?: (execution: ScraperExecution) => void
}

interface ExecutionLog {
  timestamp: Date
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

// ============================================
// HELPER COMPONENTS
// ============================================

function LogEntry({ log, isDark }: { log: ExecutionLog; isDark: boolean }) {
  const iconMap = {
    info: <Activity className="h-3 w-3 text-blue-500" />,
    success: <CheckCircle2 className="h-3 w-3 text-green-500" />,
    warning: <AlertTriangle className="h-3 w-3 text-yellow-500" />,
    error: <XCircle className="h-3 w-3 text-red-500" />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-start gap-2 py-1.5 px-2 rounded text-xs font-mono',
        isDark ? 'bg-neutral-800/50' : 'bg-neutral-50'
      )}
    >
      {iconMap[log.type]}
      <span className={cn(
        'flex-1',
        isDark ? 'text-neutral-300' : 'text-neutral-700'
      )}>
        {log.message}
      </span>
      <span className={cn(
        'text-[10px]',
        isDark ? 'text-neutral-500' : 'text-neutral-400'
      )}>
        {log.timestamp.toLocaleTimeString('es-MX')}
      </span>
    </motion.div>
  )
}

function StatBox({
  label,
  value,
  icon: Icon,
  color,
  isDark,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
  isDark: boolean
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg',
      isDark ? 'bg-neutral-800/50' : 'bg-neutral-50'
    )}>
      <div className={cn('p-2 rounded-lg', color)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className={cn(
          'text-2xl font-bold',
          isDark ? 'text-neutral-100' : 'text-neutral-900'
        )}>
          {value}
        </p>
        <p className={cn(
          'text-xs',
          isDark ? 'text-neutral-400' : 'text-neutral-600'
        )}>
          {label}
        </p>
      </div>
    </div>
  )
}

function ConnectionIndicator({ isConnected, isDark }: { isConnected: boolean; isDark: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 text-xs px-2 py-1 rounded-full',
      isConnected
        ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700')
        : (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')
    )}>
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>WebSocket</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Conectando...</span>
        </>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ExecutionMonitor({
  sourceId,
  sourceName,
  isOpen,
  onClose,
  onExecutionComplete,
}: ExecutionMonitorProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [execution, setExecution] = useState<ScraperExecution | null>(null)
  const [documents, setDocuments] = useState<ScrapedDocument[]>([])
  const [logs, setLogs] = useState<ExecutionLog[]>([])
  const [isStarting, setIsStarting] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [executionId, setExecutionId] = useState<string | undefined>(undefined)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Add log entry
  const addLog = useCallback((message: string, type: ExecutionLog['type'] = 'info') => {
    setLogs(prev => [...prev, { timestamp: new Date(), message, type }])
  }, [])

  // SignalR event handlers
  const handleExecutionStarted = useCallback((message: ScraperExecutionStartedMessage) => {
    addLog(`Ejecucion iniciada (ID: ${message.executionId.slice(0, 8)}...)`, 'success')
    setExecutionId(message.executionId)
    setExecution(prev => ({
      id: message.executionId,
      sourceId: message.sourceId,
      sourceName: message.sourceName,
      status: message.status as ScraperExecution['status'],
      startedAt: message.startedAt,
      documentsFound: prev?.documentsFound || 0,
      documentsNew: prev?.documentsNew || 0,
      documentsDuplicate: prev?.documentsDuplicate || 0,
      documentsError: prev?.documentsError || 0,
      triggeredBy: message.triggeredBy,
    }))
  }, [addLog])

  const handleExecutionProgress = useCallback((message: ScraperExecutionProgressMessage) => {
    setExecution(prev => ({
      ...prev!,
      id: prev?.id || message.executionId,
      sourceId: message.sourceId,
      sourceName: prev?.sourceName || '',
      status: message.status as ScraperExecution['status'],
      startedAt: prev?.startedAt || new Date().toISOString(),
      documentsFound: message.documentsFound,
      documentsNew: message.documentsNew,
      documentsDuplicate: message.documentsDuplicate,
      documentsError: message.documentsError,
      triggeredBy: prev?.triggeredBy || 'manual',
    }))

    if (message.currentActivity) {
      addLog(message.currentActivity, 'info')
    }
  }, [addLog])

  const handleDocumentFound = useCallback((message: ScraperDocumentFoundMessage) => {
    const docEntry: ScrapedDocument = {
      id: message.documentId,
      executionId: message.executionId,
      sourceId: message.sourceId,
      sourceName: '',
      externalId: '',
      title: message.title,
      code: message.code,
      category: message.category,
      status: 'Pending',
      createdAt: message.foundAt,
    }
    setDocuments(prev => {
      // Avoid duplicates
      if (prev.some(d => d.id === message.documentId)) return prev
      return [docEntry, ...prev]
    })

    if (message.isNew) {
      addLog(`Nuevo documento: ${message.code || message.title.slice(0, 30)}...`, 'success')
    }
  }, [addLog])

  const handleExecutionCompleted = useCallback((message: ScraperExecutionCompletedMessage) => {
    const completedExecution: ScraperExecution = {
      id: message.executionId,
      sourceId: message.sourceId,
      sourceName: message.sourceName,
      status: 'Completed',
      startedAt: execution?.startedAt || new Date().toISOString(),
      completedAt: message.completedAt,
      documentsFound: message.documentsFound,
      documentsNew: message.documentsNew,
      documentsDuplicate: message.documentsDuplicate,
      documentsError: message.documentsError,
      triggeredBy: execution?.triggeredBy || 'manual',
    }

    setExecution(completedExecution)
    addLog('Scraping completado exitosamente', 'success')
    addLog(`Total: ${message.documentsFound} docs, ${message.documentsNew} nuevos`, 'info')

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    onExecutionComplete?.(completedExecution)
  }, [execution?.startedAt, execution?.triggeredBy, addLog, onExecutionComplete])

  const handleExecutionFailed = useCallback((message: ScraperExecutionFailedMessage) => {
    setExecution(prev => ({
      ...prev!,
      id: message.executionId,
      sourceId: message.sourceId,
      sourceName: message.sourceName,
      status: message.status === 'Cancelled' ? 'Cancelled' : 'Failed',
      startedAt: prev?.startedAt || new Date().toISOString(),
      documentsFound: prev?.documentsFound || 0,
      documentsNew: prev?.documentsNew || 0,
      documentsDuplicate: prev?.documentsDuplicate || 0,
      documentsError: prev?.documentsError || 0,
      errorMessage: message.errorMessage,
      triggeredBy: prev?.triggeredBy || 'manual',
    }))

    addLog(`Error: ${message.errorMessage}`, 'error')

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [addLog])

  const handleExecutionLog = useCallback((message: ScraperLogMessage) => {
    const levelMap: Record<string, ExecutionLog['type']> = {
      Info: 'info',
      Warning: 'warning',
      Error: 'error',
      Success: 'success',
    }
    addLog(message.message, levelMap[message.level] || 'info')
  }, [addLog])

  // Initialize SignalR connection
  const {
    isConnected,
    subscribeToSource,
    subscribeToExecution,
    unsubscribeFromSource,
    unsubscribeFromExecution,
  } = useScraperSignalR({
    sourceId: isOpen ? sourceId : undefined,
    executionId: executionId,
    autoConnect: isOpen,
    onExecutionStarted: handleExecutionStarted,
    onExecutionProgress: handleExecutionProgress,
    onDocumentFound: handleDocumentFound,
    onExecutionCompleted: handleExecutionCompleted,
    onExecutionFailed: handleExecutionFailed,
    onExecutionLog: handleExecutionLog,
  })

  // Start execution
  const startExecution = useCallback(async () => {
    setIsStarting(true)
    setError(null)
    setLogs([])
    setDocuments([])
    setElapsedTime(0)
    setExecutionId(undefined)

    addLog(`Iniciando scraping de "${sourceName}"...`, 'info')
    addLog(isConnected ? 'Conexion WebSocket activa' : 'Estableciendo conexion WebSocket...', 'info')

    try {
      const result = await ScraperService.executeSource(sourceId)

      // Create a minimal execution object to start tracking
      const initialExecution: ScraperExecution = {
        id: result.id || `pending-${Date.now()}`,
        sourceId: result.sourceId || sourceId,
        sourceName: result.sourceName || sourceName,
        status: result.status === 'queued' ? 'Pending' : (result.status || 'Pending'),
        startedAt: result.startedAt || new Date().toISOString(),
        completedAt: result.completedAt,
        documentsFound: result.documentsFound || 0,
        documentsNew: result.documentsNew || 0,
        documentsDuplicate: result.documentsDuplicate || 0,
        documentsError: result.documentsError || 0,
        errorMessage: result.errorMessage,
        triggeredBy: 'manual'
      }

      setExecution(initialExecution)
      setHasStarted(true)

      // If we got a real execution ID, subscribe to it
      if (result.executionId) {
        setExecutionId(result.executionId)
        await subscribeToExecution(result.executionId)
      }

      // Subscribe to source for updates
      await subscribeToSource(sourceId)

      if (result.status === 'queued') {
        addLog('Scraping encolado, esperando inicio...', 'info')
        addLog(`Job ID: ${result.jobId || 'N/A'}`, 'info')
        addLog('Recibirás actualizaciones en tiempo real via WebSocket', 'info')
      } else if (result.id) {
        setExecutionId(result.id)
        await subscribeToExecution(result.id)
        addLog(`Ejecucion iniciada (ID: ${result.id.slice(0, 8)}...)`, 'success')
      } else {
        addLog('Ejecucion iniciada, esperando actualizaciones...', 'success')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      addLog(`Error al iniciar: ${errorMessage}`, 'error')
    } finally {
      setIsStarting(false)
    }
  }, [sourceId, sourceName, isConnected, addLog, subscribeToSource, subscribeToExecution])

  // Start timer when execution begins
  useEffect(() => {
    const shouldTrackTime = hasStarted && execution?.id &&
      (execution.status === 'Running' || execution.status === 'Pending')

    if (shouldTrackTime && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (!shouldTrackTime && timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [hasStarted, execution?.id, execution?.status])

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      // Unsubscribe from SignalR groups
      if (sourceId) {
        unsubscribeFromSource(sourceId).catch(console.error)
      }
      if (executionId) {
        unsubscribeFromExecution(executionId).catch(console.error)
      }

      setExecution(null)
      setDocuments([])
      setLogs([])
      setHasStarted(false)
      setError(null)
      setElapsedTime(0)
      setExecutionId(undefined)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isOpen, sourceId, executionId, unsubscribeFromSource, unsubscribeFromExecution])

  // Auto-start on open
  useEffect(() => {
    if (isOpen && !hasStarted && !isStarting) {
      startExecution()
    }
  }, [isOpen, hasStarted, isStarting, startExecution])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusInfo = () => {
    if (!execution) return { label: 'Iniciando...', color: 'bg-blue-500', icon: Loader2 }

    switch (execution.status) {
      case 'Pending':
        return { label: 'Pendiente', color: 'bg-yellow-500', icon: Clock }
      case 'Running':
        return { label: 'Ejecutando', color: 'bg-blue-500', icon: Loader2 }
      case 'Completed':
        return { label: 'Completado', color: 'bg-green-500', icon: CheckCircle2 }
      case 'Failed':
        return { label: 'Fallido', color: 'bg-red-500', icon: XCircle }
      case 'Cancelled':
        return { label: 'Cancelado', color: 'bg-neutral-500', icon: Pause }
      default:
        return { label: execution.status, color: 'bg-neutral-500', icon: Activity }
    }
  }

  const statusInfo = getStatusInfo()
  const isRunning = execution?.status === 'Running' || execution?.status === 'Pending'
  const isComplete = execution?.status === 'Completed'
  const isFailed = execution?.status === 'Failed'

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className={cn(
        'max-w-2xl max-h-[90vh] overflow-hidden',
        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white'
      )}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className={cn(
              'flex items-center gap-2',
              isDark ? 'text-neutral-100' : 'text-neutral-900'
            )}>
              <Zap className="h-5 w-5 text-primary-500" />
              Monitor de Ejecucion
            </DialogTitle>
            <ConnectionIndicator isConnected={isConnected} isDark={isDark} />
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Source Info & Status */}
          <div className={cn(
            'flex items-center justify-between p-4 rounded-lg',
            isDark ? 'bg-neutral-800/50' : 'bg-neutral-50'
          )}>
            <div>
              <h3 className={cn(
                'font-semibold',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}>
                {sourceName}
              </h3>
              <p className={cn(
                'text-sm',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}>
                Tiempo transcurrido: {formatTime(elapsedTime)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn('gap-1', statusInfo.color, 'text-white')}>
                <statusInfo.icon className={cn(
                  'h-3 w-3',
                  isRunning && 'animate-spin'
                )} />
                {statusInfo.label}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>
                  Progreso (actualizaciones en tiempo real)
                </span>
                <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>
                  {execution?.documentsFound || 0} documentos encontrados
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-400"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </div>
            </div>
          )}

          {/* Statistics */}
          {execution && (
            <div className="grid grid-cols-4 gap-3">
              <StatBox
                label="Encontrados"
                value={execution.documentsFound}
                icon={FileText}
                color="bg-blue-500"
                isDark={isDark}
              />
              <StatBox
                label="Nuevos"
                value={execution.documentsNew}
                icon={TrendingUp}
                color="bg-green-500"
                isDark={isDark}
              />
              <StatBox
                label="Duplicados"
                value={execution.documentsDuplicate}
                icon={RefreshCw}
                color="bg-orange-500"
                isDark={isDark}
              />
              <StatBox
                label="Errores"
                value={execution.documentsError}
                icon={AlertTriangle}
                color="bg-red-500"
                isDark={isDark}
              />
            </div>
          )}

          {/* Execution Log */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Terminal className={cn(
                'h-4 w-4',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )} />
              <span className={cn(
                'text-sm font-medium',
                isDark ? 'text-neutral-300' : 'text-neutral-700'
              )}>
                Log de Ejecucion (tiempo real)
              </span>
            </div>
            <div className={cn(
              'h-48 overflow-y-auto rounded-lg border p-2 space-y-1',
              isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'
            )}>
              <AnimatePresence>
                {logs.map((log, idx) => (
                  <LogEntry key={idx} log={log} isDark={isDark} />
                ))}
              </AnimatePresence>
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 py-1.5 px-2 text-xs"
                >
                  <Loader2 className="h-3 w-3 animate-spin text-primary-500" />
                  <span className={isDark ? 'text-neutral-500' : 'text-neutral-400'}>
                    {isConnected ? 'Escuchando actualizaciones via WebSocket...' : 'Conectando...'}
                  </span>
                </motion.div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Recent Documents */}
          {documents.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                )}>
                  Documentos Recientes ({documents.length})
                </span>
              </div>
              <div className={cn(
                'max-h-32 overflow-y-auto rounded-lg border divide-y',
                isDark ? 'bg-neutral-800/30 border-neutral-800 divide-neutral-800' : 'bg-white border-neutral-200 divide-neutral-100'
              )}>
                {documents.slice(0, 5).map((doc) => (
                  <div
                    key={doc.id}
                    className={cn(
                      'flex items-center justify-between px-3 py-2',
                      isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        isDark ? 'text-neutral-200' : 'text-neutral-800'
                      )}>
                        {doc.title}
                      </p>
                      <p className={cn(
                        'text-xs truncate',
                        isDark ? 'text-neutral-500' : 'text-neutral-500'
                      )}>
                        {doc.code || 'Sin codigo'} - {doc.category || 'Sin categoria'}
                      </p>
                    </div>
                    {doc.documentUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => window.open(doc.documentUrl, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {documents.length > 5 && (
                  <div className={cn(
                    'px-3 py-2 text-xs text-center',
                    isDark ? 'text-neutral-500' : 'text-neutral-500'
                  )}>
                    y {documents.length - 5} documentos mas...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {(error || isFailed) && (
            <div className={cn(
              'p-3 rounded-lg border',
              'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900'
            )}>
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error en la ejecucion</span>
              </div>
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error || execution?.errorMessage || 'Error desconocido'}
              </p>
            </div>
          )}

          {/* Success Message */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'p-3 rounded-lg border',
                'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900'
              )}
            >
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Scraping completado exitosamente</span>
              </div>
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                Se encontraron {execution?.documentsNew} nuevos documentos de un total de {execution?.documentsFound}.
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            {isComplete || isFailed ? (
              <>
                <Button variant="secondary" onClick={onClose}>
                  Cerrar
                </Button>
                <Button onClick={startExecution} disabled={isStarting}>
                  {isStarting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Ejecutar de nuevo
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={onClose}>
                Ejecutar en segundo plano
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ExecutionMonitor
