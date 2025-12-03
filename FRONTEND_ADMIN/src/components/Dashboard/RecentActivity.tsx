import { Clock, User, BookOpen, UserPlus, Calendar, UserCheck, Award } from 'lucide-react'

const recentActivities = [
  {
    id: 1,
    type: 'docente',
    title: 'Nuevo docente registrado',
    description: 'María García se ha registrado en el sistema',
    time: 'hace 2 horas',
    user: 'Administrador'
  },
  {
    id: 2,
    type: 'curso',
    title: 'Curso actualizado',
    description: 'Matemáticas I - Horario modificado',
    time: 'hace 4 horas',
    user: 'Juan Pérez'
  },
  {
    id: 3,
    type: 'estudiante',
    title: 'Nueva matrícula',
    description: 'Ana López se matriculó en Física II',
    time: 'hace 6 horas',
    user: 'Sistema'
  },
  {
    id: 4,
    type: 'periodo',
    title: 'Período académico iniciado',
    description: 'Período 2024-I ha comenzado',
    time: 'hace 1 día',
    user: 'Administrador'
  }
]

const iconMap = {
  docente: User,
  curso: BookOpen,
  estudiante: UserPlus,
  periodo: Calendar,
  matricula: UserCheck,
  nota: Award
}

const colorMap = {
  docente: 'bg-blue-100 text-blue-600',
  curso: 'bg-green-100 text-green-600',
  estudiante: 'bg-purple-100 text-purple-600',
  periodo: 'bg-orange-100 text-orange-600',
  matricula: 'bg-indigo-100 text-indigo-600',
  nota: 'bg-yellow-100 text-yellow-600'
}

const RecentActivity = () => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-900">Actividad Reciente</h3>
      </div>
      
      <div className="space-y-3">
        {recentActivities.map((activity) => {
          const IconComponent = iconMap[activity.type as keyof typeof iconMap]
          const colorClass = colorMap[activity.type as keyof typeof colorMap]
          
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${colorClass}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-zinc-600 truncate">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                  <span>{activity.time}</span>
                  <span>•</span>
                  <span>{activity.user}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-zinc-100">
        <button className="w-full text-sm text-zinc-600 hover:text-zinc-900 font-medium transition-colors">
          Ver toda la actividad
        </button>
      </div>
    </div>
  )
}

export default RecentActivity

