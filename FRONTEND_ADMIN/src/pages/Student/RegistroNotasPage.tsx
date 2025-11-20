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
  Download,
  Loader2
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
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando registro de notas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error al cargar el registro de notas</p>
      </div>
    );
  }

  if (!registroNotas || registroNotas.semestres.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <p className="text-blue-800 font-medium">No hay semestres cerrados registrados</p>
        <p className="text-blue-600 text-sm mt-1">
          Los registros aparecerán cuando se cierren los periodos académicos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white shadow border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Registro de Notas</h1>
            <p className="text-gray-600">
              Historial académico completo de todos los semestres cerrados
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Aprobado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Desaprobado</span>
              </div>
            </div>
          </div>
          <button
            onClick={exportarAPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm print:hidden"
          >
            <Download className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Lista de Semestres */}
      <div className="space-y-4">
        {registroNotas.semestres.map((semestre: SemestreRegistro, index: number) => (
          <div 
            key={semestre.idPeriodo} 
            className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200"
          >
            {/* Cabecera del Semestre - Clickeable */}
            <button
              onClick={() => toggleSemestre(semestre.idPeriodo)}
              className="w-full px-6 py-5 flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 text-white w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xl shadow-sm">
                  {index + 1}
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900">
                    {semestre.periodo}
                  </h2>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      {semestre.anio} - Ciclo {semestre.ciclo}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      semestre.estado === 'Cerrado' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {semestre.estado}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Estadísticas Rápidas */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-center shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Créditos</p>
                    <p className="text-xl font-bold text-indigo-600">{semestre.totales.totalCreditos}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-center shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">PSem</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {semestre.totales.promedioSemestral.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-center shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">PAc</p>
                    <p className="text-xl font-bold text-blue-600">
                      {semestre.totales.promedioAcumulado.toFixed(2)}
                    </p>
                  </div>
                </div>

                {semestreExpandido === semestre.idPeriodo ? (
                  <ChevronUp className="w-6 h-6 text-indigo-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-indigo-600" />
                )}
              </div>
            </button>

            {/* Contenido Expandible */}
            {semestreExpandido === semestre.idPeriodo && (
              <div className="p-6">
                {semestre.estado === 'Abierto' && (
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Periodo en curso. Las notas se consolidarán al cierre del semestre.
                    </p>
                  </div>
                )}

                {/* Tabla de Cursos */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Asignatura
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Fecha Examen
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Créditos
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Horas
                        </th>
                        
                        {/* Columnas dinámicas de evaluaciones */}
                        {semestre.cursos[0]?.evaluaciones.map((evaluacion, i) => (
                          <th 
                            key={i} 
                            className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider bg-indigo-50"
                          >
                            <div className="font-bold">{evaluacion.nombre}</div>
                            <div className="text-gray-500 normal-case font-normal">({evaluacion.peso}%)</div>
                          </th>
                        ))}

                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider bg-emerald-50">
                          Nota Final
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider bg-emerald-50">
                          PSem
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider bg-blue-50">
                          PAc
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {semestre.cursos.map((curso) => (
                        <tr key={curso.idMatricula} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded font-mono text-xs font-semibold">
                              {curso.codigoCurso}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {curso.nombreCurso}
                          </td>
                          <td className="px-6 py-4 text-xs text-center text-gray-600">
                            {curso.fechaExamen 
                              ? new Date(curso.fechaExamen).toLocaleDateString('es-PE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })
                              : '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-semibold">
                              {curso.creditos}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-gray-600">
                            {curso.horasSemanal}
                          </td>

                          {/* Notas de evaluaciones */}
                          {curso.evaluaciones.map((evaluacion, i) => (
                            <td key={i} className="px-6 py-4 text-center bg-indigo-50/30">
                              <span className="text-base font-bold text-gray-900">{evaluacion.nota.toFixed(1)}</span>
                            </td>
                          ))}

                          {/* Nota Final */}
                          <td className="px-6 py-4 text-center bg-emerald-50/30">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-base font-bold shadow-sm ${
                              curso.notaFinal >= 11
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {curso.notaFinal}
                            </span>
                          </td>

                          {/* Estado */}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              curso.estadoCurso === 'Aprobado'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {curso.estadoCurso}
                            </span>
                          </td>
                          {/* PSem - Solo en la primera fila */}
                          {semestre.cursos.indexOf(curso) === 0 && (
                            <td 
                              rowSpan={semestre.cursos.length} 
                              className="px-6 py-4 text-center bg-emerald-50/50 border-l-4 border-emerald-200"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-2xl font-bold text-emerald-700">
                                  {semestre.totales.promedioSemestral.toFixed(2)}
                                </span>
                                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Semestral</span>
                              </div>
                            </td>
                          )}
                          {/* PAc - Solo en la primera fila */}
                          {semestre.cursos.indexOf(curso) === 0 && (
                            <td 
                              rowSpan={semestre.cursos.length} 
                              className="px-6 py-4 text-center bg-blue-50/50 border-l-4 border-blue-200"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Award className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-2xl font-bold text-blue-700">
                                  {semestre.totales.promedioAcumulado.toFixed(2)}
                                </span>
                                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Acumulado</span>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}

                      {/* Fila de Totales */}
                      <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                        <td colSpan={3} className="px-6 py-4 text-sm font-bold text-gray-900 uppercase tracking-wide">
                          Totales del Semestre
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1.5 bg-indigo-200 text-indigo-800 rounded-lg text-sm font-bold">
                            {semestre.totales.totalCreditos}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-semibold text-gray-700">
                            {semestre.totales.totalHoras}
                          </span>
                        </td>
                        <td 
                          colSpan={semestre.cursos[0]?.evaluaciones.length || 0} 
                          className="px-6 py-4 text-sm text-center text-gray-500"
                        >
                          {/* Espacio vacío */}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-500">
                          -
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-500">
                          -
                        </td>
                        <td className="px-6 py-4 text-center bg-emerald-50/50 border-l-4 border-emerald-200">
                          <div className="flex items-center justify-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            <span className="text-lg font-bold text-emerald-700">{semestre.totales.promedioSemestral.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center bg-blue-50/50 border-l-4 border-blue-200">
                          <div className="flex items-center justify-center gap-2">
                            <Award className="w-5 h-5 text-blue-600" />
                            <span className="text-lg font-bold text-blue-700">{semestre.totales.promedioAcumulado.toFixed(2)}</span>
                          </div>
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
