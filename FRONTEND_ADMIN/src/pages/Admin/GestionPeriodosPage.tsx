import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { 
  adminCursosApi, 
  PeriodoAdmin, 
  ValidacionCierrePeriodo, 
  ResultadoCierrePeriodo 
} from '../../services/adminCursosApi';

// Extend interfaces to fix TypeScript errors
interface ExtendedValidacionCierrePeriodo extends ValidacionCierrePeriodo {
  totalEstudiantes: number;
  estudiantesAprobados: number;
  estudiantesDesaprobados: number;
  advertencias: string[];
  puedeSerCerrado: boolean;
}

interface ExtendedResultadoCierrePeriodo extends ResultadoCierrePeriodo {
  mensaje: string;
  estudiantesPromovidos: number;
  estudiantesRetenidos: number;
  totalEstudiantesProcesados: number;
}
import toast from 'react-hot-toast';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  AlertCircle,
  X,
  Lock,
  AlertTriangle,
  Users,
  Award,
  CheckCircle2,
  Unlock
} from 'lucide-react';

export default function GestionPeriodosPage() {
  const queryClient = useQueryClient();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [periodoEditando, setPeriodoEditando] = useState<PeriodoAdmin | null>(null);
  const [modalValidacionAbierto, setModalValidacionAbierto] = useState(false);
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [modalAperturaAbierto, setModalAperturaAbierto] = useState(false);
  const [periodoACerrar, setPeriodoACerrar] = useState<PeriodoAdmin | null>(null);
  const [periodoAAbrir, setPeriodoAAbrir] = useState<PeriodoAdmin | null>(null);
  const [validacionData, setValidacionData] = useState<ExtendedValidacionCierrePeriodo | null>(null);
  const [resultadoCierre, setResultadoCierre] = useState<ExtendedResultadoCierrePeriodo | null>(null);
  const [resultadoApertura, setResultadoApertura] = useState<{ mensaje: string } | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    anio: new Date().getFullYear(),
    ciclo: 'I',
    fechaInicio: '',
    fechaFin: '',
    activo: false,
  });

  // Queries
  const { data: periodos = [], isLoading } = useQuery<PeriodoAdmin[]>({
    queryKey: ['periodos-admin'],
    queryFn: adminCursosApi.getPeriodos,
  });

  // Mutations
  const crearMutation = useMutation({
    mutationFn: adminCursosApi.crearPeriodo,
    onSuccess: () => {
      toast.success('Período creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['periodos-admin'] });
      queryClient.invalidateQueries({ queryKey: ['periodos'] });
      cerrarModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al crear período');
    },
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      adminCursosApi.editarPeriodo(id, data),
    onSuccess: () => {
      toast.success('Período actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['periodos-admin'] });
      queryClient.invalidateQueries({ queryKey: ['periodos'] });
      cerrarModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al actualizar período');
    },
  });

  const activarMutation = useMutation({
    mutationFn: adminCursosApi.activarPeriodo,
    onSuccess: (data) => {
      toast.success(data.mensaje);
      queryClient.invalidateQueries({ queryKey: ['periodos-admin'] });
      queryClient.invalidateQueries({ queryKey: ['periodos'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al activar período');
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: adminCursosApi.eliminarPeriodo,
    onSuccess: () => {
      toast.success('Período eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['periodos-admin'] });
      queryClient.invalidateQueries({ queryKey: ['periodos'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al eliminar período');
    },
  });

  const validarCierreMutation = useMutation({
    mutationFn: adminCursosApi.validarCierrePeriodo,
    onSuccess: (data) => {
      setValidacionData(data as ExtendedValidacionCierrePeriodo);
      setModalValidacionAbierto(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al validar cierre del período');
    },
  });

  const cerrarPeriodoMutation = useMutation({
    mutationFn: adminCursosApi.cerrarPeriodo,
    onSuccess: (data) => {
      setResultadoCierre(data as ExtendedResultadoCierrePeriodo);
      setModalCierreAbierto(false);
      setModalValidacionAbierto(false);
      toast.success(data.mensaje || 'Período cerrado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['periodos-admin'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes-admin'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al cerrar período');
    },
  });

  const abrirPeriodoMutation = useMutation({
    mutationFn: adminCursosApi.abrirPeriodo,
    onSuccess: (data) => {
      setResultadoApertura(data as { mensaje: string });
      setModalAperturaAbierto(false);
      toast.success(data.mensaje || 'Período abierto exitosamente');
      queryClient.invalidateQueries({ queryKey: ['periodos-admin'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes-admin'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al abrir período');
    },
  });

  // Handlers
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setPeriodoEditando(null);
    setFormData({
      nombre: '',
      anio: new Date().getFullYear(),
      ciclo: 'I',
      fechaInicio: '',
      fechaFin: '',
      activo: false,
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (periodo: PeriodoAdmin) => {
    setModoEdicion(true);
    setPeriodoEditando(periodo);
    setFormData({
      nombre: periodo.nombre,
      anio: periodo.anio,
      ciclo: periodo.ciclo,
      fechaInicio: periodo.fechaInicio.split('T')[0],
      fechaFin: periodo.fechaFin.split('T')[0],
      activo: periodo.activo,
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEdicion(false);
    setPeriodoEditando(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.fechaInicio || !formData.fechaFin) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (new Date(formData.fechaInicio) >= new Date(formData.fechaFin)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    if (modoEdicion && periodoEditando) {
      editarMutation.mutate({
        id: periodoEditando.id,
        data: {
          nombre: formData.nombre,
          anio: formData.anio,
          ciclo: formData.ciclo,
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin,
        },
      });
    } else {
      crearMutation.mutate(formData);
    }
  };

  const handleActivar = (id: number) => {
    if (confirm('¿Activar este período? Los demás períodos se desactivarán.')) {
      activarMutation.mutate(id);
    }
  };

  const handleEliminar = (periodo: PeriodoAdmin) => {
    if (periodo.totalMatriculas > 0) {
      toast.error(`No se puede eliminar: tiene ${periodo.totalMatriculas} matrículas`);
      return;
    }

    if (confirm(`¿Eliminar el período "${periodo.nombre}"?`)) {
      eliminarMutation.mutate(periodo.id);
    }
  };

  const handleGenerarNombre = () => {
    const nombre = `${formData.anio}-${formData.ciclo}`;
    setFormData({ ...formData, nombre });
  };

  const handleValidarCierre = (periodo: PeriodoAdmin) => {
    if (!periodo.activo) {
      toast.error('Solo se puede cerrar el período activo');
      return;
    }
    
    setPeriodoACerrar(periodo);
    validarCierreMutation.mutate(periodo.id);
  };

  const handleConfirmarCierre = () => {
    if (!periodoACerrar) return;
    
    if (validacionData && !validacionData.puedeSerCerrado) {
      toast.error('El período tiene estudiantes sin notas completas. Revise las advertencias.');
      return;
    }

    setModalValidacionAbierto(false);
    setModalCierreAbierto(true);
  };

  const handleCerrarPeriodo = () => {
    if (!periodoACerrar) return;
    cerrarPeriodoMutation.mutate(periodoACerrar.id);
  };

  const cerrarModalValidacion = () => {
    setModalValidacionAbierto(false);
    setPeriodoACerrar(null);
    setValidacionData(null);
  };

  const cerrarModalCierre = () => {
    setModalCierreAbierto(false);
    setPeriodoACerrar(null);
  };

  const cerrarModalResultado = () => {
    setResultadoCierre(null);
    setPeriodoACerrar(null);
  };

  const handleAbrirPeriodo = (periodo: PeriodoAdmin) => {
    if (periodo.activo) {
      toast.error('Este período ya está activo');
      return;
    }
    
    setPeriodoAAbrir(periodo);
    setModalAperturaAbierto(true);
  };

  const handleConfirmarApertura = () => {
    if (!periodoAAbrir) return;
    abrirPeriodoMutation.mutate(periodoAAbrir.id);
  };

  const cerrarModalApertura = () => {
    setModalAperturaAbierto(false);
    setPeriodoAAbrir(null);
  };

  const cerrarModalResultadoApertura = () => {
    setResultadoApertura(null);
    setPeriodoAAbrir(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
          <p className="mt-4 text-zinc-600">Cargando períodos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-zinc-900">Gestión de Períodos</h1>
          </div>
          <p className="text-zinc-500">
            Administra los ciclos académicos, aperturas y cierres de semestre.
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-sm hover:shadow-md font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Período
        </button>
      </div>

      {/* Tabla de Períodos */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-100">
            <thead className="bg-zinc-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Período</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Fechas</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Matrículas</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
              {periodos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Calendar className="w-12 h-12 text-zinc-300 mb-3" />
                      <p className="text-zinc-500 font-medium">No hay períodos registrados</p>
                      <p className="text-zinc-400 text-sm">Crea un nuevo período para comenzar</p>
                    </div>
                  </td>
                </tr>
              ) : (
                periodos.map((periodo) => (
                  <tr key={periodo.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${
                          periodo.activo 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                            : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                        }`}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{periodo.nombre}</p>
                          <p className="text-xs text-zinc-500">Ciclo {periodo.ciclo} - {periodo.anio}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-zinc-400 w-12">Inicio:</span>
                          <span>{new Date(periodo.fechaInicio).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-zinc-400 w-12">Fin:</span>
                          <span>{new Date(periodo.fechaFin).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {periodo.activo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {periodo.totalMatriculas}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!periodo.activo ? (
                          <>
                            <button
                              onClick={() => handleActivar(periodo.id)}
                              className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Activar período"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAbrirPeriodo(periodo)}
                              className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Reabrir período cerrado"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleValidarCierre(periodo)}
                            className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Cerrar período"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => abrirModalEditar(periodo)}
                          className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {periodo.totalMatriculas === 0 && (
                          <button
                            onClick={() => handleEliminar(periodo)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <Transition appear show={modalAbierto} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cerrarModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all ring-1 ring-black/5">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-zinc-900 flex items-center gap-2">
                      <div className="p-2 bg-zinc-100 rounded-lg">
                        {modoEdicion ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </div>
                      {modoEdicion ? 'Editar Período' : 'Nuevo Período'}
                    </Dialog.Title>
                    <button onClick={cerrarModal} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Año</label>
                        <input
                          type="number"
                          value={formData.anio}
                          onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Ciclo</label>
                        <select
                          value={formData.ciclo}
                          onChange={(e) => setFormData({ ...formData, ciclo: e.target.value })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all bg-white"
                        >
                          <option value="I">I</option>
                          <option value="II">II</option>
                          <option value="0">Verano (0)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nombre del Período</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                          placeholder="Ej. 2024-I"
                        />
                        <button
                          type="button"
                          onClick={handleGenerarNombre}
                          className="px-3 py-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200 transition-colors text-sm font-medium"
                        >
                          Generar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Fecha Inicio</label>
                        <input
                          type="date"
                          value={formData.fechaInicio}
                          onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Fecha Fin</label>
                        <input
                          type="date"
                          value={formData.fechaFin}
                          onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={cerrarModal}
                        className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={crearMutation.isPending || editarMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {(crearMutation.isPending || editarMutation.isPending) && (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {modoEdicion ? 'Guardar Cambios' : 'Crear Período'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal Validación Cierre */}
      <Transition appear show={modalValidacionAbierto} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cerrarModalValidacion}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all ring-1 ring-black/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-zinc-900">
                        Validación de Cierre de Período
                      </Dialog.Title>
                      <p className="text-sm text-zinc-500">
                        Verificando requisitos para cerrar el período {periodoACerrar?.nombre}
                      </p>
                    </div>
                  </div>

                  {validacionData && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 text-center">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Total Estudiantes</p>
                          <p className="text-2xl font-bold text-zinc-900 mt-1">{validacionData.totalEstudiantes}</p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-center">
                          <p className="text-xs text-emerald-600 uppercase tracking-wider font-medium">Aprobados</p>
                          <p className="text-2xl font-bold text-emerald-700 mt-1">{validacionData.estudiantesAprobados}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                          <p className="text-xs text-red-600 uppercase tracking-wider font-medium">Desaprobados</p>
                          <p className="text-2xl font-bold text-red-700 mt-1">{validacionData.estudiantesDesaprobados}</p>
                        </div>
                      </div>

                      {validacionData.advertencias.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-amber-900 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Advertencias ({validacionData.advertencias.length})
                          </h4>
                          <ul className="list-disc list-inside text-sm text-amber-800 space-y-1 max-h-40 overflow-y-auto">
                            {validacionData.advertencias.map((adv, i) => (
                              <li key={i}>{adv}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={cerrarModalValidacion}
                          className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmarCierre}
                          disabled={!validacionData.puedeSerCerrado}
                          className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          Confirmar Cierre
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal Confirmación Cierre */}
      <Transition appear show={modalCierreAbierto} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cerrarModalCierre}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all ring-1 ring-black/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-zinc-900">
                        Cerrar Período Definitivamente
                      </Dialog.Title>
                      <p className="text-sm text-zinc-500">
                        Esta acción calculará promedios finales y orden de mérito.
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800 font-medium">
                      ¡Atención! Esta acción es irreversible.
                    </p>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                      <li>Se cerrarán todas las actas de notas</li>
                      <li>Se calcularán los promedios ponderados</li>
                      <li>Se generará el orden de mérito</li>
                      <li>Se determinará la promoción de ciclo</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={cerrarModalCierre}
                      className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleCerrarPeriodo}
                      disabled={cerrarPeriodoMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {cerrarPeriodoMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Sí, Cerrar Período
                        </>
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal Resultado Cierre */}
      <Transition appear show={!!resultadoCierre} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cerrarModalResultado}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all ring-1 ring-black/5">
                  <div className="text-center mb-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                      <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <Dialog.Title as="h3" className="text-xl font-bold text-zinc-900">
                      Período Cerrado Exitosamente
                    </Dialog.Title>
                    <p className="text-sm text-zinc-500 mt-2">
                      El proceso de cierre ha finalizado correctamente.
                    </p>
                  </div>

                  {resultadoCierre && (
                    <div className="space-y-4 mb-6">
                      <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
                        <h4 className="font-medium text-zinc-900 mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Resumen de Resultados
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Promovidos:</span>
                            <span className="font-medium text-emerald-600">{resultadoCierre.estudiantesPromovidos}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Retenidos:</span>
                            <span className="font-medium text-red-600">{resultadoCierre.estudiantesRetenidos}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Total Procesados:</span>
                            <span className="font-medium text-zinc-900">{resultadoCierre.totalEstudiantesProcesados}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={cerrarModalResultado}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      Entendido
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal Apertura */}
      <Transition appear show={modalAperturaAbierto} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cerrarModalApertura}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all ring-1 ring-black/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Unlock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-zinc-900">
                        Reabrir Período
                      </Dialog.Title>
                      <p className="text-sm text-zinc-500">
                        ¿Estás seguro de reabrir el período {periodoAAbrir?.nombre}?
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      Al reabrir el período, se permitirá nuevamente la modificación de notas y matrículas.
                      El orden de mérito actual será invalidado hasta el próximo cierre.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={cerrarModalApertura}
                      className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmarApertura}
                      disabled={abrirPeriodoMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {abrirPeriodoMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          Sí, Reabrir
                        </>
                      )}
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

