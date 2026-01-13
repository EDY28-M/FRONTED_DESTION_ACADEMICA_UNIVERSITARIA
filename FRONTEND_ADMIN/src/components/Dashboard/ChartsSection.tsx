import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Curso } from '../../types'
import { estadisticasApi } from '../../services/estadisticasApi'
import { docentesApi } from '../../services/docentesService'
import { useQuery } from '@tanstack/react-query'

interface ChartsSectionProps {
  cursos?: Curso[]
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ cursos = [] }) => {
  // Queries para estadísticas
  const { data: estudiantesPorCiclo } = useQuery({
    queryKey: ['estudiantes-por-ciclo'],
    queryFn: estadisticasApi.getEstudiantesPorCiclo,
  })

  const { data: distribucionPromedios } = useQuery({
    queryKey: ['distribucion-promedios'],
    queryFn: estadisticasApi.getDistribucionPromedios,
  })

  const { data: cargaDocentes } = useQuery({
    queryKey: ['carga-docentes'],
    queryFn: estadisticasApi.getCargaDocentes,
  })

  // Cálculos para asignación de docentes
  const cursosConDocente = cursos?.filter(curso => curso.idDocente).length || 0
  const cursosSinDocente = (cursos?.length || 0) - cursosConDocente
  const porcentajeAsignacion = cursos?.length ? Math.round((cursosConDocente / cursos.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Gráficas principales - Primera fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estudiantes por Ciclo */}
        <div className="bg-white border border-zinc-200 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Estudiantes por Ciclo</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={estudiantesPorCiclo} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis
                  dataKey="ciclo"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  tickFormatter={(value) => `${value}°`}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value} estudiantes`, '']}
                  labelFormatter={(label) => `Ciclo ${label}`}
                />
                <Bar dataKey="cantidad" fill="#3f3f46" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asignación de Docentes */}
        <div className="bg-white border border-zinc-200 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Asignación de Docentes</h3>
          <div className="flex flex-col items-center justify-center h-52">
            <div className="relative w-32 h-32">
              {/* Círculo de fondo */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e4e4e7" strokeWidth="12" />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="#18181b"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${porcentajeAsignacion * 2.51} 251`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-2xl font-bold text-zinc-900">{porcentajeAsignacion}%</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900"></div>
                <span className="text-xs text-zinc-600">{cursosConDocente} asignados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                <span className="text-xs text-zinc-600">{cursosSinDocente} pendientes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila de gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendimiento Académico */}
        <div className="bg-white border border-zinc-200 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Rendimiento Académico</h3>
          <div className="h-52">
            {(!distribucionPromedios || distribucionPromedios.length === 0) ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-zinc-400 text-sm">No hay datos disponibles</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribucionPromedios} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis
                    dataKey="rango"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 10 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    formatter={(value: number) => [`${value}`, 'Estudiantes']}
                  />
                  <Bar dataKey="cantidad" radius={[3, 3, 0, 0]}>
                    {distribucionPromedios.map((entry, index) => {
                      const val = parseFloat(entry.rango.split('-')[0])
                      return <Cell key={index} fill={val >= 14 ? '#22c55e' : val >= 11 ? '#f59e0b' : '#ef4444'} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Carga Docente */}
        <div className="bg-white border border-zinc-200 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Carga Docente</h3>
          <div className="space-y-3">
            {cargaDocentes?.slice(0, 5).map((docente) => {
              const porcentaje = Math.min(Math.round((docente.horasSemanales / 20) * 100), 100)
              const color = porcentaje > 80 ? 'bg-red-500' : porcentaje > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              return (
                <div key={docente.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-700 truncate">{docente.nombre.split(' ').slice(0, 2).join(' ')}</span>
                    <span className="text-zinc-900 font-medium">{porcentaje}%</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${porcentaje}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          {(!cargaDocentes || cargaDocentes.length === 0) && (
            <p className="text-center text-zinc-400 py-4 text-sm">Sin datos</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChartsSection

