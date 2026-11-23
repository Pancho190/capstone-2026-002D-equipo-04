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
        +EventoCaptador[] eventosAsignados
        +registrar() UsuarioAdmision
        +login() Token
    }

    class EventoCaptador {
        +String id
        +String evento_id
        +String usuario_id
        +DateTime fecha_asignacion
        +Evento evento
        +UsuarioAdmision usuario
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
        +EventoCaptador[] captadores
        +crear() Evento
        +editar() Evento
        +validarVentana() Boolean
        +asignarCaptador() EventoCaptador
        +desasignarCaptador() void
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
    UsuarioAdmision "1" --> "*" EventoCaptador : asignado
    Evento "1" --> "*" Prospecto : en
    Evento "1" --> "*" EventoCaptador : tiene
    Carrera "1" --> "*" Prospecto : interes
    Sede "1" --> "*" Prospecto : pertenece
    EventoCaptador "*" --> "1" UsuarioAdmision : usuario
    EventoCaptador "*" --> "1" Evento : evento
```

## Clases de control (Backend)

```mermaid
classDiagram
    class AuthController {
        +registrarUsuario(req, res) Response
        +loginUsuario(req, res) Response
        +obtenerUsuarios(req, res) Response
    }

    class ProspectoController {
        +crearProspecto(req, res) Response
        +obtenerProspectos(req, res) Response
        +obtenerMisProspectos(req, res) Response
        +obtenerInscritosPorEvento(req, res) Response
        +exportProspectos(req, res) Response
        +obtenerDuplicados(req, res) Response
    }

    class EventoController {
        +crearEvento(req, res) Response
        +obtenerEventos(req, res) Response
        +obtenerEvento(req, res) Response
        +actualizarEvento(req, res) Response
        +validarVentana(evento) Boolean
        +obtenerEventosActivos(req, res) Response
        +obtenerMisEventos(req, res) Response
        +asignarCaptador(req, res) Response
        +desasignarCaptador(req, res) Response
        +obtenerCaptadoresPorEvento(req, res) Response
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
        +Captador[] captadores
        +cargarDatos() void
        +verProspectos(evento) void
        +exportarCSV() void
        +limpiarFiltros() void
        +abrirAsignar(evento) void
        +asignarCaptador() void
        +desasignarCaptador() void
    }

    class CaptadorDashboard {
        +Prospecto[] prospectos
        +Evento[] eventos
        +Prospecto[] inscritos
        +Evento selectedEvento
        +cargarDatos() void
        +verInscritos(evento) void
    }

    class DuocMascot {
        +Boolean showDialog
        +onClick() void
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
    AdminDashboard --> DuocMascot : muestra
    CaptadorDashboard --> ProspectDetailModal : muestra
    CaptadorDashboard --> DetailCharts : muestra
    CaptadorDashboard --> DuocMascot : muestra
    ProspectoForm --> Scanner : usa
    ProspectoForm --> ConsentModal : usa
    ProspectoForm --> DuocMascot : muestra
```
`, "docs/fase2-desarrollo/grupales/Evidencias de documentación/uml-clases.md")