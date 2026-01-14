import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { estadisticasApi } from '../../services/estadisticasApi'
import { useQuery } from '@tanstack/react-query'

const ChartsSection: React.FC = () => {
  // Queries para estadísticas
  const { data: estudiantesPorCiclo } = useQuery({
    queryKey: ['estudiantes-por-ciclo'],
    queryFn: estadisticasApi.getEstudiantesPorCiclo,
  })

  const { data: cargaDocentes } = useQuery({
    queryKey: ['carga-docentes'],
    queryFn: estadisticasApi.getCargaDocentes,
  })

  return (
    <div className="space-y-4">
      {/* Estudiantes por Ciclo */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-bold text-slate-900 dark:text-white uppercase text-sm mb-4">Estudiantes por Ciclo</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={estudiantesPorCiclo} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="ciclo"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(value) => `${value}°`}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 0,
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value} estudiantes`, '']}
                labelFormatter={(label) => `Ciclo ${label}`}
              />
              <Bar dataKey="cantidad" fill="#bef264" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Carga Docente */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white uppercase text-sm">Carga Docente</h3>
          <button className="text-[10px] font-bold text-lime-400 hover:text-lime-300 uppercase tracking-wider border border-lime-400 px-2 py-1 hover:bg-lime-400 hover:text-slate-900 transition-colors">
            Ver Todo
          </button>
        </div>
        <div className="space-y-6">
          {cargaDocentes?.slice(0, 4).map((docente) => {
            const porcentaje = Math.min(Math.round((docente.horasSemanales / 20) * 100), 100)
            const color = porcentaje > 70 ? 'bg-orange-400' : 'bg-green-500'
            return (
              <div key={docente.id}>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-slate-700 dark:text-slate-300 uppercase">{docente.nombre.split(' ').slice(0, 2).join(' ')}</span>
                  <span className="text-slate-900 dark:text-white font-bold">{porcentaje}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 border border-slate-200 dark:border-slate-700 p-[1px]">
                  <div className={`${color} h-full`} style={{ width: `${porcentaje}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>
        {(!cargaDocentes || cargaDocentes.length === 0) && (
          <p className="text-center text-slate-400 py-4 text-sm">Sin datos</p>
        )}
      </div>
    </div>
  )
}

export default ChartsSection

