# Título del hero y responsive de la landing

Proyecto: landing de Nature’s Wayco · Fecha: 2026-10-22 · Estado: **implementado; sin commit, sin push y sin despliegue**.

## 1. Cambios y archivos

| Archivo | Cambio |
| --- | --- |
| `src/components/Hero.tsx`, `Hero.css` | Título en tres líneas; portada en grilla (texto + video completo); degradados como máscaras de borde; altura según contenido; diseño para pantallas bajas. |
| `src/components/Header.tsx`, `Header.css` | Barra compacta y menú desplegable en móvil (teclado, Escape, toque fuera); áreas táctiles de 44 px. |
| `src/components/Products.tsx`, `Products.css` | Una columna hasta 899 px con el envase arriba en ambos productos; nombres limitados al ancho de su columna; especificaciones apiladas en móvil; botón de 56 px. |
| `src/components/Routine.css` | Línea del día vertical cuando los pasos se apilan; tres columnas desde 900 px; etiqueta en tarjeta en móvil; corregido un desborde. |
| `src/components/Essence.css`, `Faq.css`, `Closing.css`, `Footer.css` | Espaciado fluido; dos columnas desde 900 px; respuestas a todo el ancho en móvil; enlaces del pie de 44 px; área segura inferior. |
| `src/components/Ticker.tsx`, `Ticker.css` | La cinta se recorta en su propio contenedor (`overflow-x: clip` local). |
| `src/index.css` | Variables `--pad-x` y `--section-y`; `:hover` solo en dispositivos con puntero; enlace «Saltar al contenido» de 44 px. **Se eliminó el `overflow-x: clip` global de la página.** |
| `src/lib/useDesignMotion.ts` | Entradas más breves; paralaje solo en pantalla y acotado; inclinación solo con ratón; la línea usa `data-drawn`; si algo falla, el contenido queda visible. |
| `scripts/verify-ui.mjs` | 11 tamaños (con móvil horizontal y zoom 200 %) y verificaciones nuevas (sección 6). |
| `docs/reports/RESPONSIVE-HERO.md`, `verify-responsive-hero.txt`, `capturas/responsive-hero/` | Este reporte, la salida completa y 57 capturas. |

**Sin cambios:** paleta, tipografía, textos, imágenes, orden del contenido, enlaces de WhatsApp, catálogo y datos.

## 2. Las tres líneas del título

```
Bienestar
que se integra
a tu día
```

**Estructura:** un solo `<h1>` con tres `<span>` de bloque, uno por línea.
- Entre bloques hay espacios reales, así que el texto accesible y el que se copia es «Bienestar que se integra a tu día» (verificado en todas las vistas).
- «integra» va en verde `#7FAE2A`, «día» en ámbar `#F2A422` y el resto en verde oscuro.

**Espaciado:**
- La interletra pasa de −0,06 em a **−0,03 em**: menos apretada, con la misma tipografía (Bricolage Grotesque 800).
- Interlineado 0,98. Cada línea tiene un relleno de 0,06 em arriba y 0,1 em abajo, compensado con margen negativo, para que el recorte de la animación no corte la tilde de «día» ni los descendentes de «q» y «g».

**Tamaño fluido:** `font-size: clamp(2.25rem, min(16.4cqi, 15svh), 6.5rem)`.
- `cqi` es el ancho real del bloque de texto (`container-type: inline-size`), no el de la ventana.
- Se midió que «que se integra» ocupa 5,87 veces el tamaño de letra. Con un 4 % de margen, `16.4cqi` garantiza que la línea cabe entera.
- `15svh` reduce el título en pantallas bajas, como un móvil en horizontal.
- Mínimo 36 px y máximo 104 px, en `rem` para que respeten el tamaño de letra del usuario.
- No se usa `transform: scale()`.

| Ancho | Tamaño del título | Líneas |
| --- | --- | --- |
| 320 | 45,9 px | 1/1/1 |
| 375 | 54,9 px | 1/1/1 |
| 390 | 57,4 px | 1/1/1 |
| 430 | 63,5 px | 1/1/1 |
| 768 | 104 px | 1/1/1 |
| 1024 | 66,3 px (columna izquierda) | 1/1/1 |
| 1280 | 82,0 px | 1/1/1 |
| 1440 | 87,3 px | 1/1/1 |
| 844 × 390 (horizontal) | 54,2 px | 1/1/1 |
| Zoom 200 % | 45,9 px | 1/1/1 |

