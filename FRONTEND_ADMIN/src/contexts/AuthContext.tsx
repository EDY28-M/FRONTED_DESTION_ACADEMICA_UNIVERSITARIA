import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'
import type { User, LoginRequest } from '../types'
import { getDeviceInfo, getLocationInfo, isNewDevice, isNewLocation, registerDevice, registerLocation } from '../utils/deviceDetection'
import { useNotifications } from './NotificationContext'
import { startSignalRConnection, stopSignalRConnection } from '../lib/signalr'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Obtener addNotification solo si ya está montado el NotificationProvider
  const getNotifications = () => {
    try {
      return useNotifications()
    } catch {
      return null
    }
  }

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken()
      
      if (token) {
        const storedUser = authService.getUser()
        
        // Intentar validar el token
        const isValid = await authService.validateToken()
        
        if (isValid && storedUser) {
          setUser(storedUser)
        } else {
          // Si el token no es válido, intentar refrescar
          const refreshed = await authService.refreshToken()
          if (refreshed) {
            setUser(refreshed.usuario)
          } else {
            authService.clearAuthData()
          }
        }
      }
      
      setIsLoading(false)
    }

    initAuth()
  }, [])

  // Auto-refresh del token cuando está próximo a expirar
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
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
  }, [user])

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials)
      setUser(response.usuario)
      
      // Conectar a SignalR
      const token = localStorage.getItem('token')
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
