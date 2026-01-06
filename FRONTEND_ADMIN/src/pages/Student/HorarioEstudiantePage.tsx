import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { HorarioSemanalView } from '../../components/Horario/HorarioSemanalView';
import { Calendar, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Horario } from '../../types/horario';
import PageHeader from '../../components/Student/PageHeader';

// Empty State Component
const EmptyState = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="py-16 text-center bg-white border border-zinc-200 rounded-xl">
    <Icon className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
    <p className="text-sm text-zinc-500 mb-1">{title}</p>
    <p className="text-xs text-zinc-400">{description}</p>
  </div>
);

export const HorarioEstudiantePage = () => {
  const { data: horarios = [], isLoading } = useQuery<Horario[]>({
    queryKey: ['mi-horario-estudiante'],
    queryFn: estudiantesApi.getMiHorario,
    staleTime: 30000,
    refetchOnWindowFocus: true
  });

  // Manejar error en caso de fallo en la carga
  if (!isLoading && !horarios) {
    console.error('Error al cargar horarios');
    toast.error('No se pudo cargar su horario académico.');
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-zinc-400 text-sm">Cargando horario...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Horario"
        subtitle="Visualiza tu carga académica semanal"
      />
      


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