**Redistribución:** los bloques admiten salto de línea normal. Si el usuario agranda el texto más allá de lo previsto, una línea puede partirse en lugar de desbordar o recortarse.

## 3. Adaptaciones por sección

**Barra**
- **Móvil (< 768 px):**
  - una fila de 69 px (antes 165–211 px) con logo, WhatsApp y botón «Menú»;
  - a menos de 380 px el botón queda solo con su ícono; su nombre accesible es «Menú» o «Cerrar».
- **Panel del menú:**
  - se superpone al contenido, sin empujar la página;
  - `aria-expanded` y `aria-controls`;
  - se cierra con Escape (el foco vuelve al botón), al elegir un enlace, al tocar fuera o al pasar a escritorio.
- **Orden del teclado:** menú → enlaces → WhatsApp.
- **Escritorio:** igual que el diseño, con enlaces de 44 px de alto.

**Portada**
- **Móvil y tableta:** texto, CTA a todo el ancho (`flex: 1 1 200px`, sin comprimir sus etiquetas) y el video debajo a todo el ancho.
- **Escritorio (≥ 960 px) y horizontal bajo (≥ 600 px y ≤ 540 px de alto):** dos columnas. El texto va alineado con la página y el video llega al borde derecho, con un máximo de 1024 px (su tamaño original).
- **Altura:** la da el contenido, sin el `min-height: 88vh` anterior. En pantallas bajas se reduce el aire vertical.

**Cinta:** se quitó el desborde lateral (21 px por lado) que generaba scroll horizontal. Ahora se recorta en su propio contenedor.

**Productos**
- Una columna hasta 899 px; en ColagenPlus el envase pasa arriba, como en DetoxPlus. Antes, en móvil, el envase de ColagenPlus quedaba debajo del botón y llegaba a cubrirlo con el paralaje.
- Dos columnas desde 900 px. Antes había una sola columna hasta unos 950 px.
- Nombres: a 320 px «ColagenPlus» y «DetoxPlus» se recortaban (303 > 256 px; el prototipo también). Ahora su tamaño se limita al ancho de la columna (`18.6cqi` y `23cqi`).
- Las especificaciones se apilan (etiqueta sobre valor) a menos de 480 px.
- El botón «Pedir por WhatsApp» mide 56 px de alto y pasa a su propia fila si no cabe junto al precio.

**Rutina**
- **Pasos apilados (< 900 px):** número a la izquierda y texto a la derecha, unidos por una línea vertical que baja al aparecer. Antes, la línea horizontal quedaba suelta junto al primer número.
- **Desde 900 px:** tres columnas con la línea horizontal del diseño.
- **Etiqueta:** en móvil es una tarjeta redondeada (antes, una píldora deformada de varias líneas). Se corrigió su `min-width: 280px`, que desbordaba a 320 px.

**Esencia:** una columna hasta 899 px y dos desde 900 px. El paralaje de la foto está acotado y ya no deja ver el fondo oscuro del marco.

**Preguntas:** el tamaño de la pregunta es fluido (18–21 px). La respuesta usa todo el ancho en móvil (antes reservaba 64 px a la derecha). El desplazamiento al pasar el puntero se hace con `transform`, sin mover el layout.

**¿Hablamos?:** dos columnas desde 900 px; botones de 56 px.

**Pie:** cada enlace mide 44 px de alto y conserva el espaciado visual del diseño. El relleno inferior incluye `env(safe-area-inset-bottom)`.

**Botón flotante de WhatsApp:**
- **La app actual no lo tiene:** el diseño aprobado de Claude Design lo retiró.
- **No lo reintroduje:** el acceso a WhatsApp está siempre visible en la barra fija, también en móvil, y no tapa contenido ni controles. Esto evita el problema de superposición que se había señalado antes.
- **Si se quiere un botón flotante,** se puede añadir con áreas seguras; queda como decisión.

