import { useState, useEffect, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Calendar,
  Search,
  AlertCircle,
  User,
  Clock
} from 'lucide-react';
import {
  adminCursosApi,
  PeriodoAdmin,
  CursoActivacionPeriodo,
  ActivarCursoPeriodoRequest
} from '../../services/adminCursosApi';
import { cursosApi } from '../../services/cursosService';
import { Curso } from '../../types';

export default function ActivacionCursosPage() {
  const queryClient = useQueryClient();
  const [modalActivarAbierto, setModalActivarAbierto] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);
  const [busquedaCurso, setBusquedaCurso] = useState('');
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [cursoADesactivar, setCursoADesactivar] = useState<CursoActivacionPeriodo | null>(null);
  const [modalDesactivarAbierto, setModalDesactivarAbierto] = useState(false);

  // Queries
  const { data: periodos = [], isLoading: cargandoPeriodos } = useQuery<PeriodoAdmin[]>({
    queryKey: ['periodos-admin'],
    queryFn: adminCursosApi.getPeriodos,
  });

  const { data: cursosActivados = [], isLoading: cargandoActivados } = useQuery<CursoActivacionPeriodo[]>({
    queryKey: ['cursos-activados', periodoSeleccionado],
    queryFn: () => periodoSeleccionado
      ? adminCursosApi.getCursosActivadosPeriodo(periodoSeleccionado)
      : adminCursosApi.getCursosActivados(),
    enabled: !!periodoSeleccionado || periodos.length > 0,
  });

  const { data: todosLosCursos = [], isLoading: cargandoCursos } = useQuery<Curso[]>({
    queryKey: ['cursos'],
    queryFn: cursosApi.getAll,
  });

  // Establecer período activo por defecto
  useEffect(() => {
    if (!periodoSeleccionado && periodos.length > 0) {
      const periodoActivo = periodos.find(p => p.activo);
      if (periodoActivo) {
        setPeriodoSeleccionado(periodoActivo.id);
      } else if (periodos.length > 0) {
        setPeriodoSeleccionado(periodos[0].id);
      }
    }
  }, [periodos, periodoSeleccionado]);

  // Filtrar cursos disponibles (excluir ya activados)
  const cursosActivadosIds = cursosActivados.map(ca => ca.idCurso);
  const cursosDisponibles = todosLosCursos.filter(
    curso => !cursosActivadosIds.includes(curso.id)
  );

  const cursosFiltrados = cursosDisponibles.filter(curso =>
    curso.nombreCurso.toLowerCase().includes(busquedaCurso.toLowerCase()) ||
    curso.codigo?.toLowerCase().includes(busquedaCurso.toLowerCase())
  );

  // Mutations
  const activarMutation = useMutation({
    mutationFn: (data: ActivarCursoPeriodoRequest) =>
      adminCursosApi.activarCursoPeriodo(data),
    onSuccess: () => {
      toast.success('Curso activado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['cursos-activados'] });
      cerrarModalActivar();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al activar curso');
    },
  });

  const desactivarMutation = useMutation({
    mutationFn: (data: { idCurso: number; idPeriodo: number }) =>
      adminCursosApi.desactivarCursoPeriodo(data),
    onSuccess: () => {
      toast.success('Curso desactivado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['cursos-activados'] });
      setModalDesactivarAbierto(false);
      setCursoADesactivar(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al desactivar curso');
    },
  });

  const handleActivar = () => {
    if (!cursoSeleccionado || !periodoSeleccionado) {
      toast.error('Selecciona un curso y un período');
      return;
    }

    activarMutation.mutate({
      idCurso: cursoSeleccionado.id,
      idPeriodo: periodoSeleccionado,
      observaciones: observaciones || undefined,
    });
  };

  const handleDesactivar = () => {
    if (!cursoADesactivar) return;

    desactivarMutation.mutate({
      idCurso: cursoADesactivar.idCurso,
      idPeriodo: cursoADesactivar.idPeriodo,
    });
  };

  const cerrarModalActivar = () => {
    setModalActivarAbierto(false);
    setCursoSeleccionado(null);
    setBusquedaCurso('');
    setObservaciones('');
  };

  const abrirModalActivar = () => {
    if (!periodoSeleccionado) {
      toast.error('Selecciona un período primero');
      return;
    }
    setModalActivarAbierto(true);
  };

  const periodoSeleccionadoObj = periodos.find(p => p.id === periodoSeleccionado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Activación de Cursos por Período
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Activa cursos específicos para que los estudiantes puedan matricularse durante el período académico
          </p>
        </div>
        <button
          onClick={abrirModalActivar}
          disabled={!periodoSeleccionado}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Activar Curso
        </button>
      </div>

      {/* Selector de Período */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4">
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Período Académico
        </label>
        <select
          value={periodoSeleccionado || ''}
          onChange={(e) => setPeriodoSeleccionado(Number(e.target.value))}
          className="w-full sm:w-auto rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        >
          <option value="">Selecciona un período</option>
          {periodos.map((periodo) => (
            <option key={periodo.id} value={periodo.id}>
              {periodo.nombre} {periodo.activo && '(Activo)'}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Cursos Activados */}
      {periodoSeleccionado && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-900">
              Cursos Activados - {periodoSeleccionadoObj?.nombre}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {cursosActivados.length} curso(s) activado(s) para este período
            </p>
          </div>

          {cargandoActivados ? (
            <div className="p-8 text-center text-zinc-500">
              Cargando cursos activados...
            </div>
          ) : cursosActivados.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-500">No hay cursos activados para este período</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200">
              {cursosActivados.map((activacion) => (
                <div
                  key={activacion.id}
                  className="p-6 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <h3 className="font-semibold text-zinc-900">
                            {activacion.nombreCurso}
                          </h3>
                          {activacion.codigoCurso && (
                            <p className="text-sm text-zinc-500 mt-1">
                              Código: {activacion.codigoCurso}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-600">
                        {activacion.nombreUsuarioActivador && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Activado por: {activacion.nombreUsuarioActivador}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(activacion.fechaActivacion).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {activacion.observaciones && (
                        <div className="mt-3 p-3 bg-zinc-50 rounded-lg">
                          <p className="text-sm text-zinc-700">
                            <strong>Observaciones:</strong> {activacion.observaciones}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setCursoADesactivar(activacion);
                        setModalDesactivarAbierto(true);
                      }}
                      className="ml-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      Desactivar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Activar Curso */}
      <Transition appear show={modalActivarAbierto} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cerrarModalActivar}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-xl font-semibold text-zinc-900">
                      Activar Curso para Período
                    </Dialog.Title>
                    <button
                      onClick={cerrarModalActivar}
                      className="rounded-lg p-1 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Período
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-zinc-500" />
                        <span className="text-zinc-900">
                          {periodoSeleccionadoObj?.nombre}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Buscar Curso
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                          type="text"
                          className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          placeholder="Buscar por nombre o código..."
                          value={busquedaCurso}
                          onChange={(e) => setBusquedaCurso(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto border border-zinc-200 rounded-lg">
                      {cargandoCursos ? (
                        <div className="p-4 text-center text-zinc-500">
                          Cargando cursos...
                        </div>
                      ) : cursosFiltrados.length === 0 ? (
                        <div className="p-4 text-center text-zinc-500">
                          No se encontraron cursos disponibles
                        </div>
                      ) : (
                        <div className="divide-y divide-zinc-200">
                          {cursosFiltrados.map((curso) => (
                            <button
                              key={curso.id}
                              onClick={() => setCursoSeleccionado(curso)}
                              className={`w-full p-3 text-left hover:bg-zinc-50 transition-colors ${cursoSeleccionado?.id === curso.id
                                  ? 'bg-zinc-100 border-l-4 border-zinc-900'
                                  : ''
                                }`}
                            >
                              <div className="font-medium text-zinc-900">
                                {curso.nombreCurso}
                              </div>
                              {curso.codigo && (
                                <div className="text-sm text-zinc-500 mt-1">
                                  Código: {curso.codigo} | Ciclo: {curso.ciclo} | Créditos: {curso.creditos}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {cursoSeleccionado && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">
                            Curso seleccionado: {cursoSeleccionado.nombreCurso}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Observaciones (opcional)
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                        rows={3}
                        placeholder="Ej: Curso activado para nivelación de estudiantes..."
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={cerrarModalActivar}
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleActivar}
                      disabled={!cursoSeleccionado || activarMutation.isPending}
                      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {activarMutation.isPending ? 'Activando...' : 'Activar Curso'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal Desactivar Curso */}
      <Transition appear show={modalDesactivarAbierto} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setModalDesactivarAbierto(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-xl font-semibold text-zinc-900">
                      Desactivar Curso
                    </Dialog.Title>
                    <button
                      onClick={() => setModalDesactivarAbierto(false)}
                      className="rounded-lg p-1 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900">
                          ¿Estás seguro de desactivar este curso?
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          {cursoADesactivar?.nombreCurso}
                        </p>
                        <p className="text-xs text-red-600 mt-2">
                          Los estudiantes ya no podrán matricularse en este curso para este período.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setModalDesactivarAbierto(false)}
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDesactivar}
                      disabled={desactivarMutation.isPending}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {desactivarMutation.isPending ? 'Desactivando...' : 'Desactivar'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
