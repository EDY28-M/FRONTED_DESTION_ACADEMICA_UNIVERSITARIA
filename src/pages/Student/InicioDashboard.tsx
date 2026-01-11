import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { asistenciasApi } from '../../services/asistenciasApi';
import {
  BookOpen,
  GraduationCap,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  CheckCircle2,
  Ban
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Horario } from '../../types/horario';

// Helper to get greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

// Helper to find next class
const getNextClass = (horarios: Horario[] = []) => {
  if (!horarios.length) return null;

  const now = new Date();
  const currentDay = now.getDay() || 7; // 1 (Mon) - 7 (Sun)
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Sort schedules: Day first, then time
  const sortedHorarios = [...horarios].sort((a, b) => {
    if (a.diaSemana !== b.diaSemana) return a.diaSemana - b.diaSemana;
    const timeA = parseInt(a.horaInicio.split(':')[0]) * 60 + parseInt(a.horaInicio.split(':')[1]);
    const timeB = parseInt(b.horaInicio.split(':')[0]) * 60 + parseInt(b.horaInicio.split(':')[1]);
    return timeA - timeB;
  });

  // Find next class today
  const nextToday = sortedHorarios.find(h => {
    const start = parseInt(h.horaInicio.split(':')[0]) * 60 + parseInt(h.horaInicio.split(':')[1]);
    return h.diaSemana === currentDay && start > currentTime;
  });

  if (nextToday) return { ...nextToday, label: 'Hoy' };

  // Find first class in upcoming days
  const nextUpcoming = sortedHorarios.find(h => h.diaSemana > currentDay);
  if (nextUpcoming) return { ...nextUpcoming, label: nextUpcoming.diaSemanaTexto };

  // If no classes later this week, return first class of next week
  return sortedHorarios[0] ? { ...sortedHorarios[0], label: sortedHorarios[0].diaSemanaTexto } : null;
};

