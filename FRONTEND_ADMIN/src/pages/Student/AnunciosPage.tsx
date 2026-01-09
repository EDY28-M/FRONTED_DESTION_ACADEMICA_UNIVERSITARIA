import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi, Anuncio } from '../../services/estudiantesApi';
import { 
  MegaphoneIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PageHeader from '../../components/Student/PageHeader';

export const AnunciosPage: React.FC = () => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);
  const [anuncioExpandido, setAnuncioExpandido] = useState<number | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Obtener cursos del estudiante
  const { data: misCursos } = useQuery({
    queryKey: ['mis-cursos'],
    queryFn: () => estudiantesApi.getMisCursos(),
  });

  // Obtener anuncios
  const { data: anuncios = [], isLoading } = useQuery<Anuncio[]>({
    queryKey: ['anuncios-estudiante', cursoSeleccionado],
    queryFn: () => estudiantesApi.getAnuncios(cursoSeleccionado || undefined),
  });

  const getPrioridadConfig = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case 'urgente':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: <ExclamationTriangleIcon className="w-4 h-4" />,
          dot: 'bg-red-500'
        };
      case 'importante':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          icon: <InformationCircleIcon className="w-4 h-4" />,
          dot: 'bg-amber-500'
        };
      default:
        return {
          bg: 'bg-zinc-50',
          border: 'border-zinc-200',
          text: 'text-zinc-700',
          icon: <MegaphoneIcon className="w-4 h-4" />,
          dot: 'bg-zinc-500'
        };
    }
  };

  const anunciosFiltrados = cursoSeleccionado
    ? anuncios.filter(a => a.idCurso === cursoSeleccionado || a.idCurso === null)
    : anuncios;

  // Agrupar anuncios por fecha
  const anunciosAgrupados = anunciosFiltrados.reduce((acc, anuncio) => {
    const fecha = format(new Date(anuncio.fechaCreacion), 'yyyy-MM-dd');
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(anuncio);
    return acc;
  }, {} as Record<string, Anuncio[]>);

  const fechasOrdenadas = Object.keys(anunciosAgrupados).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const cursoSeleccionadoNombre = misCursos?.find(c => c.idCurso === cursoSeleccionado)?.nombreCurso;

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Cargando anuncios...</p>
        </div>
      </div>
    );
  }

  const filterComponent = misCursos && misCursos.length > 0 ? (
    <div className="relative">
      <button
        onClick={() => setMostrarFiltros(!mostrarFiltros)}
        className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
          cursoSeleccionado || mostrarFiltros
            ? 'bg-zinc-900 text-white border-zinc-900'
            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
        }`}
      >
        <FunnelIcon className="w-4 h-4" />
        {cursoSeleccionadoNombre ? (
          <span className="max-w-[150px] truncate">{cursoSeleccionadoNombre}</span>
        ) : (
          'Todos los cursos'
        )}
        {cursoSeleccionado && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCursoSeleccionado(null);
            }}
            className="ml-1 hover:bg-white/20 rounded p-0.5"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}
      </button>

      {/* Dropdown de filtros */}
      {mostrarFiltros && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setMostrarFiltros(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-2">
              <button
                onClick={() => {
                  setCursoSeleccionado(null);
                  setMostrarFiltros(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  cursoSeleccionado === null
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                Todos los cursos
              </button>
              <div className="border-t border-zinc-100 my-1" />
              {misCursos.map((curso) => (
                <button
                  key={curso.id}
                  onClick={() => {
                    setCursoSeleccionado(curso.idCurso);
                    setMostrarFiltros(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    cursoSeleccionado === curso.idCurso
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {curso.nombreCurso}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  ) : undefined;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Anuncios"
        subtitle={`${anunciosFiltrados.length} ${anunciosFiltrados.length === 1 ? 'anuncio' : 'anuncios'}${cursoSeleccionadoNombre ? ` • ${cursoSeleccionadoNombre}` : ''}`}
        filterComponent={filterComponent}
      />

      {/* Lista de anuncios */}
      {anunciosFiltrados.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
            <MegaphoneIcon className="w-7 h-7 text-zinc-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">No hay anuncios</h3>
          <p className="text-xs text-zinc-500">
            {cursoSeleccionado
              ? 'No hay anuncios para este curso en este momento'
              : 'No hay anuncios disponibles'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {fechasOrdenadas.map((fecha) => {
            const anunciosDelDia = anunciosAgrupados[fecha];
            const esHoy = fecha === format(new Date(), 'yyyy-MM-dd');
            const esAyer = fecha === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
            
            let fechaLabel = format(new Date(fecha), "EEEE, d 'de' MMMM", { locale: es });
            if (esHoy) fechaLabel = 'Hoy';
            else if (esAyer) fechaLabel = 'Ayer';
            else fechaLabel = format(new Date(fecha), "d 'de' MMMM", { locale: es });

            return (
              <div key={fecha} className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <div className="h-px flex-1 bg-zinc-200"></div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                    {fechaLabel}
                  </span>
                  <div className="h-px flex-1 bg-zinc-200"></div>
                </div>

                <div className="space-y-3">
                  {anunciosDelDia.map((anuncio) => {
                    const prioridad = getPrioridadConfig(anuncio.prioridad);
                    const isExpanded = anuncioExpandido === anuncio.id;
                    const contenidoTexto = anuncio.contenido.replace(/<[^>]*>/g, '');
                    const necesitaExpandir = contenidoTexto.length > 200;

                    return (
                      <div
                        key={anuncio.id}
                        className="bg-white border border-zinc-200 rounded-lg shadow-sm hover:shadow transition-all"
                      >
                        {/* Header del anuncio */}
                        <div className="px-5 py-4 border-b border-zinc-100">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${prioridad.bg} ${prioridad.border} ${prioridad.text}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${prioridad.dot}`}></span>
                                  {prioridad.icon}
                                  <span className="capitalize">{anuncio.prioridad}</span>
                                </span>
                                {anuncio.nombreCurso && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium text-zinc-700">
                                    <BookOpenIcon className="w-3.5 h-3.5" />
                                    <span className="max-w-[200px] truncate">{anuncio.nombreCurso}</span>
                                  </span>
                                )}
                              </div>
                              <h3 className="text-sm font-semibold text-zinc-900 mb-2 leading-snug">
                                {anuncio.titulo}
                              </h3>
                              <div className="flex items-center gap-4 text-xs text-zinc-500">
                                <div className="flex items-center gap-1.5">
                                  <UserIcon className="w-3.5 h-3.5" />
                                  <span className="truncate">{anuncio.nombreDocente}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <CalendarIcon className="w-3.5 h-3.5" />
                                  <span>
                                    {format(new Date(anuncio.fechaCreacion), "d 'de' MMMM 'a las' HH:mm", {
                                      locale: es,
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Contenido del anuncio */}
                        <div className="px-5 py-4">
                          {isExpanded ? (
                            <div>
                              <div
                                className="text-sm text-zinc-700 leading-relaxed prose prose-sm max-w-none mb-3"
                                dangerouslySetInnerHTML={{ __html: anuncio.contenido }}
                                style={{
                                  wordBreak: 'break-word'
                                }}
                              />
                              {necesitaExpandir && (
                                <button
                                  onClick={() => setAnuncioExpandido(null)}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                                >
                                  <ChevronUpIcon className="w-4 h-4" />
                                  Ver menos
                                </button>
                              )}
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-zinc-700 leading-relaxed line-clamp-4 mb-2">
                                {contenidoTexto}
                              </p>
                              {necesitaExpandir && (
                                <button
                                  onClick={() => setAnuncioExpandido(anuncio.id)}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                                >
                                  <ChevronDownIcon className="w-4 h-4" />
                                  Ver más
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
