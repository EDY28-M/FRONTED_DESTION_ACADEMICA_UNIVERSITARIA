import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { BookOpen, AlertTriangle, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';

// ============================================
// Types & Utilities
// ============================================

const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case 'Matriculado':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
    case 'Retirado':
      return 'bg-red-50 text-red-600 ring-1 ring-red-600/20';
    case 'Aprobado':
      return 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20';
    case 'Desaprobado':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
    default:
      return 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-600/10';
  }
};

// ============================================
// Main Component
// ============================================

const MisCursosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | undefined>(undefined);
  const [cursosSeleccionados, setCursosSeleccionados] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { data: periodos } = useQuery({
    queryKey: ['periodos'],
    queryFn: estudiantesApi.getPeriodos,
  });

  const { data: periodoActivo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const periodoAConsultar = periodoSeleccionado || periodoActivo?.id;

  const { data: misCursos, isLoading } = useQuery({
    queryKey: ['mis-cursos', periodoAConsultar],
    queryFn: () => estudiantesApi.getMisCursos(periodoAConsultar),
    enabled: !!periodoAConsultar,
  });

  const retirarMutation = useMutation({
    mutationFn: estudiantesApi.retirar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-cursos'] });
      queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al retirarse del curso');
    },
  });

  const handleToggleCurso = (idMatricula: number) => {
    setCursosSeleccionados(prev => 
      prev.includes(idMatricula) 
        ? prev.filter(id => id !== idMatricula) 
        : [...prev, idMatricula]
    );
  };

  const handleRetirarSeleccionados = async () => {
    if (cursosSeleccionados.length === 0) return;
    
    setShowConfirmModal(false);
    let exitosos = 0;
    let fallidos = 0;

    for (const idMatricula of cursosSeleccionados) {
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
              periodo: curso.nombrePeriodo
            }
          });
        }
      } catch {
        fallidos++;
      }
    }

    if (exitosos > 0) {
      toast.success(`Te has retirado de ${exitosos} curso(s)`);
      setCursosSeleccionados([]);
    }
    if (fallidos > 0) {
      toast.error(`${fallidos} curso(s) no pudieron ser retirados`);
    }
  };

  const cursosMatriculados = misCursos?.filter(c => c.estado === 'Matriculado') || [];
  const cursosRetirados = misCursos?.filter(c => c.estado === 'Retirado') || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ==================== Confirm Modal ==================== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-zinc-900">Confirmar Retiro</h3>
                <p className="text-[13px] text-zinc-500 mt-0.5">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <p className="text-[13px] text-zinc-600 mb-6">
              ¿Estás seguro de retirarte de <span className="font-semibold">{cursosSeleccionados.length}</span> curso(s)?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 text-[13px] font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRetirarSeleccionados}
                className="flex-1 px-4 py-2.5 text-[13px] font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar Retiro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Header ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Mis Cursos</h1>
          {periodoActivo && !periodoSeleccionado && (
            <p className="text-[13px] text-zinc-500 mt-0.5">
              {periodoActivo.nombre} · {new Date(periodoActivo.fechaInicio).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} - {new Date(periodoActivo.fechaFin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
          {!periodoActivo && !periodoSeleccionado && (
            <p className="text-[13px] text-amber-600 flex items-center gap-1.5 mt-0.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              No hay período académico activo
            </p>
          )}
        </div>
        <select
          value={periodoSeleccionado || ''}
          onChange={(e) => setPeriodoSeleccionado(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg text-zinc-700 
            focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-colors"
        >
          <option value="">Período Activo</option>
          {periodos?.map((periodo) => (
            <option key={periodo.id} value={periodo.id}>
              {periodo.nombre} {periodo.activo && '(Activo)'}
            </option>
          ))}
        </select>
      </div>

      {/* ==================== Courses Table ==================== */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <h2 className="text-[14px] font-semibold text-zinc-900">Cursos Activos</h2>
            {cursosMatriculados.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600">
                {cursosMatriculados.length}
              </span>
            )}
          </div>
          {cursosSeleccionados.length > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={retirarMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-white bg-red-600 rounded-lg 
                hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              Retirar ({cursosSeleccionados.length})
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Table Content */}
        {!isLoading && cursosMatriculados.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="w-12 px-5 py-3">
                      <span className="sr-only">Seleccionar</span>
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Código</th>
                    <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Curso</th>
                    <th className="px-5 py-3 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Créd.</th>
                    <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Docente</th>
                    <th className="px-5 py-3 text-center text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Estado</th>
                    <th className="px-5 py-3 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Promedio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {cursosMatriculados.map((curso) => (
                    <tr 
                      key={curso.id} 
                      className={`hover:bg-zinc-50/50 transition-colors ${cursosSeleccionados.includes(curso.id) ? 'bg-red-50/30' : ''}`}
                    >
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggleCurso(curso.id)}
                          disabled={retirarMutation.isPending}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            cursosSeleccionados.includes(curso.id)
                              ? 'bg-red-600 border-red-600 text-white'
                              : 'border-zinc-300 hover:border-zinc-400'
                          }`}
                        >
                          {cursosSeleccionados.includes(curso.id) && <Check className="w-3 h-3" />}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[11px] font-mono font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                          {curso.codigoCurso}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[13px] font-medium text-zinc-900">{curso.nombreCurso}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-[13px] font-mono font-medium text-zinc-700">{curso.creditos}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[13px] text-zinc-600">{curso.nombreDocente}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${getEstadoBadge(curso.estado)}`}>
                          {curso.estado === 'Matriculado' ? 'Activo' : curso.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {curso.promedioFinal !== null && curso.promedioFinal !== undefined ? (
                          <span className={`text-[14px] font-semibold font-mono ${
                            curso.promedioFinal >= 11 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {curso.promedioFinal.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-[12px] text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-50/50 border-t border-zinc-100">
              <p className="text-[12px] text-zinc-500">
                Total: <span className="font-semibold text-zinc-700">{cursosMatriculados.length}</span> cursos · 
                <span className="font-semibold text-zinc-700 ml-1">{cursosMatriculados.reduce((sum, c) => sum + c.creditos, 0)}</span> créditos
              </p>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && cursosMatriculados.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-5 h-5 text-zinc-400" />
            </div>
            <h3 className="text-[14px] font-semibold text-zinc-900 mb-1">Sin cursos activos</h3>
            <p className="text-[13px] text-zinc-500 max-w-sm mx-auto">
              {!periodoAConsultar 
                ? 'No hay período académico activo. Selecciona uno del menú.'
                : 'No tienes cursos matriculados en este período.'}
            </p>
          </div>
        )}
      </div>

      {/* ==================== Withdrawn Courses ==================== */}
      {cursosRetirados.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 bg-red-50/30">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="text-[14px] font-semibold text-zinc-900">Cursos Retirados</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-700">
              {cursosRetirados.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Código</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Curso</th>
                  <th className="px-5 py-3 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Créd.</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Docente</th>
                  <th className="px-5 py-3 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wider">F. Retiro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {cursosRetirados.map((curso) => (
                  <tr key={curso.id} className="bg-red-50/20">
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-mono font-medium text-red-600/80 bg-red-100 px-1.5 py-0.5 rounded">
                        {curso.codigoCurso}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] text-zinc-600 line-through">{curso.nombreCurso}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[13px] font-mono text-zinc-500">{curso.creditos}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] text-zinc-500">{curso.nombreDocente}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[12px] font-mono text-zinc-500">
                        {curso.fechaRetiro && new Date(curso.fechaRetiro).toLocaleDateString('es-PE', { 
                          day: '2-digit', month: '2-digit', year: 'numeric' 
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisCursosPage;

