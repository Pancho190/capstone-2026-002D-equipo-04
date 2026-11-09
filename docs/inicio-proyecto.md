# Documento de Inicio de Proyecto

## Stakeholders
- **Captadores de admisión:** usuarios que registran prospectos en terreno.
- **Administradores:** gestionan usuarios y prospectos.
- **Equipo docente:** evalúa el proyecto y las evidencias.
- **Cliente (Duoc UC):** recibe el sistema de captura digital.

## Alcance MVP
### Incluye
- Registro y login de usuarios (captadores y administradores).
- Captura de prospectos con RUT y nombre.
- Validación de RUT y datos obligatorios.
- Listado paginado de prospectos.
- Backend con API REST y PostgreSQL.
- Frontend PWA con escaneo de cédula (PDF417/MRZ).
- Sincronización offline de prospectos.
- Roles de administrador.

## Restricciones
- Tiempo: proyecto académico con fechas de entrega por fase.
- Tecnología: Node.js, Express, Prisma, PostgreSQL, React (PWA).
- Recursos: equipo de 3 integrantes.
- Datos: cédula de identidad chilena (PDF417/MRZ).