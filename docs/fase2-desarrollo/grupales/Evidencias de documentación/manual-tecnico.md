# Manual Técnico

## Requisitos
- Node.js 20+
- PostgreSQL 15+
- Docker Desktop (opcional, para BD)

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/Pancho190/capstone-2026-002D-equipo-04.git
cd capstone-2026-002D-equipo-04
```

### 2. Configurar variables de entorno
Copia `docker/.env.example` a `src/Backend/.env` y completa los valores:
```
PORT=3000
DATABASE_URL=postgresql://postgres:root@localhost:5432/admision_db
JWT_SECRET=tu_secreto_seguro
```

### 3. Instalar dependencias
```bash
cd src/Backend
npm install
```

### 4. Configurar la base de datos

**Opción A: Base de datos en la nube (Neon) — recomendado**
1. Crear cuenta en https://neon.tech
2. Crear proyecto "capstone-admision" en región São Paulo
3. Copiar la Connection string
4. Pegarla en `src/Backend/.env` como `DATABASE_URL`

**Opción B: Base de datos local (Docker)**
```bash
cd ../../docker
docker compose --profile local-db up -d
```

### 5. Sincronizar Prisma
```bash
cd ../src/Backend
npx prisma generate
npx prisma db push
npm run seed
```

### 6. Arrancar el backend
```bash
npm run dev
```
El servidor quedará en `http://localhost:3000`.

### 7. Arrancar el frontend (en otra terminal)
```bash
cd src/Frontend
npm install
npm run dev -- --host
```
El frontend quedará en `https://localhost:5173/`.

## Endpoints principales

### Autenticación
- `POST /api/auth/registro` — Registrar usuario
- `POST /api/auth/login` — Iniciar sesión

### Prospectos
- `POST /api/prospectos` — Crear prospecto (público)
- `GET /api/prospectos` — Listar prospectos (filtros + paginación, requiere JWT)
- `GET /api/prospectos/export` — Exportar a CSV (solo admin)

### Actividades
- `GET /api/eventos` - Listar actividades
- `POST /api/eventos` - Crear actividad (solo admin)
- `PUT /api/eventos/:id` - Editar actividad (solo admin)
- `GET /api/prospectos/duplicados` - Listar prospectos duplicados (solo admin)

### Filtros en prospectos
`GET /api/prospectos?desde=2026-11-01&hasta=2026-11-30&evento_id=UUID&tipo=Japan&mes=11&dia=15&page=1&limit=20`

### Parámetros de paginación
`GET /api/prospectos?page=1&limit=20`

## Panel de administración
- **URL local:** `https://localhost:5173/admin/login`
- **URL producción:** https://capstone-admision.vercel.app/admin/login
- **Credenciales iniciales:** `admin@duoc.cl` / `Admin123!`
- **Funcionalidades:** filtros por fecha/actividad/tipo/mes/día/periodo, tabla de prospectos, modal de detalle, gráficos, exportar CSV, CRUD de actividades, detección de duplicados, generación de QR.

## Despliegue en producción
- **Frontend:** Vercel (https://capstone-admision.vercel.app/)
- **Backend:** Render (https://capstone-backend-so19.onrender.com/)
- **Base de datos:** Neon (https://console.neon.tech)
- **CI/CD:** Auto-deploy desde GitHub (push a main)

## Despliegue con Docker
```bash
docker build -t capstone-backend ./src/Backend
docker run -p 3000:3000 --env-file src/Backend/.env capstone-backend
```
