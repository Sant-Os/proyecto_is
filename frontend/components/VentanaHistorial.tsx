"use client";

import React from "react";
import { CalculoDTO } from "@/lib/api";
import { bs, pct } from "@/lib/formato";

interface Props {
  consultas: CalculoDTO[];
  limpiar: () => void;
  cargando?: boolean;
  recargar?: () => void;
}

/**
 * Formatea fechas ISO a una representacion legible de fecha y hora local (es-BO).
 */
function fechaCorta(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const fecha = d.toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit" });
  const hora = d.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
  return `${fecha} · ${hora}`;
}

/**
 * Modulo de consulta del historial de simulaciones personales.
 * 
 * Muestra la relacion de calculos guardados por el usuario autenticado en la base de datos Supabase,
 * con soporte para sincronizacion bajo demanda y eliminacion total con confirmacion preventiva.
 */
export default function VentanaHistorial({ consultas, limpiar, cargando, recargar }: Props) {
  /**
   * Solicita confirmacion al usuario antes de proceder a vaciar los registros de la base de datos.
   */
  function pedirLimpieza() {
    if (consultas.length === 0) return;
    if (confirm(`Se van a borrar las ${consultas.length} consultas guardadas en la base de datos. ¿Deseas continuar?`)) {
      limpiar();
    }
  }

  return (
    <div>
      <header className="mb-7 max-w-[62ch] border-l-[3px] border-[#14202a] pl-4">
        <h1 className="text-[28px] font-semibold tracking-tight text-[#14202a]">
          Mi Historial
        </h1>
        <p className="mt-1.5 text-[15px] text-[#5a6872]">
          Cada calculo realizado queda guardado en la base de datos PostgreSQL asociado a tu cuenta, con las variables utilizadas y los resultados proyectados.
        </p>
      </header>

      <section className="rounded border border-[#d3d7cc] bg-white px-6 pb-5 pt-5">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-[#14202a]">
              Consultas guardadas
              <span className="ml-1.5 inline-block rounded-full border border-[#d3d7cc] bg-[#f2f4ee] px-2.5 py-px font-mono text-[12px] text-[#5a6872]">
                {consultas.length}
              </span>
            </h2>
            {recargar && (
              <button
                onClick={recargar}
                disabled={cargando}
                title="Sincronizar con base de datos"
                className="rounded border border-[#d3d7cc] p-1 text-xs text-[#5a6872] hover:bg-[#f2f4ee] cursor-pointer"
              >
                Actualizar
              </button>
            )}
          </div>

          <button
            onClick={pedirLimpieza}
            disabled={consultas.length === 0 || cargando}
            className="rounded border border-[#e4c4bc] px-[18px] py-2.5 text-[14.5px] font-medium text-[#a3321e] transition hover:border-[#a3321e] hover:bg-[#fdf6f4] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            Limpiar historial
          </button>
        </div>

        <div className="max-h-[440px] overflow-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr>
                {["Tipo", "Capital", "Tasa", "Tiempo", "Capital final", "Interes", "Fecha"].map((c, i) => (
                  <th
                    key={c}
                    className={`sticky top-0 whitespace-nowrap border-b border-[#d3d7cc] bg-white px-3 py-2 text-[12.5px] font-medium text-[#5a6872] ${
                      i === 0 ? "text-left" : "text-right"
                    }`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[#5a6872]">
                    Cargando historial desde la API...
                  </td>
                </tr>
              ) : consultas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[#5a6872]">
                    Todavia no hay consultas guardadas. Realiza una simulacion en las otras ventanas y se registrara automaticamente.
                  </td>
                </tr>
              ) : (
                consultas.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-[#f7f9f4]">
                    <td className="border-b border-[#e6e8e1] px-3 py-2">
                      <span
                        className={`inline-block whitespace-nowrap rounded px-2.5 py-0.5 text-[12.5px] font-medium ${
                          r.tipo === "Simple"
                            ? "bg-[#2c5d8f]/10 text-[#2c5d8f]"
                            : r.tipo === "Compuesto"
                            ? "bg-[#17714a]/10 text-[#17714a]"
                            : "bg-purple-100 text-purple-800 border border-purple-200"
                        }`}
                      >
                        {r.tipo === "Comparacion" ? "Comparacion" : r.tipo}
                      </span>
                    </td>
                    <td className="whitespace-nowrap border-b border-[#e6e8e1] px-3 py-2 text-right font-mono">
                      {bs(r.capital)}
                    </td>
                    <td className="whitespace-nowrap border-b border-[#e6e8e1] px-3 py-2 text-right font-mono">
                      {pct(r.tasa)}
                      {r.extra ? ` · ${r.extra}` : ""}
                    </td>
                    <td className="whitespace-nowrap border-b border-[#e6e8e1] px-3 py-2 text-right font-mono">
                      {r.anos} {r.anos === 1 ? "ano" : "anos"}
                    </td>
                    <td className="whitespace-nowrap border-b border-[#e6e8e1] px-3 py-2 text-right font-mono">
                      {bs(r.final)}
                    </td>
                    <td className="whitespace-nowrap border-b border-[#e6e8e1] px-3 py-2 text-right font-mono text-[#17714a]">
                      {bs(r.interes)}
                    </td>
                    <td className="whitespace-nowrap border-b border-[#e6e8e1] px-3 py-2 text-right text-[13px] text-[#5a6872]">
                      {fechaCorta(r.fecha)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
