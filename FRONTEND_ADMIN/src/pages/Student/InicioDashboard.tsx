import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { BookOpen, Calendar, TrendingUp, GraduationCap, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

// ============================================
// Extracted Components
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sublabel }) => (
  <div className="flex flex-col justify-between h-full">
    <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
    <div className="mt-2">
      <p className="text-3xl font-semibold text-zinc-900 tracking-tight">{value}</p>
      {sublabel && <p className="text-[12px] text-zinc-500 mt-0.5">{sublabel}</p>}
    </div>
  </div>
);

interface CourseRowProps {
  codigo: string;
  nombre: string;
  docente: string;
  creditos: number;
  horasTeorica: number;
  horasPractica: number;
}

const CourseRow: React.FC<CourseRowProps> = ({ codigo, nombre, docente, creditos, horasTeorica, horasPractica }) => (
  <div className="group flex items-center gap-4 py-3 px-4 -mx-4 rounded-lg hover:bg-zinc-50 transition-colors cursor-default">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
          {codigo}
        </span>
        <h4 className="text-[13px] font-medium text-zinc-900 truncate">{nombre}</h4>
      </div>
      <p className="text-[12px] text-zinc-500 mt-0.5 truncate">{docente}</p>
    </div>
    <div className="flex items-center gap-3 text-[12px] text-zinc-500">
      <span className="font-mono">{horasTeorica}T</span>
      <span className="font-mono">{horasPractica}P</span>
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-100 font-semibold text-zinc-700">
        {creditos}
      </span>
    </div>
  </div>
);

// ============================================
// Main Component
// ============================================

const InicioDashboard: React.FC = () => {
  const { data: perfil } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

  const { data: periodo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const { data: misCursos } = useQuery({
    queryKey: ['mis-cursos-dashboard', periodo?.id],
    queryFn: () => estudiantesApi.getMisCursos(periodo?.id),
    enabled: !!periodo,
  });

  const { data: estadisticas } = useQuery({
    queryKey: ['estadisticas', periodo?.id],
    queryFn: () => estudiantesApi.getNotas(periodo?.id),
    enabled: !!periodo,
  });

  const cursosActivos = misCursos?.filter(c => c.estado === 'Matriculado') || [];
  const promedioGeneral = estadisticas?.promedioGeneral || perfil?.promedioAcumulado || 0;
  const totalCreditos = cursosActivos.reduce((sum, c) => sum + c.creditos, 0);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ==================== Welcome Section ==================== */}
      <div className="pb-4">
        <p className="text-[13px] text-zinc-500">{getGreeting()},</p>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight mt-0.5">
          {perfil?.nombreCompleto?.split(' ').slice(0, 2).join(' ') || 'Estudiante'}
        </h1>
        <p className="text-[13px] text-zinc-500 mt-1">
          {perfil?.carrera} · Ciclo {perfil?.cicloActual}
        </p>
      </div>

      {/* ==================== Bento Grid ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card: Periodo Activo (spans 2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Periodo Activo</p>
              </div>
              <p className="text-xl font-semibold text-zinc-900 tracking-tight mt-2">
                {periodo?.nombre || '—'}
              </p>
              {periodo && (
                <p className="text-[12px] text-zinc-500 mt-1">
                  {new Date(periodo.fechaInicio).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} 
                  {' — '}
                  {new Date(periodo.fechaFin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
              En curso
            </span>
          </div>
        </div>

        {/* Card: Ciclo */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <StatCard 
            label="Ciclo Actual" 
            value={perfil?.cicloActual || '—'} 
            sublabel="de 10 ciclos"
          />
        </div>

        {/* Card: Cursos */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <StatCard 
            label="Cursos Activos" 
            value={cursosActivos.length} 
            sublabel={`${totalCreditos} créditos`}
          />
        </div>

        {/* Card: Promedio (featured) */}
        <div className="bg-zinc-900 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Promedio General</p>
              </div>
              <p className="text-4xl font-semibold tracking-tight mt-3">
                {promedioGeneral.toFixed(2)}
              </p>
              <p className="text-[12px] text-zinc-500 mt-1">Escala vigesimal</p>
            </div>
          </div>
        </div>

        {/* Card: Créditos */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <StatCard 
            label="Créditos Aprobados" 
            value={perfil?.creditosAcumulados || 0}
            sublabel="acumulados"
          />
        </div>

        {/* Card: Quick Actions (spans 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-4">Acceso Rápido</p>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to="/estudiante/matricula"
              className="group flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-zinc-600" />
                </div>
                <span className="text-[13px] font-medium text-zinc-700">Matrícula</span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link 
              to="/estudiante/notas"
              className="group flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-zinc-600" />
                </div>
                <span className="text-[13px] font-medium text-zinc-700">Mis Notas</span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link 
              to="/estudiante/horario"
              className="group flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-zinc-600" />
                </div>
                <span className="text-[13px] font-medium text-zinc-700">Mi Horario</span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link 
              to="/estudiante/orden-merito"
              className="group flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-zinc-600" />
                </div>
                <span className="text-[13px] font-medium text-zinc-700">Orden de Mérito</span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* ==================== Courses List ==================== */}
      <div className="bg-white rounded-2xl border border-zinc-200">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-[15px] font-semibold text-zinc-900">Cursos Matriculados</h2>
            <p className="text-[12px] text-zinc-500 mt-0.5">{periodo?.nombre}</p>
          </div>
          {cursosActivos.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 text-zinc-700">
              {cursosActivos.length} {cursosActivos.length === 1 ? 'curso' : 'cursos'}
            </span>
          )}
        </div>
        
        <div className="p-6 pt-2">
          {cursosActivos.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {cursosActivos.map((curso) => (
                <CourseRow
                  key={curso.id}
                  codigo={curso.codigoCurso}
                  nombre={curso.nombreCurso}
                  docente={curso.nombreDocente}
                  creditos={curso.creditos}
                  horasTeorica={Math.floor(curso.horasSemanal * 0.6) || 3}
                  horasPractica={Math.floor(curso.horasSemanal * 0.4) || 2}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-[13px] text-zinc-500 mb-4">No tienes cursos matriculados</p>
              <Link
                to="/estudiante/matricula"
                className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Ir a Matrícula
              </Link>
            </div>
          )}
        </div>
        
        {/* Footer with totals */}
        {cursosActivos.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 rounded-b-2xl">
            <p className="text-[12px] text-zinc-500">Total de créditos matriculados</p>
            <p className="text-[15px] font-semibold text-zinc-900">{totalCreditos}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InicioDashboard;



