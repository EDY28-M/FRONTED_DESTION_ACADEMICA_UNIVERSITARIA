import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminDocentesApi, DocenteAdmin, CrearDocenteConPasswordRequest, AsignarPasswordRequest, ActualizarDocenteRequest } from '../../services/adminDocentesApi';
import { GraduationCap, Plus, Key, Edit, X, Check, AlertCircle, Eye, EyeOff, Trash2 } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando docentes...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-8 rounded-lg border border-red-200">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error al cargar docentes</h2>
          <p className="text-red-600">
            {error instanceof Error ? error.message : 'No se pudo conectar con el servidor'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-8 h-8 text-primary-700" />
              <h1 className="text-3xl font-bold text-gray-800">Gestión de Docentes</h1>
            </div>
            <p className="text-gray-600">
              Administra docentes y sus credenciales de acceso
            </p>
          </div>
          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Docente
          </button>
        </div>
      </div>

      {/* Buscador y estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, correo o profesión..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-500">Total</p>
              <p className="font-bold text-gray-900">{docentes.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Con Contraseña</p>
              <p className="font-bold text-green-600">
                {docentes.filter((d) => d.tienePassword).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Sin Contraseña</p>
              <p className="font-bold text-red-600">
                {docentes.filter((d) => !d.tienePassword).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de docentes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Docente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profesión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cursos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Contraseña
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {docentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No se encontraron docentes</p>
                  </td>
                </tr>
              ) : (
                docentesFiltrados.map((docente) => (
                  <tr key={docente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-primary-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{docente.nombreCompleto}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
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
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {docente.profesion || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {docente.correo || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {docente.totalCursos}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {docente.tienePassword ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="w-3 h-3" />
                          Configurada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3" />
                          Sin contraseña
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirModalEditar(docente)}
                          className="p-1.5 text-primary-700 hover:bg-primary-50 rounded transition-colors"
                          title="Editar información"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirModalAsignarPassword(docente)}
                          className={`p-1.5 rounded transition-colors ${
                            docente.tienePassword
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={docente.tienePassword ? 'Cambiar contraseña' : 'Asignar contraseña'}
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirModalEliminar(docente)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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

      {/* Modal Crear Docente */}
      {modalAbierto === 'crear' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-primary-700 px-6 py-4 text-white flex items-center justify-between">
              <h2 className="text-xl font-bold">Crear Nuevo Docente</h2>
              <button onClick={cerrarModal} className="text-white hover:bg-primary-800 p-1 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCrear} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profesión</label>
                  <input
                    type="text"
                    value={formData.profesion}
                    onChange={(e) => setFormData({ ...formData, profesion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 pr-10"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.password.length}/6 caracteres mínimos
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={crearMutation.isPending}
                  className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors disabled:opacity-50"
                >
                  {crearMutation.isPending ? 'Creando...' : 'Crear Docente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asignar/Cambiar Contraseña */}
      {modalAbierto === 'asignarPassword' && docenteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-orange-600 px-6 py-4 text-white flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {docenteSeleccionado.tienePassword ? 'Cambiar' : 'Asignar'} Contraseña
              </h2>
              <button onClick={cerrarModal} className="text-white hover:bg-orange-700 p-1 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAsignarPassword} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600">Docente:</p>
                <p className="font-semibold text-gray-900">{docenteSeleccionado.nombreCompleto}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {passwordData.password.length}/6 caracteres mínimos
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={asignarPasswordMutation.isPending}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {asignarPasswordMutation.isPending ? 'Guardando...' : 'Guardar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Docente */}
      {modalAbierto === 'editar' && docenteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-green-600 px-6 py-4 text-white flex items-center justify-between">
              <h2 className="text-xl font-bold">Editar Información del Docente</h2>
              <button onClick={cerrarModal} className="text-white hover:bg-green-700 p-1 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleActualizar} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profesión</label>
                  <input
                    type="text"
                    value={formData.profesion}
                    onChange={(e) => setFormData({ ...formData, profesion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-800">
                  <strong>Nota:</strong> Para cambiar la contraseña, usa el botón de contraseña{' '}
                  <Key className="inline w-4 h-4" /> en la tabla.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actualizarMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {actualizarMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalAbierto === 'eliminar' && docenteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Eliminar Docente</h2>
              </div>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro que deseas eliminar al docente{' '}
                <strong className="text-gray-900">{docenteSeleccionado.nombreCompleto}</strong>?
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  <strong>¡Atención!</strong> Esta acción no se puede deshacer. El docente será eliminado 
                  permanentemente del sistema.
                </p>
              </div>

              {docenteSeleccionado.totalCursos > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Este docente tiene{' '}
                    <strong>{docenteSeleccionado.totalCursos}</strong> curso(s) asignado(s). 
                    Los cursos quedarán sin docente asignado (se desasignarán automáticamente).
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEliminar}
                  disabled={eliminarMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {eliminarMutation.isPending ? 'Eliminando...' : 'Sí, Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

