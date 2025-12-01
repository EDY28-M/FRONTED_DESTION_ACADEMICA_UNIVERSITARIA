import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { adminDocentesApi, DocenteAdmin, CrearDocenteConPasswordRequest, AsignarPasswordRequest, ActualizarDocenteRequest } from '../../services/adminDocentesApi';
import { GraduationCap, Plus, Key, Edit, X, Check, AlertCircle, Eye, EyeOff, Trash2, Search, User, Mail, Calendar, Briefcase, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

type ModalType = 'crear' | 'asignarPassword' | 'editar' | 'eliminar' | null;

export default function GestionDocentesPasswordPage() {
  const queryClient = useQueryClient();
  const [modalAbierto, setModalAbierto] = useState<ModalType>(null);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<DocenteAdmin | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CrearDocenteConPasswordRequest>({
    apellidos: '',
    nombres: '',
    profesion: '',
    fechaNacimiento: '',
    correo: '',
    password: '',
  });

  const [passwordData, setPasswordData] = useState<AsignarPasswordRequest>({
    password: '',
  });

  // Query para obtener docentes
  const { data: docentes = [], isLoading, isError, error } = useQuery<DocenteAdmin[]>({
    queryKey: ['docentes-admin'],
    queryFn: adminDocentesApi.getTodosDocentes,
  });

  // Mutation para crear docente
  const crearMutation = useMutation({
    mutationFn: adminDocentesApi.crearDocente,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['docentes-admin'] });
      toast.success(data.mensaje);
      cerrarModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al crear docente');
    },
  });

  // Mutation para asignar contraseña
  const asignarPasswordMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AsignarPasswordRequest }) =>
      adminDocentesApi.asignarPassword(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['docentes-admin'] });
      toast.success(data.mensaje);
      cerrarModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al asignar contraseña');
    },
  });

  // Mutation para actualizar docente
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarDocenteRequest }) =>
      adminDocentesApi.actualizarDocente(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['docentes-admin'] });
      toast.success(data.mensaje);
      cerrarModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al actualizar docente');
    },
  });

  // Mutation para eliminar docente
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => adminDocentesApi.eliminarDocente(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['docentes-admin'] });
      toast.success(data.mensaje);
      cerrarModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al eliminar docente');
    },
  });

  // Filtrar docentes
  const docentesFiltrados = docentes.filter(
    (doc) =>
      doc.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.profesion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirModalCrear = () => {
    setFormData({
      apellidos: '',
      nombres: '',
      profesion: '',
      fechaNacimiento: '',
      correo: '',
      password: '',
    });
    setMostrarPassword(false);
    setModalAbierto('crear');
  };

  const abrirModalAsignarPassword = (docente: DocenteAdmin) => {
    setDocenteSeleccionado(docente);
    setPasswordData({ password: '' });
    setMostrarPassword(false);
    setModalAbierto('asignarPassword');
  };

  const abrirModalEditar = (docente: DocenteAdmin) => {
    setDocenteSeleccionado(docente);
    setFormData({
      apellidos: docente.apellidos,
      nombres: docente.nombres,
      profesion: docente.profesion || '',
      fechaNacimiento: docente.fechaNacimiento 
        ? docente.fechaNacimiento.split('T')[0] 
        : '',
      correo: docente.correo || '',
      password: '',
    });
    setModalAbierto('editar');
  };

  const abrirModalEliminar = (docente: DocenteAdmin) => {
    setDocenteSeleccionado(docente);
    setModalAbierto('eliminar');
  };

  const cerrarModal = () => {
    setModalAbierto(null);
    setDocenteSeleccionado(null);
    setMostrarPassword(false);
  };

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    crearMutation.mutate(formData);
  };

  const handleAsignarPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (docenteSeleccionado) {
      asignarPasswordMutation.mutate({
        id: docenteSeleccionado.id,
        data: passwordData,
      });
    }
  };

  const handleActualizar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (docenteSeleccionado) {
      const { password, ...dataToUpdate } = formData;
      actualizarMutation.mutate({
        id: docenteSeleccionado.id,
        data: dataToUpdate,
      });
    }
  };

  const handleEliminar = () => {
    if (docenteSeleccionado) {
      eliminarMutation.mutate(docenteSeleccionado.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
          <p className="mt-4 text-zinc-600">Cargando docentes...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="text-center bg-white p-8 rounded-xl border border-zinc-200 shadow-sm max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Error al cargar docentes</h2>
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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-zinc-900" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Gestión de Docentes</h1>
          </div>
          <p className="text-zinc-500">
            Administra docentes y sus credenciales de acceso al sistema.
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-sm hover:shadow-md font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Docente
        </button>
      </div>

      {/* Buscador y estadísticas */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o profesión..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
            />
          </div>
          <div className="flex items-center gap-6 px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-100">
            <div className="text-center">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Total</p>
              <p className="text-lg font-bold text-zinc-900">{docentes.length}</p>
            </div>
            <div className="w-px h-8 bg-zinc-200"></div>
            <div className="text-center">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Con Acceso</p>
              <p className="text-lg font-bold text-emerald-600">
                {docentes.filter((d) => d.tienePassword).length}
              </p>
            </div>
            <div className="w-px h-8 bg-zinc-200"></div>
            <div className="text-center">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Sin Acceso</p>
              <p className="text-lg font-bold text-amber-600">
                {docentes.filter((d) => !d.tienePassword).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de docentes */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-100">
            <thead className="bg-zinc-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Docente</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Profesión</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Correo</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Cursos</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
              {docentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <GraduationCap className="w-12 h-12 text-zinc-300 mb-3" />
                      <p className="text-zinc-500 font-medium">No se encontraron docentes</p>
                      <p className="text-zinc-400 text-sm">Intenta con otros términos de búsqueda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                docentesFiltrados.map((docente) => (
                  <tr key={docente.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 font-medium text-sm border border-zinc-200">
                          {docente.nombreCompleto.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{docente.nombreCompleto}</p>
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <Calendar className="w-3 h-3" />
                            {docente.fechaNacimiento 
                              ? new Date(docente.fechaNacimiento).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })
                              : 'Fecha no disponible'
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {docente.profesion || <span className="text-zinc-400 italic">No especificado</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {docente.correo || <span className="text-zinc-400 italic">No registrado</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {docente.totalCursos}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {docente.tienePassword ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Configurada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => abrirModalEditar(docente)}
                          className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Editar información"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirModalAsignarPassword(docente)}
                          className={`p-2 rounded-lg transition-colors ${
                            docente.tienePassword
                              ? 'text-zinc-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={docente.tienePassword ? 'Cambiar contraseña' : 'Asignar contraseña'}
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirModalEliminar(docente)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar docente"
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

      {/* Modal Crear/Editar Docente */}
      <Transition appear show={modalAbierto === 'crear' || modalAbierto === 'editar'} as={Fragment}>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all ring-1 ring-black/5">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-zinc-900 flex items-center gap-2">
                      <div className="p-2 bg-zinc-100 rounded-lg">
                        {modalAbierto === 'crear' ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                      </div>
                      {modalAbierto === 'crear' ? 'Nuevo Docente' : 'Editar Docente'}
                    </Dialog.Title>
                    <button onClick={cerrarModal} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={modalAbierto === 'crear' ? handleCrear : handleActualizar} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Apellidos <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                          <input
                            type="text"
                            required
                            value={formData.apellidos}
                            onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                            placeholder="Ej. Pérez López"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Nombres <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                          <input
                            type="text"
                            required
                            value={formData.nombres}
                            onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                            placeholder="Ej. Juan Carlos"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Profesión</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                          <input
                            type="text"
                            value={formData.profesion}
                            onChange={(e) => setFormData({ ...formData, profesion: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                            placeholder="Ej. Ingeniero de Sistemas"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Fecha de Nacimiento
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                          <input
                            type="date"
                            value={formData.fechaNacimiento}
                            onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Correo Electrónico
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                          <input
                            type="email"
                            value={formData.correo}
                            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                            placeholder="ejemplo@universidad.edu.pe"
                          />
                        </div>
                      </div>

                      {modalAbierto === 'crear' && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Contraseña <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                            <input
                              type={mostrarPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className="w-full pl-10 pr-12 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                              placeholder="Mínimo 6 caracteres"
                            />
                            <button
                              type="button"
                              onClick={() => setMostrarPassword(!mostrarPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                            >
                              {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            La contraseña debe tener al menos 6 caracteres
                          </p>
                        </div>
                      )}
                    </div>

                    {modalAbierto === 'editar' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                          Para cambiar la contraseña, utiliza el botón de llave <Key className="inline w-3 h-3" /> en la lista de docentes.
                        </p>
                      </div>
                    )}

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
                        disabled={crearMutation.isPending || actualizarMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {(crearMutation.isPending || actualizarMutation.isPending) && (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {modalAbierto === 'crear' ? 'Crear Docente' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal Asignar/Cambiar Contraseña */}
      <Transition appear show={modalAbierto === 'asignarPassword'} as={Fragment}>
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
                        <Key className="w-5 h-5" />
                      </div>
                      {docenteSeleccionado?.tienePassword ? 'Cambiar Contraseña' : 'Asignar Contraseña'}
                    </Dialog.Title>
                    <button onClick={cerrarModal} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAsignarPassword} className="space-y-6">
                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Docente</p>
                      <p className="font-medium text-zinc-900">{docenteSeleccionado?.nombreCompleto}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                        Nueva Contraseña <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <input
                          type={mostrarPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={passwordData.password}
                          onChange={(e) => setPasswordData({ password: e.target.value })}
                          className="w-full pl-10 pr-12 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                          placeholder="Mínimo 6 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarPassword(!mostrarPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1.5">
                        Mínimo 6 caracteres
                      </p>
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
                        disabled={asignarPasswordMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {asignarPasswordMutation.isPending && (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        Guardar Contraseña
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal Eliminar */}
      <Transition appear show={modalAbierto === 'eliminar'} as={Fragment}>
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
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-zinc-900">
                        Eliminar Docente
                      </Dialog.Title>
                      <p className="text-sm text-zinc-500">
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 space-y-4">
                    <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
                      <p className="font-medium text-zinc-900">{docenteSeleccionado?.nombreCompleto}</p>
                      <p className="text-sm text-zinc-500 mt-1">{docenteSeleccionado?.profesion}</p>
                    </div>

                    {(docenteSeleccionado?.totalCursos || 0) > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                          Este docente tiene <strong>{docenteSeleccionado?.totalCursos}</strong> curso(s) asignado(s). 
                          Los cursos quedarán sin docente asignado.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
                      onClick={cerrarModal}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed gap-2 items-center"
                      onClick={handleEliminar}
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
    </div>
  );
}

