"use client";

import { useAuth } from "@/context/AuthContext";
import Calculadora from "@/components/Calculadora";
import VentanaAuth from "@/components/VentanaAuth";

/**
 * Punto de entrada principal de la aplicacion (Ruta raiz '/').
 * 
 * Evalua de forma reactiva el estado de autenticacion:
 * 1. Durante la rehidratacion del token JWT: Muestra indicador de carga.
 * 2. Si no existe sesion activa: Presenta el portal de ingreso y registro (VentanaAuth).
 * 3. Con sesion confirmada: Carga el panel interactivo de la Calculadora Financiera.
 */
export default function Home() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef0ea]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#14202a] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-[#5a6872]">
            Cargando plataforma financiera...
          </span>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <VentanaAuth />;
  }

  return <Calculadora />;
}
