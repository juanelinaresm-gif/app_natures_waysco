# Header y hero móvil como una sola composición

Cambia por debajo de 960 px, que es donde la portada es verde. El escritorio no cambia. Sin commit, push ni deploy.

## Qué cambió

- **Barra:** usa el mismo verde bosque que la parte superior de la portada, `rgb(14 40 27)`, guardado en la variable `--forest`.
  - Es sólida, sin el blur translúcido crema.
  - No tiene borde ni sombra al inicio.
  - La portada llega a ese verde pleno en su borde superior. Lo consigue con una capa que va del verde pleno a transparente en 120 px, o en 72 px en horizontal.
- **Logo:** no existe una versión para fondo oscuro; el logo tiene fondo blanco y solo es legible sobre claro.
  - Usé la solución de la barra oscura del propio diseño (variante «B» de Claude Design): el logo dentro de una píldora blanca, sin filtros ni cambios de color.
  - En 320–379 px la píldora es un poco más compacta para que quepan WhatsApp y el menú.
- **Menú:**
  - Botón transparente, con texto crema y borde claro sutil.
  - Panel desplegable del mismo verde, con enlaces crema y separadores claros. Su funcionamiento no cambió.
  - WhatsApp conserva su píldora turquesa destacada.
  - El foco del teclado se ve en crema sobre el verde (el turquesa general apenas se distinguía), en la barra y en la portada.
- **Unión con la cinta:**
  - Sobre el video, un degradado de `clamp(56px, 16vw, 96px)` de alto va de transparente a exactamente `#1c2b22`, el verde de la cinta, en el borde inferior.
  - Casi toda la transición ocurre al final, para no tapar el tarro.
  - La cinta está inclinada (−1,5°) y dejaba ver una cuña crema sobre ella, a la izquierda. Esa cuña ahora se pinta del mismo verde, así la unión llega hasta el borde inclinado.
  - La cuña de abajo sigue mostrando el fondo de la página.
- **Lo que no cambió:** el video de fondo, la capa oscura detrás del título y los botones, el título, los colores de énfasis, los textos, los enlaces y el control de pausa.

## Archivos modificados

- `src/index.css`: variable `--forest`.
- `src/components/Header.css`: barra verde, píldora del logo, menú y panel en verde, foco crema.
- `src/components/Hero.css`: verde pleno arriba, unión inferior con la cinta y foco crema.
- `src/components/Hero.tsx`: la capa de unión (`hero__fade-y`) pasa a estar después del degradado verde, para que termine exactamente en el color de la cinta. En escritorio no cambia nada, porque ahí el degradado verde no existe.
- `src/components/Ticker.css`: cuña sobre la cinta en verde, solo por debajo de 960 px.
- `scripts/verify-ui.mjs`: nuevas comprobaciones de las uniones.

## Verificaciones

- Build, lint y pruebas unitarias (9/9) pasan.
- `npm run verify` da **207/207** (`verify-header-movil.txt`). Nuevas en 320, 375, 390 y 430, con píxeles reales:

  | Comprobación | Resultado |
  | --- | --- |
  | Barra y parte superior de la portada | Mismo verde: barra `14,40,27` y portada `15,41,27` (diferencia de 1 por redondeo) |
  | Borde inferior y cuña inclinada | Verde de la cinta: borde `30,45,35`, cuña `28,43,34`, sin crema entre ambos |
  | Barra al desplazarse | Sigue opaca, en `rgb(14, 40, 27)` |
  | Contraste del menú (enlaces y botón «Menú») | 14,6:1 |

- Siguen pasando: sin desbordamiento horizontal, áreas táctiles de al menos 44 px, menú (Escape, clic fuera, orden del teclado), contraste del texto de la portada en 8 cuadros del video, y video, pausa y movimiento reducido.
- En 320 px la barra cabe con 16 px entre el logo y WhatsApp. En 390 hay 16 px y en 430, 37.
- **Escritorio idéntico:** comparé píxel a píxel con `6c62516` en 960, 1024, 1280, 1440, 1920 y 2560, con la portada arriba y con la barra al desplazarse. Hay 0 píxeles distintos.

## Capturas

En `capturas/header-movil/entrega/`, para 320, 375, 390 y 430:

- `-t0.3` y `-t5.9`: portada en dos momentos del video.
- `-union`: borde inferior de la portada y la cinta.
- `-scroll`: la barra sobre la sección de producto.
- `-menu`: el menú abierto.

También hay una captura de tableta, `tableta-768-t0.3.png`.

## A tener en cuenta

- La barra verde se aplica por debajo de 960 px, igual que la portada verde. Incluye la tableta en vertical, donde la barra muestra los enlaces en fila (en crema). Si fuera solo hasta 767 px, en tableta quedaría la barra crema sobre la portada verde, con el corte que se quería eliminar.
- Falta probar en dispositivos reales.
