import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { adminCursosApi, EstudianteAdmin, EstudianteDetalle } from '../../services/adminCursosApi';
import { estudiantesApi } from '../../services/estudiantesApi';
import { toast } from 'react-hot-toast';
import {
  Users,
  Search,
  Eye,
  X,
  User,
  BookOpen,
  History,
  BarChart3,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Calendar,
  Clock,
  Trash2,
  AlertTriangle,
  GraduationCap,
  Mail,
  CreditCard,
  MoreHorizontal,
  FileText
} from 'lucide-react';

export default function VisualizacionEstudiantesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<number | null>(null);
  const [tabActiva, setTabActiva] = useState<'datos' | 'actuales' | 'historial' | 'estadisticas'>('datos');
  const [estudianteAEliminar, setEstudianteAEliminar] = useState<EstudianteAdmin | null>(null);

  const queryClient = useQueryClient();

  // Queries
  const { data: estudiantes = [], isLoading, isError, error } = useQuery<EstudianteAdmin[]>({
    queryKey: ['estudiantes-admin'],
    queryFn: adminCursosApi.getTodosEstudiantes,
    retry: 1,
  });

  const { data: estudianteDetalle, isLoading: loadingDetalle } = useQuery<EstudianteDetalle>({
    queryKey: ['estudiante-detalle', estudianteSeleccionado],
    queryFn: () => adminCursosApi.getEstudianteDetalle(estudianteSeleccionado!),
    enabled: !!estudianteSeleccionado,
    retry: 1,
  });

  // Mutation para eliminar estudiante
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => estudiantesApi.eliminarEstudiante(id),
    onSuccess: (data) => {
      toast.success(data.mensaje);
      queryClient.invalidateQueries({ queryKey: ['estudiantes-admin'] });
      setEstudianteAEliminar(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al eliminar estudiante');
    },
  });

  // Filtrar estudiantes
  const estudiantesFiltrados = estudiantes.filter(
    (est) =>
      est.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.dni.includes(busqueda)
  );

  const cerrarModal = () => {
    setEstudianteSeleccionado(null);
    setTabActiva('datos');
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="text-center bg-white p-8 rounded-xl border border-zinc-200 shadow-sm max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Error al cargar estudiantes</h2>
          <p className="text-zinc-600 mb-6 text-sm">
            {error instanceof Error ? error.message : 'No se pudo conectar con el servidor'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Visualización de Estudiantes
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gestión y consulta detallada de todos los estudiantes registrados en el sistema.
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -tranzinc-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, código, email o DNI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-zinc-500">
            Mostrando <span className="font-medium text-zinc-900">{estudiantesFiltrados.length}</span> estudiantes
          </p>
        </div>
      </div>

      {/* Tabla de estudiantes */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-100">
            <thead className="bg-zinc-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Estudiante</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Académico</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Progreso</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
              {estudiantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-zinc-300 mb-3" />
                      <p className="text-zinc-500 font-medium">No se encontraron estudiantes</p>
                      <p className="text-zinc-400 text-sm">Intenta con otros términos de búsqueda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                estudiantesFiltrados.map((estudiante) => (
                  <tr key={estudiante.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-medium text-sm">
                          {estudiante.nombreCompleto.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-zinc-900">{estudiante.nombreCompleto}</div>
                          <div className="text-xs text-zinc-500 font-mono">{estudiante.codigo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          {estudiante.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                          <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                          {estudiante.dni}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                          Ciclo {estudiante.cicloActual}
                        </span>
                        <div className="text-xs text-zinc-500">
                          {estudiante.cursosMatriculadosActual} cursos activos
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-500">Promedio</span>
                          <span className="font-medium text-zinc-900">
                            {estudiante.promedioAcumulado?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-zinc-900 rounded-full"
                            style={{ width: `${Math.min(((estudiante.promedioAcumulado || 0) / 20) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {estudiante.creditosAcumulados} créditos
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${estudiante.estado === 'Activo'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${estudiante.estado === 'Activo' ? 'bg-emerald-500' : 'bg-red-500'
                          }`} />
                        {estudiante.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEstudianteSeleccionado(estudiante.id)}
                          className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEstudianteAEliminar(estudiante)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar estudiante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <Transition appear show={!!estudianteAEliminar} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setEstudianteAEliminar(null)}>
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
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-zinc-900">
                        Eliminar Estudiante
                      </Dialog.Title>
                      <p className="text-sm text-zinc-500">
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 mb-4">
                      <p className="font-medium text-zinc-900">{estudianteAEliminar?.nombreCompleto}</p>
                      <p className="text-sm text-zinc-500 font-mono mt-1">{estudianteAEliminar?.codigo}</p>
                    </div>

                    <div className="text-sm text-zinc-600 space-y-2">
                      <p>Se eliminará permanentemente:</p>
                      <ul className="list-disc pl-5 space-y-1 text-zinc-500">
                        <li>Historial de matrículas y notas</li>
                        <li>Registros de asistencia</li>
                        <li>Cuenta de usuario y acceso</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
                      onClick={() => setEstudianteAEliminar(null)}
                      disabled={eliminarMutation.isPending}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed gap-2 items-center"
                      onClick={() => estudianteAEliminar && eliminarMutation.mutate(estudianteAEliminar.id)}
                      disabled={eliminarMutation.isPending}
                    >
                      {eliminarMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Eliminar
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

      {/* Modal de Detalle */}
      <Transition appear show={!!estudianteSeleccionado} as={Fragment}>
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
                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-2xl transition-all ring-1 ring-black/5">
                  {loadingDetalle ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-zinc-500 text-sm">Cargando información...</p>
                    </div>
                  ) : estudianteDetalle ? (
                    <>
                      {/* Header del Modal */}
                      <div className="bg-zinc-900 px-8 py-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <GraduationCap className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 flex items-start justify-between">
                          <div className="flex items-center gap-5">
                            <div className="h-16 w-16 rounded-xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white backdrop-blur-sm border border-white/20">
                              {estudianteDetalle.datosPersonales.nombreCompleto.charAt(0)}
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-white">
                                {estudianteDetalle.datosPersonales.nombreCompleto}
                              </h2>
                              <div className="flex items-center gap-3 mt-1 text-zinc-300">
                                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-sm">
                                  {estudianteDetalle.datosPersonales.codigo}
                                </span>
                                <span>•</span>
                                <span>{estudianteDetalle.datosPersonales.carrera}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={cerrarModal}
                            className="text-zinc-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 divide-x divide-zinc-100 border-b border-zinc-100 bg-white">
                        <div className="p-4 text-center">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Créditos</p>
                          <p className="text-2xl font-bold text-zinc-900">{estudianteDetalle.datosPersonales.creditosAcumulados}</p>
                        </div>
                        <div className="p-4 text-center">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Semestre Actual</p>
                          <p className="text-2xl font-bold text-zinc-900">
                            {estudianteDetalle.cursosActuales
                              .filter(c => c.estado === 'Matriculado')
                              .reduce((sum, c) => sum + c.creditos, 0)}
                          </p>
                        </div>
                        <div className="p-4 text-center">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Cursos Activos</p>
                          <p className="text-2xl font-bold text-zinc-900">
                            {estudianteDetalle.cursosActuales.filter(c => c.estado === 'Matriculado').length}
                          </p>
                        </div>
                        <div className="p-4 text-center">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Promedio</p>
                          <p className="text-2xl font-bold text-zinc-900">
                            {estudianteDetalle.datosPersonales.promedioAcumulado?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="border-b border-zinc-200 bg-zinc-50/50 px-8">
                        <div className="flex gap-6">
                          {[
                            { id: 'datos', label: 'Datos Personales', icon: User },
                            { id: 'actuales', label: `Cursos Actuales (${estudianteDetalle.cursosActuales.length})`, icon: BookOpen },
                            { id: 'historial', label: 'Historial', icon: History },
                            { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setTabActiva(tab.id as any)}
                              className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${tabActiva === tab.id
                                  ? 'border-zinc-900 text-zinc-900'
                                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                                }`}
                            >
                              <tab.icon className="w-4 h-4" />
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-8 bg-zinc-50/30 min-h-[400px]">
                        {/* Tab: Datos Personales */}
                        {tabActiva === 'datos' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Información Personal
                              </h3>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-medium text-zinc-500">Nombres</label>
                                    <p className="text-sm text-zinc-900 font-medium mt-1">{estudianteDetalle.datosPersonales.nombres}</p>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-zinc-500">Apellidos</label>
                                    <p className="text-sm text-zinc-900 font-medium mt-1">{estudianteDetalle.datosPersonales.apellidos}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-zinc-500">DNI</label>
                                  <p className="text-sm text-zinc-900 font-medium mt-1">{estudianteDetalle.datosPersonales.dni}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-zinc-500">Email</label>
                                  <p className="text-sm text-zinc-900 font-medium mt-1 flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                                    {estudianteDetalle.datosPersonales.email}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                Información Académica
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-xs font-medium text-zinc-500">Carrera</label>
                                  <p className="text-sm text-zinc-900 font-medium mt-1">{estudianteDetalle.datosPersonales.carrera}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-medium text-zinc-500">Ciclo Actual</label>
                                    <p className="text-sm text-zinc-900 font-medium mt-1">Ciclo {estudianteDetalle.datosPersonales.cicloActual}</p>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-zinc-500">Estado</label>
                                    <div className="mt-1">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${estudianteDetalle.datosPersonales.estado === 'Activo'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : 'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                        {estudianteDetalle.datosPersonales.estado}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-zinc-500">Fecha de Ingreso</label>
                                  <p className="text-sm text-zinc-900 font-medium mt-1 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                    {new Date(estudianteDetalle.datosPersonales.fechaIngreso).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab: Cursos Actuales */}
                        {tabActiva === 'actuales' && (
                          <div className="space-y-4">
                            {estudianteDetalle.cursosActuales.length === 0 ? (
                              <div className="text-center py-12 bg-white rounded-xl border border-zinc-200 border-dashed">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                                <p className="text-zinc-500">No tiene cursos matriculados actualmente</p>
                              </div>
                            ) : (
                              estudianteDetalle.cursosActuales.map((curso) => (
                                <div key={curso.idMatricula} className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <h3 className="text-base font-semibold text-zinc-900">{curso.nombreCurso}</h3>
                                      <p className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
                                        <User className="w-3.5 h-3.5" />
                                        {curso.docente}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      {curso.isAutorizado && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                          Dirigido
                                        </span>
                                      )}
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                                        {curso.estado}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-4 gap-4 py-4 border-t border-zinc-100">
                                    <div>
                                      <span className="text-xs text-zinc-500 block mb-1">Ciclo</span>
                                      <span className="text-sm font-medium text-zinc-900">{curso.ciclo}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-zinc-500 block mb-1">Créditos</span>
                                      <span className="text-sm font-medium text-zinc-900">{curso.creditos}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-zinc-500 block mb-1">Horas/Sem</span>
                                      <span className="text-sm font-medium text-zinc-900">{curso.horasSemanal}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-zinc-500 block mb-1">Promedio</span>
                                      <span className={`text-sm font-bold ${(curso.promedioFinal || 0) >= 10.5 ? 'text-emerald-600' : 'text-zinc-900'
                                        }`}>
                                        {curso.promedioFinal !== null ? curso.promedioFinal.toFixed(2) : '-'}
                                      </span>
                                    </div>
                                  </div>

                                  {curso.notas.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-zinc-100 bg-zinc-50/50 -mx-5 -mb-5 px-5 py-3 rounded-b-xl">
                                      <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Notas Registradas</p>
                                      <div className="flex flex-wrap gap-2">
                                        {curso.notas.map((nota, idx) => (
                                          <div key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs shadow-sm">
                                            <span className="font-medium text-zinc-700">{nota.tipoEvaluacion}:</span>
                                            <span className="ml-1.5 font-bold text-zinc-900">{nota.notaValor}</span>
                                            <span className="ml-1.5 text-zinc-400">({nota.peso}%)</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* Tab: Historial */}
                        {tabActiva === 'historial' && (
                          <div className="space-y-6">
                            {estudianteDetalle.historialPorPeriodo.length === 0 ? (
                              <div className="text-center py-12 bg-white rounded-xl border border-zinc-200 border-dashed">
                                <History className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                                <p className="text-zinc-500">No hay historial académico registrado</p>
                              </div>
                            ) : (
                              estudianteDetalle.historialPorPeriodo.map((periodo) => (
                                <div key={periodo.idPeriodo} className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                                  {/* Header del período */}
                                  <div className={`px-6 py-4 border-b border-zinc-200 ${periodo.esActivo ? 'bg-zinc-50' : 'bg-white'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${periodo.esActivo ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                          <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                          <h3 className="font-semibold text-zinc-900">{periodo.nombrePeriodo}</h3>
                                          <p className="text-sm text-zinc-500">
                                            Año {periodo.anio} - Ciclo {periodo.cicloAcademico}
                                          </p>
                                        </div>
                                        {periodo.esActivo && (
                                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            Actual
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex gap-8 text-sm">
                                        <div className="text-center">
                                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Cursos</p>
                                          <p className="font-semibold text-zinc-900">{periodo.totalCursos}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Créditos</p>
                                          <p className="font-semibold text-zinc-900">{periodo.creditosMatriculados}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Promedio</p>
                                          <p className={`font-bold ${(periodo.promedioGeneral || 0) >= 10.5 ? 'text-emerald-600' : 'text-zinc-900'
                                            }`}>
                                            {periodo.promedioGeneral?.toFixed(2) || '0.00'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Lista de cursos */}
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                      <thead className="bg-zinc-50/50 border-b border-zinc-100">
                                        <tr>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Curso</th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Docente</th>
                                          <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Ciclo</th>
                                          <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Créditos</th>
                                          <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Estado</th>
                                          <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Promedio</th>
                                          <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Resultado</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-zinc-100">
                                        {periodo.cursos.map((curso) => (
                                          <tr key={curso.idMatricula} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-3">
                                              <div>
                                                <p className="font-medium text-zinc-900">{curso.nombreCurso}</p>
                                                {curso.isAutorizado && (
                                                  <span className="text-xs text-purple-600 font-medium">Dirigido</span>
                                                )}
                                              </div>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-600">{curso.docente}</td>
                                            <td className="px-6 py-3 text-center text-zinc-900">{curso.ciclo}</td>
                                            <td className="px-6 py-3 text-center text-zinc-900">{curso.creditos}</td>
                                            <td className="px-6 py-3 text-center">
                                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${curso.estado === 'Matriculado'
                                                  ? 'bg-zinc-100 text-zinc-800'
                                                  : 'bg-zinc-50 text-zinc-500'
                                                }`}>
                                                {curso.estado}
                                              </span>
                                            </td>
                                            <td className="px-6 py-3 text-center font-medium text-zinc-900">
                                              {curso.promedioFinal !== null ? curso.promedioFinal.toFixed(2) : '-'}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                              {curso.promedioFinal !== null ? (
                                                curso.aprobado ? (
                                                  <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                    <CheckCircle className="w-3 h-3" /> Aprobado
                                                  </span>
                                                ) : (
                                                  <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                                    <XCircle className="w-3 h-3" /> Desaprobado
                                                  </span>
                                                )
                                              ) : (
                                                <span className="inline-flex items-center gap-1 text-zinc-400 text-xs font-medium">
                                                  <Clock className="w-3 h-3" /> En curso
                                                </span>
                                              )}
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

                        {/* Tab: Estadísticas */}
                        {tabActiva === 'estadisticas' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-zinc-100 rounded-lg">
                                  <BookOpen className="w-5 h-5 text-zinc-900" />
                                </div>
                                <h3 className="font-semibold text-zinc-900">Matrículas</h3>
                              </div>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-500">Total Histórico</span>
                                  <span className="font-semibold text-zinc-900">{estudianteDetalle.estadisticas.totalMatriculas}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-500">Activos</span>
                                  <span className="font-semibold text-emerald-600">{estudianteDetalle.estadisticas.totalCursosActivos}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-500">Retirados</span>
                                  <span className="font-semibold text-zinc-500">{estudianteDetalle.estadisticas.totalCursosRetirados}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-zinc-100">
                                  <span className="text-zinc-500">Dirigidos</span>
                                  <span className="font-semibold text-purple-600">{estudianteDetalle.estadisticas.totalCursosDirigidos}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                  <Award className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="font-semibold text-zinc-900">Rendimiento</h3>
                              </div>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-500">Aprobados</span>
                                  <span className="font-semibold text-emerald-600">{estudianteDetalle.estadisticas.totalCursosAprobados}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-500">Desaprobados</span>
                                  <span className="font-semibold text-red-600">{estudianteDetalle.estadisticas.totalCursosDesaprobados}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-zinc-100">
                                  <span className="text-zinc-500">Tasa Aprobación</span>
                                  <span className="font-bold text-zinc-900">
                                    {estudianteDetalle.estadisticas.totalCursosAprobados + estudianteDetalle.estadisticas.totalCursosDesaprobados > 0
                                      ? ((estudianteDetalle.estadisticas.totalCursosAprobados /
                                        (estudianteDetalle.estadisticas.totalCursosAprobados + estudianteDetalle.estadisticas.totalCursosDesaprobados)) * 100).toFixed(1)
                                      : 0}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-zinc-100 rounded-lg">
                                  <TrendingUp className="w-5 h-5 text-zinc-900" />
                                </div>
                                <h3 className="font-semibold text-zinc-900">Promedios</h3>
                              </div>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-500">Histórico</span>
                                  <span className="font-semibold text-zinc-900">
                                    {estudianteDetalle.estadisticas.promedioGeneralHistorico?.toFixed(2) || '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-500">Acumulado</span>
                                  <span className="font-semibold text-zinc-900">
                                    {estudianteDetalle.estadisticas.promedioAcumulado?.toFixed(2) || '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-zinc-100">
                                  <span className="text-zinc-500">Créditos Totales</span>
                                  <span className="font-bold text-zinc-900">
                                    {estudianteDetalle.estadisticas.creditosAcumulados}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

