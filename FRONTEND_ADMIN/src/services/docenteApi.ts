import axios from 'axios';
import { Horario } from '../types/horario';

const API_URL = 'http://localhost:5251/api';

// Interfaces que coinciden con los DTOs del backend
export interface LoginDocenteDto {
  correo: string;
  password: string;
}

export interface AuthDocenteResponse {
  id: number;
  nombreCompleto: string;
  correo: string;
  token: string;
  refreshToken: string;
  expiracion: string;
}

export interface CursoDocente {
  id: number;
  nombreCurso: string;
  creditos: number;
  horasSemanal: number;
  ciclo: number;
  totalEstudiantes: number;
  promedioGeneral: number;
  porcentajeAsistenciaPromedio: number;
  periodoActualId: number;
  periodoNombre: string;
}

export interface NotasDetalle {
  parcial1?: number;
  parcial2?: number;
  practicas?: number;
  medioCurso?: number;
  examenFinal?: number;
  actitud?: number;
  trabajos?: number;
  promedioCalculado?: number;
  promedioFinal?: number;
}

export interface EstudianteCurso {
  id: number;
  idEstudiante: number;
  nombreCompleto: string;
  codigo: string;
  correo?: string;
  idMatricula: number;
  estadoMatricula: string;
  promedioFinal?: number;
  porcentajeAsistencia?: number;
  notas?: NotasDetalle;
}

export interface RegistrarNotasDto {
  idMatricula: number;
  parcial1?: number;
  parcial2?: number;
  practicas?: number;
  medioCurso?: number;
  examenFinal?: number;
  actitud?: number;
  trabajos?: number;
  observaciones?: string;
}

// Export alias for backwards compatibility
export type RegistrarNotasRequest = RegistrarNotasDto;

export interface AsistenciaEstudiante {
  idEstudiante: number;
  presente: boolean;
  observaciones?: string;
}

export interface RegistrarAsistenciasMasivasDto {
  idCurso: number;
  fecha: string;
  tipoClase: string; // "Teoría" o "Práctica"
  estudiantes: AsistenciaEstudiante[];
}

export interface Asistencia {
  id: number;
  idEstudiante: number;
  nombreEstudiante: string;
  idCurso: number;
  nombreCurso: string;
  fecha: string;
  presente: boolean;
  observaciones?: string;
  fechaRegistro: string;
}

export interface ResumenAsistencia {
  idEstudiante: number;
  nombreEstudiante: string;
  idCurso: number;
  nombreCurso: string;
  totalAsistencias: number;
  asistenciasPresente: number;
  asistenciasFalta: number;
  porcentajeAsistencia: number;
  asistencias: Asistencia[];
}

// Respuesta cuando no hay estudiantes o hay mensaje informativo
export interface EstudiantesResponse {
  estudiantes: EstudianteCurso[];
  mensaje?: string;
  hayPeriodoActivo?: boolean;
  periodoActivo?: string;
  totalMatriculasOtrosPeriodos?: number;
}

// Tipos de Evaluación
export interface TipoEvaluacion {
  id: number;
  nombre: string;
  peso: number;
  orden: number;
  activo: boolean;
}

export interface CrearTipoEvaluacion {
  nombre: string;
  peso: number;
  orden: number;
}

export interface ActualizarTipoEvaluacion {
  id: number;
  nombre: string;
  peso: number;
  orden: number;
  activo: boolean;
}

export interface ConfigurarTiposEvaluacionDto {
  tiposEvaluacion: ActualizarTipoEvaluacion[];
}

