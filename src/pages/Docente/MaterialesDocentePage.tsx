import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { docenteMaterialesApi, docenteCursosApi, MaterialCurso, CrearMaterial, ActualizarMaterial, CursoDocente } from '../../services/docenteApi';
import {
  DocumentIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  PaperClipIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const MaterialesDocentePage: React.FC = () => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [materialEditando, setMaterialEditando] = useState<MaterialCurso | null>(null);
  const [tieneVencimiento, setTieneVencimiento] = useState(false);
  const queryClient = useQueryClient();

  const { data: cursos } = useQuery({
    queryKey: ['mis-cursos'],
    queryFn: () => docenteCursosApi.getMisCursos(),
  });

  const { data: materiales, isLoading } = useQuery<MaterialCurso[]>({
    queryKey: ['materiales', cursoSeleccionado],
    queryFn: () => docenteMaterialesApi.getMateriales(cursoSeleccionado!),
    enabled: !!cursoSeleccionado,
  });

  const crearMutation = useMutation({
    mutationFn: (material: CrearMaterial) => docenteMaterialesApi.crearMaterial(cursoSeleccionado!, material),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
      setMostrarModal(false);
      setTieneVencimiento(false);
      toast.success('Material creado exitosamente');
    },
    onError: () => {
      toast.error('Error al crear el material');
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, material }: { id: number; material: ActualizarMaterial }) =>
      docenteMaterialesApi.actualizarMaterial(id, material),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
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
    mutationFn: (id: number) => docenteMaterialesApi.eliminarMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
      toast.success('Material eliminado exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar el material');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const material: CrearMaterial | ActualizarMaterial = {
      nombre: formData.get('nombre') as string,
      descripcion: formData.get('descripcion') as string || undefined,
      tipo: formData.get('tipo') as 'archivo' | 'enlace' | 'video',
      categoria: formData.get('categoria') as string || undefined,
      url: formData.get('url') as string || undefined,
      rutaArchivo: formData.get('rutaArchivo') as string || undefined,
      nombreArchivo: formData.get('nombreArchivo') as string || undefined,
      tipoArchivo: formData.get('tipoArchivo') as string || undefined,
      tamaño: formData.get('tamaño') ? Number(formData.get('tamaño')) : undefined,
      fechaDisponibleDesde: undefined, // Se establece automáticamente en el backend
      fechaDisponibleHasta: tieneVencimiento && formData.get('fechaDisponibleHasta') ? (formData.get('fechaDisponibleHasta') as string) : undefined,
      orden: Number(formData.get('orden') || 0),
      activo: materialEditando ? (formData.get('activo') === 'on') : true,
    };

    if (materialEditando) {
      actualizarMutation.mutate({ id: materialEditando.id, material });
    } else {
      crearMutation.mutate(material);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'enlace':
        return <LinkIcon className="w-5 h-5" />;
      case 'video':
        return <DocumentIcon className="w-5 h-5" />;
      default:
        return <PaperClipIcon className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Cargando materiales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Materiales del Curso</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Gestiona los recursos educativos</p>
          </div>
          {cursoSeleccionado && (
            <button
              onClick={() => {
                setMaterialEditando(null);
                setTieneVencimiento(false);
                setMostrarModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Nuevo Material
            </button>
          )}
        </div>
      </div>

      {/* Selector de curso */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <label className="block text-xs font-medium text-zinc-700 mb-1.5">Seleccionar Curso</label>
        <select
          value={cursoSeleccionado || ''}
          onChange={(e) => setCursoSeleccionado(e.target.value ? Number(e.target.value) : null)}
          className="w-full md:w-64 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
        >
          <option value="">Selecciona un curso</option>
          {cursos?.map(curso => (
            <option key={curso.id} value={curso.id}>{curso.nombreCurso}</option>
          ))}
        </select>
      </div>

      {/* Lista de materiales */}
      {cursoSeleccionado ? (
        <div className="space-y-4">
          {materiales?.map((material) => (
            <div
              key={material.id}
              className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getTipoIcon(material.tipo)}
                    <h3 className="text-sm font-semibold text-zinc-900">{material.nombre}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-50 text-zinc-700 border border-zinc-200">
                      {material.tipo}
                    </span>
                  </div>
                  {material.descripcion && (
                    <p className="text-xs text-zinc-500 mb-1">{material.descripcion}</p>
                  )}
                  <p className="text-xs text-zinc-400">
                    {material.categoria && `${material.categoria} • `}
                    {new Date(material.fechaCreacion).toLocaleDateString('es-PE')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMaterialEditando(material);
                      setTieneVencimiento(!!material.fechaDisponibleHasta);
                      setMostrarModal(true);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de eliminar este material?')) {
                        eliminarMutation.mutate(material.id);
                      }
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(!materiales || materiales.length === 0) && (
            <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
              <DocumentIcon className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-500 mb-1">No hay materiales</p>
              <p className="text-xs text-zinc-400">Agrega materiales educativos para tus estudiantes</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
          <DocumentIcon className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Selecciona un curso para ver sus materiales</p>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && cursoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  defaultValue={materialEditando?.nombre || ''}
                  required
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">Descripción</label>
                <textarea
                  name="descripcion"
                  defaultValue={materialEditando?.descripcion || ''}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">Tipo</label>
                  <select
                    name="tipo"
                    defaultValue={materialEditando?.tipo || 'archivo'}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  >
                    <option value="archivo">Archivo</option>
                    <option value="enlace">Enlace</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">Categoría</label>
                  <input
                    type="text"
                    name="categoria"
                    defaultValue={materialEditando?.categoria || ''}
                    placeholder="apuntes, ejercicios, videos..."
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">URL (para enlaces y videos)</label>
                <input
                  type="url"
                  name="url"
                  defaultValue={materialEditando?.url || ''}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={tieneVencimiento}
                    onChange={(e) => {
                      setTieneVencimiento(e.target.checked);
                      if (!e.target.checked) {
                        const fechaInput = document.querySelector('input[name="fechaDisponibleHasta"]') as HTMLInputElement;
                        if (fechaInput) fechaInput.value = '';
                      }
                    }}
                    className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                  />
                  <span className="text-sm font-medium text-zinc-700">Tiene vencimiento</span>
                </label>
                
                {tieneVencimiento && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">Disponible Hasta</label>
                    <input
                      type="datetime-local"
                      name="fechaDisponibleHasta"
                      defaultValue={materialEditando?.fechaDisponibleHasta ? new Date(materialEditando.fechaDisponibleHasta).toISOString().slice(0, 16) : ''}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                    />
                    <p className="text-xs text-zinc-500 mt-1">El material dejará de mostrarse después de esta fecha</p>
                  </div>
                )}
              </div>

              {materialEditando && (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      name="activo"
                      defaultChecked={materialEditando.activo}
                      className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                    />
                    Activo
                  </label>
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
                  disabled={crearMutation.isPending || actualizarMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
};
