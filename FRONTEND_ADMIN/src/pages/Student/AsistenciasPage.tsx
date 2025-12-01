import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { asistenciasApi } from '../../services/asistenciasApi';
import { estudiantesApi } from '../../services/estudiantesApi';
import { Calendar, Check, X, AlertTriangle, ChevronRight, Clock } from 'lucide-react';

// Progress Bar Component
const ProgressBar = ({ value, alert }: { value: number; alert: boolean }) => (
  <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full transition-all ${alert ? 'bg-red-500' : 'bg-emerald-500'}`}
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

// Course Card Component
const CursoCard = ({
  curso,
  isSelected,
  onClick
}: {
  curso: any;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-4 rounded-xl border transition-all ${
      isSelected 
        ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900' 
        : 'border-zinc-200 hover:border-zinc-300 bg-white'
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] font-medium text-zinc-900 truncate">{curso.nombreCurso}</h3>
        <p className="text-[11px] text-zinc-500">{curso.codigoCurso} · {curso.creditos} créd.</p>
      </div>
      <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-500" />
          <span className="text-[11px] font-medium text-zinc-600">{curso.totalAsistencias}</span>
        </div>
        <div className="flex items-center gap-1">
          <X className="w-3 h-3 text-red-500" />
          <span className="text-[11px] font-medium text-zinc-600">{curso.totalFaltas}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ProgressBar value={curso.porcentajeAsistencia} alert={curso.alertaBajaAsistencia} />
        <span className={`text-[13px] font-semibold tabular-nums ${
          curso.alertaBajaAsistencia ? 'text-red-600' : 'text-emerald-600'
        }`}>
          {curso.porcentajeAsistencia.toFixed(0)}%
        </span>
      </div>
    </div>

    {curso.alertaBajaAsistencia && (
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-600">
        <AlertTriangle className="w-3 h-3" />
        <span>Asistencia baja</span>
      </div>
    )}
  </button>
);

const AsistenciasPage: React.FC = () => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);

  const { data: perfil } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

  const { data: periodoActivo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const { data: asistenciasPorCurso, isLoading } = useQuery({
    queryKey: ['asistencias-estudiante', perfil?.id, periodoActivo?.id],
    queryFn: () => asistenciasApi.getAsistenciasEstudiante(perfil!.id, periodoActivo?.id),
    enabled: !!perfil?.id,
  });

  const cursoDetallado = cursoSeleccionado
    ? asistenciasPorCurso?.find(c => c.idCurso === cursoSeleccionado)
    : null;

  const cursosConAlerta = asistenciasPorCurso?.filter(c => c.alertaBajaAsistencia).length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-zinc-500">Cargando asistencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="h-14 px-6 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-zinc-900">Mis Asistencias</h1>
              <p className="text-[11px] text-zinc-500">{periodoActivo?.nombre || 'Sin período activo'}</p>
            </div>
          </div>

          {cursosConAlerta > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-[13px] text-red-700">
                {cursosConAlerta} curso{cursosConAlerta > 1 ? 's' : ''} con asistencia baja
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {asistenciasPorCurso && asistenciasPorCurso.length > 0 ? (
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar - Cursos */}
            <div className="col-span-4 space-y-3">
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-1">
                Cursos ({asistenciasPorCurso.length})
              </p>
              {asistenciasPorCurso.map((curso) => (
                <CursoCard
                  key={curso.idCurso}
                  curso={curso}
                  isSelected={cursoSeleccionado === curso.idCurso}
                  onClick={() => setCursoSeleccionado(curso.idCurso === cursoSeleccionado ? null : curso.idCurso)}
                />
              ))}
            </div>

            {/* Detail Panel */}
            <div className="col-span-8">
              {cursoDetallado ? (
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                  {/* Detail Header */}
                  <div className="px-5 py-4 border-b border-zinc-100">
                    <h2 className="text-sm font-medium text-zinc-900">{cursoDetallado.nombreCurso}</h2>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {cursoDetallado.nombreDocente} · {cursoDetallado.codigoCurso}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 divide-x divide-zinc-100 border-b border-zinc-100">
                    {[
                      { label: 'Total Clases', value: cursoDetallado.totalClases, color: 'zinc' },
                      { label: 'Asistencias', value: cursoDetallado.totalAsistencias, color: 'emerald' },
                      { label: 'Faltas', value: cursoDetallado.totalFaltas, color: 'red' },
                      { label: 'Porcentaje', value: `${cursoDetallado.porcentajeAsistencia.toFixed(1)}%`, color: cursoDetallado.alertaBajaAsistencia ? 'red' : 'emerald' },
                    ].map((stat) => (
                      <div key={stat.label} className="p-4 text-center">
                        <p className="text-[11px] text-zinc-500 mb-1">{stat.label}</p>
                        <p className={`text-xl font-semibold tabular-nums text-${stat.color}-600`}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Attendance Table */}
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-zinc-50 z-10">
                        <tr className="border-b border-zinc-100">
                          <th className="py-2.5 px-4 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Fecha</th>
                          <th className="py-2.5 px-4 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Tipo</th>
                          <th className="py-2.5 px-4 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Estado</th>
                          <th className="py-2.5 px-4 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cursoDetallado.asistencias.map((asistencia) => (
                          <tr key={asistencia.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
                            <td className="py-3 px-4">
                              <span className="text-[13px] text-zinc-900 font-mono">
                                {new Date(asistencia.fecha).toLocaleDateString('es-PE', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded ${
                                asistencia.tipoClase === 'Práctica'
                                  ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                                  : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                              }`}>
                                {asistencia.tipoClase}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {asistencia.presente ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded ring-1 ring-emerald-200">
                                  <Check className="w-3 h-3" />
                                  Presente
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-[11px] font-medium rounded ring-1 ring-red-200">
                                  <X className="w-3 h-3" />
                                  Ausente
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[13px] text-zinc-500">
                                {asistencia.observaciones || '—'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-white rounded-xl border border-zinc-200 min-h-[400px]">
                  <div className="text-center">
                    <Calendar className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">Selecciona un curso</p>
                    <p className="text-[11px] text-zinc-400 mt-1">para ver el detalle de asistencias</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-xl border border-zinc-200">
            <Clock className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No hay asistencias registradas</p>
            <p className="text-[11px] text-zinc-400 mt-1">Tus docentes aún no han registrado asistencias</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsistenciasPage;


