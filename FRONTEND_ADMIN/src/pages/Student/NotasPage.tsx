import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { FileText, TrendingUp, ChevronDown, AlertCircle } from 'lucide-react';

// ============================================
// Utility Functions
// ============================================

const getNotaColor = (nota: number): string => {
  if (nota >= 14) return 'text-emerald-600';
  if (nota >= 11) return 'text-zinc-900';
  return 'text-red-600';
};

const getBadgeStyles = (tipoEvaluacion: string): string => {
  const tipo = tipoEvaluacion.toLowerCase();
  if (tipo.includes('práctica') || tipo.includes('practica')) {
    return 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20';
  }
  if (tipo.includes('trabajo')) {
    return 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20';
  }
  if (tipo.includes('medio curso') || tipo.includes('mediocurso')) {
    return 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20';
  }
  if (tipo.includes('actitud')) {
    return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
  }
  if (tipo.includes('examen') || tipo.includes('final')) {
    return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20';
  }
  return 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-600/10';
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

// ============================================
// Main Component
// ============================================

const NotasPage: React.FC = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | undefined>(undefined);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  const { data: periodos } = useQuery({
    queryKey: ['periodos'],
    queryFn: estudiantesApi.getPeriodos,
  });

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

  const notas = notasResponse?.notas || [];
  const promedioGeneralServidor = notasResponse?.promedioGeneral || 0;

  const notasPorCurso = notas.reduce((acc, nota) => {
    if (!acc[nota.nombreCurso]) acc[nota.nombreCurso] = [];
    acc[nota.nombreCurso].push(nota);
    return acc;
  }, {} as Record<string, typeof notas>);

  const calcularPromedioGeneral = (notasCurso: typeof notas) => {
    if (!notasCurso || notasCurso.length === 0) return 0;
    return notasCurso.reduce((sum, n) => sum + (n.notaValor * n.peso / 100), 0);
  };

  const calcularPromedioFinal = (notasCurso: typeof notas) => {
    if (!notasCurso || notasCurso.length === 0) return 0;
    const notasConValor = notasCurso.filter(n => n.notaValor > 0);
    if (notasConValor.length === 0) return 0;
    const pesoTotal = notasConValor.reduce((sum, n) => sum + n.peso, 0);
    if (pesoTotal === 0) return 0;
    return Math.round(notasConValor.reduce((sum, n) => sum + (n.notaValor * n.peso / 100), 0));
  };

  const toggleCourse = (courseName: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseName)) newSet.delete(courseName);
      else newSet.add(courseName);
      return newSet;
    });
  };

  // Expand all courses by default
  React.useEffect(() => {
    if (Object.keys(notasPorCurso).length > 0 && expandedCourses.size === 0) {
      setExpandedCourses(new Set(Object.keys(notasPorCurso)));
    }
  }, [notasPorCurso]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ==================== Header ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Mis Notas</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Consulta tus calificaciones del período académico</p>
        </div>
        <select
          value={periodoSeleccionado || ''}
          onChange={(e) => setPeriodoSeleccionado(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg text-zinc-700 
            focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-colors"
        >
          <option value="">Periodo Activo</option>
          {periodosActivos.map((periodo) => (
            <option key={periodo.id} value={periodo.id}>
              {periodo.nombre} {periodo.activo && '(Activo)'}
            </option>
          ))}
        </select>
      </div>

      {/* ==================== Promedio General Card ==================== */}
      {!isLoading && misCursos && misCursos.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Promedio General del Período</p>
              </div>
              <p className="text-5xl font-semibold tracking-tight mt-3">
                {promedioGeneralServidor.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-zinc-500">Escala</p>
              <p className="text-[13px] text-zinc-300 font-medium">0 — 20</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== No Active Period Message ==================== */}
      {!isLoading && periodosActivos.length === 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200/50 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-[15px] font-semibold text-amber-900 mb-2">
            No hay periodo académico activo
          </h3>
          <p className="text-[13px] text-amber-700 max-w-md mx-auto">
            Las notas de periodos cerrados se encuentran en el <span className="font-medium">Registro de Notas</span>.
          </p>
        </div>
      )}

      {/* ==================== Loading State ==================== */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
        </div>
      )}

      {/* ==================== Courses with Grades ==================== */}
      {!isLoading && periodosActivos.length > 0 && Object.keys(notasPorCurso).length > 0 && (
        <div className="space-y-4">
          {Object.entries(notasPorCurso).map(([nombreCurso, notasCurso]) => {
            const isExpanded = expandedCourses.has(nombreCurso);
            const promedioFinal = calcularPromedioFinal(notasCurso);
            const pesoTotal = notasCurso.reduce((sum, n) => sum + n.peso, 0);
            
            return (
              <div key={nombreCurso} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                {/* Course Header (Clickable) */}
                <button
                  onClick={() => toggleCourse(nombreCurso)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-[14px] font-semibold text-zinc-900">{nombreCurso}</h3>
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold
                      ${promedioFinal >= 11 
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' 
                        : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                      }
                    `}>
                      PF: {promedioFinal}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Grades Table (Collapsible) */}
                {isExpanded && (
                  <div className="border-t border-zinc-100">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-zinc-100">
                          <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Tipo</th>
                          <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Evaluación</th>
                          <th className="px-5 py-3 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Nota</th>
                          <th className="px-5 py-3 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Peso</th>
                          <th className="px-5 py-3 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Puntaje</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {notasCurso.map((nota) => {
                          const puntaje = (nota.notaValor * nota.peso / 100);
                          const abreviacion = generarAbreviacion(nota.tipoEvaluacion);
                          
                          return (
                            <tr key={nota.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-5 py-3">
                                <span className={`inline-flex items-center justify-center w-10 h-8 rounded-lg text-[10px] font-bold ${getBadgeStyles(nota.tipoEvaluacion)}`}>
                                  {abreviacion}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <span className="text-[13px] text-zinc-700">{nota.tipoEvaluacion}</span>
                              </td>
                              <td className="px-5 py-3 text-right">
                                {nota.notaValor > 0 ? (
                                  <span className={`text-[14px] font-semibold font-mono ${getNotaColor(nota.notaValor)}`}>
                                    {nota.notaValor.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="text-[12px] text-zinc-400 italic">Pendiente</span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <span className="text-[12px] font-mono text-zinc-500">{nota.peso}%</span>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <span className="text-[13px] font-mono font-medium text-zinc-700">
                                  {nota.notaValor > 0 ? puntaje.toFixed(2) : '—'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {/* Summary Footer */}
                      <tfoot>
                        <tr className="bg-zinc-50/80 border-t border-zinc-200">
                          <td colSpan={2} className="px-5 py-3">
                            <span className="text-[12px] font-semibold text-zinc-600">Promedio Final</span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className={`text-[16px] font-bold font-mono ${promedioFinal >= 11 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {promedioFinal}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="text-[12px] font-mono text-zinc-500">{pesoTotal}%</span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="text-[13px] font-mono font-semibold text-zinc-700">
                              {calcularPromedioGeneral(notasCurso).toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== Empty State ==================== */}
      {!isLoading && periodosActivos.length > 0 && Object.keys(notasPorCurso).length === 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-5 h-5 text-zinc-400" />
          </div>
          <h3 className="text-[14px] font-semibold text-zinc-900 mb-1">No hay notas registradas</h3>
          <p className="text-[13px] text-zinc-500">
            {periodoSeleccionado
              ? 'No tienes notas en el período seleccionado'
              : 'Aún no se han registrado notas para tus cursos'}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotasPage;

