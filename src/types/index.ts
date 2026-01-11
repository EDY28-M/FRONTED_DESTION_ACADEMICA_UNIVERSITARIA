export interface Docente {
    id: number
    apellidos: string
    nombres: string
    profesion?: string
    fechaNacimiento?: string
    correo?: string
    cursos: CursoSimple[]
  }
  
  export interface DocenteCreate {
    apellidos: string
    nombres: string
    profesion?: string
    fechaNacimiento?: string
    correo?: string
  }
  
  export interface DocenteUpdate {
    apellidos: string
    nombres: string
    profesion?: string
    fechaNacimiento?: string
    correo?: string
  }
  
  export interface DocenteSimple {
    id: number
    apellidos: string
    nombres: string
    profesion?: string
  }
  
  export interface Curso {
    id: number
    codigo?: string
    nombreCurso: string
    creditos: number
    horasSemanal: number
    horasTeoria?: number
    horasPractica?: number
    horasTotales?: number
    ciclo: number
    idDocente?: number
    docente?: DocenteSimple
    prerequisitosIds?: number[]
    prerequisitos?: CursoSimple[]
  }
  
  export interface CursoCreate {
    codigo?: string
    nombreCurso: string
    creditos: number
    horasSemanal: number
    horasTeoria?: number
    horasPractica?: number
    horasTotales?: number
    ciclo: number
    idDocente?: number
    prerequisitosIds?: number[]
  }
  
  export interface CursoUpdate {
    codigo?: string
    nombreCurso: string
    creditos: number
    horasSemanal: number
    horasTeoria?: number
    horasPractica?: number
    horasTotales?: number
    ciclo: number
    idDocente?: number
    prerequisitosIds?: number[]
  }
  
  export interface CursoSimple {
    id: number
    codigo?: string
    nombreCurso: string
    creditos: number
    horasSemanal: number
    ciclo: number
  }
  
  export interface ApiResponse<T> {
    data: T
    message?: string
    success: boolean
  }
  
  export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  
  export interface ChartData {
    name: string
    value: number
    color?: string
  }
  
  export interface DashboardStats {
    totalDocentes: number
    totalCursos: number
    totalCreditos: number
    promedioHorasSemanal: number
    cursosPorCiclo: ChartData[]
    docentesPorProfesion: ChartData[]
  }
  
  // Authentication Types
  export interface User {
    id: number
    email: string
    nombres: string
    apellidos: string
    nombreCompleto: string
    rol: string
    estado: boolean
    fechaCreacion: string
    ultimoAcceso?: string
  }
  
  export interface LoginRequest {
    email: string
    password: string
    tipoUsuario?: string // "Administrador" o "Estudiante" - para validación en backend
  }
  
  export interface AuthResponse {
    token: string
    refreshToken: string
    expiration: string
    usuario: User
  }
  
  export interface RefreshTokenRequest {
    token: string
    refreshToken: string
  }