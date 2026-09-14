import { prisma } from "../prisma.js";

/**
 * Servicio centralizado de auditoria y trazabilidad del sistema.
 * 
 * Registra eventos clave de la aplicacion (autenticaciones exitosas o fallidas,
 * creacion o limpieza de calculos, y accesos de administracion) en la tabla Log.
 * 
 * Los errores al persistir logs se capturan internamente para garantizar que un
 * fallo secundario de registro no interrumpa la operacion principal del usuario.
 * 
 * @param accion - Codigo descriptivo del evento (ej: 'LOGIN_EXITOSO', 'CALCULO_CREADO').
 * @param detalle - Descripcion contextual con los datos relevantes de la accion realizada.
 * @param usuarioId - Identificador UUID del usuario autor, o null si la operacion fue anonima/sistema.
 * @param ip - Direccion IP de procedencia de la solicitud HTTP.
 */
export async function registrarLog(
  accion: string,
  detalle: string,
  usuarioId?: string | null,
  ip?: string | null
) {
  try {
    return await prisma.log.create({
      data: {
        accion,
        detalle,
        usuarioId: usuarioId || null,
        ip: ip || "127.0.0.1",
      },
    });
  } catch (error) {
    console.error("No se pudo registrar el evento de auditoria:", error);
  }
}
