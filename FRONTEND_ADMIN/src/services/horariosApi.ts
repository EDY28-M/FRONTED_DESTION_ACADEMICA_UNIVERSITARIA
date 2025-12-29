import axios from '../lib/axios';
import { 
  Horario, 
  CreateHorarioDto, 
  DocenteConCursos, 
  CrearHorariosBatchDto, 
  ResultadoBatchHorarios 
} from '../types/horario';

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

  // Nuevos métodos para gestión de horarios por docente
  getDocentesConCursos: async (): Promise<DocenteConCursos[]> => {
    const response = await axios.get('/horarios/docentes-con-cursos');
    return response.data;
  },

  createHorariosBatch: async (dto: CrearHorariosBatchDto): Promise<ResultadoBatchHorarios> => {
    const response = await axios.post('/horarios/batch', dto);
    return response.data;
  },
};
