import React, { useState, useMemo } from 'react';
import { Horario } from '../../types/horario';

interface HorarioSemanalViewProps {
  horarios: Horario[];
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
  const [selectedDay, setSelectedDay] = useState(today >= 1 && today <= 6 ? today : 1);

  const horariosDelDia = useMemo(() => 
    horarios
      .filter(h => h.diaSemana === selectedDay)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    [horarios, selectedDay]
  );

  const clasesPorDia = useMemo(() => {
    const counts: Record<number, number> = {};
    horarios.forEach(h => {
      counts[h.diaSemana] = (counts[h.diaSemana] || 0) + 1;
    });
    return counts;
  }, [horarios]);

  const getDuracionHoras = (horario: Horario): number => {
    const [startH] = horario.horaInicio.split(':').map(Number);
    const [endH] = horario.horaFin.split(':').map(Number);
    return Math.max(1, endH - startH);
  };

  const getHoraBloque = (horario: Horario, index: number): string => {
    const [startH] = horario.horaInicio.split(':').map(Number);
    const hora = startH + index;
    return `${hora.toString().padStart(2, '0')}:00 - ${(hora + 1).toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="p-4">
      {/* Selector de día */}
      <div className="flex items-center justify-between gap-1 mb-4 overflow-x-auto pb-2">
        {DAYS.map((day, idx) => {
          const dayNum = idx + 1;
          const isSelected = selectedDay === dayNum;
          const hasClasses = clasesPorDia[dayNum] > 0;
          
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(dayNum)}
              className={`
                flex-1 min-w-[50px] flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all
                ${isSelected 
                  ? 'bg-zinc-900 text-white' 
                  : hasClasses
                    ? 'bg-zinc-100 text-zinc-700'
                    : 'bg-zinc-50 text-zinc-400'
                }
              `}
            >
              <span className="text-[10px] font-medium">{DAYS_SHORT[idx]}</span>
              {hasClasses && (
                <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {clasesPorDia[dayNum]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de clases */}
      {horariosDelDia.length > 0 ? (
        <div className="space-y-0 border border-zinc-200 rounded-lg overflow-hidden">
          {horariosDelDia.map((horario) => {
            const colorIndex = horario.idCurso % COURSE_COLORS.length;
            const colors = COURSE_COLORS[colorIndex];
            const duracion = getDuracionHoras(horario);
            
            return Array.from({ length: duracion }, (_, i) => (
              <div 
                key={`${horario.id}-${i}`}
                className="flex border-b border-zinc-200 last:border-b-0"
              >
                {/* Columna hora */}
                <div className="w-20 flex-shrink-0 p-3 text-xs text-zinc-500 border-r border-zinc-200 bg-white">
                  {getHoraBloque(horario, i)}
                </div>
                
                {/* Contenido del curso */}
                <div 
                  className="flex-2 p-2"
                  style={{ 
                    backgroundColor: colors.bg,
                    borderLeft: `3px solid ${colors.border}`
                  }}
                >
                  {/* Nombre */}
                  <p className="text-xs font-bold text-zinc-800 uppercase">
                    {horario.nombreCurso?.toUpperCase() || 'SIN NOMBRE'}
                  </p>
                  {/* Docente */}
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {horario.nombreDocente || 'Sin docente'}
                  </p>
                  {/* Aula */}
                  <p className="text-[10px] text-zinc-600">
                    {horario.aula || 'Sin aula'}
                  </p>
                </div>
              </div>
            ));
          })}
        </div>
      ) : (
        <div className="py-12 text-center border border-zinc-200 rounded-lg">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-sm text-zinc-500">Sin clases este día</p>
        </div>
      )}
    </div>
  );
};

// ==========================================
// VISTA DESKTOP - Exactamente como la imagen
// ==========================================
const DesktopView: React.FC<{ horarios: Horario[] }> = ({ horarios }) => {
  const timeSlots = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  // Crear estructura de datos para la grilla
  const gridData = useMemo(() => {
    const grid: Record<string, { horario: Horario; isFirst: boolean }> = {};
    
    horarios.forEach(h => {
      const [startH] = h.horaInicio.split(':').map(Number);
      const [endH] = h.horaFin.split(':').map(Number);
      
      for (let hora = startH; hora < endH; hora++) {
        const key = `${h.diaSemana}-${hora}`;
        grid[key] = {
          horario: h,
          isFirst: hora === startH
        };
      }
    });
    
    return grid;
  }, [horarios]);

  const formatHora = (hora: number): string => {
    if (hora >= 12) {
      const h = hora > 12 ? hora - 12 : hora;
      const nextH = hora + 1 > 12 ? hora + 1 - 12 : hora + 1;
      return `${h.toString().padStart(2, '0')} - ${nextH.toString().padStart(2, '0')} PM`;
    }
    return `${hora.toString().padStart(2, '0')}:00 - ${(hora + 1).toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse min-w-[100px]" style={{ tableLayout: 'fixed' }}>
        {/* Header */}
        <thead>
          <tr>
            <th 
              className="p-2 text-xs font-semibold text-zinc-600 bg-white border-b-2 border-zinc-200 text-center"
              style={{ width: '100px' }}
            >
              HORA
            </th>
            {DAYS.map((day) => (
              <th 
                key={day}
                className="p-2 text-sm font-semibold text-zinc-700 bg-white border-b-2 border-zinc-200 text-center"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        
        {/* Body */}
        <tbody>
          {timeSlots.map((hora) => (
            <tr key={hora} style={{ height: '100px' }}>
              {/* Columna de hora */}
              <td 
                className="p-2 text-[10px] text-zinc-500 bg-white border-b border-zinc-200 text-center whitespace-nowrap align-top"
                style={{ width: '80px' }}
              >
                {formatHora(hora)}
              </td>
              
              {/* Celdas para cada día */}
              {DAYS.map((_, dayIdx) => {
                const dia = dayIdx + 1;
                const key = `${dia}-${hora}`;
                const cellData = gridData[key];
                
                if (cellData) {
                  const { horario } = cellData;
                  const colorIndex = horario.idCurso % COURSE_COLORS.length;
                  const colors = COURSE_COLORS[colorIndex];
                  
                  return (
                    <td 
                      key={key}
                      className="border-b border-zinc-200 p-2 align-top"
                    >
                      <div 
                        className="p-4 rounded-md"
                        style={{ 
                          backgroundColor: colors.bg,
                          borderLeft: `3px solid ${colors.border}`,
                          minHeight: '80px'
                        }}
                      >
                        {/* Nombre del curso */}
                        <p className="text-[10px] font-bold text-zinc-800 uppercase leading-tight">
                          {horario.nombreCurso?.toUpperCase() || 'SIN NOMBRE'}
                        </p>
                        {/* Docente */}
                        <p className="text-[9px] text-zinc-600 mt-1 leading-tight">
                          {horario.nombreDocente || 'Sin docente'}
                        </p>
                        {/* Aula */}
                        <p className="text-[9px] text-zinc-600 leading-tight">
                          {horario.aula || 'Sin aula'}
                        </p>
                      </div>
                    </td>
                  );
                }
                
                // Celda vacía
                return (
                  <td 
                    key={key}
                    className="border-b border-zinc-200 bg-white p-2"
                    style={{ height: '100px' }}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
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
