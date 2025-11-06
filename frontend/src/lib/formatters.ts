/**
 * Funciones de formateo
 */

import {
  TIPO_CONTRATO_LABELS,
  MODALIDAD_LABELS,
  ESTADO_POSTULACION_LABELS,
  ESTADO_POSTULACION_COLORS,
} from "./constants";
import { TipoContrato, Modalidad, EstadoPostulacion } from "@/types";

/**
 * Formatea una fecha a formato local
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formatea una fecha a formato corto
 */
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formatea una fecha relativa (hace X días)
 */
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return `Hace ${Math.floor(diffDays / 365)} años`;
}

/**
 * Formatea un monto en pesos chilenos
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea un rango salarial
 */
export function formatSalaryRange(min?: number, max?: number): string {
  if (!min && !max) return "No especificado";
  if (min && !max) return `Desde ${formatCurrency(min)}`;
  if (!min && max) return `Hasta ${formatCurrency(max)}`;
  return `${formatCurrency(min!)} - ${formatCurrency(max!)}`;
}

/**
 * Obtiene el label de un tipo de contrato
 */
export function getTipoContratoLabel(tipo: string): string {
  return TIPO_CONTRATO_LABELS[tipo as TipoContrato] || tipo;
}

/**
 * Obtiene el label de una modalidad
 */
export function getModalidadLabel(modalidad: string): string {
  return MODALIDAD_LABELS[modalidad as Modalidad] || modalidad;
}

/**
 * Obtiene el label de un estado de postulación
 */
export function getEstadoLabel(estado: string): string {
  return ESTADO_POSTULACION_LABELS[estado as EstadoPostulacion] || estado;
}

/**
 * Obtiene las clases CSS de color para un estado
 */
export function getEstadoColor(estado: string): string {
  return (
    ESTADO_POSTULACION_COLORS[estado as EstadoPostulacion] ||
    "bg-gray-100 text-gray-800"
  );
}

/**
 * Obtiene el color para un puntaje
 */
export function getPuntajeColor(puntaje: number): string {
  if (puntaje >= 80) return "text-green-600 bg-green-50";
  if (puntaje >= 60) return "text-blue-600 bg-blue-50";
  if (puntaje >= 40) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
}

/**
 * Formatea un número como porcentaje
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Trunca un texto a una longitud máxima
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}
