export interface Horario {
  id: number;
  idCurso: number;
  nombreCurso: string;
  nombreDocente: string;
  diaSemana: number;
  diaSemanaTexto: string;
  horaInicio: string; // HH:mm
  horaFin: string;    // HH:mm
  aula?: string;
  tipo: 'Teoría' | 'Práctica';
}

export interface CreateHorarioDto {
  idCurso: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  aula?: string;
  tipo: string;
}

export interface HorarioConflicto {
  hayConflicto: boolean;
  mensaje: string;
  cursoConflicto?: string;
  horarioConflicto?: string;
}

// Nuevos tipos para gestión de horarios por docente
export interface CursoConHorarios {
  idCurso: number;
  nombreCurso: string;
  codigo?: string;
  ciclo: number;
  creditos: number;
  horasSemanal: number;
  horarios: Horario[];
}

export interface DocenteConCursos {
  idDocente: number;
  nombreDocente: string;
  profesion: string;
  correo?: string;
  cursos: CursoConHorarios[];
  totalCursos: number;
  totalHorariosAsignados: number;
}

export interface CrearHorariosBatchDto {
  idDocente: number;
  horarios: CreateHorarioDto[];
}

export interface ErrorHorario {
  idCurso: number;
  nombreCurso: string;
  diaSemana: number;
  error: string;
}

export interface ResultadoBatchHorarios {
  totalEnviados: number;
  totalCreados: number;
  totalFallidos: number;
  horariosCreados: Horario[];
  errores: ErrorHorario[];
}
