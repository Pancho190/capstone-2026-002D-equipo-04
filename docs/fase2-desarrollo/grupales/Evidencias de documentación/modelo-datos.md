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

### Relaciones
- UsuarioAdmision 1:N Prospecto
- Evento 1:N Prospecto
- Carrera 1:N Prospecto
- Sede 1:N Prospecto

### Restricción de unicidad
- `@@unique([rut, evento_id])`: un prospecto no se registra dos veces en el mismo evento.

## Diagrama ER (Mermaid)
```mermaid
erDiagram
  UsuarioAdmision ||--o{ Prospecto : captura
  Evento ||--o{ Prospecto : en
  Carrera ||--o{ Prospecto : interes
  Sede ||--o{ Prospecto : pertenece