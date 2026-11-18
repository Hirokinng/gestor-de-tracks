# Versiones e instaladores

Al preparar una nueva versión de Gestor de Tracks:

- Actualiza la versión de la aplicación en `package.json`, las dos versiones raíz de `package-lock.json` y la carpeta de salida del instalador.
- Actualiza siempre el README de la rama con la versión nueva, el enlace directo de descarga del instalador en GitHub Releases y los pasos de instalación y actualización. Distingue una versión de pruebas de una estable.
- Mantén las rutas de compilación de la documentación coherentes con esa versión. Ejecuta `npm run verify:release` y las pruebas correspondientes antes de publicar.
- Publica el instalador construido desde el commit de la versión, verifica su tamaño y huella en GitHub y confirma que el enlace del README apunta al archivo publicado.

Esta regla refleja la solicitud del usuario de actualizar siempre el README y su enlace de descarga al cambiar de versión.
