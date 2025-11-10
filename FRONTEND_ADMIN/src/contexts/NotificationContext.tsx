import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Notification } from '../components/Layout/Notifications'
import { onReceiveNotification, offReceiveNotification } from '../lib/signalr'
import api from '../lib/axios'

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  clearNotifications: () => void
  markAsRead: () => void
  loadNotifications: () => Promise<void>
  createNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const STORAGE_KEY = 'app_notifications'

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Cargar notificaciones desde localStorage al iniciar
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
      } catch {
        return []
      }
    }
    return []
  })

  // Cargar notificaciones desde el servidor
  const loadNotifications = async () => {
    try {
      const response = await api.get('/notificaciones')
      const serverNotifications = response.data.map((n: any) => ({
        id: n.id.toString(),
        type: n.tipo,
        action: n.accion,
        nombre: n.mensaje,
        timestamp: new Date(n.fechaCreacion),
        metadata: n.metadata
      }))
      setNotifications(serverNotifications)
      // Guardar en localStorage también
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serverNotifications))
    } catch (error) {
      // Silenciar errores de carga de notificaciones
      // Las notificaciones se crearán localmente al hacer acciones
      console.log('Usando notificaciones locales')
    }
  }

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    // Comentado: no cargar del servidor por problemas de autorización
    // loadNotifications()
    
    // Recargar notificaciones cada 30 segundos (menos frecuente)
    // const interval = setInterval(() => {
    //   loadNotifications()
    // }, 30000)

    // return () => clearInterval(interval)
  }, [])

  // Crear notificación en el servidor (se distribuirá vía SignalR)
  const createNotification = async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    try {
      console.log('📤 Enviando notificación al servidor:', notification)
      
      // Agregar notificación localmente de inmediato
      addNotification(notification)
      
      // Enviar al servidor para distribuir a otros dispositivos
      const response = await api.post('/notificaciones', {
        tipo: notification.type,
        accion: notification.action,
        mensaje: notification.nombre,
        metadata: notification.metadata || null
      })
      
      console.log('✅ Notificación enviada al servidor:', response.data)
    } catch (error) {
      console.error('❌ Error al crear notificación en servidor:', error)
      // La notificación local ya se agregó, así que el usuario la verá de todos modos
    }
  }

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  }, [notifications])

  // Escuchar notificaciones de SignalR
  useEffect(() => {
    const handleNotification = (serverNotification: any) => {
      console.log('📬 Notificación recibida vía SignalR:', serverNotification)
      
      const notification: Notification = {
        id: serverNotification.id.toString(),
        type: serverNotification.tipo,
        action: serverNotification.accion,
        nombre: serverNotification.mensaje,
        timestamp: new Date(serverNotification.fechaCreacion),
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
          console.log('⚠️ Notificación duplicada, ignorando...')
          return prev
        }
        
        console.log('✅ Agregando notificación de SignalR')
        return [notification, ...prev].slice(0, 100)
      })
    }

    onReceiveNotification(handleNotification)

    return () => {
      offReceiveNotification()
    }
  }, [])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    }
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 100))
  }

  const clearNotifications = async () => {
    try {
      await api.delete('/notificaciones')
      setNotifications([])
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error al limpiar notificaciones:', error)
      // Limpiar localmente aunque falle el servidor
      setNotifications([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const markAsRead = () => {
    // Implementar si se necesita marcar como leídas
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
