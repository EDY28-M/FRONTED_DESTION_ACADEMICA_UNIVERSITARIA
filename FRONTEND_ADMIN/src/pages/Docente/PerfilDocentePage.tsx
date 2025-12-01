import { useState, useRef, useEffect } from 'react';
import { useDocenteAuth } from '../../contexts/DocenteAuthContext';
import { docenteCursosApi, CursoDocente } from '../../services/docenteApi';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

// ============================================
// COMPONENTES PEQUEÑOS Y FUNCIONALES
// ============================================

// Stat Card - Minimalista
const StatCard = ({ label, value, suffix = '' }: { label: string; value: string | number; suffix?: string }) => (
  <div className="px-4 py-3">
    <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
    <p className="text-xl font-semibold text-zinc-900 tabular-nums">
      {value}{suffix}
    </p>
  </div>
);

// Info Item
const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-center gap-3 py-3 border-b border-zinc-100 last:border-b-0">
    <Icon className="h-4 w-4 text-zinc-400 stroke-[1.5]" />
    <div className="flex-1">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-medium text-zinc-900">{value}</p>
    </div>
  </div>
);

// Badge para estados
const StatusBadge = ({ 
  value, 
  type 
}: { 
  value: number; 
  type: 'grade' | 'attendance' 
}) => {
  let bgClass = 'bg-zinc-100 text-zinc-600';
  
  if (type === 'grade') {
    if (value >= 14) bgClass = 'bg-green-50 text-green-700';
    else if (value < 11) bgClass = 'bg-red-50 text-red-700';
  }
  
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium tabular-nums ${bgClass}`}>
      {value.toFixed(2)}
    </span>
  );
};

// Empty State
const EmptyState = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="py-16 text-center">
    <Icon className="h-8 w-8 text-zinc-300 mx-auto mb-3 stroke-[1.5]" />
    <p className="text-sm text-zinc-500 mb-1">{title}</p>
    <p className="text-xs text-zinc-400">{description}</p>
  </div>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const PerfilDocentePage = () => {
  const { docente } = useDocenteAuth();
  const [modalAbierto, setModalAbierto] = useState(false);

  // Obtener cursos para estadísticas
  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ['docente-cursos-perfil'],
    queryFn: docenteCursosApi.getMisCursos,
  });

  const totalEstudiantes = cursos.reduce((sum: number, c: CursoDocente) => sum + c.totalEstudiantes, 0);
  const promedioGeneral = cursos.length > 0 
    ? cursos.reduce((sum: number, c: CursoDocente) => sum + c.promedioGeneral, 0) / cursos.length 
    : 0;
  const asistenciaPromedio = cursos.length > 0
    ? cursos.reduce((sum: number, c: CursoDocente) => sum + c.porcentajeAsistenciaPromedio, 0) / cursos.length
    : 0;

  const getInitials = (nombre?: string) => {
    return nombre?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DC';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400 text-sm">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="h-14 px-6 max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-sm font-medium text-zinc-900">Configuración</h1>
            <p className="text-xs text-zinc-500">Perfil y preferencias</p>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="border border-zinc-200 rounded-lg bg-white p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {getInitials(docente?.nombreCompleto)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">{docente?.nombreCompleto}</h2>
                <p className="text-sm text-zinc-500">{docente?.correo}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700">
                    Docente
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                    Activo
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setModalAbierto(true)}
              className="px-3 py-1.5 border border-zinc-200 rounded-md text-sm font-medium text-zinc-700 
                         hover:bg-zinc-50 transition-colors w-full sm:w-auto"
            >
              Cambiar Contraseña
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Info Personal */}
          <div className="border border-zinc-200 rounded-lg bg-white">
            <div className="px-5 py-4 border-b border-zinc-200">
              <h3 className="text-sm font-medium text-zinc-900">Información Personal</h3>
            </div>
            <div className="px-5 py-2">
              <InfoItem icon={UserIcon} label="Nombre completo" value={docente?.nombreCompleto || '—'} />
              <InfoItem icon={EnvelopeIcon} label="Correo institucional" value={docente?.correo || '—'} />
              <InfoItem icon={BookOpenIcon} label="Período activo" value={cursos[0]?.periodoNombre || 'N/A'} />
            </div>
          </div>

          {/* Estadísticas */}
          <div className="border border-zinc-200 rounded-lg bg-white">
            <div className="px-5 py-4 border-b border-zinc-200">
              <h3 className="text-sm font-medium text-zinc-900">Resumen Académico</h3>
            </div>
            <div className="grid grid-cols-2 gap-px bg-zinc-200">
              <div className="bg-white">
                <StatCard label="Cursos asignados" value={cursos.length} />
              </div>
              <div className="bg-white">
                <StatCard label="Total estudiantes" value={totalEstudiantes} />
              </div>
              <div className="bg-white">
                <StatCard label="Promedio general" value={promedioGeneral.toFixed(2)} />
              </div>
              <div className="bg-white">
                <StatCard label="Asistencia promedio" value={asistenciaPromedio.toFixed(1)} suffix="%" />
              </div>
            </div>
          </div>
        </div>

        {/* Cursos */}
        <div className="border border-zinc-200 rounded-lg bg-white mt-6 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-900">Cursos Asignados</h3>
            <span className="text-xs text-zinc-500">{cursos.length} cursos</span>
          </div>

          {cursos.length === 0 ? (
            <EmptyState 
              icon={BookOpenIcon}
              title="Sin cursos asignados"
              description="Contacta al administrador para asignación"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                <tr className="text-left text-xs text-zinc-500 uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Curso</th>
                  <th className="px-5 py-3 font-medium text-center">Ciclo</th>
                  <th className="px-5 py-3 font-medium text-center">Créditos</th>
                  <th className="px-5 py-3 font-medium text-center">Estudiantes</th>
                  <th className="px-5 py-3 font-medium text-center">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {cursos.map((curso: CursoDocente) => (
                  <tr 
                    key={curso.id} 
                    className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-zinc-900">{curso.nombreCurso}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{curso.horasSemanal}h semanales</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm text-zinc-600 font-mono">{curso.ciclo}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm text-zinc-600 font-mono">{curso.creditos}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm text-zinc-900 font-medium tabular-nums">{curso.totalEstudiantes}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge value={curso.promedioGeneral} type="grade" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Cambiar Contraseña */}
      {modalAbierto && <ModalCambiarContrasena onClose={() => setModalAbierto(false)} />}
    </div>
  );
};

// ============================================
// MODAL CAMBIAR CONTRASEÑA
// ============================================

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

  // Validaciones en tiempo real
  const validaciones = {
    minLength: contrasenaNueva.length >= 6,
    hasUppercase: /[A-Z]/.test(contrasenaNueva),
    hasNumber: /[0-9]/.test(contrasenaNueva),
    passwordsMatch: contrasenaNueva === confirmarContrasena && confirmarContrasena.length > 0,
  };

  const todasValidacionesPasan = validaciones.minLength && validaciones.passwordsMatch;
  const puedeEnviar = contrasenaActual.length > 0 && todasValidacionesPasan;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!puedeEnviar) return;

    setIsSubmitting(true);
    try {
      // TODO: Implementar endpoint de cambio de contraseña en backend
      toast.success('Funcionalidad próximamente disponible');
      setTimeout(() => onClose(), 1000);
    } catch {
      toast.error('Error al cambiar contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef} 
        className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header con gradiente sutil */}
        <div className="relative px-6 py-5 bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Cambiar Contraseña</h2>
              <p className="text-xs text-zinc-500">Actualiza tu contraseña de acceso</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Contraseña Actual */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Contraseña Actual</label>
            <div className="relative">
              <input
                type={mostrarActual ? 'text' : 'password'}
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
                className="w-full h-11 px-4 pr-11 text-sm border border-zinc-200 rounded-xl bg-zinc-50 
                           focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 
                           transition-all placeholder:text-zinc-400"
                placeholder="Ingresa tu contraseña actual"
              />
              <button 
                type="button" 
                onClick={() => setMostrarActual(!mostrarActual)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded transition-colors"
              >
                {mostrarActual ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Separador visual */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-zinc-400">Nueva contraseña</span>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Nueva Contraseña</label>
            <div className="relative">
              <input
                type={mostrarNueva ? 'text' : 'password'}
                value={contrasenaNueva}
                onChange={(e) => setContrasenaNueva(e.target.value)}
                className="w-full h-11 px-4 pr-11 text-sm border border-zinc-200 rounded-xl bg-zinc-50 
                           focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 
                           transition-all placeholder:text-zinc-400"
                placeholder="Ingresa tu nueva contraseña"
              />
              <button 
                type="button" 
                onClick={() => setMostrarNueva(!mostrarNueva)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded transition-colors"
              >
                {mostrarNueva ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Confirmar Contraseña</label>
            <div className="relative">
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                className={`w-full h-11 px-4 pr-11 text-sm border rounded-xl bg-zinc-50 
                           focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 
                           transition-all placeholder:text-zinc-400 ${
                             confirmarContrasena.length > 0
                               ? validaciones.passwordsMatch
                                 ? 'border-emerald-300 focus:border-emerald-400'
                                 : 'border-red-300 focus:border-red-400'
                               : 'border-zinc-200 focus:border-zinc-400'
                           }`}
                placeholder="Confirma tu nueva contraseña"
              />
              <button 
                type="button" 
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded transition-colors"
              >
                {mostrarConfirmar ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Validaciones visuales */}
          {contrasenaNueva && (
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                validaciones.minLength 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-zinc-50 text-zinc-500 border-zinc-200'
              }`}>
                {validaciones.minLength ? '✓' : '○'} 6+ caracteres
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                validaciones.hasUppercase 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-zinc-50 text-zinc-500 border-zinc-200'
              }`}>
                {validaciones.hasUppercase ? '✓' : '○'} Mayúscula
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                validaciones.hasNumber 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-zinc-50 text-zinc-500 border-zinc-200'
              }`}>
                {validaciones.hasNumber ? '✓' : '○'} Número
              </span>
              {confirmarContrasena && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  validaciones.passwordsMatch 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {validaciones.passwordsMatch ? '✓' : '✗'} Coinciden
                </span>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-3">
            <button
              type="button" 
              onClick={onClose} 
              className="flex-1 h-11 px-4 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 
                         hover:bg-zinc-50 hover:border-zinc-300 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !puedeEnviar}
              className="flex-1 h-11 px-4 bg-zinc-900 text-white rounded-xl text-sm font-medium
                         hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all
                         flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Cambiar Contraseña'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerfilDocentePage;
