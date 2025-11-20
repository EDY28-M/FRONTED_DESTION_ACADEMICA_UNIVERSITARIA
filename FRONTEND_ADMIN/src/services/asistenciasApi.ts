import axios from '../lib/axios';

// ============================================
// INTERFACES (DTOs del Frontend)
// ============================================

export interface Asistencia {
  id: number;
  idEstudiante: number;
  nombreEstudiante: string;
  codigoEstudiante?: string;
  idCurso: number;
  nombreCurso: string;
  fecha: string;
  presente: boolean;
  tipoClase: string; // "Teoría" o "Práctica"
  observaciones?: string;
  fechaRegistro: string;
}

export interface RegistrarAsistenciaRequest {
  idEstudiante: number;
  idCurso: number;
  fecha: string;
  presente: boolean;
  tipoClase: string; // "Teoría" o "Práctica"
  observaciones?: string;
}

export interface RegistrarAsistenciasMasivasRequest {
  idCurso: number;
  fecha: string;
  tipoClase: string; // "Teoría" o "Práctica"
  asistencias: AsistenciaEstudiante[];
}

export interface AsistenciaEstudiante {
  idEstudiante: number;
  presente: boolean;
  observaciones?: string;
}

export interface ActualizarAsistenciaRequest {
  presente: boolean;
  tipoClase?: string; // "Teoría" o "Práctica"
  observaciones?: string;
}

export interface AsistenciaDetalle {
  id: number;
  fecha: string;
  presente: boolean;
  tipoClase: string; // "Teoría" o "Práctica"
  observaciones?: string;
}

export interface AsistenciasPorCurso {
  idCurso: number;
  codigoCurso: string;
  nombreCurso: string;
  creditos: number;
  nombreDocente?: string;
  totalClases: number;
  totalAsistencias: number;
  totalFaltas: number;
  porcentajeAsistencia: number;
  alertaBajaAsistencia: boolean;
  asistencias: AsistenciaDetalle[];
}

export interface ResumenAsistenciaEstudiante {
  idEstudiante: number;
  nombreEstudiante: string;
  codigoEstudiante: string;
  idCurso: number;
  nombreCurso: string;
  totalClases: number;
  totalAsistencias: number;
  totalFaltas: number;
  porcentajeAsistencia: number;
  detalles: AsistenciaDetalle[];
}

export interface ResumenAsistenciaCurso {
  idCurso: number;
  nombreCurso: string;
  totalEstudiantes: number;
  totalClases: number;
  porcentajeAsistenciaPromedio: number;
  estudiantes: ResumenAsistenciaEstudianteSimple[];
}

export interface ResumenAsistenciaEstudianteSimple {
  idEstudiante: number;
  nombreCompleto: string;
  codigo: string;
  totalClases: number;
  totalAsistencias: number;
  totalFaltas: number;
  porcentajeAsistencia: number;
}

export interface EstadisticasAsistenciaEstudiante {
  totalCursos: number;
  totalClases: number;
  totalAsistencias: number;
  totalFaltas: number;
  porcentajeAsistenciaGeneral: number;
  cursosConAlerta: number;
  cursosPorAsistencia: AsistenciasPorCurso[];
}

export interface TendenciaAsistencia {
  mes: string;
  anio: number;
  numeroMes: number;
  totalClases: number;
  totalAsistencias: number;
  porcentajeAsistencia: number;
}

export interface HistorialAsistencias {
  asistencias: Asistencia[];
  totalRegistros: number;
  totalAsistencias: number;
  totalFaltas: number;
  porcentajeAsistencia: number;
}

export interface ReporteAsistencia {
  nombreCurso: string;
  nombreDocente?: string;
  fechaGeneracion: string;
  fechaInicio?: string;
  fechaFin?: string;
  totalEstudiantes: number;
  totalClases: number;
  porcentajeAsistenciaPromedio: number;
  estudiantes: ReporteAsistenciaEstudiante[];
  fechas: ReporteFechaClase[];
}

export interface ReporteAsistenciaEstudiante {
  codigo: string;
  nombreCompleto: string;
  totalAsistencias: number;
  totalFaltas: number;
  porcentajeAsistencia: number;
  asistenciasPorFecha: Record<string, boolean>;
}

export interface ReporteFechaClase {
  fecha: string;
  totalPresentes: number;
  totalAusentes: number;
  porcentajeAsistencia: number;
}

// ============================================
// API SERVICE
// ============================================

