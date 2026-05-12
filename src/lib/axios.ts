import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { appLogger } from './logger'
import { addUserActionBreadcrumb, trackUserAction } from './monitoring'

type ActionTrackingContext = {
  actionName: string
  method: string
  url: string
  path: string
}

type TrackingRequestConfig = InternalAxiosRequestConfig & {
  __actionTracking?: ActionTrackingContext
}

const mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

const sanitizeUrlForTracking = (url?: string): string => {
  if (!url) return ''

  const [pathOnly] = url.split('?')

  return pathOnly
    .replace(/\/\d+(?=\/|$)/g, '/:id')
    .replace(/\/[0-9a-fA-F-]{8,}(?=\/|$)/g, '/:id')
}

const inferActionName = (method: string, url: string): string => {
  if (url.includes('/auth/login')) return 'auth.login'
  if (url.includes('/auth/logout')) return 'auth.logout'
  if (url.includes('/auth/refresh')) return 'auth.refresh'

  const resource = url.replace(/^\//, '').split('/')[0] || 'resource'

  if (method === 'POST') return `${resource}.create`
  if (method === 'DELETE') return `${resource}.delete`

  return `${resource}.update`
}

// En desarrollo usa proxy de Vite (/api), en producción usa VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
})

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Request interceptor: agregar token JWT a las peticiones
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const trackedConfig = config as TrackingRequestConfig

    // ESTRATEGIA: Usar SOLO la ruta actual de la página para determinar qué token usar
    // Esto evita conflictos cuando hay múltiples sesiones activas
    const currentPath = window.location.pathname

    let token: string | null = null
    let tokenType = 'default'

    // Determinar el token basándose ÚNICAMENTE en la ruta de la página
    if (currentPath.startsWith('/docente')) {
      // Estamos en portal de DOCENTE
      token = localStorage.getItem('docenteToken')
      tokenType = 'Docente'
    } else if (currentPath.startsWith('/admin')) {
      // Estamos en portal de ADMIN
      token = localStorage.getItem('auth_token')
      tokenType = 'Admin'
    } else if (currentPath.startsWith('/estudiante')) {
      // Estamos en portal de ESTUDIANTE
      token = localStorage.getItem('auth_token')
      tokenType = 'Estudiante'
    } else {
      // Ruta desconocida, usar auth_token por defecto
      token = localStorage.getItem('auth_token')
      tokenType = 'Default'
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    appLogger.debug('HTTP request started', {
      method: config.method?.toUpperCase(),
      url: config.url,
      context: tokenType,
    })

    const method = config.method?.toUpperCase() ?? 'GET'
    const trackingUrl = sanitizeUrlForTracking(config.url)

    if (mutationMethods.has(method)) {
      const actionName = inferActionName(method, trackingUrl)
      const trackingContext: ActionTrackingContext = {
        actionName,
        method,
        url: trackingUrl,
        path: currentPath,
      }

      trackedConfig.__actionTracking = trackingContext
      addUserActionBreadcrumb(actionName, trackingContext, 'attempt')
    }

    return config
  },
  (error) => {
    appLogger.error('HTTP request interceptor failed', error)
    return Promise.reject(error)
  }
)

// Response interceptor: manejar errores y refresh token
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const trackedConfig = response.config as TrackingRequestConfig

    appLogger.debug('HTTP response received', {
      status: response.status,
      url: response.config.url,
    })

    if (trackedConfig.__actionTracking) {
      trackUserAction(trackedConfig.__actionTracking.actionName, {
        ...trackedConfig.__actionTracking,
        statusCode: response.status,
      }, 'success')
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config as TrackingRequestConfig

    appLogger.error('HTTP response failed', error, {
      status: error.response?.status,
      url: originalRequest?.url,
      payload: error.response?.data || error.message,
    })

    if (originalRequest?.__actionTracking) {
      trackUserAction(originalRequest.__actionTracking.actionName, {
        ...originalRequest.__actionTracking,
        statusCode: error.response?.status,
        reason: error.message,
      }, 'failure')
      addUserActionBreadcrumb(originalRequest.__actionTracking.actionName, {
        ...originalRequest.__actionTracking,
        statusCode: error.response?.status,
      }, 'failure')
    }

    // Si es error 401 y no es la ruta de login/refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      const currentPath = window.location.pathname;
      let targetLoginUrl = '/admin/login';
      if (currentPath.startsWith('/docente')) {
        targetLoginUrl = '/docente/login';
      } else if (currentPath.startsWith('/estudiante')) {
        targetLoginUrl = '/estudiante/login';
      }

      if (originalRequest.url?.includes('/auth/login')) {
        // Si falla login, solo limpiar datos y rechazar el error (no redirigir)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('docenteToken')
        localStorage.removeItem('docenteData')
        return Promise.reject(error)
      }

      if (originalRequest.url?.includes('/auth/refresh')) {
        // Si falla refresh, limpiar datos y redirigir al login correcto
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('docenteToken')
        localStorage.removeItem('docenteData')
        
        if (currentPath !== targetLoginUrl) {
          window.location.href = targetLoginUrl;
        }
        return Promise.reject(error)
      }

      // Si es docente y recibe 401, redirigir directamente al login de docente
      if (currentPath.startsWith('/docente')) {
        localStorage.removeItem('docenteToken')
        localStorage.removeItem('docenteData')
        if (currentPath !== targetLoginUrl) {
          window.location.href = targetLoginUrl
        }
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Si ya se está refrescando, encolar la petición
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')
      const currentToken = localStorage.getItem('auth_token')

      if (!refreshToken || !currentToken) {
        // Si faltan tokens, limpiar TODO
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        
        if (currentPath !== targetLoginUrl) {
          window.location.href = targetLoginUrl
        }
        return Promise.reject(error)
      }

      try {
        // Intentar refrescar el token usando la instancia api (que usa el proxy)
        const response = await api.post('/auth/refresh', {
          token: currentToken,
          refreshToken: refreshToken
        })

        const { token: newToken, refreshToken: newRefreshToken } = response.data

        // Actualizar tokens
        localStorage.setItem('auth_token', newToken)
        localStorage.setItem('refresh_token', newRefreshToken)

        if (response.data.usuario) {
          localStorage.setItem('user_data', JSON.stringify(response.data.usuario))
        }

        // Actualizar header del request original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }

        processQueue(null, newToken)
        isRefreshing = false

        // Reintentar request original con nuevo token
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false

        // Si falla el refresh, limpiar datos y redirigir al login correcto
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('docenteToken')
        localStorage.removeItem('docenteData')
        
        if (currentPath !== targetLoginUrl) {
          window.location.href = targetLoginUrl
        }

        return Promise.reject(refreshError)
      }
    }

    // Para otros errores, simplemente rechazar
    return Promise.reject(error)
  }
)

export default api
