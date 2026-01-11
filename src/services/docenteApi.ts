import axios from 'axios';
import { Horario } from '../types/horario';

// En desarrollo usa proxy de Vite (/api), en producción usa VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

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

// Interfaces para Anuncios
export interface Anuncio {
  id: number;
  idDocente: number;
  nombreDocente: string;
  idCurso: number | null;
  nombreCurso: string | null;
  titulo: string;
  contenido: string;
  prioridad: string;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  fechaPublicacion: string | null;
  fechaExpiracion: string | null;
  activo: boolean;
}

export interface CrearAnuncio {
  idCurso?: number | null;
  titulo: string;
  contenido: string;
  prioridad: 'normal' | 'importante' | 'urgente';
  fechaPublicacion?: string | null;
  fechaExpiracion?: string | null;
  activo?: boolean;
}

export interface ActualizarAnuncio {
  idCurso?: number | null;
  titulo: string;
  contenido: string;
  prioridad: 'normal' | 'importante' | 'urgente';
  fechaPublicacion?: string | null;
  fechaExpiracion?: string | null;
  activo: boolean;
}

// Interfaces para Materiales
export interface MaterialCurso {
  id: number;
  idCurso: number;
  nombreCurso: string;
  idDocente: number;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  categoria: string | null;
  url: string | null;
  rutaArchivo: string | null;
  nombreArchivo: string | null;
  tipoArchivo: string | null;
  tamaño: number | null;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  fechaDisponibleDesde: string | null;
  fechaDisponibleHasta: string | null;
  activo: boolean;
  orden: number;
}

export interface CrearMaterial {
  nombre: string;
  descripcion?: string;
  tipo: 'archivo' | 'enlace' | 'video';
  categoria?: string;
  url?: string;
  rutaArchivo?: string;
  nombreArchivo?: string;
  tipoArchivo?: string;
  tamaño?: number;
  fechaDisponibleDesde?: string | null;
  fechaDisponibleHasta?: string | null;
  orden?: number;
  activo?: boolean;
}

export interface ActualizarMaterial {
  nombre: string;
  descripcion?: string;
  categoria?: string;
  url?: string;
  fechaDisponibleDesde?: string | null;
  fechaDisponibleHasta?: string | null;
  orden?: number;
  activo: boolean;
}

// API de Anuncios
export const docenteAnunciosApi = {
  getAnuncios: async (idCurso?: number): Promise<Anuncio[]> => {
    const params = idCurso ? { idCurso } : {};
    const response = await apiClient.get('/docentes/anuncios', { params });
    return response.data;
  },

  crearAnuncio: async (anuncio: CrearAnuncio): Promise<Anuncio> => {
    const response = await apiClient.post('/docentes/anuncios', anuncio);
    return response.data;
  },

  actualizarAnuncio: async (id: number, anuncio: ActualizarAnuncio): Promise<Anuncio> => {
    const response = await apiClient.put(`/docentes/anuncios/${id}`, anuncio);
    return response.data;
  },

  eliminarAnuncio: async (id: number): Promise<void> => {
    await apiClient.delete(`/docentes/anuncios/${id}`);
  },
};

// API de Materiales
export const docenteMaterialesApi = {
  getMateriales: async (idCurso: number): Promise<MaterialCurso[]> => {
    const response = await apiClient.get(`/docentes/cursos/${idCurso}/materiales`);
    return response.data;
  },

  crearMaterial: async (idCurso: number, material: CrearMaterial): Promise<MaterialCurso> => {
    const response = await apiClient.post(`/docentes/cursos/${idCurso}/materiales`, material);
    return response.data;
  },

  actualizarMaterial: async (id: number, material: ActualizarMaterial): Promise<MaterialCurso> => {
    const response = await apiClient.put(`/docentes/materiales/${id}`, material);
    return response.data;
  },

  eliminarMaterial: async (id: number): Promise<void> => {
    await apiClient.delete(`/docentes/materiales/${id}`);
  },
};

export default {
  auth: docenteAuthApi,
  cursos: docenteCursosApi,
  asistencia: docenteAsistenciaApi,
  tiposEvaluacion: docenteTiposEvaluacionApi,
  horarios: docenteHorariosApi,
  anuncios: docenteAnunciosApi,
  materiales: docenteMaterialesApi,
};
