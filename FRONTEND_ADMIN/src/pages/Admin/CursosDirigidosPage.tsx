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
  UserCheck
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">Cursos Dirigidos</h1>
        </div>
        <p className="text-gray-600">
          Autoriza a estudiantes específicos para matricularse en cursos fuera de su ciclo actual
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">¿Qué son los Cursos Dirigidos?</p>
            <p>
              Los cursos dirigidos permiten a los administradores autorizar matrículas que normalmente estarían 
              restringidas por ciclo. Por ejemplo, un estudiante de ciclo 2 podría matricularse en un curso de ciclo 4.
            </p>
          </div>
        </div>
      </div>

      {/* Selección de Curso y Período */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Selecciona el Curso y Período</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selector de Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período Académico *
            </label>
            <select
              value={periodoSeleccionado || ''}
              onChange={handlePeriodoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Seleccione un período</option>
              {periodos.map(periodo => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre} {periodo.activo && '(Activo)'}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Curso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Curso *
            </label>
            <select
              value={cursoSeleccionado || ''}
              onChange={handleCursoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Seleccione un curso</option>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombreCurso} - Ciclo {curso.ciclo} ({curso.creditos} créditos)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Información del curso seleccionado */}
        {cursoSeleccionadoData && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Curso Seleccionado:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nombre:</span>
                <p className="font-medium text-gray-900">{cursoSeleccionadoData.nombreCurso}</p>
              </div>
              <div>
                <span className="text-gray-600">Ciclo:</span>
                <p className="font-medium text-gray-900">{cursoSeleccionadoData.ciclo}</p>
              </div>
              <div>
                <span className="text-gray-600">Créditos:</span>
                <p className="font-medium text-gray-900">{cursoSeleccionadoData.creditos}</p>
              </div>
              <div>
                <span className="text-gray-600">Horas/Semana:</span>
                <p className="font-medium text-gray-900">{cursoSeleccionadoData.horasSemanal}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selección de Estudiantes */}
      {cursoSeleccionado && periodoSeleccionado && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              2. Selecciona los Estudiantes
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <UserCheck className="w-4 h-4" />
              <span>{estudiantesSeleccionados.length} seleccionados</span>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <select
                value={filtroCiclo || ''}
                onChange={(e) => setFiltroCiclo(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos los ciclos</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(ciclo => (
                  <option key={ciclo} value={ciclo}>Ciclo {ciclo}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla de estudiantes */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={handleToggleAll}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-purple-600"
                    >
                      {estudiantesSeleccionados.length === estudiantesFiltrados.length ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                      Todos
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre Completo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ciclo Actual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créditos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estudiantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      No se encontraron estudiantes activos
                    </td>
                  </tr>
                ) : (
                  estudiantesFiltrados.map(estudiante => (
                    <tr
                      key={estudiante.id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        estudiantesSeleccionados.includes(estudiante.id) ? 'bg-purple-50' : ''
                      }`}
                      onClick={() => handleToggleEstudiante(estudiante.id)}
                    >
                      <td className="px-4 py-3">
                        {estudiantesSeleccionados.includes(estudiante.id) ? (
                          <CheckSquare className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {estudiante.codigo}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {estudiante.nombreCompleto}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Ciclo {estudiante.cicloActual}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {estudiante.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {estudiante.creditosAcumulados}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Botón de envío */}
          {estudiantesSeleccionados.length > 0 && (
            <div className="mt-6 flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-900">
                <p className="font-semibold">
                  {estudiantesSeleccionados.length} estudiante(s) seleccionado(s)
                </p>
                <p className="text-purple-700">
                  Se matricularán en: <span className="font-medium">{cursoSeleccionadoData?.nombreCurso}</span>
                  {periodoSeleccionadoData && (
                    <span> - Período: <span className="font-medium">{periodoSeleccionadoData.nombre}</span></span>
                  )}
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={crearDirigidosMutation.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {crearDirigidosMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
          )}
        </div>
      )}
    </div>
  );
}
