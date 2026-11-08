# Vista móvil del diseño: hero, barra flotante y menú

Sin commit, push ni deploy.

## Fuente

Los valores salen del proyecto de Claude Design «Diseño dinámico Natures Wayco». Ahí `Natures Wayco.dc.html` tiene ahora una rama móvil (`mob`, ≤ 720 px), que `Vista Movil.dc.html` muestra a 393 × 852. Las tres imágenes de referencia son esa vista.

## Qué cambió

### Hero (móvil y tableta, < 960 px)

- **Fondo:** el video cubre todo el hero, sin escala, bajo un degradado crema vertical:
  - `#FAF6EE` arriba;
  - .94 al 45 %;
  - .4 al 62 %;
  - transparente al 78 %.
  - Debajo, un desvanecido de 120 px hacia la página.
- **Altura:** el hero ocupa la pantalla bajo la barra (`100svh` menos su alto) y crece si el texto lo necesita. El relleno inferior de `50vh` deja ver el video en la mitad de abajo.
- **Título** «Bienestar que se / integra a tu día», en dos líneas:
  - 48 px, interlineado .88;
  - «integra» en `#7FAE2A` y «día» en `#F2A422`;
  - limitado por el ancho para que quepa desde 320 px, donde mide 40 px.
- **Texto:** «Dos mezclas en polvo para preparar bebidas en casa.», a 18 px y con un máximo de 300 px de ancho.
- **Botones:** «Conoce DetoxPlus» y, al lado, «Ver productos» como enlace subrayado.
- **Por qué hasta 959 px:** el diseño pasa a la portada de escritorio desde 721 px, pero entre 721 y 959 px ese texto queda sobre el tarro blanco. A 768 px la descripción bajaba a 1:1. Por eso la composición móvil llega hasta 959 px, el mismo límite que ya tenía la portada de escritorio.
- **Control de pausa:** en la segunda revisión se quitó de móvil y tableta (ver abajo).

### Barra superior (móvil, < 768 px)

- **Aspecto:** clara, con blur y una línea inferior sutil, como en el diseño.
- **Contenido:** el logo (38 px) y un botón redondo oscuro de 48 px con dos líneas, lima y naranja.
- **WhatsApp:** sale de la barra y pasa al menú y a la barra flotante.

### Menú a pantalla completa (móvil)

- **Apertura:** se revela con un círculo que crece desde la esquina del botón (`clip-path`, 0,8 s).
- **Enlaces:** suben uno tras otro (0,9 s, cada uno 70 ms después del anterior).
- **Contenido:**
  - «Nutrition by nature» arriba;
  - botón naranja de cerrar (×);
  - «01 Productos / 02 Rutina / 03 Esencia / 04 Preguntas» con sus colores;
  - abajo, WhatsApp e Instagram.
- **Accesibilidad:**
  - es un diálogo y el foco entra en «Cerrar menú»;
  - Tab no sale del menú;
  - Escape o «Cerrar» lo cierran y devuelven el foco al botón;
  - la página no se desplaza debajo mientras está abierto;
  - cerrado, queda inerte.
- **Al elegir un enlace:** el menú se cierra, la página se libera y el desplazamiento suave empieza sin saltos.

### Barra flotante «¿Dudas? Te ayudamos» (móvil)

- **Cuándo aparece:** al bajar más de un 55 % de la pantalla, deslizándose desde abajo (0,5 s). Se oculta con el menú abierto. Oculta, queda inerte.
- **Enlace:** «WhatsApp», con el mensaje general («Hola, me gustaría recibir información sobre Nature’s Wayco.»).
- **Espacio que ocupa:**
  - el pie tiene espacio extra abajo para que la barra no tape su final;
  - `scroll-padding-bottom` evita que el foco con teclado quede detrás de ella.

### Movimiento reducido

La barra y el menú aparecen sin transición y los enlaces sin subir.

### Escritorio (≥ 960 px)

Sin cambios.

## Versión verde reemplazada

