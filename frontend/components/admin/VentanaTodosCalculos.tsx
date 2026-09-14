"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api, CalculoDTO } from "@/lib/api";
import { bs, pct } from "@/lib/formato";

/**
 * Panel de administracion: Registro Global de Calculos.
 * 
 * Permite a los supervisores consultar, auditar y filtrar la totalidad de simulaciones financieras
 * realizadas en la plataforma por cualquier cliente, con opcion a inspeccion detallada en modal.
 */
export default function VentanaTodosCalculos() {
  const [calculos, setCalculos] = useState<CalculoDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");
  const [calculoSeleccionado, setCalculoSeleccionado] = useState<CalculoDTO | null>(null);

  /**
   * Carga los calculos desde el backend aplicando los filtros de tipo y busqueda vigentes.
   */
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await api.admin.getTodosCalculos(
        filtroTipo || undefined,
        busqueda || undefined
      );
      setCalculos(data);
    } catch (err) {
      console.error("Error al cargar calculos en modulo de administracion:", err);
    } finally {
      setCargando(false);
    }
  }, [filtroTipo, busqueda]);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargar();
    }, 300);
    return () => clearTimeout(timer);
  }, [cargar]);

  return (
    <div>
      <header className="mb-7 max-w-[62ch] border-l-[3px] border-[#0284c7] pl-4">
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
            ADMINISTRACION
          </span>
        </div>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[#14202a]">
          Todos los Calculos del Sistema
        </h1>
        <p className="mt-1.5 text-[15px] text-[#5a6872]">
          Auditoria global de operaciones financieras registradas en la base de datos por todos los usuarios.
        </p>
      </header>

      <section className="rounded border border-[#d3d7cc] bg-white p-6">
        {/* Barra de filtros y busqueda */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-[#5a6872]">Tipo:</span>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="rounded border border-[#d3d7cc] px-2.5 py-1.5 text-xs font-medium text-[#14202a] focus:border-[#0284c7] focus:outline-none cursor-pointer"
              >
                <option value="">Todos los tipos</option>
                <option value="Simple">Interes Simple</option>
                <option value="Compuesto">Interes Compuesto</option>
                <option value="Comparacion">Comparacion</option>
              </select>
            </div>

            <button
              onClick={() => cargar()}
              disabled={cargando}
              className="rounded border border-[#d3d7cc] px-2.5 py-1.5 text-xs text-[#5a6872] hover:bg-[#f2f4ee] cursor-pointer"
            >
              Actualizar
            </button>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar por usuario o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded border border-[#d3d7cc] px-3 py-1.5 text-sm text-[#14202a] focus:border-[#0284c7] focus:outline-none"
            />
          </div>
        </div>

        {/* Tabla de simulaciones */}
        <div className="max-h-[500px] overflow-auto">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-left text-[12px] font-medium text-[#5a6872]">
                  Usuario
                </th>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-left text-[12px] font-medium text-[#5a6872]">
                  Tipo
                </th>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-right text-[12px] font-medium text-[#5a6872]">
                  Capital
                </th>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-right text-[12px] font-medium text-[#5a6872]">
                  Tasa
                </th>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-right text-[12px] font-medium text-[#5a6872]">
                  Plazo
                </th>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-right text-[12px] font-medium text-[#5a6872]">
                  Monto Final
                </th>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-right text-[12px] font-medium text-[#5a6872]">
                  Interes
                </th>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-right text-[12px] font-medium text-[#5a6872]">
                  Fecha
                </th>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-center text-[12px] font-medium text-[#5a6872]">
                  Accion
                </th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-[#5a6872]">
                    Cargando calculos...
                  </td>
                </tr>
              ) : calculos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-[#5a6872]">
                    No se encontraron calculos registrados con los filtros actuales.
                  </td>
                </tr>
              ) : (
                calculos.map((c) => (
                  <tr key={c.id} className="hover:bg-[#f7f9f4]">
                    <td className="border-b border-[#e6e8e1] px-3 py-2 text-[#14202a]">
                      <div className="font-medium text-xs text-[#14202a]">
                        {c.usuario?.nombre || "Invitado"}
                      </div>
                      <div className="text-[11px] text-[#5a6872]">
                        {c.usuario?.email || "Sin correo"}
                      </div>
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium ${
                          c.tipo === "Simple"
                            ? "bg-[#2c5d8f]/10 text-[#2c5d8f]"
                            : c.tipo === "Compuesto"
                            ? "bg-[#17714a]/10 text-[#17714a]"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {c.tipo}
                      </span>
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2 text-right font-mono text-xs">
                      {bs(c.capital)}
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2 text-right font-mono text-xs">
                      {pct(c.tasa)}
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2 text-right font-mono text-xs">
                      {c.anos} anos
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2 text-right font-mono font-medium text-xs text-[#14202a]">
                      {bs(c.final)}
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2 text-right font-mono text-xs text-[#17714a]">
                      {bs(c.interes)}
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2 text-right text-[11.5px] text-[#5a6872] whitespace-nowrap">
                      {c.fecha ? new Date(c.fecha).toLocaleDateString("es-BO") : "-"}
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2 text-center">
                      <button
                        onClick={() => setCalculoSeleccionado(c)}
                        className="rounded border border-[#d3d7cc] px-2 py-0.5 text-xs text-[#2c5d8f] hover:bg-[#f2f4ee] cursor-pointer"
                      >
                        Detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de inspeccion detallada del calculo */}
      {calculoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded border border-[#d3d7cc] bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between border-b border-[#e6e8e1] pb-3">
              <h3 className="text-lg font-semibold text-[#14202a]">
                Detalle del Calculo Financiero
              </h3>
              <button
                onClick={() => setCalculoSeleccionado(null)}
                className="text-[#5a6872] hover:text-[#14202a] text-lg font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 rounded bg-[#f7f9f4] p-3 border border-[#e6e8e1]">
                <div>
                  <span className="text-xs text-[#5a6872]">Cliente</span>
                  <div className="font-medium text-[#14202a]">
                    {calculoSeleccionado.usuario?.nombre || "Usuario Invitado"}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-[#5a6872]">Correo</span>
                  <div className="font-mono text-xs text-[#14202a]">
                    {calculoSeleccionado.usuario?.email || "Sin correo"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded border border-[#d3d7cc] p-2.5 text-center">
                  <span className="text-xs text-[#5a6872]">Tipo</span>
                  <div className="font-semibold text-xs text-[#14202a]">{calculoSeleccionado.tipo}</div>
                </div>
                <div className="rounded border border-[#d3d7cc] p-2.5 text-center">
                  <span className="text-xs text-[#5a6872]">Tasa</span>
                  <div className="font-mono font-semibold text-xs text-[#14202a]">{pct(calculoSeleccionado.tasa)}</div>
                </div>
                <div className="rounded border border-[#d3d7cc] p-2.5 text-center">
                  <span className="text-xs text-[#5a6872]">Plazo</span>
                  <div className="font-mono font-semibold text-xs text-[#14202a]">{calculoSeleccionado.anos} anos</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border border-[#d3d7cc] p-3 text-center">
                  <span className="text-xs text-[#5a6872]">Capital Inicial (P)</span>
                  <div className="font-mono text-lg font-bold text-[#14202a]">
                    {bs(calculoSeleccionado.capital)}
                  </div>
                </div>
                <div className="rounded border border-[#d3d7cc] p-3 text-center">
                  <span className="text-xs text-[#5a6872]">Interes Total (I)</span>
                  <div className="font-mono text-lg font-bold text-[#17714a]">
                    {bs(calculoSeleccionado.interes)}
                  </div>
                </div>
              </div>

              <div className="rounded border border-[#d3d7cc] bg-[#f2f4ee] p-3 text-center">
                <span className="text-xs text-[#5a6872]">Monto Final Acumulado (A)</span>
                <div className="font-mono text-2xl font-bold text-[#14202a]">
                  {bs(calculoSeleccionado.final)}
                </div>
              </div>

              <div className="text-right text-xs text-[#5a6872]">
                Fecha de registro: {calculoSeleccionado.fecha ? new Date(calculoSeleccionado.fecha).toLocaleString("es-BO") : "-"}
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setCalculoSeleccionado(null)}
                className="rounded bg-[#14202a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#203140] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
