import { motion } from 'framer-motion'
import { PlusIcon, UserGroupIcon, AcademicCapIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const actions = [
  {
    name: 'Nuevo Docente',
    description: 'Agregar un nuevo profesor al sistema',
    icon: UserGroupIcon,
    href: '/docentes?action=new',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    name: 'Nuevo Curso',
    description: 'Crear un nuevo curso académico',
    icon: AcademicCapIcon,
    href: '/cursos?action=new',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    name: 'Ver Estadísticas',
    description: 'Analizar reportes y métricas',
    icon: DocumentChartBarIcon,
    href: '/estadisticas',
    color: 'bg-purple-500 hover:bg-purple-600',
  },
]

const QuickActions = () => {
  return (
    <motion.div
      className="card p-4 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Acciones Rápidas</h3>
      <div className="space-y-2 sm:space-y-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              to={action.href}
              className={`flex items-center p-3 sm:p-4 rounded-lg text-white transition-colors ${action.color} group`}
            >
              <action.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base truncate">{action.name}</div>
                <div className="text-xs sm:text-sm opacity-90 hidden sm:block">{action.description}</div>
              </div>
              <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default QuickActions
