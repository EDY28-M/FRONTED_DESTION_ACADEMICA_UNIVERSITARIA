import { BarChart3, ArrowRight, UserPlus, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const actions = [
  {
    name: 'Nuevo Docente',
    command: '/add_teacher',
    icon: UserPlus,
    href: '/docentes?action=new',
  },
  {
    name: 'Nuevo Curso',
    command: '/create_course',
    icon: FileText,
    href: '/cursos?action=new',
  },
  {
    name: 'Ver Estadísticas',
    command: '/view_stats',
    icon: BarChart3,
    href: '/estadisticas',
  },
]

const QuickActions = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6 flex flex-col h-full">
      <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tight text-sm">Acciones Rápidas</h3>
      <div className="grid grid-cols-1 gap-3 flex-1">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className="group relative flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-lime-400 dark:hover:border-lime-400 transition-all text-left overflow-hidden"
          >
            {/* Sliding background effect */}
            <div className="absolute inset-0 bg-lime-400/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>

            {/* Icon container */}
            <div className="w-10 h-10 border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-lime-400 group-hover:border-lime-400 transition-colors z-10">
              <action.icon className="w-5 h-5" />
            </div>

            {/* Text content */}
            <div className="ml-4 z-10 flex-1">
              <p className="font-bold text-slate-900 dark:text-white text-sm">{action.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">CMD: {action.command}</p>
            </div>

            {/* Arrow icon */}
            <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-lime-400 transition-colors z-10" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default QuickActions

