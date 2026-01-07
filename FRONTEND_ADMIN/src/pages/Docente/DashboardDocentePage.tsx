import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { docenteAuthApi, docenteCursosApi, docenteAsistenciaApi, docenteHorariosApi, CursoDocente, EstudianteCurso, EstudiantesResponse } from '../../services/docenteApi';
import { trabajosDocenteApi, TrabajoPendiente } from '../../services/trabajosApi';
import { Horario } from '../../types/horario';
import { toast } from 'react-hot-toast';

import {
  BookOpenIcon,
  ChevronRightIcon,
  ClockIcon,
  InboxIcon,
  CalendarIcon,
  XMarkIcon,
  CheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

// ============================================
// INTERFACES
// ============================================

interface AsistenciaItem {
  idEstudiante: number;
  nombreCompleto: string;
  presente: boolean | null;
  observaciones: string;
}

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
  } else if (type === 'attendance') {
    if (value >= 80) bgClass = 'bg-green-50 text-green-700';
    else if (value < 60) bgClass = 'bg-red-50 text-red-700';
  }
  
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium tabular-nums ${bgClass}`}>
      {value.toFixed(type === 'grade' ? 2 : 1)}{type === 'attendance' ? '%' : ''}
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
// MODAL DE ASISTENCIA RÁPIDA
// ============================================

interface ModalAsistenciaProps {
  curso: CursoDocente;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalAsistenciaRapida = ({ curso, onClose, onSuccess }: ModalAsistenciaProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteCurso[]>([]);
  const [asistencias, setAsistencias] = useState<AsistenciaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fechaAsistencia] = useState(new Date().toISOString().split('T')[0]);
  const [tipoClase, setTipoClase] = useState<'Teoría' | 'Práctica'>('Teoría');

  useEffect(() => {
    cargarEstudiantes();
  }, [curso.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const cargarEstudiantes = async () => {
    try {
      setIsLoading(true);
      const response = await docenteCursosApi.getEstudiantesCurso(curso.id);
      
      let estudiantesList: EstudianteCurso[] = [];
      if (response && typeof response === 'object' && 'estudiantes' in response) {
        estudiantesList = (response as EstudiantesResponse).estudiantes || [];
      } else if (Array.isArray(response)) {
        estudiantesList = response;
      }
      
      setEstudiantes(estudiantesList);
      setAsistencias(estudiantesList.map(est => ({
        idEstudiante: est.idEstudiante,
        nombreCompleto: est.nombreCompleto,
        presente: null,
        observaciones: '',
      })));
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      toast.error('Error al cargar los estudiantes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAsistencia = (idEstudiante: number, presente: boolean) => {
    setAsistencias(prev => prev.map(a => 
      a.idEstudiante === idEstudiante 
        ? { ...a, presente: a.presente === presente ? null : presente }
        : a
    ));
  };

  const handleMarcarTodosPresentes = () => {
    setAsistencias(prev => prev.map(a => ({ ...a, presente: true })));
  };

  const handleMarcarTodosAusentes = () => {
    setAsistencias(prev => prev.map(a => ({ ...a, presente: false })));
  };

  const handleSubmit = async () => {
    const asistenciasMarcadas = asistencias.filter(a => a.presente !== null);
    
    if (asistenciasMarcadas.length === 0) {
      toast.error('Debe marcar al menos un estudiante');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await docenteAsistenciaApi.registrarAsistencias({
        idCurso: curso.id,
        fecha: fechaAsistencia,
        tipoClase: tipoClase,
        estudiantes: asistenciasMarcadas.map(a => ({
          idEstudiante: a.idEstudiante,
          presente: a.presente as boolean,
          observaciones: a.observaciones || undefined,
        })),
      });

      toast.success(`Asistencia registrada para ${asistenciasMarcadas.length} estudiante(s)`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al registrar asistencia:', error);
      toast.error(error.response?.data?.message || 'Error al registrar asistencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const presentes = asistencias.filter(a => a.presente === true).length;
  const ausentes = asistencias.filter(a => a.presente === false).length;
  const sinMarcar = asistencias.filter(a => a.presente === null).length;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-sm border border-zinc-200 w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div>
            <h2 className="text-sm font-medium text-zinc-900">Tomar Asistencia</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{curso.nombreCurso} • Ciclo {curso.ciclo}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-600 p-1 hover:bg-zinc-100 rounded transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Fecha y Tipo */}
        <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-700 font-mono">{fechaAsistencia}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Tipo:</span>
            <select
              value={tipoClase}
              onChange={(e) => setTipoClase(e.target.value as 'Teoría' | 'Práctica')}
              className="text-sm border border-zinc-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="Teoría">Teoría</option>
              <option value="Práctica">Práctica</option>
            </select>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs">
            <span className="text-green-600 font-medium">{presentes} presentes</span>
            <span className="text-red-600 font-medium">{ausentes} ausentes</span>
            <span className="text-zinc-400">{sinMarcar} sin marcar</span>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="px-5 py-2 border-b border-zinc-200 flex items-center gap-2">
          <button
            onClick={handleMarcarTodosPresentes}
            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors"
          >
            Todos presentes
          </button>
          <button
            onClick={handleMarcarTodosAusentes}
            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
          >
            Todos ausentes
          </button>
        </div>

        {/* Lista de estudiantes */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-pulse text-zinc-400 text-sm">Cargando estudiantes...</div>
            </div>
          ) : estudiantes.length === 0 ? (
            <EmptyState 
              icon={UserGroupIcon}
              title="Sin estudiantes"
              description="No hay estudiantes matriculados en este curso"
            />
          ) : (
            <div className="divide-y divide-zinc-100">
              {asistencias.map((asistencia, index) => (
                <div 
                  key={asistencia.idEstudiante}
                  className="px-5 py-3 flex items-center justify-between hover:bg-zinc-50/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 font-mono w-6">{index + 1}</span>
                    <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-medium text-zinc-600">
                      {asistencia.nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <span className="text-sm text-zinc-900">{asistencia.nombreCompleto}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Botón Presente */}
                    <button
                      onClick={() => handleToggleAsistencia(asistencia.idEstudiante, true)}
                      className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${
                        asistencia.presente === true
                          ? 'bg-green-500 text-white'
                          : 'bg-zinc-100 text-zinc-400 hover:bg-green-100 hover:text-green-600'
                      }`}
                    >
                      <CheckIcon className="w-5 h-5 stroke-[2]" />
                    </button>
                    
                    {/* Botón Ausente */}
                    <button
                      onClick={() => handleToggleAsistencia(asistencia.idEstudiante, false)}
                      className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${
                        asistencia.presente === false
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-100 text-zinc-400 hover:bg-red-100 hover:text-red-600'
                      }`}
                    >
                      <XMarkIcon className="w-5 h-5 stroke-[2]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50">
          <p className="text-xs text-zinc-500">
            {estudiantes.length} estudiantes en total
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 rounded-md text-sm font-medium text-zinc-700 
                         hover:bg-zinc-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || sinMarcar === asistencias.length}
              className="px-4 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium
                         hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Asistencia'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// WIDGET PRÓXIMAS CLASES (con horario real)
// ============================================

// Helper para obtener la próxima clase
const getNextClass = (horarios: Horario[] = []) => {
  if (!horarios.length) return null;
  
  const now = new Date();
  const currentDay = now.getDay() || 7; // 1 (Mon) - 7 (Sun), Domingo = 7
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Ordenar horarios por día y hora
  const sortedHorarios = [...horarios].sort((a, b) => {
    if (a.diaSemana !== b.diaSemana) return a.diaSemana - b.diaSemana;
    const timeA = parseInt(a.horaInicio.split(':')[0]) * 60 + parseInt(a.horaInicio.split(':')[1]);
    const timeB = parseInt(b.horaInicio.split(':')[0]) * 60 + parseInt(b.horaInicio.split(':')[1]);
    return timeA - timeB;
  });

  // Buscar próxima clase hoy
  const nextToday = sortedHorarios.find(h => {
    const start = parseInt(h.horaInicio.split(':')[0]) * 60 + parseInt(h.horaInicio.split(':')[1]);
    return h.diaSemana === currentDay && start > currentTime;
  });

  if (nextToday) return { ...nextToday, label: 'Hoy' };

  // Buscar primera clase en próximos días
  const nextUpcoming = sortedHorarios.find(h => h.diaSemana > currentDay);
  if (nextUpcoming) return { ...nextUpcoming, label: nextUpcoming.diaSemanaTexto };

  // Si no hay clases esta semana, retornar primera de la próxima semana
  return sortedHorarios[0] ? { ...sortedHorarios[0], label: sortedHorarios[0].diaSemanaTexto } : null;
};

interface NextClassWidgetProps {
  horarios: Horario[];
  cursos: CursoDocente[];
  onTomarAsistencia: (curso: CursoDocente) => void;
  isLoading?: boolean;
}

const NextClassWidget = ({ horarios, cursos, onTomarAsistencia, isLoading }: NextClassWidgetProps) => {
  const nextClass = useMemo(() => getNextClass(horarios), [horarios]);

  if (isLoading) {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-700 rounded w-24" />
          <div className="h-6 bg-zinc-700 rounded w-3/4" />
          <div className="h-4 bg-zinc-700 rounded w-1/2" />
          <div className="h-12 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  // Buscar el curso completo para el botón de asistencia
  const cursoCompleto = nextClass ? cursos.find(c => c.id === nextClass.idCurso) : null;
  const esHoy = nextClass?.label === 'Hoy';

  return (
    <div className="bg-zinc-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
      {/* Icono decorativo de fondo */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <ClockIcon className="w-24 h-24" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Próxima Clase</span>
          {nextClass && (
            <span className="px-2 py-1 bg-white/10 rounded text-xs font-medium text-white border border-white/10">
              {nextClass.label}
            </span>
          )}
        </div>

        {nextClass ? (
          <>
            <h3 className="text-xl font-semibold mb-1 line-clamp-2">{nextClass.nombreCurso}</h3>
            <p className="text-zinc-400 text-sm mb-6">
              {nextClass.aula || 'Aula por asignar'}
            </p>
            
            <div className="flex items-center justify-between text-sm font-mono text-zinc-300 bg-white/5 p-3 rounded-lg border border-white/5">
              <span>{nextClass.horaInicio}</span>
              <div className="h-px w-8 bg-zinc-600" />
              <span>{nextClass.horaFin}</span>
            </div>

            {/* Botón de tomar asistencia solo si es hoy */}
            {esHoy && cursoCompleto && (
              <button
                onClick={() => onTomarAsistencia(cursoCompleto)}
                className="w-full mt-4 px-4 py-2.5 bg-white text-zinc-900 rounded-lg text-sm font-medium 
                           hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2"
              >
                Tomar Asistencia
                <ChevronRightIcon className="h-4 w-4 stroke-[2]" />
              </button>
            )}
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-zinc-400 text-sm">No hay clases programadas próximamente</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const DashboardDocentePage = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<CursoDocente[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHorarios, setIsLoadingHorarios] = useState(true);
  const [modalAsistencia, setModalAsistencia] = useState<CursoDocente | null>(null);

  const docenteActual = useMemo(() => docenteAuthApi.getCurrentDocente(), []);

  // Usar React Query para trabajos pendientes (permite invalidación automática)
  const { data: trabajosPendientes = [], isLoading: isLoadingTrabajos } = useQuery<TrabajoPendiente[]>({
    // Incluir el id del docente para evitar cache cruzado entre docentes
    queryKey: ['trabajos-pendientes', docenteActual?.id],
    queryFn: async () => {
      try {
        const data = await trabajosDocenteApi.getTrabajosPendientes();
        console.log('Trabajos pendientes cargados:', data);
        return data;
      } catch (error) {
        console.error('Error al cargar trabajos pendientes:', error);
        toast.error('Error al cargar trabajos pendientes');
        throw error;
      }
    },
    refetchInterval: 30000, // Recargar cada 30 segundos
    refetchOnWindowFocus: true, // Recargar cuando se enfoca la ventana
  });

  useEffect(() => {
    cargarCursos();
    cargarHorarios();
  }, []);

  const cargarCursos = async () => {
    try {
      setIsLoading(true);
      const data = await docenteCursosApi.getMisCursos();
      setCursos(data);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setIsLoading(false);
    }
  };

  const cargarHorarios = async () => {
    try {
      setIsLoadingHorarios(true);
      const data = await docenteHorariosApi.getMiHorario();
      setHorarios(data);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    } finally {
      setIsLoadingHorarios(false);
    }
  };

  // Filtrar tareas pendientes: SOLO cursos del docente logueado
  // (si el backend devuelve tareas de más, este filtro lo corrige en UI)
  const trabajosPendientesFiltrados = useMemo(() => {
    if (!trabajosPendientes?.length) return [];
    if (!cursos?.length) return [];
    const idsCursos = new Set(cursos.map(c => c.id));
    return trabajosPendientes.filter(t => idsCursos.has(t.idCurso));
  }, [trabajosPendientes, cursos]);


  // Cálculos
  const totalEstudiantes = cursos.reduce((sum, c) => sum + c.totalEstudiantes, 0);
  const promedioGeneral = cursos.length > 0 
    ? cursos.reduce((sum, c) => sum + c.promedioGeneral, 0) / cursos.length 
    : 0;
  const asistenciaPromedio = cursos.length > 0
    ? cursos.reduce((sum, c) => sum + c.porcentajeAsistenciaPromedio, 0) / cursos.length
    : 0;

  const handleTomarAsistencia = (curso: CursoDocente) => {
    setModalAsistencia(curso);
  };

  // Loading state minimalista
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
        <div className="h-14 px-5 max-w-1xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-sm font-medium text-zinc-900">Dashboard</h1>
            {cursos[0]?.periodoNombre && (
              <p className="text-xs text-zinc-500">{cursos[0].periodoNombre}</p>
            )}
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>

      <div className="px-0 pt-6 pb-6 max-w-8xl mx-auto">
        {/* ========== STATS ROW ========== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200 rounded-lg overflow-hidden mb-6">
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

        {/* ========== BENTO GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Próxima Clase Widget - 1 col */}
          <div className="col-span-1">
            <NextClassWidget 
              horarios={horarios}
              cursos={cursos}
              onTomarAsistencia={handleTomarAsistencia}
              isLoading={isLoadingHorarios}
            />
          </div>

          {/* Tareas Pendientes Widget - 2 cols */}
          <div className="col-span-1 lg:col-span-2 border border-zinc-200 rounded-lg bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Tareas pendientes</p>
              <span className="text-xs text-zinc-400">Hoy</span>
            </div>
            {isLoadingTrabajos ? (
              <div className="py-12 text-center">
                <div className="animate-pulse text-zinc-400 text-sm">Cargando tareas...</div>
              </div>
            ) : trabajosPendientesFiltrados.length === 0 ? (
              <EmptyState 
                icon={InboxIcon}
                title="Todo al día"
                description="No hay trabajos pendientes por revisar"
              />
            ) : (
              <div className="space-y-3">
                {trabajosPendientesFiltrados.map((trabajo) => (
                  <div
                    key={trabajo.id}
                    className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/docente/curso/${trabajo.idCurso}?tab=trabajos`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-zinc-900 truncate">
                          {trabajo.titulo}
                        </h4>
                        {trabajo.entregasPendientesCalificar > 0 ? (
                          <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 text-xs font-medium rounded border border-zinc-200">
                            {trabajo.entregasPendientesCalificar} pendiente{trabajo.entregasPendientesCalificar !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 text-xs font-medium rounded border border-zinc-200">
                            Sin entregas aún
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 truncate">
                        {trabajo.nombreCurso}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-zinc-400">
                          Fecha límite: {new Date(trabajo.fechaLimite).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                        {trabajo.fechaUltimaEntrega ? (
                          <span className="text-xs text-zinc-400">
                            • Última entrega: {new Date(trabajo.fechaUltimaEntrega).toLocaleDateString('es-PE', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </span>
                        ) : trabajo.totalEntregas === 0 ? (
                          <span className="text-xs text-zinc-400">
                            • Sin entregas
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-zinc-400 flex-shrink-0 ml-3" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========== DATA TABLE ========== */}
        <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-medium text-zinc-900">Mis Cursos</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Gestiona calificaciones, asistencias y estudiantes</p>
          </div>

          {cursos.length === 0 ? (
            <EmptyState 
              icon={BookOpenIcon}
              title="Sin cursos asignados"
              description="Contacta al administrador para asignación"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                <tr className="text-left text-xs text-zinc-500 uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Curso</th>
                  <th className="px-5 py-3 font-medium text-center">Ciclo</th>
                  <th className="px-5 py-3 font-medium text-center">Créditos</th>
                  <th className="px-5 py-3 font-medium text-center">Estudiantes</th>
                  <th className="px-5 py-3 font-medium text-center">Promedio</th>
                  <th className="px-5 py-3 font-medium text-center">Asistencia</th>
                  <th className="px-5 py-3 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody>
                {cursos.map((curso) => (
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
                    <td className="px-5 py-4 text-center">
                      <StatusBadge value={curso.porcentajeAsistenciaPromedio} type="attendance" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTomarAsistencia(curso)}
                          className="px-2.5 py-1.5 border border-zinc-200 text-zinc-600 text-xs font-medium rounded
                                     hover:bg-zinc-50 transition-colors"
                          title="Tomar asistencia"
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/docente/curso/${curso.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 
                                     bg-zinc-900 text-white text-xs font-medium rounded
                                     hover:bg-zinc-800 transition-colors"
                        >
                          Gestionar
                          <ChevronRightIcon className="h-3 w-3 stroke-[2]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}

          {/* Footer */}
          {cursos.length > 0 && (
            <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                Mostrando {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'}
              </p>
              <p className="text-xs font-medium text-zinc-700 tabular-nums">
                {totalEstudiantes} estudiantes en total
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Asistencia Rápida */}
      {modalAsistencia && (
        <ModalAsistenciaRapida
          curso={modalAsistencia}
          onClose={() => setModalAsistencia(null)}
          onSuccess={cargarCursos}
        />
      )}
    </div>
  );
};
