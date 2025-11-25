/**
 * useModal Hook
 *
 * Hook unificado para gestión de estado de modales.
 * Incluye:
 * - Control de apertura/cierre
 * - Bloqueo de scroll del body
 * - Manejo de tecla Escape
 * - Historial de navegación (back button)
 * - Callbacks para eventos
 *
 * @example
 * const modal = useModal({
 *   onOpen: () => console.log('opened'),
 *   onClose: () => console.log('closed'),
 * })
 *
 * <button onClick={modal.open}>Abrir</button>
 * <Modal open={modal.isOpen} onOpenChange={modal.setIsOpen}>...</Modal>
 */

import { useState, useCallback, useEffect, useRef } from 'react'

export interface UseModalOptions {
  /** Estado inicial del modal */
  defaultOpen?: boolean
  /** Callback cuando se abre el modal */
  onOpen?: () => void
  /** Callback cuando se cierra el modal */
  onClose?: () => void
  /** Cerrar al presionar Escape (default: true) */
  closeOnEscape?: boolean
  /** Bloquear scroll del body cuando está abierto (default: true) */
  lockScroll?: boolean
  /** Agregar entrada al historial para cerrar con back button (default: false) */
  useHistory?: boolean
  /** ID único para múltiples modales (auto-generado si no se provee) */
  id?: string
}

export interface UseModalReturn {
  /** Estado actual del modal */
  isOpen: boolean
  /** Abrir el modal */
  open: () => void
  /** Cerrar el modal */
  close: () => void
  /** Toggle del modal */
  toggle: () => void
  /** Setter directo (para onOpenChange de Radix) */
  setIsOpen: (open: boolean) => void
  /** ID único del modal */
  id: string
  /** Props para pasar directamente al componente modal */
  modalProps: {
    open: boolean
    onOpenChange: (open: boolean) => void
  }
}

// Contador global para IDs únicos
let modalIdCounter = 0

/**
 * Stack de modales abiertos para manejar z-index y escape
 */
const modalStack: string[] = []

export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const {
    defaultOpen = false,
    onOpen,
    onClose,
    closeOnEscape = true,
    lockScroll = true,
    useHistory = false,
    id: providedId,
  } = options

  // Generar ID único si no se provee
  const idRef = useRef<string>(providedId || `modal-${++modalIdCounter}`)
  const id = idRef.current

  const [isOpen, setIsOpenState] = useState(defaultOpen)
  const previousScrollPosition = useRef<number>(0)
  const isFirstRender = useRef(true)

  // Función para bloquear scroll
  const lockBodyScroll = useCallback(() => {
    if (!lockScroll) return

    previousScrollPosition.current = window.scrollY
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.position = 'fixed'
    document.body.style.top = `-${previousScrollPosition.current}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    document.body.style.overflow = 'hidden'
  }, [lockScroll])

  // Función para desbloquear scroll
  const unlockBodyScroll = useCallback(() => {
    if (!lockScroll) return

    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.paddingRight = ''
    document.body.style.overflow = ''

    window.scrollTo(0, previousScrollPosition.current)
  }, [lockScroll])

  // Setter con efectos
  const setIsOpen = useCallback((open: boolean) => {
    if (open === isOpen) return

    if (open) {
      // Agregar al stack
      modalStack.push(id)
      lockBodyScroll()

      // Historial del navegador
      if (useHistory) {
        window.history.pushState({ modal: id }, '')
      }

      onOpen?.()
    } else {
      // Remover del stack
      const index = modalStack.indexOf(id)
      if (index > -1) {
        modalStack.splice(index, 1)
      }

      // Solo desbloquear si no hay más modales
      if (modalStack.length === 0) {
        unlockBodyScroll()
      }

      onClose?.()
    }

    setIsOpenState(open)
  }, [isOpen, id, lockBodyScroll, unlockBodyScroll, useHistory, onOpen, onClose])

  // Funciones de control
  const open = useCallback(() => setIsOpen(true), [setIsOpen])
  const close = useCallback(() => setIsOpen(false), [setIsOpen])
  const toggle = useCallback(() => setIsOpen(!isOpen), [setIsOpen, isOpen])

  // Manejo de tecla Escape
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Solo cerrar si es el modal más reciente en el stack
        if (modalStack[modalStack.length - 1] === id) {
          event.preventDefault()
          event.stopPropagation()
          close()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [closeOnEscape, isOpen, id, close])

  // Manejo del botón back del navegador
  useEffect(() => {
    if (!useHistory || !isOpen) return

    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.modal !== id) {
        close()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [useHistory, isOpen, id, close])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      // Remover del stack si estaba abierto
      const index = modalStack.indexOf(id)
      if (index > -1) {
        modalStack.splice(index, 1)
      }

      // Desbloquear scroll si era el último
      if (modalStack.length === 0 && lockScroll) {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.paddingRight = ''
        document.body.style.overflow = ''
      }
    }
  }, [id, lockScroll])

  // Marcar que ya no es el primer render
  useEffect(() => {
    isFirstRender.current = false
  }, [])

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
    id,
    modalProps: {
      open: isOpen,
      onOpenChange: setIsOpen,
    },
  }
}

/**
 * Hook para manejar datos asociados a un modal
 * Útil para modales de edición que necesitan cargar datos
 */
export function useModalWithData<T>(options: UseModalOptions = {}) {
  const modal = useModal(options)
  const [data, setData] = useState<T | null>(null)

  const openWithData = useCallback((newData: T) => {
    setData(newData)
    modal.open()
  }, [modal])

  const closeAndClear = useCallback(() => {
    modal.close()
    // Limpiar datos después de la animación de cierre
    setTimeout(() => setData(null), 200)
  }, [modal])

  return {
    ...modal,
    data,
    setData,
    openWithData,
    closeAndClear,
  }
}

export default useModal
