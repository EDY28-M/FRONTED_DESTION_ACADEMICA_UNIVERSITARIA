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
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Matrícula de Cursos</h2>
            <p className="text-purple-100">
              Ciclo Actual: {perfil?.cicloActual} | Créditos Acumulados: {perfil?.creditosAcumulados}
            </p>
            {periodoActivo && (
              <p className="text-purple-100 mt-1">
                Período: {periodoActivo.nombre} ({new Date(periodoActivo.fechaInicio).toLocaleDateString('es-PE')} - {new Date(periodoActivo.fechaFin).toLocaleDateString('es-PE')})
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="periodo" className="text-sm text-purple-100">Período:</label>
            <select
              id="periodo"
              value={periodoSeleccionado || ''}
              onChange={(e) => setPeriodoSeleccionado(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-2 border border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-gray-900"
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
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
            Seleccionar Cursos Disponibles
          </h3>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold">SEM</span>
            <span className="px-3 py-1 bg-yellow-500 text-white rounded text-xs font-semibold">REP</span>
            <span className="px-3 py-1 bg-orange-500 text-white rounded text-xs font-semibold">AUT</span>
            <span className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold">AUT</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Cargando cursos...</p>
            </div>
          ) : cursosDisponiblesList.length > 0 || cursosMatriculadosList.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-4 py-3 text-center">
                      <input type="checkbox" className="rounded border-gray-300" disabled />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      C
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Docente
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vac
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Act.
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Día
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cursosDisponiblesList.map((curso) => (
                    <tr key={curso.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          checked={cursosSeleccionados.includes(curso.id)}
                          onChange={() => handleToggleCurso(curso.id)}
                          disabled={matricularMutation.isPending}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 bg-teal-500 text-white rounded text-xs font-semibold">
                          {curso.codigo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{curso.nombreCurso}</p>
                          <p className="text-xs text-blue-600 italic">Obligatorio</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {curso.creditos}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {curso.nombreDocente}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {curso.estudiantesMatriculados || 0}/{curso.capacidadMaxima || 30}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-semibold">
                          SEM
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-900">
                        <div>Lu</div>
                        <div>Mi</div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-900">
                        <div>11-01 pm</div>
                        <div>07-10 pm</div>
                      </td>
                    </tr>
                  ))}
                  {cursosMatriculadosList.map((curso) => (
                    <tr key={curso.id} className="bg-yellow-50">
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          checked
                          disabled
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 bg-yellow-500 text-white rounded text-xs font-semibold">
                          {curso.codigo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{curso.nombreCurso}</p>
                          <p className="text-xs text-blue-600 italic">Obligatorio</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {curso.creditos}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {curso.nombreDocente}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {curso.estudiantesMatriculados || 0}/{curso.capacidadMaxima || 30}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-yellow-500 text-white rounded text-xs font-semibold">
                          REP
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-900">
                        <div>Ma</div>
                        <div>Ju</div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-900">
                        <div>09-12 am</div>
                        <div>02-05 pm</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <span className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold">
                    {cursosDisponiblesList.length + cursosMatriculadosList.length}
                  </span>
                  <span className="text-sm text-gray-600">
                    Total: {cursosDisponiblesList.length} disponibles | {cursosMatriculadosList.length} matriculados
                  </span>
                  {cursosSeleccionados.length > 0 && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                      {cursosSeleccionados.length} seleccionado(s)
                    </span>
                  )}
                </div>
                <button
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleMatricularSeleccionados}
                  disabled={cursosSeleccionados.length === 0 || matricularMutation.isPending}
                >
                  📋 Registrar Aumento de Cursos ({cursosSeleccionados.length})
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
        <div className="bg-white rounded-lg shadow border-l-4 border-orange-500">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
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
