import React, { useState, useMemo } from 'react';
import { Horario } from '../../types/horario';

interface HorarioSemanalViewProps {
  horarios: Horario[];
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S'];
const START_HOUR = 7;
const END_HOUR = 22;

// Paleta minimalista - solo borde izquierdo de color
const COURSE_ACCENTS = [
  'border-l-emerald-500',
  'border-l-blue-500', 
  'border-l-violet-500',
  'border-l-amber-500',
  'border-l-rose-500',
  'border-l-cyan-500',
  'border-l-orange-500',
  'border-l-pink-500',
];

// ==========================================
// VISTA MÓVIL - Timeline vertical
// ==========================================
const MobileView: React.FC<{ horarios: Horario[] }> = ({ horarios }) => {
  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(today >= 1 && today <= 6 ? today : 1);

  const horariosDelDia = useMemo(() => 
    horarios
      .filter(h => h.diaSemana === selectedDay)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    [horarios, selectedDay]
  );

  // Contar clases por día para mostrar indicador
  const clasesPorDia = useMemo(() => {
    const counts: Record<number, number> = {};
    horarios.forEach(h => {
      counts[h.diaSemana] = (counts[h.diaSemana] || 0) + 1;
    });
    return counts;
  }, [horarios]);

  return (
    <div className="p-4 sm:p-6">
      {/* Selector de día - Pills horizontales */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {DAYS.map((day, idx) => {
          const dayNum = idx + 1;
          const isSelected = selectedDay === dayNum;
          const hasClasses = clasesPorDia[dayNum] > 0;
          
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(dayNum)}
              className={`
                relative flex flex-col items-center justify-center w-12 h-14 rounded-xl transition-all
                ${isSelected 
                  ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' 
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }
              `}
            >
              <span className="text-[10px] font-medium opacity-60">{DAYS_SHORT[idx]}</span>
              <span className="text-sm font-semibold">{day.slice(0, 3)}</span>
              {hasClasses && !isSelected && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-zinc-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de clases - Timeline style */}
      {horariosDelDia.length > 0 ? (
        <div className="space-y-3">
          {horariosDelDia.map((horario, index) => {
            const accentClass = COURSE_ACCENTS[horario.idCurso % COURSE_ACCENTS.length];
            
            return (
              <div 
                key={horario.id}
                className={`
                  relative bg-white border border-zinc-200 rounded-xl p-4
                  border-l-4 ${accentClass}
                  hover:shadow-md hover:border-zinc-300 transition-all
                `}
              >
                {/* Línea de tiempo conectora */}
                {index < horariosDelDia.length - 1 && (
                  <div className="absolute left-[18px] top-full w-px h-3 bg-zinc-200" />
                )}
                
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Hora */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded">
                        {horario.horaInicio}
                      </span>
                      <span className="text-zinc-300">→</span>
                      <span className="text-xs font-mono text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded">
                        {horario.horaFin}
                      </span>
                    </div>
                    
                    {/* Nombre del curso */}
                    <h4 className="font-medium text-zinc-900 text-sm leading-snug mb-1">
                      {horario.nombreCurso}
                    </h4>
                    
                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      {horario.aula && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {horario.aula}
                        </span>
                      )}
                      <span className="text-zinc-400">•</span>
                      <span>{horario.tipo}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-sm text-zinc-500">Sin clases este día</p>
          <p className="text-xs text-zinc-400 mt-1">Selecciona otro día de la semana</p>
        </div>
      )}
    </div>
  );
};

// ==========================================
// VISTA DESKTOP - Grilla semanal
// ==========================================
const DesktopView: React.FC<{ horarios: Horario[] }> = ({ horarios }) => {
  const getGridPosition = (horaInicio: string, horaFin: string, diaSemana: number) => {
    const [startH, startM] = horaInicio.split(':').map(Number);
    const [endH, endM] = horaFin.split(':').map(Number);
    const startRow = (startH - START_HOUR) * 2 + (startM >= 30 ? 2 : 1);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    const span = Math.ceil(durationMinutes / 30);
    return { gridRowStart: startRow, gridRowEnd: `span ${span}`, gridColumnStart: diaSemana + 1 };
  };

  const timeSlots = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  const today = new Date().getDay();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-zinc-200 bg-zinc-50/80">
        <div className="p-3 text-center">
          <span className="text-[10px] font-medium text-zinc-400 uppercase">Hora</span>
        </div>
        {DAYS.map((day, idx) => {
          const isToday = today === idx + 1;
          return (
            <div 
              key={day} 
              className={`p-3 text-center border-l border-zinc-100 ${isToday ? 'bg-zinc-900' : ''}`}
            >
              <span className={`text-xs font-semibold uppercase tracking-wide ${isToday ? 'text-white' : 'text-zinc-600'}`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="relative grid grid-cols-[60px_repeat(6,1fr)] auto-rows-[28px] overflow-y-auto max-h-[600px]">
        {/* Time slots y grid lines */}
        {timeSlots.map((hour, index) => (
          <React.Fragment key={hour}>
            <div 
              className="row-span-2 flex items-start justify-center pt-1 text-[11px] font-mono text-zinc-400 bg-zinc-50/50 border-r border-zinc-100"
              style={{ gridRowStart: index * 2 + 1 }}
            >
              {`${hour}:00`}
            </div>
            {DAYS.map((_, dayIndex) => (
              <div 
                key={`${hour}-${dayIndex}`}
                className={`row-span-2 border-r border-b border-zinc-100/80 ${today === dayIndex + 1 ? 'bg-zinc-50/50' : ''}`}
                style={{ gridRowStart: index * 2 + 1, gridColumnStart: dayIndex + 2 }}
              />
            ))}
          </React.Fragment>
        ))}

        {/* Class cards */}
        {horarios.map((horario) => {
          if (horario.diaSemana < 1 || horario.diaSemana > 6) return null;
          
          const style = getGridPosition(horario.horaInicio, horario.horaFin, horario.diaSemana);
          const accentClass = COURSE_ACCENTS[horario.idCurso % COURSE_ACCENTS.length];
          
          return (
            <div
              key={horario.id}
              className={`
                m-0.5 p-2 rounded-lg bg-white border border-zinc-200
                border-l-[3px] ${accentClass}
                hover:shadow-lg hover:z-20 hover:scale-[1.02] 
                transition-all duration-150 cursor-default
                flex flex-col overflow-hidden group
              `}
              style={{ ...style, zIndex: 10 }}
            >
              <div className="flex-1 min-h-0">
                <p className="text-[11px] font-semibold text-zinc-900 leading-tight line-clamp-2 group-hover:line-clamp-none">
                  {horario.nombreCurso}
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-zinc-100/50">
                <span className="text-[9px] text-zinc-500 font-mono">
                  {horario.horaInicio}-{horario.horaFin}
                </span>
                {horario.aula && (
                  <span className="text-[9px] text-zinc-400 truncate max-w-[60px]">
                    {horario.aula}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export const HorarioSemanalView: React.FC<HorarioSemanalViewProps> = ({ horarios }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      {/* Mobile */}
      <div className="lg:hidden">
        <MobileView horarios={horarios} />
      </div>
      
      {/* Desktop */}
      <div className="hidden lg:block">
        <DesktopView horarios={horarios} />
      </div>
    </div>
  );
};
