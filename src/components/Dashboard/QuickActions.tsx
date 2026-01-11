import { Users, BookOpen, BarChart3, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const actions = [
  {
    name: 'Nuevo Docente',
    description: 'Agregar un nuevo profesor',
    icon: Users,
    href: '/docentes?action=new',
  },
  {
    name: 'Nuevo Curso',
    description: 'Crear curso académico',
    icon: BookOpen,
    href: '/cursos?action=new',
  },
  {
    name: 'Ver Estadísticas',
    description: 'Reportes y métricas',
    icon: BarChart3,
    href: '/estadisticas',
  },
]

const QuickActions = () => {
  return (
    <div className="bg-white border border-zinc-200 p-5">
      <h3 className="text-sm font-semibold text-zinc-900 mb-4">Acciones Rápidas</h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className="flex items-center gap-3 p-3 hover:bg-zinc-50 transition-colors group"
          >
            <div className="flex h-9 w-9 items-center justify-center bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
              <action.icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900">{action.name}</p>
              <p className="text-xs text-zinc-500">{action.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default QuickActions

