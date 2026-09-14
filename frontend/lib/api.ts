/**
 * Cliente HTTP y conectores API de la plataforma financiera.
 * 
 * Gestiona la comunicacion asincrona con el backend en Express,
 * adjuntando credenciales JWT y proporcionando contratos tipados con TypeScript.
 */

// Direccion base de la API REST del backend
// Direccion base de la API REST del backend con normalizacion automatica
function getApiUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  const trimmed = envUrl.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const API_URL = getApiUrl();

/**
 * Recupera el token JWT guardado en el almacenamiento local del navegador.
 * Seguro para ejecucion en el servidor (retorna null si window no esta definido).
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token_financiero");
}

/**
 * Persiste o elimina el token JWT de sesion en el almacenamiento local.
 */
export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("token_financiero", token);
  } else {
    localStorage.removeItem("token_financiero");
  }
}

/**
 * Funcion generica para despachar peticiones HTTP fetch con tipado seguro.
 * Adjunta automaticamente la cabecera 'Authorization: Bearer <token>' si existe sesion,
 * y procesa los mensajes de error devueltos por el backend.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    console.error("Error de conexion de red con la API:", API_URL, netErr);
    throw new Error(`No se pudo conectar con el servidor (${API_URL}). Verifica que el backend este activo y permita CORS.`);
  }

  if (!res.ok) {
    let errorMsg = `Error HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data.detalle) errorMsg = `${data.error} (${data.detalle})`; else if (data.error) errorMsg = data.error;
    } catch {
      // Si la respuesta no es un JSON estructurado, se conserva el codigo de estado HTTP.
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

/**
 * Modelo de datos del usuario autenticado en la aplicacion.
 */
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: "USER" | "ADMIN";
  creadoEn?: string;
}

/**
 * Objeto de transferencia de datos (DTO) para calculos y simulaciones financieras.
 */
export interface CalculoDTO {
  id?: string;
  tipo: "Simple" | "Compuesto" | "Comparacion";
  capital: number;
  tasa: number;
  anos: number;
  final: number;
  interes: number;
  extra?: string;
  fecha?: string;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
  };
}

/**
 * DTO para registros de auditoria e historial de seguridad.
 */
export interface LogDTO {
  id: string;
  accion: string;
  detalle: string;
  ip?: string;
  fecha: string;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  };
}

/**
 * Perfil de usuario enriquecido para vista de administracion con conteo de simulaciones.
 */
export interface UsuarioAdminDTO extends Usuario {
  _count?: {
    calculos: number;
  };
}

/**
 * Metricas agregadas para el resumen del panel de control de administracion.
 */
export interface StatsDTO {
  totalUsuarios: number;
  totalCalculos: number;
  totalLogs: number;
  sumaInteres: number;
  sumaCapital: number;
}

/**
 * Conector estructurado de endpoints de la API por dominio funcional.
 */
export const api = {
  // Servicios de autenticacion y perfiles
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; usuario: Usuario }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    register: (data: { nombre: string; email: string; password: string }) =>
      request<{ token: string; usuario: Usuario }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<{ usuario: Usuario }>("/auth/me"),
    demo: (rol: "USER" | "ADMIN") =>
      request<{ token: string; usuario: Usuario }>("/auth/demo", {
        method: "POST",
        body: JSON.stringify({ rol }),
      }),
  },

  // Servicios de calculo e historial financiero
  calculos: {
    crear: (dato: Omit<CalculoDTO, "id" | "fecha">) =>
      request<CalculoDTO>("/calculos", {
        method: "POST",
        body: JSON.stringify(dato),
      }),
    historial: () => request<CalculoDTO[]>("/calculos"),
    limpiar: () =>
      request<{ status: string; mensaje: string }>("/calculos", {
        method: "DELETE",
      }),
  },

  // Servicios de supervision y gestion para administradores
  admin: {
    getUsuarios: () => request<UsuarioAdminDTO[]>("/admin/usuarios"),
    getTodosCalculos: (tipo?: string, busqueda?: string) => {
      const params = new URLSearchParams();
      if (tipo) params.append("tipo", tipo);
      if (busqueda) params.append("busqueda", busqueda);
      const query = params.toString() ? `?${params.toString()}` : "";
      return request<CalculoDTO[]>(`/admin/calculos${query}`);
    },
    getLogs: () => request<LogDTO[]>("/admin/logs"),
    getStats: () => request<StatsDTO>("/admin/stats"),
  },
};
