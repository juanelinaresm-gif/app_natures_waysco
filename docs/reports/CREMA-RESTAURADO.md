# Vuelta al fondo crema original en el hero y la barra móvil

Sin commit, push ni deploy.

## Qué se restauró

Se quitan el verde bosque (último commit, `904b84e`) y el azul petróleo (sin commit, `HERO-AZUL.md`) de la barra y el hero en móvil y tableta. Vuelven los colores del diseño original, los mismos de escritorio:

- **Fondo:** `#FAF6EE`, el crema de la página (`--bg` en `index.css`). La barra y el hero en móvil lo usaban así antes del verde.
- **Sobre el video:** el degradado crema vertical de la vista móvil del diseño: `#FAF6EE` pleno, .94 al 45 %, .4 al 62 % y transparente al 78 %. En pantallas bajas, como el móvil en horizontal, el crema llega más abajo, igual que lo hacía el verde.
- **Borde inferior:** el video se funde con el crema de la página en 120 px, el mismo degradado que en escritorio. La cinta inclinada vuelve a apoyarse sobre el fondo de la página, como en el diseño original, sin la cuña oscura que se añadió para el verde.
- **Barra superior (< 768 px):** crema translúcida (0,9) con desenfoque y su línea inferior sutil, y el logo directo sobre ella, a 38 px. Se quitan la píldora crema del logo, el borde claro del botón del menú y los enlaces crema de la tableta.
- **Texto:** vuelven los colores del diseño:
  - título `#1C2B22`, «integra» `#7FAE2A` y «día» `#F2A422`;
  - descripción `#33433A`;
  - «Ver productos» oscuro, y turquesa `#0E5E75` al pasar el ratón;
  - foco del teclado turquesa, como en el resto de la página.

## Qué no cambió

- **Funciones que se mantienen:**
  - el título en tres líneas a todo el ancho;
  - el video en bucle sin botón de pausa en móvil;
  - el menú a pantalla completa con su animación;
  - la barra flotante de WhatsApp;
  - la navegación suave, los mensajes de WhatsApp y el precio de ColagenPlus.
- **Escritorio:** se ve igual que antes.
- **Resto de la página:** las secciones, las fichas de producto, los textos y la estructura siguen igual.
- **Video:** no se toca, ni se le aplica ningún filtro.

## Sobre el color del video

El fondo del video no es un color plano. Es un fondo de estudio beige iluminado de lado: más oscuro a la izquierda (≈ `#9C866E`) y más claro abajo y a la derecha (≈ `#DBD3BE`). En móvil, además, se ve sobre todo el envase.

Por eso ningún color de fondo coincide con él en todos sus puntos. El diseño original lo integra con degradados crema que se desvanecen sobre el video, y eso es lo que se restauró. Los degradados no dejan bordes:

- arriba, el video se desvanece (máscara) y queda bajo el crema;
- a los lados, llega al borde de la pantalla;
- abajo, termina exactamente en el crema de la página.

## Archivos modificados

- `src/components/Hero.css`: el bloque móvil vuelve a los colores y degradados crema.
- `src/components/Header.css`: el bloque móvil vuelve a la barra clara del diseño.
- `src/components/Ticker.css`: se quita la cuña oscura del verde. Queda igual que antes del verde (`b9634e0`).
- `src/index.css`: se quita `--forest`, que ya no se usa.
- `scripts/verify-ui.mjs`:
  - **Uniones:** comprueban el crema arriba y abajo de la portada. Para el borde inferior se ocultan la cinta y la barra flotante, que se superponen a la última fila de la portada en la captura.
  - **«integra» y «día»:** su contraste se reporta como informativo, igual que en escritorio (ver «Para decidir»).

## Verificaciones

- Build, lint y tipos sin errores. Pruebas unitarias: 10/10.
- `npm run verify` da **243/243** (`verify-crema-restaurado.txt`). Las capturas de la verificación quedaron en `capturas/crema-restaurado/verificacion/`.
- **Uniones**, en píxeles reales en 320, 375, 390, 430 y 768 px:
  - la barra y la parte de arriba de la portada son `#FAF6EE`;
  - el borde inferior de la portada y la página justo debajo también, sin corte;
  - la barra sigue crema al desplazarse.
- **Contraste sobre el video**, en 8 cuadros, en el peor caso:

  | Elemento | Contraste |
  | --- | --- |
  | Título | 13,6:1 |
  | Descripción | 9,5:1 |
  | «Ver productos» (en 320 px) | 8,5:1 |
  | «Ver productos» (resto de tamaños) | 12,7:1 o más |

  Al pasar el ratón, «Ver productos» en turquesa queda en 6,8:1. El botón «Conoce DetoxPlus», texto oscuro sobre lima, queda en 7,8:1. El foco turquesa sobre crema, en 6,8:1.
- **Comparación píxel a píxel** con el último commit (`4ca8a8f`):
  - escritorio en 960, 1024, 1280, 1440, 1920 y 2560 px, con la portada y con la barra al desplazarse: 0 píxeles distintos;
  - las fichas de DetoxPlus y ColagenPlus, Rutina, Esencia, Preguntas, «Hablamos» y el pie, en 320, 390, 430 y 1440 px: 0 píxeles distintos;
  - el menú abierto y la barra flotante, en 320, 390 y 430 px: 0 píxeles distintos;
  - la cinta en móvil solo difiere en su cuña superior izquierda (233 × 7 px a 390 px de ancho), que vuelve al crema de la página. En el borde superior de «Nuestros productos», junto a la cinta inclinada, cambian de 1 a 3 píxeles.

## Capturas

En `capturas/crema-restaurado/`:

- `movil-320-portada.png`, `movil-390-portada.png` y `movil-430-portada.png`;
- `movil-390-union-con-la-cinta.png`: el video fundiéndose con el crema antes de la cinta;
- `movil-390-barra-al-desplazarse-y-whatsapp.png`;
- `movil-390-menu-abierto.png`;
- `movil-390-foco-teclado.png`;
- `tableta-768-portada.png` y `escritorio-1440-portada.png`.

## Para decidir

- **«integra» y «día» sobre crema:** con los colores del diseño quedan en 2,4:1 y 1,9:1, por debajo del 3:1 que piden las pautas de accesibilidad (WCAG) para texto grande.
  - Pasa igual en escritorio desde el diseño original, y por eso no se cambiaron.
  - Si se quiere cumplir, hay que oscurecer un poco el verde y el naranja en toda la portada, móvil y escritorio. Sería un cambio de color de marca, así que lo decide la clienta.
- **Logo al desplazarse:** cuando la barra pasa sobre el video, el fondo blanco del logo se nota como un rectángulo un poco más claro que la barra translúcida. Pasa igual en escritorio y no se cambió.
- **Versiones anteriores:** el verde está en el historial (`904b84e`). El azul solo queda documentado en `HERO-AZUL.md` y sus capturas, sin commit.
