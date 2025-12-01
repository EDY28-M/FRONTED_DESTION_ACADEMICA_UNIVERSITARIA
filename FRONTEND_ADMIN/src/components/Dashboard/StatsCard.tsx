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
    <div className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-500">{name}</p>
          {isLoading ? (
            <div className="animate-pulse bg-zinc-200 h-8 w-20 rounded mt-2"></div>
          ) : (
            <p className="text-2xl font-semibold text-zinc-900 mt-1 tracking-tight">
              {value.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
          <Icon className="h-5 w-5 text-zinc-600" />
        </div>
      </div>
      
      {!isLoading && (
        <div className="mt-3 flex items-center gap-1">
          {changeType === 'positive' ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${
            changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {change}
          </span>
          <span className="text-sm text-zinc-400 ml-1">vs mes anterior</span>
        </div>
      )}
    </div>
  )
}

export default StatsCard
