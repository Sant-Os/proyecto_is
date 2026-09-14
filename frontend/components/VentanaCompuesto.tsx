"use client";

import { useMemo, useState } from "react";
import CampoNumero from "@/components/CampoNumero";
import GraficaLineas from "@/components/GraficaLineas";
import TarjetaResultado from "@/components/TarjetaResultado";
import type { CalculoDTO } from "@/lib/api";
import {
  interesCompuesto,
  OPCIONES_FRECUENCIA,
  serieCompuesta,
  tasaEfectivaAnual,
} from "@/lib/finanzas";
import {
  bs,
  pct,
  REGLA_CAPITAL,
  REGLA_TASA,
  REGLA_TIEMPO,
  validarNumero,
} from "@/lib/formato";

// Color institucional verde para las curvas de interes compuesto
const COLOR = "#17714a";

interface Props {
  registrar: (dato: Omit<CalculoDTO, "id" | "fecha">) => void;
}

/**
 * Modulo de calculo y proyeccion de Interes Compuesto.
 * 
 * Modela el crecimiento exponencial del capital al reinvertir intereses devengados
 * segun la frecuencia de capitalizacion seleccionada (anual, semestral, mensual, etc.).
 */
export default function VentanaCompuesto({ registrar }: Props) {
  const [capital, setCapital] = useState("0");
  const [tasa, setTasa] = useState("0");
  const [tiempo, setTiempo] = useState("0");
  const [frecuencia, setFrecuencia] = useState(12);
  const [errores, setErrores] = useState<Record<string, string | null>>({});
  const [resultado, setResultado] = useState<{
    capital: number;
    tasa: number;
    anos: number;
    frecuencia: number;
    final: number;
    serie: number[];
  } | null>(null);

  /**
   * Valida parametros de entrada, calcula el interes compuesto y persiste el calculo en el backend.
   */
  function calcular() {
    const c = validarNumero(capital, REGLA_CAPITAL);
    const t = validarNumero(tasa, REGLA_TASA);
    const n = validarNumero(tiempo, REGLA_TIEMPO);
    setErrores({ capital: c.error, tasa: t.error, tiempo: n.error });
    if (c.valor === null || t.valor === null || n.valor === null) return;

    const final = interesCompuesto(c.valor, t.valor, n.valor, frecuencia);
    const interesGanado = final - c.valor;
    const nombreFrec = OPCIONES_FRECUENCIA.find((o) => o.valor === frecuencia)?.nombre ?? "";

    setResultado({
      capital: c.valor,
      tasa: t.valor,
      anos: n.valor,
      frecuencia,
      final,
      serie: serieCompuesta(c.valor, t.valor, n.valor, frecuencia),
    });

    registrar({
      tipo: "Compuesto",
      capital: c.valor,
      tasa: t.valor,
      anos: n.valor,
      final,
      interes: interesGanado,
      extra: nombreFrec,
    });
  }

  /**
   * Restaura los campos al valor cero y restablece la frecuencia mensual predeterminada.
   */
  function restablecer() {
    setCapital("0");
    setTasa("0");
    setTiempo("0");
    setFrecuencia(12);
    setErrores({});
    setResultado(null);
  }

  /**
   * Genera el detalle periodo a periodo con el capital inicial, rendimiento anual y saldo final.
   */
  const detalle = useMemo(() => {
    if (!resultado) return [];
    return Array.from({ length: resultado.anos }, (_, i) => {
      const ano = i + 1;
      return {
        ano,
        inicio: resultado.serie[ano - 1],
        delAno: resultado.serie[ano] - resultado.serie[ano - 1],
        cierre: resultado.serie[ano],
      };
    });
  }, [resultado]);

  return (
    <div>
      <header className="mb-7 max-w-[62ch] border-l-[3px] border-[#17714a] pl-4">
        <h1 className="text-[28px] font-semibold tracking-tight text-[#14202a]">
          Interes compuesto
        </h1>
        <p className="mt-1.5 text-[15px] text-[#5a6872]">
          En cada periodo de capitalizacion, los intereses se integran al capital base para volver a generar nuevos rendimientos.
        </p>
        <p className="mt-2.5 font-mono text-[15px] text-[#14202a]">
          A = P * (1 + r/n)<sup className="text-[11px]">n*t</sup>
        </p>
      </header>

      {/* Fila 1: Panel de entrada ajustado a la izquierda y grafica interactiva a la derecha */}
      <div className="mb-5 grid w-full items-stretch gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded border border-[#d3d7cc] bg-white p-4.5 sm:p-5 flex flex-col justify-between">
          <div className="space-y-3.5">
            <CampoNumero
              etiqueta="Capital inicial"
              valor={capital}
              onChange={setCapital}
              error={errores.capital}
              unidadIzq="Bs"
              placeholder="0"
            />
            <CampoNumero
              etiqueta="Tasa de interes anual"
              valor={tasa}
              onChange={setTasa}
              error={errores.tasa}
              unidadDer="%"
              placeholder="0"
            />
            <CampoNumero
              etiqueta="Tiempo"
              valor={tiempo}
              onChange={setTiempo}
              error={errores.tiempo}
              unidadDer="anos"
              placeholder="0"
            />
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#5a6872]">
                Capitalizacion
              </label>
              <div className="flex items-stretch overflow-hidden rounded border border-[#d3d7cc] bg-white focus-within:border-[#14202a] focus-within:ring-2 focus-within:ring-[#14202a]/10">
                <select
                  value={frecuencia}
                  onChange={(e) => setFrecuencia(Number(e.target.value))}
                  className="w-full cursor-pointer bg-transparent px-3 py-2 text-[14px] text-[#14202a] outline-none"
                >
                  {OPCIONES_FRECUENCIA.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.nombre} ({o.detalle})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={calcular}
              className="flex-1 rounded border border-[#14202a] bg-[#14202a] py-2 text-[13.5px] font-medium text-white transition hover:bg-[#0c1820] cursor-pointer"
            >
              Calcular monto
            </button>
            <button
              onClick={restablecer}
              className="rounded border border-[#d3d7cc] bg-white px-3 py-2 text-[13.5px] font-medium text-[#14202a] transition hover:border-[#14202a] cursor-pointer"
            >
              Restablecer
            </button>
          </div>
        </div>

        {/* Grafica de progresion con ajuste de ancho garantizado */}
        <section className="min-w-0 w-full rounded border border-[#d3d7cc] bg-white p-5 flex flex-col justify-between min-h-[320px]">
          <h2 className="mb-2 text-[15px] font-semibold text-[#14202a]">
            Evolucion ano por ano
          </h2>
          {resultado ? (
            <GraficaLineas
              series={[{ nombre: "Interes compuesto", datos: resultado.serie, color: COLOR }]}
              alto={300}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-[14px] text-[#5a6872] min-h-[260px]">
              Ingresa los valores y pulsa Calcular monto para ver la grafica.
            </div>
          )}
        </section>
      </div>

      {/* Fila 2: Cuadro horizontal de resultados consolidados */}
      {resultado && (
        <div className="mb-5">
          <TarjetaResultado
            final={resultado.final}
            acento="compuesto"
            filas={[
              { etiqueta: "Capital inicial", valor: bs(resultado.capital) },
              { etiqueta: "Interes ganado", valor: bs(resultado.final - resultado.capital), ganancia: true },
              { etiqueta: "Tasa efectiva anual", valor: pct(tasaEfectivaAnual(resultado.tasa, resultado.frecuencia)) },
            ]}
          />
        </div>
      )}

      {/* Fila 3: Detalle anual completamente visible sin scrollbars */}
      {resultado && (
        <section className="rounded border border-[#d3d7cc] bg-white px-6 pb-6 pt-5">
          <h2 className="mb-3.5 text-[15px] font-semibold text-[#14202a]">
            Detalle anual
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr>
                  {["Ano", "Capital al inicio", "Interes del ano", "Capital al cierre"].map((c, i) => (
                    <th
                      key={c}
                      className={`border-b border-[#d3d7cc] bg-white px-3 py-2.5 text-[12.5px] font-medium text-[#5a6872] ${
                        i === 0 ? "text-left" : "text-right"
                      }`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detalle.map((f) => (
                  <tr key={f.ano} className="hover:bg-[#f7f9f4]">
                    <td className="border-b border-[#e6e8e1] px-3 py-2.5 text-left font-mono">{f.ano}</td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2.5 text-right font-mono">{bs(f.inicio)}</td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2.5 text-right font-mono">{bs(f.delAno)}</td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2.5 text-right font-mono font-medium">{bs(f.cierre)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
