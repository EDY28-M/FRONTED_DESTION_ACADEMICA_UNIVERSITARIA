import axios from '../lib/axios';

// ============================================
// TIPOS
// ============================================

export interface TrabajoArchivo {
  id: number;
  nombreArchivo: string;
  rutaArchivo: string;
  tipoArchivo?: string;
  tamaño?: number;
  fechaSubida: string;
}

export interface TrabajoLink {
  id: number;
  url: string;
  descripcion?: string;
  fechaCreacion: string;
}

export interface Trabajo {
  id: number;
  idCurso: number;
  nombreCurso?: string;
  idDocente: number;
  nombreDocente?: string;
  titulo: string;
  descripcion?: string;
  fechaCreacion: string;
  fechaLimite: string;
  activo: boolean;
  fechaActualizacion?: string;
  archivos: TrabajoArchivo[];
  links: TrabajoLink[];
  totalEntregas: number;
  puedeEntregar: boolean;
  yaEntregado: boolean;
  // Información del tipo de evaluación
  idTipoEvaluacion?: number;
  nombreTipoEvaluacion?: string;
  pesoTipoEvaluacion?: number;
  // Información de la entrega del estudiante (si ya entregó)
  calificacion?: number;
  observacionesDocente?: string;
  fechaCalificacion?: string;
  fechaEntrega?: string;
}

export interface TrabajoSimple {
  id: number;
  idCurso: number;
  nombreCurso?: string;
  titulo: string;
  fechaCreacion: string;
  fechaLimite: string;
  activo: boolean;
  totalEntregas: number;
  yaEntregado: boolean;
  idTipoEvaluacion?: number;
  nombreTipoEvaluacion?: string;
  // Información de calificación (si ya entregó)
  calificacion?: number;
}

export interface TrabajoCreate {
  idCurso: number;
  titulo: string;
  descripcion?: string;
  fechaLimite: string;
  idTipoEvaluacion?: number;
  archivos?: File[];
  links?: { url: string; descripcion?: string }[];
}

export interface TrabajoUpdate {
  titulo?: string;
  descripcion?: string;
  fechaLimite?: string;
  activo?: boolean;
  idTipoEvaluacion?: number;
  archivosNuevos?: File[];
  linksNuevos?: { url: string; descripcion?: string }[];
  archivosEliminar?: number[];
  linksEliminar?: number[];
}

export interface Entrega {
  id: number;
  idTrabajo: number;
  tituloTrabajo?: string;
  idEstudiante: number;
  nombreEstudiante?: string;
  codigoEstudiante?: string;
  comentario?: string;
  fechaEntrega: string;
  calificacion?: number;
  observaciones?: string;
  fechaCalificacion?: string;
  entregadoTarde: boolean;
  archivos: TrabajoArchivo[];
  links: TrabajoLink[];
}

export interface EntregaCreate {
  idTrabajo: number;
  comentario?: string;
  archivos?: File[];
  links?: { url: string; descripcion?: string }[];
}

export interface EntregaUpdate {
  comentario?: string;
  archivosNuevos?: File[];
  linksNuevos?: { url: string; descripcion?: string }[];
  archivosEliminar?: number[];
  linksEliminar?: number[];
}

export interface CalificarEntrega {
  calificacion: number;
  observaciones?: string;
}

export interface TrabajoPendiente {
  id: number;
  idCurso: number;
  nombreCurso?: string;
  titulo: string;
  fechaLimite: string;
  totalEntregas: number;
  entregasPendientesCalificar: number;
  fechaUltimaEntrega?: string;
}

// ============================================
// API PARA DOCENTES
// ============================================

