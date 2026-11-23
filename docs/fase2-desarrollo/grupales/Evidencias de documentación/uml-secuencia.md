# Diagrama UML - Secuencia

## Descripción
Diagrama de secuencia para el flujo principal de captura de un prospecto.

## Flujo 1: Captura de prospecto (con conexión)

```mermaid
sequenceDiagram
    actor Captador
    participant Scanner as Scanner (Frontend)
    participant Form as ProspectoForm
    participant API as Backend API
    participant DB as PostgreSQL

    Captador->>Scanner: Escanea cédula (PDF417/MRZ)
    Scanner->>Form: Autocompleta RUT, nombre, fecha nacimiento
    Captador->>Form: Completa campos restantes (región, comuna, escuela, carrera, sede, email, teléfono)
    Captador->>Form: Acepta consentimiento de datos
    Form->>API: POST /api/prospectos (con JWT token)
    API->>API: Verificar token JWT
    API->>DB: Verificar RUT duplicado (findFirst)
    DB-->>API: No existe duplicado
    API->>DB: Crear prospecto (prisma.prospecto.create)
    DB-->>API: Prospecto creado
    API-->>Form: 201 Created { mensaje, prospecto }
    Form-->>Captador: Mensaje de éxito
```

## Flujo 2: Captura de prospecto (sin conexión - offline)

```mermaid
sequenceDiagram
    actor Captador
    participant Form as ProspectoForm
    participant Offline as Offline Storage (localStorage)
    participant SW as Service Worker
    participant API as Backend API
    participant DB as PostgreSQL

    Captador->>Form: Completa formulario
    Form->>Form: Intenta enviar (sin conexión)
    Form->>Offline: Guardar prospecto en cola local
    Offline-->>Form: Guardado exitosamente
    Form-->>Captador: Mensaje "Guardado offline, se sincronizará al recuperar conexión"

    Note over SW: Al recuperar conexión...

    SW->>Offline: Detectar prospectos pendientes
    Offline-->>SW: Lista de prospectos pendientes
    loop Por cada prospecto pendiente
        SW->>API: POST /api/prospectos
        API->>DB: Crear prospecto
        DB-->>API: Creado
        API-->>SW: 201 Created
        SW->>Offline: Eliminar de cola local
    end
    SW-->>Form: Sincronización completada
```

## Flujo 3: Listar prospectos en panel admin

```mermaid
sequenceDiagram
    actor Admin
    participant Dashboard as AdminDashboard
    participant API as Backend API
    participant DB as PostgreSQL

    Admin->>Dashboard: Accede a /admin
    Dashboard->>API: GET /api/prospectos?filtros (JWT token)
    API->>API: Verificar token + rol ADMIN
    API->>DB: findMany con filtros (fecha, evento, tipo, mes, dia, periodo)
    DB-->>API: Lista de prospectos
    API-->>Dashboard: { data, total, page, limit }
    Dashboard-->>Admin: Tabla con prospectos + KPIs + gráficos
```

## Flujo 4: Detección de duplicados

```mermaid
sequenceDiagram
    actor Admin
    participant Dashboard as AdminDashboard
    participant API as Backend API
    participant DB as PostgreSQL

    Admin->>Dashboard: Clic en "Duplicados"
    Dashboard->>API: GET /api/prospectos/duplicados (JWT token)
    API->>API: Verificar token + rol ADMIN
    API->>DB: findMany (todos los prospectos con evento)
    DB-->>API: Lista de prospectos
    API->>API: Agrupar por RUT
    API->>API: Filtrar RUTs con más de 1 evento distinto
    API-->>Dashboard: Lista de duplicados con actividades
    Dashboard-->>Admin: Tabla de prospectos duplicados
```

## Flujo 5: Asignación de captador a actividad

```mermaid
sequenceDiagram
    actor Admin
    participant Dashboard as AdminDashboard
    participant API as Backend API
    participant DB as PostgreSQL

    Admin->>Dashboard: Clic en "Asignar" en actividad
    Dashboard->>API: GET /api/eventos/:id/captadores (JWT token)
    API->>API: Verificar token + rol ADMIN
    API->>DB: findMany EventoCaptador (where evento_id)
    DB-->>API: Lista de captadores asignados
    API-->>Dashboard: Lista de captadores
    Dashboard-->>Admin: Modal con captadores asignados + dropdown

    Admin->>Dashboard: Selecciona captador y clic "Asignar"
    Dashboard->>API: POST /api/eventos/:id/asignar { usuario_id }
    API->>API: Verificar token + rol ADMIN
    API->>DB: create EventoCaptador (evento_id, usuario_id)
    DB-->>API: Asignación creada
    API-->>Dashboard: 201 Created
    Dashboard-->>Admin: Actualiza lista de captadores asignados
```

## Flujo 6: Vista de inscritos por actividad (Captador)

```mermaid
sequenceDiagram
    actor Captador
    participant Dashboard as CaptadorDashboard
    participant API as Backend API
    participant DB as PostgreSQL

    Captador->>Dashboard: Clic en "Ver inscritos" en actividad asignada
    Dashboard->>API: GET /api/prospectos/evento/:id (JWT token)
    API->>API: Verificar token
    API->>DB: findMany (where evento_id = id)
    DB-->>API: Lista de prospectos inscritos
    API-->>Dashboard: { data, total }
    Dashboard-->>Captador: Tabla con RUT, nombre, correo, teléfono, fecha captura
```
`, "docs/fase2-desarrollo/grupales/Evidencias de documentación/uml-secuencia.md")