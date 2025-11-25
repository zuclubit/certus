import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import { toast } from 'sonner'

// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Axios instance configurado para el API
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor - Agrega token de autenticación
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('access_token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add tenant ID if available
    const tenantId = localStorage.getItem('tenant_id')
    if (tenantId && config.headers) {
      config.headers['X-Tenant-ID'] = tenantId
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - Maneja errores globalmente
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.response?.data?.error

    // Handle different error status codes
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        toast.error('Sesión expirada', {
          description: 'Por favor, inicia sesión nuevamente',
        })
        break

      case 403:
        // Forbidden
        toast.error('Acceso denegado', {
          description: 'No tienes permisos para realizar esta acción',
        })
        break

      case 404:
        // Not found
        toast.error('No encontrado', {
          description: message || 'El recurso solicitado no existe',
        })
        break

      case 422:
        // Validation error
        toast.error('Error de validación', {
          description: message || 'Por favor, verifica los datos ingresados',
        })
        break

      case 429:
        // Too many requests
        toast.error('Demasiadas solicitudes', {
          description: 'Por favor, espera un momento antes de intentar nuevamente',
        })
        break

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        toast.error('Error del servidor', {
          description: 'Ocurrió un error. Por favor, intenta nuevamente más tarde',
        })
        break

      default:
        // Generic error
        if (message) {
          toast.error('Error', {
            description: message,
          })
        }
    }

    return Promise.reject(error)
  }
)

/**
 * Helper function para manejar refresh token
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return null

    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    })

    const newAccessToken = response.data.accessToken
    localStorage.setItem('access_token', newAccessToken)

    return newAccessToken
  } catch (error) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
    return null
  }
}

/**
 * Helper para hacer requests con manejo de errores
 */
export const safeRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>
): Promise<T | null> => {
  try {
    const response = await requestFn()
    return response.data
  } catch (error) {
    console.error('API Request Error:', error)
    return null
  }
}

export default apiClient
