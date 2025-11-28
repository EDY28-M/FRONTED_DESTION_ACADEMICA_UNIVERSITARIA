import { useState, Fragment, useEffect } from 'react'
import { Bars3Icon, ArrowRightOnRectangleIcon, BookOpenIcon, CalendarIcon, GlobeAltIcon, UserIcon, IdentificationIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'
import { Notifications } from './Notifications'
import { useNotifications } from '../../contexts/NotificationContext'

interface HeaderProps {
  onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { notifications, clearNotifications, markAsRead } = useNotifications()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [userIP, setUserIP] = useState<string>('Obteniendo...')
  const [currentDate, setCurrentDate] = useState<string>('')

  // Obtener IP del usuario
  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        setUserIP(data.ip)
      } catch (error) {
        setUserIP('No disponible')
      }
    }
    fetchIP()

    // Obtener fecha y hora actual
    const now = new Date()
    const formattedDate = now.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    })
    setCurrentDate(formattedDate)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast.success('Sesión cerrada exitosamente')
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('Error al cerrar sesión')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Obtener iniciales del usuario
  const getInitials = (nombres: string, apellidos: string): string => {
    const firstInitial = nombres?.charAt(0)?.toUpperCase() || ''
    const lastInitial = apellidos?.charAt(0)?.toUpperCase() || ''
    return `${firstInitial}${lastInitial}`
  }

  // Obtener color del avatar basado en el rol
  const getAvatarColor = (rol: string): string => {
    switch (rol) {
      case 'Administrador':
        return 'bg-purple-600'
      case 'Coordinador':
        return 'bg-primary-700'
      case 'Docente':
        return 'bg-green-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <motion.header 
      className="bg-white border-b border-gray-200 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={onMenuClick}
          >
            <span className="sr-only">Abrir menú</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Bienvenido al sistema SIAGE */}
        <div className="hidden lg:flex items-center">
          <h1 
            className="text-lg font-bold tracking-wide"
            style={{ 
              color: '#003366',
              fontFamily: "'Montserrat', 'Roboto', sans-serif"
            }}
          >
            Bienvenido al sistema SIAGE
          </h1>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Notifications notifications={notifications} onClear={clearNotifications} onMarkAsRead={markAsRead} />

          {/* Profile Dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-lg p-2 hover:bg-gray-50 transition-colors group">
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #003366 0%, #004d99 50%, #0066cc 100%)',
                  border: '2px solid #C7A740',
                  boxShadow: '0 4px 6px -1px rgba(0, 51, 102, 0.3), 0 2px 4px -1px rgba(0, 51, 102, 0.2)'
                }}
              >
                <span className="text-sm font-bold text-white drop-shadow-sm">
                  {user ? getInitials(user.nombres, user.apellidos) : 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div 
                  className="text-sm font-semibold"
                  style={{ 
                    color: '#003366',
                    fontFamily: "'Montserrat', 'Roboto', sans-serif" 
                  }}
                >
                  Hola, {user?.nombres || 'Usuario'}
                </div>
                <div 
                  className="text-xs"
                  style={{ 
                    color: '#6B7280',
                    fontFamily: "'Montserrat', 'Roboto', sans-serif" 
                  }}
                >
                  {user?.rol || 'Sin rol'}
                </div>
              </div>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50" style={{ fontFamily: "'Montserrat', 'Roboto', sans-serif" }}>
                {/* Header del perfil con avatar grande */}
                <div className="px-6 py-5 text-center border-b border-gray-100">
                  <div 
                    className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-md"
                    style={{ backgroundColor: '#003366' }}
                  >
                    <span className="text-white text-xl font-bold">
                      {user ? `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}` : 'U'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 uppercase">
                    {user?.nombres || 'USUARIO'}
                  </h3>
                  <p className="text-sm text-gray-600 uppercase">
                    {user?.apellidos || ''}
                  </p>
                  <span 
                    className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: '#003366' }}
                  >
                    {user?.rol || 'Sin rol'} {user?.id ? String(user.id).padStart(10, '0') : ''}
                  </span>
                </div>

                {/* Último Acceso */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Último Acceso:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-gray-500">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Fecha:
                      </span>
                      <span className="text-gray-700">{currentDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-gray-500">
                        <GlobeAltIcon className="w-4 h-4 mr-2" />
                        Dirección IP:
                      </span>
                      <span className="text-gray-700">{userIP}</span>
                    </div>
                  </div>
                </div>

                {/* Roles Asignados */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Roles Asignados:</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-emerald-600 font-medium">
                      <UserIcon className="w-4 h-4 mr-2" />
                      {user?.rol || 'Sin rol'}
                    </span>
                    <span className="text-gray-600">{user?.id ? String(user.id).padStart(10, '0') : ''}</span>
                  </div>
                </div>

                {/* Opciones del menú */}
                <div className="py-2">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900`}
                        onClick={() => navigate('/perfil')}
                      >
                        <IdentificationIcon className="mr-3 h-5 w-5" style={{ color: '#003366' }} />
                        Información Personal
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900`}
                        onClick={() => navigate('/perfil', { state: { openChangePassword: true } })}
                      >
                        <LockClosedIcon className="mr-3 h-5 w-5" style={{ color: '#003366' }} />
                        Cambiar Contraseña
                      </button>
                    )}
                  </Menu.Item>
                </div>

                {/* Cerrar Sesión */}
                <div className="border-t border-gray-100 py-2">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-red-50' : ''
                        } flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:text-red-700`}
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-red-400" />
                        {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </motion.header>
  )
}

export default Header

