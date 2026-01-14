import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { estadisticasApi } from '../../services/estadisticasApi'
import { useQuery } from '@tanstack/react-query'

const ChartsSection: React.FC = () => {
  // Queries para estadísticas
  const { data: estudiantesPorCiclo } = useQuery({
    queryKey: ['estudiantes-por-ciclo'],
    queryFn: estadisticasApi.getEstudiantesPorCiclo,
  })

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/60 border border-zinc-200 p-6 flex flex-col h-[400px] overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-zinc-200 pb-4">
        <h3 className="font-bold text-zinc-900 uppercase tracking-tight text-sm">Resumen Estadístico</h3>
      </div>

      <div className="flex-1 min-h-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-zinc-900 uppercase text-xs">Estudiantes por Ciclo</h4>
        </div>
        <div className="h-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={estudiantesPorCiclo} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="ciclo"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `${value}°`}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 0,
                  color: '#0f172a',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value} estudiantes`, '']}
                labelFormatter={(label) => `Ciclo ${label}`}
              />
              <Bar dataKey="cantidad" fill="#38bdf8" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default ChartsSection

