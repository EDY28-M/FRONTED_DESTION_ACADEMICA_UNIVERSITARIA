import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { estudiantesApi } from '../../services/estudiantesApi';
import { BookOpen, Check, GraduationCap, Clock, Plus } from 'lucide-react';

const MatriculaPage: React.FC = () => {
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

  const cursosMatriculados = misCursos?.filter(c => c.estado === 'Matriculado') || [];
  const creditosMatriculados = cursosMatriculados.reduce((sum, c) => sum + (c.creditos || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Cursos Matriculados</h2>
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
          
          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-200">
              <p className="text-xl font-semibold text-zinc-900 tabular-nums">{cursosMatriculados.length}</p>
              <p className="text-xs text-zinc-500">Cursos</p>
            </div>
            <div className="text-center px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-xl font-semibold text-emerald-700 tabular-nums">{creditosMatriculados}</p>
              <p className="text-xs text-emerald-600">Créditos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de cursos */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            
            <h3 className="text-sm font-medium text-zinc-900">Mis Cursos del Período Actual</h3>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">Cargando cursos...</p>
          </div>
        ) : cursosMatriculados.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Curso</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Créditos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Docente</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Fecha Matrícula</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {cursosMatriculados.map((curso) => (
                    <tr key={curso.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded">
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
                        <span className="text-xs text-zinc-500 font-mono">
                          {new Date(curso.fechaMatricula).toLocaleDateString('es-PE')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3 mr-1" />
                          Matriculado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-4 bg-zinc-50/50 border-t border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Total Cursos:</span>
                  <span className="font-mono tabular-nums text-zinc-700 font-medium">{cursosMatriculados.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Total Créditos:</span>
                  <span className="font-mono tabular-nums text-emerald-600 font-medium">{creditosMatriculados}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <BookOpen className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 mb-1">No tienes cursos matriculados</p>
            <p className="text-xs text-zinc-400 mb-4">Ve a "Aumento de Cursos" para matricularte</p>
            <Link 
              to="/estudiante/aumento-cursos"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Ir a Aumento de Cursos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatriculaPage;

