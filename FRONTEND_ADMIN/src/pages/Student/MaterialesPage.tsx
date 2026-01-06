import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi, MaterialCurso } from '../../services/estudiantesApi';
import {
  DocumentIcon,
  LinkIcon,
  PaperClipIcon,
  FolderIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
  XMarkIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PageHeader from '../../components/Student/PageHeader';

export const MaterialesPage: React.FC = () => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Obtener cursos del estudiante
  const { data: misCursos } = useQuery({
    queryKey: ['mis-cursos'],
    queryFn: () => estudiantesApi.getMisCursos(),
  });

  // Obtener materiales
  const { data: materiales = [], isLoading } = useQuery<MaterialCurso[]>({
    queryKey: ['materiales-estudiante', cursoSeleccionado],
    queryFn: () => estudiantesApi.getMateriales(cursoSeleccionado || undefined),
  });

  const categorias = Array.from(
    new Set(materiales.map((m) => m.categoria).filter((c): c is string => !!c))
  );

  const materialesFiltrados = materiales.filter((m) => {
    const matchCurso = !cursoSeleccionado || m.idCurso === cursoSeleccionado;
    const matchCategoria = !categoriaSeleccionada || m.categoria === categoriaSeleccionada;
    return matchCurso && matchCategoria;
  });

  const getTipoConfig = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'enlace':
      case 'link':
        return {
          icon: <LinkIcon className="w-5 h-5" />,
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      case 'video':
        return {
          icon: <ArrowTopRightOnSquareIcon className="w-5 h-5" />,
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          button: 'bg-purple-600 hover:bg-purple-700 text-white'
        };
      default:
        return {
          icon: <DocumentIcon className="w-5 h-5" />,
          bg: 'bg-zinc-50',
          border: 'border-zinc-200',
          text: 'text-zinc-700',
          button: 'bg-zinc-900 hover:bg-zinc-800 text-white'
        };
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = (material: MaterialCurso) => {
    if (material.url) {
      window.open(material.url, '_blank');
    } else if (material.rutaArchivo) {
      window.open(`/api/files/${material.rutaArchivo}`, '_blank');
    }
  };

  const tieneFiltrosActivos = cursoSeleccionado !== null || categoriaSeleccionada !== null;

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  const filterComponent = (
    <button
      onClick={() => setMostrarFiltros(!mostrarFiltros)}
      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
        mostrarFiltros || tieneFiltrosActivos
          ? 'bg-zinc-900 text-white border-zinc-900'
          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
      }`}
    >
      <FunnelIcon className="w-4 h-4 inline mr-1.5" />
      Filtros
      {tieneFiltrosActivos && (
        <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded text-xs">
          {[cursoSeleccionado, categoriaSeleccionada].filter(Boolean).length}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materiales de Estudio"
        subtitle="Recursos y documentos compartidos por tus docentes"
        filterComponent={filterComponent}
      />

      {/* Panel de filtros */}
      {(mostrarFiltros || tieneFiltrosActivos) && (
        <div className="bg-white border border-zinc-200 rounded-xl px-6 py-4 space-y-4">
            {/* Filtro por curso */}
            {misCursos && misCursos.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-2">
                  Curso
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setCursoSeleccionado(null)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      cursoSeleccionado === null
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    Todos
                  </button>
                  {misCursos.map((curso) => (
                    <button
                      key={curso.id}
                      onClick={() => setCursoSeleccionado(curso.idCurso)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        cursoSeleccionado === curso.idCurso
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      {curso.nombreCurso}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filtro por categoría */}
            {categorias.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-2">
                  Categoría
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setCategoriaSeleccionada(null)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      categoriaSeleccionada === null
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    Todas
                  </button>
                  {categorias.map((categoria) => (
                    <button
                      key={categoria}
                      onClick={() => setCategoriaSeleccionada(categoria)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        categoriaSeleccionada === categoria
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      {categoria}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botón limpiar filtros */}
            {tieneFiltrosActivos && (
              <button
                onClick={() => {
                  setCursoSeleccionado(null);
                  setCategoriaSeleccionada(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
                Limpiar filtros
              </button>
            )}
        </div>
      )}

      {/* Contador de resultados */}
      {materialesFiltrados.length > 0 && (
        <div className="text-sm text-zinc-600">
          Mostrando{' '}
          <span className="font-semibold text-zinc-900">{materialesFiltrados.length}</span>
          {' '}
          {materialesFiltrados.length === 1 ? 'material' : 'materiales'}
        </div>
      )}

      {/* Lista de materiales mejorada */}
      {materialesFiltrados.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <FolderIcon className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 mb-1">No hay materiales</h3>
          <p className="text-sm text-zinc-500">
            {tieneFiltrosActivos
              ? 'No hay materiales que coincidan con los filtros seleccionados'
              : 'No hay materiales disponibles en este momento'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materialesFiltrados.map((material) => {
            const tipoConfig = getTipoConfig(material.tipo);
            const esEnlace = material.tipo.toLowerCase() === 'enlace' || material.tipo.toLowerCase() === 'link';

            return (
              <div
                key={material.id}
                className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all group"
              >
                {/* Header del material */}
                <div className={`px-5 py-4 ${tipoConfig.bg} border-b ${tipoConfig.border}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-lg ${tipoConfig.bg} border ${tipoConfig.border} flex items-center justify-center flex-shrink-0 ${tipoConfig.text}`}>
                      {tipoConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${tipoConfig.bg} ${tipoConfig.border} ${tipoConfig.text} border capitalize`}>
                          {material.tipo}
                        </span>
                        {material.categoria && (
                          <span className="text-xs text-zinc-500 font-medium">
                            {material.categoria}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug">
                        {material.nombre}
                      </h3>
                    </div>
                  </div>
                  {material.nombreCurso && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                      <BookOpenIcon className="w-3.5 h-3.5" />
                      <span className="truncate">{material.nombreCurso}</span>
                    </div>
                  )}
                </div>

                {/* Contenido del material */}
                <div className="px-5 py-4">
                  {material.descripcion && (
                    <p className="text-xs text-zinc-600 line-clamp-3 mb-4 leading-relaxed">
                      {material.descripcion}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                    <div className="flex items-center gap-3">
                      {material.tamaño && (
                        <span className="font-mono">{formatFileSize(material.tamaño)}</span>
                      )}
                      {material.fechaCreacion && (
                        <span>
                          {format(new Date(material.fechaCreacion), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <button
                    onClick={() => handleDownload(material)}
                    className={`w-full ${tipoConfig.button} px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm`}
                  >
                    {esEnlace ? (
                      <>
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        Abrir enlace
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Descargar
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
