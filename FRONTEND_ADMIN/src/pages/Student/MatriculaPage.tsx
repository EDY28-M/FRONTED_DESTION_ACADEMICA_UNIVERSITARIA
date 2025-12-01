import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { BookOpen, AlertCircle, Check, GraduationCap, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';

// Stat Card Component
const StatCard = ({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) => (
  <div className={`px-3 py-1.5 rounded-lg ${accent ? 'bg-zinc-900 text-white' : 'bg-zinc-100'}`}>
    <span className={`text-[11px] ${accent ? 'text-zinc-400' : 'text-zinc-500'}`}>{label}</span>
    <span className={`ml-1.5 text-sm font-semibold tabular-nums ${accent ? 'text-white' : 'text-zinc-900'}`}>{value}</span>
  </div>
);

// Course Row Component
const CursoRow = ({
  curso,
  isSelected,
  isMatriculado,
  onToggle,
  disabled
}: {
  curso: any;
  isSelected: boolean;
  isMatriculado: boolean;
  onToggle: () => void;
  disabled: boolean;
}) => (
  <tr className={`border-b border-zinc-100 last:border-0 transition-colors ${isMatriculado ? 'bg-amber-50/40' : 'hover:bg-zinc-50/50'}`}>
    <td className="py-3 pl-4 pr-2">
      <button
        onClick={onToggle}
        disabled={disabled || isMatriculado}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
          isSelected || isMatriculado
            ? 'bg-zinc-900 border-zinc-900'
            : 'border-zinc-300 hover:border-zinc-400'
        } ${disabled || isMatriculado ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {(isSelected || isMatriculado) && <Check className="w-3 h-3 text-white" />}
      </button>
    </td>
    <td className="py-3 px-3">
      <span className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded ${
        isMatriculado ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600'
      }`}>
        {curso.codigo}
      </span>
    </td>
    <td className="py-3 px-3">
      <p className="text-[13px] font-medium text-zinc-900">{curso.nombreCurso}</p>
      <p className="text-[11px] text-zinc-400">Obligatorio</p>
    </td>
    <td className="py-3 px-3 text-center">
      <span className="text-[13px] font-mono font-medium text-zinc-700">{curso.creditos}</span>
    </td>
    <td className="py-3 px-3">
      <div className="flex items-center gap-1.5">
        <User className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-[13px] text-zinc-600">{curso.nombreDocente || '—'}</span>
      </div>
    </td>
    <td className="py-3 px-3 text-center">
      <span className="text-[13px] font-mono text-zinc-600">
        {curso.estudiantesMatriculados || 0}/{curso.capacidadMaxima || 30}
      </span>
    </td>
    <td className="py-3 px-3 text-center">
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ring-1 ${
        isMatriculado 
          ? 'bg-amber-50 text-amber-700 ring-amber-200' 
          : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      }`}>
        {isMatriculado ? 'Matriculado' : 'Disponible'}
      </span>
    </td>
  </tr>
);

const MatriculaPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | undefined>(undefined);
  const [cursosSeleccionados, setCursosSeleccionados] = useState<number[]>([]);

  const { data: perfil } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

  const { data: periodos } = useQuery({
    queryKey: ['periodos'],
    queryFn: estudiantesApi.getPeriodos,
  });

  const { data: periodoActivo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const { data: cursosDisponibles, isLoading } = useQuery({
    queryKey: ['cursos-disponibles', periodoSeleccionado],
    queryFn: () => estudiantesApi.getCursosDisponibles(periodoSeleccionado),
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

    const idPeriodo = periodoSeleccionado || periodoActivo?.id;
    if (!idPeriodo) {
      toast.error('No hay período activo');
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
    }
    if (fallidos > 0) {
      toast.error(`${fallidos} curso(s) no pudieron ser matriculados`);
    }
  };

  const cursosDisponiblesList = cursosDisponibles?.filter(c => c.disponible && !c.yaMatriculado) || [];
  const cursosMatriculadosList = cursosDisponibles?.filter(c => c.yaMatriculado) || [];
  const cursosNoDisponiblesList = cursosDisponibles?.filter(c => !c.disponible && !c.yaMatriculado) || [];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="h-14 px-6 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-zinc-900">Matrícula de Cursos</h1>
              <p className="text-[11px] text-zinc-500">
                {periodoActivo?.nombre || 'Sin período activo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatCard label="Ciclo" value={perfil?.cicloActual || '—'} />
            <StatCard label="Créditos" value={perfil?.creditosAcumulados || 0} accent />
            
            <div className="h-6 w-px bg-zinc-200" />
            
            <select
              value={periodoSeleccionado || ''}
              onChange={(e) => setPeriodoSeleccionado(e.target.value ? Number(e.target.value) : undefined)}
              className="text-[13px] px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">Período Activo</option>
              {periodos?.map((periodo) => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre} {periodo.activo && '(Activo)'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        {/* Cursos Disponibles */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-medium text-zinc-900">Cursos Disponibles</h2>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-500">Disponible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-zinc-500">Matriculado</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 text-center">
              <div className="inline-block w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
              <p className="mt-3 text-sm text-zinc-500">Cargando cursos...</p>
            </div>
          ) : cursosDisponiblesList.length > 0 || cursosMatriculadosList.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/50">
                      <th className="py-2.5 pl-4 pr-2 w-10" />
                      <th className="py-2.5 px-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Código</th>
                      <th className="py-2.5 px-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Curso</th>
                      <th className="py-2.5 px-3 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Créditos</th>
                      <th className="py-2.5 px-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Docente</th>
                      <th className="py-2.5 px-3 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Vacantes</th>
                      <th className="py-2.5 px-3 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursosDisponiblesList.map((curso) => (
                      <CursoRow
                        key={curso.id}
                        curso={curso}
                        isSelected={cursosSeleccionados.includes(curso.id)}
                        isMatriculado={false}
                        onToggle={() => handleToggleCurso(curso.id)}
                        disabled={matricularMutation.isPending}
                      />
                    ))}
                    {cursosMatriculadosList.map((curso) => (
                      <CursoRow
                        key={curso.id}
                        curso={curso}
                        isSelected={false}
                        isMatriculado={true}
                        onToggle={() => {}}
                        disabled={true}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[13px]">
                  <span className="text-zinc-500">
                    Disponibles: <span className="font-medium text-zinc-700">{cursosDisponiblesList.length}</span>
                  </span>
                  <span className="text-zinc-500">
                    Matriculados: <span className="font-medium text-amber-600">{cursosMatriculadosList.length}</span>
                  </span>
                  {cursosSeleccionados.length > 0 && (
                    <span className="text-zinc-500">
                      Seleccionados: <span className="font-semibold text-zinc-900">{cursosSeleccionados.length}</span>
                    </span>
                  )}
                </div>
                
                <button
                  onClick={handleMatricularSeleccionados}
                  disabled={cursosSeleccionados.length === 0 || matricularMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Matricular ({cursosSeleccionados.length})
                </button>
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <Clock className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No hay cursos disponibles para matricular</p>
              <p className="text-[11px] text-zinc-400 mt-1">Selecciona otro período o espera la apertura de matrícula</p>
            </div>
          )}
        </div>

        {/* Cursos No Disponibles */}
        {cursosNoDisponiblesList.length > 0 && (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 bg-orange-50/50 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-medium text-zinc-900">Cursos No Disponibles</h2>
            </div>
            <div className="p-4 space-y-2">
              {cursosNoDisponiblesList.map((curso) => (
                <div key={curso.id} className="flex items-center justify-between p-3 bg-orange-50/30 border border-orange-100 rounded-lg">
                  <div>
                    <p className="text-[13px] font-medium text-zinc-900">{curso.nombreCurso}</p>
                    <p className="text-[11px] text-zinc-500">{curso.nombreDocente} · {curso.creditos} créditos</p>
                  </div>
                  {curso.motivoNoDisponible && (
                    <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded text-[11px] font-medium">
                      {curso.motivoNoDisponible}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatriculaPage;

