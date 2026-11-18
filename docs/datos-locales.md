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
