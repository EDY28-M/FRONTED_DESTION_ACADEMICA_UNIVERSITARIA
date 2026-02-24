import axios from '../lib/axios';

export interface CrearCursosDirigidosRequest {
  idCurso: number;
  idsEstudiantes: number[];
  idPeriodo: number;
}

export interface CursoDirigidoResult {
  mensaje: string;
  exitosos: number;
  fallidos: number;
  detalles: {
    exitosos: Array<{
      idEstudiante: number;
      nombreEstudiante: string;
      curso: string;
      periodo: string;
      estado: string;
    }>;
    errores: Array<{
      idEstudiante: number;
      error: string;
    }>;
  };
}

export interface EstudianteAdmin {
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
  promedioAcumulado?: number;
  promedioSemestral?: number;
  creditosSemestreActual: number;
  cursosMatriculadosActual: number;
}

export interface EstudianteDetalle {
  datosPersonales: {
    id: number;
    codigo: string;
    nombres: string;
    apellidos: string;
    nombreCompleto: string;
    dni: string;
    email: string;
    cicloActual: number;
    carrera: string;
    estado: string;
    creditosAcumulados: number;
    promedioAcumulado?: number;
    promedioSemestral?: number;
    fechaIngreso: string;
    facultadNombre?: string;
    escuelaNombre?: string;
  };
  cursosActuales: Array<{
    idMatricula: number;
    idCurso: number;
    nombreCurso: string;
    ciclo: number;
    creditos: number;
    horasSemanal: number;
    docente: string;
    periodo: string;
    fechaMatricula: string;
    estado: string;
    isAutorizado: boolean;
    notas: Array<{
      tipoEvaluacion: string;
      notaValor: number;
      peso: number;
      fecha: string;
    }>;
    promedioFinal: number | null;
  }>;
  historialPorPeriodo: Array<{
    idPeriodo: number;
    nombrePeriodo: string;
    anio: number;
    ciclo: string;
    cicloAcademico: number;  // Ciclo académico secuencial (1, 2, 3, 4...)
    esActivo: boolean;
    totalCursos: number;
    cursosMatriculados: number;
    cursosRetirados: number;
    cursosAprobados: number;
    cursosDesaprobados: number;
    creditosMatriculados: number;
    promedioGeneral: number;
    cursos: Array<{
      idMatricula: number;
      idCurso: number;
      nombreCurso: string;
      ciclo: number;
      creditos: number;
      docente: string;
      estado: string;
      isAutorizado: boolean;
      fechaMatricula: string;
      fechaRetiro: string | null;
      promedioFinal: number | null;
      aprobado: boolean;
    }>;
  }>;
  estadisticas: {
    totalMatriculas: number;
    totalCursosActivos: number;
    totalCursosRetirados: number;
    totalCursosDirigidos: number;
    totalCursosAprobados: number;
    totalCursosDesaprobados: number;
    promedioGeneralHistorico: number;
    creditosAcumulados: number;
    promedioAcumulado?: number;
    promedioSemestral?: number;
    // Campos adicionales del backend
    totalCursosHistorico: number;
    cursosAprobadosHistorico: number;
    cursosDesaprobadosHistorico: number;
    creditosTotales: number;
    creditosAprobados: number;
    creditosPendientes: number;
    porcentajeAprobacion: number;
  };
}

export interface PeriodoAdmin {
  id: number;
  nombre: string;
  anio: number;
  ciclo: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  fechaCreacion: string;
  totalMatriculas: number;
}

