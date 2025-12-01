import axios from '../lib/axios';
import { Horario, CreateHorarioDto } from '../types/horario';

export const horariosApi = {
  getHorariosByCurso: async (idCurso: number): Promise<Horario[]> => {
    const response = await axios.get(`/horarios/curso/${idCurso}`);
    return response.data;
  },

  createHorario: async (horario: CreateHorarioDto): Promise<Horario> => {
    const response = await axios.post('/horarios', horario);
    return response.data;
  },

  getMiHorario: async (): Promise<Horario[]> => {
    const response = await axios.get('/horarios/mi-horario');
    return response.data;
  },

  deleteHorario: async (id: number): Promise<void> => {
    await axios.delete(`/horarios/${id}`);
  },
};
