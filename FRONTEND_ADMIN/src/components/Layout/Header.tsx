import { useState, Fragment } from 'react'
import { Bars3Icon, MagnifyingGlassIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline'
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
        return 'bg-blue-600'
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

        {/* Search bar */}
        <div className="flex-1 max-w-lg mx-4 lg:mx-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Buscar docentes, cursos..."
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Notifications notifications={notifications} onClear={clearNotifications} onMarkAsRead={markAsRead} />

          {/* Profile Dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-lg p-1">
              <div className={`h-8 w-8 rounded-full ${user ? getAvatarColor(user.rol) : 'bg-gray-600'} flex items-center justify-center`}>
                <span className="text-sm font-medium text-white">
                  {user ? getInitials(user.nombres, user.apellidos) : 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.nombreCompleto || 'Usuario'}
                </div>
                <div className="text-xs text-gray-500">{user?.rol || 'Sin rol'}</div>
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
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.nombreCompleto}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      {user?.rol}
                    </span>
                  </p>
                </div>

                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex w-full items-center px-4 py-2 text-sm`}
                        onClick={() => navigate('/perfil')}
                      >
                        <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        Mi Perfil
                      </button>
                    )}
                  </Menu.Item>
                </div>

                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-red-50 text-red-600' : 'text-gray-700'
                        } group flex w-full items-center px-4 py-2 text-sm`}
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
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
