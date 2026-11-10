# Fondo azul petróleo del hero y la barra en móvil

Sin commit, push ni deploy. **Revertido:** la clienta pidió volver al crema original (ver `CREMA-RESTAURADO.md`).

## Qué cambió

En móvil y tableta (< 960 px, donde están el hero y la barra oscuros), el verde bosque `#0E281B` pasa a azul petróleo `#073746`:

- el fondo de la barra, también al desplazarse;
- el fondo del hero;
- la capa que cubre el video. Arriba es azul pleno, que se aclara sobre el video con la misma curva de antes: 0,94 al 50 %, 0,4 al 65 % y transparente al 80 %. En pantallas bajas el azul llega más abajo, como antes.

La barra y el hero tienen el mismo azul, sin borde ni corte entre ambos.

El degradado inferior no cambió. Ya terminaba en el color de la cinta siguiente (`#1C2B22`), que tampoco cambió, y la unión sigue sin cortes, incluida la cuña inclinada.

No cambió la opacidad de la capa, así que el video no queda más teñido que antes y el envase y su etiqueta se siguen reconociendo.

Siguen iguales:

- los colores del texto, «integra», «día», los botones, el logo y el botón del menú;
- el menú a pantalla completa, la barra flotante de WhatsApp y las demás secciones;
- el escritorio;
- los precios, los textos, los mensajes de WhatsApp y la navegación.

## Archivos modificados

- `src/components/Header.css`: la barra en móvil usa `--petrol`, definida en la propia `.nav`.
- `src/components/Hero.css`: el hero en móvil, su capa sobre el video y la variante para pantallas bajas usan `--petrol`, definida en la propia `.hero`.
- `src/index.css`: se quita `--forest`, que solo usaban esos dos componentes. No se modificó ningún otro token global.
- `scripts/verify-ui.mjs`: las comprobaciones de color de la barra y el hero esperan el azul.

## Verificaciones

- Build, lint y tipos sin errores. Pruebas unitarias: 10/10.
- `npm run verify` da **243/243** (`verify-hero-azul.txt`). Incluye:
  - barra y hero con el mismo azul en píxeles reales, en 320, 375, 390, 430 y 768;
  - la barra sigue azul y opaca al desplazarse;
  - el hero termina en el color de la cinta, también en la cuña;
  - el menú, la barra flotante, el teclado, la navegación suave y los mensajes de WhatsApp.
- **Contraste sobre el video**, medido en 8 cuadros, en el peor caso:

  | Elemento | Contraste |
  | --- | --- |
  | Título | 11,7:1 |
  | «integra» | 8,0:1 |
  | «día» | 6,8:1 |
  | Texto | 9,8:1 |
  | «Ver productos» (en 320 px) | 6,1:1 |

  Todo queda por encima de 4,5:1, así que no hizo falta cambiar la opacidad.
- **Estados sobre el azul pleno**, calculados:

  | Estado | Contraste |
  | --- | --- |
  | Anillo de foco crema | 11,9:1 |
  | Botón lima contra el fondo | 6,7:1 |
  | Botón al pasar el ratón | 8,1:1 |
  | Texto del botón | 7,8:1 |
  | Texto del botón al pasar el ratón | 9,4:1 |
  | «Ver productos» al pasar el ratón | 8,1:1 |
  | Enlaces de la barra en tableta | 11,9:1 |
- **Sin cambios fuera del alcance:** comparé píxel a píxel con el commit `4ca8a8f` y salen 0 píxeles distintos en:
  - el escritorio en 960, 1024, 1280, 1440, 1920 y 2560 px, con el hero y con la barra al desplazarse;
  - en 320, 390, 430 y 1440 px:
    - la cinta;
    - «Nuestros productos»;
    - las fichas de DetoxPlus y ColagenPlus;
    - Rutina, Esencia, Preguntas y «Hablamos»;
    - el pie;
  - el menú abierto y la barra flotante en 320, 390 y 430 px.

  Una primera captura de «Nuestros productos» a 1440 px dio 10 píxeles distintos. Al repetirla salieron 0, así que era ruido de la captura.

## Capturas

En `capturas/hero-azul/`:

- `movil-320-portada.png`, `movil-390-portada.png` y `movil-430-portada.png`;
- `movil-390-union-con-la-cinta.png`: el final del hero y su unión con la cinta;
- `movil-390-barra-al-desplazarse-y-whatsapp.png`: la barra al desplazarse y la barra flotante;
- `movil-390-menu-abierto.png`;
- `movil-390-foco-teclado.png`: el foco con teclado en «Conoce DetoxPlus»;
- `tableta-768-portada.png`;
- `escritorio-1440-portada.png`: sin cambios.

`verificacion/` tiene las capturas que genera `npm run verify` en todos los tamaños, incluidos los 8 cuadros del video que se usan para medir el contraste.

## Para decidir

- **Menú a pantalla completa:** sigue en el verde oscuro `#1C2B22`, igual que la cinta y la barra flotante, porque no es el fondo del hero ni de la barra. Si la clienta lo quiere azul, es un cambio de una línea.
- **Botón del menú:** el círculo oscuro (`#1C2B22`) apenas se distingue del azul (1,2:1). Se identifica por su borde claro y por las líneas lima y naranja, que tienen buen contraste. No se rediseñó.
- **WhatsApp en la barra de tableta (768–959 px):** la píldora turquesa `#0E5E75` contrasta poco con el azul (1,8:1), aunque su texto blanco se lee bien (7,3:1). No se cambió.
