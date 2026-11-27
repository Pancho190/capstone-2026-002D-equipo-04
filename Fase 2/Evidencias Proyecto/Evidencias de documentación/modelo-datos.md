# Modelo de Datos

## Entidades principales

### UsuarioAdmision
| Campo | Tipo | Restricción |
|---|---|---|
| id | UUID | PK, auto |
| rut | String | UNIQUE |
| nombre_completo | String | |
| correo | String | UNIQUE |
| password_hash | String | |
| rol | String | default: "Anfitrion" |
| fecha_creacion | DateTime | default: now() |

### Prospecto
| Campo | Tipo | Restricción |
|---|---|---|
| id | UUID | PK, auto |
| rut | String | |
| nombre_completo | String | |
| apellidos | String? | |
| fecha_nacimiento | DateTime? | |
| correo | String? | |
| telefono | String? | |
| fecha_captura | DateTime | default: now() |
| usuario_id | UUID | FK → UsuarioAdmision |
| evento_id | UUID? | FK → Evento |
| carrera_id | UUID? | FK → Carrera |
| sede_id | UUID? | FK → Sede |

### Evento
| Campo | Tipo | Restricción |
|---|---|---|
| id | UUID | PK, auto |
| nombre | String | |
| fecha_inicio | DateTime | |
| fecha_fin | DateTime | |
| ubicacion | String | |
| tipo | String | |
| prospectos | Prospecto[] | |
| captadores | EventoCaptador[] | |

### EventoCaptador
| Campo | Tipo | Restricción |
|---|---|---|
| id | UUID | PK, auto |
| evento_id | UUID | FK → Evento |
| usuario_id | UUID | FK → UsuarioAdmision |
| fecha_asignacion | DateTime | default: now() |
| | | @@unique([evento_id, usuario_id]) |

### Relaciones
- UsuarioAdmision 1:N Prospecto
- UsuarioAdmision 1:N EventoCaptador
- Evento 1:N Prospecto
- Evento 1:N EventoCaptador
- Evento N:M UsuarioAdmision (a través de EventoCaptador)
- Carrera 1:N Prospecto
- Sede 1:N Prospecto

### Restricción de unicidad
- `@@unique([rut, evento_id])`: un prospecto no se registra dos veces en el mismo evento.

## Diagrama ER (Mermaid)
```mermaid
erDiagram
  UsuarioAdmision ||--o{ Prospecto : captura
  UsuarioAdmision ||--o{ EventoCaptador : asignado
  Evento ||--o{ Prospecto : en
  Evento ||--o{ EventoCaptador : tiene
  EventoCaptador }o--|| UsuarioAdmision : usuario
  EventoCaptador }o--|| Evento : evento
  Carrera ||--o{ Prospecto : interes
  Sede ||--o{ Prospecto : pertenece