Este diseño reemplaza el header y el hero verdes de la tarea anterior, que nunca llegaron a commit. Para poder recuperarlos, en `docs/design/respaldo-hero-header-verde/` quedaron:

- el parche (`cambios.patch`);
- su reporte;
- sus capturas.

También quité la imagen difuminada del hero verde (`portada-video-fondo-96.webp`) y su generación en `build-media.mjs`, porque ya no se usan.

## Archivos

- **Nuevos:** `src/components/ContactBar.tsx` y `ContactBar.css`.
- **Modificados:**
  - `src/components/Header.tsx` y `Header.css`;
  - `src/components/Hero.tsx` y `Hero.css`;
  - `src/components/Footer.css`;
  - `src/index.css`;
  - `src/data/media.ts`;
  - `scripts/build-media.mjs`;
  - `scripts/verify-ui.mjs`.
- **Borrado:** `public/media/portada-video-fondo-96.webp`.

Siguen sin commit los cambios de navegación, WhatsApp y precio (`NAVEGACION-WHATSAPP-PRECIO.md`).

## Verificaciones

- Build, lint y tipos sin errores. Pruebas unitarias: 10/10.
- `npm run verify` da **225/225** (`verify-movil-diseno.txt`). Nuevas o actualizadas:
  - **Título:** dos líneas por debajo de 960 px y tres en escritorio, en los 11 tamaños.
  - **Video móvil:** cubre todo el hero, sin escala.
  - **Menú, con teclado** (320 y 375): es un diálogo, el foco entra, Tab no sale, Escape cierra y devuelve el foco, la página queda fija mientras está abierto y, cerrado, inerte. Un enlace cierra, libera la página y navega.
  - **Animación del menú:** a los 100 ms el círculo va por el 1 % y el enlace aún está abajo; al terminar, 150 % y en su sitio. Con movimiento reducido, abre al instante.
  - **Barra flotante:** oculta e inerte arriba, visible al bajar, oculta con el menú y con su mensaje. Con movimiento reducido, sin transición.
  - **Escritorio:** sin barra flotante ni menú.
  - **WhatsApp:** 7 accesos, cada uno con su mensaje (barra, menú, barra flotante, dos productos, contacto y pie). Instagram: 3.
  - **Foco con teclado:** nunca queda tapado por la barra flotante.
  - **Navegación suave**, con el menú a pantalla completa y el resto de enlaces: llega a cada sección con el título bajo la barra.
  - **Contraste del texto del hero**, en 8 cuadros del video:
    - en 320, 375, 390, 430, 768, 844×390 y zoom al 200 %, el peor caso es 6,2:1;
    - en 1440 y 2560 sigue pasando.
- **Escritorio idéntico:** comparé píxel a píxel con `6c62516` en 960, 1024, 1280, 1440, 1920 y 2560, con la portada arriba y con la barra al desplazarse. Hay 0 píxeles distintos.

## Capturas

En `capturas/movil-diseno/entrega/`, para 320, 375, 393 (el tamaño del diseño) y 430:

- `-portada`: la portada.
- `-barra`: la barra flotante al bajar.
- `-menu-animando`: el menú a mitad de la apertura.
- `-menu`: el menú abierto.

También están `tableta-768-portada.png` y `tableta-768-barra.png`, aunque en tableta la barra flotante no aparece.

## Ajustes de la segunda revisión

- **Título más grande:** ahora es el máximo con el que «Bienestar que se» cabe en una línea. La interletra pasa de −0,05 a −0,06 em y el tamaño va al 15,2 % del ancho del texto.

  | Ancho | Antes | Ahora |
  | --- | --- | --- |
  | 393 | 48 px | 54 px |
  | 375 | 48 px | 51 px |
  | 430 | 48 px | 59 px |
  | 320 | 40 px | 43 px |
  | Tableta | 65 px | 88 px |

  En pantallas bajas el alto también limita el tamaño (15svh), para que los botones queden sobre el crema. Para ir más allá habría que pasar a tres líneas.
