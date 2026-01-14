import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  Trash2,
  X,
  Users,
  Book,
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  Settings,
  Eye,
  Plus
} from 'lucide-react';
import { horariosApi } from '../../services/horariosApi';
import {
  DocenteConCursos,
  Horario,
  CreateHorarioDto
} from '../../types/horario';

export default function GestionHorariosPage() {
  const [docentes, setDocentes] = useState<DocenteConCursos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocente, setSelectedDocente] = useState<DocenteConCursos | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    cargarDocentes();
  }, []);

  const cargarDocentes = async () => {
    try {
      setIsLoading(true);
      const data = await horariosApi.getDocentesConCursos();
      setDocentes(data);
    } catch (error) {
      console.error('Error al cargar docentes:', error);
      toast.error('No se pudieron cargar los docentes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDrawer = (docente: DocenteConCursos) => {
    setSelectedDocente(docente);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedDocente(null), 300);
  };

  // Categorizar docentes por estado de horarios
  const categorizeDocentes = () => {
    const filtered = searchTerm 
      ? docentes.filter(d =>
          d.nombreDocente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.cursos.some(c => c.nombreCurso.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : docentes;

    const sinHorarios = filtered.filter(d => d.totalHorariosAsignados === 0);
    const enProgreso = filtered.filter(d => {
      if (d.totalHorariosAsignados === 0) return false;
      const totalCursos = d.totalCursos;
      const cursosConHorarios = d.cursos.filter(c => c.horarios.length > 0).length;
      return cursosConHorarios < totalCursos;
    });
    const completos = filtered.filter(d => {
      if (d.totalHorariosAsignados === 0) return false;
      const totalCursos = d.totalCursos;
      const cursosConHorarios = d.cursos.filter(c => c.horarios.length > 0).length;
      return cursosConHorarios === totalCursos;
    });

    return { sinHorarios, enProgreso, completos };
  };

  const { sinHorarios, enProgreso, completos } = categorizeDocentes();

  const totalDocentes = docentes.length;
  const totalCursos = docentes.reduce((acc, d) => acc + d.totalCursos, 0);
  const totalHorarios = docentes.reduce((acc, d) => acc + d.totalHorariosAsignados, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Panel de Gestión de Horarios
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Configure y organice los horarios académicos por docente
          </p>
        </div>
        <button
          onClick={cargarDocentes}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          <Clock className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Estadísticas y búsqueda */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Stats compactas */}
            <div className="bg-zinc-50 rounded-lg px-4 py-3 border border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-zinc-200">
                  <Users className="h-4 w-4 text-zinc-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-zinc-900">{totalDocentes}</p>
                  <p className="text-xs text-zinc-500">Docentes</p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-50 rounded-lg px-4 py-3 border border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-zinc-200">
                  <Book className="h-4 w-4 text-zinc-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-zinc-900">{totalCursos}</p>
                  <p className="text-xs text-zinc-500">Cursos</p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-50 rounded-lg px-4 py-3 border border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-zinc-200">
                  <Calendar className="h-4 w-4 text-zinc-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-zinc-900">{totalHorarios}</p>
                  <p className="text-xs text-zinc-500">Sesiones</p>
                </div>
              </div>
            </div>
            {/* Búsqueda */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar docente o curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"></div>
              <p className="text-sm text-zinc-500">Cargando información...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Columna 1: Sin horarios */}
            <KanbanColumn
              title="Sin horarios"
              count={sinHorarios.length}
              docentes={sinHorarios}
              status="sin-horarios"
              onSelectDocente={handleOpenDrawer}
            />

            {/* Columna 2: En progreso */}
            <KanbanColumn
              title="En progreso"
              count={enProgreso.length}
              docentes={enProgreso}
              status="en-progreso"
              onSelectDocente={handleOpenDrawer}
            />

            {/* Columna 3: Completos */}
            <KanbanColumn
              title="Horarios completos"
              count={completos.length}
              docentes={completos}
              status="completo"
              onSelectDocente={handleOpenDrawer}
            />
          </div>
        )}
      </div>

      {/* Drawer lateral */}
      {selectedDocente && (
        <DrawerPanel
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          docente={selectedDocente}
          onSuccess={cargarDocentes}
        />
      )}
    </div>
  );
}

