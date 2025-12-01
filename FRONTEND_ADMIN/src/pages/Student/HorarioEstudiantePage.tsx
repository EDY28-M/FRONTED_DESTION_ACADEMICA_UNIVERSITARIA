import { useState, useEffect } from 'react';
import { estudiantesApi } from '../../services/estudiantesApi';
import { Horario } from '../../types/horario';
import { HorarioSemanalView } from '../../components/Horario/HorarioSemanalView';
import { CalendarDays, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const HorarioEstudiantePage = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const data = await estudiantesApi.getMiHorario();
        setHorarios(data);
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        toast.error('No se pudo cargar su horario académico.');
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="inline-block w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="h-14 px-6 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-zinc-900">Mi Horario</h1>
              <p className="text-[11px] text-zinc-500">Carga académica semanal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-100 rounded-lg">
              <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px] text-zinc-600 font-medium">Periodo Actual</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono tabular-nums">
              {horarios.length} {horarios.length === 1 ? 'clase' : 'clases'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {horarios.length > 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <HorarioSemanalView horarios={horarios} />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-[13px] font-medium text-zinc-900 mb-1">Sin horarios asignados</p>
            <p className="text-[11px] text-zinc-500">No se encontraron cursos con horarios programados para este periodo.</p>
          </div>
        )}
      </div>
    </div>
  );
};
