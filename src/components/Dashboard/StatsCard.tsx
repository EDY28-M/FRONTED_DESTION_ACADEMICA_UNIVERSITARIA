import { motion } from 'framer-motion'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface StatsCardProps {
  name: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  change: string
  changeType: 'positive' | 'negative'
  isLoading?: boolean
}

const StatsCard: React.FC<StatsCardProps> = ({
  name,
  value,
  icon: Icon,
  color,
  change,
  changeType,
  isLoading = false,
}) => {
  return (
    <motion.div
      className="card p-6"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {name}
            </dt>
            <dd className="flex items-baseline">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-semibold text-gray-900">
                    {value.toLocaleString()}
                  </div>
                  <div className="ml-2 flex items-baseline text-sm font-semibold">
                    {changeType === 'positive' ? (
                      <ChevronUpIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={
                        changeType === 'positive'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {change}
                    </span>
                  </div>
                </>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </motion.div>
  )
}

export default StatsCard
