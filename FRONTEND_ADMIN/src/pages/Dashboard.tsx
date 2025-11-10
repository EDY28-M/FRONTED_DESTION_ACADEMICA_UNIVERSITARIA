import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  ClockIcon,
  TrophyIcon 
} from '@heroicons/react/24/outline'
import { docentesApi } from '../services/docentesService'
import { cursosApi } from '../services/cursosService'
import StatsCard from '../components/Dashboard/StatsCard'
import RecentActivity from '../components/Dashboard/RecentActivity'
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
          h1 { color: #1F2937; border-bottom: 3px solid #3B82F6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #3B82F6; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #E5E7EB; }
          tr:nth-child(even) { background-color: #F9FAFB; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
          .stat-card { background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #3B82F6; }
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
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Cursos',
      value: cursos?.length || 0,
      icon: AcademicCapIcon,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Créditos',
      value: cursos?.reduce((sum, curso) => sum + curso.creditos, 0) || 0,
      icon: TrophyIcon,
      color: 'bg-purple-500',
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      name: 'Horas Semanales',
      value: cursos?.reduce((sum, curso) => sum + curso.horasSemanal, 0) || 0,
      icon: ClockIcon,
      color: 'bg-orange-500',
      change: '+15%',
      changeType: 'positive' as const,
    },
  ]

  const isLoading = loadingDocentes || loadingCursos

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-7 text-gray-900 tracking-tight">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Resumen general del sistema de gestión académica
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleExportarDatos}
              className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
            >
              Exportar Datos
            </button>
            <button
              type="button"
              onClick={handleGenerarReporte}
              className="inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
            >
              Generar Reporte
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatsCard {...stat} isLoading={isLoading} />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid - Stack en móvil, grid en desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Charts Section */}
        <motion.div
          className="xl:col-span-2 order-2 xl:order-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ChartsSection cursos={cursos} />
        </motion.div>

        {/* Sidebar Content - Aparece primero en móvil para mejor UX */}
        <motion.div
          className="space-y-4 sm:space-y-6 order-1 xl:order-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Quick Actions */}
          <QuickActions />
          
          {/* Recent Activity */}
          <RecentActivity />
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
