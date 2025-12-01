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
