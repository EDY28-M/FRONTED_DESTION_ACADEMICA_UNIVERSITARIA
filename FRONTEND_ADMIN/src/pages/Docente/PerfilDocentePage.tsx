import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocenteAuth } from '../../contexts/DocenteAuthContext';
import { docenteCursosApi } from '../../services/docenteApi';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  KeyIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  UsersIcon,
  ChartBarIcon,
  BookOpenIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export const PerfilDocentePage = () => {
  const navigate = useNavigate();
  const { docente } = useDocenteAuth();
  const [modalAbierto, setModalAbierto] = useState(false);

  // Obtener cursos para estadísticas
  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ['docente-cursos-perfil'],
    queryFn: docenteCursosApi.getMisCursos,
  });

  const totalEstudiantes = cursos.reduce((sum, c) => sum + c.totalEstudiantes, 0);
  const promedioGeneral = cursos.length > 0 
    ? cursos.reduce((sum, c) => sum + c.promedioGeneral, 0) / cursos.length 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/docente/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="font-medium">Volver al Dashboard</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header del perfil */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-primary-700 rounded-lg flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{docente?.nombreCompleto}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-md text-sm font-medium">
                  Docente
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-md text-sm font-medium">
                  Activo
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{docente?.correo}</p>
            </div>

            {/* Botón */}
            <button
              onClick={() => setModalAbierto(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              Cambiar Contraseña
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
              <BookOpenIcon className="w-5 h-5 text-primary-700" />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cursos Asignados</p>
            <p className="text-3xl font-bold text-gray-900">{cursos.length}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
              <UsersIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Estudiantes</p>
            <p className="text-3xl font-bold text-gray-900">{totalEstudiantes}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <ChartBarIcon className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Promedio General</p>
            <p className="text-3xl font-bold text-gray-900">{promedioGeneral.toFixed(2)}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
              <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Período Activo</p>
            <p className="text-lg font-bold text-gray-900">{cursos[0]?.periodoNombre || 'N/A'}</p>
          </div>
        </div>

        {/* Información Personal */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Información Personal</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre Completo</p>
                  <p className="text-sm font-medium text-gray-900">{docente?.nombreCompleto || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <EnvelopeIcon className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correo Institucional</p>
                  <p className="text-sm font-medium text-gray-900">{docente?.correo || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rol</p>
                  <p className="text-sm font-medium text-gray-900">Docente</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</p>
                  <p className="text-sm font-medium text-emerald-600">Activo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cursos Asignados */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Cursos Asignados</h3>
            {cursos.length > 0 && (
              <span className="bg-primary-100 text-primary-800 text-xs font-medium px-3 py-1 rounded-md">
                {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'}
              </span>
            )}
          </div>

          {cursos.length > 0 ? (
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {cursos.map((curso) => (
                    <tr key={curso.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <BookOpenIcon className="h-4 w-4 text-primary-700" />
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
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Resumen */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Total de Estudiantes</p>
                <span className="text-lg font-bold text-primary-700">{totalEstudiantes}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpenIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No tienes cursos asignados actualmente</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Cambiar Contraseña */}
      {modalAbierto && <ModalCambiarContrasena onClose={() => setModalAbierto(false)} />}
    </div>
  );
};

// Modal Cambiar Contraseña
const ModalCambiarContrasena = ({ onClose }: { onClose: () => void }) => {
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contrasenaActual || !contrasenaNueva || !confirmarContrasena) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    if (contrasenaNueva.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (contrasenaNueva !== confirmarContrasena) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implementar endpoint de cambio de contraseña en backend
      toast.success('Funcionalidad próximamente disponible');
      setTimeout(() => onClose(), 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.mensaje || 'Error al cambiar contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <KeyIcon className="w-5 h-5 text-primary-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Contraseña Actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
            <div className="relative">
              <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={mostrarActual ? 'text' : 'password'}
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="Ingresa tu contraseña actual"
              />
              <button type="button" onClick={() => setMostrarActual(!mostrarActual)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {mostrarActual ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
            <div className="relative">
              <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={mostrarNueva ? 'text' : 'password'}
                value={contrasenaNueva}
                onChange={(e) => setContrasenaNueva(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="Ingresa tu nueva contraseña"
              />
              <button type="button" onClick={() => setMostrarNueva(!mostrarNueva)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {mostrarNueva ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
            <div className="relative">
              <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="Confirma tu nueva contraseña"
              />
              <button type="button" onClick={() => setMostrarConfirmar(!mostrarConfirmar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {mostrarConfirmar ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {contrasenaNueva && (
            <p className={`text-sm flex items-center gap-1 ${contrasenaNueva.length >= 6 ? 'text-emerald-600' : 'text-red-500'}`}>
              {contrasenaNueva.length >= 6 ? '✓' : '✗'} Mínimo 6 caracteres
            </p>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerfilDocentePage;

