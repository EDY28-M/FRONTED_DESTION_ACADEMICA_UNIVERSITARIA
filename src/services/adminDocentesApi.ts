import axios from '../lib/axios';

export interface DocenteAdmin {
  id: number;
  apellidos: string;
  nombres: string;
  nombreCompleto: string;
  profesion: string | null;
  fechaNacimiento: string | null;
  correo: string | null;
  tienePassword: boolean;
  totalCursos: number;
  fechaCreacion: string;
}

export interface CrearDocenteConPasswordRequest {
  apellidos: string;
  nombres: string;
  profesion?: string;
  fechaNacimiento?: string;
  correo?: string;
  emailUsuario: string; // Email para la cuenta de usuario (Gmail u otro)
  password: string;
}

export interface AsignarPasswordRequest {
  password: string;
}

export interface ActualizarDocenteRequest {
  apellidos: string;
  nombres: string;
  profesion?: string;
  fechaNacimiento?: string;
  correo?: string;
}

export const adminDocentesApi = {
  // Obtener todos los docentes con info de contraseña
  getTodosDocentes: async (): Promise<DocenteAdmin[]> => {
    const response = await axios.get('/admin/docentes');
    return response.data;
  },

  // Crear nuevo docente con contraseña
  crearDocente: async (data: CrearDocenteConPasswordRequest): Promise<{ mensaje: string; docente: DocenteAdmin }> => {
    const response = await axios.post('/admin/docentes', data);
    return response.data;
  },

  // Asignar o actualizar contraseña de docente
  asignarPassword: async (id: number, data: AsignarPasswordRequest): Promise<{ mensaje: string; docente: DocenteAdmin }> => {
    const response = await axios.put(`/admin/docentes/${id}/password`, data);
    return response.data;
  },

  // Actualizar información de docente (sin contraseña)
  actualizarDocente: async (id: number, data: ActualizarDocenteRequest): Promise<{ mensaje: string; docente: DocenteAdmin }> => {
    const response = await axios.put(`/admin/docentes/${id}`, data);
    return response.data;
  },

  // Eliminar docente
  eliminarDocente: async (id: number): Promise<{ mensaje: string; docente: { id: number; nombreCompleto: string } }> => {
    const response = await axios.delete(`/admin/docentes/${id}`);
    return response.data;
  },
};
