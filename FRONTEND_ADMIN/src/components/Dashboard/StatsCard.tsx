import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  name: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  change: string
  changeType: 'positive' | 'negative'
  isLoading?: boolean
}

const StatsCard: React.FC<StatsCardProps> = ({
  name,
  value,
  icon: Icon,
  change,
  changeType,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 hover:border-zinc-300 transition-colors h-full flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-500 truncate">{name}</p>
          {isLoading ? (
            <div className="animate-pulse bg-zinc-200 h-8 w-20 rounded mt-2"></div>
          ) : (
            <p className="text-xl sm:text-2xl font-semibold text-zinc-900 mt-1 tracking-tight truncate">
              {value.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-zinc-100 shrink-0">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-600" />
        </div>
      </div>

      {!isLoading && (
        <div className="mt-3 flex items-center flex-wrap gap-1">
          <div className="flex items-center">
            {changeType === 'positive' ? (
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
            )}
            <span className={`text-xs sm:text-sm font-medium ml-1 ${changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
              }`}>
              {change}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-zinc-400 truncate">vs mes anterior</span>
        </div>
      )}
    </div>
  )
}

export default StatsCard
