/**
 * Tipos relacionados con Postulaciones
 */

import { Postulante } from "./postulante.types";
import { Cargo } from "./cargo.types";

export type EstadoPostulacion =
  | "PENDIENTE"
  | "EN_REVISION"
  | "EVALUADO"
  | "RECHAZADO"
  | "SELECCIONADO";

export interface Postulacion {
  id: number;
  fechaPostulacion: string;
  estado: string;
  scoreCompatibilidad?: number;
  puntajeIa?: number;
  feedbackIa?: string;
  cargo: {
    titulo: string;
    empresa: {
      nombre: string;
    };
  };
}

export interface PostulacionDetalle {
  id: number;
  fechaPostulacion: string;
  estado: EstadoPostulacion;
  scoreCompatibilidad?: number;
  puntajeIa?: number;
  feedbackIa?: string;
  respuestasJson?: RespuestaPostulacion[];
  cvUrl?: string;
  postulante: Postulante;
  cargo: Cargo & {
    id: number;
    titulo: string;
  };
}

export interface RespuestaPostulacion {
  pregunta: string;
  respuesta: string;
}

export interface CreatePostulacionDTO {
  cv_file: File | null;
  cv_url?: string;
  respuestas_json: RespuestaPostulacion[];
}

export interface PostulacionFormData {
  cargoId: number;
  postulanteId?: number;
  cvFile?: File;
  cvUrl?: string;
  respuestasJson?: Record<string, string>;
}
