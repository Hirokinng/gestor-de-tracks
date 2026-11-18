<div align="center">
  <img src="public/icon.png" alt="Icono de Gestor de Tracks" width="96" height="96">
  <h1>Gestor de Tracks</h1>
  <p><strong>Tu biblioteca de sesiones, de la composición al máster.</strong></p>
  <p>Organiza pistas, escucha tus audios y sigue el avance de cada proyecto musical desde una aplicación de escritorio para Windows.</p>
  <p><strong>Aplicación de escritorio para Windows</strong> · <strong>Biblioteca local</strong> · <strong>Uso sin conexión</strong></p>
  <p><a href="#instalar-en-windows">Instalar en Windows</a> · <a href="#funciones">Funciones</a> · <a href="#estructura">Estructura</a> · <a href="docs/datos-locales.md">Datos y respaldos</a></p>
</div>

![Catálogo de Gestor de Tracks con una sesión de ejemplo](docs/images/catalogo.png)

## Funciones

- **Catálogo de sesiones:** crea, consulta, edita y elimina pistas con título, artista y género.
- **Seguimiento de producción:** Composición → Grabación → Mezcla → Masterización → Finalizado.
- **Audios por pista:** adjunta, reproduce y reemplaza archivos desde la biblioteca.
- **Búsqueda rápida:** filtra por título o artista y consulta el total de pistas.
- **Géneros de tu biblioteca:** selecciona una sugerencia o escribe un género nuevo; filtra por uno o varios géneros desde la barra lateral.
- **Reproductor integrado:** controles de reproducción, pausa, avance y volumen con el estilo de la aplicación.
- **Valoración y notas:** calificaciones de 1 a 5 y comentarios para cada sesión.
- **Biblioteca local:** SQLite y copias de audio independientes para cada usuario y equipo.
- **Interfaz en español:** tema oscuro, acentos naranja y diálogos con navegación por teclado.

Una vez instalada, la aplicación funciona sin conexión a internet y guarda la biblioteca en tu equipo. Se abre en su propia ventana y gestiona automáticamente su servicio local.

## Instalar en Windows

### Descargar la versión 1.3.0

