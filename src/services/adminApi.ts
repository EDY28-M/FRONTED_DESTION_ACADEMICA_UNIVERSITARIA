import axios from '../lib/axios';

// Tipos para Notas Consolidadas
export interface NotaConsolidada {
  id: number;
  idMatricula: number;
  idEstudiante: number;
  nombreEstudiante: string;
  codigoEstudiante: string;
  idCurso: number;
  nombreCurso: string;
  idPeriodo: number | null;
  nombrePeriodo: string;
  tipoEvaluacion: string;
  nota: number; // El backend devuelve "Nota", no "NotaValor"
  peso: number | null;
  fechaEvaluacion: string | null;
  fechaRegistro: string;
  observaciones: string | null;
}

// Tipos para Anuncios
export interface AnuncioAdmin {
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

export interface CrearAnuncioDto {
  idCurso: number | null;
  titulo: string;
  contenido: string;
  prioridad: string;
  fechaPublicacion: string | null;
  fechaExpiracion: string | null;
  activo: boolean;
}

export interface ActualizarAnuncioDto {
  titulo?: string;
  contenido?: string;
  prioridad?: string;
  fechaPublicacion?: string | null;
  fechaExpiracion?: string | null;
  activo?: boolean;
}

// Tipos para Materiales
export interface MaterialAdmin {
  id: number;
  idCurso: number;
  nombreCurso: string;
  idDocente: number;
  nombreDocente: string;
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

export interface CrearMaterialDto {
  idCurso: number;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  categoria: string | null;
  url: string | null;
  fechaDisponibleDesde: string | null;
  fechaDisponibleHasta: string | null;
  activo: boolean;
  orden: number;
}

export interface ActualizarMaterialDto {
  nombre?: string;
  descripcion?: string | null;
  tipo?: string;
  categoria?: string | null;
  url?: string | null;
  fechaDisponibleDesde?: string | null;
  fechaDisponibleHasta?: string | null;
  activo?: boolean;
  orden?: number;
}

export const adminApi = {
  // Notas Consolidadas
  getNotasConsolidadas: async (params?: {
    idCurso?: number;
    idEstudiante?: number;
    idPeriodo?: number;
  }): Promise<NotaConsolidada[]> => {
    const response = await axios.get('/admin/notas-consolidadas', { params });
    return response.data;
  },

  // Anuncios
  getAnuncios: async (params?: {
    idCurso?: number;
    idDocente?: number;
  }): Promise<AnuncioAdmin[]> => {
    const response = await axios.get('/admin/anuncios', { params });
    return response.data;
  },

  crearAnuncio: async (anuncio: CrearAnuncioDto, idDocente?: number): Promise<AnuncioAdmin> => {
    const params = idDocente ? { idDocente } : {};
    const response = await axios.post('/admin/anuncios', anuncio, { params });
    return response.data;
  },

  actualizarAnuncio: async (id: number, anuncio: ActualizarAnuncioDto): Promise<AnuncioAdmin> => {
    const response = await axios.put(`/admin/anuncios/${id}`, anuncio);
    return response.data;
  },

  eliminarAnuncio: async (id: number): Promise<void> => {
    await axios.delete(`/admin/anuncios/${id}`);
  },

  // Materiales
  getMateriales: async (params?: {
    idCurso?: number;
    idDocente?: number;
  }): Promise<MaterialAdmin[]> => {
    const response = await axios.get('/admin/materiales', { params });
    return response.data;
  },

  crearMaterial: async (material: CrearMaterialDto, idDocente?: number): Promise<MaterialAdmin> => {
    const params = idDocente ? { idDocente } : {};
    const response = await axios.post('/admin/materiales', material, { params });
    return response.data;
  },

  actualizarMaterial: async (id: number, material: ActualizarMaterialDto): Promise<MaterialAdmin> => {
    const response = await axios.put(`/admin/materiales/${id}`, material);
    return response.data;
  },

  eliminarMaterial: async (id: number): Promise<void> => {
    await axios.delete(`/admin/materiales/${id}`);
  },
};
