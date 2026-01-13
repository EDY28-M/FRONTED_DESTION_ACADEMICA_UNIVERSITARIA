import { useState, useEffect, useRef } from 'react';
import { docenteCursosApi, docenteAsistenciaApi, CursoDocente, ResumenAsistencia, EstudianteCurso, Asistencia } from '../../services/docenteApi';
import { toast } from 'react-hot-toast';
import {
  CalendarIcon,
  XMarkIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// Badge para estados
const StatusBadge = ({
  value,
  type
}: {
  value: number;
  type: 'attendance'
}) => {
  let bgClass = 'bg-zinc-100 text-zinc-600';

  if (type === 'attendance') {
    if (value >= 80) bgClass = 'bg-green-50 text-green-700';
    else if (value < 60) bgClass = 'bg-red-50 text-red-700';
  }

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium tabular-nums ${bgClass}`}>
      {value.toFixed(1)}%
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

// ========== MODAL PARA REGISTRAR ASISTENCIA ==========
interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cursoId: number;
  cursoNombre: string;
  onSuccess: () => void;
}

const AttendanceModal = ({ isOpen, onClose, cursoId, cursoNombre, onSuccess }: AttendanceModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteCurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [tipoClase, setTipoClase] = useState<'Teoría' | 'Práctica' | 'Laboratorio'>('Teoría');
  const [asistencias, setAsistencias] = useState<Record<number, boolean | null>>({});

  useEffect(() => {
    if (isOpen) {
      cargarEstudiantes();
    }
  }, [isOpen, cursoId]);

  const cargarEstudiantes = async () => {
    try {
      setIsLoading(true);
      const response = await docenteCursosApi.getEstudiantesCurso(cursoId);
      const estudiantesArray = Array.isArray(response) ? response : response.estudiantes;
      setEstudiantes(estudiantesArray);

      // Inicializar todos como null (sin marcar)
      const initial: Record<number, boolean | null> = {};
      estudiantesArray.forEach(est => {
        initial[est.id] = null;
      });
      setAsistencias(initial);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      toast.error('Error al cargar estudiantes');
    } finally {
      setIsLoading(false);
    }
  };

  const marcarAsistencia = (estudianteId: number, presente: boolean) => {
    setAsistencias(prev => ({
      ...prev,
      [estudianteId]: presente
    }));
  };

  const marcarTodos = (presente: boolean) => {
    const nuevas: Record<number, boolean | null> = {};
    estudiantes.forEach(est => {
      nuevas[est.id] = presente;
    });
    setAsistencias(nuevas);
  };

  const getIniciales = (nombreCompleto: string): string => {
    const palabras = nombreCompleto.trim().split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombreCompleto.substring(0, 2).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar que todos los estudiantes estén marcados
    const sinMarcar = estudiantes.filter(est => asistencias[est.id] === null);
    if (sinMarcar.length > 0) {
      toast.error(`Hay ${sinMarcar.length} estudiante(s) sin marcar`);
      return;
    }

    try {
      setIsSaving(true);

      const asistenciasArray = estudiantes.map(est => ({
        idEstudiante: est.idEstudiante,
        presente: asistencias[est.id] === true,
        observaciones: ''
      }));

      await docenteAsistenciaApi.registrarAsistencias({
        idCurso: cursoId,
        fecha,
        tipoClase,
        estudiantes: asistenciasArray
      });

      toast.success('Asistencia registrada correctamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al registrar asistencia:', error);
      toast.error(error.response?.data?.message || 'Error al registrar la asistencia');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const presentesCount = Object.values(asistencias).filter(v => v === true).length;
  const ausentesCount = Object.values(asistencias).filter(v => v === false).length;
  const sinMarcarCount = Object.values(asistencias).filter(v => v === null).length;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl border border-zinc-200 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Tomar Asistencia</h2>
            <p className="text-sm text-zinc-500 mt-0.5">{cursoNombre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-zinc-500 stroke-[1.5]" />
          </button>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 border-b border-zinc-200 space-y-4">
            {/* Fecha y Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
                  <CalendarIcon className="h-4 w-4 text-zinc-400" />
                  <span>Fecha</span>
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-md
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 mb-2">Tipo:</label>
                <select
                  value={tipoClase}
                  onChange={(e) => setTipoClase(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-md
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Teoría">Teoría</option>
                  <option value="Práctica">Práctica</option>
                  <option value="Laboratorio">Laboratorio</option>
                </select>
              </div>
            </div>

            {/* Contadores */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600 font-medium">{presentesCount} presentes</span>
              <span className="text-red-600 font-medium">{ausentesCount} ausentes</span>
              <span className="text-zinc-500 font-medium">{sinMarcarCount} sin marcar</span>
            </div>

            {/* Botones de acción rápida */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => marcarTodos(true)}
                className="px-4 py-2 text-sm text-green-700 bg-green-50 border border-green-200 
                           rounded-md hover:bg-green-100 transition-colors font-medium"
              >
                Todos presentes
              </button>
              <button
                type="button"
                onClick={() => marcarTodos(false)}
                className="px-4 py-2 text-sm text-red-700 bg-red-50 border border-red-200 
                           rounded-md hover:bg-red-100 transition-colors font-medium"
              >
                Todos ausentes
              </button>
            </div>
          </div>

          {/* Lista de estudiantes */}
          <div className="px-6 py-4">
            {/* {isLoading ? (
              <div className="py-8 text-center text-sm text-zinc-400">Cargando estudiantes...</div>
            ) :  */}
            (
              <div className="space-y-2">
                {estudiantes.map((estudiante, index) => {
                  const estado = asistencias[estudiante.id];
                  const iniciales = getIniciales(estudiante.nombreCompleto);

                  return (
                    <div
                      key={estudiante.id}
                      className="flex items-center gap-3 px-4 py-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                      {/* Número */}
                      <span className="text-sm text-zinc-500 font-medium w-6">{index + 1}</span>

                      {/* Iniciales */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-700 
                                      flex items-center justify-center font-semibold text-sm">
                        {iniciales}
                      </div>

                      {/* Nombre */}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900">{estudiante.nombreCompleto}</p>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => marcarAsistencia(estudiante.id, true)}
                          className={`p-2 rounded-md transition-all ${estado === true
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-zinc-100 text-zinc-400 hover:bg-green-50 hover:text-green-600'
                            }`}
                          title="Marcar presente"
                        >
                          <CheckIcon className="h-5 w-5 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => marcarAsistencia(estudiante.id, false)}
                          className={`p-2 rounded-md transition-all ${estado === false
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-zinc-100 text-zinc-400 hover:bg-red-50 hover:text-red-600'
                            }`}
                          title="Marcar ausente"
                        >
                          <XMarkIcon className="h-5 w-5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          </div>

          {/* Footer con botones */}
          <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {estudiantes.length} estudiantes en total
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-zinc-700 border border-zinc-300 rounded-md 
                           hover:bg-zinc-50 transition-colors"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving || isLoading}
                className="px-4 py-2 text-sm bg-zinc-800 text-white rounded-md hover:bg-zinc-900 
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSaving ? 'Guardando...' : 'Guardar Asistencia'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AsistenciasDocentePage = () => {
  const [cursos, setCursos] = useState<CursoDocente[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<number | null>(null);
  const [resumenAsistencias, setResumenAsistencias] = useState<ResumenAsistencia[]>([]);
  const [historialAsistencias, setHistorialAsistencias] = useState<Asistencia[]>([]);
  const [isLoadingCursos, setIsLoadingCursos] = useState(true);
  const [isLoadingAsistencias, setIsLoadingAsistencias] = useState(false);
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumen' | 'historial'>('resumen');
  const [editingAsistencia, setEditingAsistencia] = useState<Asistencia | null>(null);

  useEffect(() => {
    cargarCursos();
  }, []);

  useEffect(() => {
    if (selectedCurso) {
      cargarAsistencias(selectedCurso);
      if (activeTab === 'historial') {
        cargarHistorial(selectedCurso);
      }
    }
  }, [selectedCurso, activeTab]);

  const cargarCursos = async () => {
    try {
      setIsLoadingCursos(true);
      const data = await docenteCursosApi.getMisCursos();
      setCursos(data);
      if (data.length > 0) {
        setSelectedCurso(data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setIsLoadingCursos(false);
    }
  };

  const cargarAsistencias = async (cursoId: number) => {
    try {
      setIsLoadingAsistencias(true);
      const data = await docenteAsistenciaApi.getResumenAsistencia(cursoId);
      setResumenAsistencias(data);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      toast.error('Error al cargar las asistencias');
    } finally {
      setIsLoadingAsistencias(false);
    }
  };

  const cargarHistorial = async (cursoId: number) => {
    try {
      setIsLoadingHistorial(true);
      const data = await docenteAsistenciaApi.getAsistenciasCurso(cursoId);
      setHistorialAsistencias(data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      toast.error('Error al cargar el historial');
    } finally {
      setIsLoadingHistorial(false);
    }
  };

  const handleEliminarAsistencia = async (idAsistencia: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro de asistencia?')) {
      return;
    }

    try {
      await docenteAsistenciaApi.eliminarAsistencia(idAsistencia);
      toast.success('Asistencia eliminada correctamente');
      if (selectedCurso) {
        cargarHistorial(selectedCurso);
        cargarAsistencias(selectedCurso);
      }
    } catch (error: any) {
      console.error('Error al eliminar asistencia:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar la asistencia');
    }
  };

  const handleActualizarAsistencia = async (asistencia: Asistencia, presente: boolean) => {
    try {
      await docenteAsistenciaApi.actualizarAsistencia(asistencia.id, {
        fecha: asistencia.fecha,
        tipoClase: 'Teoría', // Por defecto
        presente,
        observaciones: asistencia.observaciones || ''
      });
      toast.success('Asistencia actualizada correctamente');
      if (selectedCurso) {
        cargarHistorial(selectedCurso);
        cargarAsistencias(selectedCurso);
      }
      setEditingAsistencia(null);
    } catch (error: any) {
      console.error('Error al actualizar asistencia:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar la asistencia');
    }
  };

  const cursoSeleccionado = cursos.find(c => c.id === selectedCurso);

  // if (isLoadingCursos) {
  //   return (
  //     <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
  //       <div className="animate-pulse text-zinc-400 text-sm">Cargando...</div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="px-6 py-4 max-w-1xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-sm font-medium text-zinc-900">Asistencias</h1>
            <p className="text-xs text-zinc-500">Control de asistencia por curso</p>
          </div>
          {selectedCurso && (
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 
                        bg-zinc-900 text-white text-xs font-medium rounded
                        hover:bg-zinc-800 transition-colors w-full sm:w-auto justify-center"
            >
              Registrar Asistencia
            </button>
          )}
        </div>
      </header>

      <div className="px-0 pt-8 pb-6 max-w-1xl mx-auto">
        {/* Selector de Curso */}
        <div className="mb-6">
          <label className="block text-xs text-zinc-500 mb-1.5">Seleccionar curso</label>
          <select
            value={selectedCurso || ''}
            onChange={(e) => setSelectedCurso(Number(e.target.value))}
            className="w-full sm:max-w-xs px-3 py-2 text-sm border border-zinc-200 rounded-md bg-white
                       focus:outline-none focus:ring-1 focus:ring-zinc-400"
          >
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.nombreCurso} - Ciclo {curso.ciclo}
              </option>
            ))}
          </select>
        </div>

        {/* Info del curso seleccionado */}
        {cursoSeleccionado && (
          <div className="mb-4 flex items-center gap-4 text-xs text-zinc-500">
            <span>{cursoSeleccionado.totalEstudiantes} estudiantes</span>
            <span>•</span>
            <span>Asistencia promedio: {cursoSeleccionado.porcentajeAsistenciaPromedio.toFixed(1)}%</span>
          </div>
        )}

        {/* ========== TABS ========== */}
        <div className="mb-6 border-b border-zinc-200 overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'resumen'
                ? 'text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
                }`}
            >
              Resumen por Estudiante
              {activeTab === 'resumen' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'historial'
                ? 'text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
                }`}
            >
              Historial de Registros
              {activeTab === 'historial' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
              )}
            </button>
          </div>
        </div>

        {/* ========== TAB: RESUMEN ========== */}
        {activeTab === 'resumen' && (
          <div className="w-full border border-zinc-200 rounded-lg bg-white overflow-hidden">
            {/* {isLoadingAsistencias ? (
              <div className="py-16 text-center">
                <div className="animate-pulse text-zinc-400 text-sm">Cargando asistencias...</div>
              </div>
            ) :  */}
            {resumenAsistencias.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="Sin registros"
                description="No hay registros de asistencia para este curso"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                  <tr className="text-left text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-200">
                    <th className="px-6 py-3 font-medium">Estudiante</th>
                    <th className="px-6 py-3 font-medium text-center">Asistencias</th>
                    <th className="px-6 py-3 font-medium text-center">Faltas</th>
                    <th className="px-6 py-3 font-medium text-center">Total Clases</th>
                    <th className="px-6 py-3 font-medium text-center">% Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {resumenAsistencias.map((resumen) => (
                    <tr
                      key={resumen.idEstudiante}
                      className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-zinc-900">{resumen.nombreEstudiante}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-green-700 font-mono tabular-nums">{resumen.asistenciasPresente}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-red-700 font-mono tabular-nums">{resumen.asistenciasFalta}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-zinc-600 font-mono tabular-nums">{resumen.totalAsistencias}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge value={resumen.porcentajeAsistencia} type="attendance" />
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
            </div>
          )}            {/* Footer */}
            {resumenAsistencias.length > 0 && (
              <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  {resumenAsistencias.length} estudiantes
                </p>
                <p className="text-xs font-medium text-zinc-700">
                  Promedio general: {cursoSeleccionado?.porcentajeAsistenciaPromedio.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========== TAB: HISTORIAL ========== */}
        {activeTab === 'historial' && (
          <div className="space-y-4">
            {/* {isLoadingHistorial ? (
              <div className="border border-zinc-200 rounded-lg bg-white py-16 text-center">
                <div className="animate-pulse text-zinc-400 text-sm">Cargando historial...</div>
              </div>
            ) :  */}
            {historialAsistencias.length === 0 ? (
              <div className="border border-zinc-200 rounded-lg bg-white">
                <EmptyState
                  icon={ClockIcon}
                  title="Sin historial"
                  description="No hay registros de asistencia para este curso"
                />
              </div>
            ) : (
              // Agrupar por fecha
              Object.entries(
                historialAsistencias.reduce((acc, asistencia) => {
                  const fecha = asistencia.fecha;
                  if (!acc[fecha]) acc[fecha] = [];
                  acc[fecha].push(asistencia);
                  return acc;
                }, {} as Record<string, Asistencia[]>)
              ).map(([fecha, asistencias]) => (
                <div key={fecha} className="w-full border border-zinc-200 rounded-lg bg-white overflow-hidden">
                  {/* Header de la fecha */}
                  <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-zinc-400 stroke-[1.5]" />
                      <p className="text-sm font-medium text-zinc-900">
                        {new Date(fecha).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>
                        <span className="text-green-700 font-medium">
                          {asistencias.filter(a => a.presente).length} presentes
                        </span>
                        {' · '}
                        <span className="text-red-700 font-medium">
                          {asistencias.filter(a => !a.presente).length} ausentes
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Tabla de asistencias */}
                  <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="text-left text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-200">
                        <th className="px-6 py-3 font-medium">Estudiante</th>
                        <th className="px-6 py-3 font-medium text-center">Estado</th>
                        <th className="px-6 py-3 font-medium">Observaciones</th>
                        <th className="px-6 py-3 font-medium text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asistencias.map((asistencia) => (
                        <tr
                          key={asistencia.id}
                          className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-zinc-900">{asistencia.nombreEstudiante}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {editingAsistencia?.id === asistencia.id ? (
                              <select
                                value={editingAsistencia.presente ? 'presente' : 'ausente'}
                                onChange={(e) => {
                                  const presente = e.target.value === 'presente';
                                  handleActualizarAsistencia(asistencia, presente);
                                }}
                                className="px-2 py-1 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                              >
                                <option value="presente">Presente</option>
                                <option value="ausente">Ausente</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${asistencia.presente
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                                }`}>
                                {asistencia.presente ? 'Presente' : 'Ausente'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-zinc-500">
                              {asistencia.observaciones || '-'}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingAsistencia(asistencia)}
                                className="p-1.5 hover:bg-zinc-100 rounded transition-colors"
                                title="Editar"
                              >
                                <PencilIcon className="h-4 w-4 text-zinc-500 stroke-[1.5]" />
                              </button>
                              <button
                                onClick={() => handleEliminarAsistencia(asistencia.id)}
                                className="p-1.5 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar"
                              >
                                <TrashIcon className="h-4 w-4 text-red-500 stroke-[1.5]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de Asistencia */}
      {selectedCurso && cursoSeleccionado && (
        <AttendanceModal
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
          cursoId={selectedCurso}
          cursoNombre={cursoSeleccionado.nombreCurso}
          onSuccess={() => {
            cargarAsistencias(selectedCurso);
            if (activeTab === 'historial') {
              cargarHistorial(selectedCurso);
            }
          }}
        />
      )}
    </div>
  );
};
