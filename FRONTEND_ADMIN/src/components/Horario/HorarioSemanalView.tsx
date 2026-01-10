import React, { useState, useMemo, forwardRef } from 'react';
import { Horario } from '../../types/horario';

interface HorarioSemanalViewProps {
  horarios: Horario[];
  /** Si true, muestra solo la vista desktop (para PDF export) */
  forceDesktop?: boolean;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const START_HOUR = 7;
const END_HOUR = 22;

// Colores como en la imagen (verde claro, azul claro, etc)
const COURSE_COLORS = [
  { bg: '#d1fae5', border: '#34d399' }, // verde esmeralda
  { bg: '#dbeafe', border: '#60a5fa' }, // azul claro
  { bg: '#fef3c7', border: '#fbbf24' }, // amarillo
  { bg: '#fce7f3', border: '#f472b6' }, // rosa
  { bg: '#e0e7ff', border: '#818cf8' }, // indigo
  { bg: '#ccfbf1', border: '#2dd4bf' }, // teal
  { bg: '#fed7aa', border: '#fb923c' }, // naranja
  { bg: '#e9d5ff', border: '#a78bfa' }, // violeta
];

// ==========================================
// VISTA MÓVIL
// ==========================================
const MobileView: React.FC<{ horarios: Horario[] }> = ({ horarios }) => {
  const today = new Date().getDay();
  // Default to Monday (1) if today is Sunday (0)
  const [selectedDay, setSelectedDay] = useState(today >= 1 && today <= 6 ? today : 1);

  const horariosDelDia = useMemo(() =>
    horarios
      .filter(h => h.diaSemana === selectedDay)
      .sort((a, b) => {
        const [hA] = a.horaInicio.split(':').map(Number);
        const [hB] = b.horaInicio.split(':').map(Number);
        return hA - hB;
      }),
    [horarios, selectedDay]
  );

  const clasesPorDia = useMemo(() => {
    const counts: Record<number, number> = {};
    horarios.forEach(h => {
      counts[h.diaSemana] = (counts[h.diaSemana] || 0) + 1;
    });
    return counts;
  }, [horarios]);

  return (
    <div className="p-4">
      {/* Selector de día - Grid layout for perfect alignment */}
      <div className="grid grid-cols-6 gap-2 mb-6">
        {DAYS_SHORT.map((dayShort, idx) => {
          const dayNum = idx + 1;
          const isSelected = selectedDay === dayNum;
          const hasClasses = clasesPorDia[dayNum] > 0;

          return (
            <button
              key={dayShort}
              onClick={() => setSelectedDay(dayNum)}
              className={`
                flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-200 border
                ${isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-md ring-2 ring-zinc-200 ring-offset-1'
                  : hasClasses
                    ? 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300'
                    : 'bg-zinc-50 text-zinc-400 border-transparent opacity-60'
                }
              `}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">{dayShort}</span>
              {hasClasses && (
                <span className={`text-[10px] mt-1 font-bold ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {clasesPorDia[dayNum]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de clases */}
      <div className="space-y-3">
        {horariosDelDia.length > 0 ? (
          horariosDelDia.map((horario) => {
            const colorIndex = horario.idCurso % COURSE_COLORS.length;
            const colors = COURSE_COLORS[colorIndex];

            // Format times clearly
            const startTime = horario.horaInicio.slice(0, 5);
            const endTime = horario.horaFin.slice(0, 5);

            return (
              <div
                key={`${horario.id}-${horario.diaSemana}`}
                className="flex items-stretch rounded-xl overflow-hidden bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Time Column - Fixed width for alignment */}
                <div className="w-20 bg-zinc-50 flex flex-col items-center justify-center p-2 border-r border-zinc-100 shrink-0">
                  <span className="text-sm font-bold text-zinc-900">{startTime}</span>
                  <div className="w-0.5 h-3 bg-zinc-200 my-1 rounded-full"></div>
                  <span className="text-xs font-medium text-zinc-500">{endTime}</span>
                </div>

                {/* Vertical Color Strip */}
                <div className="w-1.5" style={{ backgroundColor: colors.border }}></div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                  <h3 className="text-sm font-bold text-zinc-900 leading-tight mb-2 uppercase truncate">
                    {horario.nombreCurso}
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="truncate">{horario.nombreDocente || 'Docente no asignado'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700">
                        {horario.aula || 'G.204'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
            <div className="w-12 h-12 mb-3 rounded-full bg-white shadow-sm flex items-center justify-center ring-1 ring-zinc-200">
              <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-900">Sin clases</p>
            <p className="text-xs text-zinc-500">No hay horario para el {DAYS[selectedDay - 1].toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// VISTA DESKTOP - Modern Column View (Kanban Style)
// ==========================================
const DesktopView: React.FC<{ horarios: Horario[] }> = ({ horarios }) => {
  // Organizar horarios por día
  const horariosPorDia = useMemo(() => {
    const grouped: Record<number, Horario[]> = {};
    // Inicializar días 1-6
    for (let i = 1; i <= 6; i++) {
      grouped[i] = [];
    }

    // Agrupar
    horarios.forEach(h => {
      if (grouped[h.diaSemana]) {
        grouped[h.diaSemana].push(h);
      }
    });

    // Ordenar por hora cada día
    Object.keys(grouped).forEach(k => {
      const key = Number(k);
      grouped[key].sort((a, b) => {
        const [hA] = a.horaInicio.split(':').map(Number);
        const [hB] = b.horaInicio.split(':').map(Number);
        return hA - hB;
      });
    });

    return grouped;
  }, [horarios]);

  return (
    <div className="p-6 bg-zinc-50/30 overflow-x-auto">
      <div className="min-w-[1024px]"> {/* Asegurar ancho mínimo para evitar colapso de columnas */}
        <div className="grid grid-cols-6 gap-4">
          {/* Headers de Días */}
          {DAYS.map((day) => (
            <div key={day} className="text-center pb-3 border-b-2 border-zinc-100 mb-2">
              <h3 className="text-sm font-bold text-zinc-600 uppercase tracking-wide">{day}</h3>
            </div>
          ))}

          {/* Columnas de Contenido */}
          {DAYS.map((_, idx) => {
            const dayNum = idx + 1;
            const courses = horariosPorDia[dayNum];

            return (
              <div key={dayNum} className="space-y-3 min-h-[300px]">
                {courses.length > 0 ? (
                  courses.map(horario => {
                    const colorIndex = horario.idCurso % COURSE_COLORS.length;
                    const colors = COURSE_COLORS[colorIndex];
                    // Formato HH:MM
                    const startTime = horario.horaInicio.slice(0, 5);
                    const endTime = horario.horaFin.slice(0, 5);

                    return (
                      <div
                        key={`${horario.id}-${dayNum}`}
                        className="group relative bg-white rounded-xl border border-zinc-200 shadow-sm transition-all duration-200 flex flex-col min-h-min"
                      >
                        {/* Indicador de Color (Borde izquierdo grueso) */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" style={{ backgroundColor: colors.border }} />

                        <div className="pl-5 p-3.5 flex flex-col gap-2 h-full">
                          {/* Time Badge */}
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-700 bg-zinc-100/80 px-2 py-0.5 rounded-full border border-zinc-100">
                              {startTime} - {endTime}
                            </span>
                          </div>

                          {/* Course Name */}
                          <h4 className="text-[13px] font-bold text-zinc-800 uppercase leading-snug">
                            {horario.nombreCurso}
                          </h4>

                          {/* Metadata Check */}
                          <div className="pt-2 mt-2 border-t border-dashed border-zinc-100 flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                              <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="truncate" title={horario.nombreDocente}>{horario.nombreDocente || 'Docente no asignado'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                              <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="font-medium">{horario.aula || 'Aula G.204'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Empty Column State
                  <div className="h-full rounded-xl border border-dashed border-zinc-100 bg-zinc-50/50 flex flex-col items-center justify-center text-center p-4">
                    <span className="text-[10px] text-zinc-300 font-medium uppercase tracking-widest">Libre</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export const HorarioSemanalView = forwardRef<HTMLDivElement, HorarioSemanalViewProps>(
  ({ horarios, forceDesktop = false }, ref) => {
    return (
      <div ref={ref} className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {/* Mobile - Oculto cuando forceDesktop está activo */}
        {!forceDesktop && (
          <div className="lg:hidden">
            <MobileView horarios={horarios} />
          </div>
        )}

        {/* Desktop */}
        <div className={forceDesktop ? 'block' : 'hidden lg:block'}>
          <DesktopView horarios={horarios} />
        </div>
      </div>
    );
  }
);

HorarioSemanalView.displayName = 'HorarioSemanalView';
