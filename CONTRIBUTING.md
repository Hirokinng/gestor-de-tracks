# Contribuir a Gestor de Tracks

Requiere Node.js 24 o posterior y npm. Para trabajar en el proyecto:

```bash
npm ci
npm start
```

Para generar y probar el instalador de Windows, ejecuta `npm run build` y abre el `.exe` de `release-local-1.3.1/`. El modo navegador (`npm run dev`, en `http://127.0.0.1:3000`) queda disponible como alternativa de desarrollo.

1. Crea una rama descriptiva: `git switch -c mejora/descripcion`.
2. Mantén el servidor en `server.js`, la persistencia en `storage.js` y la validación en `models/Pista.js`.
3. Conserva la interfaz en español y respeta [DESIGN.md](DESIGN.md) y [UX-CONTRACT.md](UX-CONTRACT.md).
4. Ejecuta `npm run test:api`. Si cambias la interfaz, ejecuta también `npm run test:ui` en un entorno con escritorio.
5. Describe el cambio y su verificación al abrir el pull request.

No incluyas `.env`, credenciales, bases de datos, audios personales, `node_modules` ni instaladores. Las pruebas deben usar datos sintéticos y bibliotecas temporales.

`tests/migracion.cjs` verifica una migración personal histórica y depende de archivos privados excluidos del repositorio. No forma parte de las comprobaciones de un clon limpio.

## Publicar una nueva versión

Actualiza `package.json`, las versiones raíz de `package-lock.json`, la carpeta de compilación y las rutas de la documentación. El README siempre debe incluir el número nuevo y el enlace directo de descarga del instalador de esa versión en GitHub Releases. Ejecuta `npm run verify:release`: GitHub Actions también comprueba esta coherencia.

Compila y prueba el instalador desde el commit de la versión; publica el `.exe` y su huella SHA-256 en Releases y comprueba el enlace del README. Si la versión aún está en una rama feature, publícala como versión de pruebas y acláralo en el README. Las reglas persistentes de este repositorio están en [AGENTS.md](AGENTS.md).
