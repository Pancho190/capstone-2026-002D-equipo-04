# Definition of Done

## Criterios para dar por terminada una historia de usuario

### Código
- [ ] El código compila sin errores.
- [ ] Sigue las convenciones del proyecto (nombres, estructura).
- [ ] No introduce warnings de lint.

### Pruebas
- [ ] Existen tests unitarios para la funcionalidad.
- [ ] Los tests pasan (`npm test`).
- [ ] Se probó manualmente el endpoint.

### Integración
- [ ] El cambio está en una rama propia.
- [ ] Se hizo Pull Request hacia `main`.
- [ ] El PR fue revisado y aprobado.
- [ ] Se mergeó a `main`.

### Documentación
- [ ] El README se actualizó si cambió el setup.
- [ ] Los endpoints nuevos están documentados.

### Seguridad
- [ ] No hay secretos en el código.
- [ ] Las entradas se validan.
- [ ] Los errores no exponen información sensible.

## Criterios de aceptación (ejemplo: crear prospecto)
- El endpoint retorna 201 con el prospecto creado.
- Retorna 400 si faltan campos obligatorios.
- Retorna 409 si el RUT ya existe en el mismo evento.
- Retorna 401 si no hay token válido.