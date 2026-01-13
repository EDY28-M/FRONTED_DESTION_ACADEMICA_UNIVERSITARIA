import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { docenteCursosApi, EstudianteCurso } from '../../services/docenteApi';
import { BookOpen, Search } from 'lucide-react';

export const NotasConsolidadasDocentePage: React.FC = () => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const { data: cursos, isLoading: cargandoCursos } = useQuery({
    queryKey: ['mis-cursos'],
    queryFn: () => docenteCursosApi.getMisCursos(),
  });

  const { data: estudiantes, isLoading: cargandoNotas } = useQuery<EstudianteCurso[]>({
    queryKey: ['estudiantes-curso', cursoSeleccionado],
    queryFn: () => cursoSeleccionado 
      ? docenteCursosApi.getEstudiantesCurso(cursoSeleccionado) as Promise<EstudianteCurso[]>
      : Promise.resolve([]),
    enabled: !!cursoSeleccionado,
  });

  // if (cargandoCursos) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="text-zinc-500">Cargando cursos...</div>
  //     </div>
  //   );
  // }

  const estudiantesFiltrados = estudiantes?.filter(estudiante =>
    estudiante.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) ||
    estudiante.codigo?.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Notas Consolidadas
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Visualiza y gestiona las notas consolidadas de tus estudiantes
        </p>
      </div>

      {/* Selector de Curso */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4">
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Seleccionar Curso
        </label>
        <select
          value={cursoSeleccionado || ''}
          onChange={(e) => setCursoSeleccionado(Number(e.target.value) || null)}
          className="w-full sm:w-auto rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        >
          <option value="">Selecciona un curso</option>
          {cursos?.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.nombreCurso}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de Notas */}
      {cursoSeleccionado && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              Notas Consolidadas
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                className="rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                placeholder="Buscar estudiante..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {/* {cargandoNotas ? (
            <div className="p-8 text-center text-zinc-500">
              Cargando notas...
            </div>
          ) :  */}
          {estudiantesFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-500">No hay estudiantes disponibles para este curso</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Promedio Final
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-200">
                  {estudiantesFiltrados.map((estudiante) => (
                    <tr key={estudiante.idEstudiante} className="hover:bg-zinc-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                        {estudiante.nombreCompleto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {estudiante.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                        {estudiante.promedioFinal !== null && estudiante.promedioFinal !== undefined
                          ? estudiante.promedioFinal.toFixed(2)
                          : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {estudiante.promedioFinal !== null && estudiante.promedioFinal !== undefined ? (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              estudiante.promedioFinal >= 11
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {estudiante.promedioFinal >= 11 ? 'Aprobado' : 'Desaprobado'}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-zinc-100 text-zinc-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!cursoSeleccionado && (
        <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
          <BookOpen className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-500">Selecciona un curso para ver las notas consolidadas</p>
        </div>
      )}
    </div>
  );
};
