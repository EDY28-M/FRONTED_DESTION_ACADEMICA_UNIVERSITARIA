import { useQuery } from '@tanstack/react-query'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Users, BookOpen, GraduationCap, Award } from 'lucide-react'
import { estadisticasApi } from '../../services/estadisticasApi'
import { docentesApi } from '../../services/docentesService'
import { cursosApi } from '../../services/cursosService'

const EstadisticasPage = () => {
  const { data: estadisticasGenerales, isLoading: loadingGenerales } = useQuery({
    queryKey: ['estadisticas-generales'],
    queryFn: estadisticasApi.getEstadisticasGenerales,
  })

  const { data: estudiantesPorCiclo, isLoading: loadingCiclos } = useQuery({
    queryKey: ['estudiantes-por-ciclo'],
    queryFn: estadisticasApi.getEstudiantesPorCiclo,
  })

  const { data: distribucionPromedios, isLoading: loadingPromedios } = useQuery({
    queryKey: ['distribucion-promedios'],
    queryFn: estadisticasApi.getDistribucionPromedios,
  })

  const { data: cargaDocentes, isLoading: loadingDocentes } = useQuery({
    queryKey: ['carga-docentes'],
    queryFn: estadisticasApi.getCargaDocentes,
  })

  const { data: docentes } = useQuery({
    queryKey: ['docentes'],
    queryFn: docentesApi.getAll,
  })

  const { data: cursos } = useQuery({
    queryKey: ['cursos'],
    queryFn: cursosApi.getAll,
  })

  const cursosConDocente = cursos?.filter(curso => curso.idDocente).length || 0
  const cursosSinDocente = (cursos?.length || 0) - cursosConDocente
  const porcentajeAsignacion = cursos?.length ? Math.round((cursosConDocente / cursos.length) * 100) : 0

  const isLoading = loadingGenerales || loadingCiclos || loadingPromedios || loadingDocentes

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-zinc-900 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-zinc-500">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Estadísticas</h1>
        <p className="text-zinc-500 text-sm">Resumen general del sistema académico</p>
      </div>

      {/* Stats Cards - 4 columnas iguales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <Users className="h-5 w-5 text-zinc-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{estadisticasGenerales?.totalEstudiantes || 0}</p>
              <p className="text-zinc-500 text-sm">Estudiantes</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <GraduationCap className="h-5 w-5 text-zinc-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{estadisticasGenerales?.totalDocentes || docentes?.length || 0}</p>
              <p className="text-zinc-500 text-sm">Docentes</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-zinc-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{estadisticasGenerales?.totalCursos || cursos?.length || 0}</p>
              <p className="text-zinc-500 text-sm">Cursos</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <Award className="h-5 w-5 text-zinc-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{estadisticasGenerales?.promedioInstitucional?.toFixed(1) || '0.0'}</p>
              <p className="text-zinc-500 text-sm">Promedio General</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estudiantes por Ciclo */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="text-base font-semibold text-zinc-900 mb-4">Estudiantes por Ciclo</h3>
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

        {/* Asignación de Cursos */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="text-base font-semibold text-zinc-900 mb-4">Asignación de Docentes</h3>
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
        {/* Distribución de Promedios - Gráfica de barras verticales simple */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="text-base font-semibold text-zinc-900 mb-4">Rendimiento Académico</h3>
          <div className="h-52">
            {(!distribucionPromedios || distribucionPromedios.length === 0) ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-zinc-400">No hay datos de rendimiento disponibles</p>
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

        {/* Carga Docente - Barras de progreso */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="text-base font-semibold text-zinc-900 mb-4">Carga Docente</h3>
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

      {/* Tabla Resumen por Ciclo */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <h3 className="text-base font-semibold text-zinc-900">Resumen por Ciclo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase">Ciclo</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-zinc-500 uppercase">Estudiantes</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-zinc-500 uppercase">Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {estudiantesPorCiclo?.map((ciclo) => (
                <tr key={ciclo.ciclo} className="hover:bg-zinc-50/50">
                  <td className="px-5 py-3">
                    <span className="font-medium text-zinc-900">Ciclo {ciclo.ciclo}</span>
                  </td>
                  <td className="px-5 py-3 text-center text-zinc-700">{ciclo.cantidad}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                      ciclo.promedio >= 14 ? 'bg-emerald-100 text-emerald-700' :
                      ciclo.promedio >= 10.5 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {ciclo.promedio.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EstadisticasPage


