import axios from '../lib/axios';
import { Facultad, CrearFacultad, ActualizarFacultad } from '../types/facultad';

export const facultadesApi = {
    getAll: async (): Promise<Facultad[]> => {
        const response = await axios.get('/facultades');
        return response.data;
    },

    getById: async (id: number): Promise<Facultad> => {
        const response = await axios.get(`/facultades/${id}`);
        return response.data;
    },

    create: async (data: CrearFacultad): Promise<Facultad> => {
        const response = await axios.post('/facultades', data);
        return response.data;
    },

    update: async (id: number, data: ActualizarFacultad): Promise<Facultad> => {
        const response = await axios.put(`/facultades/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axios.delete(`/facultades/${id}`);
    },

    toggleActive: async (id: number): Promise<Facultad> => {
        const response = await axios.patch(`/facultades/${id}/toggle-active`);
        return response.data;
    },

    suggestCode: async (nombre: string): Promise<string> => {
        const response = await axios.get(`/facultades/suggest-code?nombre=${encodeURIComponent(nombre)}`);
        return response.data.codigo;
    }
};
