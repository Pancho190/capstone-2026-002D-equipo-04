# Diagrama UML - Clases

## Descripción
Diagrama de clases del sistema basado en el modelo de datos (Prisma) y la arquitectura del backend.

## Clases del dominio

```mermaid
classDiagram
    class UsuarioAdmision {
        +String id
        +String rut
        +String nombre_completo
        +String correo
        +String password_hash
        +String rol
        +DateTime fecha_creacion
        +Prospecto[] prospectos
        +registrar() UsuarioAdmision
        +login() Token
    }

    class Prospecto {
        +String id
        +String rut
        +String nombre_completo
        +String apellidos
        +String genero
        +DateTime fecha_nacimiento
        +String correo
        +String telefono
        +String anio_curso
        +String region
        +String comuna
        +String identificacion
        +String escuela
        +String carrera_interes
        +String sede_preferencia
        +DateTime fecha_captura
        +Evento evento
        +UsuarioAdmision usuario
        +Carrera carrera
        +Sede sede
        +crear() Prospecto
        +listar() Prospecto[]
        +exportarCSV() String
        +detectarDuplicados() Prospecto[]
    }

    class Evento {
        +String id
        +String nombre
        +DateTime fecha_inicio
        +DateTime fecha_fin
        +String ubicacion
        +String tipo
        +Prospecto[] prospectos
        +crear() Evento
        +editar() Evento
        +validarVentana() Boolean
    }

    class Carrera {
        +String id
        +String nombre
        +String escuela
        +Prospecto[] prospectos
    }

    class Sede {
        +String id
        +String nombre
        +String region
        +Prospecto[] prospectos
    }

    UsuarioAdmision "1" --> "*" Prospecto : captura
    Evento "1" --> "*" Prospecto : en
    Carrera "1" --> "*" Prospecto : interes
    Sede "1" --> "*" Prospecto : pertenece
```

## Clases de control (Backend)

```mermaid
classDiagram
    class AuthController {
        +crearProspecto(req, res) Response
        +obtenerProspectos(req, res) Response
        +exportProspectos(req, res) Response
        +obtenerDuplicados(req, res) Response
    }

    class EventoController {
        +crearEvento(req, res) Response
        +obtenerEventos(req, res) Response
        +editarEvento(req, res) Response
        +validarVentana(evento) Boolean
    }

    class AuthMiddleware {
        +verificarToken(req, res, next) void
        +verificarAdmin(req, res, next) void
    }

    AuthController --> AuthMiddleware : usa
    EventoController --> AuthMiddleware : usa
```

## Clases de frontend (React)

```mermaid
classDiagram
    class ProspectoForm {
        +String rut
        +String nombre
        +String region
        +String comuna
        +String escuela
        +String carrera
        +String sede
        +handleSubmit() void
        +handleScan() void
        +syncOffline() void
    }

    class AdminDashboard {
        +Prospecto[] prospectos
        +Evento[] eventos
        +Duplicado[] duplicados
        +Filtros filtros
        +cargarDatos() void
        +verProspectos(evento) void
        +exportarCSV() void
        +limpiarFiltros() void
    }

    class Scanner {
        +Boolean ready
        +startCamera() void
        +onScan(data) void
        +onClose() void
    }

    class ConsentModal {
        +Boolean open
        +onAccept() void
        +onClose() void
    }

    class ProspectDetailModal {
        +Prospecto prospecto
        +onClose() void
    }

    class DetailCharts {
        +Prospecto[] prospectos
        +renderCharts() void
    }

    AdminDashboard --> ProspectDetailModal : muestra
    AdminDashboard --> DetailCharts : muestra
    ProspectoForm --> Scanner : usa
    ProspectoForm --> ConsentModal : usa
```
`, "docs/fase2-desarrollo/grupales/Evidencias de documentación/uml-clases.md")