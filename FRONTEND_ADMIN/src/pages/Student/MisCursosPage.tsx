import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { BookOpen, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';

const MisCursosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | undefined>(undefined);
  const [cursosSeleccionados, setCursosSeleccionados] = useState<number[]>([]);

  const { data: periodos } = useQuery({
    queryKey: ['periodos'],
    queryFn: estudiantesApi.getPeriodos,
  });

  const { data: periodoActivo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  // Usar período activo por defecto, o el seleccionado manualmente
  const periodoAConsultar = periodoSeleccionado || periodoActivo?.id;

  const { data: misCursos, isLoading } = useQuery({
    queryKey: ['mis-cursos', periodoAConsultar],
    queryFn: () => estudiantesApi.getMisCursos(periodoAConsultar),
    enabled: !!periodoAConsultar, // Solo ejecutar si hay un período válido
  });

  const retirarMutation = useMutation({
    mutationFn: estudiantesApi.retirar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-cursos'] });
      queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al retirarse del curso');
    },
  });

  const handleToggleCurso = (idMatricula: number) => {
    setCursosSeleccionados(prev => {
      if (prev.includes(idMatricula)) {
        return prev.filter(id => id !== idMatricula);
      } else {
        return [...prev, idMatricula];
      }
    });
  };

  const handleRetirarSeleccionados = async () => {
    if (cursosSeleccionados.length === 0) {
      toast.error('Selecciona al menos un curso para retirar');
      return;
    }

    let exitosos = 0;
    let fallidos = 0;

    for (const idMatricula of cursosSeleccionados) {
      try {
        await retirarMutation.mutateAsync(idMatricula);
        exitosos++;
        
        // Buscar el nombre del curso retirado
        const curso = misCursos?.find(c => c.id === idMatricula);
        if (curso) {
          // Crear notificación local
          addNotification({
            type: 'academico',
            action: 'retiro',
            nombre: curso.nombreCurso,
            metadata: {
              idCurso: curso.idCurso,
              nombreCurso: curso.nombreCurso,
              periodo: curso.nombrePeriodo
            }
          });
        }
      } catch (error) {
        fallidos++;
      }
    }

    if (exitosos > 0) {
      toast.success(`Te has retirado de ${exitosos} curso(s) exitosamente`);
      setCursosSeleccionados([]);
    }
    if (fallidos > 0) {
      toast.error(`${fallidos} curso(s) no pudieron ser retirados`);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Matriculado':
        return 'bg-green-500';
      case 'Retirado':
        return 'bg-red-500';
      case 'Aprobado':
        return 'bg-blue-500';
      case 'Desaprobado':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Filtrar solo cursos matriculados (estado = 'Matriculado')
  const cursosMatriculados = misCursos?.filter(c => c.estado === 'Matriculado') || [];
  const cursosRetirados = misCursos?.filter(c => c.estado === 'Retirado') || [];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Mis Cursos Matriculados</h2>
            {periodoActivo && !periodoSeleccionado ? (
              <p className="text-purple-100">
                Período Actual: {periodoActivo.nombre} ({new Date(periodoActivo.fechaInicio).toLocaleDateString('es-PE')} - {new Date(periodoActivo.fechaFin).toLocaleDateString('es-PE')})
              </p>
            ) : !periodoActivo && !periodoSeleccionado ? (
              <p className="text-purple-100">
                ⚠️ No hay período académico activo
              </p>
            ) : null}
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

      {/* Tabla de cursos matriculados */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-green-600" />
            Cursos Activos
          </h3>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold">ACT</span>
            <span className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold">RET</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Cargando cursos...</p>
            </div>
          ) : cursosMatriculados.length > 0 ? (
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
                      Estado
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promedio
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      F. Matrícula
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cursosMatriculados.map((curso) => (
                    <tr key={curso.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          checked={cursosSeleccionados.includes(curso.id)}
                          onChange={() => handleToggleCurso(curso.id)}
                          disabled={retirarMutation.isPending}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 bg-teal-500 text-white rounded text-xs font-semibold">
                          {curso.codigoCurso}
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
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 ${getEstadoColor(curso.estado)} text-white rounded text-xs font-semibold`}>
                          {curso.estado === 'Matriculado' ? 'ACT' : curso.estado.substring(0, 3).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {curso.promedioFinal !== null && curso.promedioFinal !== undefined ? (
                          <span className="text-lg font-bold text-purple-600">{curso.promedioFinal.toFixed(1)}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-900">
                        {new Date(curso.fechaMatricula).toLocaleDateString('es-PE', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-900">
                        {curso.nombrePeriodo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <span className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold">
                    {cursosMatriculados.length}
                  </span>
                  <span className="text-sm text-gray-600">
                    Total: {cursosMatriculados.length} curso(s) activo(s)
                  </span>
                  {cursosSeleccionados.length > 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                      {cursosSeleccionados.length} seleccionado(s) para retirar
                    </span>
                  )}
                </div>
                <button
                  className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleRetirarSeleccionados}
                  disabled={cursosSeleccionados.length === 0 || retirarMutation.isPending}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Retirarse de Cursos ({cursosSeleccionados.length})
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              {!periodoAConsultar ? (
                <>
                  <p className="text-gray-500 text-lg font-semibold">No hay período académico activo</p>
                  <p className="text-gray-400 text-sm mt-2">
                    El período actual ha sido cerrado. Los cursos se mostrarán cuando se active un nuevo período académico.
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Puedes consultar períodos anteriores usando el selector de arriba.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-lg">No hay cursos activos</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {periodoSeleccionado
                      ? 'No tienes cursos matriculados en el período seleccionado'
                      : 'Aún no te has matriculado en ningún curso para este período'}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabla de cursos retirados (opcional) */}
      {cursosRetirados.length > 0 && (
        <div className="bg-white rounded-lg shadow border-l-4 border-red-500">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Cursos Retirados
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créditos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Docente
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    F. Retiro
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cursosRetirados.map((curso) => (
                  <tr key={curso.id} className="bg-red-50 opacity-75">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-semibold">
                        {curso.codigoCurso}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-700">{curso.nombreCurso}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {curso.creditos}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {curso.nombreDocente}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-700">
                      {curso.fechaRetiro && new Date(curso.fechaRetiro).toLocaleDateString('es-PE', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-700">
                      {curso.nombrePeriodo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisCursosPage;
