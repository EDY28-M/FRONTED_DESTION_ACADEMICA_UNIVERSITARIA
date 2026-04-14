import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

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

    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url} [Context: ${tokenType}]`)
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor: manejar errores y refresh token
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ ${response.status} ${response.config.url}`)
    return response
  },
  async (error) => {
    const originalRequest = error.config

    console.error('❌ Response error:', error.response?.data || error.message)

    // Si es error 401 y no es la ruta de login/refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Detectar si es docente ANTES de cualquier otra lógica
      const isDocente = !!localStorage.getItem('docenteToken')

      if (originalRequest.url?.includes('/auth/login')) {
        // Si falla login, solo limpiar datos y rechazar el error (no redirigir)
        // El componente manejará el error y mostrará el mensaje correspondiente
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        if (isDocente) {
          localStorage.removeItem('docenteToken')
          localStorage.removeItem('docenteData')
        }
        return Promise.reject(error)
      }

      if (originalRequest.url?.includes('/auth/refresh')) {
        // Si falla refresh, limpiar datos y redirigir al login correcto
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('docenteToken')
        localStorage.removeItem('docenteData')
        window.location.href = isDocente ? '/docente/login' : '/admin/login'
        return Promise.reject(error)
      }

      // Si es docente y recibe 401, redirigir directamente al login de docente
      // (no intentar hacer refresh porque el sistema de refresh puede ser diferente)
      if (isDocente) {
        localStorage.removeItem('docenteToken')
        localStorage.removeItem('docenteData')
        if (window.location.pathname !== '/docente/login') {
          window.location.href = '/docente/login'
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

      // isDocente ya está declarado arriba, reutilizamos esa variable
      const refreshToken = localStorage.getItem('refresh_token')
      const currentToken = localStorage.getItem('auth_token')

      if (!refreshToken || !currentToken) {
        // Si faltan tokens, limpiar TODO
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        
        // Si es docente, redirigir al login de docente
        if (isDocente) {
          localStorage.removeItem('docenteToken')
          localStorage.removeItem('docenteData')
          if (window.location.pathname !== '/docente/login') {
            window.location.href = '/docente/login'
          }
        } else {
          if (window.location.pathname !== '/admin/login' && window.location.pathname !== '/estudiante/login') {
            window.location.href = '/admin/login'
          }
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
        const wasDocente = !!localStorage.getItem('docenteToken')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('docenteToken')
        localStorage.removeItem('docenteData')
        
        const targetUrl = wasDocente ? '/docente/login' : '/admin/login'
        if (window.location.pathname !== targetUrl && window.location.pathname !== '/estudiante/login') {
          window.location.href = targetUrl
        }

        return Promise.reject(refreshError)
      }
    }

    // Para otros errores, simplemente rechazar
    return Promise.reject(error)
  }
)

export default api
