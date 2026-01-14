import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { estadisticasApi } from '../../services/estadisticasApi'

interface PuntoRendimiento {
    semana: string
    rendimiento: number
    numeroSemana: number
}

interface RendimientoData {
    datos: PuntoRendimiento[]
    promedioGeneral: number
    totalEstudiantes: number
}

interface TooltipInfo {
    punto: PuntoRendimiento
    x: number
    y: number
}

const AcademicPerformanceChart: React.FC = () => {
    const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)

    const { data, isLoading } = useQuery<RendimientoData>({
        queryKey: ['rendimientoAcademico'],
        queryFn: () => estadisticasApi.getRendimientoAcademico(),
    })

    const chartConfig = {
        width: 280,
        height: 140,
        paddingLeft: 40,
        paddingTop: 20,
        paddingBottom: 30,
        maxRendimiento: 20
    }

    const getPointPosition = (index: number, rendimiento: number) => {
        const totalPoints = data?.datos?.length || 1
        const x = chartConfig.paddingLeft + (index / Math.max(totalPoints - 1, 1)) * chartConfig.width
        const y = chartConfig.paddingTop + chartConfig.height - (rendimiento / chartConfig.maxRendimiento) * chartConfig.height
        return { x, y }
    }

    const generatePath = (): string => {
        if (!data?.datos || data.datos.length === 0) return ''

        return data.datos.map((punto, index) => {
            const { x, y } = getPointPosition(index, punto.rendimiento)
            return index === 0 ? `M${x} ${y}` : `L${x} ${y}`
        }).join(' ')
    }

    const generateAreaPath = (): string => {
        const linePath = generatePath()
        if (!linePath || !data?.datos?.length) return ''
        const lastX = chartConfig.paddingLeft + chartConfig.width
        const bottomY = chartConfig.paddingTop + chartConfig.height
        return `${linePath} L${lastX} ${bottomY} L${chartConfig.paddingLeft} ${bottomY} Z`
    }

    return (
        <div className="bg-gradient-to-b from-white to-slate-50/60 border border-slate-200 p-6 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-4">
                <h3 className="font-bold text-slate-900 uppercase tracking-tight text-sm">
                    Rendimiento por Período
                </h3>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-sky-500"></div>
                    <span className="text-xs text-slate-500">Últimos 5 períodos</span>
                </div>
            </div>

            {data && (
                <div className="flex gap-6 mb-4 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">Promedio General:</span>
                        <span className="text-sky-600 font-mono font-bold text-lg">{data.promedioGeneral.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">Total Estudiantes:</span>
                        <span className="text-slate-900 font-mono font-bold text-lg">{data.totalEstudiantes}</span>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 text-sm">Cargando datos...</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 w-full relative">
                    {/* Tooltip */}
                    {tooltip && (
                        <div
                            className="absolute z-50 bg-white border border-slate-200 px-4 py-3 text-xs shadow-xl pointer-events-none"
                            style={{
                                left: Math.min(Math.max(tooltip.x, 80), 250),
                                top: Math.max(tooltip.y - 80, 10)
                            }}
                        >
                            <div className="text-sky-700 font-bold text-sm mb-2">{tooltip.punto.semana}</div>
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">Promedio:</span>
                                    <span className="text-slate-900 font-mono font-bold">{tooltip.punto.rendimiento.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">Estudiantes:</span>
                                    <span className="text-slate-900 font-mono font-bold">{tooltip.punto.numeroSemana}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <svg
                        className="w-full h-full"
                        viewBox="0 0 360 220"
                        preserveAspectRatio="xMidYMid meet"
                        onMouseLeave={() => setTooltip(null)}
                    >
                        <defs>
                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28"></stop>
                                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.06"></stop>
                            </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map((i) => {
                            const y = chartConfig.paddingTop + (i / 4) * chartConfig.height
                            return (
                                <line
                                    key={i}
                                    stroke="#e2e8f0"
                                    strokeDasharray="3 3"
                                    strokeWidth="0.5"
                                    x1={chartConfig.paddingLeft}
                                    x2={chartConfig.paddingLeft + chartConfig.width}
                                    y1={y}
                                    y2={y}
                                />
                            )
                        })}

                        {/* Y-axis labels */}
                        {[20, 15, 10, 5, 0].map((val, i) => {
                            const y = chartConfig.paddingTop + (i / 4) * chartConfig.height
                            return (
                                <text
                                    key={val}
                                    x={chartConfig.paddingLeft - 8}
                                    y={y + 4}
                                    textAnchor="end"
                                    className="fill-slate-500 text-[10px] font-mono"
                                >
                                    {val}
                                </text>
                            )
                        })}

                        {/* Area fill */}
                        <path d={generateAreaPath()} fill="url(#chartGradient)"></path>

                        {/* Line chart */}
                        <path
                            d={generatePath()}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="3"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        ></path>

                        {/* Data points with hover areas */}
                        {data?.datos?.map((punto, index) => {
                            const { x, y } = getPointPosition(index, punto.rendimiento)
                            const isHovered = tooltip?.punto.semana === punto.semana

                            return (
                                <g key={index}>
                                    {/* Invisible larger hitbox */}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="20"
                                        fill="transparent"
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={() => setTooltip({ punto, x, y })}
                                    />
                                    {/* Outer glow when hovered */}
                                    {isHovered && (
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="12"
                                            fill="#38bdf8"
                                            opacity="0.3"
                                        />
                                    )}
                                    {/* Visible point */}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={isHovered ? 7 : 5}
                                        fill={isHovered ? "#38bdf8" : "#0f172a"}
                                        stroke="#38bdf8"
                                        strokeWidth="2"
                                    />
                                </g>
                            )
                        })}

                        {/* X-axis labels */}
                        {data?.datos?.map((punto, index) => {
                            const { x } = getPointPosition(index, 0)
                            return (
                                <text
                                    key={index}
                                    x={x}
                                    y={chartConfig.paddingTop + chartConfig.height + 20}
                                    textAnchor="middle"
                                    className="fill-slate-500 text-[9px] font-mono"
                                >
                                    {punto.semana}
                                </text>
                            )
                        })}
                    </svg>
                </div>
            )}
        </div>
    )
}

export default AcademicPerformanceChart
