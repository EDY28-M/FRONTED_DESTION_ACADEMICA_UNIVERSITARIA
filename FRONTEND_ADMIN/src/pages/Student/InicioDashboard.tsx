import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { BookOpen, Calendar, Award, BarChart3, User } from 'lucide-react';
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
      {/* Header Profesional */}
      <div className="bg-white border-b border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{perfil?.nombreCompleto}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-600">Código: <span className="font-semibold text-gray-900">{perfil?.codigo}</span></span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-600">Ciclo <span className="font-semibold text-gray-900">{perfil?.cicloActual}</span></span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{perfil?.carrera}</p>
            </div>
          </div>
          {periodo && (
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Periodo Activo</p>
              <p className="text-sm font-semibold text-gray-900">{periodo.nombre}</p>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas - Diseño Profesional */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Ciclo Académico</p>
          <p className="text-3xl font-bold text-gray-900">{perfil?.cicloActual}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cursos Actuales</p>
          <p className="text-3xl font-bold text-gray-900">{cursosActivos.length}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Créditos Aprobados</p>
          <p className="text-3xl font-bold text-gray-900">{perfil?.creditosAcumulados}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Promedio General</p>
          <p className="text-3xl font-bold text-gray-900">{promedioGeneral.toFixed(2)}</p>
        </div>
      </div>

      {/* Período Activo */}
      {periodo && (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-700" />
            <h3 className="text-base font-semibold text-gray-900">Información del Periodo</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Periodo</p>
              <p className="text-sm font-semibold text-gray-900">{periodo.nombre}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Fecha Inicio</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(periodo.fechaInicio).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Fecha Fin</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(periodo.fechaFin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cursos Actuales */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Cursos Matriculados</h3>
            {periodo && (
              <p className="text-xs text-gray-500 mt-1">{periodo.nombre}</p>
            )}
          </div>
          {cursosActivos.length > 0 && (
            <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1 rounded-md">
              {cursosActivos.length} {cursosActivos.length === 1 ? 'curso' : 'cursos'}
            </span>
          )}
        </div>
        <div className="p-6">
          {cursosActivos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Créditos
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      T
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      P
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      F. Matrícula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Docente
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {cursosActivos.map((curso) => (
                    <tr key={curso.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {curso.codigoCurso}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {curso.nombreCurso}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                        {curso.creditos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                        {Math.floor(curso.horasSemanal * 0.6) || 3}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                        {Math.floor(curso.horasSemanal * 0.4) || 2}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          Obligatorio
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-center text-gray-500">
                        {new Date(curso.fechaMatricula).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {curso.nombreDocente}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cursosActivos.length > 0 && (
                <div className="mt-4 px-6 py-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    Total de Créditos Matriculados
                  </p>
                  <span className="text-lg font-bold text-indigo-600">
                    {cursosActivos.reduce((sum, c) => sum + c.creditos, 0)} créditos
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-4">No tienes cursos matriculados en este período</p>
              <Link
                to="/estudiante/matricula"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <BookOpen className="h-4 w-4" />
                Ir a Matrícula
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InicioDashboard;
