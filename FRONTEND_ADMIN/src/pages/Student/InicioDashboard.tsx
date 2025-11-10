import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { BookOpen, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const InicioDashboard: React.FC = () => {
  const { data: perfil } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

  const { data: periodo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const { data: misCursos } = useQuery({
    queryKey: ['mis-cursos-dashboard', periodo?.id],
    queryFn: () => estudiantesApi.getMisCursos(periodo?.id),
    enabled: !!periodo,
  });

  // Obtener estadísticas (incluye promedioGeneral correcto que excluye retirados)
  const { data: estadisticas } = useQuery({
    queryKey: ['estadisticas', periodo?.id],
    queryFn: () => estudiantesApi.getNotas(periodo?.id),
    enabled: !!periodo,
  });

  const cursosActivos = misCursos?.filter(c => c.estado === 'Matriculado') || [];
  // Usar el promedio del servidor (excluye retirados y calcula correctamente)
  const promedioGeneral = estadisticas?.promedioGeneral || perfil?.promedioAcumulado || 0;

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">Bienvenido, {perfil?.nombreCompleto}</h2>
        <p className="text-purple-100">Código: {perfil?.codigo} | Ciclo {perfil?.cicloActual}</p>
        <p className="text-purple-100 mt-1">{perfil?.carrera}</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ciclo Actual</p>
              <p className="text-3xl font-bold text-purple-600">{perfil?.cicloActual}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cursos Matriculados</p>
              <p className="text-3xl font-bold text-blue-600">{cursosActivos.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Créditos Acumulados</p>
              <p className="text-3xl font-bold text-green-600">{perfil?.creditosAcumulados}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Promedio</p>
              <p className="text-3xl font-bold text-orange-600">{promedioGeneral.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Período Activo */}
      {periodo && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Período Académico Actual</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Período</p>
              <p className="text-lg font-semibold text-gray-900">{periodo.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Inicio</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(periodo.fechaInicio).toLocaleDateString('es-PE')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fin</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(periodo.fechaFin).toLocaleDateString('es-PE')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cursos Actuales */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mis Cursos Actuales</h3>
            {periodo && (
              <p className="text-sm text-gray-500">Semestre {periodo.nombre}</p>
            )}
          </div>
          {cursosActivos.length > 0 && (
            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
              {cursosActivos.length} {cursosActivos.length === 1 ? 'Curso' : 'Cursos'}
            </span>
          )}
        </div>
        <div className="p-6">
          {cursosActivos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      C
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      T
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Matrícula
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Docente
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cursosActivos.map((curso) => (
                    <tr key={curso.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {curso.codigoCurso}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {curso.nombreCurso}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                        {curso.creditos}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                        {Math.floor(curso.horasSemanal * 0.6) || 3}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                        {Math.floor(curso.horasSemanal * 0.4) || 2}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                          OBLIGATORIO
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                        {new Date(curso.fechaMatricula).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {curso.nombreDocente}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cursosActivos.length > 0 && (
                <div className="mt-4 px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700">
                    Total Créditos Matriculados:{' '}
                    <span className="text-purple-600">
                      {cursosActivos.reduce((sum, c) => sum + c.creditos, 0)}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No tienes cursos matriculados en este período</p>
              <Link
                to="/estudiante/matricula"
                className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Matricular Cursos
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InicioDashboard;
