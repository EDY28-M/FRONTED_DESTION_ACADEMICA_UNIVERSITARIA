import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, AnuncioAdmin, CrearAnuncioDto, ActualizarAnuncioDto } from '../../services/adminApi';
import { cursosApi } from '../../services/cursosService';
import { adminDocentesApi } from '../../services/adminDocentesApi';
import {
  MegaphoneIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AnunciosAdminPage() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [anuncioEditando, setAnuncioEditando] = useState<AnuncioAdmin | null>(null);
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

  const { data: anuncios, isLoading } = useQuery<AnuncioAdmin[]>({
    queryKey: ['anuncios-admin', filtroCurso, filtroDocente],
    queryFn: () => adminApi.getAnuncios({
      idCurso: filtroCurso,
      idDocente: filtroDocente,
    }),
  });

  const crearMutation = useMutation({
    mutationFn: ({ anuncio, idDocente }: { anuncio: CrearAnuncioDto; idDocente?: number }) =>
      adminApi.crearAnuncio(anuncio, idDocente),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncios-admin'] });
      setMostrarModal(false);
      setTieneVencimiento(false);
      toast.success('Anuncio creado exitosamente');
    },
    onError: () => {
      toast.error('Error al crear el anuncio');
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, anuncio }: { id: number; anuncio: ActualizarAnuncioDto }) =>
      adminApi.actualizarAnuncio(id, anuncio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncios-admin'] });
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
    mutationFn: (id: number) => adminApi.eliminarAnuncio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncios-admin'] });
      toast.success('Anuncio eliminado exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar el anuncio');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const anuncio: CrearAnuncioDto | ActualizarAnuncioDto = {
      idCurso: formData.get('idCurso') ? Number(formData.get('idCurso')) : null,
      titulo: formData.get('titulo') as string,
      contenido: formData.get('contenido') as string,
      prioridad: formData.get('prioridad') as 'normal' | 'importante' | 'urgente',
      fechaPublicacion: formData.get('fechaPublicacion') ? (formData.get('fechaPublicacion') as string) : null,
      fechaExpiracion: tieneVencimiento && formData.get('fechaExpiracion') ? (formData.get('fechaExpiracion') as string) : null,
      activo: anuncioEditando ? (formData.get('activo') === 'on') : true,
    };

    const idDocente = formData.get('idDocente') ? Number(formData.get('idDocente')) : undefined;

    if (anuncioEditando) {
      actualizarMutation.mutate({ id: anuncioEditando.id, anuncio });
    } else {
      crearMutation.mutate({ anuncio: anuncio as CrearAnuncioDto, idDocente });
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
            <h1 className="text-2xl font-bold text-zinc-900">Anuncios</h1>
            <p className="text-sm text-zinc-500 mt-1">Gestiona todos los anuncios del sistema</p>
          </div>
          <button
            onClick={() => {
              setAnuncioEditando(null);
              setMostrarModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Nuevo Anuncio
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

      {/* Lista de Anuncios */}
      {anuncios && anuncios.length > 0 ? (
        <div className="space-y-4">
          {anuncios.map((anuncio) => (
            <div
              key={anuncio.id}
              className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getPrioridadColor(anuncio.prioridad)}`}>
                      {anuncio.prioridad}
                    </span>
                    {anuncio.nombreCurso && (
                      <span className="text-xs text-zinc-500 bg-zinc-50 px-2 py-1 rounded">
                        {anuncio.nombreCurso}
                      </span>
                    )}
                    {!anuncio.activo && (
                      <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-1 rounded">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">{anuncio.titulo}</h3>
                  <div
                    className="text-sm text-zinc-700 mb-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: anuncio.contenido }}
                  />
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>Por: {anuncio.nombreDocente}</span>
                    <span>
                      {format(new Date(anuncio.fechaCreacion), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAnuncioEditando(anuncio);
                      setTieneVencimiento(!!anuncio.fechaExpiracion);
                      setMostrarModal(true);
                    }}
                    className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de eliminar este anuncio?')) {
                        eliminarMutation.mutate(anuncio.id);
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
          <MegaphoneIcon className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 mb-1">No hay anuncios</p>
          <p className="text-xs text-zinc-400">No se encontraron anuncios con los filtros seleccionados</p>
        </div>
      )}

      {/* Modal de Crear/Editar */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
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
                  defaultValue={anuncioEditando?.idDocente || ''}
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
                <label className="block text-sm font-medium text-zinc-700 mb-2">Curso (opcional)</label>
                <select
                  name="idCurso"
                  defaultValue={anuncioEditando?.idCurso || ''}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                >
                  <option value="">Anuncio general</option>
                  {cursos?.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.codigo} - {curso.nombreCurso}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Título *</label>
                <input
                  type="text"
                  name="titulo"
                  defaultValue={anuncioEditando?.titulo || ''}
                  required
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Contenido *</label>
                <textarea
                  name="contenido"
                  defaultValue={anuncioEditando?.contenido || ''}
                  required
                  rows={6}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Prioridad *</label>
                <select
                  name="prioridad"
                  defaultValue={anuncioEditando?.prioridad || 'normal'}
                  required
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                >
                  <option value="normal">Normal</option>
                  <option value="importante">Importante</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Fecha de Publicación</label>
                <input
                  type="datetime-local"
                  name="fechaPublicacion"
                  defaultValue={anuncioEditando?.fechaPublicacion ? format(new Date(anuncioEditando.fechaPublicacion), "yyyy-MM-dd'T'HH:mm") : ''}
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
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Fecha de Vencimiento</label>
                  <input
                    type="datetime-local"
                    name="fechaExpiracion"
                    defaultValue={anuncioEditando?.fechaExpiracion ? format(new Date(anuncioEditando.fechaExpiracion), "yyyy-MM-dd'T'HH:mm") : ''}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                  />
                </div>
              )}

              {anuncioEditando && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="activo"
                    defaultChecked={anuncioEditando.activo}
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
                    setAnuncioEditando(null);
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
                  {anuncioEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
