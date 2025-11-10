export interface Estudiante {
  id: number;
  codigo: string;
  nombreCompleto: string;
  email: string;
  cicloActual: number;
  creditosAcumulados: number;
  promedioAcumulado?: number;
  promedioSemestral?: number;
  carrera: string;
  fechaIngreso: string;
  estado: string;
}

export interface Periodo {
  id: number;
  nombre: string;
  anio: number;
  ciclo: number;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface CursoDisponible {
  id: number;
  codigo: string;
  nombreCurso: string;
  creditos: number;
  horasSemanal: number;
  ciclo: number;
  nombreDocente: string | null;
  disponible: boolean;
  yaMatriculado: boolean;
  motivoNoDisponible?: string;
}

export interface Matricula {
  id: number;
  idEstudiante: number;
  idCurso: number;
  codigoCurso: string;
  nombreCurso: string;
  creditos: number;
  horasSemanal: number;
  nombreDocente: string | null;
  idPeriodo: number;
  nombrePeriodo: string;
  fechaMatricula: string;
  estado: string;
  fechaRetiro?: string;
  promedioFinal?: number;
}

export interface NotaDetalle {
  id: number;
  idMatricula: number;
  nombreCurso: string;
  nombrePeriodo: string;
  tipoEvaluacion: string;
  notaValor: number;
  peso: number;
  fecha: string;
  observaciones?: string;
}

export interface MatricularRequest {
  idCurso: number;
  idPeriodo: number;
}

// === Interfaces para Registro de Notas ===

export interface RegistroNotas {
  semestres: SemestreRegistro[];
}

export interface SemestreRegistro {
  idPeriodo: number;
  periodo: string;
  anio: number;
  ciclo: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado: string;
  cursos: CursoRegistro[];
  totales: TotalesSemestre;
}

export interface CursoRegistro {
  idMatricula: number;
  idCurso: number;
  codigoCurso: string;
  nombreCurso: string;
  creditos: number;
  horasSemanal: number;
  fechaExamen?: string;
  notaFinal: number;
  estadoCurso: string;
  evaluaciones: EvaluacionRegistro[];
}

export interface EvaluacionRegistro {
  nombre: string;
  peso: number;
  nota: number;
}

export interface TotalesSemestre {
  totalCreditos: number;
  totalHoras: number;
  promedioSemestral: number;
  promedioAcumulado: number;
}
