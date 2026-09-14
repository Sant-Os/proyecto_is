"use client";

import { useMemo, useState } from "react";
import CampoNumero from "@/components/CampoNumero";
import GraficaLineas from "@/components/GraficaLineas";
import TarjetaResultado from "@/components/TarjetaResultado";
import type { CalculoDTO } from "@/lib/api";
import { interesSimple, serieSimple } from "@/lib/finanzas";
import {
  bs,
  pct,
  REGLA_CAPITAL,
  REGLA_TASA,
  REGLA_TIEMPO,
  validarNumero,
} from "@/lib/formato";

// Color institucional azul para las curvas de interes simple
const COLOR = "#2c5d8f";

interface Props {
  registrar: (dato: Omit<CalculoDTO, "id" | "fecha">) => void;
}

/**
 * Modulo de calculo y proyeccion de Interes Simple.
 * 
 * Arquitectura visual:
 * - Fila 1: Panel de entrada de datos ajustado a 280px con la grafica expandida al ancho restante.
 * - Fila 2: Cuadro de resultados en una sola fila horizontal continua para evitar espacios vacios.
 * - Fila 3: Detalle anual desglosado ano por ano de manera abierta y fluida sin barras de scroll.
 */
export default function VentanaSimple({ registrar }: Props) {
  const [capital, setCapital] = useState("0");
  const [tasa, setTasa] = useState("0");
  const [tiempo, setTiempo] = useState("0");
  const [errores, setErrores] = useState<Record<string, string | null>>({});
  const [resultado, setResultado] = useState<{
    capital: number;
    tasa: number;
    anos: number;
    final: number;
    serie: number[];
  } | null>(null);

  /**
   * Ejecuta la validacion de campos, calcula la progresion lineal y persiste el resultado en el backend.
   */
  function calcular() {
    const c = validarNumero(capital, REGLA_CAPITAL);
    const t = validarNumero(tasa, REGLA_TASA);
    const n = validarNumero(tiempo, REGLA_TIEMPO);
    setErrores({ capital: c.error, tasa: t.error, tiempo: n.error });
    if (c.valor === null || t.valor === null || n.valor === null) return;

    const final = interesSimple(c.valor, t.valor, n.valor);
    const interesGanado = final - c.valor;

    setResultado({
      capital: c.valor,
      tasa: t.valor,
      anos: n.valor,
      final,
      serie: serieSimple(c.valor, t.valor, n.valor),
    });

    registrar({
      tipo: "Simple",
      capital: c.valor,
      tasa: t.valor,
      anos: n.valor,
      final,
      interes: interesGanado,
      extra: "",
    });
  }

  /**
   * Restaura los parametros a sus valores iniciales en cero y limpia errores y resultados activos.
   */
  function restablecer() {
    setCapital("0");
    setTasa("0");
    setTiempo("0");
    setErrores({});
    setResultado(null);
  }

  /**
   * Genera el desglose tabular de cada ano para inspeccionar interes devengado, acumulado y saldo final.
   */
  const detalle = useMemo(() => {
    if (!resultado) return [];
    const interesAnual = resultado.capital * (resultado.tasa / 100);
    return Array.from({ length: resultado.anos }, (_, i) => {
      const ano = i + 1;
      return {
        ano,
        delAno: interesAnual,
        acumulado: interesAnual * ano,
        capital: resultado.serie[ano],
      };
    });
  }, [resultado]);

  return (
    <div>
      <header className="mb-7 max-w-[62ch] border-l-[3px] border-[#2c5d8f] pl-4">
        <h1 className="text-[28px] font-semibold tracking-tight text-[#14202a]">
          Interes simple
        </h1>
        <p className="mt-1.5 text-[15px] text-[#5a6872]">
          El interes se calcula siempre sobre el capital inicial, por lo que el crecimiento monetario es una linea recta constante.
        </p>
        <p className="mt-2.5 font-mono text-[15px] text-[#14202a]">
          A = P * (1 + r * t)
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
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={calcular}
              className="flex-1 rounded border border-[#14202a] bg-[#14202a] py-2 text-[13.5px] font-medium text-white transition hover:bg-[#0c1820] cursor-pointer"
            >
              Calcular interes
            </button>
            <button
              onClick={restablecer}
              className="rounded border border-[#d3d7cc] bg-white px-3 py-2 text-[13.5px] font-medium text-[#14202a] transition hover:border-[#14202a] cursor-pointer"
            >
              Restablecer
            </button>
          </div>
        </div>

        {/* Grafica de progresion anual acotada para respetar los margenes del contenedor */}
        <section className="min-w-0 w-full rounded border border-[#d3d7cc] bg-white p-5 flex flex-col justify-between min-h-[280px]">
          <h2 className="mb-2 text-[15px] font-semibold text-[#14202a]">
            Evolucion ano por ano
          </h2>
          {resultado ? (
            <GraficaLineas
              series={[{ nombre: "Interes simple", datos: resultado.serie, color: COLOR }]}
              alto={260}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-[14px] text-[#5a6872] min-h-[220px]">
              Ingresa los valores y pulsa Calcular interes para ver la grafica.
            </div>
          )}
        </section>
      </div>

      {/* Fila 2: Resumen horizontal de metricas clave */}
      {resultado && (
        <div className="mb-5">
          <TarjetaResultado
            final={resultado.final}
            acento="simple"
            filas={[
              { etiqueta: "Capital inicial", valor: bs(resultado.capital) },
              { etiqueta: "Interes ganado", valor: bs(resultado.final - resultado.capital), ganancia: true },
              {
                etiqueta: "Crecimiento total",
                valor: pct(resultado.capital > 0 ? ((resultado.final - resultado.capital) / resultado.capital) * 100 : 0),
              },
            ]}
          />
        </div>
      )}

      {/* Fila 3: Tabla de desglose anual abierto sin scroll vertical */}
      {resultado && (
        <section className="rounded border border-[#d3d7cc] bg-white px-6 pb-6 pt-5">
          <h2 className="mb-3.5 text-[15px] font-semibold text-[#14202a]">
            Detalle anual
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr>
                  {["Ano", "Interes del ano", "Interes acumulado", "Capital"].map((c, i) => (
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
                    <td className="border-b border-[#e6e8e1] px-3 py-2.5 text-right font-mono">{bs(f.delAno)}</td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2.5 text-right font-mono">{bs(f.acumulado)}</td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2.5 text-right font-mono font-medium">{bs(f.capital)}</td>
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
