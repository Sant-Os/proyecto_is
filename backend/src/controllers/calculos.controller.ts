import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { registrarLog } from "../services/audit.service.js";

/**
 * Registra una simulacion o calculo financiero en la base de datos PostgreSQL.
 * 
 * Valida los datos requeridos (tipo de calculo, capital, tasa de interes, anos y monto final).
 * Si el usuario inicio sesion, asocia el calculo a su identificador UUID unico;
 * si opera como invitado o sin sesion, lo asocia al usuario predeterminado del sistema.
 * Finalmente, registra la operacion en la bitacora de auditoria.
 */
export async function crearCalculo(req: Request, res: Response) {
  try {
    const { tipo, capital, tasa, final, interes, extra } = req.body;
    const anos = req.body.anos !== undefined ? req.body.anos : req.body.años;

    if (!tipo || capital === undefined || tasa === undefined || anos === undefined || final === undefined) {
      return res.status(400).json({ error: "Faltan datos obligatorios para registrar el calculo." });
    }

    let usuarioId = req.usuario?.id;
    if (!usuarioId) {
      let usuarioDefault = await prisma.usuario.findFirst({ where: { rol: "USER" } });
      if (!usuarioDefault) {
        usuarioDefault = await prisma.usuario.create({
          data: {
            email: "invitado@financiera.com",
            nombre: "Usuario Invitado",
            password: "no-password",
            rol: "USER",
          },
        });
      }
      usuarioId = usuarioDefault.id;
    }

    const calculo = await prisma.calculo.create({
      data: {
        usuarioId,
        tipo,
        capital: Number(capital),
        tasa: Number(tasa),
        anos: Number(anos),
        final: Number(final),
        interes: interes !== undefined ? Number(interes) : Number(final) - Number(capital),
        extra: extra ? String(extra) : "",
      },
    });

    await registrarLog(
      "CALCULO_CREADO",
      `Calculo ${tipo}: Capital ${capital}, Tasa ${tasa}%, Tiempo ${anos} anos -> Final ${final}`,
      usuarioId,
      req.ip
    );

    return res.status(201).json(calculo);
  } catch (error) {
    console.error("Error al persistir calculo financiero:", error);
    return res.status(500).json({ error: "Error interno al guardar calculo.", detalle: (error as any)?.message || String(error) });
  }
}

/**
 * Obtiene el historial de calculos financieros correspondientes al usuario.
 * 
 * Si el usuario esta autenticado, filtra exclusivamente sus registros (cumpliendo RLS).
 * Si la consulta proviene de un usuario no autenticado, retorna las simulaciones recientes
 * disponibles para exploracion publica.
 */
export async function obtenerHistorial(req: Request, res: Response) {
  try {
    const usuarioId = req.usuario?.id;

    let calculos;
    if (usuarioId) {
      calculos = await prisma.calculo.findMany({
        where: { usuarioId },
        orderBy: { fecha: "desc" },
        take: 100,
      });
    } else {
      calculos = await prisma.calculo.findMany({
        orderBy: { fecha: "desc" },
        take: 50,
      });
    }

    return res.json(calculos);
  } catch (error) {
    console.error("Error al obtener historial de calculos:", error);
    return res.status(500).json({ error: "Error al recuperar historial de calculos.", detalle: (error as any)?.message || String(error) });
  }
}

/**
 * Elimina los calculos almacenados en el historial.
 * 
 * Para usuarios identificados, vacia unicamente los calculos propios del usuario activo.
 * Registra un log de auditoria especificando la cantidad exacta de registros eliminados.
 */
export async function limpiarHistorial(req: Request, res: Response) {
  try {
    const usuarioId = req.usuario?.id;

    if (usuarioId) {
      const borrados = await prisma.calculo.deleteMany({
        where: { usuarioId },
      });
      await registrarLog("HISTORIAL_LIMPIADO", `Se eliminaron ${borrados.count} calculos del historial.`, usuarioId, req.ip);
    } else {
      await prisma.calculo.deleteMany({});
      await registrarLog("HISTORIAL_LIMPIADO", "Se vacio el historial general.", null, req.ip);
    }

    return res.json({
      status: "success",
      mensaje: "Historial eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al limpiar historial:", error);
    return res.status(500).json({ error: "Error al vaciar el historial." });
  }
}
