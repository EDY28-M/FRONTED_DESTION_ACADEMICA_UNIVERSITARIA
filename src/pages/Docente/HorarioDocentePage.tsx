import { useQuery } from '@tanstack/react-query';
import { docenteHorariosApi } from '../../services/docenteApi';
import { HorarioSemanalView } from '../../components/Horario/HorarioSemanalView';
import { Horario } from '../../types/horario';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Empty State Component (Matching other pages)
const EmptyState = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="py-16 text-center bg-white border border-zinc-200 rounded-lg">
    <Icon className="h-8 w-8 text-zinc-300 mx-auto mb-3 stroke-[1.5]" />
    <p className="text-sm text-zinc-500 mb-1">{title}</p>
    <p className="text-xs text-zinc-400">{description}</p>
  </div>
);

export const HorarioDocentePage = () => {
  const { data: horarios = [], isLoading } = useQuery<Horario[]>({
    queryKey: ['horarios-docente'],
    queryFn: async () => {
      try {
        return await docenteHorariosApi.getMiHorario();
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        toast.error('No se pudo cargar su horario académico.');
        throw error;
      }
    },
    staleTime: 30000, // 30 segundos - se refrescará automáticamente
    refetchOnWindowFocus: true, // Refresca al volver a la ventana
  });

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
  //       <div className="animate-pulse text-zinc-400 text-sm">Cargando horario...</div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header Standard */}
      <header className="bg-white border-b border-zinc-200">
        <div className="h-14 px-10 max-w-1xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-sm font-medium text-zinc-900">Mi Horario Académico</h1>
            <p className="text-xs text-zinc-500">Visualiza tu carga académica semanal</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 rounded border border-zinc-100">
              <CalendarDaysIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs text-zinc-500 font-medium">Periodo Actual</span>
            </div>
            <p className="text-xs text-zinc-400 font-mono pl-2 border-l border-zinc-100">
              {horarios.length} {horarios.length === 1 ? 'clase' : 'clases'}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-0 pt-8 pb-6 max-w-1xl mx-auto">
        {horarios.length > 0 ? (
          <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
             <HorarioSemanalView horarios={horarios} />
          </div>
        ) : (
          <EmptyState 
            icon={ClockIcon}
            title="Sin horarios asignados"
            description="No se encontraron cursos con horarios programados para este periodo."
          />
        )}
      </div>
    </div>
  );
};
