import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Curso } from '../../types'

interface ChartsSectionProps {
  cursos?: Curso[]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

const ChartsSection: React.FC<ChartsSectionProps> = ({ cursos = [] }) => {
  // Datos para gráfico de cursos por ciclo
  const cursosPorCiclo = Array.from({ length: 10 }, (_, i) => {
    const ciclo = i + 1
    const count = cursos.filter(curso => curso.ciclo === ciclo).length
    return {
      ciclo: `Ciclo ${ciclo}`,
      cantidad: count,
    }
  }).filter(item => item.cantidad > 0)

  // Datos para gráfico de distribución de créditos
  const creditosDistribution = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(credito => ({
    creditos: `${credito} cr`,
    cantidad: cursos.filter(curso => curso.creditos === credito).length,
  })).filter(item => item.cantidad > 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Resumen de Créditos - Movido arriba para mejor UX móvil */}
      <motion.div
        className="card p-4 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Resumen Académico</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {cursos.reduce((sum, curso) => sum + curso.creditos, 0)}
            </div>
            <div className="text-xs sm:text-sm text-blue-600 mt-1">Total Créditos</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {cursos.reduce((sum, curso) => sum + curso.horasSemanal, 0)}
            </div>
            <div className="text-xs sm:text-sm text-green-600 mt-1">Horas Semanales</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {Math.round((cursos.reduce((sum, curso) => sum + curso.creditos, 0) / cursos.length) || 0)}
            </div>
            <div className="text-xs sm:text-sm text-purple-600 mt-1">Promedio Créditos</div>
          </div>
        </div>
      </motion.div>

      {/* Gráficos principales - Layout responsivo */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Cursos por Ciclo */}
        <motion.div
          className="card p-4 sm:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-lg sm:text-xl text-gray-900 mb-4 sm:mb-6">
            Distribución de Cursos por Ciclo
          </h3>
          <div className="h-80 sm:h-96 lg:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={cursosPorCiclo}
                margin={{ 
                  top: 20, 
                  right: 30, 
                  left: 20, 
                  bottom: 40 
                }}
              >
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
                    value: 'Número de Cursos', 
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
                    border: '2px solid #3B82F6',
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
                  fill="#3B82F6" 
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

        {/* Distribución de Créditos */}
        <motion.div
          className="card p-4 sm:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg sm:text-xl text-gray-900 mb-4 sm:mb-6">
            Distribución de Créditos
          </h3>
          <div className="h-80 sm:h-96 lg:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditosDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="creditos" 
                  fontSize={16}
                  tick={{ fontSize: 14, fontWeight: 600 }}
                  label={{ 
                    value: 'Créditos', 
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
                  formatter={(value: number) => [`${value} cursos`, 'Cantidad']}
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
      </div>

      {/* Tabla de datos móvil-friendly */}
      {(cursosPorCiclo.length > 0 || creditosDistribution.length > 0) && (
        <motion.div
          className="card p-4 sm:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg sm:text-xl text-gray-900 mb-4 sm:mb-6">
            Datos Detallados
          </h3>
          
          {/* Vista móvil - Cards */}
          <div className="block sm:hidden space-y-3">
            {cursosPorCiclo.length > 0 && (
              <div>
                <h4 className="text-base text-gray-800 mb-3">Cursos por Ciclo</h4>
                <div className="grid grid-cols-2 gap-3">
                  {cursosPorCiclo.map((item) => (
                    <div key={item.ciclo} className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                      <div className="text-base text-gray-900">{item.ciclo}</div>
                      <div className="text-2xl text-blue-600">{item.cantidad}</div>
                      <div className="text-sm text-gray-600">cursos</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {creditosDistribution.length > 0 && (
              <div>
                <h4 className="text-base text-gray-800 mb-3">Distribución de Créditos</h4>
                <div className="space-y-3">
                  {creditosDistribution.map((item, index) => (
                    <div key={item.creditos} className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3 ring-2 ring-white"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-base text-gray-900">{item.creditos}</span>
                      </div>
                      <span className="text-lg text-green-600">{item.cantidad}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-700 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700 uppercase tracking-wider">
                    Cantidad
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cursosPorCiclo.map((item) => (
                  <tr key={item.ciclo} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                      Cursos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                      {item.ciclo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-blue-600">
                      {item.cantidad}
                    </td>
                  </tr>
                ))}
                {creditosDistribution.map((item) => (
                  <tr key={item.creditos} className="hover:bg-green-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                      Créditos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                      {item.creditos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-green-600">
                      {item.cantidad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ChartsSection
