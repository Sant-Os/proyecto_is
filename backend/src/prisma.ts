import { PrismaClient } from "@prisma/client";

/**
 * Instancia global compartida de PrismaClient.
 * En entornos de desarrollo con recarga en caliente (hot reload de Node o nodemon/ts-node),
 * reutilizamos la conexion existente en el objeto global para no agotar el pool de
 * conexiones con la base de datos PostgreSQL en Supabase.
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
