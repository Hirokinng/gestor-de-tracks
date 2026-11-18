# Contribuir a Gestor de Tracks

Requiere Node.js 24 o posterior y npm. Para trabajar en el proyecto:

```bash
npm ci
npm run dev
```

1. Crea una rama descriptiva: `git switch -c mejora/descripcion`.
2. Mantén el servidor en `server.js`, la persistencia en `storage.js` y la validación en `models/Pista.js`.
3. Conserva la interfaz en español y respeta [DESIGN.md](DESIGN.md) y [UX-CONTRACT.md](UX-CONTRACT.md).
4. Ejecuta `npm run test:api`. Si cambias la interfaz, ejecuta también `npm run test:ui` en un entorno con escritorio.
5. Describe el cambio y su verificación al abrir el pull request.

No incluyas `.env`, credenciales, bases de datos, audios personales, `node_modules` ni instaladores. Las pruebas deben usar datos sintéticos y bibliotecas temporales.

`tests/migracion.cjs` verifica una migración personal histórica y depende de archivos privados excluidos del repositorio. No forma parte de las comprobaciones de un clon limpio.
