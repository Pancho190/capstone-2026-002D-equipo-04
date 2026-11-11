# Sistema Integrado de Captura Digital y Gestión de Prospectos para Admisión

## 1. Descripción del proyecto
Plataforma web progresiva (PWA) offline-first para la captura digital de prospectos de admisión. El sistema utiliza la cámara del dispositivo móvil para escanear el código PDF417 y la zona MRZ de la cédula de identidad chilena, autocompletando instantáneamente el RUT, nombre y fecha de nacimiento del prospecto. Al recuperar la conectividad, los datos capturados se sincronizan automáticamente con la base de datos central.

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
│       │   ├── components/    # Scanner, ConsentModal
│       │   ├── pages/         # Login, ProspectoForm
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
npm run dev

# 3. Frontend (en otra terminal)
cd ../src/Frontend
npm install
npm run dev -- --host
```

### Acceso
- **Frontend:** `https://localhost:5173/` (o la IP en red para móvil)
- **Backend:** `http://localhost:3000/`
- **pgAdmin:** `http://localhost:5050/`

## 5. Endpoints de la API
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/registro` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/prospectos` | Crear prospecto | Sí (JWT) |
| GET | `/api/prospectos` | Listar prospectos (paginado) | Sí (JWT) |

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

## 10. Documentación
- `docs/modelo-datos.md` — Modelo de datos (ERD)
- `docs/manual-tecnico.md` — Manual de instalación y despliegue
- `docs/requisitos-no-funcionales.md` — RNF
- `docs/uml-casos-uso.md` — Diagrama UML
- `docs/inicio-proyecto.md` — Documento de inicio
- `docs/agile/` — Product Vision, Backlog, Sprint, DoD, retrospectiva

---
### Sección de innovación
- **¿Qué problema resuelve?** La captura manual de datos de prospectos en admisión, con errores de digitación y pérdida de información offline.
- **¿Qué hace diferente a la solución?** Escaneo automático de cédula chilena (PDF417/MRZ) con funcionamiento offline y sincronización automática.
- **¿Qué valor agrega?** Reducción del tiempo de registro, eliminación de errores y operación sin conectividad.
