import axios from '../lib/axios';
import { 
  Estudiante, 
  CursoDisponible, 
  Matricula, 
  NotaDetalle, 
  Periodo, 
  MatricularRequest,
  RegistroNotas,
  SemestreRegistro
} from '../types/estudiante';
import { Horario } from '../types/horario';

export const estudiantesApi = {
  // Obtener perfil del estudiante autenticado
  getPerfil: async (): Promise<Estudiante> => {
    const response = await axios.get('/estudiantes/perfil');
    return response.data;
  },

  // Obtener cursos disponibles para matricular
  getCursosDisponibles: async (idPeriodo?: number): Promise<CursoDisponible[]> => {
    const params = idPeriodo ? { idPeriodo } : {};
    const response = await axios.get('/estudiantes/cursos-disponibles', { params });
    return response.data;
  },

  // Obtener cursos matriculados
  getMisCursos: async (idPeriodo?: number): Promise<Matricula[]> => {
    const params = idPeriodo ? { idPeriodo } : {};
    const response = await axios.get('/estudiantes/mis-cursos', { params });
    return response.data;
  },

  // Obtener horario del estudiante
  getMiHorario: async (): Promise<Horario[]> => {
    const response = await axios.get('/horarios/mi-horario');
    return response.data;
  },

  // Matricular en un curso
  matricular: async (data: MatricularRequest): Promise<Matricula> => {
    const response = await axios.post('/estudiantes/matricular', data);
    return response.data;
  },

  // Retirarse de un curso
  retirar: async (idMatricula: number): Promise<void> => {
    await axios.delete(`/estudiantes/retirar/${idMatricula}`);
  },

  // Obtener notas
  getNotas: async (idPeriodo?: number): Promise<{
    notas: NotaDetalle[];
    promedioGeneral: number;
    promedioPonderado?: number;
    creditosAcumulados: number;
  }> => {
    const params = idPeriodo ? { idPeriodo } : {};
    const response = await axios.get('/estudiantes/notas', { params });
    return response.data;
  },

  // Obtener todos los periodos
  getPeriodos: async (): Promise<Periodo[]> => {
    const response = await axios.get('/estudiantes/periodos');
    return response.data;
  },

  // Obtener periodo activo
  getPeriodoActivo: async (): Promise<Periodo> => {
    const response = await axios.get('/estudiantes/periodo-activo');
    return response.data;
  },

  // ==== ENDPOINTS ADMIN ====
  // Crear nuevo estudiante (solo admin)
  crearEstudiante: async (data: {
    email: string;
    password: string;
    nombres: string;
    apellidos: string;
    numeroDocumento: string;
    ciclo: number;
  }): Promise<{
    mensaje: string;
    estudiante: {
      id: number;
      codigo: string;
      email: string;
      nombres: string;
      apellidos: string;
      ciclo: number;
    };
  }> => {
    const response = await axios.post('/admin/estudiantes', data);
    return response.data;
  },

  // Eliminar estudiante (solo admin)
  eliminarEstudiante: async (id: number): Promise<{
    mensaje: string;
    eliminado: {
      id: number;
      codigo: string;
      nombreCompleto: string;
      email: string;
      matriculasEliminadas: number;
      notasEliminadas: number;
      asistenciasEliminadas: number;
    };
  }> => {
    const response = await axios.delete(`/admin/estudiantes/${id}`);
    return response.data;
  },

  // Obtener registro de notas (historial completo de semestres cerrados)
  getRegistroNotas: async (): Promise<RegistroNotas> => {
    const response = await axios.get('/estudiantes/registro-notas');
    return response.data;
  },

  // Obtener registro de notas de un periodo específico
  getRegistroNotasPorPeriodo: async (idPeriodo: number): Promise<SemestreRegistro> => {
    const response = await axios.get(`/estudiantes/registro-notas/${idPeriodo}`);
    return response.data;
  },

  // Verificar prerequisitos de un curso
  verificarPrerequisitos: async (idCurso: number): Promise<{
    cumplePrerequisitos: boolean;
    mensaje: string;
    prerequisitosFaltantes: Array<{
      id: number;
      codigo?: string;
      nombre: string;
      ciclo: number;
    }>;
  }> => {
    const response = await axios.get(`/estudiantes/verificar-prerequisitos/${idCurso}`);
    return response.data;
  },

  // Obtener orden de mérito
  getOrdenMerito: async (promocion?: string): Promise<OrdenMerito[]> => {
    const params = promocion ? { promocion } : {};
    const response = await axios.get('/estudiantes/orden-merito', { params });
    return response.data;
  },

  // Obtener promociones disponibles
  getPromociones: async (): Promise<string[]> => {
    const response = await axios.get('/estudiantes/promociones');
    return response.data;
  },

  // Obtener mi posición en el orden de mérito
  getMiPosicionMerito: async (): Promise<OrdenMerito> => {
    const response = await axios.get('/estudiantes/mi-posicion-merito');
    return response.data;
  },

  // Cambiar contraseña del estudiante
  cambiarContrasena: async (data: {
    contrasenaActual: string;
    contrasenaNueva: string;
  }): Promise<{ mensaje: string }> => {
    const response = await axios.post('/estudiantes/cambiar-contrasena', data);
    return response.data;
  },

  // Actualizar perfil del estudiante
  actualizarPerfil: async (data: {
    apellidos?: string;
    nombres?: string;
    dni?: string;
    fechaNacimiento?: string;
    correo?: string;
    telefono?: string;
    direccion?: string;
  }): Promise<{ mensaje: string; estudiante: any }> => {
    const response = await axios.put('/estudiantes/actualizar-perfil', data);
    return response.data;
  },
};

// Tipos adicionales
export interface OrdenMerito {
  posicion: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  promocion: string;
  semestre: number;
  creditosLlevadosSemestre: number;     // CC
  creditosAprobadosSemestre: number;     // CA
  totalCreditosLlevados: number;         // TCC
  totalCreditosAprobados: number;        // TCA
  promedioPonderadoSemestral: number;    // PPS
  promedioPonderadoAcumulado: number;    // PPA
  rangoMerito: string;
  totalEstudiantes: number;
  periodoNombre?: string;                // Nombre del periodo de referencia
  estadoPeriodo?: string;                // CERRADO o ACTIVO
}