// Componente de columna Kanban
interface KanbanColumnProps {
  title: string;
  count: number;
  docentes: DocenteConCursos[];
  status: 'sin-horarios' | 'en-progreso' | 'completo';
  onSelectDocente: (docente: DocenteConCursos) => void;
}

function KanbanColumn({ title, count, docentes, status, onSelectDocente }: KanbanColumnProps) {
  const headerColor = {
    'sin-horarios': 'bg-zinc-100 text-zinc-600 border-zinc-200',
    'en-progreso': 'bg-violet-50 text-violet-700 border-violet-200',
    'completo': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }[status];

  return (
    <div className="flex flex-col h-[calc(100vh-280px)]">
      {/* Header de la columna */}
      <div className={`rounded-t-xl border-t border-x px-4 py-3 ${headerColor}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          <span className="text-xs font-medium px-2 py-0.5 bg-white/60 rounded-full">
            {count}
          </span>
        </div>
      </div>

      {/* Contenido con scroll */}
      <div className="flex-1 bg-white border-x border-b border-zinc-200 rounded-b-xl overflow-y-auto">
        <div className="p-3 space-y-3">
          {docentes.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-zinc-400">Sin docentes en esta categoría</p>
            </div>
          ) : (
            docentes.map((docente) => (
              <DocenteKanbanCard
                key={docente.idDocente}
                docente={docente}
                status={status}
                onClick={() => onSelectDocente(docente)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de tarjeta de docente para Kanban
interface DocenteKanbanCardProps {
  docente: DocenteConCursos;
  status: 'sin-horarios' | 'en-progreso' | 'completo';
  onClick: () => void;
}

function DocenteKanbanCard({ docente, status, onClick }: DocenteKanbanCardProps) {
  const cursosConHorarios = docente.cursos.filter(c => c.horarios.length > 0).length;
  const progreso = docente.totalCursos > 0 
    ? (cursosConHorarios / docente.totalCursos) * 100 
    : 0;

  const statusConfig = {
    'sin-horarios': {
      badge: 'bg-zinc-100 text-zinc-600',
      progress: 'bg-zinc-200',
      progressBar: 'bg-zinc-400'
    },
    'en-progreso': {
      badge: 'bg-violet-100 text-violet-700',
      progress: 'bg-violet-100',
      progressBar: 'bg-violet-500'
    },
    'completo': {
      badge: 'bg-emerald-100 text-emerald-700',
      progress: 'bg-emerald-100',
      progressBar: 'bg-emerald-500'
    }
  }[status];

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg border border-zinc-200 p-4 text-left hover:border-zinc-300 hover:shadow-sm transition-all group"
    >
      {/* Nombre y carrera */}
      <div className="mb-3">
        <h4 className="font-semibold text-zinc-900 text-sm mb-1 group-hover:text-zinc-700 transition-colors">
          {docente.nombreDocente}
        </h4>
        <p className="text-xs text-zinc-500">{docente.profesion}</p>
      </div>

      {/* Chips informativos */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md">
          <Book className="h-3 w-3" />
          {docente.totalCursos} {docente.totalCursos === 1 ? 'curso' : 'cursos'}
        </span>
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md">
          <Clock className="h-3 w-3" />
          {docente.totalHorariosAsignados} {docente.totalHorariosAsignados === 1 ? 'sesión' : 'sesiones'}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="mb-2">
        <div className={`h-1.5 rounded-full overflow-hidden ${statusConfig.progress}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${statusConfig.progressBar}`}
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Badge de estado y acción */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.badge}`}>
          {cursosConHorarios}/{docente.totalCursos} completos
        </span>
        <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 group-hover:tranzinc-x-0.5 transition-all" />
      </div>
    </button>
  );
}

// Drawer Panel lateral
interface DrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  docente: DocenteConCursos;
  onSuccess: () => void;
}

