import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { HorarioSemanalView } from '../../components/Horario/HorarioSemanalView';
import { Clock, Download, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Horario } from '../../types/horario';
import PageHeader from '../../components/Student/PageHeader';
import { exportToPDF } from '../../utils/pdfExport';

// Empty State Component
const EmptyState = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="py-16 text-center bg-white border border-zinc-200 rounded-xl">
    <Icon className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
    <p className="text-sm text-zinc-500 mb-1">{title}</p>
    <p className="text-xs text-zinc-400">{description}</p>
  </div>
);

// PDF Download Button Component
const DownloadPDFButton = ({
  onClick,
  isLoading,
  disabled
}: {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`
      inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
      transition-all duration-200 shadow-sm
      ${disabled || isLoading
        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
        : 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]'
      }
    `}
  >
    {isLoading ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        Generando PDF...
      </>
    ) : (
      <>
        <Download className="h-4 w-4" />
        Descargar PDF
      </>
    )}
  </button>
);

export const HorarioEstudiantePage = () => {
  const horarioRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data: horarios = [], isLoading } = useQuery<Horario[]>({
    queryKey: ['mi-horario-estudiante'],
    queryFn: estudiantesApi.getMiHorario,
    staleTime: 30000,
    refetchOnWindowFocus: true
  });

  // Función para exportar a PDF
  const handleDownloadPDF = async () => {
    if (!horarioRef.current || horarios.length === 0) {
      toast.error('No hay horarios disponibles para descargar');
      return;
    }

    setIsExporting(true);

    try {
      await exportToPDF(horarioRef.current, {
        filename: `mi-horario-${new Date().toISOString().split('T')[0]}.pdf`,
        title: 'Mi Horario Académico Semanal',
        subtitle: 'Sistema de Gestión Académica Universitaria',
        orientation: 'landscape',
        quality: 2,
        showHeader: true,
      });

      toast.success('¡Horario descargado correctamente!');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      toast.error('Error al generar el PDF. Por favor, intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  // Manejar error en caso de fallo en la carga
  if (!isLoading && !horarios) {
    console.error('Error al cargar horarios');
    toast.error('No se pudo cargar su horario académico.');
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Cargando horario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Horario"
        subtitle="Visualiza tu carga académica semanal"
        filterComponent={
          <DownloadPDFButton
            onClick={handleDownloadPDF}
            isLoading={isExporting}
            disabled={horarios.length === 0}
          />
        }
      />

      {/* Horario */}
      {horarios.length > 0 ? (
        <HorarioSemanalView ref={horarioRef} horarios={horarios} />
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
