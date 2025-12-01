import { useState, useEffect } from 'react';
import { estudiantesApi } from '../../services/estudiantesApi';
import { Horario } from '../../types/horario';
import { HorarioSemanalView } from '../../components/Horario/HorarioSemanalView';
import { Calendar, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Empty State Component
const EmptyState = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="py-16 text-center bg-white border border-zinc-200 rounded-xl">
    <Icon className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
    <p className="text-sm text-zinc-500 mb-1">{title}</p>
    <p className="text-xs text-zinc-400">{description}</p>
  </div>
);

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
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-zinc-400 text-sm">Cargando horario...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Mi Horario Académico</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Visualiza tu carga académica semanal</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 rounded-md border border-zinc-100">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs text-zinc-600 font-medium">Periodo Actual</span>
            </div>
            <span className="text-xs text-zinc-400 font-mono tabular-nums">
              {horarios.length} {horarios.length === 1 ? 'clase' : 'clases'}
            </span>
          </div>
        </div>
      </div>

      {/* Horario */}
      {horarios.length > 0 ? (
        <HorarioSemanalView horarios={horarios} />
      ) : (
        <EmptyState 
          icon={Clock}
          title="Sin horarios asignados"
          description="No se encontraron cursos con horarios programados para este periodo."
        />
      )}
    </div>
  );
};
