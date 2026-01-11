import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { estudiantesApi } from '../../services/estudiantesApi';
import { Plus, AlertCircle, Check, GraduationCap, Clock, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';

const AumentoCursosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [cursosSeleccionados, setCursosSeleccionados] = useState<number[]>([]);

  const { data: perfil } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

  const { data: periodoActivo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const { data: cursosDisponibles, isLoading } = useQuery({
    queryKey: ['cursos-disponibles'],
    queryFn: () => estudiantesApi.getCursosDisponibles(),
  });

  // Verificar si el estudiante ha pagado la matrícula
  const { data: matriculaPagada, isLoading: isLoadingPago } = useQuery({
    queryKey: ['matricula-pagada', periodoActivo?.id],
    queryFn: () => estudiantesApi.verificarMatriculaPagada(periodoActivo!.id),
    enabled: !!periodoActivo?.id,
  });

  const matricularMutation = useMutation({
    mutationFn: estudiantesApi.matricular,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['mis-cursos'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al matricular');
    },
  });

  const cursosParaMatricular = cursosDisponibles?.filter(c => c.disponible && !c.yaMatriculado) || [];
  const cursosNoDisponibles = cursosDisponibles?.filter(c => !c.disponible && !c.yaMatriculado) || [];

  const handleToggleCurso = (idCurso: number) => {
    setCursosSeleccionados(prev => 
      prev.includes(idCurso) ? prev.filter(id => id !== idCurso) : [...prev, idCurso]
    );
  };

  const handleMatricularSeleccionados = async () => {
    if (cursosSeleccionados.length === 0) {
      toast.error('Selecciona al menos un curso para matricular');
      return;
    }

    const idPeriodo = periodoActivo?.id;
    if (!idPeriodo) {
      toast.error('No hay período activo');
      return;
    }

    // Validar que el estudiante haya pagado la matrícula
    if (!matriculaPagada) {
      toast.error('Debes pagar la matrícula antes de poder matricular cursos');
      navigate('/estudiante/pago-matricula-inicial');
      return;
    }

    let exitosos = 0;
    let fallidos = 0;

    for (const idCurso of cursosSeleccionados) {
      try {
        await matricularMutation.mutateAsync({ idCurso, idPeriodo });
        exitosos++;
        const curso = cursosDisponibles?.find(c => c.id === idCurso);
        if (curso) {
          addNotification({
            type: 'academico',
            action: 'matricula',
            nombre: curso.nombreCurso,
            metadata: {
              idCurso: curso.id,
              nombreCurso: curso.nombreCurso,
              periodo: periodoActivo?.nombre || 'Período actual'
            }
          });
        }
      } catch {
        fallidos++;
      }
    }

    if (exitosos > 0) {
      toast.success(`${exitosos} curso(s) matriculado(s) exitosamente`);
      setCursosSeleccionados([]);
      // Redirigir a la página de matrícula
      navigate('/estudiante/matricula');
    }
    if (fallidos > 0) {
      toast.error(`${fallidos} curso(s) no pudieron ser matriculados`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Aumento de Cursos</h2>
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

      {/* Tabla de cursos disponibles */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 bg-emerald-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            
            <h3 className="text-sm font-medium text-zinc-900">Cursos Disponibles para Matrícula</h3>
          </div>
          {cursosSeleccionados.length > 0 && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              {cursosSeleccionados.length} seleccionado(s)
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">Cargando cursos disponibles...</p>
          </div>
        ) : cursosParaMatricular.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="w-10 px-4 py-3 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-zinc-300 text-emerald-600"
                        checked={cursosSeleccionados.length === cursosParaMatricular.length && cursosParaMatricular.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCursosSeleccionados(cursosParaMatricular.map(c => c.id));
                          } else {
                            setCursosSeleccionados([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Curso</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Ciclo</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Créditos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Docente</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Vacantes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {cursosParaMatricular.map((curso) => {
                    const vacantes = (curso.capacidadMaxima || 30) - curso.estudiantesMatriculados;
                    const isSelected = cursosSeleccionados.includes(curso.id);
                    return (
                      <tr 
                        key={curso.id} 
                        className={`hover:bg-emerald-50/50 transition-colors cursor-pointer ${isSelected ? 'bg-emerald-50' : ''}`}
                        onClick={() => handleToggleCurso(curso.id)}
                      >
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                            checked={isSelected}
                            onChange={() => handleToggleCurso(curso.id)}
                            disabled={matricularMutation.isPending}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            {curso.codigo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-zinc-900">{curso.nombreCurso}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                            Ciclo {curso.ciclo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-mono tabular-nums text-zinc-700">{curso.creditos}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-600">{curso.nombreDocente || 'Por asignar'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-mono tabular-nums ${vacantes > 5 ? 'text-emerald-600' : vacantes > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                            {vacantes}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer con acciones */}
            <div className="px-5 py-4 bg-emerald-50/50 border-t border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Disponibles:</span>
                  <span className="font-mono tabular-nums text-zinc-700">{cursosParaMatricular.length}</span>
                </div>

              </div>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleMatricularSeleccionados}
                disabled={cursosSeleccionados.length === 0 || matricularMutation.isPending || !matriculaPagada}
              >
               
                {matricularMutation.isPending ? 'Matriculando...' : `Matricular (${cursosSeleccionados.length})`}
              </button>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <Check className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 mb-1">No hay cursos disponibles para aumento</p>
            <p className="text-xs text-zinc-400">Ya estás matriculado en todos los cursos disponibles para tu ciclo</p>
          </div>
        )}
      </div>

      {/* Cursos No Disponibles */}
      {cursosNoDisponibles.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-amber-50/50 border-b border-zinc-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Cursos No Disponibles ({cursosNoDisponibles.length})</span>
          </div>
          <div className="p-4 space-y-2">
            {cursosNoDisponibles.map((curso) => (
              <div key={curso.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-700">{curso.nombreCurso}</p>
                  <p className="text-xs text-zinc-500">{curso.nombreDocente} • {curso.creditos} créditos • Ciclo {curso.ciclo}</p>
                </div>
                {curso.motivoNoDisponible && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">
                    {curso.motivoNoDisponible}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AumentoCursosPage;
