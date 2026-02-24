import axios from '../lib/axios';
import { Escuela, CrearEscuela, ActualizarEscuela } from '../types/escuela';

export const escuelasApi = {
    getAll: async (): Promise<Escuela[]> => {
        const response = await axios.get('/escuelas');
        return response.data;
    },

    getByFacultad: async (facultadId: number): Promise<Escuela[]> => {
        const response = await axios.get(`/facultades/${facultadId}/escuelas`);
        return response.data;
    },

    getById: async (id: number): Promise<Escuela> => {
        const response = await axios.get(`/escuelas/${id}`);
        return response.data;
    },

    create: async (data: CrearEscuela): Promise<Escuela> => {
        const response = await axios.post('/escuelas', data);
        return response.data;
    },

    update: async (id: number, data: ActualizarEscuela): Promise<Escuela> => {
        const response = await axios.put(`/escuelas/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axios.delete(`/escuelas/${id}`);
    },

    toggleActive: async (id: number): Promise<Escuela> => {
        const response = await axios.patch(`/escuelas/${id}/toggle-active`);
        return response.data;
    }
};
