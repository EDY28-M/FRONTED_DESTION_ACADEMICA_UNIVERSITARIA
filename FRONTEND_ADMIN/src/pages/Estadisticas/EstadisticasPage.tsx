import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts'
import { docentesApi } from '../../services/docentesService'
import { cursosApi } from '../../services/cursosService'

const EstadisticasPage = () => {
  const { data: docentes, isLoading: loadingDocentes } = useQuery({
    queryKey: ['docentes'],
    queryFn: docentesApi.getAll,
  })

  const { data: cursos, isLoading: loadingCursos } = useQuery({
    queryKey: ['cursos'],
    queryFn: cursosApi.getAll,
  })

  // Estadísticas de cursos por ciclo
  const cursosPorCiclo = Array.from({ length: 10 }, (_, i) => {
    const ciclo = i + 1
    const count = cursos?.filter(curso => curso.ciclo === ciclo).length || 0
    return {
      ciclo: `Ciclo ${ciclo}`,
      cantidad: count,
      creditos: cursos?.filter(curso => curso.ciclo === ciclo).reduce((sum, curso) => sum + curso.creditos, 0) || 0,
    }
  }).filter(item => item.cantidad > 0)

  // Estadísticas de asignación de docentes
  const cursosConDocente = cursos?.filter(curso => curso.idDocente).length || 0;
  const cursosSinDocente = (cursos?.length || 0) - cursosConDocente;
  
  const asignacionDocentesData = [
    {
      estado: 'Con Docente',
      cantidad: cursosConDocente,
      porcentaje: cursos?.length ? ((cursosConDocente / cursos.length) * 100).toFixed(1) : 0
    },
    {
      estado: 'Sin Docente',
      cantidad: cursosSinDocente,
      porcentaje: cursos?.length ? ((cursosSinDocente / cursos.length) * 100).toFixed(1) : 0
    }
  ];

  // Distribución de créditos
  const creditosDistribution = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(credito => ({
    creditos: credito,
    cantidad: cursos?.filter(curso => curso.creditos === credito).length || 0,
  })).filter(item => item.cantidad > 0)

  // Carga horaria por ciclo
  const cargaHoraria = cursosPorCiclo.map(item => ({
    ciclo: item.ciclo,
    horas: cursos?.filter(curso => curso.ciclo === parseInt(item.ciclo.split(' ')[1]))
      .reduce((sum, curso) => sum + curso.horasSemanal, 0) || 0,
  }))

  const isLoading = loadingDocentes || loadingCursos

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:flex md:items-center md:justify-between"
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Estadísticas y Reportes
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Análisis detallado del sistema académico
          </p>
        </div>
      </motion.div>

      {/* Resumen General */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-xl border border-zinc-200 p-6 text-center shadow-sm">
          <div className="text-4xl font-bold text-zinc-900 mb-2">{docentes?.length || 0}</div>
          <div className="text-sm font-medium text-zinc-500">Total Docentes</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6 text-center shadow-sm">
          <div className="text-4xl font-bold text-zinc-900 mb-2">{cursos?.length || 0}</div>
          <div className="text-sm font-medium text-zinc-500">Total Cursos</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6 text-center shadow-sm">
          <div className="text-4xl font-bold text-zinc-900 mb-2">
            {cursos?.reduce((sum, curso) => sum + curso.creditos, 0) || 0}
          </div>
          <div className="text-sm font-medium text-zinc-500">Total Créditos</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6 text-center shadow-sm">
          <div className="text-4xl font-bold text-zinc-900 mb-2">
            {cursos?.reduce((sum, curso) => sum + curso.horasSemanal, 0) || 0}
          </div>
          <div className="text-sm font-medium text-zinc-500">Horas Semanales</div>
        </div>
      </motion.div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cursos por Ciclo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-zinc-900 mb-6">Cursos por Ciclo</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cursosPorCiclo} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis 
                  dataKey="ciclo" 
                  fontSize={12}
                  tick={{ fill: '#71717a' }}
                  axisLine={{ stroke: '#e4e4e7' }}
                  tickLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  cursor={{ fill: '#f4f4f5' }}
                />
                <Bar 
                  dataKey="cantidad" 
                  fill="#18181b" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Asignación de Docentes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-zinc-900 mb-6">Estado de Asignación de Docentes</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={asignacionDocentesData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis 
                  dataKey="estado" 
                  fontSize={12}
                  tick={{ fill: '#71717a' }}
                  axisLine={{ stroke: '#e4e4e7' }}
                  tickLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  cursor={{ fill: '#f4f4f5' }}
                />
                <Bar 
                  dataKey="cantidad" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={80}
                >
                  <Cell fill="#10b981" /> {/* Verde para "Con Docente" */}
                  <Cell fill="#ef4444" /> {/* Rojo para "Sin Docente" */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Distribución de Créditos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-zinc-900 mb-6">Distribución de Créditos</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditosDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis 
                  dataKey="creditos" 
                  fontSize={12}
                  tick={{ fill: '#71717a' }}
                  axisLine={{ stroke: '#e4e4e7' }}
                  tickLine={false}
                  label={{ value: 'Créditos', position: 'insideBottom', offset: -10, fontSize: 12, fill: '#71717a' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  cursor={{ fill: '#f4f4f5' }}
                />
                <Bar 
                  dataKey="cantidad" 
                  fill="#18181b" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Carga Horaria por Ciclo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-zinc-900 mb-6">Carga Horaria por Ciclo</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cargaHoraria} margin={{ top: 40, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis 
                  dataKey="ciclo" 
                  fontSize={12}
                  tick={{ fill: '#71717a' }}
                  axisLine={{ stroke: '#e4e4e7' }}
                  tickLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="horas" 
                  stroke="#18181b" 
                  strokeWidth={2}
                  dot={{ fill: '#18181b', stroke: '#fff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Tabla de Detalles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm"
      >
        <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50">
          <h3 className="text-lg font-semibold text-zinc-900">Resumen Detallado por Ciclo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 font-medium text-zinc-900">Ciclo</th>
                <th className="px-6 py-3 font-medium text-zinc-900">Cursos</th>
                <th className="px-6 py-3 font-medium text-zinc-900">Créditos Totales</th>
                <th className="px-6 py-3 font-medium text-zinc-900">Horas Semanales</th>
                <th className="px-6 py-3 font-medium text-zinc-900">Promedio Créditos</th>
                <th className="px-6 py-3 font-medium text-zinc-900">Promedio Horas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {cursosPorCiclo.map((item, index) => {
                const cicloNum = parseInt(item.ciclo.split(' ')[1])
                const cursosDelCiclo = cursos?.filter(curso => curso.ciclo === cicloNum) || []
                const horasSemanales = cursosDelCiclo.reduce((sum, curso) => sum + curso.horasSemanal, 0)
                const promedioCreditos = cursosDelCiclo.length > 0 ? (item.creditos / cursosDelCiclo.length).toFixed(1) : '0'
                const promedioHoras = cursosDelCiclo.length > 0 ? (horasSemanales / cursosDelCiclo.length).toFixed(1) : '0'

                return (
                  <motion.tr
                    key={item.ciclo}
                    className="hover:bg-zinc-50/50 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900">{item.ciclo}</td>
                    <td className="px-6 py-4 text-zinc-600">{item.cantidad}</td>
                    <td className="px-6 py-4 text-zinc-600">{item.creditos}</td>
                    <td className="px-6 py-4 text-zinc-600">{horasSemanales}</td>
                    <td className="px-6 py-4 text-zinc-600">{promedioCreditos}</td>
                    <td className="px-6 py-4 text-zinc-600">{promedioHoras}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default EstadisticasPage


