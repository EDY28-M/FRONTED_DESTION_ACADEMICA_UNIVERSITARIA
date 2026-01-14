import { ArrowUp } from 'lucide-react'

interface StatsCardProps {
  name: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  change: string
  changeType: 'positive' | 'negative'
  isLoading?: boolean
  chartType?: 'line' | 'bar'
}

const StatsCard: React.FC<StatsCardProps> = ({
  name,
  value,
  icon: Icon,
  change,
  changeType,
  isLoading = false,
  chartType = 'line'
}) => {
  // Generar puntos aleatorios para el gráfico
  const generateSparklineData = () => {
    if (chartType === 'line') {
      return 'M0 35 L10 32 L20 34 L30 25 L40 28 L50 20 L60 22 L70 15 L80 18 L90 10 L100 15'
    }
    // Retornar null para tipo bar, se manejará con rects
    return null
  }

  const sparklinePath = generateSparklineData()

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 relative overflow-hidden group hover:border-lime-400/50 dark:hover:border-lime-400/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">{name}</span>
        <Icon className="text-slate-600 dark:text-slate-500 w-5 h-5" />
      </div>

      <div className="flex items-end justify-between">
        <div>
          {isLoading ? (
            <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-9 w-20"></div>
          ) : (
            <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">{value}</p>
          )}
          <span className="text-[10px] text-green-500 font-mono flex items-center gap-1 mt-1">
            <ArrowUp className="w-3 h-3" /> {change} vs mes anterior
          </span>
        </div>

        {/* Mini chart */}
        <div className="w-24 h-10">
          {chartType === 'line' && sparklinePath ? (
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
              <path
                d={`${sparklinePath} V40 H0 Z`}
                fill="rgba(190, 242, 100, 0.2)"
              />
              <path
                d={sparklinePath}
                fill="none"
                stroke="#bef264"
                strokeWidth="1.5"
              />
            </svg>
          ) : (
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
              <rect fill="#334155" x="0" y="20" width="8" height="20" />
              <rect fill="#334155" x="12" y="15" width="8" height="25" />
              <rect fill="#334155" x="24" y="25" width="8" height="15" />
              <rect fill="#334155" x="36" y="10" width="8" height="30" />
              <rect fill="#334155" x="48" y="18" width="8" height="22" />
              <rect fill="#bef264" x="60" y="12" width="8" height="28" />
              <rect fill="#334155" x="72" y="22" width="8" height="18" />
              <rect fill="#334155" x="84" y="8" width="8" height="32" />
              <rect fill="#334155" x="96" y="15" width="4" height="25" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatsCard

