import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { Trophy, Users, TrendingUp, Medal, Filter } from 'lucide-react';

// Rank Badge Component
const RankBadge = ({ position }: { position: number }) => {
  if (position === 1) return (
    <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-900 flex items-center justify-center text-xs font-bold shadow-sm">1°</span>
  );
  if (position === 2) return (
    <span className="w-7 h-7 rounded-full bg-zinc-300 text-zinc-700 flex items-center justify-center text-xs font-bold shadow-sm">2°</span>
  );
  if (position === 3) return (
    <span className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">3°</span>
  );
  return null;
};

// Distinction Badge Component
const DistincionBadge = ({ rango }: { rango: string }) => {
  const estilos: Record<string, string> = {
    'Décimo Superior': 'bg-amber-50 text-amber-700 ring-amber-200',
    'Quinto Superior': 'bg-blue-50 text-blue-700 ring-blue-200',
    'Tercio Superior': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    'Medio Superior': 'bg-violet-50 text-violet-700 ring-violet-200',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded ring-1 ${estilos[rango] || 'bg-zinc-50 text-zinc-600 ring-zinc-200'}`}>
      {rango}
    </span>
  );
};

export default function OrdenMeritoPage() {
  const [promocionSeleccionada, setPromocionSeleccionada] = useState<string>('');

  const { data: promociones = [] } = useQuery({
    queryKey: ['promociones'],
    queryFn: estudiantesApi.getPromociones,
    retry: false,
  });
  
  const { data: miPosicion } = useQuery({
    queryKey: ['mi-posicion-merito'],
    queryFn: estudiantesApi.getMiPosicionMerito,
    retry: false,
  });

  const { data: ordenMerito = [], isLoading } = useQuery({
    queryKey: ['orden-merito', promocionSeleccionada],
    queryFn: () => estudiantesApi.getOrdenMerito(promocionSeleccionada || undefined),
    retry: false,
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="h-14 px-6 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-zinc-900">Orden de Mérito Académico</h1>
              {ordenMerito.length > 0 && ordenMerito[0].periodoNombre && (
                <p className="text-[11px] text-zinc-500">
                  {ordenMerito[0].periodoNombre}
                  {ordenMerito[0].estadoPeriodo === 'CERRADO' && (
                    <span className="ml-1.5 text-emerald-600">· Consolidado</span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={promocionSeleccionada}
              onChange={(e) => setPromocionSeleccionada(e.target.value)}
              className="text-[13px] px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">Todas las promociones</option>
              {promociones.map((promo) => (
                <option key={promo} value={promo}>Promoción {promo}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        {/* My Position Card */}
        {miPosicion && (
          <div className="bg-zinc-900 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                  <span className="text-2xl font-bold">{miPosicion.posicion}°</span>
                </div>
                <div>
                  <p className="text-zinc-400 text-[11px] uppercase tracking-wider mb-1">Tu Posición</p>
                  <h2 className="text-lg font-medium">{miPosicion.nombres} {miPosicion.apellidos}</h2>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[13px] text-zinc-400">Promoción {miPosicion.promocion}</span>
                    <span className="text-[13px] text-zinc-500">·</span>
                    <span className="text-[13px] text-zinc-400">De {miPosicion.totalEstudiantes} estudiantes</span>
                    {miPosicion.rangoMerito && (
                      <>
                        <span className="text-[13px] text-zinc-500">·</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[11px] font-medium rounded">
                          <Medal className="w-3 h-3" />
                          {miPosicion.rangoMerito}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-zinc-400 text-[11px] uppercase tracking-wider mb-1">Promedio Acumulado</p>
                <p className="text-4xl font-bold tabular-nums tracking-tight">
                  {miPosicion.promedioPonderadoAcumulado.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rankings Table */}
        {isLoading ? (
          <div className="py-16 text-center bg-white rounded-xl border border-zinc-200">
            <div className="inline-block w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
            <p className="mt-3 text-sm text-zinc-500">Cargando ranking...</p>
          </div>
        ) : ordenMerito.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-zinc-200">
            <Users className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No hay datos de orden de mérito disponibles</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="py-3 px-4 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-20">Puesto</th>
                    <th className="py-3 px-4 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Código</th>
                    <th className="py-3 px-4 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider min-w-[200px]">Estudiante</th>
                    <th className="py-3 px-4 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Promoción</th>
                    <th className="py-3 px-4 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Sem.</th>
                    <th className="py-3 px-4 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider" title="Créditos Cursados">CC</th>
                    <th className="py-3 px-4 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider" title="Créditos Aprobados">CA</th>
                    <th className="py-3 px-4 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider" title="Total Créditos Cursados">TCC</th>
                    <th className="py-3 px-4 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider" title="Total Créditos Aprobados">TCA</th>
                    <th className="py-3 px-4 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider bg-blue-50/50" title="Promedio Semestral">PPS</th>
                    <th className="py-3 px-4 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider bg-emerald-50/50" title="Promedio Acumulado">PPA</th>
                    <th className="py-3 px-4 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Distinción</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenMerito.map((estudiante) => {
                    const isMe = miPosicion && estudiante.codigo === miPosicion.codigo;
                    
                    return (
                      <tr 
                        key={estudiante.codigo} 
                        className={`border-b border-zinc-50 last:border-0 transition-colors ${
                          isMe ? 'bg-blue-50/50' : 'hover:bg-zinc-50/50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <RankBadge position={estudiante.posicion} />
                            <span className="text-[13px] font-semibold text-zinc-700 tabular-nums">{estudiante.posicion}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[13px] text-zinc-600 font-mono">{estudiante.codigo}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-[13px] font-medium text-zinc-900">{estudiante.apellidos}, {estudiante.nombres}</p>
                            {isMe && (
                              <span className="inline-flex mt-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">
                                Tú
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[13px] text-zinc-600">{estudiante.promocion}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[13px] text-zinc-600">{estudiante.semestre}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[13px] text-zinc-600 tabular-nums">{estudiante.creditosLlevadosSemestre}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[13px] text-zinc-600 tabular-nums">{estudiante.creditosAprobadosSemestre}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[13px] font-medium text-zinc-800 tabular-nums">{estudiante.totalCreditosLlevados}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[13px] font-medium text-zinc-800 tabular-nums">{estudiante.totalCreditosAprobados}</span>
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50/30">
                          <span className="text-[13px] font-semibold text-blue-700 tabular-nums">{estudiante.promedioPonderadoSemestral.toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-4 text-center bg-emerald-50/30">
                          <span className="text-[13px] font-bold text-emerald-700 tabular-nums">{estudiante.promedioPonderadoAcumulado.toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-4">
                          {estudiante.rangoMerito && <DistincionBadge rango={estudiante.rangoMerito} />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info Cards */}
        {ordenMerito.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-zinc-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                <h3 className="text-[13px] font-medium text-zinc-900">Leyenda de Columnas</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="font-medium text-zinc-700">CC:</span> <span className="text-zinc-500">Créditos cursados en el periodo</span></div>
                <div><span className="font-medium text-zinc-700">CA:</span> <span className="text-zinc-500">Créditos aprobados en el periodo</span></div>
                <div><span className="font-medium text-zinc-700">TCC/TCA:</span> <span className="text-zinc-500">Total acumulado de créditos</span></div>
                <div><span className="font-medium text-zinc-700">PPA:</span> <span className="text-zinc-500">Promedio ponderado acumulado</span></div>
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h3 className="text-[13px] font-medium text-amber-900 mb-2">⚠️ Importante</h3>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Las constancias de <strong>Medio Superior</strong> solo son emitidas para PRONABEC. 
                El orden de mérito se actualiza al finalizar cada período académico.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

