# Sistema Integrado de Captura Digital y Gestión de Prospectos para Admisión

## 1. Descripción del proyecto
Plataforma web progresiva (PWA) offline-first para la captura digital de prospectos de admisión. El sistema utiliza la cámara del dispositivo móvil para escanear el código PDF417 y la zona MRZ de la cédula de identidad chilena, autocompletando instantáneamente el RUT, nombre y fecha de nacimiento del prospecto. Al recuperar la conectividad, los datos capturados se sincronizan automáticamente con la base de datos central. Incluye un panel de administración para gestionar actividades y prospectos.

## 2. Tecnologías utilizadas
- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Frontend:** React, Vite, PWA (vite-plugin-pwa)
- **Escaneo:** @zxing/browser (PDF417)
- **Infraestructura:** Docker, Docker Compose
- **Testing:** Jest, Supertest

## 3. Estructura del proyecto
```
capstone-2026-002D-equipo-04/
├── src/
│   ├── Backend/
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── middlewares/       # Auth JWT
│   │   ├── routes/            # Rutas de la API
│   │   ├── prisma/            # Schema y migraciones
│   │   ├── tests/             # Tests con Jest
│   │   └── server.js          # Entry point
│   └── Frontend/
│       ├── src/
│       │   ├── components/    # Scanner, ConsentModal, EventForm, QRModal, ActivityChart, ChartsSection, DetailCharts, ProspectDetailModal
│       │   ├── pages/         # ProspectoForm, AdminLogin, AdminDashboard
│       │   ├── data/          # Escuelas, sedes, regiones
│       │   └── offline.js     # Almacenamiento offline
│       └── vite.config.js     # Config Vite + PWA + HTTPS
├── docker/
│   ├── docker-compose.yml
│   └── .env.example
└── docs/
    ├── modelo-datos.md
    ├── manual-tecnico.md
    ├── requisitos-no-funcionales.md
    ├── uml-casos-uso.md
    ├── inicio-proyecto.md
    └── agile/                 # Product Vision, Backlog, Sprint, DoD, retrospectiva
```

## 4. Instrucciones para ejecutar el proyecto localmente

### Variables de entorno
```bash
cp docker/.env.example src/Backend/.env
# Completar JWT_SECRET y otros valores
```

### Levantar con Docker
```bash
# 1. Base de datos
cd docker
docker compose up -d

# 2. Backend
cd ../src/Backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev

# 3. Frontend (en otra terminal)
cd ../src/Frontend
npm install
npm run dev -- --host
```

### Acceso
- **Formulario público:** `https://localhost:5173/`
- **Panel admin:** `https://localhost:5173/admin/login`
- **Backend:** `http://localhost:3000/`
- **pgAdmin:** `http://localhost:5050/`

## 5. Endpoints de la API
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/registro` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/prospectos` | Crear prospecto | No (público) |
| GET | `/api/prospectos` | Listar prospectos (filtros + paginación) | Sí (JWT) |
| GET | `/api/prospectos/export` | Exportar a CSV | Admin |
| GET | `/api/prospectos/duplicados` | Listar prospectos duplicados | Admin |
| GET | `/api/eventos` | Listar actividades | No |
| POST | `/api/eventos` | Crear actividad | Admin |
| PUT | `/api/eventos/:id` | Editar actividad | Admin |
| DELETE | `/api/eventos/:id` | Eliminar actividad | Admin |

### Filtros en prospectos
`GET /api/prospectos?desde=2026-11-01&hasta=2026-11-30&evento_id=UUID&tipo=Japan&mes=11&dia=15&periodo=2027&page=1&limit=20`

El filtro `periodo` corresponde al año de captación + 1 (ej: datos capturados en 2026 → periodo 2027).

### Parámetros de paginación
`GET /api/prospectos?page=1&limit=20`

## 6. Testing
```bash
cd src/Backend
npm test
```

## 7. Integrantes y roles
| Integrante | Rol |
|---|---|
| Briones, Cristian | Líder de proyecto / Backend |
| Silva, Francisco | Frontend / QA |
| Gatillon, Ignacio | Base de datos / DevOps |

## 8. Metodología
Scrum

## 9. Arquitectura
- **Backend:** Express + Prisma + PostgreSQL
- **Frontend:** React + Vite + PWA
- **Comunicación:** REST API con JWT
- **Offline:** Service Worker + localStorage + sincronización automática
- **Panel admin:** Rutas protegidas por rol ADMIN. Incluye filtros (fecha, actividad, tipo, mes, día, periodo), tabla de prospectos, modal de detalle, gráficos (región, género, edad, carrera/escuela), exportación CSV, QR, CRUD de actividades, detección de duplicados.

## 10. Documentación
- `docs/modelo-datos.md` — Modelo de datos (ERD)
- `docs/manual-tecnico.md` — Manual de instalación y despliegue
- `docs/requisitos-no-funcionales.md` — RNF
- `docs/uml-casos-uso.md` — Diagrama UML
- `docs/inicio-proyecto.md` — Documento de inicio
- `docs/agile/` — Product Vision, Backlog, Sprint, DoD, retrospectiva
- `fase2-desarrollo/grupales/Plan de Pruebas.md` — Plan de pruebas (Jest + Supertest)
- `fase2-desarrollo/grupales/Evidencias de documentación/` — Evidencias para evaluación MICO

---
### Sección de innovación
- **¿Qué problema resuelve?** La captura manual de datos de prospectos en admisión, con errores de digitación y pérdida de información offline.
- **¿Qué hace diferente a la solución?** Escaneo automático de cédula chilena (PDF417/MRZ) con funcionamiento offline y sincronización automática. Panel de administración para gestión de actividades y prospectos.
- **¿Qué valor agrega?** Reducción del tiempo de registro, eliminación de errores, operación sin conectividad y gestión centralizada de actividades de admisión.
