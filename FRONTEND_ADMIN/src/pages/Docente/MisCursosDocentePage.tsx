import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { docenteCursosApi, CursoDocente } from '../../services/docenteApi';
import { toast } from 'react-hot-toast';
import {
  BookOpenIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

// Badge para estados
const StatusBadge = ({ 
  value, 
  type 
}: { 
  value: number; 
  type: 'grade' | 'attendance' 
}) => {
  let bgClass = 'bg-zinc-100 text-zinc-600';
  
  if (type === 'grade') {
    if (value >= 14) bgClass = 'bg-green-50 text-green-700';
    else if (value < 11) bgClass = 'bg-red-50 text-red-700';
  } else if (type === 'attendance') {
    if (value >= 80) bgClass = 'bg-green-50 text-green-700';
    else if (value < 60) bgClass = 'bg-red-50 text-red-700';
  }
  
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium tabular-nums ${bgClass}`}>
      {value.toFixed(type === 'grade' ? 2 : 1)}{type === 'attendance' ? '%' : ''}
    </span>
  );
};

// Empty State
const EmptyState = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="py-16 text-center">
    <Icon className="h-8 w-8 text-zinc-300 mx-auto mb-3 stroke-[1.5]" />
    <p className="text-sm text-zinc-500 mb-1">{title}</p>
    <p className="text-xs text-zinc-400">{description}</p>
  </div>
);

export const MisCursosDocentePage = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<CursoDocente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      setIsLoading(true);
      const data = await docenteCursosApi.getMisCursos();
      setCursos(data);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setIsLoading(false);
    }
  };

  const totalEstudiantes = cursos.reduce((sum, c) => sum + c.totalEstudiantes, 0);

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
  //       <div className="animate-pulse text-zinc-400 text-sm">Cargando...</div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="h-14 px-6 max-w-1xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-sm font-medium text-zinc-900">Mis Cursos</h1>
            <p className="text-xs text-zinc-500">Gestiona tus cursos asignados</p>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'}
          </p>
        </div>
      </header>

      <div className="px-0 pt-8 pb-6 max-w-1xl mx-auto">
        {/* ========== DATA TABLE ========== */}
        <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden">
          {cursos.length === 0 ? (
            <EmptyState 
              icon={BookOpenIcon}
              title="Sin cursos asignados"
              description="Contacta al administrador para asignación"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                <tr className="text-left text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-200">
                  <th className="px-5 py-3 font-medium">Curso</th>
                  <th className="px-5 py-3 font-medium text-center">Ciclo</th>
                  <th className="px-5 py-3 font-medium text-center">Créditos</th>
                  <th className="px-5 py-3 font-medium text-center">Horas/Sem</th>
                  <th className="px-5 py-3 font-medium text-center">Estudiantes</th>
                  <th className="px-5 py-3 font-medium text-center">Promedio</th>
                  <th className="px-5 py-3 font-medium text-center">Asistencia</th>
                  <th className="px-5 py-3 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody>
                {cursos.map((curso) => (
                  <tr 
                    key={curso.id} 
                    className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-zinc-900">{curso.nombreCurso}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{curso.periodoNombre}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm text-zinc-600 font-mono">{curso.ciclo}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm text-zinc-600 font-mono">{curso.creditos}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm text-zinc-600 font-mono">{curso.horasSemanal}h</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm text-zinc-900 font-medium tabular-nums">{curso.totalEstudiantes}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge value={curso.promedioGeneral} type="grade" />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge value={curso.porcentajeAsistenciaPromedio} type="attendance" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate(`/docente/curso/${curso.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 
                                   bg-zinc-900 text-white text-xs font-medium rounded
                                   hover:bg-zinc-800 transition-colors"
                      >
                        Gestionar
                        <ChevronRightIcon className="h-3 w-3 stroke-[2]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}

          {/* Footer */}
          {cursos.length > 0 && (
            <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                Total de cursos: {cursos.length}
              </p>
              <p className="text-xs font-medium text-zinc-700 tabular-nums">
                {totalEstudiantes} estudiantes en total
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
