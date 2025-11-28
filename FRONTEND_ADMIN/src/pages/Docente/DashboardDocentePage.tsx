import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  UserIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

export const DashboardDocentePage = () => {
  const navigate = useNavigate();
  const { docente, logout } = useDocenteAuth();
  const [cursos, setCursos] = useState<CursoDocente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cargarCursos();
  }, []);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const getInitials = (nombre?: string) => {
    return nombre?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DC';
  };

  const totalEstudiantes = cursos.reduce((sum, c) => sum + c.totalEstudiantes, 0);
  const promedioGeneral = cursos.length > 0 
    ? cursos.reduce((sum, c) => sum + c.promedioGeneral, 0) / cursos.length 
    : 0;
  const asistenciaPromedio = cursos.length > 0
    ? cursos.reduce((sum, c) => sum + c.porcentajeAsistenciaPromedio, 0) / cursos.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Portal Docente</h1>
                <p className="text-xs text-gray-500">Sistema de Gestión Académica</p>
              </div>
            </div>

            {/* Menú de usuario */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{docente?.nombreCompleto}</p>
                  <p className="text-xs text-gray-500">Docente</p>
                </div>
                <div className="w-9 h-9 bg-primary-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getInitials(docente?.nombreCompleto)}
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{docente?.nombreCompleto}</p>
                    <p className="text-xs text-gray-500 truncate">{docente?.correo}</p>
                  </div>
                  <Link
                    to="/docente/perfil"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <UserIcon className="h-4 w-4" />
                    Mi Perfil
                  </Link>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header con info del docente */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary-700 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{docente?.nombreCompleto}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-600">{docente?.correo}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Docente</p>
                </div>
              </div>
              {cursos[0]?.periodoNombre && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Periodo Activo</p>
                  <p className="text-sm font-semibold text-gray-900">{cursos[0].periodoNombre}</p>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <BookOpenIcon className="h-5 w-5 text-primary-700" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cursos Asignados</p>
              <p className="text-3xl font-bold text-gray-900">{cursos.length}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Estudiantes</p>
              <p className="text-3xl font-bold text-gray-900">{totalEstudiantes}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Promedio General</p>
              <p className="text-3xl font-bold text-gray-900">{promedioGeneral.toFixed(2)}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Asistencia Promedio</p>
              <p className="text-3xl font-bold text-gray-900">{asistenciaPromedio.toFixed(1)}%</p>
            </div>
          </div>

          {/* Lista de Cursos */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Mis Cursos</h3>
                <p className="text-xs text-gray-500 mt-1">Gestiona tus cursos, estudiantes y calificaciones</p>
              </div>
              {cursos.length > 0 && (
                <span className="bg-primary-100 text-primary-800 text-xs font-medium px-3 py-1 rounded-md">
                  {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'}
                </span>
              )}
            </div>

            {cursos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpenIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No tienes cursos asignados</h3>
                <p className="text-sm text-gray-500">Contacta al administrador para asignarte cursos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Curso
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Ciclo
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Créditos
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Estudiantes
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Promedio
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Asistencia
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {cursos.map((curso) => (
                      <tr key={curso.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <AcademicCapIcon className="h-5 w-5 text-primary-700" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{curso.nombreCurso}</p>
                              <p className="text-xs text-gray-500">{curso.horasSemanal}h semanales</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {curso.ciclo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                          {curso.creditos}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {curso.totalEstudiantes}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            curso.promedioGeneral >= 14 ? 'bg-emerald-100 text-emerald-800' :
                            curso.promedioGeneral >= 11 ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {curso.promedioGeneral.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            curso.porcentajeAsistenciaPromedio >= 80 ? 'bg-emerald-100 text-emerald-800' :
                            curso.porcentajeAsistenciaPromedio >= 60 ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {curso.porcentajeAsistenciaPromedio.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleVerCurso(curso.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-700 text-white text-xs font-medium rounded-md hover:bg-primary-800 transition-colors"
                          >
                            Gestionar
                            <ArrowRightIcon className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Resumen */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    Total de Estudiantes a cargo
                  </p>
                  <span className="text-lg font-bold text-primary-700">
                    {totalEstudiantes} estudiantes
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

