import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { cursosApi } from '../../services/cursosService';
import { adminCursosApi } from '../../services/adminCursosApi';
import { FileText, Filter } from 'lucide-react';

export default function NotasConsolidadasAdminPage() {
  const [filtroCurso, setFiltroCurso] = useState<number | undefined>(undefined);
  const [filtroEstudiante, setFiltroEstudiante] = useState<number | undefined>(undefined);
  const [filtroPeriodo, setFiltroPeriodo] = useState<number | undefined>(undefined);

  const { data: cursos } = useQuery({
    queryKey: ['cursos'],
    queryFn: () => cursosApi.getAll(),
  });

  const { data: periodos } = useQuery({
    queryKey: ['periodos-admin'],
    queryFn: () => adminCursosApi.getPeriodos(),
  });

  const { data: notas, isLoading } = useQuery({
    queryKey: ['notas-consolidadas', filtroCurso, filtroEstudiante, filtroPeriodo],
    queryFn: () => adminApi.getNotasConsolidadas({
      idCurso: filtroCurso,
      idEstudiante: filtroEstudiante,
      idPeriodo: filtroPeriodo,
    }),
  });

  // Agrupar notas por matrícula y calcular promedios
  const notasAgrupadas = React.useMemo(() => {
    if (!notas) return [];
    
    // Agrupar notas por matrícula
    const notasPorMatricula = notas.reduce((acc, nota) => {
      if (!acc[nota.idMatricula]) {
        acc[nota.idMatricula] = [];
      }
      acc[nota.idMatricula].push(nota);
      return acc;
    }, {} as Record<number, typeof notas>);

    // Calcular promedio para cada matrícula y crear estructura agrupada
    const grupos = Object.entries(notasPorMatricula).map(([idMatricula, notasMatricula]) => {
      const primeraNota = notasMatricula[0];
      const notasConValor = notasMatricula.filter(n => n.nota > 0 && n.peso);
      
      let promedioFinal: number | null = null;
      if (notasConValor.length > 0) {
        const pesoTotal = notasConValor.reduce((sum, n) => sum + (n.peso || 0), 0);
        if (pesoTotal > 0) {
          promedioFinal = notasConValor.reduce((sum, n) => sum + (n.nota * (n.peso || 0) / 100), 0);
        }
      }

      return {
        idMatricula: Number(idMatricula),
        notas: notasMatricula,
        promedioFinal,
        nombreEstudiante: primeraNota.nombreEstudiante,
        codigoEstudiante: primeraNota.codigoEstudiante,
        nombreCurso: primeraNota.nombreCurso,
        nombrePeriodo: primeraNota.nombrePeriodo,
      };
    });

    return grupos;
  }, [notas]);

  const getNotaColor = (nota: number | null | undefined) => {
    if (nota == null || nota === 0) return 'text-zinc-400';
    if (nota >= 14) return 'text-emerald-600';
    if (nota >= 11) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Notas Consolidadas</h1>
            <p className="text-sm text-zinc-500 mt-1">Consulta y gestiona todas las notas del sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-600">Filtros</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-xs font-medium text-zinc-700 mb-2">Período</label>
            <select
              value={filtroPeriodo || ''}
              onChange={(e) => setFiltroPeriodo(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
            >
              <option value="">Todos los períodos</option>
              {periodos?.map((periodo) => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-2">Estudiante (ID)</label>
            <input
              type="number"
              value={filtroEstudiante || ''}
              onChange={(e) => setFiltroEstudiante(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="ID del estudiante"
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Notas */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="animate-pulse text-zinc-400 text-sm">Cargando notas...</div>
        </div>
      ) : notas && notas.length > 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Estudiante</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Curso</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Período</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Evaluación</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Nota</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Peso</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Promedio Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {notasAgrupadas.map((grupo, grupoIndex) => (
                  <React.Fragment key={grupo.idMatricula}>
                    {grupo.notas.map((nota, notaIndex) => (
                      <tr key={nota.id} className="hover:bg-zinc-50/50 transition-colors">
                        {notaIndex === 0 && (
                          <>
                            <td className="px-4 py-3" rowSpan={grupo.notas.length}>
                              <div className="text-sm font-medium text-zinc-900">{grupo.nombreEstudiante}</div>
                              <div className="text-xs text-zinc-500">{grupo.codigoEstudiante}</div>
                            </td>
                            <td className="px-4 py-3" rowSpan={grupo.notas.length}>
                              <div className="text-sm text-zinc-900">{grupo.nombreCurso}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-600" rowSpan={grupo.notas.length}>
                              {grupo.nombrePeriodo || '—'}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3 text-sm text-zinc-700">{nota.tipoEvaluacion}</td>
                        <td className="px-4 py-3 text-center">
                          {nota.nota != null && nota.nota > 0 ? (
                            <span className={`text-sm font-bold font-mono tabular-nums ${getNotaColor(nota.nota)}`}>
                              {nota.nota.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-mono tabular-nums text-zinc-500">{nota.peso || 0}%</span>
                        </td>
                        {notaIndex === 0 && (
                          <td className="px-4 py-3 text-center" rowSpan={grupo.notas.length}>
                            {grupo.promedioFinal != null && grupo.promedioFinal > 0 ? (
                              <span className={`text-sm font-bold font-mono tabular-nums ${getNotaColor(grupo.promedioFinal)}`}>
                                {grupo.promedioFinal.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-400">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl py-16 text-center">
          <FileText className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 mb-1">No hay notas registradas</p>
          <p className="text-xs text-zinc-400">No se encontraron notas con los filtros seleccionados</p>
        </div>
      )}
    </div>
  );
}
