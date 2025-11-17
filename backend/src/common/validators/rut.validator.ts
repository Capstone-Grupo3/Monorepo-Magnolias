/**
 * Valida el formato y dígito verificador de un RUT chileno
 */
export class RutValidator {
  /**
   * Valida el formato del RUT (XX.XXX.XXX-X o sin puntos)
   * y verifica el dígito verificador
   */
  static validate(rut: string): boolean {
    if (!rut || typeof rut !== 'string') {
      return false;
    }

    // Limpiar el RUT (eliminar puntos, guiones y espacios)
    const cleanRut = rut.replace(/[.-\s]/g, '').toUpperCase();

    // Validar longitud mínima
    if (cleanRut.length < 2) {
      return false;
    }

    // Separar cuerpo y dígito verificador
    const cuerpo = cleanRut.slice(0, -1);
    const digitoVerificador = cleanRut.slice(-1);

    // Validar que el cuerpo contenga solo números
    if (!/^\d+$/.test(cuerpo)) {
      return false;
    }

    // Calcular dígito verificador esperado
    const dvCalculado = this.calcularDigitoVerificador(cuerpo);

    return dvCalculado === digitoVerificador;
  }

  /**
   * Calcula el dígito verificador de un RUT
   */
  private static calcularDigitoVerificador(cuerpo: string): string {
    let suma = 0;
    let multiplicador = 2;

    // Recorrer de derecha a izquierda
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = suma % 11;
    const dv = 11 - resto;

    if (dv === 11) return '0';
    if (dv === 10) return 'K';
    return dv.toString();
  }

  /**
   * Formatea un RUT al formato XX.XXX.XXX-X
   */
  static formatear(rut: string): string {
    if (!rut) return '';

    const cleanRut = rut.replace(/[.-\s]/g, '').toUpperCase();
    const cuerpo = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    // Formatear con puntos
    let rutFormateado = '';
    let contador = 0;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      if (contador > 0 && contador % 3 === 0) {
        rutFormateado = '.' + rutFormateado;
      }
      rutFormateado = cuerpo.charAt(i) + rutFormateado;
      contador++;
    }

    return `${rutFormateado}-${dv}`;
  }

  /**
   * Limpia el RUT eliminando puntos y guiones
   */
  static limpiar(rut: string): string {
    if (!rut) return '';
    return rut.replace(/[.-\s]/g, '').toUpperCase();
  }
}
