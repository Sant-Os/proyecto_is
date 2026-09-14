"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * Encabezado superior de la aplicacion.
 * 
 * Muestra el titulo institucional de la plataforma, el perfil del usuario autenticado,
 * su rol oficial ('ADMIN' o 'USUARIO') mediante un distintivo con estilos contextuales,
 * y el control para cerrar sesion de forma segura.
 */
export default function Header() {
  const { usuario, esAdmin, logout } = useAuth();

  return (
    <header className="bg-[#14202a] px-6 pt-[18px] text-[#f4f6f2] shadow-sm">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-y-3 pb-3.5">
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <span className="text-[20px] font-semibold tracking-tight text-white">
            Calculadora Financiera
          </span>
        </div>

        <div className="flex items-center gap-3">
          {usuario && (
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase ${
                  esAdmin
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                    : "bg-blue-400/20 text-blue-200 border border-blue-400/30"
                }`}
              >
                {esAdmin ? "ADMIN" : "USUARIO"}
              </span>
              <span className="hidden sm:inline text-xs text-[#b9c7cf]">
                {usuario.nombre} ({usuario.email})
              </span>
              <button
                onClick={logout}
                title="Cerrar sesion"
                className="rounded border border-[#e4c4bc]/40 bg-[#a3321e]/20 px-2.5 py-1 text-[11.5px] font-semibold text-[#f8b4a8] transition hover:bg-[#a3321e]/40 hover:text-white"
              >
                Cerrar sesion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
