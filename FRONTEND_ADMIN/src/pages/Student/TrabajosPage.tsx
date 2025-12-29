import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { trabajosEstudianteApi, TrabajoSimple } from '../../services/trabajosApi';
import { 
  BookOpen, 
  Clock, 
  FileText, 
  Upload, 
  CheckCircle2, 
  XCircle,
  ArrowLeft,
  ExternalLink,
  Download,
  Layers,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
// Función helper para formatear fechas
const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const TrabajosPage: React.FC = () => {
  const { idCurso } = useParams<{ idCurso: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: trabajos, isLoading } = useQuery({
    queryKey: ['trabajos-curso', idCurso],
    queryFn: () => trabajosEstudianteApi.getTrabajosPorCurso(Number(idCurso)),
    enabled: !!idCurso,
  });

  const getEstadoTrabajo = (trabajo: TrabajoSimple) => {
    const fechaLimite = new Date(trabajo.fechaLimite);
    const ahora = new Date();
    const vencido = ahora > fechaLimite;

    if (trabajo.yaEntregado) {
      return { texto: 'Entregado', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
    }
    if (vencido) {
      return { texto: 'Vencido', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle };
    }
    return { texto: 'Pendiente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock };
  };

  const handleVerTrabajo = (idTrabajo: number) => {
    navigate(`/estudiante/trabajos/${idTrabajo}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-1/3"></div>
          <div className="h-64 bg-zinc-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/estudiante/mis-cursos')}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Trabajos Encargados</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Revisa y entrega los trabajos asignados para este curso
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Trabajos */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        {trabajos && trabajos.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {trabajos.map((trabajo) => {
              const estado = getEstadoTrabajo(trabajo);
              const EstadoIcon = estado.icon;
              const fechaLimite = new Date(trabajo.fechaLimite);
              const diasRestantes = Math.ceil((fechaLimite.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={trabajo.id}
                  className="p-6 hover:bg-zinc-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-zinc-900">{trabajo.titulo}</h3>
                        {trabajo.totalTrabajos && trabajo.totalTrabajos > 1 && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <Layers className="w-3.5 h-3.5" />
                            Trabajo {trabajo.numeroTrabajo}/{trabajo.totalTrabajos}
                            {trabajo.pesoIndividual && (
                              <span className="text-blue-600 font-normal">
                                {' '}({trabajo.pesoIndividual.toFixed(1)}%)
                              </span>
                            )}
                          </span>
                        )}
                        {trabajo.nombreTipoEvaluacion && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Award className="w-3.5 h-3.5" />
                            {trabajo.nombreTipoEvaluacion}
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${estado.color}`}>
                          <EstadoIcon className="w-3.5 h-3.5" />
                          {estado.texto}
                        </span>
                        {trabajo.yaEntregado && trabajo.calificacion !== null && trabajo.calificacion !== undefined && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <Award className="w-3.5 h-3.5" />
                            Calificado: {trabajo.calificacion.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-zinc-600 mt-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>
                            Límite: {formatDate(fechaLimite)}
                          </span>
                        </div>
                        {!trabajo.yaEntregado && diasRestantes > 0 && (
                          <span className="text-amber-600 font-medium">
                            {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'} restantes
                          </span>
                        )}
                        {trabajo.totalTrabajos && trabajo.totalTrabajos > 1 && (
                          <span className="text-xs text-zinc-500">
                            Serie de {trabajo.totalTrabajos} trabajos - La nota final se calculará cuando todos estén calificados
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-6">
                      <button
                        onClick={() => handleVerTrabajo(trabajo.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        {trabajo.yaEntregado ? (
                          <>
                            <FileText className="w-4 h-4" />
                            Ver Entrega
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {fechaLimite < new Date() ? 'Ver Detalles' : 'Entregar'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-sm font-medium text-zinc-900">No hay trabajos asignados</h3>
            <p className="text-zinc-500 text-sm mt-1">
              Aún no se han publicado trabajos para este curso.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrabajosPage;

