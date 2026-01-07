import { useQuery } from '@tanstack/react-query'
import {
  Users,
  BookOpen,
  Clock,
  Award,
  Download,
  FileText
} from 'lucide-react'
import { docentesApi } from '../services/docentesService'
import { cursosApi } from '../services/cursosService'
import StatsCard from '../components/Dashboard/StatsCard'

import QuickActions from '../components/Dashboard/QuickActions'
import ChartsSection from '../components/Dashboard/ChartsSection'

const Dashboard = () => {
  const { data: docentes, isLoading: loadingDocentes } = useQuery({
    queryKey: ['docentes'],
    queryFn: docentesApi.getAll,
  })

  const { data: cursos, isLoading: loadingCursos } = useQuery({
    queryKey: ['cursos'],
    queryFn: cursosApi.getAll,
  })

  // Función para exportar datos a CSV
  const handleExportarDatos = () => {
    if (!cursos || !docentes) {
      alert('No hay datos para exportar');
      return;
    }

    // Crear CSV con cursos
    const csvContent = [
      ['ID', 'Nombre del Curso', 'Créditos', 'Horas Semanales', 'Ciclo', 'Docente'].join(','),
      ...cursos.map(curso => [
        curso.id,
        `"${curso.nombreCurso}"`,
        curso.creditos,
        curso.horasSemanal,
        curso.ciclo,
        curso.docente ? `"${curso.docente.nombres} ${curso.docente.apellidos}"` : 'Sin asignar'
      ].join(','))
    ].join('\n');

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `datos_academicos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para generar reporte PDF
  const handleGenerarReporte = () => {
    if (!cursos || !docentes) {
      alert('No hay datos para generar el reporte');
      return;
    }

    // Crear contenido HTML para el reporte
    const reporteHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte Académico</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #1F2937; border-bottom: 3px solid #003366; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #003366; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #E5E7EB; }
          tr:nth-child(even) { background-color: #F9FAFB; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
          .stat-card { background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #003366; }
          .stat-label { color: #6B7280; margin-top: 5px; }
          .footer { margin-top: 40px; text-align: center; color: #6B7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Reporte Académico - Sistema de Gestión</h1>
        <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
        
        <h2>Resumen General</h2>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">${docentes.length}</div>
            <div class="stat-label">Total Docentes</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${cursos.length}</div>
            <div class="stat-label">Total Cursos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${cursos.reduce((sum, c) => sum + c.creditos, 0)}</div>
            <div class="stat-label">Total Créditos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${cursos.reduce((sum, c) => sum + c.horasSemanal, 0)}</div>
            <div class="stat-label">Horas Semanales</div>
          </div>
        </div>

        <h2>Cursos por Ciclo</h2>
        <table>
          <thead>
            <tr>
              <th>Ciclo</th>
              <th>Nombre del Curso</th>
              <th>Créditos</th>
              <th>Horas</th>
              <th>Docente</th>
            </tr>
          </thead>
          <tbody>
            ${cursos
        .sort((a, b) => a.ciclo - b.ciclo)
        .map(curso => `
                <tr>
                  <td>Ciclo ${curso.ciclo}</td>
                  <td>${curso.nombreCurso}</td>
                  <td>${curso.creditos}</td>
                  <td>${curso.horasSemanal}</td>
                  <td>${curso.docente ? `${curso.docente.nombres} ${curso.docente.apellidos}` : 'Sin asignar'}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>

        <h2>Listado de Docentes</h2>
        <table>
          <thead>
            <tr>
              <th>Apellidos</th>
              <th>Nombres</th>
              <th>Profesión</th>
              <th>Cursos Asignados</th>
            </tr>
          </thead>
          <tbody>
            ${docentes.map(docente => `
              <tr>
                <td>${docente.apellidos}</td>
                <td>${docente.nombres}</td>
                <td>${docente.profesion || 'No especificado'}</td>
                <td>${docente.cursos?.length || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Sistema de Gestión Académica - Reporte generado automáticamente</p>
        </div>
      </body>
      </html>
    `;

    // Abrir ventana de impresión
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(reporteHTML);
      ventana.document.close();
      setTimeout(() => {
        ventana.print();
      }, 250);
    }
  };

  const stats = [
    {
      name: 'Total Docentes',
      value: docentes?.length || 0,
      icon: Users,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Cursos',
      value: cursos?.length || 0,
      icon: BookOpen,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Créditos',
      value: cursos?.reduce((sum, curso) => sum + curso.creditos, 0) || 0,
      icon: Award,
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      name: 'Horas Semanales',
      value: cursos?.reduce((sum, curso) => sum + curso.horasSemanal, 0) || 0,
      icon: Clock,
      change: '+15%',
      changeType: 'positive' as const,
    },
  ]

  const isLoading = loadingDocentes || loadingCursos

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Resumen general del sistema de gestión académica
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
          <button
            type="button"
            onClick={handleExportarDatos}
            className="inline-flex items-center justify-center gap-2 bg-white px-3 py-2 text-sm font-medium text-zinc-700 border border-zinc-300 hover:bg-zinc-50 transition-colors w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button
            type="button"
            onClick={handleGenerarReporte}
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors w-full sm:w-auto"
          >
            <FileText className="h-4 w-4" />
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.name} {...stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="xl:col-span-2">
          <ChartsSection cursos={cursos} />
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          <QuickActions />

        </div>
      </div>
    </div>
  )
}

export default Dashboard
