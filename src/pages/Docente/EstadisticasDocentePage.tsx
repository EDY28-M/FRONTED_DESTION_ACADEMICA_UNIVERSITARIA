import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { docenteCursosApi } from '../../services/docenteApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';

export const EstadisticasDocentePage: React.FC = () => {
  const { data: cursos, isLoading } = useQuery({
    queryKey: ['mis-cursos'],
    queryFn: () => docenteCursosApi.getMisCursos(),
  });

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="text-zinc-500">Cargando estadísticas...</div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Estadísticas
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Visualiza estadísticas de tus cursos y estudiantes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Cursos</p>
              <p className="text-2xl font-semibold text-zinc-900 mt-1">
                {cursos?.length || 0}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-zinc-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Estudiantes</p>
              <p className="text-2xl font-semibold text-zinc-900 mt-1">
                {cursos?.reduce((acc, curso) => acc + (curso.estudiantesMatriculados || 0), 0) || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-zinc-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Promedio General</p>
              <p className="text-2xl font-semibold text-zinc-900 mt-1">
                --
              </p>
            </div>
            <Award className="h-8 w-8 text-zinc-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Tendencia</p>
              <p className="text-2xl font-semibold text-zinc-900 mt-1">
                --
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-zinc-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Distribución de Estudiantes por Curso
        </h2>
        {cursos && cursos.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cursos.map(curso => ({
              nombre: curso.nombreCurso,
              estudiantes: curso.estudiantesMatriculados || 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="estudiantes" fill="#3b82f6">
                {cursos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            No hay datos disponibles
          </div>
        )}
      </div>
    </div>
  );
};
