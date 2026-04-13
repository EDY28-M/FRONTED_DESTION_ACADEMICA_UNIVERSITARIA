import { useQuery } from '@tanstack/react-query'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { estudiantesApi, OrdenMerito } from '../../services/estudiantesApi'

type TopStudentDatum = {
  name: string
  value: number
  posicion: number
  promocion: string
  semestre: number
  rangoMerito: string
  creditosAprobados: number
}

const COLORS = ['#0ea5e9', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa']

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 shadow-lg p-3 min-w-[180px]"
      style={{ borderRadius: 0 }}>
      <p className="text-xs font-bold text-slate-900 mb-1.5 truncate">{d.name}</p>
      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">PPA</span>
          <span className="font-bold font-mono text-slate-900">{d.value.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Posición</span>
          <span className="font-mono text-slate-700">#{d.posicion}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Ciclo</span>
          <span className="font-mono text-slate-700">{d.semestre}°</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Promoción</span>
          <span className="font-mono text-slate-700">{d.promocion}</span>
        </div>
        {d.rangoMerito && (
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Mérito</span>
            <span className="font-mono text-slate-700">{d.rangoMerito}</span>
          </div>
        )}
      </div>
    </div>
  );
};

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
    promocion: s.promocion || '-',
    semestre: s.semestre,
    rangoMerito: s.rangoMerito || '',
    creditosAprobados: s.totalCreditosAprobados,
  }))

  const hasData = chartData.length > 0

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/60 border border-zinc-200 p-6 flex flex-col h-[400px] overflow-hidden">
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
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="35%"
                outerRadius="70%"
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default TopStudentsChart
