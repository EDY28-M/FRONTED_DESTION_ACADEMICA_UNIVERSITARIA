import { useQuery } from '@tanstack/react-query'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { estudiantesApi, OrdenMerito } from '../../services/estudiantesApi'

type TopStudentDatum = {
  name: string
  value: number
  posicion: number
}

const COLORS = ['#0ea5e9', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa']

const TopStudentsChart: React.FC = () => {
  const { data, isLoading } = useQuery<OrdenMerito[]>({
    queryKey: ['top-estudiantes-orden-merito'],
    queryFn: () => estudiantesApi.getOrdenMerito(),
    staleTime: 60_000,
  })

  const top = (data || []).slice(0, 5)

  const chartData: TopStudentDatum[] = top.map((s) => ({
    name: s.nombreCompleto || `${s.nombres} ${s.apellidos}`.trim(),
    value: Number.isFinite(s.promedioPonderadoAcumulado)
      ? s.promedioPonderadoAcumulado
      : (s.promedioPonderadoSemestral ?? 0),
    posicion: s.posicion,
  }))

  const hasData = chartData.length > 0

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/60 border border-zinc-200 p-6 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-4 border-b border-zinc-200 pb-4">
        <div>
          <h3 className="font-bold text-zinc-900 uppercase tracking-tight text-sm">Mejores Estudiantes</h3>
          <p className="text-[10px] text-zinc-500 font-mono">TOP {Math.min(5, chartData.length || 5)} • PPA</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 text-sm">Cargando...</p>
          </div>
        </div>
      ) : !hasData ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-500 text-sm">Sin datos</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 gap-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 0,
                    color: '#0f172a',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${Number(value).toFixed(2)}`, 'PPA']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {chartData.map((s, idx) => (
              <div
                key={`${s.posicion}-${s.name}`}
                className="flex items-center justify-between gap-3 px-3 py-2 bg-white border border-zinc-200"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-zinc-900 truncate">{s.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono text-zinc-500">#{s.posicion}</span>
                  <span className="text-sm font-bold text-zinc-900 font-mono tabular-nums">
                    {s.value.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TopStudentsChart
