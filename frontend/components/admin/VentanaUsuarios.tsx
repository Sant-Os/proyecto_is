"use client";

import React, { useEffect, useState } from "react";
import { api, UsuarioAdminDTO } from "@/lib/api";

/**
 * Panel de administracion: Directorio de Usuarios Comunes.
 * 
 * Permite a los supervisores inspeccionar la lista de clientes registrados en el sistema,
 * evaluar el volumen de simulaciones generadas por cada uno y filtrar por nombre o correo.
 */
export default function VentanaUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioAdminDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  /**
   * Carga el listado de usuarios desde la API administrativa.
   */
  async function cargar() {
    setCargando(true);
    try {
      const data = await api.admin.getUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  // Filtrado de usuarios en memoria segun el termino ingresado
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <header className="mb-7 max-w-[62ch] border-l-[3px] border-[#d97706] pl-4">
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
            ADMINISTRACION
          </span>
        </div>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[#14202a]">
          Usuarios Comunes
        </h1>
        <p className="mt-1.5 text-[15px] text-[#5a6872]">
          Listado de clientes registrados en la plataforma. Permite supervisar su actividad y volumen de calculos realizados.
        </p>
      </header>

      {/* Tarjetas resumen de metricas de clientes */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded border border-[#d3d7cc] bg-white p-4">
          <span className="text-xs font-medium text-[#5a6872]">Total Usuarios Registrados</span>
          <div className="mt-1 text-2xl font-bold text-[#14202a]">{usuarios.length}</div>
        </div>
        <div className="rounded border border-[#d3d7cc] bg-white p-4">
          <span className="text-xs font-medium text-[#5a6872]">Usuarios con Calculos</span>
          <div className="mt-1 text-2xl font-bold text-[#17714a]">
            {usuarios.filter((u) => (u._count?.calculos || 0) > 0).length}
          </div>
        </div>
        <div className="rounded border border-[#d3d7cc] bg-white p-4">
          <span className="text-xs font-medium text-[#5a6872]">Tasa de Actividad</span>
          <div className="mt-1 text-2xl font-bold text-[#2c5d8f]">
            {usuarios.length > 0
              ? `${Math.round(
                  (usuarios.filter((u) => (u._count?.calculos || 0) > 0).length / usuarios.length) * 100
                )}%`
              : "0%"}
          </div>
        </div>
      </div>

      {/* Tabla de usuarios con buscador */}
      <section className="rounded border border-[#d3d7cc] bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-[#14202a]">
              Directorio de Clientes
              <span className="ml-1.5 inline-block rounded-full border border-[#d3d7cc] bg-[#f2f4ee] px-2.5 py-px font-mono text-[12px] text-[#5a6872]">
                {usuariosFiltrados.length}
              </span>
            </h2>
            <button
              onClick={cargar}
              disabled={cargando}
              className="rounded border border-[#d3d7cc] p-1 text-xs text-[#5a6872] hover:bg-[#f2f4ee] cursor-pointer"
              title="Refrescar listado"
            >
              Actualizar
            </button>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded border border-[#d3d7cc] px-3 py-1.5 text-sm text-[#14202a] focus:border-[#d97706] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr>
                <th className="border-b border-[#d3d7cc] bg-white px-3 py-2 text-left text-[12.5px] font-medium text-[#5a6872]">
                  Nombre
                </th>
                <th className="border-b border-[#d3d7cc] bg-white px-3 py-2 text-left text-[12.5px] font-medium text-[#5a6872]">
                  Correo electronico
                </th>
                <th className="border-b border-[#d3d7cc] bg-white px-3 py-2 text-center text-[12.5px] font-medium text-[#5a6872]">
                  Rol
                </th>
                <th className="border-b border-[#d3d7cc] bg-white px-3 py-2 text-right text-[12.5px] font-medium text-[#5a6872]">
                  Calculos Realizados
                </th>
                <th className="border-b border-[#d3d7cc] bg-white px-3 py-2 text-right text-[12.5px] font-medium text-[#5a6872]">
                  Fecha de Registro
                </th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[#5a6872]">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[#5a6872]">
                    No se encontraron usuarios comunes registrados.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f7f9f4]">
                    <td className="border-b border-[#e6e8e1] px-3 py-2.5 font-medium text-[#14202a]">
                      {u.nombre}
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2.5 font-mono text-sm text-[#5a6872]">
                      {u.email}
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2.5 text-center">
                      <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                        {u.rol}
                      </span>
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2.5 text-right font-mono font-bold text-[#14202a]">
                      {u._count?.calculos ?? 0}
                    </td>
                    <td className="border-b border-[#e6e8e1] px-3 py-2.5 text-right text-[13px] text-[#5a6872]">
                      {u.creadoEn ? new Date(u.creadoEn).toLocaleDateString("es-BO") : "-"}
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
