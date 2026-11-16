# Plan de Pruebas — Sistema de Captura de Prospectos

## 1. Objetivo
Verificar el correcto funcionamiento de los endpoints de autenticación y gestión de prospectos del backend, asegurando que las operaciones CRUD, validaciones y respuestas HTTP cumplan con los requisitos funcionales.

## 2. Alcance
- Módulo de autenticación (registro y login)
- Módulo de prospectos (creación, listado, validación de duplicados)
- Validación de respuestas HTTP (códigos de estado, mensajes de error)

## 3. Herramientas
- **Jest** (v30.5.2) — framework de testing
- **Supertest** (v7.3.2) — testing de endpoints HTTP
- **Node.js** — entorno de ejecución

## 4. Ejecución
```bash
cd src/Backend
npm test
```
El comando ejecuta Jest con `--runInBand` (secuencial) para evitar conflictos de BD.

## 5. Casos de prueba

### 5.1 Autenticación (`auth.test.js`)

| ID | Caso | Endpoint | Método | Datos de entrada | Resultado esperado | Estado |
|---|---|---|---|---|---|---|
| AUTH-01 | Registrar usuario nuevo | /api/auth/registro | POST | email, password, nombre, rut válidos | HTTP 201, mensaje "Usuario creado exitosamente" | ✅ Pass |
| AUTH-02 | Rechazar registro duplicado | /api/auth/registro | POST | Mismos datos que AUTH-01 | HTTP 400 (error de validación) | ✅ Pass |
| AUTH-03 | Login exitoso | /api/auth/login | POST | email y password del usuario creado | HTTP 200, token JWT definido | ✅ Pass |

### 5.2 Prospectos (`prospectos.test.js`)

| ID | Caso | Endpoint | Método | Datos de entrada | Resultado esperado | Estado |
|---|---|---|---|---|---|---|
| PROS-01 | Crear prospecto con datos válidos | /api/prospectos | POST | rut, nombre_completo, email | HTTP 201, prospecto creado | ✅ Pass |
| PROS-02 | Rechazar prospecto con RUT duplicado | /api/prospectos | POST | RUT ya existente | HTTP 400, error de duplicado | ✅ Pass |
| PROS-03 | Listar prospectos paginados | /api/prospectos | GET | page=1, limit=20 (con token) | HTTP 200, array de prospectos | ✅ Pass |

## 6. Resultados
- **Total de pruebas:** 6
- **Pruebas pasadas:** 6
- **Pruebas fallidas:** 0
- **Cobertura:** Autenticación (registro, duplicado, login) + Prospectos (creación, duplicado, listado)

## 7. Consideraciones
- Las pruebas generan datos únicos usando `Date.now()` para evitar colisiones entre ejecuciones.
- Se requiere una base de datos PostgreSQL activa para ejecutar las pruebas.
- Las pruebas se ejecutan en modo secuencial (`--runInBand`) para evitar race conditions en la BD.

## 8. Mejoras futuras
- Agregar pruebas para endpoints de eventos (CRUD).
- Agregar pruebas para filtros de prospectos (fecha, tipo, periodo).
- Agregar pruebas para exportación CSV.
- Agregar pruebas de autenticación con token inválido/expirado.
- Medir cobertura de código con `--coverage`.
`, "fase2-desarrollo\grupales\Plan de Pruebas.md")