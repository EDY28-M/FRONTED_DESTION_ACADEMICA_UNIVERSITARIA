import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocenteAuth } from '../../contexts/DocenteAuthContext';
import { docenteCursosApi, CursoDocente } from '../../services/docenteApi';
import { toast } from 'react-hot-toast';
import {
  AcademicCapIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

export const DashboardDocentePage = () => {
  const navigate = useNavigate();
  const { docente, logout } = useDocenteAuth();
  const [cursos, setCursos] = useState<CursoDocente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      setIsLoading(true);
      const data = await docenteCursosApi.getMisCursos();
      setCursos(data);
    } catch (error: any) {
      console.error('Error al cargar cursos:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada exitosamente');
    navigate('/docente/login');
  };

  const handleVerCurso = (cursoId: number) => {
    navigate(`/docente/curso/${cursoId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">Portal Docente</h1>
                <p className="text-sm text-gray-600">Bienvenido, {docente?.nombreCompleto}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cursos Asignados</p>
                <p className="text-2xl font-bold text-gray-900">{cursos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cursos.reduce((sum, c) => sum + c.totalEstudiantes, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Promedio General</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cursos.length > 0
                    ? (cursos.reduce((sum, c) => sum + c.promedioGeneral, 0) / cursos.length).toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Mis Cursos</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona tus cursos, estudiantes y calificaciones
            </p>
          </div>

          {cursos.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes cursos asignados</h3>
              <p className="mt-1 text-sm text-gray-500">
                Contacta al administrador para asignarte cursos
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cursos.map((curso) => (
                <div
                  key={curso.id}
                  className="px-6 py-5 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => handleVerCurso(curso.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <AcademicCapIcon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {curso.nombreCurso}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <CalendarDaysIcon className="h-4 w-4" />
                              Ciclo {curso.ciclo}
                            </span>
                            <span>•</span>
                            <span>{curso.creditos} créditos</span>
                            <span>•</span>
                            <span>{curso.horasSemanal}h semanales</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-blue-600 uppercase">Estudiantes</p>
                          <p className="text-xl font-bold text-blue-900">{curso.totalEstudiantes}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-green-600 uppercase">Promedio</p>
                          <p className="text-xl font-bold text-green-900">
                            {curso.promedioGeneral.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-purple-600 uppercase">Asistencia</p>
                          <p className="text-xl font-bold text-purple-900">
                            {curso.porcentajeAsistenciaPromedio.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex-shrink-0">
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerCurso(curso.id);
                        }}
                      >
                        <span className="font-medium">Gestionar</span>
                        <ArrowRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
