import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
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
    clientX: number
    clientY: number
}

const AcademicPerformanceChart: React.FC = () => {
    const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    const { data, isLoading } = useQuery<RendimientoData>({
        queryKey: ['rendimientoAcademico'],
        queryFn: () => estadisticasApi.getRendimientoAcademico(),
    })

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const obs = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect
            setContainerSize({ width, height })
        })
        obs.observe(el)
        return () => obs.disconnect()
    }, [])

    const totalPoints = data?.datos?.length || 0
    const minSpacing = 70
    const paddingLeft = 40
    const paddingRight = 30
    const paddingTop = 20
    const paddingBottom = 35
    const maxRendimiento = 20

    const chartWidth = useMemo(() => {
        if (totalPoints <= 1) return 280
        return Math.max(280, (totalPoints - 1) * minSpacing)
    }, [totalPoints])

    const viewBoxW = paddingLeft + chartWidth + paddingRight
    const viewBoxH = 200

    const chartHeight = viewBoxH - paddingTop - paddingBottom

    const getPointPosition = useCallback((index: number, rendimiento: number) => {
        const x = paddingLeft + (index / Math.max(totalPoints - 1, 1)) * chartWidth
        const y = paddingTop + chartHeight - (rendimiento / maxRendimiento) * chartHeight
        return { x, y }
    }, [totalPoints, chartWidth, chartHeight])

    const generatePath = useCallback((): string => {
        if (!data?.datos || data.datos.length === 0) return ''
        return data.datos.map((punto, index) => {
            const { x, y } = getPointPosition(index, punto.rendimiento)
            return index === 0 ? `M${x} ${y}` : `L${x} ${y}`
        }).join(' ')
    }, [data, getPointPosition])

    const generateAreaPath = useCallback((): string => {
        const linePath = generatePath()
        if (!linePath || !data?.datos?.length) return ''
        const lastPoint = getPointPosition(data.datos.length - 1, data.datos[data.datos.length - 1].rendimiento)
        const firstPoint = getPointPosition(0, data.datos[0].rendimiento)
        const bottomY = paddingTop + chartHeight
        return `${linePath} L${lastPoint.x} ${bottomY} L${firstPoint.x} ${bottomY} Z`
    }, [data, generatePath, getPointPosition, chartHeight])

    const needsScroll = containerSize.width > 0 && viewBoxW > containerSize.width * 0.6

    return (
        <div className="bg-gradient-to-b from-white to-slate-50/60 border border-slate-200 p-4 sm:p-6 flex flex-col h-[400px] overflow-hidden">
            <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-tight text-xs sm:text-sm">
                    Rendimiento por Período
                </h3>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-sky-500 shrink-0"></div>
                    <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">Últimos {totalPoints || 5} períodos</span>
                </div>
            </div>

            {data && (
                <div className="flex gap-4 sm:gap-6 mb-3 text-xs flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[11px]">Promedio General:</span>
                        <span className="text-sky-600 font-mono font-bold text-base sm:text-lg">{data.promedioGeneral.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[11px]">Total Estudiantes:</span>
                        <span className="text-slate-900 font-mono font-bold text-base sm:text-lg">{data.totalEstudiantes}</span>
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
                <div
                    ref={containerRef}
                    className={`flex-1 min-h-0 w-full relative ${needsScroll ? 'overflow-x-auto overflow-y-hidden' : ''}`}
                >
                    {/* Tooltip */}
                    {tooltip && (
                        <div
                            className="fixed z-50 bg-white border border-slate-200 px-3 py-2 text-xs shadow-xl pointer-events-none rounded"
                            style={{
                                left: tooltip.clientX + 12,
                                top: tooltip.clientY - 60,
                            }}
                        >
                            <div className="text-sky-700 font-bold text-sm mb-1">{tooltip.punto.semana}</div>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex justify-between gap-3">
                                    <span className="text-slate-500">Promedio:</span>
                                    <span className="text-slate-900 font-mono font-bold">{tooltip.punto.rendimiento.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-slate-500">Estudiantes:</span>
                                    <span className="text-slate-900 font-mono font-bold">{tooltip.punto.numeroSemana}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <svg
                        className="h-full"
                        style={{ width: needsScroll ? `${Math.max(viewBoxW, containerSize.width)}px` : '100%', minWidth: needsScroll ? `${viewBoxW}px` : undefined }}
                        viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
                        preserveAspectRatio={needsScroll ? "xMinYMin meet" : "xMidYMid meet"}
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
                            const y = paddingTop + (i / 4) * chartHeight
                            return (
                                <line
                                    key={i}
                                    stroke="#e2e8f0"
                                    strokeDasharray="3 3"
                                    strokeWidth="0.5"
                                    x1={paddingLeft}
                                    x2={paddingLeft + chartWidth}
                                    y1={y}
                                    y2={y}
                                />
                            )
                        })}

                        {/* Y-axis labels */}
                        {[20, 15, 10, 5, 0].map((val, i) => {
                            const y = paddingTop + (i / 4) * chartHeight
                            return (
                                <text
                                    key={val}
                                    x={paddingLeft - 8}
                                    y={y + 4}
                                    textAnchor="end"
                                    className="fill-slate-500 font-mono"
                                    fontSize="10"
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
                            strokeWidth="2.5"
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
                                        r="18"
                                        fill="transparent"
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={(e) => setTooltip({ punto, clientX: e.clientX, clientY: e.clientY })}
                                        onMouseMove={(e) => setTooltip({ punto, clientX: e.clientX, clientY: e.clientY })}
                                    />
                                    {/* Outer glow when hovered */}
                                    {isHovered && (
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="10"
                                            fill="#38bdf8"
                                            opacity="0.3"
                                        />
                                    )}
                                    {/* Visible point */}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={isHovered ? 6 : 4.5}
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
                                    y={paddingTop + chartHeight + 18}
                                    textAnchor="middle"
                                    className="fill-slate-500 font-mono"
                                    fontSize="10"
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
