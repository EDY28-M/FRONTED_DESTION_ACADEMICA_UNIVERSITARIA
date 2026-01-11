import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { estudiantesApi } from '../../services/estudiantesApi';
import { BookOpen, AlertTriangle, Filter, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';
import PageHeader from '../../components/Student/PageHeader';

const MisCursosPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | undefined>(undefined);
  const [cursosSeleccionados, setCursosSeleccionados] = useState<number[]>([]);

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
    setCursosSeleccionados(prev => {
      if (prev.includes(idMatricula)) {
        return prev.filter(id => id !== idMatricula);
      } else {
        return [...prev, idMatricula];
      }
    });
  };

  const handleRetirarSeleccionados = async () => {
    if (cursosSeleccionados.length === 0) {
      toast.error('Selecciona al menos un curso para retirar');
      return;
    }

    if (!window.confirm(`¿Estás seguro de retirar ${cursosSeleccionados.length} curso(s)? Esta acción no se puede deshacer.`)) {
      return;
    }

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
      } catch (error) {
        fallidos++;
      }
    }

    if (exitosos > 0) {
      toast.success(`Te has retirado de ${exitosos} curso(s) exitosamente`);
      setCursosSeleccionados([]);
    }
    if (fallidos > 0) {
      toast.error(`${fallidos} curso(s) no pudieron ser retirados`);
    }
  };

  const cursosMatriculados = misCursos?.filter(c => c.estado === 'Matriculado') || [];
  const cursosRetirados = misCursos?.filter(c => c.estado === 'Retirado') || [];

  const periodoMostrar = periodoSeleccionado
    ? periodos?.find(p => p.id === periodoSeleccionado)
    : periodoActivo;

  const filterComponent = (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <select
          value={periodoSeleccionado || ''}
          onChange={(e) => setPeriodoSeleccionado(e.target.value ? Number(e.target.value) : undefined)}
          className="pl-9 pr-8 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-shadow appearance-none cursor-pointer"
        >
          <option value="">Período Activo</option>
          {periodos?.map((periodo) => (
            <option key={periodo.id} value={periodo.id}>
              {periodo.nombre} {periodo.activo && '(Activo)'}
            </option>
          ))}
        </select>
      </div>

      {cursosSeleccionados.length > 0 && (
        <button
          onClick={handleRetirarSeleccionados}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Retirar ({cursosSeleccionados.length})
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Cursos"
        subtitle="Gestiona tus matrículas y revisa tu historial académico"
        periodoMostrar={periodoMostrar}
        filterComponent={filterComponent}
      />

      {/* Main Table Card */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">Cargando cursos...</p>
          </div>
        ) : cursosMatriculados.length > 0 || cursosRetirados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="w-12 px-6 py-3 text-center">
                    <div className="w-4 h-4 border border-zinc-300 rounded bg-zinc-50" />
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Curso</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Créditos</th>
                  <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Docente</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {[...cursosMatriculados, ...cursosRetirados].map((curso) => (
                  <tr key={curso.id} className={`group transition-colors ${curso.estado === 'Retirado' ? 'bg-zinc-50/50 opacity-60' : 'hover:bg-zinc-50/50'}`}>
                    <td className="px-6 py-3 text-center">
                      {curso.estado === 'Matriculado' && (
                        <input
                          type="checkbox"
                          checked={cursosSeleccionados.includes(curso.id)}
                          onChange={() => handleToggleCurso(curso.id)}
                          className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono text-zinc-500">{curso.codigoCurso}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm font-medium text-zinc-900">{curso.nombreCurso}</span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="text-sm text-zinc-600 font-mono">{curso.creditos}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-zinc-600">{curso.nombreDocente || 'Por asignar'}</span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${curso.estado === 'Matriculado'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {curso.estado}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-xs text-zinc-500 tabular-nums">
                        {new Date(curso.fechaMatricula).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {curso.estado === 'Matriculado' && (
                        <button
                          onClick={() => navigate(`/estudiante/trabajos/curso/${curso.idCurso}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Trabajos
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-sm font-medium text-zinc-900">No hay cursos registrados</h3>
            <p className="text-zinc-500 text-sm mt-1">No se encontraron matrículas para este período.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisCursosPage;

