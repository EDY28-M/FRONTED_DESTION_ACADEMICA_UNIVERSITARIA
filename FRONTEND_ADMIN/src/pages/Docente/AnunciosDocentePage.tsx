import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { docenteAnunciosApi, docenteCursosApi, Anuncio, CrearAnuncio, ActualizarAnuncio, CursoDocente } from '../../services/docenteApi';
import {
  MegaphoneIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const AnunciosDocentePage: React.FC = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [anuncioEditando, setAnuncioEditando] = useState<Anuncio | null>(null);
  const [filtroCurso, setFiltroCurso] = useState<number | null>(null);
  const [tieneVencimiento, setTieneVencimiento] = useState(false);
  const queryClient = useQueryClient();

  const { data: cursos } = useQuery({
    queryKey: ['mis-cursos'],
    queryFn: () => docenteCursosApi.getMisCursos(),
  });

  const { data: anuncios, isLoading } = useQuery<Anuncio[]>({
    queryKey: ['anuncios', filtroCurso],
    queryFn: () => docenteAnunciosApi.getAnuncios(filtroCurso || undefined),
  });

  const crearMutation = useMutation({
    mutationFn: (anuncio: CrearAnuncio) => docenteAnunciosApi.crearAnuncio(anuncio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
      setMostrarModal(false);
      setTieneVencimiento(false);
      toast.success('Anuncio creado exitosamente');
    },
    onError: () => {
      toast.error('Error al crear el anuncio');
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, anuncio }: { id: number; anuncio: ActualizarAnuncio }) =>
      docenteAnunciosApi.actualizarAnuncio(id, anuncio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
      setMostrarModal(false);
      setAnuncioEditando(null);
      setTieneVencimiento(false);
      toast.success('Anuncio actualizado exitosamente');
    },
    onError: () => {
      toast.error('Error al actualizar el anuncio');
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => docenteAnunciosApi.eliminarAnuncio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
      toast.success('Anuncio eliminado exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar el anuncio');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const anuncio: CrearAnuncio | ActualizarAnuncio = {
      idCurso: formData.get('idCurso') ? Number(formData.get('idCurso')) : undefined,
      titulo: formData.get('titulo') as string,
      contenido: formData.get('contenido') as string,
      prioridad: formData.get('prioridad') as 'normal' | 'importante' | 'urgente',
      fechaPublicacion: undefined, // Se establece automáticamente en el backend
      fechaExpiracion: tieneVencimiento && formData.get('fechaExpiracion') ? (formData.get('fechaExpiracion') as string) : undefined,
      activo: anuncioEditando ? (formData.get('activo') === 'on') : true,
    };

    if (anuncioEditando) {
      actualizarMutation.mutate({ id: anuncioEditando.id, anuncio });
    } else {
      crearMutation.mutate(anuncio);
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'importante':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-zinc-50 text-zinc-700 border-zinc-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Cargando anuncios...</p>
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
            <h1 className="text-lg font-semibold text-zinc-900">Anuncios y Comunicaciones</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Gestiona los anuncios para tus estudiantes</p>
          </div>
          <button
            onClick={() => {
              setAnuncioEditando(null);
              setTieneVencimiento(false);
              setMostrarModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Nuevo Anuncio
          </button>
        </div>
      </div>

      {/* Filtro */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <label className="block text-xs font-medium text-zinc-700 mb-1.5">Filtrar por curso</label>
        <select
          value={filtroCurso || ''}
          onChange={(e) => setFiltroCurso(e.target.value ? Number(e.target.value) : null)}
          className="w-full md:w-64 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
        >
          <option value="">Todos los cursos</option>
          {cursos?.map(curso => (
            <option key={curso.id} value={curso.id}>{curso.nombreCurso}</option>
          ))}
        </select>
      </div>

      {/* Lista de anuncios */}
      <div className="space-y-4">
        {anuncios?.map((anuncio) => (
          <div
            key={anuncio.id}
            className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-zinc-900">{anuncio.titulo}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPrioridadColor(anuncio.prioridad)}`}>
                    {anuncio.prioridad}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {anuncio.nombreCurso || 'Todos los cursos'} • {new Date(anuncio.fechaCreacion).toLocaleDateString('es-PE')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAnuncioEditando(anuncio);
                    setTieneVencimiento(!!anuncio.fechaExpiracion);
                    setMostrarModal(true);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de eliminar este anuncio?')) {
                      eliminarMutation.mutate(anuncio.id);
                    }
                  }}
                  className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{anuncio.contenido}</p>
            {anuncio.fechaExpiracion && (
              <p className="text-xs text-zinc-400 mt-2">
                Expira: {new Date(anuncio.fechaExpiracion).toLocaleDateString('es-PE')}
              </p>
            )}
          </div>
        ))}
        {(!anuncios || anuncios.length === 0) && (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
            <MegaphoneIcon className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 mb-1">No hay anuncios</p>
            <p className="text-xs text-zinc-400">Crea tu primer anuncio para comunicarte con tus estudiantes</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                {anuncioEditando ? 'Editar Anuncio' : 'Nuevo Anuncio'}
              </h2>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setAnuncioEditando(null);
                  setTieneVencimiento(false);
                }}
                className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">Curso</label>
                <select
                  name="idCurso"
                  defaultValue={anuncioEditando?.idCurso || ''}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                >
                  <option value="">Todos los cursos</option>
                  {cursos?.map(curso => (
                    <option key={curso.id} value={curso.id}>{curso.nombreCurso}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">Título</label>
                <input
                  type="text"
                  name="titulo"
                  defaultValue={anuncioEditando?.titulo || ''}
                  required
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">Contenido</label>
                <textarea
                  name="contenido"
                  defaultValue={anuncioEditando?.contenido || ''}
                  required
                  rows={6}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">Prioridad</label>
                  <select
                    name="prioridad"
                    defaultValue={anuncioEditando?.prioridad || 'normal'}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  >
                    <option value="normal">Normal</option>
                    <option value="importante">Importante</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                {anuncioEditando && (
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 text-sm text-zinc-700">
                      <input
                        type="checkbox"
                        name="activo"
                        defaultChecked={anuncioEditando.activo}
                        className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                      />
                      Activo
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={tieneVencimiento}
                    onChange={(e) => {
                      setTieneVencimiento(e.target.checked);
                      if (!e.target.checked) {
                        const fechaInput = document.querySelector('input[name="fechaExpiracion"]') as HTMLInputElement;
                        if (fechaInput) fechaInput.value = '';
                      }
                    }}
                    className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                  />
                  <span className="text-sm font-medium text-zinc-700">Tiene vencimiento</span>
                </label>
                
                {tieneVencimiento && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">Fecha de Vencimiento</label>
                    <input
                      type="datetime-local"
                      name="fechaExpiracion"
                      defaultValue={anuncioEditando?.fechaExpiracion ? new Date(anuncioEditando.fechaExpiracion).toISOString().slice(0, 16) : ''}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                    />
                    <p className="text-xs text-zinc-500 mt-1">El anuncio dejará de mostrarse después de esta fecha</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModal(false);
                    setAnuncioEditando(null);
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
                  {anuncioEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
