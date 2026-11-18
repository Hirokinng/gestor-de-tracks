# Contrato de interacción de AppStudio

La identidad visual se mantiene en [DESIGN.md](DESIGN.md).

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Select nativo de fase en public/index.html | Modelo Pista y opciones del formulario | Menú del sistema operativo | Pruebas de formulario |
| Form | validarFormulario y bloquearFormulario en public/appEstudio.js | Modelo Pista y errores del servidor | Crear y editar | Validación y recuperación tras fallos |
| Scrollbar | Estilos globales de public/index.html | DESIGN.md | Documento y diálogos nativos | Inspección de CSS |
| CRUD | solicitar y funciones de catálogo en public/appEstudio.js | /api/pistas en server.js | Lista, detalle, crear, editar y eliminar | Pruebas de interfaz con API simulada |

- Entrada única en `/`; `/estudio.html` redirige al inicio.
- Crear y editar cierran el diálogo solo tras una respuesta HTTP satisfactoria y recargan el catálogo manteniendo el filtro local.
- Búsqueda local y transitoria: no se guarda en URL. Limpiar devuelve el foco al campo. El contador total no cambia al filtrar.
- Validación propia con novalidate: campos obligatorios sin espacios vacíos y calificación entera entre 1 y 5. Error asociado mediante aria-describedby, aria-invalid y foco al primer campo inválido.
- Los errores de red o servidor conservan el formulario y permiten reintentar. Guardar y eliminar bloquean duplicados y cierre durante la petición.
- Eliminar exige un diálogo con el nombre de la pista; Cancelar recibe el foco inicial. Una respuesta fallida mantiene el diálogo abierto.
- Carga y errores del catálogo se anuncian en una región de estado con botón Reintentar. Las respuestas antiguas no sustituyen las más recientes.
- StudioModal utiliza dialog nativo para la interacción de teclado y la contención del foco. Al cerrarlos, el foco vuelve al origen si aún existe, o al botón Nueva Sesión.

- Persistencia exclusivamente local en SQLite y uploads dentro de la carpeta de datos. La aplicación no consulta MongoDB ni carga recursos externos. Las pruebas de API verifican dos bibliotecas independientes y los datos tras reiniciar.
