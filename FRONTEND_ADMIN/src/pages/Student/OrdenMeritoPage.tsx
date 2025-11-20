import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi, OrdenMerito } from '../../services/estudiantesApi';
import { Users } from 'lucide-react';

export default function OrdenMeritoPage() {
  const [promocionSeleccionada, setPromocionSeleccionada] = useState<string>('');

  // Query para obtener promociones
  const { data: promociones = [] } = useQuery({
    queryKey: ['promociones'],
    queryFn: estudiantesApi.getPromociones,
    retry: false,
  });
  
  // Query para obtener mi posición (ignorar errores 404)
  const { data: miPosicion } = useQuery({
    queryKey: ['mi-posicion-merito'],
    queryFn: estudiantesApi.getMiPosicionMerito,
    retry: false,
    // Ignorar errores 404, solo mostrar cuando hay datos
  });

  // Query para obtener orden de mérito
  const { data: ordenMerito = [], isLoading } = useQuery({
    queryKey: ['orden-merito', promocionSeleccionada],
    queryFn: () => estudiantesApi.getOrdenMerito(promocionSeleccionada || undefined),
    retry: false,
  });

  // Función para obtener badge según la posición
  const getBadgePosicion = (posicion: number) => {
    if (posicion === 1) return <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded">1°</span>;
    if (posicion === 2) return <span className="px-2 py-1 bg-slate-400 text-white text-xs font-bold rounded">2°</span>;
    if (posicion === 3) return <span className="px-2 py-1 bg-amber-700 text-white text-xs font-bold rounded">3°</span>;
    return null;
  };

  // Función para obtener el estilo según el rango
  const getEstiloRango = (rango: string) => {
    switch (rango) {
      case 'Décimo Superior':
        return 'bg-amber-50 border-l-4 border-amber-500';
      case 'Quinto Superior':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'Tercio Superior':
        return 'bg-emerald-50 border-l-4 border-emerald-500';
      case 'Medio Superior':
        return 'bg-violet-50 border-l-4 border-violet-500';
      default:
        return 'hover:bg-gray-50';
    }
  };

  const getRangoBadge = (rango: string) => {
    const estilos: Record<string, string> = {
      'Décimo Superior': 'bg-amber-100 text-amber-800 border-amber-300',
      'Quinto Superior': 'bg-blue-100 text-blue-800 border-blue-300',
      'Tercio Superior': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'Medio Superior': 'bg-violet-100 text-violet-800 border-violet-300',
    };
    return estilos[rango] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orden de Mérito Académico</h1>
        
        {/* Info del periodo */}
        {ordenMerito.length > 0 && ordenMerito[0].periodoNombre && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-600">Periodo de Evaluación:</span>
            <span className={`text-sm font-semibold ${ordenMerito[0].estadoPeriodo === 'CERRADO' ? 'text-green-700' : 'text-amber-700'}`}>
              {ordenMerito[0].periodoNombre}
            </span>
            {ordenMerito[0].estadoPeriodo === 'CERRADO' && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                ✓ Periodo Cerrado
              </span>
            )}
            {ordenMerito[0].estadoPeriodo === 'ACTIVO' && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium">
                ⚠ Periodo en Curso (provisional)
              </span>
            )}
          </div>
        )}

        {/* Selector de promoción */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filtrar por Promoción:</label>
          <select
            value={promocionSeleccionada}
            onChange={(e) => setPromocionSeleccionada(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="">📊 Todas las promociones</option>
            {promociones.map((promo) => (
              <option key={promo} value={promo}>
                Promoción {promo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mi Posición */}
      {miPosicion && (
        <div className={`mb-6 border-l-4 ${getEstiloRango(miPosicion.rangoMerito)} bg-gradient-to-r from-indigo-50 to-white rounded-lg shadow-sm overflow-hidden`}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-xl text-3xl font-bold shadow-lg">
                  {miPosicion.posicion}°
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Tu Posición</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {miPosicion.nombres} {miPosicion.apellidos}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Promoción {miPosicion.promocion} • De {miPosicion.totalEstudiantes} estudiantes
                  </p>
                  {miPosicion.rangoMerito && (
                    <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-md border ${getRangoBadge(miPosicion.rangoMerito)}`}>
                      🏆 {miPosicion.rangoMerito}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Promedio Acumulado</p>
                <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                  {miPosicion.promedioPonderadoAcumulado.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Orden de Mérito */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : ordenMerito.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay datos de orden de mérito disponibles</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Puesto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[250px]">
                    Apellidos y Nombres
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Promoción
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Semestre
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    CC
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    CA
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    TCC
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    TCA
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    PPS
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    PPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[150px]">
                    Distinción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {ordenMerito.map((estudiante) => {
                  const isMe = miPosicion && estudiante.codigo === miPosicion.codigo;
                  const estiloFila = isMe
                    ? 'bg-indigo-50 border-l-4 border-indigo-600'
                    : getEstiloRango(estudiante.rangoMerito);

                  return (
                    <tr key={estudiante.codigo} className={`${estiloFila} transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getBadgePosicion(estudiante.posicion)}
                          <span className="text-sm font-semibold text-gray-900">{estudiante.posicion}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {estudiante.codigo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{estudiante.apellidos}, {estudiante.nombres}</div>
                        {isMe && (
                          <span className="inline-block mt-1 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">
                            Tu posición
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600">
                        {estudiante.promocion}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600">
                        {estudiante.semestre}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-700">
                        {estudiante.creditosLlevadosSemestre}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-700">
                        {estudiante.creditosAprobadosSemestre}
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-medium text-gray-900">
                        {estudiante.totalCreditosLlevados}
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-medium text-gray-900">
                        {estudiante.totalCreditosAprobados}
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-semibold text-gray-900">
                        {estudiante.promedioPonderadoSemestral.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-bold text-indigo-600">
                        {estudiante.promedioPonderadoAcumulado.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {estudiante.rangoMerito && (
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-md border ${getRangoBadge(estudiante.rangoMerito)}`}>
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

      {/* Nota informativa */}
      {ordenMerito.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">📊 Información del Ranking</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• <strong>CC:</strong> Créditos llevados en el periodo evaluado</li>
              <li>• <strong>CA:</strong> Créditos aprobados en el periodo evaluado</li>
              <li>• <strong>TCC/TCA:</strong> Total acumulado de créditos</li>
              <li>• <strong>PPA:</strong> Promedio ponderado de toda tu carrera</li>
            </ul>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="text-sm font-semibold text-amber-900 mb-2">⚠️ Importante</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Las constancias de <strong>Medio Superior</strong> solo son emitidas para PRONABEC. 
              El orden de mérito se actualiza automáticamente al finalizar y cerrar cada período académico.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
