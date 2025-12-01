import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { asistenciasApi } from '../../services/asistenciasApi';
import { estudiantesApi } from '../../services/estudiantesApi';
import { Calendar, CheckCircle2, XCircle, AlertTriangle, X, Eye } from 'lucide-react';

const AsistenciasPage: React.FC = () => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);

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

  const cursoDetallado = cursoSeleccionado
    ? asistenciasPorCurso?.find(c => c.idCurso === cursoSeleccionado)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-zinc-400 text-sm">Cargando asistencias...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h1 className="text-lg font-semibold text-zinc-900">Mis Asistencias</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Período: {periodoActivo?.nombre || 'Sin período activo'}
        </p>
      </div>

      {/* Alerta de baja asistencia */}
      {asistenciasPorCurso?.some(c => c.alertaBajaAsistencia) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Tienes cursos con menos del 70% de asistencia
          </p>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Docente</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Clases</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Asistencias</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Faltas</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide w-40">Porcentaje</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {asistenciasPorCurso.map((curso) => (
                  <tr key={curso.idCurso} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-zinc-900">{curso.nombreCurso}</div>
                      <div className="text-xs text-zinc-500">{curso.codigoCurso} • {curso.creditos} cr.</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600">{curso.nombreDocente || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-mono tabular-nums text-zinc-700">{curso.totalClases}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-mono tabular-nums text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {curso.totalAsistencias}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-mono tabular-nums text-red-600">
                        <XCircle className="h-3.5 w-3.5" />
                        {curso.totalFaltas}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              curso.alertaBajaAsistencia ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(curso.porcentajeAsistencia, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-mono tabular-nums font-medium ${
                          curso.alertaBajaAsistencia ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          {curso.porcentajeAsistencia.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {curso.alertaBajaAsistencia ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 text-xs font-medium rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          Alerta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium rounded-full">
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
                ))}
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

            {/* Resumen */}
            <div className="px-5 py-4 border-b border-zinc-200">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold font-mono tabular-nums text-zinc-700">{cursoDetallado.totalClases}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Total Clases</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">{cursoDetallado.totalAsistencias}</div>
                  <div className="text-xs text-emerald-700 mt-0.5">Asistencias</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold font-mono tabular-nums text-red-600">{cursoDetallado.totalFaltas}</div>
                  <div className="text-xs text-red-700 mt-0.5">Faltas</div>
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
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${
                          asistencia.tipoClase === 'Práctica' 
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


