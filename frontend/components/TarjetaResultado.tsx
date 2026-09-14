"use client";

import { bs } from "@/lib/formato";

export interface FilaResumen {
  etiqueta: string;
  valor: string;
  ganancia?: boolean;
}

interface Props {
  final: number;
  filas: FilaResumen[];
  acento?: "simple" | "compuesto";
}

/**
 * Tarjeta de resultados financieros consolidada en una sola fila horizontal continua.
 * 
 * Distribucion de columnas (grid-cols-4):
 * - Columna 1: Monto final acumulado (A) con tipografia destacada en color blanco.
 * - Columna 2: Capital original invertido.
 * - Columna 3: Interes total devengado con acento esmeralda.
 * - Columna 4: Rendimiento porcentual (crecimiento global en simple, TEA en compuesto).
 * 
 * Este formato horizontal aprovecha el ancho completo y elimina espacios vacios debajo de la grafica.
 */
export default function TarjetaResultado({ final, filas }: Props) {
  return (
    <div className="rounded border border-[#14202a] bg-[#14202a] p-5 text-white shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-center">
        {/* Metrica principal: Monto final acumulado */}
        <div className="lg:border-r lg:border-[#2a3845] lg:pr-4">
          <span className="block text-[12px] font-medium text-[#8fa1af] uppercase tracking-wider">
            Capital final
          </span>
          <div className="mt-1 font-mono text-[22px] font-semibold text-white tracking-tight">
            {bs(final)}
          </div>
        </div>

        {/* Metricas complementarias en columnas sucesivas */}
        {filas.map((f, i) => (
          <div
            key={f.etiqueta}
            className={`${
              i < filas.length - 1 ? "lg:border-r lg:border-[#2a3845] lg:pr-4" : ""
            }`}
          >
            <span className="block text-[12px] font-medium text-[#8fa1af]">
              {f.etiqueta}
            </span>
            <div
              className={`mt-1 font-mono text-[16px] font-semibold ${
                f.ganancia ? "text-[#4ade80]" : "text-white"
              }`}
            >
              {f.valor}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
