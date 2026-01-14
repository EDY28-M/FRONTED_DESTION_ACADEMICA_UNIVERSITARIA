import { useState, Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'
import { Notifications } from './Notifications'
import { useNotifications } from '../../contexts/NotificationContext'
import {
  Menu as MenuIcon,
  LogOut,
  User,
  KeyRound,
  ChevronRight
} from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  onToggleCollapse?: () => void
  isCollapsed?: boolean
}

// Breadcrumb mapping
const routeNames: Record<string, string> = {
  'dashboard': 'Dashboard',
  'docentes': 'Docentes',
  'gestion-passwords': 'Gestión Credenciales',
  'cursos': 'Cursos',
  'estudiantes': 'Estudiantes',
  'visualizar': 'Visualizar',
  'cursos-dirigidos': 'Cursos Dirigidos',
  'periodos': 'Períodos',
  'estadisticas': 'Estadísticas',
  'perfil': 'Mi Perfil',
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onToggleCollapse, isCollapsed = false }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { notifications, clearNotifications, markAsRead } = useNotifications()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Generate breadcrumbs from current path
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    return pathSegments.map((segment, index) => ({
      name: routeNames[segment] || segment,
      path: '/' + pathSegments.slice(0, index + 1).join('/'),
      isLast: index === pathSegments.length - 1
    }))
  }

  const breadcrumbs = getBreadcrumbs()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast.success('Sesión cerrada exitosamente')
      navigate('/admin/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('Error al cerrar sesión')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Get user initials
  const getInitials = (nombres: string, apellidos: string): string => {
    const firstInitial = nombres?.charAt(0)?.toUpperCase() || ''
    const lastInitial = apellidos?.charAt(0)?.toUpperCase() || ''
    return `${firstInitial}${lastInitial}`
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-zinc-200">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Left: Mobile menu + Breadcrumbs */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden flex items-center justify-center h-9 w-9 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            onClick={onMenuClick}
          >
            <span className="sr-only">Abrir menú</span>
            <MenuIcon className="h-5 w-5" />
          </button>

          {/* Desktop collapse button */}
          {onToggleCollapse && (
            <button
              type="button"
              className="hidden lg:flex items-center justify-center h-9 w-9 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              onClick={onToggleCollapse}
            >
              <span className="sr-only">{isCollapsed ? 'Expandir menú' : 'Contraer menú'}</span>
              <MenuIcon className="h-5 w-5" />
            </button>
          )}

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
            <span className="text-zinc-500 shrink-0">Admin</span>
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={crumb.path}>
                <ChevronRight className="h-4 w-4 text-zinc-300" />
                {crumb.isLast ? (
                  <span className="font-medium text-zinc-900">{crumb.name}</span>
                ) : (
                  <button
                    onClick={() => navigate(crumb.path)}
                    className="text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    {crumb.name}
                  </button>
                )}
              </Fragment>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Notifications notifications={notifications} onClear={clearNotifications} onMarkAsRead={markAsRead} />

          {/* Profile Dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-100 transition-colors">
              <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                <User className="h-4 w-4 text-zinc-600" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-zinc-900">
                  {user?.nombres || 'Usuario'}
                </div>
                <div className="text-xs text-zinc-500">
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
              <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right bg-white shadow-lg ring-1 ring-zinc-200 focus:outline-none z-50">
                {/* Profile Header */}
                <div className="px-4 py-3 border-b border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                      <span className="text-sm font-semibold text-zinc-900">
                        {user ? getInitials(user.nombres, user.apellidos) : 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {user?.nombres} {user?.apellidos}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {user?.rol}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${active ? 'bg-zinc-50' : ''} flex w-full items-center gap-3 px-4 py-2 text-sm text-zinc-700`}
                        onClick={() => navigate('/admin/perfil')}
                      >
                        <User className="h-4 w-4 text-zinc-400" />
                        Información Personal
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${active ? 'bg-zinc-50' : ''} flex w-full items-center gap-3 px-4 py-2 text-sm text-zinc-700`}
                        onClick={() => navigate('/admin/perfil', { state: { openChangePassword: true } })}
                      >
                        <KeyRound className="h-4 w-4 text-zinc-400" />
                        Cambiar Contraseña
                      </button>
                    )}
                  </Menu.Item>
                </div>

                {/* Logout */}
                <div className="border-t border-zinc-100 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${active ? 'bg-red-50' : ''} flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600`}
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        <LogOut className="h-4 w-4" />
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
    </header>
  )
}

export default Header
