import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { asistenciasApi } from '../../services/asistenciasApi';
import { estudiantesApi } from '../../services/estudiantesApi';
import { Calendar, CheckCircle2, XCircle, AlertTriangle, X, Eye, Ban, Clock } from 'lucide-react';
import PageHeader from '../../components/Student/PageHeader';

const AsistenciasPage: React.FC = () => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);
  const [estadisticasCompletas, setEstadisticasCompletas] = useState<Record<number, any>>({});

  // Obtener perfil del estudiante
  const { data: perfil } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

  // Obtener período activo
  const { data: periodoActivo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  // Obtener asistencias del estudiante
  const { data: asistenciasPorCurso, isLoading } = useQuery({
    queryKey: ['asistencias-estudiante', perfil?.id, periodoActivo?.id],
    queryFn: () => asistenciasApi.getAsistenciasEstudiante(perfil!.id, periodoActivo?.id),
    enabled: !!perfil?.id,
  });

  // Cargar estadísticas completas para cada curso
  React.useEffect(() => {
    const cargarEstadisticas = async () => {
      if (perfil?.id && asistenciasPorCurso) {
        const promises = asistenciasPorCurso.map(async (curso) => {
          try {
            const stats = await asistenciasApi.getEstadisticasCompletas(perfil.id, curso.idCurso);
            console.log(`Estadísticas curso ${curso.nombreCurso}:`, stats);
            return { idCurso: curso.idCurso, stats };
          } catch (error) {
            console.error(`Error cargando estadísticas para curso ${curso.idCurso}:`, error);
            return { idCurso: curso.idCurso, stats: null };
          }
        });

        const resultados = await Promise.all(promises);
        const nuevasEstadisticas = resultados.reduce((acc, { idCurso, stats }) => {
          if (stats) {
            acc[idCurso] = stats;
          }
          return acc;
        }, {} as Record<number, any>);

        setEstadisticasCompletas(nuevasEstadisticas);
      }
    };

    cargarEstadisticas();
  }, [perfil?.id, asistenciasPorCurso]);

  const cursoDetallado = cursoSeleccionado
    ? asistenciasPorCurso?.find(c => c.idCurso === cursoSeleccionado)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Cargando asistencias...</p>
        </div>
      </div>
    );
  }

  const filterComponent = periodoActivo ? (
    <div className="flex items-center gap-2 text-sm text-zinc-600">
      <Calendar className="h-4 w-4" />
      <span>{periodoActivo.nombre}</span>
    </div>
  ) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Asistencias"
        subtitle={`Período: ${periodoActivo?.nombre || 'Sin período activo'}`}
        periodoMostrar={periodoActivo}
        filterComponent={filterComponent}
      />

      {/* Alerta de baja asistencia y bloqueo de examen */}
      {asistenciasPorCurso?.some(c => {
        const stats = estadisticasCompletas[c.idCurso];
        return c.alertaBajaAsistencia || (stats && !stats.puedeDarExamenFinal);
      }) && (
          <div className="space-y-3">
            {asistenciasPorCurso?.some(c => c.alertaBajaAsistencia) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Tienes cursos con menos del 70% de asistencia
                </p>
              </div>
            )}
            {Object.values(estadisticasCompletas).some((stats: any) => !stats.puedeDarExamenFinal) && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <Ban className="h-4 w-4 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Bloqueado para Examen Final</p>
                  <p className="text-xs text-red-700 mt-0.5">
                    Tienes cursos donde superaste el 30% de inasistencias. No podrás rendir el examen final en estos cursos.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Tabla de Cursos */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {asistenciasPorCurso && asistenciasPorCurso.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Curso</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Asistencia</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {asistenciasPorCurso.map((curso) => {
                  const stats = estadisticasCompletas[curso.idCurso];
                  const porcentajeAsistencia = stats?.porcentajeAsistencia !== undefined ? stats.porcentajeAsistencia : curso.porcentajeAsistencia;
                  const porcentajeInasistencia = stats?.porcentajeInasistencia || 0;
                  const presentes = stats?.asistenciasPresente !== undefined ? stats.asistenciasPresente : curso.totalAsistencias;
                  const faltas = stats?.asistenciasFalta !== undefined ? stats.asistenciasFalta : curso.totalFaltas;

                  return (
                    <tr key={curso.idCurso} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-zinc-900">{curso.nombreCurso}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{curso.codigoCurso} • {curso.creditos} cr.</div>
                        {curso.nombreDocente && (
                          <div className="text-xs text-zinc-400 mt-0.5">{curso.nombreDocente}</div>
                        )}
                        {stats && !stats.puedeDarExamenFinal && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                            <Ban className="h-2.5 w-2.5" />
                            Sin examen final
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-2 w-full">
                            <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${porcentajeInasistencia >= 30 ? 'bg-red-500' :
                                    porcentajeAsistencia < 70 || curso.alertaBajaAsistencia ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                style={{ width: `${Math.min(porcentajeAsistencia, 100)}%` }}
                              />
                            </div>
                            <span className={`text-sm font-mono tabular-nums font-semibold min-w-[3rem] text-right ${porcentajeInasistencia >= 30 ? 'text-red-600' :
                                porcentajeAsistencia < 70 || curso.alertaBajaAsistencia ? 'text-amber-600' : 'text-emerald-600'
                              }`}>
                              {porcentajeAsistencia.toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span className="font-mono">{presentes}</span>
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-red-600" />
                              <span className="font-mono">{faltas}</span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {stats && !stats.puedeDarExamenFinal ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-medium rounded-full">
                            <Ban className="h-3 w-3" />
                            Bloqueado
                          </span>
                        ) : curso.alertaBajaAsistencia ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium rounded-full">
                            <AlertTriangle className="h-3 w-3" />
                            Alerta
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setCursoSeleccionado(curso.idCurso)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Calendar className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 mb-1">No hay asistencias registradas</p>
            <p className="text-xs text-zinc-400">Tus docentes aún no han registrado asistencias</p>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {cursoDetallado && (
        <div
          className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setCursoSeleccionado(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">{cursoDetallado.nombreCurso}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Detalle de asistencias</p>
              </div>
              <button
                onClick={() => setCursoSeleccionado(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Alerta de bloqueo */}
            {estadisticasCompletas[cursoDetallado.idCurso] && !estadisticasCompletas[cursoDetallado.idCurso].puedeDarExamenFinal && (
              <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <div className="flex items-start gap-3">
                  <Ban className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-900">Examen Final Bloqueado</h3>
                    <p className="text-xs text-red-700 mt-1">
                      {estadisticasCompletas[cursoDetallado.idCurso].mensajeBloqueo}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen */}
            <div className="px-5 py-4 border-b border-zinc-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold font-mono tabular-nums text-blue-700">
                    {estadisticasCompletas[cursoDetallado.idCurso]?.sesionesPorSemana || '-'}
                  </div>
                  <div className="text-[10px] text-blue-700 mt-0.5 uppercase font-medium">Ses/Semana</div>
                </div>
                <div className="bg-zinc-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold font-mono tabular-nums text-zinc-700">
                    {estadisticasCompletas[cursoDetallado.idCurso]?.totalSesionesEsperadas || cursoDetallado.totalClases}
                  </div>
                  <div className="text-[10px] text-zinc-600 mt-0.5 uppercase font-medium">Esperadas</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold font-mono tabular-nums text-emerald-600">{cursoDetallado.totalAsistencias}</div>
                  <div className="text-[10px] text-emerald-700 mt-0.5 uppercase font-medium">Presentes</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold font-mono tabular-nums text-red-600">{cursoDetallado.totalFaltas}</div>
                  <div className="text-[10px] text-red-700 mt-0.5 uppercase font-medium">Faltas</div>
                </div>
              </div>

              {/* Barra de porcentajes */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-zinc-600">Asistencia</span>
                    <span className="text-xs font-mono font-semibold text-emerald-600">
                      {cursoDetallado.porcentajeAsistencia.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(cursoDetallado.porcentajeAsistencia, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-zinc-600">Inasistencia</span>
                    <span className={`text-xs font-mono font-semibold ${estadisticasCompletas[cursoDetallado.idCurso]?.porcentajeInasistencia >= 30 ? 'text-red-600' :
                        estadisticasCompletas[cursoDetallado.idCurso]?.porcentajeInasistencia >= 25 ? 'text-amber-600' : 'text-zinc-600'
                      }`}>
                      {estadisticasCompletas[cursoDetallado.idCurso]?.porcentajeInasistencia.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${estadisticasCompletas[cursoDetallado.idCurso]?.porcentajeInasistencia >= 30 ? 'bg-red-500' :
                          estadisticasCompletas[cursoDetallado.idCurso]?.porcentajeInasistencia >= 25 ? 'bg-amber-500' : 'bg-zinc-400'
                        }`}
                      style={{ width: `${Math.min(estadisticasCompletas[cursoDetallado.idCurso]?.porcentajeInasistencia || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de asistencias */}
            <div className="overflow-y-auto max-h-[calc(85vh-240px)]">
              <table className="w-full">
                <thead className="sticky top-0">
                  <tr className="border-b border-zinc-200 bg-zinc-50/80 backdrop-blur-sm">
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Fecha</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Tipo</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {cursoDetallado.asistencias.map((asistencia) => (
                    <tr key={asistencia.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-zinc-700 font-mono tabular-nums">
                        {new Date(asistencia.fecha).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${asistencia.tipoClase === 'Práctica'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-violet-50 text-violet-700 border-violet-200'
                          }`}>
                          {asistencia.tipoClase}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {asistencia.presente ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Presente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 text-xs rounded-full">
                            <XCircle className="h-3 w-3" />
                            Ausente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">{asistencia.observaciones || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer del modal */}
            <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50/50">
              <button
                onClick={() => setCursoSeleccionado(null)}
                className="w-full px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsistenciasPage;