- **Menos zoom en el video:** ocupa el 70 % inferior de la portada en vez del 100 %, con su borde superior fundido en el crema. Se ve el 41 % del ancho del cuadro en vez del 28 %, así que el producto se reconoce.
- **Sin botón de pausa en móvil y tableta:** el video queda en bucle. En escritorio el control sigue igual.
- **Animación del menú:**
  - «Cerrar» ocupa exactamente el lugar y el tamaño del botón redondo (48 px, centrado a 38 px de la derecha y 34 px de arriba), y el círculo nace de ese mismo centro. Antes, el botón de cerrar era de 56 px y estaba en otra posición, y el círculo nacía de un tercer punto.
  - La fila superior del menú repite la de la barra.
  - El «+» gira hasta «×» al abrir.
  - Al cerrar, los enlaces bajan rápido mientras el círculo se recoge en el botón.
  - El anillo de foco solo se muestra si se usa el teclado, y desapareció el recuadro gris que el navegador móvil pinta al tocar.
- **Verificación:** **228/228**. Nuevas comprobaciones: «Cerrar» y el botón coinciden en centro y tamaño, el círculo nace de ese centro, el video ocupa el 70 % inferior, y no hay control de pausa en móvil.
- **Escritorio:** sigue idéntico píxel a píxel al commit `6c62516`.
- **Capturas:** `capturas/movil-diseno/entrega/animacion-menu/` tiene la apertura y el cierre del menú en 0, 100, 250, 450 y 800 ms.

## Ajustes de la tercera revisión

- **Título en tres líneas a todo el ancho:** «Bienestar / que se integra / a tu día», como en escritorio, para llenar el espacio vacío que quedaba entre el texto y el video.
  - Ocupa el mayor tamaño con el que «que se integra» cabe en una línea.
  - Tamaños: 64 px a 393 de ancho, 51 px a 320, 70 px a 430 y 96 px en tableta.
  - En pantallas bajas lo limita el alto (12svh).
  - Ya no hay dos cortes de línea distintos: el `h1` vuelve a ser el mismo en todos los tamaños.
- **Verde desde la barra:** por debajo de 960 px, la barra y la parte superior de la portada comparten el verde bosque `rgb(14 40 27)`, opaco y sin línea entre ambos.
  - El verde se aclara sobre el video: pleno, .94 al 50 %, .4 al 65 % y transparente al 80 %. Es un poco más largo que en el diseño (45, 62 y 78 %), para que «Ver productos» tenga margen de contraste en 320 px.
  - En pantallas bajas el verde pleno llega más abajo, para que los botones no queden sobre el video.
  - La portada termina exactamente en el verde de la cinta, incluida la cuña de su inclinación.
- **Texto:** crema, con «integra» en `#B2DD57` y «día» en `#F7B23B`. El botón principal sigue lima; «Ver productos» es crema. El foco del teclado se ve en crema.
- **Logo:** va en una píldora crema, como en la barra oscura del diseño. El fondo blanco del logo se funde con ella (multiply), sin filtros sobre sus colores.
- **Barra superior:**
  - El botón redondo del menú lleva un borde claro sutil para distinguirse sobre el verde.
  - En tableta, los enlaces de la barra van en crema.
- **Verificación:** **243/243**. Nuevas comprobaciones, en 320, 375, 390, 430 y 768:
  - barra y portada tienen el mismo verde en píxeles reales;
  - la portada termina en el verde de la cinta, también en la cuña inclinada;
  - la barra sigue verde y opaca al desplazarse.
- **Contraste del texto claro**, en 8 cuadros del video: el peor caso es 8,4:1 para «integra» y «día», y 7,3:1 para «Ver productos» (en 320 px).
- **Escritorio:** sigue idéntico píxel a píxel a `6c62516`.

## Pendientes

- **Contraste a 1024 px:** en el escritorio, sin cambios respecto a antes, la descripción baja a 3,6:1 en un cuadro del video. Antes no se medía a ese ancho; queda pendiente de decidir.
- **Número de WhatsApp provisional:** el propietario debe confirmarlo.
- **Dispositivos reales:** falta probar en iOS Safari y Android.
