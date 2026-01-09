import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { SemestreRegistro } from '../../types/estudiante';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Calendar,
  Award,
  TrendingUp,
  Download
} from 'lucide-react';

export default function RegistroNotasPage() {
  const [semestreExpandido, setSemestreExpandido] = useState<number | null>(null);

  const { data: registroNotas, isLoading, error } = useQuery({
    queryKey: ['registro-notas'],
    queryFn: () => estudiantesApi.getRegistroNotas(),
  });

  const toggleSemestre = (idPeriodo: number) => {
    setSemestreExpandido(semestreExpandido === idPeriodo ? null : idPeriodo);
  };

  const exportarAPDF = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Cargando registro de notas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-700 text-sm">Error al cargar el registro de notas</p>
      </div>
    );
  }

  if (!registroNotas || registroNotas.semestres.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-6 h-6 text-zinc-400" />
        </div>
        <h3 className="text-sm font-medium text-zinc-900">No hay semestres cerrados</h3>
        <p className="text-zinc-500 text-sm mt-1">
          Los registros aparecerán cuando se cierren los periodos académicos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Registro de Notas</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Historial académico completo de todos los semestres
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-500">Aprobado</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-zinc-500">Desaprobado</span>
            </span>
          </div>
          <button
            onClick={exportarAPDF}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors print:hidden"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Lista de Semestres */}
      <div className="space-y-4">
        {registroNotas.semestres.map((semestre: SemestreRegistro) => (
          <div
            key={semestre.idPeriodo}
            className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden"
          >
            {/* Cabecera del Semestre */}
            <button
              onClick={() => toggleSemestre(semestre.idPeriodo)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-zinc-900 text-white w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm">
                  {semestre.cicloAcademico}
                </div>
                <div className="text-left">
                  <h2 className="text-base font-semibold text-zinc-900">
                    {semestre.periodo}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {semestre.anio} - Ciclo {semestre.cicloAcademico}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${semestre.estado === 'Cerrado'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                      {semestre.estado}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Stats */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-zinc-400 uppercase tracking-wider">Créditos</p>
                    <p className="text-lg font-semibold text-zinc-900 tabular-nums">{semestre.totales.totalCreditos}</p>
                  </div>
                  <div className="w-px h-8 bg-zinc-200" />
                  <div className="text-right">
                    <p className="text-xs text-zinc-400 uppercase tracking-wider">PSem</p>
                    <p className="text-lg font-semibold text-emerald-600 tabular-nums">
                      {semestre.totales.promedioSemestral.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-zinc-200" />
                  <div className="text-right">
                    <p className="text-xs text-zinc-400 uppercase tracking-wider">PAc</p>
                    <p className="text-lg font-semibold text-zinc-900 tabular-nums">
                      {semestre.totales.promedioAcumulado.toFixed(2)}
                    </p>
                  </div>
                </div>

                {semestreExpandido === semestre.idPeriodo ? (
                  <ChevronUp className="w-5 h-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                )}
              </div>
            </button>

            {/* Contenido Expandible */}
            {semestreExpandido === semestre.idPeriodo && (
              <div className="border-t border-zinc-100 p-6">
                {semestre.estado === 'Abierto' && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-amber-700 text-sm">
                      Periodo en curso. Las notas se consolidarán al cierre del semestre.
                    </p>
                  </div>
                )}

                {/* Tabla de Cursos */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Asignatura
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Créd
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Hrs
                        </th>

                        {/* Columnas dinámicas de evaluaciones */}
                        {semestre.cursos[0]?.evaluaciones.map((evaluacion, i) => (
                          <th
                            key={i}
                            className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider bg-zinc-100/50"
                          >
                            <div>{evaluacion.nombre}</div>
                            <div className="text-zinc-400 normal-case font-normal">({evaluacion.peso}%)</div>
                          </th>
                        ))}

                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider bg-emerald-50/50">
                          Final
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider bg-emerald-50/50">
                          PSem
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider bg-zinc-100/50">
                          PAc
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {semestre.cursos.map((curso) => (
                        <tr key={curso.idMatricula} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-zinc-500">
                              {curso.codigoCurso}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-zinc-900">
                            {curso.nombreCurso}
                          </td>
                          <td className="px-4 py-3 text-xs text-center text-zinc-500 tabular-nums">
                            {curso.fechaExamen
                              ? new Date(curso.fechaExamen).toLocaleDateString('es-PE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm text-zinc-600 font-mono">{curso.creditos}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-zinc-500">
                            {curso.horasSemanal}
                          </td>

                          {/* Notas de evaluaciones */}
                          {curso.evaluaciones.map((evaluacion, i) => (
                            <td key={i} className="px-4 py-3 text-center bg-zinc-50/30">
                              <span className="text-sm font-semibold text-zinc-900 tabular-nums">{evaluacion.nota.toFixed(1)}</span>
                            </td>
                          ))}

                          {/* Nota Final */}
                          <td className="px-4 py-3 text-center bg-emerald-50/30">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold border tabular-nums ${curso.notaFinal >= 11
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                              {curso.notaFinal}
                            </span>
                          </td>

                          {/* Estado */}
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${curso.estadoCurso === 'Aprobado'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                              {curso.estadoCurso === 'Aprobado' ? 'Aprob' : 'Desap'}
                            </span>
                          </td>
                          {/* PSem - Solo en la primera fila */}
                          {semestre.cursos.indexOf(curso) === 0 && (
                            <td
                              rowSpan={semestre.cursos.length}
                              className="px-4 py-3 text-center bg-emerald-50/50 border-l border-zinc-200"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                <span className="text-xl font-semibold text-emerald-700 tabular-nums">
                                  {semestre.totales.promedioSemestral.toFixed(2)}
                                </span>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Semestral</span>
                              </div>
                            </td>
                          )}
                          {/* PAc - Solo en la primera fila */}
                          {semestre.cursos.indexOf(curso) === 0 && (
                            <td
                              rowSpan={semestre.cursos.length}
                              className="px-4 py-3 text-center bg-zinc-50/50 border-l border-zinc-200"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <Award className="w-4 h-4 text-zinc-600" />
                                <span className="text-xl font-semibold text-zinc-900 tabular-nums">
                                  {semestre.totales.promedioAcumulado.toFixed(2)}
                                </span>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Acumulado</span>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}

                      {/* Fila de Totales */}
                      <tr className="bg-zinc-50 border-t border-zinc-200">
                        <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                          Totales del Semestre
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-semibold text-zinc-900 tabular-nums">
                            {semestre.totales.totalCreditos}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-zinc-600 tabular-nums">
                            {semestre.totales.totalHoras}
                          </span>
                        </td>
                        <td
                          colSpan={semestre.cursos[0]?.evaluaciones.length || 0}
                          className="px-4 py-3"
                        />
                        <td className="px-4 py-3 text-center text-zinc-400">-</td>
                        <td className="px-4 py-3 text-center text-zinc-400">-</td>
                        <td className="px-4 py-3 text-center bg-emerald-50/50 border-l border-zinc-200">
                          <span className="text-sm font-semibold text-emerald-700 tabular-nums">{semestre.totales.promedioSemestral.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3 text-center bg-zinc-50/50 border-l border-zinc-200">
                          <span className="text-sm font-semibold text-zinc-900 tabular-nums">{semestre.totales.promedioAcumulado.toFixed(2)}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

