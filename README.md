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
├── Fase 1/
│   ├── Evidencias Individuales/
│   └── Evidencias Grupales/
├── Fase 2/
│   ├── Evidencias Individuales/
│   ├── Evidencias Grupales/
│   └── Evidencias Proyecto/
│       ├── Presentación Proyecto/
│       ├── Evidencias de documentación/
│       │   ├── agile/
│       │   ├── inicio-proyecto.md
│       │   ├── manual-tecnico.md
│       │   ├── modelo-datos.md
│       │   ├── Plan de Pruebas.md
│       │   ├── requisitos-no-funcionales.md
│       │   ├── uml-casos-uso.md
│       │   ├── uml-clases.md
│       │   ├── uml-componentes.md
│       │   └── uml-secuencia.md
│       ├── Evidencias de sistema/
│       │   └── schema-prisma.md
│       └── Aplicación (código fuente del proyecto- frontend-backend)/
│           ├── src/
│           │   ├── Backend/
│           │   └── Frontend/
│           └── docker/
│               ├── docker-compose.yml
│               └── .env.example
├── Fase 3/
│   ├── Evidencias Individuales/
│   └── Evidencias Grupales/
└── README.md
```

## 4. Instrucciones para ejecutar el proyecto localmente

### Variables de entorno
```bash
cp "Fase 2/Evidencias Proyecto/Aplicación (código fuente del proyecto- frontend-backend)/docker/.env.example" "Fase 2/Evidencias Proyecto/Aplicación (código fuente del proyecto- frontend-backend)/src/Backend/.env"
# Completar JWT_SECRET y otros valores
```

### Opción A: Base de datos en la nube (Neon) — recomendado para equipo
```bash
# 1. Configurar .env con la URL de Neon
cd "Fase 2/Evidencias Proyecto/Aplicación (código fuente del proyecto- frontend-backend)/src/Backend"
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev

# 2. Frontend (en otra terminal)
cd "../Frontend"
npm install
npm run dev -- --host
```

### Opción B: Base de datos local (Docker)
```bash
# 1. Base de datos
cd "Fase 2/Evidencias Proyecto/Aplicación (código fuente del proyecto- frontend-backend)/docker"
docker compose --profile local-db up -d

# 2. Backend
cd "../src/Backend"
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev

# 3. Frontend (en otra terminal)
cd "../Frontend"
npm install
npm run dev -- --host
```

### Acceso local
- **Formulario público:** `https://localhost:5173/`
- **Panel admin:** `https://localhost:5173/admin/login`
- **Backend:** `http://localhost:3000/`

### Acceso en producción
- **Formulario público:** https://capstone-admision.vercel.app/
- **Panel admin:** https://capstone-admision.vercel.app/admin/login
- **Backend API:** https://capstone-backend-so19.onrender.com/
- **Base de datos:** https://console.neon.tech (Neon)

## 5. Endpoints de la API
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/registro` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/usuarios` | Listar usuarios | Admin |
| POST | `/api/prospectos` | Crear prospecto | No (público) |
| GET | `/api/prospectos` | Listar prospectos (filtros + paginación) | Sí (JWT) |
| GET | `/api/prospectos/mis` | Listar prospectos del captador logueado | Sí (JWT) |
| GET | `/api/prospectos/evento/:id` | Listar inscritos de una actividad | Sí (JWT) |
| GET | `/api/prospectos/export` | Exportar a CSV | Admin |
| GET | `/api/prospectos/duplicados` | Listar prospectos duplicados | Admin |
| GET | `/api/eventos` | Listar actividades | No |
| GET | `/api/eventos/activos` | Listar actividades activas | Sí (JWT) |
| GET | `/api/eventos/mis` | Listar actividades asignadas al captador | Sí (JWT) |
| GET | `/api/eventos/:id/captadores` | Listar captadores de una actividad | Admin |
| POST | `/api/eventos` | Crear actividad | Admin |
| PUT | `/api/eventos/:id` | Editar actividad | Admin |
| POST | `/api/eventos/:id/asignar` | Asignar captador a actividad | Admin |
| DELETE | `/api/eventos/:id/asignar/:userId` | Desasignar captador | Admin |
| DELETE | `/api/eventos/:id` | Eliminar actividad | Admin |

### Filtros en prospectos
`GET /api/prospectos?desde=2026-11-01&hasta=2026-11-30&evento_id=UUID&tipo=Japan&mes=11&dia=15&periodo=2027&page=1&limit=20`

El filtro `periodo` corresponde al año de captación + 1 (ej: datos capturados en 2026 → periodo 2027).

### Parámetros de paginación
`GET /api/prospectos?page=1&limit=20`

## 6. Testing
```bash
cd "Fase 2/Evidencias Proyecto/Aplicación (código fuente del proyecto- frontend-backend)/src/Backend"
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
- `Fase 2/Evidencias Proyecto/Evidencias de documentación/modelo-datos.md` — Modelo de datos (ERD)
- `Fase 2/Evidencias Proyecto/Evidencias de documentación/manual-tecnico.md` — Manual de instalación y despliegue
- `Fase 2/Evidencias Proyecto/Evidencias de documentación/requisitos-no-funcionales.md` — RNF
- `Fase 2/Evidencias Proyecto/Evidencias de documentación/uml-casos-uso.md` — Diagrama UML (Casos de uso)
- `Fase 2/Evidencias Proyecto/Evidencias de documentación/uml-clases.md` — Diagrama UML (Clases)
- `Fase 2/Evidencias Proyecto/Evidencias de documentación/uml-secuencia.md` — Diagrama UML (Secuencia)
- `Fase 2/Evidencias Proyecto/Evidencias de documentación/uml-componentes.md` — Diagrama UML (Componentes)
- `Fase 2/Evidencias Proyecto/Evidencias de documentación/inicio-proyecto.md` — Documento de inicio
- `Fase 2/Evidencias Proyecto/Evidencias de documentación/agile/` — Product Vision, Backlog, Sprint, DoD, retrospectiva
- `Fase 2/Evidencias Proyecto/Evidencias de documentación/Plan de Pruebas.md` — Plan de pruebas (Jest + Supertest)
- `Fase 2/Evidencias Proyecto/Evidencias de sistema/` — Schema Prisma + capturas de pantalla

---
### Sección de innovación
- **¿Qué problema resuelve?** La captura manual de datos de prospectos en admisión, con errores de digitación y pérdida de información offline.
- **¿Qué hace diferente a la solución?** Escaneo automático de cédula chilena (PDF417/MRZ) con funcionamiento offline y sincronización automática. Panel de administración para gestión de actividades y prospectos.
- **¿Qué valor agrega?** Reducción del tiempo de registro, eliminación de errores, operación sin conectividad y gestión centralizada de actividades de admisión.