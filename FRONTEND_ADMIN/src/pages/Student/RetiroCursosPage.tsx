import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { estudiantesApi } from '../../services/estudiantesApi';
import { Minus, AlertTriangle, GraduationCap, Clock, BookX, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';

// Modal de confirmación con animación
const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  cursosCount: number;
}> = ({ isOpen, onClose, onConfirm, isLoading, isSuccess, cursosCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={!isLoading && !isSuccess ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {!isSuccess ? (
          <>
            {/* Icono de advertencia */}
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isLoading ? 'bg-amber-100 animate-pulse' : 'bg-red-100'}`}>
                {isLoading ? (
                  <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900 mb-2">
                {isLoading ? 'Procesando retiro...' : '¿Confirmar retiro?'}
              </h3>
              <p className="text-zinc-500 text-sm">
                {isLoading 
                  ? 'Por favor espera mientras procesamos tu solicitud'
                  : `Estás a punto de retirar ${cursosCount} curso${cursosCount > 1 ? 's' : ''}. Esta acción no se puede deshacer.`
                }
              </p>
            </div>

            {/* Botones */}
            {!isLoading && (
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-zinc-100 text-zinc-700 font-medium rounded-xl hover:bg-zinc-200 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Minus className="w-4 h-4" />
                  Retirar
                </button>
              </div>
            )}
          </>
        ) : (
          /* Estado de éxito con animación */
          <div className="text-center py-4">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center relative overflow-hidden">
                {/* Círculo animado */}
                <svg className="w-24 h-24 absolute" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="animate-[drawCircle_0.5s_ease-out_forwards]"
                    style={{
                      strokeDasharray: '283',
                      strokeDashoffset: '283',
                      animation: 'drawCircle 0.5s ease-out forwards'
                    }}
                  />
                </svg>
                {/* Check animado */}
                <Check 
                  className="w-12 h-12 text-emerald-600 relative z-10"
                  style={{
                    animation: 'popIn 0.3s ease-out 0.4s both'
                  }}
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2"
                style={{ animation: 'fadeInUp 0.3s ease-out 0.5s both' }}>
              ¡Retiro exitoso!
            </h3>
            <p className="text-zinc-500 text-sm mb-6"
               style={{ animation: 'fadeInUp 0.3s ease-out 0.6s both' }}>
              {cursosCount > 1 
                ? `Se han retirado ${cursosCount} cursos correctamente`
                : 'El curso ha sido retirado correctamente'
              }
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all duration-200"
              style={{ animation: 'fadeInUp 0.3s ease-out 0.7s both' }}
            >
              Continuar
            </button>
          </div>
        )}
      </div>

      {/* Estilos de animación */}
      <style>{`
        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes popIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const RetiroCursosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [cursosParaRetirar, setCursosParaRetirar] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: perfil } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

  const { data: periodoActivo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const { data: misCursos, isLoading } = useQuery({
    queryKey: ['mis-cursos', periodoActivo?.id],
    queryFn: () => estudiantesApi.getMisCursos(periodoActivo?.id),
    enabled: !!periodoActivo?.id,
  });

  const retirarMutation = useMutation({
    mutationFn: (idMatricula: number) => estudiantesApi.retirar(idMatricula),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['mis-cursos'] });
    },
  });

  const cursosMatriculados = misCursos?.filter(c => c.estado === 'Matriculado') || [];

  const handleToggleRetiro = (idMatricula: number) => {
    setCursosParaRetirar(prev => 
      prev.includes(idMatricula) ? prev.filter(id => id !== idMatricula) : [...prev, idMatricula]
    );
  };

  const handleOpenConfirmModal = () => {
    if (cursosParaRetirar.length === 0) {
      toast.error('Selecciona al menos un curso para retirar');
      return;
    }
    setShowConfirmModal(true);
    setIsSuccess(false);
    setIsProcessing(false);
  };

  const handleCloseModal = () => {
    if (isSuccess) {
      setCursosParaRetirar([]);
      navigate('/estudiante/matricula');
    }
    setShowConfirmModal(false);
    setIsSuccess(false);
    setIsProcessing(false);
  };

  const handleConfirmRetiro = async () => {
    setIsProcessing(true);

    let exitosos = 0;
    let fallidos = 0;

    for (const idMatricula of cursosParaRetirar) {
      try {
        await retirarMutation.mutateAsync(idMatricula);
        exitosos++;
        const curso = misCursos?.find(c => c.id === idMatricula);
        if (curso) {
          addNotification({
            type: 'academico',
            action: 'retiro',
            nombre: curso.nombreCurso,
            metadata: {
              idCurso: curso.idCurso,
              nombreCurso: curso.nombreCurso,
              periodo: periodoActivo?.nombre || 'Período actual'
            }
          });
        }
      } catch {
        fallidos++;
      }
    }

    setIsProcessing(false);

    if (exitosos > 0) {
      setIsSuccess(true);
    } else {
      setShowConfirmModal(false);
      toast.error('No se pudo retirar ningún curso');
    }

    if (fallidos > 0 && exitosos > 0) {
      toast.error(`${fallidos} curso(s) no pudieron ser retirados`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Retiro de Cursos</h2>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                
                <span>Ciclo</span>
                <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-700 rounded text-xs font-medium font-mono">{perfil?.cicloActual}</span>
              </span>
              <span className="text-zinc-300">•</span>
              <span className="flex items-center gap-1.5">
                <span>Créditos Acumulados</span>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium font-mono">{perfil?.creditosAcumulados}</span>
              </span>
            </div>
            {periodoActivo && (
              <p className="text-xs text-zinc-400 mt-2 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {periodoActivo.nombre}
              </p>
            )}
          </div>
          

        </div>
      </div>

      {/* Advertencia */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-800 mb-1">Importante sobre el retiro de cursos</h4>
            <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
              <li>El retiro de cursos es irreversible durante el período activo</li>
              <li>Un curso retirado aparecerá en tu historial con estado "Retirado"</li>
              <li>Los cursos retirados no afectan tu promedio, pero sí pueden afectar tu avance académico</li>
              <li>Consulta con tu asesor académico antes de realizar un retiro</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabla de cursos matriculados para retiro */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 bg-red-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-zinc-900">Cursos Disponibles para Retiro</h3>
          </div>
          {cursosParaRetirar.length > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
              {cursosParaRetirar.length} seleccionado(s) para retirar
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">Cargando cursos matriculados...</p>
          </div>
        ) : cursosMatriculados.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="w-10 px-4 py-3 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-zinc-300 text-red-600 focus:ring-red-500"
                        checked={cursosParaRetirar.length === cursosMatriculados.length && cursosMatriculados.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCursosParaRetirar(cursosMatriculados.map(c => c.id));
                          } else {
                            setCursosParaRetirar([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Curso</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Créditos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Docente</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {cursosMatriculados.map((curso) => {
                    const isSelected = cursosParaRetirar.includes(curso.id);
                    return (
                      <tr 
                        key={curso.id} 
                        className={`hover:bg-red-50/50 transition-colors cursor-pointer ${isSelected ? 'bg-red-50' : ''}`}
                        onClick={() => handleToggleRetiro(curso.id)}
                      >
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="rounded border-zinc-300 text-red-600 focus:ring-red-500"
                            checked={isSelected}
                            onChange={() => handleToggleRetiro(curso.id)}
                            disabled={retirarMutation.isPending}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                            {curso.codigoCurso}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-zinc-900">{curso.nombreCurso}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-mono tabular-nums text-zinc-700">{curso.creditos}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-600">{curso.nombreDocente || 'Por asignar'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                            {curso.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer con acciones */}
            <div className="px-5 py-4 bg-red-50/50 border-t border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Total matriculados:</span>
                  <span className="font-mono tabular-nums text-zinc-700">{cursosMatriculados.length}</span>
                </div>

              </div>
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleOpenConfirmModal}
                disabled={cursosParaRetirar.length === 0}
              >
                Retirar ({cursosParaRetirar.length})
              </button>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <BookX className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 mb-1">No tienes cursos matriculados</p>
            <p className="text-xs text-zinc-400">No hay cursos disponibles para retiro en este momento</p>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRetiro}
        isLoading={isProcessing}
        isSuccess={isSuccess}
        cursosCount={cursosParaRetirar.length}
      />
    </div>
  );
};

export default RetiroCursosPage;
