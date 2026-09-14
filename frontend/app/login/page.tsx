"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import VentanaAuth from "@/components/VentanaAuth";
import { useAuth } from "@/context/AuthContext";

/**
 * Ruta dedicada para inicio de sesion (/login).
 * Si el usuario ya posee una sesion activa autenticada, lo redirige de inmediato a la raiz.
 */
export default function LoginPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && usuario) {
      router.push("/");
    }
  }, [usuario, cargando, router]);

  return <VentanaAuth modoInicial="login" />;
}
