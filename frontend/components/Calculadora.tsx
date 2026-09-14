"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import VentanaSimple from "@/components/VentanaSimple";
import VentanaCompuesto from "@/components/VentanaCompuesto";
import VentanaComparacion from "@/components/VentanaComparacion";
import VentanaHistorial from "@/components/VentanaHistorial";
import VentanaUsuarios from "@/components/admin/VentanaUsuarios";
import VentanaTodosCalculos from "@/components/admin/VentanaTodosCalculos";
import VentanaLogs from "@/components/admin/VentanaLogs";
import { useAuth } from "@/context/AuthContext";
import { api, CalculoDTO } from "@/lib/api";

type Ventana =
  | "simple"
  | "compuesto"
  | "grafica"
  | "historial"
  | "usuarios"
  | "todosCalculos"
  | "logs";

interface PestanaConfig {
  clave: Ventana;
  texto: string;
  soloAdmin?: boolean;
}

// Catalogo de pestanas disponibles en la plataforma con control de acceso por rol
const TODAS_PESTANAS: PestanaConfig[] = [
  { clave: "simple", texto: "Interes simple" },
  { clave: "compuesto", texto: "Interes compuesto" },
  { clave: "grafica", texto: "Comparacion" },
  { clave: "historial", texto: "Mi Historial" },
  { clave: "usuarios", texto: "Usuarios Comunes", soloAdmin: true },
  { clave: "todosCalculos", texto: "Todos los Calculos", soloAdmin: true },
  { clave: "logs", texto: "Logs del Sistema", soloAdmin: true },
];

/**
 * Componente principal de la aplicacion (Dashboard).
 * 
 * Gestiona:
 * - La navegacion por pestanas con visibilidad condicional para administradores.
 * - La persistencia y recarga asincrona del historial de calculos desde la API.
 * - La conexion de eventos de registro entre los formularios y la base de datos.
 */
export default function Calculadora() {
  const { esAdmin } = useAuth();
  const [ventana, setVentana] = useState<Ventana>("simple");
  const [consultas, setConsultas] = useState<CalculoDTO[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  /**
   * Obtiene el listado de calculos registrados para el usuario actual.
   */
  const cargarHistorial = useCallback(async () => {
    setCargandoHistorial(true);
    try {
      const data = await api.calculos.historial();
      setConsultas(data);
    } catch (err) {
      console.error("Error al cargar historial desde API:", err);
    } finally {
      setCargandoHistorial(false);
    }
  }, []);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  /**
   * Persiste un calculo en el backend e incorpora optimistamente el resultado en el estado local.
   */
  async function registrarCalculo(dato: Omit<CalculoDTO, "id" | "fecha">) {
    try {
      const nuevo = await api.calculos.crear(dato);
      setConsultas((prev) => [nuevo, ...prev]);
    } catch (err) {
      console.error("Error al registrar calculo en API:", err);
      setConsultas((prev) => [
        {
          ...dato,
          id: crypto.randomUUID(),
          fecha: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  }

  /**
   * Vacia el historial de calculos en el backend y limpia el estado visual.
   */
  async function limpiarHistorial() {
    try {
      await api.calculos.limpiar();
      setConsultas([]);
    } catch (err) {
      console.error("Error al limpiar historial en API:", err);
      setConsultas([]);
    }
  }

  // Filtrado de pestanas segun el rol del usuario en sesion
  const pestanasVisibles = TODAS_PESTANAS.filter((p) => !p.soloAdmin || esAdmin);

  return (
    <div className="min-h-screen bg-[#eef0ea] bg-[length:28px_28px] [background-image:linear-gradient(to_right,rgba(20,32,42,.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,32,42,.045)_1px,transparent_1px)]">
      <Header />

      {/* Barra de navegacion entre modulos funcionales */}
      <div className="bg-[#14202a] px-6 border-t border-[#223342]">
        <nav className="mx-auto flex max-w-[1180px] gap-1 overflow-x-auto" aria-label="Ventanas">
          {pestanasVisibles.map((p) => {
            const activa = ventana === p.clave;
            return (
              <button
                key={p.clave}
                onClick={() => setVentana(p.clave)}
                aria-current={activa ? "page" : undefined}
                className={`whitespace-nowrap border-b-[3px] px-4 py-2.5 text-[14px] font-medium transition cursor-pointer ${
                  activa
                    ? "rounded-t border-b-[#eef0ea] bg-[#eef0ea] text-[#14202a] shadow-xs"
                    : "border-b-transparent text-[#b9c7cf] hover:text-white"
                } ${p.soloAdmin ? "text-amber-200 hover:text-amber-100" : ""}`}
              >
                {p.texto}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenedor del modulo seleccionado */}
      <main className="mx-auto max-w-[1180px] px-6 pb-14 pt-8">
        {ventana === "simple" && <VentanaSimple registrar={registrarCalculo} />}
        {ventana === "compuesto" && <VentanaCompuesto registrar={registrarCalculo} />}
        {ventana === "grafica" && <VentanaComparacion registrar={registrarCalculo} />}
        {ventana === "historial" && (
          <VentanaHistorial
            consultas={consultas}
            limpiar={limpiarHistorial}
            cargando={cargandoHistorial}
            recargar={cargarHistorial}
          />
        )}
        {ventana === "usuarios" && esAdmin && <VentanaUsuarios />}
        {ventana === "todosCalculos" && esAdmin && <VentanaTodosCalculos />}
        {ventana === "logs" && esAdmin && <VentanaLogs />}
      </main>
    </div>
  );
}
