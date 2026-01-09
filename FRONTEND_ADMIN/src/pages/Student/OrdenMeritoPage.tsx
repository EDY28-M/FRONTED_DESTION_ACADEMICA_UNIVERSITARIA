import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi, OrdenMerito } from '../../services/estudiantesApi';
import { Users, Filter, Trophy, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/Student/PageHeader';

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

  const getBadgePosicion = (posicion: number) => {
    if (posicion === 1) return <span className="px-1.5 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded">1°</span>;
    if (posicion === 2) return <span className="px-1.5 py-0.5 bg-zinc-400 text-white text-xs font-semibold rounded">2°</span>;
    if (posicion === 3) return <span className="px-1.5 py-0.5 bg-amber-700 text-white text-xs font-semibold rounded">3°</span>;
    return null;
  };

  const getEstiloRango = (rango: string) => {
    switch (rango) {
      case 'Décimo Superior':
        return 'bg-amber-50/50';
      case 'Quinto Superior':
        return 'bg-blue-50/50';
      case 'Tercio Superior':
        return 'bg-emerald-50/50';
      case 'Medio Superior':
        return 'bg-violet-50/50';
      default:
        return 'hover:bg-zinc-50/50';
    }
  };

  const getRangoBadge = (rango: string) => {
    const estilos: Record<string, string> = {
      'Décimo Superior': 'bg-amber-50 text-amber-700 border-amber-200',
      'Quinto Superior': 'bg-blue-50 text-blue-700 border-blue-200',
      'Tercio Superior': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Medio Superior': 'bg-violet-50 text-violet-700 border-violet-200',
    };
    return estilos[rango] || 'bg-zinc-50 text-zinc-700 border-zinc-200';
  };

  const filterComponent = (
    <div className="relative">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
      <select
        value={promocionSeleccionada}
        onChange={(e) => setPromocionSeleccionada(e.target.value)}
        className="pl-9 pr-8 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-shadow appearance-none cursor-pointer"
      >
        <option value="">Todas las promociones</option>
        {promociones.map((promo) => (
          <option key={promo} value={promo}>
            Promoción {promo}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Orden de Mérito"
        subtitle={ordenMerito.length > 0 && ordenMerito[0].periodoNombre ? `Período: ${ordenMerito[0].periodoNombre}` : undefined}
        filterComponent={filterComponent}
      />

      {/* Mi Posición Card */}
      {miPosicion && (
        <div className="bg-zinc-900 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Trophy className="w-32 h-32" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <span className="text-3xl font-bold tabular-nums">{miPosicion.posicion}°</span>
              </div>
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Tu Posición</p>
                <h3 className="text-lg font-semibold">
                  {miPosicion.nombres} {miPosicion.apellidos}
                </h3>
                <p className="text-sm text-zinc-400 mt-0.5">
                  Promoción {miPosicion.promocion} • De {miPosicion.totalEstudiantes} estudiantes
                </p>
                {miPosicion.rangoMerito && (
                  <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">
                    <Trophy className="w-3 h-3" />
                    {miPosicion.rangoMerito}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Promedio Acumulado</p>
              <div className="text-4xl font-bold tabular-nums">
                {miPosicion.promedioPonderadoAcumulado.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Orden de Mérito */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">Cargando orden de mérito...</p>
          </div>
        </div>
      ) : ordenMerito.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-sm font-medium text-zinc-900">Sin datos disponibles</h3>
          <p className="text-zinc-500 text-sm mt-1">No hay información de orden de mérito</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider min-w-[200px]">
                    Estudiante
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Prom
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Sem
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    CC
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    CA
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    TCC
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    TCA
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    PPS
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    PPA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Distinción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {ordenMerito.map((estudiante) => {
                  const isMe = miPosicion && estudiante.codigo === miPosicion.codigo;
                  const estiloFila = isMe
                    ? 'bg-zinc-100'
                    : getEstiloRango(estudiante.rangoMerito);

                  return (
                    <tr key={estudiante.codigo} className={`${estiloFila} transition-colors`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getBadgePosicion(estudiante.posicion)}
                          <span className="text-sm font-medium text-zinc-900 tabular-nums">{estudiante.posicion}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-zinc-500">{estudiante.codigo}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-zinc-900">{estudiante.apellidos}, {estudiante.nombres}</div>
                        {isMe && (
                          <span className="inline-block mt-0.5 text-[10px] bg-zinc-900 text-white px-1.5 py-0.5 rounded">
                            Tú
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-zinc-600 tabular-nums">
                        {estudiante.promocion}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-zinc-600 tabular-nums">
                        {estudiante.semestre}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-zinc-600 tabular-nums">
                        {estudiante.creditosLlevadosSemestre}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-zinc-600 tabular-nums">
                        {estudiante.creditosAprobadosSemestre}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-zinc-900 tabular-nums">
                        {estudiante.totalCreditosLlevados}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-zinc-900 tabular-nums">
                        {estudiante.totalCreditosAprobados}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-zinc-700 tabular-nums">
                        {estudiante.promedioPonderadoSemestral.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-semibold text-zinc-900 tabular-nums">
                        {estudiante.promedioPonderadoAcumulado.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {estudiante.rangoMerito && (
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${getRangoBadge(estudiante.rangoMerito)}`}>
                            {estudiante.rangoMerito}
                          </span>
                        )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              Información del Ranking
            </h4>
            <ul className="text-xs text-zinc-600 space-y-1.5">
              <li><span className="font-medium text-zinc-700">CC:</span> Créditos llevados en el periodo</li>
              <li><span className="font-medium text-zinc-700">CA:</span> Créditos aprobados en el periodo</li>
              <li><span className="font-medium text-zinc-700">TCC/TCA:</span> Total acumulado de créditos</li>
              <li><span className="font-medium text-zinc-700">PPA:</span> Promedio ponderado acumulado</li>
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-amber-900 mb-2">Importante</h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              Las constancias de <strong>Medio Superior</strong> solo son emitidas para PRONABEC. 
              El orden de mérito se actualiza al finalizar cada período académico.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

