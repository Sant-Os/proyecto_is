import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Estructura de los datos autenticados encapsulados dentro del token JWT.
 * Proporciona el identificador unico UUID, correo, nombre y el rol asignado.
 */
export interface UsuarioToken {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

// Extension del tipo Request de Express para adjuntar la sesion del usuario validada.
declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioToken;
    }
  }
}

// Clave secreta para la firma y verificacion criptografica de tokens JWT.
const JWT_SECRET = process.env.JWT_SECRET || "super_secreto_financiero_jwt_mvp_2026";

/**
 * Middleware de autenticacion estricta.
 * Intercepta la solicitud HTTP, extrae la cabecera 'Authorization: Bearer <token>',
 * comprueba su firma y vigencia, y asocia la identidad del usuario a req.usuario.
 * Si el token no existe, esta vencido o fue manipulado, responde de inmediato con 401.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado. Token no proporcionado." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UsuarioToken;
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalido o expirado." });
  }
}

/**
 * Middleware de control de acceso por rol administrativo (RBAC).
 * Ejecuta en primer lugar requireAuth para validar la identidad y luego comprueba
 * que el usuario posea el rol 'ADMIN'. Si no cumple este requisito, deniega el acceso con 403.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.usuario?.rol !== "ADMIN") {
      return res.status(403).json({ error: "Acceso denegado. Se requieren privilegios de Administrador." });
    }
    next();
  });
}

/**
 * Middleware de autenticacion opcional.
 * Permite que rutas publicas identifiquen al usuario si envia un token valido,
 * pero no bloquea la peticion si el visitante es anonimo o invitado.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as UsuarioToken;
      req.usuario = decoded;
    } catch {
      // Si el token es invalido o expiro, se permite continuar en calidad de usuario anonimo.
    }
  }
  next();
}
