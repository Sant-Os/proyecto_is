# Plataforma Financiera MVP v2

Arquitectura monolítica modular con Frontend (Next.js) y Backend (Express + Prisma ORM + Supabase).

## Estructura
- `frontend/`: Aplicación Next.js con Tailwind CSS y Chart.js (corre en puerto 3000).
- `backend/`: API REST en Express + TypeScript + Prisma ORM (corre en puerto 3001).

## Inicio Rápido
1. Instalar dependencias en la raíz:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. Iniciar ambos servicios simultáneamente:
   ```bash
   npm run dev
   ```

Frontend: http://localhost:3000
Backend API: http://localhost:3001/api
