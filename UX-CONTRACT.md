# Contrato de interacción de AppStudio

La identidad visual se mantiene en [DESIGN.md](DESIGN.md).

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Select nativo de fase en public/index.html | Modelo Pista y opciones del formulario | Menú del sistema operativo | Pruebas de formulario |
| Form | validarFormulario y bloquearFormulario en public/appEstudio.js | Modelo Pista y errores del servidor | Crear y editar | Validación y recuperación tras fallos |
| Scrollbar | Estilos globales de public/index.html | DESIGN.md | Documento y diálogos nativos | Inspección de CSS |
| CRUD | solicitar y funciones de catálogo en public/appEstudio.js | /api/pistas en server.js | Lista, detalle, crear, editar y eliminar | Pruebas de interfaz con API simulada |
| Combobox | SugerenciasGenero en public/generos.js | /api/generos y catálogo local en storage.js | Entrada libre al crear y editar | tests/generos-ui.cjs |
| Audio | crearReproductor en public/reproductor.js | HTMLAudioElement y archivo local de la pista | Reproducción, pausa, avance, volumen y error | WAV sintético en tests/generos-ui.cjs |

- Entrada única en `/`; `/estudio.html` redirige al inicio.
- Crear y editar cierran el diálogo solo tras una respuesta HTTP satisfactoria y recargan el catálogo manteniendo el filtro local.
- Búsqueda local y transitoria: no se guarda en URL. Limpiar devuelve el foco al campo. El contador total no cambia al filtrar.
- Filtros de género locales y transitorios, combinados con búsqueda. Varias casillas incluyen las pistas de cualquiera de los géneros marcados. Los contadores indican el total por género de toda la biblioteca. Una lista sin coincidencias invita a limpiar los filtros. Crear, editar y eliminar conservan los filtros activos.
- Un género por pista, con escritura libre y sugerencias al enfocar. Los nombres nuevos se registran solo al guardar correctamente una pista. NFC, espacios y mayúsculas se normalizan para reutilizar el nombre existente; no se borran ni se reescriben las pistas históricas al importar su catálogo de géneros. El registro persiste aunque un género no tenga pistas. Fuente: requisito de géneros libres y filtros de esta feature; implementación de persistencia en storage.js.
- Las sugerencias se navegan con flechas y se eligen con Enter o puntero. Escape cierra primero la lista; Tab permite continuar el formulario. La composición IME no selecciona opciones. Si falla la carga, se permite escribir un género y reintentar sin perder los datos.
- El reproductor muestra avance, tiempos y volumen con etiquetas accesibles y rangos nativos operables con teclado. No descarga el audio hasta solicitar reproducción; duración desconocida y avance deshabilitado hasta cargar metadatos. Iniciar otra pista pausa la anterior. Filtrar o recargar el catálogo detiene la reproducción. Los errores permiten reintentar o reemplazar el audio desde Editar.
- Validación propia con novalidate: artista y género obligatorios sin espacios vacíos y calificación entera entre 1 y 5. Título opcional: si está vacío se utiliza el nombre original completo del audio, incluida su extensión. En una sesión nueva sin audio se usa «Sin título». Al editar sin adjuntar otro audio se usa el nombre original guardado o, para pistas antiguas que no lo tienen, se conserva el título anterior. Un título escrito tiene prioridad. El servidor conserva el nombre original como metadato separado de la copia de audio con identificador propio. Error asociado mediante aria-describedby, aria-invalid y foco al primer campo inválido.
- La calificación usa el mismo indicador SVG de lectura en catálogo y detalle. Expone «N de 5» mediante una única etiqueta accesible; los cinco iconos y el texto numérico visual se ocultan del árbol accesible para evitar anuncios duplicados. Los valores guardados no cambian.
- Los errores de red o servidor conservan el formulario y permiten reintentar. Guardar y eliminar bloquean duplicados y cierre durante la petición.
- Eliminar exige un diálogo con el nombre de la pista; Cancelar recibe el foco inicial. Una respuesta fallida mantiene el diálogo abierto.
- Carga y errores del catálogo se anuncian en una región de estado con botón Reintentar. Las respuestas antiguas no sustituyen las más recientes.
- StudioModal utiliza dialog nativo para la interacción de teclado y la contención del foco. Al cerrarlos, el foco vuelve al origen si aún existe, o al botón Nueva Sesión.

- Persistencia exclusivamente local en SQLite y uploads dentro de la carpeta de datos. La aplicación no consulta MongoDB ni carga recursos externos. Las pruebas de API verifican dos bibliotecas independientes y los datos tras reiniciar.
