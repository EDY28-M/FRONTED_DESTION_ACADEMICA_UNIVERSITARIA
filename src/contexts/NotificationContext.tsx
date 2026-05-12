import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Notification } from '../components/Layout/Notifications'
import { onReceiveNotification, offReceiveNotification } from '../lib/signalr'
import api from '../lib/axios'
import { appLogger } from '../lib/logger'
import { useAuth } from './AuthContext'

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  clearNotifications: () => void
  markAsRead: () => void
  loadNotifications: () => Promise<void>
  createNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const LEGACY_STORAGE_KEY = 'app_notifications'
const STORAGE_KEY_PREFIX = 'app_notifications_v2'

const normalizeRole = (rol?: string): string => {
  const normalized = (rol || 'usuario').toLowerCase()

  if (normalized.includes('administrador') || normalized.includes('admin')) return 'admin'
  if (normalized.includes('estudiante')) return 'estudiante'
  if (normalized.includes('docente')) return 'docente'

  return normalized.replace(/[^a-z0-9_-]/g, '') || 'usuario'
}

const getStorageKeyForUser = (user: { id?: number; rol?: string } | null): string => {
  if (!user || typeof user.id !== 'number') {
    return `${STORAGE_KEY_PREFIX}:anon`
  }

  return `${STORAGE_KEY_PREFIX}:${normalizeRole(user.rol)}:${user.id}`
}

const parseStoredNotifications = (raw: string | null): Notification[] => {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.map((n: any) => ({
      ...n,
      timestamp: new Date(n.timestamp)
    }))
  } catch {
    return []
  }
}

const isAuthScreenPath = (path: string): boolean => {
  return /\/(login|forgot-password|reset-password)$/.test(path)
}

