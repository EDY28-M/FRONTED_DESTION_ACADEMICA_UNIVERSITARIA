import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { asistenciasApi } from '../../services/asistenciasApi';
import { estudiantesApi } from '../../services/estudiantesApi';
import { Calendar, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Simple */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis Asistencias</h1>
        <p className="text-gray-600">
          Período: {periodoActivo?.nombre || 'Sin período activo'}
        </p>
      </div>

      {/* Alerta si hay cursos con baja asistencia */}
      {asistenciasPorCurso?.some(c => c.alertaBajaAsistencia) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-yellow-700 font-medium">
              Tienes cursos con menos del 70% de asistencia
            </p>
          </div>
        </div>
      )}

      {/* Tabla de Cursos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {asistenciasPorCurso && asistenciasPorCurso.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Docente
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clases
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asistencias
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faltas
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porcentaje
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {asistenciasPorCurso.map((curso) => (
                  <tr 
                    key={curso.idCurso} 
                    onClick={() => setCursoSeleccionado(curso.idCurso)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {curso.nombreCurso}
                      </div>
                      <div className="text-sm text-gray-500">
                        {curso.codigoCurso} • {curso.creditos} créditos
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {curso.nombreDocente || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-gray-700">
                        {curso.totalClases}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        {curso.totalAsistencias}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600">
                        <XCircle className="h-4 w-4" />
                        {curso.totalFaltas}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-lg font-bold ${
                        curso.alertaBajaAsistencia ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {curso.porcentajeAsistencia.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {curso.alertaBajaAsistencia ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          Alerta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCursoSeleccionado(curso.idCurso);
                        }}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay asistencias registradas
            </h3>
            <p className="text-gray-600">
              Tus docentes aún no han registrado asistencias
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalle - Diseño Simple */}
      {cursoDetallado && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setCursoSeleccionado(null)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {cursoDetallado.nombreCurso}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Detalle de asistencias
              </p>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Resumen */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {cursoDetallado.totalClases}
                  </div>
                  <div className="text-sm text-gray-600">Total Clases</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {cursoDetallado.totalAsistencias}
                  </div>
                  <div className="text-sm text-green-700">Asistencias</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {cursoDetallado.totalFaltas}
                  </div>
                  <div className="text-sm text-red-700">Faltas</div>
                </div>
              </div>

              {/* Tabla simple de asistencias */}
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Observaciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cursoDetallado.asistencias.map((asistencia) => (
                      <tr key={asistencia.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(asistencia.fecha).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            asistencia.tipoClase === 'Práctica' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {asistencia.tipoClase}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {asistencia.presente ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              <CheckCircle2 className="h-3 w-3" />
                              Presente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              <XCircle className="h-3 w-3" />
                              Ausente
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {asistencia.observaciones || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <button
                onClick={() => setCursoSeleccionado(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
