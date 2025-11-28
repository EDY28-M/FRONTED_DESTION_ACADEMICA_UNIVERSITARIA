import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Notification {
  id: string
  type: 'docente' | 'curso' | 'password' | 'login' | 'academico'
  action: 'crear' | 'editar' | 'eliminar' | 'iniciar' | 'matricula' | 'retiro'
  nombre: string
  timestamp: Date
  metadata?: {
    device?: string
    location?: string
    idCurso?: number
    nombreCurso?: string
    periodo?: string
  }
}

interface NotificationsProps {
  notifications: Notification[]
  onClear: () => void
  onMarkAsRead: () => void
}

export const Notifications = ({ notifications, onClear, onMarkAsRead }: NotificationsProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [lastReadCount, setLastReadCount] = useState(() => {
    // Cargar el último conteo leído desde localStorage
    const saved = localStorage.getItem('notifications_last_read_count')
    return saved ? parseInt(saved, 10) : 0
  })
  
  const hasUnread = notifications.length > lastReadCount
  const unreadCount = hasUnread ? notifications.length - lastReadCount : 0

  // Marcar como leídas cuando se abre el panel
  const handleToggle = () => {
    if (!isOpen && notifications.length > 0 && hasUnread) {
      setLastReadCount(notifications.length)
      localStorage.setItem('notifications_last_read_count', notifications.length.toString())
      onMarkAsRead()
    }
    setIsOpen(!isOpen)
  }

  // Limpiar todo
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClear()
    setLastReadCount(0)
    localStorage.setItem('notifications_last_read_count', '0')
  }

  // No necesitamos useEffect porque usamos hasUnread como variable calculada

  const getActionText = (action: string) => {
    switch (action) {
      case 'crear': return 'creó'
      case 'editar': return 'editó'
      case 'eliminar': return 'eliminó'
      case 'iniciar': return 'inició'
      case 'matricula': return 'matriculaste en'
      case 'retiro': return 'retiraste de'
      default: return action
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'crear': return 'text-green-600'
      case 'editar': return 'text-primary-700'
      case 'eliminar': return 'text-red-600'
      case 'iniciar': return 'text-purple-600'
      case 'matricula': return 'text-green-600'
      case 'retiro': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      {/* Botón de campanita */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Badge con contador */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay para cerrar */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm text-gray-900">
                  Notificaciones
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-red-600 hover:text-red-800 hover:underline"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* Lista de notificaciones */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No hay notificaciones
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icono */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            notification.action === 'crear' ? 'bg-green-100' :
                            notification.action === 'editar' ? 'bg-primary-100' :
                            notification.action === 'eliminar' ? 'bg-red-100' :
                            notification.action === 'iniciar' ? 'bg-purple-100' :
                            notification.action === 'matricula' ? 'bg-green-100' :
                            notification.action === 'retiro' ? 'bg-red-100' :
                            'bg-gray-100'
                          }`}>
                            {notification.action === 'crear' && (
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            )}
                            {notification.action === 'editar' && (
                              <svg className="w-4 h-4 text-primary-700" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            )}
                            {notification.action === 'eliminar' && (
                              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            )}
                            {notification.action === 'iniciar' && (
                              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                              </svg>
                            )}
                            {notification.action === 'matricula' && (
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            {notification.action === 'retiro' && (
                              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              {notification.action === 'matricula' || notification.action === 'retiro' ? (
                                <>
                                  Te{' '}
                                  <span className={getActionColor(notification.action)}>
                                    {getActionText(notification.action)}
                                  </span>
                                </>
                              ) : (
                                <>
                                  Se{' '}
                                  <span className={getActionColor(notification.action)}>
                                    {getActionText(notification.action)}
                                  </span>
                                  {' '}
                                  {notification.type === 'password' 
                                    ? 'la contraseña'
                                    : notification.type === 'login'
                                      ? 'sesión'
                                      : notification.type === 'docente' 
                                        ? `el docente:` 
                                        : `el curso:`}
                                </>
                              )}
                            </p>
                            <p className="text-sm text-gray-900 mt-0.5">
                              <span className="font-medium">{notification.nombre}</span>
                            </p>
                            {notification.metadata && (
                              <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                {notification.metadata.periodo && (
                                  <p>📅 Período: {notification.metadata.periodo}</p>
                                )}
                                {notification.metadata.device && (
                                  <p>Dispositivo: {notification.metadata.device}</p>
                                )}
                                {notification.metadata.location && (
                                  <p>Ubicación: {notification.metadata.location}</p>
                                )}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

