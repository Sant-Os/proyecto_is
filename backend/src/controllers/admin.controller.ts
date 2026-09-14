import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { registrarLog } from "../services/audit.service.js";

/**
 * Consulta la lista de usuarios comunes (rol 'USER') registrados en la plataforma.
 * 
 * Incluye un conteo agregado de los calculos financieros realizados por cada usuario
 * para que el administrador evalue el uso y la actividad de la aplicacion.
 */
export async function getUsuarios(req: Request, res: Response) {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { rol: "USER" },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        creadoEn: true,
        _count: {
          select: { calculos: true },
        },
      },
      orderBy: { creadoEn: "desc" },
    });

    await registrarLog(
      "ADMIN_CONSULTA_USUARIOS",
      "El administrador reviso el listado de usuarios comunes.",
      req.usuario?.id,
      req.ip
    );

    return res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios en modulo de administracion:", error);
    return res.status(500).json({ error: "Error al obtener usuarios para administracion." });
  }
}

/**
 * Consulta la totalidad de calculos guardados por todos los clientes en la base de datos.
 * 
 * Permite filtrar por tipo de calculo ('Simple', 'Compuesto', 'Comparacion')
 * y busqueda por texto sobre el nombre o correo del cliente asociado.
 */
export async function getTodosCalculos(req: Request, res: Response) {
  try {
    const { tipo, busqueda } = req.query;

    const whereClause: any = {};
    if (tipo && (tipo === "Simple" || tipo === "Compuesto" || tipo === "Comparacion")) {
      whereClause.tipo = String(tipo);
    }

    if (busqueda && typeof busqueda === "string" && busqueda.trim()) {
      const termino = busqueda.trim();
      whereClause.usuario = {
        OR: [
          { email: { contains: termino, mode: "insensitive" } },
          { nombre: { contains: termino, mode: "insensitive" } },
        ],
      };
    }

    const calculos = await prisma.calculo.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: { fecha: "desc" },
      take: 200,
    });

    await registrarLog(
      "ADMIN_CONSULTA_CALCULOS",
      "El administrador reviso todos los calculos del sistema.",
      req.usuario?.id,
      req.ip
    );

    return res.json(calculos);
  } catch (error) {
    console.error("Error al obtener calculos en modulo de administracion:", error);
    return res.status(500).json({ error: "Error al recuperar calculos para administracion." });
  }
}

/**
 * Consulta el historial de logs y eventos de auditoria del sistema.
 * 
 * Retorna las ultimas 200 entradas en orden cronologico descendente, incluyendo
 * la relacion con el usuario responsable de la accion si existe.
 */
export async function getLogs(req: Request, res: Response) {
  try {
    const logs = await prisma.log.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: { fecha: "desc" },
      take: 200,
    });

    return res.json(logs);
  } catch (error) {
    console.error("Error al obtener logs de auditoria:", error);
    return res.status(500).json({ error: "Error al recuperar logs de auditoria." });
  }
}

/**
 * Genera el consolidado cuantitativo de la plataforma para el panel ejecutivo.
 * 
 * Computa:
 * - Total de clientes registrados (rol USER).
 * - Cantidad acumulada de simulaciones guardadas.
 * - Total de registros de auditoria generados.
 * - Sumatoria global del capital proyectado e interes generado en los calculos.
 */
export async function getEstadisticas(req: Request, res: Response) {
  try {
    const totalUsuarios = await prisma.usuario.count({ where: { rol: "USER" } });
    const totalCalculos = await prisma.calculo.count();
    const totalLogs = await prisma.log.count();

    const calculos = await prisma.calculo.findMany({
      select: { interes: true, capital: true },
    });

    const sumaInteres = calculos.reduce((acc, curr) => acc + curr.interes, 0);
    const sumaCapital = calculos.reduce((acc, curr) => acc + curr.capital, 0);

    return res.json({
      totalUsuarios,
      totalCalculos,
      totalLogs,
      sumaInteres,
      sumaCapital,
    });
  } catch (error) {
    console.error("Error al calcular metricas consolidadas:", error);
    return res.status(500).json({ error: "Error al obtener estadisticas generales." });
  }
}