const canRoleUsePortalNotifications = (path: string, role: string): boolean => {
  if (path.startsWith('/docente')) return false
  if (path.startsWith('/admin')) return role === 'admin'
  if (path.startsWith('/estudiante')) return role === 'estudiante'

  return role === 'admin' || role === 'estudiante'
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const storageKey = getStorageKeyForUser(user)
  const storageKeyRef = useRef(storageKey)

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    return parseStoredNotifications(localStorage.getItem(storageKey))
  })

  const canUseServerNotifications = useCallback((): boolean => {
    if (!isAuthenticated || !localStorage.getItem('auth_token')) {
      return false
    }

    const currentPath = location.pathname.toLowerCase()
    if (isAuthScreenPath(currentPath)) {
      return false
    }

    return canRoleUsePortalNotifications(currentPath, normalizeRole(user?.rol))
  }, [isAuthenticated, location.pathname, user?.rol])

  // Cargar notificaciones desde el servidor
  const loadNotifications = useCallback(async () => {
    // Evitar peticiones 401 por ruta/rol/token no compatibles.
    if (!canUseServerNotifications()) {
      return
    }

    try {
      const response = await api.get('/notificaciones')
      const serverNotifications = response.data.map((n: any) => ({
        id: n.id.toString(),
        type: n.tipo,
        action: n.accion,
        nombre: n.mensaje,
        timestamp: new Date(n.fechaCreacion),
        leida: n.leida === true || n.leida === 'true',
        metadata: n.metadata
      }))

      setNotifications(serverNotifications)
      // Guardar en localStorage del usuario actual
      localStorage.setItem(storageKeyRef.current, JSON.stringify(serverNotifications))
    } catch (error) {
      // Mantener cache local del usuario actual cuando falle la API.
      appLogger.warn('Remote notifications load failed; using user local cache', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }, [canUseServerNotifications, storageKey])

  // Cambiar cache local cuando cambia el usuario autenticado
  useEffect(() => {
    storageKeyRef.current = storageKey
    if (isAuthenticated) {
      setNotifications(parseStoredNotifications(localStorage.getItem(storageKey)))
    } else {
      setNotifications([])
    }

    // Limpiar clave legacy compartida para cortar contaminacion entre sesiones.
    if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    }
  }, [isAuthenticated, storageKey])

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    if (canUseServerNotifications()) {
      void loadNotifications()
    }
    
    // Recargar notificaciones cada 5 minutos por si acaso (fallback robusto)
    const interval = setInterval(() => {
      if (canUseServerNotifications()) {
        void loadNotifications()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [canUseServerNotifications, loadNotifications])

  // Crear notificación en el servidor (se distribuirá vía SignalR)
  const createNotification = async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    if (!isAuthenticated) {
      return
    }

    if (!canUseServerNotifications()) {
      addNotification(notification)
      return
    }

    try {
      appLogger.debug('Sending notification to server', {
        type: notification.type,
        action: notification.action,
      })
      
      // Agregar notificación localmente de inmediato
      addNotification(notification)
      
      // Enviar al servidor para distribuir a otros dispositivos
      const response = await api.post('/notificaciones', {
        tipo: notification.type,
        accion: notification.action,
        mensaje: notification.nombre,
        metadata: notification.metadata || null
      })
      
      appLogger.debug('Notification sent to server', {
        id: response.data?.id,
      })
    } catch (error) {
      appLogger.error('Failed to create notification on server', error)
      // La notificación local ya se agregó, así que el usuario la verá de todos modos
    }
  }

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    localStorage.setItem(storageKeyRef.current, JSON.stringify(notifications))
  }, [notifications, isAuthenticated])

  // Escuchar notificaciones de SignalR
  useEffect(() => {
    if (!canUseServerNotifications()) {
      return
    }

    const handleNotification = (serverNotification: any) => {
      appLogger.debug('Notification received from SignalR', {
        id: serverNotification?.id,
        type: serverNotification?.tipo,
      })
      
      const notification: Notification = {
        id: serverNotification.id.toString(),
        type: serverNotification.tipo,
        action: serverNotification.accion,
        nombre: serverNotification.mensaje,
        timestamp: new Date(serverNotification.fechaCreacion),
        leida: false,
        metadata: serverNotification.metadata
      }
      
      // Verificar si ya existe una notificación con el mismo mensaje y timestamp reciente (últimos 5 segundos)
      // para evitar duplicados del mismo dispositivo
      setNotifications(prev => {
        const now = new Date().getTime()
        const isDuplicate = prev.some(n => 
          n.nombre === notification.nombre && 
          n.type === notification.type && 
          n.action === notification.action &&
          (now - n.timestamp.getTime()) < 5000 // Dentro de los últimos 5 segundos
        )
        
        if (isDuplicate) {
          appLogger.debug('Duplicated notification ignored')
          return prev
        }
        
        appLogger.debug('Adding SignalR notification to local state')
        return [notification, ...prev].slice(0, 100)
      })
    }

    onReceiveNotification(handleNotification)

    return () => {
      offReceiveNotification()
    }
  }, [canUseServerNotifications])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      leida: false,
    }
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 100))
  }

  const clearNotifications = async () => {
    if (!canUseServerNotifications()) {
      setNotifications([])
      localStorage.removeItem(storageKeyRef.current)
      return
    }

    try {
      await api.delete('/notificaciones')
      setNotifications([])
      localStorage.removeItem(storageKeyRef.current)
    } catch (error) {
      appLogger.error('Failed to clear notifications', error)
      // Limpiar localmente aunque falle el servidor
      setNotifications([])
      localStorage.removeItem(storageKeyRef.current)
    }
  }

  
  const markAsRead = async () => {
    if (!canUseServerNotifications()) {
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
      return
    }

    try {
      const idsNoLeidas = notifications
        .filter(n => n.leida === false)
        .map(n => parseInt(n.id))
        .filter(id => !isNaN(id) && id <= 2147483647); // Prevent SQL Int overflow

      if (idsNoLeidas.length > 0) {
        await api.put('/notificaciones/marcar-leidas', { notificacionIds: idsNoLeidas });
      }
      
      // Update local state immediately for fast UI response
      setNotifications(prev => prev.map(n => ({...n, leida: true})));
    } catch (error) {
      appLogger.error('Failed to mark notifications as read', error);
      // Even if it fails, mask it in the UI for better UX
      setNotifications(prev => prev.map(n => ({...n, leida: true})));
    }
  }


  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      clearNotifications, 
      markAsRead,
      loadNotifications,
      createNotification
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications debe ser usado dentro de NotificationProvider')
  }
  return context
}
