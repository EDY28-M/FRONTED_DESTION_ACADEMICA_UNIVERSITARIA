import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { FileText, TrendingUp } from 'lucide-react';

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
    enabled: periodosActivos.length > 0, // Solo ejecutar si hay periodos activos
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

  // Usar el promedio general del servidor (excluye cursos retirados y calcula correctamente)
  const promedioGeneral = promedioGeneralServidor;

  const getNotaColor = (nota: number) => {
    if (nota >= 14) return 'text-green-600';
    if (nota >= 11) return 'text-blue-600';
    return 'text-red-600';
  };

  const getBadgeClasses = (tipoEvaluacion: string) => {
    const tipo = tipoEvaluacion.toLowerCase();
    if (tipo.includes('práctica') || tipo.includes('practica')) {
      return 'bg-teal-100 text-teal-800 border border-teal-300';
    }
    if (tipo.includes('trabajo')) {
      return 'bg-indigo-100 text-indigo-800 border border-indigo-300';
    }
    if (tipo.includes('medio curso') || tipo.includes('mediocurso')) {
      return 'bg-cyan-100 text-cyan-800 border border-cyan-300';
    }
    if (tipo.includes('actitud')) {
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    }
    if (tipo.includes('examen') || tipo.includes('final')) {
      return 'bg-purple-100 text-purple-800 border border-purple-300';
    }
    return 'bg-gray-100 text-gray-800 border border-gray-300';
  };

  const generarAbreviacion = (tipoEvaluacion: string): string => {
    const tipo = tipoEvaluacion.toLowerCase();
    
    // Extraer número si existe
    const numeroMatch = tipoEvaluacion.match(/\d+/);
    const numero = numeroMatch ? numeroMatch[0] : '';

    // Trabajo Encargado
    if (tipo.includes('trabajo') && tipo.includes('encargado')) {
      return `TE${numero}`;
    }
    // Prácticas
    if (tipo.includes('práctica') || tipo.includes('practica')) {
      return `PR${numero}`;
    }
    // Examen Parcial
    if (tipo.includes('parcial')) {
      return `EP${numero}`;
    }
    // Medio Curso
    if (tipo.includes('medio curso') || tipo.includes('mediocurso')) {
      return 'MC';
    }
    // Examen Final
    if (tipo.includes('examen') && tipo.includes('final')) {
      return 'EF';
    }
    // Evaluación Actitudinal / Actitud
    if (tipo.includes('actitud')) {
      return `EA${numero}`;
    }
    // Trabajos (general)
    if (tipo.includes('trabajo')) {
      return `T${numero}`;
    }
    // Examen (general)
    if (tipo.includes('examen')) {
      return `EX${numero}`;
    }
    
    // Por defecto, tomar iniciales
    const palabras = tipoEvaluacion.split(' ').filter(p => p.length > 0);
    if (palabras.length >= 2) {
      return palabras.slice(0, 2).map(p => p[0].toUpperCase()).join('') + numero;
    }
    return tipoEvaluacion.substring(0, 2).toUpperCase() + numero;
  };

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mis Notas</h2>
            <p className="text-sm text-gray-500 mt-1">Consulta tus calificaciones por período</p>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="periodo" className="text-sm text-gray-700">Período:</label>
            <select
              id="periodo"
              value={periodoSeleccionado || ''}
              onChange={(e) => setPeriodoSeleccionado(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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

      {/* Promedio General */}
      {!isLoading && misCursos && misCursos.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 mb-1">Promedio General</p>
              <p className="text-5xl font-bold">{promedioGeneral.toFixed(2)}</p>
            </div>
            <div className="h-20 w-20 bg-purple-700 rounded-full flex items-center justify-center">
              <TrendingUp className="h-10 w-10" />
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay periodos activos */}
      {!isLoading && periodosActivos.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <FileText className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-yellow-900 mb-2">
            No hay periodo académico activo
          </h3>
          <p className="text-yellow-700 mb-4">
            Actualmente no hay ningún periodo académico abierto. Las notas de periodos cerrados se encuentran en el <strong>Registro de Notas</strong>.
          </p>
          <p className="text-sm text-yellow-600">
            Para consultar tus notas históricas, dirígete a la sección "Registro de Notas" en el menú lateral.
          </p>
        </div>
      )}

      {/* Notas por curso */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando notas...</p>
        </div>
      ) : periodosActivos.length > 0 && notasPorCurso && Object.keys(notasPorCurso).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(notasPorCurso).map(([nombreCurso, notasCurso]) => {
            const promedioGeneral = calcularPromedioGeneral(notasCurso);
            const promedioFinal = calcularPromedioFinal(notasCurso);
            const pesoTotal = notasCurso.reduce((sum, n) => sum + n.peso, 0);
            
            return (
              <div key={nombreCurso} className="bg-white rounded-lg shadow border border-gray-200">
                {/* Header del curso */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">{nombreCurso}</h3>
                  </div>
                </div>

                {/* Tabla de notas */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Evaluación
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Nota
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Prom
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Peso
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Puntaje
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notasCurso.map((nota) => {
                        const puntaje = (nota.notaValor * nota.peso / 100).toFixed(3);
                        const promPorNota = nota.notaValor > 0 ? nota.notaValor : 0;
                        const abreviacion = generarAbreviacion(nota.tipoEvaluacion);
                        
                        return (
                          <tr key={nota.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded text-xs font-bold ${getBadgeClasses(nota.tipoEvaluacion)}`}>
                                {abreviacion}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{nota.tipoEvaluacion}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {nota.notaValor > 0 ? (
                                <span className={`text-base font-bold ${getNotaColor(nota.notaValor)}`}>
                                  {nota.notaValor.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400 italic">Pendiente</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {nota.notaValor > 0 ? (
                                <span className="text-sm font-medium text-gray-900">
                                  {promPorNota.toFixed(3)}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">0.000</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm font-medium text-gray-700">{nota.peso}%</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {nota.notaValor > 0 ? (
                                <span className="text-sm font-bold text-purple-700">{puntaje}</span>
                              ) : (
                                <span className="text-sm text-gray-400">0</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Fila de Promedio General */}
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan={2} className="px-4 py-3 text-left">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-800 border border-gray-400">
                            PG
                          </span>
                          <span className="ml-3 text-sm font-bold text-gray-900">Promedio General</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium text-gray-600">-</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium text-gray-600">-</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-gray-900">{pesoTotal}%</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-base font-bold ${getNotaColor(promedioGeneral)}`}>
                            {promedioGeneral.toFixed(1)}
                          </span>
                        </td>
                      </tr>

                      {/* Fila de Promedio Final */}
                      <tr className="bg-blue-50 font-semibold border-t-2 border-blue-200">
                        <td colSpan={2} className="px-4 py-3 text-left">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-200 text-blue-800 border border-blue-400">
                            PF
                          </span>
                          <span className="ml-3 text-sm font-bold text-gray-900">Promedio Final</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium text-gray-600">-</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium text-gray-600">-</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-gray-900">100%</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xl font-bold ${
                            promedioFinal >= 11 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {promedioFinal}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : periodosActivos.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay notas registradas</h3>
          <p className="text-gray-500">
            {periodoSeleccionado
              ? 'No tienes notas en el período seleccionado'
              : 'Aún no se han registrado notas para tus cursos en el periodo activo'}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default NotasPage;