const InicioDashboard: React.FC = () => {
  const { data: perfil } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

  const { data: periodo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const { data: estadisticas } = useQuery({
    queryKey: ['estadisticas', periodo?.id],
    queryFn: () => estudiantesApi.getNotas(periodo?.id),
    enabled: !!periodo,
  });

  const { data: horarios } = useQuery({
    queryKey: ['mi-horario'],
    queryFn: estudiantesApi.getMiHorario,
  });

  // Obtener asistencias del estudiante
  const { data: asistenciasPorCurso } = useQuery({
    queryKey: ['asistencias-estudiante-dashboard', perfil?.id, periodo?.id],
    queryFn: () => asistenciasApi.getAsistenciasEstudiante(perfil!.id, periodo?.id),
    enabled: !!perfil?.id && !!periodo?.id,
  });

  // Calcular promedios de asistencia
  const estadisticasAsistencia = useMemo(() => {
    if (!asistenciasPorCurso || asistenciasPorCurso.length === 0) {
      return { promedioAsistencia: 0, cursosConAlerta: 0, cursosBloqueados: 0 };
    }

    const totalCursos = asistenciasPorCurso.length;
    const sumaAsistencias = asistenciasPorCurso.reduce((sum, c) => sum + c.porcentajeAsistencia, 0);
    const promedioAsistencia = sumaAsistencias / totalCursos;
    const cursosConAlerta = asistenciasPorCurso.filter(c => c.alertaBajaAsistencia).length;
    const cursosBloqueados = asistenciasPorCurso.filter(c => (100 - c.porcentajeAsistencia) >= 30).length;

    return { promedioAsistencia, cursosConAlerta, cursosBloqueados };
  }, [asistenciasPorCurso]);

  // Cursos disponibles para matrícula
  const { data: cursosDisponibles } = useQuery({
    queryKey: ['cursos-disponibles-dashboard', periodo?.id],
    queryFn: () => estudiantesApi.getCursosDisponibles(periodo?.id),
    enabled: !!periodo,
  });

  // Filtrar solo cursos disponibles (no matriculados)
  const cursosParaMatricular = useMemo(() =>
    cursosDisponibles?.filter(c => c.disponible && !c.yaMatriculado) || [],
    [cursosDisponibles]
  );
  const promedioGeneral = estadisticas?.promedioGeneral || perfil?.promedioAcumulado || 0;
  const nextClass = useMemo(() => getNextClass(horarios), [horarios]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
            {getGreeting()}, {perfil?.nombreCompleto?.split(' ')[0]}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {perfil?.carrera} • Ciclo {perfil?.cicloActual}
          </p>
        </div>
        {periodo && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-full shadow-sm w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-zinc-600">{periodo.nombre}</span>
          </div>
        )}
      </div>

      {/* MÓVIL: Próxima Clase primero */}
      <div className="md:hidden">
        <div className="bg-zinc-900 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Clock className="w-20 h-20" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Próxima Clase</span>
              {nextClass && (
                <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-medium text-white border border-white/10">
                  {nextClass.label}
                </span>
              )}
            </div>

            {nextClass ? (
              <>
                <h3 className="text-lg font-semibold mb-1 line-clamp-2">{nextClass.nombreCurso}</h3>
                <p className="text-zinc-400 text-xs mb-4">{nextClass.aula ? `Aula ${nextClass.aula}` : 'Aula por asignar'}</p>

                <div className="flex items-center justify-between text-sm font-mono text-zinc-300 bg-white/5 p-2.5 rounded-lg border border-white/5">
                  <span>{nextClass.horaInicio}</span>
                  <div className="h-px w-6 bg-zinc-600" />
                  <span>{nextClass.horaFin}</span>
                </div>
              </>
            ) : (
              <p className="text-zinc-400 text-sm py-4 text-center">No hay clases programadas</p>
            )}
          </div>
        </div>
      </div>

      {/* MÓVIL: KPIs en una sola card */}
      <div className="md:hidden">
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-zinc-100">
            {/* Promedio */}
            <div className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-zinc-600" />
                </div>
              </div>
              <span className="text-2xl font-semibold text-zinc-900 tabular-nums block">
                {promedioGeneral.toFixed(1)}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Promedio</span>
            </div>

            {/* Créditos */}
            <div className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-zinc-600" />
                </div>
              </div>
              <span className="text-2xl font-semibold text-zinc-900 tabular-nums block">
                {perfil?.creditosAcumulados || 0}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Créditos</span>
            </div>

            {/* Cursos Disponibles */}
            <div className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <span className="text-2xl font-semibold text-zinc-900 tabular-nums block">
                {cursosParaMatricular.length}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Disponibles</span>
            </div>
          </div>
        </div>
      </div>

      {/* MÓVIL: Tarjeta de Asistencias */}
      {asistenciasPorCurso && asistenciasPorCurso.length > 0 && (
        <div className="md:hidden">
          <Link
            to="/estudiante/asistencias"
            className="block bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden hover:border-zinc-300 transition-colors"
          >
            <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-600 stroke-[1.5]" />
                <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Asistencias</h3>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold font-mono tabular-nums text-zinc-900">
                    {estadisticasAsistencia.cursosConAlerta}
                  </div>
                  <div className="text-[10px] text-zinc-700 mt-0.5 uppercase font-medium">Con Alerta</div>
                </div>
                <div className="bg-zinc-100 border border-zinc-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold font-mono tabular-nums text-zinc-900">
                    {asistenciasPorCurso.length}
                  </div>
                  <div className="text-[10px] text-zinc-700 mt-0.5 uppercase font-medium">Total Cursos</div>
                </div>
              </div>
              {estadisticasAsistencia.cursosBloqueados > 0 && (
                <div className="bg-zinc-900 text-white border-t border-zinc-800 rounded-lg px-3 py-2.5 flex items-center gap-2">
                  <Ban className="h-4 w-4 text-white flex-shrink-0 stroke-[1.5]" />
                  <p className="text-xs text-white">
                    {estadisticasAsistencia.cursosBloqueados} curso(s) bloqueado(s) para examen final
                  </p>
                </div>
              )}
            </div>
          </Link>
        </div>
      )}


      {/* MÓVIL: Cursos disponibles como lista compacta */}
      <div className="md:hidden">
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Cursos Disponibles</h3>
              {cursosParaMatricular.length > 0 && (
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                  {cursosParaMatricular.length}
                </span>
              )}
            </div>
            <Link to="/estudiante/matricula" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Matricular <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-50">
            {cursosParaMatricular.slice(0, 4).map((curso) => (
              <div key={curso.id} className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900 truncate">{curso.nombreCurso}</p>
                  <p className="text-xs text-zinc-500">Ciclo {curso.ciclo} • {(curso.capacidadMaxima || 30) - curso.estudiantesMatriculados} vacantes</p>
                </div>
                <span className="ml-3 text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {curso.creditos} cr
                </span>
              </div>
            ))}
            {cursosParaMatricular.length === 0 && (
              <div className="px-4 py-8 text-center">
                <BookOpen className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">No hay cursos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP: Layout original con grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {/* Columna izquierda: KPIs + Tabla */}
        <div className="md:col-span-2 space-y-4">
          {/* KPIs en fila */}
          <div className="grid grid-cols-3 gap-4">
            {/* Promedio */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Promedio</span>
                <TrendingUp className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <span className="text-3xl font-semibold text-zinc-900 tracking-tight tabular-nums">
                  {promedioGeneral.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Créditos */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Créditos</span>
                <GraduationCap className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <span className="text-3xl font-semibold text-zinc-900 tracking-tight tabular-nums">
                  {perfil?.creditosAcumulados}
                </span>
                <span className="text-sm text-zinc-400 ml-1">aprobados</span>
              </div>
            </div>

            {/* Cursos Disponibles */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Cursos</span>
                <Plus className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <span className="text-3xl font-semibold text-zinc-900 tracking-tight tabular-nums">
                  {cursosParaMatricular.length}
                </span>
                <span className="text-sm text-zinc-400 ml-1">disponibles</span>
              </div>
            </div>
          </div>

          {/* Tabla de Cursos Disponibles */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-900">Cursos Disponibles </h3>

              </div>

            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Curso</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Créditos</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Ciclo</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Vacantes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {cursosParaMatricular.length > 0 ? (
                    cursosParaMatricular.slice(0, 5).map((curso) => {
                      const vacantes = (curso.capacidadMaxima || 30) - curso.estudiantesMatriculados;
                      return (
                        <tr key={curso.id} className="group hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-900">{curso.nombreCurso}</span>
                              <span className="text-xs text-zinc-500 font-mono">{curso.codigo}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className="text-sm text-zinc-600 font-mono">{curso.creditos}</span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-zinc-100 text-zinc-700 border-zinc-200">
                              Ciclo {curso.ciclo}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`text-sm font-mono ${vacantes > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {vacantes}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center">
                          <BookOpen className="w-8 h-8 text-zinc-300 mb-2" />
                          <p className="text-sm text-zinc-500">No hay cursos disponibles para matrícula</p>
                          <p className="text-xs text-zinc-400 mt-1">Ya estás matriculado en todos los cursos disponibles</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Columna derecha: Próxima Clase + Asistencias */}
        <div className="space-y-6">
          {/* Next Class Card */}
          <div className="bg-zinc-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="w-24 h-24" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Próxima Clase</span>
                {nextClass && (
                  <span className="px-2 py-1 bg-white/10 rounded text-xs font-medium text-white border border-white/10">
                    {nextClass.label}
                  </span>
                )}
              </div>

              {nextClass ? (
                <>
                  <h3 className="text-xl font-semibold mb-1 line-clamp-2">{nextClass.nombreCurso}</h3>
                  <p className="text-zinc-400 text-sm mb-6">{nextClass.aula ? `Aula ${nextClass.aula}` : 'Aula por asignar'}</p>

                  <div className="flex items-center justify-between text-sm font-mono text-zinc-300 bg-white/5 p-3 rounded-lg border border-white/5">
                    <span>{nextClass.horaInicio}</span>
                    <div className="h-px w-8 bg-zinc-600" />
                    <span>{nextClass.horaFin}</span>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-zinc-400 text-sm">No hay clases programadas próximamente</p>
                </div>
              )}
            </div>
          </div>

          {/* Asistencias Card */}
          {asistenciasPorCurso && asistenciasPorCurso.length > 0 && (
            <Link
              to="/estudiante/asistencias"
              className="block bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden hover:border-zinc-300 transition-colors"
            >
              <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-600 stroke-[1.5]" />
                  <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">Asistencias</h3>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold font-mono tabular-nums text-zinc-900">
                      {estadisticasAsistencia.cursosConAlerta}
                    </div>
                    <div className="text-xs text-zinc-700 mt-1 uppercase font-medium">Con Alerta</div>
                  </div>
                  <div className="bg-zinc-100 border border-zinc-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold font-mono tabular-nums text-zinc-900">
                      {asistenciasPorCurso.length}
                    </div>
                    <div className="text-xs text-zinc-700 mt-1 uppercase font-medium">Total Cursos</div>
                  </div>
                </div>
                {estadisticasAsistencia.cursosBloqueados > 0 && (
                  <div className="bg-zinc-900 text-white border-t border-zinc-800 rounded-lg px-3 py-2.5 flex items-center gap-2">
                    <Ban className="h-4 w-4 text-white flex-shrink-0 stroke-[1.5]" />
                    <p className="text-xs text-white">
                      {estadisticasAsistencia.cursosBloqueados} curso(s) bloqueado(s) para examen final
                    </p>
                  </div>
                )}
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default InicioDashboard;



