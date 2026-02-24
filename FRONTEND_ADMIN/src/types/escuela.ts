export interface Escuela {
    id: number;
    facultadId: number;
    facultadNombre: string;
    nombre: string;
    codigo?: string;
    descripcion?: string;
    activo: boolean;
    totalEstudiantes: number;
}

export interface CrearEscuela {
    facultadId: number;
    nombre: string;
    codigo?: string;
    descripcion?: string;
    duracionAnios?: number;
    totalCreditos?: number;
}

export interface ActualizarEscuela {
    facultadId: number;
    nombre: string;
    codigo?: string;
    descripcion?: string;
    duracionAnios?: number;
    totalCreditos?: number;
    activo: boolean;
}
