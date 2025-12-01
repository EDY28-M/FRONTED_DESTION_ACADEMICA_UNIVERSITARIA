import { Clock, User, BookOpen } from 'lucide-react'

const activities = [
  {
    id: 1,
    type: 'docente',
    title: 'Nuevo docente registrado',
    description: 'Dr. Juan Pérez - Ingeniero de Sistemas',
    time: 'Hace 2 horas',
    icon: User,
  },
  {
    id: 2,
    type: 'curso',
    title: 'Curso actualizado',
    description: 'Programación Web - Ciclo 5',
    time: 'Hace 4 horas',
    icon: BookOpen,
  },
  {
    id: 3,
    type: 'docente',
    title: 'Perfil actualizado',
    description: 'Dra. María García - Matemática',
    time: 'Ayer',
    icon: User,
  },
  {
    id: 4,
    type: 'curso',
    title: 'Nuevo curso creado',
    description: 'Base de Datos II - Ciclo 6',
    time: 'Hace 2 días',
    icon: BookOpen,
  },
]

const RecentActivity = () => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-900">Actividad Reciente</h3>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 shrink-0">
              <activity.icon className="h-4 w-4 text-zinc-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">
                {activity.title}
              </p>
              <p className="text-sm text-zinc-500 truncate">
                {activity.description}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
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

