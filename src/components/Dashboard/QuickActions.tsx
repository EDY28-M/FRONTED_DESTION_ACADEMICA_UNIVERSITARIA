import { ArrowRight, UserPlus, FileText, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const actions = [
  {
    name: 'Nuevo Docente',
    icon: UserPlus,
    href: '/admin/docentes',
  },
  {
    name: 'Nuevo Curso',
    icon: FileText,
    href: '/admin/cursos',
  },
  {
    name: 'Nuevo Estudiante',
    icon: Users,
    href: '/admin/estudiantes',
  },
]

const QuickActions = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6 flex flex-col">
      <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tight text-sm">Acciones Rápidas</h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className="group relative flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-400 transition-all text-left overflow-hidden"
          >
            {/* Sliding background effect */}
            <div className="absolute inset-0 bg-sky-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>

            {/* Icon container */}
            <div className="w-10 h-10 border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-sky-500 group-hover:border-sky-400 transition-colors z-10">
              <action.icon className="w-5 h-5" />
            </div>

            {/* Text content */}
            <div className="ml-4 z-10 flex-1">
              <p className="font-bold text-slate-900 dark:text-white text-sm">{action.name}</p>
            </div>

            {/* Arrow icon */}
            <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-sky-500 transition-colors z-10" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default QuickActions

