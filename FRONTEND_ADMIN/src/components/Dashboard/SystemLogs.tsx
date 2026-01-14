import React from 'react'
import { Info, AlertTriangle, CheckCircle } from 'lucide-react'

interface LogEntry {
    id: string
    type: 'info' | 'warning' | 'success'
    title: string
    message: string
    time: string
}

const logs: LogEntry[] = [
    {
        id: '1',
        type: 'info',
        title: 'MAINTENANCE_SCHED',
        message: 'System update pending. Reboot required.',
        time: '14:00'
    },
    {
        id: '2',
        type: 'warning',
        title: 'HIGH_LOAD_CPU',
        message: 'Server load > 85%. Investigating processes.',
        time: '11:00'
    },
    {
        id: '3',
        type: 'success',
        title: 'BACKUP_COMPLETE',
        message: 'Daily snapshot saved successfully.',
        time: 'YESTERDAY'
    }
]

const SystemLogs: React.FC = () => {
    const getIconComponent = (type: string) => {
        switch (type) {
            case 'info':
                return Info
            case 'warning':
                return AlertTriangle
            case 'success':
                return CheckCircle
            default:
                return Info
        }
    }

    const getIconColor = (type: string) => {
        switch (type) {
            case 'info':
                return 'border-blue-500/50 bg-blue-500/10 text-blue-500'
            case 'warning':
                return 'border-[#ff6b6b]/50 bg-[#ff6b6b]/10 text-[#ff6b6b]'
            case 'success':
                return 'border-green-500/50 bg-green-500/10 text-green-500'
            default:
                return 'border-slate-500/50 bg-slate-500/10 text-slate-500'
        }
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase text-sm">System Logs</h3>
                <button className="text-slate-400 hover:text-lime-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-0">
                {logs.map((log, index) => {
                    const IconComponent = getIconComponent(log.type)
                    const iconColorClass = getIconColor(log.type)

                    return (
                        <div
                            key={log.id}
                            className={`flex gap-4 items-start p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group ${index < logs.length - 1 ? 'border-b border-dashed border-slate-200 dark:border-slate-800' : ''
                                }`}
                        >
                            <div className={`w-6 h-6 border flex items-center justify-center shrink-0 ${iconColorClass}`}>
                                <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">{log.title}</p>
                                    <span className="text-[9px] text-slate-400 font-mono">{log.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{log.message}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default SystemLogs
