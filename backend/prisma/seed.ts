import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Inicializacion del cliente de base de datos para ejecutar el sembrado inicial de datos.
const prisma = new PrismaClient();

/**
 * Script de inicializacion idempotente de cuentas maestras en Supabase PostgreSQL.
 * 
 * Crea o actualiza:
 * 1. Cuenta Principal de Propietario / Administrador:
 *    - Correo: santos.c.nnyrd@gmail.com
 *    - Contrasena: admin (hasheada con bcrypt 10 salt rounds)
 *    - Rol: ADMIN
 * 
 * 2. Cuenta de Administrador Estandar:
 *    - Correo: admin@financiera.com
 *    - Contrasena: admin (hasheada con bcrypt 10 salt rounds)
 *    - Rol: ADMIN
 * 
 * 3. Cuenta del Primer Cliente de Prueba:
 *    - Correo: cliente@financiera.com
 *    - Contrasena: cliente (hasheada con bcrypt 10 salt rounds)
 *    - Rol: USER
 */
async function main() {
  console.log("Iniciando sembrado (seed) de cuentas base en Supabase...");

  const hashSantos = await bcrypt.hash("admin", 10);
  const hashAdmin = await bcrypt.hash("admin", 10);
  const hashCliente = await bcrypt.hash("cliente", 10);

  // Creacion o actualizacion de la cuenta del propietario (ADMIN)
  const santos = await prisma.usuario.upsert({
    where: { email: "santos.c.nnyrd@gmail.com" },
    update: {
      nombre: "Santos",
      password: hashSantos,
      rol: "ADMIN",
    },
    create: {
      email: "santos.c.nnyrd@gmail.com",
      nombre: "Santos",
      password: hashSantos,
      rol: "ADMIN",
    },
  });

  // Creacion o actualizacion del usuario administrador institucional
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@financiera.com" },
    update: {
      nombre: "admin",
      password: hashAdmin,
      rol: "ADMIN",
    },
    create: {
      email: "admin@financiera.com",
      nombre: "admin",
      password: hashAdmin,
      rol: "ADMIN",
    },
  });

  // Creacion o actualizacion del usuario cliente inicial
  const cliente = await prisma.usuario.upsert({
    where: { email: "cliente@financiera.com" },
    update: {
      nombre: "user cliente",
      password: hashCliente,
      rol: "USER",
    },
    create: {
      email: "cliente@financiera.com",
      nombre: "user cliente",
      password: hashCliente,
      rol: "USER",
    },
  });

  console.log("Sembrado finalizado exitosamente.");
  console.log(`- Propietario: ${santos.email} (Rol: ${santos.rol})`);
  console.log(`- Administrador: ${admin.email} (Rol: ${admin.rol})`);
  console.log(`- Cliente: ${cliente.email} (Rol: ${cliente.rol})`);
}

main()
  .catch((e) => {
    console.error("Fallo durante la ejecucion del sembrado:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
