"use client";

import { useState } from "react";
import CampoNumero from "@/components/CampoNumero";
import GraficaLineas from "@/components/GraficaLineas";
import type { CalculoDTO } from "@/lib/api";
import {
  añoDeSeparacion,
  OPCIONES_FRECUENCIA,
  serieCompuesta,
  serieSimple,
} from "@/lib/finanzas";
import {
  bs,
  REGLA_CAPITAL,
  REGLA_TASA,
  REGLA_TIEMPO,
  validarNumero,
} from "@/lib/formato";

// Paleta cromatica distintiva para cada modelo
const SIMPLE = "#2c5d8f";
const COMPUESTO = "#17714a";

interface Props {
  registrar?: (dato: Omit<CalculoDTO, "id" | "fecha">) => void;
}

/**
 * Modulo de analisis comparativo directo entre Interes Simple y Compuesto.
 * 
 * Permite contrastar ambas metodologias de rendimiento financiero bajo exactamente
 * las mismas variables de entrada (capital, tasa anual, plazo y frecuencia de capitalizacion).
 */
export default function VentanaComparacion({ registrar }: Props) {
  const [capital, setCapital] = useState("0");
  const [tasa, setTasa] = useState("0");
  const [tiempo, setTiempo] = useState("0");
  const [frecuencia, setFrecuencia] = useState(12);
  const [errores, setErrores] = useState<Record<string, string | null>>({});
  const [datos, setDatos] = useState<{ simple: number[]; compuesto: number[] } | null>(null);

  /**
   * Ejecuta la simulacion paralela de ambas modalidades y guarda el registro en el historial.
   */
  function actualizar() {
    const c = validarNumero(capital, REGLA_CAPITAL);
    const t = validarNumero(tasa, REGLA_TASA);
    const n = validarNumero(tiempo, REGLA_TIEMPO);
    setErrores({ capital: c.error, tasa: t.error, tiempo: n.error });
    if (c.valor === null || t.valor === null || n.valor === null) return;

    const serieS = serieSimple(c.valor, t.valor, n.valor);
    const serieC = serieCompuesta(c.valor, t.valor, n.valor, frecuencia);
    setDatos({
      simple: serieS,
      compuesto: serieC,
    });

    if (registrar) {
      const fSimple = serieS[serieS.length - 1];
      const fCompuesto = serieC[serieC.length - 1];
      const opcFrec = OPCIONES_FRECUENCIA.find((o) => o.valor === frecuencia);
      const nombreFrec = opcFrec ? opcFrec.nombre : `${frecuencia}/ano`;

      registrar({
        tipo: "Comparacion",
        capital: c.valor,
        tasa: t.valor,
        anos: n.valor,
        final: fCompuesto,
        interes: fCompuesto - c.valor,
        extra: `Compuesto: ${bs(fCompuesto)} vs Simple: ${bs(fSimple)} (${nombreFrec})`,
      });
    }
  }

  /**
   * Restablece los parametros a cero y limpia el estado de las graficas.
   */
  function restablecer() {
    setCapital("0");
    setTasa("0");
    setTiempo("0");
    setFrecuencia(12);
    setErrores({});
    setDatos(null);
  }

  const finalSimple = datos ? datos.simple[datos.simple.length - 1] : 0;
  const finalCompuesto = datos ? datos.compuesto[datos.compuesto.length - 1] : 0;
  const cruce = datos ? añoDeSeparacion(datos.simple, datos.compuesto) : null;

  // Bloques de resumen comparativo para el pie del modulo
  const celdas = [
    { titulo: "Capital final con interes simple", valor: bs(finalSimple) },
    { titulo: "Capital final con interes compuesto", valor: bs(finalCompuesto) },
    { titulo: "Diferencia a favor del compuesto", valor: bs(finalCompuesto - finalSimple), ganancia: true },
    { titulo: "Punto de despegue exponencial", valor: cruce ? `Ano ${cruce}` : "No apreciable" },
  ];

  return (
    <div>
      <header className="mb-7 max-w-[62ch] border-l-[3px] border-[#14202a] pl-4">
        <h1 className="text-[28px] font-semibold tracking-tight text-[#14202a]">
          Comparacion
        </h1>
        <p className="mt-1.5 text-[15px] text-[#5a6872]">
          Ambas formulas financieras aplicadas sobre los mismos parametros para visualizar como se separan en el tiempo.
        </p>
      </header>

      {/* Formulario horizontal para comparacion directa */}
      <div className="mb-5 grid items-start gap-4 rounded border border-[#d3d7cc] bg-white p-6 md:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto]">
        <CampoNumero
          etiqueta="Capital inicial"
          valor={capital}
          onChange={setCapital}
          error={errores.capital}
          unidadIzq="Bs"
          placeholder="0"
        />
        <CampoNumero
          etiqueta="Tasa anual"
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
              className="w-full cursor-pointer bg-transparent px-3 py-2.5 text-[15px] text-[#14202a] outline-none"
            >
              {OPCIONES_FRECUENCIA.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.nombre}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1 min-h-[17px]" />
        </div>
        <div className="flex items-start gap-2 pt-[26px]">
          <button
            onClick={actualizar}
            className="rounded border border-[#14202a] bg-[#14202a] px-[18px] py-2.5 text-[14.5px] font-medium text-white transition hover:bg-[#0c1820] cursor-pointer"
          >
            Actualizar grafica
          </button>
          <button
            onClick={restablecer}
            className="rounded border border-[#d3d7cc] bg-white px-[14px] py-2.5 text-[14.5px] font-medium text-[#5a6872] transition hover:border-[#14202a] cursor-pointer"
          >
            Restablecer
          </button>
        </div>
      </div>

      {/* Contenedor del grafico comparativo con ambas curvas superpuestas */}
      <section className="mb-5 min-w-0 w-full rounded border border-[#d3d7cc] bg-white px-6 pb-6 pt-5">
        <div className="mb-3.5 flex gap-5">
          <span className="flex items-center gap-2 text-[13.5px] text-[#2c5d8f]">
            <span className="h-[3px] w-[18px] rounded bg-[#2c5d8f]" />
            Interes simple
          </span>
          <span className="flex items-center gap-2 text-[13.5px] text-[#17714a]">
            <span className="h-[3px] w-[18px] rounded bg-[#17714a]" />
            Interes compuesto
          </span>
        </div>
        {datos ? (
          <GraficaLineas
            alto={380}
            series={[
              { nombre: "Interes simple", datos: datos.simple, color: SIMPLE },
              { nombre: "Interes compuesto", datos: datos.compuesto, color: COMPUESTO, punteada: true },
            ]}
          />
        ) : (
          <div className="flex h-[380px] items-center justify-center text-[14px] text-[#5a6872]">
            Ingresa los valores y pulsa Actualizar grafica para ver la comparativa.
          </div>
        )}
      </section>

      {/* Resumen comparativo de cuatro columnas */}
      {datos && (
        <div className="grid grid-cols-1 rounded border border-[#d3d7cc] bg-white sm:grid-cols-2 lg:grid-cols-4">
          {celdas.map((c, i) => (
            <div
              key={c.titulo}
              className={`px-5 py-4 ${
                i < celdas.length - 1 ? "border-b border-[#e6e8e1] lg:border-b-0 lg:border-r" : ""
              }`}
            >
              <span className="mb-1.5 block text-[12.5px] text-[#5a6872]">
                {c.titulo}
              </span>
              <strong
                className={`font-mono text-[18px] font-medium ${
                  c.ganancia ? "text-[#17714a]" : "text-[#14202a]"
                }`}
              >
                {c.valor}
              </strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
