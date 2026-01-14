import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { estadisticasApi } from '../../services/estadisticasApi'

const TeacherLoadCard: React.FC = () => {
  const { data: cargaDocentes, isLoading } = useQuery({
    queryKey: ['carga-docentes'],
    queryFn: estadisticasApi.getCargaDocentes,
  })

  return (
    <div className="bg-gradient-to-b from-white to-sky-50/40 border border-zinc-200 p-6 flex flex-col h-[400px] overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border border-zinc-200 bg-white flex items-center justify-center">
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 uppercase tracking-tight text-sm">Carga Docente</h3>
            <p className="text-[10px] text-zinc-500 font-mono">TOP DOCENTES • HORAS/SEMANA</p>
          </div>
        </div>

        <button className="text-[10px] font-bold text-sky-700 uppercase tracking-wider border border-sky-600 px-2 py-1 hover:bg-sky-600 hover:text-white transition-colors">
          Ver Todo
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 text-sm">Cargando...</p>
          </div>
        </div>
      ) : (!cargaDocentes || cargaDocentes.length === 0) ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-500 text-sm">Sin datos</p>
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-auto pr-1">
          {cargaDocentes.slice(0, 8).map((docente: any) => {
            const porcentaje = Math.min(Math.round((docente.horasSemanales / 20) * 100), 100)
            const color = porcentaje > 70 ? 'bg-orange-400' : 'bg-sky-500'
            return (
              <div key={docente.id} className="bg-white border border-zinc-200 px-3 py-2">
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-zinc-700 uppercase truncate">
                    {String(docente.nombre || '')
                      .split(' ')
                      .slice(0, 2)
                      .join(' ')}
                  </span>
                  <span className="text-zinc-900 font-bold tabular-nums">{porcentaje}%</span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 border border-zinc-200 p-[1px]">
                  <div className={`${color} h-full`} style={{ width: `${porcentaje}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TeacherLoadCard
