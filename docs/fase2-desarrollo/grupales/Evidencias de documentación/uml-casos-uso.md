# Diagrama UML - Casos de Uso

## Actores
- **Captador**: usuario que registra prospectos en terreno.
- **Administrador**: gestiona usuarios y prospectos.

## Casos de uso

### Autenticación
- Registrar usuario
- Iniciar sesión

### Gestión de prospectos
- Capturar prospecto
- Listar prospectos
- Validar RUT y datos obligatorios

## Diagrama (Mermaid)
```mermaid
graph TD
  A[Captador] --> B(Registrar usuario)
  A --> C(Iniciar sesión)
  A --> D(Capturar prospecto)
  A --> E(Listar prospectos)
  F[Administrador] --> G(Gestionar usuarios)
  F --> E