export interface Facultad {
    id: number;
    nombre: string;
    codigo?: string;
    descripcion?: string;
    activo: boolean;
    totalEscuelas: number;
}

export interface CrearFacultad {
    nombre: string;
    codigo?: string;
    descripcion?: string;
}

export interface ActualizarFacultad {
    nombre: string;
    codigo?: string;
    descripcion?: string;
    activo: boolean;
}
