import { motion } from 'framer-motion'
import { ClockIcon, UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

const activities = [
  {
    id: 1,
    type: 'docente',
    title: 'Nuevo docente registrado',
    description: 'Dr. Juan Pérez - Ingeniero de Sistemas',
    time: 'Hace 2 horas',
    icon: UserIcon,
    color: 'bg-blue-500',
  },
  {
    id: 2,
    type: 'curso',
    title: 'Curso actualizado',
    description: 'Programación Web - Ciclo 5',
    time: 'Hace 4 horas',
    icon: AcademicCapIcon,
    color: 'bg-green-500',
  },
  {
    id: 3,
    type: 'docente',
    title: 'Perfil actualizado',
    description: 'Dra. María García - Matemática',
    time: 'Ayer',
    icon: UserIcon,
    color: 'bg-blue-500',
  },
  {
    id: 4,
    type: 'curso',
    title: 'Nuevo curso creado',
    description: 'Base de Datos II - Ciclo 6',
    time: 'Hace 2 días',
    icon: AcademicCapIcon,
    color: 'bg-green-500',
  },
]

const RecentActivity = () => {
  return (
    <motion.div
      className="card p-4 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center mb-3 sm:mb-4">
        <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 flex-shrink-0" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900">Actividad Reciente</h3>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="flex items-start space-x-2 sm:space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className={`flex-shrink-0 p-1 sm:p-1.5 rounded-lg ${activity.color}`}>
              <activity.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {activity.title}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 truncate">
                {activity.description}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {activity.time}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
        <button className="w-full text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
          Ver toda la actividad
        </button>
      </div>
    </motion.div>
  )
}

export default RecentActivity