export const asistenciasApi = {
  // ============================================
  // MÉTODOS PARA DOCENTES
  // ============================================

  /**
   * Registra una asistencia individual para un estudiante
   */
  registrarAsistencia: async (data: RegistrarAsistenciaRequest): Promise<Asistencia> => {
    const response = await axios.post('/asistencias/registrar', data);
    return response.data;
  },

  /**
   * Registra asistencias masivas para un curso en una fecha
   */
  registrarAsistenciasMasivas: async (
    data: RegistrarAsistenciasMasivasRequest
  ): Promise<{ mensaje: string; asistencias: Asistencia[] }> => {
    const response = await axios.post('/asistencias/registrar-masivas', data);
    return response.data;
  },

  /**
   * Actualiza una asistencia existente
   */
  actualizarAsistencia: async (
    id: number,
    data: ActualizarAsistenciaRequest
  ): Promise<Asistencia> => {
    const response = await axios.put(`/asistencias/${id}`, data);
    return response.data;
  },

  /**
   * Elimina una asistencia
   */
  eliminarAsistencia: async (id: number): Promise<{ mensaje: string }> => {
    const response = await axios.delete(`/asistencias/${id}`);
    return response.data;
  },

  /**
   * Obtiene el resumen de asistencias de un curso
   */
  getResumenAsistenciaCurso: async (
    idCurso: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<ResumenAsistenciaCurso> => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    
    const response = await axios.get(
      `/asistencias/curso/${idCurso}/resumen${params.toString() ? `?${params}` : ''}`
    );
    return response.data;
  },

  /**
   * Obtiene asistencias de un curso en una fecha específica
   */
  getAsistenciasPorCursoYFecha: async (
    idCurso: number,
    fecha: string
  ): Promise<Asistencia[]> => {
    const response = await axios.get(`/asistencias/curso/${idCurso}/fecha/${fecha}`);
    return response.data;
  },

  /**
   * Genera reporte de asistencias de un curso
   */
  generarReporteAsistencia: async (
    idCurso: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<ReporteAsistencia> => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    
    const response = await axios.get(
      `/asistencias/curso/${idCurso}/reporte${params.toString() ? `?${params}` : ''}`
    );
    return response.data;
  },

  /**
   * Obtiene historial de asistencias con filtros
   */
  getHistorialAsistencias: async (filtros?: {
    idEstudiante?: number;
    idCurso?: number;
    fechaInicio?: string;
    fechaFin?: string;
    presente?: boolean;
    idPeriodo?: number;
  }): Promise<HistorialAsistencias> => {
    const params = new URLSearchParams();
    if (filtros?.idEstudiante) params.append('idEstudiante', filtros.idEstudiante.toString());
    if (filtros?.idCurso) params.append('idCurso', filtros.idCurso.toString());
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros?.presente !== undefined) params.append('presente', filtros.presente.toString());
    if (filtros?.idPeriodo) params.append('idPeriodo', filtros.idPeriodo.toString());
    
    const response = await axios.get(`/asistencias/historial?${params}`);
    return response.data;
  },

  // ============================================
  // MÉTODOS PARA ESTUDIANTES
  // ============================================

  /**
   * Obtiene todas las asistencias del estudiante autenticado agrupadas por curso
   */
  getMisAsistencias: async (idPeriodo?: number): Promise<AsistenciasPorCurso[]> => {
    const params = idPeriodo ? `?idPeriodo=${idPeriodo}` : '';
    const response = await axios.get(`/asistencias/mis-asistencias${params}`);
    return response.data;
  },

  /**
   * Obtiene asistencias de un estudiante específico
   */
  getAsistenciasEstudiante: async (
    idEstudiante: number,
    idPeriodo?: number
  ): Promise<AsistenciasPorCurso[]> => {
    const params = idPeriodo ? `?idPeriodo=${idPeriodo}` : '';
    const response = await axios.get(`/asistencias/estudiante/${idEstudiante}${params}`);
    return response.data;
  },

  /**
   * Obtiene resumen de asistencias de un estudiante en un curso
   */
  getResumenAsistenciaEstudianteCurso: async (
    idEstudiante: number,
    idCurso: number
  ): Promise<ResumenAsistenciaEstudiante> => {
    const response = await axios.get(`/asistencias/estudiante/${idEstudiante}/curso/${idCurso}`);
    return response.data;
  },

  /**
   * Obtiene estadísticas completas de asistencia de un estudiante
   */
  getEstadisticasAsistenciaEstudiante: async (
    idEstudiante: number,
    idPeriodo?: number
  ): Promise<EstadisticasAsistenciaEstudiante> => {
    const params = idPeriodo ? `?idPeriodo=${idPeriodo}` : '';
    const response = await axios.get(
      `/asistencias/estudiante/${idEstudiante}/estadisticas${params}`
    );
    return response.data;
  },

  /**
   * Obtiene tendencia de asistencia por mes
   */
  getTendenciaAsistenciaEstudiante: async (
    idEstudiante: number,
    meses: number = 6
  ): Promise<TendenciaAsistencia[]> => {
    const response = await axios.get(
      `/asistencias/estudiante/${idEstudiante}/tendencia?meses=${meses}`
    );
    return response.data;
  },

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  /**
   * Verifica si existe una asistencia registrada
   */
  existeAsistencia: async (
    idEstudiante: number,
    idCurso: number,
    fecha: string
  ): Promise<{ existe: boolean }> => {
    const response = await axios.get('/asistencias/existe', {
      params: { idEstudiante, idCurso, fecha }
    });
    return response.data;
  },

  /**
   * Calcula el porcentaje de asistencia
   */
  calcularPorcentajeAsistencia: async (
    idEstudiante: number,
    idCurso: number
  ): Promise<{ porcentaje: number }> => {
    const response = await axios.get('/asistencias/porcentaje', {
      params: { idEstudiante, idCurso }
    });
    return response.data;
  },
};
