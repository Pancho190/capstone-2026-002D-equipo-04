# Diagrama UML - Componentes

## Descripción
Diagrama de componentes del sistema mostrando la arquitectura frontend, backend y base de datos.

## Arquitectura general

```mermaid
graph TB
    subgraph Frontend["Frontend (React + Vite + PWA)"]
        subgraph Pages["Páginas"]
            PF[ProspectoForm]
            AD[AdminDashboard]
            AL[AdminLogin]
        end
        subgraph Components["Componentes"]
            SC[Scanner]
            CM[ConsentModal]
            EF[EventForm]
            QM[QRModal]
            AC[ActivityChart]
            CS[ChartsSection]
            DC[DetailCharts]
            PDM[ProspectDetailModal]
        end
        subgraph Utils["Utilidades"]
            API[api.js - Axios]
            OFF[offline.js - Sync]
            UT[utils.js - Formato]
            DATA[data/ - duoc.js, chile.js]
        end
        SW[Service Worker - PWA]
    end

    subgraph Backend["Backend (Node.js + Express)"]
        subgraph Routes["Rutas"]
            AR[authRoutes]
            PR[prospectoRoutes]
            ER[eventoRoutes]
        end
        subgraph Controllers["Controladores"]
            AC2[authController]
            PC[prospectoController]
            EC[eventoController]
        end
        subgraph Middlewares["Middlewares"]
            AM[authMiddleware - JWT]
        end
        subgraph Lib["Librerías"]
            PRISMA[prisma.js - Singleton]
        end
    end

    subgraph Database["Base de Datos"]
        PG[(PostgreSQL)]
        PGADMIN[pgAdmin]
    end

    subgraph External["Servicios Externos"]
        ZXING[@zxing - Escaneo PDF417]
        RECHARTS[recharts - Gráficos]
        QRCODE[qrcode - Generación QR]
    end

    PF --> SC
    PF --> CM
    PF --> API
    AD --> CS
    AD --> DC
    AD --> PDM
    AD --> EF
    AD --> QM
    AD --> API
    SC --> ZXING
    CS --> RECHARTS
    DC --> RECHARTS
    QM --> QRCODE

    API -->|HTTP/REST| AR
    API -->|HTTP/REST| PR
    API -->|HTTP/REST| ER
    AR --> AC2
    PR --> PC
    ER --> EC
    AC2 --> AM
    PC --> AM
    EC --> AM
    PC --> PRISMA
    EC --> PRISMA
    PRISMA --> PG
    PGADMIN --> PG

    SW -->|Cache| Frontend
    OFF -->|Sync| API
```

## Componentes del Frontend (React)

| Componente | Tipo | Descripción |
|---|---|---|
| `ProspectoForm` | Página | Formulario de captura con cascading selects y escaneo |
| `AdminDashboard` | Página | Panel admin con filtros, KPIs, tabla, gráficos, asignación de captadores |
| `AdminLogin` | Página | Login del panel admin (redirección por rol) |
| `CaptadorDashboard` | Página | Panel de captador con KPIs, actividades asignadas, inscritos, prospectos |
| `DuocMascot` | Componente | Mascota animada de Duoc UC con diálogo |
| `Scanner` | Componente | Escaneo de cédula (PDF417/MRZ) con @zxing |
| `ConsentModal` | Componente | Modal de consentimiento de datos |
| `EventForm` | Componente | Formulario CRUD de actividades |
| `QRModal` | Componente | Generación de QR para actividades |
| `ActivityChart` | Componente | Gráfico de actividades |
| `ChartsSection` | Componente | Sección de gráficos (lazy loaded) |
| `DetailCharts` | Componente | Gráficos de detalle (región, género, edad, carrera) |
| `ProspectDetailModal` | Componente | Modal con detalle completo del prospecto |

## Componentes del Backend (Node.js/Express)

| Componente | Tipo | Descripción |
|---|---|---|
| `authRoutes` | Router | Rutas de autenticación (/api/auth) |
| `prospectoRoutes` | Router | Rutas de prospectos (/api/prospectos) |
| `eventoRoutes` | Router | Rutas de eventos (/api/eventos) |
| `authController` | Controller | Lógica de registro y login |
| `prospectoController` | Controller | Lógica de prospectos (crear, listar, filtrar, exportar, duplicados, mis prospectos, inscritos por evento) |
| `eventoController` | Controller | Lógica de eventos (CRUD, validación de ventana, activos, mis eventos, asignar/desasignar captador) |
| `authController` | Controller | Lógica de autenticación (registro, login, listar usuarios) |
| `authMiddleware` | Middleware | Verificación JWT y rol ADMIN |
| `prisma.js` | Librería | Singleton de Prisma Client |

## Endpoints de la API

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/registro` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/usuarios` | Listar usuarios | Admin |
| POST | `/api/prospectos` | Crear prospecto (público) | No |
| GET | `/api/prospectos` | Listar prospectos (filtros + paginación) | JWT |
| GET | `/api/prospectos/mis` | Listar prospectos del captador | JWT |
| GET | `/api/prospectos/evento/:id` | Listar inscritos de una actividad | JWT |
| GET | `/api/prospectos/export` | Exportar a CSV | Admin |
| GET | `/api/prospectos/duplicados` | Listar prospectos duplicados | Admin |
| GET | `/api/eventos` | Listar actividades | No |
| GET | `/api/eventos/activos` | Listar actividades activas | JWT |
| GET | `/api/eventos/mis` | Listar actividades asignadas al captador | JWT |
| GET | `/api/eventos/:id/captadores` | Listar captadores de una actividad | Admin |
| POST | `/api/eventos` | Crear actividad | Admin |
| PUT | `/api/eventos/:id` | Editar actividad | Admin |
| POST | `/api/eventos/:id/asignar` | Asignar captador a actividad | Admin |
| DELETE | `/api/eventos/:id/asignar/:userId` | Desasignar captador | Admin |

## Infraestructura

| Componente | Tipo | Descripción |
|---|---|---|
| `PostgreSQL` | Base de datos | Almacenamiento persistente |
| `pgAdmin` | Herramienta | Administración de BD (puerto 5050) |
| `Docker Compose` | Orquestación | Levanta PostgreSQL + pgAdmin |
| `Service Worker` | PWA | Cache y funcionamiento offline |
| `basicSsl` | Plugin Vite | HTTPS para cámara en móvil |
```
`, "docs/fase2-desarrollo/grupales/Evidencias de documentación/uml-componentes.md")