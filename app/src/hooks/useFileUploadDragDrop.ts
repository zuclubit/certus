/**
 * useFileUploadDragDrop Hook
 *
 * Custom hook for drag & drop file upload functionality
 * Handles file validation, drag events, and upload state
 */

import { useState, useCallback, useRef } from 'react'
import type { FileType } from '@/lib/constants'

export interface UseFileUploadDragDropOptions {
  maxFileSize?: number // in bytes
  acceptedFileTypes?: string[]
  maxFiles?: number
  onFilesSelected?: (files: File[]) => void
  onError?: (error: string) => void
}

export interface UseFileUploadDragDropReturn {
  files: File[]
  isDragging: boolean
  isUploading: boolean
  uploadProgress: number
  error: string | null
  addFiles: (newFiles: File[]) => void
  removeFile: (index: number) => void
  clearFiles: () => void
  handleDragEnter: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setIsUploading: (uploading: boolean) => void
  setUploadProgress: (progress: number) => void
  fileInputRef: React.RefObject<HTMLInputElement>
}

/**
 * Default accepted file types for CONSAR files
 */
const DEFAULT_ACCEPTED_TYPES = ['.txt', '.csv', '.dat', 'text/plain', 'text/csv']

/**
 * Default max file size: 50MB
 */
const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024

/**
 * Hook for drag & drop file upload
 */
export function useFileUploadDragDrop(
  options: UseFileUploadDragDropOptions = {}
): UseFileUploadDragDropReturn {
  const {
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
    maxFiles = 10,
    onFilesSelected,
    onError,
  } = options

  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  /**
   * Validate file type
   */
  const isValidFileType = useCallback(
    (file: File): boolean => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const mimeType = file.type.toLowerCase()

      return acceptedFileTypes.some(
        (type) => type === fileExtension || type === mimeType || type === '*'
      )
    },
    [acceptedFileTypes]
  )

  /**
   * Validate file size
   */
  const isValidFileSize = useCallback(
    (file: File): boolean => {
      return file.size <= maxFileSize
    },
    [maxFileSize]
  )

  /**
   * Validate files
   */
  const validateFiles = useCallback(
    (filesToValidate: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = []
      const errors: string[] = []

      for (const file of filesToValidate) {
        // Check file type
        if (!isValidFileType(file)) {
          errors.push(
            `${file.name}: Tipo de archivo no soportado. Formatos aceptados: ${acceptedFileTypes.join(', ')}`
          )
          continue
        }

        // Check file size
        if (!isValidFileSize(file)) {
          const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2)
          errors.push(`${file.name}: Archivo demasiado grande. Tamaño máximo: ${maxSizeMB}MB`)
          continue
        }

        // Check for duplicates
        if (files.some((f) => f.name === file.name && f.size === file.size)) {
          errors.push(`${file.name}: Archivo ya agregado`)
          continue
        }

        valid.push(file)
      }

      // Check max files limit
      if (files.length + valid.length > maxFiles) {
        errors.push(`Máximo ${maxFiles} archivos permitidos`)
        return { valid: [], errors }
      }

      return { valid, errors }
    },
    [files, isValidFileType, isValidFileSize, maxFileSize, acceptedFileTypes, maxFiles]
  )

  /**
   * Add files
   */
  const addFiles = useCallback(
    (newFiles: File[]) => {
      const { valid, errors } = validateFiles(newFiles)

      if (errors.length > 0) {
        const errorMessage = errors.join('\n')
        setError(errorMessage)
        onError?.(errorMessage)
        return
      }

      setError(null)
      setFiles((prev) => [...prev, ...valid])
      onFilesSelected?.(valid)
    },
    [validateFiles, onFilesSelected, onError]
  )

  /**
   * Remove file by index
   */
  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setError(null)
  }, [])

  /**
   * Clear all files
   */
  const clearFiles = useCallback(() => {
    setFiles([])
    setError(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  /**
   * Handle drag enter
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounterRef.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  /**
   * Handle drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setIsDragging(false)
      dragCounterRef.current = 0

      const droppedFiles = Array.from(e.dataTransfer.files)
      if (droppedFiles.length > 0) {
        addFiles(droppedFiles)
      }
    },
    [addFiles]
  )

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (selectedFiles && selectedFiles.length > 0) {
        addFiles(Array.from(selectedFiles))
      }
    },
    [addFiles]
  )

  return {
    files,
    isDragging,
    isUploading,
    uploadProgress,
    error,
    addFiles,
    removeFile,
    clearFiles,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileInputChange,
    setIsUploading,
    setUploadProgress,
    fileInputRef,
  }
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'txt':
      return '📄'
    case 'csv':
      return '📊'
    case 'dat':
      return '💾'
    case 'pdf':
      return '📑'
    case 'xlsx':
    case 'xls':
      return '📈'
    default:
      return '📁'
  }
}
