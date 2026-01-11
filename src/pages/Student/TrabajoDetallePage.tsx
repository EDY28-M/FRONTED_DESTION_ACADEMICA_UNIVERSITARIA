import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { trabajosEstudianteApi, Trabajo, Entrega, EntregaCreate, Entregable } from '../../services/trabajosApi';
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  Upload, 
  Link as LinkIcon,
  Download,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
// Función helper para formatear fechas
const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const TrabajoDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [archivos, setArchivos] = useState<File[]>([]);
  const [links, setLinks] = useState<{ url: string; descripcion: string }[]>([]);
  const [nuevoLink, setNuevoLink] = useState({ url: '', descripcion: '' });
  const [comentario, setComentario] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [entregables, setEntregables] = useState<Entregable[]>([]);
  const [entregableActual, setEntregableActual] = useState<number | null>(null);
  const [archivosEntregable, setArchivosEntregable] = useState<File[]>([]);
  const [linksEntregable, setLinksEntregable] = useState<{ url: string; descripcion: string }[]>([]);
  const [comentarioEntregable, setComentarioEntregable] = useState('');

  const { data: trabajo, isLoading } = useQuery({
    queryKey: ['trabajo', id],
    queryFn: () => trabajosEstudianteApi.getTrabajo(Number(id)),
    enabled: !!id,
  });

  const { data: entrega, refetch: refetchEntrega } = useQuery({
    queryKey: ['mi-entrega', trabajo?.id],
    queryFn: () => trabajosEstudianteApi.getMiEntrega(trabajo!.id),
    enabled: !!trabajo?.yaEntregado && !!trabajo?.id,
  });

  const createEntregaMutation = useMutation({
    mutationFn: (data: EntregaCreate) => trabajosEstudianteApi.createEntrega(data),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['trabajo', id] });
      queryClient.invalidateQueries({ queryKey: ['trabajos-curso'] });
      queryClient.invalidateQueries({ queryKey: ['mi-entrega', trabajo?.id] });
      
      // Si el trabajo requiere múltiples entregables, no cerrar el formulario
      if (trabajo?.totalEntregables && trabajo.totalEntregables > 1 && data) {
        toast.success('Entrega base creada. Ahora puedes subir los entregables individuales.');
        setMostrarFormulario(false);
        setArchivos([]);
        setLinks([]);
        setComentario('');
      } else {
        toast.success('¡Trabajo entregado exitosamente!');
        setMostrarFormulario(false);
        setArchivos([]);
        setLinks([]);
        setComentario('');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al entregar el trabajo');
    },
  });

  const createEntregableMutation = useMutation({
    mutationFn: (data: { idEntrega: number; numeroEntregable: number; comentario?: string; archivos?: File[]; links?: { url: string; descripcion?: string }[] }) =>
      trabajosEstudianteApi.createEntregable(data),
    onSuccess: async () => {
      // Invalidar y recargar las queries
      await queryClient.invalidateQueries({ queryKey: ['mi-entrega', trabajo?.id] });
      await queryClient.invalidateQueries({ queryKey: ['trabajo', id] });
      await refetchEntrega();
      toast.success('Entregable subido exitosamente');
      setEntregableActual(null);
      setArchivosEntregable([]);
      setLinksEntregable([]);
      setComentarioEntregable('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al subir el entregable');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos(Array.from(e.target.files));
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

  const handleEliminarArchivo = (index: number) => {
    setArchivos(archivos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trabajo) return;

    if (archivos.length === 0 && links.length === 0) {
      toast.error('Debes adjuntar al menos un archivo o un link');
      return;
    }

    const data: EntregaCreate = {
      idTrabajo: trabajo.id,
      comentario: comentario || undefined,
      archivos: archivos.length > 0 ? archivos : undefined,
      links: links.length > 0 ? links : undefined,
    };

    createEntregaMutation.mutate(data);
  };

  const handleDownload = async (idArchivo: number, nombreArchivo: string) => {
    try {
      const blob = await trabajosEstudianteApi.downloadArchivoInstrucciones(idArchivo);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Error al descargar el archivo');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-1/3"></div>
          <div className="h-64 bg-zinc-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!trabajo) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-2">Trabajo no encontrado</h3>
          <p className="text-zinc-500 text-sm mb-6">El trabajo que buscas no existe o no tienes acceso.</p>
          <button
            onClick={() => navigate('/estudiante/mis-cursos')}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
          >
            Volver a Mis Cursos
          </button>
        </div>
      </div>
    );
  }

  const fechaLimite = new Date(trabajo.fechaLimite);
  const vencido = new Date() > fechaLimite;
  const puedeEntregar = trabajo.puedeEntregar && !trabajo.yaEntregado;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{trabajo.titulo}</h1>
          <p className="text-zinc-500 text-sm mt-1">{trabajo.nombreCurso}</p>
        </div>
        <div className="flex items-center gap-2">
          {trabajo.yaEntregado && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              Entregado
            </span>
          )}
        </div>
      </div>

      {/* Información del Trabajo */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 space-y-6">
        {/* Descripción */}
        {trabajo.descripcion && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">Descripción</h3>
            <p className="text-sm text-zinc-600 whitespace-pre-wrap">{trabajo.descripcion}</p>
          </div>
        )}

        {/* Información de Tipo de Evaluación y División */}
        {trabajo.nombreTipoEvaluacion && (
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-zinc-900">
                {trabajo.nombreTipoEvaluacion}
              </span>
              <span className="text-sm text-zinc-600">
                ({trabajo.pesoTipoEvaluacion}%)
              </span>
            </div>
          </div>
        )}

        {/* Fecha Límite */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-600">
            Fecha límite: <span className="font-medium">{formatDate(fechaLimite)}</span>
          </span>
          {vencido && !trabajo.yaEntregado && (
            <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
              Vencido
            </span>
          )}
        </div>

        {/* Archivos de Instrucciones */}
        {trabajo.archivos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Archivos de Instrucciones</h3>
            <div className="space-y-2">
              {trabajo.archivos.map((archivo) => (
                <div
                  key={archivo.id}
                  className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{archivo.nombreArchivo}</p>
                      {archivo.tamaño && (
                        <p className="text-xs text-zinc-500">
                          {(archivo.tamaño / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(archivo.id, archivo.nombreArchivo)}
                    className="p-2 hover:bg-zinc-200 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 text-zinc-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links de Instrucciones */}
        {trabajo.links.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Enlaces de Instrucciones</h3>
            <div className="space-y-2">
              {trabajo.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200 hover:bg-zinc-100 transition-colors"
                >
                  <LinkIcon className="w-5 h-5 text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900">{link.url}</p>
                    {link.descripcion && (
                      <p className="text-xs text-zinc-500 mt-0.5">{link.descripcion}</p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Formulario de Entrega */}
        {puedeEntregar && (
          <div className="pt-6 border-t border-zinc-200">
            {!mostrarFormulario ? (
              <button
                onClick={() => setMostrarFormulario(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
              >
                <Upload className="w-5 h-5" />
                Entregar Trabajo
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Comentario (opcional)
                  </label>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                    placeholder="Agrega algún comentario sobre tu entrega..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Archivos
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  />
                  {archivos.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {archivos.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-zinc-50 rounded text-sm">
                          <span className="text-zinc-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleEliminarArchivo(index)}
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
                    Enlaces (opcional)
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={nuevoLink.url}
                        onChange={(e) => setNuevoLink({ ...nuevoLink, url: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={nuevoLink.descripcion}
                        onChange={(e) => setNuevoLink({ ...nuevoLink, descripcion: e.target.value })}
                        placeholder="Descripción"
                        className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
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

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={createEntregaMutation.isPending}
                    className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {createEntregaMutation.isPending ? 'Enviando...' : 'Enviar Entrega'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setArchivos([]);
                      setLinks([]);
                      setComentario('');
                    }}
                    className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Sección de Entregables Múltiples */}
        {trabajo.yaEntregado && trabajo.totalEntregables && trabajo.totalEntregables > 1 && entrega && (
          <div className="pt-6 border-t border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">
              Entregables ({entregables.length} de {trabajo.totalEntregables})
            </h3>
            
            <div className="space-y-4">
              {Array.from({ length: trabajo.totalEntregables }, (_, i) => i + 1).map((numero) => {
                const entregable = entregables.find(e => e.numeroEntregable === numero);
                const entregableExiste = entregable !== undefined;
                
                return (
                  <div key={numero} className="border border-zinc-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-zinc-900">Entregable {numero}</h4>
                      {entregableExiste && entregable.calificacion !== null && entregable.calificacion !== undefined && (
                        <span className="px-2 py-1 rounded text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Calificado: {entregable.calificacion.toFixed(1)}
                        </span>
                      )}
                      {entregableExiste && entregable.calificacion === null && (
                        <span className="px-2 py-1 rounded text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Pendiente de calificación
                        </span>
                      )}
                    </div>
                    
                    {entregableExiste ? (
                      <div className="space-y-2">
                        {entregable.comentario && (
                          <p className="text-sm text-zinc-600">{entregable.comentario}</p>
                        )}
                        {entregable.archivos.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-zinc-500 mb-1">Archivos:</p>
                            <div className="space-y-1">
                              {entregable.archivos.map((archivo) => (
                                <div key={archivo.id} className="flex items-center gap-2 text-sm text-zinc-700">
                                  <FileText className="w-4 h-4" />
                                  <span>{archivo.nombreArchivo}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {entregable.observaciones && (
                          <div className="mt-2 pt-2 border-t border-zinc-200">
                            <p className="text-xs font-medium text-zinc-500 mb-1">Observaciones del docente:</p>
                            <p className="text-sm text-zinc-700">{entregable.observaciones}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {entregableActual === numero ? (
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!entrega.id) return;
                            
                            if (archivosEntregable.length === 0 && linksEntregable.length === 0) {
                              toast.error('Debes adjuntar al menos un archivo o un link');
                              return;
                            }
                            
                            createEntregableMutation.mutate({
                              idEntrega: entrega.id,
                              numeroEntregable: numero,
                              comentario: comentarioEntregable || undefined,
                              archivos: archivosEntregable.length > 0 ? archivosEntregable : undefined,
                              links: linksEntregable.length > 0 ? linksEntregable : undefined,
                            });
                          }} className="space-y-3">
                            <textarea
                              value={comentarioEntregable}
                              onChange={(e) => setComentarioEntregable(e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
                              placeholder="Comentario (opcional)"
                            />
                            <input
                              type="file"
                              multiple
                              onChange={(e) => setArchivosEntregable(Array.from(e.target.files || []))}
                              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-sm font-medium"
                              >
                                Subir Entregable
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEntregableActual(null);
                                  setArchivosEntregable([]);
                                  setLinksEntregable([]);
                                  setComentarioEntregable('');
                                }}
                                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 text-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => setEntregableActual(numero)}
                            className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-sm font-medium"
                          >
                            Subir Entregable {numero}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {trabajo.yaEntregado && (
          <div className="pt-6 border-t border-zinc-200 space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-800">
                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                Ya has entregado este trabajo{trabajo.fechaEntrega && ` el ${formatDate(trabajo.fechaEntrega)}`}.
              </p>
            </div>
            
            {/* Calificación - Solo mostrar si NO tiene entregables múltiples o si todos están calificados */}
            {(!trabajo.totalEntregables || trabajo.totalEntregables <= 1 || 
              (entregables.length === trabajo.totalEntregables && entregables.every(e => e.calificacion !== null))) && 
            trabajo.calificacion !== null && trabajo.calificacion !== undefined ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">
                      Calificación
                    </h3>
                    <p className="text-2xl font-bold text-blue-700">{trabajo.calificacion.toFixed(1)}</p>
                    {trabajo.fechaCalificacion && (
                      <p className="text-xs text-blue-600 mt-1">
                        Calificado el {formatDate(trabajo.fechaCalificacion)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-blue-600">de 20</span>
                  </div>
                </div>
                {trabajo.observacionesDocente && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs font-medium text-blue-700 mb-1">Observaciones del docente:</p>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">{trabajo.observacionesDocente}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <Clock className="w-4 h-4 inline mr-2" />
                  El docente aún no ha calificado tu trabajo.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrabajoDetallePage;

