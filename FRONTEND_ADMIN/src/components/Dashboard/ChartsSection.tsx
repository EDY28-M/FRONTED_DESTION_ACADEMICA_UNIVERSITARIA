import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Curso } from '../../types'

interface ChartsSectionProps {
  cursos?: Curso[]
}

// Custom tooltip component for consistent styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-zinc-300">{payload[0].value} cursos</p>
      </div>
    )
  }
  return null
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ cursos = [] }) => {
  // Data for courses by cycle chart
  const cursosPorCiclo = Array.from({ length: 10 }, (_, i) => {
    const ciclo = i + 1
    const count = cursos.filter(curso => curso.ciclo === ciclo).length
    return {
      ciclo: `${ciclo}`,
      cantidad: count,
    }
  }).filter(item => item.cantidad > 0)

  // Data for credits distribution chart
  const creditosDistribution = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(credito => ({
    creditos: `${credito}`,
    cantidad: cursos.filter(curso => curso.creditos === credito).length,
  })).filter(item => item.cantidad > 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards - Bento Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-sm font-medium text-zinc-500">Total Créditos</p>
          <p className="text-2xl font-semibold text-zinc-900 mt-1">
            {cursos.reduce((sum, curso) => sum + curso.creditos, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-sm font-medium text-zinc-500">Horas Semanales</p>
          <p className="text-2xl font-semibold text-zinc-900 mt-1">
            {cursos.reduce((sum, curso) => sum + curso.horasSemanal, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-sm font-medium text-zinc-500">Promedio Créditos</p>
          <p className="text-2xl font-semibold text-zinc-900 mt-1">
            {Math.round((cursos.reduce((sum, curso) => sum + curso.creditos, 0) / cursos.length) || 0)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Courses by Cycle */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">
            Cursos por Ciclo
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cursosPorCiclo} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis 
                  dataKey="ciclo" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#71717a' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#71717a' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
                <Bar 
                  dataKey="cantidad" 
                  fill="#18181b" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Credits Distribution */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">
            Distribución de Créditos
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditosDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis 
                  dataKey="creditos" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#71717a' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#71717a' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
                <Bar 
                  dataKey="cantidad" 
                  fill="#52525b" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartsSection

