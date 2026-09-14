import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { registrarLog } from "../services/audit.service.js";

// Clave secreta para la firma criptografica de las sesiones.
const JWT_SECRET = process.env.JWT_SECRET || "super_secreto_financiero_jwt_mvp_2026";

/**
 * Genera un token JWT firmado con validez de 7 dias.
 * Contiene los datos esenciales de identificacion (id, email, nombre y rol)
 * para evitar consultas recurrentes a la base de datos en cada peticion.
 */
function generarToken(usuario: { id: string; email: string; nombre: string; rol: string }) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * Controlador de inicio de sesion (Login).
 * 
 * Flujo de ejecucion:
 * 1. Valida la presencia de email y password en el cuerpo de la solicitud.
 * 2. Busca al usuario en la tabla publica 'Usuario' de Supabase por correo normalizado.
 * 3. Compara de forma segura el hash de la contrasena mediante bcrypt.
 * 4. Si las credenciales son correctas, genera el JWT y registra un evento de auditoria exitoso.
 * 5. Si fallan las credenciales, registra el intento fallido con la IP de origen y responde 401.
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contrasena son requeridos." });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const usuario = await prisma.usuario.findUnique({ where: { email: emailNormalizado } });

    if (!usuario) {
      await registrarLog("LOGIN_FALLIDO", `Intento fallido para el correo: ${email}`, null, req.ip);
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      await registrarLog("LOGIN_FALLIDO", `Contrasena erronea para: ${email}`, usuario.id, req.ip);
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    const token = generarToken(usuario);
    await registrarLog("LOGIN_EXITOSO", `Inicio de sesion como ${usuario.rol}`, usuario.id, req.ip);

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error al procesar login:", error);
    return res.status(500).json({ error: "Error interno en el servidor.", detalle: (error as any)?.message || String(error) });
  }
}

/**
 * Controlador de registro de nuevos clientes.
 * 
 * Sincronizacion 1:1 con Supabase Auth:
 * 1. Valida datos requeridos y verifica que el correo no este en uso.
 * 2. Inserta la cuenta en 'auth.users' de Supabase con contrasena encriptada via pgcrypto.
 * 3. Registra la identidad del proveedor de correo en 'auth.identities'.
 * 4. El disparador de base de datos 'on_auth_user_created' crea la fila en 'public.Usuario'.
 * 5. Se almacena el hash de bcrypt en 'public.Usuario' para unificar el metodo de verificacion en el backend.
 * 6. Registra el evento de auditoria 'USUARIO_REGISTRADO' y devuelve el token de sesion inmediata.
 */
export async function register(req: Request, res: Response) {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contrasena son requeridos." });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const nombreLimpio = nombre.trim();

    const existe = await prisma.usuario.findUnique({ where: { email: emailNormalizado } });
    if (existe) {
      return res.status(400).json({ error: "El correo electronico ya esta registrado." });
    }

    const hashedPasswordBcrypt = await bcrypt.hash(password, 10);

    // Insercion directa en la tabla de autenticacion oficial de Supabase
    const insertRes: any[] = await prisma.$queryRawUnsafe(`
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        $1,
        crypt($2, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        json_build_object('nombre', $3)::jsonb,
        now(),
        now()
      ) RETURNING id;
    `, emailNormalizado, password, nombreLimpio);

    const newUserId = insertRes[0].id;

    // Creacion de la identidad en Supabase con conversion explicita a tipo UUID
    await prisma.$executeRawUnsafe(`
      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        $1,
        $1::uuid,
        json_build_object('sub', $1, 'email', $2)::jsonb,
        'email',
        now(),
        now(),
        now()
      );
    `, newUserId, emailNormalizado);

    // Actualizacion de hash bcrypt en la fila publica sincronizada por el trigger de Supabase
    await prisma.usuario.update({
      where: { id: newUserId },
      data: { password: hashedPasswordBcrypt }
    });

    const nuevoUsuario = await prisma.usuario.findUnique({ where: { id: newUserId } });
    if (!nuevoUsuario) {
      throw new Error("No se pudo obtener el usuario recien creado en la base de datos.");
    }

    const token = generarToken(nuevoUsuario);
    await registrarLog("USUARIO_REGISTRADO", `Nuevo cliente registrado: ${nuevoUsuario.email}`, nuevoUsuario.id, req.ip);

    return res.status(201).json({
      token,
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        rol: nuevoUsuario.rol,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ error: "Error interno al registrar usuario.", detalle: (error as any)?.message || String(error) });
  }
}

/**
 * Consulta del perfil del usuario en sesion.
 * Lee los datos vigentes en la base de datos correspondientes al UUID del token JWT.
 */
export async function getMe(req: Request, res: Response) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ error: "No autenticado." });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, email: true, nombre: true, rol: true, creadoEn: true },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    return res.json({ usuario });
  } catch (error) {
    console.error("Error en getMe:", error);
    return res.status(500).json({ error: "Error al obtener perfil." });
  }
}

/**
 * Controlador de acceso directo para demostraciones y evaluacion del sistema.
 * Permite iniciar sesion instantaneamente con las cuentas semilla 'admin' o 'cliente'.
 */
export async function demoLogin(req: Request, res: Response) {
  try {
    const { rol } = req.body;
    const targetEmail = rol === "ADMIN" ? "admin@financiera.com" : "cliente@financiera.com";

    const usuario = await prisma.usuario.findUnique({ where: { email: targetEmail } });

    if (!usuario) {
      return res.status(404).json({ error: `Usuario ${targetEmail} no encontrado en base de datos.` });
    }

    const token = generarToken(usuario);
    await registrarLog("LOGIN_DEMO", `Acceso rapido a perfil: ${usuario.rol}`, usuario.id, req.ip);

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error en demoLogin:", error);
    return res.status(500).json({ error: "Error en login demo." });
  }
}
