import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'
import type { User, LoginRequest } from '../types'
import { getDeviceInfo, getLocationInfo, isNewDevice, isNewLocation, registerDevice, registerLocation } from '../utils/deviceDetection'
import { useNotifications } from './NotificationContext'
import { startSignalRConnection, stopSignalRConnection } from '../lib/signalr'
import { queryClient } from '../lib/queryClient'

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

  // Obtener addNotification solo si ya está montado el NotificationProvider
  const getNotifications = () => {
    try {
      return useNotifications()
    } catch {
      return null
    }
  }

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
        console.log('Sesión expirada por inactividad')
        await logout()
        return
      }

      // Si el usuario está activo y el token va a expirar, refrescar
      if (authService.isTokenExpiringSoon()) {
        console.log('Token próximo a expirar, refrescando...')
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
          console.log('✅ SignalR conectado')
        } catch (error) {
          console.error('Error al conectar SignalR:', error)
        }
      }

      // Cargar notificaciones desde el servidor
      setTimeout(async () => {
        const notificationContext = getNotifications()
        if (notificationContext) {
          await notificationContext.loadNotifications()

          // Detectar dispositivo y ubicación
          const deviceInfo = getDeviceInfo()
          const location = await getLocationInfo()

          const isNewDev = isNewDevice(deviceInfo.fingerprint)
          const isNewLoc = isNewLocation(location)

          // Si es un nuevo dispositivo o ubicación, crear notificación en el servidor
          if (isNewDev || isNewLoc) {
            let message = ''
            if (isNewDev && isNewLoc) {
              message = 'Nuevo dispositivo y ubicación'
            } else if (isNewDev) {
              message = 'Nuevo dispositivo detectado'
            } else {
              message = 'Nueva ubicación detectada'
            }

            await notificationContext.createNotification({
              type: 'login',
              action: 'iniciar',
              nombre: message,
              metadata: {
                device: `${deviceInfo.deviceType} - ${deviceInfo.browser} en ${deviceInfo.os}`,
                location: location
              }
            })
          }

          // Registrar dispositivo y ubicación
          registerDevice(deviceInfo.fingerprint)
          registerLocation(location)
        }
      }, 1000)

      return response.usuario
    } catch (error) {
      console.error('Error en login:', error)
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
      console.error('Error en logout:', error)
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
      console.error('Error al refrescar usuario:', error)
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
