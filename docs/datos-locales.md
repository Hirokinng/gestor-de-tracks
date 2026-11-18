# Datos locales y copias de seguridad

Cada usuario y equipo mantiene su propia biblioteca. En Windows, la carpeta predeterminada es `%LOCALAPPDATA%\EstudioHiro`.

| Elemento | Contenido |
| --- | --- |
| `pistas.sqlite` | Metadatos de las pistas y referencias a sus audios |
| `uploads/` | Copias de los audios añadidos desde la aplicación |
| `profile/` | Preferencias y archivos internos de Electron |
| `app.log` | Registro local de arranque |

En otros sistemas se usa `$XDG_DATA_HOME/EstudioHiro` o `~/.local/share/EstudioHiro` si esa variable no está definida.

## Comportamiento de los archivos

Al añadir un audio, la aplicación guarda una copia y conserva el original. Al reemplazar o eliminar una pista, elimina únicamente la copia que gestiona. Si la operación falla, conserva el audio anterior.

La biblioteca se guarda fuera de la carpeta de instalación y se conserva al actualizar. Al abrir Gestor de Tracks desde su acceso directo, la aplicación inicia automáticamente su servicio local y lo cierra al salir. Este servicio escucha en `127.0.0.1`, elige un puerto disponible y permite una sola instancia. No necesitas iniciar un servidor manualmente.

## Respaldar y restaurar

1. Cierra Gestor de Tracks.
2. Copia juntos `pistas.sqlite` y la carpeta `uploads/` a una ubicación de respaldo.
3. Para restaurar, cierra la aplicación en el equipo de destino y respalda primero su biblioteca si contiene datos.
4. Coloca la base de datos y los audios del respaldo en la carpeta de datos del destino.

La restauración reemplaza la biblioteca de destino; no combina catálogos. Copiar solo la base de datos no incluye los audios.

## Actualizar desde la versión 1.2.0

La feature `generos-filtros-reproductor` reutiliza la biblioteca SQLite de la versión 1.2.0. Conserva las pistas, referencias a los audios, fases, comentarios y calificaciones; al abrirla, crea el catálogo de géneros a partir de las pistas existentes sin reescribirlas ni mover sus audios.

Antes de instalar, cierra la aplicación y copia la carpeta completa `%LOCALAPPDATA%\EstudioHiro` a una ubicación de respaldo. Después ejecuta el nuevo instalador y abre Gestor de Tracks desde su acceso directo. No hace falta desinstalar la versión anterior.

La aplicación y su biblioteca tienen ubicaciones distintas:

| Ubicación predeterminada | Finalidad |
| --- | --- |
| `%LOCALAPPDATA%\Programs\Gestor de Tracks` | Archivos de la aplicación que sustituye el instalador |
| `%LOCALAPPDATA%\EstudioHiro` | Biblioteca y datos que se conservan al actualizar |

La versión estable y la feature usan la misma identidad de aplicación y la misma carpeta de datos para el mismo usuario de Windows. La carpeta que contiene el instalador no determina la ubicación de la biblioteca. Si utilizas `ESTUDIO_HIRO_DATA_DIR`, respalda la ruta configurada y mantén esa variable al abrir la nueva versión.

Para probar la feature con una biblioteca separada, utiliza el arranque desde el código con la configuración de la siguiente sección. Las bibliotecas históricas con MongoDB no se importan automáticamente; consulta [Versiones anteriores](#versiones-anteriores).

## Bibliotecas de desarrollo

Puedes definir `ESTUDIO_HIRO_DATA_DIR` con una ruta absoluta para mantener una biblioteca independiente. Ejemplo en PowerShell:

```powershell
$env:ESTUDIO_HIRO_DATA_DIR = Join-Path $PWD '.tmp-ui/biblioteca-desarrollo'
npm start
```

La aplicación no lee archivos `.env`. `PORT` permite cambiar el puerto del modo navegador; el valor predeterminado es `3000`.

## Versiones anteriores

La versión 1.2.0 usa SQLite y no se conecta a MongoDB ni importa automáticamente el catálogo anterior. Los audios históricos en `%USERPROFILE%\EstudioHiro\uploads` o `public/uploads` no se borran ni se modifican. La migración personal y sus datos están excluidos de este repositorio.

En Windows, el instalador utiliza `%LOCALAPPDATA%\Programs\Gestor de Tracks` y conserva el identificador `com.hirostudio.app` para actualizar la instalación previa.
