import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  Home,
  Users,
  BookOpenCheck,
  FolderOpen,
  TrendingUp,
  Calendar,
  UserCog,
  Shield,
  Eye,
  X,
  Zap,
  Clock,
  ClipboardCheck
} from 'lucide-react'
import {
  DocumentTextIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline'
import { Link, useLocation } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    name: 'Gestión Credenciales',
    href: '/admin/docentes/gestion-passwords',
    icon: Shield,
  },
  {
    name: 'Cursos',
    href: '/admin/cursos',
    icon: BookOpenCheck,
  },
  {
    name: 'Horarios',
    href: '/admin/horarios',
    icon: Clock,
  },
  {
    name: 'Asistencias',
    href: '/admin/asistencias',
    icon: ClipboardCheck,
  },
  {
    name: 'Estudiantes',
    href: '/admin/estudiantes',
    icon: Users,
  },
  {
    name: 'Ver Estudiantes',
    href: '/admin/estudiantes/visualizar',
    icon: Eye,
  },
  {
    name: 'Cursos Dirigidos',
    href: '/admin/cursos-dirigidos',
    icon: FolderOpen,
  },
  {
    name: 'Períodos',
    href: '/admin/periodos',
    icon: Calendar,
  },
  {
    name: 'Activación de Cursos',
    href: '/admin/activacion-cursos',
    icon: BookOpenCheck,
  },
  {
    name: 'Estadísticas',
    href: '/admin/estadisticas',
    icon: TrendingUp,
  },
  {
    name: 'Notas Consolidadas',
    href: '/admin/notas-consolidadas',
    icon: DocumentTextIcon,
  },
  {
    name: 'Anuncios',
    href: '/admin/anuncios',
    icon: MegaphoneIcon,
  },
  {
    name: 'Materiales',
    href: '/admin/materiales',
    icon: FolderOpen,
  },
  {
    name: 'Mi Perfil',
    href: '/admin/perfil',
    icon: UserCog,
  },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard'
    }
    // Exact match for /admin/estudiantes to avoid conflict with /admin/estudiantes/visualizar
    if (path === '/admin/estudiantes') {
      return location.pathname === '/admin/estudiantes'
    }
    // For other routes, check exact match or if it starts with the path
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-start rounded-lg bg-white">
            <img
              src="/src/image/fondouni.svg"
              alt="Logo Universidad"
              className="h-8 w-8 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-900 tracking-tight">
                Admin Panel
              </span>
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                Gestión Académica
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href)

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`
                group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${collapsed ? 'justify-center' : ''}
                ${active
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }
              `}
              title={collapsed ? item.name : undefined}
            >
              <item.icon
                className={`h-[18px] w-[18px] shrink-0 transition-colors
                  ${active ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600'}
                `}
              />
              {!collapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-200">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 ${collapsed ? 'justify-center' : ''}`}>
          <Zap className="h-4 w-4 text-emerald-500" />
          {!collapsed && <span className="text-xs font-medium text-zinc-600">Sistema Activo</span>}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-200 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-64 flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-200"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                      onClick={onClose}
                    >
                      <span className="sr-only">Cerrar sidebar</span>
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col overflow-y-auto bg-white">
                  <SidebarContent collapsed={false} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col transition-all duration-300 ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <div className="flex grow flex-col overflow-y-auto border-r border-zinc-200 bg-white">
          <SidebarContent collapsed={isCollapsed} />
        </div>
      </div>
    </>
  )
}

export default Sidebar