// Crear instancia de axios con configuración base
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para agregar el token en cada petición
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('docenteToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor para manejar errores de autenticación
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expirado o inválido, limpiar localStorage y redirigir al login de docentes
        localStorage.removeItem('docenteToken');
        localStorage.removeItem('docenteData');
        window.location.href = '/docente/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const apiClient = createAxiosInstance();

// API de autenticación
export const docenteAuthApi = {
  login: async (credentials: LoginDocenteDto): Promise<AuthDocenteResponse> => {
    const response = await axios.post(`${API_URL}/auth/docente/login`, credentials);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('docenteToken');
    localStorage.removeItem('docenteData');
  },

  getCurrentDocente: (): AuthDocenteResponse | null => {
    const data = localStorage.getItem('docenteData');
    return data ? JSON.parse(data) : null;
  },

  saveAuthData: (authData: AuthDocenteResponse) => {
    localStorage.setItem('docenteToken', authData.token);
    localStorage.setItem('docenteData', JSON.stringify(authData));
  },
};

// API de cursos del docente
export const docenteCursosApi = {
  getMisCursos: async (): Promise<CursoDocente[]> => {
    const response = await apiClient.get('/docentes/mis-cursos');
    return response.data;
  },

  getEstudiantesCurso: async (idCurso: number): Promise<EstudianteCurso[] | EstudiantesResponse> => {
    const response = await apiClient.get(`/docentes/cursos/${idCurso}/estudiantes`);
    return response.data;
  },

  registrarNotas: async (idCurso: number, notas: RegistrarNotasDto) => {
    const response = await apiClient.post(`/docentes/cursos/${idCurso}/notas`, notas);
    return response.data;
  },

  getTiposEvaluacion: async (idCurso: number): Promise<TipoEvaluacion[]> => {
    const response = await apiClient.get(`/docentes/cursos/${idCurso}/tipos-evaluacion`);
    return response.data;
  },
};

// API de asistencia
export const docenteAsistenciaApi = {
  registrarAsistencias: async (asistencias: RegistrarAsistenciasMasivasDto) => {
    const response = await apiClient.post('/docentes/asistencia', asistencias);
    return response.data;
  },

  getAsistenciasCurso: async (idCurso: number, fecha?: string, tipoClase?: string): Promise<Asistencia[]> => {
    const params: any = {};
    if (fecha) params.fecha = fecha;
    if (tipoClase) params.tipoClase = tipoClase;
    const response = await apiClient.get(`/docentes/cursos/${idCurso}/asistencia`, { params });
    return response.data;
  },

  getResumenAsistencia: async (idCurso: number): Promise<ResumenAsistencia[]> => {
    const response = await apiClient.get(`/docentes/cursos/${idCurso}/asistencia/resumen`);
    return response.data;
  },

  eliminarAsistencia: async (idAsistencia: number): Promise<void> => {
    const response = await apiClient.delete(`/asistencias/${idAsistencia}`);
    return response.data;
  },

  actualizarAsistencia: async (idAsistencia: number, datos: { fecha: string; tipoClase: string; presente: boolean; observaciones?: string }): Promise<void> => {
    const response = await apiClient.put(`/asistencias/${idAsistencia}`, datos);
    return response.data;
  },
};

// API para gestión de tipos de evaluación
export const docenteTiposEvaluacionApi = {
  getTiposEvaluacion: async (idCurso: number): Promise<TipoEvaluacion[]> => {
    const response = await apiClient.get(`/docentes/cursos/${idCurso}/tipos-evaluacion`);
    return response.data;
  },

  configurarTiposEvaluacion: async (idCurso: number, config: ConfigurarTiposEvaluacionDto): Promise<void> => {
    const response = await apiClient.post(`/docentes/cursos/${idCurso}/tipos-evaluacion`, config);
    return response.data;
  },
};

// API de horarios del docente
export const docenteHorariosApi = {
  getMiHorario: async (): Promise<Horario[]> => {
    const response = await apiClient.get('/horarios/mi-horario');
    return response.data;
  },
};

export default {
  auth: docenteAuthApi,
  cursos: docenteCursosApi,
  asistencia: docenteAsistenciaApi,
  tiposEvaluacion: docenteTiposEvaluacionApi,
  horarios: docenteHorariosApi,
};
