import api from '../lib/axios'
import type { LoginRequest, AuthResponse, RefreshTokenRequest, User } from '../types'

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  VALIDATE: '/auth/validate',
  ME: '/auth/me',
  CHANGE_PASSWORD: '/auth/change-password',
}

// Gestión de tokens en localStorage
const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_data'

export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials)
    
    // Guardar tokens y usuario en localStorage
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token)
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.usuario))
    }
    
    return response.data
  },

  // Logout
  async logout(email: string): Promise<void> {
    try {
      await api.post(AUTH_ENDPOINTS.LOGOUT, JSON.stringify(email), {
        headers: { 'Content-Type': 'application/json' }
      })
    } finally {
      // Limpiar localStorage independientemente del resultado
      this.clearAuthData()
    }
  },

  // Refresh token
  async refreshToken(): Promise<AuthResponse | null> {
    const token = this.getToken()
    const refreshToken = this.getRefreshToken()

    if (!token || !refreshToken) {
      return null
    }

    try {
      const request: RefreshTokenRequest = { token, refreshToken }
      const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.REFRESH, request)
      
      // Actualizar tokens
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token)
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken)
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.usuario))
      }
      
      return response.data
    } catch (error) {
      this.clearAuthData()
      return null
    }
  },

  // Validar token
  async validateToken(): Promise<boolean> {
    try {
      await api.get(AUTH_ENDPOINTS.VALIDATE)
      return true
    } catch {
      return false
    }
  },

  // Obtener usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<User>(AUTH_ENDPOINTS.ME)
      localStorage.setItem(USER_KEY, JSON.stringify(response.data))
      return response.data
    } catch {
      return null
    }
  },

  // Cambiar contraseña
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, data)
  },

  // Obtener token del localStorage
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  // Obtener refresh token del localStorage
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  // Obtener usuario del localStorage
  getUser(): User | null {
    const userData = localStorage.getItem(USER_KEY)
    return userData ? JSON.parse(userData) : null
  },

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  // Limpiar datos de autenticación
  clearAuthData(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  // Verificar si el token está próximo a expirar (útil para refresh automático)
  isTokenExpiringSoon(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      // Decodificar JWT (sin validar firma, solo para leer claims)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000 // Convertir a milisegundos
      const currentTime = Date.now()
      const timeUntilExpiration = expirationTime - currentTime
      
      // Si faltan menos de 5 minutos para expirar
      return timeUntilExpiration < 5 * 60 * 1000
    } catch {
      return false
    }
  },

  // Verificar si el token ya expiró
  isTokenExpired(): boolean {
    const token = this.getToken()
    if (!token) return true

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000
      return Date.now() >= expirationTime
    } catch {
      return true
    }
  }
}
