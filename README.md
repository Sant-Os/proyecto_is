# Plataforma Financiera de Simulacion y Rendimientos (v2.0)

Sistema integral de ingenieria financiera para calculo, simulacion cronologica, comparacion visual de rendimientos (Interes Simple vs Interes Compuesto), persistencia relacional y auditoria del sistema.

- **Repositorio Oficial:** [https://github.com/Sant-Os/proyecto_is.git](https://github.com/Sant-Os/proyecto_is.git)
- **Autor / Propietario:** Sant-Os <santos.c.nnyrd@gmail.com>
- **Documentacion Tecnica Integral:** Consultar el archivo [DOCUMENTACION_PROYECTO.md](DOCUMENTACION_PROYECTO.md) para la especificacion exhaustiva de arquitectura, diagramas Mermaid, contratos DTO, base de datos y matriz de accesibilidad.

---

## 1. Arquitectura y Puertos de Ejecucion

| Modulo | Tecnologia Central | Puerto Local | Descripcion |
|---|---|---|---|
| **Frontend** | Next.js 14, React 18, Tailwind CSS | `http://localhost:3002` | Interfaz tecnica industrial de alta densidad, graficos vectoriales SVG y gestion de ventanas. |
| **Backend API** | Node.js, Express, TypeScript | `http://localhost:4000/api` | API REST, emision de JWT, middlewares RBAC y servicios de auditoria. |
| **Base de Datos** | PostgreSQL (Supabase) + Prisma ORM | Conector SSL | Tablas relacionales (`Usuario`, `Calculo`, `Log`) con indices y claves foraneas. |

---

## 2. Inicio Rapido

### Instalacion de dependencias
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### Configuracion de Base de Datos (Supabase)
```bash
npm --prefix backend run db:generate
npm --prefix backend run db:push
npm --prefix backend run db:seed
```

### Ejecucion en Desarrollo
```bash
npm run dev
```

- **Frontend:** [http://localhost:3002](http://localhost:3002)
- **Backend API:** [http://localhost:4000/api](http://localhost:4000/api)
- **Verificacion de Salud:** [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## 3. Cuentas de Acceso Predeterminadas

| Usuario | Correo Electronico | Contrasena | Rol |
|---|---|---|---|
| **Propietario / Master** | `santos.c.nnyrd@gmail.com` | `admin` | `ADMIN` |
| **Administrador Institucional** | `admin@financiera.com` | `admin` | `ADMIN` |
| **Cliente de Prueba** | `cliente@financiera.com` | `cliente` | `USER` |

Para el detalle completo de contratos de datos (DTOs), flujo de pantallas (Ventanas 1 a 4 y modulos administrativos), diagramas de clases y secuencias, revisar [DOCUMENTACION_PROYECTO.md](DOCUMENTACION_PROYECTO.md).
