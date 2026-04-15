import { useNotifications } from '../../contexts/NotificationContext';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Search, ChevronDown, ChevronRight, Download, FileText, User, BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';

interface EstudianteResumen {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  dni: string;
  cicloActual: number;
  carrera: string;
  estado: string;
  creditosAcumulados: number;
  promedioAcumulado: number;
  promedioSemestral: number;
  creditosSemestreActual: number;
  cursosMatriculadosActual: number;
}

interface CursoHistorial {
  idMatricula: number;
  idCurso: number;
  nombreCurso: string;
  ciclo: number;
  creditos: number;
  docente: string;
  estado: string;
  promedioFinal: number | null;
  aprobado: boolean;
}

interface PeriodoHistorial {
  idPeriodo: number;
  nombrePeriodo: string;
  anio: number;
  ciclo: string;
  esActivo: boolean;
  totalCursos: number;
  cursosAprobados: number;
  cursosDesaprobados: number;
  cursosRetirados: number;
  creditosMatriculados: number;
  promedioGeneral: number;
  cursos: CursoHistorial[];
}

interface EstudianteDetalle {
  datosPersonales: {
    id: number;
    codigo: string;
    nombres: string;
    apellidos: string;
    nombreCompleto: string;
    cicloActual: number;
    carrera: string;
    estado: string;
    creditosAcumulados: number;
    promedioAcumulado: number;
    promedioSemestral: number;
    fechaIngreso: string;
    facultadNombre: string;
    escuelaNombre: string;
  };
  historialPorPeriodo: PeriodoHistorial[];
}

