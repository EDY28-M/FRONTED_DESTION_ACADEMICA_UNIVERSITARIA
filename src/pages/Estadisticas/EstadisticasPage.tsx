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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
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
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Estadísticas y Reportes
          </h2>
          <p className="mt-1 text-sm text-gray-500">
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
        <div className="card p-6 text-center bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
          <div className="text-5xl text-primary-700 mb-2">{docentes?.length || 0}</div>
          <div className="text-base text-gray-700">Total Docentes</div>
        </div>
        <div className="card p-6 text-center bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <div className="text-5xl text-green-600 mb-2">{cursos?.length || 0}</div>
          <div className="text-base text-gray-700">Total Cursos</div>
        </div>
        <div className="card p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <div className="text-5xl text-purple-600 mb-2">
            {cursos?.reduce((sum, curso) => sum + curso.creditos, 0) || 0}
          </div>
          <div className="text-base text-gray-700">Total Créditos</div>
        </div>
        <div className="card p-6 text-center bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
          <div className="text-5xl text-orange-600 mb-2">
            {cursos?.reduce((sum, curso) => sum + curso.horasSemanal, 0) || 0}
          </div>
          <div className="text-base text-gray-700">Horas Semanales</div>
        </div>
      </motion.div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cursos por Ciclo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-xl text-gray-900 mb-6">Cursos por Ciclo</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cursosPorCiclo} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="ciclo" 
                  fontSize={16}
                  tick={{ fontSize: 14, fontWeight: 600 }}
                  label={{ 
                    value: 'Ciclo Académico', 
                    position: 'insideBottom', 
                    offset: -10,
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                  stroke="#374151"
                />
                <YAxis 
                  fontSize={16}
                  tick={{ fontSize: 14, fontWeight: 600 }}
                  label={{ 
                    value: 'Cantidad de Cursos', 
                    angle: -90, 
                    position: 'insideLeft',
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                  stroke="#374151"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #003366',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '12px 16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: '#1F2937',
                    marginBottom: '8px'
                  }}
                  formatter={(value: number) => [`${value} cursos`, 'Cantidad']}
                />
                <Bar 
                  dataKey="cantidad" 
                  fill="#003366" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                  label={{ 
                    position: 'top', 
                    fontSize: 16, 
                    fontWeight: 'bold',
                    fill: '#1F2937'
                  }}
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
          className="card p-6"
        >
          <h3 className="text-xl text-gray-900 mb-6">Estado de Asignación de Docentes</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={asignacionDocentesData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="estado" 
                  fontSize={18}
                  tick={{ fontSize: 16, fontWeight: 700 }}
                  stroke="#374151"
                />
                <YAxis 
                  fontSize={16}
                  tick={{ fontSize: 14, fontWeight: 600 }}
                  label={{ 
                    value: 'Cantidad de Cursos', 
                    angle: -90, 
                    position: 'insideLeft',
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                  stroke="#374151"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #8B5CF6',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '12px 16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: '#1F2937',
                    marginBottom: '8px'
                  }}
                  formatter={(value: number, _name: string, props: any) => {
                    return [`${value} cursos (${props.payload.porcentaje}%)`, 'Cantidad'];
                  }}
                />
                <Bar 
                  dataKey="cantidad" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={150}
                  label={{ 
                    position: 'top', 
                    fontSize: 18, 
                    fontWeight: 'bold',
                    fill: '#1F2937'
                  }}
                >
                  <Cell fill="#10B981" /> {/* Verde para "Con Docente" */}
                  <Cell fill="#EF4444" /> {/* Rojo para "Sin Docente" */}
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
          className="card p-6"
        >
          <h3 className="text-xl text-gray-900 mb-6">Distribución de Créditos</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditosDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="creditos" 
                  fontSize={16}
                  tick={{ fontSize: 14, fontWeight: 600 }}
                  label={{ 
                    value: 'Número de Créditos', 
                    position: 'insideBottom', 
                    offset: -10,
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                  stroke="#374151"
                />
                <YAxis 
                  fontSize={16}
                  tick={{ fontSize: 14, fontWeight: 600 }}
                  label={{ 
                    value: 'Cantidad de Cursos', 
                    angle: -90, 
                    position: 'insideLeft',
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                  stroke="#374151"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #10B981',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '12px 16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: '#1F2937',
                    marginBottom: '8px'
                  }}
                  formatter={(value: number, name: string) => [`${value} cursos`, name === 'cantidad' ? 'Cantidad' : name]}
                />
                <Bar 
                  dataKey="cantidad" 
                  fill="#10B981" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                  label={{ 
                    position: 'top', 
                    fontSize: 16, 
                    fontWeight: 'bold',
                    fill: '#1F2937'
                  }}
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
          className="card p-6"
        >
          <h3 className="text-xl text-gray-900 mb-6">Carga Horaria por Ciclo</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cargaHoraria} margin={{ top: 40, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="ciclo" 
                  fontSize={16}
                  tick={{ fontSize: 14, fontWeight: 600 }}
                  label={{ 
                    value: 'Ciclo Académico', 
                    position: 'insideBottom', 
                    offset: -10,
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                  stroke="#374151"
                />
                <YAxis 
                  fontSize={16}
                  tick={{ fontSize: 14, fontWeight: 600 }}
                  label={{ 
                    value: 'Horas Semanales', 
                    angle: -90, 
                    position: 'insideLeft',
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                  stroke="#374151"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #8B5CF6',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '12px 16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: '#1F2937',
                    marginBottom: '8px'
                  }}
                  formatter={(value: number) => [`${value} horas`, 'Carga Horaria']}
                />
                <Line 
                  type="monotone" 
                  dataKey="horas" 
                  stroke="#8B5CF6" 
                  strokeWidth={4}
                  dot={{ fill: '#8B5CF6', stroke: '#fff', strokeWidth: 3, r: 10 }}
                  activeDot={{ r: 12, strokeWidth: 3 }}
                  label={{ 
                    position: 'top', 
                    offset: 15,
                    fontSize: 18, 
                    fontWeight: 'bold',
                    fill: '#1F2937',
                    formatter: (value: number) => value
                  }}
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
        className="card"
      >
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-purple-50">
          <h3 className="text-xl text-gray-900">Resumen Detallado por Ciclo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header bg-gradient-to-r from-gray-100 to-gray-200">
              <tr>
                <th className="table-header-cell text-base">Ciclo</th>
                <th className="table-header-cell text-base">Cursos</th>
                <th className="table-header-cell text-base">Créditos Totales</th>
                <th className="table-header-cell text-base">Horas Semanales</th>
                <th className="table-header-cell text-base">Promedio Créditos</th>
                <th className="table-header-cell text-base">Promedio Horas</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {cursosPorCiclo.map((item, index) => {
                const cicloNum = parseInt(item.ciclo.split(' ')[1])
                const cursosDelCiclo = cursos?.filter(curso => curso.ciclo === cicloNum) || []
                const horasSemanales = cursosDelCiclo.reduce((sum, curso) => sum + curso.horasSemanal, 0)
                const promedioCreditos = cursosDelCiclo.length > 0 ? (item.creditos / cursosDelCiclo.length).toFixed(1) : '0'
                const promedioHoras = cursosDelCiclo.length > 0 ? (horasSemanales / cursosDelCiclo.length).toFixed(1) : '0'

                return (
                  <motion.tr
                    key={item.ciclo}
                    className="table-row hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="table-cell text-base text-gray-900">{item.ciclo}</td>
                    <td className="table-cell text-base text-primary-700">{item.cantidad}</td>
                    <td className="table-cell text-base text-purple-600">{item.creditos}</td>
                    <td className="table-cell text-base text-orange-600">{horasSemanales}</td>
                    <td className="table-cell text-base text-green-600">{promedioCreditos}</td>
                    <td className="table-cell text-base text-primary-700">{promedioHoras}</td>
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


