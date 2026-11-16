# Product Vision

## Para quién
Captadores de admisión de Duoc UC que registran prospectos en terreno (ferias, colegios, eventos de admisión).

## Necesidad
La captura manual de datos de prospectos en admisión genera errores de digitación, pérdida de información cuando no hay conectividad y dificultad para gestionar grandes volúmenes de registros en eventos simultáneos. Los captadores necesitan una herramienta ágil que reduzca el tiempo de registro y elimine la transcripción manual desde la cédula de identidad.

## Producto
Una PWA offline-first que escanea el código PDF417 y la zona MRZ de la cédula de identidad chilena para autocompletar instantáneamente el RUT, nombre y fecha de nacimiento del prospecto. Los datos se almacenan localmente cuando no hay conexión y se sincronizan automáticamente con el backend al recuperar conectividad. Incluye un panel de administración para gestionar actividades, prospectos, duplicados y métricas de captación.

## Beneficio principal
Reducción del tiempo de registro de minutos a segundos, eliminación de errores de digitación y operación continua sin depender de conectividad. El panel de administración permite tomar decisiones basadas en datos (regiones, carreras, escuelas más demandadas, duplicados entre actividades).

## Diferenciador
A diferencia de formularios web tradicionales, esta solución funciona 100% offline en terreno, escanea automáticamente la cédula chilena (PDF417/MRZ), detecta prospectos duplicados entre actividades simultáneas y ofrece un panel de gestión con filtros, exportación CSV y gráficos analíticos. Es una PWA instalable que no requiere app store.

## Alcance
- Captura de prospectos con datos personales, ubicación, interés académico y contacto
- Gestión de actividades (eventos) con validación de ventana horaria
- Detección de duplicados entre actividades
- Filtros por fecha, actividad, tipo, mes, día y periodo de captación
- Exportación a CSV para análisis externo
- Generación de códigos QR para vincular prospectos a actividades