[**Descargar Gestor de Tracks 1.3.0 para Windows (.exe)**](https://github.com/Hirokinng/gestor-de-tracks/releases/download/v1.3.0/Gestor.de.Tracks.Setup.1.3.0.exe)

La **1.3.0** incluye el catálogo de géneros con sugerencias, los filtros laterales y el nuevo reproductor. Está publicada como versión de pruebas de la rama `feature/generos-filtros-reproductor`, basada en `dev`, y todavía no está integrada en `main`. Consulta sus [notas y archivos de descarga](https://github.com/Hirokinng/gestor-de-tracks/releases/tag/v1.3.0).

El instalador generado desde el código de esta versión se encuentra en:

```text
release-local-1.3.0/Gestor de Tracks Setup 1.3.0.exe
```

1. Si ya utilizas la aplicación, sigue los pasos de [actualización y respaldo](#actualizar-conservando-tu-biblioteca) antes de instalar.
2. Descarga `Gestor.de.Tracks.Setup.1.3.0.exe` desde el enlace anterior, ejecútalo y completa la instalación.
3. Abre **Gestor de Tracks** desde el menú Inicio o su acceso directo.
4. Comprueba tus pistas anteriores y prueba las sugerencias de género, los filtros y el reproductor.

El instalador incluye el entorno de ejecución. Si prefieres trabajar con el código, puedes [generar el instalador](#generar-el-instalador-desde-el-código) o abrir la aplicación con `npm start`.

### Versión estable anterior: 1.2.0

[**Descargar Gestor de Tracks 1.2.0 para Windows (.exe)**](https://github.com/Hirokinng/gestor-de-tracks/releases/download/v1.2.0/Gestor.de.Tracks.Setup.1.2.0.exe)

Este enlace descarga la versión estable anterior, que todavía no incluye las mejoras de esta feature.

La aplicación instalada incluye su entorno de ejecución: para utilizarla solo necesitas Windows. No requiere instalar Node.js, npm o Git, abrir una terminal ni configurar una base de datos.

## Actualizar conservando tu biblioteca

Al actualizar desde la versión **1.2.0 con SQLite**, se conservan tus pistas y proyectos, audios, fases, comentarios y calificaciones. La biblioteca se guarda fuera de la carpeta de instalación, en `%LOCALAPPDATA%\EstudioHiro`, y la feature reutiliza esa misma ubicación para el mismo usuario de Windows. Los géneros de tus pistas existentes aparecen automáticamente en las sugerencias y los filtros.

1. Cierra Gestor de Tracks antes de actualizar.
2. Abre `%LOCALAPPDATA%` desde el Explorador de archivos y copia la carpeta completa `EstudioHiro` a otra ubicación como respaldo.
3. Ejecuta el nuevo instalador. No necesitas desinstalar la versión anterior.
4. Abre la aplicación y verifica tu biblioteca antes de continuar trabajando.

El instalador actualiza la misma aplicación. La versión estable y la feature comparten la biblioteca por defecto. Si quieres probar con datos independientes, consulta [Bibliotecas de desarrollo](docs/datos-locales.md#bibliotecas-de-desarrollo). Si has configurado `ESTUDIO_HIRO_DATA_DIR`, conserva esa configuración y respalda la carpeta indicada por ella.

Las versiones históricas con MongoDB requieren un proceso de migración distinto: consulta [Versiones anteriores](docs/datos-locales.md#versiones-anteriores).

## Uso de la aplicación

- Crea una pista con su título, artista y género.
- Adjunta un audio para escucharlo desde tu biblioteca.
- Actualiza la fase de producción, la valoración y los comentarios a medida que avances.
- Usa la búsqueda para encontrar tus sesiones y edítalas o elimínalas desde el catálogo.
- Marca géneros en la barra lateral para filtrar tus pistas. Puedes combinarlos con la búsqueda y restablecerlos con **Limpiar**.
- Al guardar una pista con un género nuevo, este queda disponible como sugerencia para las siguientes sesiones.

Los cambios se guardan en tu equipo. Al cerrar y volver a abrir la aplicación, recuperas tu biblioteca. Los audios que adjuntas se copian a la carpeta de datos de la aplicación; conserva un [respaldo de la biblioteca](docs/datos-locales.md#respaldar-y-restaurar) para trasladarla a otro equipo.

## Desarrollo

Para abrir la ventana de escritorio directamente desde el código, sin instalarla:

```bash
npm ci
npm start
```

El modo navegador es una opción de desarrollo. Puedes iniciarlo con `npm run dev` y visitar `http://127.0.0.1:3000`. Consulta la [guía para contribuir](CONTRIBUTING.md) para trabajar en el proyecto y ejecutar las pruebas.

### Generar el instalador desde el código

Este paso requiere **Windows, Node.js 24 o posterior y npm**, además de conexión a internet para descargar las dependencias y herramientas de compilación.

1. Descarga y extrae el código desde **Code → Download ZIP**, o clona el repositorio con Git.
2. Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm ci
npm run build
```

3. Encontrarás el instalador en `release-local-1.3.0/Gestor de Tracks Setup 1.3.0.exe`.
4. Ejecútalo y abre **Gestor de Tracks** desde el menú Inicio.

El instalador generado se puede copiar a otro equipo Windows para instalar la aplicación sin descargar el código ni sus dependencias por separado. Los ejecutables no se incluyen en el repositorio de código.

> En PowerShell, si una política impide ejecutar `npm.ps1`, utiliza `npm.cmd` en los comandos anteriores.

### Comandos de desarrollo

| Comando | Descripción |
| --- | --- |
| `npm start` | Abrir la aplicación de escritorio con Electron |
| `npm run dev` | Iniciar el servidor local para navegador |
| `npm run test:api` | Probar validación, SQLite, audios, reinicios y aislamiento entre bibliotecas |
| `npm run test:ui` | Probar la interfaz en Electron con una API simulada y sin peticiones externas |
| `npm run build` | Generar el instalador de Windows con electron-builder |
| `npm run verify:release` | Verificar que la versión, el instalador y su enlace de descarga en README coincidan |
| `npm run test:desktop` | Probar la aplicación empaquetada; requiere compilar primero |

El instalador se genera en `release-local-1.3.0/`. Los ejecutables se distribuyen por GitHub Releases; los ejecutables y las dependencias no se guardan en Git.

## Estructura

```text
gestor-de-tracks/
├── .github/workflows/    # Verificación automática de la API
├── build/               # Configuración del instalador NSIS
├── docs/                # Documentación y capturas
├── models/Pista.js      # Validación y fases de producción
├── public/              # Interfaz, estilos, diálogos e iconos
├── scripts/             # Herramientas para generar los iconos
├── tests/               # Pruebas de API, interfaz y aplicación empaquetada
├── main.js              # Ventana y ciclo de vida de Electron
├── server.js            # API HTTP y archivos estáticos
├── storage.js           # Persistencia y biblioteca SQLite
└── package.json         # Dependencias, comandos y empaquetado
```

La aplicación de escritorio inicia su API local automáticamente. El modo navegador de desarrollo consume esa misma API. `server.js` coordina las solicitudes, `models/Pista.js` valida los datos y `storage.js` los guarda en SQLite. Los audios se almacenan aparte, en la carpeta de datos del usuario.

## API local

| Método | Ruta | Operación |
| --- | --- | --- |
| `GET` | `/api/pistas` | Listar pistas; acepta `?fase=Mezcla` |
| `GET` | `/api/generos` | Listar los géneros guardados en la biblioteca |
| `POST` | `/api/pistas` | Crear una pista |
| `PUT` | `/api/pistas/:id` | Actualizar una pista |
| `DELETE` | `/api/pistas/:id` | Eliminar una pista y su copia de audio |

Los campos son `titulo`, `artista`, `genero`, `fase`, `calificacion` y `comentario`. Para adjuntar audio, envía `multipart/form-data` con el campo `archivoAudio`. Las operaciones sin archivo también aceptan JSON.

## Datos y documentación

En Windows, los datos se guardan en `%LOCALAPPDATA%\EstudioHiro`. Una instalación nueva en otro usuario o equipo comienza con una biblioteca vacía; una actualización en el mismo usuario conserva la biblioteca existente. El repositorio no incluye canciones, bases de datos ni credenciales.

- [Datos locales, configuración y copias de seguridad](docs/datos-locales.md)
- [Guía para contribuir](CONTRIBUTING.md)
- [Identidad visual](DESIGN.md)
- [Contrato de interacción](UX-CONTRACT.md)

Las pruebas de migración histórica dependen de una biblioteca privada y no se ejecutan en un clon limpio. La comprobación automática de GitHub ejecuta las pruebas de API; las pruebas de interfaz y escritorio se ejecutan en un entorno con escritorio.
