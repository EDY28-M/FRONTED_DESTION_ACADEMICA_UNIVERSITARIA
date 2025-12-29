import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { trabajosDocenteApi, Trabajo, TrabajoCreate, TrabajoUpdate, Entrega, CalificarEntrega } from '../../services/trabajosApi';
import { docenteTiposEvaluacionApi, TipoEvaluacion } from '../../services/docenteApi';
import { 
  Plus, 
  FileText, 
  Clock, 
  Users, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
// Función helper para formatear fechas
const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface TrabajosDocentePageProps {
  idCurso?: number;
}

const TrabajosDocentePage: React.FC<TrabajosDocentePageProps> = ({ idCurso: idCursoProp }) => {
  // Si idCurso viene como prop, usarlo directamente. Si no, intentar obtenerlo de los params
  const { id } = useParams<{ id: string }>();
  const idCurso = idCursoProp || (id ? Number(id) : 0);
  const queryClient = useQueryClient();
  
  // Validar que tenemos un idCurso válido
  if (!idCurso || idCurso === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-sm text-zinc-500">Error: No se pudo identificar el curso</p>
        </div>
      </div>
    );
  }
  
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [trabajoEditando, setTrabajoEditando] = useState<Trabajo | null>(null);
  const [trabajoSeleccionado, setTrabajoSeleccionado] = useState<Trabajo | null>(null);
  const [mostrarEntregas, setMostrarEntregas] = useState(false);

  const { data: trabajos, isLoading, error: queryError } = useQuery({
    queryKey: ['trabajos-curso-docente', idCurso],
    queryFn: () => trabajosDocenteApi.getTrabajosPorCurso(Number(idCurso)),
    enabled: !!idCurso && idCurso > 0,
    retry: false,
    onError: (error: any) => {
      // No redirigir, solo mostrar error
      console.error('Error al cargar trabajos:', error);
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Error al cargar los trabajos');
      }
    },
  });

  const { data: entregas, isLoading: isLoadingEntregas, refetch: refetchEntregas } = useQuery({
    queryKey: ['entregas-trabajo', trabajoSeleccionado?.id],
    queryFn: () => trabajosDocenteApi.getEntregasPorTrabajo(trabajoSeleccionado!.id),
    enabled: !!trabajoSeleccionado && mostrarEntregas,
  });

  const deleteTrabajoMutation = useMutation({
    mutationFn: trabajosDocenteApi.deleteTrabajo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trabajos-curso-docente'] });
      toast.success('Trabajo eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar el trabajo');
    },
  });

  const calificarMutation = useMutation({
    mutationFn: ({ idEntrega, data }: { idEntrega: number; data: CalificarEntrega }) =>
      trabajosDocenteApi.calificarEntrega(idEntrega, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas-trabajo'] });
      toast.success('Calificación guardada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al calificar');
    },
  });

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este trabajo? Esta acción no se puede deshacer.')) {
      return;
    }
    deleteTrabajoMutation.mutate(id);
  };

  const handleVerEntregas = (trabajo: Trabajo) => {
    setTrabajoSeleccionado(trabajo);
    setMostrarEntregas(true);
  };

  const handleCalificar = (idEntrega: number, calificacion: number, observaciones?: string) => {
    calificarMutation.mutate({
      idEntrega,
      data: { calificacion, observaciones },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-1/3"></div>
          <div className="h-64 bg-zinc-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Mostrar error si hay uno, pero no redirigir
  if (queryError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">
            Error al cargar los trabajos. Por favor, intenta nuevamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Trabajos Encargados</h2>
          <p className="text-sm text-zinc-500 mt-1">Gestiona los trabajos y revisa las entregas de los estudiantes</p>
        </div>
        <button
          onClick={() => setMostrarModalCrear(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Trabajo
        </button>
      </div>

      {/* Lista de Trabajos */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        {trabajos && trabajos.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {trabajos.map((trabajo) => {
              const fechaLimite = new Date(trabajo.fechaLimite);
              const vencido = new Date() > fechaLimite;

              return (
                <div key={trabajo.id} className="p-6 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-zinc-900">{trabajo.titulo}</h3>
                        {!trabajo.activo && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600">
                            Inactivo
                          </span>
                        )}
                        {vencido && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            Vencido
                          </span>
                        )}
                      </div>

                      {trabajo.descripcion && (
                        <p className="text-sm text-zinc-600 mb-3 line-clamp-2">{trabajo.descripcion}</p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-zinc-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>Límite: {formatDate(fechaLimite)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>{trabajo.totalEntregas} entrega{trabajo.totalEntregas !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          <span>{trabajo.archivos.length} archivo{trabajo.archivos.length !== 1 ? 's' : ''}</span>
                        </div>
                        {trabajo.nombreTipoEvaluacion && (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700 font-medium">
                              {trabajo.nombreTipoEvaluacion} 
                              {trabajo.totalTrabajos && trabajo.totalTrabajos > 1 ? (
                                <span className="ml-1">
                                  - Trabajo {trabajo.numeroTrabajo}/{trabajo.totalTrabajos} 
                                  {trabajo.pesoIndividual && (
                                    <span className="text-zinc-600 font-normal">
                                      {' '}({trabajo.pesoIndividual.toFixed(1)}% c/u)
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="ml-1">({trabajo.pesoTipoEvaluacion}%)</span>
                              )}
                            </span>
                          </div>
                        )}
                        {trabajo.totalTrabajos && trabajo.totalTrabajos > 1 && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            Serie de {trabajo.totalTrabajos} trabajos
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-6">
                      <button
                        onClick={() => handleVerEntregas(trabajo)}
                        className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                        title="Ver entregas"
                      >
                        <Eye className="w-4 h-4 text-zinc-600" />
                      </button>
                      <button
                        onClick={() => setTrabajoEditando(trabajo)}
                        className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-zinc-600" />
                      </button>
                      <button
                        onClick={() => handleEliminar(trabajo.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-sm font-medium text-zinc-900">No hay trabajos creados</h3>
            <p className="text-zinc-500 text-sm mt-1">
              Crea tu primer trabajo para que los estudiantes puedan entregarlo.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Entregas */}
      {mostrarEntregas && trabajoSeleccionado && (
        <ModalEntregas
          trabajo={trabajoSeleccionado}
          entregas={entregas || []}
          isLoading={isLoadingEntregas}
          onClose={() => {
            setMostrarEntregas(false);
            setTrabajoSeleccionado(null);
          }}
          onCalificar={handleCalificar}
          refetchEntregas={refetchEntregas}
        />
      )}

      {/* Modal Crear/Editar Trabajo */}
      {(mostrarModalCrear || trabajoEditando) && (
        <ModalTrabajo
          idCurso={Number(idCurso)}
          trabajo={trabajoEditando}
          onClose={() => {
            setMostrarModalCrear(false);
            setTrabajoEditando(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['trabajos-curso-docente'] });
            setMostrarModalCrear(false);
            setTrabajoEditando(null);
          }}
        />
      )}
    </div>
  );
};

// Componente Modal para Entregas
interface ModalEntregasProps {
  trabajo: Trabajo;
  entregas: Entrega[];
  isLoading: boolean;
  onClose: () => void;
  onCalificar: (idEntrega: number, calificacion: number, observaciones?: string) => void;
}

const ModalEntregas: React.FC<ModalEntregasProps> = ({
  trabajo,
  entregas,
  isLoading,
  onClose,
  onCalificar,
  refetchEntregas,
}) => {
  const [calificaciones, setCalificaciones] = useState<Map<number, { calificacion: number; observaciones: string }>>(new Map());
  const queryClient = useQueryClient();

  const handleCalificar = (idEntrega: number) => {
    const calif = calificaciones.get(idEntrega);
    if (calif && calif.calificacion >= 0 && calif.calificacion <= 20) {
      onCalificar(idEntrega, calif.calificacion, calif.observaciones || undefined);
      setCalificaciones(new Map());
    } else {
      toast.error('La calificación debe estar entre 0 y 20');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">Entregas: {trabajo.titulo}</h3>
            <p className="text-sm text-zinc-500 mt-1">{entregas.length} entrega{entregas.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : entregas.length > 0 ? (
            <div className="space-y-4">
              {entregas.map((entrega) => (
                <div key={entrega.id} className="border border-zinc-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-zinc-900">{entrega.nombreEstudiante}</h4>
                      <p className="text-sm text-zinc-500">{entrega.codigoEstudiante}</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Entregado: {formatDate(entrega.fechaEntrega)}
                        {entrega.entregadoTarde && (
                          <span className="ml-2 text-red-600">(Tarde)</span>
                        )}
                      </p>
                    </div>
                    {entrega.calificacion !== null && entrega.calificacion !== undefined ? (
                      <div className="text-right">
                        <span className="text-lg font-semibold text-zinc-900">{entrega.calificacion}</span>
                        <p className="text-xs text-zinc-500">Calificado</p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-sm text-zinc-500">Sin calificar</span>
                      </div>
                    )}
                  </div>

                  {entrega.comentario && (
                    <p className="text-sm text-zinc-600 mb-3">{entrega.comentario}</p>
                  )}

                  {entrega.archivos.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-zinc-500 mb-2">Archivos:</p>
                      <div className="space-y-1">
                        {entrega.archivos.map((archivo) => (
                          <div key={archivo.id} className="flex items-center justify-between gap-2 text-sm text-zinc-700">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>{archivo.nombreArchivo}</span>
                            </div>
                            <button
                              onClick={async () => {
                                try {
                                  const blob = await trabajosDocenteApi.downloadArchivoEntrega(entrega.id, archivo.id);
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = archivo.nombreArchivo;
                                  document.body.appendChild(a);
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                  toast.success('Archivo descargado');
                                } catch (error: any) {
                                  toast.error(error.response?.data?.message || 'Error al descargar el archivo');
                                }
                              }}
                              className="p-1.5 hover:bg-zinc-100 rounded transition-colors"
                              title="Descargar archivo"
                            >
                              <Download className="w-4 h-4 text-zinc-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {entrega.links.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-zinc-500 mb-2">Enlaces:</p>
                      <div className="space-y-1">
                        {entrega.links.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                          >
                            <LinkIcon className="w-4 h-4" />
                            <span>{link.url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {!entrega.calificacion && (
                    <div className="mt-4 pt-4 border-t border-zinc-200 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1">
                          Calificación (0-20)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          value={calificaciones.get(entrega.id)?.calificacion || ''}
                          onChange={(e) => {
                            const calif = calificaciones.get(entrega.id) || { calificacion: 0, observaciones: '' };
                            calif.calificacion = parseFloat(e.target.value) || 0;
                            setCalificaciones(new Map(calificaciones.set(entrega.id, calif)));
                          }}
                          className="w-24 px-3 py-1.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1">
                          Observaciones
                        </label>
                        <textarea
                          value={calificaciones.get(entrega.id)?.observaciones || ''}
                          onChange={(e) => {
                            const calif = calificaciones.get(entrega.id) || { calificacion: 0, observaciones: '' };
                            calif.observaciones = e.target.value;
                            setCalificaciones(new Map(calificaciones.set(entrega.id, calif)));
                          }}
                          rows={2}
                          className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                      </div>
                      <button
                        onClick={() => handleCalificar(entrega.id)}
                        className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-sm font-medium"
                      >
                        Guardar Calificación
                      </button>
                    </div>
                  )}

                  {entrega.calificacion && entrega.observaciones && (
                    <div className="mt-3 pt-3 border-t border-zinc-200">
                      <p className="text-xs font-medium text-zinc-500 mb-1">Observaciones del docente:</p>
                      <p className="text-sm text-zinc-700">{entrega.observaciones}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">Aún no hay entregas para este trabajo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente Modal para Crear/Editar Trabajo
interface ModalTrabajoProps {
  idCurso: number;
  trabajo?: Trabajo | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalTrabajo: React.FC<ModalTrabajoProps> = ({ idCurso, trabajo, onClose, onSuccess }) => {
  const [titulo, setTitulo] = useState(trabajo?.titulo || '');
  const [descripcion, setDescripcion] = useState(trabajo?.descripcion || '');
  const [fechaLimite, setFechaLimite] = useState(
    trabajo?.fechaLimite ? new Date(trabajo.fechaLimite).toISOString().slice(0, 16) : ''
  );
  const [idTipoEvaluacion, setIdTipoEvaluacion] = useState<number | undefined>(trabajo?.idTipoEvaluacion);
  const [dividirEvaluacion, setDividirEvaluacion] = useState<boolean>(
    trabajo ? (trabajo.totalTrabajos !== undefined && trabajo.totalTrabajos > 1) : false
  );
  const [numeroTrabajo, setNumeroTrabajo] = useState<number | undefined>(trabajo?.numeroTrabajo);
  const [totalTrabajos, setTotalTrabajos] = useState<number | undefined>(trabajo?.totalTrabajos);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [links, setLinks] = useState<{ url: string; descripcion: string }[]>(
    trabajo?.links.map(l => ({ url: l.url, descripcion: l.descripcion || '' })) || []
  );
  const [nuevoLink, setNuevoLink] = useState({ url: '', descripcion: '' });

  const queryClient = useQueryClient();

  // Cargar tipos de evaluación del curso
  const { data: tiposEvaluacion } = useQuery({
    queryKey: ['tipos-evaluacion', idCurso],
    queryFn: () => docenteTiposEvaluacionApi.getTiposEvaluacion(idCurso),
    enabled: !!idCurso,
  });

  const createMutation = useMutation({
    mutationFn: (data: TrabajoCreate) => trabajosDocenteApi.createTrabajo(data),
    onSuccess: () => {
      toast.success('Trabajo creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear el trabajo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TrabajoUpdate) => trabajosDocenteApi.updateTrabajo(trabajo!.id, data),
    onSuccess: () => {
      toast.success('Trabajo actualizado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar el trabajo');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      toast.error('El título es requerido');
      return;
    }

    if (!fechaLimite) {
      toast.error('La fecha límite es requerida');
      return;
    }

    // Validar división de evaluación
    if (dividirEvaluacion) {
      if (!numeroTrabajo || !totalTrabajos) {
        toast.error('Si divides la evaluación, debes especificar el número de trabajo y el total de trabajos');
        return;
      }
      if (numeroTrabajo < 1 || numeroTrabajo > totalTrabajos) {
        toast.error(`El número de trabajo debe estar entre 1 y ${totalTrabajos}`);
        return;
      }
      if (totalTrabajos < 2 || totalTrabajos > 10) {
        toast.error('El total de trabajos debe estar entre 2 y 10');
        return;
      }
    }

    if (trabajo) {
      // Actualizar
      const data: TrabajoUpdate = {
        titulo,
        descripcion: descripcion || undefined,
        fechaLimite: fechaLimite,
        idTipoEvaluacion: idTipoEvaluacion || undefined,
        numeroTrabajo: dividirEvaluacion ? numeroTrabajo : undefined,
        totalTrabajos: dividirEvaluacion ? totalTrabajos : undefined,
        archivosNuevos: archivos.length > 0 ? archivos : undefined,
        linksNuevos: links.length > 0 ? links : undefined,
      };
      updateMutation.mutate(data);
    } else {
      // Crear
      const data: TrabajoCreate = {
        idCurso,
        titulo,
        descripcion: descripcion || undefined,
        fechaLimite: fechaLimite,
        idTipoEvaluacion: idTipoEvaluacion || undefined,
        numeroTrabajo: dividirEvaluacion ? numeroTrabajo : undefined,
        totalTrabajos: dividirEvaluacion ? totalTrabajos : undefined,
        archivos: archivos.length > 0 ? archivos : undefined,
        links: links.length > 0 ? links : undefined,
      };
      createMutation.mutate(data);
    }
  };

  const handleAgregarLink = () => {
    if (nuevoLink.url.trim()) {
      setLinks([...links, { ...nuevoLink }]);
      setNuevoLink({ url: '', descripcion: '' });
    }
  };

  const handleEliminarLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">
            {trabajo ? 'Editar Trabajo' : 'Nuevo Trabajo'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Fecha Límite <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Tipo de Evaluación
            </label>
            <select
              value={idTipoEvaluacion || ''}
              onChange={(e) => {
                const nuevoId = e.target.value ? Number(e.target.value) : undefined;
                setIdTipoEvaluacion(nuevoId);
                // Si se deselecciona el tipo, desactivar división
                if (!nuevoId) {
                  setDividirEvaluacion(false);
                  setNumeroTrabajo(undefined);
                  setTotalTrabajos(undefined);
                }
              }}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">Sin tipo de evaluación</option>
              {tiposEvaluacion?.filter(t => t.activo).map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre} ({tipo.peso}%)
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500 mt-1">
              Selecciona el tipo de evaluación para que la calificación se registre automáticamente en las notas
            </p>
          </div>

          {/* Opción para dividir evaluación */}
          {idTipoEvaluacion && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="dividirEvaluacion"
                  checked={dividirEvaluacion}
                  onChange={(e) => {
                    setDividirEvaluacion(e.target.checked);
                    if (!e.target.checked) {
                      setNumeroTrabajo(undefined);
                      setTotalTrabajos(undefined);
                    } else {
                      // Valores por defecto al activar
                      if (!numeroTrabajo) setNumeroTrabajo(1);
                      if (!totalTrabajos) setTotalTrabajos(2);
                    }
                  }}
                  className="mt-0.5 w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                />
                <div className="flex-1">
                  <label htmlFor="dividirEvaluacion" className="block text-sm font-medium text-zinc-900 mb-1 cursor-pointer">
                    Dividir esta evaluación en múltiples trabajos
                  </label>
                  <p className="text-xs text-zinc-600 mb-3">
                    Útil cuando quieres crear varios trabajos para el mismo tipo de evaluación (ej: 4 parciales, 2 trabajos encargados).
                    El sistema calculará automáticamente el peso individual de cada trabajo y registrará la nota final cuando todos estén calificados.
                  </p>
                  
                  {dividirEvaluacion && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1">
                          Número de este trabajo
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={totalTrabajos || 10}
                          value={numeroTrabajo || ''}
                          onChange={(e) => {
                            const num = parseInt(e.target.value) || undefined;
                            if (num && totalTrabajos && num > totalTrabajos) {
                              toast.error(`El número de trabajo no puede ser mayor a ${totalTrabajos}`);
                              return;
                            }
                            setNumeroTrabajo(num);
                          }}
                          className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                          placeholder="Ej: 1"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Ej: 1, 2, 3...</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1">
                          Total de trabajos
                        </label>
                        <input
                          type="number"
                          min="2"
                          max="10"
                          value={totalTrabajos || ''}
                          onChange={(e) => {
                            const total = parseInt(e.target.value) || undefined;
                            if (total && numeroTrabajo && numeroTrabajo > total) {
                              setNumeroTrabajo(1);
                            }
                            setTotalTrabajos(total);
                          }}
                          className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                          placeholder="Ej: 4"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Máximo 10 trabajos</p>
                      </div>
                    </div>
                  )}
                  
                  {dividirEvaluacion && numeroTrabajo && totalTrabajos && idTipoEvaluacion && (
                    <div className="mt-3 p-2 bg-white rounded border border-blue-300">
                      <p className="text-xs text-zinc-600">
                        <span className="font-medium">Peso calculado:</span>{' '}
                        {tiposEvaluacion?.find(t => t.id === idTipoEvaluacion) && (
                          <span>
                            {(tiposEvaluacion.find(t => t.id === idTipoEvaluacion)!.peso / totalTrabajos).toFixed(2)}% por trabajo
                            {' '}({tiposEvaluacion.find(t => t.id === idTipoEvaluacion)!.peso}% ÷ {totalTrabajos})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        La nota final se calculará automáticamente cuando todos los {totalTrabajos} trabajos estén calificados.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Archivos de Instrucciones
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setArchivos(Array.from(e.target.files || []))}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            {archivos.length > 0 && (
              <div className="mt-2 space-y-1">
                {archivos.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-zinc-50 rounded text-sm">
                    <span className="text-zinc-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setArchivos(archivos.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Enlaces de Instrucciones
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={nuevoLink.url}
                  onChange={(e) => setNuevoLink({ ...nuevoLink, url: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
                <input
                  type="text"
                  value={nuevoLink.descripcion}
                  onChange={(e) => setNuevoLink({ ...nuevoLink, descripcion: e.target.value })}
                  placeholder="Descripción"
                  className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
                <button
                  type="button"
                  onClick={handleAgregarLink}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {links.length > 0 && (
                <div className="space-y-1">
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-zinc-50 rounded text-sm">
                      <div>
                        <span className="text-zinc-700">{link.url}</span>
                        {link.descripcion && (
                          <span className="text-zinc-500 ml-2">- {link.descripcion}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEliminarLink(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-200">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Guardando...'
                : trabajo
                ? 'Actualizar'
                : 'Crear'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrabajosDocentePage;

