import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  adminCursosApi, 
  PeriodoAdmin, 
  ValidacionCierrePeriodo, 
  ResultadoCierrePeriodo 
} from '../../services/adminCursosApi';
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
  const [validacionData, setValidacionData] = useState<ValidacionCierrePeriodo | null>(null);
  const [resultadoCierre, setResultadoCierre] = useState<ResultadoCierrePeriodo | null>(null);
  const [resultadoApertura, setResultadoApertura] = useState<any | null>(null);
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
      setValidacionData(data);
      setModalValidacionAbierto(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al validar cierre del período');
    },
  });

  const cerrarPeriodoMutation = useMutation({
    mutationFn: adminCursosApi.cerrarPeriodo,
    onSuccess: (data) => {
      setResultadoCierre(data);
      setModalCierreAbierto(false);
      setModalValidacionAbierto(false);
      toast.success(data.mensaje);
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
      setResultadoApertura(data);
      setModalAperturaAbierto(false);
      toast.success(data.mensaje);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando períodos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Períodos</h1>
          </div>
          <p className="text-gray-600">Administra los períodos académicos del sistema</p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Período
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Información importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Solo puede haber un período activo a la vez</li>
              <li>Los estudiantes solo pueden matricularse en el período activo</li>
              <li>No se pueden eliminar períodos con matrículas registradas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabla de períodos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Año
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ciclo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Fin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrículas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {periodos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No hay períodos registrados</p>
                    <button
                      onClick={abrirModalCrear}
                      className="mt-3 text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Crear el primer período
                    </button>
                  </td>
                </tr>
              ) : (
                periodos.map((periodo) => (
                  <tr key={periodo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {periodo.activo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Circle className="w-3 h-3" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {periodo.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{periodo.anio}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {periodo.ciclo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(periodo.fechaInicio).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(periodo.fechaFin).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {periodo.totalMatriculas}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        {periodo.activo && periodo.totalMatriculas > 0 && (
                          <button
                            onClick={() => handleValidarCierre(periodo)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="Cerrar período académico"
                            disabled={validarCierreMutation.isPending}
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                        {!periodo.activo && (
                          <>
                            <button
                              onClick={() => handleAbrirPeriodo(periodo)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                              title="Abrir período y avanzar ciclos"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleActivar(periodo.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Activar período (sin avanzar ciclos)"
                            >
                              <Circle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => abrirModalEditar(periodo)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar período"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {periodo.totalMatriculas === 0 && (
                          <button
                            onClick={() => handleEliminar(periodo)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar período"
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

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {modoEdicion ? 'Editar Período' : 'Crear Nuevo Período'}
                </h2>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Año */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año *
                    </label>
                    <input
                      type="number"
                      value={formData.anio}
                      onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) })}
                      min={2020}
                      max={2100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {/* Ciclo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciclo *
                    </label>
                    <select
                      value={formData.ciclo}
                      onChange={(e) => setFormData({ ...formData, ciclo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="I">I (Semestre Impar)</option>
                      <option value="II">II (Semestre Par)</option>
                    </select>
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Período *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: 2025-I"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGenerarNombre}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Auto-generar
                    </button>
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Fin *
                    </label>
                    <input
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Activo (solo en creación) */}
                {!modoEdicion && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="activo"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="activo" className="text-sm text-gray-700">
                      Marcar como período activo (desactivará otros períodos)
                    </label>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={crearMutation.isPending || editarMutation.isPending}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {crearMutation.isPending || editarMutation.isPending
                      ? 'Guardando...'
                      : modoEdicion
                      ? 'Actualizar Período'
                      : 'Crear Período'}
                  </button>
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Validación de Cierre */}
      {modalValidacionAbierto && validacionData && periodoACerrar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Validación de Cierre - {periodoACerrar.nombre}
                </h2>
                <button
                  onClick={cerrarModalValidacion}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Total Matrículas</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{validacionData.totalMatriculas}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Completas</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{validacionData.matriculasCompletas}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">Incompletas</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{validacionData.matriculasIncompletas}</p>
                </div>
              </div>

              {/* Estado de validación */}
              {validacionData.puedeSerCerrado ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900">El período puede ser cerrado</p>
                      <p className="text-sm text-green-800 mt-1">
                        Todos los estudiantes tienen sus notas completas. Al confirmar se calcularán los promedios finales
                        y se actualizarán los estados de las matrículas (Aprobado/Desaprobado).
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-900">El período NO puede ser cerrado aún</p>
                      <p className="text-sm text-red-800 mt-1">
                        Hay estudiantes con notas incompletas. Complete todas las evaluaciones antes de cerrar el período.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Advertencias */}
              {validacionData.advertencias && validacionData.advertencias.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Advertencias</h3>
                  <div className="space-y-2">
                    {validacionData.advertencias.map((advertencia, index) => (
                      <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                        <p className="text-sm text-yellow-800">{advertencia}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estudiantes con notas incompletas */}
              {validacionData.estudiantesSinNotasCompletas && validacionData.estudiantesSinNotasCompletas.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Estudiantes con Notas Incompletas ({validacionData.estudiantesSinNotasCompletas.length})
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                      {validacionData.estudiantesSinNotasCompletas.map((estudiante) => (
                        <div key={estudiante.idEstudiante} className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{estudiante.nombreEstudiante}</p>
                              <p className="text-sm text-gray-600">Código: {estudiante.codigo}</p>
                            </div>
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                              {estudiante.cursosPendientes.length} curso(s) pendiente(s)
                            </span>
                          </div>
                          <div className="space-y-2 mt-3">
                            {estudiante.cursosPendientes.map((curso) => (
                              <div key={curso.idCurso} className="bg-red-50 p-3 rounded border border-red-200">
                                <p className="text-sm font-medium text-gray-900">{curso.nombreCurso}</p>
                                <p className="text-xs text-red-700 mt-1">{curso.razon}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                {validacionData.puedeSerCerrado && (
                  <button
                    onClick={handleConfirmarCierre}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    Proceder con el Cierre
                  </button>
                )}
                <button
                  onClick={cerrarModalValidacion}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {validacionData.puedeSerCerrado ? 'Cancelar' : 'Cerrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Final de Cierre */}
      {modalCierreAbierto && periodoACerrar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Confirmar Cierre</h2>
                <button
                  onClick={cerrarModalCierre}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-900">¡Acción Irreversible!</p>
                      <p className="text-sm text-red-800 mt-1">
                        Esta acción no se puede deshacer. Se calcularán los promedios finales y se actualizarán
                        los estados de las matrículas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Período a cerrar:</strong> {periodoACerrar.nombre}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Total de matrículas:</strong> {periodoACerrar.totalMatriculas}
                  </p>
                </div>

                <p className="text-sm text-gray-600 mt-4">
                  ¿Está seguro de que desea cerrar este período académico?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCerrarPeriodo}
                  disabled={cerrarPeriodoMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  {cerrarPeriodoMutation.isPending ? 'Cerrando...' : 'Confirmar Cierre'}
                </button>
                <button
                  onClick={cerrarModalCierre}
                  disabled={cerrarPeriodoMutation.isPending}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resultado de Cierre */}
      {resultadoCierre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Período Cerrado Exitosamente</h2>
                <button
                  onClick={cerrarModalResultado}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">{resultadoCierre.mensaje}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-900 mb-1">Total Procesadas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {resultadoCierre.estadisticas.totalMatriculas}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-900 mb-1">Aprobados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {resultadoCierre.estadisticas.aprobados}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-red-900 mb-1">Desaprobados</p>
                  <p className="text-2xl font-bold text-red-600">
                    {resultadoCierre.estadisticas.desaprobados}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Fecha de cierre:</strong>{' '}
                  {new Date(resultadoCierre.estadisticas.fechaCierre).toLocaleString('es-ES')}
                </p>
              </div>

              <button
                onClick={cerrarModalResultado}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Apertura */}
      {modalAperturaAbierto && periodoAAbrir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Abrir Nuevo Período</h2>
                <button
                  onClick={cerrarModalApertura}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-900">Avance Automático de Ciclos</p>
                      <p className="text-sm text-blue-800 mt-1">
                        Los estudiantes que tengan al menos un curso con nota en el período anterior 
                        avanzarán automáticamente al siguiente ciclo.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Período a abrir:</strong> {periodoAAbrir.nombre}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Año:</strong> {periodoAAbrir.anio} - <strong>Ciclo:</strong> {periodoAAbrir.ciclo}
                  </p>
                </div>

                <p className="text-sm text-gray-600">
                  ¿Está seguro de que desea abrir este período y avanzar los ciclos académicos?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmarApertura}
                  disabled={abrirPeriodoMutation.isPending}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {abrirPeriodoMutation.isPending ? 'Abriendo...' : 'Confirmar Apertura'}
                </button>
                <button
                  onClick={cerrarModalApertura}
                  disabled={abrirPeriodoMutation.isPending}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resultado de Apertura */}
      {resultadoApertura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Período Abierto Exitosamente</h2>
                <button
                  onClick={cerrarModalResultadoApertura}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">{resultadoApertura.mensaje}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Período Activo:</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Nombre:</strong> {resultadoApertura.periodoActivo.nombre}</p>
                  <p><strong>Año:</strong> {resultadoApertura.periodoActivo.anio}</p>
                  <p><strong>Ciclo:</strong> {resultadoApertura.periodoActivo.ciclo}</p>
                </div>
              </div>

              {resultadoApertura.resumenCiclos && resultadoApertura.resumenCiclos.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-blue-900 mb-3">Distribución por Ciclos:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {resultadoApertura.resumenCiclos.map((resumen: any, idx: number) => (
                      <div key={idx} className="bg-white p-3 rounded text-center">
                        <p className="text-xs text-gray-600 mb-1">Ciclo {resumen.ciclo}</p>
                        <p className="text-xl font-bold text-blue-600">{resumen.cantidadEstudiantes}</p>
                        <p className="text-xs text-gray-500">estudiantes</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Fecha de apertura:</strong>{' '}
                  {new Date(resultadoApertura.fechaApertura).toLocaleString('es-ES')}
                </p>
              </div>

              <button
                onClick={cerrarModalResultadoApertura}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
