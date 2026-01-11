import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { FileText, Filter } from 'lucide-react';
import PageHeader from '../../components/Student/PageHeader';

const NotasPage: React.FC = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | undefined>(undefined);

  const { data: periodos } = useQuery({
    queryKey: ['periodos'],
    queryFn: estudiantesApi.getPeriodos,
  });

  const { data: periodoActivo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  // Filtrar solo periodos activos
  const periodosActivos = periodos?.filter(p => p.activo) || [];

  const { data: notasResponse, isLoading } = useQuery({
    queryKey: ['notas', periodoSeleccionado],
    queryFn: () => estudiantesApi.getNotas(periodoSeleccionado),
    enabled: periodosActivos.length > 0,
  });

  const { data: misCursos } = useQuery({
    queryKey: ['mis-cursos', periodoSeleccionado],
    queryFn: () => estudiantesApi.getMisCursos(periodoSeleccionado),
  });

  const { data: perfil } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

  // Extraer datos del response
  const cursosConEvaluaciones = notasResponse?.cursosConEvaluaciones || [];
  const periodoMostrar = periodoSeleccionado 
    ? periodos?.find(p => p.id === periodoSeleccionado) 
    : periodoActivo;

  // Crear mapa de idCurso a codigoCurso desde misCursos
  const mapaCodigos = React.useMemo(() => {
    const mapa: Record<number, string> = {};
    misCursos?.forEach(curso => {
      if (curso.idCurso && curso.codigoCurso) {
        mapa[curso.idCurso] = curso.codigoCurso;
      }
    });
    return mapa;
  }, [misCursos]);

  // Enriquecer cursosConEvaluaciones con codigoCurso correcto
  const cursosEnriquecidos = React.useMemo(() => {
    return cursosConEvaluaciones.map(curso => ({
      ...curso,
      codigoCurso: curso.codigoCurso || mapaCodigos[curso.idCurso] || ''
    }));
  }, [cursosConEvaluaciones, mapaCodigos]);

  const getNotaColor = (nota: number) => {
    if (nota >= 14) return 'text-emerald-600';
    if (nota >= 11) return 'text-amber-600';
    return 'text-red-600';
  };

  const calcularPromedioFinalCurso = (evaluaciones: any[]) => {
    // 1) Si el backend ya manda "Promedio Final", úsalo.
    const pf = evaluaciones?.find((e) =>
      String(e?.tipoEvaluacion || '').toLowerCase().includes('promedio final')
    );
    if (pf?.tieneNota && typeof pf.notaValor === 'number' && pf.notaValor > 0) {
      return Number(pf.notaValor.toFixed(2));
    }

    // 2) Si no viene, calcula: suma de (nota * peso / 100) excluyendo "promedios".
    const total = (evaluaciones || [])
      .filter((e) => {
        const tipo = String(e?.tipoEvaluacion || '').toLowerCase();
        return !tipo.includes('promedio final') && !tipo.includes('promedio general');
      })
      .reduce((sum, e) => {
        if (!e?.tieneNota || typeof e.notaValor !== 'number' || e.notaValor <= 0) return sum;
        const peso = typeof e.peso === 'number' ? e.peso : Number(e.peso) || 0;
        return sum + (e.notaValor * peso) / 100;
      }, 0);

    return Number(total.toFixed(2));
  };

  const generarAbreviacion = (tipoEvaluacion: string): string => {
    const tipo = tipoEvaluacion.toLowerCase();
    const numeroMatch = tipoEvaluacion.match(/\d+/);
    const numero = numeroMatch ? numeroMatch[0] : '';

    if (tipo.includes('examen final') || tipo.includes('exámen final')) {
      return `EF${numero || '1'}`;
    }
    if (tipo.includes('promedio general')) {
      return 'PG';
    }
    if (tipo.includes('promedio final')) {
      return 'PF';
    }
    if (tipo.includes('parcial')) {
      return `EP${numero || ''}`;
    }
    if (tipo.includes('práctica') || tipo.includes('practica')) {
      return `PR${numero || ''}`;
    }
    if (tipo.includes('medio curso') || tipo.includes('mediocurso')) {
      return 'MC';
    }
    if (tipo.includes('actitud')) {
      return `EA${numero || ''}`;
    }
    if (tipo.includes('trabajo')) {
      return `T${numero || ''}`;
    }
    
    const palabras = tipoEvaluacion.split(' ').filter(p => p.length > 0);
    if (palabras.length >= 2) {
      return palabras.slice(0, 2).map(p => p[0].toUpperCase()).join('') + numero;
    }
    return tipoEvaluacion.substring(0, 2).toUpperCase() + numero;
  };

  const getBadgeClasses = (tipoEvaluacion: string) => {
    const tipo = tipoEvaluacion.toLowerCase();
    if (tipo.includes('ef1') || tipo.includes('examen final') || tipo.includes('exámen final')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (tipo.includes('pg') || tipo.includes('promedio general')) {
      return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
    if (tipo.includes('pf') || tipo.includes('promedio final')) {
      return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
    if (tipo.includes('práctica') || tipo.includes('practica')) {
      return 'bg-teal-50 text-teal-700 border-teal-200';
    }
    if (tipo.includes('trabajo')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (tipo.includes('medio curso') || tipo.includes('mediocurso')) {
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    }
    if (tipo.includes('actitud')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (tipo.includes('examen') || tipo.includes('final')) {
      return 'bg-violet-50 text-violet-700 border-violet-200';
    }
    return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  };

  const filterComponent = (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-zinc-400" />
      <select
        value={periodoSeleccionado || ''}
        onChange={(e) => setPeriodoSeleccionado(e.target.value ? Number(e.target.value) : undefined)}
        className="px-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 text-zinc-700 bg-white"
      >
        <option value="">Periodo Activo</option>
        {periodosActivos?.map((periodo) => (
          <option key={periodo.id} value={periodo.id}>
            {periodo.nombre} {periodo.activo && '(Activo)'}
          </option>
        ))}
      </select>
    </div>
  );

  // Obtener el nombre del semestre para el título
  const nombreSemestre = periodoMostrar?.nombre || 'Actual';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas"
        subtitle="Consulta tus calificaciones por período académico"
        periodoMostrar={periodoMostrar}
        filterComponent={filterComponent}
      />

      {/* Título del Registro */}
      <div className="bg-white border border-zinc-200 rounded-xl px-5 py-4">
        <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-wide text-center">
          REGISTRO DE NOTAS PARCIALES - SEMESTRE {nombreSemestre}
        </h2>
      </div>

      {/* Información del Estudiante */}
      {perfil && (
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Código</p>
              <p className="text-sm font-mono text-zinc-900">{perfil.codigo}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Apellidos y Nombres</p>
              <p className="text-sm text-zinc-900">{perfil.apellidos} {perfil.nombres}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Escuela Profesional</p>
              <p className="text-sm text-zinc-900">{perfil.carrera || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje sin período activo */}
      {!isLoading && periodosActivos.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <FileText className="h-8 w-8 text-amber-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-amber-900 mb-1">No hay periodo académico activo</h3>
          <p className="text-xs text-amber-700">
            Consulta tus notas históricas en "Registro de Notas"
          </p>
        </div>
      )}

      {/* Tabla de Notas */}
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Cargando notas...</p>
        </div>
      ) : periodosActivos.length > 0 && cursosEnriquecidos.length > 0 ? (
        <div className="space-y-6">
          {cursosEnriquecidos.map((curso) => {
            const evaluaciones = curso.evaluaciones || [];
            const promedioFinalCurso = calcularPromedioFinalCurso(evaluaciones);

            // Si el backend NO envía "Promedio Final", lo agregamos como fila al final (como en la captura)
            const tienePromedioFinal = evaluaciones.some((e: any) =>
              String(e?.tipoEvaluacion || '').toLowerCase().includes('promedio final')
            );
            const evaluacionesConPF = tienePromedioFinal
              ? evaluaciones
              : [
                  ...evaluaciones,
                  {
                    id: '__pf__',
                    tipoEvaluacion: 'Promedio Final',
                    tieneNota: true,
                    notaValor: promedioFinalCurso,
                    peso: 100,
                  },
                ];
            
            return (
              <div key={curso.idMatricula} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                {/* Encabezado del curso */}
                <div className="px-4 py-3 bg-zinc-50/30 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded border border-teal-200">
                      {curso.codigoCurso}
                    </span>
                    <span className="text-base font-semibold text-slate-700">{curso.nombreCurso}</span>
                  </div>
                </div>
                
                {/* Tabla de evaluaciones */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/50">
                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide w-20">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Evaluacion</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide w-24">Nota</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide w-24">Prom</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide w-24">Peso</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide w-24">Puntaje</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {evaluacionesConPF.length > 0 ? (
                        evaluacionesConPF.map((evaluacion, idx) => {
                          const puntaje = evaluacion.tieneNota && evaluacion.notaValor > 0 
                            ? (evaluacion.notaValor * evaluacion.peso / 100).toFixed(2)
                            : '0.00';
                          const esPromedioGeneral = evaluacion.tipoEvaluacion.toLowerCase().includes('promedio general');
                          const esPromedioFinal = evaluacion.tipoEvaluacion.toLowerCase().includes('promedio final');
                          const abreviacion = generarAbreviacion(evaluacion.tipoEvaluacion);

                          const puntajeResumen = () => {
                            if (!evaluacion.tieneNota || typeof evaluacion.notaValor !== 'number') return '0';
                            // En la captura: PF aparece como entero (ej: 17), PG puede tener decimales (ej: 17.35)
                            if (esPromedioFinal) return String(Math.round(evaluacion.notaValor));
                            return evaluacion.notaValor.toFixed(2);
                          };
                          
                          return (
                            <tr
                              key={`${curso.idMatricula}-${evaluacion.id}-${idx}`}
                              className={`hover:bg-zinc-50/50 transition-colors ${esPromedioGeneral || esPromedioFinal ? 'bg-white' : ''}`}
                            >
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center justify-center min-w-[2.5rem] h-8 px-2 rounded text-xs font-bold border ${getBadgeClasses(evaluacion.tipoEvaluacion)}`}>
                                  {abreviacion}
                                </span>
                              </td>
                              <td className={`px-4 py-3 text-sm ${esPromedioGeneral || esPromedioFinal ? 'font-semibold text-zinc-900' : 'text-zinc-700'}`}>
                                {evaluacion.tipoEvaluacion}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {esPromedioGeneral || esPromedioFinal ? (
                                  <span className="text-xs text-zinc-400">—</span>
                                ) : evaluacion.tieneNota && evaluacion.notaValor > 0 ? (
                                  <span className={`text-sm font-bold font-mono tabular-nums ${getNotaColor(evaluacion.notaValor)}`}>
                                    {evaluacion.notaValor.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-xs text-zinc-400">0</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {esPromedioGeneral || esPromedioFinal ? (
                                  <span className="text-xs text-zinc-400">—</span>
                                ) : evaluacion.tieneNota && evaluacion.notaValor > 0 ? (
                                  <span className={`text-sm font-bold font-mono tabular-nums ${getNotaColor(evaluacion.notaValor)}`}>
                                    {evaluacion.notaValor.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-xs text-zinc-400">0</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-xs font-mono tabular-nums text-zinc-500">
                                  {esPromedioGeneral || esPromedioFinal ? '100%' : `${evaluacion.peso}%`}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {(esPromedioGeneral || esPromedioFinal) ? (
                                  <span className={`text-sm font-mono tabular-nums font-semibold ${getNotaColor(Number(puntajeResumen()))}`}>
                                    {puntajeResumen()}
                                  </span>
                                ) : evaluacion.tieneNota && evaluacion.notaValor > 0 ? (
                                  <span className="text-sm font-mono tabular-nums text-zinc-700 font-semibold">{puntaje}</span>
                                ) : (
                                  <span className="text-xs text-zinc-400">0.00</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 text-center text-sm text-zinc-500">
                            No hay evaluaciones configuradas para este curso
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : periodosActivos.length > 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl py-16 text-center">
          <FileText className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 mb-1">No hay notas registradas</p>
          <p className="text-xs text-zinc-400">
            {periodoSeleccionado
              ? 'No tienes notas en el período seleccionado'
              : 'Aún no se han registrado notas en el periodo activo'}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default NotasPage;
