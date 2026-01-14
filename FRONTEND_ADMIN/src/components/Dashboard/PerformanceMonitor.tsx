import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { estadisticasApi } from '../../services/estadisticasApi'

interface PerformanceMetrics {
    efficiencyTotal: number
    docentesConCursosPercent: number
    estudiantesMatriculadosPercent: number
    cursosActivosPercent: number
    totalDocentes: number
    docentesConCursos: number
    totalEstudiantes: number
    estudiantesMatriculados: number
    totalCursos: number
    cursosActivos: number
}

const PerformanceMonitor: React.FC = () => {
    const { data, isLoading } = useQuery<PerformanceMetrics>({
        queryKey: ['performanceMetrics'],
        queryFn: () => estadisticasApi.getPerformanceMetrics(),
        refetchInterval: 30000,
    })

    const metrics = data || {
        efficiencyTotal: 0,
        docentesConCursosPercent: 0,
        estudiantesMatriculadosPercent: 0,
        cursosActivosPercent: 0,
        totalDocentes: 0,
        docentesConCursos: 0,
        totalEstudiantes: 0,
        estudiantesMatriculados: 0,
        totalCursos: 0,
        cursosActivos: 0
    }

    return (
        <div className="bg-slate-950 border border-slate-700 p-0 relative flex flex-col h-[400px]">
            {/* Background texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}>
            </div>

            {/* Live indicator */}
            <div className="absolute top-0 right-0 p-2">
                <div className="w-3 h-3 bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
            </div>

            {/* Header */}
            <div className="h-12 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/50 backdrop-blur">
                <h3 className="text-white font-bold uppercase text-xs tracking-wider">Carga Académica</h3>
                <span className="text-[10px] text-lime-400 font-mono">PERÍODO ACTIVO</span>
            </div>

            {/* Gauge container */}
            <div className="flex-1 flex items-center justify-center relative">
                {/* Grid lines */}
                <div className="absolute w-full h-[1px] bg-slate-800"></div>
                <div className="absolute h-full w-[1px] bg-slate-800"></div>

                {isLoading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 border-2 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-400 text-xs">Cargando...</span>
                    </div>
                ) : (
                    <div className="relative w-64 h-64 flex items-center justify-center z-10">
                        {/* Background circles */}
                        <svg className="absolute w-full h-full -rotate-90">
                            <circle cx="128" cy="128" r="110" fill="transparent" stroke="#1e293b" strokeWidth="2" />
                            <circle cx="128" cy="128" r="90" fill="transparent" stroke="#1e293b" strokeWidth="2" />
                            <circle cx="128" cy="128" r="70" fill="transparent" stroke="#1e293b" strokeWidth="2" />
                        </svg>

                        {/* Outer circle - Docentes (coral) */}
                        <svg className="absolute w-full h-full -rotate-90">
                            <circle
                                cx="128"
                                cy="128"
                                r="110"
                                fill="transparent"
                                stroke="#ff6b6b"
                                strokeWidth="4"
                                strokeLinecap="square"
                                strokeDasharray="690"
                                strokeDashoffset={690 - (690 * metrics.docentesConCursosPercent) / 100}
                                className="transition-all duration-1000"
                            />
                        </svg>

                        {/* Middle circle - Estudiantes (lime) */}
                        <svg className="absolute w-full h-full -rotate-90">
                            <circle
                                cx="128"
                                cy="128"
                                r="90"
                                fill="transparent"
                                stroke="#ccff00"
                                strokeWidth="4"
                                strokeLinecap="square"
                                strokeDasharray="565"
                                strokeDashoffset={565 - (565 * metrics.estudiantesMatriculadosPercent) / 100}
                                className="transition-all duration-1000"
                            />
                        </svg>

                        {/* Inner circle - Cursos con horario (blue) */}
                        <svg className="absolute w-full h-full -rotate-90">
                            <circle
                                cx="128"
                                cy="128"
                                r="70"
                                fill="transparent"
                                stroke="#3b82f6"
                                strokeWidth="4"
                                strokeLinecap="square"
                                strokeDasharray="440"
                                strokeDashoffset={440 - (440 * metrics.cursosActivosPercent) / 100}
                                className="transition-all duration-1000"
                            />
                        </svg>

                        {/* Center percentage */}
                        <div className="absolute flex flex-col items-center bg-slate-950 p-4 border border-slate-800">
                            <span className="text-5xl font-bold text-white tracking-tighter font-mono">
                                {metrics.efficiencyTotal}
                                <span className="text-lg text-lime-400">%</span>
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Eficiencia</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom panel with breakdowns */}
            <div className="h-20 border-t border-slate-800 grid grid-cols-3 divide-x divide-slate-800 bg-slate-900/30">
                <div className="flex flex-col items-center justify-center group cursor-default">
                    <span className="text-[#ff6b6b] font-bold text-lg font-mono">{metrics.docentesConCursosPercent}%</span>
                    <span className="text-[9px] text-slate-500 uppercase">Docentes</span>
                    <span className="text-[8px] text-slate-600 font-mono">{metrics.docentesConCursos}/{metrics.totalDocentes} asignados</span>
                </div>
                <div className="flex flex-col items-center justify-center group cursor-default">
                    <span className="text-lime-400 font-bold text-lg font-mono">{metrics.estudiantesMatriculadosPercent}%</span>
                    <span className="text-[9px] text-slate-500 uppercase">Estudiantes</span>
                    <span className="text-[8px] text-slate-600 font-mono">{metrics.estudiantesMatriculados}/{metrics.totalEstudiantes} matriculados</span>
                </div>
                <div className="flex flex-col items-center justify-center group cursor-default">
                    <span className="text-blue-500 font-bold text-lg font-mono">{metrics.cursosActivosPercent}%</span>
                    <span className="text-[9px] text-slate-500 uppercase">Cursos</span>
                    <span className="text-[8px] text-slate-600 font-mono">{metrics.cursosActivos}/{metrics.totalCursos} con horario</span>
                </div>
            </div>
        </div>
    )
}

export default PerformanceMonitor
