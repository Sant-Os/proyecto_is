"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import VentanaAuth from "@/components/VentanaAuth";
import { useAuth } from "@/context/AuthContext";

/**
 * Ruta dedicada para registro de nuevos clientes (/registro).
 * Si el usuario ya cuenta con sesion activa, lo redirige automaticamente a la raiz.
 */
export default function RegistroPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && usuario) {
      router.push("/");
    }
  }, [usuario, cargando, router]);

  return <VentanaAuth modoInicial="registro" />;
}
