/**
 * Utilidades para validación y formateo de RUT chileno
 */

/**
 * Limpia el RUT eliminando puntos, guiones y espacios
 */
export function limpiarRut(rut: string): string {
  return rut.replace(/[.\-\s]/g, '').toUpperCase();
}

/**
 * Calcula el dígito verificador de un RUT
 */
function calcularDigitoVerificador(rutSinDv: string): string {
  let suma = 0;
  let multiplicador = 2;

  for (let i = rutSinDv.length - 1; i >= 0; i--) {
    suma += parseInt(rutSinDv.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const dv = 11 - resto;

  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
}

/**
 * Valida si un RUT es válido
 */
export function validarRut(rut: string): boolean {
  if (!rut || rut.trim() === '') {
    return false;
  }

  const rutLimpio = limpiarRut(rut);

  // Debe tener al menos 2 caracteres (número + DV)
  if (rutLimpio.length < 2) {
    return false;
  }

  // Separar número y dígito verificador
  const rutNumero = rutLimpio.slice(0, -1);
  const dvIngresado = rutLimpio.slice(-1);

  // Validar que el número sea numérico
  if (!/^\d+$/.test(rutNumero)) {
    return false;
  }

  // Calcular y comparar dígito verificador
  const dvCalculado = calcularDigitoVerificador(rutNumero);

  return dvIngresado === dvCalculado;
}

/**
 * Formatea un RUT con puntos y guión (ej: 12.345.678-9)
 */
export function formatearRut(rut: string): string {
  const rutLimpio = limpiarRut(rut);
  
  if (rutLimpio.length < 2) {
    return rut;
  }

  const rutNumero = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  // Agregar puntos cada 3 dígitos desde el final
  let rutFormateado = '';
  let contador = 0;

  for (let i = rutNumero.length - 1; i >= 0; i--) {
    if (contador === 3) {
      rutFormateado = '.' + rutFormateado;
      contador = 0;
    }
    rutFormateado = rutNumero.charAt(i) + rutFormateado;
    contador++;
  }

  return `${rutFormateado}-${dv}`;
}

/**
 * Formatea el RUT mientras el usuario escribe
 */
export function formatearRutInput(valor: string): string {
  // Eliminar todo excepto números y K
  const limpio = valor.replace(/[^\dkK]/g, '').toUpperCase();
  
  if (limpio.length === 0) return '';
  
  // Separar número y DV
  const numero = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  
  if (numero.length === 0) return dv;
  
  // Formatear el número con puntos
  let formateado = '';
  let contador = 0;
  
  for (let i = numero.length - 1; i >= 0; i--) {
    if (contador === 3) {
      formateado = '.' + formateado;
      contador = 0;
    }
    formateado = numero.charAt(i) + formateado;
    contador++;
  }
  
  // Agregar guión y DV solo si hay DV
  if (limpio.length > numero.length) {
    return `${formateado}-${dv}`;
  }
  
  return formateado;
}

/**
 * Obtiene el mensaje de error de validación de RUT
 */
export function obtenerMensajeErrorRut(rut: string): string {
  if (!rut || rut.trim() === '') {
    return 'El RUT es requerido';
  }

  const rutLimpio = limpiarRut(rut);

  if (rutLimpio.length < 2) {
    return 'El RUT debe tener al menos 2 caracteres';
  }

  const rutNumero = rutLimpio.slice(0, -1);

  if (!/^\d+$/.test(rutNumero)) {
    return 'El RUT contiene caracteres no válidos';
  }

  if (!validarRut(rut)) {
    return 'El RUT ingresado no es válido';
  }

  return '';
}
