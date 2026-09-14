"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Props {
  modoInicial?: "login" | "registro";
}

/**
 * Modulo de autenticacion de usuarios y registro de cuentas.
 * 
 * Gestiona:
 * - Inicio de sesion mediante credenciales de correo electronico y contrasena.
 * - Creacion de nuevas cuentas de cliente vinculadas a Supabase Auth.
 * - Validacion de coincidencia de contrasenas en el registro.
 * - Presentacion limpia y minimalista sin elementos distractores ni iconos.
 */
export default function VentanaAuth({ modoInicial = "login" }: Props) {
  const { login, register } = useAuth();
  const [modo, setModo] = useState<"login" | "registro">(modoInicial);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Procesa el envio del formulario segun la modalidad activa (login o registro).
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (modo === "registro") {
      if (!nombre.trim()) {
        setError("Por favor ingresa tu nombre completo.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Las contrasenas no coinciden.");
        return;
      }
      if (password.length < 4) {
        setError("La contrasena debe tener al menos 4 caracteres.");
        return;
      }
    }

    setCargando(true);
    try {
      if (modo === "login") {
        await login(email, password);
      } else {
        await register(nombre, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Ocurrio un error al procesar la solicitud.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#eef0ea] bg-[length:28px_28px] [background-image:linear-gradient(to_right,rgba(20,32,42,.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,32,42,.045)_1px,transparent_1px)]">
      <header className="bg-[#14202a] px-6 py-4 text-white shadow-sm">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between">
          <span className="text-[18px] font-semibold tracking-tight">
            Calculadora Financiera
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded border border-[#d3d7cc] bg-white p-7 shadow-xs">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-[#14202a]">
                Bienvenido
              </h1>
              <p className="mt-1 text-sm text-[#5a6872]">
                {modo === "login"
                  ? "Ingresa tus credenciales para acceder a tus calculos"
                  : "Crea tu cuenta para guardar y consultar simulaciones financieras"}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded border border-[#f3b2a3] bg-[#fdf6f4] p-3 text-xs text-[#a3321e]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {modo === "registro" && (
                <div>
                  <label className="block text-xs font-medium text-[#5a6872]">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="mt-1 w-full rounded border border-[#d3d7cc] px-3 py-2 text-[14.5px] text-[#14202a] placeholder-[#9fb0ba] focus:border-[#2c5d8f] focus:ring-1 focus:ring-[#2c5d8f] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#5a6872]">
                  Correo electronico
                </label>
                <input
                  type="email"
                  required
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded border border-[#d3d7cc] px-3 py-2 text-[14.5px] text-[#14202a] placeholder-[#9fb0ba] focus:border-[#2c5d8f] focus:ring-1 focus:ring-[#2c5d8f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5a6872]">
                  Contrasena
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ingresa tu contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded border border-[#d3d7cc] px-3 py-2 text-[14.5px] text-[#14202a] placeholder-[#9fb0ba] focus:border-[#2c5d8f] focus:ring-1 focus:ring-[#2c5d8f] focus:outline-none"
                />
              </div>

              {modo === "registro" && (
                <div>
                  <label className="block text-xs font-medium text-[#5a6872]">
                    Confirmar contrasena
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repite la contrasena"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded border border-[#d3d7cc] px-3 py-2 text-[14.5px] text-[#14202a] placeholder-[#9fb0ba] focus:border-[#2c5d8f] focus:ring-1 focus:ring-[#2c5d8f] focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded bg-[#14202a] py-2.5 text-[14.5px] font-medium text-white transition hover:bg-[#203140] disabled:opacity-50 mt-2 cursor-pointer"
              >
                {cargando
                  ? "Procesando..."
                  : modo === "login"
                  ? "Ingresar a la Plataforma"
                  : "Registrarse como Cliente"}
              </button>
            </form>

            <div className="mt-4 text-center text-[13px] text-[#5a6872]">
              {modo === "login" ? (
                <>
                  ¿No tienes una cuenta aun?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setModo("registro");
                      setError(null);
                    }}
                    className="font-semibold text-[#2c5d8f] hover:underline cursor-pointer"
                  >
                    Registrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes una cuenta registrada?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setModo("login");
                      setError(null);
                    }}
                    className="font-semibold text-[#2c5d8f] hover:underline cursor-pointer"
                  >
                    Inicia sesion aqui
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
