import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cursosApi } from '../../services/cursosService';
import { adminCursosApi, EstudianteAdmin } from '../../services/adminCursosApi';
import { estudiantesApi } from '../../services/estudiantesApi';
import toast from 'react-hot-toast';
import {
  BookOpen,
  CheckSquare,
  Square,
  Send,
  AlertCircle,
  Info,
  UserCheck,
  Search,
  Filter,
  Calendar,
  GraduationCap,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Curso } from '../../types';
import { Periodo } from '../../types/estudiante';

export default function CursosDirigidosPage() {
  const queryClient = useQueryClient();
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<number[]>([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCiclo, setFiltroCiclo] = useState<number | null>(null);

  // Queries
  const { data: cursos = [], isLoading: loadingCursos } = useQuery<Curso[]>({
    queryKey: ['cursos'],
    queryFn: cursosApi.getAll,
  });

  const { data: estudiantes = [], isLoading: loadingEstudiantes } = useQuery<EstudianteAdmin[]>({
    queryKey: ['estudiantes-admin'],
    queryFn: adminCursosApi.getTodosEstudiantes,
  });

  const { data: periodos = [], isLoading: loadingPeriodos } = useQuery<Periodo[]>({
    queryKey: ['periodos'],
    queryFn: estudiantesApi.getPeriodos,
  });

  // Mutation
  const crearDirigidosMutation = useMutation({
    mutationFn: adminCursosApi.crearCursosDirigidos,
    onSuccess: (data) => {
      toast.success(
        `✅ Proceso completado: ${data.exitosos} exitosos, ${data.fallidos} fallidos`,
        { duration: 5000 }
      );

      // Mostrar detalles
      if (data.detalles.exitosos.length > 0) {
        console.log('Matrículas exitosas:', data.detalles.exitosos);
      }
      if (data.detalles.errores.length > 0) {
        console.log('Errores:', data.detalles.errores);
        data.detalles.errores.forEach(error => {
          toast.error(`Error estudiante ID ${error.idEstudiante}: ${error.error}`, { duration: 4000 });
        });
      }

      // Limpiar selección
      setEstudiantesSeleccionados([]);
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
    },
    onError: (error: any) => {
      const mensaje = error.response?.data?.mensaje || 'Error al crear cursos dirigidos';
      toast.error(mensaje);
    }
  });

  // Handlers
  const handleCursoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setCursoSeleccionado(id || null);
    setEstudiantesSeleccionados([]); // Limpiar selección al cambiar curso
  };

  const handlePeriodoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setPeriodoSeleccionado(id || null);
  };

  const handleToggleEstudiante = (idEstudiante: number) => {
    setEstudiantesSeleccionados(prev =>
      prev.includes(idEstudiante)
        ? prev.filter(id => id !== idEstudiante)
        : [...prev, idEstudiante]
    );
  };

  const handleToggleAll = () => {
    if (estudiantesSeleccionados.length === estudiantesFiltrados.length) {
      setEstudiantesSeleccionados([]);
    } else {
      setEstudiantesSeleccionados(estudiantesFiltrados.map(e => e.id));
    }
  };

  const handleSubmit = () => {
    if (!cursoSeleccionado) {
      toast.error('Debes seleccionar un curso');
      return;
    }

    if (!periodoSeleccionado) {
      toast.error('Debes seleccionar un período');
      return;
    }

    if (estudiantesSeleccionados.length === 0) {
      toast.error('Debes seleccionar al menos un estudiante');
      return;
    }

    crearDirigidosMutation.mutate({
      idCurso: cursoSeleccionado,
      idsEstudiantes: estudiantesSeleccionados,
      idPeriodo: periodoSeleccionado
    });
  };

  // Filtros
  const estudiantesFiltrados = estudiantes.filter(est => {
    const matchNombre = filtroNombre === '' ||
      est.nombreCompleto.toLowerCase().includes(filtroNombre.toLowerCase()) ||
      est.codigo.toLowerCase().includes(filtroNombre.toLowerCase());

    const matchCiclo = filtroCiclo === null || est.cicloActual === filtroCiclo;

    return matchNombre && matchCiclo && est.estado === 'Activo';
  });

  const cursoSeleccionadoData = cursos.find(c => c.id === cursoSeleccionado);
  const periodoSeleccionadoData = periodos.find(p => p.id === periodoSeleccionado);

  if (loadingCursos || loadingEstudiantes || loadingPeriodos) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Cursos Dirigidos
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Autoriza a estudiantes específicos para matricularse en cursos fuera de su ciclo actual.
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">¿Qué son los Cursos Dirigidos?</p>
          <p className="text-blue-700 leading-relaxed">
            Los cursos dirigidos permiten a los administradores autorizar matrículas que normalmente estarían
            restringidas por ciclo. Por ejemplo, un estudiante de ciclo 2 podría matricularse en un curso de ciclo 4.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Configuración */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">

              Configuración
            </h2>

            <div className="space-y-6">
              {/* Selector de Período */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Período Académico
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <select
                    value={periodoSeleccionado || ''}
                    onChange={handlePeriodoChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all appearance-none"
                  >
                    <option value="">Seleccione un período</option>
                    {periodos.map(periodo => (
                      <option key={periodo.id} value={periodo.id}>
                        {periodo.nombre} {periodo.activo && '(Activo)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selector de Curso */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Curso a Asignar
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <select
                    value={cursoSeleccionado || ''}
                    onChange={handleCursoChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all appearance-none"
                  >
                    <option value="">Seleccione un curso</option>
                    {cursos.map(curso => (
                      <option key={curso.id} value={curso.id}>
                        {curso.nombreCurso}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Información del curso seleccionado */}
              {cursoSeleccionadoData && (
                <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-zinc-900 text-sm">{cursoSeleccionadoData.nombreCurso}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Ciclo {cursoSeleccionadoData.ciclo}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white border border-zinc-200 text-zinc-600">
                      {cursoSeleccionadoData.creditos} CR
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    {cursoSeleccionadoData.horasSemanal} horas semanales
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Selección de Estudiantes */}
        <div className="lg:col-span-2">
          {cursoSeleccionado && periodoSeleccionado ? (
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col h-full">
              <div className="p-6 border-b border-zinc-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">2</span>
                    Seleccionar Estudiantes
                  </h2>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-full text-sm font-medium text-zinc-900">
                    <UserCheck className="w-4 h-4" />
                    <span>{estudiantesSeleccionados.length} seleccionados</span>
                  </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o código..."
                      value={filtroNombre}
                      onChange={(e) => setFiltroNombre(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                    />
                  </div>
                  <div className="w-40 relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    <select
                      value={filtroCiclo || ''}
                      onChange={(e) => setFiltroCiclo(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 appearance-none bg-white"
                    >
                      <option value="">Todos</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(ciclo => (
                        <option key={ciclo} value={ciclo}>Ciclo {ciclo}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabla de estudiantes */}
              <div className="overflow-x-auto flex-1">
                <table className="min-w-full divide-y divide-zinc-100">
                  <thead className="bg-zinc-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left w-12">
                        <button
                          onClick={handleToggleAll}
                          className="flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                          {estudiantesSeleccionados.length === estudiantesFiltrados.length && estudiantesFiltrados.length > 0 ? (
                            <CheckSquare className="w-5 h-5 text-zinc-900" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Estudiante</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Ciclo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Créditos</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-zinc-100">
                    {estudiantesFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-zinc-300 mb-3" />
                            <p className="text-zinc-500 font-medium">No se encontraron estudiantes</p>
                            <p className="text-zinc-400 text-sm">Ajusta los filtros de búsqueda</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      estudiantesFiltrados.map(estudiante => {
                        const isSelected = estudiantesSeleccionados.includes(estudiante.id);
                        return (
                          <tr
                            key={estudiante.id}
                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-zinc-50' : 'hover:bg-zinc-50/50'
                              }`}
                            onClick={() => handleToggleEstudiante(estudiante.id)}
                          >
                            <td className="px-6 py-4">
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-zinc-900" />
                              ) : (
                                <Square className="w-5 h-5 text-zinc-300" />
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium mr-3 ${isSelected ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'
                                  }`}>
                                  {estudiante.nombreCompleto.charAt(0)}
                                </div>
                                <div>
                                  <div className={`text-sm font-medium ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`}>
                                    {estudiante.nombreCompleto}
                                  </div>
                                  <div className="text-xs text-zinc-500 font-mono">{estudiante.codigo}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                                Ciclo {estudiante.cicloActual}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-zinc-600">
                              {estudiante.creditosAcumulados}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer con botón de acción */}
              <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 rounded-b-xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-600">
                    {estudiantesSeleccionados.length > 0 ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Listo para procesar <strong>{estudiantesSeleccionados.length}</strong> matrículas
                      </span>
                    ) : (
                      <span className="text-zinc-400">Selecciona estudiantes para continuar</span>
                    )}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={crearDirigidosMutation.isPending || estudiantesSeleccionados.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md font-medium text-sm"
                  >
                    {crearDirigidosMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Crear Matrículas Dirigidas
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <UserCheck className="w-8 h-8 text-zinc-300" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 mb-2">Esperando configuración</h3>
              <p className="text-zinc-500 max-w-sm">
                Selecciona un período académico y un curso en el panel de la izquierda para comenzar a asignar estudiantes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

