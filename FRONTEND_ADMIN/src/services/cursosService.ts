import api from '../lib/axios'
import { Curso, CursoCreate, CursoUpdate } from '../types'

export const cursosApi = {
  // Obtener todos los cursos
  getAll: async (): Promise<Curso[]> => {
    const response = await api.get('/cursos')
    return response.data
  },

  // Obtener un curso por ID
  getById: async (id: number): Promise<Curso> => {
    const response = await api.get(`/cursos/${id}`)
    return response.data
  },

  // Crear un nuevo curso
  create: async (curso: CursoCreate): Promise<Curso> => {
    const response = await api.post('/cursos', curso)
    return response.data
  },

  // Actualizar un curso
  update: async (id: number, curso: CursoUpdate): Promise<Curso> => {
    const response = await api.put(`/cursos/${id}`, curso)
    return response.data
  },

  // Eliminar un curso
  delete: async (id: number): Promise<void> => {
    await api.delete(`/cursos/${id}`)
  },

  // Buscar cursos por nombre
  search: async (searchTerm: string): Promise<Curso[]> => {
    const response = await api.get(`/cursos/search?term=${encodeURIComponent(searchTerm)}`)
    return response.data
  },

  // Obtener cursos por ciclo
  getByCiclo: async (ciclo: number): Promise<Curso[]> => {
    const response = await api.get(`/cursos/ciclo/${ciclo}`)
    return response.data
  },

  // Obtener cursos por docente
  getByDocente: async (idDocente: number): Promise<Curso[]> => {
    const response = await api.get(`/cursos/docente/${idDocente}`)
    return response.data
  },
}