function DrawerPanel({ isOpen, onClose, docente, onSuccess }: DrawerPanelProps) {
  const [activeTab, setActiveTab] = useState<'cursos' | 'configurar'>('cursos');
  const [selectedCurso, setSelectedCurso] = useState<number | null>(null);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictoError, setConflictoError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<CreateHorarioDto>({
    defaultValues: {
      tipo: 'Teoría',
      diaSemana: 1
    }
  });

  useEffect(() => {
    if (isOpen && docente.cursos.length > 0) {
      setSelectedCurso(docente.cursos[0].idCurso);
    }
  }, [isOpen, docente]);

  useEffect(() => {
    if (selectedCurso && activeTab === 'configurar') {
      cargarHorarios();
      reset({ tipo: 'Teoría', diaSemana: 1, aula: '', horaInicio: '', horaFin: '' });
      setConflictoError(null);
    }
  }, [selectedCurso, activeTab]);

  const cargarHorarios = async () => {
    if (!selectedCurso) return;
    try {
      setIsLoading(true);
      const data = await horariosApi.getHorariosByCurso(selectedCurso);
      setHorarios(data);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      toast.error('No se pudieron cargar los horarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este horario?')) return;
    
    try {
      await horariosApi.deleteHorario(id);
      toast.success('Horario eliminado');
      cargarHorarios();
      onSuccess();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('No se pudo eliminar el horario');
    }
  };

  const onSubmit = async (data: CreateHorarioDto) => {
    if (!selectedCurso) {
      toast.error('Selecciona un curso');
      return;
    }

    setConflictoError(null);

    if (data.horaInicio >= data.horaFin) {
      toast.error('La hora de inicio debe ser menor a la hora de fin');
      return;
    }

    try {
      setIsSubmitting(true);
      await horariosApi.createHorario({
        ...data,
        idCurso: selectedCurso,
        diaSemana: Number(data.diaSemana)
      });

      toast.success('Horario agregado');
      reset({ tipo: 'Teoría', diaSemana: 1, aula: '', horaInicio: '', horaFin: '' });
      cargarHorarios();
      onSuccess();
    } catch (error: any) {
      console.error('Error al crear horario:', error);
      if (error.response?.status === 409) {
        const mensaje = error.response.data.message || 'Conflicto de horario';
        setConflictoError(mensaje);
      } else {
        toast.error('Error al guardar');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const DIAS_SEMANA = [
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' },
    { id: 7, nombre: 'Domingo' },
  ];

  const inputClasses = "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm" />
        </Transition.Child>

        {/* Drawer desde la derecha */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="tranzinc-x-full"
                enterTo="tranzinc-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="tranzinc-x-0"
                leaveTo="tranzinc-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    {/* Header */}
                    <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-5">
                      <div className="flex items-center justify-between mb-3">
                        <Dialog.Title className="text-lg font-bold text-zinc-900">
                          {docente.nombreDocente}
                        </Dialog.Title>
                        <button
                          onClick={onClose}
                          className="text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          {docente.profesion}
                        </span>
                        {docente.correo && (
                          <span className="flex items-center gap-1.5">
                            <span>•</span>
                            {docente.correo}
                          </span>
                        )}
                      </div>

                      {/* Tabs */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => setActiveTab('cursos')}
                          className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === 'cursos'
                              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                              : 'text-zinc-500 hover:text-zinc-700'
                          }`}
                        >
                          <Eye className="h-4 w-4 inline mr-1.5" />
                          Ver detalle
                        </button>
                        <button
                          onClick={() => setActiveTab('configurar')}
                          className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === 'configurar'
                              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                              : 'text-zinc-500 hover:text-zinc-700'
                          }`}
                        >
                          <Settings className="h-4 w-4 inline mr-1.5" />
                          Configurar horarios
                        </button>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 overflow-y-auto">
                      {activeTab === 'cursos' ? (
                        // Vista de detalle de cursos
                        <div className="p-6 space-y-4">
                          {docente.cursos.map((curso) => (
                            <div key={curso.idCurso} className="bg-zinc-50 rounded-lg border border-zinc-200 p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    {curso.codigo && (
                                      <span className="text-xs font-medium text-zinc-500 bg-white px-2 py-0.5 rounded border border-zinc-200">
                                        {curso.codigo}
                                      </span>
                                    )}
                                    <h4 className="font-semibold text-zinc-900">{curso.nombreCurso}</h4>
                                  </div>
                                  <p className="text-xs text-zinc-500">
                                    Ciclo {curso.ciclo} · {curso.creditos} créditos · {curso.horasSemanal} hrs/sem
                                  </p>
                                </div>
                                {curso.horarios.length === 0 && (
                                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                                    <AlertCircle className="h-3 w-3" />
                                    Sin horario
                                  </span>
                                )}
                              </div>

                              {curso.horarios.length > 0 ? (
                                <div className="space-y-2">
                                  {curso.horarios.map((horario) => (
                                    <div
                                      key={horario.id}
                                      className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-zinc-200"
                                    >
                                      <div className="flex items-center gap-3 text-sm">
                                        <span className="font-medium text-zinc-700 min-w-[70px]">
                                          {horario.diaSemanaTexto}
                                        </span>
                                        <span className="text-zinc-500 font-mono text-xs">
                                          {horario.horaInicio} - {horario.horaFin}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          horario.tipo === 'Teoría' 
                                            ? 'bg-zinc-100 text-zinc-700' 
                                            : 'bg-zinc-800 text-white'
                                        }`}>
                                          {horario.tipo}
                                        </span>
                                        {horario.aula && (
                                          <span className="text-xs text-zinc-500">
                                            Aula {horario.aula}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-zinc-400 italic">
                                  No hay horarios configurados
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Vista de configuración
                        <div className="p-6 space-y-6">
                          {/* Selector de curso */}
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                              Seleccionar curso
                            </label>
                            <select
                              value={selectedCurso || ''}
                              onChange={(e) => setSelectedCurso(Number(e.target.value))}
                              className={inputClasses}
                            >
                              {docente.cursos.map((curso) => (
                                <option key={curso.idCurso} value={curso.idCurso}>
                                  {curso.codigo ? `${curso.codigo} · ` : ''}{curso.nombreCurso}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Lista de horarios actuales */}
                          <div>
                            <h4 className="text-sm font-medium text-zinc-900 mb-3">
                              Horarios actuales
                            </h4>
                            
                            {isLoading ? (
                              <div className="py-8 text-center">
                                <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"></div>
                              </div>
                            ) : horarios.length === 0 ? (
                              <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-6 text-center">
                                <p className="text-sm text-zinc-500">Sin horarios asignados</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {horarios.map((horario) => (
                                  <div
                                    key={horario.id}
                                    className="flex items-center justify-between bg-zinc-50 rounded-lg border border-zinc-200 px-4 py-3"
                                  >
                                    <div className="flex items-center gap-4 text-sm">
                                      <span className="font-medium text-zinc-700 min-w-[70px]">
                                        {horario.diaSemanaTexto}
                                      </span>
                                      <span className="text-zinc-600 font-mono">
                                        {horario.horaInicio} - {horario.horaFin}
                                      </span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        horario.tipo === 'Teoría' 
                                          ? 'bg-white text-zinc-700 border border-zinc-200' 
                                          : 'bg-zinc-800 text-white'
                                      }`}>
                                        {horario.tipo}
                                      </span>
                                      {horario.aula && (
                                        <span className="text-zinc-500">
                                          {horario.aula}
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleDelete(horario.id)}
                                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Formulario de nueva sesión */}
                          <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <Plus className="h-4 w-4 text-zinc-600" />
                              <h4 className="text-sm font-medium text-zinc-900">
                                Agregar nueva sesión
                              </h4>
                            </div>

                            {conflictoError && (
                              <div className="mb-4 rounded-lg bg-amber-50 p-3 border border-amber-200">
                                <div className="flex gap-2">
                                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-amber-800">Conflicto detectado</p>
                                    <p className="text-xs text-amber-700 mt-0.5">{conflictoError}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                                    Día
                                  </label>
                                  <select {...register('diaSemana', { required: true })} className={inputClasses}>
                                    {DIAS_SEMANA.map(dia => (
                                      <option key={dia.id} value={dia.id}>{dia.nombre}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                                    Tipo
                                  </label>
                                  <select {...register('tipo', { required: true })} className={inputClasses}>
                                    <option value="Teoría">Teoría</option>
                                    <option value="Práctica">Práctica</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                                    Hora inicio
                                  </label>
                                  <input
                                    type="time"
                                    {...register('horaInicio', { required: true })}
                                    className={inputClasses}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                                    Hora fin
                                  </label>
                                  <input
                                    type="time"
                                    {...register('horaFin', { required: true })}
                                    className={inputClasses}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                                  Aula (opcional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: 301"
                                  {...register('aula')}
                                  className={inputClasses}
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isSubmitting ? (
                                  <span className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                    Guardando...
                                  </span>
                                ) : (
                                  'Agregar sesión'
                                )}
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