export interface CrearPeriodoRequest {
  nombre: string;
  anio: number;
  ciclo: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface EditarPeriodoRequest {
  nombre: string;
  anio: number;
  ciclo: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface ValidacionCierrePeriodo {
  puedeSerCerrado: boolean;
  advertencias: string[];
  totalMatriculas: number;
  matriculasCompletas: number;
  matriculasIncompletas: number;
  estudiantesSinNotasCompletas: Array<{
    idEstudiante: number;
    nombreEstudiante: string;
    codigo: string;
    cursosPendientes: Array<{
      idCurso: number;
      nombreCurso: string;
      razon: string;
    }>;
  }>;
}

export interface ResultadoCierrePeriodo {
  mensaje: string;
  estadisticas: {
    totalMatriculas: number;
    aprobados: number;
    desaprobados: number;
    fechaCierre: string;
  };
}

export interface ActivarCursoPeriodoRequest {
  idCurso: number;
  idPeriodo: number;
  observaciones?: string;
}

export interface DesactivarCursoPeriodoRequest {
  idCurso: number;
  idPeriodo: number;
}

export interface CursoActivacionPeriodo {
  id: number;
  idCurso: number;
  nombreCurso: string;
  codigoCurso?: string;
  idPeriodo: number;
  nombrePeriodo: string;
  activo: boolean;
  fechaActivacion: string;
  idUsuarioActivador?: number;
  nombreUsuarioActivador?: string;
  observaciones?: string;
}

export const adminCursosApi = {
  // Obtener todos los estudiantes (admin)
  getTodosEstudiantes: async (): Promise<EstudianteAdmin[]> => {
    const response = await axios.get('/admin/estudiantes');
    return response.data;
  },

  // Obtener detalle completo de un estudiante
  getEstudianteDetalle: async (id: number): Promise<EstudianteDetalle> => {
    const response = await axios.get(`/admin/estudiantes/${id}/detalle`);
    return response.data;
  },

  // Crear cursos dirigidos (autorizados por el administrador)
  crearCursosDirigidos: async (data: CrearCursosDirigidosRequest): Promise<CursoDirigidoResult> => {
    const response = await axios.post('/admin/cursos-dirigidos', data);
    return response.data;
  },

  // === GESTIÓN DE PERÍODOS ===

  // Obtener todos los períodos
  getPeriodos: async (): Promise<PeriodoAdmin[]> => {
    const response = await axios.get('/admin/periodos');
    return response.data;
  },

  // Crear nuevo período
  crearPeriodo: async (data: CrearPeriodoRequest): Promise<{ mensaje: string; periodo: PeriodoAdmin }> => {
    const response = await axios.post('/admin/periodos', data);
    return response.data;
  },

  // Editar período existente
  editarPeriodo: async (id: number, data: EditarPeriodoRequest): Promise<{ mensaje: string; periodo: PeriodoAdmin }> => {
    const response = await axios.put(`/admin/periodos/${id}`, data);
    return response.data;
  },

  // Activar un período (desactiva los demás)
  activarPeriodo: async (id: number): Promise<{ mensaje: string; periodo: { id: number; nombre: string; activo: boolean } }> => {
    const response = await axios.put(`/admin/periodos/${id}/activar`);
    return response.data;
  },

  // Eliminar período (solo si no tiene matrículas)
  eliminarPeriodo: async (id: number): Promise<{ mensaje: string }> => {
    const response = await axios.delete(`/admin/periodos/${id}`);
    return response.data;
  },

  // Validar si el período puede ser cerrado
  validarCierrePeriodo: async (id: number): Promise<ValidacionCierrePeriodo> => {
    const response = await axios.get(`/admin/periodos/${id}/validar-cierre`);
    return response.data;
  },

  // Cerrar período académico (calcular notas finales)
  cerrarPeriodo: async (id: number): Promise<ResultadoCierrePeriodo> => {
    const response = await axios.post(`/admin/periodos/${id}/cerrar`);
    return response.data;
  },

  // Abrir nuevo período académico (avanzar ciclos)
  abrirPeriodo: async (id: number): Promise<{ mensaje: string; periodoActivo: any; resumenCiclos: any[]; fechaApertura: string }> => {
    const response = await axios.post(`/admin/periodos/${id}/abrir`);
    return response.data;
  },

  // === ACTIVACIÓN DE CURSOS POR PERÍODO ===

  // Activar un curso para un período específico
  activarCursoPeriodo: async (data: ActivarCursoPeriodoRequest): Promise<{ mensaje: string; activacion: CursoActivacionPeriodo }> => {
    const response = await axios.post('/admin/cursos/activar', data);
    return response.data;
  },

  // Desactivar un curso para un período específico
  desactivarCursoPeriodo: async (data: DesactivarCursoPeriodoRequest): Promise<{ mensaje: string }> => {
    const response = await axios.post('/admin/cursos/desactivar', data);
    return response.data;
  },

  // Obtener cursos activados (con filtros opcionales)
  getCursosActivados: async (idPeriodo?: number, idCurso?: number): Promise<CursoActivacionPeriodo[]> => {
    const params = new URLSearchParams();
    if (idPeriodo) params.append('idPeriodo', idPeriodo.toString());
    if (idCurso) params.append('idCurso', idCurso.toString());

    const queryString = params.toString();
    const url = `/admin/cursos/activados${queryString ? `?${queryString}` : ''}`;
    const response = await axios.get(url);
    return response.data;
  },

  // Obtener cursos activados para un período específico
  getCursosActivadosPeriodo: async (idPeriodo: number): Promise<CursoActivacionPeriodo[]> => {
    const response = await axios.get(`/admin/periodos/${idPeriodo}/cursos-activados`);
    return response.data;
  },
};
