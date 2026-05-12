import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'
import type { User, LoginRequest } from '../types'
import { getDeviceInfo, getLocationInfo, isNewDevice, isNewLocation, registerDevice, registerLocation } from '../utils/deviceDetection'
import { startSignalRConnection, stopSignalRConnection } from '../lib/signalr'
import { queryClient } from '../lib/queryClient'
import { appLogger } from '../lib/logger'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Inicializar con datos del localStorage para carga instantánea
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = authService.getUser()
    const token = authService.getToken()
    // Si hay token y usuario almacenado, confiar en ellos inicialmente
    return token && storedUser ? storedUser : null
  })
  const [isLoading, setIsLoading] = useState(false) // Cambiar a false para carga instantánea

  // Estado para controlar la inactividad
  const [lastActivity, setLastActivity] = useState(Date.now())
  const INACTIVITY_LIMIT = 30 * 60 * 1000 // 30 minutos

  // Actualizar tiempo de última actividad
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now())

    window.addEventListener('mousemove', updateActivity)
    window.addEventListener('keydown', updateActivity)
    window.addEventListener('click', updateActivity)
    window.addEventListener('scroll', updateActivity)

    return () => {
      window.removeEventListener('mousemove', updateActivity)
      window.removeEventListener('keydown', updateActivity)
      window.removeEventListener('click', updateActivity)
      window.removeEventListener('scroll', updateActivity)
    }
  }, [])

  // Validar token en segundo plano (sin bloquear la UI)
  useEffect(() => {
    const validateAuthInBackground = async () => {
      const token = authService.getToken()

      if (!token) {
        setUser(null)
        return
      }

      // Verificar si el token ya expiró localmente (sin llamada al servidor)
      if (authService.isTokenExpired()) {
        // Intentar refrescar silenciosamente
        const refreshed = await authService.refreshToken()
        if (refreshed) {
          setUser(refreshed.usuario)
        } else {
          setUser(null)
          authService.clearAuthData()
        }
      }
      // Si el token no ha expirado, confiar en los datos locales
    }

    validateAuthInBackground()
  }, [])

  // Auto-refresh del token y chequeo de inactividad
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      const timeSinceLastActivity = Date.now() - lastActivity

      // Si ha pasado el tiempo límite de inactividad
      if (timeSinceLastActivity > INACTIVITY_LIMIT) {
        appLogger.info('Session expired due to inactivity')
        await logout()
        return
      }

      // Si el usuario está activo y el token va a expirar, refrescar
      if (authService.isTokenExpiringSoon()) {
        appLogger.debug('Token close to expiration; refreshing token')
        const refreshed = await authService.refreshToken()
        if (refreshed) {
          setUser(refreshed.usuario)
        } else {
          // Si no se puede refrescar, cerrar sesión
          await logout()
        }
      }
    }, 60000) // Verificar cada minuto

    return () => clearInterval(interval)
  }, [user, lastActivity])

  const login = async (credentials: LoginRequest): Promise<User> => {
    try {
      const response = await authService.login(credentials)
      setUser(response.usuario)

      // Conectar a SignalR
      const token = authService.getToken()
      if (token) {
        try {
          await startSignalRConnection(token)
          appLogger.info('SignalR connected after login')
        } catch (error) {
          appLogger.error('SignalR connection failed during login', error)
        }
      }

      // Cargar notificaciones desde el servidor
      setTimeout(async () => {
        try {
          // Detectar dispositivo y ubicación
          const deviceInfo = getDeviceInfo()
          const location = await getLocationInfo()

          const isNewDev = isNewDevice(deviceInfo.fingerprint)
          const isNewLoc = isNewLocation(location)

          // Registrar dispositivo y ubicación limpia localmente
          if (isNewDev || isNewLoc) {
            appLogger.info('New login context detected', {
              newDevice: isNewDev,
              newLocation: isNewLoc,
            });
          }
          registerDevice(deviceInfo.fingerprint)
          registerLocation(location)
        } catch(e) {
          appLogger.error('Failed to register device or location metadata', e)
        }
      }, 1000)

      return response.usuario
    } catch (error) {
      appLogger.error('Login failed', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      if (user?.email) {
        await authService.logout(user.email)
      }
      // Desconectar SignalR
      await stopSignalRConnection()
    } catch (error) {
      appLogger.error('Logout failed', error)
    } finally {
      setUser(null)
      authService.clearAuthData()
      // Limpiar toda la caché de React Query para evitar datos de sesiones anteriores
      queryClient.clear()
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
    } catch (error) {
      appLogger.error('Failed to refresh current user', error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
