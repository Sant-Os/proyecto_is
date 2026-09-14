/**
 * Modulo central de formateo numerico y validaciones financieras.
 * 
 * Estandariza la presentacion visual de montos en moneda boliviana (BOB),
 * porcentajes y reglas de validacion para los campos de entrada.
 */

// Formateador oficial de moneda en bolivianos con dos decimales fijos (ej: "Bs 1.000,00")
const moneda = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Formateador numerico para porcentajes con dos decimales (ej: "8,50 %")
const numero = new Intl.NumberFormat("es-BO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formatea un valor numerico como moneda en bolivianos con centavos (ej: "Bs 18.500,00").
 * Se utiliza en tarjetas de resultado, tablas anuales y desgloses financieros.
 */
export const bs = (n: number): string => moneda.format(n);

/**
 * Formatea un valor como porcentaje con dos decimales (ej: "8,50 %").
 */
export const pct = (n: number): string => numero.format(n) + " %";

/**
 * Formatea valores numericos completos para ejes de graficas sin abreviaciones tipo '1.1k'.
 * - Si el numero es entero, omite los centavos innecesarios (ej: "Bs 1.000", "Bs 1.020").
 * - Si posee decimales significativos, los incluye con precision (ej: "Bs 1.000,50").
 */
export const bsCompleto = (n: number): string => {
  const num = Number(n);
  if (isNaN(num)) return "Bs 0";
  const redondeado = Math.round(num * 100) / 100;
  if (Number.isInteger(redondeado)) {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
      maximumFractionDigits: 0,
    }).format(redondeado);
  }
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(redondeado);
};

/**
 * Mantenido por retrocompatibilidad: redirige al formateador completo exacto.
 */
export const bsCompacto = (n: number): string => bsCompleto(n);

/**
 * Reglas de validacion aplicables a campos numericos de entrada.
 */
export interface ReglaCampo {
  min?: number;
  max?: number;
  entero?: boolean;
  mensajeMin?: string;
  mensajeMax?: string;
}

/**
 * Valida y sanitiza el texto ingresado en un campo numerico de formulario.
 * 
 * Comprueba:
 * - Que el campo no este vacio.
 * - Que sea un numero real valido (no NaN).
 * - Limites minimos y maximos configurados.
 * - Restriccion de numero entero si la regla lo exige (ej: plazo en anos).
 * 
 * @returns Un objeto con el valor numerico parseado o el mensaje de error correspondiente.
 */
export function validarNumero(
  bruto: string,
  reglas: ReglaCampo,
): { valor: number; error: null } | { valor: null; error: string } {
  const texto = bruto.trim();
  if (texto === "") return { valor: null, error: "Escribe un valor." };

  const valor = Number(texto);
  if (Number.isNaN(valor)) return { valor: null, error: "Solo se aceptan numeros." };
  if (reglas.min !== undefined && valor < reglas.min)
    return { valor: null, error: reglas.mensajeMin ?? `El minimo es ${reglas.min}.` };
  if (reglas.max !== undefined && valor > reglas.max)
    return { valor: null, error: reglas.mensajeMax ?? `El maximo es ${reglas.max}.` };
  if (reglas.entero && !Number.isInteger(valor))
    return { valor: null, error: "Usa un numero entero." };

  return { valor, error: null };
}

// Restricciones de negocio para el capital inicial (mayor a cero)
export const REGLA_CAPITAL: ReglaCampo = {
  min: 0.01,
  mensajeMin: "El capital tiene que ser mayor a 0.",
};

// Restricciones para la tasa de interes (entre 0% y 100%)
export const REGLA_TASA: ReglaCampo = {
  min: 0,
  max: 100,
  mensajeMax: "Usa una tasa de 0 a 100 %.",
};

// Restricciones para el tiempo de inversion o prestamo (1 a 60 anos enteros)
export const REGLA_TIEMPO: ReglaCampo = {
  min: 1,
  max: 60,
  entero: true,
  mensajeMax: "El maximo son 60 anos.",
};
