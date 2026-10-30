# Hero móvil: video de fondo

Cambia solo la portada por debajo de 960 px, que abarca móvil, móvil en horizontal y tableta. El escritorio no cambia. Sin commit, push ni despliegue.

## Cambios

- **Video como fondo.** El video está en una capa absoluta detrás de todo el hero. Desapareció el bloque 16:9 que iba debajo de los botones.
- **Capas, de atrás hacia adelante:**
  1. La pared del primer cuadro del video, sin el tarro, reducida y difuminada (`portada-video-fondo-96.webp`, de 298 bytes).
  2. El video.
  3. Un degradado verde oscuro, `rgb(14 40 27)`. Va al 90 % detrás del texto y baja al 10 % sobre el producto.
- **Texto:**
  - Título en crema `#faf6ee`, en las mismas tres líneas.
  - «integra» en lima `#b2dd57`.
  - «día» en naranja `#f7b23b`. Es más claro que el del escritorio para leerse sobre el verde.
- **Descripción:** «Descubre DetoxPlus y ColagenPlus: dos mezclas para acompañar tu rutina de bienestar.» En escritorio sigue la descripción anterior: el componente tiene las dos y cada tamaño muestra la suya.
- **Botones:**
  - «Conoce DetoxPlus» es el botón lima.
  - «Ver productos» pasa a ser un enlace crema subrayado debajo, con área táctil de 44 px.
- **Sin opacidad en el contenido:** el texto y los botones son opacos. Solo las capas del fondo tienen transparencia.
- **Altura del hero:** la dan el texto y una franja inferior reservada para el producto, `--zone: clamp(210px, 68vw, 400px)`. No hay alturas fijas: si el texto crece, el hero crece.
- **Control de pausa:** abajo a la derecha, dentro de la franja del producto. Nunca toca los botones.
- **Móvil en horizontal y zoom al 200 %:** el texto va a la izquierda, el tarro a la derecha y el degradado es horizontal.

## Estrategia de encuadre

Revisé el clip entero en 24 cuadros. El tarro aparece centrado y ocupa entre el 35 % y el 70 % del ancho del cuadro, según el plano: ColagenPlus lejos, ColagenPlus cerca, la transición y DetoxPlus.

- **Por qué no cubre todo el hero:** en vertical, cubrirlo entero dejaría ver solo un 30 % del ancho del cuadro, lo que corta el tarro en los planos cercanos.
- **Qué hace en vertical:**
  - El video se queda en su proporción 16:9, anclado abajo y centrado.
  - Su ancho es 2,22 veces la franja del producto. Así se ve el 66 % del cuadro en móvil y alrededor del 85 % en tableta.
  - El tarro se ve completo en el plano lejano, y en los cercanos queda tan entero como en el video original.
- **Cómo se completa el fondo:**
  - Por encima del video, el fondo lo completa la pared difuminada.
  - El borde superior del video se funde con ella (máscara del 0 al 30 %), así que no hay bandas ni cortes.
  - Usé la pared y no el cuadro completo para que no aparezca un segundo tarro borroso detrás del título.
- **En horizontal:** el video ocupa todo el alto, con el centro del cuadro al 76 % del ancho y el borde izquierdo fundido.
- **Si falla el autoplay o hay movimiento reducido:** el póster (primer cuadro) ocupa el mismo lugar y la composición se mantiene.

## Pruebas

- Build, lint y pruebas unitarias (9/9) pasan.
- `npm run verify` da **195/195** (`verify-hero-movil.txt`). Lo nuevo o adaptado:
  - En los 11 tamaños, título, descripción, botones y control quedan dentro del hero, sin solaparse ni cortarse. El contenido es opaco y el video es una capa absoluta.
  - El video a 375 px va en 16:9, anclado abajo, con el 66 % del cuadro a la vista. Es decorativo y no recibe foco.
  - Se mantiene lo de antes: autoplay, bucle, sin sonido, `playsInline`, pausa fuera de pantalla y con la pestaña oculta, pausa manual respetada, póster si falla el video, y póster sin reproducción con movimiento reducido.
- **Contraste**, medido sobre los píxeles reales en 8 cuadros del clip (incluidos los más claros), en 320, 375, 390, 430, 768, 844×390 y zoom al 200 %:

  | Elemento | Peor contraste | Mínimo exigido |
  | --- | --- | --- |
  | Título | 7,3:1 | 3:1 |
  | «integra» | 6,0:1 | 3:1 |
  | «día» | 6,7:1 | 3:1 |
  | Descripción | 8,1:1 | 4,5:1 |
  | «Ver productos» | 6,8:1 | 4,5:1 |

- **Escritorio sin cambios:** comparé píxel a píxel con el commit `b9634e0`, con el mismo cuadro del video.
  - En 960, 1024, 1280, 1440 y 1920: 0 píxeles distintos.
  - En 2560: 48 píxeles en la esquina inferior derecha. Corresponden a la cinta animada que se superpone al borde del hero.

## Capturas

En `capturas/hero-movil/entrega/`:

- 375 px en cuatro momentos del video: `t0.3` ColagenPlus lejos, `t2.6` ColagenPlus cerca, `t4.9` transición y `t5.9` DetoxPlus.
- 320, 390 y 430 px, cada uno en dos momentos.
- Móvil en horizontal, 844×390.
- Zoom al 200 %, 720×450.
- Escritorio 1440 (`escritorio-1440-t1.png`).

En las capturas el control muestra ▶ porque el video se detiene para fijar el cuadro.

## A tener en cuenta

- **Tableta:** el diseño se aplica por debajo de 960 px, así que incluye tableta en vertical.
- **Pantallas bajas:** en 320×640, que es poco común, el hero mide 602 px y el tarro queda a medias por debajo del borde de la pantalla hasta que se hace scroll. Desde 375×812 se ve entero.
- **Faltan pruebas en dispositivos reales:** iOS Safari y Android.
