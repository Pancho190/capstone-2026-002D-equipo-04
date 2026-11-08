# Requisitos No Funcionales

## Rendimiento
- Tiempo de respuesta de la API: < 2 segundos para operaciones CRUD.
- Soporte para al menos 50 usuarios concurrentes.

## Seguridad
- Autenticación mediante JWT con expiración de 12 horas.
- Contraseñas hasheadas con bcrypt (costo 10).
- Validación de entrada en todos los endpoints.
- CORS restringido a orígenes autorizados.

## Disponibilidad
- El backend debe estar disponible 99% del tiempo.
- Uso de Docker para facilitar despliegue y recuperación.

## Usabilidad
- Mensajes de error claros en español.
- Validación de formato de RUT chileno.
- Paginación en listados para no sobrecargar la respuesta.

## Mantenibilidad
- Código modular (controladores, rutas, middlewares separados).
- Prisma como ORM para abstracción de base de datos.
- Documentación técnica actualizada.