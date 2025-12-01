/**
 * useScraperSignalR - Hook for real-time scraper execution updates via SignalR
 *
 * Provides WebSocket-based communication for scraper status, progress, and documents
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import { AuthService } from '@/lib/services/api/auth.service'
import { SCRAPER_SIGNALR_EVENTS, SIGNALR_HUBS } from '@/lib/constants'

// ============================================
// Types
// ============================================

export interface ScraperExecutionStartedMessage {
  executionId: string
  sourceId: string
  sourceName: string
  status: string
  startedAt: string
  triggeredBy: string
}

export interface ScraperExecutionProgressMessage {
  executionId: string
  sourceId: string
  status: string
  documentsFound: number
  documentsNew: number
  documentsDuplicate: number
  documentsError: number
  currentActivity?: string
}

export interface ScraperDocumentFoundMessage {
  executionId: string
  sourceId: string
  documentId: string
  title: string
  code?: string
  category?: string
  isNew: boolean
  foundAt: string
}

export interface ScraperExecutionCompletedMessage {
  executionId: string
  sourceId: string
  sourceName: string
  status: string
  completedAt: string
  documentsFound: number
  documentsNew: number
  documentsDuplicate: number
  documentsError: number
  duration: string
}

export interface ScraperExecutionFailedMessage {
  executionId: string
  sourceId: string
  sourceName: string
  status: string
  failedAt: string
  errorMessage: string
  errorDetails?: string
}

export interface ScraperLogMessage {
  executionId: string
  sourceId: string
  message: string
  level: string
  timestamp: string
}

export interface ScraperUpdateMessage {
  type: 'started' | 'completed' | 'failed'
  data: ScraperExecutionStartedMessage | ScraperExecutionCompletedMessage | ScraperExecutionFailedMessage
}

export interface UseScraperSignalROptions {
  sourceId?: string
  executionId?: string
  autoConnect?: boolean
  onExecutionStarted?: (message: ScraperExecutionStartedMessage) => void
  onExecutionProgress?: (message: ScraperExecutionProgressMessage) => void
  onDocumentFound?: (message: ScraperDocumentFoundMessage) => void
  onExecutionCompleted?: (message: ScraperExecutionCompletedMessage) => void
  onExecutionFailed?: (message: ScraperExecutionFailedMessage) => void
  onExecutionLog?: (message: ScraperLogMessage) => void
  onScraperUpdate?: (message: ScraperUpdateMessage) => void
}

export interface UseScraperSignalRReturn {
  connectionState: signalR.HubConnectionState
  isConnected: boolean
  isConnecting: boolean
  error: Error | null
  subscribeToSource: (sourceId: string) => Promise<void>
  unsubscribeFromSource: (sourceId: string) => Promise<void>
  subscribeToExecution: (executionId: string) => Promise<void>
  unsubscribeFromExecution: (executionId: string) => Promise<void>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

// ============================================
// Hook
// ============================================

export function useScraperSignalR(options: UseScraperSignalROptions = {}): UseScraperSignalRReturn {
  const {
    sourceId,
    executionId,
    autoConnect = true,
    onExecutionStarted,
    onExecutionProgress,
    onDocumentFound,
    onExecutionCompleted,
    onExecutionFailed,
    onExecutionLog,
    onScraperUpdate,
  } = options

  // Get auth token from AuthService
  const getToken = useCallback(() => AuthService.getAccessToken(), [])
  const isAuthenticated = useCallback(() => AuthService.isAuthenticated(), [])

  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const isConnectingRef = useRef(false) // Guard against concurrent connect calls
  const [connectionState, setConnectionState] = useState<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected
  )
  const [error, setError] = useState<Error | null>(null)

  // Build the hub URL - use VITE_SIGNALR_URL (without /api)
  const getHubUrl = useCallback(() => {
    const baseUrl = import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5000'
    return `${baseUrl}${SIGNALR_HUBS.SCRAPERS}`
  }, [])

  // Create connection
  const createConnection = useCallback(() => {
    const token = getToken()
    if (!token) return null

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(getHubUrl(), {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0, 2, 4, 8, 16, 30 seconds
          if (retryContext.previousRetryCount === 0) return 0
          const delay = Math.min(Math.pow(2, retryContext.previousRetryCount) * 1000, 30000)
          return delay
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    // Connection state handlers
    connection.onclose((err) => {
      setConnectionState(signalR.HubConnectionState.Disconnected)
      if (err) setError(err)
    })

    connection.onreconnecting((err) => {
      setConnectionState(signalR.HubConnectionState.Reconnecting)
      if (err) setError(err)
    })

    connection.onreconnected(() => {
      setConnectionState(signalR.HubConnectionState.Connected)
      setError(null)
      // Re-subscribe after reconnection
      if (sourceId) connection.invoke('SubscribeToSource', sourceId).catch(console.error)
      if (executionId) connection.invoke('SubscribeToExecution', executionId).catch(console.error)
    })

    return connection
  }, [getToken, getHubUrl, sourceId, executionId])

  // Register event handlers
  const registerHandlers = useCallback((connection: signalR.HubConnection) => {
    if (onExecutionStarted) {
      connection.on(SCRAPER_SIGNALR_EVENTS.EXECUTION_STARTED, onExecutionStarted)
    }
    if (onExecutionProgress) {
      connection.on(SCRAPER_SIGNALR_EVENTS.EXECUTION_PROGRESS, onExecutionProgress)
    }
    if (onDocumentFound) {
      connection.on(SCRAPER_SIGNALR_EVENTS.DOCUMENT_FOUND, onDocumentFound)
    }
    if (onExecutionCompleted) {
      connection.on(SCRAPER_SIGNALR_EVENTS.EXECUTION_COMPLETED, onExecutionCompleted)
    }
    if (onExecutionFailed) {
      connection.on(SCRAPER_SIGNALR_EVENTS.EXECUTION_FAILED, onExecutionFailed)
    }
    if (onExecutionLog) {
      connection.on(SCRAPER_SIGNALR_EVENTS.EXECUTION_LOG, onExecutionLog)
    }
    if (onScraperUpdate) {
      connection.on(SCRAPER_SIGNALR_EVENTS.SCRAPER_UPDATE, onScraperUpdate)
    }
  }, [onExecutionStarted, onExecutionProgress, onDocumentFound, onExecutionCompleted, onExecutionFailed, onExecutionLog, onScraperUpdate])

  // Connect to hub
  const connect = useCallback(async () => {
    // Guard against concurrent connect calls and already connected/connecting states
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) return
    if (connectionRef.current?.state === signalR.HubConnectionState.Connecting) return
    if (isConnectingRef.current) return

    isConnectingRef.current = true

    try {
      setConnectionState(signalR.HubConnectionState.Connecting)
      const connection = createConnection()
      if (!connection) {
        throw new Error('Failed to create SignalR connection - no token')
      }

      connectionRef.current = connection
      registerHandlers(connection)

      await connection.start()
      setConnectionState(signalR.HubConnectionState.Connected)
      setError(null)

      // Subscribe to initial sources/executions
      if (sourceId) {
        await connection.invoke('SubscribeToSource', sourceId)
      }
      if (executionId) {
        await connection.invoke('SubscribeToExecution', executionId)
      }
    } catch (err) {
      setConnectionState(signalR.HubConnectionState.Disconnected)
      setError(err instanceof Error ? err : new Error('Failed to connect'))
      console.error('SignalR connection error:', err)
    } finally {
      isConnectingRef.current = false
    }
  }, [createConnection, registerHandlers, sourceId, executionId])

  // Disconnect from hub
  const disconnect = useCallback(async () => {
    // Don't disconnect if we're in the middle of connecting
    if (isConnectingRef.current) return

    if (connectionRef.current) {
      try {
        await connectionRef.current.stop()
      } catch (err) {
        console.error('Error disconnecting:', err)
      }
      connectionRef.current = null
    }
    setConnectionState(signalR.HubConnectionState.Disconnected)
  }, [])

  // Subscribe to a source
  const subscribeToSource = useCallback(async (id: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('SubscribeToSource', id)
    }
  }, [])

  // Unsubscribe from a source
  const unsubscribeFromSource = useCallback(async (id: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('UnsubscribeFromSource', id)
    }
  }, [])

  // Subscribe to an execution
  const subscribeToExecution = useCallback(async (id: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('SubscribeToExecution', id)
    }
  }, [])

  // Unsubscribe from an execution
  const unsubscribeFromExecution = useCallback(async (id: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('UnsubscribeFromExecution', id)
    }
  }, [])

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect && isAuthenticated()) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, isAuthenticated, connect, disconnect])

  // Handle source/execution ID changes
  useEffect(() => {
    const connection = connectionRef.current
    if (connection?.state !== signalR.HubConnectionState.Connected) return

    if (sourceId) {
      connection.invoke('SubscribeToSource', sourceId).catch(console.error)
    }
    if (executionId) {
      connection.invoke('SubscribeToExecution', executionId).catch(console.error)
    }

    return () => {
      if (sourceId) {
        connection.invoke('UnsubscribeFromSource', sourceId).catch(console.error)
      }
      if (executionId) {
        connection.invoke('UnsubscribeFromExecution', executionId).catch(console.error)
      }
    }
  }, [sourceId, executionId])

  return {
    connectionState,
    isConnected: connectionState === signalR.HubConnectionState.Connected,
    isConnecting: connectionState === signalR.HubConnectionState.Connecting,
    error,
    subscribeToSource,
    unsubscribeFromSource,
    subscribeToExecution,
    unsubscribeFromExecution,
    connect,
    disconnect,
  }
}

export default useScraperSignalR