**Áreas seguras:** no se usa `viewport-fit=cover`, así que el navegador mantiene el contenido fuera de la muesca. Además, el pie añade el margen inferior seguro.

## 4. Video y animaciones

**Video**
- **Encuadre:** se muestra **completo**: caja 16:9, `object-fit: contain`, sin `transform: scale()`, sin deformar y nunca más ancho que su original.
- **Espacio sobrante:** lo completa el fondo de la portada (`#F3EEE4`, fundido a crema abajo).
- **Degradados:** son máscaras estrechas en los bordes del video:
  - en dos columnas: 7 % a la izquierda, 5 % arriba y 8 % abajo; a la derecha toca el borde de la pantalla;
  - en móvil: 5 % arriba y 8 % abajo.

  El centro conserva su color y el producto no se desvanece.
- **Contraste:** el texto ya no está sobre el video, así que no depende del fotograma. Medido sobre los píxeles reales al inicio, la mitad y el final del clip: titular 12,8:1 y texto 9,1:1 a 375, 768, 1440 y 2560 px. Antes, en móvil, el peor caso era 1,29:1.
- **Sin cambios:** bucle, reproducción silenciada en línea, pausa fuera de pantalla y con la pestaña oculta, pausa manual respetada y control ▶ / ❚❚. El control va en la esquina inferior derecha del video (48 px en móvil, 52 px en escritorio).
- **Movimiento reducido:** póster estático, sin reproducción automática; se reproduce solo con el botón.

**Animaciones**
- **Duración:** transform 0,7 s (antes 1,1 s), opacidad 0,45 s; retardos al 60 % del diseño; escalonado de filas 60 ms. El texto de la portada termina de aparecer en menos de 0,85 s.
- **Propiedades:** solo `transform` y `opacity`. El acordeón conserva su apertura (`grid-template-rows`), que responde a una acción del usuario.
- **Sin saltos de diseño:** CLS 0 medido al cargar, en móvil y escritorio.
- **Hover:** todos los `:hover` están dentro de `@media (hover: hover) and (pointer: fine)`. La inclinación 3D de la foto solo se activa con puntero fino. Ninguna información ni acción depende del hover.
- **Paralaje:**
  - se calcula solo para los elementos cercanos a la pantalla (IntersectionObserver);
  - un único `requestAnimationFrame` por fotograma con listener pasivo;
  - recorrido limitado (±5,5 % del alto de su caja);
  - todo se limpia al desmontar.
- **Respaldo:** si el movimiento falla o no hay IntersectionObserver, el contenido queda visible. Con `prefers-reduced-motion` no hay entradas, cinta, paralaje ni inclinación, y la línea aparece completa.

## 5. Tamaños comprobados

**Emulación en Chrome sin interfaz** (Playwright con Google Chrome 155 de macOS):
- 320 × 640, 375 × 812, 390 × 844, 430 × 932, 768 × 1024, 1024 × 768, 1280 × 800, 1440 × 900, 2560 × 1440;
- móvil horizontal 844 × 390;
- zoom 200 % (equivale a 1440 × 900 al 200 %: 720 × 450 px CSS a densidad 2);
- durante la revisión, también 667 × 375.

**No se probó en dispositivos reales:** iPhone, Android y tablets. Todo lo anterior es emulación.

## 6. Resultados

| Prueba | Resultado |
| --- | --- |
| `npm run build` | Correcto. JS 242,3 kB (75,7 kB gzip), CSS 20,3 kB (5,2 kB gzip). |
| `npm run lint` | Sin advertencias. |
| `npm test` | 9/9 |
| `CAPTURAS=responsive-hero npm run verify` | **176/176** (antes 78/82). Detalle en `docs/reports/verify-responsive-hero.txt`. |
| Lighthouse móvil (local) | Rendimiento 98 · Accesibilidad 95 · Buenas prácticas 100 · SEO 100. LCP 2,3 s, CLS 0. |
| Lighthouse escritorio | 100 · 95 · 100 · 100. LCP 0,5 s, CLS 0. |

En Lighthouse, accesibilidad queda en 95 solo por el contraste de «frecuentes» en ámbar, un color del diseño que se pidió conservar.

