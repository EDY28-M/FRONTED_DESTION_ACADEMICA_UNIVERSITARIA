import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCursosApi, EstudianteAdmin, EstudianteDetalle } from '../../services/adminCursosApi';
import { estudiantesApi } from '../../services/estudiantesApi';
import { toast } from 'react-hot-toast';
import {
  Users,
  Search,
  Eye,
  X,
  User,
  BookOpen,
  History,
  BarChart3,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Calendar,
  Clock,
  Trash2,
} from 'lucide-react';

export default function VisualizacionEstudiantesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<number | null>(null);
  const [tabActiva, setTabActiva] = useState<'datos' | 'actuales' | 'historial' | 'estadisticas'>('datos');
  const [estudianteAEliminar, setEstudianteAEliminar] = useState<EstudianteAdmin | null>(null);
  
  const queryClient = useQueryClient();

  // Queries
  const { data: estudiantes = [], isLoading, isError, error } = useQuery<EstudianteAdmin[]>({
    queryKey: ['estudiantes-admin'],
    queryFn: adminCursosApi.getTodosEstudiantes,
    retry: 1,
  });

  const { data: estudianteDetalle, isLoading: loadingDetalle } = useQuery<EstudianteDetalle>({
    queryKey: ['estudiante-detalle', estudianteSeleccionado],
    queryFn: () => adminCursosApi.getEstudianteDetalle(estudianteSeleccionado!),
    enabled: !!estudianteSeleccionado,
    retry: 1,
  });

  // Mutation para eliminar estudiante
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => estudiantesApi.eliminarEstudiante(id),
    onSuccess: (data) => {
      toast.success(data.mensaje);
      queryClient.invalidateQueries({ queryKey: ['estudiantes-admin'] });
      setEstudianteAEliminar(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al eliminar estudiante');
    },
  });

  // Filtrar estudiantes
  const estudiantesFiltrados = estudiantes.filter(
    (est) =>
      est.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.dni.includes(busqueda)
  );

  const cerrarModal = () => {
    setEstudianteSeleccionado(null);
    setTabActiva('datos');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-8 rounded-lg border border-red-200">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error al cargar estudiantes</h2>
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'No se pudo conectar con el servidor'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800">Visualización de Estudiantes</h1>
        </div>
        <p className="text-gray-600">
          Consulta información completa de todos los estudiantes registrados
        </p>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, código, email o DNI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {estudiantesFiltrados.length} estudiante(s) encontrado(s)
        </p>
      </div>

      {/* Tabla de estudiantes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre Completo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DNI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ciclo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créditos Acum.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créd. Semestre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cursos Activos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prom. Acumulado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prom. Semestral
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estudiantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No se encontraron estudiantes</p>
                  </td>
                </tr>
              ) : (
                estudiantesFiltrados.map((estudiante) => (
                  <tr key={estudiante.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {estudiante.codigo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{estudiante.nombreCompleto}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{estudiante.dni}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{estudiante.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        Ciclo {estudiante.cicloActual}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="font-medium">{estudiante.creditosAcumulados}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {estudiante.creditosSemestreActual}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {estudiante.cursosMatriculadosActual}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {estudiante.promedioAcumulado !== null && estudiante.promedioAcumulado !== undefined 
                        ? estudiante.promedioAcumulado.toFixed(2) 
                        : '0.00'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {estudiante.promedioSemestral !== null && estudiante.promedioSemestral !== undefined 
                        ? estudiante.promedioSemestral.toFixed(2) 
                        : '0.00'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          estudiante.estado === 'Activo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {estudiante.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEstudianteSeleccionado(estudiante.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                        <button
                          onClick={() => setEstudianteAEliminar(estudiante)}
                          className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {estudianteAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Eliminar Estudiante</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas eliminar al estudiante:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-900">{estudianteAEliminar.nombreCompleto}</p>
                <p className="text-sm text-gray-600">Código: {estudianteAEliminar.codigo}</p>
                <p className="text-sm text-gray-600">Email: {estudianteAEliminar.email}</p>
              </div>
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium">⚠️ Advertencia:</p>
                <p className="text-sm text-red-700 mt-1">
                  Esta acción eliminará permanentemente:
                </p>
                <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
                  <li>Todas las matrículas del estudiante</li>
                  <li>Todas las notas registradas</li>
                  <li>Todas las asistencias</li>
                  <li>La cuenta de usuario asociada</li>
                </ul>
                <p className="text-sm text-red-800 font-medium mt-2">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEstudianteAEliminar(null)}
                disabled={eliminarMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarMutation.mutate(estudianteAEliminar.id)}
                disabled={eliminarMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {eliminarMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      {estudianteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {loadingDetalle ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando información...</p>
              </div>
            ) : estudianteDetalle ? (
              <>
                {/* Header del Modal */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {estudianteDetalle.datosPersonales.nombreCompleto}
                      </h2>
                      <p className="text-green-100">
                        {estudianteDetalle.datosPersonales.codigo} | {estudianteDetalle.datosPersonales.carrera}
                      </p>
                    </div>
                    <button
                      onClick={cerrarModal}
                      className="text-white hover:bg-green-800 p-2 rounded transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Resumen Rápido */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Créditos Acumulados</p>
                      <p className="text-2xl font-bold text-gray-900">{estudianteDetalle.datosPersonales.creditosAcumulados}</p>
                      <p className="text-xs text-gray-500">Histórico</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Semestre Actual</p>
                      <p className="text-2xl font-bold text-primary-700">
                        {estudianteDetalle.cursosActuales
                          .filter(c => c.estado === 'Matriculado')
                          .reduce((sum, c) => sum + c.creditos, 0)}
                      </p>
                      <p className="text-xs text-gray-500">Créditos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cursos Activos</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {estudianteDetalle.cursosActuales.filter(c => c.estado === 'Matriculado').length}
                      </p>
                      <p className="text-xs text-gray-500">Matriculados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Promedio</p>
                      <p className="text-2xl font-bold text-green-600">
                        {estudianteDetalle.datosPersonales.promedioAcumulado !== null && 
                         estudianteDetalle.datosPersonales.promedioAcumulado !== undefined
                          ? estudianteDetalle.datosPersonales.promedioAcumulado.toFixed(2) 
                          : '0.00'}
                      </p>
                      <p className="text-xs text-gray-500">Acumulado</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 bg-gray-50">
                  <div className="flex px-6">
                    <button
                      onClick={() => setTabActiva('datos')}
                      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                        tabActiva === 'datos'
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Datos Personales
                    </button>
                    <button
                      onClick={() => setTabActiva('actuales')}
                      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                        tabActiva === 'actuales'
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Cursos Actuales ({estudianteDetalle.cursosActuales.length})
                    </button>
                    <button
                      onClick={() => setTabActiva('historial')}
                      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                        tabActiva === 'historial'
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <History className="w-4 h-4" />
                      Historial
                    </button>
                    <button
                      onClick={() => setTabActiva('estadisticas')}
                      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                        tabActiva === 'estadisticas'
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Estadísticas
                    </button>
                  </div>
                </div>

                {/* Contenido de Tabs */}
                <div className="p-6">
                  {/* Tab: Datos Personales */}
                  {tabActiva === 'datos' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Código</label>
                          <p className="text-lg text-gray-900">{estudianteDetalle.datosPersonales.codigo}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Nombres</label>
                          <p className="text-lg text-gray-900">{estudianteDetalle.datosPersonales.nombres}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Apellidos</label>
                          <p className="text-lg text-gray-900">{estudianteDetalle.datosPersonales.apellidos}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">DNI</label>
                          <p className="text-lg text-gray-900">{estudianteDetalle.datosPersonales.dni}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-lg text-gray-900">{estudianteDetalle.datosPersonales.email}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Carrera</label>
                          <p className="text-lg text-gray-900">{estudianteDetalle.datosPersonales.carrera}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ciclo Actual</label>
                          <p className="text-lg text-gray-900">Ciclo {estudianteDetalle.datosPersonales.cicloActual}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Estado</label>
                          <p className="text-lg">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              estudianteDetalle.datosPersonales.estado === 'Activo'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {estudianteDetalle.datosPersonales.estado}
                            </span>
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Créditos Acumulados</label>
                          <p className="text-lg text-gray-900">{estudianteDetalle.datosPersonales.creditosAcumulados}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Promedio Acumulado</label>
                          <p className="text-lg text-gray-900">
                            {estudianteDetalle.datosPersonales.promedioAcumulado !== null && 
                             estudianteDetalle.datosPersonales.promedioAcumulado !== undefined
                              ? estudianteDetalle.datosPersonales.promedioAcumulado.toFixed(2) 
                              : '0.00'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Fecha de Ingreso</label>
                          <p className="text-lg text-gray-900">
                            {new Date(estudianteDetalle.datosPersonales.fechaIngreso).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Cursos Actuales */}
                  {tabActiva === 'actuales' && (
                    <div>
                      {estudianteDetalle.cursosActuales.length === 0 ? (
                        <div className="text-center py-12">
                          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">No tiene cursos matriculados actualmente</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {estudianteDetalle.cursosActuales.map((curso) => (
                            <div key={curso.idMatricula} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{curso.nombreCurso}</h3>
                                  <p className="text-sm text-gray-600">{curso.docente}</p>
                                </div>
                                <div className="flex gap-2">
                                  {curso.isAutorizado && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      Dirigido
                                    </span>
                                  )}
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {curso.estado}
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                <div>
                                  <span className="text-gray-500">Ciclo:</span>
                                  <p className="font-medium text-gray-900">{curso.ciclo}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Créditos:</span>
                                  <p className="font-medium text-gray-900">{curso.creditos}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Horas/Sem:</span>
                                  <p className="font-medium text-gray-900">{curso.horasSemanal}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Promedio:</span>
                                  <p className="font-medium text-gray-900">
                                    {curso.promedioFinal !== null ? curso.promedioFinal.toFixed(2) : 'Sin notas'}
                                  </p>
                                </div>
                              </div>
                              {curso.notas.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs font-medium text-gray-500 mb-2">Notas Registradas:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {curso.notas.map((nota, idx) => (
                                      <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs">
                                        <span className="font-medium">{nota.tipoEvaluacion}:</span>
                                        <span className="ml-1 text-primary-700">{nota.notaValor}</span>
                                        <span className="ml-1 text-gray-500">({nota.peso}%)</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab: Historial */}
                  {tabActiva === 'historial' && (
                    <div className="space-y-6">
                      {estudianteDetalle.historialPorPeriodo.length === 0 ? (
                        <div className="text-center py-12">
                          <History className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">No hay historial académico registrado</p>
                        </div>
                      ) : (
                        estudianteDetalle.historialPorPeriodo.map((periodo) => (
                          <div key={periodo.idPeriodo} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Header del período */}
                            <div className={`px-4 py-3 ${periodo.esActivo ? 'bg-green-50 border-b-2 border-green-500' : 'bg-gray-50'}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-5 h-5 text-gray-600" />
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{periodo.nombrePeriodo}</h3>
                                    <p className="text-sm text-gray-600">
                                      Año {periodo.anio} - Ciclo {periodo.ciclo}
                                    </p>
                                  </div>
                                  {periodo.esActivo && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Actual
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-4 text-sm">
                                  <div className="text-center">
                                    <p className="text-gray-500">Cursos</p>
                                    <p className="font-semibold text-gray-900">{periodo.totalCursos}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-gray-500">Créditos</p>
                                    <p className="font-semibold text-gray-900">{periodo.creditosMatriculados}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-gray-500">Promedio</p>
                                    <p className="font-semibold text-gray-900">
                                      {periodo.promedioGeneral !== null ? periodo.promedioGeneral.toFixed(2) : '0.00'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Lista de cursos del período */}
                            <div className="p-4">
                              <table className="min-w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Curso</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Docente</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Ciclo</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Créditos</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Estado</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Promedio</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Resultado</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {periodo.cursos.map((curso) => (
                                    <tr key={curso.idMatricula} className="hover:bg-gray-50">
                                      <td className="px-4 py-2">
                                        <div>
                                          <p className="font-medium text-gray-900">{curso.nombreCurso}</p>
                                          {curso.isAutorizado && (
                                            <span className="text-xs text-purple-600">Dirigido</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-gray-600">{curso.docente}</td>
                                      <td className="px-4 py-2 text-center text-gray-900">{curso.ciclo}</td>
                                      <td className="px-4 py-2 text-center text-gray-900">{curso.creditos}</td>
                                      <td className="px-4 py-2 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                          curso.estado === 'Matriculado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                          {curso.estado}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-center text-gray-900">
                                        {curso.promedioFinal !== null ? curso.promedioFinal.toFixed(2) : '-'}
                                      </td>
                                      <td className="px-4 py-2 text-center">
                                        {curso.promedioFinal !== null ? (
                                          curso.aprobado ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                                          ) : (
                                            <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                                          )
                                        ) : (
                                          <Clock className="w-5 h-5 text-gray-400 mx-auto" />
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Tab: Estadísticas */}
                  {tabActiva === 'estadisticas' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
                        <div className="flex items-center gap-3 mb-3">
                          <BookOpen className="w-8 h-8 text-primary-700" />
                          <h3 className="font-semibold text-gray-800">Matrículas</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-semibold text-gray-900">{estudianteDetalle.estadisticas.totalMatriculas}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Activos:</span>
                            <span className="font-semibold text-green-600">{estudianteDetalle.estadisticas.totalCursosActivos}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Retirados:</span>
                            <span className="font-semibold text-gray-600">{estudianteDetalle.estadisticas.totalCursosRetirados}</span>
                          </div>
                          <div className="flex justify-between border-t border-primary-300 pt-2 mt-2">
                            <span className="text-gray-600">Dirigidos:</span>
                            <span className="font-semibold text-purple-600">{estudianteDetalle.estadisticas.totalCursosDirigidos}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Award className="w-8 h-8 text-green-600" />
                          <h3 className="font-semibold text-gray-800">Rendimiento</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Aprobados:</span>
                            <span className="font-semibold text-green-600">{estudianteDetalle.estadisticas.totalCursosAprobados}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Desaprobados:</span>
                            <span className="font-semibold text-red-600">{estudianteDetalle.estadisticas.totalCursosDesaprobados}</span>
                          </div>
                          <div className="flex justify-between border-t border-green-300 pt-2 mt-2">
                            <span className="text-gray-600">Tasa Aprobación:</span>
                            <span className="font-semibold text-gray-900">
                              {estudianteDetalle.estadisticas.totalCursosAprobados + estudianteDetalle.estadisticas.totalCursosDesaprobados > 0
                                ? ((estudianteDetalle.estadisticas.totalCursosAprobados / 
                                   (estudianteDetalle.estadisticas.totalCursosAprobados + estudianteDetalle.estadisticas.totalCursosDesaprobados)) * 100).toFixed(1)
                                : 0}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
                        <div className="flex items-center gap-3 mb-3">
                          <TrendingUp className="w-8 h-8 text-primary-700" />
                          <h3 className="font-semibold text-gray-800">Promedios</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Histórico:</span>
                            <span className="font-semibold text-gray-900">
                              {estudianteDetalle.estadisticas.promedioGeneralHistorico !== null 
                                ? estudianteDetalle.estadisticas.promedioGeneralHistorico.toFixed(2)
                                : '0.00'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Acumulado:</span>
                            <span className="font-semibold text-gray-900">
                              {estudianteDetalle.estadisticas.promedioAcumulado !== null && 
                               estudianteDetalle.estadisticas.promedioAcumulado !== undefined
                                ? estudianteDetalle.estadisticas.promedioAcumulado.toFixed(2)
                                : '0.00'}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-primary-300 pt-2 mt-2">
                            <span className="text-gray-600">Créditos:</span>
                            <span className="font-semibold text-gray-900">
                              {estudianteDetalle.estadisticas.creditosAcumulados}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

