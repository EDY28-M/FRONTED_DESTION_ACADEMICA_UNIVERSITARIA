import React from 'react';
import { Horario } from '../../types/horario';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface HorarioSemanalViewProps {
  horarios: Horario[];
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const START_HOUR = 7;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR + 1;

// Define a palette of colors for courses (Custom Dark Theme)
const COURSE_COLORS = [
  // 1. Verde agua (Teal/Cyan mix)
  { bg: 'from-teal-600 to-teal-700', border: 'border-l-teal-400', text: 'text-white', badge: 'bg-black/20 text-teal-50 border-teal-400/30', icon: 'text-teal-200' },
  // 2. Amarillo (Amber/Yellow - darkened for readability)
  { bg: 'from-yellow-600 to-yellow-700', border: 'border-l-yellow-400', text: 'text-white', badge: 'bg-black/20 text-yellow-50 border-yellow-400/30', icon: 'text-yellow-200' },
  // 3. Azul marino (Indigo/Blue dark)
  { bg: 'from-indigo-800 to-indigo-900', border: 'border-l-indigo-500', text: 'text-white', badge: 'bg-black/20 text-indigo-100 border-indigo-500/30', icon: 'text-indigo-300' },
  // 4. Rosa paleta (Rose/Pink)
  { bg: 'from-rose-500 to-rose-600', border: 'border-l-rose-300', text: 'text-white', badge: 'bg-black/20 text-rose-50 border-rose-300/30', icon: 'text-rose-200' },
  // 5. Morado (Purple - as requested in list)
  { bg: 'from-purple-600 to-purple-700', border: 'border-l-purple-400', text: 'text-white', badge: 'bg-black/20 text-purple-50 border-purple-400/30', icon: 'text-purple-200' },
  // 6. Naranja claro (Orange)
  { bg: 'from-orange-500 to-orange-600', border: 'border-l-orange-300', text: 'text-white', badge: 'bg-black/20 text-orange-50 border-orange-300/30', icon: 'text-orange-200' },
  // 7. Gris (Slate/Zinc)
  { bg: 'from-slate-600 to-slate-700', border: 'border-l-slate-400', text: 'text-white', badge: 'bg-black/20 text-slate-50 border-slate-400/30', icon: 'text-slate-200' },
  // 8. Azul claro (Sky/Light Blue)
  { bg: 'from-sky-500 to-sky-600', border: 'border-l-sky-300', text: 'text-white', badge: 'bg-black/20 text-sky-50 border-sky-300/30', icon: 'text-sky-200' },
];

export const HorarioSemanalView: React.FC<HorarioSemanalViewProps> = ({ horarios }) => {
  // Helper to calculate grid position
  const getGridPosition = (horaInicio: string, horaFin: string, diaSemana: number) => {
    const [startH, startM] = horaInicio.split(':').map(Number);
    const [endH, endM] = horaFin.split(':').map(Number);

    // Row 1 corresponds to START_HOUR:00. Each hour has 2 slots (30 mins).
    const startRow = (startH - START_HOUR) * 2 + (startM >= 30 ? 2 : 1);
    
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    const span = Math.ceil(durationMinutes / 30);

    // diaSemana: 1=Lunes (col 2), ... 6=Sabado (col 7)
    const colStart = diaSemana + 1;

    return {
      gridRowStart: startRow,
      gridRowEnd: `span ${span}`,
      gridColumnStart: colStart,
    };
  };

  const timeSlots = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header Row */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="p-3 text-center text-xs font-medium text-gray-400 border-r border-gray-100">
          GMT-5
        </div>
        {DAYS.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-100 last:border-r-0 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="relative grid grid-cols-7 auto-rows-[1.75rem] overflow-y-auto max-h-[800px] bg-white">
        {/* Background Grid Lines & Time Labels */}
        {timeSlots.map((hour, index) => (
          <React.Fragment key={hour}>
            {/* Time Label */}
            <div 
              className="row-span-2 border-r border-b border-gray-50 text-[10px] font-medium text-gray-400 flex items-start justify-center pt-1.5 bg-gray-50/30"
              style={{ gridRowStart: index * 2 + 1 }}
            >
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
            
            {/* Empty Cells for Grid Lines */}
            {DAYS.map((_, dayIndex) => (
              <div 
                key={`${hour}-${dayIndex}`}
                className="row-span-2 border-r border-b border-dashed border-gray-100 last:border-r-0"
                style={{ gridRowStart: index * 2 + 1, gridColumnStart: dayIndex + 2 }}
              />
            ))}
          </React.Fragment>
        ))}

        {/* Class Cards */}
        {horarios.map((horario) => {
          const style = getGridPosition(horario.horaInicio, horario.horaFin, horario.diaSemana);
          
          if (horario.diaSemana < 1 || horario.diaSemana > 6) return null;

          // Determine color based on course ID
          const colorIndex = horario.idCurso % COURSE_COLORS.length;
          const theme = COURSE_COLORS[colorIndex];
          
          return (
            <div
              key={horario.id}
              className={`
                m-1 p-2 rounded-lg shadow-sm border border-gray-100
                hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 
                flex flex-col justify-between overflow-hidden group
                bg-gradient-to-br ${theme.bg} border-l-4 ${theme.border}
              `}
              style={{
                ...style,
                zIndex: 10
              }}
            >
              <div className="flex flex-col gap-0.5">
                <div className={`font-bold text-[11px] leading-tight line-clamp-2 ${theme.text}`} title={horario.nombreCurso}>
                  {horario.nombreCurso}
                </div>
                
                <div className="flex items-center gap-1 text-[10px] text-white/80 mt-0.5">
                  <ClockIcon className="w-3 h-3" />
                  <span>{horario.horaInicio} - {horario.horaFin}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <div className={`
                  flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium border
                  ${theme.badge}
                `}>
                  <MapPinIcon className="w-3 h-3" />
                  <span>{horario.aula || 'S/A'}</span>
                </div>
                
                <span className={`
                  text-[9px] font-bold uppercase tracking-wider opacity-60
                  ${theme.icon}
                `}>
                  {horario.tipo.substring(0, 3)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
