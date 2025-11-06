/**
 * Funciones de validación
 */

import { CV_ALLOWED_TYPES, MAX_FILE_SIZE } from "./constants";

/**
 * Valida un correo electrónico
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida una contraseña (mínimo 6 caracteres)
 */
export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Valida un teléfono chileno
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+?56)?(\s?)(0?9)(\s?)[98765]\d{7}$/;
  return phoneRegex.test(phone);
}

/**
 * Valida un RUT chileno
 */
export function validateRut(rut: string): boolean {
  // Eliminar puntos y guión
  const cleanRut = rut.replace(/\./g, "").replace(/-/g, "");

  // Separar número y dígito verificador
  const rutNumber = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();

  // Calcular dígito verificador
  let suma = 0;
  let multiplo = 2;

  for (let i = rutNumber.length - 1; i >= 0; i--) {
    suma += parseInt(rutNumber.charAt(i)) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado =
    dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

  return dv === dvCalculado;
}

/**
 * Valida un archivo de CV
 */
export function validateCvFile(file: File): { valid: boolean; error?: string } {
  // Validar tipo
  if (!CV_ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Solo se permiten archivos PDF o Word",
    };
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "El archivo no debe superar los 5MB",
    };
  }

  return { valid: true };
}

/**
 * Valida una URL
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida que un campo no esté vacío
 */
export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Valida un rango salarial
 */
export function validateSalaryRange(min?: number, max?: number): boolean {
  if (!min && !max) return true;
  if (min && min < 0) return false;
  if (max && max < 0) return false;
  if (min && max && min > max) return false;
  return true;
}
