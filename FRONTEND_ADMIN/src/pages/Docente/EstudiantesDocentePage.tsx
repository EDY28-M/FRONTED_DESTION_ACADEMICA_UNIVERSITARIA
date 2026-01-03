import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { docenteCursosApi, CursoDocente, EstudianteCurso } from '../../services/docenteApi';
import { toast } from 'react-hot-toast';
import {
  UsersIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
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

export const EstudiantesDocentePage = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<CursoDocente[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<number | null>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteCurso[]>([]);
  const [isLoadingCursos, setIsLoadingCursos] = useState(true);
  const [isLoadingEstudiantes, setIsLoadingEstudiantes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarCursos();
  }, []);

  useEffect(() => {
    if (selectedCurso) {
      cargarEstudiantes(selectedCurso);
    }
  }, [selectedCurso]);

  const cargarCursos = async () => {
    try {
      setIsLoadingCursos(true);
      const data = await docenteCursosApi.getMisCursos();
      setCursos(data);
      if (data.length > 0) {
        setSelectedCurso(data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setIsLoadingCursos(false);
    }
  };

  const cargarEstudiantes = async (cursoId: number) => {
    try {
      setIsLoadingEstudiantes(true);
      const data = await docenteCursosApi.getEstudiantesCurso(cursoId);
      // La respuesta puede ser un array o un objeto con estudiantes
      if (Array.isArray(data)) {
        setEstudiantes(data);
      } else if (data && 'estudiantes' in data) {
        setEstudiantes(data.estudiantes);
      } else {
        setEstudiantes([]);
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      toast.error('Error al cargar los estudiantes');
    } finally {
      setIsLoadingEstudiantes(false);
    }
  };

  const filteredEstudiantes = estudiantes.filter(est =>
    est.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cursoSeleccionado = cursos.find(c => c.id === selectedCurso);

  if (isLoadingCursos) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400 text-sm">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="px-6 py-4 max-w-1xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-sm font-medium text-zinc-900">Estudiantes</h1>
            <p className="text-xs text-zinc-500">Gestiona los estudiantes de tus cursos</p>
          </div>
        </div>
      </header>

      <div className="px-0 pt-8 pb-6 max-w-1xl mx-auto">
        {/* Selector de Curso */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs text-zinc-500 mb-1.5">Seleccionar curso</label>
            <select
              value={selectedCurso || ''}
              onChange={(e) => setSelectedCurso(Number(e.target.value))}
              className="w-full sm:max-w-xs px-3 py-2 text-sm border border-zinc-200 rounded-md bg-white
                         focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombreCurso} - Ciclo {curso.ciclo}
                </option>
              ))}
            </select>
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-auto">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-md bg-white
                         focus:outline-none focus:ring-1 focus:ring-zinc-400 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Info del curso seleccionado */}
        {cursoSeleccionado && (
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
            <span>{cursoSeleccionado.totalEstudiantes} estudiantes</span>
            <span className="hidden sm:inline">•</span>
            <span>Promedio: {cursoSeleccionado.promedioGeneral.toFixed(2)}</span>
            <span className="hidden sm:inline">•</span>
            <span>Asistencia: {cursoSeleccionado.porcentajeAsistenciaPromedio.toFixed(1)}%</span>
          </div>
        )}

        {/* ========== DATA TABLE ========== */}
        <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden">
          {isLoadingEstudiantes ? (
            <div className="py-16 text-center">
              <div className="animate-pulse text-zinc-400 text-sm">Cargando estudiantes...</div>
            </div>
          ) : filteredEstudiantes.length === 0 ? (
            <EmptyState 
              icon={UsersIcon}
              title={searchTerm ? "Sin resultados" : "Sin estudiantes"}
              description={searchTerm ? "No se encontraron estudiantes con ese criterio" : "Este curso no tiene estudiantes matriculados"}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                <tr className="text-left text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-200">
                  <th className="px-5 py-3 font-medium">Estudiante</th>
                  <th className="px-5 py-3 font-medium">Código</th>
                  <th className="px-5 py-3 font-medium text-center">Estado</th>
                  <th className="px-5 py-3 font-medium text-center">Promedio</th>
                  <th className="px-5 py-3 font-medium text-center">Asistencia</th>
                  <th className="px-5 py-3 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEstudiantes.map((estudiante) => (
                  <tr 
                    key={estudiante.id} 
                    className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-medium text-zinc-600">
                          {estudiante.nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{estudiante.nombreCompleto}</p>
                          <p className="text-xs text-zinc-500">{estudiante.correo || 'Sin correo'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-zinc-600 font-mono">{estudiante.codigo}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        estudiante.estadoMatricula === 'Activo' 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {estudiante.estadoMatricula}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {estudiante.promedioFinal !== undefined && estudiante.promedioFinal !== null ? (
                        <StatusBadge value={estudiante.promedioFinal} type="grade" />
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {estudiante.porcentajeAsistencia !== undefined && estudiante.porcentajeAsistencia !== null ? (
                        <StatusBadge value={estudiante.porcentajeAsistencia} type="attendance" />
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate(`/docente/curso/${selectedCurso}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 
                                   border border-zinc-200 text-zinc-700 text-xs font-medium rounded
                                   hover:bg-zinc-50 transition-colors"
                      >
                        Ver detalles
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
          {filteredEstudiantes.length > 0 && (
            <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                Mostrando {filteredEstudiantes.length} de {estudiantes.length} estudiantes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
