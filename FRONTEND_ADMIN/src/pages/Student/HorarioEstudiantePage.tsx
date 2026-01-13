import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { HorarioSemanalView } from '../../components/Horario/HorarioSemanalView';
import { Clock, Download, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Horario } from '../../types/horario';
import { Periodo } from '../../types/estudiante';
import PageHeader from '../../components/Student/PageHeader';
import { exportToPDF } from '../../utils/pdfExport';
import { useAuth } from '../../contexts/AuthContext';

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
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth(); // Obtener info del estudiante logueado

  const { data: horarios = [], isLoading } = useQuery<Horario[]>({
    queryKey: ['mi-horario-estudiante'],
    queryFn: estudiantesApi.getMiHorario,
    staleTime: 0,                 // Sin cache - siempre datos frescos
    refetchOnMount: 'always',      // Recargar siempre al entrar
    refetchOnWindowFocus: true     // Recargar al volver a la pestaña
  });

  // Obtener periodo activo para el título del PDF
  const { data: periodoActivo } = useQuery<Periodo>({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
    staleTime: 300000, // 5 minutos
  });

  // Función para exportar a PDF
  const handleDownloadPDF = async () => {
    // Usamos pdfRef en lugar de horarioRef para capturar siempre la versión de escritorio
    const elementToExport = pdfRef.current || horarioRef.current;

    if (!elementToExport || horarios.length === 0) {
      toast.error('No hay horarios disponibles para descargar');
      return;
    }

    setIsExporting(true);

    try {
      await exportToPDF(elementToExport, {
        filename: `horario-${user?.nombreCompleto?.replace(/\s+/g, '-') || 'estudiante'}-${new Date().toISOString().split('T')[0]}.pdf`,

        // Usar periodo dinámico o fallback
        title: `HORARIO DE CLASES SEMESTRE ${periodoActivo?.nombre || '2025-II'}`,

        subtitle: 'Sistema de Gestión Académica Universitaria',
        orientation: 'landscape',
        quality: 3,
        showHeader: true,
        headerInfo: {
          studentName: user?.nombreCompleto || 'Estudiante',
          faculty: 'INGENIERÍA Y ARQUITECTURA',
          school: 'INGENIERÍA EN INFORMÁTICA Y SISTEMAS',
          studentCode: user?.id?.toString() || '0020190328' // Fallback a un código de ejemplo si no hay ID
        }
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

      {/* Horario Visible (Responsive: lista en móvil, columnas en desktop) */}
      {horarios.length > 0 ? (
        <HorarioSemanalView ref={horarioRef} horarios={horarios} />
      ) : (
        <EmptyState
          icon={Clock}
          title="Sin horarios asignados"
          description="No se encontraron cursos con horarios programados para este periodo."
        />
      )}

      {/* 
        Container Oculto para Exportación PDF 
        Forzamos forceDesktop={true} para que siempre genere la grilla bonita 
        incluso si el usuario está en móvil.
      */}
      <div className="fixed left-[-9999px] top-0 w-[1400px] opacity-0 pointer-events-none">
        <HorarioSemanalView
          ref={pdfRef}
          horarios={horarios}
          forceDesktop={true}
        />
      </div>
    </div>
  );
};
