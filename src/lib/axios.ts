import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// Usar ruta relativa para que funcione con el proxy de Vite
const API_BASE_URL = '/api'

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
    const token = localStorage.getItem('auth_token')
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
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
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/refresh')) {
        // Si falla login o refresh, limpiar datos y redirigir
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        window.location.href = '/login'
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
        window.location.href = '/login'
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
        
        // Si falla el refresh, limpiar datos y redirigir al login
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        window.location.href = '/login'
        
        return Promise.reject(refreshError)
      }
    }

    // Para otros errores, simplemente rechazar
    return Promise.reject(error)
  }
)

export default api
