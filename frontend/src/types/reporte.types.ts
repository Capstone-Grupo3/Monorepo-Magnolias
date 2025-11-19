/**
 * Tipos relacionados con Reportes de Ranking
 */

export interface CandidatoRanking {
  id: number;
  nombre: string;
  correo: string;
  rut?: string;
  posicion: number;
  puntajeIa: number;
  feedbackIa?: string;
  cvUrl?: string;
  telefono?: string;
  experienciaAnios?: number;
  skillsJson?: any;
  respuestasJson?: any;
  fechaPostulacion: string;
  estado: string;
  
  // Métricas de IA
  matchingPorcentaje?: number;
  experienciaRelevante?: string[];
  habilidadesClave?: string[];
  fortalezas?: string[];
  areasDesarrollo?: string[];
  fitCultural?: number;
}

export interface ComparativaCandidatos {
  criterio: string;
  candidato1: string | number;
  candidato2: string | number;
  candidato3?: string | number;
}

export interface ResumenEjecutivo {
  mejorCandidato: {
    id: number;
    nombre: string;
    posicion: number;
    puntajeIa: number;
  };
  razonPrincipal: string;
  razonesSecundarias: string[];
  recomendacionFinal: string;
}

export interface EstadisticasReporte {
  totalPostulantes: number;
  promedioScore: number;
  candidatosTop: number;
  tasaCompletitud: number;
}

export interface ReporteRanking {
  id: string;
  cargoId: number;
  cargo: {
    titulo: string;
    descripcion: string;
    requisitos?: string;
    tipoContrato: string;
    modalidad: string;
    ubicacion: string;
    salarioEstimado?: number;
  };
  empresa: {
    nombre: string;
    correo: string;
    logoUrl?: string;
    descripcion?: string;
  };
  fechaGeneracion: string;
  resumenEjecutivo: ResumenEjecutivo;
  ranking: CandidatoRanking[];
  top3Detallado: CandidatoRanking[];
  comparativa: ComparativaCandidatos[];
  estadisticas: EstadisticasReporte;
  recomendacionesIA: string[];
  urlPdf?: string;
  estado: 'GENERANDO' | 'COMPLETADO' | 'ERROR';
}

export interface SolicitudReporteDTO {
  cargoId: number;
  incluirTodos?: boolean; // Si es false, solo top 10
  enviarEmail?: boolean;
}

export interface RespuestaGeneracionReporte {
  reporteId: string;
  mensaje: string;
  estado: 'GENERANDO' | 'COMPLETADO';
  urlPdf?: string;
  estimadoSegundos?: number;
}