export default function NotasConsolidadasAdminPage() {
  const { createNotification } = useNotifications();
  const [filtroEstudiante, setFiltroEstudiante] = useState('');
  const [filtroCiclo, setFiltroCiclo] = useState<number | undefined>(undefined);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);
  const [filtroPeriodoDetalle, setFiltroPeriodoDetalle] = useState<number | undefined>(undefined);

  const { data: estudiantes, isLoading } = useQuery({
    queryKey: ['admin-estudiantes-notas'],
    queryFn: async () => {
      const res = await api.get('/admin/estudiantes');
      return res.data as EstudianteResumen[];
    },
  });

  const { data: detalleEstudiante, isLoading: loadingDetalle } = useQuery({
    queryKey: ['estudiante-detalle', expandedStudentId],
    queryFn: async () => {
      if (!expandedStudentId) return null;
      const res = await api.get(`/admin/estudiantes/${expandedStudentId}/detalle`);
      return res.data as EstudianteDetalle;
    },
    enabled: !!expandedStudentId,
  });

  const estudiantesFiltrados = useMemo(() => {
    if (!estudiantes) return [];
    let filtered = [...estudiantes];
    if (filtroEstudiante.trim()) {
      const term = filtroEstudiante.toLowerCase();
      filtered = filtered.filter(e =>
        e.nombreCompleto.toLowerCase().includes(term) ||
        e.codigo.toLowerCase().includes(term) ||
        e.dni.toLowerCase().includes(term)
      );
    }
    if (filtroCiclo) filtered = filtered.filter(e => e.cicloActual === filtroCiclo);
    if (filtroEstado) filtered = filtered.filter(e => e.estado === filtroEstado);
    return filtered;
  }, [estudiantes, filtroEstudiante, filtroCiclo, filtroEstado]);

  const estadisticas = useMemo(() => {
    if (!estudiantes) return { total: 0, activos: 0, promedio: 0, riesgo: 0 };
    return {
      total: estudiantes.length,
      activos: estudiantes.filter(e => e.estado === 'Activo').length,
      promedio: estudiantes.length > 0
        ? +(estudiantes.reduce((s, e) => s + e.promedioAcumulado, 0) / estudiantes.length).toFixed(2) : 0,
      riesgo: estudiantes.filter(e => e.promedioAcumulado > 0 && e.promedioAcumulado < 11).length,
    };
  }, [estudiantes]);

  const toggleExpand = (id: number) => {
    setExpandedStudentId(prev => prev === id ? null : id);
    setFiltroPeriodoDetalle(undefined);
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case 'Activo': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Repitente': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Suspendido': return 'bg-red-50 text-red-700 border-red-200';
      case 'Egresado': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getNotaColor = (nota: number | null) => {
    if (nota === null || nota === 0) return 'text-slate-400';
    if (nota < 11) return 'text-red-600 font-bold';
    if (nota < 13) return 'text-amber-600';
    if (nota >= 17) return 'text-emerald-600 font-bold';
    return 'text-slate-900';
  };

  const getPromedioTag = (promedio: number) => {
    if (promedio === 0) return null;
    if (promedio >= 17) return { label: 'Excelente', style: 'bg-emerald-100 text-emerald-800' };
    if (promedio >= 14) return { label: 'Bueno', style: 'bg-sky-100 text-sky-800' };
    if (promedio >= 11) return { label: 'Regular', style: 'bg-amber-100 text-amber-800' };
    return { label: 'En riesgo', style: 'bg-red-100 text-red-800' };
  };

  const periodosFiltrados = useMemo(() => {
    if (!detalleEstudiante?.historialPorPeriodo) return [];
    const periodos = [...detalleEstudiante.historialPorPeriodo]
      .sort((a, b) => a.anio !== b.anio ? b.anio - a.anio : b.ciclo.localeCompare(a.ciclo));
    if (filtroPeriodoDetalle) return periodos.filter(p => p.idPeriodo === filtroPeriodoDetalle);
    return periodos;
  }, [detalleEstudiante, filtroPeriodoDetalle]);

  const handleExportarTodo = () => {
    if (!estudiantesFiltrados.length) return alert('No hay datos para exportar');
    const csvContent = [
      ['Código', 'Estudiante', 'DNI', 'Ciclo', 'Carrera', 'Estado', 'Créditos', 'Promedio', 'Cursos Actuales'].join(','),
      ...estudiantesFiltrados.map(e => [
        e.codigo, `"${e.nombreCompleto}"`, e.dni, e.cicloActual, `"${e.carrera}"`,
        e.estado, e.creditosAcumulados, e.promedioAcumulado.toFixed(2), e.cursosMatriculadosActual
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `notas_consolidadas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDescargarPDF = (est: EstudianteResumen) => {
    if (!detalleEstudiante || detalleEstudiante.datosPersonales.id !== est.id) return;
    const dp = detalleEstudiante.datosPersonales;
    const historial = [...detalleEstudiante.historialPorPeriodo]
      .sort((a, b) => a.anio !== b.anio ? a.anio - b.anio : a.ciclo.localeCompare(b.ciclo));

    const reporteHTML = `<!DOCTYPE html><html><head><title>Registro Académico - ${dp.nombreCompleto}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', sans-serif; margin: 30px; color: #1e293b; font-size: 11px; }
      .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
      .header h1 { font-size: 18px; color: #0f172a; letter-spacing: 2px; }
      .header p { color: #64748b; font-size: 10px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
      .info-grid p { font-size: 11px; } .info-grid strong { color: #0f172a; }
      .periodo-header { background: #0f172a; color: white; padding: 8px 12px; font-size: 12px; font-weight: bold; margin-top: 15px; display: flex; justify-content: space-between; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #f1f5f9; padding: 6px 10px; text-align: left; border: 1px solid #e2e8f0; font-size: 10px; text-transform: uppercase; color: #64748b; }
      td { padding: 6px 10px; border: 1px solid #e2e8f0; }
      .aprobado { color: #16a34a; } .desaprobado { color: #dc2626; font-weight: bold; }
      .summary { margin-top: 20px; padding: 12px; background: #f0f9ff; border: 1px solid #bae6fd; }
      .summary h3 { font-size: 13px; margin-bottom: 5px; }
      @media print { body { margin: 15px; } }
    </style></head><body>
    <div class="header">
      <div><h1>REGISTRO ACADÉMICO CONSOLIDADO</h1><p>Sistema de Gestión Académica</p></div>
      <div style="text-align:right"><p><strong>${dp.codigo}</strong></p><p>Generado: ${new Date().toLocaleDateString('es-PE')}</p></div>
    </div>
    <div class="info-grid">
      <p><strong>Estudiante:</strong> ${dp.nombreCompleto}</p>
      <p><strong>Carrera:</strong> ${dp.carrera}</p>
      <p><strong>Ciclo Actual:</strong> ${dp.cicloActual}°</p>
      <p><strong>Estado:</strong> ${dp.estado}</p>
      <p><strong>Promedio Acumulado:</strong> ${dp.promedioAcumulado.toFixed(2)}</p>
      <p><strong>Créditos Aprobados:</strong> ${dp.creditosAcumulados}</p>
      <p><strong>Ingreso:</strong> ${new Date(dp.fechaIngreso).toLocaleDateString('es-PE')}</p>
      <p><strong>Escuela:</strong> ${dp.escuelaNombre || '-'}</p>
    </div>
    ${historial.map(p => `
      <div class="periodo-header"><span>${p.nombrePeriodo} ${p.esActivo ? '(EN CURSO)' : ''}</span><span>Promedio: ${p.promedioGeneral > 0 ? p.promedioGeneral.toFixed(2) : '-'}</span></div>
      <table><thead><tr><th>Curso</th><th>Ciclo</th><th>Créd.</th><th>Docente</th><th>Estado</th><th>Nota</th></tr></thead><tbody>
      ${p.cursos.map(c => `<tr>
        <td>${c.nombreCurso}</td><td style="text-align:center">${c.ciclo}°</td><td style="text-align:center">${c.creditos}</td>
        <td>${c.docente}</td><td>${c.estado}</td>
        <td style="text-align:center" class="${c.promedioFinal !== null && c.promedioFinal < 11 ? 'desaprobado' : 'aprobado'}">${c.promedioFinal !== null ? c.promedioFinal.toFixed(2) : '-'}</td>
      </tr>`).join('')}
      </tbody></table>
    `).join('')}
    <div class="summary">
      <h3>Resumen General</h3>
      <p>Promedio Acumulado: <strong>${dp.promedioAcumulado.toFixed(2)}</strong> | Créditos Aprobados: <strong>${dp.creditosAcumulados}</strong> | Periodos Cursados: <strong>${historial.length}</strong></p>
    </div></body></html>`;

    const ventana = window.open('', '_blank');
    if (ventana) { ventana.document.write(reporteHTML); ventana.document.close(); setTimeout(() => ventana.print(), 300); }
  };

  const resetFiltros = () => { setFiltroCiclo(undefined); setFiltroEstado(''); setFiltroEstudiante(''); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-2py-6 sm:px-6 lg:px-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Notas Consolidadas</h1>
              <p className="mt-1 text-zinc-500">Historial académico completo por estudiante y período</p>
            </div>
            <button
              onClick={handleExportarTodo}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white shadow-lg shadow-zinc-900/20 transition-colors hover:bg-zinc-800"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 sm:px-6 lg:px-0 py-4 bg-white border-b border-slate-100">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1"><User className="w-4 h-4 text-slate-400" /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Estudiantes</span></div>
            <p className="text-2xl font-bold text-slate-900 font-mono">{estadisticas.total}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-4">
            <div className="flex items-center gap-2 mb-1"><BookOpen className="w-4 h-4 text-emerald-500" /><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Activos</span></div>
            <p className="text-2xl font-bold text-emerald-700 font-mono">{estadisticas.activos}</p>
          </div>
          <div className="bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 p-4">
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-sky-500" /><span className="text-[10px] font-bold uppercase tracking-wider text-sky-500">Promedio General</span></div>
            <p className="text-2xl font-bold text-sky-700 font-mono">{estadisticas.promedio}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-4">
            <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-red-500" /><span className="text-[10px] font-bold uppercase tracking-wider text-red-500">En Riesgo</span></div>
            <p className="text-2xl font-bold text-red-700 font-mono">{estadisticas.riesgo}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-slate-200 py-4 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-0">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Buscar Estudiante</label>
              <div className="relative">
                <input type="text" value={filtroEstudiante} onChange={(e) => setFiltroEstudiante(e.target.value)}
                  placeholder="Nombre, código o DNI..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-0 focus:border-slate-900 block p-2.5 placeholder-slate-400 hover:border-slate-400 pr-10" />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Ciclo</label>
              <select value={filtroCiclo || ''} onChange={(e) => setFiltroCiclo(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-0 focus:border-slate-900 block p-2.5 hover:border-slate-400 cursor-pointer">
                <option value="">Todos</option>
                {[1,2,3,4,5,6,7,8,9,10].map(c => <option key={c} value={c}>{c}° Ciclo</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Estado</label>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-0 focus:border-slate-900 block p-2.5 hover:border-slate-400 cursor-pointer">
                <option value="">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Repitente">Repitente</option>
                <option value="Suspendido">Suspendido</option>
                <option value="Egresado">Egresado</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={resetFiltros}
                className="w-full h-[42px] border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-colors">
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 bg-slate-900 text-[10px] uppercase font-bold text-slate-300 tracking-wider">
            <div className="col-span-1 p-3 text-center">#</div>
            <div className="col-span-3 p-3">Estudiante</div>
            <div className="col-span-2 p-3">Código / DNI</div>
            <div className="col-span-1 p-3 text-center">Ciclo</div>
            <div className="col-span-1 p-3 text-center">Estado</div>
            <div className="col-span-1 p-3 text-center">Créditos</div>
            <div className="col-span-1 p-3 text-center">Promedio</div>
            <div className="col-span-1 p-3 text-center">Cursos</div>
            <div className="col-span-1 p-3 text-center">Acciones</div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-3" />
              <p className="text-sm text-slate-500">Cargando estudiantes...</p>
            </div>
          ) : estudiantesFiltrados.length === 0 ? (
            <div className="py-20 text-center">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">No se encontraron estudiantes</p>
              <p className="text-xs text-slate-400 mt-1">Intenta cambiar los filtros de búsqueda</p>
            </div>
          ) : (
            estudiantesFiltrados.map((est, idx) => {
              const isExpanded = expandedStudentId === est.id;
              const promTag = getPromedioTag(est.promedioAcumulado);
              return (
                <React.Fragment key={est.id}>
                  {/* Desktop Row */}
                  <div onClick={() => toggleExpand(est.id)}
                    className={`hidden lg:grid grid-cols-12 cursor-pointer transition-all duration-150 ${
                      isExpanded ? 'bg-sky-50 border-l-4 border-l-sky-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                    } ${idx < estudiantesFiltrados.length - 1 && !isExpanded ? 'border-b border-slate-100' : ''}`}>
                    <div className="col-span-1 p-3 flex items-center justify-center">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-sky-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div className="col-span-3 p-3 flex flex-col justify-center min-w-0">
                      <span className="text-sm font-semibold text-slate-900 truncate">{est.nombreCompleto}</span>
                      <span className="text-[10px] text-slate-500 truncate">{est.carrera}</span>
                    </div>
                    <div className="col-span-2 p-3 flex flex-col justify-center min-w-0">
                      <span className="font-mono text-xs text-slate-700 truncate">{est.codigo}</span>
                      <span className="font-mono text-[10px] text-slate-400">{est.dni}</span>
                    </div>
                    <div className="col-span-1 p-3 flex items-center justify-center">
                      <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded">{est.cicloActual}°</span>
                    </div>
                    <div className="col-span-1 p-3 flex items-center justify-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 border ${getEstadoStyle(est.estado)}`}>
                        {est.estado}
                      </span>
                    </div>
                    <div className="col-span-1 p-3 flex items-center justify-center">
                      <span className="text-xs font-mono text-slate-700">{est.creditosAcumulados}</span>
                    </div>
                    <div className="col-span-1 p-3 flex flex-col items-center justify-center">
                      <span className={`text-base font-mono font-bold ${getNotaColor(est.promedioAcumulado || null)}`}>
                        {est.promedioAcumulado > 0 ? est.promedioAcumulado.toFixed(2) : '—'}
                      </span>
                      {promTag && <span className={`text-[9px] font-bold px-1.5 py-0.5 mt-0.5 rounded-sm ${promTag.style}`}>{promTag.label}</span>}
                    </div>
                    <div className="col-span-1 p-3 flex items-center justify-center">
                      <span className="text-xs text-slate-600 font-mono">{est.cursosMatriculadosActual}</span>
                    </div>
                    <div className="col-span-1 p-3 flex items-center justify-center">
                      <button onClick={(e) => { e.stopPropagation(); toggleExpand(est.id); }}
                        className="text-[10px] font-bold uppercase text-sky-600 hover:text-sky-800 transition-colors">
                        {isExpanded ? 'Cerrar' : 'Ver'}
                      </button>
                    </div>
                  </div>

                  {/* Mobile Card */}
                  <div onClick={() => toggleExpand(est.id)}
                    className={`lg:hidden p-4 cursor-pointer transition-all ${
                      isExpanded ? 'bg-sky-50 border-l-4 border-l-sky-500' : 'hover:bg-slate-50'
                    } ${idx < estudiantesFiltrados.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900">{est.nombreCompleto}</h3>
                        <p className="text-[10px] text-slate-500 font-mono">{est.codigo}</p>
                      </div>
                      <p className={`text-lg font-mono font-bold shrink-0 ${getNotaColor(est.promedioAcumulado || null)}`}>
                        {est.promedioAcumulado > 0 ? est.promedioAcumulado.toFixed(2) : '—'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${getEstadoStyle(est.estado)}`}>{est.estado}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 font-bold">{est.cicloActual}° Ciclo</span>
                      <span className="text-[10px] text-slate-500">{est.cursosMatriculadosActual} cursos</span>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-b-2 border-sky-200 bg-gradient-to-b from-sky-50/50 to-white">
                      {loadingDetalle ? (
                        <div className="py-12 text-center">
                          <div className="inline-block w-6 h-6 border-[3px] border-sky-200 border-t-sky-600 rounded-full animate-spin mb-2" />
                          <p className="text-xs text-slate-500">Cargando historial académico...</p>
                        </div>
                      ) : detalleEstudiante && detalleEstudiante.datosPersonales.id === est.id ? (
                        <div className="p-4 sm:p-6">
                          {/* Student Summary Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center text-sm font-bold uppercase rounded">
                                {est.nombres.charAt(0)}{est.apellidos.charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-slate-900">{est.nombreCompleto}</h3>
                                <p className="text-xs text-slate-500">{est.carrera} — Ingreso: {new Date(detalleEstudiante.datosPersonales.fechaIngreso).getFullYear()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {detalleEstudiante.historialPorPeriodo.length > 0 && (
                                <select value={filtroPeriodoDetalle || ''}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => setFiltroPeriodoDetalle(e.target.value ? Number(e.target.value) : undefined)}
                                  className="text-xs bg-white border border-slate-200 text-slate-700 px-3 py-2 cursor-pointer hover:border-slate-400 focus:ring-0 focus:border-slate-900">
                                  <option value="">Todos los períodos</option>
                                  {[...detalleEstudiante.historialPorPeriodo]
                                    .sort((a, b) => a.anio !== b.anio ? b.anio - a.anio : b.ciclo.localeCompare(a.ciclo))
                                    .map(p => <option key={p.idPeriodo} value={p.idPeriodo}>{p.nombrePeriodo}{p.esActivo ? ' (Actual)' : ''}</option>)}
                                </select>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); handleDescargarPDF(est); }}
                                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 transition-colors">
                                <FileText className="w-3 h-3" /> PDF
                              </button>
                            </div>
                          </div>

                          {/* Period Cards */}
                          {periodosFiltrados.length === 0 ? (
                            <div className="text-center py-8 text-sm text-slate-400">Sin historial académico registrado</div>
                          ) : (
                            <div className="space-y-4">
                              {periodosFiltrados.map(periodo => (
                                <div key={periodo.idPeriodo} className="border border-slate-200 bg-white overflow-hidden shadow-sm">
                                  {/* Period Header */}
                                  <div className={`flex items-center justify-between px-4 py-3 ${periodo.esActivo ? 'bg-sky-600 text-white' : 'bg-slate-800 text-white'}`}>
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-bold tracking-wide">{periodo.nombrePeriodo}</span>
                                      {periodo.esActivo && <span className="text-[10px] bg-white/20 px-2 py-0.5 font-bold uppercase tracking-wider">En curso</span>}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs">
                                      <span>{periodo.totalCursos} cursos</span>
                                      <span>{periodo.creditosMatriculados} créd.</span>
                                      <span className="font-mono font-bold text-base">
                                        {periodo.promedioGeneral > 0 ? periodo.promedioGeneral.toFixed(2) : '—'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Courses Table */}
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                          <th className="text-left p-3">Curso</th>
                                          <th className="text-center p-3 w-16">Ciclo</th>
                                          <th className="text-center p-3 w-16">Créd.</th>
                                          <th className="text-left p-3">Docente</th>
                                          <th className="text-center p-3 w-24">Estado</th>
                                          <th className="text-center p-3 w-20">Nota</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {periodo.cursos
                                          .sort((a, b) => a.ciclo - b.ciclo || a.nombreCurso.localeCompare(b.nombreCurso))
                                          .map(curso => (
                                          <tr key={curso.idMatricula} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-3"><span className="font-medium text-slate-800">{curso.nombreCurso}</span></td>
                                            <td className="p-3 text-center text-xs text-slate-500">{curso.ciclo}°</td>
                                            <td className="p-3 text-center text-xs text-slate-500">{curso.creditos}</td>
                                            <td className="p-3 text-xs text-slate-600">{curso.docente}</td>
                                            <td className="p-3 text-center">
                                              {curso.estado === 'Retirado' ? (
                                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 border border-red-200">Retirado</span>
                                              ) : curso.promedioFinal !== null && curso.promedioFinal < 11 ? (
                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-200">Desaprobado</span>
                                              ) : curso.promedioFinal !== null ? (
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-200">Aprobado</span>
                                              ) : (
                                                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 border border-sky-200">Cursando</span>
                                              )}
                                            </td>
                                            <td className="p-3 text-center">
                                              <span className={`text-base font-mono font-bold ${getNotaColor(curso.promedioFinal)}`}>
                                                {curso.promedioFinal !== null ? curso.promedioFinal.toFixed(2) : '—'}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Period Summary */}
                                  {!periodo.esActivo && (
                                    <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex flex-wrap gap-4 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                                      <span>Aprobados: <span className="text-emerald-600">{periodo.cursosAprobados}</span></span>
                                      {periodo.cursosDesaprobados > 0 && <span>Desaprobados: <span className="text-red-600">{periodo.cursosDesaprobados}</span></span>}
                                      {periodo.cursosRetirados > 0 && <span>Retirados: <span className="text-amber-600">{periodo.cursosRetirados}</span></span>}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-sm text-slate-400">Error al cargar datos</div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })
          )}

          {/* Results count */}
          {!isLoading && estudiantesFiltrados.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Mostrando <span className="font-bold text-slate-700">{estudiantesFiltrados.length}</span> de <span className="font-bold text-slate-700">{estudiantes?.length || 0}</span> estudiantes
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
