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
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Registro de Notas</h1>
            <p className="text-gray-600 mt-1">
              Historial académico completo de todos los semestres cerrados
            </p>
          </div>
          <button
            onClick={exportarAPDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors print:hidden"
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
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900">
                    {semestre.periodo}
                  </h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {semestre.anio} - {semestre.ciclo}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      semestre.estado === 'Cerrado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {semestre.estado}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Estadísticas Rápidas */}
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500">Créditos</p>
                    <p className="font-bold text-indigo-600">{semestre.totales.totalCreditos}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">PSem</p>
                    <p className="font-bold text-green-600">
                      {semestre.totales.promedioSemestral.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">PAc</p>
                    <p className="font-bold text-blue-600">
                      {semestre.totales.promedioAcumulado.toFixed(2)}
                    </p>
                  </div>
                </div>

                {semestreExpandido === semestre.idPeriodo ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Código
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Asignatura
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Fecha Examen
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Créditos
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Horas
                        </th>
                        
                        {/* Columnas dinámicas de evaluaciones */}
                        {semestre.cursos[0]?.evaluaciones.map((evaluacion, i) => (
                          <th 
                            key={i} 
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase"
                          >
                            <div>{evaluacion.nombre}</div>
                            <div className="text-gray-400 normal-case">({evaluacion.peso}%)</div>
                          </th>
                        ))}

                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          NF
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          PSem
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          PAc
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {semestre.cursos.map((curso) => (
                        <tr key={curso.idMatricula} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {curso.codigoCurso}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {curso.nombreCurso}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">
                            {curso.fechaExamen 
                              ? new Date(curso.fechaExamen).toLocaleDateString('es-PE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">
                            {curso.creditos}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">
                            {curso.horasSemanal}
                          </td>

                          {/* Notas de evaluaciones */}
                          {curso.evaluaciones.map((evaluacion, i) => (
                            <td key={i} className="px-4 py-3 text-sm text-center font-medium text-gray-900">
                              {evaluacion.nota.toFixed(1)}
                            </td>
                          ))}

                          {/* Nota Final */}
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                              curso.notaFinal >= 11
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {curso.notaFinal}
                            </span>
                          </td>

                          {/* Estado */}
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              curso.estadoCurso === 'Aprobado'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {curso.estadoCurso}
                            </span>
                          </td>
                          {/* PSem - Solo en la primera fila */}
                          {semestre.cursos.indexOf(curso) === 0 && (
                            <td 
                              rowSpan={semestre.cursos.length} 
                              className="px-4 py-3 text-center bg-green-50 border-l-2 border-green-200"
                            >
                              <div className="flex flex-col items-center">
                                <TrendingUp className="w-5 h-5 text-green-600 mb-1" />
                                <span className="text-lg font-bold text-green-700">
                                  {semestre.totales.promedioSemestral.toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-500">Semestral</span>
                              </div>
                            </td>
                          )}
                          {/* PAc - Solo en la primera fila */}
                          {semestre.cursos.indexOf(curso) === 0 && (
                            <td 
                              rowSpan={semestre.cursos.length} 
                              className="px-4 py-3 text-center bg-blue-50 border-l-2 border-blue-200"
                            >
                              <div className="flex flex-col items-center">
                                <Award className="w-5 h-5 text-blue-600 mb-1" />
                                <span className="text-lg font-bold text-blue-700">
                                  {semestre.totales.promedioAcumulado.toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-500">Acumulado</span>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}

                      {/* Fila de Totales */}
                      <tr className="bg-indigo-50 font-bold">
                        <td colSpan={3} className="px-4 py-3 text-sm text-gray-900">
                          TOTALES
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-indigo-900">
                          {semestre.totales.totalCreditos}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900">
                          {semestre.totales.totalHoras}
                        </td>
                        <td 
                          colSpan={semestre.cursos[0]?.evaluaciones.length || 0} 
                          className="px-4 py-3 text-sm text-center text-gray-900"
                        >
                          {/* Espacio vacío */}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          -
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          -
                        </td>
                        <td className="px-4 py-3 text-sm text-center bg-green-50 border-l-2 border-green-200">
                          <div className="flex items-center justify-center gap-1 text-green-700">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-bold">{semestre.totales.promedioSemestral.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center bg-blue-50 border-l-2 border-blue-200">
                          <div className="flex items-center justify-center gap-1 text-blue-700">
                            <Award className="w-4 h-4" />
                            <span className="font-bold">{semestre.totales.promedioAcumulado.toFixed(2)}</span>
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