export const trabajosDocenteApi = {
  // Obtener trabajos por curso
  getTrabajosPorCurso: async (idCurso: number): Promise<Trabajo[]> => {
    const response = await axios.get(`trabajos/curso/${idCurso}`);
    return response.data;
  },

  // Obtener trabajos del docente
  getMisTrabajos: async (): Promise<Trabajo[]> => {
    const response = await axios.get('trabajos/docente');
    return response.data;
  },

  // Obtener trabajos pendientes del docente (con entregas sin calificar)
  getTrabajosPendientes: async (): Promise<TrabajoPendiente[]> => {
    const response = await axios.get('trabajos/docente/pendientes');
    return response.data;
  },

  // Obtener un trabajo específico
  getTrabajo: async (id: number): Promise<Trabajo> => {
    const response = await axios.get(`trabajos/${id}`);
    return response.data;
  },

  // Crear trabajo
  createTrabajo: async (data: TrabajoCreate): Promise<Trabajo> => {
    const formData = new FormData();
    formData.append('IdCurso', data.idCurso.toString());
    formData.append('Titulo', data.titulo);
    if (data.descripcion) formData.append('Descripcion', data.descripcion);
    formData.append('FechaLimite', data.fechaLimite);
    if (data.idTipoEvaluacion) formData.append('IdTipoEvaluacion', data.idTipoEvaluacion.toString());

    if (data.archivos && data.archivos.length > 0) {
      data.archivos.forEach((file) => {
        formData.append('files', file);
      });
    }

    if (data.links && data.links.length > 0) {
      formData.append('Links', JSON.stringify(data.links));
    }

    const response = await axios.post('trabajos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Actualizar trabajo
  updateTrabajo: async (id: number, data: TrabajoUpdate): Promise<void> => {
    const formData = new FormData();
    if (data.titulo) formData.append('Titulo', data.titulo);
    if (data.descripcion !== undefined) formData.append('Descripcion', data.descripcion || '');
    if (data.fechaLimite) formData.append('FechaLimite', data.fechaLimite);
    if (data.activo !== undefined) formData.append('Activo', data.activo.toString());
    if (data.idTipoEvaluacion !== undefined) {
      formData.append('IdTipoEvaluacion', data.idTipoEvaluacion?.toString() || '');
    }
    if (data.archivosNuevos && data.archivosNuevos.length > 0) {
      data.archivosNuevos.forEach((file) => {
        formData.append('files', file);
      });
    }

    if (data.linksNuevos && data.linksNuevos.length > 0) {
      formData.append('LinksNuevos', JSON.stringify(data.linksNuevos));
    }

    if (data.archivosEliminar && data.archivosEliminar.length > 0) {
      formData.append('ArchivosEliminar', JSON.stringify(data.archivosEliminar));
    }

    if (data.linksEliminar && data.linksEliminar.length > 0) {
      formData.append('LinksEliminar', JSON.stringify(data.linksEliminar));
    }

    await axios.put(`trabajos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Eliminar trabajo
  deleteTrabajo: async (id: number): Promise<void> => {
    await axios.delete(`trabajos/${id}`);
  },

  // Obtener entregas de un trabajo
  getEntregasPorTrabajo: async (idTrabajo: number): Promise<Entrega[]> => {
    const response = await axios.get(`trabajos/${idTrabajo}/entregas`);
    return response.data;
  },

  // Calificar entrega
  calificarEntrega: async (idEntrega: number, data: CalificarEntrega): Promise<void> => {
    await axios.post(`trabajos/entregas/${idEntrega}/calificar`, data);
  },

  // Descargar archivo de instrucciones
  downloadArchivoInstrucciones: async (idArchivo: number): Promise<Blob> => {
    const response = await axios.get(`trabajos/archivos/${idArchivo}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Descargar archivo de entrega
  downloadArchivoEntrega: async (idEntrega: number, idArchivo: number): Promise<Blob> => {
    const response = await axios.get(`trabajos/entregas/${idEntrega}/archivos/${idArchivo}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ============================================
  // API PARA ENTREGABLES MÚLTIPLES (DOCENTE)
  // ============================================

  // Obtener entregables de una entrega
  getEntregablesPorEntrega: async (idEntrega: number): Promise<Entregable[]> => {
    const response = await axios.get(`trabajos/entregas/${idEntrega}/entregables`);
    return response.data;
  },

  // Calificar entregable
  calificarEntregable: async (idEntregable: number, data: { calificacion: number; observaciones?: string }): Promise<void> => {
    await axios.post(`trabajos/entregables/${idEntregable}/calificar`, data);
  },
};

// ============================================
// API PARA ESTUDIANTES
// ============================================

export const trabajosEstudianteApi = {
  // Obtener trabajos disponibles
  getTrabajosDisponibles: async (): Promise<TrabajoSimple[]> => {
    const response = await axios.get('trabajos-estudiante/disponibles');
    return response.data;
  },

  // Obtener trabajos por curso
  getTrabajosPorCurso: async (idCurso: number): Promise<TrabajoSimple[]> => {
    const response = await axios.get(`trabajos-estudiante/curso/${idCurso}`);
    return response.data;
  },

  // Obtener un trabajo específico
  getTrabajo: async (id: number): Promise<Trabajo> => {
    const response = await axios.get(`trabajos-estudiante/${id}`);
    return response.data;
  },

  // Obtener la entrega del estudiante para un trabajo
  getMiEntrega: async (idTrabajo: number): Promise<Entrega> => {
    const response = await axios.get(`trabajos-estudiante/trabajos/${idTrabajo}/mi-entrega`);
    return response.data;
  },

  // Crear entrega
  createEntrega: async (data: EntregaCreate): Promise<Entrega> => {
    const formData = new FormData();
    formData.append('IdTrabajo', data.idTrabajo.toString());
    if (data.comentario) formData.append('Comentario', data.comentario);

    if (data.archivos && data.archivos.length > 0) {
      data.archivos.forEach((file) => {
        formData.append('files', file);
      });
    }

    if (data.links && data.links.length > 0) {
      formData.append('Links', JSON.stringify(data.links));
    }

    const response = await axios.post('trabajos-estudiante/entregas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Actualizar entrega
  updateEntrega: async (id: number, data: EntregaUpdate): Promise<void> => {
    const formData = new FormData();
    if (data.comentario !== undefined) formData.append('Comentario', data.comentario || '');

    if (data.archivosNuevos && data.archivosNuevos.length > 0) {
      data.archivosNuevos.forEach((file) => {
        formData.append('files', file);
      });
    }

    if (data.linksNuevos && data.linksNuevos.length > 0) {
      formData.append('LinksNuevos', JSON.stringify(data.linksNuevos));
    }

    if (data.archivosEliminar && data.archivosEliminar.length > 0) {
      formData.append('ArchivosEliminar', JSON.stringify(data.archivosEliminar));
    }

    if (data.linksEliminar && data.linksEliminar.length > 0) {
      formData.append('LinksEliminar', JSON.stringify(data.linksEliminar));
    }

    await axios.put(`trabajos-estudiante/entregas/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Obtener una entrega específica
  getEntrega: async (id: number): Promise<Entrega> => {
    const response = await axios.get(`trabajos-estudiante/entregas/${id}`);
    return response.data;
  },

  // Descargar archivo de instrucciones
  downloadArchivoInstrucciones: async (idArchivo: number): Promise<Blob> => {
    const response = await axios.get(`trabajos-estudiante/archivos/${idArchivo}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Descargar archivo de entrega
  downloadArchivoEntrega: async (idEntrega: number, idArchivo: number): Promise<Blob> => {
    const response = await axios.get(
      `trabajos-estudiante/entregas/${idEntrega}/archivos/${idArchivo}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  },

};

