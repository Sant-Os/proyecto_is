"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setToken, Usuario } from "@/lib/api";

/**
 * Contrato de estado y operaciones provistas por el contexto de autenticacion.
 */
interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  esAdmin: boolean;
  vistaAuth: "login" | "registro";
  setVistaAuth: (vista: "login" | "registro") => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (nombre: string, email: string, pass: string) => Promise<void>;
  demoLogin: (rol: "USER" | "ADMIN") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Proveedor global de sesion y autenticacion.
 * 
 * Centraliza la persistencia del token JWT, rehidrata la sesion al cargar el navegador
 * mediante consulta a /api/auth/me, y expone metodos reactivos de autenticacion a toda la aplicacion.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [vistaAuth, setVistaAuth] = useState<"login" | "registro">("login");

  /**
   * Revalida la sesion existente contra el backend al iniciar la aplicacion.
   */
  const cargarUsuario = useCallback(async () => {
    try {
      const res = await api.auth.me();
      setUsuario(res.usuario);
    } catch {
      // Si el token expiro o es invalido, se remueve y se solicita inicio de sesion.
      setToken(null);
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuario();
  }, [cargarUsuario]);

  /**
   * Inicia sesion con credenciales de correo y contrasena.
   */
  const login = async (email: string, pass: string) => {
    const res = await api.auth.login({ email, password: pass });
    setToken(res.token);
    setUsuario(res.usuario);
  };

  /**
   * Registra una nueva cuenta de cliente en Supabase Auth y sincroniza la sesion.
   */
  const register = async (nombre: string, email: string, pass: string) => {
    const res = await api.auth.register({ nombre, email, password: pass });
    setToken(res.token);
    setUsuario(res.usuario);
  };

  /**
   * Permite acceso inmediato a perfiles semilla durante revisiones tecnicas.
   */
  const demoLogin = async (rol: "USER" | "ADMIN") => {
    const res = await api.auth.demo(rol);
    setToken(res.token);
    setUsuario(res.usuario);
  };

  /**
   * Cierra la sesion activa, destruye el token en almacenamiento y devuelve a la vista de login.
   */
  const logout = () => {
    setToken(null);
    setUsuario(null);
    setVistaAuth("login");
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        esAdmin: usuario?.rol === "ADMIN",
        vistaAuth,
        setVistaAuth,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para acceder al estado y acciones de autenticacion de forma segura.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro del proveedor AuthProvider.");
  }
  return context;
}
