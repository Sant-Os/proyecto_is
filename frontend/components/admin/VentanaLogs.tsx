"use client";

import React, { useEffect, useState } from "react";
import { api, LogDTO } from "@/lib/api";

/**
 * Panel de administracion: Bitacora de Auditoria y Eventos de Seguridad.
 * 
 * Permite monitorear la trazabilidad completa del sistema:
 * - Intentos de inicio de sesion (exitosos y fallidos con IP).
 * - Registro de simulaciones financieras.
 * - Limpieza y eliminacion de historiales.
 * - Actividades y consultas realizadas por administradores.
 */
export default function VentanaLogs() {
  const [logs, setLogs] = useState<LogDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  /**
   * Consulta las ultimas 200 entradas de auditoria desde el backend.
   */
  async function cargar() {
    setCargando(true);
    try {
      const data = await api.admin.getLogs();
      setLogs(data);
    } catch (err) {
      console.error("Error al cargar logs de auditoria:", err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  // Filtrado de eventos en memoria segun accion, detalle o correo del usuario
  const logsFiltrados = logs.filter(
    (l) =>
      l.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.detalle.toLowerCase().includes(busqueda.toLowerCase()) ||
      (l.usuario?.email && l.usuario.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  /**
   * Asigna estilos visuales contextuales a la insignia de la accion segun su severidad.
   */
  function getBadgeEstilo(accion: string) {
    if (accion.includes("LOGIN_EXITOSO") || accion.includes("LOGIN_DEMO")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (accion.includes("FALLIDO")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (accion.includes("CALCULO")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (accion.includes("LIMPIADO") || accion.includes("ELIMINADO")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (accion.includes("ADMIN")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    return "bg-gray-50 text-gray-700 border-gray-200";
  }

  return (
    <div>
      <header className="mb-7 max-w-[62ch] border-l-[3px] border-[#8a4baf] pl-4">
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
            ADMINISTRACION
          </span>
        </div>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[#14202a]">
          Logs del Sistema y Auditoria
        </h1>
        <p className="mt-1.5 text-[15px] text-[#5a6872]">
          Trazabilidad cronologica de accesos, simulaciones financieras, eventos de seguridad y consultas de administracion.
        </p>
      </header>

      <section className="rounded border border-[#d3d7cc] bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-[#14202a]">
              Eventos registrados
              <span className="ml-1.5 inline-block rounded-full border border-[#d3d7cc] bg-[#f2f4ee] px-2.5 py-px font-mono text-[12px] text-[#5a6872]">
                {logsFiltrados.length}
              </span>
            </h2>
            <button
              onClick={cargar}
              disabled={cargando}
              className="rounded border border-[#d3d7cc] p-1 text-xs text-[#5a6872] hover:bg-[#f2f4ee] cursor-pointer"
              title="Refrescar logs"
            >
              Actualizar
            </button>
          </div>

          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar por accion, usuario o detalle..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded border border-[#d3d7cc] px-3 py-1.5 text-sm text-[#14202a] focus:border-[#8a4baf] focus:outline-none"
            />
          </div>
        </div>

        <div className="max-h-[460px] overflow-auto">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-left text-[12px] font-medium text-[#5a6872]">
                  Accion / Evento
                </th>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-left text-[12px] font-medium text-[#5a6872]">
                  Detalle
                </th>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-left text-[12px] font-medium text-[#5a6872]">
                  Usuario
                </th>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-center text-[12px] font-medium text-[#5a6872]">
                  IP
                </th>
                <th className="sticky top-0 border-b border-[#d3d7cc] bg-white px-3 py-2 text-right text-[12px] font-medium text-[#5a6872]">
                  Fecha y Hora
                </th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[#5a6872]">
                    Cargando eventos de auditoria...
                  </td>
                </tr>
              ) : logsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[#5a6872]">
                    No se registraron logs coincidentes.
                  </td>
                </tr>
              ) : (
                logsFiltrados.map((l) => (
                  <tr key={l.id} className="hover:bg-[#f7f9f4]">
                    <td className="border-b border-[#e6e8e1] px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-block rounded border px-2 py-0.5 text-[11px] font-mono font-bold ${getBadgeEstilo(
                          l.accion
                        )}`}
                      >
                        {l.accion}
                      </span>
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2 text-[#14202a]">
                      {l.detalle}
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2 whitespace-nowrap">
                      {l.usuario ? (
                        <div>
                          <span className="font-medium text-[#14202a]">{l.usuario.nombre}</span>
                          <span className="ml-1 text-[11px] text-[#5a6872]">({l.usuario.email})</span>
                        </div>
                      ) : (
                        <span className="italic text-xs text-[#8a98a0]">Sistema / Anonimo</span>
                      )}
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2 text-center font-mono text-xs text-[#5a6872]">
                      {l.ip || "127.0.0.1"}
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2 text-right font-mono text-xs text-[#5a6872] whitespace-nowrap">
                      {new Date(l.fecha).toLocaleString("es-BO")}
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
