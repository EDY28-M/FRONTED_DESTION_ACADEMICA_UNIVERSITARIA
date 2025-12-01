import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { FileText, TrendingUp, Filter, ChevronDown, ChevronRight } from 'lucide-react';

const NotasPage: React.FC = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | undefined>(undefined);
  const [cursosExpandidos, setCursosExpandidos] = useState<Set<string>>(new Set());

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

  // Extraer datos del response
  const notas = notasResponse?.notas || [];
  const promedioGeneralServidor = notasResponse?.promedioGeneral || 0;

  // Agrupar notas por curso
  const notasPorCurso = notas.reduce((acc, nota) => {
    if (!acc[nota.nombreCurso]) {
      acc[nota.nombreCurso] = [];
    }
    acc[nota.nombreCurso].push(nota);
    return acc;
  }, {} as Record<string, typeof notas>);

  // Calcular promedio ponderado por curso
  const calcularPromedioGeneral = (notasCurso: typeof notas) => {
    if (!notasCurso || notasCurso.length === 0) return 0;
    const totalPuntaje = notasCurso.reduce((sum, n) => sum + (n.notaValor * n.peso / 100), 0);
    return totalPuntaje;
  };

  // Calcular promedio final considerando solo notas con valor
  const calcularPromedioFinal = (notasCurso: typeof notas) => {
    if (!notasCurso || notasCurso.length === 0) return 0;
    const notasConValor = notasCurso.filter(n => n.notaValor > 0);
    if (notasConValor.length === 0) return 0;
    const pesoTotal = notasConValor.reduce((sum, n) => sum + n.peso, 0);
    if (pesoTotal === 0) return 0;
    const totalPuntaje = notasConValor.reduce((sum, n) => sum + (n.notaValor * n.peso / 100), 0);
    return Math.round(totalPuntaje);
  };

  const promedioGeneral = promedioGeneralServidor;

  const getNotaColor = (nota: number) => {
    if (nota >= 14) return 'text-emerald-600';
    if (nota >= 11) return 'text-amber-600';
    return 'text-red-600';
  };

  const getNotaBgColor = (nota: number) => {
    if (nota >= 14) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (nota >= 11) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const getBadgeClasses = (tipoEvaluacion: string) => {
    const tipo = tipoEvaluacion.toLowerCase();
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

  const generarAbreviacion = (tipoEvaluacion: string): string => {
    const tipo = tipoEvaluacion.toLowerCase();
    const numeroMatch = tipoEvaluacion.match(/\d+/);
    const numero = numeroMatch ? numeroMatch[0] : '';

    if (tipo.includes('trabajo') && tipo.includes('encargado')) return `TE${numero}`;
    if (tipo.includes('práctica') || tipo.includes('practica')) return `PR${numero}`;
    if (tipo.includes('parcial')) return `EP${numero}`;
    if (tipo.includes('medio curso') || tipo.includes('mediocurso')) return 'MC';
    if (tipo.includes('examen') && tipo.includes('final')) return 'EF';
    if (tipo.includes('actitud')) return `EA${numero}`;
    if (tipo.includes('trabajo')) return `T${numero}`;
    if (tipo.includes('examen')) return `EX${numero}`;
    
    const palabras = tipoEvaluacion.split(' ').filter(p => p.length > 0);
    if (palabras.length >= 2) {
      return palabras.slice(0, 2).map(p => p[0].toUpperCase()).join('') + numero;
    }
    return tipoEvaluacion.substring(0, 2).toUpperCase() + numero;
  };

  const toggleCurso = (nombreCurso: string) => {
    setCursosExpandidos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nombreCurso)) {
        newSet.delete(nombreCurso);
      } else {
        newSet.add(nombreCurso);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Mis Notas</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Consulta tus calificaciones por período académico</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-400" />
            <select
              id="periodo"
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
        </div>
      </div>

      {/* Promedio General KPI */}
      {!isLoading && misCursos && misCursos.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Promedio General</p>
              <p className={`text-4xl font-bold font-mono tabular-nums ${getNotaColor(promedioGeneral)}`}>
                {promedioGeneral.toFixed(2)}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Escala 0 - 20</p>
            </div>
            <div className="h-14 w-14 bg-zinc-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-zinc-600" />
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

      {/* Notas por Curso - Accordion Style */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="animate-pulse text-zinc-400 text-sm">Cargando notas...</div>
        </div>
      ) : periodosActivos.length > 0 && notasPorCurso && Object.keys(notasPorCurso).length > 0 ? (
        <div className="space-y-3">
          {Object.entries(notasPorCurso).map(([nombreCurso, notasCurso]) => {
            const promedioGeneral = calcularPromedioGeneral(notasCurso);
            const promedioFinal = calcularPromedioFinal(notasCurso);
            const pesoTotal = notasCurso.reduce((sum, n) => sum + n.peso, 0);
            const isExpanded = cursosExpandidos.has(nombreCurso);
            
            return (
              <div key={nombreCurso} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                {/* Header del curso - Clickeable */}
                <button
                  onClick={() => toggleCurso(nombreCurso)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-zinc-400" />
                    )}
                    <span className="text-sm font-medium text-zinc-900">{nombreCurso}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">Promedio:</span>
                    <span className={`px-2.5 py-1 rounded-full text-sm font-bold font-mono tabular-nums border ${getNotaBgColor(promedioFinal)}`}>
                      {promedioFinal}
                    </span>
                  </div>
                </button>

                {/* Contenido expandible */}
                {isExpanded && (
                  <div className="border-t border-zinc-200">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide w-16">Tipo</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Evaluación</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide w-20">Nota</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide w-20">Peso</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide w-24">Puntaje</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {notasCurso.map((nota) => {
                          const puntaje = (nota.notaValor * nota.peso / 100).toFixed(2);
                          const abreviacion = generarAbreviacion(nota.tipoEvaluacion);
                          
                          return (
                            <tr key={nota.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center justify-center w-10 h-8 rounded text-xs font-bold border ${getBadgeClasses(nota.tipoEvaluacion)}`}>
                                  {abreviacion}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-zinc-700">{nota.tipoEvaluacion}</td>
                              <td className="px-4 py-3 text-center">
                                {nota.notaValor > 0 ? (
                                  <span className={`text-sm font-bold font-mono tabular-nums ${getNotaColor(nota.notaValor)}`}>
                                    {nota.notaValor.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="text-xs text-zinc-400">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-xs font-mono tabular-nums text-zinc-500">{nota.peso}%</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {nota.notaValor > 0 ? (
                                  <span className="text-sm font-mono tabular-nums text-zinc-700">{puntaje}</span>
                                ) : (
                                  <span className="text-xs text-zinc-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                        {/* Fila de Resumen */}
                        <tr className="bg-zinc-50/80 border-t border-zinc-200">
                          <td colSpan={2} className="px-4 py-3">
                            <span className="text-xs font-medium text-zinc-500 uppercase">Total</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs text-zinc-400">—</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs font-mono tabular-nums text-zinc-600 font-medium">{pesoTotal}%</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-lg font-bold font-mono tabular-nums ${getNotaColor(promedioGeneral)}`}>
                              {promedioGeneral.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
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

