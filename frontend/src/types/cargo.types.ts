/**
 * Tipos relacionados con Cargos/Vacantes
 */

import { Empresa } from "./empresa.types";

export type TipoContrato =
  | "FULL_TIME"
  | "PART_TIME"
  | "PRACTICA"
  | "FREELANCE";

export type Modalidad = "PRESENCIAL" | "REMOTO" | "HIBRIDO";

export type EstadoCargo = "ACTIVA" | "CERRADA" | "EN_PROCESO";

export interface Cargo {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  salarioEstimado?: number;
  tipoContrato: string;
  modalidad: string;
  fechaPublicacion: string;
  preguntasJson?: any;
  empresa: {
    nombre: string;
    logoUrl?: string;
  };
}

export interface CargoDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  salarioEstimado?: number;
  tipoContrato: TipoContrato;
  modalidad: Modalidad;
  requisitos?: string;
  fechaPublicacion: string;
  fechaCierre?: string;
  estado: string;
  activo: boolean;
  preguntasJson?: PreguntaCargo[];
  empresa:
    | Empresa
    | {
        nombre: string;
        logoUrl?: string;
      };
  _count?: {
    postulaciones: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PreguntaCargo {
  pregunta: string;
  tipo?: "texto" | "multiple" | "si_no";
  opciones?: string[];
}

export interface CreateCargoDTO {
  titulo: string;
  descripcion: string;
  tipoContrato: TipoContrato;
  ubicacion: string;
  modalidad: Modalidad;
  salarioEstimado?: number;
  preguntasJson?: PreguntaCargo[];
  requisitos?: string;
  fechaCierre?: string;
}

/**
 * Filtros para búsqueda de cargos
 */
export interface FiltrosCargo {
  busqueda?: string;
  ubicacion?: string;
  tipoContrato?: TipoContrato | "";
  modalidad?: Modalidad | "";
  estado?: EstadoCargo | "";
  empresa?: string;
  empresaId?: number;
  salarioMin?: number | null;
  salarioMax?: number | null;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Metadatos de paginación
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Respuesta paginada de cargos
 */
export interface CargosPaginatedResponse {
  data: Cargo[];
  meta: PaginationMeta;
}