**Verificaciones en cada uno de los 11 tamaños:**
- sin scroll horizontal, ahora sin recorte global;
- áreas táctiles de al menos 44 × 44 px en todos los enlaces y botones visibles;
- sin texto recortado;
- título en tres líneas de una línea cada una, con su texto completo;
- CTA completos dentro de la portada;
- imágenes con `alt` y dimensiones;
- entradas visibles al final y precios animados;
- línea de la rutina dibujada;
- sin errores ni solicitudes externas.

**Además:**
- enlaces de WhatsApp e Instagram correctos, sin abrirlos ni enviar mensajes;
- **teclado:** foco visible en todas las paradas, salto al contenido, navegación con Enter y acordeón;
- **menú móvil a 320 y 375:**
  - se abre con teclado y el primer Tab va a «Productos»;
  - Escape lo cierra y devuelve el foco;
  - un enlace navega y cierra el menú;
  - se cierra al tocar fuera;
- **video:** completo en 16:9, sin escala, reproducción, bucle, pausas, CTA, fallo de carga y movimiento reducido;
- **CLS al cargar:** 0 en móvil y en escritorio;
- **contraste de la portada:** sobre píxeles reales, en tres momentos del clip.

**Revisión visual de capturas.** Corregí lo que encontré:
1. El orden del teclado en el menú: los enlaces estaban antes del botón.
2. Una regla `all: unset` que anulaba la posición del botón.
3. El panel del menú empujaba la página: ahora se superpone.
4. El título de 115 px en tableta: ahora el tope es de 104 px.
5. El área táctil del logo (40 px).
6. Varios bloques `:hover` que habían quedado mal anidados.

## 7. Capturas

En `docs/reports/capturas/responsive-hero/`:

| Qué | Archivos |
| --- | --- |
| Portada en móvil | `movil-320-portada.png`, `movil-375-portada.png`, `movil-390-portada.png`, `movil-430-portada.png` |
| Portada en tableta | `tableta-768-portada.png` |
| Portada en escritorio | `escritorio-1024-portada.png`, `escritorio-1280-portada.png`, `escritorio-1440-portada.png`, `escritorio-2560-portada.png` |
| Horizontal y zoom | `movil-horizontal-844x390-portada.png`, `zoom-200-portada.png` |
| Página completa | `movil-375-pagina.png`, `escritorio-1440-pagina.png`, y `*-pagina.png` para los demás tamaños |
| Portada en tres momentos del clip | `{tamaño}-portada-inicio|mitad|final.png` |
| Secciones | `movil-375-{detox,colagen,rutina,esencia}.png`, `escritorio-1440-…` |
| Menú abierto | `movil-320-menu-abierto.png`, `movil-375-menu-abierto.png` |
| Estados | `movil-375-movimiento-reducido.png`, `movil-375-portada-sin-video.png` |
| Final de página | `{tamaño}-final.png` |

## 8. Limitaciones y pendientes

1. **Sin pruebas en dispositivos reales:**
   - iPhone y Android: Safari iOS con barra dinámica, áreas seguras reales y modo de ahorro de energía con el video;
   - Firefox y Safari de escritorio, para `mask-image` y unidades `cqi`/`svh`;
   - lector de pantalla.
2. **Móvil horizontal:** a 844 × 390 la portada mide 486 px, así que el segundo CTA queda debajo del primer pantallazo (se llega con scroll y no se recorta).
3. **Video en móvil:** se ve a 375 × 211 px, porque se priorizó mostrarlo completo en lugar de llenar el alto.
4. **Botón flotante de WhatsApp:** no existe en el diseño actual y no se reintrodujo (ver sección 3). Queda como decisión.
5. **Aumento de texto del navegador:** el diseño usa px en casi todos los textos, así que solo el título (en `rem`) escala con esa preferencia. El zoom de página sí escala todo y se verificó al 200 %.
6. **Contraste del diseño sin cambiar:** «día», «frecuentes», «integra» y «esencia», y «WhatsApp» en el texto de Esencia (ver `docs/pendientes.md`).
7. **Siguen pendientes** antes de publicar: texto inventado en las etiquetas de las imágenes y el video, número de WhatsApp provisional y «Powered by MONTSERRAT_AI».
8. **No hay commit, push ni despliegue**, como se pidió.
