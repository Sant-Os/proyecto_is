import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

/**
 * Metadatos descriptivos de la aplicacion para indexacion y navegadores.
 */
export const metadata: Metadata = {
  title: "Plataforma Financiera - Calculadora de Interes",
  description: "Simulaciones de interes simple, compuesto y comparativas con proyecciones y auditoria.",
};

/**
 * Diseno raiz de la aplicacion web Next.js.
 * 
 * Envuelve todos los modulos y rutas dentro del AuthProvider para asegurar
 * disponibilidad de la sesion del usuario y sus permisos en cualquier vista.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
