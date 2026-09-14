# DOCUMENTACION TECNICA Y REPORTE DE ARQUITECTURA INTEGRAL
## PLATAFORMA FINANCIERA DE SIMULACION Y RENDIMIENTOS (v2.0)

- **Repositorio Oficial:** [https://github.com/Sant-Os/proyecto_is.git](https://github.com/Sant-Os/proyecto_is.git)
- **Autor / Propietario:** Sant-Os <santos.c.nnyrd@gmail.com>
- **Tecnologias Centrales:** Next.js 14, React 18, TypeScript, Tailwind CSS, Node.js, Express, Prisma ORM, PostgreSQL (Supabase Connection Pooler).
- **Ultima Actualizacion:** Septiembre 2026

---

## 1. DESCRIPCION GENERAL DEL PROYECTO Y METAS DEL USUARIO

### 1.1 Descripcion del Sistema
La **Plataforma Financiera** es un sistema integral cliente-servidor disenado para la simulacion, analisis comparativo, proyeccion cronologica y auditoria de operaciones financieras bajo regimenes de **Interes Simple** e **Interes Compuesto**.

El sistema combina:
1. Una interfaz frontend interactiva de alta densidad de informacion construida bajo estandares visuales industriales (sin emojis ni iconografia superflua, utilizando tablas estructuradas y graficos vectoriales SVG puros).
2. Un motor de calculo desacoplado y deterministicamente verificado en el cliente y persistido en el servidor.
3. Un backend robusto en Node.js y Express adaptado tanto para ejecucion local como para arquitectura **Serverless en Vercel**, con autenticacion basada en JSON Web Tokens (JWT) y control de acceso basado en roles (RBAC).
4. Persistencia relacional en PostgreSQL alojada en Supabase a traves del **Connection Pooler IPv4** mediante el ORM Prisma, con trazabilidad inmutable de eventos de auditoria y politicas de aislamiento de datos.

### 1.2 Metas del Usuario (Personas)

#### Persona A: Cliente / Inversor / Analista Financiero (Rol: USER)
- **Meta Principal:** Evaluar diferentes alternativas de inversion o financiamiento calculando los rendimientos esperados en interes simple y compuesto en funcion del capital, tasa anual y horizonte temporal.
- **Metas Especificas:**
  - Obtener de forma inmediata el desglose entre capital invertido y rendimiento neto devengado.
  - Simular el impacto de la frecuencia de capitalizacion (anual, semestral, trimestral, mensual, diaria).
  - Visualizar mediante una grafica comparativa ano a ano el punto exacto en el que el interes compuesto supera al interes simple.
  - Conservar un historial persistente de simulaciones para su consulta, ordenamiento y revision posterior.

#### Persona B: Auditor / Supervisor / Administrador del Sistema (Rol: ADMIN)
- **Meta Principal:** Supervisar globalmente la operatividad de la plataforma, auditar el comportamiento de los usuarios y garantizar el cumplimiento normativo e integridad de los datos.
- **Metas Especificas:**
  - Inspeccionar el censo completo de usuarios registrados y su volumen de actividad.
  - Consultar y filtrar la totalidad de simulaciones financieras efectuadas por todos los usuarios del sistema.
  - Revisar la bitacora inmutable de eventos de seguridad y transaccionalidad (inicios de sesion, creaciones y eliminaciones con direcciones IP y marcas temporales).
  - Evaluar metricas agregadas del sistema (capital total simulado, rendimiento acumulado generado, volumen total de registros).

---

## 2. HISTORIAS DE USUARIO (USER STORIES)

| ID | Rol | Enunciado | Criterios de Aceptacion (Gherkin) |
|---|---|---|---|
| **HU-01** | Usuario | Como usuario, quiero autenticarme con correo y contrasena o acceder en modo de prueba, para que mis calculos queden asociados a mi perfil privado. | **Dado** que ingreso mis credenciales validas en la pantalla de acceso, **Cuando** presiono "Ingresar al Sistema", **Entonces** el servidor emite un JWT, el frontend lo almacena en localStorage y se habilita la barra de usuario con mi nombre y rol. |
| **HU-02** | Usuario | Como analista, quiero calcular el monto final por Interes Simple ingresando capital, tasa anual y anos, para conocer el rendimiento lineal de mi dinero. | **Dado** un capital de $10,000, una tasa anual del 10% y un plazo de 3 anos, **Cuando** ejecuto el calculo, **Entonces** el sistema muestra un rendimiento de $3,000, un capital final de $13,000 y lo registra en la base de datos. |
| **HU-03** | Usuario | Como analista, quiero calcular el Interes Compuesto seleccionando la frecuencia de capitalizacion, para evaluar el crecimiento exponencial y la Tasa Efectiva Anual (TEA). | **Dado** un capital de $10,000, tasa del 10%, 3 anos y capitalizacion mensual (n=12), **Cuando** solicito la proyeccion, **Entonces** el sistema calcula $13,481.82, calcula una TEA de 10.47% y desglosa el rendimiento por periodo. |
| **HU-04** | Usuario | Como inversor, quiero ver una grafica cronologica comparativa con curvas anuales, para identificar visualmente la divergencia y el ano de separacion entre ambos esquemas. | **Dado** un mismo juego de variables (capital, tasa y tiempo), **Cuando** activo la vista de Comparacion, **Entonces** se traza una curva lineal y una exponencial en SVG, senalando el ano exacto en que la curva compuesta despega de la lineal por mas del 1%. |
| **HU-05** | Usuario | Como usuario, quiero consultar mi historial de consultas y poder vaciarlo si lo deseo, para llevar el control de mis simulaciones previas. | **Dado** que he realizado multiples calculos, **Cuando** navego a la pestana "Mi Historial", **Entonces** se listan mis simulaciones ordenadas de la mas reciente a la mas antigua con opcion de eliminarlas de la base de datos. |
| **HU-06** | Administrador | Como supervisor, quiero visualizar el registro de logs del sistema con IP y marcas de tiempo, para auditar los eventos criticos de seguridad y calculo. | **Dado** que tengo rol ADMIN, **Cuando** accedo a la pestana "Logs del Sistema", **Entonces** visualizo la tabla completa de eventos (CALCULO_CREADO, INICIO_SESION, etc.) con paginacion y trazabilidad. |

---

## 3. REQUISITOS DEL SISTEMA

### 3.1 Requisitos Funcionales (RF)
- **RF-01 (Autenticacion y Sesiones):** El sistema debe proveer endpoints para registro de usuarios (`/api/auth/register`), inicio de sesion (`/api/auth/login`), obtencion de perfil activo (`/api/auth/me`) y acceso de demostracion rapida (`/api/auth/demo`).
- **RF-02 (Calculo de Interes Simple):** Implementacion de la formula matematica fundamental $A = P \cdot (1 + r \cdot t)$, donde $P$ es el capital inicial, $r$ es la tasa nominal anual dividida por 100, y $t$ es el tiempo en anos.
- **RF-03 (Calculo de Interes Compuesto y Tantos por Periodo):** Implementacion de la formula de capitalizacion compuesta $A = P \cdot (1 + r / n)^{n \cdot t}$ con frecuencias $n \in \{1, 2, 4, 12, 365\}$. Calculo de la Tasa Efectiva Anual: $TEA = (1 + r/n)^n - 1$.
- **RF-04 (Proyeccion Grafica Dinamica):** Generacion de series cronologicas discretas para cada ano $i \in [0, t]$: serie lineal $S_i$ y serie compuesta $C_i$. Identificacion algoritmica del ano de separacion ($C_i > 1.01 \cdot S_i$).
- **RF-05 (Persistencia Relacional):** Toda simulacion calculada debe guardarse de forma asincrona en la base de datos mediante la API REST (`POST /api/calculos`), registrando tipo, capital, tasa, anos, monto final, rendimiento y metadatos extras.
- **RF-06 (Historial del Usuario):** Consulta paginada y ordenada cronologicamente de las simulaciones asociadas al identificador del usuario autenticado (`GET /api/calculos`).
- **RF-07 (Control de Acceso Basado en Roles - RBAC):** Las vistas y rutas administrativas de usuarios, simulaciones globales y logs deben estar estrictamente bloqueadas para roles distintos a `ADMIN`.
- **RF-08 (Auditoria Centralizada):** Registro automatico de acciones transaccionales en la tabla `Log` ante eventos de login, calculo y limpieza de historial.

### 3.2 Requisitos No Funcionales (RNF)
- **RNF-01 (Seguridad Criptografica):** Almacenamiento de contrasenas hasheadas mediante `bcrypt` con 10 rondas de salt. Transmision segura con tokens firmados mediante algoritmo HMAC SHA-256 (`jsonwebtoken`) con expiracion de 7 dias.
- **RNF-02 (Rendimiento y Latencia):** El tiempo de respuesta de los endpoints de calculo y consulta no debe exceder los 200 ms bajo condiciones normales de red. Los calculos matematicos del cliente se resuelven en menos de 5 ms.
- **RNF-03 (Estetica y Diseno Industrial):** La interfaz visual debe mantener un diseno sobrio de alta densidad de informacion (Navy `#14202a`, Slate `#223342`, Verde Oliva `#526052`). **Queda estrictamente prohibido el uso de emojis o iconografia decorativa infantil en interfaces, botones o comentarios de codigo**.
- **RNF-04 (Accesibilidad Web - WCAG 2.1 AA):**
  - Contraste de texto minimo de 4.5:1 respecto al fondo.
  - Elementos interactivos con etiquetas `aria-label`, `aria-current` y `role` explicitos.
  - Soporte completo de navegacion por teclado (tecla Tab, Enter y foco visual resaltado).
- **RNF-05 (Compatibilidad y Portabilidad):** Compatibilidad garantizada en navegadores modernos (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari) y diseno responsivo adaptativo para pantallas de escritorio, tabletas y moviles.
- **RNF-06 (Desacoplamiento Arquitectonico):** Separacion total entre la capa de presentacion (Next.js SPA/SSR) y la capa de servicios (Express REST API) mediante contratos JSON tipados en TypeScript.

---

## 4. ARQUITECTURA GENERAL DEL SISTEMA Y DIAGRAMAS DE CONEXION

### 4.1 Diagrama de Arquitectura Global

```mermaid
graph TD
    subgraph Frontend [Capa de Presentacion - Next.js 14 / React]
        UI[Calculadora Dashboard]
        V1[Vista 1: Interes Simple]
        V2[Vista 2: Interes Compuesto]
        V3[Vista 3: Grafica Comparativa]
        V4[Vista 4: Historial de Consultas]
        VAdmin[Vistas de Administracion: Usuarios, Calculos, Logs]
        Context[AuthContext - Sesion y Tokens]
        ApiClient[Cliente HTTP fetch - api.ts]
    end

    subgraph Backend [Capa de Servicios y Logica - Node.js / Express]
        Router[Express HTTP Router - server.ts]
        AuthCtrl[auth.controller.ts - Login / Registro / JWT]
        CalcCtrl[calculos.controller.ts - Calculos e Historial]
        AdminCtrl[admin.controller.ts - Supervision y Metricas]
        AuthMid[auth.middleware.ts - requireAuth / requireAdmin]
        AuditSvc[audit.service.ts - Registro de Logs]
        PrismaClient[Prisma ORM Client - prisma.ts]
    end

    subgraph Database [Capa de Persistencia - PostgreSQL en Supabase]
        T_User[(Tabla: Usuario)]
        T_Calc[(Tabla: Calculo)]
        T_Log[(Tabla: Log)]
        AuthUsers[(Supabase Auth: auth.users)]
    end

    UI --> V1 & V2 & V3 & V4 & VAdmin
    V1 & V2 & V3 & V4 & VAdmin --> ApiClient
    Context --> ApiClient
    ApiClient -- "HTTP Requests (JSON + Bearer JWT)" --> Router

    Router --> AuthMid
    AuthMid --> AuthCtrl & CalcCtrl & AdminCtrl
    CalcCtrl & AdminCtrl --> AuditSvc
    AuthCtrl & CalcCtrl & AdminCtrl & AuditSvc --> PrismaClient

    PrismaClient -- "Conexion Pool SSL (DATABASE_URL)" --> Database
    T_User -. "FK UUID 1:1" .-> AuthUsers
    T_Calc -- "FK usuarioId (Cascade Delete)" --> T_User
    T_Log -- "FK usuarioId (SetNull Delete)" --> T_User
```

### 4.2 Diagrama de Topologia de Despliegue en la Nube (Vercel Monorepo + Supabase IPv4 Pooler)

Este diagrama ilustra la arquitectura de produccion desplegada en Vercel, resolviendo el desacoplamiento de monorepositorio y el soporte de conectividad IPv4 hacia la base de datos:

```mermaid
graph LR
    subgraph Cliente [Navegador del Usuario]
        Browser[Navegador Web / HTTPS Client]
    end

    subgraph Vercel_Cloud [Infraestructura Vercel Edge / Serverless]
        subgraph Proy_Front [Proyecto 1: Frontend]
            NextApp[Next.js 14 App Router]
            NextEnv[Var: NEXT_PUBLIC_API_URL]
        end

        subgraph Proy_Back [Proyecto 2: Backend]
            VercelEntry[backend/api/index.ts - Entrypoint]
            ExpressServerless[Express Serverless Function]
            CORS_Layer[CORS Dinamico: origin: true]
            PrismaEngine[Prisma Engine Client]
            BackEnv[Var: DATABASE_URL, JWT_SECRET]
        end
    end

    subgraph Supabase_Cloud [Supabase PostgreSQL Cloud]
        PoolerIPv4[Connection Pooler IPv4 - Puerto 6543]
        PgCluster[(PostgreSQL Database Cluster)]
    end

    Browser -- "1. Visita https://tu-frontend.vercel.app" --> NextApp
    Browser -- "2. Peticiones API REST (Bearer JWT)" --> CORS_Layer
    CORS_Layer --> VercelEntry --> ExpressServerless
    ExpressServerless --> PrismaEngine
    PrismaEngine -- "3. TCP SSL (aws-0-us-east-1.pooler.supabase.com:6543)" --> PoolerIPv4
    PoolerIPv4 -- "4. Transacciones SQL con PgBouncer" --> PgCluster
```

### 4.3 Conexiones entre Componentes
1. **Frontend a Backend:**
   - **Protocolo:** HTTP/1.1 REST sobre TCP con TLS/HTTPS.
   - **Formato:** `application/json`.
   - **Autenticacion:** Cabecera estandar `Authorization: Bearer <token_jwt>`.
   - **CORS Dinamico:** En `backend/src/server.ts`, se habilita `origin: true` con manejo explicito de solicitudes `OPTIONS` preflight, permitiendo que cualquier despliegue (produccion, preview o local) se comunique sin bloqueos de navegador.
2. **Backend a Base de Datos (Supabase PostgreSQL):**
   - **Protocolo:** PostgreSQL Wire Protocol con encriptacion SSL obligatoria.
   - **Host y Puerto del Pooler:** `aws-0-us-east-1.pooler.supabase.com:6543`.
   - **Modo:** Transaccional con parámetro `?pgbouncer=true`.
   - **Compatibilidad de Red:** 100% compatible con la salida IPv4 de Vercel Serverless.


---

## 5. CONTRATOS DE COMUNICACION (FRONTEND <-> BACKEND DTOs)

### 5.1 Perspectiva del Frontend

#### 1. Datos que el Frontend Envia (DTO de Entrada / Payload JSON):
El frontend pasa mediante un JSON los datos fundamentales de la operacion:
- **tiempo** (`anos`): Plazo de la proyeccion.
- **interes** (`tasa`): Tasa de interes nominal anual en porcentaje.
- **capital inicial** (`capital`): Monto monetario base invertido o prestado.

Ejemplo de JSON enviado:
```json
{
  "tipo": "Simple",
  "capital": 10000.00,
  "tasa": 12.5,
  "anos": 5,
  "final": 16250.00,
  "interes": 6250.00,
  "extra": "Frecuencia: Mensual (12/ano) | TEA: 13.24%"
}
```

#### 2. Numeracion e Identificadores de Ventanas en la Interfaz:
Para organizar la navegacion y el flujo de trabajo del usuario, la plataforma numera y clasifica sus pantallas de la siguiente manera:

| Numero / ID de Ventana | Nombre Tecnico / Identificador | Descripcion Funcional |
|---|---|---|
| **Ventana Principal** | `Vista_Principal` | Dashboard general y contenedor con barra superior de estado y pestanas de navegacion. |
| **Ventana 1** | `Vista_Interes_Simple` | Formulario de entrada de variables lineales y tarjeta de resultados (Capital, Tasa, Anos -> Final, Interes). |
| **Ventana 2** | `Vista_Interes_Compuesto` | Formulario de entrada con selector de frecuencia de capitalizacion y desglose de tantos por periodo. |
| **Ventana 3** | `Vista_Comparacion_Grafica` | Grafica vectorial interactiva de lineas que proyecta las curvas cronologicas anuales y punto de divergencia. |
| **Ventana 4** | `Vista_Historial` | Pantalla de consulta, filtrado y limpieza de las simulaciones almacenadas en la base de datos PostgreSQL. |
| **Ventana Admin 1** | `Vista_Usuarios` | Panel de control de cuentas registradas con conteo de simulaciones (Exclusivo `ADMIN`). |
| **Ventana Admin 2** | `Vista_Todos_Calculos` | Explorador global de todas las operaciones realizadas en el sistema (Exclusivo `ADMIN`). |
| **Ventana Admin 3** | `Vista_Logs` | Registro cronologico inmutable de eventos de auditoria y seguridad (Exclusivo `ADMIN`). |

#### 3. Lo que el Frontend Necesita Recibir (Respuestas Esperadas):
1. **Respuesta de Interes Simple:**
   - Capital inicial evaluado.
   - Rendimiento neto generado ($I = P \cdot r \cdot t$).
   - Monto acumulado total al termino del plazo.
2. **Respuesta de Interes Compuesto:**
   - Monto acumulado con capitalizacion periodica ($A = P(1 + r/n)^{nt}$).
   - Intereses devengados totales.
   - Rendimiento expresado en Tasa Efectiva Anual (TEA).
   - Tantos y factor de crecimiento por cada subperiodo.
3. **Informacion en Orden para la Grafica Vectorial:**
   - 1: Arreglo secuencial del horizonte de tiempo: $[0, 1, 2, \dots, t]$.
   - 2: Arreglo cronologico de valores de la serie simple: $[S_0, S_1, \dots, S_t]$.
   - 3: Arreglo cronologico de valores de la serie compuesta: $[C_0, C_1, \dots, C_t]$.
   - 4: Identificador del ano de separacion en el cual la curva compuesta despega de la lineal.

---

### 5.2 Perspectiva del Backend

#### 1. Respuestas que el Backend Provee:
- **Respuesta para Interes Simple (JSON con calculo y desglose):**
```json
{
  "id": "8f3e5a21-c49b-4399-bfb7-08de789211c4",
  "usuarioId": "5736d817-c649-42ca-bfc7-425a686dc94d",
  "tipo": "Simple",
  "capital": 10000.00,
  "tasa": 12.0,
  "anos": 3.0,
  "final": 13600.00,
  "interes": 3600.00,
  "extra": "",
  "fecha": "2026-09-14T03:30:00.000Z"
}
```

- **Respuesta para Interes Compuesto (JSON en formato de series / tantos por periodo):**
```json
{
  "id": "9a4f6b32-d50c-45aa-c0c8-19ef890322d5",
  "usuarioId": "5736d817-c649-42ca-bfc7-425a686dc94d",
  "tipo": "Compuesto",
  "capital": 10000.00,
  "tasa": 12.0,
  "anos": 3.0,
  "final": 14307.69,
  "interes": 4307.69,
  "extra": "Frecuencia: Mensual (12/ano) | TEA: 12.68%",
  "fecha": "2026-09-14T03:30:05.000Z"
}
```

#### 2. Lo que el Backend Necesita (DTOs de Entrada / Contrato de Entrada):
- **Datos de entrada para Interes Compuesto:**
  - Monto inicial (`capital` $> 0$).
  - Tasa nominal anual (`tasa` $\ge 0$).
  - Tiempo / plazos (`anos` $\ge 1$).
  - Frecuencia de capitalizacion ($n \in \{1, 2, 4, 12, 365\}$) enviada en el campo `extra`.
  - Flujo / resultado final calculado (`final` $> 0$, `interes` $\ge 0$).
- **Datos de entrada para Interes Simple:**
  - Monto inicial (`capital` $> 0$).
  - Tasa nominal anual (`tasa` $\ge 0$).
  - Tiempo (`anos` $\ge 1$).
  - Flujo / resultado final (`final` $> 0$, `interes` $\ge 0$).
- **Navegacion y Vistas (Identificadores de flujo para la interfaz):**
  - `Vista_Principal` (Dashboard o selector de operaciones financieras).
  - `Vista_Interes_Simple` (Formulario y visualizacion de resultados para calculo simple).
  - `Vista_Interes_Compuesto` (Formulario y visualizacion de tablas/tantos para calculo compuesto).
  - `Vista_Historial` (Pantalla para consultar los registros almacenados en la base de datos).

---

## 6. ESPECIFICACION DEL BACKEND (EXPRESS + PRISMA ORM)

### 6.1 Tecnologias y Dependencias
- **Entorno:** Node.js v18+ con soporte nativo de modulos ES (ESM).
- **Servidor Web:** Express v4.21.
- **CORS Dinamico:** Middleware configurado con `origin: true` y soporte de credenciales.
- **Criptografia y Autenticacion:** `bcryptjs` v3.0 (hasheo seguro) y `jsonwebtoken` v9.0 (firmado de claims JWT).
- **Capa ORM:** Prisma v6.19 con conector nativo PostgreSQL y generacion de tipos estaticos.
- **Despliegue Serverless:** Archivo `backend/vercel.json` y entrada `backend/api/index.ts`.

### 6.2 Estructura de Directorios del Backend
```text
backend/
├── api/
│   └── index.ts            # Entrypoint oficial para ejecucion serverless en Vercel
├── prisma/
│   ├── schema.prisma       # Modelado declarativo de tablas, enums y relaciones PostgreSQL
│   └── seed.ts             # Sembrado idempotente de usuarios maestros (ADMIN y USER)
├── src/
│   ├── controllers/
│   │   ├── admin.controller.ts     # Consultas administrativas (usuarios, simulaciones globales, logs, stats)
│   │   ├── auth.controller.ts      # Endpoints de login, registro, sesion me y acceso rapido demo
│   │   └── calculos.controller.ts  # Creacion de calculos, consulta de historial y eliminacion
│   ├── middleware/
│   │   └── auth.middleware.ts      # Validacion de tokens JWT, inyeccion de sesion y proteccion de roles
│   ├── services/
│   │   └── audit.service.ts        # Servicio inmutable de registro de eventos de auditoria en BD
│   ├── prisma.ts                   # Instancia singleton del cliente de Prisma ORM
│   └── server.ts                   # Punto de entrada HTTP, configuracion de middlewares y enrutamiento
├── vercel.json             # Reglas de reescritura para Vercel Serverless
├── package.json
└── tsconfig.json
```

### 6.3 Diagrama de Clases y Modulos del Backend

```mermaid
classDiagram
    class Server {
        +Express app
        +Number PORT
        +start()
    }

    class AuthMiddleware {
        +optionalAuth(req, res, next)
        +requireAuth(req, res, next)
        +requireAdmin(req, res, next)
    }

    class AuthController {
        +login(req, res)
        +register(req, res)
        +getMe(req, res)
        +demoLogin(req, res)
    }

    class CalculosController {
        +crearCalculo(req, res)
        +obtenerHistorial(req, res)
        +limpiarHistorial(req, res)
    }

    class AdminController {
        +getUsuarios(req, res)
        +getTodosCalculos(req, res)
        +getLogs(req, res)
        +getEstadisticas(req, res)
    }

    class AuditService {
        +registrarLog(accion, detalle, usuarioId, ip)
    }

    class PrismaSingleton {
        +PrismaClient prisma
    }

    Server --> AuthMiddleware
    Server --> AuthController
    Server --> CalculosController
    Server --> AdminController
    AuthController --> PrismaSingleton
    CalculosController --> PrismaSingleton
    CalculosController --> AuditService
    AdminController --> PrismaSingleton
    AuditService --> PrismaSingleton
```

### 6.4 Diagrama de Control de Acceso y Middleware RBAC

```mermaid
flowchart TD
    Req[Peticion HTTP Entrante] --> RouteCheck{Tipo de Ruta}

    RouteCheck -->|Ruta Publica /api/auth/login, /health| HandlePublic[Ejecuta Controlador Publico]
    RouteCheck -->|Ruta Opcional /api/calculos| OptAuth[optionalAuth Middleware]
    RouteCheck -->|Ruta Protegida /api/auth/me| ReqAuth[requireAuth Middleware]
    RouteCheck -->|Ruta Administracion /api/admin/*| ReqAdmin[requireAdmin Middleware]

    OptAuth --> HasTokenOpt{Posee Token?}
    HasTokenOpt -->|Si| VerifyOpt[jwt.verify]
    VerifyOpt -->|Valido| InjectUserOpt[req.usuario = payload] --> HandleOpt[Ejecuta Controlador]
    VerifyOpt -->|Invalido| HandleOpt
    HasTokenOpt -->|No| HandleOpt

    ReqAuth --> HasTokenReq{Posee Token?}
    HasTokenReq -->|No| Err401[Retorna 401 Unauthorized]
    HasTokenReq -->|Si| VerifyReq[jwt.verify]
    VerifyReq -->|Invalido| Err401
    VerifyReq -->|Valido| InjectUserReq[req.usuario = payload] --> HandleReq[Ejecuta Controlador Protegido]

    ReqAdmin --> HasTokenAdm{Posee Token?}
    HasTokenAdm -->|No| Err401
    HasTokenAdm -->|Si| VerifyAdm[jwt.verify]
    VerifyAdm -->|Invalido| Err401
    VerifyAdm -->|Valido| CheckRole{req.usuario.rol == ADMIN?}
    CheckRole -->|No| Err403[Retorna 403 Forbidden]
    CheckRole -->|Si| HandleAdmin[Ejecuta Controlador Administrativo]
```

### 6.5 Catalogo de Endpoints de la API REST

| Metodo | Ruta | Seguridad | Descripcion | Codigos de Estado |
|---|---|---|---|---|
| **GET** | `/api/health` | Publico | Comprobacion de estado y disponibilidad del servicio. | 200 OK |
| **POST** | `/api/auth/register` | Publico | Registra una nueva cuenta y emite el token JWT correspondiente. | 201 Created, 400 Bad Request |
| **POST** | `/api/auth/login` | Publico | Autentica un usuario verificando contrasena con hash bcrypt. | 200 OK, 401 Unauthorized |
| **POST** | `/api/auth/demo` | Publico | Genera acceso inmediato como usuario cliente o administrador de demostracion. | 200 OK, 400 Bad Request |
| **GET** | `/api/auth/me` | Token JWT | Retorna el perfil y rol del usuario identificado en la sesion. | 200 OK, 401 Unauthorized |
| **POST** | `/api/calculos` | Opcional | Persiste una nueva simulacion financiera (asociada al usuario o a invitado). | 201 Created, 400 Bad Request |
| **GET** | `/api/calculos` | Opcional | Retorna el historial de simulaciones filtrado por el usuario en sesion. | 200 OK, 500 Error |
| **DELETE**| `/api/calculos` | Opcional | Limpia las simulaciones registradas del usuario activo. | 200 OK, 500 Error |
| **GET** | `/api/admin/usuarios`| Requiere ADMIN | Lista de usuarios del sistema con conteo de calculos asociados. | 200 OK, 403 Forbidden |
| **GET** | `/api/admin/calculos`| Requiere ADMIN | Exploracion global con soporte de filtrado por tipo y busqueda de texto. | 200 OK, 403 Forbidden |
| **GET** | `/api/admin/logs` | Requiere ADMIN | Bitacora de eventos de auditoria ordenada cronologicamente. | 200 OK, 403 Forbidden |
| **GET** | `/api/admin/stats` | Requiere ADMIN | Metricas agregadas: usuarios, calculos, logs, volumen de capital e intereses. | 200 OK, 403 Forbidden |

---

## 7. ESPECIFICACION DEL FRONTEND (NEXT.JS 14 APP ROUTER)

### 7.1 Tecnologias y Estandares
- **Framework:** Next.js 14.2 (App Router con Server & Client Components).
- **Libreria UI:** React 18 con TypeScript tipado estricto.
- **Estilos:** Tailwind CSS 3.4 configurado con paleta tecnica industrial sin dependencias de iconos externos.
- **Graficos:** Motor vectorial SVG puro implementado en React (`GraficaLineas.tsx`) sin librerias externas pesadas, garantizando carga instantanea y nitidez absoluta.

### 7.2 Diagrama del Arbol de Componentes y Flujo de Estado

```mermaid
graph TD
    Layout[app/layout.tsx - Root Layout] --> AuthProv[context/AuthContext.tsx - AuthProvider]
    AuthProv --> Page[app/page.tsx - Home Page]
    Page --> Calc[components/Calculadora.tsx - Dashboard Central]

    Calc --> HeaderComp[components/Header.tsx - Barra de Estado y Sesion]
    Calc --> NavTabs[Navegacion de Pestanas: Ventanas 1 a 4 + Admin]

    NavTabs --> V1[VentanaSimple.tsx - Ventana 1]
    NavTabs --> V2[VentanaCompuesto.tsx - Ventana 2]
    NavTabs --> V3[VentanaComparacion.tsx - Ventana 3]
    NavTabs --> V4[VentanaHistorial.tsx - Ventana 4]
    NavTabs --> VAdm1[admin/VentanaUsuarios.tsx]
    NavTabs --> VAdm2[admin/VentanaTodosCalculos.tsx]
    NavTabs --> VAdm3[admin/VentanaLogs.tsx]

    V1 & V2 & V3 --> FormInputs[CampoNumero.tsx - Inputs Validados]
    V1 & V2 & V3 --> CardRes[TarjetaResultado.tsx - Cifras Clave]
    V3 --> SvgChart[GraficaLineas.tsx - Lienzo Vectorial SVG]

    Calc --> ApiService[lib/api.ts - Cliente HTTP Conector]
    V1 & V2 & V3 --> MathLib[lib/finanzas.ts - Formulas Puras]
```

### 7.3 Flujo de Pantallas y Navegacion

```mermaid
stateDiagram-v2
    [*] --> Pantalla_Inicio: Carga de la Aplicacion (http://localhost:3002)
    
    state Pantalla_Inicio {
        [*] --> Vista_Principal
        Vista_Principal --> Vista_Interes_Simple: Pestana "Interes simple" (Ventana 1)
        Vista_Principal --> Vista_Interes_Compuesto: Pestana "Interes compuesto" (Ventana 2)
        Vista_Principal --> Vista_Comparacion_Grafica: Pestana "Comparacion" (Ventana 3)
        Vista_Principal --> Vista_Historial: Pestana "Mi Historial" (Ventana 4)
    }

    state Modulos_Administrativos {
        Vista_Principal --> Vista_Usuarios: Pestana "Usuarios Comunes" (Solo ADMIN)
        Vista_Principal --> Vista_Todos_Calculos: Pestana "Todos los Calculos" (Solo ADMIN)
        Vista_Principal --> Vista_Logs: Pestana "Logs del Sistema" (Solo ADMIN)
    }

    Vista_Principal --> Modal_Login: Boton "Iniciar sesion" en Header
    Modal_Login --> Sesion_Iniciada: Credenciales validas
    Sesion_Iniciada --> Vista_Principal: Token guardado, actualiza permisos
    Vista_Principal --> Sesion_Cerrada: Boton "Cerrar sesion"
    Sesion_Cerrada --> Vista_Principal: Token eliminado, oculta pestanas ADMIN
```

### 7.4 Logica de la Grafica Vectorial (`GraficaLineas.tsx`)

#### Diagrama del Pipeline de Renderizado SVG Matematico
```mermaid
flowchart TD
    Vars[Variables de Entrada: Capital P, Tasa r, Plazo t, Frecuencia n] --> CalcSeries[Calculo de Series en finanzas.ts]
    
    CalcSeries --> S_Array["serieSimple: [S_0, S_1, ..., S_t]"]
    CalcSeries --> C_Array["serieCompuesta: [C_0, C_1, ..., C_t]"]

    S_Array & C_Array --> FindMax["Identificar Valor Maximo: V_max = max(max(S), max(C))"]
    S_Array & C_Array --> FindDivergence["Detectar Ano de Separacion: C_i > 1.01 * S_i"]

    FindMax --> NormalizeCoords["Normalizacion Analitica de Coordenadas:
    X_i = PadLeft + (i / t) * Width
    Y_i = Height - PadBottom - (V_i / V_max) * EffHeight"]

    NormalizeCoords --> BuildPathSimple["Construir Trazo Lineal: path d='M ... L ...'"]
    NormalizeCoords --> BuildPathCompuesto["Construir Trazo Exponencial: path d='M ... L ...'"]

    BuildPathSimple & BuildPathCompuesto & FindDivergence --> RenderSVG["Renderizado en Componente SVG:
    - Eje X cronologico y Eje Y monetario
    - Curva lineal (#223342)
    - Curva compuesta (#059669)
    - Marcador del ano de divergencia
    - Tooltip interactivo con valores al pasar el cursor"]
```


---

## 8. ESPECIFICACION DE LA BASE DE DATOS (POSTGRESQL + SUPABASE)

### 8.1 Diagrama Entidad-Relacion (ERD)

```mermaid
erDiagram
    Usuario ||--o{ Calculo : "realiza (1 a N)"
    Usuario ||--o{ Log : "genera (1 a N)"

    Usuario {
        uuid id PK "Identificador unico vinculado a auth.users"
        string email UK "Correo electronico unico"
        string nombre "Nombre de pila del titular"
        string password "Hash criptografico bcrypt"
        Rol rol "Enum: USER o ADMIN"
        datetime creadoEn "Marca temporal de creacion"
    }

    Calculo {
        string id PK "UUID generado automaticamente"
        uuid usuarioId FK "Referencia a Usuario(id)"
        TipoCalculo tipo "Enum: Simple, Compuesto, Comparacion"
        float capital "Capital inicial de la operacion"
        float tasa "Tasa de interes anual nominal"
        float anos "Plazo temporal en anos"
        float final "Capital final resultante"
        float interes "Rendimiento financiero neto"
        string extra "Metadatos adicionales (TEA, frecuencia)"
        datetime fecha "Marca de tiempo del calculo"
    }

    Log {
        string id PK "UUID de auditoria"
        uuid usuarioId FK "Referencia opcional a Usuario(id)"
        string accion "Tipo de evento (CALCULO_CREADO, LOGIN, etc)"
        string detalle "Descripcion circunstanciada del evento"
        string ip "Direccion IP del cliente solicitante"
        datetime fecha "Fecha y hora exacta del registro"
    }
```

### 8.2 Estructura Detallada de Tablas

#### Tabla: `public."Usuario"`
| Columna | Tipo de Dato | Modificadores | Descripcion |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | Llave primaria vinculada a `auth.users.id` de Supabase. |
| `email` | `VARCHAR` | UNIQUE, NOT NULL | Correo electronico de acceso. |
| `nombre` | `VARCHAR` | NOT NULL | Nombre del usuario. |
| `password` | `VARCHAR` | NOT NULL | Hash generado con bcrypt (10 rounds). |
| `rol` | `Rol` | NOT NULL, DEFAULT 'USER' | Nivel de privilegio (`USER` o `ADMIN`). |
| `creadoEn` | `TIMESTAMP` | NOT NULL, DEFAULT now() | Registro de fecha de alta. |

#### Tabla: `public."Calculo"`
| Columna | Tipo de Dato | Modificadores | Descripcion |
|---|---|---|---|
| `id` | `VARCHAR` | PRIMARY KEY | Identificador unico del calculo. |
| `usuarioId` | `UUID` | FOREIGN KEY, NOT NULL | Referencia con eliminacion en cascada (`ON DELETE CASCADE`). |
| `tipo` | `TipoCalculo`| NOT NULL | Categoria: `Simple`, `Compuesto` o `Comparacion`. |
| `capital` | `FLOAT` | NOT NULL | Monto base proyectado. |
| `tasa` | `FLOAT` | NOT NULL | Tasa porcentual anual aplicada. |
| `anos` | `FLOAT` | NOT NULL | Horizonte temporal en anos. |
| `final` | `FLOAT` | NOT NULL | Saldo final acumulado. |
| `interes` | `FLOAT` | NOT NULL | Diferencia neta (Final - Capital). |
| `extra` | `TEXT` | DEFAULT '' | Parametros de frecuencia y tasas equivalentes. |
| `fecha` | `TIMESTAMP` | NOT NULL, DEFAULT now() | Indice cronologico de ordenamiento. |

#### Tabla: `public."Log"`
| Columna | Tipo de Dato | Modificadores | Descripcion |
|---|---|---|---|
| `id` | `VARCHAR` | PRIMARY KEY | Identificador inmutable de auditoria. |
| `usuarioId` | `UUID` | FOREIGN KEY, NULLABLE | Referencia (`ON DELETE SET NULL`). |
| `accion` | `VARCHAR` | NOT NULL | Codigo de evento (`CALCULO_CREADO`, `HISTORIAL_LIMPIADO`, etc.). |
| `detalle` | `TEXT` | NOT NULL | Parametros del evento y descripcion tecnica. |
| `ip` | `VARCHAR` | NULLABLE | Direccion IP de origen capturada en el middleware. |
| `fecha` | `TIMESTAMP` | NOT NULL, DEFAULT now() | Marca temporal UTC inmutable. |

---

## 9. DIAGRAMAS DE SECUENCIA DE OPERACIONES CRITICAS

### 9.1 Flujo de Registro y Autenticacion con JWT

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Front as Frontend (React/Next.js)
    participant Back as Backend (Express API)
    participant Prisma as Prisma ORM
    participant DB as PostgreSQL (public.Usuario)

    Usuario->>Front: Ingresa email y contrasena
    Front->>Back: POST /api/auth/login {email, password}
    Back->>Prisma: usuario.findUnique({ where: { email } })
    Prisma->>DB: SELECT * FROM "Usuario" WHERE email = ?
    DB-->>Prisma: Registro con password hasheado
    Prisma-->>Back: Objeto de usuario
    Back->>Back: bcrypt.compare(password, hash)
    alt Credenciales Correctas
        Back->>Back: jwt.sign({ id, email, rol }, JWT_SECRET, { expiresIn: '7d' })
        Back-->>Front: 200 OK { token, usuario: { id, email, nombre, rol } }
        Front->>Front: localStorage.setItem('token_financiero', token)
        Front-->>Usuario: Sesion iniciada, interfaz desbloqueada
    else Contrasena Incorrecta
        Back-->>Front: 401 Unauthorized { error: 'Credenciales invalidas' }
        Front-->>Usuario: Notificacion visual de error
    end
```

### 9.2 Flujo de Realizacion y Persistencia de Calculo Financiero

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Front as Frontend (Calculadora)
    participant Math as Modulo Finanzas (finanzas.ts)
    participant Back as Backend (calculos.controller)
    participant Audit as AuditService
    participant DB as PostgreSQL (public.Calculo)

    Usuario->>Front: Define Capital ($10k), Tasa (10%), Anos (3) en Ventana 1
    Front->>Math: interesSimple(10000, 10, 3)
    Math-->>Front: Retorna Final: $13,000 | Rendimiento: $3,000
    Front->>Front: Actualiza tarjeta visual y grafica inmediatamente
    Front->>Back: POST /api/calculos (Bearer Token, tipo: Simple, capital: 10000, ...)
    Back->>Back: Verifica JWT y extrae usuarioId
    Back->>DB: prisma.calculo.create({ data: { usuarioId, tipo, capital, ... } })
    DB-->>Back: Registro guardado con id UUID
    Back->>Audit: registrarLog("CALCULO_CREADO", detalle, usuarioId, ip)
    Audit->>DB: prisma.log.create(...)
    Back-->>Front: 201 Created { id, tipo, final, interes, fecha }
    Front->>Front: Agrega calculo al estado de historial local
```

---

## 10. GUIA DE INSTALACION, CONFIGURACION Y SOLUCION DE PROBLEMAS

### 10.1 Requisitos Previos
- **Node.js:** Version 18.17.0 o superior (recomendado Node 20 LTS).
- **Gestor de Paquetes:** `npm` v9 o superior.
- **Git:** Instalado en el sistema operativo.
- **Base de Datos:** Instancia de PostgreSQL en Supabase.

### 10.2 Configuracion de Variables de Entorno

#### 1. Backend (`backend/.env`):
```env
# Puerto de escucha del servidor Express (desarrollo local)
PORT=4000

# Cadena de conexion oficial a PostgreSQL via Connection Pooler IPv4 de Supabase
DATABASE_URL="postgresql://postgres.elqxtneoekcqrwvgcseu:proyectofinanciero@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Clave secreta para la firma y validacion de tokens JWT
JWT_SECRET="super_secreto_financiero_jwt_mvp_2026"

# URL publica y clave anonima del proyecto Supabase
SUPABASE_URL="https://elqxtneoekcqrwvgcseu.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscXh0bmVvZWtjcXJ3dmdjc2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTc4OTEsImV4cCI6MjEwNDIzMzg5MX0.4amlu91XSsNAhyfNRbOiAwWFKydKlZsksgMJ2HB61nc"
```

#### 2. Frontend (`frontend/.env.local`):
```env
# Direccion de consumo de la API REST del backend
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### 10.3 Comandos de Instalacion y Puesta en Marcha

#### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/Sant-Os/proyecto_is.git
cd proyecto_is
```

#### Paso 2: Instalacion de Dependencias
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

#### Paso 3: Configuracion y Sembrado de la Base de Datos
```bash
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:push
npm --prefix backend run prisma:seed
```

#### Paso 4: Ejecucion en Modo Desarrollo
```bash
npm run dev
```
- Acceso a la Interfaz Web: **[http://localhost:3002](http://localhost:3002)**
- Acceso a la API REST: **[http://localhost:4000/api](http://localhost:4000/api)**
- Estado de Salud (Health Check): **[http://localhost:4000/api/health](http://localhost:4000/api/health)**

### 10.4 Solucion de Problemas Comunes (Troubleshooting)

1. **Error `EPERM: operation not permitted` al ejecutar `prisma:generate` en Windows:**
   - **Causa:** El servidor de desarrollo (`npm run dev`) se encuentra en ejecucion en una terminal y Windows bloquea el archivo binario `query_engine-windows.dll.node` en memoria impidiendo que sea sobrescrito.
   - **Solucion:** Detener el servidor con `Ctrl + C`, ejecutar `npm --prefix backend run prisma:generate`, y reiniciar el servidor.
2. **Error `Can't reach database server at db.xxx.supabase.co:5432` en Vercel:**
   - **Causa:** La direccion directa de Supabase es solo IPv6 y Vercel Serverless opera con salida IPv4.
   - **Solucion:** Utilizar la cadena del Connection Pooler en el puerto `6543`:  
     `aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`.
3. **Error `Failed to fetch` en Frontend de Vercel:**
   - **Causa:** Variable `NEXT_PUBLIC_API_URL` faltante o desactualizada sin hacer Redeploy en Vercel, o politica CORS restrictiva en el backend.
   - **Solucion:** Configurar `NEXT_PUBLIC_API_URL=https://tu-backend.vercel.app/api`, habilitar `origin: true` en el backend y ejecutar un Redeploy del proyecto Frontend.

### 10.5 Cuentas Maestras Predeterminadas del Sistema

| Tipo de Cuenta | Correo Electronico | Contrasena | Rol Asignado | Privilegios |
|---|---|---|---|---|
| **Propietario Principal** | `santos.c.nnyrd@gmail.com` | `admin` | `ADMIN` | Acceso total: simulaciones, administracion, logs y usuarios. |
| **Administrador Institucional** | `admin@financiera.com` | `admin` | `ADMIN` | Gestion y supervision del sistema. |
| **Cliente de Prueba** | `cliente@financiera.com` | `cliente` | `USER` | Simulaciones de interes simple, compuesto e historial propio. |

---

## 11. MATRIZ DE ACCESIBILIDAD (WCAG 2.1 AA) Y DIRECTRICES DE DISENO

### 11.1 Reglas Esteticas y de Estilo Obligatorias
1. **Ausencia Absoluta de Iconos y Emojis:** El diseno no utiliza simbolos graficos informales, emojis ni paquetes de iconos SVG dispersos. Todo el significado se transmite mediante tipografia tecnica, jerarquia de tamanos, codigos de color consistentes y etiquetas descriptivas.
2. **Paleta de Colores de Alto Rendimiento:**
   - Fondo de Aplicacion: Tono arena grisaceo `#eef0ea` con patron de reticula milimetrica sutil.
   - Encabezados y Barras de Control: Azul marino oscuro de alta densidad `#14202a` y pizarra `#223342`.
   - Elementos de Accion Principal: Verde esmeralda industrial `#059669` / oliva `#526052`.
   - Textos de Lectura: Carbon `#1e293b` y texto tenue `#64748b`.
3. **Tablas Desplegadas sin Plegar:** Todas las tablas de datos (historial, usuarios, logs) se presentan de manera directa y abierta sin acordeones ocultos, facilitando la visualizacion panoramica requerida en aplicaciones financieras profesionales.

### 11.2 Cumplimiento de Accesibilidad
- **Contraste Cromatico:** Ratio superior a 5.5:1 en todos los textos de control y lectura.
- **Navegacion por Teclado:** Todas las pestanas y botones poseen estados de foco visibles (`focus:ring-2 focus:ring-emerald-500`).
- **Lectores de Pantalla:** Formularios con etiquetas semanticas (`<label for="...">`), atributos `aria-label`, `aria-current="page"` en la pestana seleccionada, y regiones `<main>` y `<nav>` estructuradas.
