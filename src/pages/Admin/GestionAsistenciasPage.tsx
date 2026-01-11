import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  X,
  Ban,
  FileText
} from 'lucide-react';
import { asistenciasApi, ResumenAsistenciaCurso } from '../../services/asistenciasApi';
import { cursosApi } from '../../services/cursosService';
import { estudiantesApi } from '../../services/estudiantesApi';
import { Curso } from '../../types';

interface CursoConAsistencias extends ResumenAsistenciaCurso {
  nombreDocente?: string;
}

export default function GestionAsistenciasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAsistencia, setFiltroAsistencia] = useState<'todos' | 'alta' | 'media' | 'baja'>('todos');
  const [cursoSeleccionado, setCursoSeleccionado] = useState<CursoConAsistencias | null>(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [vistaDetallada, setVistaDetallada] = useState(false);

  // Obtener período activo
  const { data: periodoActivo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  // Obtener todos los cursos
  const { data: cursos = [], isLoading: cargandoCursos } = useQuery<Curso[]>({
    queryKey: ['cursos-todos'],
    queryFn: cursosApi.getAll,
  });

  // Estado para cursos con asistencias
  const [cursosConAsistencias, setCursosConAsistencias] = useState<CursoConAsistencias[]>([]);
  const [cargandoAsistencias, setCargandoAsistencias] = useState(false);

  useEffect(() => {
    if (cursos) {
      cargarAsistenciasCursos();
    }
  }, [cursos, fechaInicio, fechaFin]);

  const cargarAsistenciasCursos = async () => {
    if (!cursos || cursos.length === 0) return;
    
    setCargandoAsistencias(true);
    try {
      const promises = cursos.map(async (curso: Curso) => {
        try {
          const resumen = await asistenciasApi.getResumenAsistenciaCurso(
            curso.id,
            fechaInicio || undefined,
            fechaFin || undefined
          );
          const cursoConAsistencia: CursoConAsistencias = {
            ...resumen,
            nombreDocente: curso.docente ? `${curso.docente.nombres} ${curso.docente.apellidos}` : undefined,
          };
          return cursoConAsistencia;
        } catch (error) {
          return null;
        }
      });

      const resultados = await Promise.all(promises);
      const cursosValidos = resultados.filter((c) => c !== null) as CursoConAsistencias[];
      setCursosConAsistencias(cursosValidos);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      toast.error('Error al cargar las asistencias');
    } finally {
      setCargandoAsistencias(false);
    }
  };

  // Filtrar cursos
  const cursosFiltrados = cursosConAsistencias.filter(curso => {
    const matchSearch = searchTerm === '' || 
      curso.nombreCurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.nombreDocente?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (filtroAsistencia === 'todos') return true;
    if (filtroAsistencia === 'alta') return curso.porcentajeAsistenciaPromedio >= 80;
    if (filtroAsistencia === 'media') return curso.porcentajeAsistenciaPromedio >= 60 && curso.porcentajeAsistenciaPromedio < 80;
    if (filtroAsistencia === 'baja') return curso.porcentajeAsistenciaPromedio < 60;

    return true;
  });

  // Estadísticas generales
  const totalCursos = cursosConAsistencias.length;
  const totalEstudiantes = cursosConAsistencias.reduce((acc, c) => acc + c.totalEstudiantes, 0);
  const totalClases = cursosConAsistencias.reduce((acc, c) => acc + c.totalClases, 0);
  const promedioGeneral = totalCursos > 0 
    ? cursosConAsistencias.reduce((acc, c) => acc + c.porcentajeAsistenciaPromedio, 0) / totalCursos 
    : 0;

  const cursosConAlerta = cursosConAsistencias.filter(c => c.porcentajeAsistenciaPromedio < 70).length;

  const descargarReporte = async (idCurso: number) => {
    try {
      const reporte = await asistenciasApi.generarReporteAsistencia(
        idCurso,
        fechaInicio || undefined,
        fechaFin || undefined
      );
      
      // Generar CSV
      let csv = 'Código,Estudiante,Asistencias,Faltas,% Asistencia\n';
      reporte.estudiantes.forEach(est => {
        csv += `${est.codigo},${est.nombreCompleto},${est.totalAsistencias},${est.totalFaltas},${est.porcentajeAsistencia.toFixed(1)}%\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-asistencias-${reporte.nombreCurso.replace(/\s+/g, '-')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Reporte descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el reporte');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Control de Asistencias
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Panel de administración y seguimiento de asistencias
            {periodoActivo && ` • ${periodoActivo.nombre}`}
          </p>
        </div>
        <button
          onClick={cargarAsistenciasCursos}
          disabled={cargandoAsistencias}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <Clock className="h-4 w-4" />
          {cargandoAsistencias ? 'Actualizando...' : 'Actualizar datos'}
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por curso o docente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            {/* Filtro de asistencia */}
            <div className="relative">
              <select
                value={filtroAsistencia}
                onChange={(e) => setFiltroAsistencia(e.target.value as any)}
                className="appearance-none rounded-lg border border-zinc-300 bg-white pl-10 pr-10 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                <option value="todos">Todos los cursos</option>
                <option value="alta">Asistencia alta (≥80%)</option>
                <option value="media">Asistencia media (60-79%)</option>
                <option value="baja">Asistencia baja (&lt;60%)</option>
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            </div>

            {/* Rango de fechas */}
            <div className="flex gap-2">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
              {(fechaInicio || fechaFin) && (
                <button
                  onClick={() => {
                    setFechaInicio('');
                    setFechaFin('');
                  }}
                  className="px-3 py-2.5 text-zinc-600 hover:text-zinc-900 transition-colors"
                  title="Limpiar fechas"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total cursos */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 font-medium">Cursos</p>
                <p className="text-3xl font-bold text-zinc-900 mt-1">{totalCursos}</p>
              </div>
              <div className="p-3 bg-zinc-100 rounded-lg">
                <Calendar className="h-6 w-6 text-zinc-600" />
              </div>
            </div>
          </div>

          {/* Total estudiantes */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 font-medium">Estudiantes</p>
                <p className="text-3xl font-bold text-zinc-900 mt-1">{totalEstudiantes}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total clases */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 font-medium">Sesiones</p>
                <p className="text-3xl font-bold text-zinc-900 mt-1">{totalClases}</p>
              </div>
              <div className="p-3 bg-violet-100 rounded-lg">
                <Clock className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </div>

          {/* Promedio general */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 font-medium">Asist. Promedio</p>
                <p className={`text-3xl font-bold mt-1 ${
                  promedioGeneral >= 80 ? 'text-emerald-600' :
                  promedioGeneral >= 60 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {promedioGeneral.toFixed(1)}%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                promedioGeneral >= 80 ? 'bg-emerald-100' :
                promedioGeneral >= 60 ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                {promedioGeneral >= 70 ? (
                  <TrendingUp className={`h-6 w-6 ${
                    promedioGeneral >= 80 ? 'text-emerald-600' : 'text-amber-600'
                  }`} />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </div>

          {/* Cursos con alerta */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 font-medium">Con Alerta</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{cursosConAlerta}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de cursos */}
        <div className="mt-6">
          {cargandoCursos || cargandoAsistencias ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-12 flex flex-col items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 mb-4"></div>
              <p className="text-sm text-zinc-500">Cargando información de asistencias...</p>
            </div>
          ) : cursosFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
              <Calendar className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-900">No hay cursos</h3>
              <p className="text-sm text-zinc-500 mt-1">
                {searchTerm ? 'No se encontraron cursos con ese criterio de búsqueda' : 'No hay cursos registrados en el sistema'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/80">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                        Curso
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                        Docente
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                        Estudiantes
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                        Sesiones
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                        % Asistencia
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {cursosFiltrados.map((curso) => (
                      <tr 
                        key={curso.idCurso} 
                        className="hover:bg-zinc-50/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setCursoSeleccionado(curso);
                          setVistaDetallada(true);
                        }}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">{curso.nombreCurso}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">ID: {curso.idCurso}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-zinc-700">{curso.nombreDocente || 'Sin asignar'}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700">
                            <Users className="h-4 w-4 text-zinc-500" />
                            {curso.totalEstudiantes}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-mono font-medium text-zinc-700">
                            {curso.totalClases}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  curso.porcentajeAsistenciaPromedio >= 80 ? 'bg-emerald-500' :
                                  curso.porcentajeAsistenciaPromedio >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(curso.porcentajeAsistenciaPromedio, 100)}%` }}
                              />
                            </div>
                            <span className={`text-sm font-mono font-semibold min-w-[48px] text-right ${
                              curso.porcentajeAsistenciaPromedio >= 80 ? 'text-emerald-600' :
                              curso.porcentajeAsistenciaPromedio >= 60 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {curso.porcentajeAsistenciaPromedio.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {curso.porcentajeAsistenciaPromedio >= 80 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium rounded-full">
                              <CheckCircle2 className="h-3 w-3" />
                              Excelente
                            </span>
                          ) : curso.porcentajeAsistenciaPromedio >= 60 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium rounded-full">
                              <AlertTriangle className="h-3 w-3" />
                              Aceptable
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-medium rounded-full">
                              <Ban className="h-3 w-3" />
                              Crítico
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCursoSeleccionado(curso);
                                setVistaDetallada(true);
                              }}
                              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                descargarReporte(curso.idCurso);
                              }}
                              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                              title="Descargar reporte"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer con contador */}
              <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-200">
                <p className="text-sm text-zinc-500 text-center">
                  Mostrando <span className="font-medium text-zinc-700">{cursosFiltrados.length}</span> de{' '}
                  <span className="font-medium text-zinc-700">{cursosConAsistencias.length}</span> cursos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      {vistaDetallada && cursoSeleccionado && (
        <div
          className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setVistaDetallada(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="px-6 py-5 border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-zinc-900">{cursoSeleccionado.nombreCurso}</h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    Docente: {cursoSeleccionado.nombreDocente || 'Sin asignar'}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-600">
                      <Users className="h-4 w-4" />
                      {cursoSeleccionado.totalEstudiantes} estudiantes
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-600">
                      <Calendar className="h-4 w-4" />
                      {cursoSeleccionado.totalClases} sesiones
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setVistaDetallada(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Estadísticas del curso */}
              <div className="grid grid-cols-3 gap-4 mt-5">
                <div className="bg-white rounded-lg p-4 border border-zinc-200 shadow-sm">
                  <p className="text-xs text-zinc-500 font-medium uppercase">Asistencia</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    cursoSeleccionado.porcentajeAsistenciaPromedio >= 80 ? 'text-emerald-600' :
                    cursoSeleccionado.porcentajeAsistenciaPromedio >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {cursoSeleccionado.porcentajeAsistenciaPromedio.toFixed(1)}%
                  </p>
                  <div className="mt-2 h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cursoSeleccionado.porcentajeAsistenciaPromedio >= 80 ? 'bg-emerald-500' :
                        cursoSeleccionado.porcentajeAsistenciaPromedio >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(cursoSeleccionado.porcentajeAsistenciaPromedio, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <p className="text-xs text-emerald-700 font-medium uppercase">Promedio Presentes</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {cursoSeleccionado.totalClases > 0 
                      ? ((cursoSeleccionado.totalEstudiantes * cursoSeleccionado.porcentajeAsistenciaPromedio / 100)).toFixed(0)
                      : 0}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-xs text-red-700 font-medium uppercase">Promedio Ausentes</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {cursoSeleccionado.totalClases > 0
                      ? ((cursoSeleccionado.totalEstudiantes * (100 - cursoSeleccionado.porcentajeAsistenciaPromedio) / 100)).toFixed(0)
                      : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabla de estudiantes */}
            <div className="overflow-y-auto max-h-[calc(90vh-350px)] p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Listado de Estudiantes
              </h3>
              
              {cursoSeleccionado.estudiantes.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                  <p className="text-sm text-zinc-500">No hay estudiantes registrados en este curso</p>
                </div>
              ) : (
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase">
                          Código
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase">
                          Estudiante
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-600 uppercase">
                          Clases
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-600 uppercase">
                          Presentes
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-600 uppercase">
                          Faltas
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-600 uppercase">
                          % Asistencia
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-600 uppercase">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {cursoSeleccionado.estudiantes
                        .sort((a, b) => a.porcentajeAsistencia - b.porcentajeAsistencia)
                        .map((estudiante) => (
                        <tr key={estudiante.idEstudiante} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono text-zinc-600">
                            {estudiante.codigo}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-900">
                            {estudiante.nombreCompleto}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-zinc-700">
                            {estudiante.totalClases}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {estudiante.totalAsistencias}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600">
                              <XCircle className="h-3.5 w-3.5" />
                              {estudiante.totalFaltas}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    estudiante.porcentajeAsistencia >= 80 ? 'bg-emerald-500' :
                                    estudiante.porcentajeAsistencia >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(estudiante.porcentajeAsistencia, 100)}%` }}
                                />
                              </div>
                              <span className={`text-xs font-mono font-semibold min-w-[42px] text-right ${
                                estudiante.porcentajeAsistencia >= 80 ? 'text-emerald-600' :
                                estudiante.porcentajeAsistencia >= 60 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {estudiante.porcentajeAsistencia.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {estudiante.porcentajeAsistencia >= 70 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium rounded-full">
                                <CheckCircle2 className="h-3 w-3" />
                                Normal
                              </span>
                            ) : estudiante.porcentajeAsistencia >= 60 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium rounded-full">
                                <AlertTriangle className="h-3 w-3" />
                                Alerta
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 text-xs font-medium rounded-full">
                                <Ban className="h-3 w-3" />
                                Crítico
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

            {/* Footer del modal */}
            <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between gap-4">
              <button
                onClick={() => descargarReporte(cursoSeleccionado.idCurso)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </button>
              <button
                onClick={() => setVistaDetallada(false)}
                className="px-6 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
