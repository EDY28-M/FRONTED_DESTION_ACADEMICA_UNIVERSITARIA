import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  Home,
  Users,
  BookOpenCheck,
  FolderOpen,
  Calendar,
  UserCog,
  Shield,
  Eye,
  X,
  Clock,
  ClipboardCheck,
  LayoutGrid
} from 'lucide-react'
import {
  DocumentTextIcon,
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
    section: 'main'
  },
  {
    name: 'Credenciales',
    href: '/admin/docentes/gestion-passwords',
    icon: Shield,
    section: 'main'
  },
  {
    name: 'Cursos',
    href: '/admin/cursos',
    icon: BookOpenCheck,
    section: 'main'
  },
  {
    name: 'Horarios',
    href: '/admin/horarios',
    icon: Clock,
    section: 'main'
  },
  {
    name: 'Asistencias',
    href: '/admin/asistencias',
    icon: ClipboardCheck,
    section: 'main'
  },
  {
    name: 'Estudiantes',
    href: '/admin/estudiantes',
    icon: Users,
    section: 'main'
  },
  {
    name: 'Ver Estudiantes',
    href: '/admin/estudiantes/visualizar',
    icon: Eye,
    section: 'main'
  },
  {
    name: 'Cursos Dirigidos',
    href: '/admin/cursos-dirigidos',
    icon: FolderOpen,
    section: 'system'
  },
  {
    name: 'Períodos',
    href: '/admin/periodos',
    icon: Calendar,
    section: 'system'
  },
  {
    name: 'Activación de Cursos',
    href: '/admin/activacion-cursos',
    icon: BookOpenCheck,
    section: 'system'
  },
  {
    name: 'Notas Consolidadas',
    href: '/admin/notas-consolidadas',
    icon: DocumentTextIcon,
    section: 'system'
  },
  {
    name: 'Mi Perfil',
    href: '/admin/perfil',
    icon: UserCog,
    section: 'system'
  },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed = false }) => {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard'
    }
    if (path === '/admin/estudiantes') {
      return location.pathname === '/admin/estudiantes'
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-lime-400 flex items-center justify-center">
            <LayoutGrid className="text-zinc-900 w-5 h-5" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-sm tracking-widest uppercase text-white">
                ADMIN<span className="text-lime-400">.SYS</span>
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Main Module */}
        <div className="px-3 mb-2">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-2 pl-3">Módulo Principal</p>
          {navigation.filter(item => item.section === 'main').map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 transition-all group border-l-2 ${active
                  ? 'bg-zinc-800 text-lime-400 border-lime-400'
                  : 'text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-600'
                  } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
              </Link>
            )
          })}
        </div>

        {/* System */}
        <div className="px-3 mt-6 mb-2">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-2 pl-3">Sistema</p>
          {navigation.filter(item => item.section === 'system').map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 transition-all group border-l-2 ${active
                  ? 'bg-zinc-800 text-lime-400 border-lime-400'
                  : 'text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-600'
                  } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <div className={`bg-black border border-zinc-700 p-3 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-1.5 h-1.5 bg-green-500 shrink-0"></div>
          {!collapsed && <span className="text-[10px] font-mono text-zinc-300">V.2.4.0 STABLE</span>}
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
            <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm" />
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
                      className="flex h-10 w-10 items-center justify-center hover:bg-white/10 transition-colors"
                      onClick={onClose}
                    >
                      <span className="sr-only">Cerrar sidebar</span>
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col overflow-y-auto bg-zinc-900">
                  <SidebarContent collapsed={false} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col transition-all duration-300 ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <div className="flex grow flex-col overflow-y-auto border-r border-zinc-800 bg-zinc-900">
          <SidebarContent collapsed={isCollapsed} />
        </div>
      </div>
    </>
  )
}

export default Sidebar
