import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  UserCircleIcon,
  UsersIcon,
  BookOpenIcon,
  CalendarIcon,
  EyeIcon,
  KeyIcon,
} from '@heroicons/react/24/outline'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Resumen general del sistema'
  },
  {
    name: 'Gestión Credenciales',
    href: '/docentes/gestion-passwords',
    icon: KeyIcon,
    description: 'Administrar contraseñas de docentes'
  },
  {
    name: 'Cursos',
    href: '/cursos',
    icon: AcademicCapIcon,
    description: 'Gestión de materias'
  },
  {
    name: 'Estudiantes',
    href: '/estudiantes',
    icon: UsersIcon,
    description: 'Crear credenciales de estudiantes'
  },
  {
    name: 'Ver Estudiantes',
    href: '/estudiantes/visualizar',
    icon: EyeIcon,
    description: 'Visualizar datos completos de estudiantes'
  },
  {
    name: 'Cursos Dirigidos',
    href: '/cursos-dirigidos',
    icon: BookOpenIcon,
    description: 'Autorizar matrículas especiales'
  },
  {
    name: 'Períodos',
    href: '/periodos',
    icon: CalendarIcon,
    description: 'Gestionar períodos académicos'
  },
  {
    name: 'Estadísticas',
    href: '/estadisticas',
    icon: ChartBarIcon,
    description: 'Reportes y análisis'
  },
  {
    name: 'Mi Perfil',
    href: '/perfil',
    icon: UserCircleIcon,
    description: 'Configuración de cuenta'
  },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Montserrat', 'Roboto', sans-serif" }}>
      {/* Logo UNIVERSIDAD ACADEMICA */}
      <div className="flex items-center h-20 px-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#003366' }}
          >
            <BookOpenIcon className="w-6 h-6" style={{ color: '#C7A740' }} />
          </div>
          <div className="flex flex-col">
            <span 
              className="text-base font-bold leading-tight"
              style={{ color: '#003366' }}
            >
              UNIVERSIDAD
            </span>
            <span 
              className="text-base font-bold leading-tight"
              style={{ color: '#003366' }}
            >
              ACADEMICA
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href
          
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.href}
                onClick={onClose}
                className={clsx(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={clsx(
                    'mr-3 h-5 w-5 transition-colors',
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-400 group-hover:text-gray-600'
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-gray-500 group-hover:text-gray-600">
                    {item.description}
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Panel Administrativo v1.0
          <br />
          © 2025 Sistema Académico
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
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={onClose}
                    >
                      <span className="sr-only">Cerrar sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white">
                  <SidebarContent />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 shadow-sm">
          <SidebarContent />
        </div>
      </div>
    </>
  )
}

export default Sidebar
