import api from '../lib/axios'
import { Docente, DocenteCreate, DocenteUpdate } from '../types'

export const docentesApi = {
  // Obtener todos los docentes
  getAll: async (): Promise<Docente[]> => {
    const response = await api.get('/docentes')
    return response.data
  },

  // Obtener un docente por ID
  getById: async (id: number): Promise<Docente> => {
    const response = await api.get(`/docentes/${id}`)
    return response.data
  },

  // Crear un nuevo docente
  create: async (docente: DocenteCreate): Promise<Docente> => {
    const response = await api.post('/docentes', docente)
    return response.data
  },

  // Actualizar un docente
  update: async (id: number, docente: DocenteUpdate): Promise<Docente> => {
    const response = await api.put(`/docentes/${id}`, docente)
    return response.data
  },

  // Eliminar un docente
  delete: async (id: number): Promise<void> => {
    await api.delete(`/docentes/${id}`)
  },

  // Buscar docentes por nombre
  search: async (searchTerm: string): Promise<Docente[]> => {
    const response = await api.get(`/docentes/search?term=${encodeURIComponent(searchTerm)}`)
    return response.data
  },
}
