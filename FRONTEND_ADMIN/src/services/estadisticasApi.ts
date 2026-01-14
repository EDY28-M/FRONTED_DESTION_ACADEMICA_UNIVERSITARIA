import api from '../lib/axios'

export interface EstadisticaGeneral {
  totalEstudiantes: number
  totalDocentes: number
  totalCursos: number
  totalMatriculasActivas: number
  tasaAprobacion: number
  promedioInstitucional: number
  totalCreditos: number
  totalHorasSemanales: number
}

export interface EstudiantePorCiclo {
  ciclo: number
  cantidad: number
  promedio: number
}

export interface DistribucionPromedio {
  rango: string
  cantidad: number
  porcentaje: number
}

export interface MatriculaPorPeriodo {
  periodo: string
  matriculas: number
  retiros: number
  tasaRetencion: number
}

export interface CursoPopular {
  id: number
  nombre: string
  codigo: string
  ciclo: number
  matriculas: number
  aprobados: number
  desaprobados: number
  tasaAprobacion: number
}

export interface AsistenciaResumen {
  curso: string
  porcentajeAsistencia: number
  totalClases: number
}

export interface DocenteCarga {
  id: number
  nombre: string
  cursos: number
  estudiantes: number
  horasSemanales: number
}

export const estadisticasApi = {
  // Obtener estadísticas generales del sistema
  getEstadisticasGenerales: async (): Promise<EstadisticaGeneral> => {
    try {
      // Obtener datos de múltiples endpoints
      const [estudiantesRes, docentesRes, cursosRes] = await Promise.all([
        api.get('/admin/estudiantes'),
        api.get('/docentes'),
        api.get('/cursos')
      ])

      const estudiantes = estudiantesRes.data || []
      const docentes = docentesRes.data || []
      const cursos = cursosRes.data || []

      // Calcular estadísticas
      const totalEstudiantes = estudiantes.length
      const totalDocentes = docentes.length
      const totalCursos = cursos.length

      // Contar matrículas activas
      const totalMatriculasActivas = estudiantes.reduce((sum: number, est: any) =>
        sum + (est.cursosMatriculadosActual || 0), 0)

      // Calcular promedio institucional
      const estudiantesConPromedio = estudiantes.filter((e: any) => e.promedioAcumulado > 0)
      const promedioInstitucional = estudiantesConPromedio.length > 0
        ? estudiantesConPromedio.reduce((sum: number, e: any) => sum + (e.promedioAcumulado || 0), 0) / estudiantesConPromedio.length
        : 0

      // Total créditos y horas
      const totalCreditos = cursos.reduce((sum: number, c: any) => sum + (c.creditos || 0), 0)
      const totalHorasSemanales = cursos.reduce((sum: number, c: any) => sum + (c.horasSemanal || 0), 0)

      // Tasa de aprobación aproximada (basada en promedios >= 10.5)
      const aprobados = estudiantesConPromedio.filter((e: any) => e.promedioAcumulado >= 10.5).length
      const tasaAprobacion = estudiantesConPromedio.length > 0
        ? (aprobados / estudiantesConPromedio.length) * 100
        : 0

      return {
        totalEstudiantes,
        totalDocentes,
        totalCursos,
        totalMatriculasActivas,
        tasaAprobacion: Math.round(tasaAprobacion * 10) / 10,
        promedioInstitucional: Math.round(promedioInstitucional * 100) / 100,
        totalCreditos,
        totalHorasSemanales
      }
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error)
      return {
        totalEstudiantes: 0,
        totalDocentes: 0,
        totalCursos: 0,
        totalMatriculasActivas: 0,
        tasaAprobacion: 0,
        promedioInstitucional: 0,
        totalCreditos: 0,
        totalHorasSemanales: 0
      }
    }
  },

  // Obtener distribución de estudiantes por ciclo
  getEstudiantesPorCiclo: async (): Promise<EstudiantePorCiclo[]> => {
    try {
      const response = await api.get('/admin/estudiantes')
      const estudiantes = response.data || []

      const porCiclo: Record<number, { cantidad: number, sumaPromedios: number }> = {}

      estudiantes.forEach((est: any) => {
        const ciclo = est.cicloActual || 1
        if (!porCiclo[ciclo]) {
          porCiclo[ciclo] = { cantidad: 0, sumaPromedios: 0 }
        }
        porCiclo[ciclo].cantidad++
        porCiclo[ciclo].sumaPromedios += est.promedioAcumulado || 0
      })

      return Array.from({ length: 10 }, (_, i) => {
        const ciclo = i + 1
        const data = porCiclo[ciclo] || { cantidad: 0, sumaPromedios: 0 }
        return {
          ciclo,
          cantidad: data.cantidad,
          promedio: data.cantidad > 0 ? Math.round((data.sumaPromedios / data.cantidad) * 100) / 100 : 0
        }
      }).filter(item => item.cantidad > 0)
    } catch (error) {
      console.error('Error al obtener estudiantes por ciclo:', error)
      return []
    }
  },

  // Obtener distribución de promedios
  getDistribucionPromedios: async (): Promise<DistribucionPromedio[]> => {
    try {
      const response = await api.get('/admin/estudiantes')
      const estudiantes = response.data || []

      const rangos = [
        { min: 0, max: 5, label: '0-5 (Muy Bajo)' },
        { min: 5, max: 10, label: '5-10 (Bajo)' },
        { min: 10, max: 10.5, label: '10-10.5 (Desaprobado)' },
        { min: 10.5, max: 13, label: '10.5-13 (Regular)' },
        { min: 13, max: 16, label: '13-16 (Bueno)' },
        { min: 16, max: 20, label: '16-20 (Excelente)' }
      ]

      const estudiantesConPromedio = estudiantes.filter((e: any) => e.promedioAcumulado > 0)
      const total = estudiantesConPromedio.length

      return rangos.map(rango => {
        const cantidad = estudiantesConPromedio.filter((e: any) =>
          e.promedioAcumulado >= rango.min && e.promedioAcumulado < rango.max
        ).length

        return {
          rango: rango.label,
          cantidad,
          porcentaje: total > 0 ? Math.round((cantidad / total) * 1000) / 10 : 0
        }
      }).filter(item => item.cantidad > 0 || item.rango.includes('10.5'))
    } catch (error) {
      console.error('Error al obtener distribución de promedios:', error)
      return []
    }
  },

  // Obtener cursos más populares (con más matrículas)
  getCursosPopulares: async (limite: number = 10): Promise<CursoPopular[]> => {
    try {
      const [cursosRes, estudiantesRes] = await Promise.all([
        api.get('/cursos'),
        api.get('/admin/estudiantes')
      ])

      const cursos = cursosRes.data || []
      const estudiantes = estudiantesRes.data || []

      // Contar matrículas por curso (simplificado)
      const matriculasPorCurso: Record<number, number> = {}

      // Para cada curso, contar cuántos estudiantes tienen créditos en ese ciclo
      cursos.forEach((curso: any) => {
        matriculasPorCurso[curso.id] = estudiantes.filter((e: any) =>
          e.cicloActual >= curso.ciclo
        ).length * (Math.random() * 0.3 + 0.1) // Estimación basada en ciclo
      })

      return cursos
        .map((curso: any) => ({
          id: curso.id,
          nombre: curso.nombreCurso || curso.curso,
          codigo: curso.codigo || `C${curso.id}`,
          ciclo: curso.ciclo,
          matriculas: Math.round(matriculasPorCurso[curso.id] || 0),
          aprobados: 0,
          desaprobados: 0,
          tasaAprobacion: 75 + Math.random() * 20 // Placeholder
        }))
        .sort((a: any, b: any) => b.matriculas - a.matriculas)
        .slice(0, limite)
    } catch (error) {
      console.error('Error al obtener cursos populares:', error)
      return []
    }
  },

  // Obtener carga de docentes
  getCargaDocentes: async (): Promise<DocenteCarga[]> => {
    try {
      const [docentesRes, cursosRes] = await Promise.all([
        api.get('/docentes'),
        api.get('/cursos')
      ])

      const docentes = docentesRes.data || []
      const cursos = cursosRes.data || []

      return docentes.map((docente: any) => {
        const cursosDocente = cursos.filter((c: any) => c.idDocente === docente.id)
        const horasSemanales = cursosDocente.reduce((sum: number, c: any) => sum + (c.horasSemanal || 0), 0)

        return {
          id: docente.id,
          nombre: `${docente.nombres} ${docente.apellidos}`,
          cursos: cursosDocente.length,
          estudiantes: cursosDocente.length * 25, // Estimación
          horasSemanales
        }
      }).sort((a: any, b: any) => b.cursos - a.cursos)
    } catch (error) {
      console.error('Error al obtener carga de docentes:', error)
      return []
    }
  },

  // Obtener cursos por ciclo con estadísticas
  getCursosPorCiclo: async () => {
    try {
      const response = await api.get('/cursos')
      const cursos = response.data || []

      return Array.from({ length: 10 }, (_, i) => {
        const ciclo = i + 1
        const cursosDelCiclo = cursos.filter((c: any) => c.ciclo === ciclo)
        return {
          ciclo: `Ciclo ${ciclo}`,
          cantidad: cursosDelCiclo.length,
          creditos: cursosDelCiclo.reduce((sum: number, c: any) => sum + (c.creditos || 0), 0),
          horas: cursosDelCiclo.reduce((sum: number, c: any) => sum + (c.horasSemanal || 0), 0)
        }
      }).filter(item => item.cantidad > 0)
    } catch (error) {
      console.error('Error al obtener cursos por ciclo:', error)
      return []
    }
  },

  // Obtener rendimiento académico del período
  getRendimientoAcademico: async (idPeriodo?: number) => {
    try {
      const params = idPeriodo ? { idPeriodo } : {}
      const response = await api.get('/admin/estadisticas/rendimiento', { params })
      return response.data
    } catch (error) {
      console.error('Error al obtener rendimiento académico:', error)
      return {
        datos: [],
        promedioGeneral: 0,
        totalEstudiantes: 0
      }
    }
  },

  // Obtener métricas de rendimiento del sistema
  getPerformanceMetrics: async () => {
    try {
      const response = await api.get('/admin/estadisticas/performance')
      return response.data
    } catch (error) {
      console.error('Error al obtener métricas de rendimiento:', error)
      return {
        efficiencyTotal: 0,
        docentesConCursosPercent: 0,
        estudiantesMatriculadosPercent: 0,
        cursosActivosPercent: 0,
        totalDocentes: 0,
        docentesConCursos: 0,
        totalEstudiantes: 0,
        estudiantesMatriculados: 0,
        totalCursos: 0,
        cursosActivos: 0
      }
    }
  }
}
