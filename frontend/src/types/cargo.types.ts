/**
 * Tipos relacionados con Cargos/Vacantes
 */

import { Empresa } from "./empresa.types";

export type TipoContrato =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACTOR"
  | "TEMPORARY"
  | "INTERNSHIP";

export type Modalidad = "PRESENCIAL" | "REMOTO" | "HIBRIDO";

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
