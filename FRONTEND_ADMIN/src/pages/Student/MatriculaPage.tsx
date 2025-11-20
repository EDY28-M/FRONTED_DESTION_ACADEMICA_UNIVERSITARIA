import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { BookOpen, AlertCircle } from 'lucide-react';
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
      {/* Información del estudiante */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Matrícula de Cursos</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <span className="font-medium text-gray-700">Ciclo:</span>
                <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-semibold">{perfil?.cicloActual}</span>
              </span>
              <span className="text-gray-400">|</span>
              <span className="flex items-center">
                <span className="font-medium text-gray-700">Créditos:</span>
                <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-semibold">{perfil?.creditosAcumulados}</span>
              </span>
            </div>
            {periodoActivo && (
              <p className="text-gray-600 text-sm mt-2">
                Período: {periodoActivo.nombre} ({new Date(periodoActivo.fechaInicio).toLocaleDateString('es-PE')} - {new Date(periodoActivo.fechaFin).toLocaleDateString('es-PE')})
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="periodo" className="text-sm text-gray-700 font-medium">Período:</label>
            <select
              id="periodo"
              value={periodoSeleccionado || ''}
              onChange={(e) => setPeriodoSeleccionado(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
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

      {/* Cursos Disponibles */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
            Cursos Disponibles para Matrícula
          </h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Matriculado</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Cargando cursos...</p>
            </div>
          ) : cursosDisponiblesList.length > 0 || cursosMatriculadosList.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-6 py-4 text-center">
                      <input type="checkbox" className="rounded border-gray-300" disabled />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Créditos
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Docente
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Vacantes
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Día
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Horario
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cursosDisponiblesList.map((curso) => (
                    <tr key={curso.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={cursosSeleccionados.includes(curso.id)}
                          onChange={() => handleToggleCurso(curso.id)}
                          disabled={matricularMutation.isPending}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded font-mono text-xs font-semibold">
                          {curso.codigo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{curso.nombreCurso}</p>
                          <p className="text-xs text-gray-500">Obligatorio</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">
                        {curso.creditos}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {curso.nombreDocente}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <span className="font-medium text-gray-900">{curso.estudiantesMatriculados || 0}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600">{curso.capacidadMaxima || 30}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          Disponible
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-gray-600">
                        <div>Lu</div>
                        <div>Mi</div>
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-gray-600">
                        <div>11-01 pm</div>
                        <div>07-10 pm</div>
                      </td>
                    </tr>
                  ))}
                  {cursosMatriculadosList.map((curso) => (
                    <tr key={curso.id} className="bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          checked
                          disabled
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded font-mono text-xs font-semibold">
                          {curso.codigo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{curso.nombreCurso}</p>
                          <p className="text-xs text-gray-500">Obligatorio</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">
                        {curso.creditos}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {curso.nombreDocente}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <span className="font-medium text-gray-900">{curso.estudiantesMatriculados || 0}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600">{curso.capacidadMaxima || 30}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          Matriculado
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-gray-600">
                        <div>Ma</div>
                        <div>Ju</div>
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-gray-600">
                        <div>09-12 am</div>
                        <div>02-05 pm</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Disponibles:</span>
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-semibold">
                      {cursosDisponiblesList.length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Matriculados:</span>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md text-sm font-semibold">
                      {cursosMatriculadosList.length}
                    </span>
                  </div>
                  {cursosSeleccionados.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Seleccionados:</span>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-sm font-semibold">
                        {cursosSeleccionados.length}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  onClick={handleMatricularSeleccionados}
                  disabled={cursosSeleccionados.length === 0 || matricularMutation.isPending}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Matricular ({cursosSeleccionados.length})
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay cursos disponibles para matricular en este período</p>
              <p className="text-gray-400 text-sm mt-2">Selecciona otro período o espera a que se abra el período de matrícula</p>
            </div>
          )}
        </div>
      </div>

      {/* Cursos No Disponibles - Opcional, comentado por ahora */}
      {cursosNoDisponiblesList.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
              Cursos No Disponibles
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {cursosNoDisponiblesList.map((curso) => (
                <div key={curso.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{curso.nombreCurso}</p>
                    <p className="text-sm text-gray-600">{curso.nombreDocente} • {curso.creditos} créditos</p>
                  </div>
                  {curso.motivoNoDisponible && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      {curso.motivoNoDisponible}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatriculaPage;
