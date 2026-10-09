# Sistema Integrado de Captura Digital y Gestión de Prospectos para Admisión

> Plantilla de README obligatorio — CAPSTONE 2026 (PTY4614). Reemplaza todo el texto entre corchetes y borra estas notas antes de entregar.

## 1. Descripción del proyecto
Consiste en el desarrollo de una plataforma web progresiva (PWA) offline-first. El sistema utilizará la cámara del dispositivo móvil para escanear el código PDF417 y la zona MRZ de la cédula de identidad chilena, autocompletando instantáneamente el RUT, nombre y fecha de nacimiento del prospecto. Al recuperar la conectividad a internet, los datos capturados se sincronizarán automáticamente con la base de datos central.

## 2. Tecnologías utilizadas
- **Lenguajes:** [ej. Python, JavaScript]
- **Frameworks:** [ej. Django / React / Spring Boot]
- **Base de datos:** [ej. PostgreSQL / MongoDB]
- **Cloud / Infraestructura:** [ej. AWS / Azure / Docker]

## 3. Instrucciones para ejecutar el proyecto localmente
```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/nombre-del-proyecto.git
cd nombre-del-proyecto

# 2. Variables de entorno (copiar el ejemplo y completar)
cp docker/.env.example .env

# 3. Levantar el sistema con Docker
docker compose up --build
```
[Detalla puertos, credenciales de prueba y cómo acceder a la app.]

## 4. Integrantes del equipo y roles
| Integrante | Rol |
|---|---|
| [Briones, Cristian] | [Líder de proyecto / Backend] |
| [Silva, Francisco] | [Frontend / QA] |
| [Gatillon, Ignacio] | [Base de datos / DevOps] |

## 5. Metodología de trabajo
[Scrum / Kanban / DevOps. Explica ceremonias, tablero y herramienta usada.]

## 6. Arquitectura de la solución
[Descripción o diagrama de arquitectura. Puedes enlazar la imagen en /docs.]

---
### Sección de innovación (documento de cierre)
- **¿Qué problema resuelve?** [respuesta]
- **¿Qué hace diferente a la solución?** [respuesta]
- **¿Qué valor agrega?** [respuesta]