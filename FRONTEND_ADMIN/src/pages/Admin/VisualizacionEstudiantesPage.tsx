import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { adminCursosApi, EstudianteAdmin, EstudianteDetalle } from '../../services/adminCursosApi';
import { estudiantesApi } from '../../services/estudiantesApi';
import { facultadesApi } from '../../services/facultadesApi';
import { escuelasApi } from '../../services/escuelasApi';
import { toast } from 'react-hot-toast';
import {
  Users,
  Search,
  Eye,
  X,
  BookOpen,
  History,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Clock,
  Trash2,
  AlertTriangle,
  CreditCard,
  Mail,
  Edit3,
  Save,
  KeyRound
} from 'lucide-react';

interface EditarEstudianteForm {
  nombres: string;
  apellidos: string;
  email: string;
  numeroDocumento: string;
  ciclo: number;
  estado: string;
  idFacultad: number;
  idEscuela: number;
  password: string;
}

export default function VisualizacionEstudiantesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<number | null>(null);
  const [tabActiva, setTabActiva] = useState<'datos' | 'actuales' | 'historial' | 'estadisticas'>('datos');
  const [estudianteAEliminar, setEstudianteAEliminar] = useState<EstudianteAdmin | null>(null);
  const [estudianteAEditar, setEstudianteAEditar] = useState<EstudianteAdmin | null>(null);
  const [editForm, setEditForm] = useState<EditarEstudianteForm>({
    nombres: '', apellidos: '', email: '', numeroDocumento: '',
    ciclo: 1, estado: 'Activo', idFacultad: 0, idEscuela: 0, password: ''
  });

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

  const { data: facultades = [] } = useQuery({
    queryKey: ['facultades'],
    queryFn: facultadesApi.getAll,
  });

  const { data: escuelas = [] } = useQuery({
    queryKey: ['escuelas'],
    queryFn: escuelasApi.getAll,
  });

  const escuelasFiltradas = escuelas.filter((e: any) =>
    !editForm.idFacultad || e.facultadId === Number(editForm.idFacultad)
  );

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

  // Mutation para actualizar estudiante
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => estudiantesApi.actualizarEstudiante(id, data),
    onSuccess: (data) => {
      toast.success(data.mensaje);
      queryClient.invalidateQueries({ queryKey: ['estudiantes-admin'] });
      queryClient.invalidateQueries({ queryKey: ['estudiante-detalle'] });
      setEstudianteAEditar(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al actualizar estudiante');
    },
  });

  const abrirEditar = (est: EstudianteAdmin) => {
    setEstudianteAEditar(est);
    setEditForm({
      nombres: est.nombres || est.nombreCompleto.split(' ')[0] || '',
      apellidos: est.apellidos || est.nombreCompleto.split(' ').slice(1).join(' ') || '',
      email: est.email,
      numeroDocumento: est.dni,
      ciclo: est.cicloActual,
      estado: est.estado,
      idFacultad: 0,
      idEscuela: 0,
      password: ''
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudianteAEditar) return;

    const data: any = {};
    if (editForm.nombres) data.nombres = editForm.nombres;
    if (editForm.apellidos) data.apellidos = editForm.apellidos;
    if (editForm.email) data.email = editForm.email;
    if (editForm.numeroDocumento) data.numeroDocumento = editForm.numeroDocumento;
    if (editForm.ciclo) data.ciclo = editForm.ciclo;
    if (editForm.estado) data.estado = editForm.estado;
    if (editForm.idFacultad) data.idFacultad = editForm.idFacultad;
    if (editForm.idEscuela) data.idEscuela = editForm.idEscuela;
    if (editForm.password && editForm.password.length >= 6) data.password = editForm.password;

    actualizarMutation.mutate({ id: estudianteAEditar.id, data });
  };

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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
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
                          onClick={() => abrirEditar(estudiante)}
                          className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar estudiante"
                        >
                          <Edit3 className="w-4 h-4" />
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
          <div className="fixed inset-0 bg-black/30" />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel className="w-full max-w-[1200px] overflow-hidden bg-white text-left align-middle rounded-xl border border-zinc-200 shadow-xl">
                {loadingDetalle ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-zinc-800 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">Cargando información...</p>
                  </div>
                ) : estudianteDetalle ? (
                  <>
                    {/* Header Monolith */}
                    <header className="px-6 py-4 border-b border-zinc-200 bg-white">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] font-bold bg-zinc-800 text-white px-2 py-0.5 rounded inline-block w-fit">
                              EST-{new Date().getFullYear()} // ID:{estudianteDetalle.datosPersonales.codigo}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-zinc-900">
                              {estudianteDetalle.datosPersonales.nombreCompleto}
                            </h1>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="hidden md:flex w-14 h-14 rounded-lg border border-zinc-200 items-center justify-center bg-zinc-50">
                              <span className="text-lg font-black tracking-tighter">
                                {estudianteDetalle.datosPersonales.nombreCompleto.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <button onClick={cerrarModal} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-t border-zinc-200 pt-3">
                          <div className="flex flex-col">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-0.5">Facultad</span>
                            <span className="text-sm font-bold leading-tight">{estudianteDetalle.datosPersonales.facultadNombre || 'Sin asignar'}</span>
                          </div>
                          <div className="flex flex-col md:text-right">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-0.5">Escuela</span>
                            <span className="text-sm font-bold leading-tight">{estudianteDetalle.datosPersonales.escuelaNombre || estudianteDetalle.datosPersonales.carrera}</span>
                          </div>
                        </div>
                      </div>
                    </header>

                    {/* Stats Grid Monolith */}
                    <div className="grid grid-cols-4 border-b border-zinc-200 bg-zinc-50/50">
                      {[
                        { label: 'Créditos', value: estudianteDetalle.datosPersonales.creditosAcumulados },
                        { label: 'Semestre', value: String(estudianteDetalle.cursosActuales.filter((c: any) => c.estado === 'Matriculado').reduce((s: number, c: any) => s + c.creditos, 0)).padStart(2, '0') },
                        { label: 'Cursos', value: String(estudianteDetalle.cursosActuales.filter((c: any) => c.estado === 'Matriculado').length).padStart(2, '0') },
                        { label: 'Promedio', value: estudianteDetalle.datosPersonales.promedioAcumulado?.toFixed(1) || '0.0' },
                      ].map((stat, i) => (
                        <div key={i} className={`px-5 py-3 flex flex-col justify-between ${i < 3 ? 'border-r border-zinc-200' : ''} hover:bg-zinc-900 hover:text-white cursor-default group rounded-sm`}>
                          <p className="font-mono text-[9px] uppercase font-bold tracking-widest mb-1">{stat.label}</p>
                          <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Tabs Monolith */}
                    <nav className="border-b border-zinc-200 bg-white overflow-hidden">
                      <ul className="flex w-full">
                        {[
                          { id: 'datos', label: 'Datos Personales' },
                          { id: 'actuales', label: `Cursos (${estudianteDetalle.cursosActuales.length})` },
                          { id: 'historial', label: 'Historial' },
                          { id: 'estadisticas', label: 'Stats' },
                        ].map((tab) => (
                          <li key={tab.id} className="flex-1">
                            <button
                              onClick={() => setTabActiva(tab.id as any)}
                              className={`block w-full py-2.5 px-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest ${tabActiva === tab.id ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-400 hover:text-zinc-700'}`}
                            >
                              {tab.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </nav>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-white p-5 max-h-[40vh]">
                      {/* Tab: Datos Personales */}
                      {tabActiva === 'datos' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* Info Personal */}
                          <div className="flex flex-col rounded-lg border border-zinc-200">
                            <div className="bg-zinc-50 px-4 py-2 flex justify-between items-center rounded-t-lg border-b border-zinc-200">
                              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-600">Información Personal</h3>
                            </div>
                            <div className="p-5 flex-1 bg-white">
                              <div className="grid grid-cols-1 gap-y-4">
                                <div className="group">
                                  <label className="block font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 group-hover:text-black transition-colors">Nombres Completos</label>
                                  <div className="text-base font-bold border-b-[2px] border-zinc-200 pb-1 group-hover:border-black transition-colors uppercase">
                                    {estudianteDetalle.datosPersonales.nombreCompleto}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                  <div className="group">
                                    <label className="block font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 group-hover:text-black transition-colors">DNI</label>
                                    <div className="text-base font-bold border-b-[2px] border-zinc-200 pb-1 group-hover:border-black transition-colors font-mono">
                                      {estudianteDetalle.datosPersonales.dni}
                                    </div>
                                  </div>
                                  <div className="group">
                                    <label className="block font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 group-hover:text-black transition-colors">Código</label>
                                    <div className="text-base font-bold border-b-[2px] border-zinc-200 pb-1 group-hover:border-black transition-colors font-mono">
                                      {estudianteDetalle.datosPersonales.codigo}
                                    </div>
                                  </div>
                                </div>
                                <div className="group">
                                  <label className="block font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 group-hover:text-black transition-colors">Email Institucional</label>
                                  <div className="text-base font-bold border-b-[2px] border-zinc-200 pb-1 group-hover:border-black transition-colors lowercase truncate">
                                    {estudianteDetalle.datosPersonales.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Info Académica */}
                          <div className="flex flex-col rounded-lg border border-zinc-200">
                            <div className="bg-zinc-50 px-4 py-2 flex justify-between items-center rounded-t-lg border-b border-zinc-200">
                              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-600">Información Académica</h3>
                            </div>
                            <div className="p-5 flex-1 bg-white flex flex-col justify-between">
                              <div className="space-y-4">
                                <div className="group">
                                  <label className="block font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 group-hover:text-black transition-colors">Carrera Profesional</label>
                                  <div className="text-base font-bold border-b-[2px] border-zinc-200 pb-1 group-hover:border-black transition-colors uppercase">
                                    {estudianteDetalle.datosPersonales.carrera}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                  <div className="group">
                                    <label className="block font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 group-hover:text-black transition-colors">Ciclo Actual</label>
                                    <div className="text-base font-bold border-b-[2px] border-zinc-200 pb-1 group-hover:border-black transition-colors uppercase">
                                      {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][estudianteDetalle.datosPersonales.cicloActual - 1] || estudianteDetalle.datosPersonales.cicloActual}
                                    </div>
                                  </div>
                                  <div className="group">
                                    <label className="block font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 group-hover:text-black transition-colors">Situación</label>
                                    <div className="text-base font-bold border-b-[2px] border-zinc-200 pb-1 group-hover:border-black transition-colors uppercase flex items-center gap-2">
                                      <span className={`w-2.5 h-2.5 block ${estudianteDetalle.datosPersonales.estado === 'Activo' ? 'bg-black' : 'bg-zinc-300'}`} />
                                      {estudianteDetalle.datosPersonales.estado}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t-[2px] border-dashed border-zinc-300">
                                <div className="flex justify-between items-end">
                                  <div>
                                    <label className="block font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Fecha de Ingreso</label>
                                    <div className="font-mono font-bold text-sm">
                                      {new Date(estudianteDetalle.datosPersonales.fechaIngreso).toLocaleDateString('es-ES')}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="block w-16 h-3 bg-zinc-200" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tab: Cursos Actuales */}
                      {tabActiva === 'actuales' && (
                        <div className="space-y-4">
                          {estudianteDetalle.cursosActuales.length === 0 ? (
                            <div className="text-center py-12 rounded-lg border border-zinc-200 border-dashed">
                              <BookOpen className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                              <p className="font-mono text-sm uppercase tracking-widest text-zinc-500">No tiene cursos matriculados</p>
                            </div>
                          ) : (
                            estudianteDetalle.cursosActuales.map((curso) => (
                              <div key={curso.idMatricula} className="rounded-lg border border-zinc-200 hover:shadow-md">
                                <div className="flex items-center justify-between px-5 py-2.5 bg-zinc-50 rounded-t-lg border-b border-zinc-200">
                                  <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-700 truncate">{curso.nombreCurso}</h3>
                                  <div className="flex gap-2">
                                    {curso.isAutorizado && (
                                      <span className="font-mono text-[10px] font-bold bg-zinc-800 text-white px-2 py-0.5 rounded">DIRIGIDO</span>
                                    )}
                                    <span className="font-mono text-[10px] font-bold bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded">{curso.estado}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 border-b border-zinc-200">
                                  {[
                                    { label: 'Docente', value: curso.docente },
                                    { label: 'Ciclo', value: curso.ciclo },
                                    { label: 'Créditos', value: curso.creditos },
                                    { label: 'Promedio', value: curso.promedioFinal !== null ? curso.promedioFinal.toFixed(2) : '—' },
                                  ].map((item, i) => (
                                    <div key={i} className={`p-4 ${i < 3 ? 'border-r border-zinc-200' : ''}`}>
                                      <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-1">{item.label}</p>
                                      <p className="text-sm font-bold truncate">{item.value}</p>
                                    </div>
                                  ))}
                                </div>
                                {curso.notas.length > 0 && (
                                  <div className="px-6 py-3 bg-zinc-50">
                                    <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Notas</p>
                                    <div className="flex flex-wrap gap-2">
                                      {curso.notas.map((nota, idx) => (
                                        <span key={idx} className="inline-flex items-center px-2 py-1 border border-zinc-200 rounded text-xs font-mono font-bold bg-white">
                                          {nota.tipoEvaluacion}: {nota.notaValor} <span className="text-zinc-400 ml-1">({nota.peso}%)</span>
                                        </span>
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
                            <div className="text-center py-12 rounded-lg border border-zinc-200 border-dashed">
                              <History className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                              <p className="font-mono text-sm uppercase tracking-widest text-zinc-500">Sin historial académico</p>
                            </div>
                          ) : (
                            estudianteDetalle.historialPorPeriodo.map((periodo) => (
                              <div key={periodo.idPeriodo} className="rounded-lg border border-zinc-200">
                                <div className={`px-5 py-3 border-b border-zinc-200 flex items-center justify-between rounded-t-lg ${periodo.esActivo ? 'bg-zinc-800 text-white' : 'bg-zinc-50'}`}>
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest">{periodo.nombrePeriodo}</h3>
                                    {periodo.esActivo && (
                                      <span className="font-mono text-[10px] font-bold bg-white text-zinc-800 px-2 py-0.5 rounded">ACTUAL</span>
                                    )}
                                  </div>
                                  <div className="flex gap-6 font-mono text-xs font-bold uppercase tracking-widest">
                                    <span>{periodo.totalCursos} cursos</span>
                                    <span>{periodo.creditosMatriculados} cred</span>
                                    <span>P: {periodo.promedioGeneral?.toFixed(2) || '0.00'}</span>
                                  </div>
                                </div>
                                <table className="w-full text-sm">
                                  <thead className="bg-zinc-50 border-b border-zinc-200">
                                    <tr>
                                      {['Curso', 'Docente', 'Ciclo', 'Cred', 'Estado', 'Prom', 'Resultado'].map((h) => (
                                        <th key={h} className="px-4 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y-[2px] divide-zinc-100">
                                    {periodo.cursos.map((curso) => (
                                      <tr key={curso.idMatricula} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-4 py-3 font-bold">
                                          {curso.nombreCurso}
                                          {curso.isAutorizado && <span className="ml-2 text-[10px] font-mono bg-zinc-800 text-white px-1 rounded">DIR</span>}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600 text-xs">{curso.docente}</td>
                                        <td className="px-4 py-3 font-mono font-bold">{curso.ciclo}</td>
                                        <td className="px-4 py-3 font-mono font-bold">{curso.creditos}</td>
                                        <td className="px-4 py-3">
                                          <span className="font-mono text-[10px] font-bold uppercase">{curso.estado}</span>
                                        </td>
                                        <td className="px-4 py-3 font-mono font-bold">
                                          {curso.promedioFinal !== null ? curso.promedioFinal.toFixed(2) : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                          {curso.promedioFinal !== null ? (
                                            curso.aprobado ? (
                                              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                                                <CheckCircle className="w-3 h-3" /> APROBADO
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                                <XCircle className="w-3 h-3" /> DESAPROBADO
                                              </span>
                                            )
                                          ) : (
                                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-zinc-400">
                                              <Clock className="w-3 h-3" /> EN CURSO
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* Tab: Estadísticas */}
                      {tabActiva === 'estadisticas' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Matrículas */}
                          <div className="rounded-lg border border-zinc-200">
                            <div className="bg-zinc-50 px-4 py-2 flex justify-between items-center rounded-t-lg border-b border-zinc-200">
                              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Matrículas</h3>
                              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                            </div>
                            <div className="p-4 space-y-3">
                              {[
                                { label: 'Total Histórico', value: estudianteDetalle.estadisticas.totalMatriculas },
                                { label: 'Cursos Activos', value: estudianteDetalle.estadisticas.totalCursosActivos },
                                { label: 'Retirados', value: estudianteDetalle.estadisticas.totalCursosRetirados },
                                { label: 'Dirigidos', value: estudianteDetalle.estadisticas.totalCursosDirigidos },
                              ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center">
                                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-400">{item.label}</span>
                                  <span className="text-lg font-black tracking-tight">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Rendimiento */}
                          <div className="rounded-lg border border-zinc-200">
                            <div className="bg-zinc-50 px-4 py-2 flex justify-between items-center rounded-t-lg border-b border-zinc-200">
                              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Rendimiento</h3>
                              <Award className="w-3.5 h-3.5 text-zinc-400" />
                            </div>
                            <div className="p-4 space-y-3">
                              {[
                                { label: 'Aprobados', value: estudianteDetalle.estadisticas.totalCursosAprobados },
                                { label: 'Desaprobados', value: estudianteDetalle.estadisticas.totalCursosDesaprobados },
                                { label: 'Total Evaluados', value: estudianteDetalle.estadisticas.totalCursosHistorico },
                              ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center">
                                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-400">{item.label}</span>
                                  <span className="text-lg font-black tracking-tight">{item.value}</span>
                                </div>
                              ))}
                              <div className="pt-2 border-t border-dashed border-zinc-200">
                                <div className="flex justify-between items-center">
                                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-400">Tasa Aprobación</span>
                                  <span className="text-lg font-black tracking-tight text-emerald-600">
                                    {estudianteDetalle.estadisticas.porcentajeAprobacion?.toFixed(0) || 0}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Créditos */}
                          <div className="rounded-lg border border-zinc-200">
                            <div className="bg-zinc-50 px-4 py-2 flex justify-between items-center rounded-t-lg border-b border-zinc-200">
                              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Créditos</h3>
                              <CheckCircle className="w-3.5 h-3.5 text-zinc-400" />
                            </div>
                            <div className="p-4 space-y-3">
                              {[
                                { label: 'Acumulados', value: estudianteDetalle.estadisticas.creditosAcumulados },
                                { label: 'Total Cursados', value: estudianteDetalle.estadisticas.creditosTotales },
                                { label: 'Aprobados', value: estudianteDetalle.estadisticas.creditosAprobados },
                                { label: 'Pendientes', value: estudianteDetalle.estadisticas.creditosPendientes },
                              ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center">
                                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-400">{item.label}</span>
                                  <span className="text-lg font-black tracking-tight">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Promedios */}
                          <div className="rounded-lg border border-zinc-200">
                            <div className="bg-zinc-50 px-4 py-2 flex justify-between items-center rounded-t-lg border-b border-zinc-200">
                              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Promedios</h3>
                              <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                            </div>
                            <div className="p-4 space-y-3">
                              {[
                                { label: 'Histórico', value: estudianteDetalle.estadisticas.promedioGeneralHistorico?.toFixed(2) || '0.00' },
                                { label: 'Acumulado', value: estudianteDetalle.estadisticas.promedioAcumulado?.toFixed(2) || '0.00' },
                                { label: 'Semestral', value: estudianteDetalle.estadisticas.promedioSemestral?.toFixed(2) || '0.00' },
                              ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center">
                                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-400">{item.label}</span>
                                  <span className="text-lg font-black tracking-tight">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Monolith */}
                    <footer className="border-t border-zinc-200 bg-zinc-50 text-zinc-500 p-3 flex justify-between items-center px-6 font-mono text-[10px] uppercase font-bold tracking-widest rounded-b-xl">
                      <span>Sistema de Gestión Académica // {estudianteDetalle.datosPersonales.codigo}</span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full block animate-pulse" />
                        Conectado
                      </span>
                    </footer>
                  </>
                ) : null}
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de Edición de Estudiante */}
      <Transition appear show={!!estudianteAEditar} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setEstudianteAEditar(null)}>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-xl transition-all ring-1 ring-black/5">
                  <div className="bg-zinc-900 px-6 py-4 text-white flex items-center justify-between">
                    <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
                      <Edit3 className="w-5 h-5" />
                      Editar Estudiante
                    </Dialog.Title>
                    <button
                      onClick={() => setEstudianteAEditar(null)}
                      className="text-zinc-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                    {/* Info del estudiante */}
                    <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-medium text-sm">
                        {estudianteAEditar?.nombreCompleto.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 text-sm">{estudianteAEditar?.nombreCompleto}</p>
                        <p className="text-xs text-zinc-500 font-mono">{estudianteAEditar?.codigo}</p>
                      </div>
                    </div>

                    {/* Nombres y Apellidos */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Nombres</label>
                        <input
                          type="text"
                          value={editForm.nombres}
                          onChange={(e) => setEditForm({ ...editForm, nombres: e.target.value })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Apellidos</label>
                        <input
                          type="text"
                          value={editForm.apellidos}
                          onChange={(e) => setEditForm({ ...editForm, apellidos: e.target.value })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Email y DNI */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-sm"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">DNI</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <input
                            type="text"
                            value={editForm.numeroDocumento}
                            onChange={(e) => setEditForm({ ...editForm, numeroDocumento: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ciclo y Estado */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Ciclo Actual</label>
                        <select
                          value={editForm.ciclo}
                          onChange={(e) => setEditForm({ ...editForm, ciclo: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-sm appearance-none bg-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                            <option key={c} value={c}>Ciclo {c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Estado</label>
                        <select
                          value={editForm.estado}
                          onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-sm appearance-none bg-white"
                        >
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                          <option value="Suspendido">Suspendido</option>
                          <option value="Egresado">Egresado</option>
                        </select>
                      </div>
                    </div>

                    {/* Facultad y Escuela */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Facultad</label>
                        <select
                          value={editForm.idFacultad}
                          onChange={(e) => setEditForm({ ...editForm, idFacultad: parseInt(e.target.value), idEscuela: 0 })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-sm appearance-none bg-white"
                        >
                          <option value={0}>Sin cambios</option>
                          {facultades.map((f: any) => (
                            <option key={f.id} value={f.id}>{f.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Escuela Profesional</label>
                        <select
                          value={editForm.idEscuela}
                          onChange={(e) => setEditForm({ ...editForm, idEscuela: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-sm appearance-none bg-white"
                        >
                          <option value={0}>Sin cambios</option>
                          {escuelasFiltradas.map((e: any) => (
                            <option key={e.id} value={e.id}>{e.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Contraseña (opcional) */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" />
                        Nueva Contraseña <span className="text-zinc-400 font-normal">(opcional, mín. 6 caracteres)</span>
                      </label>
                      <input
                        type="password"
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        placeholder="Dejar vacío para no cambiar"
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-sm"
                        minLength={6}
                      />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => setEstudianteAEditar(null)}
                        className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                        disabled={actualizarMutation.isPending}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={actualizarMutation.isPending}
                      >
                        {actualizarMutation.isPending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Guardar Cambios
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

