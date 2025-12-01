import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { BookOpen, AlertCircle, Filter, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';

const MatriculaPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | undefined>(undefined);
  const [cursosSeleccionados, setCursosSeleccionados] = useState<number[]>([]);

  const { data: perfil } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

  const { data: periodos } = useQuery({
    queryKey: ['periodos'],
    queryFn: estudiantesApi.getPeriodos,
  });

  const { data: periodoActivo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const { data: cursosDisponibles, isLoading } = useQuery({
    queryKey: ['cursos-disponibles', periodoSeleccionado],
    queryFn: () => estudiantesApi.getCursosDisponibles(periodoSeleccionado),
  });

  const matricularMutation = useMutation({
    mutationFn: estudiantesApi.matricular,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['mis-cursos'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al matricular');
    },
  });

  const handleToggleCurso = (idCurso: number) => {
    setCursosSeleccionados(prev => {
      if (prev.includes(idCurso)) {
        return prev.filter(id => id !== idCurso);
      } else {
        return [...prev, idCurso];
      }
    });
  };

  const handleMatricularSeleccionados = async () => {
    if (cursosSeleccionados.length === 0) {
      toast.error('Selecciona al menos un curso para matricular');
      return;
    }

    const idPeriodo = periodoSeleccionado || periodoActivo?.id;
    if (!idPeriodo) {
      toast.error('No hay período activo');
      return;
    }

    let exitosos = 0;
    let fallidos = 0;
    const cursosMatriculados: string[] = [];

    for (const idCurso of cursosSeleccionados) {
      try {
        await matricularMutation.mutateAsync({ idCurso, idPeriodo });
        exitosos++;
        
        // Buscar el nombre del curso
        const curso = cursosDisponibles?.find(c => c.id === idCurso);
        if (curso) {
          cursosMatriculados.push(curso.nombreCurso);
          
          // Crear notificación local
          addNotification({
            type: 'academico',
            action: 'matricula',
            nombre: curso.nombreCurso,
            metadata: {
              idCurso: curso.id,
              nombreCurso: curso.nombreCurso,
              periodo: periodoActivo?.nombre || 'Período actual'
            }
          });
        }
      } catch (error) {
        fallidos++;
      }
    }

    if (exitosos > 0) {
      toast.success(`${exitosos} curso(s) matriculado(s) exitosamente`);
      setCursosSeleccionados([]);
    }
    if (fallidos > 0) {
      toast.error(`${fallidos} curso(s) no pudieron ser matriculados`);
    }
  };

  // Separar cursos por disponibilidad
  const cursosDisponiblesList = cursosDisponibles?.filter(c => c.disponible && !c.yaMatriculado) || [];
  const cursosMatriculadosList = cursosDisponibles?.filter(c => c.yaMatriculado) || [];
  const cursosNoDisponiblesList = cursosDisponibles?.filter(c => !c.disponible && !c.yaMatriculado) || [];

  return (
    <div className="space-y-6">
      {/* Header con info del estudiante */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Matrícula de Cursos</h2>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span>Ciclo</span>
                <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-700 rounded text-xs font-medium font-mono">{perfil?.cicloActual}</span>
              </span>
              <span className="text-zinc-300">•</span>
              <span className="flex items-center gap-1.5">
                <span>Créditos</span>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium font-mono">{perfil?.creditosAcumulados}</span>
              </span>
            </div>
            {periodoActivo && (
              <p className="text-xs text-zinc-400 mt-2 font-mono">
                {periodoActivo.nombre} ({new Date(periodoActivo.fechaInicio).toLocaleDateString('es-PE')} - {new Date(periodoActivo.fechaFin).toLocaleDateString('es-PE')})
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-400" />
            <select
              id="periodo"
              value={periodoSeleccionado || ''}
              onChange={(e) => setPeriodoSeleccionado(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 text-zinc-700 bg-white"
            >
              <option value="">Período Activo</option>
              {periodos?.map((periodo) => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre} {periodo.activo && '(Activo)'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Cursos */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-zinc-500" />
            <h3 className="text-sm font-medium text-zinc-900">Cursos Disponibles</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
              <span className="text-xs text-zinc-500">Disponible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span className="text-xs text-zinc-500">Matriculado</span>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="animate-pulse text-zinc-400 text-sm">Cargando cursos...</div>
          </div>
        ) : cursosDisponiblesList.length > 0 || cursosMatriculadosList.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="w-10 px-4 py-3 text-center">
                      <input type="checkbox" className="rounded border-zinc-300" disabled />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Curso</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Créditos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Docente</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Vacantes</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Horario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {cursosDisponiblesList.map((curso) => (
                    <tr key={curso.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                          checked={cursosSeleccionados.includes(curso.id)}
                          onChange={() => handleToggleCurso(curso.id)}
                          disabled={matricularMutation.isPending}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded">
                          {curso.codigo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-zinc-900">{curso.nombreCurso}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-mono tabular-nums text-zinc-700">{curso.creditos}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{curso.nombreDocente}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-mono tabular-nums">
                          <span className="text-zinc-900">{curso.estudiantesMatriculados || 0}</span>
                          <span className="text-zinc-300">/</span>
                          <span className="text-zinc-500">{curso.capacidadMaxima || 30}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                          Disponible
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-zinc-500 font-mono">
                        <div>Lu/Mi</div>
                      </td>
                    </tr>
                  ))}
                  {cursosMatriculadosList.map((curso) => (
                    <tr key={curso.id} className="bg-amber-50/30">
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <Check className="h-4 w-4 text-amber-600" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          {curso.codigo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-zinc-900">{curso.nombreCurso}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-mono tabular-nums text-zinc-700">{curso.creditos}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{curso.nombreDocente}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-mono tabular-nums">
                          <span className="text-zinc-900">{curso.estudiantesMatriculados || 0}</span>
                          <span className="text-zinc-300">/</span>
                          <span className="text-zinc-500">{curso.capacidadMaxima || 30}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                          Matriculado
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-zinc-500 font-mono">
                        <div>Ma/Ju</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Footer */}
            <div className="px-5 py-4 bg-zinc-50/50 border-t border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Disponibles:</span>
                  <span className="font-mono tabular-nums text-zinc-700">{cursosDisponiblesList.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Matriculados:</span>
                  <span className="font-mono tabular-nums text-amber-600">{cursosMatriculadosList.length}</span>
                </div>
                {cursosSeleccionados.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">Seleccionados:</span>
                    <span className="font-mono tabular-nums text-emerald-600">{cursosSeleccionados.length}</span>
                  </div>
                )}
              </div>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleMatricularSeleccionados}
                disabled={cursosSeleccionados.length === 0 || matricularMutation.isPending}
              >
                <BookOpen className="h-4 w-4" />
                Matricular ({cursosSeleccionados.length})
              </button>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <BookOpen className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 mb-1">No hay cursos disponibles</p>
            <p className="text-xs text-zinc-400">Selecciona otro período o espera a que se abra el período de matrícula</p>
          </div>
        )}
      </div>

      {/* Cursos No Disponibles */}
      {cursosNoDisponiblesList.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 bg-amber-50/50">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-medium text-zinc-900">Cursos No Disponibles</h3>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {cursosNoDisponiblesList.map((curso) => (
              <div key={curso.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900">{curso.nombreCurso}</p>
                  <p className="text-xs text-zinc-500">{curso.nombreDocente} • {curso.creditos} créditos</p>
                </div>
                {curso.motivoNoDisponible && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">
                    {curso.motivoNoDisponible}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatriculaPage;

