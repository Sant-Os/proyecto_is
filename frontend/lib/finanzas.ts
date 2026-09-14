/**
 * Modulo de calculos matematicos financieros.
 * 
 * Contiene las formulas estandar de matematica financiera para interes simple y compuesto,
 * desacopladas de la interfaz de usuario para permitir verificacion unitaria y reutilizacion.
 */

/**
 * Formula de Interes Simple: A = P * (1 + r * t)
 * El rendimiento de cada periodo se calcula exclusivamente sobre el capital original.
 * 
 * @param capital - Monto inicial invertido o prestado (P).
 * @param tasaAnual - Tasa de interes nominal anual en porcentaje (ej: 8.5 para 8.5%).
 * @param anos - Periodo total en anos (t).
 * @returns Monto total acumulado (A) al finalizar el plazo.
 */
export function interesSimple(capital: number, tasaAnual: number, anos: number): number {
  return capital * (1 + (tasaAnual / 100) * anos);
}

/**
 * Formula de Interes Compuesto: A = P * (1 + r / n)^(n * t)
 * Los intereses devengados en cada subperiodo se anaden al capital para generar nuevos intereses.
 * 
 * @param capital - Monto inicial (P).
 * @param tasaAnual - Tasa de interes nominal anual en porcentaje.
 * @param anos - Plazo de la proyeccion en anos (t).
 * @param frecuencia - Frecuencia de capitalizacion por ano (n) (ej: 12 para mensual, 1 para anual).
 * @returns Capital final acumulado (A).
 */
export function interesCompuesto(
  capital: number,
  tasaAnual: number,
  anos: number,
  frecuencia: number,
): number {
  const r = tasaAnual / 100;
  return capital * Math.pow(1 + r / frecuencia, frecuencia * anos);
}

/**
 * Calcula la Tasa Efectiva Anual (TEA): TEA = (1 + r / n)^n - 1
 * Refleja el rendimiento real anualizado tomando en cuenta el efecto de la capitalizacion periodica.
 * 
 * @param tasaAnual - Tasa nominal anual.
 * @param frecuencia - Cantidad de capitalizaciones al ano.
 * @returns Tasa efectiva anual expresada en porcentaje.
 */
export function tasaEfectivaAnual(tasaAnual: number, frecuencia: number): number {
  return (Math.pow(1 + tasaAnual / 100 / frecuencia, frecuencia) - 1) * 100;
}

/**
 * Genera la secuencia cronologica de valores ano por ano para graficar la curva lineal de interes simple.
 * Comienza en el ano 0 con el capital base y proyecta hasta el ano final.
 */
export function serieSimple(capital: number, tasa: number, anos: number): number[] {
  return Array.from({ length: anos + 1 }, (_, i) => interesSimple(capital, tasa, i));
}

/**
 * Genera la secuencia cronologica de valores ano por ano para graficar la curva exponencial de interes compuesto.
 */
export function serieCompuesta(
  capital: number,
  tasa: number,
  anos: number,
  frecuencia: number,
): number[] {
  return Array.from({ length: anos + 1 }, (_, i) => interesCompuesto(capital, tasa, i, frecuencia));
}

/**
 * Identifica el primer ano en el cual la curva de interes compuesto supera a la de interes simple
 * en mas del 1% del valor base, ilustrando el punto de despegue exponencial.
 */
export function añoDeSeparacion(simple: number[], compuesto: number[]): number | null {
  for (let i = 1; i < simple.length; i++) {
    if (compuesto[i] > simple[i] * 1.01) return i;
  }
  return null;
}

/**
 * Opciones de frecuencia de capitalizacion con sus denominaciones tecnicas y numero de periodos por ano.
 */
export const OPCIONES_FRECUENCIA = [
  { valor: 1, nombre: "Anual", detalle: "1 vez al ano" },
  { valor: 2, nombre: "Semestral", detalle: "2 veces al ano" },
  { valor: 4, nombre: "Trimestral", detalle: "4 veces al ano" },
  { valor: 12, nombre: "Mensual", detalle: "12 veces al ano" },
  { valor: 365, nombre: "Diaria", detalle: "365 veces al ano" },
] as const;
