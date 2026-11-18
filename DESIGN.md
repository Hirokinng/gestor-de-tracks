---
version: alpha
name: AppStudio
description: Gestor de sesiones de audio con superficies oscuras y acentos naranja.
colors:
  primary: "#ff4500"
  background: "#121212"
  surface: "#1e1e1e"
  navigation: "#0a0a0a"
  border: "#333333"
  text: "#ffffff"
  focus: "#ffb38f"
typography:
  sans:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
rounded:
  DEFAULT: "6px"
  button: "4px"
omitted:
  - section: spacing
    reason: Los espacios conservan la cuadrícula existente, implementada en public/estudio-base.css.
components:
  card: {}
  button: {}
  dialog: {}
---

# AppStudio

## Overview

Herramienta en español para gestionar sesiones de grabación y mezcla en escritorio y navegador. Conserva la identidad de rack de audio existente: cabecera negra con marca /// y borde naranja. Formularios y diálogos priorizan controles conocidos sobre decoración. No introducir una portada comercial ni recuperar la navegación de Colección.

Los estilos pertenecen a `public/index.html` y `public/estudio-base.css`; este documento refleja sus valores, sin generar CSS. Los diálogos pertenecen a `public/modal.js` sobre el elemento nativo dialog. No se cargan recursos externos.

## Colors

Fondo #121212, paneles #1e1e1e, cabecera #0a0a0a y bordes #333333. Naranja #ff4500 identifica la marca y las acciones principales. El foco usa #ffb38f. Los errores llevan texto explícito y los tonos de peligro de los estilos locales, separados de las acciones habituales.

## Typography

Mantener la pila de sistema del frontmatter. Marca con peso 700; botones principales con peso 600. Los mensajes y etiquetas se escriben en español. Los títulos largos pueden ocupar varias líneas.

## Layout

Contenedor y cuadrícula adaptable de los estilos locales: una columna en móvil, dos desde md y tres desde lg para las pistas. El documento controla el desplazamiento; los modales usan el comportamiento de los estilos locales. No fijar alturas al catálogo.

El catálogo incorpora una barra lateral de géneros de 200px, separada por un borde del área de resultados. Sigue la referencia de filtros aportada por el usuario: casillas, nombres y cantidades. Desde 768px aparece a la izquierda; en pantallas menores se coloca antes del catálogo, en dos columnas y con desplazamiento para listas largas. Con la barra lateral se muestran dos tarjetas hasta 1399px y tres desde 1400px.

## Elevation & Depth

Tarjetas con sombra 0 4px 6px rgba(0,0,0,0.3); cabecera con sombra 0 4px 12px rgba(0,0,0,0.5). No añadir capas decorativas.

## Shapes

Tarjetas de radio 6px; botones principales de radio 4px. Conservar las formas de los controles de los estilos locales.

## Components

`appEstudio.js` es el dueño del catálogo, filtros, validación y operaciones. Los diálogos usan StudioModal sobre dialog nativo y su gestión de foco; el código restaura el foco al origen y enfoca Cancelar al confirmar una eliminación. Los selectores de fase son nativos: el sistema operativo controla su menú. La búsqueda incluye un botón para limpiar. Los errores de formulario permanecen dentro del diálogo, junto a los campos cuando corresponde. El comentario crece al escribir y no se redimensiona manualmente. Los detalles se abren mediante un botón accesible por teclado, independiente del reproductor.

El campo de género usa SugerenciasGenero en `public/generos.js`, compartido entre crear y editar: sugerencias propias con ancho del campo, lista acotada y entrada libre. La biblioteca conserva los géneros al eliminar la última pista que los utiliza. El reproductor compartido `crearReproductor` en `public/reproductor.js` sustituye los controles multimedia del navegador: botón circular, línea de avance con tiempos y volumen secundario. Solo reproduce un audio a la vez; los errores incluyen una explicación visible.

Los tokens de estas superficies pertenecen a `:root` en `public/estudio-base.css` (modelo B, sin generación): colors.primary → --studio-accent; colors.surface → --studio-surface; colors.border → --studio-border; colors.focus → --studio-focus. Los consumen filtros, sugerencias y reproductor. Los estilos de la cabecera y los controles anteriores conservan su dueño en `public/index.html`.

Las calificaciones del catálogo y del detalle comparten `crearCalificacion` en `public/appEstudio.js`: cinco estrellas SVG de 15px en tono neutro `--studio-muted`, rellenas según el valor, con la puntuación numérica al lado. Los iconos se dibujan localmente y no dependen de glifos emoji ni recursos externos. Son indicadores de lectura; la edición conserva el campo numérico de 1 a 5.

## Do's and Don'ts

Conservar los datos introducidos al fallar una operación. Mantener dimensiones de botones mientras se guarda. Usar texto seguro para títulos, artistas y comentarios; no interpolarlos como HTML. Respetar movimiento reducido y barras de desplazamiento visibles. No usar alert, confirm ni prompt nativos.

Identidad de escritorio: Gestor de Tracks. El icono propio de tres controles de mezcla utiliza naranja #ff4500 sobre fondo #121212; el original editable es `public/icon.svg` y los formatos de distribución son `public/icon.png` y `public/icon.ico`. `scripts/crear-icono.py` genera el ICO en siete tamaños. El mismo icono se utiliza en la ventana, el ejecutable, el instalador y el desinstalador.
