import { useState, Fragment, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { adminDocentesApi, DocenteAdmin, CrearDocenteConPasswordRequest, AsignarPasswordRequest, ActualizarDocenteRequest } from '../../services/adminDocentesApi';
import { facultadesApi } from '../../services/facultadesApi';
import { escuelasApi } from '../../services/escuelasApi';
import { GraduationCap, Plus, Key, Edit, X, AlertCircle, Eye, EyeOff, Trash2, Search, User, Mail, Calendar, Briefcase, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

type ModalType = 'crear' | 'asignarPassword' | 'editar' | 'eliminar' | null;

export default function GestionDocentesPasswordPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAbierto, setModalAbierto] = useState<ModalType>(null);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<DocenteAdmin | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [selectedFacultadId, setSelectedFacultadId] = useState<number | ''>('');
  const [selectedEscuelaId, setSelectedEscuelaId] = useState<number | ''>('');
  // Evita que al cerrar el modal el foco devuelto al botón dispare un click y reabra el modal
  const ignorarSiguienteAperturaRef = useRef(false);

  // Form states
  const [formData, setFormData] = useState<CrearDocenteConPasswordRequest>({
    apellidos: '',
    nombres: '',
    profesion: '',
    fechaNacimiento: '',
    correo: '',
    emailUsuario: '',
    password: '',
    idFacultad: undefined,
    idEscuela: undefined,
  });

  const [passwordData, setPasswordData] = useState<AsignarPasswordRequest>({
    password: '',
  });

  // Query para obtener docentes
  const { data: docentes = [], isLoading, isError, error } = useQuery<DocenteAdmin[]>({
    queryKey: ['docentes-admin'],
    queryFn: adminDocentesApi.getTodosDocentes,
  });

  // Query para obtener facultades
  const { data: facultades = [] } = useQuery({
    queryKey: ['facultades'],
    queryFn: facultadesApi.getAll,
  });

  // Query para obtener escuelas
  const { data: escuelas = [] } = useQuery({
    queryKey: ['escuelas'],
    queryFn: escuelasApi.getAll,
  });

  // Filtrar escuelas por facultad seleccionada
  const escuelasFiltradas = useMemo(() => {
    return escuelas.filter(escuela =>
      !selectedFacultadId || escuela.facultadId === selectedFacultadId
    );
  }, [escuelas, selectedFacultadId]);

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

  // Función para obtener el nombre de la facultad por ID
  const getFacultadNombre = (facultadId?: number | null): string => {
    if (!facultadId || !facultades) return ''
    const facultad = facultades.find(f => f.id === facultadId)
    return facultad?.nombre || ''
  }

  // Función para obtener el nombre de la escuela por ID
  const getEscuelaNombre = (escuelaId?: number | null): string => {
    if (!escuelaId || !escuelas) return ''
    const escuela = escuelas.find(e => e.id === escuelaId)
    return escuela?.nombre || ''
  }

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusqueda('')
    setSelectedFacultadId('')
    setSelectedEscuelaId('')
  }

  // Verificar si hay filtros activos
  const hayFiltrosActivos = useMemo(() => {
    return busqueda !== '' || selectedFacultadId !== '' || selectedEscuelaId !== ''
  }, [busqueda, selectedFacultadId, selectedEscuelaId])

  // Filtrar docentes
  const docentesFiltrados = docentes.filter((doc) => {
    const facultadNombre = doc.facultadNombre || getFacultadNombre(doc.idFacultad)
    const escuelaNombre = doc.escuelaNombre || getEscuelaNombre(doc.idEscuela)

    const matchesSearch = doc.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.profesion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      facultadNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      escuelaNombre.toLowerCase().includes(busqueda.toLowerCase())

    const matchesFacultad = selectedFacultadId === '' || doc.idFacultad === selectedFacultadId
    const matchesEscuela = selectedEscuelaId === '' || doc.idEscuela === selectedEscuelaId

    return matchesSearch && matchesFacultad && matchesEscuela
  })

  const abrirModalCrear = () => {
    setFormData({
      apellidos: '',
      nombres: '',
      profesion: '',
      fechaNacimiento: '',
      correo: '',
      emailUsuario: '',
      password: '',
      idFacultad: undefined,
      idEscuela: undefined,
    });
    setMostrarPassword(false);
    setModalAbierto('crear');
    setIsModalOpen(true);
  };

  const abrirModalAsignarPassword = (docente: DocenteAdmin) => {
    if (ignorarSiguienteAperturaRef.current) return;
    setDocenteSeleccionado(docente);
    setPasswordData({ password: '' });
    setMostrarPassword(false);
    setModalAbierto('asignarPassword');
    setIsModalOpen(true);
  };

  const abrirModalEditar = (docente: DocenteAdmin) => {
    if (ignorarSiguienteAperturaRef.current) return;
    setDocenteSeleccionado(docente);
    setFormData({
      apellidos: docente.apellidos,
      nombres: docente.nombres,
      profesion: docente.profesion || '',
      fechaNacimiento: docente.fechaNacimiento
        ? docente.fechaNacimiento.split('T')[0]
        : '',
      correo: docente.correo || '',
      idFacultad: docente.idFacultad || undefined,
      idEscuela: docente.idEscuela || undefined,
      emailUsuario: '',
      password: '',
    });
    setModalAbierto('editar');
    setIsModalOpen(true);
  };

  const abrirModalEliminar = (docente: DocenteAdmin) => {
    if (ignorarSiguienteAperturaRef.current) return;
    setDocenteSeleccionado(docente);
    setModalAbierto('eliminar');
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    ignorarSiguienteAperturaRef.current = true;
    setIsModalOpen(false);
    window.setTimeout(() => {
      setModalAbierto(null);
      setDocenteSeleccionado(null);
      setMostrarPassword(false);
      ignorarSiguienteAperturaRef.current = false;
    }, 350);
  };

  // Cierre del modal evitando que el evento se propague
  const handleCerrarModal = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    cerrarModal();
  };

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const dataToSend = {
      ...formData,
      idFacultad: formData.idFacultad ?? null,
      idEscuela: formData.idEscuela ?? null,
    };

    crearMutation.mutate(dataToSend as any);
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
      const dataToUpdate: ActualizarDocenteRequest = {
        apellidos: formData.apellidos,
        nombres: formData.nombres,
        profesion: formData.profesion || undefined,
        fechaNacimiento: formData.fechaNacimiento || undefined,
        correo: formData.correo || undefined,
        idFacultad: formData.idFacultad ?? null as any,
        idEscuela: formData.idEscuela ?? null as any,
      };
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
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Cargando docentes...</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Gestión de Docentes
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
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
        <div className="space-y-4">
          {/* Filtros principales */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo, profesión, facultad o escuela..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
              />
            </div>

            <div className="flex items-center gap-2">
              {hayFiltrosActivos && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Limpiar filtros</span>
                </button>
              )}

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

          {/* Filtros específicos */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-sm text-zinc-700 font-medium">Filtrar por:</div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                value={selectedFacultadId}
                onChange={(e) => {
                  setSelectedFacultadId(e.target.value === '' ? '' : Number(e.target.value))
                  setSelectedEscuelaId('') // Reset escuela cuando cambia facultad
                }}
              >
                <option value="">Todas las facultades</option>
                {facultades.map((facultad) => (
                  <option key={facultad.id} value={facultad.id}>
                    {facultad.nombre}
                  </option>
                ))}
              </select>

              <select
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 min-w-[180px]"
                value={selectedEscuelaId}
                onChange={(e) => setSelectedEscuelaId(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={!selectedFacultadId}
              >
                <option value="">{selectedFacultadId ? 'Todas las escuelas' : 'Selecciona facultad primero'}</option>
                {escuelasFiltradas.map((escuela) => (
                  <option key={escuela.id} value={escuela.id}>
                    {escuela.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Indicadores de filtros activos */}
          {hayFiltrosActivos && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100">
              {selectedFacultadId !== '' && facultades.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  {facultades.find(f => f.id === selectedFacultadId)?.nombre}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFacultadId('')
                      setSelectedEscuelaId('')
                    }}
                    className="text-green-500 hover:text-green-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedEscuelaId !== '' && escuelasFiltradas.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                  {escuelasFiltradas.find(e => e.id === selectedEscuelaId)?.nombre}
                  <button
                    type="button"
                    onClick={() => setSelectedEscuelaId('')}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {busqueda !== '' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                  "{busqueda}"
                  <button
                    type="button"
                    onClick={() => setBusqueda('')}
                    className="text-orange-500 hover:text-orange-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
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
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Facultad/Escuela</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Correo</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Cursos</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
              {docentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <GraduationCap className="w-12 h-12 text-zinc-300 mb-3" />
                      <p className="text-zinc-500 font-medium">No se encontraron docentes</p>
                      <p className="text-zinc-400 text-sm mt-1">
                        {hayFiltrosActivos
                          ? 'Intenta con otros filtros o limpia los filtros actuales'
                          : 'No hay docentes registrados en el sistema'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                docentesFiltrados.map((docente) => (
                  <tr key={docente.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
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
                      <div className="space-y-1">
                        {docente.idFacultad && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-zinc-500">Facultad:</span>
                            <span className="font-medium">
                              {docente.facultadNombre || getFacultadNombre(docente.idFacultad) || 'No especificada'}
                            </span>
                          </div>
                        )}
                        {docente.idEscuela && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-zinc-500">Escuela:</span>
                            <span className="font-medium">
                              {docente.escuelaNombre || getEscuelaNombre(docente.idEscuela) || 'No especificada'}
                            </span>
                          </div>
                        )}
                        {!docente.idFacultad && !docente.idEscuela && (
                          <span className="text-zinc-400 italic text-xs">No asignado</span>
                        )}
                      </div>
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
                          className={`p-2 rounded-lg transition-colors ${docente.tienePassword
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
      <Transition appear show={isModalOpen && (modalAbierto === 'crear' || modalAbierto === 'editar')} as={Fragment}>
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
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        cerrarModal();
                      }}
                      className="text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
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
                          <input
                            type="text"
                            required
                            value={formData.apellidos}
                            onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                            placeholder="Ej. Pérez López"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Nombres <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={formData.nombres}
                            onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                            placeholder="Ej. Juan Carlos"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Profesión</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.profesion}
                            onChange={(e) => setFormData({ ...formData, profesion: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                            placeholder="Ej. Ingeniero de Sistemas"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Fecha de Nacimiento
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={formData.fechaNacimiento}
                            onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Correo Electrónico (Institucional)
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={formData.correo}
                            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                            placeholder="ejemplo@universidad.edu.pe"
                          />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Correo institucional del docente</p>
                      </div>

                      {/* Facultad y Escuela */}
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Facultad
                          </label>
                          <select
                            value={formData.idFacultad || ''}
                            onChange={(e) => setFormData({ ...formData, idFacultad: e.target.value ? Number(e.target.value) : undefined })}
                            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                          >
                            <option value="">Sin asignar</option>
                            {facultades.map((facultad) => (
                              <option key={facultad.id} value={facultad.id}>
                                {facultad.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Escuela Profesional
                          </label>
                          <select
                            value={formData.idEscuela || ''}
                            onChange={(e) => setFormData({ ...formData, idEscuela: e.target.value ? Number(e.target.value) : undefined })}
                            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                            disabled={!formData.idFacultad}
                          >
                            <option value="">{formData.idFacultad ? 'Sin asignar' : 'Selecciona facultad primero'}</option>
                            {escuelas
                              .filter(e => !formData.idFacultad || e.facultadId === formData.idFacultad)
                              .map((escuela) => (
                                <option key={escuela.id} value={escuela.id}>
                                  {escuela.nombre}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      {modalAbierto === 'crear' && (
                        <>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                              Email de Usuario (Gmail u otro) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                required
                                value={formData.emailUsuario}
                                onChange={(e) => setFormData({ ...formData, emailUsuario: e.target.value })}
                                className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                placeholder="ejemplo@gmail.com"
                              />
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">Email para acceder al sistema (puede ser Gmail, Outlook, etc.)</p>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                              Contraseña <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type={mostrarPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-4 pr-12 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
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
                        </>
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          cerrarModal();
                        }}
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
      <Transition appear show={isModalOpen && modalAbierto === 'asignarPassword'} as={Fragment}>
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
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        cerrarModal();
                      }}
                      className="text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
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
                        <input
                          type={mostrarPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={passwordData.password}
                          onChange={(e) => setPasswordData({ password: e.target.value })}
                          className="w-full pl-4 pr-12 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          cerrarModal();
                        }}
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
      <Transition appear show={isModalOpen && modalAbierto === 'eliminar'} as={Fragment}>
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
                      onClick={(e) => handleCerrarModal(e)}
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

