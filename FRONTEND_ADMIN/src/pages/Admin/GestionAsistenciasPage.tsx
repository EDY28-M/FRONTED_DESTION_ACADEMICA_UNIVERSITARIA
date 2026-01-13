import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
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
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Breadcrumb */}


      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto ">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-[25px] font-bold text-zinc-900 tracking-tight leading-none">
                Control de Asistencias
              </h1>
              <p className="text-[13px] text-zinc-500 mt-2 font-medium">
                Panel de administración y seguimiento de asistencias · {periodoActivo?.nombre || '2029-II'}
              </p>
            </div>
            <button
              onClick={cargarAsistenciasCursos}
              disabled={cargandoAsistencias}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              {cargandoAsistencias ? 'Actualizando...' : 'Actualizar datos'}
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="bg-white rounded-[16px] border border-zinc-200/60 p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-12 gap-4">
            {/* Search */}
            <div className="col-span-5">
              <input
                type="text"
                placeholder="Buscar por curso o docente…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-[#F7F8FA] border border-zinc-200/60 rounded-[12px] text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]/40 transition-all"
              />
            </div>

            {/* Dropdown */}
            <div className="col-span-3">
              <select
                value={filtroAsistencia}
                onChange={(e) => setFiltroAsistencia(e.target.value as any)}
                className="w-full px-4 py-3 bg-[#F7F8FA] border border-zinc-200/60 rounded-[12px] text-[13px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]/40 transition-all appearance-none cursor-pointer"
              >
                <option value="todos">Todos los cursos</option>
                <option value="alta">Asistencia alta (≥80%)</option>
                <option value="media">Asistencia media (60-79%)</option>
                <option value="baja">Asistencia baja (&lt;60%)</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="col-span-2">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                placeholder="dd/mm/aaaa"
                className="w-full px-4 py-3 bg-[#F7F8FA] border border-zinc-200/60 rounded-[12px] text-[13px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]/40 transition-all"
              />
            </div>
            <div className="col-span-2">
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                placeholder="dd/mm/aaaa"
                className="w-full px-4 py-3 bg-[#F7F8FA] border border-zinc-200/60 rounded-[12px] text-[13px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]/40 transition-all"
              />
            </div>
          </div>
        </div>

        {/* KPIs Row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {/* Cursos */}
          <div className="bg-white rounded-[16px] border border-zinc-200/60 p-6 shadow-sm">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-3">Cursos</p>
            <p className="text-[36px] font-bold text-zinc-900 leading-none mb-3">{totalCursos}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">vs semana anterior</span>
              <span className="text-[11px] font-semibold text-emerald-600">+2%</span>
            </div>
            <div className="mt-3 h-1 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1]" style={{ width: '68%' }} />
            </div>
          </div>

          {/* Estudiantes */}
          <div className="bg-white rounded-[16px] border border-zinc-200/60 p-6 shadow-sm">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-3">Estudiantes</p>
            <p className="text-[36px] font-bold text-zinc-900 leading-none mb-3">{totalEstudiantes}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">vs semana anterior</span>
              <span className="text-[11px] font-semibold text-emerald-600">+5%</span>
            </div>
            <div className="mt-3 h-1 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1]" style={{ width: '82%' }} />
            </div>
          </div>

          {/* Sesiones */}
          <div className="bg-white rounded-[16px] border border-zinc-200/60 p-6 shadow-sm">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-3">Sesiones</p>
            <p className="text-[36px] font-bold text-zinc-900 leading-none mb-3">{totalClases}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">vs semana anterior</span>
              <span className="text-[11px] font-semibold text-zinc-500">0%</span>
            </div>
            <div className="mt-3 h-1 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1]" style={{ width: '45%' }} />
            </div>
          </div>

          {/* Asist. Promedio */}
          <div className="bg-white rounded-[16px] border border-zinc-200/60 p-6 shadow-sm">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-3">Asist. Promedio</p>
            <p className={`text-[36px] font-bold leading-none mb-3 ${promedioGeneral >= 80 ? 'text-emerald-600' :
              promedioGeneral >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
              {promedioGeneral.toFixed(1)}%
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">vs semana anterior</span>
              <span className={`text-[11px] font-semibold ${promedioGeneral >= 70 ? 'text-emerald-600' : 'text-red-600'}`}>
                {promedioGeneral >= 70 ? '+1.2%' : '-0.8%'}
              </span>
            </div>
            <div className="mt-3 h-1 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${promedioGeneral >= 80 ? 'bg-emerald-500' :
                  promedioGeneral >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                style={{ width: `${Math.min(promedioGeneral, 100)}%` }}
              />
            </div>
          </div>

          {/* Con Alerta */}
          <div className="bg-white rounded-[16px] border border-zinc-200/60 p-6 shadow-sm">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-3">Con Alerta</p>
            <p className="text-[36px] font-bold text-red-600 leading-none mb-3">{cursosConAlerta}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">vs semana anterior</span>
              <span className="text-[11px] font-semibold text-red-600">+3</span>
            </div>
            <div className="mt-3 h-1 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: `${(cursosConAlerta / Math.max(totalCursos, 1)) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Table */}
        {cargandoCursos || cargandoAsistencias ? (
          <div className="bg-white rounded-[16px] border border-zinc-200/60 p-16 flex flex-col items-center justify-center shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-[#A1A1AA] mb-4"></div>
            <p className="text-[13px] text-zinc-500 font-medium">Cargando información de asistencias...</p>
          </div>
        ) : cursosFiltrados.length === 0 ? (
          <div className="bg-white rounded-[16px] border border-zinc-200/60 p-16 text-center shadow-sm">
            <p className="text-[15px] font-semibold text-zinc-900 mb-1">No hay cursos</p>
            <p className="text-[13px] text-zinc-500">
              {searchTerm ? 'No se encontraron cursos con ese criterio de búsqueda' : 'No hay cursos registrados en el sistema'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[16px] border border-zinc-200/60 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200/60 bg-[#FAFBFC]">
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Curso</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Docente</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Sesiones</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Asistencia %</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Alertas</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Última actualización</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {cursosFiltrados.map((curso) => (
                  <tr
                    key={curso.idCurso}
                    className="hover:bg-zinc-50/50 transition-all duration-150 cursor-pointer group"
                    onClick={() => {
                      setCursoSeleccionado(curso);
                      setVistaDetallada(true);
                    }}
                  >
                    <td className="px-6 py-5">
                      <p className="text-[13px] font-semibold text-zinc-900">{curso.nombreCurso}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">ID: {curso.idCurso}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[13px] text-zinc-700 font-medium">{curso.nombreDocente || 'Sin asignar'}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-[13px] font-bold text-zinc-900">{curso.totalClases}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${curso.porcentajeAsistenciaPromedio >= 80 ? 'bg-emerald-500' :
                              curso.porcentajeAsistenciaPromedio >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${Math.min(curso.porcentajeAsistenciaPromedio, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[13px] font-bold min-w-[52px] text-right ${curso.porcentajeAsistenciaPromedio >= 80 ? 'text-emerald-600' :
                          curso.porcentajeAsistenciaPromedio >= 60 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                          {curso.porcentajeAsistenciaPromedio.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {curso.porcentajeAsistenciaPromedio >= 80 ? (
                        <span className="inline-block px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full uppercase tracking-wide">
                          OK
                        </span>
                      ) : curso.porcentajeAsistenciaPromedio >= 60 ? (
                        <span className="inline-block px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold rounded-full uppercase tracking-wide">
                          MEDIA
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold rounded-full uppercase tracking-wide">
                          ALERTA
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-[12px] text-zinc-500 font-medium">Hace 2 horas</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#FAFBFC] border-t border-zinc-200/60">
              <p className="text-[12px] text-zinc-500 text-center font-medium">
                Mostrando <span className="font-bold text-zinc-700">{cursosFiltrados.length}</span> de{' '}
                <span className="font-bold text-zinc-700">{cursosConAsistencias.length}</span> cursos
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {vistaDetallada && cursoSeleccionado && (
        <div
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-8"
          onClick={() => setVistaDetallada(false)}
        >
          <div
            className="bg-white rounded-[20px] max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-zinc-200/60 bg-[#FAFBFC]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-[24px] font-bold text-zinc-900">{cursoSeleccionado.nombreCurso}</h2>
                  <p className="text-[13px] text-zinc-500 mt-1 font-medium">
                    Docente: {cursoSeleccionado.nombreDocente || 'Sin asignar'}
                  </p>
                  <div className="flex items-center gap-6 mt-4">
                    <span className="text-[12px] text-zinc-600 font-medium">
                      {cursoSeleccionado.totalEstudiantes} estudiantes
                    </span>
                    <span className="text-[12px] text-zinc-600 font-medium">
                      {cursoSeleccionado.totalClases} sesiones
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setVistaDetallada(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-[10px] transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-[14px] p-5 border border-zinc-200/60 shadow-sm">
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Asistencia</p>
                  <p className={`text-[28px] font-bold mt-2 ${cursoSeleccionado.porcentajeAsistenciaPromedio >= 80 ? 'text-emerald-600' :
                    cursoSeleccionado.porcentajeAsistenciaPromedio >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                    {cursoSeleccionado.porcentajeAsistenciaPromedio.toFixed(1)}%
                  </p>
                  <div className="mt-3 h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cursoSeleccionado.porcentajeAsistenciaPromedio >= 80 ? 'bg-emerald-500' :
                        cursoSeleccionado.porcentajeAsistenciaPromedio >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${Math.min(cursoSeleccionado.porcentajeAsistenciaPromedio, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-[14px] p-5 border border-emerald-200/60">
                  <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Promedio Presentes</p>
                  <p className="text-[28px] font-bold text-emerald-600 mt-2">
                    {cursoSeleccionado.totalClases > 0
                      ? ((cursoSeleccionado.totalEstudiantes * cursoSeleccionado.porcentajeAsistenciaPromedio / 100)).toFixed(0)
                      : 0}
                  </p>
                </div>
                <div className="bg-red-50 rounded-[14px] p-5 border border-red-200/60">
                  <p className="text-[11px] font-bold text-red-700 uppercase tracking-wide">Promedio Ausentes</p>
                  <p className="text-[28px] font-bold text-red-600 mt-2">
                    {cursoSeleccionado.totalClases > 0
                      ? ((cursoSeleccionado.totalEstudiantes * (100 - cursoSeleccionado.porcentajeAsistenciaPromedio) / 100)).toFixed(0)
                      : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-380px)] p-8">
              <h3 className="text-[13px] font-bold text-zinc-900 mb-4 uppercase tracking-wide">Listado de Estudiantes</h3>

              {cursoSeleccionado.estudiantes.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[13px] text-zinc-500">No hay estudiantes registrados en este curso</p>
                </div>
              ) : (
                <div className="border border-zinc-200/60 rounded-[14px] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#FAFBFC] border-b border-zinc-200/60">
                        <th className="px-5 py-3 text-left text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Código</th>
                        <th className="px-5 py-3 text-left text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Estudiante</th>
                        <th className="px-5 py-3 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Clases</th>
                        <th className="px-5 py-3 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Presentes</th>
                        <th className="px-5 py-3 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Faltas</th>
                        <th className="px-5 py-3 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wide">% Asistencia</th>
                        <th className="px-5 py-3 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {cursoSeleccionado.estudiantes
                        .sort((a, b) => a.porcentajeAsistencia - b.porcentajeAsistencia)
                        .map((estudiante) => (
                          <tr key={estudiante.idEstudiante} className="hover:bg-zinc-50/50 transition-all">
                            <td className="px-5 py-4 text-[12px] font-mono text-zinc-600 font-medium">
                              {estudiante.codigo}
                            </td>
                            <td className="px-5 py-4 text-[13px] text-zinc-900 font-medium">
                              {estudiante.nombreCompleto}
                            </td>
                            <td className="px-5 py-4 text-center text-[13px] font-bold text-zinc-700">
                              {estudiante.totalClases}
                            </td>
                            <td className="px-5 py-4 text-center text-[13px] font-bold text-emerald-600">
                              {estudiante.totalAsistencias}
                            </td>
                            <td className="px-5 py-4 text-center text-[13px] font-bold text-red-600">
                              {estudiante.totalFaltas}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${estudiante.porcentajeAsistencia >= 80 ? 'bg-emerald-500' :
                                      estudiante.porcentajeAsistencia >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                      }`}
                                    style={{ width: `${Math.min(estudiante.porcentajeAsistencia, 100)}%` }}
                                  />
                                </div>
                                <span className={`text-[12px] font-bold min-w-[44px] text-right ${estudiante.porcentajeAsistencia >= 80 ? 'text-emerald-600' :
                                  estudiante.porcentajeAsistencia >= 60 ? 'text-amber-600' : 'text-red-600'
                                  }`}>
                                  {estudiante.porcentajeAsistencia.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              {estudiante.porcentajeAsistencia >= 70 ? (
                                <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full uppercase tracking-wide">
                                  OK
                                </span>
                              ) : estudiante.porcentajeAsistencia >= 60 ? (
                                <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-full uppercase tracking-wide">
                                  ALERTA
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold rounded-full uppercase tracking-wide">
                                  CRÍTICO
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

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-zinc-200/60 bg-[#FAFBFC] flex items-center justify-between gap-4">
              <button
                onClick={() => descargarReporte(cursoSeleccionado.idCurso)}
                className="px-5 py-2.5 bg-white border border-zinc-300 text-zinc-700 text-[13px] font-semibold rounded-[12px] hover:bg-zinc-50 transition-all"
              >
                Exportar CSV
              </button>
              <button
                onClick={() => setVistaDetallada(false)}
                className="px-6 py-2.5 bg-[#4F46E5] text-white text-[13px] font-semibold rounded-[12px] hover:bg-[#4338CA] transition-all"
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
