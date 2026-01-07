import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, MaterialAdmin, CrearMaterialDto, ActualizarMaterialDto } from '../../services/adminApi';
import { cursosApi } from '../../services/cursosService';
import { adminDocentesApi } from '../../services/adminDocentesApi';
import {
  DocumentIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  PaperClipIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MaterialesAdminPage() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [materialEditando, setMaterialEditando] = useState<MaterialAdmin | null>(null);
  const [filtroCurso, setFiltroCurso] = useState<number | undefined>(undefined);
  const [filtroDocente, setFiltroDocente] = useState<number | undefined>(undefined);
  const [tieneVencimiento, setTieneVencimiento] = useState(false);
  const queryClient = useQueryClient();

  const { data: cursos } = useQuery({
    queryKey: ['cursos'],
    queryFn: () => cursosApi.getAll(),
  });

  const { data: docentes } = useQuery({
    queryKey: ['docentes'],
    queryFn: () => adminDocentesApi.getTodosDocentes(),
  });

  const { data: materiales, isLoading } = useQuery<MaterialAdmin[]>({
    queryKey: ['materiales-admin', filtroCurso, filtroDocente],
    queryFn: () => adminApi.getMateriales({
      idCurso: filtroCurso,
      idDocente: filtroDocente,
    }),
  });

  const crearMutation = useMutation({
    mutationFn: ({ material, idDocente }: { material: CrearMaterialDto; idDocente?: number }) =>
      adminApi.crearMaterial(material, idDocente),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales-admin'] });
      setMostrarModal(false);
      setTieneVencimiento(false);
      toast.success('Material creado exitosamente');
    },
    onError: () => {
      toast.error('Error al crear el material');
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, material }: { id: number; material: ActualizarMaterialDto }) =>
      adminApi.actualizarMaterial(id, material),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales-admin'] });
      setMostrarModal(false);
      setMaterialEditando(null);
      setTieneVencimiento(false);
      toast.success('Material actualizado exitosamente');
    },
    onError: () => {
      toast.error('Error al actualizar el material');
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => adminApi.eliminarMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales-admin'] });
      toast.success('Material eliminado exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar el material');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const material: CrearMaterialDto | ActualizarMaterialDto = {
      idCurso: Number(formData.get('idCurso')),
      nombre: formData.get('nombre') as string,
      descripcion: formData.get('descripcion') ? (formData.get('descripcion') as string) : null,
      tipo: formData.get('tipo') as string,
      categoria: formData.get('categoria') ? (formData.get('categoria') as string) : null,
      url: formData.get('url') ? (formData.get('url') as string) : null,
      fechaDisponibleDesde: formData.get('fechaDisponibleDesde') ? (formData.get('fechaDisponibleDesde') as string) : null,
      fechaDisponibleHasta: tieneVencimiento && formData.get('fechaDisponibleHasta') ? (formData.get('fechaDisponibleHasta') as string) : null,
      orden: Number(formData.get('orden') || 0),
      activo: materialEditando ? (formData.get('activo') === 'on') : true,
    };

    const idDocente = formData.get('idDocente') ? Number(formData.get('idDocente')) : undefined;

    if (materialEditando) {
      actualizarMutation.mutate({ id: materialEditando.id, material });
    } else {
      crearMutation.mutate({ material: material as CrearMaterialDto, idDocente });
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'enlace':
      case 'link':
        return <LinkIcon className="w-5 h-5" />;
      case 'video':
        return <ArrowTopRightOnSquareIcon className="w-5 h-5" />;
      default:
        return <DocumentIcon className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Materiales</h1>
            <p className="text-sm text-zinc-500 mt-1">Gestiona todos los materiales del sistema</p>
          </div>
          <button
            onClick={() => {
              setMaterialEditando(null);
              setMostrarModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Nuevo Material
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-700">Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-2">Curso</label>
            <select
              value={filtroCurso || ''}
              onChange={(e) => setFiltroCurso(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
            >
              <option value="">Todos los cursos</option>
              {cursos?.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.codigo} - {curso.nombreCurso}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-2">Docente</label>
            <select
              value={filtroDocente || ''}
              onChange={(e) => setFiltroDocente(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
            >
              <option value="">Todos los docentes</option>
              {docentes?.map((docente) => (
                <option key={docente.id} value={docente.id}>
                  {docente.nombres} {docente.apellidos}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Materiales */}
      {materiales && materiales.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiales.map((material) => (
            <div
              key={material.id}
              className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
                      {getTipoIcon(material.tipo)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2">{material.nombre}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{material.nombreCurso}</p>
                    </div>
                  </div>
                  {material.descripcion && (
                    <p className="text-xs text-zinc-600 line-clamp-2 mb-2">{material.descripcion}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded">
                      {material.tipo}
                    </span>
                    {material.categoria && (
                      <span className="text-xs text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded">
                        {material.categoria}
                      </span>
                    )}
                    {!material.activo && (
                      <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    <p>Por: {material.nombreDocente}</p>
                    {material.tamaño && <p>{formatFileSize(material.tamaño)}</p>}
                    <p>
                      {format(new Date(material.fechaCreacion), "d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => {
                      setMaterialEditando(material);
                      setTieneVencimiento(!!material.fechaDisponibleHasta);
                      setMostrarModal(true);
                    }}
                    className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de eliminar este material?')) {
                        eliminarMutation.mutate(material.id);
                      }
                    }}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl py-16 text-center">
          <PaperClipIcon className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 mb-1">No hay materiales</p>
          <p className="text-xs text-zinc-400">No se encontraron materiales con los filtros seleccionados</p>
        </div>
      )}

      {/* Modal de Crear/Editar */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                {materialEditando ? 'Editar Material' : 'Nuevo Material'}
              </h2>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setMaterialEditando(null);
                  setTieneVencimiento(false);
                }}
                className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Docente</label>
                <select
                  name="idDocente"
                  defaultValue={materialEditando?.idDocente || ''}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                >
                  <option value="">Seleccionar docente</option>
                  {docentes?.map((docente) => (
                    <option key={docente.id} value={docente.id}>
                      {docente.nombres} {docente.apellidos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Curso *</label>
                <select
                  name="idCurso"
                  defaultValue={materialEditando?.idCurso || ''}
                  required
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                >
                  <option value="">Seleccionar curso</option>
                  {cursos?.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.codigo} - {curso.nombreCurso}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  defaultValue={materialEditando?.nombre || ''}
                  required
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Descripción</label>
                <textarea
                  name="descripcion"
                  defaultValue={materialEditando?.descripcion || ''}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Tipo *</label>
                <select
                  name="tipo"
                  defaultValue={materialEditando?.tipo || 'archivo'}
                  required
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                >
                  <option value="archivo">Archivo</option>
                  <option value="enlace">Enlace</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Categoría</label>
                <input
                  type="text"
                  name="categoria"
                  defaultValue={materialEditando?.categoria || ''}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">URL (para enlaces/videos)</label>
                <input
                  type="url"
                  name="url"
                  defaultValue={materialEditando?.url || ''}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Fecha Disponible Desde</label>
                <input
                  type="datetime-local"
                  name="fechaDisponibleDesde"
                  defaultValue={materialEditando?.fechaDisponibleDesde ? format(new Date(materialEditando.fechaDisponibleDesde), "yyyy-MM-dd'T'HH:mm") : ''}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tieneVencimiento"
                  checked={tieneVencimiento}
                  onChange={(e) => setTieneVencimiento(e.target.checked)}
                  className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                />
                <label htmlFor="tieneVencimiento" className="text-sm text-zinc-700">
                  Tiene fecha de vencimiento
                </label>
              </div>

              {tieneVencimiento && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Fecha Disponible Hasta</label>
                  <input
                    type="datetime-local"
                    name="fechaDisponibleHasta"
                    defaultValue={materialEditando?.fechaDisponibleHasta ? format(new Date(materialEditando.fechaDisponibleHasta), "yyyy-MM-dd'T'HH:mm") : ''}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Orden</label>
                <input
                  type="number"
                  name="orden"
                  defaultValue={materialEditando?.orden || 0}
                  min="0"
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                />
              </div>

              {materialEditando && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="activo"
                    defaultChecked={materialEditando.activo}
                    className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                  />
                  <label className="text-sm text-zinc-700">Activo</label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModal(false);
                    setMaterialEditando(null);
                    setTieneVencimiento(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  {materialEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
