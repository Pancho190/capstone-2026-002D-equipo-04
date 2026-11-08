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

### 4. Levantar la base de datos
```bash
cd ../../docker
docker compose up -d
```

### 5. Sincronizar Prisma
```bash
cd ../src/Backend
npx prisma generate
npx prisma db push
```

### 6. Arrancar el backend
```bash
npm run dev
```
El servidor quedará en `http://localhost:3000`.

## Endpoints principales
- `POST /api/auth/registro` — Registrar usuario
- `POST /api/auth/login` — Iniciar sesión
- `POST /api/prospectos` — Crear prospecto (requiere token)
- `GET /api/prospectos` — Listar prospectos (requiere token, soporta `?page=` y `?limit=`)

## Despliegue con Docker
```bash
docker build -t capstone-backend ./src/Backend
docker run -p 3000:3000 --env-file src/Backend/.env capstone-backend
```