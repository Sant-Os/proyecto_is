import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { login, register, getMe, demoLogin } from "./controllers/auth.controller.js";
import { crearCalculo, obtenerHistorial, limpiarHistorial } from "./controllers/calculos.controller.js";
import { getUsuarios, getTodosCalculos, getLogs, getEstadisticas } from "./controllers/admin.controller.js";
import { requireAuth, requireAdmin, optionalAuth } from "./middleware/auth.middleware.js";

// Carga de variables de entorno desde el archivo .env (puerto, conexion Supabase y secreto JWT).
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Configuracion de CORS para permitir comunicacion segura con las instancias frontend en desarrollo.
app.use(cors({
  origin: true,
  credentials: true,
}));
app.options("*", cors());

// Parseo automatico de cuerpos de peticion en formato JSON.
app.use(express.json());

// Endpoint de verificacion de operatividad y estado de salud de la API.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Backend Plataforma Financiera v2",
  });
});

// Rutas de autenticacion y gestion de sesiones:
// - /api/auth/login: Comprueba credenciales y emite token JWT firmado.
// - /api/auth/register: Registra usuario en Supabase Auth y sincroniza perfil publico.
// - /api/auth/demo: Proporciona acceso rapido a perfiles semilla de evaluacion.
// - /api/auth/me: Devuelve la informacion del usuario en sesion activa.
app.post("/api/auth/login", login);
app.post("/api/auth/register", register);
app.post("/api/auth/demo", demoLogin);
app.get("/api/auth/me", requireAuth, getMe);

// Rutas de calculos financieros y gestion de historial personal:
// - POST /api/calculos: Guarda una nueva simulacion (simple, compuesta o comparativa).
// - GET /api/calculos: Consulta las simulaciones asociadas al usuario autenticado.
// - DELETE /api/calculos: Limpia el historial de calculos del usuario activo.
app.post("/api/calculos", optionalAuth, crearCalculo);
app.get("/api/calculos", optionalAuth, obtenerHistorial);
app.delete("/api/calculos", optionalAuth, limpiarHistorial);

// Rutas de alias para compatibilidad retroactiva con clientes que utilicen /api/historial.
app.post("/api/historial", optionalAuth, crearCalculo);
app.get("/api/historial", optionalAuth, obtenerHistorial);
app.delete("/api/historial", optionalAuth, limpiarHistorial);

// Rutas exclusivas del panel de administracion y supervision general (requieren rol ADMIN):
// - /api/admin/usuarios: Listado de clientes registrados con total de calculos.
// - /api/admin/calculos: Busqueda y revision global de simulaciones en el sistema.
// - /api/admin/logs: Registro cronologico de eventos de auditoria y seguridad.
// - /api/admin/stats: Metricas consolidadas de usuarios, calculos y capital acumulado.
app.get("/api/admin/usuarios", requireAdmin, getUsuarios);
app.get("/api/admin/calculos", requireAdmin, getTodosCalculos);
app.get("/api/admin/logs", requireAdmin, getLogs);
app.get("/api/admin/stats", requireAdmin, getEstadisticas);

// Manejador centralizado para captura de excepciones y errores imprevistos.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Excepcion no controlada en el servidor:", err);
  res.status(500).json({ error: "Ocurrio un error inesperado en el servidor." });
});

// Inicio del servidor HTTP (localmente; en Vercel opera como serverless).
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log("=============================================");
    console.log(`Backend iniciado exitosamente en puerto ${PORT}`);
    console.log(`   URL API: http://localhost:${PORT}/api`);
    console.log(`   Health:  http://localhost:${PORT}/api/health`);
    console.log("=============================================");
  });
}

export default app;
