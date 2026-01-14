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

    const efficiency = metrics.efficiencyTotal
    const visualTheme = isLoading
        ? {
            containerBg: 'bg-gradient-to-b from-white to-slate-50/60',
            badgeText: 'text-slate-700',
            spinnerBorder: 'border-slate-400',
            liveDot: 'bg-slate-400',
            liveDotShadow: 'shadow-[0_0_10px_rgba(148,163,184,0.35)]',
            percentText: 'text-slate-700',
        }
        : efficiency >= 60
            ? {
                containerBg: 'bg-gradient-to-b from-white via-emerald-50/40 to-emerald-100/30',
                badgeText: 'text-emerald-700',
                spinnerBorder: 'border-emerald-400',
                liveDot: 'bg-emerald-500',
                liveDotShadow: 'shadow-[0_0_10px_rgba(16,185,129,0.35)]',
                percentText: 'text-emerald-700',
            }
            : efficiency >= 41
                ? {
                    containerBg: 'bg-gradient-to-b from-white via-amber-50/40 to-amber-100/30',
                    badgeText: 'text-amber-700',
                    spinnerBorder: 'border-amber-400',
                    liveDot: 'bg-amber-500',
                    liveDotShadow: 'shadow-[0_0_10px_rgba(245,158,11,0.35)]',
                    percentText: 'text-amber-700',
                }
                : {
                    containerBg: 'bg-gradient-to-b from-white via-rose-50/35 to-rose-100/25',
                    badgeText: 'text-rose-700',
                    spinnerBorder: 'border-rose-400',
                    liveDot: 'bg-rose-500',
                    liveDotShadow: 'shadow-[0_0_10px_rgba(244,63,94,0.35)]',
                    percentText: 'text-rose-700',
                }

    return (
        <div className={`${visualTheme.containerBg} border border-zinc-200 p-0 relative flex flex-col h-[400px]`}>

            {/* Live indicator */}
            <div className="absolute top-0 right-0 p-2">
                <div className={`w-3 h-3 ${visualTheme.liveDot} animate-pulse ${visualTheme.liveDotShadow}`}></div>
            </div>

            {/* Header */}
            <div className="h-12 border-b border-zinc-200 flex items-center px-4 justify-between bg-white/60 backdrop-blur">
                <h3 className="text-zinc-900 font-bold uppercase text-xs tracking-wider">Carga Académica</h3>
                <span className={`text-[10px] ${visualTheme.badgeText} font-mono`}>PERÍODO ACTIVO</span>
            </div>

            {/* Gauge container */}
            <div className="flex-1 flex items-center justify-center relative">
                {/* Grid lines */}
           

                {isLoading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 border-2 ${visualTheme.spinnerBorder} border-t-transparent rounded-full animate-spin`}></div>
                        <span className="text-zinc-500 text-xs">Cargando...</span>
                    </div>
                ) : (
                    <div className="relative w-64 h-64 flex items-center justify-center z-10">
                        {/* Background circles */}
                        <svg className="absolute w-full h-full -rotate-90">
                            <circle cx="128" cy="128" r="110" fill="transparent" stroke="#e5e7eb" strokeWidth="2" />
                            <circle cx="128" cy="128" r="90" fill="transparent" stroke="#e5e7eb" strokeWidth="2" />
                            <circle cx="128" cy="128" r="70" fill="transparent" stroke="#e5e7eb" strokeWidth="2" />
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
                                stroke="#38bdf8"
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
                        <div className="absolute flex flex-col items-center bg-white/90 p-4 ">
                            <span className="text-5xl font-bold text-zinc-900 tracking-tighter font-mono">
                                {metrics.efficiencyTotal}
                                <span className={`text-lg ${visualTheme.percentText}`}>%</span>
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Eficiencia</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom panel with breakdowns */}
            <div className="h-20 border-t border-zinc-200 grid grid-cols-3 divide-x divide-zinc-200 bg-white/70">
                <div className="flex flex-col items-center justify-center group cursor-default">
                    <span className="text-[#ff6b6b] font-bold text-lg font-mono">{metrics.docentesConCursosPercent}%</span>
                    <span className="text-[9px] text-zinc-600 uppercase">Docentes</span>
                    <span className="text-[8px] text-zinc-500 font-mono">{metrics.docentesConCursos}/{metrics.totalDocentes} asignados</span>
                </div>
                <div className="flex flex-col items-center justify-center group cursor-default">
                    <span className="text-sky-700 font-bold text-lg font-mono">{metrics.estudiantesMatriculadosPercent}%</span>
                    <span className="text-[9px] text-zinc-600 uppercase">Estudiantes</span>
                    <span className="text-[8px] text-zinc-500 font-mono">{metrics.estudiantesMatriculados}/{metrics.totalEstudiantes} matriculados</span>
                </div>
                <div className="flex flex-col items-center justify-center group cursor-default">
                    <span className="text-blue-500 font-bold text-lg font-mono">{metrics.cursosActivosPercent}%</span>
                    <span className="text-[9px] text-zinc-600 uppercase">Cursos</span>
                    <span className="text-[8px] text-zinc-500 font-mono">{metrics.cursosActivos}/{metrics.totalCursos} con horario</span>
                </div>
            </div>
        </div>
    )
}

export default PerformanceMonitor
