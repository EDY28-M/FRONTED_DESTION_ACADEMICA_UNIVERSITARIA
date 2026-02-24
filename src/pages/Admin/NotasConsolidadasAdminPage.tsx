import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, NotaConsolidada } from '../../services/adminApi';
import { cursosApi } from '../../services/cursosService';
import { adminCursosApi } from '../../services/adminCursosApi';
import { Search } from 'lucide-react';

interface EstudianteAgrupado {
  idMatricula: number;
  nombreEstudiante: string;
  codigoEstudiante: string;
  nombreCurso: string;
  nombrePeriodo: string;
  promedioFinal: number | null;
  notas: NotaConsolidada[];
  estado: 'regular' | 'becado' | 'riesgo' | 'condicional';
  anioIngreso: string;
}

export default function NotasConsolidadasAdminPage() {
  const [filtroCurso, setFiltroCurso] = useState<number | undefined>(undefined);
  const [filtroEstudiante, setFiltroEstudiante] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState<number | undefined>(undefined);

  const { data: cursos } = useQuery({
    queryKey: ['cursos'],
    queryFn: () => cursosApi.getAll(),
  });

  const { data: periodos } = useQuery({
    queryKey: ['periodos-admin'],
    queryFn: () => adminCursosApi.getPeriodos(),
  });

  const { data: notas, isLoading } = useQuery({
    queryKey: ['notas-consolidadas', filtroCurso, filtroPeriodo],
    queryFn: () => adminApi.getNotasConsolidadas({
      idCurso: filtroCurso,
      idPeriodo: filtroPeriodo,
    }),
  });

  // Agrupar notas por estudiante (matrícula) y calcular promedios
  const estudiantesAgrupados = useMemo(() => {
    if (!notas) return [];

    const notasPorMatricula = notas.reduce((acc, nota) => {
      if (!acc[nota.idMatricula]) {
        acc[nota.idMatricula] = [];
      }
      acc[nota.idMatricula].push(nota);
      return acc;
    }, {} as Record<number, NotaConsolidada[]>);

    const grupos: EstudianteAgrupado[] = Object.entries(notasPorMatricula).map(([idMatricula, notasMatricula]) => {
      const primeraNota = notasMatricula[0];
      const notasConValor = notasMatricula.filter(n => n.nota > 0 && n.peso);

      let promedioFinal: number | null = null;
      if (notasConValor.length > 0) {
        const pesoTotal = notasConValor.reduce((sum, n) => sum + (n.peso || 0), 0);
        if (pesoTotal > 0) {
          promedioFinal = notasConValor.reduce((sum, n) => sum + (n.nota * (n.peso || 0) / 100), 0);
        }
      }

      // Determinar estado basado en promedio
      let estado: EstudianteAgrupado['estado'] = 'regular';
      if (promedioFinal !== null) {
        if (promedioFinal < 11) estado = 'riesgo';
        else if (promedioFinal < 13) estado = 'condicional';
        else if (promedioFinal >= 17) estado = 'becado';
      }

      return {
        idMatricula: Number(idMatricula),
        notas: notasMatricula,
        promedioFinal,
        nombreEstudiante: primeraNota.nombreEstudiante,
        codigoEstudiante: primeraNota.codigoEstudiante,
        nombreCurso: primeraNota.nombreCurso,
        nombrePeriodo: primeraNota.nombrePeriodo || '',
        estado,
        anioIngreso: primeraNota.codigoEstudiante?.substring(3, 7) || '2024',
      };
    });

    return grupos;
  }, [notas]);

  // Filtrar por nombre de estudiante
  const estudiantesFiltrados = useMemo(() => {
    if (!filtroEstudiante.trim()) return estudiantesAgrupados;
    const termino = filtroEstudiante.toLowerCase();
    return estudiantesAgrupados.filter(e =>
      e.nombreEstudiante.toLowerCase().includes(termino) ||
      e.codigoEstudiante.toLowerCase().includes(termino)
    );
  }, [estudiantesAgrupados, filtroEstudiante]);

  const resetFiltros = () => {
    setFiltroCurso(undefined);
    setFiltroPeriodo(undefined);
    setFiltroEstudiante('');
  };

  const getPromedioColor = (promedio: number | null) => {
    if (promedio === null) return 'text-slate-900';
    if (promedio < 11) return 'text-red-600';
    if (promedio < 13) return 'text-amber-600';
    return 'text-slate-900';
  };

  const getEstadoBadge = (estado: EstudianteAgrupado['estado']) => {
    switch (estado) {
      case 'regular':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'becado':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'riesgo':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'condicional':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getEstadoLabel = (estado: EstudianteAgrupado['estado']) => {
    switch (estado) {
      case 'regular': return 'Regular';
      case 'becado': return 'Becado';
      case 'riesgo': return 'Riesgo';
      case 'condicional': return 'Condicional';
      default: return estado;
    }
  };

  const handleExportarTodo = () => {
    if (!estudiantesFiltrados.length) {
      alert('No hay datos para exportar');
      return;
    }

    const csvContent = [
      ['Estudiante', 'Código', 'Programa', 'Estado', 'Promedio'].join(','),
      ...estudiantesFiltrados.map(e => [
        `"${e.nombreEstudiante}"`,
        e.codigoEstudiante,
        `"${e.nombreCurso}"`,
        getEstadoLabel(e.estado),
        e.promedioFinal?.toFixed(2) || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `registros_academicos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDescargarPDF = (estudiante: EstudianteAgrupado) => {
    // Generar reporte PDF para un estudiante
    const reporteHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Registro Académico - ${estudiante.nombreEstudiante}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #0F172A; border-bottom: 2px solid #0F172A; padding-bottom: 10px; }
          .info { margin: 20px 0; }
          .info p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f1f5f9; padding: 12px; text-align: left; border: 1px solid #e2e8f0; }
          td { padding: 10px; border: 1px solid #e2e8f0; }
          .promedio { font-size: 24px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>REGISTRO ACADÉMICO</h1>
        <div class="info">
          <p><strong>Estudiante:</strong> ${estudiante.nombreEstudiante}</p>
          <p><strong>Código:</strong> ${estudiante.codigoEstudiante}</p>
          <p><strong>Programa:</strong> ${estudiante.nombreCurso}</p>
          <p><strong>Estado:</strong> ${getEstadoLabel(estudiante.estado)}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Evaluación</th>
              <th>Nota</th>
              <th>Peso</th>
            </tr>
          </thead>
          <tbody>
            ${estudiante.notas.map(n => `
              <tr>
                <td>${n.tipoEvaluacion}</td>
                <td>${n.nota > 0 ? n.nota.toFixed(2) : 'N/A'}</td>
                <td>${n.peso || 0}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p class="promedio">Promedio Final: ${estudiante.promedioFinal?.toFixed(2) || 'N/A'}</p>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(reporteHTML);
      ventana.document.close();
      setTimeout(() => ventana.print(), 250);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 ">
        <div className="px-4 sm:px-6 lg:px-0">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">

              <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">REGISTROS ACADÉMICOS</h1>
              <p className="text-xs text-slate-500">Descarga y gestiona los reportes de notas consolidados.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 border border-slate-200">v4.0.2</span>
              <button
                onClick={handleExportarTodo}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                Exportar Todo
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-white border-b border-slate-200 py-4 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-0">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Curso / Programa</label>
              <select
                value={filtroCurso || ''}
                onChange={(e) => setFiltroCurso(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-0 focus:border-slate-900 block p-2.5 transition-colors cursor-pointer hover:border-slate-400"
              >
                <option value="">Todos los cursos</option>
                {cursos?.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nombreCurso}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Ciclo Académico</label>
              <select
                value={filtroPeriodo || ''}
                onChange={(e) => setFiltroPeriodo(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-0 focus:border-slate-900 block p-2.5 hover:border-slate-400"
              >
                <option value="">Todos</option>
                {periodos?.map((periodo) => (
                  <option key={periodo.id} value={periodo.id}>
                    {periodo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Filtrar Estudiante</label>
              <div className="relative">
                <input
                  type="text"
                  value={filtroEstudiante}
                  onChange={(e) => setFiltroEstudiante(e.target.value)}
                  placeholder="Nombre o matrícula..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-0 focus:border-slate-900 block p-2.5 placeholder-slate-400 hover:border-slate-400 pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
            <div className="col-span-1 flex items-end">
              <button
                onClick={resetFiltros}
                className="w-full h-[42px] border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                Resetear Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <main className="bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Encabezado de tabla - Desktop */}
          <div className="hidden lg:grid grid-cols-12 bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            <div className="col-span-1 p-4 border-r border-slate-200 text-center flex items-center justify-center">Acción</div>
            <div className="col-span-3 p-4 border-r border-slate-200 flex items-center">Estudiante</div>
            <div className="col-span-2 p-4 border-r border-slate-200 flex items-center">ID Matrícula</div>
            <div className="col-span-2 p-4 border-r border-slate-200 flex items-center">Estado</div>
            <div className="col-span-3 p-4 border-r border-slate-200 flex items-center">Programa</div>
            <div className="col-span-1 p-4 flex items-center justify-end text-right">Promedio</div>
          </div>

          {/* Filas de datos */}
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="animate-pulse text-slate-400 text-sm">Cargando registros...</div>
            </div>
          ) : estudiantesFiltrados.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-500 mb-1">No hay registros</p>
              <p className="text-xs text-slate-400">No se encontraron estudiantes con los filtros seleccionados</p>
            </div>
          ) : (
            estudiantesFiltrados.map((estudiante, index) => (
              <React.Fragment key={estudiante.idMatricula}>
                {/* Vista Desktop */}
                <div
                  className={`hidden lg:grid grid-cols-12 group hover:bg-slate-50 transition-colors ${index < estudiantesFiltrados.length - 1 ? 'border-b border-slate-200' : ''}`}
                >
                  {/* Acción */}
                  <div className="col-span-1 p-3 border-r border-slate-200 flex items-center justify-center bg-slate-50/50">
                    {estudiante.promedioFinal !== null ? (
                      <button
                        onClick={() => handleDescargarPDF(estudiante)}
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border border-slate-900 hover:bg-slate-900 hover:text-white py-2 px-3 transition-all w-full text-center"
                      >
                        PDF
                      </button>
                    ) : (
                      <button
                        disabled
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-300 cursor-not-allowed py-2 px-3 w-full text-center"
                      >
                        N/A
                      </button>
                    )}
                  </div>

                  {/* Estudiante */}
                  <div className="col-span-3 p-4 border-r border-slate-200 flex flex-col justify-center min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">{estudiante.nombreEstudiante}</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Ingreso: {estudiante.anioIngreso}-I</p>
                  </div>

                  {/* ID Matrícula */}
                  <div className="col-span-2 p-4 border-r border-slate-200 flex items-center min-w-0">
                    <span className="font-mono text-xs text-slate-600 truncate">{estudiante.codigoEstudiante}</span>
                  </div>

                  {/* Estado */}
                  <div className="col-span-2 p-4 border-r border-slate-200 flex items-center">
                    <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap ${getEstadoBadge(estudiante.estado)}`}>
                      {getEstadoLabel(estudiante.estado)}
                    </span>
                  </div>

                  {/* Programa */}
                  <div className="col-span-3 p-4 border-r border-slate-200 flex flex-col justify-center min-w-0">
                    <span className="text-xs font-medium text-slate-800 truncate">{estudiante.nombreCurso}</span>
                    <span className="text-[10px] text-slate-500">{estudiante.nombrePeriodo || 'Plan 2024'}</span>
                  </div>

                  {/* Promedio */}
                  <div className="col-span-1 p-4 flex items-center justify-end bg-slate-50/30">
                    <span className={`text-lg font-mono font-bold tabular-nums ${getPromedioColor(estudiante.promedioFinal)}`}>
                      {estudiante.promedioFinal !== null ? estudiante.promedioFinal.toFixed(2) : '—'}
                    </span>
                  </div>
                </div>

                {/* Vista Móvil/Tablet - Card */}
                <div
                  className={`lg:hidden p-4 hover:bg-slate-50 transition-colors ${index < estudiantesFiltrados.length - 1 ? 'border-b border-slate-200' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{estudiante.nombreEstudiante}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{estudiante.codigoEstudiante}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xl font-mono font-bold tabular-nums ${getPromedioColor(estudiante.promedioFinal)}`}>
                        {estudiante.promedioFinal !== null ? estudiante.promedioFinal.toFixed(2) : '—'}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase">Promedio</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wide border ${getEstadoBadge(estudiante.estado)}`}>
                      {getEstadoLabel(estudiante.estado)}
                    </span>
                    <span className="text-[10px] text-slate-500">Ingreso: {estudiante.anioIngreso}-I</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-800 truncate">{estudiante.nombreCurso}</p>
                      <p className="text-[10px] text-slate-500">{estudiante.nombrePeriodo || 'Plan 2024'}</p>
                    </div>
                    {estudiante.promedioFinal !== null ? (
                      <button
                        onClick={() => handleDescargarPDF(estudiante)}
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border border-slate-900 hover:bg-slate-900 hover:text-white py-2 px-4 transition-all shrink-0"
                      >
                        PDF
                      </button>
                    ) : (
                      <button
                        disabled
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-300 cursor-not-allowed py-2 px-4 shrink-0"
                      >
                        N/A
                      </button>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-between items-center text-xs text-slate-500 font-mono">
          <div>
            © 2026 SISTEMA DE GESTIÓN ACADÉMICA. BUILD V.4.0.2
          </div>
          <div className="flex gap-4 items-center">
            <span className="hover:text-slate-900 cursor-pointer transition-colors">PRIVACIDAD</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">TÉRMINOS</span>
            <div className="flex items-center gap-2 border border-green-200 bg-green-50 px-2 py-1">
              <div className="w-1.5 h-1.5 bg-green-500"></div>
              <span className="text-green-700 font-bold tracking-tight">SISTEMA ONLINE</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
